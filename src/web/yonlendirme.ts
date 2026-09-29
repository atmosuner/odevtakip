// Basit yol yönlendirmesi.
//
// Kütüphane kullanılmıyor: beş yol ve bir sorgu parametresi için router
// bağımlılığı taşımanın bedeli faydasından büyük. `history.pushState` ve
// `popstate` yeterli.

import { useEffect, useState, useCallback } from 'react';
import type { HesapEkrani } from './tipler';

export type Sayfa =
  | { ad: 'pano' }
  | { ad: 'hesap'; ekran: HesapEkrani; davet?: string; hata?: string };

/** Yol + sorgu → sayfa. */
export function yoluCoz(yol: string, sorgu: URLSearchParams): Sayfa {
  const temiz = yol.replace(/\/+$/, '') || '/';

  switch (temiz) {
    case '/giris': {
      const hata = sorgu.get('hata');
      // Süresi dolmuş / geçersiz bağlantı ayrı bir ekran gösteriyor.
      if (hata === 'gecersiz' || hata === 'suresi-doldu' || hata === 'eksik') {
        return { ad: 'hesap', ekran: 'gecersiz' };
      }
      return { ad: 'hesap', ekran: 'giris' };
    }

    case '/kurulum':
      return { ad: 'hesap', ekran: 'kurulum1' };

    case '/bagla': {
      const durum = sorgu.get('durum');
      const hata = sorgu.get('hata');
      if (durum === 'basari') return { ad: 'hesap', ekran: 'basari' };
      if (hata) return { ad: 'hesap', ekran: 'hata', hata };
      // Çocuğun QR'dan geldiği hâl: izin açıklaması.
      const davet = sorgu.get('davet');
      if (davet) return { ad: 'hesap', ekran: 'izin', davet };
      return { ad: 'hesap', ekran: 'bagla' };
    }

    case '/ayarlar':
      return { ad: 'hesap', ekran: 'ayarlar' };

    default:
      return { ad: 'pano' };
  }
}

export function useYonlendirme() {
  const [sayfa, setSayfa] = useState<Sayfa>(() => suAnkiSayfa());

  useEffect(() => {
    const geri = () => setSayfa(suAnkiSayfa());
    window.addEventListener('popstate', geri);
    return () => window.removeEventListener('popstate', geri);
  }, []);

  const git = useCallback((yol: string, degistir = false) => {
    if (degistir) window.history.replaceState(null, '', yol);
    else window.history.pushState(null, '', yol);
    setSayfa(suAnkiSayfa());
  }, []);

  return { sayfa, git };
}

function suAnkiSayfa(): Sayfa {
  return yoluCoz(window.location.pathname, new URLSearchParams(window.location.search));
}

/** Ekran adından o ekrana götüren yolu verir. */
export function ekranYolu(ekran: HesapEkrani): string {
  switch (ekran) {
    case 'giris': case 'eposta': case 'gecersiz': return '/giris';
    case 'kurulum1': case 'kurulum2': case 'kurulum3': return '/kurulum';
    case 'bagla': case 'izin': case 'basari': case 'hata': return '/bagla';
    case 'ayarlar': case 'kaldir': return '/ayarlar';
    default: return '/';
  }
}
