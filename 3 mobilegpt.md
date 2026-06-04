# AURA Mobile-First Adaptive / Fluid UX Raporu

Kapsam: `/Users/karaca/Downloads/teamslike/web` frontend uygulamasının mobil kullanıcı yolculukları.

Bu rapor UI estetiği, renk, tipografi, marka hissi veya görsel kompozisyon değerlendirmez. Odak yalnızca mobil UX: kullanıcının küçük ekran, dokunmatik giriş, mobil browser viewport, sanal klavye, alt sabit alanlar, tek elle kullanım ve cihaz geçişleriyle işini tamamlayabilmesi.

Tarih: 2026-06-04

## 1. Net Değerlendirme

Proje şu anda desktop-first bir shell üzerine `sm/md/lg` breakpoint yamaları eklenmiş durumda. Bazı iyi adımlar var:

- Messaging aktif kanal/topic URL parametresine yazılıyor: `web/src/features/messaging/MessagingPage.tsx`.
- Support aktif conversation URL parametresine yazılıyor: `web/src/features/support/SupportLayout.tsx`.
- Scheduling aktif event type URL parametresine yazılıyor: `web/src/features/scheduling/SchedulingPage.tsx`.
- Notification click artık `href` ile hedefe gidebiliyor: `web/src/components/shell/NotificationBell.tsx`, `web/src/data/notifications.ts`.
- Messaging `ThreadPanel` ve `DetailsPanel` küçük ekranda drawer davranışına geçmiş.
- Messaging header'da mobil search overlay eklenmiş.

Bunlar faydalı, fakat uygulama hala mobile-first adaptive/fluid değil.

Ana problem: mobilde masaüstü layout daraltılıyor. Kullanıcı için her bounded context ayrı bir mobil görev akışı olarak yeniden düzenlenmiyor. Mobilde olması gereken model şudur: tek ana görev, geçici sheet/drawer ile ikincil bağlam, sabit ve güvenli alt aksiyon alanı, URL ile korunmuş seçim, yatay taşma yok, klavye açıldığında composer/form kaybolmuyor.

## 2. Responsive Değil, Adaptive ve Fluid Ne Demek?

Bu proje için "responsive" yeterli değil. `md:hidden`, `lg:grid-cols-3`, `flex-wrap` gibi kurallar ekranı kırmadan göstermeye çalışır, fakat kullanıcı yolculuğunu değiştirmez.

İstenen yaklaşım:

| Kavram | Beklenen anlam |
|---|---|
| Mobile-first | Base layout mobil görev akışıdır. Desktop sonradan genişletilir. |
| Adaptive | Mobil, tablet, desktop yalnız genişlik farkı değil; farklı navigation, panel, sheet, route state ve aksiyon önceliği kullanır. |
| Fluid | Sabit `w-64`, `w-80`, `grid-cols-[14rem_1fr]` gibi ölçüler temel layout'u kilitlemez; içerik `min/max/clamp`, container ve kullanılabilir alanla akar. |
| Task-first | Aynı anda üç panel göstermek yerine kullanıcının o anki görevi öne alınır. |
| Keyboard-safe | Sanal klavye açılınca composer/form, CTA ve aktif call bar görünür kalır. |
| Safe-area aware | iOS home indicator, mobile browser toolbar ve notch alanları hesaba katılır. |

Mobilde masaüstündeki tüm yüzeyleri aynı anda göstermek hedef olmamalı. Mobilde doğru hedef: kullanıcının tek işi hızlı ve güvenli tamamlaması.

## 3. Yönetici Özeti

| Öncelik | Alan | Sorun |
|---|---|---|
| P0 | App shell | `PrimaryNav` mobilde tamamen gizli; yerine bottom nav, menu sheet veya adaptive nav yok. |
| P0 | Copilot | `copilotOpen` default `true`; `CopilotDock` sabit `w-80` panel olarak küçük ekranda ana içeriği sıkıştırıyor. |
| P0 | Mobil test | Playwright yalnız Desktop Chrome çalıştırıyor; gerçek mobil viewport regression yok. |
| P0 | Çok panelli domainler | Messaging, Support, Meetings, Telephony gibi ana işler desktop pane modelini mobil base olarak kullanıyor. |
| P0 | Viewport / keyboard | `h-screen`, fixed bottom surfaces ve modal top offset mobil browser/keyboard/safe-area ile uyumlu değil. |
| P1 | TopBar | Mobilde header fazla kalabalık; workspace switcher gizli; search, bell, copilot, settings, avatar aynı hatta yarışıyor. |
| P1 | Messaging | Communities + channel sidebar + conversation aynı anda mobilde render ediliyor; channel picker adaptive sheet değil. |
| P1 | Support | Conversation list ve detail aynı anda duruyor; filters/contact/KB için mobil görev modeli yok. |
| P1 | Meetings | Stage, control bar, side panels ve host/engage panelleri mobil toplantı deneyimine dönüşmüyor. |
| P1 | Telephony | SMS iki kolon, active call bar, routing/IVR formları mobilde operasyonel riskli. |
| P1 | Tables | Admin, Webinar, Canvas table içerikleri card/list dönüşümü olmadan `table w-full` kullanıyor. |
| P1 | Mobile forms | Email/tel/inputMode/autocomplete/inline validation eksik; sabit genişlikli inputlar çok. |
| P2 | Popover widths | Notification, composer menus, command palette, modal gibi overlayler küçük ekran için sistematik contract'a bağlı değil. |
| P2 | Touch affordance | Bazı eylemler hover/focus keşfine bağlı kalıyor; touch'ta görünürlük zayıf. |
| P2 | URL state | Bazı seçimler URL'e taşınmış, fakat tab/sheet/panel mode hala çoğu yerde local state. |

