# AURA Frontend Denetim Raporu

Kapsam: `GELISTIRME-PLANI.md`, `summary.md` ve `web/` frontend codebase incelemesi. Backend geliştirme kapsam dışı tutuldu. DDD/bounded-context yaklaşımı, frontend-only FastAPI uyumu, eksikler ve sorun yerleri değerlendirildi.

Tarih: 2026-06-04

## 1. Hızlı Sonuç

Proje frontend tarafında ciddi ilerlemiş: feature-slice yapısı var, route-level lazy loading kullanılıyor, test sayısı yüksek, DDD sınırları için özel `lint:boundaries` scripti eklenmiş ve mevcut durumda çalışıyor. `npm run lint`, `npm run typecheck`, `npm run test` temiz geçti.

Ancak planın iddiası olan "contract-first / OpenAPI / MSW / TanStack Query merkezli gerçek backend'e kolay geçiş" şu an tam karşılanmıyor. Uygulama büyük ölçüde Zustand seed state ve elle yazılmış mock API fonksiyonları üzerinde çalışıyor. Bu, backend geldiğinde sadece taşıma katmanını değiştirmekten daha fazla iş çıkabileceği anlamına geliyor.

En kritik riskler:

| Öncelik | Alan | Sorun |
|---|---|---|
| P1 | Sözleşme mimarisi | OpenAPI tip üretimi ve MSW yok; API sözleşmeleri elle yazılmış mock fonksiyonlar. |
| P1 | Server-state | TanStack Query yalnızca komut paletinde kullanılıyor; domain ekranları query/cache sözleşmesine bağlı değil. |
| P1 | DDD shell bağımlılığı | `AppShell`, doğrudan telephony domain bileşeni `ActiveCallBar` import ediyor. |
| P1 | A11y doğrulama | Testler geçiyor ama gerçek tarayıcı renk-kontrast/axe doğrulaması yok. |
| P1 | Test güvenilirliği | Vitest geçerken çok sayıda React `act(...)` uyarısı üretiyor. |
| P2 | E2E kapsamı | Messaging, Meetings ve AI Canvas derin akışları e2e seviyesinde zayıf. |
| P2 | Doküman drift | `summary.md`, `README.md`, plan ve gerçek test sayısı/araç seçimi arasında fark var. |
| P2 | Platform context eksikleri | Search, Presence, Realtime, Files gibi cross-cutting context'ler henüz açık port olarak yok. |

## 2. Doğrulama

Çalıştırılan komutlar:

```bash
cd /Users/karaca/Downloads/teamslike/web
npm run lint
npm run typecheck
npm run test
```

Sonuçlar:

| Kontrol | Sonuç |
|---|---|
| `npm run lint` | Geçti. `check-boundaries.mjs` illegal cross-feature import ve raw icon import bulmadı. |
| `npm run typecheck` | Geçti. |
| `npm run test` | Geçti. 16 dosya, 317 test. |
| E2E | Bu turda çalıştırılmadı. CI'da `npm run test:e2e` adımı var. |

Test sırasında görülen önemli uyarılar:

- `AvatarFallback`, `Presence`, `Popper`, `MessageList` için çok sayıda React `act(...)` uyarısı var. Testler yeşil ama bazı assertion'lar async state güncellemelerini tam beklemiyor olabilir.
- `jest-axe` çalışırken `HTMLCanvasElement.prototype.getContext` jsdom'da yok uyarısı veriyor. Bu, özellikle `color-contrast` tarafında yanlış güven yaratabilir.

## 3. Güçlü Taraflar

### 3.1 DDD feature-slice yapısı büyük ölçüde var

`web/src/features/<domain>/` altında çoğu domain kendi `types.ts`, `data.ts`, saf util dosyası, store, API mock ve UI bileşenleriyle ayrılmış:

- `messaging`
- `meetings`
- `intelligence`
- `telephony`
- `webinar`
- `support`
- `scheduling`
- `docs`
- `admin`
- `canvas`

Bu düzen, frontend DDD için doğru yön. Özellikle domain util'lerinin framework'süz tutulması ve testlenmesi iyi.

### 3.2 Boundary guardrail var

`web/scripts/check-boundaries.mjs` feature-to-feature importları yasaklıyor ve yalnızca `@/features/integration` üzerinden cross-context bağlantıya izin veriyor. Bu, DDD sınırlarını pratikte koruyan değerli bir mekanizma.

### 3.3 i18n paritesi tip seviyesinde korunuyor

