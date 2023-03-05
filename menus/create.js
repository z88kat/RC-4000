/**
 * Edit Create Watch Data
 */
import prompts from "prompts";
import {
    watch
} from "../lib/watch.js";
import {
    LabelType
} from "../lib/constants.js";
import Memo from "../lib/memo.js";
import ScheduledAlarm from "../lib/scheduled-alarm.js";
import WeeklyAlarm from "../lib/weekly-alarm.js";

import chalk from "chalk";


//
// Edit the watch data
//
const editCreateWatchData = async function () {


    // Clear the console
    console.clear();

    // display the labels we are going to edit
    let labels = watch.getLabels();
    console.log(chalk.green('Edit/Create Watch Data'));
    //console.log(chalk.blue(' Lines Free: ' + watch.getNumberOfLinesFree()));
    console.log(chalk.blue('Labels Free: ' + watch.getNumberOfLabelsFree()));


    // Build the choices
    let choices = [];
    for (let i = 0; i < labels.length; i++) {
        // Add an icon for the type of label
        let icon = String.fromCharCode(9980);
        if (labels[i].isWeeklyAlarm()) icon = String.fromCharCode(2059);
        if (labels[i].isScheduledAlarm()) icon = String.fromCharCode(2055);
        choices.push({
            title: icon + ' ' + labels[i].label,
            value: i
        });
    }

    // add the new label option
    choices.push({
        title: '+ Add Memo Label',
        description: 'Add a new memo label',
        value: '90'
    });

    // We can only add one single scheduled alarm label
    if (!watch.hasScheduledAlarm()) {
        choices.push({
            title: '+ Add Schedule Alarm Label',
            description: 'Add a scheduled alarm label',
            value: '92'
        });
    }

    // We can only add one single weekly alarm label
    if (!watch.hasWeeklyAlarm()) {
        choices.push({
            title: '+ Add Weekly Alarm Label',
            description: 'Add a weekly alarm label',
            value: '94'
        });
    }

    // delete the label option, only if we have 1 or more labels
    if (labels.length > 0) {
        choices.push({
            title: '- Delete Label',
            description: 'Delete a label',
            value: '98'
        });
    }

    // finally add the back option
    choices.push({
        title: String.fromCharCode(9204) + ' Main Menu',
        description: 'Back to main menu',
        value: '99'
    });


    // display the menu to make a selection
    let response = await prompts({
        type: 'select',
        name: 'menu',
        message: 'Label Menu',
        choices: choices
    });

    // based upon the response grab the label and edit it
    if (response.menu == '90') { // memo
        // new memo label
        await addLabel(LabelType.MEMO);
    } else if (response.menu == '92') { // schedule
        // new schedule label
        await addLabel(LabelType.SCHEDULED_ALARM);
    } else if (response.menu == '94') { // weekly
        // new weekly label
        await addLabel(LabelType.WEEKLY_ALARM);
    } else if (response.menu == '98') { // delete
        // delete a label
        await deleteLabel();
    } else if (response.menu == '99') { // back
        // back to main menu
        return;
    } else {
        // Add Data entries to the selected label
        await editLabel(response.menu);
    }

    // re-display the menu
    await editCreateWatchData();

};

//
// Allow the user to input a new label (memo, weekly, schedule)
//
const addLabel = async function (labelType) {


    // prompt the user for the label name, max 24 characters
    let response = await prompts({
        type: 'text',
        name: 'label',
        message: 'Enter Label Name',
        validate: value => value.length < 25 ? true : 'Too long',
        onRender(kleur) {
            // Print the length of the value and prevent the user from typing more than 24 characters
            this.msg = kleur.yellow(this.value.length || '0');
            if (this.value.length > 24) {
                this.msg = kleur.red(this.value.length - 1);
                this.value = this.value.substring(0, 24);
            }
        },
    });

    // Do we have a label enry, otherwise just quit out
    if (response.label && response.label.length > 0) {

        // Create the correct type of label for the selected entry
        let label;
        if (labelType == LabelType.MEMO) {
            label = new Memo();
        } else if (labelType == LabelType.SCHEDULED_ALARM) {
            label = new ScheduledAlarm();
        } else if (labelType == LabelType.WEEKLY_ALARM) {
            label = new WeeklyAlarm();
        }

        label.setLabel(response.label);
        watch.addLabel(label);
    }

};


