/**
 *
 */

import Label from './label.js';
import {
    LabelType
} from './constants.js';

export default class Memo extends Label {


    constructor(label) {
        super(label, LabelType.MEMO);
        this.store = [];
    }

    //
    // Add data to the memo
    // Now the data is just a string starting at the 2nd character and ending at the 2nd last character
    //
    addData(data) {

        // Get the data
        const memoData = data.substring(2, data.length - 2);

        // Add the data to the store
        this.store.push(memoData);
    }
};