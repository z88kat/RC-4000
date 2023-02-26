/**
 * System menu to save and load watch data
 */
import prompts from "prompts";
import fs from "fs-extra";
import chalk from "chalk";
import {
    watch
} from "../lib/watch.js";


let filename;

//
// Save/Load Watch Data
//
const systemMenu = async function () {

    let response = await prompts({
        type: 'select',
        name: 'menu',
        message: 'Main Menu',
        choices: [{
                title: 'Load Data',
                value: '1'
            },
            {
                title: 'Save Data',
                value: '2'
            },
            {
                title: 'Back to Main Menu',
                value: '5'
            }
        ],
    });
    if (response.menu == '1') {
        await loadFile();
    } else if (response.menu == '2') {
        let success = await saveFile();
        if (!success) {
            await systemMenu();
        }
    }
    //    console.log(response);
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
        filename = response.filename;
    } else {
        console.log(chalk.redBright('File does not exist'));
    }
};

//
// Save the watch data to a file
//
const saveFile = async function () {

    let response = await prompts({
        type: 'text',
        name: 'filename',
        initial: filename,
        message: 'Enter filename to save',
    });

    // if the filename is blank, just return and do nothing
    if (response.filename == '') {
        console.log(chalk.redBright('No filename entered. No file saved'));
        return false;
    }

    // Write out the labels, data and any padding to fill the file to 2000 bytes of data
    // This data file is sent to the watch

    let labels = watch.getLabels();
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

    // finally we are done
    fs.writeFileSync(response.filename, filedata, 'utf8');
    console.log(chalk.greenBright('File saved'));

};



export {
    systemMenu
}