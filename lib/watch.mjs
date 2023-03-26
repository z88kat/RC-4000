/**
 * Class for the watch object
 */
import {
    LabelType
} from "./constants.mjs";


class Watch {

    constructor() {
        this.labels = [];
        this.filename = '';
        this.filepath = ''; // We need this for the electron app
    }

    setFilename(filename) {
        this.filename = filename;
    }

    getFilename() {
        return this.filename;
    }

    setFilePath(filepath) {
        this.filepath = filepath;
    }

    getFilePath() {
        return this.filepath;
    }

    setNumberOfLines(lines) {
        this.data.numberOfLines = lines;
    }

    getNumberOfLines() {

        let count = 0;
        // Basically we just count the number of labels and data in those labels
        this.labels.forEach((label) => {
            count += 1;
            count += label.getData().length;
        });

        return count;
        //        return this.data.numberOfLines;
    }

    //
    // The maximum number of lines that can be added to the watch is 80
    //
    getNumberOfLinesFree() {
        // calculate the number of lines used and subtract from 80
        return 80 - this.getNumberOfLines();
    }

    //
    // Adds a weekly alarm entry, this needs to be parsed
    // this is in the format of:
    //   - - - - -  1 MON A08:00
    //
    addWeeklyAlarm(alarm) {


    }

    //
    // We are only allowed one weekly alarm
    //
    hasWeeklyAlarm() {
        // Loop over the labels array and check if we have a weekly alarm
        // If we do then return true
        // If we don't then return false
        return this.labels.some(e => e.type === LabelType.WEEKLY_ALARM);
    }


    //
    // We are only allowed one scheduled alarm
    //
    hasScheduledAlarm() {
        // Loop over the labels array and check if we have a scheduled alarm
        // If we do then return true
        // If we don't then return false
        return this.labels.some(e => e.type === LabelType.SCHEDULED_ALARM);
    }

    //
    // Check if we have a memo
    //
    hasMemo() {
        // Loop over the labels array and check if we have a memo
        // If we do then return true
        // If we don't then return false
        return this.labels.some(e => e.type === LabelType.MEMO);
    }

    //
    // Add a label to the watch, max is 11 labels
    //
    addLabel(label) {

        if (this.labels.length > 11) {
            throw new Error('Maximum number of labels reached');
        }
        this.labels.push(label);
    }

    //
    // Get all the labels for the watch in the correct order
    //
    getLabels() {
        // Labels should be in a specific order
        // Weekly alarm
        // Scheduled alarm
        // Memo
        let data = [];
        // only add the weekly alarm if there is at least one entry
        if (this.hasWeeklyAlarm()) {
            data = data.concat(this.getWeeklyAlarmLabel());
        }
        // only add the scheduled alarm if there is at least one entry
        if (this.hasScheduledAlarm()) {
            data = data.concat(this.getScheduledAlarmLabel());
        }
        // add the memo labels
        if (this.hasMemo()) {
            data = data.concat(this.getMemoLabels());
        }

        return this.labels;
    }

    getMemoLabels() {
        return this.labels.filter(e => e.type === LabelType.MEMO);
    }

    getWeeklyAlarmLabel() {

        // Get the weekly alarm object from the labels array
        return this.labels.filter(e => e.type === LabelType.WEEKLY_ALARM);
    }

    getScheduledAlarmLabel() {
        return this.labels.filter(e => e.type === LabelType.SCHEDULED_ALARM);
    }

    //
    // Remove a specific label (and all data)
    //
    removeLabel(index) {
        this.labels.splice(index, 1);
    }

    getNumberOfLabels() {
        return this.labels.length;
    }

    getNumberOfLabelsFree() {
        return 11 - this.getNumberOfLabels();
    }

    // Reset back to the default state
    reset() {
        this.labels = [];
        this.filename = '';
    }

};

// create a singleton
const watch = new Watch();

export {
    watch
};

export default watch;