# AURA Frontend UX / User Journey Raporu

Kapsam: `web/` frontend uygulamasında kullanıcı yolculukları. Bu rapor UI estetiği, renk, tipografi, görsel kompozisyon veya marka hissi değerlendirmez. Odak: kullanıcının bir işi başlatıp tamamlayabilmesi, bağlamını kaybetmemesi, geri/ileri/reload/link/bildirim/form/CTA akışlarının tutarlı çalışması.

Tarih: 2026-06-04

## 1. Yönetici Özeti

Önceki UX raporlarında geçen bazı sorunlar artık kısmen çözülmüş: oturum, tema, dil ve workspace seçimi persist ediliyor; mesajlarda context menu, delete confirmation ve bazı responsive drawer davranışları eklenmiş. Buna rağmen güncel codebase'de kullanıcı yolculuğu açısından kritik kırıklar var.

Ana problem şu: uygulama zengin bir mock demo gibi çalışıyor, fakat kullanıcıların gerçek SaaS alışkanlıkları olan **deep-link**, **geri/ileri**, **bildirimden hedefe gitme**, **public booking paylaşma**, **workspace değiştirince veri değişmesi**, **kaydedilmemiş işi koruma** ve **mobilde domainler arası geçiş** akışları zayıf.

En önemli sorunlar:

| Öncelik | Journey | Sorun |
|---|---|---|
| P1 | Mobil uygulama kullanımı | `PrimaryNav` mobilde tamamen gizli; copilot varsayılan açık ve küçük ekranda ana içeriği sıkıştırıyor. |
| P1 | Deep-link / geri-ileri | `useUrlSelection` var ama kullanılmıyor; kanal, topic, conversation, tab, clip, event type URL'e taşınmıyor. |
| P1 | Bildirim ve aktivite | Bildirimler/aktivite kayıtları hedefe götürmüyor; tıklama sadece okundu işareti veya pasif metin. |
| P1 | Public booking | "Public booking page" AuthGate altında ve local tab state ile saklı; dış kullanıcıya paylaşılabilir public route yok. |
| P1 | Workspace geçişi | Tenant/workspace değişiyor ama domain verisi scope'lanmıyor; kullanıcı aynı kanalları/ticketları görmeye devam ediyor. |
| P2 | Kaydedilmemiş iş | Birçok composer/form local state; route değiştirme veya reload öncesi dirty-state guard yok. |
| P2 | Sahte başarı CTA'ları | Record/download/export/copy/share gibi eylemlerin bir kısmı gerçek artefakt üretmeden başarılı hissi veriyor. |
| P2 | AI journey | Copilot bağlamı çoğu yerde sadece domain adı; aktif thread/ticket/booking/clip gibi gerçek nesne context'i taşınmıyor. |
| P2 | Komut paleti | Bazı action command'ler hedef işi yapmıyor; örn. workspace switch command case'i yok. |
| P3 | Form completion | Public booking ve birçok formda inline validation/format feedback zayıf; disabled nedenleri görünmüyor. |

## 2. Güncel Olarak Çözülmüş veya Kısmen Çözülmüş Noktalar

Eski raporlardaki bazı maddeler artık güncel değil:

- Auth reload'da tamamen kaybolmuyor: `web/src/store/authStore.ts` `persist` kullanıyor.
- Dil/tema/density persist ediliyor: `web/src/store/uiStore.ts`.
- Tenant/workspace seçimi persist ediliyor: `web/src/store/tenantStore.ts`.
- Başlangıç dili artık browser/localStorage'a göre belirleniyor: `web/src/lib/locale.ts`.
- Mesaj düzeyinde context menu ve `deleteForEveryone` confirmation var: `web/src/features/messaging/components/MessageBubble.tsx`.
- Thread ve details panel küçük ekranda drawer'a dönüşüyor: `ThreadPanel.tsx`, `DetailsPanel.tsx`.

