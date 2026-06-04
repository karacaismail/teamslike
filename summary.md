# AURA — Proje Özet Raporu

**AURA**, AI-öncelikli, çok-kiracılı (multitenant), hepsi-bir-arada birleşik iletişim ve işbirliği (UCaaS + CC + collab) SaaS platformunun **frontend** uygulamasıdır. Backend henüz yoktur; tüm veri ve gerçek-zamanlı akışlar, ileride bir FastAPI/WebSocket arka ucuna birebir takılacak şekilde tip-uyumlu **mock sözleşmelerle** simüle edilir. Bu rapor mimariyi, klasör/dosya yapısını, DDD düzenini, özellikleri, changelog özetini ve **yapılmayanları** belgeler.

Durum: `tsc` temiz, **312 birim/bileşen testi (15 dosya)** + **8 Playwright e2e** yeşil, `vite build` temiz, EN/TR i18n paritesi tip-zorunlu. Kaynak kod ~**29.240 satır** TypeScript/TSX.

---

## 1. Teknoloji Yığını

| Katman | Seçim | Sürüm | Not |
|---|---|---|---|
| Dil | TypeScript | 5.7 | `strict: true` |
| Çatı | React | 19 | (Next.js bilinçli olarak kullanılmadı) |
| Derleyici | Vite | 6 | `manualChunks` ile vendor ayrımı |
| Stil | Tailwind CSS | 4 | `@theme inline`, CSS-değişken token'ları |
| Durum | Zustand | 5 | feature-yerel + global store'lar |
| Sunucu durumu | TanStack Query | 5 | mock `delay<T>()` sözleşmeleri |
| Yönlendirme | react-router-dom | 7 | `createBrowserRouter` + lazy/Suspense |
| i18n | i18next + react-i18next | 24 / 15 | EN/TR, tip-zorunlu parite |
| Primitive | Radix UI | dialog, dropdown, tooltip, tabs, avatar, context-menu, visually-hidden | erişilebilir tabanlar |
| İkonlar | Phosphor (`@phosphor-icons/react`) | 2.1 | tek ikon ailesi |
| Test | Vitest + Testing Library + jest-axe | 2.1 / 16 / 9 | jsdom |
| E2E | Playwright | 1.49 | `e2e/` |

**Tasarım kuralları:** min 1rem metin (`text-base`), WCAG 2.2 hedefi, focus-visible halkaları, `motion-reduce` dalları, emoji-siz arayüz metni.

---

## 2. Mimari İlkeler

**DDD feature-slice.** Her iş alanı (`features/<domain>/`) kendi tiplerini, mock verisini, saf yardımcılarını, durum store'larını, mock API sözleşmelerini, bileşenlerini ve sayfa bileşenini barındırır. Çapraz bağımlılık asgaridir; alanlar `lib/` ve `components/ui` üzerinden ortaklaşır.

**Mock sözleşme / port-adapter.** Veri katmanı, gerçek arka ucun döneceği şekillerle (tipli) modellenir. `api.ts` dosyaları `delay<T>()` ile ağ gecikmesini taklit eder; tipli olay birlikleri (`*Event`) WebSocket/SSE sözleşmesini temsil eder. Taşıma katmanı değiştiğinde (mock → httpClient/WS) bileşenler değişmez.

**Saf çekirdek + ince store.** İş mantığı framework'süz saf fonksiyonlarda yaşar (örn. `routing.ts`, `pbx.ts`, `slots.ts`, `clips.ts`, `meetGm.ts`) ve doğrudan birim-test edilir; Zustand store'ları bu saf çekirdeği sarar ve UI durumunu tutar.

**RBAC.** `data/roles.ts` izin kataloğu + rol→izin haritası; her sayfa `can(<izin>)` koruması yapar; `PrimaryNav` ve komut paleti izinle süzülür.

**i18n paritesi (tip-zorunlu).** `en.ts` kaynak; `tr.ts` `: AppResources = typeof en` ile tiplenir — eksik/fazla anahtar **derleme hatası**dır, yani EN/TR paritesi `tsc` tarafından garanti edilir.

