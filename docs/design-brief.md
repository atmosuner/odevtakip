# Tasarım Brief'i — Ödev Takip Panosu

> Bu dosya Claude Design'a verilecek prompt'un kendisidir. Aşağıdaki "PROMPT BAŞLANGIÇ"
> ile "PROMPT SON" arasındaki kısmı kopyalayıp yapıştır.
>
> Sürüm 2 — çoklu çocuk + çoklu ebeveyn + çok aileli (multi-tenant) kapsama genişletildi.

---

## PROMPT BAŞLANGIÇ

Bir veli panosu tasarlamanı istiyorum. Aşağıda ürünün ne olduğu, kim kullandığı,
hangi ekranların gerektiği ve içerikteki gerçek veri şekilleri var.

### Ürün

Veliler, çocuklarının Google Classroom ödevlerini tek bir panodan takip ediyor.
Uygulama Classroom'dan 30 dakikada bir veri çekiyor ve velilere gösteriyor.

**Tamamen salt okunur** — veli buradan ödev veremez, not giremez, çocuğa mesaj
atamaz, öğretmenle iletişim kuramaz. Sadece görür.

Arayüz dili **Türkçe**. Tarih/ay adları Türkçe, hafta **Pazartesi** ile başlar.

### Kullanım şekli — hane (household) modeli

Ürün birden fazla aile tarafından kullanılacak. Temel kavram **hane**:

- Bir hanede **1 veya daha fazla ebeveyn** olur (anne, baba, bazen tek ebeveyn,
  bazen büyükanne)
- Bir hanede **1 veya daha fazla çocuk** olur
- Hanedeki her ebeveyn, hanedeki **tüm** çocukları görür. Ebeveynler arasında
  yetki farkı yok, kimse kimseden kısıtlı değil
- Bir hane başka hanenin verisini asla görmez

Tipik hane: anne + baba + 2 çocuk. Ama tasarım 1 ebeveyn + 1 çocuktan
2 ebeveyn + 4 çocuğa kadar bozulmadan çalışmalı.

İlk ebeveyn haneyi kurar, ikinci ebeveyni e-postayla davet eder.

### Kullanıcı ve cihaz

Kullanıcı: 30-50 yaş arası ebeveyn. Teknik değil. Günde 1-2 kez hızlıca bakacak,
tek soruya cevap arıyor: **"eksik ödev var mı?"** Birden fazla çocuk varsa
soru şu olur: **"hangisinin eksiği var?"**

**Birincil cihaz: cep telefonu, dikey (portrait).** Tasarımı önce telefon için yap,
masaüstünü sonra genişlet. Telefonda tek elle, başparmakla kullanılabilmeli:

- Dokunma hedefleri en az 44×44 px
- Ana etkileşimler ekranın alt/orta bandında — üst köşelere kritik buton koyma
- **Çocuk değiştirici başparmakla ulaşılabilir yerde olmalı** (en çok kullanılacak
  kontrol bu), üstte küçük bir sekme satırına sıkıştırma
- Yatay kaydırma **hiç olmasın**; taşan içerik kendi kabında kaysın
- 360 px genişlikte bozulmamalı (alt sınır referansı)

Masaüstü ikincil ama çalışmalı. Masaüstünde ekran genişliği çoklu çocuğu
yan yana göstermeye izin veriyor — bunu değerlendir.

### Ekranlar

#### A. Hesap ve kurulum

**A1. Giriş.** E-posta adresi + "Giriş bağlantısı gönder". Parola yok:
kullanıcı e-postasına gelen tek kullanımlık bağlantıya tıklayarak giriyor.
Bu yüzden "şifremi unuttum", "parola gücü", "parolayı onayla" ekranları **yok**.

Bağlantı gönderildikten sonraki bekleme durumu da gerekiyor: "E-postanı kontrol et".
Bağlantının süresi geçmiş / geçersiz hali de.

