const { ipcRenderer } = require('electron');

// Listen for theme changes from the main window
ipcRenderer.on('apply-theme', (event, theme) => {
    // Inject script to handle theme changes
    const script = document.createElement('script');
    script.textContent = `
        (function() {
            // Function to update theme
            function updateTheme() {
                // Update document properties
                document.documentElement.style.setProperty('color-scheme', '${theme}');
                document.documentElement.setAttribute('data-theme', '${theme}');
                document.documentElement.classList.remove('light', 'dark');
                document.documentElement.classList.add('${theme}');
                
                // Try to find and update Perplexity's theme state
                const root = document.querySelector('#__next');
                if (root && root._reactRootContainer) {
                    const event = new CustomEvent('themeChange', { detail: { theme: '${theme}' } });
                    window.dispatchEvent(event);
                }
            }
            
            // Update immediately and after a delay
            updateTheme();
            setTimeout(updateTheme, 1000);
            
            // Also update when the page fully loads
            if (document.readyState !== 'complete') {
                window.addEventListener('load', updateTheme);
            }
            
            // Dispatch events to notify theme listeners
            window.dispatchEvent(new Event('themechange'));
        })();
    `;
    
    // Remove any existing injected script
    const existingScript = document.getElementById('theme-handler');
    if (existingScript) {
        existingScript.remove();
    }
    
    // Add the new script
    script.id = 'theme-handler';
    (document.head || document.documentElement).appendChild(script);
    
    // Update meta tag
    let meta = document.querySelector('meta[name="color-scheme"]');
    if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'color-scheme';
        document.head.appendChild(meta);
    }
    meta.content = theme;
}); 