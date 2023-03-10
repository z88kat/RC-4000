/**
 * Labels are split into 2 rows of 12 characters, max 24 characters per label
 */

import {
    LabelType
} from "./constants.js";

//
// @param {string} label - The label (text value until 24 characters)
// @param {string} type - The type of label (e.g. MEMO(1), WEEKYL_ALARM(2), SCHEDULED_ALARM(1))
//
export default class Label {
    constructor(label, type) {

        // The label starts at the 2nd character and ends at the 2nd last character
        if (label) {
            this.label = label.substring(2, label.length - 2);
        }
        this.type = type;
        this.store = [];
    }

    addData(data) {
        // Add the data to the store
        this.store.push(data);
    }

    //
    // Add data with no processing
    //
    addRawData(data) {
        this.store.push(data);
    }

    removeData(index) {
        this.store.splice(index, 1);
    }

    getData() {
        return this.store;
    }

    getDataForSave(includeCR = true) {
        let data = '';
        this.store.forEach((item) => {
            data += 'd ' + item + ' ' + this.type;

            if (includeCR) data += '\r\n';
        });
        return data;
    }

    getDataForTransfer() {
        let data = '';
        this.store.forEach((item) => {
            data += 'd' + item;
        });
        return data;
    }

    setLabel(label) {
        this.label = label;
    }

    getLabel() {
        return this.label;
    }

    getLabelForSave() {
        let label = this.getLabel();
        // Label needs to be 24 characters long, pad with spaces
        label = label.padEnd(24);
        return 'L ' + label + ' ' + this.type;
    }

    getLabelForTransfer() {
        return 'L' + this.getLabel();
    }

    setType(type) {
        this.type = type;
    }

    getType() {
        return this.type;
    }

    isMemo() {
        return this.type === LabelType.MEMO;
    }

    isWeeklyAlarm() {
        return this.type === LabelType.WEEKLY_ALARM;
    }

    isScheduledAlarm() {
        return this.type === LabelType.SCHEDULED_ALARM;
    }


};