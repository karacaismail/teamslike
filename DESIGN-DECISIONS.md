# AURA — Kalıcı Tasarım Kararları

Bu dosya, tekrar bozulmaması gereken UI/UX kararlarını sabitler. Bir yüzeyi
değiştirirken önce buraya bak.

## Hesap / profil kartı → SOL-ALT (sağ-üst DEĞİL)

- Hesap/profil kartı, kabuğun **sol-alt** köşesindedir (sidebar'ın dibi) —
  Slack/Linear deseni. **Sağ-üste taşıma.**
- Bileşen: `components/shell/AccountMenu.tsx`. Masaüstünde
  `components/shell/AppShell.tsx` içindeki `<aside>`'ın altına render edilir
  (flex-col: PrimaryNav esnek + AccountMenu altta).
- Mobilde sidebar gizli olduğundan `AccountMenu`, `MobileNav` "Daha fazla"
  sheet'inin altında da gösterilir (`onNavigate` ile sheet kapanır).
- Karttan menü: **Ayarlar → `/profile`** ve **Çıkış**.

## Ayarlar → `/profile` sayfası (TopBar'da DEĞİL)

- Tema/yoğunluk/dil/rol ayarları ve aksan-renk seçimi `features/profile/
  ProfilePage.tsx` içindedir; rota `/profile` (router.tsx).
- TopBar artık sade: marka, workspace switcher, komut arama, bildirim, copilot.
  Ayar dişlisi ve hesap avatarı TopBar'dan **kaldırıldı** (sol-alt + /profile'a
  taşındı). TopBar'a geri ekleme.

## Aksan renk (kullanıcı teması)

- `uiStore.accentColor: string | null` (persist edilir; null = tema/tenant
  varsayılanı). Setter `setAccentColor`.
- Uygulama: `AppShell` efekti `--accent` / `--ring` / `--accent-fg` (okunabilir
  metin için `lib/themeColors.ts → readableOn`) ayarlar. **Kullanıcı seçimi
  tenant marka rengini geçersiz kılar.**
- Palet: `lib/themeColors.ts → THEME_COLORS` (CMYK/RGB + ara tonlar). Parlak
  renklerde bile buton metni `readableOn` ile okunur kalır.

## RBAC

- `/profile` içinde demo **rol değiştirme** yalnız `can("admin.access")`
  (owner/admin) için; diğer roller salt-okunur (`profile.roleLocked`).

## Odak göstergesi (input border)

- Global `*:focus-visible` butonlar/linkler için 3px offset outline (AAA).
- **Form alanları** (input/textarea/select) ise kenara **yapışık** ince halka
  alır (offset yok) — `index.css`. Composer'da kutu `focus-within:border-accent`
  ile vurgulanır, textarea kendi halkasını göstermez. Odak göstergesini
  tamamen kaldırma (erişilebilirlik).
