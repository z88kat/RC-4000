/**
 *
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

    getData() {
        return this.store;
    }

    getDataForSave() {
        let data = '';
        this.store.forEach((item) => {
            data += 'd ' + item + ' ' + this.type + '\r\n';
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
};