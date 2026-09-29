// Giriş bağlantısı e-postası.
//
// Resend yapılandırılmışsa oradan gönderilir; değilse bağlantı sunucu
// günlüğüne yazılır. Böylece geliştirme ortamında e-posta altyapısı
// kurmadan akış baştan sona denenebilir.

interface Gonderim {
  gonderildi: boolean;
  /** Yapılandırma yoksa bağlantı buraya konur (yalnızca geliştirme). */
  gelistirmeBaglantisi?: string;
}

export async function girisBaglantisiGonder(
  eposta: string,
  baglanti: string,
): Promise<Gonderim> {
  const anahtar = process.env.RESEND_ANAHTAR;
  const gonderen = process.env.EPOSTA_GONDEREN;

  if (!anahtar || !gonderen) {
    // Üretimde bu bir yapılandırma hatasıdır; sessizce geçilmemeli.
    if (process.env.NETLIFY_ORTAM === 'uretim') {
      throw new Error('RESEND_ANAHTAR / EPOSTA_GONDEREN tanımlı değil.');
    }
    console.log(`[eposta] ${eposta} için giriş bağlantısı: ${baglanti}`);
    return { gonderildi: false, gelistirmeBaglantisi: baglanti };
  }

  const cevap = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${anahtar}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: gonderen,
      to: eposta,
      subject: 'Ödev Defteri — giriş bağlantınız',
      text: metinGovde(baglanti),
      html: htmlGovde(baglanti),
    }),
  });

  if (!cevap.ok) {
    const ayrinti = await cevap.text();
    throw new Error(`E-posta gönderilemedi (HTTP ${cevap.status}): ${ayrinti.slice(0, 200)}`);
  }
  return { gonderildi: true };
}

const metinGovde = (baglanti: string) => `Ödev Defteri'ne giriş yapmak için bu bağlantıyı açın:

${baglanti}

Bağlantı 15 dakika geçerlidir ve bir kez kullanılabilir.
Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz.`;

const htmlGovde = (baglanti: string) => `<!doctype html>
<html lang="tr"><body style="font-family:system-ui,sans-serif;line-height:1.6;color:#2a2622">
<p>Ödev Defteri'ne giriş yapmak için aşağıdaki bağlantıyı açın:</p>
<p><a href="${kacir(baglanti)}" style="display:inline-block;padding:12px 20px;
   background:#2a2622;color:#f8f5ef;text-decoration:none;border-radius:8px">Giriş yap</a></p>
<p style="color:#6b635a;font-size:14px">Bağlantı 15 dakika geçerlidir ve bir kez kullanılabilir.<br>
Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz.</p>
</body></html>`;

/** HTML özniteliğine gömülecek metni kaçırır. */
function kacir(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
