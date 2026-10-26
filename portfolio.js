const COINGECKO = 'https://api.coingecko.com/api/v3';
const STORAGE_KEY = 'kriptoanaliz_portfolio';

document.getElementById('menuToggle').addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('active');
});

function getPortfolio() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function savePortfolio(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function formatPrice(num) {
    if (!num) return '-';
    if (num >= 1000) return '$' + num.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (num >= 1) return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return '$' + num.toFixed(4);
}

async function renderPortfolio() {
    const portfolio = getPortfolio();
    const listEl = document.getElementById('portfolioList');
    const summaryEl = document.getElementById('portfolioSummary');

    if (portfolio.length === 0) {
        listEl.innerHTML = '<p style="color:var(--text-muted)">Henüz coin eklenmedi.</p>';
        summaryEl.innerHTML = '';
        return;
    }

    try {
        const ids = portfolio.map(p => p.id).join(',');
        const res = await fetch(`${COINGECKO}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
        const prices = await res.json();

        let total = 0;
        listEl.innerHTML = portfolio.map((item, index) => {
            const priceData = prices[item.id];
            const price = priceData ? priceData.usd : 0;
            const value = price * item.amount;
            total += value;
            const change = priceData ? priceData.usd_24h_change || 0 : 0;
            const cls = change >= 0 ? 'positive' : 'negative';

            return `
                <div class="market-card" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.8rem">
                    <div>
                        <strong>${item.id.toUpperCase()}</strong> × ${item.amount}
                        <div style="font-size:0.9rem; color:var(--text-muted)">${formatPrice(price)} <span class="change ${cls}">${change >= 0 ? '+' : ''}${change.toFixed(2)}%</span></div>
                    </div>
                    <div style="text-align:right">
                        <div style="font-weight:700; font-family:'JetBrains Mono'">${formatPrice(value)}</div>
                        <button onclick="removeItem(${index})" style="margin-top:0.4rem; background:transparent; border:1px solid var(--red); color:var(--red); padding:0.2rem 0.6rem; border-radius:6px; cursor:pointer; font-size:0.8rem">Sil</button>
                    </div>
                </div>
            `;
        }).join('');

        summaryEl.innerHTML = `
            <div><strong>Toplam Portföy Değeri</strong><br><span style="font-size:1.5rem; font-weight:700">${formatPrice(total)}</span></div>
            <div><strong>Coin Sayısı</strong><br>${portfolio.length}</div>
        `;
    } catch (e) {
        console.error(e);
        listEl.innerHTML = '<p>Fiyatlar yüklenirken hata oluştu.</p>';
    }
}

function removeItem(index) {
    const portfolio = getPortfolio();
    portfolio.splice(index, 1);
    savePortfolio(portfolio);
    renderPortfolio();
}

document.getElementById('addBtn').addEventListener('click', () => {
    const id = document.getElementById('coinInput').value.trim().toLowerCase();
    const amount = parseFloat(document.getElementById('amountInput').value);

    if (!id || isNaN(amount) || amount <= 0) {
        alert('Geçerli bir coin ID ve miktar girin.');
        return;
    }

    const portfolio = getPortfolio();
    const existing = portfolio.find(p => p.id === id);
    if (existing) {
        existing.amount += amount;
    } else {
        portfolio.push({ id, amount });
    }
    savePortfolio(portfolio);

    document.getElementById('coinInput').value = '';
    document.getElementById('amountInput').value = '';
    renderPortfolio();
});

// Make removeItem global for onclick
window.removeItem = removeItem;

renderPortfolio();

// Yenile butonu gibi her 60s'de bir
setInterval(renderPortfolio, 60000);