// Claude Design .dc.html şablonlarını React TSX'e çevirir.
//
// Amaç: tasarımı BİREBİR korumak. Inline style değerleri hiç yorumlanmaz,
// string olarak aynen taşınır. Sadece CSS özellik adları camelCase'e döner
// (React'in zorunlu kıldığı tek dönüşüm) ve `{{ ifade }}` JSX ifadesine çevrilir.
//
// Kullanım: node scripts/dc-to-tsx.mjs [dosya.dc.html ...]
// Varsayılan: design/*.dc.html → src/web/uretilen/<Ad>.tsx

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, basename, resolve } from 'node:path';

const KOK = resolve(process.argv[1], '../..');
const KAYNAK = join(KOK, 'design');
const HEDEF = join(KOK, 'src', 'web', 'uretilen');

/** HTML'de kapanış etiketi olmayan elemanlar. */
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr']);

/** React'te adı değişen HTML nitelikleri. */
const NITELIK = new Map([
  ['class', 'className'], ['for', 'htmlFor'], ['tabindex', 'tabIndex'],
  ['colspan', 'colSpan'], ['rowspan', 'rowSpan'], ['maxlength', 'maxLength'],
  ['readonly', 'readOnly'], ['autocomplete', 'autoComplete'], ['autofocus', 'autoFocus'],
  ['srcset', 'srcSet'], ['contenteditable', 'contentEditable'], ['inputmode', 'inputMode'],
  ['enterkeyhint', 'enterKeyHint'], ['spellcheck', 'spellCheck'], ['novalidate', 'noValidate'],
]);