## 4. P0 Sorunlar

### M1. Mobil Ana Navigasyon Yok

Kanıt:

- `web/src/components/shell/AppShell.tsx`: primary nav `hidden ... md:block`.
- `web/src/components/shell/TopBar.tsx`: workspace switcher `hidden md:block`.
- Mobilde hamburger, bottom nav, drawer veya domain launcher yok.

Mobil journey:

1. Kullanıcı login olur.
2. Dashboard dışında Messaging, Support, Phone, Scheduling gibi domainlere geçmek ister.
3. Sol nav görünmez.
4. Workspace switcher da görünmez.
5. Kullanıcı sadece dashboard kartlarına, command palette'e veya URL bilgisine muhtaç kalır.

Bu mobil-first değil. Mobilde ana navigasyon gizlenemez; adaptif bir forma dönüşmelidir.

Hedef davranış:

- Mobil shell birincil olarak bottom nav veya app menu sheet sunmalı.
- En sık domainler 4-5 ana item olarak görünmeli.
- Diğer domainler "More" sheet altında olmalı.
- Workspace seçimi mobilde top-level erişilebilir olmalı.
- Route değişiminde açık sheet kapanmalı.
- Aktif domain ve unread/active call gibi global durumlar bottom nav'da anlaşılmalı.

Kabul kriteri:

- 360px genişlikte kullanıcı herhangi bir domain'e tek elle ulaşabilmeli.
- Login sonrası dashboard'a sıkışmamalı.
- Command palette ana mobil navigasyonun yerine geçmemeli.

### M2. Copilot Mobilde Ana İçeriği Sıkıştırıyor

Kanıt:

- `web/src/store/uiStore.ts`: `copilotOpen: true`.
- Aynı store'da `partialize` yalnız theme/density/locale saklıyor; copilot kapalı durumu persist edilmiyor. Reload sonrası tekrar açık başlar.
- `web/src/components/shell/AppShell.tsx`: `{copilotOpen ? <CopilotDock /> : null}` main ile aynı flex satırında.
- `web/src/components/shell/CopilotDock.tsx`: `w-80` sabit panel.

Mobil journey:

1. Kullanıcı küçük ekranda uygulamaya girer.
2. Ana nav zaten yoktur.
3. Copilot 320px genişliğinde yan panel olarak açılır.
4. Main content sıkışır veya yatay taşma oluşur.
5. Kullanıcı görev alanını değil yardımcı paneli görür.

Hedef davranış:

- Mobilde Copilot varsayılan kapalı olmalı.
- Açıldığında side dock değil full-screen sheet veya bottom sheet olmalı.
- Copilot context mevcut domain/nesne ile gelmeli ama görev akışını kapatmamalı.
- Mobilde Copilot kapatma sonrası tercih korunmalı.

Kabul kriteri:

- 360px viewport'ta Copilot açıkken main layout sıkışmamalı.
- Copilot açma/kapatma tek dokunuşla ve geri tuşu/Esc ile yönetilmeli.
- Sanal klavye açıldığında Copilot textarea görünür kalmalı.

### M3. Mobil Viewport Contract Yok

Kanıt:

- `web/src/components/shell/AppShell.tsx`: root layout `h-screen`.
- `web/src/components/ui/Toast.tsx`: fixed `bottom-4 right-4`.
- `web/src/features/telephony/components/ActiveCallBar.tsx`: fixed bottom bar.
- `web/src/components/ui/Modal.tsx`: `top-[12vh]`.
- Top-level domain sayfalarında yaygın `p-6`, `max-w-6xl`, `h-[58vh]`, `h-[62vh]`.

Mobilde `100vh` güvenilir değildir. iOS/Android browser chrome açılıp kapanınca, sanal klavye gelince ve home indicator alanı olduğunda sabit yükseklikler içerik veya CTA üstüne binebilir.

Hedef davranış:

- Shell `100dvh` veya eşdeğer dynamic viewport kullanmalı.
- Bottom surfaces safe-area padding ile davranmalı.
- Composer, active call bar, toast ve bottom nav aynı çakışma modeline bağlanmalı.
- Modal/sheet içerikleri keyboard açıkken scrollable kalmalı.

Kabul kriteri:

- 390x844 iPhone viewport'ta klavye açıkken composer ve send button görünür kalmalı.
- Active call bar, toast ve bottom nav birbirinin üstüne binmemeli.
- Modal içerikleri viewport dışına kaçmamalı.

### M4. Çok Panelli Layoutlar Mobil Base Olarak Kalıyor

Kanıt örnekleri:

- Messaging: `CommunitiesBar` + `MessagingSidebar` + conversation aynı anda render.
- Support: `InboxNav` + conversation list + conversation view + contact panel modeli.
- Meetings: `Stage` + `SidePanel` + `HostPanel` + `EngagePanel`.
- Telephony messages: `grid-cols-[14rem_1fr]`.
- Docs clips: `lg:grid-cols-[22rem_1fr]` desktop'ta iyi, fakat seçili clip ve liste mobilde ayrı task modeline taşınmıyor.

Mobilde aynı anda çok panel göstermek yerine navigation stack gerekir:

- List mode
- Detail mode
- Sheet mode
- Full-screen task mode

Hedef davranış:

- Her bounded context mobilde tek ana surface göstermeli.
- Liste/detail geçişi URL veya route state ile korunmalı.
- Secondary metadata panelleri sheet olarak açılmalı.
- Back davranışı browser back ile uyumlu olmalı.

### M5. Mobil Regression Test Yok

