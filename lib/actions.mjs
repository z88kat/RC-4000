/**
 * This is a wrapper around the main menu functions so that we acn access functons
 * like addMemoLabel() from the renderer process
 */

import Memo from "./memo.mjs";
import ScheduledAlarm from "./scheduled-alarm.mjs";
import watch from "./watch.mjs";
import WeeklyAlarm from "./weekly-alarm.mjs";

// Add a memo label to the watch
const addMemoLabel = (name) => {

    //if (!name) return;

    // should not be > 24 chars
    if (name.length > 24) {
        name = name.substring(0, 24);
    }
    // should be in upper case
    name = name.toUpperCase();

    let label = new Memo()
    label.setLabel(name);
    watch.addLabel(label);

    return label;
}

// Add a weekly label to the watch
const addWeeklyLabel = (name) => {

    //if (!name) return;

    // should not be > 24 chars
    if (name.length > 24) {
        name = name.substring(0, 24);
    }
    // should be in upper case
    name = name.toUpperCase();

    let label = new WeeklyAlarm()
    label.setLabel(name);
    watch.addLabel(label);

    return label;
}

// Add a scheduled label to the watch
const addScheduledLabel = (name) => {

    //if (!name) return;

    // should not be > 24 chars
    if (name.length > 24) {
        name = name.substring(0, 24);
    }
    // should be in upper case
    name = name.toUpperCase();

    let label = new ScheduledAlarm()
    label.setLabel(name);
    watch.addLabel(label);

    return label;
}

//
// Delete a label from the watch using the given ID
//
const deleteLabelEntry = (id) => {

    watch.getLabels().forEach((label, index) => {
        if (label.id == id) {
            watch.removeLabel(index);
        }
    });

};

export {
    addMemoLabel,
    addWeeklyLabel,
    addScheduledLabel,
    deleteLabelEntry
}

export default {
    addMemoLabel: addMemoLabel,
    addWeeklyLabel: addWeeklyLabel,
    addScheduledLabel: addScheduledLabel,
    deleteLabelEntry: deleteLabelEntry
}