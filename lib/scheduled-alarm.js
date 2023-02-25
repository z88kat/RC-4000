/**
 *
 */

import Label from './label.js';
import {
    LabelType
} from './constants.js';

export default class ScheduledAlarm extends Label {
    constructor(label) {
        super(label, LabelType.SCHEDULED_ALARM);
    }

    addData(data) {
        // Do nothing
    }
};