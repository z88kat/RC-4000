/**
 *
 */

import Label from './label.js';
import {
    LabelType
} from './constants.js';

export default class WeeklyAlarm extends Label {
    constructor(label) {
        super(label, LabelType.WEEKLY_ALARM);
    }

    addData(data) {

        // Do nothing
    }
};