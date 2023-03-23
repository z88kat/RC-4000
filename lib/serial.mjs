/**
 * Set the data to the watch on the serial port, the number of bytes is fixed to 2051 (2Kb)
 *
 * The entire data is sent as a single block, the watch will then parse the data and display it
 * There is no possbility to incrementally update the watch
 *
 * There is no possiblity to read the watch data back as there is no TX pin on the watch
 *
 */

import * as serialport from 'serialport';
import {
    watch
} from './watch.mjs';
import {
    EmptyData
} from './constants.mjs';
import configuration from './configuration.mjs';
// chalk is not working with electron
//import  chalk from 'chalk';

//const port = "/dev/ttyUSB0";

// The pre-amble for the command which we always have to send, otherwise it will drop to the console
const PRE_AMBLE = [0x00, 0x4C];
const endOfTOCMarker = 0x4c;

//let serialPort;

//const initSerialPort = () => {

//  if (serialPort) return;

// Setup the serial port for the watch
// the watch is 2400 baud, 8 data bits, 2 stop bits, no parity
const serialPort = new serialport.SerialPort({
    path: configuration.getPort(),
    baudRate: 2400,
    autoOpen: true,
    dataBits: 8,
    stopBits: 2,
    parity: 'none'
});

//
// The serial port connection is open successfully
// Read data that is available but keep the stream in "paused mode"
//
serialPort.on("open", function () {
    console.log("-- Serial Connection Active --");
});


//
// Capture any errors
//
serialPort.on("error", function (e) {
    console.log('');
    console.error(e);
    console.log('');
});






