/**
 * Configuration file management. This is used to save and load the configuration
 *
 */
import fs from 'fs-extra';
import path from 'path';
const __dirname = path.resolve();

let configDir = path.join(__dirname, '.config');

// check if the .config directory exists, if not create it
if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir);
}

// cheeck if the config.json file exists, if not create it
let configFile = path.join(configDir, 'config.json');
if (!fs.existsSync(configFile)) {

    // This is the default configuration port
    let data = {
        port: '/dev/ttyUSB0',
    };

    fs.writeFileSync(configFile, JSON.stringify(data, null, 4));
}


// Read the port from the config file
const getPort = function () {

    // check if the config.json file exists, if not return the default port
    if (!fs.existsSync(configFile)) {
        return '/dev/ttyUSB0';
    }

    let data = fs.readFileSync(configFile);

    let config = JSON.parse(data);

    return config.port;
}

// Write the port to the config file
const setPort = function (port) {
    let data = fs.readFileSync(configFile);

    let config = JSON.parse(data);

    config.port = port;

    fs.writeFileSync(configFile, JSON.stringify(config, null, 4));
}


export default {
    getPort,
    setPort
}