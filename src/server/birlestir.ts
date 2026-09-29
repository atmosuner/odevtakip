// API çıktısını kayıtlı veriyle birleştirir.
//
// Saf fonksiyonlar: ağ yok, depo yok. Taramanın en hataya açık kısmı burası
// olduğu için test edilebilir tutuldu.
//
// İki kural birleştirmeyi yönetiyor:
//
//   1. Hiçbir satır silinmez. Classroom'dan kaybolan ödev `silinmeUtc` ile
//      işaretlenir. Silinirse "geçen ay 3 eksik vardı" geçmişi buharlaşır.
//
//   2. Olaylar idempotent yazılır. `submissionHistory` her taramada baştan
//      gelir; `anahtar` alanı sayesinde aynı olay iki kez eklenmez. Kaçırılan
//      bir tarama geçmişi bozmaz.

import { sonTeslimAniUtc } from '../model';
import type { ApiDers, ApiOdev, ApiTeslim, TaramaCiktisi } from './classroom';
import {
  SEMA_SURUMU,
  type CocukVerisi, type CocukOlaylari, type Ders,
  type KayitliOdev, type KayitliTeslim, type Olay,
} from './sema';

/** ISO 8601 zaman damgasını epoch ms'ye çevirir; geçersizse null. */
function zaman(iso: string | undefined): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : t;
}

function dersDonustur(d: ApiDers, simdiUtc: number): Ders {
  return {
    id: d.id,
    ad: d.name,
    bolum: d.section ?? null,
    durum: d.courseState,
    baglanti: d.alternateLink,
    sonGorulmeUtc: simdiUtc,
  };
}

function odevDonustur(
  o: ApiOdev, dersAdi: string, onceki: KayitliOdev | undefined, simdiUtc: number,
): KayitliOdev {
  const son = sonTeslimAniUtc(o.dueDate, o.dueTime);
  return {
    id: o.id,
    dersId: o.courseId,
    dersAdi,
    baslik: o.title,
    tur: (o.workType as KayitliOdev['tur']) ?? 'ASSIGNMENT',
    durum: (o.state as KayitliOdev['durum']) ?? 'PUBLISHED',
    sonTeslimUtc: son?.utc ?? null,
    sadeceGun: son?.sadeceGun ?? false,
    enYuksekPuan: o.maxPoints ?? null,
    baglanti: o.alternateLink,
    olusturmaUtc: zaman(o.creationTime),
    guncellemeUtc: zaman(o.updateTime),
    ilkGorulmeUtc: onceki?.ilkGorulmeUtc ?? simdiUtc,
    sonGorulmeUtc: simdiUtc,
    // Kaybolmuş bir ödev geri gelirse silinme işareti kalkar.
    silinmeUtc: null,
  };
}

/** `stateHistory` içinde TURNED_IN geçmiş mi. */
function teslimEdilmisMi(t: ApiTeslim): boolean {
  return (t.submissionHistory ?? []).some(
    (g) => g.stateHistory?.state === 'TURNED_IN');
}

function teslimDonustur(t: ApiTeslim, simdiUtc: number): KayitliTeslim {
  return {
    id: t.id,
    odevId: t.courseWorkId,
    durum: (t.state as KayitliTeslim['durum']) ?? 'NEW',
    gecKaydi: t.late === true,
    verilenPuan: t.assignedGrade ?? null,
    teslimEdildiMi: teslimEdilmisMi(t),
    guncellemeUtc: zaman(t.updateTime),
    sonGorulmeUtc: simdiUtc,
  };
}

/**
 * Taramadan gelen veriyi kayıtlı veriyle birleştirir.
 *
 * @param onceki  Önceki tarama çıktısı; ilk taramada null.
 */