Kanıt:

- `web/playwright.config.ts`: yalnız `Desktop Chrome` project var.
- `rg` taramasında e2e testlerde mobile/viewport/device coverage yok.
- Mobil için yalnız unit seviyesinde Messaging search overlay testi var.

Sonuç:

Mobilde yatay taşma, kaybolan nav, fixed panel çakışması, tap target ve keyboard sorunları CI'da yakalanmıyor.

Hedef test kapsamı:

- `Pixel 7` veya benzeri Android viewport.
- `iPhone 14` veya benzeri iOS viewport.
- `iPad` veya tablet viewport.
- 360x800 dar viewport.
- Landscape mobil viewport.

Kabul kriterleri:

- Tüm kritik journey'lerde `document.documentElement.scrollWidth <= document.documentElement.clientWidth`.
- Ana nav mobilde görünür.
- Composer keyboard-safe.
- Active call bar çakışmasız.
- Meeting side panel sheet davranışı doğrulanır.

## 5. P1 Shell ve Global Mobile UX Sorunları

### M6. TopBar Mobilde Önceliklendirilmemiş

Kanıt:

- `TopBar` tek satırda app adı, workspace, command search, notification, copilot, settings, avatar render ediyor.
- Workspace mobilde gizli.
- Command search mobilde `flex-1` olarak yer kaplıyor.
- `Kbd` her zaman render ediliyor; mobilde `⌘K` anlamlı değil.

Mobilde topbar şu rollere ayrılmalı:

- Global status: app/workspace/current domain.
- Primary action: search veya menu, ama ikisi birden değil.
- Overflow: settings/account/role/density/language.
- Domain action: sayfaya özel değilse topbar'a eklenmemeli.

Hedef davranış:

- Mobil topbar kompakt olmalı.
- Workspace switcher erişilebilir ama geniş dropdown trigger olarak değil sheet/action row olarak açılmalı.
- `⌘K` mobilde gizlenmeli.
- Search topbar'da tam input değil, command/search sheet trigger olmalı.

### M7. Overlay Width Contract Eksik

Kanıt:

- Notification menu: `w-[22rem]`.
- Workspace menu: `w-[18rem]`.
- Composer canned menu: `w-72`.
- Emoji/GIF picker: `w-72`.
- Modal: `w-[min(92vw,40rem)]`, ama top offset ve max height sistematik değil.

`22rem` 352px'tir. 320px cihazlarda menu viewport dışına taşabilir. Radix align-end bu taşmayı kısmen yönetebilir ama adaptive sheet contract yok.

Hedef davranış:

- Mobilde dropdown yerine sheet veya full-width popover kullanılmalı.
- Tüm overlayler `max-inline-size: calc(100vw - safe-area - margin)` mantığına bağlı olmalı.
- Büyük seçim listeleri bottom sheet olmalı.
- Overlay kapanınca focus trigger'a dönmeli.

### M8. Toast, Active Call Bar, Bottom Nav Çakışma Riski

Kanıt:

- `ToastViewport`: fixed bottom-right.
- `ActiveCallBar`: fixed bottom center.
- Planlanan mobil shell için bottom nav da alt alanda olacak.

Bu üç yüzey ayrı ayrı konumlanırsa mobilde aynı alanı işgal eder.

Hedef davranış:

- Global bottom stack sistemi olmalı.
- Öncelik: active call > composer > bottom nav > toast.
- Toast mobilde top veya bottom stack içinde offset almalı.
- Active call bar tam genişlikli compact sheet olmalı.

## 6. P1 Messaging Mobile UX

### M9. Channel Picker Mobilde Adaptive Değil

Kanıt:

- `MessagingPage`: `CommunitiesBar`, `MessagingSidebar`, main conversation aynı flex içinde.
- `CommunitiesBar`: `w-14`.
- `MessagingSidebar`: `w-64`.

320-390px mobilde bu iki sol alan conversation'dan önce yer kaplar. Kullanıcı mesaj okumadan önce sidebar'ların içinde kalır.

Hedef mobil journey:

1. Messaging açılır.
2. Varsayılan olarak aktif conversation tam ekran görünür.
3. Header'da channel/topic picker button vardır.
4. Picker bottom sheet veya full-screen sheet olarak açılır.
5. Community/channel/topic seçilince sheet kapanır.
6. Conversation state URL'de korunur.

Kabul kriteri:

- 360px cihazda conversation alanı ilk ekranda görünür olmalı.
- Channel list ayrı bir sheet/route mode olmalı.
- Back tuşu açık sheet'i kapatmalı; kapalıysa önceki route'a dönmeli.

### M10. Header Aksiyonları Mobilde Çok Yoğun

Kanıt:

- `ChannelHeader` mobilde search icon, catch-up, analyze, meet, saved, details aynı satırda kalıyor.
- Bazı label'lar `hidden sm:inline`; butonlar yine aynı sayıda kalıyor.

Sorun:

Label gizlemek alan sorununu azaltır ama görev önceliğini çözmez. Mobilde tüm aksiyonları header'da tutmak yerine primary/secondary ayrımı gerekir.

Hedef:

- Header primary: channel picker, search, more.
- Secondary actions: AI catch-up, start meeting, details, saved-only, analyze -> overflow sheet.
- Customer conversation durumları da header'ı şişirmeden sheet içinde düzenlenmeli.

### M11. Composer Mobil Klavye ve Aksiyon Yoğunluğu

Kanıt:

- Composer içinde formatting toolbar, slash menu, mention menu, attachment, GIF/sticker, canned, voice, poll, silent, schedule, AI draft, rewrite, send aynı yüzeyde.
- Menüler `side="top"` ile composer üstüne açılıyor.
- Textarea sabit `rows={2}` ve keyboard-aware davranış yok.