//
// Edit the watch label , display all the data attached to the label
//
const editLabel = async function (index) {


    if (index === undefined) return;

    let labels = watch.getLabels();
    let label = labels[index];
    if (!label) return;

    let data = label.getData();

    // display the data
    console.log(chalk.green('Edit/Create Watch Data for Label: ' + label.getLabel()));


    // Build the choices, based upon the data, this is a list of data attached to the  label
    let choices = [];
    for (let i = 0; i < data.length; i++) {
        choices.push({
            title: String.fromCharCode(9641) + ' ' + data[i],
            value: i
        });
    }

    // Add data entry
    choices.push({
        title: '+ Add Data',
        value: '80'
    });


    // Delete data entry (only if there is data)
    if (data.length > 0) {
        choices.push({
            title: '- Delete Data',
            value: '85'
        });
    }


    // Add editing of the label
    choices.push({
        title: String.fromCharCode(8860) + ' Modify Label Name',
        value: '90'
    });

    // Add the back to menu option
    choices.push({
        title: String.fromCharCode(9204) + ' Back to Label Menu',
        value: '99'
    });

    let response = await prompts({
        type: 'select',
        name: 'menu',
        message: 'Select Data to Edit',
        choices: choices
    });


    // based upon the response grab the label and edit it
    if (response.menu == '99') {
        // back to main menu
        return;
    } else if (response.menu == '90') {
        await editLabelName(label);
    } else if (response.menu == '85') {
        await deleteData(label);
    } else if (response.menu == '80') {
        // Add Memo Data or Alarm Data
        await addData(label);
    } else {

        // edit the selected data stored in the label
        let value;
        if (label.isMemo()) {
            value = await editMemoData(data[response.menu]);
        } else {
            value = await editAlarmData(label, response.menu);
        }
        // If the value is empty then delete the data
        if (value == '') {
            data.splice(response.menu, 1);
        } else if (value) {
            data[response.menu] = value;
        }
    }
    // redraw the screen
    await editLabel(index);
};

//
// Edit an existing label name
//
const editLabelName = async function (label) {

    let isLoaded = false;
    let data = label.getLabel();

    // Edit the data on the command line
    let response = await prompts({
        type: 'text',
        name: 'value',
        message: 'data:',
        initial: data,
        validate: value => value.length < 25 ? true : 'Too long',
        onRender(kleur) {
            // Set the initial value and cursor position
            if (!isLoaded && data) {
                this._value = data;
                this.cursor = data.length;
                isLoaded = true;
            }
            // Print the length of the value and prevent the user from typing more than 24 characters
            this.msg = kleur.yellow(this.value.length);
            if (this.value.length > 24) {
                this.msg = kleur.red(this.value.length - 1);
                this.value = this.value.substring(0, 24);
            }
        },
        onState(state) {
            //console.log(state);
        }
    });

    // update the label
    if (response.value && response.value.length > 0) {
        label.setLabel(response.value);
    }

};

//
// Edit an existing data item
//
const editMemoData = async function (data) {

    let isLoaded = false;

    // Edit the data on the command line
    let response = await prompts({
        type: 'text',
        name: 'value',
        message: 'data:',
        initial: data,
        validate: value => value.length < 25 ? true : 'Too long',
        onRender(kleur) {
            // Set the initial value and cursor position
            if (!isLoaded && data) {
                this._value = data;
                this.cursor = data.length;
                isLoaded = true;
            }
            // Print the length of the value and prevent the user from typing more than 24 characters
            this.msg = kleur.yellow(this.value.length);
            if (this.value.length > 24) {
                this.msg = kleur.red(this.value.length - 1);
                this.value = this.value.substring(0, 24);
            }
        },
        onState(state) {
            //console.log(state);
        }
    });

    // Get and return the value
    return response.value;

};


