import { Message, Client } from 'whatsapp-web.js';
import { prisma } from '../database/prisma.service';
import { LLMFactory } from '../services/llm/llm.factory';

const llmProvider = LLMFactory.createProvider();

export class BotController {
  private client: Client;
  private myNumber: string | undefined; // Nomor bot utama
  private alternativeNumbers: Set<string> = new Set(); // Set untuk menyimpan nomor alternatif
  private allowedGroupNames: Set<string> = new Set(); // Set untuk menyimpan nama grup yang diizinkan
  private triggerKeywords: string[] = []; // Array untuk menyimpan kata kunci pemicu
  private mentionTriggerKeywords: string[] = []; // Array untuk menyimpan kata kunci pemicu yang memerlukan mention

  constructor(client: Client) {
    this.client = client;
    this.loadAllowedGroups(); // Muat grup yang diizinkan saat inisialisasi
    this.loadTriggerKeywords(); // Muat kata kunci pemicu saat inisialisasi
    this.loadMentionTriggerKeywords(); // Muat kata kunci pemicu mention saat inisialisasi
  }

  private loadAllowedGroups() {
    const allowedGroupsEnv = process.env.ALLOWED_GROUPS;
    if (allowedGroupsEnv) {
      allowedGroupsEnv.split(',').forEach(groupName => {
        this.allowedGroupNames.add(groupName.trim());
      });
      console.log(`[Konfigurasi Grup]: Bot hanya akan merespons di grup: ${Array.from(this.allowedGroupNames).join(', ')}`);
    } else {
      console.log('[Konfigurasi Grup]: Bot akan merespons di SEMUA grup (ALLOWED_GROUPS tidak disetel).');
    }
  }

  private loadTriggerKeywords() {
    const triggerKeywordsEnv = process.env.TRIGGER_KEYWORDS;
    if (triggerKeywordsEnv) {
      this.triggerKeywords = triggerKeywordsEnv.split(',').map(keyword => keyword.trim().toLowerCase());
      console.log(`[Konfigurasi Kata Kunci Pemicu]: Bot akan merespons jika pesan mengandung salah satu kata kunci ini: ${this.triggerKeywords.join(', ')}`);
    } else {
      console.log('[Konfigurasi Kata Kunci Pemicu]: Tidak ada kata kunci pemicu yang disetel. Bot hanya akan merespons jika di-mention.');
    }
  }

  private loadMentionTriggerKeywords() {
    const mentionTriggerKeywordsEnv = process.env.MENTION_TRIGGER_KEYWORDS;
    if (mentionTriggerKeywordsEnv) {
      this.mentionTriggerKeywords = mentionTriggerKeywordsEnv.split(',').map(keyword => keyword.trim().toLowerCase());
      console.log(`[Konfigurasi Kata Kunci Pemicu Mention]: Bot akan merespons jika di-mention DAN pesan mengandung salah satu kata kunci ini: ${this.mentionTriggerKeywords.join(', ')}`);
    } else {
      console.log('[Konfigurasi Kata Kunci Pemicu Mention]: Tidak ada kata kunci pemicu mention yang disetel.');
    }
  }

  async initializeBotId() {
    // Panggil ini setelah client siap
    this.myNumber = this.client.info.wid._serialized.split('@')[0];
    console.log(`[Bot ID Utama Disetel]: ${this.myNumber}`);

    // Muat ID alternatif dari database yang terkait dengan myNumber ini
    const config = await prisma.botConfig.findUnique({
      where: { botNumber: this.myNumber },
    });

    if (config) {
      const storedNumbers = JSON.parse(config.alternativeIds);
      storedNumbers.forEach((num: string) => this.alternativeNumbers.add(num));
      console.log(`[ID Alternatif Dimuat untuk ${this.myNumber}]: ${Array.from(this.alternativeNumbers).join(', ')}`);
    } else {
      console.log(`[ID Alternatif]: Tidak ada konfigurasi ditemukan untuk ${this.myNumber}.`);
    }
  }

