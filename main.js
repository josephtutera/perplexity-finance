const { app, BrowserWindow, session } = require('electron')
const path = require('path')
require('dotenv').config()

// Suppress security warnings
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

let mainWindow = null

function createWindow () {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: 'Perplexity Finance',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webviewTag: true,
            webSecurity: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    // Configure session
    const webviewSession = session.fromPartition('persist:perplexity')
    
    // Set persistent permissions
    webviewSession.setPermissionRequestHandler((webContents, permission, callback) => {
        callback(true)
    })

    // Configure headers and cookies
    webviewSession.webRequest.onBeforeSendHeaders((details, callback) => {
        callback({
            requestHeaders: {
                ...details.requestHeaders,
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Upgrade-Insecure-Requests': '1'
            }
        })
    })

    // Configure CSP and other response headers
    webviewSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': ["default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; connect-src *; worker-src blob: 'self'; img-src * data: blob:"]
            }
        })
    })

    // Enable cookies
    webviewSession.cookies.set({
        url: 'https://www.perplexity.ai',
        name: 'session_persist',
        value: 'true',
        domain: '.perplexity.ai',
        path: '/'
    }).catch(console.error)

    mainWindow.loadFile('index.html')

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

// Enable required switches
app.commandLine.appendSwitch('ignore-certificate-errors')
app.commandLine.appendSwitch('disable-site-isolation-trials')

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// Handle any uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error)
}) 