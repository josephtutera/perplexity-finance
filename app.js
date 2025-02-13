// Watchlist management
let watchlists = [];
let activeWatchlistId = null;

// Load watchlists from localStorage
function loadWatchlists() {
    const savedWatchlists = localStorage.getItem('watchlists');
    if (savedWatchlists) {
        watchlists = JSON.parse(savedWatchlists);
        activeWatchlistId = watchlists[0]?.id || null;
    } else {
        // Create default watchlist
        const defaultWatchlist = {
            id: 'default',
            name: 'Default',
            symbols: [
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
            ]
        };
        watchlists = [defaultWatchlist];
        activeWatchlistId = defaultWatchlist.id;
        saveWatchlists();
    }
}

// Save watchlists to localStorage
function saveWatchlists() {
    localStorage.setItem('watchlists', JSON.stringify(watchlists));
}

// Get active watchlist
function getActiveWatchlist() {
    return watchlists.find(w => w.id === activeWatchlistId) || watchlists[0];
}

// Function to format numbers with commas
function formatNumber(number) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(number);
}

// Function to safely load URL in webview
function loadPerplexityURL(symbol) {
    const perplexityView = document.getElementById('perplexityView');
    if (!perplexityView) return;
    
    try {
        const url = `https://www.perplexity.ai/finance/${encodeURIComponent(symbol)}`;
        // Check if the webview is already navigating to prevent unnecessary reloads
        if (perplexityView.getAttribute('src') !== url) {
            perplexityView.setAttribute('src', url);
        }
    } catch (error) {
        console.error('Error loading URL:', error);
    }
}

// Function to create a stock item element
function createStockItem(stock) {
    const div = document.createElement('div');
    div.className = 'stock-item';
    div.innerHTML = `
        <div class="stock-item-header">
            <span class="stock-symbol">${stock.symbol}</span>
            <div class="stock-header-right">
                <span class="stock-price">$${formatNumber(stock.price)}</span>
                <button class="remove-button" title="Remove ${stock.symbol}">×</button>
            </div>
        </div>
        <div class="stock-item-details">
            <span class="stock-name">${stock.name}</span>
            <span class="stock-change ${stock.changePercentage >= 0 ? 'positive' : 'negative'}">
                ${stock.changePercentage >= 0 ? '+' : ''}${stock.changePercentage.toFixed(2)}%
            </span>
        </div>
        <div class="stock-price-details">
            <div class="price-summary">
                <span class="label">Open:</span>
                <span class="value">$${formatNumber(stock.open)}</span>
                <span class="separator">|</span>
                <span class="label">High:</span>
                <span class="value">$${formatNumber(stock.high)}</span>
                <span class="separator">|</span>
                <span class="label">Low:</span>
                <span class="value">$${formatNumber(stock.low)}</span>
            </div>
        </div>
    `;

    // Add click handler to load Perplexity Finance in webview
    div.addEventListener('click', (e) => {
        // Don't trigger if clicking the remove button
        if (!e.target.classList.contains('remove-button')) {
            document.querySelectorAll('.stock-item').forEach(item => {
                item.classList.remove('selected');
            });
            
            div.classList.add('selected');
            loadPerplexityURL(stock.symbol);
        }
    });

    // Add remove button handler
    const removeButton = div.querySelector('.remove-button');
    removeButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent the click from triggering the stock item click
        const index = getActiveWatchlist().symbols.findIndex(item => item.symbol === stock.symbol);
        if (index !== -1) {
            getActiveWatchlist().symbols.splice(index, 1);
            saveWatchlists();
            renderWatchlist();
        }
    });

    return div;
}

// Function to render the watchlist
function renderWatchlist() {
    const watchlistContainer = document.getElementById('watchlist');
    if (!watchlistContainer) return;
    
    const activeWatchlist = getActiveWatchlist();
    watchlistContainer.innerHTML = '';
    activeWatchlist.symbols.forEach(stock => {
        watchlistContainer.appendChild(createStockItem(stock));
    });
}

// Function to show create watchlist dialog
function showCreateWatchlistDialog() {
    const dialog = document.createElement('div');
    dialog.className = 'watchlist-dialog';
    dialog.innerHTML = `
        <div class="dialog-content">
            <h3>Create New Watchlist</h3>
            <input type="text" id="watchlistNameInput" placeholder="Enter watchlist name" class="dialog-input">
            <div class="dialog-buttons">
                <button id="createWatchlistBtn" class="dialog-button">Create</button>
                <button id="cancelWatchlistBtn" class="dialog-button">Cancel</button>
            </div>
        </div>
    `;

    // Add event listeners
    dialog.querySelector('#createWatchlistBtn').addEventListener('click', () => {
        const nameInput = dialog.querySelector('#watchlistNameInput');
        const name = nameInput.value.trim();
        if (name) {
            createWatchlist(name);
            document.body.removeChild(dialog);
        }
    });

    dialog.querySelector('#cancelWatchlistBtn').addEventListener('click', () => {
        document.body.removeChild(dialog);
    });

    dialog.querySelector('#watchlistNameInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const name = e.target.value.trim();
            if (name) {
                createWatchlist(name);
                document.body.removeChild(dialog);
            }
        }
    });

    document.body.appendChild(dialog);
    dialog.querySelector('#watchlistNameInput').focus();
}

