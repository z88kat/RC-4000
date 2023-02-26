/**
 * Set the data to the watch on the serial port
 */

import {
    SerialPort
} from 'serialport';
import {
    buildRCData
} from '../menus/system.js';
import chalk from 'chalk';

const port = "/dev/ttyUSB0";

const serialPort = new SerialPort({
    path: port,
    baudRate: 2400,
    autoOpen: true,
    dataBits: 8,
    stopBits: 1,
    parity: 'none'
});
// Read data that is available but keep the stream in "paused mode"
serialPort.on("open", function () {
    console.log("-- Connection opened --");
    serialPort.on("data", writeConsole);
});
//
// Capture any errors
//
serialPort.on("error", function (e) {
    console.log('');
    console.log(chalk.red(e));
    console.log('');
});


//
//
//
const sendData = () => {


    let data = buildRCData();

    serialPort.write(data, function (err) {
        if (err) {
            reject('Error on write: ', err.message);
        }
        //            console.log('message written');
        resolve();
    });
}

export {
    sendData
}