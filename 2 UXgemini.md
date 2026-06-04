# AURA — Detayli Kullanici Yolculugu (User Journey) ve UX Analiz Raporu

Bu rapor, AURA platformundaki kullanıcı etkileşim süreçlerini, "Görevi Başlat -> İşlem Yap -> Sonuçlandır" adımları arasındaki engelleri ve kullanıcı yolculuğunu (User Journey) kesintiye uğratan frontend UX sorunlarını teknik detaylarıyla incelemektedir. Arayüzün görsel estetiği (renk uyumu, font seçimi vb.) kapsam dışı tutulmuştur.

---

## 1. Mesajlaşma Yolculuğu (Messaging Journey)

### 1.1 Mesaj Eylemlerinin Keşif Zorluğu (Action Discoverability)
*   **Sorun:** `MessageBubble.tsx` içinde mesaj eylemleri (Kaydet, Sabitle, İlet, Önemli İşaretle) yalnızca mesaj üzerine fare ile gelindiğinde (hover) beliren `⋯` (DotsThree) menüsü altında, iki tıklama derinlikte gizlenmiştir.
*   **Yolculuk Üzerindeki Etkisi:** 
    *   **Mobil/Dokunmatik Ekran Kullanıcıları:** Hover durumu olmadığı için eylem çubuğunu tetikleyemezler. Mesaja basılı tutma (long-press) veya dokunulduğunda eylemleri açma gibi bir alternatif akış bulunmadığından eylemleri kullanamazlar.
    *   **Klavye Kullanıcıları:** Roving tabindex veya doğrudan mesaj kartına odaklanma (`tabindex=0`) mekanizması olmadığından, klavye ile mesaj eylemlerine odaklanılamaz. Kullanıcı mesaja odaklanamadığı için eylem çubuğu `group-focus-within` durumuna geçmez ve klavyeyle mesaj sabitlemek/kaydetmek imkansız hale gelir.

### 1.2 Sağ Tık (Context Menu) Refleksinin Kırılması
*   **Sorun:** Kurumsal mesajlaşma uygulamalarında (Slack, Teams) kullanıcıların en temel refleksi mesajın üstüne sağ tıklayıp eylemleri (kopyala, sil, sabitle) açmaktır. AURA genelinde `onContextMenu` desteği bulunmamaktadır.
*   **Yolculuk Üzerindeki Etkisi:** Kullanıcı sağ tıkladığında tarayıcının standart menüsü açılır. Bu durum, kullanıcının uygulama içi akıcı eylem akışını kesintiye uğratır.

---

## 2. Doküman ve İşbirliği Yolculuğu (Docs & Workspace Journey)

### 2.1 Kanban Kart Taşıma (Drag & Drop Affordance)
*   **Sorun:** `KanbanBoard.tsx` üzerinde kartlar sadece klavye ok tuşları (`CaretLeft/Right`) ile sütunlar arası taşınabilmektedir. Sürükle-bırak (Drag & Drop) için fare/pointer etkileşimi ve görsel bir sürükleme tutamacı (handle) bulunmamaktadır.
*   **Yolculuk Üzerindeki Etkisi:** Fare kullanan masaüstü kullanıcıları kartı sürüklemeyi dener ancak kartlar tepki vermez. Kullanıcı sürükle-bırak yapılamadığını görüp kartı taşımaktan vazgeçebilir veya klavye ok tuşlarını keşfetmek zorunda kalır. Sürükleme esnasında hedef sütunun görsel olarak vurgulanmaması (drop zone feedback) da süreci zorlaştırır.

### 2.2 Doküman İçi Hızlı Düzenleme Geri Bildirimi
*   **Sorun:** `CanvasEditor.tsx` ve tablo/inline alanlarda düzenlenebilir başlıklar ve bloklar hover edildiğinde düzenleme ipucu (kalem ikonu, zemin değişimi vb.) vermemektedir.
*   **Yolculuk Üzerindeki Etkisi:** Kullanıcı hangi alanın düz metin, hangi alanın düzenlenebilir (inline-editable) olduğunu anlamak için her metne tıklamak zorunda kalır. Keşif süreci deneme-yanılmaya döner.

---

## 3. Gerçek Zamanlı Bağlantı Durumu ve Form Girişleri (Real-time & Forms)

### 3.1 Bağlantı Kesintisinde Sessiz Veri Kaybı
*   **Sorun:** Gerçek zamanlı SSE/WS olayları (`doc.*`, `call.*`, `conversation.*`) arka planda Zustand store'larına yansısa da, arayüzde (Shell üst bar vb.) bir bağlantı durumu göstergesi (Online/Offline/Reconnecting) bulunmamaktadır.
*   **Yolculuk Üzerindeki Etkisi:** Kullanıcının internet bağlantısı koptuğunda veya WebSocket bağlantısı düştüğünde, mesaj yazmaya veya form doldurmaya (örneğin toplantı oluşturma, bilet tanımlama) devam edebilir. Gönder butonuna tıkladığında işlem sessizce başarısız olur ve kullanıcının girdiği veriler kaybolur. Giriş alanlarının (textarea/input) çevrimdışı durumda `disabled` konuma geçmemesi veri kaybı riskini büyütür.

