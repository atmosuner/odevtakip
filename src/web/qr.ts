// QR kod üretimi.
//
// Tasarım 25×25'lik bir ızgara çiziyor ama gerçek davet adresi oraya sığmıyor:
// 93 karakterlik bir URL, en düşük hata düzeltme düzeyinde bile 37×37 modül
// gerektiriyor. (25×25 = sürüm 2, bayt kipinde 32 bayt taşır.)
//
// Çözüm modül sayısını artırıp modül boyutunu küçültmek: 37 × 4px = 148px,
// tasarımın 25 × 6px = 150px kutusuyla neredeyse aynı yer kaplıyor. Görsel
// ölçü korunuyor, kod okunabilir oluyor.
//
// Renkler tema değişkenlerinden ALINMAZ. Koyu temada mürekkep açık renge
// döner ve kod okunamaz hâle gelir; tarayıcılar yüksek kontrast ister.
// Tasarımcı da bunu düşünmüş: QR düğmesinin arka planı sabit beyaz.

import qrUret from 'qrcode-generator';
import type { QrHucresi } from './tipler';

/** Koyu modül rengi — temadan bağımsız. */
const KOYU = '#000';
/** Açık modül: düğmenin beyaz zemini görünsün. */
const ACIK = 'transparent';

/** Bir modülün kenar uzunluğu, CSS piksel. 4px altına inme: taranamaz olur. */
const MODUL_PX = 4;

export interface QrSonucu {
  hucreler: QrHucresi[];
  /** Kenardaki modül sayısı; CSS ızgarası buna göre kurulur. */
  modulSayisi: number;
  /** Izgara için modül boyutu, `4px` gibi. */
  modulBoyutu: string;
}

/**
 * Adresi QR hücrelerine çevirir.
 *
 * Hata düzeltme düzeyi `L`: en küçük modül sayısını verir. Ekranda
 * gösterilen, yıpranmayan bir kod için daha yüksek düzey gereksiz —
 * her düzey artışı modül sayısını büyütür ve modülleri küçültür.
 */
export function qrHucreleri(adres: string): QrSonucu {
  const qr = qrUret(0, 'L');     // 0 = sürümü içeriğe göre seç
  qr.addData(adres);
  qr.make();

  const n = qr.getModuleCount();
  const hucreler: QrHucresi[] = new Array(n * n);

  for (let satir = 0; satir < n; satir++) {
    for (let sutun = 0; sutun < n; sutun++) {
      hucreler[satir * n + sutun] = { r: qr.isDark(satir, sutun) ? KOYU : ACIK };
    }
  }

  return { hucreler, modulSayisi: n, modulBoyutu: `${MODUL_PX}px` };
}

/**
 * Izgarayı besleyen CSS değişkenleri.
 *
 * `temel.css` bunları okuyor; üretilen bileşendeki sabit `repeat(25,6px)`
 * değerini oradan eziyoruz. Değişkenler tanımsızsa tasarımın kendi
 * değerleri geçerli kalır.
 */
export function qrDegiskenleri(sonuc: QrSonucu): Record<string, string> {
  return {
    '--qr-modul': String(sonuc.modulSayisi),
    '--qr-boyut': sonuc.modulBoyutu,
  };
}
