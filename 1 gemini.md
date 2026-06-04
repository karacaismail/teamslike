# AURA — Detayli Proje Durum ve Mimari Analiz Raporu

## 1. Genel Durum ve Mimari Tasarim
AURA, AI-öncelikli, çok-kiracılı (multitenant), hepsi bir arada birleşik iletişim ve işbirliği platformunun (UCaaS + CC + Collaboration) frontend uygulamasıdır. Proje, Next.js gibi sunucu-istemci sınırı belirsiz ve oynak yapılar yerine deterministik bir SPA (Vite + React 19 + Zustand + Tailwind CSS v4) olarak yapılandırılmıştır.

Mimari, Domain-Driven Design (DDD) prensiplerine göre "Bounded Context"lere bölünmüştür. Kod tabanında `web/src/features` altında 10 ana domain dilimi bulunmaktadır:
*   `messaging` (Kanal/DM/Konu-Thread)
*   `telephony` (PBX, IVR, Supervisor Monitör)
*   `meetings` (Video/Sesli Toplantı)
*   `support` (Omnichannel Inbox, WFO/WEM, Agent Studio)
*   `webinar` (Townhall, Bilet/Events)
*   `intelligence` (Çeviri, Konuşma Zekası)
*   `docs` (Canvas, Kanban, Workflow, Clips)
*   `scheduling` (Availability, Booking)
*   `admin` (Governance, Audit Log, Billing)
*   `canvas` (Prompt-güdümlü çapraz-alan AI panosu)

### Mimaride DDD Yaklaşımı ve Katmanlar
Her domain dilimi (`features/<domain>`) kendi içinde bağımsız bir "Bounded Context" olarak kurgulanmıştır ve şu katmanlardan oluşur:
1.  **Domain Katmanı (Types & Utils):** `types.ts` içinde domain modelleri ve WebSocket/SSE sözleşmelerini simüle eden olay tipleri (`*Event`) tanımlıdır. `*.ts` (örn. `routing.ts`, `pbx.ts`, `slots.ts`) dosyaları framework bağımsız saf yardımcı iş mantığı fonksiyonlarını içerir ve doğrudan Vitest ile birim test edilir.
2.  **Anti-Corruption Layer (ACL) & Store Katmanı:** Zustand store'ları (`*Store.ts`), saf iş mantığı çekirdeğini sarmalayarak UI durumunu yönetir. Gerçek veri modeli ile API sözleşmesi arasındaki dönüşümleri bu katman üstlenir.
3.  **Veri Erişim Katmanı (Mock API):** `api.ts` dosyaları, FastAPI tarafından sunulacak OpenAPI şemalarını taklit eden, `delay<T>()` tabanlı in-memory asenkron işlevleri barındırır.
4.  **Arayüz Katmanı (UI):** `components/` dizini altında alana özel bileşenler ve `<Domain>Page.tsx` giriş sayfası yer alır.

---

## 2. Projedeki Teknik Eksiklikler (Kapsam Dışı ve Ertelenenler)

### 2.1 Faz 9 (Docs & Workspace) Derinlik Boşlukları
Geliştirme planına göre "Coda sınıfı doc-as-app" hedefinin çekirdeği yapılmış olsa da, aşağıdaki gelişmiş veri görünümleri ve ortak çalışma mekanizmaları henüz `web/src/features/docs` altında kodlanmamıştır:
*   **İlişkisel Tablo (TableGrid):** Hücre bazlı düzenleme, veri tipleri (sayı, tarih, kişi), formül motoru (kolonlar arası hesaplama) ve türetilmiş kolon yapıları eksiktir.
*   **Zaman ve İlerleme Görünümleri:** Tablo verilerinden otomatik türetilen Takvim (`CalendarView`), Gantt Şeması (`GanttView`) ve hedeflerin durumunu gösteren Hill Chart (`HillChart`) görünümleri eksiktir.
*   **İşbirliği ve Yorumlaşma:** Doküman içi satır/paragraf bazlı yorum kenar çubuğu (`CommentSidebar`) ve gerçek zamanlı eşzamanlı düzenlemeyi simüle eden CRDT (Conflict-free Replicated Data Type) / OT (Operational Transformation) adapter yapısı eksiktir.

