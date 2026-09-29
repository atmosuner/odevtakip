# Ödev Defteri

Veliler çocuklarının Google Classroom ödevlerini tek panodan takip eder.
Salt okunur: buradan ödev verilmez, not girilmez, çocuğa mesaj atılmaz.

Türkçe arayüz, mobil öncelikli, PWA.

## Nasıl çalışıyor

Google, velinin kendi hesabıyla çocuğun ödevlerini okumasına **izin vermiyor**
— guardian API'si yalnızca veli bağlantısını yönetiyor, ödev ve not
döndürmüyor. Bu yüzden erişimi çocuk kendi hesabıyla veriyor: veli bir davet
bağlantısı (QR) üretir, çocuk kendi cihazında açıp izin verir.

Tarama zamanlanmış değil. Veli panoyu açtığında ya da sekmeye geri
döndüğünde, veri 5 dakikadan eskiyse arka planda çekilir. Pano hiçbir zaman
boş beklemez: önce önbellekteki veri görünür, tazeleme üstüne biner.

## Kurulum

### 1. Google Cloud

1. Yeni proje aç, **Google Classroom API**'yi etkinleştir.
2. **APIs & Services → Credentials → Create OAuth client ID**
   - Tip: **Web application**
   - **Authorized redirect URIs** — aynen şunlar (birebir eşleşmeli, yoksa
     `redirect_uri_mismatch` alırsın):
     ```
     https://<alan-adin>/api/geridonus
     http://localhost:8888/api/geridonus
     ```
3. **OAuth consent screen**
   - User type: **External**
   - Scope'lar:
     ```
     classroom.courses.readonly
     classroom.coursework.me.readonly
     classroom.student-submissions.me.readonly
     ```
   - **Publishing status → In production.** Bu adım şart: "Testing"
     durumunda Google refresh token'ları **7 günde** geçersiz kılıyor ve
     her hafta yeniden izin vermek gerekiyor.

Doğrulama (verification) kişisel kullanımda zorunlu değil; uygulamayı
tanıdıkların dışına açacaksan gerekir.

### 2. Anahtarlar

```bash
node scripts/anahtar-uret.mjs
```

Çıktıyı `.env` dosyasına ya da Netlify ortam değişkenlerine koy.

> **`ANA_ANAHTAR` kaybedilirse tüm çocukların bağlantısı kopar** ve her biri
> yeniden izin vermek zorunda kalır. Parola yöneticisinde yedekle.

### 3. Ortam değişkenleri

`.env.ornek` dosyasını `.env` olarak kopyala ve doldur. Üretimde aynı
değişkenleri Netlify panelinden gir.

`SITE_ADRESI` üretimde **mutlaka açıkça verilmeli**: tanımsızsa istek
başlıklarından türetilir ve ters vekil başlıkları sahte olabilir.

### 4. Çalıştırma

```bash
npm install
npm run fonts      # Figtree'yi indirir (bir kez)
npx netlify dev    # http://localhost:8888
```

E-posta yapılandırılmadıysa giriş bağlantısı sunucu günlüğüne yazılır —
geliştirmede e-posta altyapısı kurmadan akışı baştan sona deneyebilirsin.

### 5. Dağıtım

Netlify'a bağla. `netlify.toml` hazır; `npm run build` çalışır, `dist/`
yayınlanır, `netlify/functions/` altındaki uçlar `/api/*` yoluna bağlanır.

## Komutlar

| Komut | Ne yapar |
|---|---|
| `npm run dev` | Vite geliştirme sunucusu (API olmadan) |
| `npx netlify dev` | Vite + Functions birlikte |
| `npm test` | Testler |
| `npm run build` | Üretim yapısı |
| `npm run port` | Tasarım dosyalarını TSX'e çevirir |
| `npm run fonts` | Figtree'yi indirir |
| `node scripts/anahtar-uret.mjs` | Şifreleme anahtarları |
| `node scripts/ekran-goruntusu.mjs` | Ekran görüntüleri (kurulu Edge/Chrome) |

## Yapı

```
design/              Claude Design çıktıları — kaynak, elle düzenlenmez
docs/
  design-brief.md      tasarım brief'i
  tasarim-eksikleri.md tasarımda bağlanması gereken yerler
scripts/
  dc-to-tsx.mjs        tasarım → React, stiller birebir korunur
  fetch-fonts.mjs      Figtree yerelleştirme
src/
  model.ts             UTC→İstanbul, "eksik" türetme      (saf, test edilir)
  server/
    sema.ts              veri şeması + anahtar düzeni
    kripto.ts            token şifreleme, oturum imzası
    db.ts                Netlify Blobs, strong consistency + etag
    google.ts            OAuth, invalid_grant ayrımı
    classroom.ts         Classroom API sarmalayıcı
    birlestir.ts         API → şema, idempotent               (saf, test edilir)
    tarama.ts            hane taraması, asgari aralık
    panoVerisi.ts        depo → pano şekli
  web/
    uretilen/            dönüştürücü çıktısı — elle düzenlenmez
    tema.css             tasarımdan birebir kopya
    temel.css            güvenli alan, hareket tercihi, QR ızgarası
    panoModeli.ts        veri → Pano propları               (saf, test edilir)
    hesapModeli.ts       ekran bayrakları → HesapEkranlari propları
    api.ts               sunucu çağrıları
netlify/functions/     on uç nokta
```

## Tasarımla ilişki

`design/*.dc.html` dosyaları kaynak kabul edilir. `npm run port` bunları
`src/web/uretilen/` altına React bileşenlerine çevirir; **inline stil
değerleri hiç yorumlanmaz**, aynen taşınır. Doğrulama: üretilen stiller
tekrar CSS'e çevrilip kaynakla karşılaştırılıyor — 2669 bildirimin tamamı
eşleşiyor.

Üretilen dosyaları elle düzenleme; tasarım değişince `npm run port` tekrar
çalıştırılır ve düzenlemeler kaybolur. Davranış eklemek gerekiyorsa
view-model katmanından (`panoModeli.ts`, `hesapModeli.ts`) ya da
`temel.css` üzerinden yapılır.

Tasarımın varsaymadığı iki şey `temel.css` içinde tamamlanıyor: güvenli alan
(`env(safe-area-inset-*)`) ve QR ızgarasının modül sayısı. Sıfır güvenli
alanı olan bir cihazda görünüm tasarımla birebir aynıdır.

## Bilinen eksikler

`docs/tasarim-eksikleri.md` — ayarlar ekranı, kaldırma onayı ve pano
başlığındaki hane adı tasarımda sabit metin; gerçek veriye bağlanmaları için
tasarım tarafında bağlama gerekiyor.

## Güvenlik notları

- Çocukların Google refresh token'ları AES-256-GCM ile şifreli saklanıyor.
  Çocuk kimliği AAD olarak bağlı: şifreli metin bir çocuktan diğerine
  taşınamaz.
- Giriş bağlantıları tek kullanımlık ve 15 dakikalık. Belirteçler depoda
  özetlenmiş hâlde tutuluyor.
- `/api/giris` bir e-postanın kayıtlı olup olmadığını belli etmiyor.
- Oturum HMAC imzalı HttpOnly çerezde; her istekte ebeveynin hâlâ hanenin
  üyesi olduğu doğrulanıyor.
