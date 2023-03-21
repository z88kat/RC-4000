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
const Menu = electron.Menu;

// constant for development
const isDev = process.env.NODE_ENV !== 'production';

let win;

// Create a new BrowserWindow when `app` is ready
function createWindow() {
    win = new BrowserWindow({
        width: isDev ? 1200 : 800,
        height: 600,
        // allow resizing
        resizable: true,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            sandbox: false,
            preload: path.join(__dirname, "/lib/preload.cjs"),
        },
    });

    // in development mode, show the dev tools
    if (isDev) {
        win.webContents.openDevTools();
    }

    win.loadFile("src/index.html");
}

const aboutDialog = () => {
    const aboutWin = new BrowserWindow({
        title: 'About',
        width: 400,
        height: 300,
        // allow resizing
        resizable: false
    });

    aboutWin.loadFile("src/about.html");
}


// Create a menu template
const mainMenuTemplate = [{
        label: 'File',
        submenu: [{
            label: 'Load...',
            accelerator: process.platform == 'darwin' ? 'Command+L' : 'Ctrl+L',
            click() {
                // Load the file
                //  loadFile();

            }
        }, {
            label: 'Save',
            accelerator: process.platform == 'darwin' ? 'Command+S' : 'Ctrl+S',
            click() {
                // Save the file
                //  saveFile();
            }
        }, {
            label: 'Quit',
            accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
            click() {
                app.quit();
            }
        }]
    },
    {
        label: 'View',
        submenu: [{
            label: 'Toggle DevTools',
            accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
            click(item, focusedWindow) {
                focusedWindow.toggleDevTools();
            },
        }, {
            label: 'About',
            accelerator: process.platform == 'darwin' ? 'Command+A' : 'Ctrl+A',
            click() {
                // Show the about dialog
                aboutDialog();
            }
        }]
    },
    {
        label: 'Communications',
        submenu: [{
            label: 'Set Port...',
            accelerator: process.platform == 'darwin' ? 'Command+P' : 'Ctrl+P',
            click() {
                // Send the data
                //  sendData();
            }
        }, {
            label: 'Send Data',
            accelerator: process.platform == 'darwin' ? 'Command+D' : 'Ctrl+D',
            click() {
                // Send the data
                sendData();
            }
        }]
    }
];

// App is ready
app.whenReady().then(() => {
    createWindow();


    // Impliment the menu
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit the application
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});


//
// Send watch data to the watch
//
const sendData = () => {
    // Send a message to init the communication
    //win.webContents.send('menu-event', 'communication-send-data');
    // Send a message to the window.
    win.webContents.send('message:update', 'communication-send-data');
}