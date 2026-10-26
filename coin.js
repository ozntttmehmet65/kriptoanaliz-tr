const COINGECKO = 'https://api.coingecko.com/api/v3';

document.getElementById('menuToggle').addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('active');
});

function getCoinId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || 'bitcoin';
}

function formatPrice(num) {
    if (!num) return '-';
    if (num >= 1000) return '$' + num.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (num >= 1) return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return '$' + num.toFixed(6);
}

function formatChange(change) {
    if (change == null) return '-';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
}

// Basit RSI hesaplama (14 periyot)
function calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return null;
    let gains = 0, losses = 0;
    for (let i = 1; i <= period; i++) {
        const diff = prices[i] - prices[i - 1];
        if (diff >= 0) gains += diff;
        else losses -= diff;
    }
    let avgGain = gains / period;
    let avgLoss = losses / period;
    for (let i = period + 1; i < prices.length; i++) {
        const diff = prices[i] - prices[i - 1];
        const gain = diff > 0 ? diff : 0;
        const loss = diff < 0 ? -diff : 0;
        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;
    }
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

async function loadCoin() {
    const id = getCoinId();
    try {
        const [coinRes, chartRes] = await Promise.all([
            fetch(`${COINGECKO}/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`),
            fetch(`${COINGECKO}/coins/${id}/market_chart?vs_currency=usd&days=30&interval=daily`)
        ]);

        const coin = await coinRes.json();
        const chartData = await chartRes.json();

        // Header
        document.getElementById('coinHeader').innerHTML = `
            <div style="display:flex; align-items:center; gap:1rem; flex-wrap:wrap">
                <img src="${coin.image.large}" width="64" height="64" style="border-radius:50%">
                <div>
                    <h1 style="margin:0">${coin.name} <span style="color:var(--text-muted); font-weight:500">${coin.symbol.toUpperCase()}</span></h1>
                    <div style="font-size:1.8rem; font-family:'JetBrains Mono'; font-weight:700; margin-top:0.3rem">${formatPrice(coin.market_data.current_price.usd)}</div>
                    <div class="change ${coin.market_data.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">${formatChange(coin.market_data.price_change_percentage_24h)} (24s)</div>
                </div>
            </div>
        `;

        // Stats
        const md = coin.market_data;
        document.getElementById('coinStats').innerHTML = `
            <div><strong>Market Cap</strong><br>${formatPrice(md.market_cap.usd)}</div>
            <div><strong>24s Hacim</strong><br>${formatPrice(md.total_volume.usd)}</div>
            <div><strong>ATH</strong><br>${formatPrice(md.ath.usd)}</div>
            <div><strong>ATL</strong><br>${formatPrice(md.atl.usd)}</div>
            <div><strong>7g Değişim</strong><br><span class="${md.price_change_percentage_7d >= 0 ? 'positive' : 'negative'}">${formatChange(md.price_change_percentage_7d)}</span></div>
            <div><strong>30g Değişim</strong><br><span class="${md.price_change_percentage_30d >= 0 ? 'positive' : 'negative'}">${formatChange(md.price_change_percentage_30d)}</span></div>
        `;

        // Chart
        const prices = chartData.prices.map(p => p[1]);
        const labels = chartData.prices.map(p => new Date(p[0]).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }));

        const ctx = document.getElementById('coinChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: `${coin.symbol.toUpperCase()} / USD`,
                    data: prices,
                    borderColor: '#00e7a0',
                    backgroundColor: 'rgba(0, 231, 160, 0.08)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8b92a5', maxTicksLimit: 8 } },
                    y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8b92a5', callback: v => '$' + v.toLocaleString() } }
                }
            }
        });

        // Extra analysis - RSI
        const rsi = calculateRSI(prices);
        let rsiSignal = 'Nötr';
        let rsiClass = 'neutral';
        if (rsi !== null) {
            if (rsi > 70) { rsiSignal = 'Aşırı Alım'; rsiClass = 'short'; }
            else if (rsi < 30) { rsiSignal = 'Aşırı Satım'; rsiClass = 'long'; }
        }

        document.getElementById('analysisExtra').innerHTML = `
            <div class="analysis-card" style="max-width:500px">
                <h3>Teknik Gösterge (RSI 14)</h3>
                <p style="font-size:2rem; font-weight:700; font-family:'JetBrains Mono'">${rsi ? rsi.toFixed(1) : 'N/A'}</p>
                <div class="signal ${rsiClass}">${rsiSignal}</div>
                <p style="margin-top:1rem; color:var(--text-muted); font-size:0.9rem">Son 30 günlük kapanış fiyatlarından hesaplanmıştır. Yatırım tavsiyesi değildir.</p>
            </div>
        `;

        document.title = `${coin.name} | KriptoAnaliz TR`;
    } catch (e) {
        console.error(e);
        document.getElementById('coinHeader').innerHTML = '<p>Coin verisi yüklenemedi. Lütfen ana sayfadan tekrar deneyin.</p>';
    }
}

loadCoin();