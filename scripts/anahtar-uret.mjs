// Şifreleme anahtarları üretir.
//
// Kullanım: node scripts/anahtar-uret.mjs
//
// Çıktıyı .env dosyasına ya da Netlify ortam değişkenlerine kopyalayın.
// Anahtarlar hiçbir yere yazılmaz; yalnızca ekrana basılır.

import { randomBytes } from 'node:crypto';

const anaAnahtar = randomBytes(32).toString('base64');
const oturumGizli = randomBytes(32).toString('base64');

console.log(`ANA_ANAHTAR=${anaAnahtar}`);
console.log(`OTURUM_GIZLI=${oturumGizli}`);
console.log(`
ANA_ANAHTAR çocukların Google refresh token'larını şifreler.
Kaybedilirse tüm bağlantılar kopar ve her çocuğun yeniden izin vermesi gerekir.
Bir parola yöneticisinde yedekleyin.`);
