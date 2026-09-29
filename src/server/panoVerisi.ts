// Depodaki kayıtları panonun beklediği `PanoVerisi` şekline çevirir.
//
// Durum türetme burada yapılıyor (sunucuda), istemcide değil: "eksik" kararı
// tek bir yerde verilmeli ki pano ile ileride eklenecek bildirim aynı cevabı
// versin.

import { gorunum } from '../model';
import { cocukVerisi } from './db';
import type { HaneYapisi, KayitliOdev, KayitliTeslim } from './sema';
import type { Cocuk as PanoCocuk, OdevGorunumu, PanoVerisi } from '../web/tipler';

/** Veri bu süreden eskiyse pano "eski" durumuna geçer. */
export const ESKI_ESIGI_MS = 2 * 3_600_000;

export async function panoVerisiYap(
  hane: HaneYapisi,
  simdiUtc: number = Date.now(),
): Promise<PanoVerisi> {
  const cocuklar: PanoCocuk[] = [];
  let enEskiTarama: number | null = null;
  let enEskiIlkTarama: number | null = null;

  for (const c of hane.cocuklar) {
    const kayit = await cocukVerisi.oku(hane.id, c.id);
    const veri = kayit?.deger;

    const teslimler = new Map<string, KayitliTeslim>(
      (veri?.teslimler ?? []).map((t) => [t.odevId, t]));

    const odevler: OdevGorunumu[] = (veri?.odevler ?? [])
      .filter(gosterilirMi)
      .map((o) => odevGorunumuYap(o, teslimler.get(o.id), simdiUtc));

    cocuklar.push({
      id: c.id,
      ad: c.ad,
      sinif: c.sinif,
      baglantiKopuk: c.baglanti === 'koptu',
      odevler,
    });

    if (c.sonTaramaUtc != null) {
      enEskiTarama = enEskiTarama == null
        ? c.sonTaramaUtc : Math.min(enEskiTarama, c.sonTaramaUtc);
    }
    if (c.ilkTaramaUtc != null) {
      enEskiIlkTarama = enEskiIlkTarama == null
        ? c.ilkTaramaUtc : Math.min(enEskiIlkTarama, c.ilkTaramaUtc);
    }
  }

  return {
    haneAdi: hane.ad,
    cocuklar,
    // Hanenin tazeliği en eski taramaya göre: bir çocuğun verisi bayatsa
    // pano taze görünmemeli.
    sonGuncellemeUtc: enEskiTarama,
    ilkTaramaUtc: enEskiIlkTarama,
    durum: durumBelirle(hane, enEskiTarama, simdiUtc),
  };
}

/**
 * Taslak ve silinmiş ödevler panoda görünmez.
 *
 * Silinmiş ödev kaydı geçmiş için saklanıyor ama güncel listede yer almamalı:
 * öğretmenin kaldırdığı bir ödev "eksik" olarak sayılmamalı.
 */
function gosterilirMi(o: KayitliOdev): boolean {
  return o.durum === 'PUBLISHED' && o.silinmeUtc == null;
}

function odevGorunumuYap(
  o: KayitliOdev, t: KayitliTeslim | undefined, simdiUtc: number,
): OdevGorunumu {
  return {
    id: o.id,
    dersAdi: o.dersAdi,
    baslik: o.baslik,
    gorunum: gorunum(
      {
        id: o.id, dersId: o.dersId, dersAdi: o.dersAdi, baslik: o.baslik,
        tur: o.tur, durum: o.durum, sonTeslimUtc: o.sonTeslimUtc,
        sadeceGun: o.sadeceGun, enYuksekPuan: o.enYuksekPuan,
        baglanti: o.baglanti, silindiMi: o.silinmeUtc != null,
      },
      t && {
        id: t.id, odevId: t.odevId, durum: t.durum, gecKaydi: t.gecKaydi,
        verilenPuan: t.verilenPuan, teslimEdildiMi: t.teslimEdildiMi,
      },
      simdiUtc,
    ),
    sonTeslimUtc: o.sonTeslimUtc,
    puan: t?.verilenPuan ?? null,
    enYuksekPuan: o.enYuksekPuan,
    baglanti: o.baglanti,
  };
}

function durumBelirle(
  hane: HaneYapisi, enEskiTarama: number | null, simdiUtc: number,
): PanoVerisi['durum'] {
  if (hane.cocuklar.length === 0) return 'cocuk-yok';

  const bagliVar = hane.cocuklar.some((c) => c.baglanti === 'bagli');
  if (!bagliVar && hane.cocuklar.every((c) => c.baglanti === 'bekliyor')) {
    return 'cocuk-yok';
  }
  if (enEskiTarama == null) return 'veri-yok';
  if (simdiUtc - enEskiTarama > ESKI_ESIGI_MS) return 'eski';
  return 'normal';
}