  async handleIncomingMessage(message: Message) {
    const chat = await message.getChat();
    const chatName = chat.isGroup ? chat.name : message.from;

    console.log(`[Pesan Masuk] Dari: ${chatName} (${message.from}), Konten: "${message.body}"`);

    if (!chat.isGroup) {
      console.log('[Pesan Masuk]: Bukan dari grup, dilewati.');
      return;
    }

    // Filter berdasarkan ALLOWED_GROUPS
    if (this.allowedGroupNames.size > 0 && !this.allowedGroupNames.has(chat.name)) {
      console.log(`[Pesan Masuk]: Grup ${chat.name} tidak diizinkan, dilewati.`);
      return;
    }

    // Simpan pesan ke SQLite
    await prisma.message.create({
      data: {
        groupId: chat.id._serialized,
        sender: message.from,
        content: message.body,
      },
    });

    if (!this.myNumber) {
      console.warn('Bot ID utama belum disetel. Melewatkan pengecekan mention untuk pesan ini.');
      return;
    }

    let shouldRespond = false;
    const messageBodyLower = message.body.toLowerCase();

    // 1. Periksa apakah bot di-mention
    let botDirectlyMentioned = false;
    if (message.mentionedIds.length > 0) {
      console.log(`[Debug Mention]: My Number: ${this.myNumber}, Mentioned IDs: ${JSON.stringify(message.mentionedIds)}`);

      for (const mentionedId of message.mentionedIds) {
        const mentionedNumber = mentionedId.split('@')[0];
        try {
          const contact = await this.client.getContactById(mentionedId);
          console.log(`[Debug Mentioned Contact]: ID: ${mentionedId}, Number: ${mentionedNumber}, Name: ${contact.name || contact.pushname || 'Unknown'}`);
        } catch (e) {
          console.log(`[Debug Mentioned Contact]: Could not get contact for ID: ${mentionedId}. Error: ${e.message}`);
        }

        if (mentionedNumber === this.myNumber) {
          botDirectlyMentioned = true;
          break;
        } else if (!this.alternativeNumbers.has(mentionedNumber)) {
          this.alternativeNumbers.add(mentionedNumber);
          await prisma.botConfig.upsert({
            where: { botNumber: this.myNumber },
            update: { alternativeIds: JSON.stringify(Array.from(this.alternativeNumbers)) },
            create: { botNumber: this.myNumber, alternativeIds: JSON.stringify(Array.from(this.alternativeNumbers)) },
          });
          console.log(`[ID Alternatif Baru Ditambahkan untuk ${this.myNumber}]: ${mentionedNumber}`);
          botDirectlyMentioned = true; // Anggap sebagai mention untuk pesan ini
          break;
        } else if (this.alternativeNumbers.has(mentionedNumber)) {
          botDirectlyMentioned = true;
          break;
        }
      }
    }

    console.log(`[Pesan Masuk]: Bot di-mention langsung? ${botDirectlyMentioned}`);

    // 2. Tentukan apakah bot harus merespons
    if (botDirectlyMentioned) {
      // Jika bot di-mention langsung
      if (this.mentionTriggerKeywords.length > 0) {
        // Dan ada mentionTriggerKeywords, periksa apakah pesan mengandung salah satunya
        let keywordFound = false;
        for (const keyword of this.mentionTriggerKeywords) {
          if (messageBodyLower.includes(keyword)) {
            keywordFound = true;
            break;
          }
        }
        if (keywordFound) {
          shouldRespond = true;
          console.log(`[Pesan Masuk]: Bot di-mention dan kata kunci pemicu mention terdeteksi.`);
        } else {
          console.log(`[Pesan Masuk]: Bot di-mention, tetapi tidak ada kata kunci pemicu mention yang ditemukan. Dilewati.`);
        }
      } else {
        // Jika bot di-mention langsung dan tidak ada mentionTriggerKeywords, maka respons
        shouldRespond = true;
        console.log(`[Pesan Masuk]: Bot di-mention.`);
      }
    } else {
      // Jika bot tidak di-mention langsung, periksa triggerKeywords (tanpa mention)
      if (this.triggerKeywords.length > 0) {
        for (const keyword of this.triggerKeywords) {
          if (messageBodyLower.includes(keyword)) {
            shouldRespond = true;
            console.log(`[Pesan Masuk]: Kata kunci pemicu "${keyword}" terdeteksi (tanpa mention).`);
            break;
          }
        }
      }
    }

    if (shouldRespond) {
      this.handleMention(message);
    }
  }

  private async handleMention(message: Message) {
    const chat = await message.getChat();
    const question = message.body.replace(/@\d+/g, '').trim();

    console.log(`[Mention Terdeteksi]: Pertanyaan: "${question}"`);

    const history = await prisma.message.findMany({
      where: { groupId: chat.id._serialized },
      orderBy: { timestamp: 'desc' },
      take: 10,
    });

    const context = history
      .reverse()
      .map((msg) => `${msg.sender}: ${msg.content}`)
      .join('\n');

    const prompt = `
      Anda adalah member di sebuah grup WhatsApp bernama "${chat.name}".
      Persona Anda: ${process.env.BOT_PERSONA}
      Gaya bahasa: ${process.env.BOT_STYLE}
      Bahasa: ${process.env.BOT_LANGUAGE}
      Catatan: ${process.env.BOT_NOTE}

      Berikut adalah riwayat percakapan yang relevan:
      ---
      ${context}
      ---

      Berdasarkan konteks di atas, jawab pertanyaan berikut dari pengguna:
      Pertanyaan: "${question}"

      Format Jawaban:
      - Gunakan *plain text* yang cocok untuk WhatsApp.
      - Jika jawaban terdiri dari beberapa poin, gunakan list item (1., 2., 3.).
      - Hindari penggunaan tabel.
      - Hindari simbol, emoji berlebihan, atau teks tebal/miring
      - Jawaban langsung dan sesuai konteks.
      Jawaban:
    `;

    console.log('[LLM Prompt Dibuat]:\n', prompt);

    const response = await llmProvider.generateResponse(prompt);
    message.reply(response);
  }
}
