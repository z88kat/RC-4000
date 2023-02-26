/**
 * Class for the watch object
 */

class Watch {

    constructor() {
        this.labels = [];
        this.filename = '';
    }

    setFilename(filename) {
        this.filename = filename;
    }

    getFilename() {
        return this.filename;
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
    // Add a label to the watch, max is 11 labels
    //
    addLabel(label) {

        if (this.labels.length > 11) {
            throw new Error('Maximum number of labels reached');
        }
        this.labels.push(label);
    }

    getLabels() {
        return this.labels;
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

};

const watch = new Watch();

export {
    watch
};