export function veriyiBirlestir(
  cocukId: string,
  tarama: TaramaCiktisi,
  onceki: CocukVerisi | null,
  simdiUtc: number,
): CocukVerisi {
  const oncekiOdevler = new Map((onceki?.odevler ?? []).map((o) => [o.id, o]));

  const dersler = tarama.dersler.map((d) => dersDonustur(d, simdiUtc));
  const dersAdi = new Map(dersler.map((d) => [d.id, d.ad]));

  const odevler: KayitliOdev[] = [];
  const gorulen = new Set<string>();
  for (const [dersId, liste] of tarama.odevler) {
    for (const o of liste) {
      odevler.push(odevDonustur(o, dersAdi.get(dersId) ?? '', oncekiOdevler.get(o.id), simdiUtc));
      gorulen.add(o.id);
    }
  }

  // Bu taramada görülmeyen eski ödevler: silinmiş say, ama sakla.
  for (const eski of oncekiOdevler.values()) {
    if (gorulen.has(eski.id)) continue;
    odevler.push({ ...eski, silinmeUtc: eski.silinmeUtc ?? simdiUtc });
  }

  const teslimler: KayitliTeslim[] = [];
  const gorulenTeslim = new Set<string>();
  for (const liste of tarama.teslimler.values()) {
    for (const t of liste) {
      teslimler.push(teslimDonustur(t, simdiUtc));
      gorulenTeslim.add(t.id);
    }
  }
  // Teslimi kaybolan ödev de olabilir (ödev silindiyse); kaydı koru.
  for (const eski of onceki?.teslimler ?? []) {
    if (!gorulenTeslim.has(eski.id)) teslimler.push(eski);
  }

  return {
    sema: SEMA_SURUMU,
    cocukId,
    dersler,
    odevler,
    teslimler,
    sonTaramaUtc: simdiUtc,
  };
}

/**
 * `submissionHistory`'den olayları çıkarır.
 *
 * Classroom geçmişi zaman damgalı verdiği için trend hesabı için kendi
 * anlık görüntümüzü biriktirmemiz gerekmiyor — ilk taramada aylarca
 * geriye dönük veri birden dolar.
 */
export function olaylariCikar(tarama: TaramaCiktisi): Olay[] {
  const cikti: Olay[] = [];

  for (const liste of tarama.teslimler.values()) {
    for (const t of liste) {
      for (const g of t.submissionHistory ?? []) {
        if (g.stateHistory) {
          const zamanUtc = zaman(g.stateHistory.stateTimestamp);
          const durum = g.stateHistory.state ?? null;
          if (zamanUtc == null || durum == null) continue;
          cikti.push({
            anahtar: `${t.id}|durum|${zamanUtc}|${durum}`,
            teslimId: t.id, odevId: t.courseWorkId,
            tur: 'durum', zamanUtc, durum,
            puan: null, enYuksekPuan: null,
            aktorId: g.stateHistory.actorUserId ?? null,
          });
        }
        if (g.gradeHistory) {
          const zamanUtc = zaman(g.gradeHistory.gradeTimestamp);
          if (zamanUtc == null) continue;
          const puan = g.gradeHistory.pointsEarned ?? null;
          cikti.push({
            anahtar: `${t.id}|puan|${zamanUtc}|${puan ?? ''}`,
            teslimId: t.id, odevId: t.courseWorkId,
            tur: 'puan', zamanUtc, durum: null,
            puan, enYuksekPuan: g.gradeHistory.maxPoints ?? null,
            aktorId: g.gradeHistory.actorUserId ?? null,
          });
        }
      }
    }
  }
  return cikti;
}

/**
 * Olayları kayıtlılarla birleştirir; `anahtar` çakışanlar atlanır.
 * Aynı taramanın iki kez çalışması veriyi değiştirmez.
 */
export function olaylariBirlestir(
  cocukId: string, yeni: Olay[], onceki: CocukOlaylari | null,
): CocukOlaylari {
  const hepsi = new Map((onceki?.olaylar ?? []).map((o) => [o.anahtar, o]));
  for (const o of yeni) if (!hepsi.has(o.anahtar)) hepsi.set(o.anahtar, o);

  return {
    sema: SEMA_SURUMU,
    cocukId,
    olaylar: [...hepsi.values()].sort((a, b) => a.zamanUtc - b.zamanUtc),
  };
}
