# Rakip Özellik Analizi (Güncel: 2026)

> **Bu dosya bir yapay zekâya beslenmek üzere hazırlanmıştır.** Yapı: (1) kategoriler ve en yakın rakip eşleştirmeleri, (2) her rakip için ayrı özellik listesi, (3) en yakın rakipler arasında birebir karşılaştırma tabloları, (4) ayırt edici (farklı) özellikler matrisi — en önemli bölüm, (5) doğrulama uyarıları.
>
> **Odak özellik eksenleri** (her ürün ve her tablo bu eksenlere göre değerlendirilmiştir):
> `Mesajlaşma (kanal/DM/thread)` · `Video toplantı` · `Sesli arama / telefon` · `AI asistan` · `AI analiz` · `Takvim & zamanlama` · `Webinar / büyük etkinlik` · `Gerçek zamanlı tercüme`
> Ek eksenler: `Açık kaynak / self-hosted` · `Uçtan uca şifreleme (E2EE)` · `Federasyon` · `Fiyat` · `Platform` · `Ayırt edici özellik`.
>
> **DOĞRULAMA:** 18 ürün 2026 web kaynaklarından teyit edilmiştir. **melp, Loom, WhatsApp Business, Telegram** için veriler `[DOĞRULANMADI — 2026]` etiketlidir; resmî sitelerden teyit edilmelidir.

---

## 1. Kategoriler ve En Yakın Rakip Eşleştirmeleri

| Kategori | Ürünler |
|---|---|
| Hepsi-bir-arada ekip platformu (UCaaS) | Microsoft Teams, Zoom Workplace, Slack, Dialpad |
| Saf video konferans | Google Meet, GoTo Meeting |
| Webinar / büyük etkinlik | Zoom Webinars, Livestorm, Demio |
| Açık kaynak / self-hosted mesajlaşma | Mattermost, Rocket.Chat, Zulip, Element/Matrix, Nextcloud Talk |
| Müşteri iletişim / doküman / proje | Chatwoot, Coda, Basecamp |
| Tüketici / async iletişim | Discord, melp, Loom, WhatsApp Business, Telegram |

**En yakın rakip eşleştirmeleri (birebir karşılaştırma için):**

| Ürün | En yakın rakip |
|---|---|
| Microsoft Teams | Slack |
| Slack | Microsoft Teams |
| Zoom Workplace | Google Meet |
| Google Meet | Zoom Workplace |
| GoTo Meeting | Dialpad |
| Dialpad | GoTo Meeting |
| Zoom Webinars | Livestorm / Demio |
| Livestorm | Demio |
| Demio | Livestorm |
| Mattermost | Rocket.Chat |
| Rocket.Chat | Mattermost / Element |
| Zulip | Mattermost / Slack |
| Element/Matrix | Rocket.Chat |
| Nextcloud Talk | Element / Jitsi |
| Chatwoot | Intercom / Zendesk (liste dışı) |
| Coda | Basecamp / Notion |
| Basecamp | Coda / Asana |
| Discord | Slack (gayri resmî) |
| WhatsApp Business | Telegram |
| Telegram | WhatsApp Business |
| Loom | Async video (Vidyard / Zoom Clips) |
| melp | Teams / Slack (hafif, çeviri odaklı) |

---

## 2. Ürün Bazlı Özellik Listeleri

### Microsoft Teams
- **Mesajlaşma:** Kanal + DM + thread; mesaj düzenleme, reaksiyon, dosya paylaşımı (SharePoint/OneDrive).
- **Video toplantı:** Çekirdek 300 katılımcı; ekran paylaşımı, kayıt, breakout room, sanal arka plan, lobby, annotasyon.
- **Sesli arama / telefon:** Teams Phone add-on (~$10): PSTN, çağrı yönlendirme, voicemail.
- **AI asistan:** Microsoft 365 Copilot ($30 Enterprise / $21 Business) — özet, not, aksiyon maddeleri, Word/Excel/PPT/Outlook'a taşıma. Intelligent Recap = Teams Premium ($10).
- **AI analiz:** Copilot toplantı/transkript analizi; yol haritasında paylaşılan ekran analizi.
- **Takvim & zamanlama:** Outlook / M365 takvim + Microsoft Places.
- **Webinar / etkinlik:** Town hall + webinar (2026 Nisan'dan çekirdek Enterprise'a dahil).
- **Gerçek zamanlı tercüme:** Canlı altyazı + AI Interpreter (gerçek zamanlı ses çevirisi).
- **Açık kaynak / self-hosted:** Hayır (SaaS).
- **E2EE:** Opsiyonel (1:1 aramalar).
- **Federasyon:** Yok.
- **Fiyat:** Essentials ~$4, Enterprise ~$5.25, Premium +$10, Copilot +$30.
- **Platform:** Web / masaüstü / mobil.
- **Ayırt edici:** M365 derin yerel entegrasyonu + Copilot Studio özel AI ajanları + Microsoft Graph veri zemini.

### Slack
- **Mesajlaşma:** Kanal + DM + thread (çekirdek güç); reaksiyon, dosya, Canvas, Lists; Slack Connect 250 kuruluş.
- **Video toplantı:** Huddles — anlık sesli/görüntülü + ekran paylaşımı; Pro grup huddle 50 kişi. Planlı toplantı/breakout yok.
- **Sesli arama / telefon:** Huddle sesli; tam PSTN/telefon santrali yok.
- **AI asistan:** Slack AI / Slackbot — thread/kanal özeti, huddle notu, günlük recap, AI arama, çeviri, workflow üretimi (Business+); Zoom/Meet/Huddle'ı masaüstü sesinden özetler; Agentforce.
- **AI analiz:** Enterprise search (uygulamalar arası arama).
- **Takvim & zamanlama:** Google/Outlook takvim entegrasyonu.
- **Webinar / etkinlik:** Yok.
- **Gerçek zamanlı tercüme:** AI dil çevirisi (Business+).
- **Açık kaynak / self-hosted:** Hayır (SaaS).
- **E2EE:** Yok.
- **Federasyon:** Yok (Slack Connect var).
- **Fiyat:** Ücretsiz (90 gün geçmiş), Pro ~$7.25–8.75, Business+ ~$15, Enterprise+ özel.
- **Platform:** Web / masaüstü / mobil.
- **Ayırt edici:** En geniş entegrasyon ekosistemi (2.600+) + Salesforce/Agentforce + Workflow Builder + yerleşik CRM.

