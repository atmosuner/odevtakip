// Figtree'yi Google Fonts'tan indirip yerelleştirir.
//
// Neden: tasarım Figtree kullanıyor ve birebir korunacak. Google CDN'den
// çekmek PWA çevrimdışıyken fontu düşürür ve görünüm bozulur; ayrıca her
// açılışta Google'a istek gider. İndirilen dosyalar Google'ın sunduğunun
// aynısıdır, yani görsel fark yoktur.
//
// Türkçe için `latin-ext` alt kümesi şart: ğ ı ş İ temel `latin` içinde yok.
//
// Kullanım: node scripts/fetch-fonts.mjs

import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const KOK = resolve(process.argv[1], '../..');
const FONT_DIZIN = join(KOK, 'public', 'fonts');
const CSS_YOL = join(KOK, 'src', 'web', 'figtree.css');

const AGIRLIKLAR = '400;500;600;700';
const CSS_URL = `https://fonts.googleapis.com/css2?family=Figtree:wght@${AGIRLIKLAR}&display=swap`;

// woff2 döndürmesi için modern tarayıcı User-Agent'ı gerekiyor;
// aksi halde Google eski formatları (ttf) sunar.
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

/** woff2 dosyaları `wOF2` sihirli baytıyla başlar. */
function woff2Mi(tampon) {
  return tampon.length > 4 &&
    tampon[0] === 0x77 && tampon[1] === 0x4f && tampon[2] === 0x46 && tampon[3] === 0x32;
}

const cevap = await fetch(CSS_URL, { headers: { 'user-agent': UA } });
if (!cevap.ok) throw new Error(`Google Fonts CSS alınamadı: HTTP ${cevap.status}`);
let css = await cevap.text();

const bloklar = [...css.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g)];
if (!bloklar.length) throw new Error('CSS içinde @font-face bloğu bulunamadı');

mkdirSync(FONT_DIZIN, { recursive: true });

const gerekli = new Set(['latin', 'latin-ext']);
const indirilen = [];
const tutulan = [];

for (const [tam, altKume, govde] of bloklar) {
  if (!gerekli.has(altKume)) { css = css.replace(tam, ''); continue; }

  const agirlik = /font-weight:\s*(\d+)/.exec(govde)?.[1] ?? '400';
  const url = /url\((https:\/\/[^)]+\.woff2)\)/.exec(govde)?.[1];
  if (!url) throw new Error(`woff2 URL'si yok: ${altKume} ${agirlik}`);

  const dosya = `figtree-${agirlik}-${altKume}.woff2`;
  const r = await fetch(url, { headers: { 'user-agent': UA } });
  if (!r.ok) throw new Error(`Font inmedi (${dosya}): HTTP ${r.status}`);

  const tampon = Buffer.from(await r.arrayBuffer());
  if (!woff2Mi(tampon)) throw new Error(`Geçersiz woff2 (sihirli bayt yok): ${dosya}`);

  writeFileSync(join(FONT_DIZIN, dosya), tampon);
  css = css.replace(url, `/fonts/${dosya}`);
  indirilen.push({ dosya, kb: (tampon.length / 1024).toFixed(1) });
  tutulan.push(`${agirlik}/${altKume}`);
}

css = `/* ÜRETİLEN DOSYA — npm run fonts ile yenile.
   Kaynak: ${CSS_URL}
   Tutulan alt kümeler: latin, latin-ext (Türkçe ğ ı ş İ için latin-ext şart). */\n` +
  css.replace(/\n{3,}/g, '\n\n').trim() + '\n';

mkdirSync(join(KOK, 'src', 'web'), { recursive: true });
writeFileSync(CSS_YOL, css, 'utf8');

const toplam = indirilen.reduce((a, d) => a + Number(d.kb), 0);
console.log(`İndirilen: ${indirilen.length} dosya (${tutulan.join(', ')})`);
for (const d of indirilen) console.log(`  ${d.dosya.padEnd(34)} ${d.kb.padStart(6)} KB`);
console.log(`Toplam: ${toplam.toFixed(1)} KB`);
console.log(`CSS: ${CSS_YOL}`);
