// Netlify Blobs üzerine ince depolama katmanı.
//
// İki tuzak burada kapatılıyor:
//
// 1. Blobs varsayılan olarak *eventual consistency* kullanır; güncellemeler
//    edge'e 60 saniyeye kadar gecikmeyle yayılır. Oku-değiştir-yaz yapan her
//    yol `consistency: 'strong'` ile okumalı, yoksa bayat veri üstüne yazılır.
//
// 2. Blobs'ta işlem (transaction) yok. Çakışma `onlyIfMatch` ile etag
//    karşılaştırmasıyla yakalanır; yazma reddedilirse çağıran yeniden dener.

import { getStore, type Store } from '@netlify/blobs';
import {
  SEMA_SURUMU, anahtar,
  type HaneYapisi, type CocukVerisi, type CocukOlaylari,
  type EpostaKaydi, type GirisBileti, type Davet,
} from './sema';

const DEPO_ADI = 'odev-defteri';

let onbellek: Store | null = null;

/** Tek bir depo örneği; Functions içinde kimlik bilgileri otomatik gelir. */
export function depo(): Store {
  onbellek ??= getStore({ name: DEPO_ADI, consistency: 'strong' });
  return onbellek;
}

/** Yazma çakıştığında fırlatılır; çağıran okuyup yeniden denemeli. */
export class CakismaHatasi extends Error {
  constructor(public readonly anahtarAdi: string) {
    super(`Eşzamanlı yazma çakışması: ${anahtarAdi}`);
    this.name = 'CakismaHatasi';
  }
}

/** Etag ile birlikte okunan kayıt. */
export interface Surumlu<T> {
  deger: T;
  etag: string | null;
}

/**
 * JSON kaydı etag'iyle okur.
 *
 * Şema sürümü beklenenden büyükse hata verilir: eski kod yeni veriyi
 * yorumlayıp bozmamalı.
 */
export async function oku<T extends { sema: number }>(
  anahtarAdi: string,
): Promise<Surumlu<T> | null> {
  const sonuc = await depo().getWithMetadata(anahtarAdi, {
    type: 'json',
    consistency: 'strong',
  });
  if (!sonuc || sonuc.data == null) return null;

  const deger = sonuc.data as T;
  if (typeof deger.sema !== 'number') {
    throw new Error(`Şema alanı yok: ${anahtarAdi}`);
  }
  if (deger.sema > SEMA_SURUMU) {
    throw new Error(
      `${anahtarAdi} şema sürümü ${deger.sema}, bu kod en fazla ${SEMA_SURUMU} okuyabilir. ` +
      'Dağıtım eski kalmış olabilir.',
    );
  }
  return { deger, etag: sonuc.etag ?? null };
}

/**
 * JSON kaydı yazar. `etag` verilirse yalnızca kayıt o sürümdeyse yazar.
 *
 * @param etag  `null` → kayıt hiç yoksa yaz (ilk oluşturma)
 *              `string` → yalnızca bu sürümdeyse yaz
 *              `undefined` → koşulsuz yaz (tek yazarlı yollar)
 */
export async function yaz<T extends { sema: number }>(
  anahtarAdi: string,
  deger: T,
  etag?: string | null,
): Promise<void> {
  const secenek =
    etag === undefined ? {}
    : etag === null ? { onlyIfNew: true }
    : { onlyIfMatch: etag };

  const { modified } = await depo().setJSON(anahtarAdi, deger, secenek);
  if (!modified) throw new CakismaHatasi(anahtarAdi);
}

/**
 * Oku-değiştir-yaz döngüsünü çakışmaya karşı yeniden dener.
 *
 * `degistir` saf olmalı: aynı girdiyle tekrar çağrıldığında aynı sonucu
 * üretmeli, çünkü çakışmada baştan çalıştırılır.
 */