### 2.2 İşlenmemiş Rakip Özellik Envanterleri
`eksiks/` klasörü altında bulunan ve pazar analizi yapılmış ancak henüz AURA domain'lerine entegre edilmemiş zengin envanterler mevcuttur:
*   `Calendly_Core.md`: Scheduling alanında grup zamanlama, gelişmiş otomatik hatırlatma kuralları ve takvim çakışma çözümleme derinleştirmesi eksiktir.
*   `notta_otter.md`: Transkripsiyon (intelligence) alanında hoparlör tanımlama (diarization), konuşma hızı analizi ve otomatik kelime bulutu/aksiyon çıkarma derinleştirmesi eksiktir.
*   `Google_Meet_Ozellik_Envanteri.xlsx`: Toplantı paritesi tamamlanmış olsa da, Excel tablosundaki bazı detay kurumsal kurallar ve raporlama şablonları eklenmemiştir.
*   `6.md`: Analiz belgesindeki bazı gelişmiş federasyon ve veri ikametgahı kuralları eksiktir.

### 2.3 Test Kapsamı Boşlukları
Projede 312 birim/bileşen testi ve 8 Playwright E2E testi bulunmaktadır ancak son turlarda eklenen karmaşık akışlar için E2E testleri eksiktir:
*   AI Canvas (`/canvas`) eylemleri ve blok yönetimi,
*   Asenkron video Clips (`/docs` alt sekmesi) etkileşimleri (CTA tıklama, dolgu çıkarma),
*   Google Meet derin paritesi (GM kilitleri, Take Notes, uzaktan kontrol),
*   Workforce (WFO/WEM) metrik güncellemeleri,
*   AI Agent Studio sandboxtest akışı,
*   Events bilet/badge oluşturma ve yazdırma kuyruğu.

---

## 3. Kod Tabanındaki Teknik Borçlar ve Yapısal Sorunlar

### 3.1 Durum Yönetimi ve Performans Riski (Zustand & Mock State)
*   **Client-Side Bellek Şişmesi:** Gerçek bir veritabanı ve backend olmadığı için tüm durumlar (omnichannel görüşmeleri, çağrı kuyrukları, mesaj geçmişleri, doküman blokları, CRM kişileri vb.) istemci belleğinde Zustand store'larında mock veri olarak tutulmaktadır. Kullanıcı uygulama üzerinde işlem yaptıkça (özellikle Clips transkripsiyonu üretme, IVR simülasyonu, WFO tahmini çalıştırma) bellek tüketimi kontrolsüz şekilde artabilir.
*   **Anti-Corruption Layer (ACL) Adaptasyon Zorluğu:** Gerçek bir API'ye geçerken, mock verilerin in-memory mutasyonları (örn. `patchClip`, `moveCardUtil`) ile HTTP istekleri/WebSocket mesajları arasındaki asenkron tutarlılık farkı, store yapılarında büyük değişiklikler gerektirecektir.

### 3.2 Erişilebilirlik (A11y) Test Kısıtlamaları
*   Erişilebilirlik doğrulamaları Vitest altında `jsdom-axe` ile yapılmaktadır. JSDOM, CSS ve gerçek render motorunu simüle edemediği için **renk kontrastı (AAA - 7:1) ve görünür odak halkası (focus-visible)** hatalarını yakalayamaz. CI ortamında Playwright + axe-core entegrasyonu tam olarak çalıştırılmadığı sürece bu kurallar kod seviyesinde denetlenemez.

### 3.3 Hata Sınırları (Error Boundaries) ve Dayanıklılık
*   `AppErrorBoundary` tanımlanmış olsa da, veri çeken alt bileşenlerin (özellikle asenkron mock API kullanan widget'ların) kendi izole hata sınırları (`ErrorBoundary`) eksiktir. Tek bir API gecikmesi veya mock veri parsing hatası tüm arayüzün kilitlenerek beyaz ekran vermesine yol açabilir.

---

## 4. Geliştirme Süreci ve FastAPI Geçiş Planı Önerileri
1.  **Sözleşme Tip Üretimi:** Backend (FastAPI) OpenAPI şeması tamamlandığında, `openapi-typescript` aracı ile `types/api.ts` üretilmeli ve store'lardaki `api.ts` mock veri yapıları bu tiplerle sıkı sıkıya bağlanmalıdır.
2.  **SSE/WS Adaptörleri:** `store/copilotStore` ve `features/intelligence/store` gibi gerçek zamanlı akış kullanan store'lar, yerel mock olay tetikleyicilerinden sıyrılıp standart bir WebSocket veya EventSource sarmalayıcısına taşınmalıdır.
3.  **Görünüm Derinleştirme:** Faz 9'daki ilişkisel veritabanı tablolarının (TableGrid) frontend iskeleti kurulmalı ve Zustand store'da hücre bazlı mutasyonlar (Row/Column state) asenkron modelle uyumlu hale getirilmelidir.
