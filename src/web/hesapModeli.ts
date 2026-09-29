// HesapEkranlari bileşeninin proplarını üretir.
//
// Bileşen tek dosyada on beş ekran barındırıyor; hangisinin görüneceğini
// `e` bayrak nesnesi, geçişleri `git` nesnesi belirliyor. Tasarımın kendi
// yapısı bu — port ederken korundu.

import { useCallback, useMemo, useState } from 'react';
import { qrHucreleri } from './qr';
import { tamlayan } from './panoModeli';
import type {
  HesapEkrani, EkranBayraklari, EkranGecisleri,
  HesapEkranlariProps, AdimNoktasi, QrHucresi,
} from './tipler';

const EKRANLAR: readonly HesapEkrani[] = [
  'ikon', 'acilis', 'giris', 'eposta', 'gecersiz',
  'kurulum1', 'kurulum2', 'bagla', 'izin', 'basari', 'hata',
  'kurulum3', 'ayarlar', 'kaldir', 'pano',
] as const;

export interface HesapFormu {
  eposta: string;
  hane: string;
  cocuk: string;
  davet: string;
}

/** Ekran bayrakları: yalnızca aktif olan true. */
function bayraklar(aktif: HesapEkrani): EkranBayraklari {
  const e = {} as EkranBayraklari;
  for (const k of EKRANLAR) e[k] = k === aktif;
  return e;
}

function gecisler(ekranaGit: (e: HesapEkrani) => void): EkranGecisleri {
  const git = {} as EkranGecisleri;
  for (const k of EKRANLAR) git[k] = () => ekranaGit(k);
  return git;
}

/** Kurulum adım göstergesi: hangi ekran kaçıncı adıma denk geliyor. */
function adimNumarasi(e: EkranBayraklari): number {
  if (e.kurulum1) return 1;
  if (e.kurulum2 || e.bagla || e.hata || e.basari) return 2;
  if (e.kurulum3) return 3;
  return 0;
}

/** Ayarlar ekranının beslendiği hane bilgisi; `/api/hane` yanıtının şekli. */
export interface HaneBilgisi {
  ad: string;
  ebeveynler: {
    id: string; ad: string; eposta: string; benMiyim: boolean;
  }[];
  cocuklar: {
    id: string; ad: string; sinif: string;
    baglanti: 'bekliyor' | 'bagli' | 'koptu';
  }[];
}

export interface HesapGirdisi {
  ekran: HesapEkrani;
  form: HesapFormu;
  qr: { hucreler: QrHucresi[]; modulSayisi: number; modulBoyutu: string };
  kopyalandi: boolean;
  /** Ayarlar ekranı için; yüklenmediyse null. */
  hane: HaneBilgisi | null;
  ekranaGit: (ekran: HesapEkrani) => void;
  kopyala: () => void;
  formDegis: (alan: keyof HesapFormu, deger: string) => void;
  haneAdiKaydet: () => void;
  ebeveynCikar: (ebeveynId: string) => void;
  cocukKaldir: (cocukId: string) => void;
  cocukYenidenBagla: (cocukId: string) => void;
}

/**
 * "Bahadır ve Elif" — çocuğun izin ekranında geçen ebeveyn adları.
 * Tek ebeveynde tek ad, ikiden fazlada "A, B ve C".
 */
export function ebeveynAdlariMetni(adlar: readonly string[]): string {
  if (adlar.length === 0) return 'Velileriniz';
  if (adlar.length === 1) return adlar[0]!;
  return adlar.slice(0, -1).join(', ') + ' ve ' + adlar[adlar.length - 1]!;
}

/** Bağlantı durumunun kullanıcıya gösterilen karşılığı. */
function durumMetni(baglanti: 'bekliyor' | 'bagli' | 'koptu'): string {
  switch (baglanti) {
    case 'bekliyor': return 'İzin bekleniyor';
    case 'bagli': return 'Bağlı';
    case 'koptu': return 'Bağlantı koptu';
  }
}