Bu iyileştirmeler iyi, fakat aşağıdaki yolculuk sorunları halen kullanıcı hedefini kesiyor.

## 3. P1 Journey Sorunları

### J1. Mobilde Ana Navigasyon Kayboluyor

Kanıt:

- `web/src/components/shell/AppShell.tsx`: primary nav `<aside className="hidden ... md:block">`.
- `web/src/components/shell/TopBar.tsx`: workspace switcher da `hidden md:block`.
- Mobil için hamburger, bottom nav, drawer veya domain menu yok.
- `copilotOpen` varsayılan `true`; `CopilotDock` `w-80` genişliğinde shell'in yanında render ediliyor.

Journey etkisi:

Mobil veya dar ekranlı kullanıcı login sonrası domainler arası açık bir yol bulamaz. Sol nav yok, workspace switcher yok. Kullanıcı sadece dashboard kartları veya komut paleti üzerinden gezebilir; bu birincil navigasyon yerine gizli/ikincil bir yol. Eğer kullanıcı messaging/support gibi bir sayfadaysa başka bir domain'e geçiş görünür değildir.

Copilot varsayılan açık olduğu için küçük ekranda ana çalışma alanı da sıkışır. Bu, özellikle messaging/support gibi çok panelli yolculuklarda kullanıcının ilk işi yapmasını zorlaştırır.

Yönerge:

- `md` altı için primary navigation drawer veya bottom nav eklenmeli.
- Workspace switcher mobilde account/settings içine gömülü değil, doğrudan erişilebilir olmalı.
- Copilot mobilde varsayılan kapalı olmalı veya tam ekran drawer/sheet olarak açılmalı.
- Mobilde ilk kullanıcı hedefi: "workspace seç → domain seç → işlem yap" görünür olmalı.

### J2. Alt Durum URL'e Taşınmıyor

Kanıt:

- `web/src/lib/useUrlSelection.ts` var, fakat `rg` ile yalnız tanım yerinde görünüyor; hiçbir domain kullanmıyor.
- `web/src/routes/router.tsx` yalnız düz rotalar kullanıyor: `/messaging`, `/support`, `/meetings`, `/docs`, `/scheduling`.
- Aktif seçimler store/local state içinde kalıyor:
  - messaging: `activeChannelId`, `activeTopicId`, `threadRootId`
  - support: `activeConversationId`, `view`
  - docs: aktif tab ve selected clip
  - scheduling: `view`, `activeEventTypeId`
  - meetings: phase/room state

Journey etkisi:

Kullanıcı şu işleri yapamaz:

- "Bu konuşmaya bak" diye link paylaşmak.
- Bildirimden spesifik mesaja/ticket'a gitmek.
- Tarayıcı geri tuşuyla önceki kanal veya önceki ticket'a dönmek.
- Reload sonrası aynı thread/clip/booking formunda kalmak.
- Yeni sekmede belirli bir conversation veya event type açmak.

Özellikle support ve messaging gibi operasyonel ekranlarda bu temel bir kullanıcı davranışıdır. URL sadece domain'i gösteriyor; kullanıcının asıl işi olan nesneyi göstermiyor.

Yönerge:

Öncelikli URL şeması:

- `/messaging?channel=ch_product&topic=tp_q3&thread=m_123`
- `/support?view=inbox&conversation=conv_1`
- `/docs?tab=clips&clip=clip_1`
- `/scheduling?view=public&type=et_30min`
- `/meetings?room=room_1`

Mevcut `useUrlSelection` hook'u gerçek domain seçimlerine bağlanmalı. Liste öğeleri mümkün olduğunda `<Link>` veya `NavLink` olmalı; sadece `button + setStore` olmamalı.

### J3. Bildirim ve Aktivite Akışı Hedefe Götürmüyor

Kanıt:

- `web/src/types/domain.ts`: `AppNotification` içinde `target route/entity` yok.
- `web/src/components/shell/NotificationBell.tsx`: notification item `onSelect={() => markRead(n.id)}`.
- `web/src/routes/DashboardPage.tsx`: `ACTIVITY` listesi pasif `<li>`, link yok.

