const COINGECKO = 'https://api.coingecko.com/api/v3';

// Menü toggle
document.getElementById('menuToggle').addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('active');
});

// Fiyat formatı
function formatPrice(num) {
    if (num >= 1000) return '$' + num.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (num >= 1) return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return '$' + num.toFixed(4);
}

function formatChange(change) {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
}

// Hero istatistikleri (BTC, ETH, SOL)
async function loadHeroStats() {
    try {
        const res = await fetch(`${COINGECKO}/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd,try&include_24hr_change=true`);
        const data = await res.json();

        const container = document.getElementById('heroStats');
        const coins = [
            { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
            { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
            { id: 'solana', symbol: 'SOL', name: 'Solana' }
        ];

        container.innerHTML = coins.map(coin => {
            const c = data[coin.id];
            const change = c.usd_24h_change || 0;
            const cls = change >= 0 ? 'positive' : 'negative';
            return `
                <div class="stat-card">
                    <div class="symbol">${coin.symbol} / USD</div>
                    <div class="price">${formatPrice(c.usd)}</div>
                    <div class="change ${cls}">${formatChange(change)}</div>
                    <div style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">₺${c.try?.toLocaleString('tr-TR', {maximumFractionDigits:0}) || '-'}</div>
                </div>
            `;
        }).join('');
    } catch (e) {
        console.error('Hero stats error:', e);
        document.getElementById('heroStats').innerHTML = '<p style="color:var(--text-muted)">Fiyatlar yüklenemedi. Lütfen yenileyin.</p>';
    }
}

// Piyasa tablosu (top 12)
async function loadMarket() {
    try {
        const res = await fetch(`${COINGECKO}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=12&page=1&sparkline=false&price_change_percentage=24h`);
        const coins = await res.json();

        const grid = document.getElementById('marketGrid');
        grid.innerHTML = coins.map(c => {
            const change = c.price_change_percentage_24h || 0;
            const cls = change >= 0 ? 'positive' : 'negative';
            return `
                <div class="market-card" onclick="window.location.href='coin.html?id=${c.id}'" style="cursor:pointer">
                    <div class="name">
                        <img src="${c.image}" alt="" width="24" height="24" style="border-radius:50%">
                        ${c.symbol.toUpperCase()}
                    </div>
                    <div class="price">${formatPrice(c.current_price)}</div>
                    <div class="change ${cls}">${formatChange(change)}</div>
                </div>
            `;
        }).join('');
    } catch (e) {
        console.error(e);
    }
}

// Global istatistikler
async function loadGlobal() {
    try {
        const res = await fetch(`${COINGECKO}/global`);
        const g = await res.json().then(d => d.data);

        const stats = document.getElementById('globalStats');
        stats.innerHTML = `
            <div><strong>Toplam Piyasa Değeri</strong><br>$${(g.total_market_cap.usd / 1e12).toFixed(2)}T</div>
            <div><strong>24s Hacim</strong><br>$${(g.total_volume.usd / 1e9).toFixed(1)}B</div>
            <div><strong>BTC Dominance</strong><br>${g.market_cap_percentage.btc.toFixed(1)}%</div>
            <div><strong>Aktif Coin</strong><br>${g.active_cryptocurrencies.toLocaleString()}</div>
        `;
    } catch (e) {
        console.error(e);
    }
}

// Gerçek haberler
async function loadNews() {
    try {
        const res = await fetch('https://cryptocurrency.cv/api/news?limit=8');
        const data = await res.json();
        const articles = data.articles || [];

        const grid = document.getElementById('newsGrid');
        if (articles.length === 0) {
            grid.innerHTML = '<p style="color:var(--text-muted)">Şu anda haber yüklenemedi.</p>';
            return;
        }

        grid.innerHTML = articles.map(a => {
            const date = new Date(a.pubDate).toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
            return `
                <article class="news-card">
                    <div class="news-tag">${a.source || 'Haber'}</div>
                    <h3><a href="${a.link}" target="_blank" style="color:inherit; text-decoration:none">${a.title}</a></h3>
                    <p>${a.description ? a.description.substring(0, 120) + '...' : ''}</p>
                    <span class="news-date">${date}</span>
                </article>
            `;
        }).join('');
    } catch (e) {
        console.error('News error:', e);
        document.getElementById('newsGrid').innerHTML = '<p style="color:var(--text-muted)">Haberler yüklenirken hata oluştu.</p>';
    }
}
async function loadChart() {
    try {
        const res = await fetch(`${COINGECKO}/coins/bitcoin/market_chart?vs_currency=usd&days=7&interval=daily`);
        const data = await res.json();
        const prices = data.prices.map(p => p[1]);
        const labels = data.prices.map(p => {
            const d = new Date(p[0]);
            return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
        });

        const ctx = document.getElementById('btcChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'BTC / USD',
                    data: prices,
                    borderColor: '#00e7a0',
                    backgroundColor: 'rgba(0, 231, 160, 0.1)',
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1a1d28',
                        titleColor: '#fff',
                        bodyColor: '#e8eaed',
                        borderColor: '#252836',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255,255,255,0.04)' },
                        ticks: { color: '#8b92a5' }
                    },
                    y: {
                        grid: { color: 'rgba(255,255,255,0.04)' },
                        ticks: { 
                            color: '#8b92a5',
                            callback: v => '$' + v.toLocaleString()
                        }
                    }
                }
            }
        });
    } catch (e) {
        console.error('Chart error:', e);
    }
}

// Hepsini yükle
async function init() {
    await Promise.all([
        loadHeroStats(),
        loadMarket(),
        loadGlobal(),
        loadChart(),
        loadNews()
    ]);
}

init();

// 60 saniyede bir fiyatları yenile
setInterval(() => {
    loadHeroStats();
    loadMarket();
}, 60000);