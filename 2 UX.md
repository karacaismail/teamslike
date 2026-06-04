# AURA — UX / User-Journey Sorun Raporu

> **Kapsam:** Frontend **akış (journey)** sorunları — UI estetiği DEĞİL. "Kullanıcı bir işi baştan sona yapabiliyor mu, yarıda kopuyor mu, geri bildirim/oryantasyon var mı, işi kayboluyor mu?" sorusuna odaklanır. Renk/tipografi/spacing kapsam dışı.
> **Yöntem:** `web/src` üzerinde statik kanıt (grep + okuma). Her madde: **Kanıt → Sorun (journey etkisi) → Yönerge** (kod yok, davranış tarifi).
> **Önem:** **P1** = temel yolculuğu kırıyor / kullanıcının işini kaybettiriyor · **P2** = belirgin sürtünme/tutarsızlık · **P3** = oryantasyon/cila.
> **Not:** Bu bir mock-data prototipidir; aşağıdaki maddeler "gerçek kullanıcı bu akışı denediğinde" yaşanacak sorunları işaret eder, mock olması mazeret değildir çünkü hepsi taşıma katmanından bağımsız UX kararlarıdır.

## 0. Özet

| # | Journey sorunu | Önem | En çok etkilenen |
|---|---|---|---|
| J1 | Reload tüm yolculuğu siliyor (oturum + state kalıcılığı yok) | P1 | Tümü |
| J2 | Deep-linking yok — URL hiçbir alt-durumu taşımıyor | P1 | Messaging, Support, Meetings |
| J3 | Bildirim çıkmaz — tıklayınca hedefe gitmiyor | P1 | Shell / tüm domainler |
| J4 | Birincil CTA'lar sahte başarı veriyor (no-op mock) | P2 | Docs/Clips, Meetings, Telephony, Webinar |
| J5 | Çok-kiracılık görsel ama veri kapsamlanmamış | P2 | Tümü |
| J6 | Kaydedilmemiş-iş koruması yok | P2 | Tüm compose/form |
| J7 | TR hedef kullanıcı İngilizce açılıyor, seçim persist olmuyor | P2 | İlk açılış |
| J8 | RBAC engeli yumuşak çıkmaz (çıkış CTA'sı yok) | P3 | Yetki dışı rotalar |
| J9 | Yükleme-durumu kapsamı ince | P3 | Tüm listeler |
| J10 | İlk-açılış / boş-workspace yolculuğu tasarlanmamış | P3 | Onboarding |

---

## J1. Reload tüm yolculuğu siliyor — **P1 (en kritik)**

- **Kanıt:** `store/authStore.ts` → başlangıç `status: "anonymous"`, `principal: null`; `routes/AuthGate.tsx` → `status !== "authenticated"` ise `LoginPage`. Tüm projede `localStorage`/`sessionStorage`/`persist` **0 kullanım**. Feature store'ları (Zustand) bellek-içi.
- **Sorun (journey):** Kullanıcı kazara **F5'lerse, sekmeyi yenilerse veya kapatıp açarsa**: (a) anında **login ekranına düşer**, (b) gönderdiği mesajlar, yaptığı rezervasyon, kaydettiği klip, değiştirdiği rol/dil/tema — **hepsi sıfırlanır**, (c) nerede olduğunu (hangi kanal/konuşma) kaybeder. Bir prototipte en sık yapılan şey reload'dır; her reload "sıfırdan başla" demektir.
- **Yönerge:** En az **oturum + UI tercihlerini** (dil, tema, son workspace, son seçili kanal) `localStorage`'da persist et (Zustand `persist` middleware). Auth için "demo oturumu" token'ını sakla → reload'da login'e düşme. Feature state'i gerçek backend'e kadar "oturum içi" koru; backend gelince server-state (TanStack Query cache + URL) devralır.

## J2. Deep-linking yok — URL alt-durumu taşımıyor — **P1**

- **Kanıt:** `useParams`/`useSearchParams`/`URLSearchParams` → **0 kullanım**. `routes/router.tsx` düz rotalar (`/messaging`, `/support`, `/meetings`…), nested route yok. Seçili varlık yalnız store'da: `messaging/store.ts` `activeChannelId`/`activeTopicId`; benzeri support/meetings/scheduling. Tüm uygulamada `<NavLink>/<Link>` yalnız **1 dosyada**, navigasyon neredeyse tümüyle programatik (`useNavigate`).
- **Sorun (journey):**
  - **Paylaşım imkânsız:** "Şu konuşmaya/threade/ticket'a bak" diye link gönderilemez — herkes aynı varsayılan ekrana düşer.
  - **Geri/İleri bozuk:** Kanal A → Kanal B seçtikten sonra tarayıcı **geri** tuşu B'den A'ya değil, **tüm /messaging'den çıkarır**. Kullanıcının zihinsel "geri al" modeli çalışmaz.
  - **Reload konum kaybı:** (J1 ile birlikte) hangi kanaldaydım bilgisi gider.
  - **Yeni sekmede aç / orta-tık / "linki kopyala" yok** çünkü öğeler anchor değil.
- **Yönerge:** Alt-durumu URL'e taşı (nested route veya `searchParams`): `/messaging/:channelId/:topicId`, `/support/:conversationId`, `/meetings/:roomId`, `/scheduling/:eventType`. Liste öğelerini gerçek `<Link>` yap. Böylece paylaşılabilir link + geri/ileri + reload-restorasyonu birlikte gelir.

## J3. Bildirim çıkmaz — tıklayınca hedefe gitmiyor — **P1**

- **Kanıt:** `components/shell/NotificationBell.tsx` → satır `onSelect={() => markRead(n.id)}`; `navigate` yok. `AppNotification` tipinde (types/domain.ts) hedef route/entity alanı yok.
- **Sorun (journey):** En temel bildirim yolculuğu kopuk: kullanıcı "**@bahsedildin**", "**sana atandı**", "**toplantı**" bildirimine tıklar → sadece okundu işaretlenir, **ilgili mesaja/göreve/odaya gitmez**. Bildirim bir "bağlama atlama" aracı değil, salt okundu-makbuzu. Kullanıcı bahsi bulmak için manuel olarak domaini gezmek zorunda.
- **Yönerge:** `AppNotification`'a `target: { route, entityId }` ekle; tıkla → `markRead` **+** ilgili yüzeye deep-link (J2 ile aynı route şeması). Aynısı aktivite akışı (ActivityItem) için.

## J4. Birincil CTA'lar sahte başarı veriyor — **P2**

- **Kanıt:**
  - **"Record clip"** (`docs/components/ClipsList.tsx`) → `addClip(...)` yalnız `durationSec:0, transcript:"", views:0` boş satır ekler. Tüm projede `getUserMedia`/`MediaRecorder`/`RTCPeerConnection` **0 kullanım** → gerçek/sahte hiçbir kayıt akışı yok.
  - Sadece-toast CTA'lar: `meetings/RecordingSummaryDialog.tsx` (Download recap), `intelligence/IntelligencePage.tsx` (Export), `telephony/VoicemailInbox.tsx` (Forward), `webinar/Backstage.tsx` (Simulive start), `webinar/CtaBanner.tsx`, `messaging/FileMessage.tsx` (download) → hepsi `push({tone:"positive"})` ile "başarılı" der, **hiçbir artefakt üretmez**.
- **Sorun (journey):** Kullanıcı "indir / dışa aktar / kaydet / kaydı başlat" bekler; ekran **"başarılı"** der ama dosya inmez, klip kaydedilmez. Akış testinde bu **güven kırıcı** ve "buton bozuk mu, ben mi yanlış yaptım?" belirsizliği yaratır. Özellikle Loom'un manşet eylemi olan **Record**, bir kayıt yolculuğuna hiç girmiyor.
- **Yönerge:** Mock CTA'larda **dürüst durum**: ya görünür "demo / yakında" rozeti + bilgilendirici toast ("bu demoda kayıt simüledir"), ya da **gerçek bir mock akış** (Record → pre-capture izinleri → kaynak seç → sahte ilerleme → düzenleyiciye düş). "Başarılı" demeden önce ya gerçek sonuç ver ya da beklentiyi düşür.

## J5. Çok-kiracılık görsel ama veri kapsamlanmamış — **P2**

- **Kanıt:** `components/shell/WorkspaceSwitcher.tsx` → `setTenant`/`setWorkspace` (sadece `tenantStore`'daki id'ler + accent). Feature store'ları (`messaging/store.ts` vb.) `workspaceId`'ye göre **seed/filtre edilmiyor** — tek global seed.
- **Sorun (journey):** Kullanıcı workspace değiştirir → üst etiket ve vurgu rengi değişir ama **kanallar, toplantılar, ticket'lar aynı kalır**. "Başka workspace'e geçtim ama aynı içerikleri görüyorum" → multitenant zihinsel modeli kırılır, geçişin bir anlamı yokmuş gibi hisseder.
- **Yönerge:** En azından workspace başına farklı seed göster; sorgu anahtarlarını `workspaceId` ile kapsamla. Backend'de tenant-scoped query (zaten plandaki ilke). Geçişte aktif seçimleri (kanal vb.) sıfırla/yeniden çöz.

## J6. Kaydedilmemiş-iş koruması yok — **P2**

- **Kanıt:** `beforeunload`/`useBlocker`/`usePrompt` → **0 kullanım**.
- **Sorun (journey):** Uzun mesaj / doküman bloğu / rezervasyon formu / bot-flow yazarken kullanıcı sol nav'a tıklar veya geri tuşuna basarsa → **sessizce kaybolur**, uyarı yok. J1 (persist yok) ile birleşince: yanlış tık = iş gitti.
- **Yönerge:** Kirli (dirty) compose/form state'i varken route değişiminde `useBlocker` ile onay; sekme kapanışında `beforeunload`. En azından taslakları oturum-içi sakla.

## J7. TR hedef kullanıcı İngilizce açılıyor, seçim persist olmuyor — **P2**

- **Kanıt:** `i18n/index.ts` → `lng: "en"`, `fallbackLng: "en"`, tarayıcı dili algılama yok. `components/shell/TopBar.tsx` dil değiştirebiliyor (`i18n.changeLanguage`) ama seçim persist edilmiyor (J1).
- **Sorun (journey):** Türkiye SMB hedef kitlesi için **ilk açılış İngilizce**. Kullanıcı TR'ye geçse bile her reload'da yeniden İngilizce'ye döner → her oturumda aynı sürtünme.
- **Yönerge:** Tarayıcı/OS dilini algıla (TR varsa öncelik); seçimi persist et (J1 mekanizması). İlk açılışta hedef pazara uygun varsayılan.

## J8. RBAC engeli yumuşak çıkmaz — **P3**

- **Kanıt:** Sayfalar `can(...)` ile self-guard yapıyor (iyi) ama bloklu durumda `forbidden.title/body` Card'ı gösteriyor — **çıkış/yönlendirme CTA'sı yok** (`meetings/MeetingsPage.tsx` vb.).
- **Sorun (journey):** Guest `/admin`'e URL ile gelir → "yetkin yok" görür ama oradan **ileri net yol yok** (yalnız sol nav'ı kendi bulması gerekir). Çıkmaz hissi.
- **Yönerge:** Forbidden ekranına "Panele dön" veya kullanıcının izinli **ilk** sayfasına yönlendiren birincil CTA ekle.

