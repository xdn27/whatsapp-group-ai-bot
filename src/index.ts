
import 'dotenv/config';
import { WhatsAppBot } from './bot/whatsapp.bot';
import { ExpressServer } from './server/express.server';

const expressPort = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const expressServer = new ExpressServer(expressPort);
expressServer.start();

new WhatsAppBot(expressServer);

console.log('Bot is starting...');
