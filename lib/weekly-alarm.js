/**
 * Parse the weekly alarm data
 * Compiles the data into a data object for saving
 *
 *
 * These are the 8 possible weekly alarms
 * The last entry is a repeat alarm for every day
 *
 * L - WEEKLY ------- ALARM - 2
 * d  - - - - -  1 MON A12:00 2
 * d  - - - - -  2 TUE A12:00 2
 * d  - - - - -  3 WED A12:00 2
 * d  - - - - -  4 THU A12:00 2
 * d  - - - - -  5 FRI A12:00 2
 * d  - - - - -  6 SAT A12:00 2
 * d  - - - - -  0 SUN A12:00 2
 * d  - - - - -  7 DAY A12:00 2
 *
 *
 */

import Label from './label.js';
import {
    LabelType,
    EmptyData
} from './constants.js';

export default class WeeklyAlarm extends Label {
    constructor(label) {
        super(label, LabelType.WEEKLY_ALARM);
    }

    //
    // Data for the weekly alarm is in the format of:
    // [ 12 characters] DoW DAY AM|PM HH:MM
    //
    // d MGR MEETING 1 MON A10:00 2
    //
    addData(data) {

        const memoData = data.substring(2, data.length - 2);
        if (memoData !== EmptyData) {

            // Get the data, parse it out into label, day, am/pm hour, minute
            const weekly = data.substring(2, data.length - 2);

            let label = weekly.substring(0, 12);
            let dayOfWeek = weekly.substring(12, 13);
            let dayString = weekly.substring(14, 17);
            let ampm = weekly.substring(18, 19);
            let hour = weekly.substring(19, 21);
            let minute = weekly.substring(22, 24);

            // What we do now is make a data object with all the infomration broken out
            let d = {
                label: label,
                dayOfWeek: dayOfWeek,
                dayString: dayString,
                ampm: ampm,
                hour: hour,
                minute: minute,
                full_label: label + ' ' + dayOfWeek + ' ' + dayString + ' ' + ampm + ' ' + hour + ':' + minute
            }

            //console.log(d);

            super.addData(d);
        }
    }

    //
    // Get the data in the format that we want to display
    //
    getData() {
        // The stored data is not in the format that we want to display
        let data = super.getData();

        if (!data || data.length === 0) return [];

        let result = [];

        data.forEach((item) => {

            let label = item.label;
            // Pad the label with spaces if it is less than 12 characters
            if (label.length < 12) {
                label = label.padEnd(12, ' ');
            }

            let d = label + item.dayOfWeek + ' ' + item.dayString + ' ' + item.ampm + ' ' + item.hour + ':' + item.minute;

            result.push(d);
        });

        return result;
    }

    getDataIndex(index) {
        let data = super.getData();

        //        if(data.length < index) return {}

        let item = data[index];

        return item;
    }

    //
    // Toggle the AM/PM
    //
    toggleAMPM(index) {
        let data = super.getData();

        let item = data[index];
        if (item.ampm === 'A') {
            item.ampm = 'P';
        } else {
            item.ampm = 'A';
        }
        item.full_label = item.label + item.dayOfWeek + ' ' + item.dayString + ' ' + item.ampm + ' ' + item.hour + ':' + item.minute;
    }

    setAM(index) {
        let data = super.getData();
        let item = data[index];
        item.ampm = 'A';
        item.full_label = item.label + item.dayOfWeek + ' ' + item.dayString + ' ' + item.ampm + ' ' + item.hour + ':' + item.minute;
    }

    setPM(index) {
        let data = super.getData();
        let item = data[index];
        item.ampm = 'P';
        item.full_label = item.label + item.dayOfWeek + ' ' + item.dayString + ' ' + item.ampm + ' ' + item.hour + ':' + item.minute;
    }

    setHour(index, hours) {
        let data = super.getData();
        let item = data[index];

        // If hours < 10 then we need to pad it with a 0
        if (hours < 10) {
            hours = '0' + hours;
        }

        item.hour = hours;
        item.full_label = item.label + item.dayOfWeek + ' ' + item.dayString + ' ' + item.ampm + ' ' + item.hour + ':' + item.minute;
    }

