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
const dialog = electron.dialog;
const ipcMain = electron.ipcMain;
const Notification = electron.Notification;

const NOTIFICATION_TITLE = 'Seiko Watch'


// constant for development
const isDev = process.env.NODE_ENV !== 'production';

let win;

// Create a new BrowserWindow when `app` is ready
function createWindow() {
    win = new BrowserWindow({
        width: isDev ? 1200 : 800,
        height: 650,
        // allow resizing
        resizable: true,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            sandbox: false,
            preload: path.join(__dirname, "/lib/preload.cjs"),
        },
        icon: path.join(__dirname, '/src/icon-watch.png'), // needs to be 64x64
        show: false
    });

    // in development mode, show the dev tools
    if (isDev) {
        win.webContents.openDevTools();
    }

    win.loadFile("src/index.html");
}

win.once('ready-to-show', () => {
    win.show()
});

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
                loadFile();
                // TODO: we need to move this to an event handler else we never know if the load failed
                Menu.getApplicationMenu().getMenuItemById('menu-save').enabled = true;
            }
        }, {
            id: 'menu-save',
            label: 'Save',
            accelerator: process.platform == 'darwin' ? 'Command+S' : 'Ctrl+S',
            enabled: false, // disable until we load or save as as file
            click() {
                // Save the file
                saveFile();
            }
        }, , {
            label: 'Save As...',
            accelerator: process.platform == 'darwin' ? 'Command+S' : 'Ctrl+S',
            click() {
                // Save the file under a new name
                saveFileAs();
                // TODO: we need to move this to an event handler else we never know if the save failed
                Menu.getApplicationMenu().getMenuItemById('menu-save').enabled = true;
            }
        }, {
            type: 'separator'
        }, {
            label: 'Quit',
            accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
            click() {
                app.quit();
            }
        }]
    },
    // Add the default edit role menu items
    {

        label: 'Edit',
        submenu: [{
            label: 'Undo',
            accelerator: process.platform == 'darwin' ? 'Command+Z' : 'Ctrl+Z',
            role: 'undo'
        }, {
            label: 'Redo',
            accelerator: process.platform == 'darwin' ? 'Command+Y' : 'Ctrl+Y',
            role: 'redo'
        }, {
            type: 'separator'
        }, {
            label: 'Cut',
            accelerator: process.platform == 'darwin' ? 'Command+X' : 'Ctrl+X',
            role: 'cut'
        }, {
            label: 'Copy',
            accelerator: process.platform == 'darwin' ? 'Command+C' : 'Ctrl+C',
            role: 'copy'
        }, {
            label: 'Paste',
            accelerator: process.platform == 'darwin' ? 'Command+V' : 'Ctrl+V',
            role: 'paste'
        }, {
            label: 'Select All',
            accelerator: process.platform == 'darwin' ? 'Command+A' : 'Ctrl+A',
            role: 'selectAll'
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
            }
            /*{
                label: 'About',
                accelerator: process.platform == 'darwin' ? 'Command+A' : 'Ctrl+A',
                click() {
                    // Show the about dialog
                    aboutDialog();
                }
            }*/
        ]
    },
    {
        label: 'Communications',
        submenu: [{
            label: 'Set Port...',
            accelerator: process.platform == 'darwin' ? 'Command+P' : 'Ctrl+P',
            click() {
                // Send the data
                setPort();
            }
        }, {
            label: 'Send Data',
            accelerator: process.platform == 'darwin' ? 'Command+D' : 'Ctrl+D',
            click() {
                // Send the data
                sendData();
                new Notification({
                    title: NOTIFICATION_TITLE,
                    body: 'Data sent'
                }).show();

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

    //
    // Handle the load file dialog, and load the file
    //
    ipcMain.on('load-file-dialog', () => {
        dialog.showOpenDialog({
            properties: ['openFile']
        }).then((result) => {
            // if not canceled, load the file
            if (!result.canceled && result.filePaths[0]) {

                // o man, I did not figure out this electron stuff yet,
                // but if we try and get access to the watch singleton it will
                // create a new instance, looks like this main.js file is a new process
                // I really need to read the docs on this stuff
                // so for now, we will just send a message to trigger the load in the correct thread
                win.webContents.send('message:update', 'communication-file-loaded', result.filePaths[0]);

                // Get the filename as the last part of the path
                let filename = result.filePaths[0].split('\\').pop().split('/').pop();

                new Notification({
                    title: NOTIFICATION_TITLE,
                    body: 'File load from ' + filename,
                }).show();

            }
        });
    });

    //
    // Handle the save file dialog, and save the file
    //
    ipcMain.on('save-file-dialog', () => {
        dialog.showSaveDialog({
            title: 'Save Watch Data File',
            buttonLabel: 'Save',
            properties: ['createDirectory', 'treatPackageAsDirectory', 'showOverwriteConfirmation', 'dontAddToRecent'],
        }).then((result) => {
            // if not canceled, load the file
            if (!result.canceled && result.filePath) {

                // o man, if we try and get access to the watch singleton it will
                // create a new instance, looks like this main.js file is a new process
                // so for now, we will just send a message to trigger the save in the correct process
                win.webContents.send('message:update', 'communication-file-saved', result.filePath);

                // Get the filename as the last part of the path
                let filename = result.filePath.split('\\').pop().split('/').pop();

                new Notification({
                    title: NOTIFICATION_TITLE,
                    body: 'File saved as ' + filename,
                }).show();

            }
        });
    });

});

// Quit the application
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});


//
// Select and load a watch data file
//
const loadFile = () => {
    // Send a message to init the communication
    // and open the file dialog (take a look in renderer.js)
    // also take a look in the preload.js file for what happens next
    // once the file is selected
    win.webContents.send('message:update', 'communication-load-file');
}

//
// Select and save a watch data file
//
const saveFileAs = () => {
    // Send a message to init the communication
    // and open the file dialog (take a look in renderer.js)
    // also take a look in the preload.js file for what happens next
    // once the file is selected
    win.webContents.send('message:update', 'communication-save-file');
}

//
// Save the current file
//
const saveFile = () => {
    // The filename / path we already have recorded
    win.webContents.send('message:update', 'communication-save-current-file');
}

//
// Send watch data to the watch
//
const sendData = () => {
    // Send a message to init the communication
    //win.webContents.send('menu-event', 'communication-send-data');
    // Send a message to the window.
    win.webContents.send('message:update', 'communication-send-data');
}

//
// Set the default serial port (and save it to the config file)
//
const setPort = () => {
    // Send a message to init the communication
    //win.webContents.send('menu-event', 'communication-set-port');
    // Send a message to the window.
    win.webContents.send('message:update', 'communication-set-port');
}