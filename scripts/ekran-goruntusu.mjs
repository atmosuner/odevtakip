// Panoyu gerçek tarayıcıda açıp ekran görüntüsü alır.
//
// Amaç: portun tasarımla aynı görüntüyü ürettiğini gözle doğrulamak.
// Kurulu Edge/Chrome kullanılır; tarayıcı indirilmez.
//
// Kullanım: node scripts/ekran-goruntusu.mjs [url] [çıktı-dizini]

import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const URL_ADRESI = process.argv[2] ?? 'http://localhost:5173/';
const CIKTI = resolve(process.argv[3] ?? 'C:/Users/TCBAUNER/AppData/Local/Temp/claude/odev-goruntu');

const KANALLAR = ['msedge', 'chrome', 'chromium'];

/** Geliştirme çubuğundaki düğmeye metnine göre basar. */
async function bas(sayfa, metin) {
  await sayfa.getByRole('button', { name: metin, exact: true }).first().click();
  await sayfa.waitForTimeout(120);
}

const CEKIMLER = [
  { ad: '01-pano-2-cocuk', hazirla: async (s) => { await bas(s, '2 çocuk'); } },
  { ad: '02-pano-1-cocuk', hazirla: async (s) => { await bas(s, '1 çocuk'); } },
  { ad: '03-pano-4-cocuk', hazirla: async (s) => { await bas(s, '4 çocuk'); } },
  { ad: '04-eksik-paneli', hazirla: async (s) => {
      await bas(s, '2 çocuk');
      await s.getByRole('button', { name: /eksik ödev.*Eksik ödevler listesini aç/i }).first().click();
      await s.waitForTimeout(350);
    } },
  { ad: '05-yukleniyor', hazirla: async (s) => { await bas(s, 'yukleniyor'); } },
  { ad: '06-veri-yok', hazirla: async (s) => { await bas(s, 'veri-yok'); } },
  { ad: '07-cocuk-yok', hazirla: async (s) => { await bas(s, 'cocuk-yok'); } },
  { ad: '08-veri-eski', hazirla: async (s) => { await bas(s, 'eski'); } },
  { ad: '09-cevrimdisi', hazirla: async (s) => { await bas(s, 'cevrimdisi'); } },
  { ad: '10-baglanti-koptu', hazirla: async (s) => {
      await bas(s, 'normal'); await bas(s, 'bağlantı koptu');
    } },
  { ad: '11-takip-oncesi-ay', hazirla: async (s) => {
      await bas(s, 'normal');
      await s.getByRole('button', { name: /önceki ay|geri/i }).first()
        .click().catch(() => {});
      await s.waitForTimeout(200);
    } },
];

async function tarayiciAc() {
  for (const channel of KANALLAR) {
    try {
      return await chromium.launch({ channel, headless: true });
    } catch { /* sıradakini dene */ }
  }
  throw new Error('Edge/Chrome bulunamadı. Kurulu bir Chromium tarayıcı gerekiyor.');
}

mkdirSync(CIKTI, { recursive: true });
const tarayici = await tarayiciAc();

const baglam = await tarayici.newContext({
  viewport: { width: 390, height: 844 },      // iPhone 14 ölçüsü
  deviceScaleFactor: 2,
  locale: 'tr-TR',
  timezoneId: 'Europe/Istanbul',
  colorScheme: 'light',
});

const sayfa = await baglam.newPage();
const hatalar = [];
sayfa.on('console', (m) => { if (m.type() === 'error') hatalar.push(m.text()); });
sayfa.on('pageerror', (e) => hatalar.push(String(e)));

await sayfa.goto(URL_ADRESI, { waitUntil: 'networkidle' });
await sayfa.waitForTimeout(600);               // font yüklensin

for (const c of CEKIMLER) {
  try {
    await c.hazirla(sayfa);
    await sayfa.screenshot({ path: join(CIKTI, `${c.ad}.png`) });
    console.log(`  ✓ ${c.ad}`);
  } catch (e) {
    console.log(`  ✗ ${c.ad}: ${String(e).split('\n')[0]}`);
  }
}

// Koyu tema, ana görünüm
await baglam.close();
const koyu = await tarayici.newContext({
  viewport: { width: 390, height: 844 }, deviceScaleFactor: 2,
  locale: 'tr-TR', timezoneId: 'Europe/Istanbul', colorScheme: 'dark',
});
const sayfaKoyu = await koyu.newPage();
await sayfaKoyu.goto(URL_ADRESI, { waitUntil: 'networkidle' });
await sayfaKoyu.waitForTimeout(600);
await sayfaKoyu.screenshot({ path: join(CIKTI, '12-koyu-tema.png') });
console.log('  ✓ 12-koyu-tema');

await tarayici.close();

console.log(`\nÇıktı: ${CIKTI}`);
if (hatalar.length) {
  console.log(`\nKONSOL HATALARI (${hatalar.length}):`);
  for (const h of [...new Set(hatalar)].slice(0, 10)) console.log('  ' + h.slice(0, 200));
} else {
  console.log('Konsol hatası yok.');
}