export async function guncelle<T extends { sema: number }>(
  anahtarAdi: string,
  degistir: (mevcut: T | null) => T | null,
  denemeSayisi = 3,
): Promise<T | null> {
  for (let deneme = 1; deneme <= denemeSayisi; deneme++) {
    const mevcut = await oku<T>(anahtarAdi);
    const yeni = degistir(mevcut?.deger ?? null);
    if (yeni === null) return null;

    try {
      await yaz(anahtarAdi, yeni, mevcut?.etag ?? null);
      return yeni;
    } catch (e) {
      if (!(e instanceof CakismaHatasi) || deneme === denemeSayisi) throw e;
      // Kısa bekleyip yeniden oku; başka yazar araya girmiş.
      await bekle(40 * deneme);
    }
  }
  throw new CakismaHatasi(anahtarAdi);
}

const bekle = (ms: number) => new Promise((c) => setTimeout(c, ms));

// --- Tip güvenli sarmalayıcılar ------------------------------------------

export const haneYapisi = {
  oku: (haneId: string) => oku<HaneYapisi>(anahtar.haneYapisi(haneId)),
  yaz: (y: HaneYapisi, etag?: string | null) =>
    yaz(anahtar.haneYapisi(y.id), y, etag),
  guncelle: (haneId: string, f: (m: HaneYapisi | null) => HaneYapisi | null) =>
    guncelle<HaneYapisi>(anahtar.haneYapisi(haneId), f),
};

export const cocukVerisi = {
  oku: (haneId: string, cocukId: string) =>
    oku<CocukVerisi>(anahtar.cocukVerisi(haneId, cocukId)),
  /** Sync tek yazardır; koşulsuz yazar. */
  yaz: (haneId: string, v: CocukVerisi) =>
    yaz(anahtar.cocukVerisi(haneId, v.cocukId), v),
};

export const cocukOlaylari = {
  oku: (haneId: string, cocukId: string) =>
    oku<CocukOlaylari>(anahtar.cocukOlaylari(haneId, cocukId)),
  yaz: (haneId: string, o: CocukOlaylari) =>
    yaz(anahtar.cocukOlaylari(haneId, o.cocukId), o),
};

export const epostaKaydi = {
  oku: (epostaAnahtari: string) => oku<EpostaKaydi>(anahtar.eposta(epostaAnahtari)),
  /**
   * Yalnızca kayıt yoksa yazar. Aynı e-postayla iki eşzamanlı kayıt
   * denemesinde ikincisi CakismaHatasi alır — istenen davranış budur,
   * bir e-posta tek ebeveyne bağlanmalı.
   */
  olustur: (epostaAnahtari: string, k: EpostaKaydi) =>
    yaz(anahtar.eposta(epostaAnahtari), k, null),
};

export const girisBileti = {
  oku: (ozet: string) => oku<GirisBileti>(anahtar.giris(ozet)),
  olustur: (ozet: string, b: GirisBileti) => yaz(anahtar.giris(ozet), b, null),
  sil: (ozet: string) => depo().delete(anahtar.giris(ozet)),
};

export const davet = {
  oku: (ozet: string) => oku<Davet>(anahtar.davet(ozet)),
  olustur: (ozet: string, d: Davet) => yaz(anahtar.davet(ozet), d, null),
  sil: (ozet: string) => depo().delete(anahtar.davet(ozet)),
};

// --- Gezinme -------------------------------------------------------------

/**
 * Tüm hane kimliklerini döndürür. Sync bunu kullanarak fan-out yapar.
 *
 * `directories: true` ile `hane/` altındaki alt dizin adları alınır; bu
 * adlar hane kimlikleridir. Tüm anahtarları listelemekten çok daha ucuz.
 */
export async function haneKimlikleri(): Promise<string[]> {
  const { directories } = await depo().list({
    prefix: anahtar.haneOneki,
    directories: true,
  });
  return directories.map((d) => d.slice(anahtar.haneOneki.length)).filter(Boolean);
}
