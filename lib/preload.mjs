import electron from 'electron';
const contextBridge = electron.contextBridge;
const ipcRenderer = electron.ipcRenderer;

// watch is a singleton, so we can only expose it here, nowhere else otherwise
import watch from './watch.mjs';
import actions from './actions.mjs';

// White-listed channels.
const ipc = {
    'render': {
        // From render to main.
        'send': [],
        // From main to render.
        'receive': [
            'message:update' // Here is your channel name
        ],
        // From render to main and back again.
        'sendReceive': []
    }
};

// Exposed protected methods in the render process.
contextBridge.exposeInMainWorld(
    // Allowed 'ipcRenderer' methods.
    'ipcRender', {
        // From render to main.
        send: (channel, args) => {
            let validChannels = ipc.render.send;
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, args);
            }
        },
        // From main to render.
        receive: (channel, listener) => {
            let validChannels = ipc.render.receive;
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender`.
                ipcRenderer.on(channel, (event, ...args) => listener(...args));
            }
        },
        // From render to main and back again.
        invoke: (channel, args) => {
            let validChannels = ipc.render.sendReceive;
            if (validChannels.includes(channel)) {
                return ipcRenderer.invoke(channel, args);
            }
        }
    }
);

contextBridge.exposeInMainWorld('watch', {
    getNumberOfLabelsFree: () => watch.getNumberOfLabelsFree(),
    hasWeeklyAlarm: () => watch.hasWeeklyAlarm(),
    hasScheduledAlarm: () => watch.hasScheduledAlarm(),
    hasMemo: () => watch.hasMemo(),
    getLabels: () => watch.getLabels(),
    // we can also expose variables, not just functions
})

contextBridge.exposeInMainWorld('actions', {
    getData: (id, dataIndex) => actions.getData(id, dataIndex),
    addMemoLabel: (name) => actions.addMemoLabel(name),
    addWeeklyLabel: (name) => actions.addWeeklyLabel(name),
    addScheduledLabel: (name) => actions.addScheduledLabel(name),
    deleteLabelEntry: (id) => actions.deleteLabelEntry(id),
    updateLabelEntry: (id, title) => actions.updateLabelEntry(id, title),
    addMemoData: (id, name) => actions.addMemoData(id, name),
    addWeeklyData: (id, name, day, time) => actions.addWeeklyData(id, name, day, time),
    updateWeeklyData: (id, index, name, day, time) => actions.updateWeeklyData(id, index, name, day, time),
    // id, name, day, month, time)
    addScheduledAlarmData: (id, name, day, month, time) => actions.addScheduledAlarmData(id, name, day, month, time),
    updateScheduledAlarmData: (id, index, name, day, month, time) => actions.updateScheduledAlarmData(id, index, name, day, month, time),
    deleteDataEntry: (id, index) => actions.deleteDataEntry(id, index),
    updateDataEntry: (id, index, title) => actions.updateDataEntry(id, index, title),
    getPort: () => actions.getPort(),
    setPort: (port) => actions.setPort(port),
    sendDataToWatch: () => actions.sendDataToWatch(),
    getNumberOfLabelsFree: () => actions.getNumberOfLabelsFree(),
    loadFile: (filePath) => actions.loadFile(filePath),
    saveFile: (filePath) => actions.saveFile(filePath),
    saveCurrentFile: () => actions.saveCurrentFile(),
    // we can also expose variables, not just functions
})

contextBridge.exposeInMainWorld('electron', {
    onMenuNav: () => ipcRenderer.on('menu-event', (event, arg) => {
        console.log('menu-event is:', arg);
    })
})

//
// File Management from the file menu
//
contextBridge.exposeInMainWorld('files', {
    openLoadDialog() {
        // Send an event to open the load file dialog (see main.mjs)
        ipcRenderer.send('load-file-dialog');
    },
    openSaveDialog() {
        // Send an event to open the save file dialog (see main.mjs)
        ipcRenderer.send('save-file-dialog');
    }
});

export default contextBridge;