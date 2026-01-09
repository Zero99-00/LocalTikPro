const { app, BrowserWindow, dialog, ipcMain, protocol, net } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

let mainWindow;

// Optimization fixes


function createWindow() {
    mainWindow = new BrowserWindow({
        width: 560,
        height: 870,
        title: 'TikLocal Pro',
        autoHideMenuBar: true,
        backgroundColor: '#050505',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: true // Can stay true with custom protocol
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
    // Register custom protocol to handle local video files safely
    protocol.handle('media', (request) => {
        const filePath = decodeURIComponent(request.url.replace('media://', ''));
        return net.fetch(pathToFileURL(filePath).toString());
    });

    // Handle Folder Opening
    ipcMain.handle('dialog:openDirectory', async () => {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory'],
            title: 'Select Video Library'
        });
        return result.canceled ? null : result.filePaths;
    });

    // Handle Orientation Toggle
    ipcMain.on('toggle-landscape', (event, isHorizontal) => {
        if (!mainWindow) return;
        if (isHorizontal) {
            mainWindow.setSize(1280, 800, true);
        } else {
            mainWindow.setSize(560, 870, true);
        }
        mainWindow.center();
    });

    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});