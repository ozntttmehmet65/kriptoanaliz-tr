# KriptoAnaliz TR

Modern, özel kodlu kripto ve finans haber & analiz sitesi.

## Özellikler
- Canlı fiyatlar (CoinGecko API)
- Gerçek zamanlı haberler (cryptocurrency.cv)
- Coin detay sayfaları (grafik + RSI)
- Portföy takipçisi (LocalStorage)
- Responsive karanlık tema
- Türkçe arayüz

## Dosyalar
- `index.html` — Ana sayfa
- `coin.html` + `coin.js` — Coin detay
- `portfolio.html` + `portfolio.js` — Portföy
- `styles.css` — Stil
- `script.js` — Ana sayfa JS
- `imagine_images/` — Logo

## Nasıl Çalıştırılır?
1. Tüm dosyaları bir klasöre çıkarın.
2. `index.html` dosyasını tarayıcıda açın.

## Hosting (Yayına Alma)
Ücretsiz ve kolay seçenekler:

### 1. Netlify (Önerilen)
- netlify.com adresine gidin
- Dosyaları sürükleyip bırakın (veya GitHub bağlayın)
- Otomatik HTTPS ve custom domain

### 2. Vercel
- vercel.com → New Project → dosyaları yükleyin

### 3. GitHub Pages
- GitHub'a repo oluşturun
- Dosyaları push edin
- Settings → Pages → Deploy from main branch

### 4. Cloudflare Pages
- Benzer şekilde dosyaları yükleyin

**Not:** API çağrıları tarayıcıdan yapıldığı için CORS sorunu olmaz. Rate limit'e dikkat edin (CoinGecko public API günde sınırlı çağrı).

## Geliştirme
Daha fazla özellik eklemek için JS dosyalarını düzenleyin. Backend isterseniz Node.js + Express ile API proxy yapılabilir.
