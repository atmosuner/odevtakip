// Geliştirme verisi — design/Pano.dc.html içindeki VERI dizisinin birebir
// karşılığı. Portun tasarımla aynı görüntüyü ürettiğini karşılaştırabilmek
// için aynı içerik, aynı sıra, aynı tarihler kullanılıyor.
//
// Üretimde kullanılmaz; yalnızca `npm run dev` ve görsel doğrulama içindir.

import { trGunBasiUtc } from '../model';
import type { Cocuk, OdevGorunumu, PanoVerisi } from './tipler';

/** Tasarımın referans aldığı "bugün" ve takip başlangıcı. */
export const ORNEK_BUGUN = trGunBasiUtc('2026-09-29') + 9 * 3_600_000;   // 29 Eylül 09:00 TR
export const ORNEK_ILK_TARAMA = trGunBasiUtc('2026-09-08') + 9 * 3_600_000;

const CL = 'https://classroom.google.com/';

/** Gün ortasına sabitlenir; hangi takvim hücresine düştüğü kesinleşsin. */
const gun = (g: string): number => trGunBasiUtc(g) + 12 * 3_600_000;

type Ham = [ders: string, baslik: string, gorunum: OdevGorunumu['gorunum'],
  tarih: string | null, puan?: number];

let sayac = 0;
const odevYap = ([ders, baslik, gorunum, tarih, puan]: Ham): OdevGorunumu => ({
  id: `o${++sayac}`,
  dersAdi: ders,
  baslik,
  gorunum,
  sonTeslimUtc: tarih ? gun(tarih) : null,
  puan: puan ?? null,
  enYuksekPuan: 100,
  baglanti: CL,
});

const HAM: { ad: string; sinif: string; odev: Ham[] }[] = [
  {
    ad: 'Ahmet', sinif: '5. sınıf', odev: [
      ['Matematik', 'Kesirlerle Toplama ve Çıkarma - Çalışma Kağıdı 3', 'eksik', '2026-09-27'],
      ['Türkçe', 'Okuduğum Kitabın Tanıtımı (1 sayfa kompozisyon)', 'teslim', '2026-09-25'],
      ['Fen Bilimleri', 'Güneş, Dünya ve Ay - Model Yapımı', 'not', '2026-09-22', 85],
      ['Sosyal Bilgiler', 'İlk Türk Devletleri Kavram Haritası', 'bekliyor', '2026-09-30'],
      ['İngilizce', 'Unit 4 Vocabulary Worksheet', 'eksik', '2026-09-24'],
      ['Din Kültürü ve Ahlak Bilgisi', 'Ramazan Ayı ile İlgili Araştırma', 'bekliyor', null],
      ['Görsel Sanatlar', 'Perspektif Çizim Ödevi', 'teslim', '2026-09-29'],
      ['Matematik', 'Doğal Sayılarla Bölme - Alıştırmalar', 'not', '2026-09-15', 90],
      ['Türkçe', 'Sözcükte Anlam Etkinliği', 'teslim', '2026-09-17'],
      ['İngilizce', 'Unit 3 Reading Questions', 'teslim', '2026-09-10'],
      ['Beden Eğitimi', 'Haftalık Hareket Günlüğü', 'teslim', '2026-09-19'],
    ],
  },
  {
    ad: 'Zeynep', sinif: '8. sınıf', odev: [
      ['Matematik', 'Üslü Sayılar - LGS Deneme Soruları', 'eksik', '2026-09-28'],
      ['Fen Bilimleri', 'Basınç Deneyi Raporu', 'not', '2026-09-23', 92],
      ['T.C. İnkılap Tarihi ve Atatürkçülük', 'Kurtuluş Savaşı Cepheleri - Sunum Hazırlığı', 'bekliyor', '2026-10-02'],
      ['Bilişim Teknolojileri', 'Scratch ile Basit Oyun Projesi', 'teslim', '2026-09-25'],
      ['Türkçe', 'Fiilimsiler Konu Tarama Testi', 'not', '2026-09-16', 78],
      ['İngilizce', 'Friendship - Writing Task', 'teslim', '2026-09-11'],
      ['Din Kültürü ve Ahlak Bilgisi', 'Kader ve Kaza Kavramları Özeti', 'teslim', '2026-09-18'],
    ],
  },
  {
    ad: 'Mehmet Ali', sinif: '3. sınıf', odev: [
      ['Hayat Bilgisi', 'Ailemle Bir Gün - Resimli Anlatım', 'teslim', '2026-09-24'],
      ['Matematik', 'Toplama İşlemi Problemleri', 'bekliyor', '2026-10-01'],
      ['Türkçe', 'Okuma Kayıt Çizelgesi', 'not', '2026-09-18', 100],
    ],
  },
  {
    ad: 'Defne', sinif: '11. sınıf', odev: [
      ['Kimya', 'Mol Kavramı Soru Seti', 'eksik', '2026-09-21'],
      ['Türk Dili ve Edebiyatı', 'Divan Şiiri İnceleme Yazısı', 'eksik', '2026-09-26'],
      ['Fizik', 'Vektörler Çalışma Kağıdı', 'eksik', '2026-09-28'],
      ['Tarih', 'Osmanlı Kuruluş Dönemi Okuma Notları', 'bekliyor', '2026-10-03'],
      ['Biyoloji', 'Hücre Bölünmesi Sunumu', 'not', '2026-09-19', 88],
    ],
  },
];

export const ORNEK_COCUKLAR: Cocuk[] = HAM.map((h, i) => ({
  id: `c${i + 1}`,
  ad: h.ad,
  sinif: h.sinif,
  baglantiKopuk: false,
  odevler: h.odev.map(odevYap),
}));

/** Belirli sayıda çocukla örnek pano verisi üretir. */
export function ornekVeri(
  cocukSayisi = 2,
  uzer: Partial<PanoVerisi> = {},
): PanoVerisi {
  return {
    haneAdi: 'Üner Ailesi',
    cocuklar: ORNEK_COCUKLAR.slice(0, cocukSayisi),
    sonGuncellemeUtc: ORNEK_BUGUN - 12 * 60_000,   // "12 dk önce"
    ilkTaramaUtc: ORNEK_ILK_TARAMA,
    durum: 'normal',
    ...uzer,
  };
}
