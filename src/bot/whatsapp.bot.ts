import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { BotController } from '../controller/bot.controller';
import { ExpressServer } from '../server/express.server';

export class WhatsAppBot {
  private client: Client;
  private botController: BotController;

  constructor(private expressServer: ExpressServer) {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        args: ['--no-sandbox'],
      },
    });

    this.botController = new BotController(this.client);

    this.initialize();
  }

  private initialize() {
    this.client.on('qr', (qr) => {
      qrcode.generate(qr, { small: true });
      this.expressServer.setQRCode(qr);
    });

    this.client.on('ready', async () => { // Tambahkan async di sini
      console.log('WhatsApp client is ready!');
      await this.botController.initializeBotId(); // Panggil initializeBotId
    });

    this.client.on('message', async (message) => {
      this.botController.handleIncomingMessage(message);
    });

    this.client.initialize();
  }
}