import electron from 'electron';
const contextBridge = electron.contextBridge;

import watch from './watch.mjs';
import actions from './actions.mjs';

contextBridge.exposeInMainWorld('watch', {
    getNumberOfLabelsFree: () => watch.getNumberOfLabelsFree()
    // we can also expose variables, not just functions
})

contextBridge.exposeInMainWorld('actions', {
    addMemoLabel: (name) => actions.addMemoLabel(name)
    // we can also expose variables, not just functions
})

export default contextBridge;