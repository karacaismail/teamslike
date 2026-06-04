# AURA — Eksikler ve Sorunlar (Bağımsız Denetim)

> **Kapsam:** Yalnızca **frontend** (`web/`). DDD bounded-context bakışıyla. Yeni özellik tasarımı değil; **mevcut durumla plan/DoD arasındaki açıkları** ve **somut teknik sorunları** tespit eder.
> **Yöntem:** `web/src` üzerinde statik tarama + bağımsız çalıştırma (`tsc`, `vitest` örneklemi, `vite build`). Her madde: **Kanıt → Boşluk → Yönerge**. Kod içermez.
> **Önem:** P1 = mimari/kalite riski, yayılım etkili · P2 = belirgin açık · P3 = cila/tutarlılık.

## 0. Bağımsız Doğrulama (summary.md iddiaları)

| Kontrol | İddia | Bağımsız sonuç |
|---|---|---|
| `tsc --noEmit` | temiz | **Doğru** — exit 0 |
| `vite build` | temiz | **Doğru** — exit 0 (3.4s), ama chunk-size uyarısı var (bkz. A5) |
| Birim test | 312 yeşil | **Örneklemde doğrulandı** — smoke+phase1+a11y+docs = 36/36 yeşil. Tam paket sandbox'ta 45s sınırını aşıyor; örneklem temiz. |
| EN/TR i18n paritesi | tip-zorunlu | **Doğru** — `tr.ts: AppResources = typeof en` |

Kod hijyeni gerçekten yüksek: `: any` = 0 (tek eşleşme yorum), `@ts-ignore` = 0, `dangerouslySetInnerHTML` = 0 (rich.tsx bilinçli kaçınıyor), gerçek `TODO/FIXME/HACK` borç notu = 0. **Sorunlar kozmetik değil, mimari ve süreç düzeyinde.**

---

## A. SORUNLAR (mevcut kodda)

### A1. Kimlik/üye dizini bir bounded-context'e gömülü — **P1 (DDD ihlali)**
- **Kanıt:** `features/messaging/members.ts` `memberName`/`memberById` tanımlar; bunu **6+ alan** import ediyor: `scheduling/WorkspaceReservation`, `intelligence/{RecapPanel,TranscriptViewer,SpeakerAnalytics}`, `meetings/{SidePanel,EngagePanel,MeetingsLanding,RecordingSummaryDialog,BreakoutManager,store}`.
- **Boşluk:** Kanonik kaynak `data/team.ts` (platform katmanı) olmasına rağmen erişim yardımcıları **messaging** context'inde yaşıyor. Diğer context'ler kimlik için messaging'e bağımlı → **bağımlılık yönü ters**. Plan §4'teki `IAM`/Identity platform context'i koda yansımamış.
- **Yönerge:** Identity'yi açık-host servis yap: `lib/identity` (veya `features/identity`) altında `memberName`/`memberById`/presence erişimi tek kaynaktan. `messaging/members.ts` yalnızca yeniden-export'a indirgenir; diğer alanlar messaging yerine identity'den okur.

### A2. Plandaki kesişen platform context'leri yok — **P1**
- **Kanıt:** `Search`, `Files`, `Presence`, `Realtime`, `Identity` için ayrı dizin/modül **yok** (tarama: hiçbiri). `store/` yalnızca auth/tenant/ui/copilot/toast/notification içeriyor.
- **Boşluk:** Plan §4/§13/§A bunları "bir kez yazılan, çok domain tüketen open-host service" olarak tanımlar. Pratikte: arama messaging'e özel (`GlobalSearchDialog`), presence sadece `PresenceDot` + `TeamMember.presence` alanı, realtime yalnızca tipli `*Event` + mock dispatcher (canlı taşıma yok), files hiç yok.
- **Yönerge:** En azından **Search** ve **Presence/Realtime** için ince birer kesişen sözleşme katmanı tanımla (port arayüzü + mock adapter). Files'ı bilinçli "sonra" olarak işaretle. Aksi halde her domain kendi mini-aramasını çoğaltıyor (tutarsızlık riski).

