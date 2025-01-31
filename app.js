// Sample stock data (in a real app, this would come from an API)
let watchlist = [
    {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        price: 0.00,
        change: 0.00,
        changePercentage: 0.00,
        high: 0.00,
        low: 0.00,
        open: 0.00,
        lastUpdated: null
    },
    {
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        price: 0.00,
        change: 0.00,
        changePercentage: 0.00,
        high: 0.00,
        low: 0.00,
        open: 0.00,
        lastUpdated: null
    }
];

let updateInterval = null;

// Function to format timestamp
function formatLastUpdated(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) { // less than 1 minute
        return 'Just now';
    } else if (diff < 3600000) { // less than 1 hour
        const minutes = Math.floor(diff / 60000);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
        const hours = Math.floor(diff / 3600000);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
}

// Function to format symbol for Finnhub
function formatSymbolForFinnhub(symbol) {
    // For US stocks, we need to prefix with 'BINANCE:' for crypto or nothing for stocks
    return symbol.includes('BTC') ? `BINANCE:${symbol}` : symbol;
}

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
            <div class="stock-price-details">
                <div class="price-row">
                    <span class="label">High:</span>
                    <span class="value">$${formatNumber(stock.high)}</span>
                </div>
                <div class="price-row">
                    <span class="label">Low:</span>
                    <span class="value">$${formatNumber(stock.low)}</span>
                </div>
                <div class="price-row">
                    <span class="label">Open:</span>
                    <span class="value">$${formatNumber(stock.open)}</span>
                </div>
            </div>
            <div class="last-updated">
                ${stock.lastUpdated ? formatLastUpdated(stock.lastUpdated) : 'Waiting for data...'}
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

    // Function to update last updated timestamps
    function updateTimestamps() {
        document.querySelectorAll('.last-updated').forEach((element, index) => {
            if (watchlist[index] && watchlist[index].lastUpdated) {
                element.textContent = formatLastUpdated(watchlist[index].lastUpdated);
            }
        });
    }

    // Function to update stock data
    async function updateStockData(stock) {
        try {
            console.log('Fetching quote for:', stock.symbol);
            const quote = await window.finnhub.getQuote(stock.symbol);
            console.log('Received quote:', quote);

            stock.price = quote.c;
            stock.change = quote.c - quote.pc;
            stock.changePercentage = (stock.change / quote.pc) * 100;
            stock.high = quote.h;
            stock.low = quote.l;
            stock.open = quote.o;
            stock.lastUpdated = Date.now();
        } catch (error) {
            console.error('Error updating stock data:', error);
        }
    }

    // Function to update all stocks
    async function updateAllStocks() {
        console.log('Updating all stocks...');
        for (const stock of watchlist) {
            await updateStockData(stock);
        }
        renderWatchlist();
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
                changePercentage: 0.00,
                high: 0.00,
                low: 0.00,
                open: 0.00,
                lastUpdated: null
            };
            watchlist.push(newStock);
            updateStockData(newStock).then(() => {
                renderWatchlist();
            });
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

    // Initial render and data fetch
    renderWatchlist();
    updateAllStocks();

    // Update stocks every 15 seconds
    updateInterval = setInterval(() => {
        updateAllStocks();
    }, 15000);

    // Update timestamps every minute
    setInterval(updateTimestamps, 60000);

    // Clean up when the window is closed
    window.addEventListener('beforeunload', () => {
        if (updateInterval) {
            clearInterval(updateInterval);
        }
    });
}); 