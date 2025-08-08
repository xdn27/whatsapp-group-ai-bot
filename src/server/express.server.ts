
import express from 'express';

export class ExpressServer {
  private app = express();
  private qrCodeData: string | null = null;

  constructor(private port: number) {}

  start() {
    this.app.get('/qr', (req, res) => {
      if (this.qrCodeData) {
        res.send(`<img src="${this.qrCodeData}" alt="QR Code">`);
      } else {
        res.status(404).send('QR code not generated yet. Please wait.');
      }
    });

    this.app.listen(this.port, () => {
      console.log(`Server is running on http://localhost:${this.port}`);
      console.log(`QR code will be available at http://localhost:${this.port}/qr`);
    });
  }

  setQRCode(qr: string) {
    this.qrCodeData = qr;
  }
}
