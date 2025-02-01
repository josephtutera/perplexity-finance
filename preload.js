const { contextBridge, webFrame } = require('electron')

// Hardcoded API key
const FINNHUB_API_KEY = 'cue3j69r01qiosq1h4bgcue3j69r01qiosq1h4c0';

// Function to remove sidebar
const removeSidebar = () => {
    console.log('Starting sidebar removal process');

    // Insert CSS to hide content during load
    webFrame.insertCSS(`
        html.loading * {
            visibility: hidden !important;
        }
        html.loading::before {
            visibility: visible !important;
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: var(--background-dark, #fff);
        }
    `);

    // Add loading class immediately
    document.documentElement.classList.add('loading');

    // Function to remove sidebar and show content
    const removeAndShow = () => {
        try {
            const sidebar = document.querySelector('div.hidden.md\\:block');
            if (sidebar) {
                console.log('Found and removing sidebar');
                sidebar.remove();
            }
            
            // Remove loading class to show content
            document.documentElement.classList.remove('loading');
            console.log('Content made visible');
        } catch (error) {
            console.error('Error in removeAndShow:', error);
        }
    };

    // Execute as soon as DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', removeAndShow);
    } else {
        removeAndShow();
    }

    // Backup removal attempts
    setTimeout(removeAndShow, 0);
    setTimeout(removeAndShow, 100);
};

// Wait for document to be available
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeSidebar);
} else {
    removeSidebar();
}

// Expose necessary APIs
contextBridge.exposeInMainWorld('env', {
    FINNHUB_API_KEY: FINNHUB_API_KEY
})

contextBridge.exposeInMainWorld('finnhub', {
    getQuote: async (symbol) => {
        try {
            const response = await fetch(
                `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching quote:', error);
            throw error;
        }
    }
}) 