Mobil journey etkisi:

Kullanıcı yazmaya başladığında sanal klavye açılır. Üstte popover, altta composer, varsa active call/toast/bottom nav üst üste binebilir. Aksiyon sayısı fazla olduğu için send button'a ulaşmak zorlaşır.

Hedef:

- Composer mobilde iki seviyeli olmalı:
  - İlk sıra: attach, text input, send.
  - Secondary tray: formatting, GIF, poll, schedule, AI, rewrite.
- Mention/slash önerileri full-width sheet veya input üstünde viewport safe list olmalı.
- `textarea` keyboard açıkken görünür alanda kalmalı.
- Draft route değişiminde korunmalı.

### M12. Hover/Fokus Bağımlı Aksiyonlar Touch İçin Zayıf

Kanıt:

- `MessagingSidebar` chat action trigger `opacity-0`, hover/focus ile görünür.
- Message actions görünür hale getirilmiş olsa da bazı list actionları hala desktop keşfine yakın.

Mobilde hover yoktur. Aksiyonlar:

- uzun basma,
- kalıcı küçük overflow icon,
- swipe action,
- veya item detail sheet içinde görünmelidir.

Kabul kriteri:

- Touch cihazda chat mute/pin/archive eylemleri görünür bir girişle erişilebilir olmalı.
- Sadece hover'a bağlı keşif kalmamalı.

## 7. P1 Support Inbox Mobile UX

### M13. Inbox List ve Conversation Aynı Anda Kalıyor

Kanıt:

- `SupportLayout`: inbox view'da `InboxNav`, conversation list ve `ConversationView` aynı flex satırında.
- Conversation list `w-full max-w-[20rem]`.
- `InboxNav` `hidden ... md:flex`, mobilde filtre/inbox seçimi kayboluyor.
- `ContactPanel` `hidden ... xl:block`, mobil/tablet için sheet alternatifi yok.

Mobil journey:

1. Agent support inbox'a girer.
2. Mobilde filtre/inbox nav görünmez.
3. Conversation list ekranın büyük kısmını kaplar.
4. Conversation detail aynı anda yanında durmaya çalışır veya sıkışır.
5. Contact, labels, CSAT, KB bilgisi yok olur.

Hedef mobil journey:

- Inbox list full screen.
- Conversation seçilince detail full screen.
- Detail header'da back to inbox, status, customer info sheet, macros/AI.
- Filters sheet olarak erişilir.
- Contact/KB/labels/CSAT ayrı bottom sheet veya right sheet.

Kabul kriteri:

- 390px cihazda aktif ticket reply akışı tek ekranda tamamlanmalı.
- Inbox filtresi mobilde erişilebilir olmalı.
- Contact labels/CSAT mobilde kaybolmamalı.

### M14. Reply Composer Formu Mobil İçin Sınırlı

Kanıt:

- Support reply box `input` kullanıyor, multiline textarea değil.
- Note/reply toggle, AI suggest, input, send aynı satırda.

Mobilde müşteri cevapları çoğu zaman multiline olur. Tek satır input mobil keyboard ile zorlar.

Hedef:

- Multiline composer.
- Mode switch compact segmented control veya overflow.
- AI suggestion sheet.
- Send button keyboard-safe.

## 8. P1 Meetings Mobile UX

### M15. Meeting Room Mobil Toplantı Modeline Dönüşmüyor

Kanıt:

- `MeetingRoom`: stage yanında `SidePanel`, `HostPanel`, `EngagePanel` render ediyor.
- Bu paneller `w-80` sabit genişlikli.
- `ControlBar`: 13 civarı round button aynı flex-wrap alanda.
- Stage grid `grid-cols-2 sm:grid-cols-3`.

Mobil meeting deneyimi desktop panel modelinden farklı olmalıdır.

Hedef mobil meeting:

- Stage full screen ana yüzey.
- Alt controls: 4 primary action visible: mic, camera, share/hand, leave.
- More sheet: captions, recording, layout, AI notes, engage, whiteboard, participants, chat, host controls.
- Participants/chat/captions/host/engage bottom sheet olarak açılır.
- Panel açıkken stage tamamen sıkışmamalı; sheet overlay olmalı.
- Landscape mode ayrı optimize edilmeli.

Kabul kriteri:

- 390x844 cihazda stage ilk ekranda anlamlı büyüklükte kalmalı.
- 13 kontrol aynı anda görünmeye çalışmamalı.
- Chat açıldığında composer keyboard-safe olmalı.
- Leave button her zaman görünür veya tek aksiyon uzaklıkta olmalı.

### M16. Meeting Captions ve Reactions Çakışabilir

Kanıt:

- Captions overlay `absolute bottom-3`.
- Reactions overlay de `absolute bottom-3`.
- Control bar stage altında.

Mobilde captions, reactions, bottom controls aynı alt bölgeye yığılır.

Hedef:

- Captions için dedicated safe overlay lane.
- Reactions kısa süreli üst/orta lane.
- Controls alanı ile çakışmayan offset.

### M17. Prejoin/Live Call Device Hazırlığı Mobilde Eksik

Kanıt:

- Mevcut PreJoin desktop card modeli kullanıyor.
- Gerçek device permission, mobile camera/mic unavailable/error state gibi journey yok.

Mobilde call join öncesi gerekli durumlar:

- kamera/mikrofon izin hatası,
- bluetooth/headset seçimi,
- düşük bağlantı uyarısı,
- join muted/camera off state,
- safe leave/back confirmation.