**AI orkestrasyonu.** Komut kayıt defteri (`data/commands.ts`), copilot bağlam sağlayıcısı (`store/copilotStore`, `lib/useCopilot`), `Cmd/Ctrl+K` komut paleti — alanlar komutlarını merkezi olarak kaydeder.

---

## 3. Klasör / Dosya Yapısı

```
teamslike/
├─ web/                         # frontend uygulaması
│  ├─ src/
│  │  ├─ components/
│  │  │  ├─ shell/              # AppShell, TopBar, PrimaryNav, CommandPalette,
│  │  │  │                      # CopilotDock, NotificationBell, WorkspaceSwitcher, AppErrorBoundary
│  │  │  └─ ui/                 # primitives, Modal, Toast, Tooltip, Avatar,
│  │  │                         # PresenceDot, ConfirmDialog, AsyncBoundary
│  │  ├─ data/                  # domains, roles, commands, team, notifications, agentScenarios
│  │  ├─ features/              # 10 DDD alan dilimi (aşağıda)
│  │  ├─ i18n/                  # en.ts (kaynak), tr.ts (tip-zorunlu), index.ts
│  │  ├─ lib/                   # cn, query, time, mockApi, mockData, useCopilot, useTabKeys
│  │  ├─ routes/                # router, AuthGate, LoginPage, DashboardPage, DomainPage, MembersPage
│  │  ├─ store/                 # auth, tenant, ui, copilot, toast, notification (global)
│  │  ├─ types/                 # domain.ts (DomainKey, RBAC, IconType…)
│  │  └─ test/                  # 15 test dosyası + setup.ts
│  ├─ e2e/                      # 8 Playwright spec
│  ├─ package.json · tsconfig.json · vite/vitest/playwright config
│  └─ README.md
├─ GELISTIRME-PLANI.md          # faz planı + uygulama notları (changelog kaynağı)
├─ gap.md                       # UI boşluk analizi (P1 uygulandı)
├─ rakip-ozellik-analizi.md     # rakip özellik analizi
├─ eksiks/                      # rakip envanter kaynakları (1–6.md, Calendly, Meet xlsx, notta/otter)
└─ summary.md                   # bu rapor
```

### Alan dilimi metrikleri

| Alan (`features/`) | Dosya | Satır | Rota | İzin |
|---|---|---|---|---|
| messaging | 37 | 3.842 | `/messaging` | `messaging.view` |
| telephony | 27 | 3.397 | `/telephony` | `telephony.view` |
| meetings | 22 | 3.126 | `/meetings` | `meetings.view` |
| support | 27 | 2.531 | `/support` | `support.view` |
| webinar | 23 | 1.730 | `/webinar` | `webinar.view` |
| intelligence | 21 | 1.719 | `/intelligence` | `intelligence.view` |
| docs | 15 | 1.656 | `/docs` | `docs.view` |
| scheduling | 15 | 1.087 | `/scheduling` | `scheduling.view` |
| admin | 13 | 891 | `/admin` | `admin.access` |
| canvas | 6 | 553 | `/canvas` | `canvas.view` |

### Paylaşılan katman metrikleri

| Dizin | Dosya | Satır |
|---|---|---|
| i18n | 3 | 2.629 |
| test | 16 | 3.220 |
| components | 16 | 1.383 |
| routes | 6 | 416 |
| data | 6 | 376 |
| store | 6 | 255 |
| lib | 7 | 218 |
| types | 1 | 136 |

---

## 4. DDD Dilim Anatomisi

Her alan dilimi aynı kanonik düzeni izler (örnek: `features/messaging/`):

```
features/<domain>/
├─ types.ts          # alan tipleri + tipli *Event birliği (WS sözleşmesi)
├─ data.ts           # mock seed verisi (gerçek backend'in döneceği şekiller)
├─ <domain>.ts       # saf, framework'süz yardımcılar (birim-test çekirdeği)
├─ store.ts          # Zustand store (saf çekirdeği sarar, UI durumu)
├─ (ek store'lar)    # örn. communitiesStore, storiesStore, pbxStore, callStore
├─ api.ts            # mock REST sözleşmeleri (delay<T>)
├─ components/       # alan-yerel bileşenler
└─ <Domain>Page.tsx  # RBAC korumalı sayfa (rota girişi)
```