Journey etkisi:

Kullanıcı "sana atandı", "mention", "meeting", "agent" gibi bir bildirime tıkladığında ilgili konuşmaya, meeting'e veya ticket'a gitmez. Sadece okundu işaretlenir. Bu, bildirim sisteminin ana işlevini kırıyor: dikkat isteyen işi bağlamına taşımak.

Dashboard activity feed de aynı şekilde kullanıcının son işe dönmesini sağlamıyor. Kullanıcı hedefi manuel aramak zorunda kalıyor.

Yönerge:

`AppNotification` ve `ActivityItem` için hedef modeli eklenmeli:

- `targetRoute`
- `targetEntityId`
- `targetLabel`
- gerekirse `targetParams`

Tıklama davranışı:

1. `markRead`
2. ilgili route'a navigate
3. hedef entity seçimi URL/store ile hydrate
4. mümkünse hedef mesaj/ticket kısa süre vurgulanır

Bu J2 çözümüne bağlıdır.

### J4. Public Booking Gerçekten Public Değil

Kanıt:

- `web/src/routes/router.tsx`: tüm uygulama `AuthGate` altında.
- `web/src/features/scheduling/SchedulingPage.tsx`: public booking görünümü local tab state: `view === "public"`.
- Public booking için ayrı route yok.
- `EventTypeList` sadece `aura.dev/{slug}` metni gösteriyor; kopyalanabilir/gezilebilir link yok.

Journey etkisi:

Scheduling domain'in kritik kullanıcı yolculuğu dış kullanıcıya booking linki göndermektir. Mevcut durumda "Public booking page":

- login gerektiren app içinde saklı,
- URL ile paylaşılamıyor,
- belirli event type slug'ına açılamıyor,
- dış invitee'nin uygulama dışında rezervasyon yapması mümkün değil.

Bu, Calendly/Cal.com tarzı domain için temel journey kırığıdır.

Yönerge:

Auth dışı public route ayrılmalı:

- `/book/:workspaceSlug/:eventTypeSlug`
- veya `/public/scheduling/:eventTypeId`

Bu route AuthGate dışında olmalı. Console tarafında "copy booking link" gerçek link üretmeli. Public sayfa kendi loading/error/confirmation state'ini taşımalı.

### J5. Workspace Değiştirince Veri Değişmiyor

Kanıt:

- `useTenantStore` yalnız `tenantId` ve `workspaceId` tutuyor.
- `WorkspaceSwitcher` seçim sonrası yalnız store ve toast güncelliyor.
- Feature store'lar `workspaceId` tüketmiyor. `rg workspaceId web/src/features` sonucu domain state scoping yok.
- Domain seed verileri global.

Journey etkisi:

Kullanıcı "Core Team"den "Growth" workspace'e geçer; başlık ve accent değişir ama kanallar, meeting'ler, support conversation'ları, docs ve booking'ler aynı kalır. Bu, multitenancy mental modelini bozar. Kullanıcı "workspace değişti mi, değişmedi mi?" belirsizliğine düşer.

Operasyonel risk:

Gerçek backend geldiğinde kullanıcı farklı tenant/workspace'te eski workspace verisini görmeye alışmış bir UX akışından dönecek; cache ve state reset davranışı sonradan kırıcı olur.

Yönerge:

- Her domain seed/mock verisi workspace scope ile ayrılmalı.
- Workspace değişiminde active entity resetlenmeli veya yeni workspace'te geçerli entity'ye resolve edilmeli.
- Query key standardı frontend UX'in parçası olmalı: `tenantId/workspaceId` olmadan veri gösterilmemeli.
- Geçiş sonrası "Growth workspace'e geçildi" toast'ı yeterli değil; içerik de değişmeli.

## 4. P2 Journey Sorunları

### J6. Kaydedilmemiş İş Koruması Yetersiz

