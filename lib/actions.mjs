/**
 * This is a wrapper around the main menu functions so that we acn access functons
 * like addMemoLabel() from the renderer process
 */

import fs from "fs-extra";
import Memo from "./memo.mjs";
import ScheduledAlarm from "./scheduled-alarm.mjs";
import watch from "./watch.mjs";
import WeeklyAlarm from "./weekly-alarm.mjs";
import configuration from "./configuration.mjs";
import serial from "./serial.mjs";
import {
    parse
} from "./parser.mjs";

// Add a memo label to the watch
const addMemoLabel = (name) => {

    //if (!name) return;

    // should not be > 24 chars
    if (name.length > 24) {
        name = name.substring(0, 24);
    }
    // should be in upper case
    name = name.toUpperCase();

    let label = new Memo()
    label.setLabel(name);
    watch.addLabel(label);

    return label;
}

// Add a weekly label to the watch
const addWeeklyLabel = (name) => {

    //if (!name) return;

    // should not be > 24 chars
    if (name.length > 24) {
        name = name.substring(0, 24);
    }
    // should be in upper case
    name = name.toUpperCase();

    let label = new WeeklyAlarm()
    label.setLabel(name);
    watch.addLabel(label);

    return label;
}

// Add a scheduled label to the watch
const addScheduledLabel = (name) => {

    //if (!name) return;

    // should not be > 24 chars
    if (name.length > 24) {
        name = name.substring(0, 24);
    }
    // should be in upper case
    name = name.toUpperCase();

    let label = new ScheduledAlarm()
    label.setLabel(name);
    watch.addLabel(label);

    return label;
}

//
// Delete a label from the watch using the given ID
//
const deleteLabelEntry = (id) => {

    watch.getLabels().forEach((label, index) => {
        if (label.id == id) {
            watch.removeLabel(index);
        }
    });

};

//
// Update a label from the watch using the given ID
//
const updateLabelEntry = (id, title) => {
    watch.getLabels().forEach((label, index) => {
        if (label.id == id) {
            label.setLabel(title);
        }
    });

}

//
// Add memo data to the watch using the given ID which is the label
//
const addMemoData = (id, data) => {
    let index = -1;
    watch.getLabels().forEach((label) => {
        if (label.id == id) {
            index = label.addData(data);
        }
    });

    return index;
};


const getPort = () => {
    return configuration.getPort();
}

const setPort = (port) => {
    configuration.setPort(port);
}

//
// Send Data to the watch using the give serial port
//
const sendDataToWatch = async () => {
    await serial.sendData();
}


//
// Load a file from the file menu
//
const loadFile = async (filepath) => {

    console.log(`Loading file ${filepath}`.blue);

    // Test the file exists
    if (fs.existsSync(filepath)) {
        const file = await fs.readFile(filepath, 'utf8');
        //console.log(file);
        parse(file);

        // Set the filename from the file path, this is the last part of the path
        const filename = filepath.split('/').pop();
        watch.setFilename(filename);

    } else {
        console.error(`File ${filepath} does not exist`);
    }
}


const getNumberOfLabelsFree = () => {
    return watch.getNumberOfLabelsFree();
}

export {
    addMemoLabel,
    addWeeklyLabel,
    addScheduledLabel,
    deleteLabelEntry,
    updateLabelEntry,
    addMemoData,
    getPort,
    setPort,
    sendDataToWatch,
    loadFile,
    getNumberOfLabelsFree
}

export default {
    addMemoLabel: addMemoLabel,
    addWeeklyLabel: addWeeklyLabel,
    addScheduledLabel: addScheduledLabel,
    deleteLabelEntry: deleteLabelEntry,
    updateLabelEntry: updateLabelEntry,
    addMemoData: addMemoData,
    getPort: getPort,
    setPort: setPort,
    sendDataToWatch: sendDataToWatch,
    loadFile: loadFile,
    getNumberOfLabelsFree: getNumberOfLabelsFree
}