**A2. Hane kurulumu (ilk kullanım).** Yeni kullanıcı için adım adım:
1. Hane adı (ör. "Üner Ailesi") — veya bu adımı atlayıp varsayılan verme
2. Çocuk ekle
3. İkinci ebeveyni davet et (atlanabilir)

Kaç adım olacağını ve ilerleme göstergesi gerekip gerekmediğini sen karara bağla.
Amaç: teknik olmayan biri takılmadan bitirsin.

**A3. Çocuk ekleme / bağlama.** Bu ekran ürünün en kritik ve en kırılgan yeri,
özen göster.

Akış: veli çocuğun adını girer → uygulama tek kullanımlık bir bağlantı üretir →
**çocuk kendi telefonunda/bilgisayarında o bağlantıyı açıp kendi Google hesabıyla
izin verir** → bağlantı kurulur.

Tasarım şunları çözmeli:
- Veliye bu akışın **neden** böyle olduğunu tek cümlede anlatmak (Google, velinin
  kendi hesabıyla çocuğun ödevlerini okumasına izin vermiyor; erişimi çocuğun
  kendisi vermek zorunda)
- Bağlantıyı çocuğa ulaştırmanın iki yolu: **QR kod** (çocuk yanındaysa telefonuyla
  okutur — en pratik yol) ve **bağlantıyı kopyala/paylaş**
- Bekleme durumu: "Ahmet'in izin vermesi bekleniyor" + iptal
- Çocuğun göreceği izin ekranı: Google'a yönlenmeden önce kısa, sade bir
  açıklama. Çocuk 10-14 yaşında olabilir, dili ona göre kur. Bu ekran
  **gizli izleme gibi durmamalı** — çocuk neyin paylaşıldığını anlamalı:
  ödev listesi, teslim durumu, notlar. Gizlemeye çalışan bir tasarım istemiyorum.
- Başarı ve hata durumları

**A4. Hane ayarları.** Hanedeki ebeveynler listesi, çocuklar listesi,
ebeveyn davet etme, çocuk bağlantısını kaldırma, hesaptan çıkış.

Çocuk bağlantısını kaldırma yıkıcı bir işlem (geçmiş veri gider) — onay istesin.

#### B. Ana pano

**B1. Çocuk seçici.** Birden fazla çocuk varsa panonun en üstünde hangi çocuğa
baktığın belli olmalı ve geçiş tek dokunuşla olmalı.

Kararı sen ver ama şunları düşün:
- 2 çocukta segmented control, 4 çocukta ne olacak?
- Her çocuğa sabit bir renk atanması takvimi ve listeleri okumayı kolaylaştırır mı?
- Çocuk ismi yanında o çocuğun eksik sayısı badge olarak görünmeli mi?
- **Tek çocuklu hanede bu kontrol hiç görünmemeli** — gereksiz gürültü

**B2. Durum bandı.** Ekranın en üstü, kaydırma gerektirmeden okunmalı.

Tek çocukta: "3 eksik ödev" ya da "Eksik ödev yok".

Çoklu çocukta bu bant **tüm hanenin** özetini vermeli — çocuk seçiciye bağlı
olmamalı. Veli panoyu "kimin eksiği var" diye açıyor, her çocuğa tek tek
tıklayıp kontrol etmek zorunda kalmamalı. Örnek: "Ahmet 3, Zeynep 1 eksik".
Bunu 4 çocukta taşmadan nasıl göstereceğini çöz.

Eksik yoksa: olumlu ama abartısız tek satır.

**B3. Ay takvimi.** Standart ay gridi, Pazartesi başlangıçlı. Seçili çocuğa ait.

Kritik kural: **hücrelerin içinde metin yok.** Sadece gün numarası ve altında
küçük bir nokta. Ödev başlıklarını takvime yazma — kalabalık olmasını istemiyorum.

Nokta durumları (**en fazla üç görsel durum**, daha fazlasını icat etme):
- Eksik ödev var → dolu, uyarı rengi
- Teslim edilmemiş ama zamanı geçmemiş ödev var → boş/soluk daire
- Hepsi teslim/notlandırılmış → dolu, olumlu renk
- Hiç ödev yok → nokta yok

