// Bir hanenin çocuklarını tarar ve sonucu yazar.
//
// Cron yok: tarama veli panoyu açtığında ya da elle tazelediğinde çalışır.
// Bu yüzden iki şey önemli:
//   - Hızlı olmalı (veli bekliyor) → çocuklar paralel taranır.
//   - Sık çağrılabilir olmalı → çocuk başına asgari aralık uygulanır.

import { tumunuTara } from './classroom';
import {
  erisimBelirteciYenile, YenidenIzinGerekli, GeciciGoogleHatasi,
} from './google';
import { tokenCoz } from './kripto';
import { cocukVerisi, cocukOlaylari, haneYapisi } from './db';
import { veriyiBirlestir, olaylariCikar, olaylariBirlestir } from './birlestir';
import { SEMA_SURUMU, type Cocuk, type HaneYapisi } from './sema';

/**
 * Aynı çocuk için iki tarama arasındaki asgari süre.
 *
 * Amacı iki yönlü: dış API'yi dövmemek ve iki velinin aynı anda pano açması
 * durumunda ikinci taramayı gereksiz yere yapmamak.
 */
export const ASGARI_ARALIK_MS = 60_000;

export type CocukSonucu =
  | { cocukId: string; durum: 'tarandi'; odevSayisi: number }
  | { cocukId: string; durum: 'atlandi'; sebep: 'cok-erken' | 'bagli-degil' }
  | { cocukId: string; durum: 'izin-gerekli'; sebep: string }
  | { cocukId: string; durum: 'hata'; sebep: string };

export interface TaramaSonucu {
  cocuklar: CocukSonucu[];
  /** En az bir çocuk gerçekten tarandıysa true. */
  degistiMi: boolean;
}

/**
 * Hanenin tüm bağlı çocuklarını tarar.
 *
 * Bir çocuğun hatası diğerlerini durdurmaz: bağlantısı kopan çocuk
 * işaretlenir, diğerlerinin verisi güncellenmeye devam eder.
 */
export async function haneyiTara(
  hane: HaneYapisi,
  simdiUtc: number = Date.now(),
  zorla = false,
): Promise<TaramaSonucu> {
  const sonuclar = await Promise.all(
    hane.cocuklar.map((c) => cocuguTara(hane.id, c, simdiUtc, zorla)),
  );

  // Bağlantı durumu değişen çocukları tek yazmada güncelle.
  const kopanlar = sonuclar.filter((s) => s.durum === 'izin-gerekli');
  const tarananlar = sonuclar.filter((s) => s.durum === 'tarandi');

  if (kopanlar.length || tarananlar.length) {
    await haneYapisi.guncelle(hane.id, (mevcut) => {
      if (!mevcut) return null;
      return {
        ...mevcut,
        cocuklar: mevcut.cocuklar.map((c) => {
          const kopan = kopanlar.find((k) => k.cocukId === c.id);
          if (kopan && kopan.durum === 'izin-gerekli') {
            return {
              ...c,
              baglanti: 'koptu' as const,
              kopmaSebebi: kopan.sebep,
              kopmaUtc: simdiUtc,
            };
          }
          if (tarananlar.some((t) => t.cocukId === c.id)) {
            return {
              ...c,
              baglanti: 'bagli' as const,
              kopmaSebebi: null,
              kopmaUtc: null,
              ilkTaramaUtc: c.ilkTaramaUtc ?? simdiUtc,
              sonTaramaUtc: simdiUtc,
            };
          }
          return c;
        }),
      };
    });
  }

  return {
    cocuklar: sonuclar,
    degistiMi: tarananlar.length > 0,
  };
}

async function cocuguTara(
  haneId: string,
  cocuk: Cocuk,
  simdiUtc: number,
  zorla: boolean,
): Promise<CocukSonucu> {
  if (cocuk.baglanti !== 'bagli' || !cocuk.tokenSifreli) {
    return { cocukId: cocuk.id, durum: 'atlandi', sebep: 'bagli-degil' };
  }

  if (!zorla && cocuk.sonTaramaUtc != null &&
      simdiUtc - cocuk.sonTaramaUtc < ASGARI_ARALIK_MS) {
    return { cocukId: cocuk.id, durum: 'atlandi', sebep: 'cok-erken' };
  }

  try {
    const yenileme = tokenCoz(cocuk.tokenSifreli, cocuk.id);
    const { erisimBelirteci } = await erisimBelirteciYenile(yenileme);

    const tarama = await tumunuTara(erisimBelirteci);

    const onceki = await cocukVerisi.oku(haneId, cocuk.id);
    const yeni = veriyiBirlestir(cocuk.id, tarama, onceki?.deger ?? null, simdiUtc);
    await cocukVerisi.yaz(haneId, yeni);

    const oncekiOlaylar = await cocukOlaylari.oku(haneId, cocuk.id);
    const olaylar = olaylariBirlestir(
      cocuk.id, olaylariCikar(tarama), oncekiOlaylar?.deger ?? null);
    await cocukOlaylari.yaz(haneId, olaylar);

    return { cocukId: cocuk.id, durum: 'tarandi', odevSayisi: yeni.odevler.length };
  } catch (e) {
    if (e instanceof YenidenIzinGerekli) {
      return { cocukId: cocuk.id, durum: 'izin-gerekli', sebep: e.sebep };
    }
    if (e instanceof GeciciGoogleHatasi) {
      // Geçici: bağlantıyı kopuk işaretleme, sonraki tazelemede düzelir.
      console.warn(`[tarama] ${cocuk.id} geçici hata:`, e.message);
      return { cocukId: cocuk.id, durum: 'hata', sebep: e.message };
    }
    console.error(`[tarama] ${cocuk.id} beklenmeyen hata:`, e);
    return { cocukId: cocuk.id, durum: 'hata', sebep: 'beklenmeyen' };
  }
}

/** Yeni eklenen çocuk için boş veri kabuğu. */
export function bosVeri(cocukId: string) {
  return {
    sema: SEMA_SURUMU,
    cocukId,
    dersler: [],
    odevler: [],
    teslimler: [],
    sonTaramaUtc: null,
  };
}
