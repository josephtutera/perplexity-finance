const { contextBridge } = require('electron')

// Hardcoded API key
const FINNHUB_API_KEY = 'cue3j69r01qiosq1h4bgcue3j69r01qiosq1h4c0';

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