**Akış sırası (her özellikte):** sözleşme/şema (types) → mock veri → saf util + **önce-test** → store → api sözleşmesi → UI bileşenleri → sayfa + i18n EN/TR → doğrulama (`tsc` + `vitest` + `build`).

---

## 5. Özellikler (alan bazında)

**messaging** — Kanal/DM/konu-thread; optimistik gönderim, reaksiyon, yanıt-thread, düzenle/pin/kaydet/sil (sil-herkesten + sil-bana + geri-al), ilet, not + sesli mesaj, anket, kaybolan mesaj, mesaj önceliği (acil), shared (kuruluşlar-arası) kanal, Communities (grup-of-grup), Stories/Status, dosya/sticker/GIF, zengin içerik, mesaj rewrite (ton), kalıcı eylem çubuğu + sağ-tık ContextMenu.

**meetings** — Lobi admit, çoklu katılımcı, breakout (geri-sayım), captions/translation, kayıt + AI özet senaryosu, poll/Q&A, whiteboard, reaksiyonlar; Meet-paritesi: portrait/studio/companion/noise/watermark/live-sharing, focus/avatars/deepfake/push-to-talk, gesture/immersive-share/music-mode/AI-framing/name-labels, Personal Room. **Google Meet boşlukları:** granular ses/video kilidi, erişim katmanı (open/trusted/restricted), viewer rolü, bekleme-odasına-gönder, kayıt-öncesi-onay, multi-pin (≤6), native annotation + uzaktan ekran kontrolü, Take Notes (özet/karar/sonraki-adım + alıcı), konuşma çevirisi (ses dublajı), çözünürlük/bant genişliği/veri tasarrufu.

**intelligence** — Gerçek-zamanlı çeviri/captions, transkript, konuşma zekası (sentiment/intent), tipli SSE stream + captionsStore, çoklu hedef dil + sesi-koru, analitik.

**telephony** — Dialer, find-me/follow-me yönlendirme, görsel voicemail + greeting, SMS/MMS + grup + şablon + zamanlı, çağrı durum makinesi (park/pickup/DTMF/kayıt/konferans/warm-transfer), kuyruklar (5+ strateji: ring-all/round-robin/longest-idle/sequential/rotating/weighted + callback + tahmini bekleme), IVR ağacı, mesai saatleri, hunt groups, music-on-hold, supervisor monitor (listen/whisper/barge), spam sınıflandırma, Attendant Console, analitik. **AI Receptionist** (niyet eşleme + SSS + randevu + insana-aktar + canlı test).

**support** — Omnichannel gelen kutusu (livechat/email/WhatsApp/IG/FB/Telegram/SMS), SLA, atama, makro/canned, CSAT, KB; WhatsApp maliyet motoru (24s CSW + rate card + tier), no-code bot flow builder + WhatsApp Flows, kanal coexistence onboarding, şeffaf AI-kredisi faturalama. **WFO/WEM** (AI forecast + self-healing intraday + adherence + kalite scorecard). **AI Agent Studio** (no-code ajan tasarla → test sandbox → yayınla).

**webinar** — Live/simulive/evergreen/on-demand/town-hall, kayıt (onay/bekleme listesi), panelist, poll/Q&A, captions, CTA, analitik. **Events** (bilet katmanları çoklu-para-birimi + gelir, çok-günlü ajanda + çakışma, badge tasarım/yazdırma kuyruğu).

**scheduling** — Event type'lar, müsaitlik, slot üretimi (buffer/min-notice/override), round-robin, çakışma, rezervasyon + iptal/erteleme, public booking sayfası, timezone.