Bir günde birden fazla durum varsa en kritik olan kazanır (eksik > bekleyen > teslim).

Bugün ayrıca işaretli olmalı ve açılışta seçili olmalı. Seçili gün, "bugün"den
görsel olarak ayrı okunmalı — ikisi aynı gün olabilir, o durumda da karışmamalı.

Ay değiştirme: ileri/geri. Telefonda kaydırma jesti de düşünülebilir.

**B4. Seçili günün ödevleri.** Takvimin altında liste. Her satırda:
- Ders adı
- Ödev başlığı
- Durum etiketi
- Notlandırılmışsa puan
- Satıra dokununca Google Classroom'daki ödeve gider (dış bağlantı olduğu belli olsun)

Boş günde kısa bir "Bu gün ödev yok" satırı.

**B5. Eksik ödevler listesi.** Durum bandından açılır. En eski gecikme en üstte.
Her satırda ders, başlık, "kaç gün gecikti".

Çoklu çocukta bu liste **tüm çocukları birlikte** gösterebilmeli, hangi satırın
kimin olduğu net olmalı. Çocuğa göre filtre gerekli mi, kararı sen ver.

Telefonda ayrı ekran mı, alttan açılan panel (bottom sheet) mi — kararı sen ver,
gerekçesini yaz.

#### C. Durum ve hata ekranları

**C1. Veri tazeliği göstergesi.** Veri 30 dakikada bir yenilendiği için
kullanıcının baktığı şeyin yaşını bilmesi gerekiyor: "Son güncelleme 12 dk önce".
Sürekli görünür ama dikkat çekmeyen bir yerde. 2 saatten eskiyse belirginleşsin.

**C2. Yeniden yetkilendirme uyarısı.** Bir çocuğun Google bağlantısı koptuğunda
o çocuğun verisi güncellenmeyi durdurur. Kalıcı bir uyarı gerekiyor: veri eski,
çocuğun tekrar izin vermesi lazım, düzeltme akışına giden bir yol.

**Eski veriyi sessizce taze gibi göstermek kabul edilemez** — tasarım bunu
açıkça belli etmeli.

Çoklu çocukta bu önemli bir ayrıntı: **bir çocuğun bağlantısı kopmuş, diğeri
çalışıyor olabilir.** Uyarı o çocuğa ait olduğu anlaşılacak şekilde
konumlandırılmalı; tüm panoyu kilitlememeli.

**C3. Yükleniyor durumu.** İskelet (skeleton) yerleşim. Spinner değil.

**C4. Hiç veri yok durumu.** Çocuk bağlanmış ama ilk tarama henüz çalışmamış.

**C5. Hiç çocuk yok durumu.** Hane kurulmuş, henüz çocuk bağlanmamış —
çocuk ekleme akışına yönlendiren boş durum.

### Ton

Nötr ve olgusal. Bu bir ceza aracı değil, bir bilgi panosu.

- "Ödevini yapmamış!", "3 ödev kaçırdı" gibi suçlayıcı dil **yok**
- Ünlem işareti, kırmızı alarm estetiği, "Dikkat!" tonu yok
- Gecikmiş ödev bir olgudur: "Teslim edilmedi — 2 gün geçti"
- Aşırı kutlayıcı da olma: "Harika! Süpersin!" yok. "Eksik ödev yok" yeter.
- **Çocukları birbiriyle kıyaslayan hiçbir öge olmasın.** Kardeşleri yan yana
  sıralayan bir "skor tablosu" hissi vermemeli. Aynı panodaki iki çocuk
  yarışmıyor.

### Gerçek veri örneği

Tasarımda bu içeriği kullan — uzunluklar gerçekçi, Türkçe ödev başlıkları uzun olabiliyor.

Hane: 2 ebeveyn, 2 çocuk — farklı sınıf seviyeleri, farklı ders setleri:

```
Çocuk 1: Ahmet, 5. sınıf
  Dersler: Matematik, Türkçe, Fen Bilimleri, Sosyal Bilgiler, İngilizce,
           Din Kültürü ve Ahlak Bilgisi, Görsel Sanatlar, Beden Eğitimi

  Matematik       "Kesirlerle Toplama ve Çıkarma - Çalışma Kağıdı 3"   eksik, 2 gün geçti
  Türkçe          "Okuduğum Kitabın Tanıtımı (1 sayfa kompozisyon)"    teslim edildi
  Fen Bilimleri   "Güneş, Dünya ve Ay - Model Yapımı"                  notlandırıldı 85/100
  Sosyal Bilgiler "İlk Türk Devletleri Kavram Haritası"                bekliyor, yarın
  İngilizce       "Unit 4 Vocabulary Worksheet"                        eksik, 5 gün geçti
  Din Kültürü     "Ramazan Ayı ile İlgili Araştırma"                   bekliyor
  Görsel Sanatlar "Perspektif Çizim Ödevi"                             teslim edildi

Çocuk 2: Zeynep, 8. sınıf
  Dersler: Matematik, Türkçe, Fen Bilimleri, T.C. İnkılap Tarihi ve Atatürkçülük,
           İngilizce, Din Kültürü ve Ahlak Bilgisi, Bilişim Teknolojileri

  Matematik       "Üslü Sayılar - LGS Deneme Soruları"                 eksik, 1 gün geçti
  Fen Bilimleri   "Basınç Deneyi Raporu"                               notlandırıldı 92/100
  İnkılap Tarihi  "Kurtuluş Savaşı Cepheleri - Sunum Hazırlığı"        bekliyor, 3 gün sonra
  Bilişim Tekn.   "Scratch ile Basit Oyun Projesi"                     teslim edildi
```

"Din Kültürü ve Ahlak Bilgisi" ve "T.C. İnkılap Tarihi ve Atatürkçülük" gibi uzun
ders adlarının telefonda nasıl davrandığını göster — kısaltma mı, sarma mı,
senin kararın.

Ebeveynler: Bahadır ve Elif. Hane adı: "Üner Ailesi".

Ödev durumları tam listesi: `eksik`, `bekliyor`, `teslim edildi`, `notlandırıldı`.
Puan sadece `notlandırıldı` durumunda var, her ödev notlu değil.

Bazı ödevlerin teslim tarihi hiç olmayabilir — o ödevler takvimde bir güne
düşmez ve asla "eksik" sayılmaz. Bunları nereye koyacağını düşün.

Farklı sınıf seviyelerindeki çocukların ders setleri farklı, ortak ders adları da
var (Matematik ikisinde de) — arayüz ders adına göre renk/ikon atıyorsa bu
durumu nasıl ele alacağını düşün.

### Teknik çerçeve

React + Vite + TypeScript ile kurulacak. Stil için **düz CSS + CSS custom properties**
kullanılacak, Tailwind veya hazır bileşen kütüphanesi yok. Bu yüzden:

- Renk, boşluk, tipografi için CSS değişkeni isimleri öner (`--renk-uyari` gibi)
- Ağır bileşen kütüphanesi gerektiren çözümler önerme
- Takvim için hazır kütüphane kullanılmayacak, kendi gridi yazılacak —
  tasarımı buna göre yap
- Çocuklara atanacak renkler dinamik üretilecek (çocuk sayısı sabit değil),
  paleti buna göre kur: 4 çocukta birbirinden ayırt edilebilir kalmalı

**Açık ve koyu tema, ikisi de.** Sistem tercihine uysun. Koyu tema sonradan
eklenen bir varyant gibi değil, baştan düşünülmüş olsun — telefonda akşam
kullanımı yaygın olacak.

Erişilebilirlik: durum bilgisi **yalnızca renkle** anlatılmasın. Nokta şekli,
etiket metni veya ikon da durumu taşısın. Bu çocuk renklerinde de geçerli:
renk körü bir kullanıcı çocukları ayırt edebilmeli. Kontrast WCAG AA.