export function hesapProplari(g: HesapGirdisi): HesapEkranlariProps {
  const e = bayraklar(g.ekran);
  const adim = adimNumarasi(e);

  const adimlar: AdimNoktasi[] = [1, 2, 3].map((i) => ({
    renk: i <= adim ? 'var(--murekkep)' : 'var(--cizgi)',
  }));

  // Çocuk adı boşsa yer tutucu: "…ödevlerini okumasına" cümlesi boşlukla
  // başlamasın.
  const cocuk = g.form.cocuk || 'Çocuğunuz';

  const alan = (k: keyof HesapFormu) =>
    (olay: React.ChangeEvent<HTMLInputElement>) => g.formDegis(k, olay.target.value);

  const ebeveynler = (g.hane?.ebeveynler ?? []).map((p) => ({
    harf: basHarf(p.ad || p.eposta),
    ad: p.ad,
    eposta: p.eposta,
    benMiyim: p.benMiyim,
    // Kendini çıkarmak yok; tek ebeveyn kalmışsa da çıkarma gösterilmez.
    cikarGoster: !p.benMiyim && (g.hane?.ebeveynler.length ?? 0) > 1,
    cikar: () => g.ebeveynCikar(p.id),
    cikarAria: `${p.ad || p.eposta} haneden çıkarılsın`,
  }));

  const cocuklar = (g.hane?.cocuklar ?? []).map((c, i) => ({
    harf: basHarf(c.ad),
    ad: c.ad,
    sinif: c.sinif,
    renk: `var(--cocuk-${(i % 6) + 1})`,
    bekliyor: c.baglanti === 'bekliyor',
    bagli: c.baglanti === 'bagli',
    koptu: c.baglanti === 'koptu',
    durumMetin: durumMetni(c.baglanti),
    kaldir: () => g.cocukKaldir(c.id),
    kaldirAria: `${tamlayan(c.ad)} bağlantısını kaldır`,
    yenidenBagla: () => g.cocukYenidenBagla(c.id),
  }));

  return {
    e,
    git: gecisler(g.ekranaGit),

    adim,
    adimlar,
    kurulumUst: adim > 0,
    ayarlarGoster: e.ayarlar || e.kaldir,

    haneAdi: g.hane?.ad || g.form.hane,
    haneAdiDegis: alan('hane'),
    haneAdiKaydet: g.haneAdiKaydet,
    ebeveynler,
    cocuklar,
    ebeveynAdlari: ebeveynAdlariMetni(
      (g.hane?.ebeveynler ?? []).map((p) => ilkAd(p.ad || p.eposta))),

    eposta: g.form.eposta, epostaDegis: alan('eposta'),
    hane: g.form.hane, haneDegis: alan('hane'),
    cocuk, cocukDegis: alan('cocuk'),
    cocukIn: tamlayan(cocuk),
    davet: g.form.davet, davetDegis: alan('davet'),

    qr: g.qr.hucreler,
    qrModul: g.qr.modulSayisi,
    qrBoyut: g.qr.modulBoyutu,
    kopyala: g.kopyala,
    kopyalaMetin: g.kopyalandi ? 'Kopyalandı' : 'Bağlantıyı kopyala',

    /** Ana ekran ikonu önizlemesindeki dolgu kutucukları. */
    bosIkonlar: Array.from({ length: 11 }, (_, i) => i),
  };
}

/** Avatar harfi: "Mehmet Ali" → "MA", "ahmet@x.com" → "A". */
function basHarf(kaynak: string): string {
  const temiz = kaynak.includes('@') ? kaynak.split('@')[0]! : kaynak;
  return temiz.trim().split(/[\s._-]+/).slice(0, 2)
    .map((k) => k.charAt(0).toLocaleUpperCase('tr'))
    .join('') || '?';
}

/** "Bahadır Üner" → "Bahadır"; izin ekranında soyad gereksiz. */
function ilkAd(kaynak: string): string {
  const temiz = kaynak.includes('@') ? kaynak.split('@')[0]! : kaynak;
  return temiz.trim().split(/[\s._-]+/)[0] ?? temiz;
}

/**
 * Hesap ekranlarının yerel durumu.
 *
 * QR yalnızca davet adresi değiştiğinde üretilir; her render'da yeniden
 * hesaplamak 1369 hücrelik bir dizi için gereksiz iş olur.
 */
export function useHesapDurumu() {
  const [davetAdresi, setDavetAdresi] = useState<string | null>(null);
  const [kopyalandi, setKopyalandi] = useState(false);
  const [form, setForm] = useState<HesapFormu>({
    eposta: '', hane: '', cocuk: '', davet: '',
  });

  const formDegis = useCallback((k: keyof HesapFormu, v: string) => {
    setForm((o) => ({ ...o, [k]: v }));
  }, []);

  const qr = useMemo(
    () => davetAdresi ? qrHucreleri(davetAdresi) : null,
    [davetAdresi],
  );

  const kopyala = useCallback(() => {
    if (!davetAdresi) return;
    void navigator.clipboard.writeText(davetAdresi).then(
      () => {
        setKopyalandi(true);
        setTimeout(() => setKopyalandi(false), 2500);
      },
      // Pano izni yoksa sessizce geç; kullanıcı adresi elle seçebilir.
      (e: unknown) => console.warn('[hesap] panoya kopyalanamadı:', e),
    );
  }, [davetAdresi]);

  return {
    form, formDegis,
    davetAdresi, setDavetAdresi,
    kopyalandi, kopyala,
    // Izgara ölçüsü artık bileşenin kendi propu; CSS ezmesine gerek yok.
    qr: qr ?? { hucreler: [], modulSayisi: 25, modulBoyutu: '6px' },
  };
}
