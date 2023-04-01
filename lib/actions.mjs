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
import {
    buildRCData
} from '../menus/system.mjs';


//
// Get the data item from the watch using the given ID
//
const getData = (id, dataIndex) => {

    let data = '';
    watch.getLabels().forEach((label, index) => {
        if (label.id == id) {
            data = label.getDataForIndex(dataIndex);
        }
    });

    return data;
};

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


//
// Add weekly alarm data to the watch using the given ID which is the label
//
const addWeeklyData = (id, name, day, time) => {

    // The time is in the format 12:00 AM, we need to seperate the hours and minutes and AM/PM
    let timeParts = time.split(' ');
    let hours = timeParts[0].split(':')[0];
    let minutes = timeParts[0].split(':')[1];
    // get the first letter of AM/PM
    let ampm = timeParts[1].substring(0, 1);

    let index = -1;
    watch.getLabels().forEach((label) => {
        if (label.id == id) {
            index = label.addRawData(name);
            label.setHour(index, parseInt(hours));
            label.setMinute(index, parseInt(minutes));
            label.setAMPM(index, ampm);
            label.setDayOfWeek(index, parseInt(day));
        }
    });

    return index;
}

//
// Update weekly alarm data to the watch using the given ID which is the label
// and the index which is the data item
//
// Will return the complete data item
//
const updateWeeklyData = (id, index, name, day, time) => {

    // The time is in the format 12:00 AM, we need to seperate the hours and minutes and AM/PM
    let timeParts = time.split(' ');
    let hours = timeParts[0].split(':')[0];
    let minutes = timeParts[0].split(':')[1];
    // get the first letter of AM/PM
    let ampm = timeParts[1].substring(0, 1);

    let item;

    watch.getLabels().forEach((label) => {
        if (label.id == id) {

            label.setDataLabel(index, name);
            label.setHour(index, parseInt(hours));
            label.setMinute(index, parseInt(minutes));
            label.setAMPM(index, ampm);
            label.setDayOfWeek(index, parseInt(day));
            item = label.getDataForIndex(index);

        }
    });

    return item;
}



//
// Add weekly alarm data to the watch using the given ID which is the label
//
const addScheduledAlarmData = (id, name, day = 1, month = 1, time) => {

    // The time is in the format 12:00 AM, we need to seperate the hours and minutes and AM/PM
    let timeParts = time.split(' ');
    let hours = timeParts[0].split(':')[0];
    let minutes = timeParts[0].split(':')[1];
    // get the first letter of AM/PM
    let ampm = timeParts[1].substring(0, 1);

    let index = -1;
    watch.getLabels().forEach((label) => {
        if (label.id == id) {
            index = label.addRawData(name);
            label.setMonth(index, parseInt(month));
            label.setDay(index, parseInt(day));
            label.setHour(index, parseInt(hours));
            label.setMinute(index, parseInt(minutes));
            label.setAMPM(index, ampm);
        }
    });

    return index;
}

//
// Update a label from the watch using the given ID
//
const updateDataEntry = (id, index, title) => {
    watch.getLabels().forEach((label) => {
        if (label.id == id) {
            label.setData(index, title)
        }
    });
}


//
// Remove a single data entry from the watch using the given ID which is the label
// and the index of the row
//
const deleteDataEntry = (id, index) => {
    watch.getLabels().forEach((label) => {
        if (label.id == id) {
            label.removeData(index);
        }
    });
}


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

    let result = {
        success: false,
        message: ''
    }

    console.log(`Loading file ${filepath}`.blue);

    try {
        // Test the file exists
        if (fs.existsSync(filepath)) {
            const file = await fs.readFile(filepath, 'utf8');
            //console.log(file);
            parse(file);

            // Set the filename from the file path, this is the last part of the path
            const filename = filepath.split('/').pop();
            watch.setFilename(filename);
            watch.setFilePath(filepath);

            result.success = true;

        } else {
            console.error(`File ${filepath} does not exist`);
            result.message = `File ${filepath} does not exist`;
        }
    } catch (err) {
        console.error(err);
        result.message = err;
    }

    return result;
}


//
// Save the current file
//
const saveCurrentFile = () => {
    let result = {
        success: false,
        message: ''
    }
    if (watch.getFilePath()) {
        result = saveFile(watch.getFilePath());
    }

    return result;
}

//
// Save a file from the save menu
//
const saveFile = (filepath) => {

    console.log(`Saving file ${filepath}`.blue);

    let result = {
        success: false,
        message: ''
    }

    try {
        // Test the file exists and terminiate it
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);

        // Build the RC Compatible data file
        let filedata = buildRCData();

        // finally we are done
        fs.writeFileSync(filepath, filedata, 'utf8');

        // Set the filename from the file path, this is the last part of the path
        const filename = filepath.split('/').pop();
        watch.setFilename(filename);
        watch.setFilePath(filepath);

        result.success = true;
        result.filename = filename;


    } catch (err) {
        console.error(err);
        result.message = err;
    }

    return result;
}

const getNumberOfLabelsFree = () => {
    return watch.getNumberOfLabelsFree();
}

export default {
    getData,
    addMemoLabel,
    addWeeklyLabel,
    addScheduledLabel,
    deleteLabelEntry,
    updateLabelEntry,
    addMemoData,
    addWeeklyData,
    updateWeeklyData,
    addScheduledAlarmData,
    deleteDataEntry,
    updateDataEntry,
    getPort,
    setPort,
    sendDataToWatch,
    loadFile,
    saveFile,
    saveCurrentFile,
    getNumberOfLabelsFree
}