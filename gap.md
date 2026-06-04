# AURA — UI Gap Analizi

> **Kapsam:** Yalnızca **mevcut UI bileşenlerindeki boşluklar** — eksik affordance, durum (state) ekranı, erişilebilirlik, duyarlılık ve yapı eksikleri. **Yeni ürün özelliği önerilmez.** Domain mantığı/iş kuralı kapsam dışı.
> **Format (vibecoding):** Her madde kod içermez; yönerge verir → *Bileşen hiyerarşisi · Props/State · Davranış kuralı · Stil token'ı*. ASCII/wireframe yok.
> **Kanıt:** İddialar `web/src` üzerinde statik tarama ile doğrulandı (grep/okuma). Dosya yolları `web/src/...` köküne görelidir.
> **Önem:** P1 = işlevi engelliyor/erişilemez · P2 = belirgin UX eksiği · P3 = cila.

## 0. Özet

| # | Kategori | Önem | En çok etkilenen yüzeyler |
|---|---|---|---|
| 1 | Aksiyon keşfedilebilirliği + context menu | P1 | Messaging |
| 2 | Yükleme / boş / hata durumları | P1 | Tümü |
| 3 | Yıkıcı eylem onayı | P1 | Messaging, Meetings, Scheduling, Docs |
| 4 | Klavye & sekme (tab) deseni | P1 | Phone/Docs/Scheduling/Support/Webinar |
| 5 | Geri bildirim & optimistic UI | P2 | Tümü |
| 6 | Duyarlı (responsive) düzen | P1 | Support, Meetings, Messaging |
| 7 | Tutarlılık (eylem yeri/etiket) | P2 | Tümü |
| 8 | Görünür durum & senkron | P2 | Messaging |
| 9 | Erişilebilirlik (ARIA/motion/focus) | P1 | Tümü |
| 10 | Global hata sınırı & bağlantı durumu | P1 | Shell |
| 11 | Form & giriş geri bildirimi | P2 | Tüm formlar |
| 12 | Mikro-etkileşim (DnD, inline edit ipucu) | P3 | Docs, Messaging |

---

## 1. Aksiyon keşfedilebilirliği + context menu — **P1**

### 1.1 Mesaj eylemleri yalnız hover'da ve `⋯` içinde gizli
- **Kanıt:** `features/messaging/components/MessageBubble.tsx` — araç çubuğu `absolute … opacity-0 group-hover:flex group-focus-within:flex`; Save/Pin/Forward/Important `⋯` (DotsThree) menüsünde, iki tık derinde.
- **Boşluk:** Fare hover'ı olmadan hiçbir eylem görünmez (statik/ekran görüntüsünde "aksiyon yok" algısı). Dokunmatik ve salt-klavye kullanıcısı erişemez.
- **Yönerge:**
  - *Bileşen:* `MessageActionBar` (kalıcı, en sık 3: React · Reply · Save) + `MessageOverflowMenu` (`⋯`, kalanı). Mevcut tek-`⋯` deseni ikiye ayrılır.
  - *Davranış:* görünürlük `opacity-0 group-hover/focus-within` yerine: hover/focus-within'de tam set; **temas/dar ekranda ilk eylem grubu kalıcı**. Geçiş anında (motion-reduce uyumlu).
  - *State:* görünürlük türetilir (hover/focus); kalıcı kısım için ek state yok.
  - *Token:* `h-8`, `gap-0.5`, `rounded-md`, kalıcı çubuk `bg-raised/0` → focus'ta `bg-surface`; her buton `focus-visible:ring-2 ring-accent`.
  - *WCAG:* 2.1.1 Klavye, 2.5.5 hedef boyutu (≥44px dokunmatik).

### 1.2 Uygulama-içi sağ-tık (context menu) hiç yok
- **Kanıt:** Tüm `web/src` içinde `onContextMenu` = **0 kullanım**. Mesaja sağ-tık tarayıcının yerel menüsünü açar (kullanıcı raporu).
- **Boşluk:** Masaüstü kullanıcısının ilk refleksi (sağ-tık → Save/Pin) karşılıksız.
- **Yönerge:**
  - *Bileşen:* `ContextMenu` (Radix `@radix-ui/react-context-menu`) sarmalayıcı; içerik `MessageOverflowMenu` ile **aynı eylem listesini** paylaşır (tek kaynak).
  - *Davranış:* satır/balon kökünde `onContextMenu`; klavye `Shift+F10`/Menü tuşu ile de açılır.
  - *Kapsam:* aynı desen ConversationList satırı, KanbanCard, oda kartı, kuyruk satırı için tekrarlanır.
  - *WCAG:* 1.3.1 (yapı), 2.1.1.