Kanıt:

- `beforeunload`, `useBlocker`, `usePrompt` kullanımı yok.
- Çok sayıda local form/draft state var:
  - support reply draft
  - thread reply draft
  - copilot input
  - docs kanban draft
  - clip comment/password/CTA fields
  - scheduling public booking form
  - support agent studio fields
  - webinar ticket/agenda builder fields
  - telephony receptionist builder fields
- Messaging main composer topic bazlı draft tutuyor, ama feature store persist edilmiyor.

Journey etkisi:

Kullanıcı uzun bir support reply, booking formu, agent goal, webinar agenda item veya clip CTA yazarken:

- başka domain'e giderse,
- browser back yaparsa,
- reload yaparsa,
- workspace değiştirirse,

iş sessizce kaybolabilir. Auth/UI persist çözülmüş olsa bile feature-level work-in-progress korunmuyor.

Yönerge:

Formları iki sınıfa ayır:

- kısa ve önemsiz: route değişiminde reset kabul edilebilir.
- uzun/kritik: dirty guard + session draft gerekir.

Öncelikli guard gerektirenler:

- support reply/note
- meeting side chat
- docs clip comment/CTA/privacy
- scheduling public booking
- agent studio/receptionist builder
- webinar event/ticket/agenda builder

### J7. Komut Paleti Bazı Action'larda Yolculuğu Tamamlamıyor

Kanıt:

- `web/src/data/commands.ts`: `action.switchWorkspace`, `action.newTask`, `action.search`.
- `web/src/components/shell/CommandPalette.tsx`: action branch yalnız `newTask` ve `search` için davranış içeriyor; `action.switchWorkspace` case'i yok.
- `action.newTask` sadece `/docs` route'una navigate ediyor; yeni task/work item başlatmıyor.
- `action.search` `/dashboard`'a navigate ediyor; arama UI'ı açmıyor.

Journey etkisi:

Kullanıcı komut paletinde "Switch workspace" seçer; palette kapanır ama workspace seçimi başlamaz. "New task" seçer; docs'a gider ama task oluşturma akışına odaklanmaz. Komut paleti AI-first shell'in ana giriş noktası olarak sunuluyor, bu yüzden no-op veya zayıf action'lar güven kaybettirir.

Yönerge:

Her command için outcome tanımı olmalı:

- navigation command: route'a gider.
- modal command: ilgili modal/drawer açar.
- creation command: doğru tab + doğru form + focus açar.
- AI command: belirli context ile copilot çalıştırır.

`action.switchWorkspace` workspace menu/drawer açmalı. `action.newTask` docs apps/workhub task formuna veya kanban add-card alanına focus vermeli.

### J8. AI / Copilot Context Fazla Genel

Kanıt:

- `web/src/components/shell/CopilotDock.tsx`: context sadece route/domain label.
- `web/src/components/shell/CommandPalette.tsx`: AI context yine active domain label.
- `web/src/lib/useCopilot.ts`: prompt + string context alıyor.
- `web/src/data/agentScenarios.ts`: prompt keyword ile generic senaryo seçiyor.
- Örnek: messaging "summarize from here" context olarak yalnız `name` veriyor; aktif message range/thread id taşınmıyor.

Journey etkisi:

Kullanıcı "bu thread'i özetle", "bu ticket'a yanıt taslağı hazırla", "bu booking'i yeniden planla", "bu clip'ten task çıkar" gibi bağlamsal bir iş ister. Copilot görünür olarak çalışır ama gerçek seçili nesneye bağlı değildir. Sonuç generic görünür; kullanıcı "AI bunu hangi konuşmaya göre yaptı?" diye belirsizlik yaşar.

Yönerge:

Copilot context string değil structured grounding olmalı:

- `domain`
- `workspaceId`
- `entityType`
- `entityId`
- `selection`
- `sourceRoute`
- `allowedActions`