// Function to render watchlist tabs
function renderWatchlistTabs() {
    const watchlistTabsContainer = document.querySelector('.watchlist-tabs');
    if (!watchlistTabsContainer) return;
    
    watchlistTabsContainer.innerHTML = '';
    watchlists.forEach(watchlist => {
        const tab = document.createElement('div');
        tab.className = `watchlist-tab ${watchlist.id === activeWatchlistId ? 'active' : ''}`;
        tab.innerHTML = `
            <span class="tab-name">${watchlist.name}</span>
            <span class="symbol-count">${watchlist.symbols.length}</span>
        `;
        tab.addEventListener('click', () => {
            activeWatchlistId = watchlist.id;
            renderWatchlistTabs();
            renderWatchlist();
        });
        watchlistTabsContainer.appendChild(tab);
    });
    
    // Re-append the add watchlist button
    const addWatchlistButton = document.createElement('button');
    addWatchlistButton.className = 'add-watchlist-button';
    addWatchlistButton.innerHTML = '+';
    addWatchlistButton.title = 'Create new watchlist';
    addWatchlistButton.addEventListener('click', () => {
        showCreateWatchlistDialog();
    });
    watchlistTabsContainer.appendChild(addWatchlistButton);
}

// Create new watchlist
function createWatchlist(name) {
    const newWatchlist = {
        id: Date.now().toString(),
        name: name,
        symbols: []
    };
    watchlists.push(newWatchlist);
    saveWatchlists();
    renderWatchlistTabs();
    return newWatchlist;
}

// Add symbol to watchlist
function addSymbolToWatchlist(symbol, watchlistId) {
    const watchlist = watchlists.find(w => w.id === watchlistId);
    if (!watchlist) return false;

    if (watchlist.symbols.some(s => s.symbol === symbol)) return false;

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

    watchlist.symbols.push(newStock);
    saveWatchlists();
    return true;
}

// Remove symbol from watchlist
function removeSymbolFromWatchlist(symbol, watchlistId) {
    const watchlist = watchlists.find(w => w.id === watchlistId);
    if (!watchlist) return false;

    const index = watchlist.symbols.findIndex(s => s.symbol === symbol);
    if (index === -1) return false;

    watchlist.symbols.splice(index, 1);
    saveWatchlists();
    return true;
}

let updateInterval = null;

// Function to format timestamp
function formatLastUpdated(timestamp) {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = (hours % 12) || 12;
    
    return `Updated at ${hours12}:${minutes}:${seconds} ${ampm}`;
}

