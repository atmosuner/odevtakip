// Pano verisini yükler ve tazeler.
//
// Akış bilinçli olarak iki aşamalı:
//   1. `/api/veri` önbellekten anında döner → veli boş ekran görmez.
//   2. Veri eskiyse arka planda `/api/tazele` çalışır → sessizce güncellenir.
//
// Tasarımdaki tazelik göstergesi bu akışın görünen yüzü: "Güncellendi 12 dk
// önce" yazısı tazeleme bitince "Az önce güncellendi"ye döner.

import { useCallback, useEffect, useRef, useState } from 'react';
import { veriAl, tazele, ApiHatasi, AgHatasi } from './api';
import type { PanoVerisi } from './tipler';

export interface PanoDurumuSonucu {
  veri: PanoVerisi | null;
  /** İlk yükleme sürüyor; iskelet gösterilir. */
  ilkYukleme: boolean;
  /** Arka planda tazeleme sürüyor; mevcut veri gösterilmeye devam eder. */
  tazeleniyor: boolean;
  /** Oturum yok — giriş ekranına yönlendirilmeli. */
  oturumGerekli: boolean;
  hata: string | null;
  /** Elle tazeleme (tazelik göstergesine dokunma). */
  elleTazele: () => void;
}

export function usePanoVerisi(): PanoDurumuSonucu {
  const [veri, setVeri] = useState<PanoVerisi | null>(null);
  const [ilkYukleme, setIlkYukleme] = useState(true);
  const [tazeleniyor, setTazeleniyor] = useState(false);
  const [oturumGerekli, setOturumGerekli] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  /** Aynı anda iki tazeleme çalışmasın. */
  const calisiyor = useRef(false);
  /** Bileşen söküldükten sonra state güncellenmesin. */
  const canli = useRef(true);

  useEffect(() => {
    canli.current = true;
    return () => { canli.current = false; };
  }, []);

  const tazelemeYap = useCallback(async () => {
    if (calisiyor.current) return;
    calisiyor.current = true;
    setTazeleniyor(true);

    try {
      const sonuc = await tazele();
      if (!canli.current) return;
      setVeri(sonuc.veri);
      setHata(null);
    } catch (e) {
      if (!canli.current) return;
      if (e instanceof ApiHatasi && e.oturumGerekli) {
        setOturumGerekli(true);
      } else if (e instanceof AgHatasi) {
        // Çevrimdışı: eldeki veriyi göstermeye devam et, durumu işaretle.
        setVeri((o) => o && { ...o, durum: 'cevrimdisi' });
      } else {
        setHata((e as Error).message);
      }
    } finally {
      calisiyor.current = false;
      if (canli.current) setTazeleniyor(false);
    }
  }, []);

  // İlk yükleme: önbellek → gerekirse tazeleme.
  useEffect(() => {
    let iptal = false;

    (async () => {
      try {
        const { veri: ilk, tazelemeEsigiMs } = await veriAl();
        if (iptal || !canli.current) return;

        setVeri(ilk);
        setIlkYukleme(false);

        const yas = ilk.sonGuncellemeUtc == null
          ? Infinity : Date.now() - ilk.sonGuncellemeUtc;

        // Hiç veri yoksa ya da eskiyse arka planda tazele.
        if (yas > tazelemeEsigiMs) void tazelemeYap();
      } catch (e) {
        if (iptal || !canli.current) return;
        setIlkYukleme(false);
        if (e instanceof ApiHatasi && e.oturumGerekli) setOturumGerekli(true);
        else if (e instanceof AgHatasi) setHata('Bağlantı kurulamadı');
        else setHata((e as Error).message);
      }
    })();

    return () => { iptal = true; };
  }, [tazelemeYap]);

  // Sekmeye geri dönüldüğünde tazele: telefon cebe girip çıktığında veli
  // eski veriye bakmasın.
  useEffect(() => {
    const geriDonunce = () => {
      if (document.visibilityState !== 'visible') return;
      if (!veri) return;
      const yas = veri.sonGuncellemeUtc == null
        ? Infinity : Date.now() - veri.sonGuncellemeUtc;
      if (yas > 5 * 60_000) void tazelemeYap();
    };
    document.addEventListener('visibilitychange', geriDonunce);
    return () => document.removeEventListener('visibilitychange', geriDonunce);
  }, [veri, tazelemeYap]);

  return {
    veri,
    ilkYukleme,
    tazeleniyor,
    oturumGerekli,
    hata,
    elleTazele: () => void tazelemeYap(),
  };
}