Bu rapor backend gerektirmeden UX contract olarak not eder.

## 9. P1 Telephony Mobile UX

### M18. Active Call Bar Mobilde Operasyonel Risk Taşıyor

Kanıt:

- `ActiveCallBar`: fixed bottom `w-[min(46rem,94vw)]`.
- DTMF keypad `grid-cols-6`.
- Transfer area inline input + iki button.
- Monitor modes, call info, controls aynı bar içinde.

Mobilde aktif çağrı kritik bir görevdir. Dar fixed bar içinde çok fazla işlem yan yana durur. Yanlış hangup/transfer/hold riski artar.

Hedef mobil active call:

- Full-width bottom call sheet.
- Compact collapsed state: caller, duration, mute, hold, hangup.
- Expanded state: keypad, transfer, record, park, AI coach, monitor.
- DTMF keypad 3x4 olmalı, 6 kolon değil.
- Hangup destructive action ayrı ve güçlü confirmation gerektiren bağlama göre tasarlanmalı.

Kabul kriteri:

- 360px ekranda mute/hold/hangup aynı anda net erişilebilir olmalı.
- DTMF tuşları 44px minimum ve 3x4 düzeninde olmalı.
- Transfer işlemi keyboard açıldığında bar dışına taşmamalı.

### M19. SMS Messages Pane Desktop Grid Kullanıyor

Kanıt:

- `MessagesPane`: `grid-cols-[14rem_1fr]`.

Mobilde thread list ve conversation aynı anda olmamalı.

Hedef:

- Thread list screen.
- Thread detail screen.
- Back to threads.
- Composer keyboard-safe.
- Scheduled messages sheet.

### M20. Phone Tab Bar Mobilde Aşırı Uzun

Kanıt:

- `PhoneLayout`: 10 tab `flex flex-wrap`.

Mobilde çok satırlı tab bar sayfa başında büyük alan tüketir. Bu bir responsive wrap değil, adaptive navigation olmalıdır.

Hedef:

- Primary tabs: Keypad, Directory, Messages, More.
- More sheet içinde voicemail/routing/queues/attendant/IVR/analytics.
- Admin-heavy phone config surfaces mobilede card wizard veya accordion olmalı.

## 10. P1 Scheduling Mobile UX

### M21. Public Booking Gerçek Mobil Paylaşım Deneyimi Değil

Kanıt:

- Public booking `SchedulingPage` içindeki local tab state ile açılıyor.
- Sayfa AuthGate altında kalır.
- `PublicBookingPage` active event type store'dan geliyor.

Not: aktif event type `?type=` ile URL'e yazılıyor, bu iyi. Fakat public booking hala uygulama console tab'ı gibi davranıyor.

Mobil public booking hedefi:

- Auth gerektirmeyen route.
- Host/event slug ile açılır.
- Date/time/name/email flow tek amaçlıdır.
- Email input `type=email`, autocomplete, validation.
- Timezone açıklaması ve değiştirme erişilebilir.
- Confirmation sonrası copy link, calendar add, reschedule/cancel bilgisi.

### M22. Slot Grid ve Date Input Mobil İçin Yetersiz

Kanıt:

- Time slots `grid-cols-3 sm:grid-cols-4`.
- Date input inline label içinde.
- Name/email basic input, email type yok.

Mobilde:

- Tarih seçimi yatay date strip veya calendar sheet olabilir.
- Slots tek kolon ya da 2 kolon, thumb reach ve okunabilirlik öncelikli olmalı.
- Name/email step form validation açık olmalı.
- Disabled confirm button nedenini açıklamalı.

## 11. P1 Docs, Canvas ve Workhub Mobile UX

### M23. Docs Tabs Local ve Mobilde Kalabalık

Kanıt:

- `DocsPage`: Canvas, Board, Workflows, Clips, Apps tabs local state.
- Tab state URL'e yazılmıyor.
- `flex-wrap` kullanılıyor.

Mobilde Docs bir iş hub'ı ise tab wrap yerine:

- mobile segmented nav veya More,
- URL param `?tab=clips`,
- back/restore davranışı,
- tab-specific empty/loading state gerekir.

### M24. Clips List/Detail Mobilde Stack Ama Journey Değil

Kanıt:

- `ClipsList`: desktop'ta `lg:grid-cols-[22rem_1fr]`, mobile'da stack olur.
- `selectedId` local state.

Stack etmek yeterli değildir. Liste ve detay aynı sayfada alt alta olduğunda seçilen clip detayına erişmek için uzun scroll gerekebilir.

Hedef:

- Mobile list screen.
- Clip detail route/sheet.
- Search/filter sticky top.
- Clip actions bottom action bar veya overflow.

### M25. Canvas Table Mobilde Taşma Riski

Kanıt:

- `CanvasBlockCard`: `table className="w-full border-collapse"`, overflow wrapper yok.

Mobilde tablo:

- card rows,
- horizontal scroll with affordance,
- veya compact key/value format olmalı.

## 12. P1 Webinar Mobile UX

### M26. Webinar Console ve Event Manager Desktop Form/Tables Kullanıyor

Kanıt:

- `EventConsole`: 5 tab `flex-wrap`.
- `EventManager`: ticket table `table w-full`, agenda rows inline, birçok fixed-width input.

Mobilde organizer workflow:

- Setup wizard,
- Tickets list as cards,
- Agenda sessions as cards,
- Badge fields sheet,
- Analytics separate screen.

Table sadece desktop'ta kalmalı veya mobile card transform olmalı.

### M27. Webinar Live Preview Mobilde Stage + Q&A/Poll Adaptasyonu Eksik

Kanıt:

- `EventLive`: stage `h-[58vh]`, yan panel `lg:grid-cols-3` altında stack.

Mobilde attendee:

- Stage primary.
- CTA banner safe top/bottom.
- Poll/Q&A bottom sheet.
- Captions stage üzerinde safe lane.
- Exit live action görünür ama yanlışlıkla dokunmayı önleyecek konumda olmalı.

## 13. P1 Admin / Intelligence Mobile UX

### M28. Admin Tables Mobilde Card/List Dönüşmüyor

Kanıt:

- `AuditLogViewer`: `table w-full`.
- Tab bar `flex-wrap`.

Mobilde audit log:

- filter drawer,
- rows as cards,
- expandable details,
- sticky search/filter summary,
- large table değil.

### M29. Intelligence Control Bar ve Transcript Grid Mobilde Aşırı Yoğun

Kanıt:

- `IntelligencePage`: top actions + controls all wrap.
- Source/lang controls inline.
- Main layout `h-[62vh] lg:col-span-2`, sağ analiz kartları altına stack.

Mobilde intelligence:

- Source selector as sheet.
- Translate controls compact.
- Transcript primary.
- Scorecard/recap/actions separate tabs or sheets.
- Live mode başladığında controls collapse.

## 14. P2 Form, Input ve Touch Sorunları

### M30. Mobile Input Semantics Eksik

Örnekler:

- Public booking email input `type=email` değil.
- Phone transfer/route target inputlarında `inputMode="tel"` yok.
- Numeric fields bazı yerde `type=number`, ama mobil stepper/validation/format messaging eksik.
- Email/name alanlarında autocomplete yok.

Mobil UX etkisi:

- Yanlış keyboard çıkar.
- Kullanıcı daha fazla düzeltme yapar.
- Form completion düşer.

Hedef:

- Email: `type=email`, `autocomplete=email`.
- Name: `autocomplete=name`.
- Phone: `inputMode=tel`, `autocomplete=tel`.
- URL/slug: `inputMode=url`.
- Numeric business fields için inline validation ve min/max feedback.

### M31. Checkbox Tap Targetleri Küçük

Kanıt:

- Birçok checkbox `h-4 w-4`.
- Label ile sarıldığı yerler var ama dokunmatik hedef her zaman 44px davranışına bağlanmıyor.

Hedef:

- Checkbox/radio row tüm satır 44px+ target olmalı.
- Görsel checkbox küçük kalabilir ama tappable area büyük olmalı.

### M32. Disabled CTA Nedenleri Belirsiz

Örnekler:

- Public booking confirm sadece disabled.
- Support send disabled.
- Messaging send/schedule/rewrite disabled.
- Poll launch disabled.

Mobilde kullanıcı disabled sebebini hover tooltip ile öğrenemez.

Hedef:

- Inline validation text.
- CTA altı short reason.
- Eksik alanlar belirgin.
- Error summary değil, alan bazlı feedback.

## 15. P2 URL, Back ve Panel State

Bazı iyi gelişmeler var:

- Messaging: `?c=&t=`.
- Support: `?conv=`.
- Scheduling: `?type=`.
- Notifications: `href`.

Eksik kalan mobil state:

- Mobil sheet açık mı?
- Messaging channel picker/detail/thread/details mode.
- Support list/detail/contact/filter mode.
- Docs tab/clip detail.
- Phone tab/thread detail.
- Meetings side panel mode.
- Webinar console tab/live subview.
- Admin tab/filter state.

Mobilde browser back kritik bir navigasyon aracıdır. Kullanıcı bir sheet açınca back ile kapanmasını bekler. Local state kullanımı bunu zayıflatır.

Hedef:

- Route veya search param ile panel mode korunmalı.
- Back behavior domain-level contract'a bağlanmalı.
- Sheet kapatma ve route geri gitme ayrımı net olmalı.

## 16. Mobile-First Adaptive Architecture Önerisi

Bu bölüm kod değişikliği değildir; rapor düzeyinde UX mimari kontratıdır.

### 16.1 Global Shell Modları

| Mode | Viewport | Shell |
|---|---|---|
| mobile | < 640px | bottom nav + top compact bar + sheets |
| tablet | 640-1024px | rail nav + optional split detail |
| desktop | >= 1024px | side nav + multi-panel |

Sadece Tailwind breakpoint yeterli değil. Shell semantic mode üretmeli:

- `isMobileShell`
- `isTabletShell`
- `isDesktopShell`
- `supportsHover`
- `prefersReducedMotion`
- `safeAreaInsets`

Bu bilgiler bounded context'lere doğrudan CSS yerine layout contract olarak akmalı.

### 16.2 Bounded Context Mobile Surface Contract

Her feature şu soruları cevaplamalı:

- Mobilde primary task nedir?
- Liste ve detay aynı anda mı, ayrı mı?
- Secondary panel sheet mi, route mu?
- Composer/form keyboard açılınca nerede kalır?
- Back tuşu ne yapar?
- State URL'e nasıl yazılır?
- Empty/error/loading state mobilde ne kadar alan kaplar?

Önerilen contract:

```text
MobileSurface
- primaryView: list | detail | stage | form | dashboard
- sheet: none | picker | filters | metadata | actions
- selectedId: URL/search param
- dirty: unsaved work flag
- bottomStackSlots: nav | composer | activeCall | toast
```

### 16.3 Fluid Layout Kuralları

Yasak değil ama dikkat gerektiren kalıplar:

- `w-64`, `w-72`, `w-80` mobile base içinde kullanılmamalı.
- `grid-cols-[14rem_1fr]` mobile base içinde kullanılmamalı.
- `h-screen` mobile shell root için kullanılmamalı.
- `table w-full` mobilde wrapper/card dönüşümü olmadan kullanılmamalı.
- `flex-wrap` tab bar, adaptive nav yerine kullanılmamalı.