### 1.3 Hover araç çubuğu klav­yeyle açılamıyor (yalnız `focus-within`)
- **Boşluk:** Çubuk yalnız balon içine focus girince açılıyor; ama balonda odaklanılır eleman yoksa (salt metin) klavyeyle ulaşılamaz.
- **Yönerge:** Her mesaj satırına `tabindex=0` + `role="article"`; `Enter`/`Space` → eylem çubuğu/menüsü. Roving tabindex ile satırlar arası `ArrowUp/Down`.

---

## 2. Yükleme / boş / hata durumları — **P1**

### 2.1 `Skeleton` primitive'i tanımlı ama hiç kullanılmıyor
- **Kanıt:** `components/ui/primitives.tsx:106` `export function Skeleton(...)`; tüm projede başka kullanım yok (grep). Sayfalar zustand seed'inden senkron render ediyor; `api.ts` `delay()` var ama bileşenler store'dan okuyor → **hiçbir yüzeyde yükleme iskeleti yok.**
- **Boşluk:** Gerçek httpClient'e geçişte (FastAPI) tüm listeler boş→dolu zıplayacak; iskelet katmanı yok.
- **Yönerge:**
  - *Bileşen:* her liste/panel için `…ListSkeleton` (Skeleton kompozisyonu). Sarmalayıcı `AsyncBoundary` (Suspense + ErrorBoundary) deseni.
  - *State:* `isPending` (TanStack Query) → skeleton; veri → içerik. Mock'ta `delay` + Suspense ile simüle edilebilir.
  - *Token:* `animate-pulse`, `bg-surface`, satır yüksekliği gerçek içerikle birebir (layout shift yok).
  - *Kapsam:* ConversationList, MessageList, CallHistory, VoicemailInbox, BookingsCalendar, AuditLogViewer, Webinar EventConsole, Docs listeleri.

### 2.2 Hata durumu (error state) UI'ı yok
- **Kanıt:** `role="alert"`/`ErrorBoundary` = 0 kullanım.
- **Boşluk:** Fetch/mutation hata verirse kullanıcıya geri bildirim + "yeniden dene" yok.
- **Yönerge:** *Bileşen:* `ErrorState` (ikon + mesaj + "Yeniden dene" butonu) ve list-içi `InlineError`. *Davranış:* retry → query.refetch. *Token:* `text-danger`, `border-danger/40`.

### 2.3 Boş durum (empty state) tutarsız
- **Kanıt:** Bazı listelerde var (`messaging.savedEmpty`, `phone.queue.empty`, `scheduling.workspace.mineEmpty`, `support.empty`), bazılarında düz boş `<ul>`.
- **Boşluk:** Standart `EmptyState` bileşeni yok; mesaj/ikon/aksiyon biçimi her yerde farklı.
- **Yönerge:** *Bileşen:* tek `EmptyState{ icon, title, hint?, action? }`; tüm boş listeler buna geçer. *Token:* dikey ortalı, `text-muted`, `py-8`.

---

## 3. Yıkıcı eylem onayı — **P1**