### A3. Context-arası store sızıntısı (ACL bypass) — **P1**
- **Kanıt:** `intelligence/RecapPanel` ve `meetings/SidePanel` doğrudan `useMessagingStore` import ediyor. `features/integration.ts` zaten bir anti-corruption/orkestrasyon katmanı sağlıyor (`useOpenIntelligence`, `useStartMeetingFromChannel`, `useJoinCall`) — ama bu iki yer onu **atlıyor**.
- **Boşluk:** Bir context'in iç store'una başka context'in doğrudan erişmesi, refactor'da kırılganlık ve gizli bağ yaratır. Var olan doğru desen (integration.ts) tutarlı uygulanmamış.
- **Yönerge:** Messaging verisine ihtiyaç duyan dış erişimleri `integration.ts` üzerinden seçici (selector) sözleşmelerle geçir; bileşenler store'a değil, integration hook'larına bağlansın.

### A4. Mimari guardrail (lint) hiç kurulmamış — **P1**
- **Kanıt:** `.eslintrc*`/`eslint.config.*` **yok**, `eslint` bağımlılıklarda **yok**. CI (`ci.yml`) yalnızca typecheck → test → build → e2e.
- **Boşluk:** DoD "**bağımlılık-sınırı lint temiz**" ve "literal string yakalama (i18next-extract)" diyor; ikisi de mevcut değil. A1/A3'teki sızıntıların **otomatik yakalanamamasının sebebi bu**. Tek savunma `tsc` + testler.
- **Yönerge:** ESLint + `eslint-plugin-boundaries` (veya `import/no-restricted-paths`) ile feature-arası importu yasakla (yalnız `lib/`, `components/ui`, `data/`, `integration.ts` serbest). Hardcoded string kuralı ekle. CI'ya `lint` adımı koy.

### A5. Icon vendor chunk'ı 535 kB — ~~tree-shake edilmiyor~~ **DÜZELTME: yanlış teşhis** — **P3**
- **İlk iddia (YANLIŞ):** "Phosphor tree-shake edilmiyor, tüm 1200 ikon geliyor."
- **Gerçek (kanıtlı):** Üretilen `vendor-icons` chunk'ı tam **182 bileşen** (181 kullanılan ikon + IconBase) ve 1267 path bloğu içeriyor (~7 path/ikon = 6 ağırlık varyantı) — yani **tree-shaking zaten çalışıyor**. 535 kB, 181 ikonun her birinin 6 ağırlık varyantını (thin…duotone) SVG path olarak taşımasının **inherent** maliyetidir; ağırlık başına tree-shake mümkün değildir (hepsi tek modülde).
- **Kalan boşluk (küçük):** Tüm ikonlar tek `vendor-icons` chunk'ında açılışta yükleniyor. Gerçek düşürme yolları: kullanılan **distinct ikon sayısını** azaltmak, ya da ikonları route-chunk'larına dağıtmak (ama ~181 micro-chunk üretir; HTTP overhead). İkisi de ROI'si düşük.
- **Yönerge:** Kabul et (119 kB gzip, tek cacheable chunk) — bu turda mimari sadeleştirme yapıldı (bkz. D bölümü), boyut hedefi değil.

### A6. a11y renk-kontrast testi sessizce çalışmıyor — **P1 (yanlış güven)**
- **Kanıt:** `vitest` çıktısında `Not implemented: HTMLCanvasElement.prototype.getContext` — jsdom'da canvas yok; axe'in `color-contrast` kuralı bu yüzden **atlanıyor** (test yine de "passed" diyor).
- **Boşluk:** Projenin **WCAG 2.2 AAA / ≥7:1 kontrast** hedefi var ama tam da o kural CI'da hiç ölçülmüyor. CI'da Playwright+axe **kontrast adımı yok**.
- **Yönerge:** Kontrast doğrulamasını Playwright (gerçek tarayıcı) + `@axe-core/playwright` ile e2e'ye taşı; jsdom-axe'ı yalnız yapısal kurallar için tut. CI'ya bu adımı ekle.

