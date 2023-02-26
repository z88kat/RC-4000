/**
 * Set the data to the watch on the serial port, the number of bytes is fixed to 2051 (2Kb)
 *
 * The entire data is sent as a single block, the watch will then parse the data and display it
 * There is no possbility to incrementally update the watch
 *
 * There is no possiblity to read the watch data back as there is no TX pin on the watch
 *
 */

import {
    SerialPort
} from 'serialport';
import {
    watch
} from './watch.js';
import {
    EmptyData
} from './constants.js';
import chalk from 'chalk';

const port = "/dev/ttyUSB0";

// The pre-amble for the command which we always have to send, otherwise it will drop to the console
const PRE_AMBLE = [0x00, 0x4C];


const serialPort = new SerialPort({
    path: port,
    baudRate: 2400,
    autoOpen: true,
    dataBits: 8,
    stopBits: 2,
    parity: 'none'
});
// Read data that is available but keep the stream in "paused mode"
serialPort.on("open", function () {
    console.log("-- Connection opened --");
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
// Write array to the serial port
//
const writeToPort = (array) => {

    return new Promise(function (resolve, reject) {

        serialPort.write(Buffer.from(array), function (err, data) {
            //console.log('Complete')
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });

};

//
//
//
const sendData = async () => {

    return new Promise((resolve, reject) => {


        console.log(chalk.greenBright('Sending data to watch'));

        let data = buildRCSerialData();
        writeToPort(data).then((data) => {
            console.log(chalk.green('Data sent to watch'));
            resolve();
        }).catch((err) => {
            console.log(chalk.red('Error on write: ', err.message));
            reject('Error on write: ', err.message);
        });
        /*
                serialPort.write(data, function (err) {
                    if (err) {
                        console.log(chalk.red('Error on write: ', err.message));
                        reject('Error on write: ', err.message);
                    }
                    console.log(chalk.green('Data sent to watch'));
                    resolve();
                });
                */
    });

}


//
// Build the RC data string to be send to the watch, save it to a file
//
const buildRCSerialData = function (data) {
    // Write out the labels, data and any padding to fill the file to 2000 bytes of data
    // This data file is sent to the watch

    let labels = watch.getLabels();
    //let numberOfLines = watch.getNumberOfLines();
    // console.log('Number of lines: ' + numberOfLines);

    // Open the file for writing
    let filedata = '';

    // The data always starts with 0x00 0x4c
    //filedata += '0x00';
    //filedata += '0x4c';

    // Write the first line which is the number of lines
    // include new line and line feed
    //filedata += ' ' + numberOfLines + '\r\n';

    let linesWritten = 0;
    for (let i = 0; i < labels.length; i++) {

        let label = labels[i];
        // Write the label
        filedata += label.getLabelForTransfer();

        // Write the data
        filedata += label.getDataForTransfer(false);

        linesWritten++; // for the label
        linesWritten += label.getData().length; // for the data

    }

    // We need to pad to a maximum of 2000 bytes (81 lines)
    // We have already written x lines based on the number of labels + 1 for the number of lines
    // So we need to write 80 - x lines
    let linesToWrite = 80 - (linesWritten - 1);
    console.log('Lines to write: ' + linesToWrite)
    for (let i = 0; i < linesToWrite; i++) {
        filedata += '@' + EmptyData;
    }
    // We need to append the hex code 1A to the end of the file
    // I believe this is the end of file marker
    //filedata += '\x1A';


    // Convert the string to an array of hex values
    let array = stringToHexArray(filedata);

    // We need to create the table of contents
    // This is an array of 80 values, each value is the line number of the label
    // The line number is the number of lines from the start of the file
    // The TOC is 24 bytes long
    let toc = [0x00, 0x00, 0x00, 0x32, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00
    ];

    // Now add the PRE_AMBLE to the start of the array
    array = PRE_AMBLE.concat(toc).concat(array);

    //    console.log(array)

    // The length of the data is bytes
    // the number of bytes is fixed to 2051 (2Kb)
    console.log('Length of data: ' + array.length);

    return array;
};


//
// Convert a string to an array of hex values
//
const stringToHexArray = (string) => {
    let array = [];
    for (let i = 0; i < string.length; i++) {
        array.push(charToHex(string[i]));
    }
    return array;
}

//
// Converts a character to a hex value
//
const charToHex = (char) => {
    return Number('0x' + char.charCodeAt(0).toString(16));
}

export {
    sendData
}