Beklenen kalıplar:

- Mobile base: single column.
- Tablet: controlled split.
- Desktop: multi-panel.
- `min-w-0` korunmalı.
- Intentional horizontal scroll varsa görsel affordance olmalı.
- `clamp()` ile spacing/header boyları akmalı.
- Safe-area padding bottom/top tanımlanmalı.

## 17. Domain Bazlı Mobil Journey Hedefleri

### 17.1 Shell Journey

Hedef akış:

1. Login.
2. Workspace seçimi veya mevcut workspace gösterimi.
3. Bottom nav ile ana domain seçimi.
4. More sheet ile diğer domainler.
5. Notification'dan hedefe geçiş.
6. Active call varsa global call sheet öncelikli görünür.

Eksik:

- Mobil primary nav yok.
- Workspace switcher gizli.
- Copilot default açık.

### 17.2 Messaging Journey

Hedef akış:

1. Messaging açılır, aktif chat görünür.
2. Channel picker sheet ile kanal/topic seçilir.
3. Mesaj okunur/yazılır.
4. Thread/details ayrı sheet olarak açılır.
5. Composer keyboard-safe kalır.
6. Back önce sheet'i kapatır, sonra chat listesine veya önceki route'a döner.

Eksik:

- Sidebarlar mobilde hala yer kaplıyor.
- Header aksiyonları çok fazla.
- Composer secondary actions ayrışmamış.

### 17.3 Support Journey

Hedef akış:

1. Inbox list full screen.
2. Filter sheet.
3. Conversation detail full screen.
4. Reply/note/AI actions compact.
5. Contact/KB/labels sheet.
6. Resolve sonrası list'e dönüş veya next ticket.

Eksik:

- Filter/inbox nav mobilde gizleniyor.
- List/detail aynı anda kalıyor.
- Contact/KB mobilde kayboluyor.

### 17.4 Meeting Journey

Hedef akış:

1. Prejoin.
2. Stage full screen.
3. Primary controls.
4. More controls sheet.
5. Participants/chat/captions as sheets.
6. Host controls only host için sheet.
7. Leave always safe and visible.

Eksik:

- Çok fazla control aynı anda.
- Sabit `w-80` paneller.
- Captions/reactions/control collision riski.

### 17.5 Phone Journey

Hedef akış:

1. Keypad veya incoming call.
2. Active call collapsed sheet.
3. Expand ile transfer/keypad/monitor.
4. SMS thread list -> thread detail.
5. Routing/IVR as wizard/card list.

Eksik:

- Active call bar yoğun.
- DTMF 6 kolon.
- SMS desktop two-pane.
- Phone tab list fazla geniş.

### 17.6 Scheduling Journey

Hedef akış:

1. Mobile public booking auth'suz açılır.
2. Tarih seçilir.
3. Slot seçilir.
4. Name/email validasyonlu form.
5. Confirmation + calendar/reschedule/cancel.

Eksik:

- Public booking console tab altında.
- Email semantics yok.
- Confirmation bilgisi eksik.

### 17.7 Docs / Canvas Journey

Hedef akış:

1. Docs mobile hub.
2. Tab state URL'e yazılır.
3. Clips list/detail ayrı.
4. Canvas table mobile card veya horizontal scroll affordance.
5. Workflows builder mobile wizard gibi çalışır.

Eksik:

- Tabs local.
- List/detail stack ama task navigation yok.
- Tables dönüşmüyor.

### 17.8 Webinar Journey

Hedef akış:

1. Console setup wizard.
2. Tickets/agenda/badge mobile cards.
3. Live preview stage primary.
4. Q&A/poll sheets.

Eksik:

- Tables ve inline form rows mobilde zor.
- Live preview stage/Q&A sadece stack oluyor.

### 17.9 Admin / Intelligence Journey

Hedef akış:

1. Admin: tabs -> More or section list.
2. Audit table -> cards.
3. Security/billing forms -> step-based panels.
4. Intelligence: transcript primary, controls collapsed, analytics sheets.

Eksik:

- Tables card dönüşümü yok.
- Control density yüksek.

## 18. Mobil UX Test Planı

### 18.1 Viewport Matrisi

Minimum test cihazları:

| Cihaz | Viewport |
|---|---|
| Narrow phone | 360x800 |
| iPhone class | 390x844 |
| Large phone | 430x932 |
| Tablet portrait | 768x1024 |
| Tablet landscape | 1024x768 |

### 18.2 Global Assertions

Her route için:

- Horizontal scroll yok.
- Primary nav görünür.
- Main content 0 genişliğe sıkışmıyor.
- Sabit alt yüzeyler çakışmıyor.
- Popover/sheet viewport dışına taşmıyor.
- Tap targets 44px+.
- Header content wrap/overflow ile görevleri kapatmıyor.

### 18.3 Journey Tests

Öncelikli e2e testler:

1. Mobile shell: login -> bottom nav -> Messaging -> Support -> Phone.
2. Messaging: channel picker -> send message -> open thread -> back closes thread.
3. Support: filter -> open conversation -> reply -> contact sheet -> resolve.
4. Meeting: join -> open chat sheet -> send -> close -> leave.
5. Phone: dial -> active call -> DTMF -> hold -> hangup.
6. Scheduling public: auth'suz booking -> select slot -> valid email -> confirmation.
7. Docs clips: list -> detail -> back.
8. Admin audit: filter -> open row detail.

### 18.4 Visual/Runtime Checks

