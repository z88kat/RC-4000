/**
 * Labels are split into 2 rows of 12 characters, max 24 characters per label
 */



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
        return 'L ' + this.getLabel() + ' ' + this.type;
    }

    getLabelForTransfer() {
        return 'L' + this.getLabel();
    }


};