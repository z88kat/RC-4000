require = require("esm")(module /* , options */ );
/*
const {
    contextBridge
} = require('electron');

contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    // we can also expose variables, not just functions
})

let context = require("./preload.mjs");
*/

module.exports = require("./preload.mjs");