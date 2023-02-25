/**
 * Parse the configuration file
 */

import Watch from "./watch.js";

/**
 *
 * @param {*} file String containing the file contents
 */
const parse = function (file) {

    // We need to process the string file one line at a time
    // The first line is the number of lines in the file

    // Split the file into an array of lines
    const lines = file.split(/\r?\n/);

    // The first line is the number of lines in the file
    // This is the format <space>number of lines
    const numberOfLines = lines[0].trim();
    console.log('Number of lines: ' + numberOfLines);

    let watch = new Watch(numberOfLines);

    // Now we need to process the lines
    // The last line we must ignore,
    // TODO: last line contains something i don't know what yet
    for (let i = 1; i < lines.length - 2; i++) {
        const line = lines[i];

        // check each line for the following:
        // 1. The Label starting with L
        // 2. Data starting with d following L
        // 3. The Label type, scheduled alarm (1), weekly alarm (2), memo (0)

        switch (line.charAt(0)) {
            case 'L':
                // This is a label
                console.log('Label: ' + line);
                break;
            case 'd':
                // This is data
                console.log('Data: ' + line);
                break;
            default:
                throw new Error('Unknown line type: ' + line);
        }
    }

};

export {
    parse
}