**docs** — Canvas (blok editör), Kanban board, no-code Workflow builder, **Clips** (Loom-sınıfı asenkron video: AI özet/bölüm/görev, dolgu/sessizlik kaldırma EN+TR, AI workflow clip→doc/ticket/mesaj, gizlilik link/workspace/people + parola + link-süresi, zaman-damgalı yorum + emoji, CTA, Variables, etkileşim/arama/hashtag/arşiv); Teams-uygulamaları (Approvals/Shifts/Forms).

**admin** — Audit log + arama/filtre, güvenlik politikaları (DLP/hassasiyet/yasal-tutma/bilgi-bariyeri/koşullu-erişim) + PolicyTester, federasyon, faturalama/kota/proration, OverviewDashboard.

**canvas** — Yeni üst-düzey alan: prompt-güdümlü çapraz-alan AI panosu (özet/aksiyon/tablo/checklist/metrik/not blokları, kaynak çipleri, pin/sırala/sil), çok-kullanıcılı (mock).

---

## 6. Kalite Altyapısı

| Konu | Durum |
|---|---|
| Birim/bileşen testi | 312 test / 15 dosya (Vitest + Testing Library) |
| E2E | 8 Playwright spec (intel/phone/webinar/support/scheduling/docs/admin/smoke) |
| Erişilebilirlik | `jest-axe` yapısal WCAG; roving-tabindex sekmeler (`useTabKeys`); focus-visible; ConfirmDialog; AsyncBoundary/ErrorBoundary; EmptyState/ErrorState/ListSkeleton; duyarlı çekmeceler |
| Kod-bölme | rota-seviyesi `lazy` + `Suspense`; vendor `manualChunks` (react/radix/icons/data ayrı) |
| CI | `.github/workflows` — typecheck → test → build → e2e |

Test dosyası başına: telephony 63, support 44, docs 28, messaging 24, webinar 24, intelligence 22, meetings 21, admin 19, messaging-clone 17, meet-parity 15, scheduling 20, canvas 7, phase1 4, a11y 2, smoke 2.

---

## 7. Changelog Özeti

| Aşama | İçerik |
|---|---|
| Faz 1 | Kabuk + RBAC + i18n + komut paleti + domain kayıt defteri |
| Faz 2 | messaging (kanal/DM/thread) |
| Faz 3 | meetings (lobi/breakout/captions/kayıt) |
| Faz 4 | intelligence (çeviri/captions/SSE stream) |
| Faz 5 (+P0/P1) | telephony (dialer/routing/SMS → PBX kuyruk/IVR/mesai → monitor/skills/spam/şablon) |
| Faz 6 | webinar (3-mod etkinlik + kayıt/poll/Q&A) |
| Faz 7 | scheduling (slot/availability/booking) |
| Faz 8 | support (omnichannel inbox + SLA/macro/CSAT/KB) |
| Faz 9 | docs (Canvas/Board/Workflow/Clips) |
| Faz 10 | admin (audit/policy/federation/billing) |
| Cluster A1/A2 | messaging derinleştirme (Stories, Communities, voice waveform) |
| Cluster D | Google Meet paritesi (companion/breakout-timer/attendance) |
| Meet++ / Zoom | portrait/studio/adaptive/live-sharing/watermark + aranabilir arşiv; ring stratejileri + meeting fx + Workspace Reservation |
| Teams (MT) | shared kanal + acil öncelik; governance (DLP/hassasiyet/legal-hold/barrier); town hall; group-pickup/music-on-hold; Facilitator + rewrite; Approvals/Shifts/Forms |
| Omnichannel (MX) | WhatsApp maliyet motoru; bot flow builder + Flows; coexistence onboarding; şeffaf faturalama; Inbox/Automation anahtarı |
| Orphan turları (G) | statik analizle bağlanmamış yetenekleri UI'a bağlama |
| Webex (W/WB) | weighted kuyruk + callback + tahmini bekleme; Attendant Console; meeting fx; Personal Room; hunt groups; meeting chapters; name-labels |
| UI sağlamlaştırma (gap.md P1 A–G) | ErrorBoundary; useTabKeys; ConfirmDialog + undo-toast; mesaj eylem keşfedilebilirliği + ContextMenu; Skeleton/AsyncBoundary/EmptyState; duyarlı çekmece + mobil arama |
| AI parite (F1–F5) | AI Receptionist; AI Canvas (yeni domain); WFO/WEM; AI Agent Studio; Events bilet/badge |
| Loom (Clips) | asenkron video derinleştirme (AI/gizlilik/yorum/CTA/Variables/etkileşim) |
| Google Meet (GM) | granular kilit/access-tier/viewer/eject/consent/multi-pin/annotation/remote-control/Take-Notes/speech-translation/quality |