`tr.ts`, `en.ts` kaynak tipine bağlanmış. Eksik/fazla anahtar TypeScript hatasına dönüşür. Bu iyi bir karar.

### 3.4 Erişilebilirlik niyeti kodda görünür

Minimum `1rem`, global focus-visible, reduced-motion CSS, Radix primitive kullanımı ve yapısal axe testleri var. Ancak doğrulama tarafı eksik; sorun aşağıda.

## 4. P1 Sorunlar

### P1.1 Contract-first iddiası gerçek araçlarla desteklenmiyor

Plan şunu söylüyor:

- OpenAPI sözleşmesi
- `openapi-typescript`
- MSW contract testleri
- FastAPI sözleşmesine birebir mock runtime

Mevcut durum:

- `openapi-typescript` dependency/script yok.
- MSW dependency/handler yok.
- `web/src/lib/mockApi.ts` ve domain `api.ts` dosyaları elle yazılmış `delay<T>()` fonksiyonları.
- API tipleri OpenAPI'den üretilmiyor; domain `types.ts` dosyaları manuel kaynak.

Etkilenen yerler:

- `web/src/lib/mockApi.ts`
- `web/src/features/*/api.ts`
- `web/package.json`
- `GELISTIRME-PLANI.md` teknoloji ve DoD bölümleri

Risk:

Gerçek FastAPI geldiğinde "yalnız taşıma katmanı değişir" iddiası kırılabilir. Çünkü ekranlar generated DTO, transport adapter ve query cache contract'ına göre değil; çoğu yerde seed store'a göre tasarlanmış.

Öneri:

Frontend-only kalırken bile önce port-adapter sınırı kurulmalı:

- `src/shared/api/contracts` veya `src/platform/api` altında generated OpenAPI tipleri için yer ayrılmalı.
- Her domain için `port` arayüzü ve `mockAdapter` ayrılmalı.
- MSW veya benzer bir mock layer testte contract boundary olarak kullanılmalı.
- Elle yazılmış `delay<T>()` mockları tek standart adapter altında toplanmalı.

### P1.2 TanStack Query uygulama mimarisinde fiilen yok

`QueryClientProvider` var ama `useQuery` kullanımı neredeyse yalnızca `CommandPalette` içinde:

- `web/src/components/shell/CommandPalette.tsx`
- `web/src/lib/query.ts`

Domain ekranlarının çoğu veriyi doğrudan Zustand store seed'lerinden okuyor. Bu, planın "server-state TanStack Query, client-state Zustand" ayrımına uymuyor.

Risk:

- Backend geldiğinde loading/error/refetch/cache davranışları domain bazında yeniden tasarlanacak.
- Tenant/workspace query key scoping şimdiden oluşmadığı için multitenancy geçişi riskli.
- API mockları test ediliyor ama ekranlar çoğunlukla API üzerinden beslenmiyor.

Öneri:

Server kaynaklı veriler için domain bazlı query hook'ları çıkarılmalı:

- `useMessagesQuery(workspaceId, channelId)`
- `useMeetingsQuery(workspaceId)`
- `useBookingsQuery(workspaceId)`
- `useConversationsQuery(workspaceId)`

Zustand yalnızca UI/client state için kalmalı: aktif sekme, drawer, composer draft, optimistic local state.

### P1.3 Shell doğrudan telephony domain'e bağımlı

`web/src/components/shell/AppShell.tsx` içinde:

- `@/features/telephony/components/ActiveCallBar`

Bu teknik olarak boundary script tarafından yakalanmıyor çünkü shell feature klasörü içinde değil. Ama DDD açısından platform shell'in domain bileşenine doğrudan bağımlı olması ters yönde bir bağ.

Risk:

- Telephony global davranışı shell'e gömülüyor.
- İleride başka global domain yüzeyleri eklenirse shell domain aggregator'a dönüşür.
- Telephony kapatılmak/role ile yüklenmemek istendiğinde shell seviyesinde koşullar çoğalır.

Öneri:

Global domain yüzeyleri için platform slot veya registry kullanılmalı:

- `GlobalSurfaceRegistry`
- `ShellExtension`
- domain'in register ettiği `activeCallSurface`

Shell yalnızca platform slotunu render etmeli; telephony bileşenini doğrudan import etmemeli.

### P1.4 A11y kontrast doğrulaması yanlış güven veriyor

`web/src/test/a11y.test.tsx` yorumunda renk kontrastının Playwright + axe ile CI'da doğrulandığı yazıyor. Ancak:

- `@axe-core/playwright` dependency yok.
- `web/e2e/*` içinde axe kullanımı yok.
- CI sadece Playwright e2e çalıştırıyor, a11y/contrast adımı yok.
- Vitest sırasında jsdom canvas uyarısı geliyor.

Etkilenen yerler:

- `web/src/test/a11y.test.tsx`
- `web/playwright.config.ts`
- `.github/workflows/ci.yml`
- `web/package.json`

Risk:

WCAG 2.2 AAA hedefi dokümanda var ama gerçek tarayıcıda kontrast ölçülmüyor. AAA iddiası güvenilir değil.

Öneri:

- `@axe-core/playwright` eklenmeli.
- En az shell, dashboard, messaging, meetings, support, admin için gerçek tarayıcı axe spec yazılmalı.
- Token kontrast çiftleri küçük bir otomatik testle hesaplanmalı.
- jsdom axe sadece yapısal a11y için kullanılmalı.

### P1.5 Testler geçiyor ama `act(...)` uyarıları test kalitesini düşürüyor

`npm run test` 317 test ile geçti, fakat birçok async UI güncellemesi testte tam beklenmiyor:

- `AvatarFallback`
- `Presence`
- `MessageList`
- Radix `Popper`

Risk:

Bu uyarılar ileride flake testlere veya gerçekte kullanıcıya görünen ara state'lerin test edilmemesine yol açabilir.

Öneri:

- Uyarı üreten testler `findBy*`, `waitFor`, `userEvent` ve fake timers ile düzeltilmeli.
- CI'da stderr uyarıları belirli eşik üstünde fail ettirilebilir.

## 5. P2 Sorunlar ve Eksikler

### P2.1 Cross-cutting platform context'ler eksik veya zayıf

Planın context haritasında `Search`, `Notifications`, `Presence`, `Realtime`, `Files`, `Identity` gibi platform/kesişen servisler var. Kodda bunların bir kısmı var ama açık port olarak değil.

Mevcut durum:

- Identity helper: `web/src/lib/identity.ts` var. Bu iyi.
- Notifications: global store var.
- Search: messaging içinde `GlobalSearchDialog`; platform search portu yok.
- Presence: `PresenceDot` ve team data var; presence service/store yok.
- Realtime: domain `*Event` union tipleri var, ama ortak transport/session/reconnect portu yok.
- Files: ortak file service yok; messaging/docs içinde domain-local mocklar var.

Risk:

Her domain kendi mini-search, mini-presence, mini-realtime davranışını üretir. Bu DDD'de "shared kernel/open-host service" olması gereken alanları çoğaltır.

Öneri:

Öncelik sırası:

1. `platform/realtime`: connection state, subscribe, reconnect, event envelope.
2. `platform/search`: global search portu ve domain provider registry.
3. `platform/presence`: member presence read model.
4. `platform/files`: upload/preview/attachment metadata portu.

### P2.2 `features/integration.ts` büyürse god-layer olabilir

Şu an integration layer doğru yönde: Messaging, Meetings ve Intelligence arasındaki doğrudan store sızıntılarını azaltıyor. Fakat tek dosyada tüm context köprüleri toplanırsa zamanla "her şeyi bilen" merkezi katmana dönüşür.

Etkilenen yer:

- `web/src/features/integration.ts`

Öneri:

Integration alanı tek dosya yerine küçük portlara ayrılmalı:

- `integration/messaging-meetings.ts`
- `integration/meetings-intelligence.ts`
- `integration/intelligence-messaging.ts`

Her köprüde DTO/read model açıkça tanımlanmalı.

### P2.3 RBAC fazla kaba

`authStore.can(permission: string)` sadece principal permission listesini kontrol ediyor.

Etkilenen yer:

- `web/src/store/authStore.ts`
- `web/src/data/roles.ts`
- tüm `can("...")` kullanan sayfalar

Eksik kalanlar:

- tenant scope
- workspace scope
- resource-level permission
- command/action bazlı policy context
- permission denied nedenleri

Plan multitenancy ve tenant-scoped query/permission iddiasında. Mevcut RBAC demo için yeterli, fakat domain derinliği arttıkça yetersiz.

Öneri:

`can(action, resource, context)` biçimine geçilmeli. Örnek context:

- `tenantId`
- `workspaceId`
- `resourceType`
- `resourceOwnerId`
- `membershipRole`

### P2.4 Tenant değişimi domain verisini scope'lamıyor

