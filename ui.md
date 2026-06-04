# AURA — UI Estetik Denetim Raporu

Yöntem: canlı site (`karacaismail.github.io/teamslike`) Chrome ile masaüstü
genişliğinde gezildi (Dashboard, Messaging, Support, Docs, Admin, Scheduling),
ekran görüntüleri alındı; bulgular kod tabanında doğrulandı. Mobil kırılım
tarayıcıda görsel doğrulanamadı (viewport emülasyonu çalışmadı); mobil maddeler
kod + e2e temellidir ve öyle işaretlendi.

Önem: P1 = göze batan / kırık, P2 = belirgin kalite kaybı, P3 = cila.

---

## Durum — bu uygulama turunda yapılanlar

Test-first uygulandı; her madde için önce test, sonra implementasyon, sonra
tsc + boundary + vitest + build (370/370 yeşil).

- **[ÇÖZÜLDÜ] §1 i18n ham anahtarı** — `messaging.typing` **ve** ek olarak
  testin yakaladığı `messaging.closePanel` (ikinci gizli bug) en/tr'ye eklendi.
  Tüm statik `t("...")` anahtarlarının iki dilde de var olduğunu doğrulayan
  kalıcı test eklendi (`test/i18n-keys.test.ts`) — bu sınıf hata bir daha
  sessizce geçemez.
- **[ÇÖZÜLDÜ] §2 jenerik skeleton** — 5 yüzey artık kendi geometrisinde
  iskelet kullanıyor: MessageList (baloncuk), ConversationList (ikon+ad+rozet),
  CallHistory (yön ikonu+aksiyon), Clips (küçük resim+önizleme), EventType
  (başlık+çip+slug). Generic `ListSkeleton` yalnız route-fallback'te kaldı.
- **[ÇÖZÜLDÜ] §4 Copilot kalıcılığı** — varsayılan **kapalı** (uiStore);
  TopBar'dan tek tıkla açılıyor. Test eklendi.
- **[YENİDEN DEĞERLENDİRİLDİ] §3 dikey boşluk** — aşağıya bakınız; büyük ölçüde
  seyrek mock veri kaynaklı, layout kusuru değil; bilinçli olarak zorla
  doldurulmadı.
- **[KALAN]** §2 Tables/diğer yüzeylerde hiç-skeleton-yok durumları, §5/§6
  messaging boş-durum + token/tipografi, §7 mobil cila.

---

## 0. En kritik üç bulgu

1. **Ham i18n anahtarı ekrana basılıyor** — Messaging'de altta `messaging.typing`
   yazısı görünüyor (çeviri anahtarı eksik). P1, kesin kırık.
2. **Skeleton jenerik** — tek bir "avatar + 2 satır" iskeleti 6 ayrı yüzeyde
   aynı kullanılıyor; gerçek bileşen geometrisine uymuyor. P1 (asıl şikayet).
3. **Dikey alan kullanımı zayıf** — Docs/Admin/Scheduling sayfalarında içerik
   üst ~400px'lik bir banda sıkışıyor, ekranın alt 2/3'ü boş kalıyor. P1.

---

## 1. İçerik bütünlüğü / i18n

### 1.1 `messaging.typing` ham anahtarı — P1
`TypingIndicator.tsx:30` `t("messaging.typing", { name })` çağırıyor ama
`i18n/en.ts` ve `i18n/tr.ts` içinde `typing` anahtarı **yok**. i18next anahtarı
bulamayınca string'i aynen basıyor → kullanıcı "messaging.typing" görüyor.
Bu, "sonradan eklenen bileşen bozuldu" şikayetinin somut karşılığı: bileşen
eklendi, çeviri anahtarı eklenmedi.

### 1.2 Eksik-anahtar koruması yok — P1
Tek bir eksik anahtar sessizce production'a gitti. Yapısal kök sorun: derleme/
test, eksik i18n anahtarını yakalamıyor. Gerekli: (a) i18next `missingKeyHandler`
ile dev'de gürültülü uyarı, (b) referans verilen tüm statik `t("...")`
anahtarlarının en/tr'de var olduğunu doğrulayan bir test (test-first ile bu
sınıf hatayı kapatır).

---

## 2. Skeleton / yükleme durumu — P1 (asıl şikayet)

Mevcut durum: tek `ListSkeleton` (avatar dairesi + 1/3 ve 2/3 genişlikte iki
çizgi) şu yüzeylerin hepsinde aynen kullanılıyor: `MessageList`,
`ConversationList`, `CallHistory`, `ClipsList`, `EventTypeList` ve route
fallback (`AsyncBoundary`). Shimmer animasyonu doğru, **şekil yanlış**: iskelet
yüklenecek içeriğin yerleşimini taklit etmiyor, dolayısıyla yükleme → içerik
geçişinde layout sıçraması ve "yanlış yer" hissi oluşuyor.

