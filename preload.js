const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('electron', {
    // Add any required API methods here
    // For now, we don't need any specific methods
}) 