// Function to format symbol for Finnhub
function formatSymbolForFinnhub(symbol) {
    // For US stocks, we need to prefix with 'BINANCE:' for crypto or nothing for stocks
    return symbol.includes('BTC') ? `BINANCE:${symbol}` : symbol;
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Load saved watchlists
    loadWatchlists();
    
    // DOM Elements
    const watchlistContainer = document.getElementById('watchlist');
    const searchInput = document.getElementById('searchInput');
    const addButton = document.getElementById('addButton');
    const perplexityView = document.getElementById('perplexityView');
    
    // Initialize webview with first stock if available
    if (perplexityView) {
        const activeWatchlist = getActiveWatchlist();
        if (activeWatchlist.symbols.length > 0) {
            const firstStock = activeWatchlist.symbols[0];
            loadPerplexityURL(firstStock.symbol);
            
            // Set up webview event listeners
            perplexityView.addEventListener('dom-ready', () => {
                console.log('Webview DOM Ready');
                // Add class to mark the first stock as selected
                const firstStockElement = document.querySelector('.stock-item');
                if (firstStockElement) {
                    firstStockElement.classList.add('selected');
                }
            });

            perplexityView.addEventListener('did-fail-load', (event) => {
                console.error('Failed to load:', event);
            });

            perplexityView.addEventListener('did-finish-load', () => {
                console.log('Finished loading');
            });
        }
    }

    // Add last updated span to header
    const lastUpdatedSpan = document.createElement('span');
    lastUpdatedSpan.className = 'header-last-updated';
    lastUpdatedSpan.textContent = 'Just now';
    
    // Update watchlist header structure
    const watchlistHeader = document.querySelector('.watchlist-header');
    watchlistHeader.innerHTML = `
        <div class="watchlist-header-row">
            <h2>My Symbols</h2>
            <span class="header-last-updated">Just now</span>
        </div>
    `;
    
    // Create watchlist tabs container
    const watchlistTabsContainer = document.createElement('div');
    watchlistTabsContainer.className = 'watchlist-tabs';
    document.querySelector('.watchlist-sidebar').insertBefore(watchlistTabsContainer, document.querySelector('.watchlist-header'));

    // Initial render of watchlist tabs
    renderWatchlistTabs();

    // Function to show watchlist selection dialog
    function showWatchlistSelectionDialog(symbol) {
        const dialog = document.createElement('div');
        dialog.className = 'watchlist-dialog';
        
        function renderDialogContent(isDeleteMode = false) {
            dialog.innerHTML = `
                <div class="dialog-content">
                    <div class="dialog-header">
                        <h3>${isDeleteMode ? 'Delete Watchlist' : `Add ${symbol} to watchlist:`}</h3>
                        <span class="dialog-mode-text">${isDeleteMode ? 'Release Alt/Option to cancel' : 'Hold Alt/Option to delete watchlists'}</span>
                    </div>
                    <div class="watchlist-options">
                        ${watchlists.map(w => `
                            <div class="watchlist-option ${isDeleteMode ? 'delete-mode' : ''}" data-id="${w.id}">
                                <span>${w.name}</span>
                                ${isDeleteMode ? 
                                    '<span class="delete-mode-text">Click to Delete</span>' : 
                                    `<span class="symbol-count">${w.symbols.length}</span>`
                                }
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Initial render
        renderDialogContent();

        // Handle Alt/Option key
        function handleKeyChange(e) {
            if (e.altKey) {
                renderDialogContent(true);
            } else {
                renderDialogContent(false);
            }
        }

        document.addEventListener('keydown', handleKeyChange);
        document.addEventListener('keyup', handleKeyChange);

        // Handle clicks
        dialog.addEventListener('click', (e) => {
            const option = e.target.closest('.watchlist-option');
            if (option) {
                const watchlistId = option.dataset.id;
                const isDeleteMode = e.altKey;

                if (isDeleteMode) {
                    // Don't delete if it's the last watchlist
                    if (watchlists.length <= 1) {
                        return;
                    }
                    
                    // Delete watchlist
                    const index = watchlists.findIndex(w => w.id === watchlistId);
                    if (index !== -1) {
                        watchlists.splice(index, 1);
                        // If we deleted the active watchlist, switch to the first available one
                        if (watchlistId === activeWatchlistId) {
                            activeWatchlistId = watchlists[0].id;
                        }
                        saveWatchlists();
                        renderWatchlistTabs();
                        renderWatchlist();
                    }
                } else {
                    // Add symbol to watchlist
                    if (addSymbolToWatchlist(symbol, watchlistId)) {
                        updateStockData(getActiveWatchlist().symbols.find(s => s.symbol === symbol)).then(() => {
                            renderWatchlist();
                        });
                    }
                }
                document.body.removeChild(dialog);
            }
        });

        // Cleanup event listeners when dialog is closed
        function cleanup() {
            document.removeEventListener('keydown', handleKeyChange);
            document.removeEventListener('keyup', handleKeyChange);
        }

        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                document.body.removeChild(dialog);
                cleanup();
            }
        });

        document.body.appendChild(dialog);
    }

    // Modify addStock function
    function addStock() {
        const symbol = searchInput.value.trim().toUpperCase();
        if (symbol) {
            showWatchlistSelectionDialog(symbol);
            searchInput.value = '';
        }
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
            
            // Save after updating stock data
            saveWatchlists();
        } catch (error) {
            console.error('Error updating stock data:', error);
        }
    }

    // Function to update all stocks
    async function updateAllStocks() {
        console.log('Updating all stocks...');
        const activeWatchlist = getActiveWatchlist();
        for (const stock of activeWatchlist.symbols) {
            await updateStockData(stock);
        }
        saveWatchlists(); // Save after all updates are complete
        renderWatchlist();
        updateHeaderTimestamp();
    }

    // Function to update header timestamp
    function updateHeaderTimestamp() {
        const activeWatchlist = getActiveWatchlist();
        const lastUpdatedSpan = document.querySelector('.header-last-updated');
        if (!lastUpdatedSpan) return;
        
        if (activeWatchlist.symbols.length > 0) {
            const mostRecentUpdate = Math.max(...activeWatchlist.symbols.map(stock => stock.lastUpdated || 0));
            if (mostRecentUpdate) {
                lastUpdatedSpan.textContent = formatLastUpdated(mostRecentUpdate);
            }
        } else {
            lastUpdatedSpan.textContent = 'No symbols';
        }
    }

    // Event listeners
    addButton.addEventListener('click', addStock);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addStock();
        }
    });

    // Initial render
    renderWatchlist();
    updateAllStocks();

    // Update stocks every 30 seconds instead of 15
    updateInterval = setInterval(() => {
        updateAllStocks();
    }, 30000);

    // Update timestamps every minute
    setInterval(updateHeaderTimestamp, 60000);

    // Clean up when the window is closed
    window.addEventListener('beforeunload', () => {
        if (updateInterval) {
            clearInterval(updateInterval);
        }
        saveWatchlists(); // Save one final time before closing
    });
}); 