## Master Frontend Özellik Seti — Bölüm E: Önceliklendirilmiş / Katmanlı Görünüm (Tiered View)

> Kullanıcı **tam enterprise-grade seti** istediği için bu, "MVP kesintisi" değil; bir frontend ekibinin **uygulama sırası** için katmanlamadır. Tüm katmanlar nihai üründe yer almalıdır.

### Tier 0 — Enterprise Çekirdek Temeli (önce bunlar; gerisi buna bağlı)
- **RBAC & rol modeli** (Owner/Admin/Group Admin/User + custom permission profile): her şey rollere bağlı olduğu için ilk inşa edilmeli.
- **Native takvim component'i** (Month/Week/Day/Agenda, drag-drop, recurring, timezone, virtualization, klavye/WCAG) — ürünün kalbi ve en yüksek frontend karmaşıklığı.
- **Event type builder + availability yönetimi** + **booker akışı** (timezone tespiti, slot seçimi, reschedule/cancel, custom sorular, onay).
- **Takvim entegrasyon UI'ı** (Google/Outlook/Office 365/Exchange/iCloud-CalDAV bağlama, iki-yönlü sync durumu, conflict UI).
- **AI Notetaker çekirdeği** (live transcription `(real-time)`, speaker diarization, AI özet, action item, recording player, transcript arama).
- **Recording consent akışı** (GDPR/CCPA/HIPAA opt-in/opt-out) — yasal olarak bloklayıcı, erken gerekli.
- **Auth & temel ayarlar** (profil, bildirim tercihleri, bağlı hesaplar).

### Tier 1 — Enterprise-Ready Olmazsa Olmazlar (Tier 0 ile paralel/hemen sonra)
- **Admin Center** tam sekme yapısı (Users, Groups/hiyerarşi, Permissions, Branding, Security, Billing).
- **SSO/SAML + SCIM yapılandırma UI** + domain control + forced SSO/session timeout.
- **Audit/Activity log viewer** (filtre + CSV export + retention göstergesi).
- **Data deletion/retention + data residency** ekranları; Trust Center/sertifika rozetleri.
- **Workflow builder** (email/SMS reminder, şablon, conditional logic) + notification center.
- **Round-robin + collective + routing forms + lead qualification** (B2B sales için zorunlu).
- **CRM context panel + iki-yönlü sync** (Salesforce/HubSpot) ve **scheduling/meeting analytics**.
- **Billing/seat/license yönetimi** + usage göstergeleri.
- **White-label/branding** (logo, custom domain, renk).
- **Embed configurator** (inline/popup/widget) + integrations marketplace UI.
- **i18n, dark mode, responsive, WCAG** (enterprise satın almada denetlenir).

### Tier 2 — İleri Farklılaştırıcılar (rekabette öne geçiren katman)
- **Sales conversation intelligence** tam set: talk-time/monolog/sentiment görselleştirme, smart trackers, topic trend.
- **Coaching & scorecards** (MEDDIC/BANT/SPICED + custom builder, AI skorlama, coaching digest, call library/snippets/playlists).
- **Deal/pipeline workspace** + deal risk + Pipeline Compare + methodology field auto-fill/write-back.
- **Pre-meeting brief** (CRM + LinkedIn + deal geçmişi), **AI Agent** otomasyonları (follow-up email, CRM update, task, Slack).
- **Calendar overlay** (booker mutual availability), **ranked availability**, **meeting polls**, single-use/personalized links.
- **Clips/highlights + cross-meeting AI Chat ("Ask Anything")**, real-time multi-meeting intelligence.
- **Custom report builder & paylaşılan dashboard'lar**, scheduled report/email digest.
- **Real-time collaboration** (shared notes, simultaneous editing, presence, yorum/mention).
- **Approval workflows**, managed events/workflows, multi-team routing (territory/firma büyüklüğü/sahiplik).
- **Speed-to-lead Concierge** (form sonrası anlık takvim), lead-to-account matching.
- **Botless/cihaz-sesi kayıt modu**, **command palette (⌘K)**, **PWA/offline**, webhooks yönetim UI'ı.