`tenantStore` aktif tenant/workspace bilgisini tutuyor ve tema değişimi yapıyor. Ancak domain store'lar genel seed state kullanıyor. Tenant/workspace değişince messaging, meetings, support gibi domain verileri tenant'a göre yeniden scoped olmuyor.

Etkilenen yerler:

- `web/src/store/tenantStore.ts`
- `web/src/features/*/store.ts`
- query key mimarisi olmadığı için tüm domainler

Risk:

Gerçek multitenancy'ye geçişte veri sızıntısı ve yanlış cache riski oluşur.

Öneri:

- Her domain read/write operasyonu `tenantId` ve `workspaceId` almalı.
- Query key standardı zorunlu olmalı: `["tenant", tenantId, "workspace", workspaceId, domain, ...]`.
- Zustand store'larda tenant değişiminde reset/hydrate davranışı tanımlanmalı.

### P2.5 E2E kapsamı dengesiz

Mevcut e2e spec'ler:

- admin
- docs
- intelligence
- phone
- scheduling
- smoke
- support
- webinar

Messaging ve Meetings yalnız smoke akışında yüzeysel geçiliyor. AI Canvas için ayrı e2e yok. Clips, WFO, Agent Studio, Events gibi yeni/karmaşık yüzeyler de e2e'de yok.

Risk:

En yoğun kullanıcı akışları component/unit testte kalıyor; gerçek route, focus, responsive ve browser etkileşimi daha az doğrulanıyor.

Öneri:

Öncelikli e2e:

1. Messaging: gönder, reply/thread, pin/save, context menu, search, mobile drawer.
2. Meetings: prejoin, host controls, side panel chat bridge, captions, GM panel.
3. AI Canvas: prompt run, block reorder/pin/remove, clear.
4. Support AI Agent Studio ve WFO.
5. Docs Clips detay akışı.

### P2.6 Plan ve uygulama arasında araç sapması var

Plan şunları öngörüyor:

- `cmdk`
- MSW
- `openapi-typescript`
- shadcn/ui + flowbite-react
- i18next-extract
- Storybook/pseudo-loc

Mevcut package/scripts içinde bunların çoğu yok. Bazı ikameler iyi çalışıyor, fakat plan güncel değil.

Risk:

Onboarding ve ileride task planlama yanlış varsayımlarla yapılır.

Öneri:

Plan dokümanı ikiye ayrılmalı:

- "Hedef mimari"
- "Mevcut uygulama"

Sapmalar açıkça gerekçelendirilmeli: "kullanılmadı", "manuel uygulandı", "sonraki faz".

### P2.7 Doküman drift var

Güncel doğrulamada 317 test geçti. `summary.md` ve `web/README.md` bazı yerlerde 312 test bilgisini taşıyor. `GELISTIRME-PLANI.md` içinde de farklı turlara ait test sayıları ve uygulama notları birikmiş durumda.

Etkilenen dosyalar:

- `summary.md`
- `web/README.md`
- `GELISTIRME-PLANI.md`

Öneri:

Tek güncel durum raporu tutulmalı. Plan tarihsel changelog yerine karar/DoD belgesi olarak sadeleştirilmeli.

### P2.8 Hardcoded string lint yok

i18n paritesi güçlü, fakat hardcoded string yakalama otomasyonu yok. Plan `i18next-extract` veya benzeri lint bekliyor.

Kodda bazı mock/device/data stringleri doğal olarak hardcoded olabilir. Sorun bunların ayrıştırılmaması:

- UI metni mi?
- demo data mı?
- cihaz/mock adı mı?
- domain seed mi?

Öneri:

- UI componentlerinde hardcoded visible text yasaklanmalı.
- Demo data için ayrı istisna klasörü tanımlanmalı.
- `i18next-extract` veya custom AST lint kullanılmalı.

## 6. P3 Hijyen ve Bakım Sorunları

### P3.1 Üretilmiş/geçici dosya izleri var

Bulunanlar:

- `web/src/lib/__t.tmp` boş dosya.
- `web/vitest.config.ts.timestamp-*.mjs` dosyaları.
- kökte `.DS_Store`.

`web/.gitignore` içinde `.DS_Store`, `node_modules`, `dist`, `test-results` var; fakat repo kökü Git deposu değil ve kök `.gitignore` yok.

Risk:

Kaynak ağacı gürültülenir; rapor ve dosya taramaları yanıltıcı hale gelir.

Öneri:

- Kök `.gitignore` eklenmeli.
- Geçici timestamp/tmp dosyaları temizlenmeli.
- Repo kökü Git deposu olarak netleştirilmeli veya `web/` gerçek repo kökü yapılmalı.