### Zoom Workplace
- **Mesajlaşma:** Team Chat (kanal + DM + thread), reaksiyon, dosya, Docs, Whiteboard.
- **Video toplantı:** Ücretsiz 100/40dk; Pro 100; Business 300; Enterprise 1.000 (add-on 5.000). Breakout, sanal arka plan, bekleme odası dahil; 30 saat.
- **Sesli arama / telefon:** Zoom Phone add-on ($10–20): PSTN, yönlendirme, voicemail.
- **AI asistan:** **AI Companion — tüm ücretli paketlerde ÜCRETSİZ DAHİL**: özet, aksiyon, "Catch Me Up", smart recording. AI Companion 3.0 (Ara 2025) agentic.
- **AI analiz:** Toplantı/transkript analizi; satış için Revenue Accelerator (ayrı).
- **Takvim & zamanlama:** Zoom Scheduler + Google/Outlook.
- **Webinar / etkinlik:** Ayrı ürün (bkz. Zoom Webinars).
- **Gerçek zamanlı tercüme:** Çevrili altyazı 46 dil; konuşmadan-konuşmaya çeviri (Ara 2025, otomatik dil algılama).
- **Açık kaynak / self-hosted:** Hayır (SaaS).
- **E2EE:** Opsiyonel.
- **Federasyon:** Yok.
- **Fiyat:** Ücretsiz, Pro ~$13.33–16.99, Business ~$18.33–21.99, Business Plus ~$29.
- **Platform:** Web / masaüstü / mobil.
- **Ayırt edici:** AI Companion'ın ücretsiz dahil olması (Teams Copilot +$30'a karşı) + ölçek (5.000) + modüler ekosistem.

### Google Meet
- **Mesajlaşma:** Toplantı odaklı; kalıcı sohbet Google Chat'te.
- **Video toplantı:** Ücretsiz 100/60dk; Standard 150; Plus 500; Enterprise 1.000. Kayıt (ücretli), breakout, AI arka plan, filigran.
- **Sesli arama / telefon:** Dial-in numaraları; tam UCaaS değil.
- **AI asistan:** Gemini in Meet — "Take notes for me" (not/aksiyon/geç katılana özet), "Ask Gemini" yan panel.
- **AI analiz:** Gemini transkript özeti; ayrı analitik aracı yok.
- **Takvim & zamanlama:** Google Calendar (derin yerel entegrasyon).
- **Webinar / etkinlik:** Sınırlı (büyük toplantı modu).
- **Gerçek zamanlı tercüme:** Çevrili altyazı **70+ dil**; gerçek zamanlı sesli çeviri (sesi/tonu koruyarak) EN↔ES/FR/DE/PT/IT — yalnızca AI Pro/Ultra, aynı anda tek dil çifti.
- **Açık kaynak / self-hosted:** Hayır (SaaS).
- **E2EE:** Kişisel 1:1.
- **Federasyon:** Yok.
- **Fiyat:** Ücretsiz, Starter $6–7, Standard $12–14, Plus $22; Gemini tüm ücretli paketlerde dahil.
- **Platform:** Web (eklentisiz) / mobil.
- **Ayırt edici:** Sesi/tonu koruyan gerçek zamanlı sesli çeviri + 70+ dil altyazı + eklentisiz tarayıcı katılımı.

### GoTo Meeting
- **Mesajlaşma:** Toplantı içi chat; GoTo Connect'te TeamChat (kanal, dosya, dış müşteri).
- **Video toplantı:** Professional 150, Business 250; breakout, çizim, webcam blur, whiteboard.
- **Sesli arama / telefon:** GoTo Connect ile tam UCaaS (Find me/Follow me, voicemail).
- **AI asistan:** AI Meeting Assistant — transkript, akıllı not, özet, aksiyon.
- **AI analiz:** Toplantı analitiği; çağrı raporları (Connect).
- **Takvim & zamanlama:** Google/Outlook + tek tık zamanlama.
- **Webinar / etkinlik:** GoTo Webinar ayrı — 3.000 katılımcı, registration, Q&A, anket, AI özet.
- **Gerçek zamanlı tercüme:** Transkripsiyon; çok dilli yazılı çeviri sınırlı.
- **Açık kaynak / self-hosted:** Hayır (SaaS).
- **E2EE:** Standart şifreleme.
- **Federasyon:** Yok.
- **Fiyat:** Professional ~$12, Business ~$16. 99.999% uptime.
- **Platform:** Web / masaüstü / mobil.
- **Ayırt edici:** Commuter Mode (mobilde aşırı düşük bant genişliği) + 99.999% uptime + birleşik SMB paketi.

