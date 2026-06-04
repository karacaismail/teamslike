# YAP — Otomatik Deploy Sistemi (Git Talimatnamesi)

Bu sistem sayesinde tek işin `yap` demek. Git komutu girmiyorsun; commit, push,
test ve GitHub Pages deploy'u otomatik akıyor.

Kurulum bir kere yapıldı (Mac: `~/.config/yap.zsh` + `~/.zshrc` source satırı).
Bu belge "sonra ne yapacağım?" sorusunun cevabı.

---

## 1. Zihinsel model (sistem nasıl çalışır)

```
Cowork kodu üretir  →  sen "yap" dersin  →  yap commit + push yapar
                                              ↓
                              GitHub Actions: test + build + Pages deploy
                                              ↓
                                  site canlı: kullanıcı-adın.github.io/repo/
```

- `yap` = Mac'teki shell fonksiyonu (commit + push, ilk kurulumda repo + Pages açar).
- CI/CD = repo içindeki `.github/workflows/` (testleri ve deploy'u GitHub çalıştırır).
- Sen hiçbir `git` komutu girmezsin.

---

## 2. Günlük kullanım

### Mevcut bir projede (repo zaten bağlı)

```bash
cd ~/Downloads/<proje>
yap "kısa commit mesajı"
```

Mesaj yazmazsan otomatik tarihli mesaj atar:

```bash
yap
```

Çıktı: `✓ Commit → ✓ Push → Actions`. Gerisi GitHub'da.

### Yeni bir projede (ilk kez)

Klasöre gir ve sadece `yap` de. Fonksiyon şunları kendi yapar:

1. `git init` (yoksa)
2. GitHub'da **public** repo açar + `origin` bağlar
3. Projede Pages workflow'u varsa **Pages'i açar** (senin token'ınla)
4. commit + push

```bash
cd ~/Downloads/<yeni-proje>
yap "feat: ilk yükleme"
```

> Repo adı klasör adından gelir. `~/Downloads/dukkan` → repo `dukkan`.

---

## 3. Yeni FRONTEND projesi için gereken 2 şey

`yap` repoyu ve Pages'i halleder; **ama** Pages'e bir şey gitmesi için projede şu
ikisi bulunmalı. Yoksa kod push olur, site oluşmaz.

### A) `.github/workflows/deploy-pages.yml`

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: web        # app kök dizindeyse bu satırı sil
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm install --no-audit --no-fund
      - name: Build
        run: npm run build
        env:
          VITE_BASE: /${{ github.event.repository.name }}/
      - name: SPA 404 fallback
        run: cp dist/index.html dist/404.html
      - uses: actions/upload-pages-artifact@v3
        with:
          path: web/dist               # app kök dizindeyse: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Pages'i workflow değil, `yap` açar (workflow token'ı ilk açmayı yapamaz). Bu yüzden
yukarıda Pages'i açan bir adım yok — sadece build + deploy.

### B) `vite.config.ts` içinde alt-dizin tabanı

```ts
base: process.env.VITE_BASE || "/",
```

SPA router (react-router vb.) kullanıyorsan basename'i de tabandan oku:

```ts
const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";
```

### Opsiyonel: test geçidi `.github/workflows/ci.yml`

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
jobs:
  verify:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: web
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm install --no-audit --no-fund
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test
      - run: npm run build
```

### En pratik yol

Yeni projeyi Cowork'te kurarken şunu söyle: *"deploy-pages.yml + ci.yml ekle,
vite base'i VITE_BASE'den oku."* Böylece `yap` dediğinde her şey hazır olur.
Alternatif: bu iki dosyayı bir "starter" klasöründe sakla, yeni projeye kopyala.

---

## 4. Komut referansı

```bash
yap                       # commit (otomatik mesaj) + push
yap "mesaj"               # commit (verilen mesaj) + push
gh run watch              # son çalışmayı canlı izle (yeşil olunca biter)
gh run list -L 5          # son 5 Actions çalışması
gh run view --log-failed  # hatalı adımın logu
gh repo view --web        # repoyu tarayıcıda aç
gh browse                 # repo sayfasını aç
```

Canlı site adresi: `https://<kullanıcı-adın>.github.io/<repo>/`

---

## 5. Sıfırdan makine kurulumu (yeni Mac / 2 yıl sonra)

Mevcut makinende kuruldu. Yeni bir makinede baştan kurman gerekirse sıra:

```bash
# 1) GitHub CLI + giriş
brew install gh
gh auth login                                  # GitHub.com > HTTPS > tarayıcı

# 2) SSH anahtarı (yoksa) + GitHub'a ekle + git'i SSH'a çevir
ssh-keygen -t ed25519 -C "mac"                 # zaten varsa atla
gh auth refresh -s admin:public_key
gh ssh-key add ~/.ssh/id_ed25519.pub -t "mac"
git config --global url."git@github.com:".insteadOf "https://github.com/"

# 3) git kimlik + sağlıklı varsayılanlar
git config --global user.name  "ismail Karaca"
git config --global user.email "karacai@yandex.com"
git config --global init.defaultBranch main
git config --global push.autoSetupRemote true

# 4) yap fonksiyonunu kur (yap.zsh dosyasını ~/.config'e koy + source et)
mkdir -p ~/.config
cp <yap.zsh-yolu> ~/.config/yap.zsh
grep -q 'source ~/.config/yap.zsh' ~/.zshrc || echo 'source ~/.config/yap.zsh' >> ~/.zshrc
source ~/.zshrc && type yap
```

`yap.zsh` dosyasının bir kopyası bu repoda ve `~/.config/yap.zsh`'de duruyor.

---

## 6. Sorun giderme

**`.git/index.lock ... File exists`**
Yarıda kalmış bir git işleminden kalan kilit. Sebebi: aynı `.git`'e iki yerden
erişim. Çöz:

```bash
rm -f .git/index.lock
yap "..."
```

**Site 404 / "There isn't a GitHub Pages site here"**
Pages açılmamış. Senin token'ınla aç, sonra deploy'u tetikle:

```bash
gh api -X POST repos/<kullanıcı>/<repo>/pages -f build_type=workflow
gh workflow run deploy-pages.yml
```

(Yeni repolarda `yap` bunu zaten otomatik yapıyor.)

**`Resource not accessible by integration` (configure-pages adımı)**
Workflow'un dahili token'ı Pages'i ilk kez açamaz. Çözüm: yukarıdaki `gh api`
komutunu bir kez senin token'ınla çalıştır. Bu yüzden önerilen workflow'da
configure-pages adımı yok.

**Free plan + private repo → Pages yayınlanmıyor**
GitHub Pages, private repolarda yalnızca Pro/Team planında çıkar. Free'desin:
repoyu public tut. Sonra istersen Pro alıp private yaparsın (o an site kapanır).

```bash
gh repo edit <kullanıcı>/<repo> --visibility public --accept-visibility-change-consequences
```

**Terminale çok satırlı fonksiyon yapıştırınca bozuluyor (`cmdand quote>` / `heredoc>`)**
Fonksiyonu terminale yapıştırma. Dosyadan source et: değişiklik gerekiyorsa
`~/.config/yap.zsh`'i düzenle, sonra `source ~/.config/yap.zsh`.

---

## 7. Sınırlar (bilinçli kararlar)

- **Free plan**: yayında olan repo public olmalı. Geliştirmede public, sonra
  Pro + private. Private yapınca free'de site kapanır.
- **Cowork sandbox** `git push` yapamaz; push her zaman Mac'teki `yap` ile olur.
- Bu sistem **frontend → GitHub Pages** içindir. **Backend** projelerde `ci.yml`
  testleri çalıştırır ama sunucuya (Hetzner/Debian) deploy ayrı bir workflow
  ister (SSH/rsync veya Docker). Onu ihtiyaç olunca ayrıca kurarız.

---

## 8. Özet akış

| Durum | Komut |
| --- | --- |
| Mevcut projeye değişiklik gönder | `yap "mesaj"` |
| Yeni proje (workflow'lar hazırsa) | `cd proje && yap` |
| Deploy durumu | `gh run watch` |
| Canlı site | `https://<kullanıcı>.github.io/<repo>/` |

Tek cümle: **kodu hazırla, `yap` de, gerisini sistem halletsin.**

---

## 9. Ek: teamslike'ı sıfırdan canlıya alırken çalıştırdığımız komutlar (gerçek kayıt)

Aşağıdaki sıra, bu sistemi kurarken bizzat çalıştırdığımız adımlardır. Yeni bir
makinede veya yeni bir projede aynı mantığı izlersin.

### 9.1 Kimlik kontrolü (zaten kuruluydu)

```bash
which gh && gh auth status          # gh kurulu + giriş yapılmış mı
ls -la ~/.ssh/*.pub                 # SSH anahtarı var mı
ssh -T git@github.com               # "Hi <kullanıcı>! ... authenticated" beklenir
```

### 9.2 git'i SSH'a çevir + kimlik + varsayılanlar

```bash
git config --global url."git@github.com:".insteadOf "https://github.com/"
git config --global user.name  "ismail Karaca"
git config --global user.email "karacai@yandex.com"
git config --global init.defaultBranch main
git config --global pull.rebase true
git config --global push.autoSetupRemote true
```

### 9.3 `.zshrc` temizliği (eski hatalı satır)

```bash
# Her terminalde "no such file: .langflow/uv/env" hatası veriyordu — pasifleştirildi
sed -i '' '2s|^. "\$HOME/.langflow/uv/env"|# &|' ~/.zshrc
```

### 9.4 `yap` fonksiyonunu dosyadan kur (kalıcı, sağlam yöntem)

```bash
mkdir -p ~/.config && cp ~/Downloads/teamslike/yap.zsh ~/.config/yap.zsh
grep -q 'source ~/.config/yap.zsh' ~/.zshrc || echo 'source ~/.config/yap.zsh' >> ~/.zshrc
source ~/.zshrc && type yap            # "yap is a shell function ..." beklenir
```

> Not: Fonksiyonu doğrudan terminale yapıştırmak apostrof/çok-satır yüzünden
> bozuluyordu. Dosyadan `source` etmek bu sorunu kökten çözdü.

### 9.5 İlk push (repo açılır)

```bash
cd ~/Downloads/teamslike
yap "feat: teamslike ilk yükleme"
# "index.lock File exists" çıkarsa:
rm -f .git/index.lock && yap "feat: teamslike ilk yükleme"
```

### 9.6 Repo'yu public yap (free planda Pages şartı)

```bash
gh repo edit karacaismail/teamslike --visibility public --accept-visibility-change-consequences
```

### 9.7 Pages'i aç + deploy'u tetikle + izle

```bash
gh api -X POST repos/karacaismail/teamslike/pages -f build_type=workflow
gh workflow run deploy-pages.yml
gh run watch $(gh run list -w deploy-pages.yml -L 1 --json databaseId -q '.[0].databaseId')
```

`build ✓` ve `deploy ✓` → site canlı:
`https://karacaismail.github.io/teamslike/`

### 9.8 Bundan sonra

Tek işin: değişiklik yap, sonra

```bash
yap "ne değişti"
```