Gerekli: yüzey-bazlı iskeletler, her biri gerçek satır/grid geometrisini
yansıtsın (yapı tanımı, kod değil):

- **MessageListSkeleton**: değişen genişlikte mesaj baloncukları, dönüşümlü
  hizalama (gelen/giden), avatar + ad satırı + 1–3 satır gövde; liste alt
  hizalı (mesajlar aşağıdan başlar).
- **ConversationListSkeleton**: satır = kanal ikonu + ad çizgisi + önizleme
  çizgisi + sağda rozet bloğu; SLA/priority rozet yerleri.
- **CallHistorySkeleton**: satır = yön ikonu + ad/numara iki çizgi + sağda
  süre + iki yuvarlak aksiyon düğmesi yer tutucusu.
- **ClipsListSkeleton**: kart = 12:9 küçük-resim bloğu + başlık + meta + süre
  rozeti; iki sütun grid iskeleti.
- **TableSkeleton** (Docs Tables): başlık satırı + N hücreli M satır grid
  iskeleti (şu an Tables'ta hiç skeleton yok).
- **EventTypeSkeleton**: kart = başlık + süre çipi + atama rozeti + slug çizgisi.

İlke: iskelet, gerçek bileşenin DOM iskeletini (boşluk, hizalama, blok
boyutları) birebir taklit etmeli; shimmer bunun üstüne biner.

---

## 3. Düzen ve dikey ritim — P1

Ekran görüntüleriyle doğrulandı:

- **Docs → Canvas**: doküman kartı + yorumlar paneli yalnız üst ~360px'i
  kaplıyor; altında kocaman boşluk. Kart içeriği sol-üste sıkışmış.
- **Admin → Overview**: 3 kullanım kartı üstte, gerisi boş.
- **Scheduling → Console**: etkinlik tipi + süre + uygunluk + rezervasyon üst
  ~440px'te; altı boş.

Kök sebep: sayfalar `max-w-*` ile ortalanmış kart yığınları kullanıyor, yüksekliği
doldurma/`min-h` yok, mock veri seyrek. Sonuç: geniş/uzun ekranda "yarım sayfa"
hissi.

Gerekli yön: içerik alanını dolduran düzen (esnek grid, sticky ikincil kolon,
boş alanı dolduran ikincil bilgi/önizleme), seyrek listelerde anlamlı boş-durum
görselleri, ve içerik az olduğunda dahi sayfayı dengeleyen min-yükseklik.

**Yeniden değerlendirme (dürüst not):** Ölçüldüğünde bu boşluğun büyük kısmı
**layout kusuru değil, seyrek mock veri** kaynaklı: 1 etkinlik tipi, 3 admin
kartı, tek dokümanlı canvas. Üst-hizalı içerik standart ve doğrudur; içeriği
zorla esnetmek (stretch) çoğu durumda daha kötü görünür. Doğru çözüm: (a) daha
zengin seed verisi, ya da (b) gerçek backend verisi geldiğinde kendiliğinden
dolacak. Bu yüzden bu turda zorla doldurma yapılmadı. Tek istisna adayı: Docs
Canvas editör alanına `min-h` vererek dikey dengeyi iyileştirmek — ileride.

---

## 4. Shell / Copilot — P2

- Copilot paneli her domain'de **açık** geliyor ve sabit 320px yer kaplıyor;
  her sayfada **aynı** "Hi — I am your workspace copilot…" karşılaması tekrar
  ediyor. Kalıcı açıklık + tekrar, içeriği daraltıyor ve estetik olarak boş
  tekrar hissi veriyor.
- Gerekli: varsayılan kapalı ya da context değiştikçe gerçekten içerik
  değiştiren (sadece etiket değil) bir panel; en azından karşılamayı bir kez
  gösterip context'e özel ipuçlarına geçmek.

---

## 5. Domain-özel gözlemler

- **Messaging — P2**: Sol kenarda "No channels in this workspace yet / Create
  your first channel" boş durumu, hemen altındaki dolu "Direct messages"
  listesinin üstünde duruyor; "boş ama dolu" çelişkili görünüm. Boş-durum yalnız
  Channels bölümüne ait olduğu görsel olarak ayrılmalı.
- **Messaging composer — P2/P3**: iki sıra yoğun ikon (biçimlendirme + eklenti
  araçları). Önceliklendirme/taşma menüsü gerek (özellikle dar ekran).
- **Docs Canvas başlığı — P3**: kart üst-solundaki etiketsiz `⌄` açılırı belirsiz
  afford­ance; etiket/tooltip yok.

---

## 6. Tutarlılık / tasarım token'ları — P2–P3

- Kart iç boşlukları tutarsız: `Card` p-5, bazı paneller p-3/p-4, bazı kartlar
  kendi padding'ini eziyor. Tek bir yoğunluk ölçeği uygulanmalı (density token).
- Başlık ölçeği: sayfa başlıkları `text-3xl`, panel başlıkları `text-xl`/`text-base`
  arası dağınık; tipografik hiyerarşi netleştirilmeli.
- İkon-only düğmelerde görünür etiket/tooltip her yerde tutarlı değil (bazı
  yerlerde sadece `aria-label`).

---

## 7. Mobil — kod + e2e temelli (görsel doğrulanamadı)

Tarayıcıda viewport küçültme çalışmadığı için mobil ekranlar görsel olarak
denetlenemedi. Koddan bilinen durum: bottom-nav + "Daha fazla" sheet, messaging/
support tek-panel, Copilot/Thread/Details mobilde tam-ekran overlay mevcut ve
mobil e2e (390px) CI'da koşuyor. Açık kalan mobil estetik: composer aksiyon
yoğunluğu (M11), aktif toplantıda bottom-nav'ın içeriği örtmesi, mobil skeleton
geometrisi (bkz. §2). Bu maddeler ayrı bir mobil-görsel turda doğrulanmalı
(ideali: gerçek cihaz / Playwright screenshot).

---

## 8. Öncelik ve önerilen sıra (test-first)

| # | Bulgu | Önem | Durum |
| --- | --- | --- | --- |
| 1 | i18n ham anahtarı + eksik-anahtar testi | P1 | ✓ çözüldü (+closePanel) |
| 2 | Yüzey-bazlı skeleton geometrisi (5 yüzey) | P1 | ✓ çözüldü |
| 3 | Dikey düzen / boşluk | P1 | yeniden değerlendirildi (seyrek veri) |
| 4 | Copilot kalıcılık/tekrar | P2 | ✓ çözüldü (varsayılan kapalı) |
| 5 | Messaging boş-durum + composer yoğunluğu | P2 | kalan |
| 6 | Token/tipografi tutarlılığı | P2–P3 | kalan |
| 7 | Mobil cila (composer, immersive, Tables skeleton) | P2 | kalan |

Önerilen akış (senin kuralın): her madde için önce test (anahtar-varlık,
skeleton rol/şekil, store varsayılanı), sonra implementasyon, sonra
tsc + boundary + vitest + build + (mobil için) e2e.

---

## 9. Görsel tasarım / estetik — derin re-analiz

Canlı site masaüstünde yakınlaştırılarak (zoom) incelendi ve kodla doğrulandı.
Önceki bölümler işlevsel/kırık sorunlardı; burası **estetik** kalite: ürün
"prototip" gibi mi yoksa "bitmiş" gibi mi duruyor. Şu an genel his: temiz ama
**düz, monokrom ve düşük-kontrastlı** — wireframe'e yakın. En etkili görsel
kazançlar A1–A3.

### A1. Avatarlar tek renk — **P1 (görsel), hızlı kazanç**
`Avatar.tsx` tüm avatarları `bg-accent` ile basıyor: ekrandaki herkes **aynı
mor**. Kişiler bir bakışta ayırt edilemiyor; liste monoton. Yön: addan
deterministik renk (isim hash'i → sabit bir paletten ton). 6–10 renklik,
AAA-kontrast garantili bir avatar paleti token'ı; harf rengi her zeminde okunur.

### A2. Yüzey/derinlik hiyerarşisi yok — **P1 (görsel)**
Kartlar near-white (`raised #fff`) üstünde near-white (`surface #f4f6fa`) + 1px
gri çizgi + `shadow-sm`. `index.css`'te **elevation token yok** (sadece radius
var). Her şey tek düzlemde; birincil/ikincil yüzey ayrımı yok. Yön: 2–3 kademeli
elevation ölçeği token'ı (örn. `--elev-1/2/3` gölge + ince ton farkı), kartlara
hafif gölge, mod/popover'lara daha belirgin; dark temada gölge yerine ton-fark.

### A3. Monokrom palet, renk az kullanılıyor — **P2 (görsel)**
Gri tonları + tek aksan. Veri (stat sayıları, durumlar, kategoriler) renk-kodlu
değil; `positive/warning/danger` token'ları var ama az kullanılıyor. Yön: durum
ve kategori için semantik renk kullanımı yaygınlaştırılsın; aksan dışı en az bir
ikincil vurgu rengi; grafik/rozet/etiketlerde tutarlı renk dili.

### A4. Tipografik ölçek zayıf — **P2 (görsel)**
Aralık dar: sayfa başlığı `text-3xl`, gerisi büyük ölçüde `text-base`. Stat
sayıları büyük ama etiketler/başlıklar birbirine yakın; display/heading/body/
caption katmanları belirsiz. Yön: net tip ölçeği (örn. display, h1–h3, body,
caption), caption/label için `muted` + daha küçük (≥0.875rem) izinli ayrı sınıf,
sayısal vurgular için `tabular-nums` + ağırlık farkı.

### A5. Mesajlaşma "sohbet" gibi durmuyor — **P2 (görsel) + tutarlılık**
DM ekranında mesajlar **baloncuk değil**, düz satır (ad + metin + saat); gelen/
giden hizalaması, gruplama, baloncuk zemini yok — log gibi duruyor. Ayrıca
**tutarsızlık**: yeni eklediğim MessageList skeleton'ı baloncuk şeklinde, gerçek
mesajlar düz satır. Yön: ikisini hizala — ya gerçek baloncuk + hizalama (chat
hissi) ya da Slack-tarzı tutarlı satır; skeleton seçilen gerçeğe uysun.

### A6. Stat kartları yavan — **P3 (görsel)**
"Active workspaces / Open items / AI actions" yalnız sayı + etiket. İkon, trend
(delta), mini-sparkline, renk yok. Yön: ikon + delta + minik trend çizgisi.

### A7. İkonografi düşük-kontrast — **P3 (görsel)**
Domain ikonları küçük ve **soluk** kare içinde (pale-accent zemin); düşük vurgu.
Yön: seçili/aktifte dolu-aksan zemin + beyaz ikon; boyutu büyüt; nav ikon hizası.

### A8. Dashboard "Explore domains" nav'ı tekrarlıyor — **P2 (içerik/estetik)**
Bu kart ızgarası sol menünün birebir kopyası; dolgu hissi ve dikey boşluğun bir
kısmının sebebi. Yön: gerçek özet/aksiyon widget'larıyla değiştir — bekleyen
işlerim, yaklaşan toplantılar, son dökümanlar, SLA-riskli ticketlar (zaten
var olan verilerden).

### A9. Boş durumlar yavan — **P3 (görsel)**
Seyrek ekranlarda büyük beyaz boşluk; boş-durum görselleri zayıf. Yön: ikon +
kısa metin + birincil aksiyonlu, sayfayı dengeleyen boş-durum bileşeni
(skeleton zaten eklendi; boş-durum da aynı özenle).

### A10. Marka karakteri zayıf — **P3**
Genel his "varsayılan Tailwind": tek tip radius/gölge/aksan, imza yok. Yön:
küçük ama tutarlı bir imza dili (tek bir vurgu radius'u, aksan gradyanı/ton
geçişi yalnız birincil aksiyonlarda, tutarlı focus halkası — zaten AAA var).

### Görsel öncelik tablosu

| # | Estetik bulgu | Önem | Durum |
| --- | --- | --- | --- |
| A1 | Avatar renk paleti (hash) | P1 | ✓ çözüldü (`lib/avatarColor` + test) |
| A2 | Elevation/derinlik token'ları | P1 | ✓ çözüldü (`--elev-*` + `.elev-1`, Card) |
| A5 | Skeleton ↔ gerçek mesaj hizası | P2 | ✓ çözüldü (düz satır skeleton) |
| A5b | Gerçek chat baloncuk + hizalama | P2 | kalan (daha büyük redesign) |
| A8 | Dashboard widget'ları (nav tekrarı) | P2 | kalan |
| A3 | Renk kullanımı / semantik | P2 | kalan |
| A4 | Tipografik ölçek | P2 | kalan |
| A6/A7/A9/A10 | stat/ikon/boş-durum/marka | P3 | kalan |

Uygulandı (bu tur, test-first): **A1, A2, A5** — `lib/avatarColor.ts` (+test),
`index.css` elevation token'ları + `.elev-1` (Card), MessageList skeleton'ı düz
mesaj satırına hizalandı. Doğrulama: tsc 0 · boundary temiz · 373/373 test ·
build OK. Kalan en yüksek değer: **A8 (dashboard gerçek widget'lar)** ve **A3/A4
(renk + tipografi ölçeği)**.

---

## Ek — bu denetimde kullanılan kanıtlar

- Ekran görüntüleri: Dashboard, Messaging (ham anahtar görünür), Support, Docs
  Canvas (boş alan), Admin (boş alan), Scheduling (boş alan).
- Görsel zoom (§9): Dashboard kart bölgesi (tüm avatarlar aynı mor; düz/gölgesiz
  kartlar) ve Messaging konuşması (baloncuksuz düz mesaj satırları).
- Kod: `TypingIndicator.tsx:30`, `i18n/en.ts`/`tr.ts` (typing yoktu — eklendi),
  `components/ui/primitives.tsx` (tek `ListSkeleton`), `components/ui/Avatar.tsx`
  (`bg-accent` — tek renk), `index.css` (radius var, **elevation token yok**).
