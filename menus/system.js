/**
 * System menu to save and load watch data
 */
import prompts from "prompts";
import fs from "fs-extra";
import chalk from "chalk";
import {
    watch
} from "../lib/watch.js";
import {
    EmptyData
} from "../lib/constants.js";
import {
    parse
} from "../lib/parser.js";

//
// Save/Load Watch Data
//
const systemMenu = async function () {

    // Display the current filename if there is one
    let filename = watch.getFilename();
    if (filename != '') {
        console.log(chalk.green(`Name File: ${filename}`));
    }

    // Display the menu for saving and loading data until quit is selected
    let response = {
        menu: '0'
    };
    while (response.menu != '5') {
        response = await prompts({
            type: 'select',
            name: 'menu',
            message: 'System Menu',
            choices: [{
                    title: 'Load Data',
                    description: 'Load watch data from a file',
                    value: '1'
                },
                {
                    title: 'Save Data',
                    description: 'Save watch data to a file',
                    value: '2'
                },
                {
                    title: String.fromCharCode(9204) + ' Main Menu',
                    description: 'Return to the main menu',
                    value: '5'
                }
            ],
        });
        if (response.menu == '1') {
            let success = await loadFile();
            if (success) response.menu = '5';

        } else if (response.menu == '2') {
            let success = await saveFile();
            if (success) response.menu = '5';
        }
    } // loop menu until quit or saved / loaded the data

};

//
// Load the watch data from a file
//
const loadFile = async function () {

    let response = await prompts({
        type: 'text',
        name: 'filename',
        message: 'Enter filename to load',
    });

    // Test the file exists
    if (fs.existsSync(response.filename)) {
        const file = await fs.readFile(response.filename, 'utf8');
        //console.log(file);
        parse(file);

        // store the filename for when we save
        let filename = watch.setFilename(response.filename);
    } else {
        console.log(chalk.redBright('File does not exist'));
        return false;
    }

    return true;
};

//
// Save the watch data to a file
// The data needs to be saved in the correct order
//
// 1. Number of lines
// 2. Weekly Alarm Label + Data (type 2)
// 3. Scheduled Alarm Label + Data (type 1)
// 4. Memo Label + Data (type 0)
// End of file marker
//
const saveFile = async function () {

    let filename = watch.getFilename();

    let response = await prompts({
        type: 'text',
        name: 'filename',
        initial: filename,
        message: 'Enter filename to save',
    });

    // if the filename is blank, just return and do nothing
    // also must be of type string
    if (response.filename == '' || typeof response.filename != 'string') {
        console.log(chalk.redBright('No filename entered. No file saved'));
        return false;
    }

    try {

        // Build the RC Compatible data file
        let filedata = buildRCData();

        // finally we are done
        fs.writeFileSync(response.filename, filedata, 'utf8');
        console.log(chalk.greenBright('File saved'));

        // If we get here then we have saved the file
        watch.setFilename(response.filename);
    } catch (err) {
        console.error(err);
        console.log(chalk.redBright('Error saving file'));
    }

};

//
// Build the RC data string to be send to the watch, save it to a file
//
const buildRCData = function (data) {

    // Write out the labels, data and any padding to fill the file to 2000 bytes of data
    // This data file is sent to the watch

    // The labels need to be in the correct order
    let labels = [...watch.getWeeklyAlarmLabel(), ...watch.getScheduledAlarmLabel(), ...watch.getMemoLabels()];

    let numberOfLines = watch.getNumberOfLines();
    console.log('Number of lines: ' + numberOfLines);

    // Open the file for writing
    let filedata = '';

    // Write the first line which is the number of lines
    // include new line and line feed
    filedata += ' ' + numberOfLines + '\r\n';

    for (let i = 0; i < labels.length; i++) {
        let label = labels[i];
        // Write the label
        filedata += label.getLabelForSave() + '\r\n';

        // Write the data
        filedata += label.getDataForSave();
    }

    // We need to pad to a maximum of 2000 bytes (81 lines)
    // We have already written x lines based on the number of labels + 1 for the number of lines
    // So we need to write 81 - x lines
    let linesToWrite = 81 - (numberOfLines + 1);
    for (let i = 0; i < linesToWrite; i++) {
        filedata += 'd ' + EmptyData + ' 0\r\n';
    }
    // Write the finale line, this appears to be the number of labels
    let getNumberOfLabels = watch.getNumberOfLabels();
    // Pad the number with a space if < 10
    if (getNumberOfLabels < 10) {
        getNumberOfLabels = ' ' + getNumberOfLabels;
    }
    filedata += getNumberOfLabels + '\r\n';

    // We need to append the hex code 1A to the end of the file
    // I believe this is the end of file marker
    filedata += '\x1A';

    return filedata;
};




export {
    systemMenu,
    buildRCData
}