### 3.2 Hatalı Form Girişlerinde Geri Bildirim Eksikliği (Inline Validation & Validation Feedback)
*   **Sorun:** Form girdilerinde (Scheduling oda oluşturma, Webinar kayıt formu, Admin SSO ayarları vb.) hatalı veri girişi yapıldığında, hata durumu `aria-invalid` ve `aria-describedby` ile ekran okuyuculara bildirilmemektedir.
*   **Yolculuk Üzerindeki Etkisi:** Formu dolduran kullanıcı "Kaydet" butonuna bastığında form gönderilmez ancak hangi alanın hatalı olduğunu (kırmızı çerçeve veya inline hata mesajı eksikliği sebebiyle) anlamakta zorlanır. Özellikle ekran okuyucu kullanan engelli kullanıcılar formda takılı kalır.

---

## 4. Düzensiz Yükleme ve Hata Karşılama Akışları (Loading, Empty & Error States)

### 4.1 Layout Shift (Sayfa İçi Öğelerin Zıplaması)
*   **Sorun:** Proje içinde `Skeleton` bileşeni yer alsa da, store'dan okunan verilerin gecikmeli gelmesi (örneğin `api.ts` içindeki `delay` fonksiyonları çalışırken) durumunda iskelet ekranları kullanılmamaktadır.
*   **Yolculuk Üzerindeki Etkisi:** Sayfa açıldığında önce boş bir liste/alan görünür, 500ms sonra veriler gelince tüm arayüz aşağı doğru zıplar (Layout Shift). Kullanıcı tam bir butona tıklamak üzereyken içeriğin kayması sonucu yanlış bir yere tıklayabilir.

### 4.2 Hata Durumlarında Çıkmaz Sokaklar (Dead-ends)
*   **Sorun:** Herhangi bir liste çekilirken hata oluştuğunda (fetch fail), ekran sadece boş kalmakta veya düz bir metin göstermektedir.
*   **Yolculuk Üzerindeki Etkisi:** Kullanıcı hata aldığında "Yeniden Dene" (Retry) butonu göremez. Yolculuğu devam ettirmek için tarayıcıyı yenilemek zorunda kalır ve bu esnada kaydettiği diğer geçici durumları (yazmakta olduğu mesaj taslağı vb.) kaybeder.

---

## 5. Çoklu Panel ve Ekran Boyutu Duyarlılığı (Responsive Journey)

### 5.1 Çoklu Panel Daralmasında Sıkışma
*   **Sorun:** Omnichannel Destek (`SupportLayout.tsx`) ekranı 4 adet dikey panelden oluşur: Sol Navigasyon -> Konuşma Listesi -> Konuşma Detayı -> Kişi/KB Bilgi Paneli. Bu paneller dar ekranlarda (tablet, küçük dizüstü) Drawer yapısına geçmek yerine yatay olarak sıkışmaktadır.
*   **Yolculuk Üzerindeki Etkisi:** Ekran genişliği 1024px altına indiğinde sohbet metinleri okunamaz hale gelir, butonlar üst üste biner. Kullanıcı panelleri kapatıp açamadığı veya kaydıramadığı için sistemi kullanamaz.
*   **Mobil Arama Engeli:** Mobil ekranlarda yer kazanmak için üst arama çubuğu tamamen gizlenmektedir. Mobil kullanıcısı arama yapma yolculuğuna hiç başlayamamaktadır.

---

## 6. Durum Tutarlılığı ve Navigasyon (State Persistence)

### 6.1 Yenilemede Durum Kaybı (Tab / Page State Reset)
*   **Sorun:** Telefon (`/telephony`), Belgeler (`/docs`) veya Destek (`/support`) sayfalarındaki aktif sekmelerin (aktif sohbet, açık olan döküman sekmesi, IVR builder sekmesi) durumu URL query parametrelerine (`?tab=canvas` vb.) veya `localStorage`'a yazılmamaktadır.
*   **Yolculuk Üzerindeki Etkisi:** Kullanıcı bir belgede çalışırken yanlışlıkla sayfayı yenilediğinde veya tarayıcının "Geri" butonuna bastığında başladığı noktaya (ilk sekmeye/ilk dökümana) döner. Bu durum kullanıcının kaldığı yerden devam etmesini zorlaştırarak navigasyon yolculuğunu kesintiye uğratır.

---

## Özet ve Öncelikli İyileştirme Yol Haritası
1.  **P1 (Kritik):** Mesaj eylemleri için mobil dokunma ve klavye odağı (`tabindex=0`) getirilmesi, bağlantı koptuğunda UI üzerinde uyarı şeridi gösterilmesi.
2.  **P1 (Responsive):** Support ve Docs sayfalarındaki yan panellerin mobil/tablet boyutlarında ekran dışına (Drawer) alınması ve mobil arama tetikleyicisinin eklenmesi.
3.  **P2 (Kararlılık):** Tüm veri çeken listelere yükleme esnasında Layout Shift'i önleyecek `Skeleton` entegrasyonu yapılması ve yıkıcı eylemlere (silme/iptal) ConfirmDialog eklenmesi.
4.  **P2 (Navigasyon):** Aktif sekme durumlarının URL query parametreleri üzerinden yönetilerek tarayıcı geçmişi (back/forward) ile uyumlu hale getirilmesi.