//
// Write array to the serial port
//
const writeToPort = (array) => {

    return new Promise(function (resolve, reject) {

        // Check if the serial port is open
        if (!serialPort.isOpen) {
            console.error('Serial port is not open');
            reject('Serial port is not open');
        }

        serialPort.write(Buffer.from(array), function (err, data) {
            console.log('Complete')
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });

};


//
// Close the serial port
// usage: await close();
//
const close = async () => {
    return new Promise(resolve => port.on("close", resolve));
};

//
// Send the data to the watch
//
const sendData = async () => {

    //initSerialPort();

    return new Promise((resolve, reject) => {


        console.log('Sending data to watch');

        let data = buildRCSerialData();
        if (!data) reject('No data to send');

        writeToPort(data).then((data) => {
            console.log('Data sent to watch. Please wait for transfer to complete.');
            resolve();
        }).catch((err) => {
            console.log('Error on write: ', err.message);
            reject('Error on write: ', err.message);
        });
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

    // Beging to build the table of contents
    // First entry starts at 0x00
    // We have 2 bytes for the TOC, first is the type, 2nd is the start address
    let toc = []; //[0x00,0x00];

    // The starting address is 0x00
    let startingAddress = 0;

    let linesWritten = 0;
    for (let i = 0; i < labels.length; i++) {

        let label = labels[i];
        // Write the label
        filedata += label.getLabelForTransfer();

        // Write the data
        filedata += label.getDataForTransfer(false);

        // Build the TOC entry
        // The first byte is the type of data
        // The second byte is the starting address
        //toc.push(label.getDataTypeForTransfer());
        //toc.push(decimalToHex(startingAddress));

        toc = toc.concat(calculateTocEntry(label.getDataTypeForTransfer(), startingAddress));

        // calculate the next starting address
        startingAddress += label.getDataLength();

        linesWritten++; // for the label
        linesWritten += label.getData().length; // for the data
    }

    // Add the end of content marker, only if we have not written all 80 lines
    if (linesWritten < 80) toc.push(endOfTOCMarker);

    // TOC needs to be 24 bytes long
    // If it is less than 24 bytes, we need to pad it with 0x00
    if (toc.length < 24) {
        let diff = 24 - toc.length;
        for (let i = 0; i < diff; i++) {
            toc.push(0x00);
        }
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



    // Length of each entry is 24 + 1 for the type of entry marker L or d
    // eg: "dJANE B      053-156-2314"

    // Calculate the Hex value offset of the TOC from 0x00

    // We need to create the table of contents
    // This is an array of 80 values, each value is the line number of the label
    // The line number is the number of lines from the start of the file
    // The TOC is 24 bytes long
    // This gives us pointers to the start of each label (12 in total)
    // THe first byte determines the type of data
    // 0x00 = label
    // 0x10 = scheduled alarm
    // 0x20 = weekly alarm
    // Therefore 0x20 0x32 means scheduled alarm label begins at 0x32
    // 0x4c appears to be an end of TOC marker, this is required otherwise you cannot
    // loop over the labels on the watch
    // The below example works with:
    // node index.js --load saves/MEMO
    let tocEXAMPLE = [0x00, 0x00, 0x00, 0x32, 0x00, 0xc8, 0x4c, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00
    ];
    //console.log(tocEXAMPLE);

    // https://www.rapidtables.com/convert/number/decimal-to-hex.html
    // Weekly Alarm Test 0x20 = weekly alarm
    // node index.js --load saves/WEEKLY
    let tocWeekEXAMPLE = [0x20, 0x00, 0x00, 0xe1, 0x4c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00
    ];
    //console.log(tocWeekEXAMPLE);

    // Scheduled Alarm Test 0x10 = scheduled alarm
    // node index.js --load saves/SCHEDULE
    let tocScheduleEXAMPLE = [0x10, 0x00, 0x00, 0x64, 0x4c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00
    ];
    //console.log(tocScheduleEXAMPLE);

    // I manually calculated the offsets for the TOC
    //  0, 125 = 7d :: 75 = 4b == c8 :: 100 = 64  == 12C , 150 = 96
    let tocSAMPLE = [0x00, 0x00, 0x00, 0x7d, 0x00, 0xc8, 0x01, 0x2c, 0x4c, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00
    ];
    //console.log(tocSAMPLE);

    // The data to be sent to the watch
    //console.log(toc);

    // Now add the PRE_AMBLE to the start of the array
    array = PRE_AMBLE.concat(toc).concat(array);

    //console.log(array)

    // The length of the data is bytes
    // the number of bytes is fixed to 2051 (2Kb), if it is less then this we have a problem
    //    console.log('Length of data: ' + array.length);
    if (array.length !== 2051) {
        console.error('Error: Data length is not 2051 bytes. It is ' + array.length + ' bytes');
    }

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

//
// Convert decimal to hex
// https://www.asciitable.com/
//
const decimalToHex = (number) => {
    if (number < 0) {
        number = 0xFFFFFFFF + number + 1;
    }

    //    return Number('0x' + number.toString(16).toUpperCase());

    return number.toString(16).toUpperCase();
}

const hexToDecimal = (hex) => {
    return parseInt(hex, 16);
}


// Data TOC entries are 2 bytes long
// depending if the entry is alarm or memo we need to calculate the entry
const calculateTocEntry = (type, offset) => {

    // We have a 2 byte entry [type] [offset]
    // for alarms we set the type, for memo its 0x00 or the offset overflow
    if (type > 0) {
        return [type, offset];
    }

    // eg: 12c = [0x01, 0x2c] or decimal [ 1, 44 ]
    return hexToBytes(decimalToHex(offset));
};

// Data TOC entries are 2 bytes long
// Convert a hex value to a 2 byte array
// eg: 12c = [0x01, 0x2c] or decimal [ 1, 44 ]
const hexToBytes = (hex) => {

    // hex < 4 bytes long prepend with 0's
    if (hex.length < 4) {
        hex = '0'.repeat(4 - hex.length) + hex;
    }
    let bytes = [];
    for (let c = 0; c < hex.length; c += 2) {
        bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return bytes;
}



export {
    sendData
}

export default {
    sendData
}