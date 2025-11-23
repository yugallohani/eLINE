#!/usr/bin/env node

import QRCode from 'qrcode';
import fs from 'fs';

const businessId = process.argv[2] || 'default';
const url = process.argv[3] || 'http://localhost:5173';

const qrUrl = `${url}/?business=${businessId}`;

console.log('🔲 Generating QR Code for eLINE');
console.log('================================');
console.log(`Business ID: ${businessId}`);
console.log(`URL: ${qrUrl}`);
console.log('');

// Generate QR code as PNG
QRCode.toFile(`qr-${businessId}.png`, qrUrl, {
  width: 500,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  }
}, (err) => {
  if (err) {
    console.error('❌ Error generating QR code:', err);
    process.exit(1);
  }
  
  console.log(`✅ QR code saved as: qr-${businessId}.png`);
  console.log('');
  console.log('📱 Print this QR code and place it at your reception desk.');
  console.log('   Customers can scan it to join the queue instantly!');
});

// Also generate as SVG
QRCode.toString(qrUrl, { type: 'svg' }, (err, svg) => {
  if (err) return;
  
  fs.writeFileSync(`qr-${businessId}.svg`, svg);
  console.log(`✅ QR code also saved as: qr-${businessId}.svg (vector format)`);
});

// Generate terminal version
QRCode.toString(qrUrl, { type: 'terminal' }, (err, qr) => {
  if (err) return;
  
  console.log('');
  console.log('Terminal QR Code:');
  console.log(qr);
});
