/**
 * Parse the saved watch file data
 *
 * Can be exchanged with the original seiko watch file format
 */

import {
    watch
} from "./watch.js";
import ScheduledAlarm from "./scheduled-alarm.js";
import WeeklyAlarm from "./weekly-alarm.js";
import Memo from "./memo.js";
import {
    LabelType
} from "./constants.js";
import chalk from "chalk";

/**
 *
 * @param {*} file String containing the file contents
 */
const parse = function (file) {

    //console.log(chalk.blue('Parsing file...'));

    // We need to process the string file one line at a time
    // The first line is the number of lines in the file

    // Split the file into an array of lines
    const lines = file.split(/\r?\n/);

    // The first line is the number of lines in the file
    // This is the format <space>number of lines
    const numberOfLines = lines[0].trim();

    // first we always have the label, then we have the data
    let label;


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
                //console.log('Label: ' + line);
                label = processLabel(line);

                // Add the label to the watch
                watch.addLabel(label);

                break;
            case 'd':
                // This is data
                //console.log('Data: ' + line);

                // Add the data to the label
                label.addData(line);

                break;
            default:
                throw new Error('Unknown line type: ' + line);
        }
    }

    console.log(chalk.blue(' Lines Free: ' + watch.getNumberOfLinesFree()));
    console.log(chalk.blue('Labels Free: ' + watch.getNumberOfLabelsFree()));


};


//
// Process the label, the last character is the label type
// 1. Scheduled Alarm
// 2. Weekly Alarm
// 0. Memo
//
const processLabel = function (line) {

    // The last character is the label type
    const labelType = parseInt(line.charAt(line.length - 1));

    let label;

    // Match the label type with the constants
    switch (labelType) {
        case LabelType.SCHEDULED_ALARM:
            //console.log('Scheduled Alarm');
            label = new ScheduledAlarm(line);
            break;
        case LabelType.WEEKLY_ALARM:
            //console.log('Weekly Alarm');
            label = new WeeklyAlarm(line);
            break;
        case LabelType.MEMO:
            //console.log('Memo');
            label = new Memo(line);
            break;
        default:
            throw new Error('Unknown label type: ' + labelType);
    }

    return label;
};


export {
    parse
}