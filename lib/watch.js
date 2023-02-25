/**
 * Class for the watch object
 */

export default class Watch {




    constructor(lines) {

        let data = {
            numberOfLines: lines,
            weeklyAlarm: [],
            scheduledAlarm: [],
            memo: []
        };

        this.data = data;
    }

    //
    // Adds a weekly alarm entry, this needs to be parsed
    // this is in the format of:
    //   - - - - -  1 MON A08:00
    //
    addWeeklyAlarm(alarm) {


    }


};