Her domain kendi `CopilotContextProvider` veya registry entry'sini yayınlamalı. Copilot cevabı mümkünse bir action sonucu üretebilmeli: draft insert, message send, ticket update, schedule create.

### J9. Sahte Başarı CTA'ları Beklentiyi Yanlış Yönetiyor

Kanıt örnekleri:

- `ClipsList`: "Record clip" doğrudan `addClip` ile 0 saniyelik boş clip ekliyor; capture/source/recording adımı yok.
- `RecordingSummaryDialog`: "Download recap" sadece success toast.
- `FileMessage`: download mock toast.
- `CtaBanner`: CTA click sadece intent recorded toast.
- Bazı export/forward/simulive aksiyonları artefakt üretmeden positive toast veriyor.

Journey etkisi:

Kullanıcı record/download/export gibi komutlarda somut sonuç bekler:

- dosya inmesi,
- link kopyalanması,
- kayıt akışının başlaması,
- artefaktın listede görünmesi,
- confirmation detayının görünmesi.

Sadece "başarılı" toast göstermek, özellikle demo dışında kullanıcı güvenini kırar. Mock olsa bile "bu demo aksiyonudur" ile "iş tamamlandı" ayrımı yapılmalı.

Yönerge:

Her CTA outcome kategorisine ayrılmalı:

- gerçek mock artefakt üretir: listede yeni item, indirilebilir blob, kopyalanan link.
- simülasyon başlatır: wizard/progress/preview.
- demo dışı: açık "demo sınırlaması" feedback'i verir.

Positive toast yalnız gerçek outcome sonrası kullanılmalı.

### J10. Support Inbox Mobil/Tablet Akışı Kopuyor

Kanıt:

- `SupportLayout` inbox view içinde aynı anda `InboxNav`, conversation list, conversation view ve contact panel yan yana.
- `InboxNav` `hidden ... md:flex`; küçük ekranda filtre/inbox seçimi tamamen kayboluyor.
- `ContactPanel` `hidden ... xl:block`; tablet ve mobilde contact/KB/labels/CSAT paneline alternatif drawer yok.
- Conversation list ve conversation view küçük ekranda yan yana kalıyor.

Journey etkisi:

Support ajanının temel akışı şudur:

1. inbox/filter seç,
2. conversation seç,
3. mesajı oku,
4. contact/context/KB gör,
5. reply/note gönder,
6. status/label güncelle.

Mobil/tablet boyutta bu akış bölünüyor: filtreler ve contact context kayboluyor, conversation list ile detay aynı anda sıkışıyor. Kullanıcı dar ekranda bir conversation'a odaklanmakta zorlanır.

Yönerge:

Support için responsive journey state gerekli:

- `pane=list | conversation | contact | kb`
- mobilde tek pane görünür.
- conversation seçince detail pane'e geçer.
- back button listeye döner.
- contact/KB drawer butonu conversation header'da görünür.
- filters drawer olarak erişilir.

### J11. Aktif Tab/Görünüm State'i URL veya Persist ile Korunmuyor

Kanıt:

- `DocsPage`: `const [tab, setTab] = React.useState("canvas")`.
- `SupportLayout`: `const [view, setView] = React.useState("inbox")`.
- `SchedulingPage`: `const [view, setView] = React.useState("console")`.
- Benzer şekilde selected clip, active event type, support conversation URL'e bağlı değil.

Journey etkisi:

Kullanıcı docs `clips` tabında bir clip ayarlarken reload yapar, docs canvas'a döner. Scheduling public view içinde form doldururken link paylaşamaz veya reload sonrası console'a döner. Support workforce/studio view doğrudan linklenemez.

Yönerge:

Tab/view state query param olmalı:

- `/docs?tab=clips&clip=...`
- `/support?view=studio&agent=...`
- `/scheduling?view=public&type=...`

Bu, hem back/forward hem de paylaşılabilir link için gerekir.

### J12. Booking Confirmation Yolculuğu Eksik

Kanıt:

- `PublicBookingPage` booking sonrası sadece saat ve event title gösteriyor.
- Email format validation yok; sadece non-empty kontrol.
- Calendar invite, meeting link, reschedule/cancel link, copy confirmation gibi kullanıcı sonrası aksiyonları yok.
- Public booking AuthGate altında olduğu için dış kullanıcı akışı zaten yok.

Journey etkisi:

Invitee rezervasyon yaptıktan sonra "şimdi ne olacak?" sorusuna net cevap alamıyor. SaaS booking akışında confirmation genellikle şu sonuçları verir:

- toplantı linki,
- takvime ekle,
- e-posta gönderildi bilgisi,
- yeniden planla/iptal linki,
- timezone doğrulaması.

Mevcut ekran yalnız "booked" diyor.

Yönerge:

Booking done state şu bilgileri göstermeli:

- tarih/saat + timezone,
- host,
- location/meeting link,
- copy link,
- add to calendar mock,
- reschedule/cancel mock links,
- email confirmation message.

Email input format validation ve inline error da eklenmeli.

## 5. P3 Journey Sorunları

### J13. Form Hatalarında Neden Görünürlüğü Tutarsız

Kanıt:

- Bazı formlar yalnız disabled button ile blokluyor.
- Bazı inputlarda `aria-invalid`/`aria-describedby` yok.
- Public booking email formatını doğrulamıyor.
- Çok sayıda `disabled={!draft.trim()}` veya benzeri var; neden görünür değil.

Journey etkisi:

Kullanıcı "neden devam edemiyorum?" sorusunu cevaplayamaz. Özellikle uzun builder formlarında eksik alanların listelenmesi gerekir.

Yönerge:

Paylaşılan `Field` / `FormError` pattern'i:

- inline error,
- `aria-invalid`,
- `aria-describedby`,
- disabled reason tooltip/helper text,
- submit sonrası ilk hatalı alana focus.

### J14. Empty Workspace / First Run Journey Hala Gerçekçi Değil

Kanıt:

- Domainler çoğunlukla seed data ile dolu başlıyor.
- Empty state'ler var ama gerçek "ilk workspace" onboarding akışı yok.
- Dashboard domain kartları var, fakat "ilk kanalını oluştur", "ilk booking linkini yayınla", "ilk support inbox'u bağla" gibi progressive setup yok.

Journey etkisi:

Yeni kullanıcı ürünü ilk açtığında hangi sırayla değer yaratacağını öğrenmez. Demo dolu olduğu için bu akış test edilmemiş kalır.

Yönerge:

Her domain için first-run checklist:

- Messaging: kanal oluştur / takım davet et.
- Scheduling: event type oluştur / public link kopyala.
- Support: inbox bağla / ilk macro oluştur.
- Docs: ilk doc veya clip oluştur.
- Meetings: personal room / first meeting.

### J15. Search Yolculuğu Domainlere Dağılmış

Kanıt:

- Messaging içinde `GlobalSearchDialog`.
- Support içinde `KbPanel` search.
- Intelligence transcript search.
- Dashboard command palette search action sadece `/dashboard`'a gider.
- Platform search portu yok.

Journey etkisi:

Kullanıcı "bir şeyi bulmak" istediğinde hangi arama kutusunu kullanacağını bilemez. Komut paleti genel arama gibi görünür ama domain içeriklerini aramaz.

Yönerge:

Search journey ayrılmalı:

- Command palette: komut/route/action.
- Global search: people/messages/docs/tickets/meetings.
- Domain search: ilgili domain içi filtre.

Komut paletindeki "Search" action global search'ü açmalı veya kaldırılmalı.

## 6. Journey Bazlı Öncelik Haritası

### Mobil İlk Açılış

Sorunlar:

- primary nav yok,
- workspace switcher yok,
- copilot varsayılan açık,
- support/messaging çok panelli ekranlar daralıyor.

Öncelik: P1

### Mesajdan Toplantıya