### A7. Plan ↔ uygulama yığın sapması — **P2**
- **Kanıt:** Plan/stack tablosu `cmdk`, `MSW`, `shadcn/ui`, `flowbite-react`, Storybook öngörüyor; **hiçbiri** bağımlılıklarda yok (komut paleti, primitive'ler ve mock'lar elle yazılmış).
- **Boşluk:** Sapmaların çoğu makul (elle yazım çalışıyor), ama DoD "**Storybook story var**" maddesi **karşılanmıyor** ve plan dökümanı gerçeği yansıtmıyor (bakım/onboarding riski).
- **Yönerge:** Ya planı gerçeğe güncelle (cmdk/MSW/shadcn/flowbite'ı "kullanılmadı, gerekçe: …" diye işaretle), ya da Storybook'u DoD'den çıkar/ekle. İkisinden birini seç; belirsiz bırakma.

---

## B. EKSİKLER (kapsam / özellik)

### B1. İşlenmemiş rakip envanterleri — **P2**
- **Kanıt:** `eksiks/` altında `6.md`, `Calendly_Core.md`, `notta_otter.md`, `Google_Meet_Ozellik_Envanteri.xlsx` (summary §8.1: 1–5.md işlendi, bunlar bekliyor).
- **Yönerge:** Sırayla: **Calendly_Core** → scheduling derinleştirme, **notta_otter** → intelligence (transkripsiyon/not) derinleştirme, **Google Meet xlsx** → meetings GM kalanları. Her biri mevcut "test → şema → geliştirme" akışıyla.

### B2. Domain derinlik boşlukları (planda "sonraya bırakıldı") — **P2**
- **docs (Faz 9):** ilişkisel tablo + formül/türetilmiş kolon, Calendar/Gantt/Hill görünümleri, yorum kenar çubuğu, CRDT collab (plan notu, satır ~524).
- **telephony (P2):** e911/nomadic, number porting/çoklu hat, cihaz handoff/call-flip, DM-içi VoIP/E2EE (plan notu, satır ~381).
- **meetings (GM kalanı):** summary §5 "Google Meet boşlukları" listesinin canlı UI bağlanmamış kısımları (granular kilit, access-tier, viewer rolü, multi-pin, annotation/remote-control, speech-translation/dublaj).

### B3. gap.md P2/P3 beklemede — **P3**
- **Kanıt:** summary §8.5 — `gap.md` **P1 tamam**, P2/P3 (tutarlılık + mikro-etkileşim) açık.
- **Yönerge:** P2'leri (geri bildirim/optimistic UI tutarlılığı, responsive kalanları) bir sonraki cila turunda topla.

### B4. E2E kapsam boşlukları — **P2**
- **Kanıt:** `e2e/` = admin, docs, intel, phone, scheduling, smoke, support, webinar (8 spec). **messaging, meetings, canvas için e2e yok**; ayrıca clips/WFO/AgentStudio/Events akışları kapsanmıyor.
- **Yönerge:** En riskli/akış-yoğun ikisi (**messaging**, **meetings**) için öncelikli e2e ekle; sonra canvas + yeni AI yüzeyleri.

### B5. Sözleşme→canlı bağlama (kapsam dışı ama açık) — not
- Tüm `api.ts` = `delay<T>()` mock; `*Event` birlikleri **canlı taşımaya bağlı değil**. Frontend-only kararıyla uyumlu; ama "gerçek backend gelince yalnız taşıma değişir" iddiasının **httpClient/WS adapter iskeleti** henüz yok. İlk backend turunda port-adapter sınırını şimdiden tanımlamak riski düşürür.

---

## C. Öncelik Özeti

| # | Başlık | Tür | Önem | Yayılım |
|---|---|---|---|---|
| A5 | Icon chunk 535 kB | Perf | P1 | Tüm uygulama (ilk yük) |
| A4 | Boundary/i18n lint yok | Süreç | P1 | Tüm kod tabanı |
| A1 | Kimlik dizini messaging'de | DDD | P1 | 6+ alan |
| A6 | Kontrast testi atlanıyor | a11y | P1 | AAA hedefi |
| A2 | Kesişen context'ler yok | DDD | P1 | Search/Presence/Files |
| A3 | Store sızıntısı (ACL bypass) | DDD | P1 | intelligence, meetings |
| A7 | Plan/impl sapması + Storybook | Süreç | P2 | Bakım/onboarding |
| B1 | İşlenmemiş envanterler (4) | Kapsam | P2 | scheduling/intel/meetings |
| B4 | e2e boşlukları | Test | P2 | messaging/meetings/canvas |
| B2 | Domain derinliği | Kapsam | P2 | docs/telephony/meetings |
| B3 | gap.md P2/P3 | UX cila | P3 | Tümü |

**En yüksek kaldıraç (önerilen ilk tur):** A4 (lint guardrail — A1/A3 regresyonunu kalıcı önler) + A1/A3 (DDD temizliği) + A6 (kontrast'ı gerçek tarayıcıda ölç).

---

## D. Uygulanan Düzeltmeler (bu tur)

> Hepsi frontend-only, DDD odaklı. Doğrulama: `tsc` temiz · sınır denetçisi temiz · **317 test yeşil** (312 + 5 yeni) · `vite build` temiz.

**A1 — Identity platform katmanına taşındı.**
`src/lib/identity.ts` eklendi (`memberById`/`memberName`/`presenceOf`, kaynak `data/team.ts`). `features/messaging/members.ts` artık yalnızca buna re-export. Messaging dışındaki **10 importer** (`meetings`×6, `intelligence`×3, `scheduling`×1) `@/lib/identity`'ye yönlendirildi → kimlik için artık hiçbir domain messaging'e bağımlı değil. +5 birim test (`test/identity.test.ts`).

**A3 — Store sızıntıları `integration.ts` ACL'ine taşındı.**
`RecapPanel` (intelligence) ve `SidePanel` (meetings) artık `useMessagingStore`'u doğrudan import etmiyor; `ChannelHeader` (messaging) `useMeetingStore`'u import etmiyor. `integration.ts`'e 4 köprü hook'u eklendi: `useLinkedChannelMessages`, `usePostToLinkedChannel`, `useSendActionToChat`, `useLinkedMeetingState`. Davranış birebir korundu (testler yeşil).

**A4 — Bağımlılık-sınırı denetçisi (sıfır bağımlılık).**
`scripts/check-boundaries.mjs`: feature-arası importu yasaklar (yalnız `@/features/integration` + paylaşılan katmanlar serbest) ve ham `@phosphor-icons/react` importunu yasaklar (yalnız `lib/icons.ts`). `npm run lint:boundaries` + CI'da type-check öncesi adım. Negatif test ile yakalama doğrulandı. Bu, A1/A3 regresyonunu kalıcı engeller.

**A5 — (düzeltildi) Merkezi ikon barrel.**
Boyut kazancı yok (yukarıda açıklandı), ama 127 dosya tek kaynağa (`@/lib/icons`, per-icon deep path) yönlendirildi; ham paket importu artık denetçi tarafından yasak. İleride ikon stratejisini (ağırlık azaltma, lazy-split) **tek dosyada** değiştirme imkânı.

---

## E. İkinci Tur — UX Journey + Kalan A/B (tamamlandı)

> Doğrulama (tüm tur sonrası): `tsc` temiz · `scripts/check-boundaries.mjs` temiz · **~334 birim/bileşen testi yeşil** (312 + 22 yeni) · `vite build` temiz · `@axe-core/playwright` kontrast e2e + 3 yeni e2e CI'da koşar.

**UX journey sorunları (detay: `UX.md`):**
- **J1 Kalıcılık** — `auth/tenant/ui` store'ları `zustand/persist`. Reload artık login'e atmıyor, yeri/tercihi silmiyor.
- **J7 Dil** — `lib/locale.detectInitialLocale` (TR-öncelik tarayıcı algılama) + persist; AppShell i18n senkronu.
- **J2 Deep-linking** — `lib/useUrlSelection` (race-safe çift-yön); messaging (?c=&t=), support (?conv=), scheduling (?type=). Paylaşılabilir link + reload-restore + geri/ileri.
- **J3 Bildirim deep-link** — `AppNotification.href`; tıkla → markRead + ilgili yüzeye git.
- **J4 Dürüst CTA** — Record clip gerçekçi klip; Export/Recap **gerçek dosya indirir** (`lib/download`).
- **J5 Workspace kapsamı** — kanallar `workspaceId` ile filtreli; switch'te aktif kanal yeniden seçilir.
- **J6 Unsaved guard** — `lib/useUnsavedGuard` (beforeunload) composer + booking'de.
- **J8 Forbidden CTA** — paylaşılan `components/ui/Forbidden` (panele dön CTA), 11 sayfada inline blok kaldırıldı.
- **J9/J10** — boş-durum/getting-started (messaging boş workspace) + mevcut AsyncBoundary/Skeleton altyapısı.

**Kapatılan A/B maddeleri:**
- **A6** — `@axe-core/playwright` + `e2e/a11y-contrast.spec.ts` (gerçek tarayıcıda `color-contrast`); mevcut CI e2e adımı koşar.
- **A2** — `lib/search.ts` (`searchAll` + `registerSearchProvider` IoC) komut paletine bağlı; `lib/presence.ts` (presence open-host servisi). Files/Realtime bilinçli sonra.
- **A7** — `GELISTIRME-PLANI.md §22`: yığın sapmaları (cmdk/MSW/shadcn/flowbite/Storybook) + kesişen context kod karşılıkları belgelendi.
- **B4** — eksik e2e: `messaging` (+deep-link), `meetings`, `canvas`.
- **B1 (temsilî)** — Calendly paritesi: booking → `.ics` takvim daveti (`features/scheduling/ics.ts` + indirme).

**Hâlâ açık (büyük, çok-oturumluk — körlemesine yapılmadı):**
- **B2/B3** — `eksiks/` envanterlerinin tam işlenmesi: `notta_otter.md` (transkripsiyon/not derinleştirme → intelligence), `Google_Meet_Ozellik_Envanteri.xlsx` (Meet kalan paritesi), `6.md`, `Calendly_Core.md`'nin geri kalanı. Her biri kendi test→şema→geliştirme turunu hak ediyor.
- **J9 kapsamı** — skeleton/AsyncBoundary altyapısı mevcut; tüm yüzeylere yayma gerçek backend (async) gelince anlamlı.
- **In-app nav blocking (J6)** — `useBlocker` data-router gerektirip bileşen testlerini kırdığı için shell-seviyesi follow-up olarak bırakıldı (beforeunload kapsanan kısım uygulandı).

---

## F. Üçüncü Tur — Gemini Raporu (`1 gemini.md`) Yanıtı

> Doğrulama: `tsc` temiz · boundary temiz · **347 birim/bileşen testi yeşil** (+13) · `vite build` temiz · e2e specs derleniyor.

**Uygulanan eleştiriler & eksikler:**
- **§2.1 Docs Faz 9 — TableGrid (marquee, "çalışan simülasyon UI"):** İlişkisel tablo — tipli kolonlar (text/number/date/select/person/formula), **canlı düzenlenebilir hücreler**, eval'siz **formül motoru** (`features/docs/tables.ts`, recursive-descent + kolon referansı), kolon toplamları ve **tarihten türetilen Calendar görünümü** (`CalendarView`). DocsPage'e "Tables" sekmesi. +8 test.
- **§2.2 notta_otter — intelligence derinleştirme:** `features/intelligence/notes.ts` — diarization + **konuşma hızı (WPM)**, anahtar kelime çıkarma, otomatik aksiyon maddeleri; `MeetingNotesCard` IntelligencePage'e bağlı. +3 test.
- **§2.2 Calendly:** booking → `.ics` (önceki turda, B1).
- **§3.3 İzole ErrorBoundary:** AppShell `Outlet`'i zaten `AsyncBoundary` ile sarıyordu; **route ile key'lendi** → errored route'tan ayrılınca otomatik kurtulma (reload gerekmez).
- **§3.1 Bellek şişmesi:** `lib/capArray` ile intelligence streaming dizileri (segments/sentiment/coaching/highlights) + telephony history cap'lendi (meetings captions zaten `.slice(-30)`'du). +2 test.
- **§3.2 a11y kontrast:** önceki turda A6 (`@axe-core/playwright`) ile kapatıldı.
- **§2.3 E2E:** canvas (önceki tur) + **docs TableGrid** (formül total + Calendar) e2e eklendi.

**Gemini raporunun atladıkları (benim eklediklerim, önceki turlarda):** persistence/deep-linking/bildirim-deep-link/dürüst-CTA (J1–J10 journey katmanı), DDD kimlik sızıntısı + store coupling + boundary lint (A1/A3/A4), global arama + presence open-host servisleri (A2). Gemini raporu bunları kapsamıyordu; UX/mimari açısından en az §2/§3 kadar kritiktiler.

**Hâlâ açık (büyük/çok-oturumluk):** TableGrid'in Gantt/Hill görünümleri + CRDT/OT eşzamanlı düzenleme (§2.1 derin); `Google_Meet_Ozellik_Envanteri.xlsx` ve `6.md` tam işlenmesi; WFO/Agent Studio/Events e2e; §4 FastAPI geçişi (openapi-typescript + WS/SSE adaptörleri) — gerçek backend turuna ait.

---

## G. Dördüncü Tur — Ertelenenlerin Kapatılması

> Doğrulama: `tsc` temiz · boundary temiz · **353 birim/bileşen testi yeşil** (+6) · `vite build` temiz · **14 e2e spec** derleniyor.

**Tamamlananlar (önceki turda "açık" bırakılanlar):**
- **J6 in-app nav blocking (tamamlandı):** `useBlocker` `<MemoryRouter>` altında patlıyor (ampirik doğrulandı) → dirty bayrağı `uiStore`'da, blocker yalnız shell'deki **`UnsavedNavGuard`**'da (ConfirmDialog, sadece pathname değişiminde — J2 search-param'ları tetiklemez). smoke `createMemoryRouter`'a çevrildi. +2 test.
- **TableGrid Gantt + Hill (tamamlandı):** `ganttBars` (tarih ekseni) + `hillPoints` (Basecamp tepe eğrisi, status'tan) saf util + SVG `GanttView`/`HillView`; TableGrid artık 4 türetilmiş görünüm (Grid/Calendar/Gantt/Hill). +2 test.
- **Calendly envanteri (temsilî):** `scheduling/reminders.ts` — `reminderTimes` (1 gün + 1 saat önce) + `hasConflict` (çakışma); booking onayında hatırlatma çizelgesi. +2 test.
- **Calendly/6.md compliance farklılaştırıcıları:** AuditLogViewer'a **self-serve retention slider** + **veri ikametgâhı seçici** + **IP kolonu** (mevcut `retentionExpired`/`residencyAllowed` util'leri kullanılarak — kod tekrarı yok).
- **E2E:** docs **Clips** + docs **TableGrid** specleri (toplam 14 spec).

