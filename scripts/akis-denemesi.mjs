// Uçtan uca akış denemesi.
//
// Gerçek tarayıcıda giriş → kurulum → çocuk ekleme → QR → ayarlar adımlarını
// yürütür, her adımda ekran görüntüsü alır, konsol ve HTTP hatalarını toplar.
//
// Giriş bağlantısı e-posta yapılandırılmadığında sunucu günlüğüne yazılıyor;
// betik onu `netlify dev` günlüğünden okuyup doğrudan kullanıyor. Böylece
// oturum açmadan görülemeyen ekranlar da denenebiliyor.
//
// Google izni gerektiren adım (çocuğun Google'a gitmesi) atlanır.
//
// Kullanım: node scripts/akis-denemesi.mjs [url] [çıktı] [sunucu-günlüğü]

import { chromium } from 'playwright-core';
import { mkdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const TABAN = process.argv[2] ?? 'http://localhost:8888';
const CIKTI = resolve(process.argv[3] ?? 'C:/Users/TCBAUNER/AppData/Local/Temp/claude/odev-akis');
const GUNLUK = process.argv[4] ?? '/tmp/netlify.log';

mkdirSync(CIKTI, { recursive: true });

async function tarayiciAc() {
  for (const channel of ['msedge', 'chrome', 'chromium']) {
    try { return await chromium.launch({ channel, headless: true }); } catch { /* sıradaki */ }
  }
  throw new Error('Kurulu Chromium tabanlı tarayıcı bulunamadı.');
}

/** Sunucu günlüğündeki son giriş bağlantısını bulur. */
function sonGirisBaglantisi() {
  try {
    const metin = readFileSync(GUNLUK, 'utf8');
    const hepsi = [...metin.matchAll(/https?:\/\/[^\s]*\/api\/dogrula\?bilet=[^\s"']+/g)];
    return hepsi.length ? hepsi[hepsi.length - 1][0] : null;
  } catch {
    return null;
  }
}

const tarayici = await tarayiciAc();
const baglam = await tarayici.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  locale: 'tr-TR',
  timezoneId: 'Europe/Istanbul',
});
const sayfa = await baglam.newPage();

const konsolHatalari = [];
const httpHatalari = [];
sayfa.on('console', (m) => { if (m.type() === 'error') konsolHatalari.push(m.text()); });
sayfa.on('pageerror', (e) => konsolHatalari.push(String(e)));
sayfa.on('response', (r) => {
  if (r.status() >= 400) httpHatalari.push(`${r.status()} ${r.url().replace(TABAN, '')}`);
});

let adim = 0;
async function cek(ad) {
  adim++;
  const dosya = `${String(adim).padStart(2, '0')}-${ad}.png`;
  await sayfa.screenshot({ path: join(CIKTI, dosya) });
  const govde = (await sayfa.locator('body').innerText().catch(() => ''))
    .replace(/\s+/g, ' ').trim().slice(0, 90);
  console.log(`  ${dosya.padEnd(24)} ${govde}`);
}

/** Metnine göre düğmeye basar; bulunamazsa uyarır ama akışı kesmez. */
async function bas(desen, ad) {
  const d = sayfa.locator('button, a').filter({ hasText: desen }).first();
  try {
    await d.click({ timeout: 4000 });
    await sayfa.waitForTimeout(800);
    return true;
  } catch {
    console.log(`  ! düğme bulunamadı (${ad}): ${desen}`);
    return false;
  }
}

/** Sayfanın ağ etkinliği durulana kadar bekler; takılırsa devam eder. */
async function git(yol) {
  await sayfa.goto(TABAN + yol, { waitUntil: 'domcontentloaded', timeout: 15000 })
    .catch((e) => console.log(`  ! ${yol}: ${String(e).split('\n')[0]}`));
  await sayfa.waitForTimeout(1200);
}

try {
  // --- 1. Oturumsuz giriş ekranı ---
  await git('/giris');
  await cek('giris');

  // --- 2. E-posta gönder ---
  await sayfa.locator('input').first().fill('bahadir@example.com').catch(() => {});
  await cek('giris-dolu');
  await bas(/gönder|bağlantı|giriş/i, 'giriş');
  await cek('eposta-bekleniyor');

  // --- 3. Günlükten giriş bağlantısını al, oturum aç ---
  await new Promise((c) => setTimeout(c, 1200));
  const baglanti = sonGirisBaglantisi();
  if (!baglanti) {
    console.log('  ! giriş bağlantısı günlükte bulunamadı; oturumlu ekranlar atlanacak');
  } else {
    console.log('  giriş bağlantısı bulundu');
    await sayfa.goto(baglanti, { waitUntil: 'domcontentloaded', timeout: 15000 })
      .catch((e) => console.log('  ! doğrula: ' + String(e).split('\n')[0]));
    await sayfa.waitForTimeout(1500);
    await cek('oturum-acildi');
  }

  // --- 4. Kurulum: hane adı ---
  await git('/kurulum');
  await cek('kurulum1');
  await sayfa.locator('input').first().fill('Üner Ailesi').catch(() => {});
  await bas(/devam|ileri|sonraki/i, 'kurulum1');
  await cek('kurulum2');

  // --- 5. Çocuk adı → QR ---
  await sayfa.locator('input').first().fill('Ahmet').catch(() => {});
  await bas(/devam|ileri|bağlan|oluştur/i, 'kurulum2');
  await cek('bagla-qr');

  // --- 6. Ayarlar ---
  await git('/ayarlar');
  await cek('ayarlar');

  // --- 7. Pano ---
  await git('/');
  await cek('pano');
} catch (e) {
  console.error('\nAKIŞ HATASI:', String(e).split('\n').slice(0, 3).join('\n'));
} finally {
  await tarayici.close();
}

console.log(`\nÇıktı: ${CIKTI}`);
if (httpHatalari.length) {
  console.log(`\nHTTP HATALARI (${httpHatalari.length}):`);
  for (const h of [...new Set(httpHatalari)].slice(0, 12)) console.log('  ' + h);
} else {
  console.log('HTTP hatası yok.');
}
if (konsolHatalari.length) {
  console.log(`\nKONSOL HATALARI (${konsolHatalari.length}):`);
  for (const h of [...new Set(konsolHatalari)].slice(0, 8)) console.log('  ' + h.slice(0, 200));
} else {
  console.log('Konsol hatası yok.');
}
