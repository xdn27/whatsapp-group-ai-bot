# WhatsApp AI Bot

Bot AI untuk grup WhatsApp yang cerdas dan kontekstual, didukung oleh LLM (OpenAI/OpenRouter) dan `whatsapp-web.js`.

## Fitur

- **Login Mudah**: Scan QR code sekali saja, baik di terminal maupun via web.
- **Kontekstual**: Memahami riwayat percakapan grup untuk memberikan jawaban yang relevan.
- **Fleksibel**: Mendukung berbagai model LLM dari OpenAI dan OpenRouter.
- **Kustomisasi Persona**: Atur gaya bicara dan bahasa bot sesuai keinginan Anda melalui file `.env`.
- **Penyimpanan Lokal**: Semua percakapan dan data sesi disimpan secara lokal di database SQLite.
- **Filter Grup**: Kontrol di grup mana saja bot akan merespons.

## Stack Teknologi

- **Runtime**: Node.js
- **Bahasa**: TypeScript
- **Integrasi WhatsApp**: `whatsapp-web.js`
- **Web Server**: Express
- **Database**: SQLite
- **ORM**: Prisma
- **LLM**: OpenAI, OpenRouter

## Cara Menjalankan

1.  **Clone Repositori**

    ```bash
    git clone <url-repositori-ini>
    cd whatsapp-ai-bot
    ```

2.  **Install Dependensi**

    ```bash
    npm install
    ```

3.  **Konfigurasi Environment**

    - Salin file `.env.example` menjadi `.env`.
      ```bash
      cp .env.example .env
      ```
    - Buka file `.env` dan isi semua variabel yang diperlukan, terutama:
      - `LLM_PROVIDER`: Pilih `openai` atau `openrouter`.
      - `OPENAI_API_KEY`: Kunci API OpenAI Anda.
      - `OPENROUTER_API_KEY`: Kunci API OpenRouter Anda (jika digunakan).
      - `OPENROUTER_REFERER`: URL aplikasi atau website Anda (wajib untuk OpenRouter).
      - `ALLOWED_GROUPS`: (Opsional) Daftar NAMA grup WhatsApp yang diizinkan, dipisahkan koma (contoh: `Grup Keren Saya,Obrolan Lain`). Jika dikosongkan, bot akan merespons di semua grup.
      - `TRIGGER_KEYWORDS`: (Opsional) Daftar kata kunci yang dipisahkan koma (contoh: `bot,tanya,hai`). Jika pesan mengandung salah satu kata kunci ini, bot akan merespons meskipun tidak di-mention. Jika dikosongkan, bot hanya akan merespons jika di-mention.
      - `MENTION_TRIGGER_KEYWORDS`: (Opsional) Daftar kata kunci yang dipisahkan koma (contoh: `apa,bagaimana`). Jika bot di-mention, bot hanya akan merespons jika pesan juga mengandung salah satu kata kunci ini. Jika dikosongkan, bot akan merespons setiap kali di-mention.

4.  **Setup Database**

    Jalankan migrasi Prisma untuk membuat file database SQLite dan tabel yang diperlukan.

    ```bash
    npm run prisma:migrate
    ```

5.  **Jalankan Bot**

    ```bash
    npm run dev
    ```

6.  **Login WhatsApp**

    - **Opsi 1 (Terminal)**: QR code akan muncul langsung di terminal Anda. Scan menggunakan aplikasi WhatsApp di ponsel Anda.
    - **Opsi 2 (Web)**: Buka browser dan akses `http://localhost:3000/qr`. Scan QR code yang ditampilkan.

    Setelah berhasil login, sesi akan disimpan secara lokal. Anda tidak perlu scan ulang setiap kali menjalankan bot.

## Cara Menggunakan

1.  Undang bot ke grup WhatsApp Anda.
2.  Untuk bertanya, mention bot di dalam pesan Anda (contoh: `@NamaBot apa kabar?`).
3.  Bot akan membaca riwayat pesan di grup untuk mencari konteks, lalu memberikan jawaban yang relevan.