//
//
//
const editAlarmData = async function (label, index) {

    let isLoaded = false;

    let response = {
        value: '0'
    }

    let choices = [];

    choices.push({
        title: String.fromCharCode(8860) + ' Modify Label Name',
        value: '1'
    });
    choices.push({
        title: 'AM-PM',
        value: '2'
    });
    choices.push({
        title: 'Hours',
        value: '3'
    });
    choices.push({
        title: 'Minutes',
        value: '4'
    });
    choices.push({
        title: 'Days',
        value: '5'
    });
    choices.push({
        title: 'Quit',
        value: '99'
    });

    while (response.value != '99') {


        let data = label.getDataIndex(index);

        // Edit the data on the command line
        response = await prompts({
            type: 'select',
            name: 'value',
            message: data.full_label,
            choices: choices
        });

        if (!response.value) {
            response.value = '99';
        }

        switch (response.value) {
            case '1':
                // Edit the label name
                //await editLabelName(label);
                break;
            case '2':
                // Edit the AM/PM
                await toggleAMPM(label, index);
                break;
            case '3':
                // Edit the Hours
                await editHours(label, index);
                break;
            case '4':
                // Edit the Minutes
                await editMinutes(label, index);
                break;
            case '5':
                // Edit the Days
                await editDays(label, index);
                break;
        }
    }

    // Get and return the value
    //    return response.value;

};


//
// Toggle the time between AM and PM
//
const toggleAMPM = async function (label, index) {

    // prompts are a bit limited, but we make it work in the end.
    let response = await prompts({
        type: 'toggle',
        name: 'value',
        message: 'AM/PM ?',
        initial: true,
        active: 'AM',
        inactive: 'PM'
    });

    if (response.value) label.setAM(index);
    else label.setPM(index);
}

//
// Set the hour for the alarm
//
const editHours = async function (label, index) {

    let data = label.getDataIndex(index);


    let response = await prompts({
        type: 'number',
        name: 'value',
        message: 'Hour (1-12):',
        initial: data.hour,
        increment: 1,
        style: 'default',
        min: 1,
        max: 12
    });

    if (response.value) label.setHour(index, response.value);

}

//
// Set the hour for the alarm
//
const editMinutes = async function (label, index) {

    let data = label.getDataIndex(index);

    let response = await prompts({
        type: 'number',
        name: 'value',
        message: 'Hour (0-59):',
        initial: data.minute,
        increment: 1,
        style: 'default',
        min: 0,
        max: 59
    });

    label.setMinute(index, response.value);
}


//
// Delete one of the data entries
//
const deleteData = async function (label) {

    let data = label.getData();

    // display the data
    console.log(chalk.green('Delete Watch Data for Label: ' + label.getLabel()));

    // Build the choices, based upon the data
    let choices = [];
    for (let i = 0; i < data.length; i++) {
        choices.push({
            title: String.fromCharCode(9641) + ' ' + data[i],
            value: i
        });
    }

    // Add the back to menu option
    choices.push({
        title: String.fromCharCode(9204) + ' Back to Label Menu',
        value: '99'
    });

    let response = await prompts({
        type: 'select',
        name: 'menu',
        message: 'Select Entry to Delete',
        choices: choices
    });

    // based upon the response grab the label and edit it
    if (response.menu == '99') {
        // back to main menu
        return;
    }

    // delete the data
    label.removeData(response.menu);
}


//
// Add new data to the given label
//
const addData = async function (label) {

    let isLoaded = false;

    // The max length of the data is 24 characters for memo and 12 characters for alarm
    let maxLength = 24;
    if (!label.isMemo()) {
        maxLength = 12;
    }

    // Edit the data on the command line
    let response = await prompts({
        type: 'text',
        name: 'value',
        message: 'data:',
        validate: value => value.length <= maxLength ? true : 'Too long',
        onRender(kleur) {
            // Print the length of the value and prevent the user from typing more than 24 characters
            this.msg = kleur.yellow(this.value.length);
            if (this.value.length > maxLength) {
                this.msg = kleur.red(this.value.length - 1);
                this.value = this.value.substring(0, maxLength);
            }
        },
        onState(state) {
            //console.log(state);
        }
    });

    if (response.value && response.value.length > 0) {
        label.addRawData(response.value);
    }

};


//
// Delete a label and all associated data
//
const deleteLabel = async function () {


    // display the labels we are going to edit
    let labels = watch.getLabels();

    // Build the choices
    let choices = [];
    for (let i = 0; i < labels.length; i++) {
        choices.push({
            title: String.fromCharCode(9642) + ' ' + labels[i].label,
            value: i
        });
    }

    // finally add the back option
    choices.push({
        title: String.fromCharCode(9204) + ' Back to Main Menu',
        value: '99'
    });


    let response = await prompts({
        type: 'select',
        name: 'menu',
        message: 'Select Label to Remove',
        choices: choices
    });

    // Get the index of the label to delete
    let index = response.menu;
    // Now remove that label
    watch.removeLabel(index);


};

export {
    editCreateWatchData
}