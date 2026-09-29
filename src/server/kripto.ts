// Refresh token şifreleme ve token özetleme.
//
// Neden: bu uygulama başka ailelerin çocuklarına ait Google refresh token'ları
// tutuyor. Bu token'lar Classroom verisine kalıcı erişim anahtarıdır; veri
// deposunda düz metin durmaları kabul edilemez.
//
// Tasarım:
//   - AES-256-GCM, ana anahtar ortam değişkeninden (veri deposunda değil).
//   - Her şifreleme için yeni rastgele IV.
//   - AAD olarak çocuk kimliği bağlanır: şifreli metin bir çocuktan diğerine
//     taşınamaz. Depoya yazma yetkisi ele geçse bile token takası çalışmaz.
//   - Biçim sürümlenmiş: ileride algoritma değişirse eski kayıtlar okunabilir.

import {
  randomBytes, createCipheriv, createDecipheriv,
  createHash, createHmac, randomUUID, timingSafeEqual,
} from 'node:crypto';

const SURUM = 'v1';
const ALGORITMA = 'aes-256-gcm';
const IV_UZUNLUK = 12;      // GCM için önerilen
const ETIKET_UZUNLUK = 16;

/** Ortam değişkeninden 32 baytlık ana anahtarı okur. */
function anaAnahtar(): Buffer {
  const ham = process.env.ANA_ANAHTAR;
  if (!ham) {
    throw new Error(
      'ANA_ANAHTAR ortam değişkeni tanımlı değil. ' +
      '`node scripts/anahtar-uret.mjs` ile üretip Netlify ortam değişkenlerine ekleyin.',
    );
  }
  const anahtar = Buffer.from(ham, 'base64');
  if (anahtar.length !== 32) {
    throw new Error(`ANA_ANAHTAR 32 bayt olmalı, ${anahtar.length} bayt geldi.`);
  }
  return anahtar;
}

/**
 * Refresh token'ı şifreler.
 *
 * @param token  Google refresh token (düz metin)
 * @param cocukId  AAD olarak bağlanır; çözerken aynısı verilmelidir
 * @returns `v1.<iv>.<etiket>.<sifreli>` biçiminde base64url parçalar
 */
export function tokenSifrele(token: string, cocukId: string): string {
  const iv = randomBytes(IV_UZUNLUK);
  const sifre = createCipheriv(ALGORITMA, anaAnahtar(), iv);
  sifre.setAAD(Buffer.from(cocukId, 'utf8'));

  const govde = Buffer.concat([sifre.update(token, 'utf8'), sifre.final()]);
  const etiket = sifre.getAuthTag();

  return [SURUM, b64(iv), b64(etiket), b64(govde)].join('.');
}

/**
 * Şifreli token'ı çözer.
 *
 * Kimlik doğrulama etiketi tutmazsa hata fırlatır — bozulmuş ya da başka bir
 * çocuğa ait bir kayıt sessizce kabul edilmez.
 */
export function tokenCoz(sifreli: string, cocukId: string): string {
  const parcalar = sifreli.split('.');
  if (parcalar.length !== 4 || parcalar[0] !== SURUM) {
    throw new Error(`Tanınmayan token biçimi: ${parcalar[0] ?? '(boş)'}`);
  }
  const [, ivB64, etiketB64, govdeB64] = parcalar as [string, string, string, string];

  const iv = deB64(ivB64);
  const etiket = deB64(etiketB64);
  if (iv.length !== IV_UZUNLUK) throw new Error('Geçersiz IV uzunluğu');
  if (etiket.length !== ETIKET_UZUNLUK) throw new Error('Geçersiz etiket uzunluğu');

  const coz = createDecipheriv(ALGORITMA, anaAnahtar(), iv);
  coz.setAAD(Buffer.from(cocukId, 'utf8'));
  coz.setAuthTag(etiket);

  return Buffer.concat([coz.update(deB64(govdeB64)), coz.final()]).toString('utf8');
}

// --- Tek kullanımlık biletler --------------------------------------------

/**
 * Giriş / davet bağlantıları için tahmin edilemez bir belirteç üretir.
 * 32 bayt entropi — kaba kuvvetle bulunamaz.
 */
export function biletUret(): string {
  return b64(randomBytes(32));
}

/**
 * Belirteci depoda saklanacak özete çevirir.
 *
 * Belirtecin kendisi asla saklanmaz: veri deposu okunsa bile oradaki
 * özetlerden çalışan bir giriş bağlantısı üretilemez.
 */
export function biletOzeti(bilet: string): string {
  return createHash('sha256').update(bilet, 'utf8').digest('base64url');
}

/** E-postayı arama anahtarına çevirir; adres düz metin olarak anahtara girmez. */
export function epostaAnahtari(eposta: string): string {
  return createHash('sha256')
    .update(eposta.trim().toLocaleLowerCase('tr'), 'utf8')
    .digest('base64url');
}

/** Sabit zamanlı string karşılaştırma — parola/belirteç kontrolü için. */
export function esitMi(a: string, b: string): boolean {
  const ab = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function kimlikUret(): string {
  return randomUUID();
}

// --- Oturum imzası -------------------------------------------------------

/**
 * Oturum çerezi imzalar: `<gövde>.<imza>`.
 * Gövde base64url JSON; imza HMAC-SHA256.
 */
export function oturumImzala(veri: object): string {
  const govde = Buffer.from(JSON.stringify(veri), 'utf8').toString('base64url');
  return `${govde}.${hmac(govde)}`;
}

/** İmzayı doğrular ve gövdeyi çözer; bozuksa null döner. */
export function oturumCoz<T>(cerez: string | null | undefined): T | null {
  if (!cerez) return null;
  const ayrac = cerez.lastIndexOf('.');
  if (ayrac < 1) return null;

  const govde = cerez.slice(0, ayrac);
  const imza = cerez.slice(ayrac + 1);
  if (!esitMi(imza, hmac(govde))) return null;

  try {
    return JSON.parse(Buffer.from(govde, 'base64url').toString('utf8')) as T;
  } catch {
    return null;
  }
}

function hmac(govde: string): string {
  const gizli = process.env.OTURUM_GIZLI;
  if (!gizli) throw new Error('OTURUM_GIZLI ortam değişkeni tanımlı değil.');
  // Gerçek HMAC kullanılıyor; `hash(gizli + veri)` biçimi SHA-256'da uzunluk
  // uzatma saldırısına açıktır ve imza sahteciliğine izin verir.
  return createHmac('sha256', gizli).update(govde, 'utf8').digest('base64url');
}

// --- Küçük yardımcılar ---------------------------------------------------

const b64 = (b: Buffer): string => b.toString('base64url');
const deB64 = (s: string): Buffer => Buffer.from(s, 'base64url');
