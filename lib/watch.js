/**
 * Class for the watch object
 */

class Watch {

    constructor() {
        this.labels = [];
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

};

const watch = new Watch();

export {
    watch
};