### P3.2 Build artifact ve node_modules aynı inceleme kökünde duruyor

`web/dist` ve `web/node_modules` mevcut. Normal ama rapor/arama komutlarında mutlaka dışlanmalı. İlk `rg --files` çıktısı çok gürültülü oldu.

Öneri:

İnceleme/CI scriptleri explicit exclude kullanmalı veya repo kökü düzenlenmeli.

## 7. Ürün Kapsam Eksikleri

`summary.md` ile uyumlu olarak henüz işlenmemiş veya derinleşmesi gereken kaynaklar:

| Kaynak | Etkilenen domain | Not |
|---|---|---|
| `eksiks/Calendly_Core.md` | scheduling | Calendly derin scheduling parity. |
| `eksiks/notta_otter.md` | intelligence/docs | Transkripsiyon, not, özet, kayıt sonrası iş akışları. |
| `eksiks/Google_Meet_Ozellik_Envanteri.xlsx` | meetings | GM detay parity doğrulaması. |
| `eksiks/6.md` | belirsiz, ayrıca incelenmeli | Rakip envanterinin kalan parçası. |

Domain derinlik açıkları:

- Docs: ilişkisel tablo, formül/türetilmiş kolon, Calendar/Gantt/Hill, CRDT gerçek işbirliği.
- Telephony: e911/nomadic, number porting, device handoff/call flip, çoklu hat yönetimi.
- Meetings: gerçek medya adapter sınırı, annotation/remote-control gerçek UX doğrulaması, speech translation/dubbing gerçekçi akış.
- Intelligence: gerçek ASR/MT/LLM adapter'a geçiş öncesi streaming contract testleri.
- Support: Chatwoot adapter portu ve conversation event mapping.

Bu maddeler backend yazmak anlamına gelmiyor; frontend port, sözleşme ve mock adapter olarak hazırlanabilir.

## 8. Önerilen Sıradaki İş Sırası

### Sprint 1: Mimari sertleştirme

1. OpenAPI/generated type için frontend contract alanı oluştur.
2. Domain API'lerini port + mock adapter biçimine taşı.
3. Server-state'i TanStack Query hook'larına bağla.
4. Tenant/workspace query key standardı getir.
5. Shell `ActiveCallBar` bağımlılığını registry/slot modeline çevir.

### Sprint 2: Kalite güvenilirliği

1. Playwright + axe gerçek tarayıcı a11y/contrast testleri ekle.
2. React `act(...)` uyarılarını temizle.
3. Messaging, Meetings, AI Canvas e2e testlerini ekle.
4. Hardcoded UI string lint'i ekle.

### Sprint 3: Platform context'leri

1. `platform/realtime` portu.
2. `platform/search` provider registry.
3. `platform/presence` read model.
4. `platform/files` attachment/upload metadata portu.

### Sprint 4: Doküman ve repo hijyeni

1. `summary.md`, `web/README.md`, `GELISTIRME-PLANI.md` test sayısı ve araç seçimiyle güncellensin.
2. Geçici dosyalar temizlensin.
3. Kök `.gitignore` ve repo kökü netleştirilsin.
4. Plan "mevcut" ve "hedef" mimari olarak ayrıştırılsın.

## 9. Net Cevap

Frontend DDD iskeleti doğru kurulmuş, ama şu an daha çok "zengin mock SaaS demo" seviyesinde. En büyük eksik ürün ekranı sayısı değil; backend'e bağlanabilir sözleşme mimarisinin ve server-state ayrımının uygulamada yeterince oturmamış olması.

Sorunların ana yeri:

- Contract/API: `web/src/lib/mockApi.ts`, `web/src/features/*/api.ts`, `web/package.json`
- Server-state: `web/src/lib/query.ts`, domain page/store kullanımları
- DDD shell bağımlılığı: `web/src/components/shell/AppShell.tsx`
- Cross-context orchestration büyüme riski: `web/src/features/integration.ts`
- A11y doğrulama: `web/src/test/a11y.test.tsx`, `web/e2e`, `.github/workflows/ci.yml`
- Test uyarıları: `Avatar`, `Presence`, Radix popper kullanan test yüzeyleri
- Multitenancy/RBAC: `web/src/store/tenantStore.ts`, `web/src/store/authStore.ts`
- Doküman drift: `summary.md`, `web/README.md`, `GELISTIRME-PLANI.md`

Öncelik, yeni özellik eklemekten çok frontend contract altyapısını ve DDD sınırlarını kalıcı hale getirmek olmalı.
