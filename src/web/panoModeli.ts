// Uygulama verisini Pano bileşeninin beklediği proplara çevirir.
//
// Mantık design/Pano.dc.html içindeki view-model'den birebir taşındı; farklar:
//   - Tarih işlemleri src/model.ts'e devredildi (UTC → Europe/Istanbul).
//   - Durum metinleri sabit değil, gerçek zaman damgalarından üretiliyor.
//   - "Takip öncesi" sınırı gerçek ilk tarama anından geliyor.
//
// Saf fonksiyon: React state'i dışarıdan `gorunumDurumu` ile verilir.

import {
  trGunu, trGunBasiUtc, gecikmeGunu, gunNoktasi, takipOncesiMi,
  type Gorunum,
} from '../model';
import type {
  Cocuk, OdevGorunumu, PanoVerisi, PanoEylemleri, PanoProps,
  Hucre, Satir, Kolon, BandCocuk, DockOgesi, Filtre,
} from './tipler';

const AY = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'] as const;
const GUN_ADI = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe',
  'Cuma', 'Cumartesi', 'Pazar'] as const;

const UNLU = 'aeıioöuü';

/** "Zeynep" → "Zeynep'in". Son ünlüye göre ek seçer, ünlüyle biterse kaynaştırır. */
export function tamlayan(ad: string): string {
  const s = ad.toLocaleLowerCase('tr');
  const sonUnlu = [...s].reverse().find((ch) => UNLU.includes(ch));
  const ek: Record<string, string> = {
    a: 'ın', ı: 'ın', e: 'in', i: 'in', o: 'un', u: 'un', ö: 'ün', ü: 'ün',
  };
  const son = ek[sonUnlu ?? ''] ?? 'in';
  return ad + '’' + (UNLU.includes(s.slice(-1)) ? 'n' : '') + son;
}

/** "Mehmet Ali" → "MA", "Ahmet" → "A". */
export function basHarfler(ad: string): string {
  return ad.trim().split(/\s+/).slice(0, 2)
    .map((k) => k.charAt(0).toLocaleUpperCase('tr'))
    .join('');
}

/** Panodaki React state'i. Bileşen dışında tutulur ki model saf kalsın. */
export interface GorunumDurumu {
  seciliCocuk: number;
  /** Gösterilen ay, `{ yil, ay }` (ay 0 tabanlı). Null ise bugünün ayı. */
  gosterilenAy: { yil: number; ay: number } | null;
  /** Seçili gün, `YYYY-MM-DD`. Null ise bugün. */
  seciliGun: string | null;
  /** Eksik panelinde seçili çocuk sırası. Null ise tümü. */
  filtre: number | null;
  sheetAcik: boolean;
  masaustu: boolean;
  /**
   * Tasarımdaki sahte cihaz çubuğunu ("09:41" + pil) gösterir.
   * Tuval süslemesidir, üretimde kapalıdır; yalnızca tasarımla görsel
   * karşılaştırma yaparken açılır. Yerini gerçek güvenli alan payı alır
   * (bkz. temel.css).
   */
  sahteCihazCubugu?: boolean;
}

export interface Eylemler extends PanoEylemleri {
  cocukSec: (i: number) => void;
  gunSec: (gun: string) => void;
  ayKaydir: (yon: -1 | 1) => void;
  filtreSec: (i: number | null) => void;
  sheetAc: () => void;
  sheetKapat: () => void;
  /** Tazelik göstergesine dokunulunca. */
  tazele: () => void;
}

// --- Yardımcılar ---------------------------------------------------------

function gunBasligi(gun: string, bugun: string): string {
  const [y, a, g] = gun.split('-').map(Number) as [number, number, number];
  // Haftanın günü: UTC üzerinden hesaplanır, yerel saat diliminden bağımsız.
  const haftaGunu = (new Date(Date.UTC(y, a - 1, g)).getUTCDay() + 6) % 7;
  return `${g} ${AY[a - 1]} ${GUN_ADI[haftaGunu]}` + (gun === bugun ? ' · Bugün' : '');
}

