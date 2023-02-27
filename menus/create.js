/**
 * Edit Create Watch Data
 */
import prompts from "prompts";
import {
    watch
} from "../lib/watch.js";
import Memo from "../lib/memo.js";
import chalk from "chalk";


//
// Edit the watch data
//
const editCreateWatchData = async function () {


    // display the labels we are going to edit
    let labels = watch.getLabels();
    console.log(chalk.green('Edit/Create Watch Data'));
    //console.log(chalk.blue(' Lines Free: ' + watch.getNumberOfLinesFree()));
    console.log(chalk.blue('Labels Free: ' + watch.getNumberOfLabelsFree()));


    // Build the choices
    let choices = [];
    for (let i = 0; i < labels.length; i++) {
        choices.push({
            title: String.fromCharCode(9642) + ' ' + labels[i].label,
            value: i
        });
    }

    // add the new label option
    choices.push({
        title: '+ New Memo Label',
        value: '90'
    });

    // delete the label option
    choices.push({
        title: '- Delete Label',
        value: '92'
    });

    // finally add the back option
    choices.push({
        title: String.fromCharCode(9204) + ' Back to Main Menu',
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
    if (response.menu == '90') {
        // new label
        await addMemoLabel();
    } else if (response.menu == '92') {
        // new label
        await deleteLabel();
    } else if (response.menu == '99') {
        // back to main menu
        return;
    } else {
        // edit the label data
        await editLabel(response.menu);
    }

    // re-display the menu
    await editCreateWatchData();

};

//
// Allow the user to input a new label
//
const addMemoLabel = async function () {


    let response = await prompts({
        type: 'text',
        name: 'label',
        message: 'Enter Label Name',
        validate: value => value.length < 25 ? true : 'Too long',
        onRender(kleur) {
            // Print the length of the value and prevent the user from typing more than 24 characters
            this.msg = kleur.yellow(this.value.length);
            if (this.value.length > 24) {
                this.msg = kleur.red(this.value.length - 1);
                this.value = this.value.substring(0, 24);
            }
        },
    });

    if (response.label && response.label.length > 0) {
        let label = new Memo();
        label.setLabel(response.label);
        watch.addLabel(label);
    }

};


//
// Edit the watch label , display all the data attached to the label
//
const editLabel = async function (index) {

    if (!index) return;

    let labels = watch.getLabels();
    let label = labels[index];
    if (!label) return;

    let data = label.getData();

    // display the data
    console.log(chalk.green('Edit/Create Watch Data for Label: ' + label.getLabel()));


    // Build the choices, based upon the data
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
    } else if (response.menu == '80') {
        await addData(label);
    } else {

        // edit the label
        let value = await editData(data[response.menu]);
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
//
//
const editData = async function (data) {

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
// Add new data to the given label
//
const addData = async function (label) {

    let isLoaded = false;

    // Edit the data on the command line
    let response = await prompts({
        type: 'text',
        name: 'value',
        message: 'data:',
        validate: value => value.length < 25 ? true : 'Too long',
        onRender(kleur) {
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

    if (response.value && response.value.length > 0) {
        label.addRawData(response.value);
    }

};


/**
 * Delete a label and all associated data
 */
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