Playwright'te eklenmesi gereken kontroller:

```text
expect(scrollWidth <= clientWidth)
expect(primary mobile nav visible)
expect(bottom stack no overlap)
expect(active call bar visible and not covering composer)
expect(open sheet has accessible close/back)
expect(keyboard-sensitive composer remains in viewport)
```

Not: Kod yazılmıyor, fakat raporun kabul kriteri bu olmalı.

## 19. Öncelikli Çözüm Sırası

### Sprint 1 - Mobil Shell Contract

1. Mobile shell mode tanımı.
2. Bottom nav veya app menu sheet.
3. Workspace switcher mobile sheet.
4. Copilot mobile sheet ve default closed.
5. Bottom stack sistemi: nav/composer/active call/toast.
6. Mobile Playwright projects.

Bu sprint yapılmadan domain bazlı düzeltmeler kalıcı olmaz.

### Sprint 2 - Messaging + Support

1. Messaging channel picker sheet.
2. Messaging composer compact/expanded states.
3. Support list/detail split yerine mobile navigation stack.
4. Support filter/contact/KB sheets.
5. Browser back behavior.

Bu iki domain en yoğun günlük kullanım yüzeyidir.

### Sprint 3 - Meetings + Telephony

1. Meeting mobile stage/control architecture.
2. Meeting side panels as sheets.
3. Active call mobile sheet.
4. SMS list/detail.
5. Phone tabs -> primary/more model.

Bu alanlarda yanlış mobil UX gerçek zamanlı iş akışını bozar.

### Sprint 4 - Scheduling + Docs + Webinar + Admin

1. Public booking standalone mobile route.
2. Mobile form semantics.
3. Table -> card/list transformations.
4. Docs/clip detail route mode.
5. Webinar live mobile sheets.
6. Admin audit card view.

## 20. Doğrudan Sorunlu Dosya / Alan Listesi

En kritik inceleme alanları:

- `web/src/components/shell/AppShell.tsx`
- `web/src/components/shell/TopBar.tsx`
- `web/src/components/shell/CopilotDock.tsx`
- `web/src/store/uiStore.ts`
- `web/src/components/shell/NotificationBell.tsx`
- `web/src/components/ui/Modal.tsx`
- `web/src/components/ui/Toast.tsx`
- `web/src/features/messaging/MessagingPage.tsx`
- `web/src/features/messaging/components/MessagingSidebar.tsx`
- `web/src/features/messaging/components/ChannelHeader.tsx`
- `web/src/features/messaging/components/MessageComposer.tsx`
- `web/src/features/support/SupportLayout.tsx`
- `web/src/features/support/components/InboxNav.tsx`
- `web/src/features/support/components/ConversationView.tsx`
- `web/src/features/support/components/ContactPanel.tsx`
- `web/src/features/meetings/components/MeetingRoom.tsx`
- `web/src/features/meetings/components/ControlBar.tsx`
- `web/src/features/meetings/components/SidePanel.tsx`
- `web/src/features/meetings/components/HostPanel.tsx`
- `web/src/features/meetings/components/EngagePanel.tsx`
- `web/src/features/telephony/PhoneLayout.tsx`
- `web/src/features/telephony/components/ActiveCallBar.tsx`
- `web/src/features/telephony/components/MessagesPane.tsx`
- `web/src/features/scheduling/SchedulingPage.tsx`
- `web/src/features/scheduling/components/PublicBookingPage.tsx`
- `web/src/features/docs/DocsPage.tsx`
- `web/src/features/docs/components/ClipsList.tsx`
- `web/src/features/docs/components/CanvasEditor.tsx`
- `web/src/features/webinar/WebinarPage.tsx`
- `web/src/features/webinar/components/EventConsole.tsx`
- `web/src/features/webinar/components/EventManager.tsx`
- `web/src/features/admin/AdminConsole.tsx`
- `web/src/features/admin/components/AuditLogViewer.tsx`
- `web/src/features/intelligence/IntelligencePage.tsx`
- `web/playwright.config.ts`

## 21. Neleri Yapmamak Gerekir?

- Sadece `sm:` / `md:` / `lg:` class ekleyerek devam etmek.
- Desktop side panel'i mobilde küçültmek.
- Mobil navigasyonu command palette'e bırakmak.
- Tüm tabları `flex-wrap` ile iki satıra yaymak.
- Hover ile bulunan actionları touch cihazda gizli bırakmak.
- `h-screen` ve fixed bottom yüzeyleri safe-area/keyboard contract olmadan kullanmak.
- Tabloyu mobilde sadece daha küçük fontla göstermek.
- Public booking gibi dış kullanıcı akışını authenticated app tab'ı içinde tutmak.

## 22. Kısa Sonuç

Bu proje mobilde "responsive" yamaya değil, mobile-first adaptive/fluid UX mimarisine ihtiyaç duyuyor.

En kritik kırık shell'de: mobil ana nav yok, workspace gizli, Copilot default açık ve sabit panel. Shell düzelmeden domainler mobilde güvenilir çalışmaz.

İkinci büyük kırık domain panellerinde: Messaging, Support, Meetings ve Telephony hala desktop multi-pane modelinden başlıyor. Bu yüzeyler mobilde single-task screen + sheet + browser-back uyumlu state modeline taşınmalı.

Üçüncü büyük kırık test kapsamı: Playwright sadece desktop. Mobil regression eklenmeden adaptive/fluid UX sürdürülemez.

Öncelik sırası net: önce shell ve mobile test contract, sonra Messaging/Support, sonra Meetings/Telephony, sonra Scheduling/Docs/Webinar/Admin tablo ve form dönüşümleri.