Sorunlar:

- start meeting `/meetings` route'una gidiyor ama room/channel context URL'de yok,
- geri dönüş ve paylaşılabilir room link zayıf,
- ongoing meeting badge store'a bağlı.

Öncelik: P2

### Bildirimden İşe Dönme

Sorunlar:

- notification target yok,
- activity feed link değil,
- URL entity state yok.

Öncelik: P1

### Support Ajan İş Akışı

Sorunlar:

- active conversation URL'de yok,
- mobile/tablet pane journey yok,
- contact/KB bağlamı dar ekranda kayboluyor,
- reply draft korunmuyor.

Öncelik: P1/P2

### Scheduling / Public Booking

Sorunlar:

- public route yok,
- AuthGate altında,
- tab state local,
- confirmation eksik,
- email validation zayıf.

Öncelik: P1

### Docs / Clips

Sorunlar:

- selected tab/clip URL'de yok,
- Record gerçek kayıt journey'si değil,
- clip detail local form state kaybolabilir,
- clip output gerçek hedefe gönderilmiyor, sadece textarea output üretiyor.

Öncelik: P2

### AI Copilot

Sorunlar:

- context domain label seviyesinde,
- selected object grounding yok,
- follow-up suggestion'lar gerçek action'a bağlanmıyor,
- streaming devam ederken navigation/clear dışında task lifecycle görünürlüğü sınırlı.

Öncelik: P2

## 7. Önerilen Uygulama Sırası

### İlk Tur: Navigasyon ve Bağlam

1. Mobil primary nav ve copilot drawer davranışı.
2. URL state: messaging/support/docs/scheduling için `useUrlSelection` entegrasyonu.
3. Notification/activity target model.
4. Public booking route'u AuthGate dışına alma.

### İkinci Tur: İş Kaybını Önleme

1. Dirty-state guard.
2. Kritik form draft persistence.
3. Workspace değişiminde domain state reset/hydrate.
4. Booking/support/docs draft kaybı testleri.

### Üçüncü Tur: Outcome Güvenilirliği

1. Mock CTA outcome standardı.
2. Record clip wizard veya demo-limited state.
3. Download/export/copy için gerçek mock artefakt.
4. Command palette action outcome tamamlaması.

### Dördüncü Tur: Operasyonel UX

1. Support responsive pane state.
2. Global search journey.
3. Structured copilot grounding.
4. First-run empty workspace onboarding.

## 8. Net Cevap

Bu codebase'in UX sorunu estetik değil; kullanıcı bağlamının route, workspace, notification ve task outcome seviyesinde yeterince taşınmaması.

En problemli dosya/alanlar:

- Mobil shell/navigation: `web/src/components/shell/AppShell.tsx`, `TopBar.tsx`, `PrimaryNav.tsx`, `CopilotDock.tsx`
- URL state/deep-link: `web/src/lib/useUrlSelection.ts`, `web/src/routes/router.tsx`, domain page/store dosyaları
- Notification/activity journey: `web/src/components/shell/NotificationBell.tsx`, `web/src/types/domain.ts`, `DashboardPage.tsx`
- Public booking: `web/src/features/scheduling/SchedulingPage.tsx`, `PublicBookingPage.tsx`, `router.tsx`
- Workspace scoping: `web/src/store/tenantStore.ts`, tüm `web/src/features/*Store.ts`
- Unsaved work: support/docs/scheduling/webinar/telephony form bileşenleri
- Command palette action completion: `web/src/components/shell/CommandPalette.tsx`, `web/src/data/commands.ts`
- Copilot grounding: `web/src/components/shell/CopilotDock.tsx`, `web/src/lib/useCopilot.ts`, `web/src/data/agentScenarios.ts`

Öncelik yeni feature eklemek değil; mevcut feature'ları linklenebilir, geri dönülebilir, mobilde gezilebilir, workspace'e göre tutarlı ve gerçek outcome üreten journey'lere çevirmek.