**Hâlâ açık (dürüst kapsam — körlemesine yapılmadı):**
- **CRDT/OT eşzamanlı düzenleme** (gerçek collab altyapısı; backend + presence turuna ait).
- **`6.md` (Zoom) ve `Google_Meet_Ozellik_Envanteri.xlsx`'in tam işlenmesi** — çoğu parite zaten var; kalan kurumsal kurallar/raporlama şablonları ayrı tur.
- **WFO / Agent Studio / Events / GM-derin e2e** — UI-label hassasiyeti + çalışan tarayıcıda debug gerektirir (sandbox'ta tarayıcı yok).
- **§4 FastAPI geçişi** (openapi-typescript + WS/SSE adaptörleri) — gerçek backend turuna ait.

---

## H. Beşinci Tur — Kalan Frontend Eksiği: Doc Collaboration (§2.1 son)

> Doğrulama: `tsc` temiz · boundary temiz · **358 birim/bileşen testi yeşil** (+5) · `vite build` temiz.

§2.1'in tek tam-frontend açık parçası kapatıldı (geri kalan açıklar backend/çok-oturumluk):
- **CommentSidebar** — bloğa-bağlı doküman yorumları (ekle / çöz / anchor block snippet) + **presence avatarları**. Docs › Canvas artık editör + yorum kenar çubuğu yan yana.
- **Eşzamanlı düzenleme simülasyonu** — "**Simulate teammate edit**" → `applyRemoteEdit` uzak bir takım arkadaşının düzenlemesini canlı dokümana **merge** eder (CRDT/OT peer yerine geçen çalışan simülasyon).
- Saf util `docs/collab.ts` (`commentsForDoc`/`openComments`) + `DocComment` tipi + `comment.added` olay sözleşmesi + seed. +5 test.

**Frontend tarafında bilinçli açık kalan tek şey:** gerçek **CRDT/OT taşıma** (WS/CRDT kütüphanesi) — bu mock değil canlı backend gerektirir. Diğer tüm kalanlar (6.md/Meet tam işleme = özellik kapsamı; §4 = backend) frontend "eksiği" değil.