### 3.1 `ConfirmAction` yalnız admin'de; diğer yıkıcı eylemler onaysız
- **Kanıt:** `ConfirmAction` kullanımları yalnız `features/admin/*`. Onaysız yıkıcılar: MessageBubble `deleteForEveryone`/`deleteForMe`; MeetingsLanding `deleteRoom`; meetings `endForAll`; BookingsCalendar `cancel`; ContactPanel etiket sil; Docs kart/blok sil yolları.
- **Boşluk:** Tek tıkla geri-alınamaz silme; "geri al" (undo) yok.
- **Yönerge:**
  - *Bileşen:* hafif `ConfirmDialog{ title, body, confirmLabel, variant:"danger" }` (admin'deki "yazarak doğrula" yalnız yüksek-risk; çoğu için tek-tık onay yeterli).
  - *Davranış tercihi:* yıkıcı + sık eylemlerde (mesaj sil) **5 sn "Geri al" toast'ı** (optimistic + reversible); nadir/ağır eylemlerde (odayı sil, herkes için bitir) **modal onay**.
  - *Token:* danger buton `bg-danger text-white`; toast `role="status"`.
  - *WCAG:* 3.3.4 (hata önleme — geri alınabilirlik/onay).

---

## 4. Klavye & sekme (tab) deseni — **P1**

### 4.1 Özel sekme çubuklarında klavye ok-tuşu navigasyonu yok
- **Kanıt:** `role="tab"`/`aria-selected` 12 dosyada; özel çubuklar (`PhoneLayout`, `DocsPage`, `SchedulingPage`, `SupportLayout`, `webinar/EventConsole`) düz `<button role="tab">`. `PhoneLayout`'ta `onKeyDown`/`tabIndex`/roving yok.
- **Boşluk:** WAI-ARIA Tabs deseni eksik: `Tab` ile her sekmeye tek tek girilir (roving değil), `ArrowLeft/Right` çalışmaz, `tablist` ile `tabpanel` `aria-controls/labelledby` bağı yok.
- **Yönerge:**
  - *Bileşen:* paylaşılan `Tabs`/`TabList`/`Tab`/`TabPanel` (Radix Tabs veya roving-tabindex hook). Tüm özel çubuklar buna göç eder.
  - *Davranış:* roving `tabIndex` (aktif=0, diğerleri=-1); `ArrowLeft/Right` taşır+seçer; `Home/End`; `tabpanel` `tabindex=0` + `aria-labelledby`.
  - *State:* aktif sekme `useState` zaten var; sadece klavye davranışı eklenir. Ek: aktif sekme **URL/`localStorage`'a yazılmalı** (yenilemede korunsun — şu an kayboluyor).
  - *WCAG:* 2.1.1, 4.1.2.

### 4.2 `focus-visible` halkası tutarsız
- **Boşluk:** İkon-buton/primitive'lerde `focus-visible:ring` her yerde garanti değil; bazı özel `<button>`'larda yalnız `hover:` var.
- **Yönerge:** Global: tüm interaktif öğeler `focus-visible:ring-2 ring-accent ring-offset-1`. Primitive `Button`/`IconButton`'da zorunlu; özel button'lar primitive'e göç eder.

---

## 5. Geri bildirim & optimistic UI — **P2**

### 5.1 Mutasyon geri bildirimi tutarsız
- **Kanıt:** `useToastStore` bazı yerlerde var (composer, kuyruk atama, pickup), bazılarında yok (pin/save, etiket ekle/sil, blok düzenle, oda sil, booking iptal, policy toggle dışı admin eylemleri).
- **Yönerge:** *Kural:* her kullanıcı-tetiklemeli kalıcı mutasyon → ya optimistic anlık görsel değişim ya da `toast`. *Bileşen:* tek `useMutationToast` yardımcı deseni.

### 5.2 Kopyalama sessiz
- **Kanıt:** MeetingsLanding personal-room kopya + MessageBubble "copy" → `navigator.clipboard.writeText`; bazısında toast var, personal-room'da yok.
- **Yönerge:** Kopyala eylemleri tek `copyWithToast(text)` üzerinden; `toast("Kopyalandı")` standardı.

---

## 6. Duyarlı (responsive) düzen — **P1**

### 6.1 Sabit px genişlikli paneller, dar ekran kırılması
- **Kanıt:** `SupportLayout` `w-48`/`w-80`/`w-72`; `ContactPanel w-72`; meetings yan paneller sabit. Mobil/dar viewport için collapse/drawer yok.
- **Boşluk:** <900px'te 4 panel yan yana sığmaz; yatay taşma/sıkışma.
- **Yönerge:**
  - *Bileşen:* `ResponsivePanes` — `lg`'de yan yana, altında **tek aktif pane + alt sekme/segment** (Inbox · Sohbet · Kişi). `ContactPanel`/`DetailsPanel` `Drawer`'a iner.
  - *Token:* sabit `w-72` → `w-full max-w-72 lg:w-72`; breakpoint `lg`.
  - *Kapsam:* Support 4-pane, Messaging (sidebar+liste+thread+details), Meetings (stage+side panel).

### 6.2 Arama mobilde tamamen gizli
- **Kanıt:** `ChannelHeader` arama `relative hidden sm:block` → küçük ekranda kaybolur, alternatif yok.
- **Yönerge:** Dar ekranda arama ikonu → tam-genişlik arama overlay'i (toggle). `hidden sm:block` yerine `IconButton`(mobil) + genişleyen input.

---

## 7. Tutarlılık (eylem yeri & etiket) — **P2**

### 7.1 Aynı kavram farklı yerde/biçimde
- **Boşluk:** "Kaydet" mesajda `⋯`'de; "Kaydedilenler" başlık çubuğunda bookmark; ikisi görsel olarak ilişkilendirilmemiş. "Önemli" badge'i ile "Acil" badge'i farklı tetikleyici yollarında.
- **Yönerge:** *Kural:* aynı domain eylemi her yüzeyde aynı ikon + etiket + yerleşim. `ActionRegistry` (ikon+label+handler eşlemesi) ile menü/araç çubuğu/komut paleti tek kaynaktan beslenir.

### 7.2 İkon-only butonlarda görünür etiket/tooltip eksikliği
- **Kanıt:** Çoğu `IconButton`'da `aria-label` var (iyi) ama görünür `title`/tooltip yok; yeni kullanıcı ikon anlamını tahmin eder.
- **Yönerge:** `IconButton`'a opsiyonel `tooltip` (Radix Tooltip) — `aria-label` + görsel tooltip birlikte.

---

## 8. Görünür durum & senkron — **P2**

### 8.1 "Pinned" afişi yalnız sayısı + ilk pini gösteriyor
- **Kanıt:** ChannelHeader pinned banner `Pinned (1)` + tek özet; birden çok pin olduğunda **tüm pinleri gösteren liste yok** (SavedDrawer benzeri "PinnedDrawer" yok).
- **Yönerge:** *Bileşen:* `PinnedDrawer` (SavedDrawer ile aynı desen); banner tıklayınca açılır; `n>1` ise "Tümünü gör (n)".

### 8.2 `savedOnly` gibi filtre durumları görsel olarak zayıf
- **Boşluk:** Aktif filtreler (savedOnly, kanal filtresi) aktifken belirgin bir "filtre aktif / temizle" göstergesi yok.
- **Yönerge:** Aktif filtre → `FilterChip`(kapatılabilir, `×`); başlıkta "Filtreleri temizle".

### 8.3 Sekme/görünüm durumu kalıcı değil
- **Boşluk:** Sayfa yenilenince aktif sekme (Phone/Docs/Support otomasyon vb.) sıfırlanır.
- **Yönerge:** Aktif sekme `localStorage` veya `?tab=` query param; geri/ileri ile uyumlu.

---

## 9. Erişilebilirlik (ARIA / motion / focus) — **P1**

### 9.1 `aria-live` tutarsız
- **Kanıt:** ~14 dosyada `aria-live` var; canlı değişen bölgelerin bir kısmında yok (yeni mesaj geldiğinde liste, toast bazı türlerde).
- **Yönerge:** Tek `LiveRegion` sağlayıcı; bildirim türleri `polite`/`assertive` standardı. Yeni mesaj/çağrı durumu `polite`.

### 9.2 `prefers-reduced-motion` yok
- **Boşluk:** Reaksiyon animasyonu, hover geçişleri, (gelecek) skeleton pulse için reduced-motion dalı yok.
- **Yönerge:** Global `motion-reduce:transition-none motion-reduce:animate-none`; animasyonlu bileşenlerde zorunlu.

### 9.3 Dialog/menu focus-trap & geri-dönüş
- **Boşluk:** Modallar Radix ise trap gelir; özel overlay'lerde (arama, picker) odak tuzağı + kapanışta tetikleyiciye dönüş garanti değil.
- **Yönerge:** Tüm overlay'ler Radix `Dialog`/`Popover`/`DropdownMenu` üzerinden; `onCloseAutoFocus` ile tetikleyiciye dön.

### 9.4 Renk-kontrast AAA hedefi doğrulanmıyor (UI tarafı)
- **Kanıt:** `text-muted` üzerine `bg-surface`/`bg-raised` kombinasyonları çok yerde; AAA (7:1) otomatik doğrulanmıyor (axe jsdom renk-kontrastı atlıyor).
- **Yönerge:** Token düzeyinde `muted/surface` çiftlerini ≥7:1'e sabitle; Playwright+axe ile gerçek-tarayıcı kontrast testi (zaten CI planında — etkinleştir).

---

## 10. Global hata sınırı & bağlantı durumu — **P1**

### 10.1 ErrorBoundary yok
- **Kanıt:** `ErrorBoundary` = 0. Bir bileşen render hatası tüm uygulamayı düşürür (beyaz ekran).
- **Yönerge:** Route düzeyinde `RouteErrorBoundary` (react-router `errorElement`) + uygulama kökünde genel `AppErrorBoundary` (fallback + "yeniden yükle").

### 10.2 Bağlantı/gerçek-zaman durumu görünmüyor
- **Boşluk:** WS/SSE (call.*, conversation.*, event.*) "bağlı/yeniden bağlanıyor/çevrimdışı" göstergesi yok.
- **Yönerge:** Shell üst barda `ConnectionStatus` rozeti (online/reconnecting/offline); offline'da yazma alanları `disabled` + uyarı şeridi.

---

## 11. Form & giriş geri bildirimi — **P2**

### 11.1 Inline doğrulama görünürlüğü zayıf / `aria-invalid` yok
- **Kanıt:** RegistrationBuilder hata mesajı var (`regError`), ama genel formlarda (kanal adı, etiket, oda adı, booking) hata satırı + `aria-invalid`/`aria-describedby` tutarlı değil.
- **Yönerge:** `Field{ label, error?, required? }` sarmalayıcı: hata → `aria-invalid` + `aria-describedby`, kırmızı border + alt mesaj; `required` → görsel `*` + `aria-required`.

### 11.2 Disabled buton "neden" göstermiyor
- **Boşluk:** Disabled gönder/ata butonları sebep bildirmiyor (örn. "metin boş", "bekleyen yok").
- **Yönerge:** Disabled durumda `title`/tooltip ile sebep; veya yardımcı metin.

### 11.3 Karakter/limit göstergesi yok
- **Boşluk:** Composer, durum, blok girişlerinde uzunluk/limit göstergesi yok (Webex 2GB, mesaj limiti gibi alanlar için).
- **Yönerge:** Limitli alanlarda `CharCounter` (mevcut/maks); aşımda `text-danger`.

---

## 12. Mikro-etkileşim — **P3**

### 12.1 Kanban yalnız ok-buton ile taşıma (sürükle-bırak yok)
- **Kanıt:** `docs/components/KanbanBoard.tsx` — `CaretLeft/Right` ile taşıma (klavye-erişilebilir alternatif = iyi) ama pointer drag-drop affordance'ı yok.
- **Yönerge:** DnD katmanı (pointer) **ek** olarak; ok-butonlar erişilebilir yedek kalır. Sürüklenebilir kartta `cursor-grab` + drop hedefi vurgusu. (Davranış katmanı; yeni domain değil.)

### 12.2 Inline-edit alanları "düzenlenebilir" ipucu vermiyor
- **Kanıt:** CanvasEditor blok input'ları şeffaf; Scheduling/Admin inline input'lar. Hover/focus'ta düzenlenebilirlik sinyali zayıf.
- **Yönerge:** Inline-edit alanına `hover:bg-surface` + kalem ikonu (focus'ta) + `focus:bg-surface ring-1`; salt-okuma görünümünden ayırt edilsin.

### 12.3 Reaksiyon seçiminde yalnız 6 hızlı emoji
- **Kanıt:** MessageBubble reaksiyon menüsü `QUICK_REACTIONS` (6). Tam emoji arama yok (composer'da `EmojiPicker` var ama reaksiyonda kullanılmıyor).
- **Yönerge:** Reaksiyon menüsüne "+" → mevcut `EmojiPicker`'ı yeniden kullan (tek bileşen, iki giriş noktası).

---

## Uygulama sırası (öneri)

1. **P1 temel altyapı:** `AsyncBoundary`+`Skeleton` kullanımı (§2), `ErrorBoundary` (§10.1), paylaşılan `Tabs` klavye deseni (§4), `ConfirmDialog`/undo-toast (§3).
2. **P1 keşfedilebilirlik/responsive:** kalıcı `MessageActionBar`+`ContextMenu` (§1), `ResponsivePanes`+drawer (§6).
3. **P2 tutarlılık:** `ActionRegistry` (§7.1), `EmptyState`/`Field`/`FilterChip` standartları (§2.3, §11, §8.2), toast tutarlılığı (§5).
4. **P3 cila:** DnD, inline-edit ipuçları, reaksiyon emoji arama (§12).

> Not: Maddeler **mevcut bileşenlerin tamamlanması**dır; hiçbiri yeni ürün özelliği değildir. Her madde bağımsız uygulanabilir ve mevcut test setini (258+ test) bozmadan additif yapılabilir.
