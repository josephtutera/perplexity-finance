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
    const webviewSession = session.fromPartition('persist:main')
    webviewSession.setPermissionRequestHandler((webContents, permission, callback) => {
        callback(true)
    })

    // Configure headers
    webviewSession.webRequest.onBeforeSendHeaders((details, callback) => {
        callback({
            requestHeaders: {
                ...details.requestHeaders,
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        })
    })

    // Configure CSP for WebSocket and suppress warnings
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': ["default-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.perplexity.ai https://*.perplexity.ai https://*.finnhub.io; connect-src 'self' https://finnhub.io"]
            }
        })
    })

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