Ayrıntılı uygulama notları: `GELISTIRME-PLANI.md`.

---

## 8. Yapılmayanlar / Kapsam Dışı

### 8.1 Henüz işlenmemiş rakip envanterleri
`eksiks/` altında işlenmeyi bekleyen kaynaklar: **6.md**, **Calendly_Core.md** (scheduling derinleştirme), **notta_otter.md** (transkripsiyon/not derinleştirme), **Google_Meet_Ozellik_Envanteri.xlsx**. (Şu ana kadar 1–5.md işlendi.)

### 8.2 Backend ve altyapı (bu repo frontend-only)
Gerçek FastAPI arka ucu, **Prisma + PostgreSQL** şeması ve migration'ları, kimlik sağlayıcı/SSO-SCIM gerçek entegrasyonu, gerçek-zamanlı taşıma (WebSocket/SSE — şu an tipli sözleşme + mock dispatcher), Hetzner/Debian dağıtım otomasyonu ve GitHub private-repo deploy hattı **yapılmadı**. Tüm `api.ts` katmanları `delay<T>()` mock'tur; `*Event` birlikleri sözleşme olarak durur ama canlı bağlanmamıştır.

### 8.3 Gerçek medya / AI / telekom
Gerçek WebRTC/medya (toplantı medyası mock), video kodlama/HLS, gerçek PSTN/SIP/H.323 köprüsü, gerçek LLM/ASR (AI çıktıları deterministik mock dönüşümler), gerçek ses dublajı/voice-cloning **yapılmadı**.

### 8.4 Bilinçli olarak atlanan kurumsal "şişkinlik" (her rakip envanterinde gerekçelendirildi)
WORM uyumlu kayıt/eDiscovery/legal-hold (yalnızca governance UI modeli), BigQuery/Looker export, Pexip/SIP-H.323 donanım interop, FedRAMP/IL5/HITRUST, BYOK/HDS, 1000-kişi toplantı / 100k-webinar ölçeği, tam CCaaS/CPaaS (20k ajan, 12–16 kanal SDK), Linux masaüstü kayıt motoru, açık REST API/record-SDK, badge **fiziksel** yazdırma donanımı.

### 8.5 Kalan ürün boşlukları
`gap.md` **P1** tamamlandı; **P2/P3** maddeleri (daha düşük öncelikli tutarlılık/mikro-etkileşim iyileştirmeleri) beklemede. E2E kapsamı kısmi (8 spec; canvas/clips/GM/WFO/AgentStudio/Events akışları için e2e yok). a11y yalnızca jsdom-axe yapısal; tam renk-kontrast doğrulaması CI'da Playwright+axe gerektirir. KVKK/uyum gerçek doğrulaması yapılmadı (yalnızca model).

### 8.6 Mimari kararlar (kasıtlı)
Next.js **kullanılmadı** (vibecoding anti-pattern gerekçesi). Supabase **kullanılmadı** (Prisma + PostgreSQL önceliği — ama backend henüz kurulmadı). Bu kararlar `GELISTIRME-PLANI.md` ve kullanıcı tercihleriyle uyumludur.

---

*Bu rapor `web/src` üzerinde doğrudan ölçümle üretildi (dosya/satır sayıları, test sayıları, bağımlılık sürümleri). Ayrıntı için: `web/README.md` ve `GELISTIRME-PLANI.md`.*