### Dialpad (Dialpad Ai)
- **Mesajlaşma:** Team chat, DM, SMS/MMS, dosya.
- **Video toplantı:** Ai Meetings — ücretsiz 10/45dk; ücretli 150 katılımcı; ekran paylaşımı, kayıt. Breakout/whiteboard yok.
- **Sesli arama / telefon (çekirdek güç):** Tam UCaaS — VoIP, PSTN, yönlendirme, görsel voicemail, 70+ ülke, auto attendant.
- **AI asistan:** DialpadGPT (kendi LLM'i, 7+ milyar dk eğitimli) — gerçek zamanlı transkripsiyon, AI Recaps, özet, aksiyon.
- **AI analiz:** **En güçlü konuşma istihbaratı** — gerçek zamanlı duygu analizi, canlı koçluk (whisper), AI Scorecards, AI CSAT, Custom Moments.
- **Takvim & zamanlama:** Google/Outlook entegrasyonu.
- **Webinar / etkinlik:** Yok.
- **Gerçek zamanlı tercüme:** 30+ dil.
- **Açık kaynak / self-hosted:** Hayır (SaaS).
- **E2EE:** Standart şifreleme.
- **Federasyon:** Yok.
- **Fiyat:** Connect $15, Sell $39, Support $80; Ai Meetings ücretsiz katman. AI tüm paketlere dahil.
- **Platform:** Web / masaüstü / mobil.
- **Ayırt edici:** Yerleşik (add-on değil) gerçek zamanlı konuşma istihbaratı + kendi LLM'i DialpadGPT.

### Zoom Webinars
- **Mesajlaşma:** Webinar içi chat + Q&A.
- **Video toplantı:** Webinar formatı (panelist + izleyici ayrımı).
- **Sesli arama / telefon:** Dial-in.
- **AI asistan:** AI bölümler/highlight, kayıt özeti.
- **AI analiz:** Attendee analitiği, engagement raporları.
- **Takvim & zamanlama:** Registration + zamanlama + hatırlatıcı e-posta.
- **Webinar / etkinlik:** **100.000 izleyiciye kadar**, 100 panelist; özel registration sayfası, ticketing, CRM; canlı Q&A + upvote + polls; Backstage/Production Studio, **Simulive**, event lobby, networking.
- **Gerçek zamanlı tercüme:** Altyazı 20+ dil.
- **Açık kaynak / self-hosted:** Hayır (SaaS).
- **E2EE:** Opsiyonel.
- **Federasyon:** Yok.
- **Fiyat:** Add-on; Zoom Sessions ~$6.790/yıl (1.000), Events ~$9.490/yıl, $2/attendee aşım.
- **Platform:** Web / masaüstü / mobil.
- **Ayırt edici:** Devasa ölçek (100k) + Simulive (önceden kayıtlı içeriği canlı gibi yayınlama) + Zoom tanıdıklığı.

### Livestorm
- **Mesajlaşma:** Webinar içi chat, banner, CTA.
- **Video toplantı:** Tarayıcı tabanlı toplantı + webinar; 16–20 konuşmacı.
- **Sesli arama / telefon:** Yok.
- **AI asistan:** İçerik yeniden kullanımı, scripting.
- **AI analiz:** Engagement skorları, attendee raporları, CRM senkron.
- **Takvim & zamanlama:** Markalı registration, otomatik e-posta dizileri, UTM, sertifika.
- **Webinar / etkinlik:** İzleyici 1.000 (add-on); Business/Enterprise 3.000; canlı Q&A + upvote, polls, chat, CTA; green room, rol tabanlı erişim, iFrame yayın; canlı/otomatik (evergreen)/on-demand.
- **Gerçek zamanlı tercüme:** Canlı altyazı (Beta) + Interprefy tercüme entegrasyonu.
- **Açık kaynak / self-hosted:** Hayır (SaaS, tamamen tarayıcı tabanlı — indirme yok).
- **E2EE:** Yok (GDPR, ISO 27001, SAML SSO).
- **Federasyon:** Yok.
- **Fiyat:** Ücretsiz (test), Premium ~$99/ay (attendee-kredi modeli), Enterprise özel. İç ekip kredi tüketmez.
- **Platform:** Web (eklentisiz) / mobil.
- **Ayırt edici:** İndirmesiz tarayıcı deneyimi (+%15–20 katılım) + attendee-kredi fiyatlama + güçlü e-posta otomasyonu.

### Demio
- **Mesajlaşma:** Chat (@mention/emoji/etiketli Q&A).
- **Video toplantı:** Tarayıcı tabanlı webinar; attendee'yi sahneye çıkarma.
- **Sesli arama / telefon:** Yok.
- **AI asistan:** Demio AI.
- **AI analiz:** **Intent (niyet) analitiği** — kim odaklandı, kim CTA'ya tıkladı; CRM senkron.
- **Takvim & zamanlama:** Özel registration alanları, markalı e-posta, no-show segmentasyonu.
- **Webinar / etkinlik:** İzleyici Starter 50, Growth 150, Business 500, Premium 1.000; 8–10 saat; chat + polls + handout + Featured Actions (CTA); Standart/Series/Automated/on-demand; ön-yüklü materyal.
- **Gerçek zamanlı tercüme:** Sınırlı.
- **Açık kaynak / self-hosted:** Hayır (SaaS, tarayıcı tabanlı — Banzai).
- **E2EE:** Yok.
- **Federasyon:** Yok.
- **Fiyat:** Starter ~$42–45/host, Growth ~$75, Premium ~$184–196 (HubSpot/Salesforce/Marketo dahil); 14 gün deneme.
- **Platform:** Web (eklentisiz).
- **Ayırt edici:** Pazarlama/gelir ekipleri için intent analitiği + derin HubSpot/Salesforce + evergreen (otomatik) webinar.

### Discord
- **Mesajlaşma:** Sunucu → kanal (metin/ses) + DM + thread; reaksiyon, sınırsız geçmiş; dosya 10MB (Nitro 500MB).
- **Video toplantı:** Görüntülü 25 kişi, ekran paylaşımı (720p ücretsiz / 4K60 Nitro), Go Live; **kalıcı sesli kanallar**.
- **Sesli arama / telefon:** Sesli kanal/çağrı (VoIP); PSTN yok.
- **AI asistan:** Yerel yok (3. taraf botlar).
- **AI analiz:** Yok.
- **Takvim & zamanlama:** Etkinlik (server events); takvim entegrasyonu sınırlı.
- **Webinar / etkinlik:** Stage Channels (topluluk yayını).
- **Gerçek zamanlı tercüme:** Yok.
- **Açık kaynak / self-hosted:** Hayır (SaaS).
- **E2EE:** Aramalarda (DAVE protokolü); metin E2EE değil.
- **Federasyon:** Yok.
- **Fiyat:** Ücretsiz (cömert), Nitro Basic $2.99, Nitro $9.99. Kurumsal SSO/audit/compliance yok.
- **Platform:** Web / masaüstü / mobil.
- **Ayırt edici:** Kalıcı / her zaman açık sesli kanallar + bot ekosistemi + ücretsiz sınırsız mesaj geçmişi.

### Mattermost
- **Mesajlaşma:** Kanal + DM + grup + thread, dosya, hashtag, 256 kişilik gruplar.
- **Video toplantı:** Calls — 1:1/grup sesli + ekran paylaşımı (50'ye kadar; Enterprise ölçekleme) + canlı transkript + AI özet; Zoom/Teams/Pexip entegrasyonu.
- **Sesli arama / telefon:** Calls (VoIP); PSTN yok.
- **AI asistan:** AI ajan çerçevesi (MCP); Calls AI özet.
- **AI analiz:** Sistem konsolu analitiği.
- **Takvim & zamanlama:** Eklenti/entegrasyon.
- **Webinar / etkinlik:** Yok.
- **Gerçek zamanlı tercüme:** 20+ arayüz dili.
- **Açık kaynak / self-hosted:** **Evet** (Team Edition MIT) + self-hosted (Docker/K8s/air-gapped).
- **E2EE:** Aktarımda TLS (varsayılan tam E2EE değil).
- **Federasyon:** Sınırlı.
- **Fiyat:** Team/Entry ücretsiz, Professional $10, Enterprise özel.
- **Platform:** Web / masaüstü / mobil.
- **Ayırt edici:** DevSecOps/savunma odaklı mission-critical self-hosted + Playbooks (olay müdahalesi) + air-gapped + GitLab uyumu.

### Rocket.Chat
- **Mesajlaşma:** Kanal (genel/özel/yayın/salt-okunur) + DM + discussions + thread, sesli mesaj.
- **Video toplantı:** Jitsi/Pexip entegrasyonu + ekran paylaşımı.
- **Sesli arama / telefon:** SIP VoIP desteği.
- **AI asistan:** Privacy-first AI (Enterprise; v8.0 Ocak 2026).
- **AI analiz:** Engagement dashboard (omnichannel).
- **Takvim & zamanlama:** Entegrasyon.
- **Webinar / etkinlik:** Yok.
- **Gerçek zamanlı tercüme:** Gerçek zamanlı mesaj çevirisi.
- **Açık kaynak / self-hosted:** **Evet** (MIT çekirdek) + self-hosted (Docker/K8s/air-gapped); Enterprise sürüm proprietary.
- **E2EE:** Opsiyonel.
- **Federasyon:** **Matrix federasyonu** (2022'den) + Teams/Slack köprüleri.
- **Fiyat:** Starter $0 (50 kullanıcı, tam Matrix federasyonu), Community ücretsiz, Pro/Enterprise özel.
- **Platform:** Web / masaüstü / mobil.
- **Ayırt edici:** Ekip sohbeti + omnichannel müşteri desteğini birleştirme + Matrix federasyonu + opsiyonel E2EE; devlet/savunma (DoD IL6) referansları.

### Zulip
- **Mesajlaşma:** **Kanal (stream) + konu (topic) tabanlı threading** — her tartışma ayrı topic'te; mesaj taşıma/bölme; reaksiyon, dosya, LaTeX/kod, güçlü arama.
- **Video toplantı:** Tek tık görüntülü (Zoom/Jitsi/Meet entegrasyonu) + sesli huddle.
- **Sesli arama / telefon:** Entegrasyon üzerinden.
- **AI asistan:** Sınırlı.
- **AI analiz:** Sınırlı.
- **Takvim & zamanlama:** Entegrasyon.
- **Webinar / etkinlik:** Yok.
- **Gerçek zamanlı tercüme:** 20+ arayüz dili.
- **Açık kaynak / self-hosted:** **Evet, %100 açık kaynak (Apache 2.0 — "open core catch" yok)** + self-hosted/Cloud.
- **E2EE:** Yok (RBAC, audit, SSO).
- **Federasyon:** Yok.
- **Fiyat:** Cloud Free $0, Standard $6.67–8, Plus $10–12; self-hosted Free/Basic $3.50/Business $6.67–8; açık kaynak projelere ücretsiz.
- **Platform:** Web / masaüstü / mobil.
- **Ayırt edici:** Konu (topic) tabanlı threading — hem canlı hem asenkron için tasarlanmış tek modern uygulama; %100 açık kaynak.

### Element / Matrix
- **Mesajlaşma:** Matrix tabanlı oda (room) + DM + thread, dosya, @mention.
- **Video toplantı:** **Element Call** (MatrixRTC/LiveKit) — E2EE sesli/görüntülü konferans, ekran paylaşımı, emoji reaksiyon; federasyon üzerinden.
- **Sesli arama / telefon:** Element Call (VoIP, E2EE); PSTN yok.
- **AI asistan:** Sınırlı.
- **AI analiz:** Sınırlı.
- **Takvim & zamanlama:** Entegrasyon.
- **Webinar / etkinlik:** Sınırlı.
- **Gerçek zamanlı tercüme:** Sınırlı.
- **Açık kaynak / self-hosted:** **Evet** (Matrix açık standart) + self-hosted (Element Server Suite) veya Element Cloud.
- **E2EE:** **Varsayılan tam E2EE** (mesaj, sesli, görüntülü, ek).
- **Federasyon:** **Yerel federasyon** (açık + kapalı) + Slack/Teams/WhatsApp/Telegram köprüleri.
- **Fiyat:** Business $5, Enterprise $10; ESS Community Edition ücretsiz.
- **Platform:** Web / masaüstü / mobil.
- **Ayırt edici:** Matrix açık standardıyla **dijital egemenlik + vendor lock-in yok + varsayılan E2EE + açık federasyon**; NATO, İsveç/Almanya kamu, air-gapped referansları.

### Nextcloud Talk
- **Mesajlaşma:** Sohbet, kanal/grup, @mention, markdown, polls, mesaj durumu; Matterbridge ile senkron.
- **Video toplantı:** Sesli/görüntülü (1080p), ekran paylaşımı; pratik limit ~50–75 video katılımcı (HPB ile). Breakout/webinar modu yok.
- **Sesli arama / telefon:** VoIP; SIP entegrasyonu mümkün.
- **AI asistan:** Çağrı transkript + özet (1. ve 3. taraf AI).
- **AI analiz:** Sınırlı.
- **Takvim & zamanlama:** Nextcloud Calendar yerel entegrasyonu.
- **Webinar / etkinlik:** Yok.
- **Gerçek zamanlı tercüme:** Sınırlı.
- **Açık kaynak / self-hosted:** **Evet** + tamamen self-hosted (on-prem).
- **E2EE:** **Evet** (aramalar için; web + masaüstü).
- **Federasyon:** **Evet** (farklı Nextcloud sunucuları arası arama/sohbet).
- **Fiyat:** Açık kaynak ücretsiz; Enterprise destek özel.
- **Platform:** Web / masaüstü / mobil.
- **Ayırt edici:** Nextcloud dosya/takvim/ofis ekosistemine gömülü, tam self-hosted, E2EE arama + federasyon; büyük toplantı/webinar için uygun değil.

### Chatwoot
- **Mesajlaşma (müşteri):** Omnichannel inbox — canlı sohbet, e-posta, WhatsApp, Instagram, Facebook Messenger, Telegram, Line, SMS; iç @mention/not.
- **Video toplantı:** Yok (müşteri destek odaklı).
- **Sesli arama / telefon:** Entegrasyon üzerinden (sesli destek).
- **AI asistan:** **Captain** (AI ajanı) — otomatik yanıt, Copilot yanıt önerisi, özet, bilgi tabanından cevap, çeviri; OpenAI/Dialogflow/Rasa.
- **AI analiz:** CSAT, agent/inbox raporları.
- **Takvim & zamanlama:** Entegrasyon.
- **Webinar / etkinlik:** Yok.
- **Gerçek zamanlı tercüme:** Captain çeviri.
- **Açık kaynak / self-hosted:** **Evet** (MIT çekirdek; enterprise dizin ayrı lisans) + self-hosted/Cloud.
- **E2EE:** Yok (GDPR; self-host ile veri kontrolü).
- **Federasyon:** Yok.
- **Fiyat:** Hacker ücretsiz (2 agent, 30 gün); Startups $19/agent; Business $39; Enterprise $99; Captain kredileri $20/1.000.
- **Platform:** Web / mobil.
- **Ayırt edici:** Açık kaynak Intercom/Zendesk alternatifi — tam veri sahipliği + self-host + omnichannel; Intercom'dan %50–60 ucuz.

### Coda
- **Mesajlaşma:** Doküman içi yorum + @mention (ekip sohbeti değil).
- **Video toplantı:** Yok (entegrasyon).
- **Sesli arama / telefon:** Yok.
- **AI asistan:** **Coda AI** — içerik üretimi, tablo özeti, formül, otomasyon, doküman içi soru-cevap.
- **AI analiz:** Veri tablosu analizi (yerleşik formül/görünüm).
- **Takvim & zamanlama:** Takvim görünümü + Packs (Google Calendar vb.).
- **Webinar / etkinlik:** Yok.
- **Gerçek zamanlı tercüme:** Yok.
- **Yapı:** Doküman + ilişkisel tablo (Kanban/takvim/Gantt görünüm) + buton + otomasyon + Packs (450–600+ entegrasyon).
- **Açık kaynak / self-hosted:** Hayır (SaaS).
- **E2EE:** Yok.
- **Federasyon:** Yok.
- **Fiyat:** **Doc Maker bazlı** (editör/görüntüleyici ücretsiz) — Pro $10/maker, Team $30/maker, Enterprise özel.
- **Platform:** Web / masaüstü / mobil.
- **Ayırt edici:** "Doc as app" — doküman + veritabanı + uygulamayı birleştirme + yalnızca doküman oluşturanlardan ücret. (Not: 2026'da Superhuman bünyesinde.)

### Basecamp
- **Mesajlaşma:** Message Board, Campfire (grup sohbeti), Pings (DM), yorum; thread tarzı sınırlı.
- **Video toplantı:** Yok (3. taraf entegrasyon).
- **Sesli arama / telefon:** Yok.
- **AI asistan:** Yok.
- **AI analiz:** Yok.
- **Takvim & zamanlama:** Schedule + önemli tarihler; Google Calendar senkron.
- **Webinar / etkinlik:** Yok.
- **Gerçek zamanlı tercüme:** Yok.
- **Yapı:** To-dos, Schedule, Card Table (Kanban), Docs & Files, Hill Charts, Check-ins, müşteri erişimi.
- **Açık kaynak / self-hosted:** Hayır (SaaS).
- **E2EE:** Yok.
- **Federasyon:** Yok.
- **Fiyat:** **Sabit ücret** — Ücretsiz (1 proje); Plus $15/kullanıcı; **Pro Unlimited $299/ay (yıllık) sınırsız kullanıcı**.
- **Platform:** Web / masaüstü / mobil.
- **Ayırt edici:** Sabit $299/ay sınırsız kullanıcı (öngörülebilir maliyet) + kasıtlı sadelik; Gantt/bağımlılık/gelişmiş raporlama yok.

### melp `[DOĞRULANMADI — 2026]`
- **Mesajlaşma:** Kanal + DM, dosya paylaşımı.
- **Video toplantı:** Sesli/görüntülü arama (limit teyit edilmeli).
- **Sesli arama / telefon:** Sesli arama (PSTN durumu teyit edilmeli).
- **AI asistan:** Teyit edilmeli.
- **AI analiz:** Teyit edilmeli.
- **Takvim & zamanlama:** Teyit edilmeli.
- **Webinar / etkinlik:** Teyit edilmeli.
- **Gerçek zamanlı tercüme:** **Çoklu dilde canlı çeviri (ana ayırt edici nokta olarak öne çıkıyor)** — dil sayısı teyit edilmeli.
- **Açık kaynak / self-hosted:** Hayır (SaaS).
- **E2EE:** Teyit edilmeli.
- **Federasyon:** Yok.
- **Fiyat:** Teyit edilmeli (melpapp.com).
- **Platform:** Web / masaüstü / mobil.
- **Ayırt edici:** Hafif, çeviri-odaklı hepsi-bir-arada iş iletişimi. **Tüm rakamlar resmî siteden teyit edilmeli.**

### Loom `[DOĞRULANMADI — 2026]`
- **Mesajlaşma:** Video altında yorum + emoji reaksiyon (gerçek zamanlı chat değil).
- **Video toplantı:** Yok — **async (eşzamansız) ekran + kamera video mesajı**.
- **Sesli arama / telefon:** Yok.
- **AI asistan:** Otomatik başlık, özet, bölümler (chapters), dolgu-kelime/sessizlik çıkarma, transkript.
- **AI analiz:** İzleyici analitiği (kim izledi / ne kadar).
- **Takvim & zamanlama:** Yok.
- **Webinar / etkinlik:** Yok.
- **Gerçek zamanlı tercüme:** Transkript çevirisi (teyit edilmeli).
- **Açık kaynak / self-hosted:** Hayır (SaaS; Atlassian'a ait).
- **E2EE:** Teyit edilmeli.
- **Federasyon:** Yok.
- **Fiyat:** Geçmişte Starter ücretsiz / Business ~$12.50–15 / Enterprise özel — **2026 fiyatı teyit edilmeli (loom.com).**
- **Platform:** Web / masaüstü / mobil + tarayıcı eklentisi.
- **Ayırt edici:** Async ekran-video mesajı (toplantı yerine kayıt); doğrudan rakipleri Vidyard, Zoom Clips, mmhmm.

### WhatsApp Business `[DOĞRULANMADI — 2026]`
- **Mesajlaşma:** 1:1 + grup (~1.024 üye) + Channels (tek-yönlü yayın); katalog, hızlı yanıt, etiketler, broadcast listesi.
- **Video toplantı:** Görüntülü + sesli arama (grup arama dahil; limit teyit edilmeli).
- **Sesli arama / telefon:** VoIP sesli arama.
- **AI asistan:** İş ortağı/3. taraf chatbot (Platform/Cloud API üzerinden).
- **AI analiz:** Konuşma raporları (Business Platform).
- **Takvim & zamanlama:** Yok (yerel değil).
- **Webinar / etkinlik:** Yok.
- **Gerçek zamanlı tercüme:** Yok (yerel değil).
- **Açık kaynak / self-hosted:** Hayır (Meta bulutu / iş ortağı API'leri).
- **E2EE:** **Varsayılan E2EE.**
- **Federasyon:** Yok.
- **Fiyat:** Business App ücretsiz; Business Platform / Cloud API **konuşma/mesaj bazlı** (kategori bazlı per-message modeline geçiş — teyit edilmeli).
- **Platform:** Mobil / web / masaüstü.
- **Ayırt edici:** Devasa erişim + varsayılan E2EE + şablon mesaj/otomasyon ile işletme-müşteri kanalı. **Limitler ve güncel fiyat resmî siteden teyit edilmeli.**

### Telegram `[DOĞRULANMADI — 2026]`
- **Mesajlaşma:** 1:1 + gruplar (~200.000 üye) + kanallar (sınırsız üye, tek-yönlü yayın); büyük dosya limitleri; bulut senkron.
- **Video toplantı:** Görüntülü arama + grup görüntülü/sesli sohbet.
- **Sesli arama / telefon:** VoIP sesli arama; grup sesli sohbet.
- **AI asistan:** Yerel yok (zengin bot ekosistemi).
- **AI analiz:** Kanal istatistikleri.
- **Takvim & zamanlama:** Yok (yerel değil).
- **Webinar / etkinlik:** Kanal/grup sesli sohbet yayını.
- **Gerçek zamanlı tercüme:** Premium çeviri (teyit edilmeli).
- **Açık kaynak / self-hosted:** İstemci açık kaynak; sunucu kapalı (self-hosted değil).
- **E2EE:** **Yalnızca "Secret Chat"te opsiyonel** (varsayılan değil; normal sohbetler bulut tabanlı).
- **Federasyon:** Yok.
- **Fiyat:** Ücretsiz; Telegram Premium ~$4–5/ay (teyit edilmeli).
- **Platform:** Mobil / masaüstü / web.
- **Ayırt edici:** Devasa gruplar/kanallar + güçlü bot platformu + bulut senkronu (ancak varsayılan E2EE yok). **Limitler ve Premium fiyatı resmî siteden teyit edilmeli.**

---

## 3. Birebir Karşılaştırma Tabloları (En Yakın Rakipler)

### Tablo 1 — Microsoft Teams ↔ Slack (hepsi-bir-arada ekip platformu)

| Özellik | Microsoft Teams | Slack |
|---|---|---|
| Mesajlaşma (kanal/DM/thread) | Kanal + DM + thread | Kanal + DM + thread (çekirdek güç) |
| Video toplantı | 300 (Premium daha fazla); breakout, kayıt, lobby | Huddles (anlık, 50 kişi); planlı toplantı yok |
| Sesli arama / telefon | Teams Phone add-on (PSTN) | Huddle sesli; PSTN yok |
| AI asistan | Copilot (+$30) | Slack AI / Agentforce (Business+) |
| AI analiz | Copilot transkript analizi | Enterprise search |
| Takvim & zamanlama | Outlook (derin) | Google/Outlook entegrasyonu |
| Webinar / etkinlik | Town hall + webinar | Yok |
| Gerçek zamanlı tercüme | Canlı altyazı + AI Interpreter | AI çeviri (Business+) |
| Açık kaynak / self-hosted | Hayır | Hayır |
| E2EE | 1:1 opsiyonel | Yok |
| Federasyon | Yok | Yok (Connect) |
| Fiyat | $4–5.25 + add-on | $7.25–15 |
| **Ayırt edici** | **M365 + Copilot + Graph** | **2.600+ entegrasyon + Workflow Builder + CRM** |

### Tablo 2 — Zoom Workplace ↔ Google Meet (video konferans)

| Özellik | Zoom Workplace | Google Meet |
|---|---|---|
| Mesajlaşma | Team Chat (kanal/DM/thread) | Toplantı odaklı (sohbet Google Chat'te) |
| Video toplantı | 100→1.000 (5.000 add-on); 30 saat | 100→1.000 (Enterprise) |
| Sesli arama / telefon | Zoom Phone add-on (PSTN) | Dial-in; tam UCaaS değil |
| AI asistan | **AI Companion (ücretsiz dahil)** | Gemini (ücretli paketlerde dahil) |
| AI analiz | Transkript analizi | Gemini özet |
| Takvim & zamanlama | Zoom Scheduler + Google/Outlook | Google Calendar (derin) |
| Webinar / etkinlik | Ayrı ürün (Zoom Webinars) | Sınırlı |
| Gerçek zamanlı tercüme | 46 dil + konuşma çevirisi | **70+ dil + sesi koruyan sesli çeviri** |
| Açık kaynak / self-hosted | Hayır | Hayır |
| E2EE | Opsiyonel | 1:1 |
| Federasyon | Yok | Yok |
| Fiyat | $13.33–29 | Ücretsiz / $6–22 |
| **Ayırt edici** | **Ücretsiz AI Companion + ölçek (5.000)** | **Sesi koruyan sesli çeviri + 70+ dil + eklentisiz** |

### Tablo 3 — GoTo Meeting ↔ Dialpad (video + UCaaS)

| Özellik | GoTo Meeting | Dialpad |
|---|---|---|
| Mesajlaşma | Toplantı içi + TeamChat (Connect) | Team chat + SMS/MMS |
| Video toplantı | 150–250; breakout, whiteboard | 150; breakout yok |
| Sesli arama / telefon | GoTo Connect tam UCaaS | **Tam UCaaS (çekirdek güç), 70+ ülke** |
| AI asistan | AI Meeting Assistant | **DialpadGPT (kendi LLM'i)** |
| AI analiz | Toplantı analitiği | **Gerçek zamanlı duygu analizi + canlı koçluk** |
| Takvim & zamanlama | Google/Outlook | Google/Outlook |
| Webinar / etkinlik | GoTo Webinar (3.000) | Yok |
| Gerçek zamanlı tercüme | Sınırlı | 30+ dil |
| Açık kaynak / self-hosted | Hayır | Hayır |
| E2EE | Standart | Standart |
| Federasyon | Yok | Yok |
| Fiyat | $12–16 | $15–80 |
| **Ayırt edici** | **Commuter Mode + 99.999% uptime** | **Yerleşik konuşma istihbaratı + DialpadGPT** |

### Tablo 4 — Zoom Webinars ↔ Livestorm ↔ Demio (webinar / büyük etkinlik)

| Özellik | Zoom Webinars | Livestorm | Demio |
|---|---|---|---|
| Maks izleyici | **100.000** | 1.000–3.000 | 50–1.000 |
| Panelist / konuşmacı | 100 | 16–20 | sahneye çıkarma |
| Registration | Var + ticketing + CRM | Markalı + UTM + sertifika | Özel alan + no-show segment |
| Q&A / anket | Canlı Q&A + upvote + polls | Q&A + upvote + polls + CTA | chat + polls + Featured Actions |
| Otomatik / evergreen | Simulive | Evergreen + on-demand | Automated + Series |
| Kayıt | Bulut + AI highlight | Var | Var |
| AI / analiz | AI bölüm + attendee analitiği | Engagement skoru | **Intent (niyet) analitiği** |
| Tercüme | Altyazı 20+ dil | Altyazı (Beta) + Interprefy | Sınırlı |
| Kurulum | Uygulama | **Tarayıcı (indirme yok)** | **Tarayıcı (indirme yok)** |
| Fiyat | ~$6.790–9.490/yıl | ~$99/ay (attendee-kredi) | ~$42–196/host |
| **Ayırt edici** | **Devasa ölçek + Simulive** | **İndirmesiz + e-posta otomasyonu** | **Intent analitiği + derin CRM** |

### Tablo 5 — Mattermost ↔ Rocket.Chat ↔ Zulip (açık kaynak mesajlaşma)

| Özellik | Mattermost | Rocket.Chat | Zulip |
|---|---|---|---|
| Mesajlaşma | Kanal/DM/grup/thread | Kanal/DM/discussion/thread | **Kanal + konu (topic) threading** |
| Video toplantı | Calls (50) + AI özet | Jitsi/Pexip entegrasyon | Zoom/Jitsi/Meet entegrasyon |
| Sesli arama / telefon | Calls (VoIP) | SIP VoIP | Entegrasyon |
| AI asistan | AI ajan (MCP) | Privacy-first AI (v8.0) | Sınırlı |
| AI analiz | Sistem konsolu | Omnichannel dashboard | Sınırlı |
| Tercüme | 20+ arayüz dili | **Gerçek zamanlı mesaj çevirisi** | 20+ arayüz dili |
| Açık kaynak | Evet (MIT) | Evet (MIT çekirdek) | **Evet (%100, Apache 2.0)** |
| Self-hosted | Evet (air-gapped) | Evet (air-gapped) | Evet |
| E2EE | TLS | Opsiyonel | Yok |
| Federasyon | Sınırlı | **Matrix federasyonu** | Yok |
| Fiyat | $0 / $10+ | $0 (50 kullanıcı) / özel | $0 / $3.50–12 |
| **Ayırt edici** | **DevSecOps + Playbooks + air-gapped** | **Sohbet + omnichannel destek + Matrix federasyonu** | **Konu-tabanlı threading + %100 açık kaynak** |

### Tablo 6 — Element/Matrix ↔ Nextcloud Talk (federasyon / self-hosted + E2EE video)

| Özellik | Element / Matrix | Nextcloud Talk |
|---|---|---|
| Mesajlaşma | Oda + DM + thread | Sohbet + grup + polls |
| Video toplantı | **Element Call (E2EE)** | Sesli/görüntülü (~50–75); webinar yok |
| Sesli arama / telefon | Element Call (E2EE VoIP) | VoIP; SIP mümkün |
| AI asistan | Sınırlı | Çağrı transkript + özet |
| Takvim & zamanlama | Entegrasyon | **Nextcloud Calendar yerel** |
| Webinar / etkinlik | Sınırlı | Yok |
| Tercüme | Sınırlı | Sınırlı |
| Açık kaynak / self-hosted | **Evet (Matrix açık standart)** | **Evet (tam on-prem)** |
| E2EE | **Varsayılan tam E2EE** | **Evet (aramalar)** |
| Federasyon | **Yerel + köprüler** | **Evet (sunucular arası)** |
| Fiyat | $5–10 / ESS Community ücretsiz | Açık kaynak ücretsiz |
| **Ayırt edici** | **Dijital egemenlik + açık federasyon + varsayılan E2EE** | **Nextcloud ekosistemine gömülü + tam self-host** |

### Tablo 7 — Coda ↔ Basecamp (doküman / proje)

| Özellik | Coda | Basecamp |
|---|---|---|
| Mesajlaşma | Doküman içi yorum | Campfire + Pings + Message Board |
| Video toplantı | Yok | Yok |
| AI asistan | **Coda AI (içerik/formül/Q&A)** | Yok |
| AI analiz | Tablo/veri analizi | Yok |
| Takvim & zamanlama | Takvim görünümü + Packs | Schedule + Google senkron |
| Yapı | Doküman + DB + uygulama + 450+ Packs | To-dos + Kanban + Hill Charts + Docs |
| Webinar / etkinlik | Yok | Yok |
| Tercüme | Yok | Yok |
| Açık kaynak / self-hosted | Hayır | Hayır |
| Fiyat | **Doc Maker bazlı** ($10–30/maker) | **Sabit $299/ay sınırsız** (veya $15/kullanıcı) |
| **Ayırt edici** | **"Doc as app" + maker-bazlı fiyat** | **Sabit ücret + kasıtlı sadelik** |

### Tablo 8 — WhatsApp Business ↔ Telegram (tüketici / işletme mesajlaşma) `[DOĞRULANMADI]`

| Özellik | WhatsApp Business | Telegram |
|---|---|---|
| Mesajlaşma | 1:1 + grup ~1.024 + Channels | 1:1 + grup ~200.000 + kanal (sınırsız) |
| Video toplantı | Görüntülü/sesli arama | Görüntülü + grup görüntülü/sesli sohbet |
| Sesli arama / telefon | VoIP | VoIP + grup sesli |
| AI asistan | İş ortağı chatbot (Platform/API) | Bot ekosistemi |
| AI analiz | Konuşma raporları | Kanal istatistikleri |
| Takvim & zamanlama | Yok | Yok |
| Webinar / etkinlik | Yok | Kanal/grup yayını |
| Tercüme | Yok | Premium çeviri (teyit edilmeli) |
| Açık kaynak | Hayır | İstemci açık / sunucu kapalı |
| E2EE | **Varsayılan E2EE** | **Yalnızca Secret Chat** |
| Federasyon | Yok | Yok |
| Fiyat | App ücretsiz; API konuşma bazlı | Ücretsiz; Premium ~$4–5/ay |
| **Ayırt edici** | **Erişim + varsayılan E2EE + şablon/otomasyon** | **Devasa grup/kanal + bot platformu + bulut senkron** |

> **Diğer ürünler (kategori içinde birebir eşi liste dışında):**
> - **Discord** ↔ Slack (gayri resmî): Ayırt edici = **kalıcı sesli kanallar + bot ekosistemi + ücretsiz sınırsız geçmiş**.
> - **Chatwoot** ↔ Intercom/Zendesk (liste dışı): Ayırt edici = **açık kaynak omnichannel destek + Captain AI + self-host**.
> - **Loom** ↔ Vidyard/Zoom Clips (liste dışı): Ayırt edici = **async ekran-video mesajı**. `[DOĞRULANMADI]`
> - **melp** ↔ Teams/Slack: Ayırt edici = **çoklu dilde canlı çeviri odaklı hafif platform**. `[DOĞRULANMADI]`

---

## 4. Ayırt Edici (Farklı) Özellikler Matrisi — EN ÖNEMLİ BÖLÜM

> "Bu üründe var, çoğu rakipte yok" mantığıyla — her ürünü rakiplerinden ayıran tek/öne çıkan özellik(ler).

| Ürün | Ayırt edici (diğerlerinde genelde olmayan) özellik |
|---|---|
| Microsoft Teams | M365/Office derin yerel entegrasyonu + Copilot Studio özel AI ajanları + Microsoft Graph veri zemini |
| Slack | En geniş entegrasyon ekosistemi (2.600+) + Workflow Builder + yerleşik Salesforce CRM/Agentforce |
| Zoom Workplace | AI Companion'ın **ücretsiz dahil** olması + 5.000 katılımcı ölçeği |
| Google Meet | **Sesi/tonu koruyan gerçek zamanlı sesli çeviri** + 70+ dil altyazı + eklentisiz tarayıcı |
| GoTo Meeting | Commuter Mode (aşırı düşük bant genişliği) + 99.999% uptime |
| Dialpad | **Yerleşik gerçek zamanlı konuşma istihbaratı / duygu analizi** + kendi LLM'i DialpadGPT |
| Zoom Webinars | **100.000 izleyici ölçeği** + Simulive (kayıtlıyı canlı gibi yayınlama) |
| Livestorm | **İndirmesiz tarayıcı deneyimi** + attendee-kredi fiyatlama + e-posta otomasyonu |
| Demio | **Intent (niyet) analitiği** + derin HubSpot/Salesforce + evergreen webinar |
| Discord | **Kalıcı / her zaman açık sesli kanallar** + bot ekosistemi + ücretsiz sınırsız geçmiş |
| Mattermost | **Air-gapped / DevSecOps** self-host + Playbooks (olay müdahalesi) |
| Rocket.Chat | **Sohbet + omnichannel müşteri desteği birleşik** + Matrix federasyonu + opsiyonel E2EE |
| Zulip | **Konu (topic) tabanlı threading** (canlı + asenkron) + %100 açık kaynak |
| Element/Matrix | **Varsayılan tam E2EE + açık federasyon + dijital egemenlik** (vendor lock-in yok) |
| Nextcloud Talk | **Nextcloud ekosistemine gömülü tam self-host** + E2EE arama + sunucular arası federasyon |
| Chatwoot | **Açık kaynak omnichannel müşteri destek** (Intercom/Zendesk alternatifi) + Captain AI |
| Coda | **"Doc as app"** (doküman+veritabanı+uygulama) + maker-bazlı fiyat |
| Basecamp | **Sabit $299/ay sınırsız kullanıcı** + kasıtlı sadelik |
| melp `[?]` | **Çoklu dilde canlı çeviri odaklı** hafif iş iletişimi |
| Loom `[?]` | **Async ekran-video mesajı** (toplantı yerine kayıt) |
| WhatsApp Business `[?]` | **Devasa erişim + varsayılan E2EE** + şablon mesaj/otomasyon |
| Telegram `[?]` | **Devasa grup/kanal (200k+)** + güçlü bot platformu + bulut senkron |

---

## 5. Doğrulama Uyarıları

- **Dört ürün `[DOĞRULANMADI — 2026]`:** melp, Loom, WhatsApp Business, Telegram — tüm rakam, limit ve fiyatlar resmî sitelerden teyit edilmeli.
- **Fiyatlar oynak:** Zoom 2025–2026'da fiyat değişikliği yaptı; Microsoft Copilot promosyon fiyatları 2026 ortasında sona eriyor. Her satıra "fiyat doğrulama tarihi" eklenmesi önerilir.
- **Katılımcı limitleri pakete bağlıdır:** Tablodaki maksimumlar genelde en üst paket içindir (örn. Zoom Business 300 vs Enterprise 1.000).
- **"Açık kaynak" nüanslıdır:** Mattermost/Rocket.Chat/Chatwoot "open core" — çekirdek açık, kurumsal özellikler ücretli/proprietary. Tam açık standart = Zulip ve Matrix.
- **E2EE kapsamı değişir:** Teams/Zoom belirli toplantı türlerinde, Telegram yalnızca Secret Chat'te, Google Meet kişisel 1:1'de E2EE sunar; Element/Matrix varsayılan tam E2EE'dir.
- Bazı 2026 özellikleri yol haritası/duyuru aşamasında olabilir.