/** `background-color` → `backgroundColor`. `--degisken` olduğu gibi kalır. */
function cssAdi(ad) {
  if (ad.startsWith('--')) return ad;
  return ad.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

/**
 * `style="a:b;c:d"` → `{ a: 'b', c: 'd' }` kaynak metni.
 * Değerler aynen korunur; içinde `{{ }}` varsa şablon literaline döner.
 * `;` ayırıcısı, `url(...)`/`var(...)` parantezleri ve tırnaklar içinde bölünmez.
 */
function stilNesnesi(ham) {
  const parcalar = [];
  let derinlik = 0, tirnak = null, tampon = '';
  for (const ch of ham) {
    if (tirnak) {
      tampon += ch;
      if (ch === tirnak) tirnak = null;
      continue;
    }
    if (ch === '"' || ch === "'") { tirnak = ch; tampon += ch; continue; }
    if (ch === '(') derinlik++;
    if (ch === ')') derinlik--;
    if (ch === ';' && derinlik === 0) { parcalar.push(tampon); tampon = ''; continue; }
    tampon += ch;
  }
  parcalar.push(tampon);

  const cift = [];
  for (const p of parcalar) {
    const s = p.trim();
    if (!s) continue;
    const kesme = s.indexOf(':');
    if (kesme < 0) continue;
    const ad = cssAdi(s.slice(0, kesme).trim());
    const deger = s.slice(kesme + 1).trim();
    const anahtar = /^[A-Za-z][A-Za-z0-9]*$/.test(ad) ? ad : JSON.stringify(ad);
    cift.push(`${anahtar}: ${degerLiterali(deger)}`);
  }
  return `{ ${cift.join(', ')} }`;
}

/** CSS değerini JS literaline çevirir; `{{ x }}` içeriyorsa şablon literali üretir. */
function degerLiterali(deger) {
  if (!deger.includes('{{')) return JSON.stringify(deger);
  const govde = deger
    .replace(/[\\`$]/g, (m) => '\\' + m)
    .replace(/\\\$\\\{/g, '${')
    .replace(/\{\{\s*([\s\S]*?)\s*\}\}/g, (_, ifade) => '${' + ifade.trim() + '}');
  return '`' + govde + '`';
}

/** Metin içindeki `{{ x }}` → `{x}`; süslü parantez ve `<`/`>` JSX için kaçırılır. */
function metin(ham) {
  return ham.replace(/\{\{\s*([\s\S]*?)\s*\}\}|([\s\S]+?)(?=\{\{|$)/g,
    (tam, ifade, duz) => {
      if (ifade !== undefined) return `{${ifade.trim()}}`;
      if (duz === undefined) return '';
      return duz.replace(/[{}]/g, (c) => `{'${c}'}`).replace(/>/g, '{\'>\'}');
    });
}

/** Nitelik değerini JSX niteliğine çevirir. */
function nitelik(ad, deger) {
  const reactAd = NITELIK.get(ad.toLowerCase()) ?? ad;
  if (deger === null) return reactAd;                       // boolean nitelik

  // Tümü tek bir ifadeyse doğrudan bağla: value="{{ x }}" → value={x}
  // style için de geçerli: style="{{ h.stil }}" zaten hazır bir stil nesnesidir,
  // CSS metni gibi ayrıştırılmamalı.
  const tek = /^\s*\{\{\s*([\s\S]*?)\s*\}\}\s*$/.exec(deger);
  if (tek) return `${reactAd}={${tek[1].trim()}}`;

  if (ad.toLowerCase() === 'style') return `style={${stilNesnesi(deger)}}`;
  if (deger.includes('{{')) return `${reactAd}={${degerLiterali(deger)}}`;
  return `${reactAd}=${JSON.stringify(deger)}`;
}

/** Bir etiketin niteliklerini ayrıştırır (tırnaklı, tırnaksız ve boolean). */
function nitelikleriAyikla(ham) {
  const cikti = [];
  const re = /([:@a-zA-Z_][-:.\w]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let m;
  while ((m = re.exec(ham))) {
    const deger = m[2] ?? m[3] ?? m[4] ?? null;
    cikti.push([m[1], deger]);
  }
  return cikti;
}

// --- Ayrıştırıcı: HTML → düğüm ağacı ------------------------------------

function ayrıstır(html) {
  const kok = { tip: 'kok', cocuklar: [] };
  const yigin = [kok];
  const re = /<!--[\s\S]*?-->|<\/([a-zA-Z][-\w]*)\s*>|<([a-zA-Z][-\w]*)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/g;
  let son = 0, m;

  const metinEkle = (s) => {
    if (s) yigin[yigin.length - 1].cocuklar.push({ tip: 'metin', deger: s });
  };

  while ((m = re.exec(html))) {
    metinEkle(html.slice(son, m.index));
    son = re.lastIndex;
    if (m[0].startsWith('<!--')) continue;

    if (m[1]) {                                   // kapanış
      for (let i = yigin.length - 1; i > 0; i--) {
        if (yigin[i].ad === m[1]) { yigin.length = i; break; }
      }
      continue;
    }
    const ad = m[2];
    const dugum = { tip: 'eleman', ad, nitelikler: nitelikleriAyikla(m[3] ?? ''), cocuklar: [] };
    yigin[yigin.length - 1].cocuklar.push(dugum);
    if (!m[4] && !VOID.has(ad.toLowerCase())) yigin.push(dugum);
  }
  metinEkle(html.slice(son));
  return kok;
}

// --- Üretici: düğüm ağacı → JSX -----------------------------------------

let sayac = 0;

/** Şablonun dışarıdan beklediği kök tanımlayıcılar. */
let disBagimlilik = new Set();
/** Aktif `sc-for` döngü değişkenleri — bunlar prop değil, yereldir. */
let kapsam = [];

/** JS diline ait, prop sayılmaması gereken adlar. */
const KURESEL = new Set(['true', 'false', 'null', 'undefined', 'Math', 'String', 'Number',
  'Boolean', 'Array', 'Object', 'JSON', 'Date', 'Intl', 'NaN', 'Infinity', 'typeof',
  'new', 'in', 'of', 'void', 'delete', 'instanceof']);

/**
 * Bir ifadedeki kök tanımlayıcıları toplar.
 * Üye erişimi (`a.b`), nesne anahtarı (`{ a: 1 }`) ve string içi atlanır.
 */
function bagimlilikTopla(ifade) {
  if (!ifade) return;
  const temiz = ifade
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/`(?:[^`\\]|\\.)*`/g, '``');
  for (const m of temiz.matchAll(/(^|[^.\w$])([A-Za-z_$][\w$]*)\s*(:)?/g)) {
    const ad = m[2];
    if (m[3]) continue;                       // `ad:` → nesne anahtarı, değişken değil
    if (KURESEL.has(ad)) continue;
    if (kapsam.includes(ad)) continue;        // döngü değişkeni
    if (/^_i\d+$/.test(ad)) continue;
    disBagimlilik.add(ad);
  }
}

/** Metindeki her `{{ }}` bloğunun içeriğini bağımlılık olarak toplar. */
function metinBagimliliklari(ham) {
  for (const m of ham.matchAll(/\{\{\s*([\s\S]*?)\s*\}\}/g)) bagimlilikTopla(m[1]);
}

function uret(dugum, girinti) {
  const bosluk = '  '.repeat(girinti);

  if (dugum.tip === 'metin') {
    const s = dugum.deger;
    if (!s.trim()) return '';
    metinBagimliliklari(s);
    return bosluk + metin(s.replace(/\s+/g, ' ')).trim();
  }

  const nit = new Map(dugum.nitelikler.map(([a, d]) => [a.toLowerCase(), d]));

  // <sc-if value="{{ x }}"> → {x && (<>…</>)}
  if (dugum.ad === 'sc-if') {
    const kosul = tekIfade(nit.get('value') ?? 'true');
    bagimlilikTopla(kosul);
    const govde = cocuklariUret(dugum, girinti + 1);
    return `${bosluk}{${kosul} ? (\n${bosluk}  <>\n${govde}\n${bosluk}  </>\n${bosluk}) : null}`;
  }

  // <sc-for list="{{ xs }}" as="y"> → {xs.map((y, i) => …)}
  if (dugum.ad === 'sc-for') {
    const liste = tekIfade(nit.get('list') ?? '[]');
    bagimlilikTopla(liste);
    const ad = nit.get('as') || 'x';
    const i = `_i${sayac++}`;
    kapsam.push(ad);                                  // döngü içinde `ad` yereldir
    const govde = cocuklariUret(dugum, girinti + 2);
    kapsam.pop();
    return `${bosluk}{(${liste} ?? []).map((${ad}: any, ${i}: number) => (\n` +
           `${bosluk}  <Fragment key={${ad}?.key ?? ${i}}>\n${govde}\n${bosluk}  </Fragment>\n` +
           `${bosluk}))}`;
  }

  const etiket = dugum.ad;
  // Stil dışındaki nitelikler ve stil içindeki `{{ }}` ifadeleri bağımlılıktır;
  // stil nesnesinin CSS anahtarları değildir.
  for (const [a, d] of dugum.nitelikler) {
    if (a.startsWith('hint-') || d === null) continue;
    metinBagimliliklari(d);
  }
  const nitMetni = dugum.nitelikler
    .filter(([a]) => !a.startsWith('hint-'))
    .map(([a, d]) => nitelik(a, d))
    .join(' ');
  const bas = nitMetni ? `<${etiket} ${nitMetni}` : `<${etiket}`;

  if (VOID.has(etiket.toLowerCase()) || dugum.cocuklar.length === 0) {
    return `${bosluk}${bas} />`;
  }
  const govde = cocuklariUret(dugum, girinti + 1);
  return `${bosluk}${bas}>\n${govde}\n${bosluk}</${etiket}>`;
}

function cocuklariUret(dugum, girinti) {
  return dugum.cocuklar.map((c) => uret(c, girinti)).filter(Boolean).join('\n');
}

function tekIfade(deger) {
  const m = /^\s*\{\{\s*([\s\S]*?)\s*\}\}\s*$/.exec(deger ?? '');
  return m ? m[1].trim() : (deger ?? 'null');
}

// --- Sürücü -------------------------------------------------------------

function bilesenAdi(dosya) {
  return basename(dosya, '.dc.html')
    .replace(/[^A-Za-zÇĞİÖŞÜçğıöşü0-9]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/[ÇĞİÖŞÜçğıöşü]/g, (c) => ({ Ç: 'C', Ğ: 'G', İ: 'I', Ö: 'O', Ş: 'S', Ü: 'U', ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' }[c]))
    .replace(/^(.)/, (c) => c.toUpperCase());
}

function cevir(yol) {
  const ham = readFileSync(yol, 'utf8');

  const bas = ham.indexOf('<x-dc>');
  const bit = ham.lastIndexOf('</x-dc>');
  if (bas < 0 || bit < 0) throw new Error(`<x-dc> bloğu bulunamadı: ${yol}`);

  let govde = ham.slice(bas + '<x-dc>'.length, bit);
  govde = govde.replace(/<helmet>[\s\S]*?<\/helmet>/g, '');           // <link> etiketleri index.html'e taşınır
  govde = govde.replace(/<script[\s\S]*?<\/script>/g, '');

  const betikler = [...ham.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);

  sayac = 0;
  disBagimlilik = new Set();
  kapsam = [];
  const agac = ayrıstır(govde);
  const jsx = cocuklariUret(agac, 2);
  const ad = bilesenAdi(yol);
  const props = [...disBagimlilik].sort();

  const cikti = `// ÜRETİLEN DOSYA — elle düzenleme. Kaynak: design/${basename(yol)}
// Yeniden üret: npm run port
//
// Inline stiller tasarımdan birebir taşındı. Görsel fark olmaması için
// bu dosyadaki stil değerlerini değiştirme; değişiklik gerekiyorsa
// tasarım dosyasını güncelleyip dönüştürücüyü tekrar çalıştır.
/* eslint-disable */
import { Fragment } from 'react';
import type { ${ad}Props } from '../tipler';

export function ${ad}(p: ${ad}Props) {
  const {
${props.map((d) => `    ${d},`).join('\n')}
  } = p;

  return (
    <>
${jsx}
    </>
  );
}
`;

  mkdirSync(HEDEF, { recursive: true });
  const hedefYol = join(HEDEF, `${ad}.tsx`);
  writeFileSync(hedefYol, cikti, 'utf8');

  // Şablonun beklediği değerler ayrı bir dosyaya not edilir: el ile
  // yazılacak view-model'in sözleşmesi budur.
  writeFileSync(join(HEDEF, `${ad}.sozlesme.ts`),
    `// ÜRETİLEN DOSYA — npm run port ile yenilenir. Kaynak: design/${basename(yol)}\n` +
    `// ${ad} şablonunun props olarak beklediği ${props.length} değer.\n` +
    `// Gerçek tipleri src/web/tipler.ts içinde elle daraltılır.\n\n` +
    `export interface ${ad}Ham {\n` +
    props.map((d) => `  ${d}: unknown;`).join('\n') + '\n}\n', 'utf8');

  return { ad, hedefYol, uzunluk: cikti.length, props };
}


// "Veli Panosu Tasarim" ve "Veli Panosu Prototip" tasarım tuvalleridir —
// tüm ekranları yan yana dizen sunum dosyaları, uygulama ekranı değil.
// Sadece gerçek ekranları taşıyoruz.
const UYGULAMA_EKRANLARI = ['Pano.dc.html', 'HesapEkranlari.dc.html'];

const girdiler = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync(KAYNAK)
      .filter((f) => UYGULAMA_EKRANLARI.includes(f))
      .map((f) => join(KAYNAK, f));

console.log(`Dönüştürülüyor: ${girdiler.length} dosya\n`);
for (const g of girdiler) {
  try {
    const r = cevir(g);
    console.log(`  ✓ ${basename(g)} → ${r.ad}.tsx  (${r.uzunluk} ch, ${r.props.length} prop)`);
  } catch (e) {
    console.error(`  ✗ ${basename(g)}: ${e.message}`);
    process.exitCode = 1;
  }
}