## J9. Yükleme-durumu kapsamı ince — **P3**

- **Kanıt:** `EmptyState` 9 dosyada (iyi), ama `ListSkeleton`/`Skeleton` yalnız **2 dosyada**. Listeler store seed'inden senkron render; `api.ts` `delay<T>()` var ama bileşenler store'dan okuyor.
- **Sorun (journey):** Gerçek API'ye (FastAPI) geçişte çoğu liste **boş→dolu zıplayacak**; ilk-yük yollarında iskelet yok → kullanıcı "boş mu, yükleniyor mu?" ayrımını yapamaz.
- **Yönerge:** Liste/panel başına `…ListSkeleton` + `AsyncBoundary`; öncelik ilk-yük ve ağ-bağımlı yüzeyler. (gap.md P1 ile örtüşür, oradaki iskelet maddesini tamamla.)

## J10. İlk-açılış / boş-workspace yolculuğu tasarlanmamış — **P3**

- **Kanıt:** Veri hep seed'li → gerçek "boş workspace" (0 kanal / 0 klip / 0 ticket) hiç görünmüyor. `routes/DashboardPage.tsx` welcome + copilot önerileri var ama getting-started akışı yok.
- **Sorun (journey):** Gerçek yeni kullanıcı/yeni workspace ilk girişte ne yapacağını gösteren bir yol bulamaz; demo hep "dolu" başladığı için bu senaryo hiç test edilmemiş.
- **Yönerge:** Gerçek boş durumlar için **getting-started / ilk-eylem** yönlendirmesi (ilk kanalı oluştur, ilk klibi kaydet, ilk event type'ı tanımla). Empty state'leri "boş + aksiyon" olarak tasarla.

---

## Öncelik & Önerilen İlk Tur

**P1 üçlüsü birbirini besliyor — birlikte çözülmeli:**
1. **J2 (deep-link / URL state)** temel: alt-durum URL'e taşınınca J1'in "konum kaybı" ve J3'ün "hedefe gitme" parçaları da çözülür.
2. **J1 (persist)** auth + tercih + (oturum-içi) state → reload artık yolculuğu silmez.
3. **J3 (bildirim deep-link)** J2 route şemasının üstüne oturur.

Bu üçü, "tıkla-gez" prototipini **gerçekten kullanılabilir** bir akışa çevirir. Ardından J4 (dürüst CTA'lar — özellikle Record), J5–J7 (tutarlılık), sonra J8–J10 (cila).

**Not:** Hiçbiri backend gerektirmez — hepsi frontend route/state/feedback kararıdır; gerçek backend gelince aynı route+persist iskeleti server-state ile uyumludur.