function kalanMetni(odev: OdevGorunumu, simdiUtc: number): string {
  if (odev.sonTeslimUtc == null) return 'teslim tarihi yok';
  const d = -gunFarki(simdiUtc, odev.sonTeslimUtc);
  if (d === 0) return 'son gün bugün';
  if (d === 1) return 'son gün yarın';
  return `${d} gün var`;
}

/** İki anın Türkiye takvim günleri arasındaki fark (a - b). */
function gunFarki(a: number, b: number): number {
  return Math.round((trGunBasiUtc(trGunu(a)) - trGunBasiUtc(trGunu(b))) / 86_400_000);
}

function etiketMetni(odev: OdevGorunumu, simdiUtc: number): string {
  if (odev.gorunum === 'eksik') {
    return `Teslim edilmedi — ${gecikmeGunu(odev.sonTeslimUtc!, simdiUtc)} gün geçti`;
  }
  if (odev.gorunum === 'bekliyor') return 'Bekliyor — ' + kalanMetni(odev, simdiUtc);
  return odev.gorunum === 'not' ? 'Notlandırıldı' : 'Teslim edildi';
}

function satirYap(
  odev: OdevGorunumu, cocuk: Cocuk, sira: number, renk: string,
  onekVer: boolean, coklu: boolean, simdiUtc: number,
): Satir {
  const etiket = etiketMetni(odev, simdiUtc);
  const puanVar = odev.puan != null;
  const puanMetni = puanVar ? `${odev.puan}/${odev.enYuksekPuan ?? 100}` : '';
  const harf = basHarfler(cocuk.ad);
  return {
    ust: onekVer && coklu ? `${cocuk.ad} · ${odev.dersAdi}` : odev.dersAdi,
    baslik: odev.baslik,
    etiket,
    eksik: odev.gorunum === 'eksik',
    bekliyor: odev.gorunum === 'bekliyor',
    tamam: odev.gorunum === 'teslim' || odev.gorunum === 'not',
    puanVar,
    puan: puanMetni,
    href: odev.baglanti,
    harf,
    renk,
    coklu: onekVer && coklu,
    ci: sira,
    gec: odev.gorunum === 'eksik' && odev.sonTeslimUtc != null
      ? gecikmeGunu(odev.sonTeslimUtc, simdiUtc) : 0,
    aria: `${odev.dersAdi}: ${odev.baslik}. ${etiket}` +
      (puanVar ? `, puan ${puanMetni}` : '') + '. Google Classroom’da açılır.',
  };
}

function tazelik(veri: PanoVerisi, simdiUtc: number): { metin: string; uyari: boolean } {
  if (veri.durum === 'yukleniyor') return { metin: 'Yükleniyor…', uyari: false };

  const yas = veri.sonGuncellemeUtc == null ? null : simdiUtc - veri.sonGuncellemeUtc;
  const saatMetni = veri.sonGuncellemeUtc == null ? '' : new Date(veri.sonGuncellemeUtc)
    .toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' });

  if (veri.durum === 'cevrimdisi') {
    return { metin: `Çevrimdışı · ${saatMetni} verisi gösteriliyor`, uyari: true };
  }
  if (yas == null) return { metin: 'Henüz güncellenmedi', uyari: true };

  const dk = Math.floor(yas / 60_000);
  if (dk >= 120) {
    return { metin: `${Math.floor(dk / 60)} saat önce güncellendi · yenileme gecikti`, uyari: true };
  }
  const metin = dk < 1 ? 'Az önce güncellendi' : `Güncellendi ${dk} dk önce`;
  return { metin, uyari: false };
}

// --- Ana dönüştürücü -----------------------------------------------------

