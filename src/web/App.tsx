import { useCallback, useEffect, useState } from 'react';
import { Pano } from './uretilen/Pano';
import { HesapEkranlari } from './uretilen/HesapEkranlari';
import { panoProplari, type GorunumDurumu, type Eylemler } from './panoModeli';
import { hesapProplari, useHesapDurumu, type HaneBilgisi } from './hesapModeli';
import { usePanoVerisi } from './panoVerisiKancasi';
import { useYonlendirme, ekranYolu } from './yonlendirme';
import * as api from './api';
import type { HesapEkrani, PanoVerisi } from './tipler';

export function App() {
  const { sayfa, git } = useYonlendirme();
  const pano = usePanoVerisi();

  // Oturum düşerse giriş ekranına al; kullanıcı boş panoya bakmasın.
  useEffect(() => {
    if (pano.oturumGerekli && sayfa.ad === 'pano') git('/giris', true);
  }, [pano.oturumGerekli, sayfa.ad, git]);

  return (
    <div style={{
      height: '100dvh', display: 'flex', flexDirection: 'column',
      background: 'var(--zemin)',
    }}>
      {sayfa.ad === 'pano'
        ? <PanoSayfasi veri={pano.veri} ilkYukleme={pano.ilkYukleme}
            elleTazele={pano.elleTazele} git={git} />
        : <HesapSayfasi baslangic={sayfa.ekran} davet={sayfa.davet} git={git} />}
    </div>
  );
}

// --- Pano ----------------------------------------------------------------

function PanoSayfasi(p: {
  veri: PanoVerisi | null;
  ilkYukleme: boolean;
  elleTazele: () => void;
  git: (yol: string) => void;
}) {
  const [gorunum, setGorunum] = useState<GorunumDurumu>({
    seciliCocuk: 0, gosterilenAy: null, seciliGun: null,
    filtre: null, sheetAcik: false, masaustu: false,
  });

  // Masaüstü düzeni: tasarım tek bileşeni iki yerleşimde kullanıyor.
  useEffect(() => {
    const sorgu = window.matchMedia('(min-width: 900px)');
    const uygula = () => setGorunum((o) => ({ ...o, masaustu: sorgu.matches }));
    uygula();
    sorgu.addEventListener('change', uygula);
    return () => sorgu.removeEventListener('change', uygula);
  }, []);

  const yama = useCallback(
    (d: Partial<GorunumDurumu>) => setGorunum((o) => ({ ...o, ...d })), []);

  const eylemler: Eylemler = {
    cocukSec: (i) => yama({ seciliCocuk: i, seciliGun: null, sheetAcik: false }),
    gunSec: (g) => yama({ seciliGun: g }),
    ayKaydir: (yon) => setGorunum((o) => {
      const simdi = new Date();
      const temel = o.gosterilenAy ?? { yil: simdi.getFullYear(), ay: simdi.getMonth() };
      const d = new Date(Date.UTC(temel.yil, temel.ay + yon, 1));
      return { ...o, gosterilenAy: { yil: d.getUTCFullYear(), ay: d.getUTCMonth() } };
    }),
    filtreSec: (i) => yama({ filtre: i }),
    sheetAc: () => yama({ sheetAcik: true }),
    sheetKapat: () => yama({ sheetAcik: false, filtre: null }),
    tazele: p.elleTazele,
    onAyarlar: () => p.git('/ayarlar'),
    onCocukEkle: () => p.git('/kurulum'),
    onYenidenBagla: () => p.git('/ayarlar'),
  };

  // Veri gelene kadar iskelet: boş ekran yerine yerleşim korunur.
  const veri: PanoVerisi = p.veri ?? {
    haneAdi: '', cocuklar: [], sonGuncellemeUtc: null,
    ilkTaramaUtc: null, durum: p.ilkYukleme ? 'yukleniyor' : 'cocuk-yok',
  };

  return (
    <div style={{ flex: 1, minHeight: 0 }}>
      <Pano {...panoProplari(veri, gorunum, eylemler)} />
    </div>
  );
}

// --- Hesap, kurulum, ayarlar ---------------------------------------------