    setMinute(index, minutes = 0) {
        let data = super.getData();
        let item = data[index];

        // minutes needs to be 2 digits, so we need to pad it with a 0 if it is less than 10
        if (minutes < 10) {
            minutes = '0' + minutes;
        }

        item.minute = minutes;
        item.full_label = item.label + item.dayOfWeek + ' ' + item.dayString + ' ' + item.ampm + ' ' + item.hour + ':' + item.minute;
    }

    setDay(index, day) {

        // Day must be a DAY of the week such as MON, TUE, WED, THU, FRI, SAT, SUN, DAY
        if (day !== 'MON' && day !== 'TUE' && day !== 'WED' && day !== 'THU' && day !== 'FRI' && day !== 'SAT' && day !== 'SUN' && day !== 'DAY') day = 'MON';

        let data = super.getData();
        let item = data[index];

        // We need to map the day to the day of the week number
        switch (day) {
            case 'MON':
                item.dayOfWeek = '1';
                break;
            case 'TUE':
                item.dayOfWeek = '2';
                break;
            case 'WED':
                item.dayOfWeek = '3';
                break;
            case 'THU':
                item.dayOfWeek = '4';
                break;
            case 'FRI':
                item.dayOfWeek = '5';
                break;
            case 'SAT':
                item.dayOfWeek = '6';
                break;
            case 'SUN':
                item.dayOfWeek = '0';
                break;
            case 'DAY':
                item.dayOfWeek = '7';
                break;
        }
        item.dayString = day;
        item.full_label = item.label + item.dayOfWeek + ' ' + item.dayString + ' ' + item.ampm + ' ' + item.hour + ':' + item.minute;
    }

    //
    // Add data with no processing, this is label + default date
    //
    addRawData(label) {

        let dayOfWeek = '1';
        let dayString = 'MON';
        let ampm = 'A';
        let hour = '12';
        let minute = '00';

        let d = {
            label: label,
            dayOfWeek: dayOfWeek,
            dayString: dayString,
            ampm: ampm,
            hour: hour,
            minute: minute,
            full_label: label + dayOfWeek + ' ' + dayString + ' ' + ampm + ' ' + hour + ':' + minute
        }

        super.addRawData(d);

    }

    // override the getDataForSave method
    getDataForSave(includeCR = true) {
        let data = '';
        this.store.forEach((item) => {

            let label = item.label;
            // Pad the label with spaces if it is less than 12 characters
            if (label.length < 12) {
                label = label.padEnd(12, ' ');
            }

            data += 'd ' + label + item.dayOfWeek + ' ' + item.dayString + ' ' + item.ampm + item.hour + ':' + item.minute + ' ' + this.type;

            if (includeCR) data += '\r\n';
        });
        return data;
    }

    //
    // Build the data string for transfer to the watch
    // The alarm has a fixed format for being sent to the watch
    // 12 bytes for the label of the alarm
    // 12 for the alarm data
    // The time must be in the following format "# DAY {A|P}HH:MM"
    // Where # is the day of the week 0-6 or 7 for everyday
    // DAY is the 3 letter abbreviation for the day of the week
    // eg: 1 MON P08:15
    //
    getDataForTransfer() {
        let data = '';
        this.store.forEach((item) => {

            let label = item.label;
            // Pad the label with spaces if it is less than 12 characters
            if (label.length < 12) {
                label = label.padEnd(12, ' ');
            }

            let lb = 'd' + label + item.dayOfWeek + ' ' + item.dayString + ' ' + item.ampm + item.hour + ':' + item.minute;
            //console.log('Weely Alarm: ' + lb + ':' + lb.length);
            data += lb; //
        });
        return data;
    }

    // 0x00 = label
    // 0x10 = scheduled alarm
    // 0x20 = weekly alarm
    getDataTypeForTransfer() {
        return 0x20;
    }
};