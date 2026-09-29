# Tasarımda bağlanması gereken yerler

Port sırasında çıktı. Hepsi aynı sebepten: tasarımda örnek veri **sabit metin**
olarak yazılmış, `{{ }}` bağlaması yok. Ekranlar doğru görünüyor ama gerçek
veriyle çalışamıyor — her ailede "Üner Ailesi" yazar.

Aşağıdaki kısmı Claude Design'a verip dosyaları güncellemesini isteyebilirsin.

---

## PROMPT BAŞLANGIÇ

Daha önce tasarladığın Ödev Defteri ekranlarında bazı yerler sabit örnek
metin içeriyor. Bunlar gerçek veriyle doldurulacak; şablon bağlaması
gerekiyor. **Görsel tasarımı hiç değiştirme** — yalnızca sabit metinleri
değişkenlere çevir ve listeleri döngüye al.

### Pano.dc.html

**1. Hane adı sabit.** Başlıkta `Üner Ailesi` düz metin olarak yazılı.
`{{ haneAdi }}` bağlaması olmalı.

**2. Tazelik göstergesine eylem gerekiyor.** "Güncellendi 12 dk önce" yazısı
şu an düz bir `<div>`. Kullanıcının dokunarak elle tazeleyebilmesi için
tıklanabilir olmalı: `<button>` olsun, `onClick="{{ tazele }}"` alsın ve
erişilebilir bir etiketi olsun (ör. `aria-label="Verileri yenile"`).
Görsel olarak aynı kalsın — düğme gibi durmasın, mevcut tipografi ve renk
korunsun.

### HesapEkranlari.dc.html

**3. Ayarlar ekranındaki ebeveyn listesi sabit.** `Bahadır Üner /
bahadir.uner@gmail.com` ve `Elif Üner / elif.uner@gmail.com` düz metin.
Döngüye alınmalı:

```
<sc-for list="{{ ebeveynler }}" as="p">
  p.harf, p.ad, p.eposta, p.benMiyim  (benMiyim true ise "(siz)" etiketi)
  p.cikar  (çıkarma eylemi; benMiyim true ise düğme gösterilmez)
</sc-for>
```

**4. Ayarlar ekranındaki çocuk listesi sabit.** `Ahmet · 5. sınıf` ve
`Zeynep · 8. sınıf` düz metin. Döngüye alınmalı:

```
<sc-for list="{{ cocuklar }}" as="c">
  c.harf, c.ad, c.sinif, c.renk
  c.baglantiDurumu  ('bekliyor' | 'bagli' | 'koptu')
  c.kaldir          (kaldırma onay ekranına götürür)
  c.yenidenBagla    (yalnızca durum 'koptu' ise görünür)
</sc-for>
```

Bağlantısı kopmuş çocuğun satırında bunun belli olması gerekiyor —
panodaki kopuk bağlantı göstergesiyle tutarlı bir işaret.

**5. Ayarlar ekranındaki hane adı sabit.** `Üner Ailesi` → `{{ haneAdi }}`.
Ayrıca hane adının buradan değiştirilebilmesi gerekiyor: düzenlenebilir
bir alan ya da düzenleme ekranına götüren bir satır.

**6. Kaldırma onayı ekranı sabit.** `Ahmet'in bağlantısı kaldırılsın mı?`
ve gövdedeki tüm `Ahmet` geçişleri `{{ cocukIn }}` ve `{{ cocuk }}`
bağlamalarına çevrilmeli. (`cocukIn` Türkçe tamlayan eki uygulanmış hâli:
"Ahmet'in", "Defne'nin".)

**7. Çocuğun izin ekranındaki ebeveyn adları sabit.**
`Bahadır ve Elif (Üner Ailesi) Classroom ödevlerini görmek için senden izin
istiyor.` cümlesindeki adlar `{{ ebeveynAdlari }}`, hane adı `{{ haneAdi }}`
olmalı. `ebeveynAdlari` hazır birleştirilmiş metin olarak gelecek
("Bahadır ve Elif" / "Bahadır").

**8. QR ızgarası sabit boyutlu.** `grid-template-columns: repeat(25, 6px)`
yazılı. Gerçek davet adresi 25×25'e sığmıyor — 37×37 modül gerekiyor.
Izgara modül sayısını ve modül boyutunu dışarıdan alabilmeli:
`repeat({{ qrModul }}, {{ qrBoyut }})` ve `grid-auto-rows: {{ qrBoyut }}`.
Kutu ölçüsü aynı kalıyor (37 × 4px = 148px ≈ 25 × 6px = 150px).

### Genel

Bu değişikliklerin hiçbiri yerleşimi, boşlukları, renkleri veya tipografiyi
değiştirmemeli. Yalnızca sabit metin → değişken, tekrar eden blok → döngü.

## PROMPT SON

---

## Ara çözüm (şu anki durum)

Bunlar yapılana kadar:

- **Pano hane adı** — her hanede "Üner Ailesi" yazıyor. Kozmetik, engelleyici değil.
- **Ayarlar ve kaldırma ekranı** — gerçek veriye bağlanamıyor, kullanılamaz durumda.
  `/api/hane`, `/api/cocuk`, `/api/ebeveyn` uçları hazır, yalnızca arayüz eksik.
- **Elle tazeleme** — bağlanmadı. Otomatik tazeleme (açılış + sekmeye dönüş)
  çalışıyor, ihtiyacın büyük kısmını karşılıyor.
- **QR** — `temel.css` içinden CSS değişkeniyle eziliyor, çalışıyor. 8. madde
  yapılırsa bu ezme kaldırılabilir.

Çalışan akış: giriş → e-posta → kurulum 1-2 → çocuk bağlama (QR) → çocuğun
izin ekranı → Google → başarı → ebeveyn daveti → pano.