function HesapSayfasi(p: {
  baslangic: HesapEkrani;
  davet?: string;
  git: (yol: string, degistir?: boolean) => void;
}) {
  const [ekran, setEkran] = useState<HesapEkrani>(p.baslangic);
  const [islemde, setIslemde] = useState(false);
  const [hataMetni, setHataMetni] = useState<string | null>(null);
  const [hane, setHane] = useState<HaneBilgisi | null>(null);
  /** Kaldırma onayının hangi çocuğa ait olduğu. */
  const [kaldirilacak, setKaldirilacak] = useState<string | null>(null);
  const h = useHesapDurumu();

  useEffect(() => { setEkran(p.baslangic); }, [p.baslangic]);

  const haneYukle = useCallback(async () => {
    try {
      const { hane: k } = await api.haneAl();
      setHane({
        ad: k.ad,
        ebeveynler: k.ebeveynler.map((e) => ({
          id: e.id, ad: e.ad, eposta: e.eposta, benMiyim: e.benMiyim,
        })),
        cocuklar: k.cocuklar.map((c) => ({
          id: c.id, ad: c.ad, sinif: c.sinif, baglanti: c.baglanti,
        })),
      });
      if (k.ad && !h.form.hane) h.formDegis('hane', k.ad);
    } catch (e) {
      if (e instanceof api.ApiHatasi && e.oturumGerekli) p.git('/giris', true);
    }
  }, [h, p]);

  // Ayarlar ve izin ekranları hane bilgisine ihtiyaç duyuyor.
  useEffect(() => {
    if (ekran === 'ayarlar' || ekran === 'kaldir' || ekran === 'izin') void haneYukle();
    // haneYukle her render'da yeniden kuruluyor; ekran değişimine bağlıyoruz.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ekran]);

  /** Sunucu çağrısını sarar: hata gösterir, işlem bayrağını yönetir. */
  const calistir = useCallback(async (is: () => Promise<void>) => {
    setHataMetni(null);
    setIslemde(true);
    try {
      await is();
    } catch (e) {
      if (e instanceof api.ApiHatasi && e.oturumGerekli) { p.git('/giris', true); return; }
      setHataMetni(e instanceof Error ? e.message : 'Bir sorun oluştu');
    } finally {
      setIslemde(false);
    }
  }, [p]);

  const ekranaGit = useCallback((hedef: HesapEkrani) => {
    // Çocuğun izin ekranındaki onay düğmesi tasarımda `git.basari` çağırıyor
    // (tuval akışında bir sonraki ekran). Gerçekte Google'a gitmesi gerekiyor.
    if (ekran === 'izin' && hedef === 'basari' && p.davet) {
      window.location.href = `/api/baglan?davet=${encodeURIComponent(p.davet)}`;
      return;
    }

    void calistir(async () => {
      if (hedef === 'eposta') {
        const s = await api.girisIste(h.form.eposta);
        if (s.gelistirmeBaglantisi) {
          console.log('[geliştirme] giriş bağlantısı:', s.gelistirmeBaglantisi);
        }
      } else if (hedef === 'kurulum2' && h.form.hane.trim()) {
        await api.haneAdiDegistir(h.form.hane.trim());
      } else if (hedef === 'bagla') {
        const d = await api.cocukEkle(h.form.cocuk.trim(), '');
        h.setDavetAdresi(d.davetAdresi);
      } else if (hedef === 'kurulum3' && h.form.davet.trim()) {
        await api.ebeveynDavetEt(h.form.davet.trim());
      } else if (hedef === 'pano') {
        p.git('/');
        return;
      }
      setEkran(hedef);
      p.git(ekranYolu(hedef));
    });
  }, [calistir, ekran, h, p]);

  const props = hesapProplari({
    ekran,
    form: h.form,
    qr: h.qr,
    kopyalandi: h.kopyalandi,
    hane,
    ekranaGit,
    kopyala: h.kopyala,
    formDegis: h.formDegis,

    haneAdiKaydet: () => void calistir(async () => {
      await api.haneAdiDegistir(h.form.hane.trim());
      await haneYukle();
    }),

    ebeveynCikar: (id) => void calistir(async () => {
      await api.ebeveynCikar(id);
      await haneYukle();
    }),

    // Kaldırma yıkıcı: önce onay ekranı, silme orada.
    cocukKaldir: (id) => {
      setKaldirilacak(id);
      const c = hane?.cocuklar.find((x) => x.id === id);
      if (c) h.formDegis('cocuk', c.ad);
      setEkran('kaldir');
    },

    cocukYenidenBagla: (id) => void calistir(async () => {
      const d = await api.yenidenBagla(id);
      h.setDavetAdresi(d.davetAdresi);
      h.formDegis('cocuk', d.cocukAdi);
      setEkran('bagla');
      p.git(ekranYolu('bagla'));
    }),
  });

  // Onay ekranındaki "kaldır" düğmesi `git.ayarlar` çağırıyor; silme işini
  // oraya bağlıyoruz ki tasarımdaki akış korunsun.
  const proplarSarili = ekran === 'kaldir' && kaldirilacak
    ? {
        ...props,
        git: {
          ...props.git,
          ayarlar: () => void calistir(async () => {
            await api.cocukSil(kaldirilacak);
            setKaldirilacak(null);
            await haneYukle();
            setEkran('ayarlar');
          }),
        },
      }
    : props;

  return (
    <div style={{ flex: 1, minHeight: 0 }} aria-busy={islemde}>
      <HesapEkranlari {...proplarSarili} />
      {hataMetni ? <HataSeridi metin={hataMetni} /> : null}
    </div>
  );
}

/** Sunucu hatasını ekranın altında gösterir; akışı kesmez. */
function HataSeridi({ metin }: { metin: string }) {
  return (
    <div role="alert" style={{
      position: 'fixed', left: 16, right: 16,
      bottom: 'calc(16px + env(safe-area-inset-bottom))', zIndex: 50,
      padding: '12px 16px', borderRadius: 'var(--kose-m)',
      background: 'var(--renk-eksik-zemin)', color: 'var(--renk-eksik-metin)',
      font: '600 var(--yazi-meta)/1.4 var(--yazi-aile)',
    }}>{metin}</div>
  );
}
