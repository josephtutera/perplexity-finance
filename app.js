// Sample stock data (in a real app, this would come from an API)
let watchlist = [
    {
        symbol: 'S&P 500',
        name: 'Standard & Poor\'s 500',
        price: 6071.17,
        change: 32.12,
        changePercentage: 0.53
    },
    {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        price: 237.59,
        change: -1.77,
        changePercentage: -0.74
    },
    {
        symbol: 'CRWD',
        name: 'CrowdStrike Holdings, Inc.',
        price: 396.87,
        change: -0.20,
        changePercentage: -0.05
    }
];

let updateInterval = null;

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const watchlistContainer = document.getElementById('watchlist');
    const searchInput = document.getElementById('searchInput');
    const addButton = document.getElementById('addButton');
    const perplexityView = document.getElementById('perplexityView');

    if (!watchlistContainer || !searchInput || !addButton) {
        console.error('Required DOM elements not found');
        return;
    }

    // Function to safely load URL in webview
    function loadPerplexityURL(symbol) {
        if (!perplexityView) return;
        
        try {
            const url = `https://www.perplexity.ai/finance/${encodeURIComponent(symbol)}`;
            perplexityView.setAttribute('src', url);
        } catch (error) {
            console.error('Error loading URL:', error);
        }
    }

    // Function to format numbers with commas
    function formatNumber(number) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(number);
    }

    // Function to create a stock item element
    function createStockItem(stock) {
        const div = document.createElement('div');
        div.className = 'stock-item';
        div.innerHTML = `
            <div class="stock-item-header">
                <span class="stock-symbol">${stock.symbol}</span>
                <span class="stock-price">$${formatNumber(stock.price)}</span>
            </div>
            <div class="stock-item-details">
                <span class="stock-name">${stock.name}</span>
                <span class="stock-change ${stock.changePercentage >= 0 ? 'positive' : 'negative'}">
                    ${stock.changePercentage >= 0 ? '+' : ''}${stock.changePercentage.toFixed(2)}%
                </span>
            </div>
        `;

        // Add click handler to load Perplexity Finance in webview
        div.addEventListener('click', () => {
            document.querySelectorAll('.stock-item').forEach(item => {
                item.classList.remove('selected');
            });
            
            div.classList.add('selected');
            loadPerplexityURL(stock.symbol);
        });

        return div;
    }

    // Function to render the watchlist
    function renderWatchlist() {
        if (!watchlistContainer) return;
        
        watchlistContainer.innerHTML = '';
        watchlist.forEach(stock => {
            watchlistContainer.appendChild(createStockItem(stock));
        });
    }

    // Function to add a new stock
    function addStock() {
        const symbol = searchInput.value.trim().toUpperCase();
        if (symbol && !watchlist.some(stock => stock.symbol === symbol)) {
            const newStock = {
                symbol: symbol,
                name: symbol,
                price: 0.00,
                change: 0.00,
                changePercentage: 0.00
            };
            watchlist.push(newStock);
            renderWatchlist();
            searchInput.value = '';
        }
    }

    // Event listeners
    addButton.addEventListener('click', addStock);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addStock();
        }
    });

    // Set up webview event listeners
    if (perplexityView) {
        perplexityView.addEventListener('dom-ready', () => {
            console.log('Webview DOM Ready');
        });

        perplexityView.addEventListener('did-fail-load', (event) => {
            console.error('Failed to load:', event);
        });

        perplexityView.addEventListener('did-finish-load', () => {
            console.log('Finished loading');
        });
    }

    // Initial render
    renderWatchlist();

    // Select first stock by default
    if (watchlist.length > 0) {
        const firstStock = watchlist[0];
        document.querySelector('.stock-item')?.classList.add('selected');
        // Delay initial load slightly to ensure webview is ready
        setTimeout(() => {
            loadPerplexityURL(firstStock.symbol);
        }, 1000);
    }

    // Optional: Add periodic updates (in a real app, this would use WebSocket or polling)
    updateInterval = setInterval(() => {
        watchlist.forEach(stock => {
            // Simulate price changes
            const change = (Math.random() - 0.5) * 2;
            stock.price += change;
            stock.change = change;
            stock.changePercentage = (change / stock.price) * 100;
        });
        renderWatchlist();
    }, 5000);
});

// Clean up interval when window is closed
window.addEventListener('beforeunload', () => {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
}); 