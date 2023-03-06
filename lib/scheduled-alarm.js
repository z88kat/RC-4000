/**
 * Parse the data file for the scheduled alarms.  These are alarms which are scheduled
 * for a specific date and time.  There can only be one scheduled alarm on the watch.
 *
 * The schedule is in the format
 *
 * L - SCHEDULE ----- ALARM - 1
 * d  - - - - -  02/02 A12:00 1
 * d  - - - - -  04/01 P09:10 1
 * d  - - - - -  01/01 A12:00 1
 * d  - - - - -  01/01 A12:00 1
 *
 *
 */

import Label from './label.js';
import {
    LabelType
} from './constants.js'; // Type 1 is the schedule alarm

export default class ScheduledAlarm extends Label {
    constructor(label) {
        super(label, LabelType.SCHEDULED_ALARM);
    }

    //
    // Data for the schedule alarm is in the format of:
    // [ 12 characters] MM/DD AM|PM HH:MM
    //
    // d  - - - - -  02/02 A12:00 1
    //
    addData(data) {
        // Get the data, parse it out into label, day, am/pm hour, minute
        const weekly = data.substring(2, data.length - 2);

        let label = weekly.substring(0, 11);
        let month = weekly.substring(12, 14);
        let day = this.checkDayIsValid(month, weekly.substring(16, 17));
        let ampm = weekly.substring(18, 19);
        let hour = weekly.substring(19, 21);
        let minute = weekly.substring(22, 24);

        // What we do now is make a data object with all the infomration broken out
        let d = {
            label: label,
            month: month,
            day: day,
            ampm: ampm,
            hour: hour,
            minute: minute,
            full_label: label + ' ' + month + '/' + day + ' ' + ampm + ' ' + hour + ':' + minute
        }

        super.addData(d);
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

            let d = label + item.month + '/' + item.day + ' ' + item.ampm + ' ' + item.hour + ':' + item.minute;

            result.push(d);
        });

        return result;
    }

    getDataIndex(index) {
        let data = super.getData();

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
        item.full_label = item.label + ' ' + item.month + '/' + item.day + ' ' + item.ampm + ' ' + item.hour + ':' + item.minute;
    }

    setAM(index) {
        let data = super.getData();
        let item = data[index];
        item.ampm = 'A';
        item.full_label = item.label + ' ' + item.month + '/' + item.day + ' ' + item.ampm + ' ' + item.hour + ':' + item.minute;
    }

    setPM(index) {
        let data = super.getData();
        let item = data[index];
        item.ampm = 'P';
        item.full_label = item.label + ' ' + item.month + '/' + item.day + ' ' + item.ampm + ' ' + item.hour + ':' + item.minute;
    }

    setHour(index, hours) {
        let data = super.getData();
        let item = data[index];

        // The hour needs to be 2 digits, so we need to pad it with a 0 if it is less than 10
        if (hours < 10) {
            hours = '0' + hours;
        }

        item.hour = hours;
        item.full_label = item.label + ' ' + item.month + '/' + item.day + ' ' + item.ampm + ' ' + item.hour + ':' + item.minute;
    }

    setMinute(index, minutes = 0) {
        let data = super.getData();
        let item = data[index];

        // minutes needs to be 2 digits, so we need to pad it with a 0 if it is less than 10
        if (minutes < 10) {
            minutes = '0' + minutes;
        }

        item.minute = minutes;
        item.full_label = item.label + ' ' + item.month + '/' + item.day + ' ' + item.ampm + ' ' + item.hour + ':' + item.minute;
    }

    setDay(index, day) {

        let data = super.getData();
        let item = data[index];

        // Day must be a DAY of the month, not a day of the week
        // So we need to check that the day is valid for the month
        day = this.checkDayIsValid(item.month, day);
        item.day = day;
        item.full_label = item.label + ' ' + item.month + '/' + item.day + ' ' + item.ampm + ' ' + item.hour + ':' + item.minute;
    }

    setMonth(index, month) {

        let data = super.getData();
        let item = data[index];

        // Month must be 2 digits prefix with a 0 when < 10
        if (month < 10) {
            month = '0' + month;
        }

        // Month must be a valid month
        item.month = month;
        item.full_label = item.label + ' ' + item.month + '/' + item.day + ' ' + item.ampm + ' ' + item.hour + ':' + item.minute;
    }



    // Month in JavaScript is 0-indexed (January is 0, February is 1, etc),
    // but by using 0 as the day it will give us the last day of the prior
    // month. So passing in 1 as the month number will return the last day
    // of January, not February
    //
    // July
    // daysInMonth(7,2009); // 31
    // February
    // daysInMonth(2,2009); // 28
    // daysInMonth(2,2008); // 29
    //
    daysInMonth(month, year) {

        // month needs to be a string
        month = month.toString();

        // If the year is undefined, use the current year
        if (year === undefined) {
            year = new Date().getFullYear();
        }

        // if the month is prefixed with a 0 (i.e. 01), remove the 0
        if (month.substring(0, 1) === '0') {
            month = month.substring(1, 2);
        }

        return new Date(year, month, 0).getDate();
    }

    //
    // check and return a day for the month (current year)
    //
    checkDayIsValid(month, day) {

        let isValid = this.isValidDay(month, day);
        if (!isValid) {
            day = 1;
        }

        // The day must be prefix with 0 when < 10
        if (day < 10) {
            day = '0' + day;
        }

        return day;
    }

    //
    // Validate that a given day is valid for a given month
    //
    isValidDay(month, day) {
        let daysInMonth = this.daysInMonth(month);

        return day <= daysInMonth;
    }

    //
    // Validate that a given month is valid
    //
    isValidMonth(month) {
        return month >= 1 && month <= 12;
    }

    //
    // Validate that a given hour is valid
    //
    isValidHour(hour) {
        return hour >= 1 && hour <= 12;
    }

    //
    // Validate that a given minute is valid
    //
    isValidMinute(minute) {
        return minute >= 0 && minute <= 59;
    }

    //


};