export function panoProplari(
  veri: PanoVerisi,
  durum: GorunumDurumu,
  eylem: Eylemler,
  simdiUtc: number = Date.now(),
): PanoProps {
  const bugun = trGunu(simdiUtc);
  const masa = durum.masaustu;
  const cocukSayisi = veri.cocuklar.length;
  const coklu = cocukSayisi > 1;
  const yukleniyor = veri.durum === 'yukleniyor';
  const cocukYok = veri.durum === 'cocuk-yok' || cocukSayisi === 0;
  const ilkTaramaBekleniyor = veri.durum === 'veri-yok';

  const secili = Math.min(Math.max(0, durum.seciliCocuk), Math.max(0, cocukSayisi - 1));
  const seciliGun = durum.seciliGun ?? bugun;

  const [bugunYil, bugunAy] = [Number(bugun.slice(0, 4)), Number(bugun.slice(5, 7)) - 1];
  const gosterilen = durum.gosterilenAy ?? { yil: bugunYil, ay: bugunAy };

  // Her çocuğa sabit bir renk: dizideki sırasına göre --cocuk-1..6
  const zengin = veri.cocuklar.map((c, i) => ({
    cocuk: c,
    sira: i,
    renk: `var(--cocuk-${(i % 6) + 1})`,
    harf: basHarfler(c.ad),
    eksikler: c.odevler.filter((o) => o.gorunum === 'eksik'),
  }));

  const toplamEksik = zengin.reduce((a, z) => a + z.eksikler.length, 0);

  // --- Takvim sütunu ---
  const kolonYap = (z: typeof zengin[number]): Kolon => {
    const { yil, ay } = gosterilen;
    // Ayın ilk gününün haftadaki yeri (Pazartesi = 0)
    const ilkGunKaydir = (new Date(Date.UTC(yil, ay, 1)).getUTCDay() + 6) % 7;
    const ayGunSayisi = new Date(Date.UTC(yil, ay + 1, 0)).getUTCDate();

    const hucreler: Hucre[] = [];
    for (let i = 0; i < ilkGunKaydir; i++) hucreler.push({ bos: true, dolu: false });

    for (let g = 1; g <= ayGunSayisi; g++) {
      const gun = `${yil}-${String(ay + 1).padStart(2, '0')}-${String(g).padStart(2, '0')}`;
      const oGun = z.cocuk.odevler.filter(
        (o) => o.sonTeslimUtc != null && trGunu(o.sonTeslimUtc) === gun);
      const nokta = gunNoktasi(oGun.map((o) => o.gorunum) as Gorunum[]);
      const buGunMu = gun === bugun;
      const seciliMi = gun === seciliGun;
      const once = takipOncesiMi(gun, veri.ilkTaramaUtc);

      const sayiStil: Hucre['sayiStil'] = {
        width: 36, height: 36, borderRadius: '50%', display: 'grid', placeItems: 'center',
        fontSize: 15, fontVariantNumeric: 'tabular-nums', boxSizing: 'border-box',
        color: once ? 'var(--murekkep-3)' : 'var(--murekkep)',
        fontWeight: buGunMu || seciliMi ? 700 : 450,
      };
      if (buGunMu) sayiStil.border = '1.5px solid var(--murekkep)';
      if (seciliMi) {
        sayiStil.background = 'var(--murekkep)';
        sayiStil.color = 'var(--ters)';
        if (buGunMu) sayiStil.boxShadow = 'inset 0 0 0 2px var(--ters)';
      }

      const durumSozu = nokta === 'eksik' ? ', eksik ödev var'
        : nokta === 'bekliyor' ? ', bekleyen ödev var'
        : nokta === 'tamam' ? ', ödevler teslim edildi' : '';

      hucreler.push({
        bos: false, dolu: true, gun: g,
        eksik: nokta === 'eksik', bekliyor: nokta === 'bekliyor', tamam: nokta === 'tamam',
        secili: seciliMi,
        sec: () => eylem.gunSec(gun),
        stil: {
          minHeight: 50, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 3, padding: 0, border: 'none', borderRadius: 10,
          background: once ? 'var(--tarama)' : 'transparent',
          cursor: 'pointer', fontFamily: 'inherit', color: 'inherit',
        },
        sayiStil,
        aria: `${g} ${AY[ay]}${buGunMu ? ', bugün' : ''}${durumSozu}${once ? ', takip öncesi' : ''}`,
      });
    }

    const takipNotu = takipNotuMetni(gosterilen, veri.ilkTaramaUtc);
    const gunOdev = z.cocuk.odevler
      .filter((o) => o.sonTeslimUtc != null && trGunu(o.sonTeslimUtc) === seciliGun)
      .map((o) => satirYap(o, z.cocuk, z.sira, z.renk, false, coklu, simdiUtc));
    const tarihsiz = z.cocuk.odevler
      .filter((o) => o.sonTeslimUtc == null)
      .map((o) => satirYap(o, z.cocuk, z.sira, z.renk, false, coklu, simdiUtc));

    return {
      ad: z.cocuk.ad, sinif: z.cocuk.sinif, harf: z.harf, renk: z.renk,
      adIn: tamlayan(z.cocuk.ad),
      kopuk: z.cocuk.baglantiKopuk,
      ilkTarama: ilkTaramaBekleniyor,
      baslikGoster: coklu,
      ayBaslik: `${AY[gosterilen.ay]} ${gosterilen.yil}`,
      hucreler, takipNotu, takipVar: takipNotu !== '',
      gunBaslik: gunBasligi(seciliGun, bugun),
      gunOdev,
      gunVar: gunOdev.length > 0 && !ilkTaramaBekleniyor,
      gunBos: gunOdev.length === 0 && !ilkTaramaBekleniyor,
      tarihsiz, tarihsizVar: tarihsiz.length > 0,
    };
  };

  const kolonlar: Kolon[] = cocukYok ? []
    : (masa ? zengin : [zengin[secili]!]).map(kolonYap);

  // --- Eksik ödevler paneli ---
  const tumEksikler = zengin
    .flatMap((z) => z.eksikler.map(
      (o) => satirYap(o, z.cocuk, z.sira, z.renk, true, coklu, simdiUtc)))
    .sort((a, b) => b.gec - a.gec);
  const eksikSatirlar = durum.filtre == null
    ? tumEksikler : tumEksikler.filter((r) => r.ci === durum.filtre);

  const cipStili = (acik: boolean) => ({
    minHeight: 40, padding: '0 14px 0 10px', borderRadius: 20,
    border: '1px solid ' + (acik ? 'var(--murekkep)' : 'var(--cizgi)'),
    background: acik ? 'var(--murekkep)' : 'var(--yuzey)',
    color: acik ? 'var(--ters)' : 'var(--murekkep)',
    font: '600 14px var(--yazi-aile)', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 8,
  });

  const filtreler: Filtre[] = [
    {
      ad: `Tümü · ${toplamEksik}`,
      secili: durum.filtre == null,
      stil: { ...cipStili(durum.filtre == null), paddingLeft: 14 },
      sec: () => eylem.filtreSec(null),
      renkVar: false,
    },
    ...zengin.filter((z) => z.eksikler.length).map((z) => ({
      ad: `${z.cocuk.ad} · ${z.eksikler.length}`,
      secili: durum.filtre === z.sira,
      stil: cipStili(durum.filtre === z.sira),
      sec: () => eylem.filtreSec(z.sira),
      renkVar: true, renk: z.renk, harf: z.harf,
    })),
  ];

  // --- Durum bandı ---
  const { bandBaslik, bandAlt } = bandMetni(
    zengin, toplamEksik, tumEksikler, secili, ilkTaramaBekleniyor, simdiUtc);

  const bandCocuklar: BandCocuk[] = zengin.map((z) => ({
    ad: z.cocuk.ad, harf: z.harf, renk: z.renk,
    sayi: z.eksikler.length,
    eksikVar: z.eksikler.length > 0,
    metin: (z.eksikler.length ? `${z.eksikler.length} eksik` : 'Eksik yok') +
      (z.cocuk.baglantiKopuk ? ' · veri eski' : ''),
    metinRenk: z.eksikler.length ? 'var(--renk-eksik-metin)' : 'var(--murekkep-2)',
  }));

  // --- Alt raf (çocuk seçici) ---
  const dikey = cocukSayisi > 2;
  const dockGoster = !masa && coklu && !yukleniyor;
  const dock: DockOgesi[] = zengin.map((z) => {
    const acik = z.sira === secili;
    return {
      ad: z.cocuk.ad, harf: z.harf, renk: z.renk,
      sayi: z.eksikler.length,
      rozet: z.eksikler.length > 0,
      kopuk: z.cocuk.baglantiKopuk,
      secili: acik,
      nokta: acik ? 'var(--murekkep)' : 'var(--cizgi)',
      sec: () => eylem.cocukSec(z.sira),
      aria: `${z.cocuk.ad}, ` +
        (z.eksikler.length ? `${z.eksikler.length} eksik ödev` : 'eksik ödev yok') +
        (z.cocuk.baglantiKopuk ? ', bağlantı koptu' : ''),
      stil: {
        flex: '1 1 0', minWidth: 0, minHeight: dikey ? 62 : 52, display: 'flex',
        flexDirection: dikey ? 'column' : 'row', alignItems: 'center',
        justifyContent: 'center', gap: dikey ? 5 : 10,
        padding: dikey ? '9px 4px 7px' : '0 12px', border: 'none', borderRadius: 14,
        background: acik ? 'var(--yuzey)' : 'transparent',
        boxShadow: acik
          ? `0 1px 3px oklch(0.2 0.02 60 / 0.16), inset 0 -3px 0 ${z.renk}`
          : 'none',
        color: 'var(--murekkep)', fontFamily: 'inherit',
        fontSize: dikey ? 12 : 15, fontWeight: acik ? 700 : 500, cursor: 'pointer',
      },
    };
  });

  const sec = zengin[secili];
  const taze = tazelik(veri, simdiUtc);
  const bandDolu = toplamEksik > 0 && !ilkTaramaBekleniyor;
  const cagir = (f?: () => void) => () => f?.();

  return {
    telefon: (durum.sahteCihazCubugu ?? false) && !masa,
    masa, yukleniyor, cocukYok,
    icerik: !yukleniyor && !cocukYok,
    altBosluk: dockGoster ? '112px' : '32px',
    haneAdi: veri.haneAdi,

    tazelikNormal: !taze.uyari, tazelikUyari: taze.uyari, tazelikMetin: taze.metin,
    tazele: eylem.tazele,

    bandTek: cocukSayisi === 1,
    bandCokluA: coklu, bandCokluB: false,
    bandBaslik, bandAlt,
    bandAltGoster: toplamEksik === 0 || ilkTaramaBekleniyor,
    bandCipler: bandDolu,
    bandCocuklar,
    bandZemin: bandDolu ? 'var(--renk-eksik-zemin)' : 'var(--yuzey)',
    bandCizgi: bandDolu ? 'transparent' : 'var(--cizgi)',
    bandOk: bandDolu && !masa,
    bandAria: `${bandBaslik}. ${bandAlt}. Eksik ödevler listesini aç.`,

    kolonlar,
    iskelet: Array.from({ length: 35 }, (_, i) => i),
    ayGeri: () => eylem.ayKaydir(-1),
    ayIleri: () => eylem.ayKaydir(1),
    tBas: dokunmaBasla,
    tSon: (e) => dokunmaBitir(e, eylem.ayKaydir),

    filtreler,
    filtreGoster: coklu && toplamEksik > 0,
    eksikSatirlar,
    eksikVar: eksikSatirlar.length > 0,
    eksikBos: eksikSatirlar.length === 0,
    sheetAcik: !masa && durum.sheetAcik,
    sheetAc: () => { if (!masa && toplamEksik) eylem.sheetAc(); },
    sheetKapat: eylem.sheetKapat,

    dock, dockA: dockGoster, dockB: false,
    secAd: sec?.cocuk.ad ?? '',
    secHarf: sec?.harf ?? '',
    secRenk: sec?.renk ?? '',
    secAlt: sec
      ? `${sec.cocuk.sinif} · ` +
        (sec.eksikler.length ? `${sec.eksikler.length} eksik` : 'eksik yok') +
        (sec.cocuk.baglantiKopuk ? ' · veri eski' : '')
      : '',
    secAria: sec ? `Şu an ${sec.cocuk.ad} gösteriliyor. Sıradaki çocuğa geç.` : '',
    sonrakiCocuk: () => eylem.cocukSec((secili + 1) % Math.max(1, cocukSayisi)),

    ayarlar: cagir(eylem.onAyarlar),
    cocukEkle: cagir(eylem.onCocukEkle),
    yenidenBagla: cagir(eylem.onYenidenBagla),
  };
}

