/**
 * Electron Bootstrapper
 */
import electron from 'electron';
import path from 'path';
import {
    fileURLToPath
} from 'url';
const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;


function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        // allow resizing
        resizable: true,
        webPreferences: {
            preload: path.join(__dirname, "preload.mjs"),
        },
    });

    win.loadFile("src/index.html");
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});