### Farklılaştırma fırsatları (rakiplerde eksik — frontend'de inşa edilebilir [D])
1. **Granüler custom RBAC** — Calendly sabit rollerle, Gong/Fireflies all-or-nothing "Super/Tech Admin" ile sınırlı; gerçek custom permission set builder bir avantaj.
2. **Audit log'da IP kolonu + in-UI retention slider** — hiçbir rakip sunmuyor.
3. **In-app MFA enforcement toggle** — rakipler MFA'yı tamamen IdP'ye bırakıyor.
4. **Self-serve data residency seçimi** (Fireflies "Private Storage" hariç rakipler infra seviyesinde bırakıyor).
5. **Native takvim + AI notetaker + scheduler'ın tek üründe tam birleşimi** — Avoma bu yöne gidiyor ama enterprise-grade native takvim component'i kimsede yok.

---

## Caveats (Uyarılar ve Kaynak Notları)
- **Kaynak doğası:** Özellik isimleri büyük ölçüde vendor help-doc'larına, ürün sayfalarına ve karşılaştırma yazılarına dayanır; vendor pazarlama sayfaları özellikleri olduğundan iyi gösterebilir. Üçüncü-parti karşılaştırmalar (G2, blog) zaman zaman taraflı/satış-amaçlı olabilir — özellik *varlığı* için güvenilir, performans iddiaları için değil.
- **Hızlı değişen pazar:** AI notetaker pazarı 2025-2026'da hızla olgunlaştı (AI Agents, botless mod, multi-meeting intelligence yeni eklemeler). Fiyat/plan detayları (örn. Calendly Enterprise ~$15.000/yıl, Avoma $19-79/kullanıcı) zamanla değişir; bağlam için verilmiştir, frontend kapsamını etkilemez.
- **Apple/iCloud takvimi:** Calendly yeni kullanıcılar için Apple Calendar bağlantısını 2024'te durdurdu; iCloud/CalDAV desteği bu yüzden bilinçli bir farklılaştırma noktası olabilir (Zeeg/SavvyCal/Cal.com sürdürüyor).
- **Consent yasal karmaşıklığı:** Recording consent UI'ı tek bir kurala indirgenemez — all-party vs one-party consent eyaletleri, GDPR, BIPA (voiceprint) ayrı yükümlülükler getirir; "bot görünürlüğü = consent" değildir. Frontend, en sıkı kuralı varsayan tasarım yapmalı; bu bir hukuki tasarım kararıdır, tek bir banner değil.
- **Kapsam sınırı:** Bu envanter bilinçli olarak FRONTEND yüzeyiyle sınırlıdır. Backend (SSO sunucu implementasyonu, sync motoru, transcription ML, ClickHouse/veri katmanı) ve görsel/UI tasarım felsefesi kapsam dışıdır; yalnızca "client neyi render etmeli / state yönetmeli / hangi UX akışını sunmalı" sorusuna yanıt verir.
- **Enricher notu:** Otomatik zenginleştirme aracı (enrich_draft) çalıştırılmak istendi ancak iki denemede de internal hata verdi; rapor, doğrudan toplanan birincil kaynak verilerine dayanarak tamamlanmıştır.

---

### Hızlı uygulama checklist'i (frontend geliştirici için özet)
Bir geliştirici şu sırayla ilerleyebilir: **(1)** RBAC + auth → **(2)** native takvim → **(3)** event type + availability + booker → **(4)** takvim entegrasyon UI → **(5)** notetaker (live transcript/diarization/özet/action item) + consent → **(6)** Admin Center (Users/Groups/Permissions/Security/Branding/Billing) + SSO/SCIM + audit log → **(7)** routing/round-robin + CRM panel + workflows + analytics → **(8)** conversation intelligence + coaching + deal/pipeline + AI Agents → **(9)** embeds/marketplace + i18n/WCAG/dark mode/PWA + real-time collaboration + command palette. Her madde, etiketleriyle ([TS]/[D]/[S] ve `(real-time)`/`(virtualization)`/`(drag-drop)`/`(offline)`) önceliklendirilebilir bir component/flow'a karşılık gelir.