// Theme management
const themeManager = {
    init() {
        this.applySystemTheme();
        this.setupSystemThemeListener();
        
        // Listen for theme changes from main process
        window.api.receive('apply-theme', (theme) => {
            this.applyTheme(theme);
        });

        // Ensure webview theme is synced after it loads
        const webview = document.getElementById('perplexityView');
        if (webview) {
            webview.addEventListener('dom-ready', () => {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                window.api.send('theme-change', systemTheme);
            });
        }
    },

    applySystemTheme() {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        this.setTheme(systemTheme);
    },

    setupSystemThemeListener() {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            this.setTheme(e.matches ? 'dark' : 'light');
        });
    },

    setTheme(theme) {
        this.applyTheme(theme);
        // Send theme change to main process
        window.api.send('theme-change', theme);
    },

    applyTheme(theme) {
        const isDark = theme === 'dark';
        document.body.classList.toggle('dark-mode', isDark);
    }
};

// Export for use in other files
window.themeManager = themeManager; 