// --- Parçalar ------------------------------------------------------------

function takipNotuMetni(
  gosterilen: { yil: number; ay: number },
  ilkTaramaUtc: number | null,
): string {
  if (ilkTaramaUtc == null) return '';
  const ilk = trGunu(ilkTaramaUtc);
  const [iy, ia, ig] = ilk.split('-').map(Number) as [number, number, number];
  const gosterilenIndeks = gosterilen.yil * 12 + gosterilen.ay;
  const ilkIndeks = iy * 12 + (ia - 1);
  const tarihMetni = `${ig} ${AY[ia - 1]} ${iy}`;

  if (gosterilenIndeks < ilkIndeks) {
    return `Bu ay takip başlamadan önceydi (${tarihMetni}). ` +
      'Burada ödev görünmemesi eksik olmadığı anlamına gelmez.';
  }
  if (gosterilenIndeks === ilkIndeks) {
    return `Takip ${ig} ${AY[ia - 1]}’de başladı. ` +
      'Taralı günlerde ödev görünmemesi, o gün eksik olmadığı anlamına gelmez.';
  }
  return '';
}

function bandMetni(
  zengin: { cocuk: Cocuk; eksikler: OdevGorunumu[] }[],
  toplamEksik: number,
  tumEksikler: Satir[],
  secili: number,
  ilkTaramaBekleniyor: boolean,
  simdiUtc: number,
): { bandBaslik: string; bandAlt: string } {
  if (ilkTaramaBekleniyor) {
    return {
      bandBaslik: 'Henüz veri yok',
      bandAlt: 'İlk tarama sürüyor; birkaç dakika içinde burada olacak.',
    };
  }

  const tek = zengin.length === 1;

  if (toplamEksik > 0) {
    return {
      bandBaslik: `${toplamEksik} eksik ödev`,
      bandAlt: tek
        ? `En eskisinin teslim tarihi ${tumEksikler[0]?.gec ?? 0} gün önceydi`
        : zengin.filter((z) => z.eksikler.length)
            .map((z) => `${z.cocuk.ad} ${z.eksikler.length}`).join(' · '),
    };
  }

  if (tek) {
    const sirada = zengin[secili]?.cocuk.odevler
      .filter((o) => o.gorunum === 'bekliyor' && o.sonTeslimUtc != null)
      .sort((a, b) => a.sonTeslimUtc! - b.sonTeslimUtc!)[0];
    return {
      bandBaslik: 'Eksik ödev yok',
      bandAlt: sirada
        ? `Sıradaki: ${sirada.dersAdi} — ${kalanMetni(sirada, simdiUtc)}`
        : 'Bekleyen ödev de yok',
    };
  }

  const adlar = zengin.map((z) => z.cocuk.ad).join(', ').replace(/, ([^,]*)$/, ' ve $1');
  return {
    bandBaslik: 'Eksik ödev yok',
    bandAlt: `${adlar} için teslim tarihi geçmiş ödev yok`,
  };
}

// Ay değiştirme için kaydırma jesti. Başlangıç noktası modül düzeyinde
// tutulur; pano tek örnek olduğu için yeterli ve state'i kirletmiyor.
let dokunmaX: number | null = null;

function dokunmaBasla(e: React.TouchEvent): void {
  dokunmaX = e.touches[0]?.clientX ?? null;
}

function dokunmaBitir(e: React.TouchEvent, ayKaydir: (yon: -1 | 1) => void): void {
  if (dokunmaX == null) return;
  const dx = (e.changedTouches[0]?.clientX ?? 0) - dokunmaX;
  dokunmaX = null;
  if (Math.abs(dx) > 50) ayKaydir(dx < 0 ? 1 : -1);
}
