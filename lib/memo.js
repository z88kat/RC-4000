/**
 *
 */

import Label from './label.js';
import {
    LabelType,
    EmptyData
} from './constants.js';

export default class Memo extends Label {


    constructor(label) {
        super(label, LabelType.MEMO);
    }

    //
    // Add data to the memo
    // Now the data is just a string starting at the 2nd character and ending at the 2nd last character
    // Data is in the format of:
    // d NYC-LON     BA178 13:45  0
    //
    addData(data) {

        // Get the data
        const memoData = data.substring(2, data.length - 2);

        //        console.log('#' + memoData + '#');
        if (memoData !== EmptyData) {
            super.addData(memoData);
        }
    }

    getData() {
        return super.getData();
    }

    // 0x00 = label
    // 0x10 = scheduled alarm
    // 0x20 = weekly alarm
    getDataTypeForTransfer() {
        return 0x00;
    }

};