### Kapsam dışı — tasarlamayın

- Bildirim ayarları, e-posta/push tercihleri
- Not girme, ödev oluşturma, öğretmenle mesajlaşma
- Ebeveynler arası yetki seviyeleri / rol yönetimi (tüm ebeveynler eşit)
- Ödeme, abonelik, plan yükseltme ekranları
- Haftalık/aylık trend grafikleri — **ikinci fazda gelecek.** Şimdi tasarlamayın,
  ama ana panonun yerleşimi ileride ikinci bir sekmenin/görünümün ekleneceğini
  varsayarak kurulsun ki sonra yeniden çizmek gerekmesin.

### İstediğim çıktı

1. **Telefon dikey görünümde** tüm ekranlar ve durumlar:
   giriş, e-posta bekleme, hane kurulumu, çocuk ekleme (QR dahil), çocuğun
   göreceği izin ekranı, ana pano (tek çocuk), ana pano (2 çocuk), ana pano
   (4 çocuk), eksik ödevler listesi, hane ayarları, yükleniyor, veri yok,
   çocuk yok, yeniden yetkilendirme uyarısı, eksik-yok hali
2. **Masaüstü görünümü**: ana pano (tek çocuk ve çoklu çocuk)
3. Takvim hücresinin dört durumunun yakın plan gösterimi
4. Çocuk seçicinin 1, 2 ve 4 çocuklu halleri yan yana
5. Renk paleti — açık ve koyu tema, CSS custom property isimleriyle;
   çocuk renkleri için ayrı bir alt palet
6. Tipografi ölçeği ve boşluk skalası
7. Verdiğin kararların kısa gerekçeleri: çocuk seçici biçimi, çoklu çocukta
   durum bandını nasıl taşmadan kurdun, bottom sheet mi ayrı ekran mı, uzun
   ders adını nasıl çözdün, nokta durumlarını nasıl ayırdın

## PROMPT SON

---

## Notlar (Claude Design'a gitmez)

### Sürüm 2'de eklenenler

- **Hane modeli** — çoklu ebeveyn + çoklu çocuk, eşit yetkili ebeveynler
- **Kimlik doğrulama e-posta + magic link'e çevrildi.** Tek parola artık
  yetmiyor: çoklu ebeveyn ayrı kimlik gerektiriyor, çok aileli kullanım
  kiracı ayrımı gerektiriyor. Magic link seçildi çünkü parola sıfırlama,
  parola gücü, parola onay ekranlarının hepsini siliyor — teknik olmayan
  ebeveyn için daha az takılma noktası
- **Kurulum akışı (onboarding) ekranları** — sürüm 1'de yoktu, tek kullanıcı
  kendi kurduğu için gerekmiyordu. Artık ürünün ilk izlenimi
- **Çocuk bağlama akışı + QR kod** — velinin çocuk hesabıyla OAuth yapması
  gereken akış artık bir ürün yüzeyi, elle yapılan bir kurulum adımı değil
- **Çocuğun göreceği izin ekranı** — yeni. Başkalarının çocukları da
  bağlanacağı için bu ekranın dürüst olması artık bir gereklilik
- **Çoklu çocukta "hangisinin eksiği var" sorusu** durum bandına yüklendi;
  veli her çocuğa tek tek bakmak zorunda kalmamalı
- **Kardeş kıyaslaması yasağı** ton bölümüne eklendi
- **Çocuk renkleri** + renk körlüğü gereksinimi

### Sürüm 1'den korunan bilinçli seçimler

- Takvim hücresinde metin yasağı (kalabalık olmasın şartı)
- Üç görsel durum sınırı
- Veri tazeliği ve reauth uyarısı ayrı ekran olarak isteniyor
- Suçlayıcı olmayan ton
- Trend grafiği kapsam dışı ama yerleşim hazır
- Teslim tarihi olmayan ödevler sorusu bilerek açık
