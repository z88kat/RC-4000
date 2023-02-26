/**
 *
 *
 *
 */
// .env needs to exist with the environment variables
import "dotenv/config.js";
import chalk from 'chalk';
// Need to specify target prod otherwise it does not run
import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import fs from 'fs-extra';
import {
    parse
} from "./lib/parser.js";
import prompts from "prompts";
// Terminal kit is used for the terminal, did not have the time to use this right now
//import terminal from 'terminal-kit';
//const term = terminal.terminal;
import {
    systemMenu
} from "./menus/system.js";
import {
    watch
} from "./lib/watch.js";


const optionDefinitions = [{
        name: 'load',
        type: String
    },
    {
        name: 'help',
        type: Boolean,
        default: false
    }
];

const sections = [{
        header: 'Seiko RC-1000/4000 Watch Manager',
        content: 'Allows the sending of commands to the watch.'
    },
    {
        header: 'Options',
        optionList: [{
                name: 'load',
                description: 'Load a previous saved configuration file for your watch.',
                type: String
            },
            {
                name: 'help',
                description: 'Print this usage guide.',
                type: Boolean
            }
        ]
    }
];

const usage = commandLineUsage(sections);
const options = commandLineArgs(optionDefinitions);

/**
 * Start the job
 */
const start = async function () {

    if (options.help) {
        console.log(usage);
        return;
    }

    if (options.load) {
        console.log(chalk.green('Loading file: ' + options.load));

        // Test the file exists
        if (fs.existsSync(options.load)) {
            const file = await fs.readFile(options.load, 'utf8');
            //console.log(file);
            parse(file);
        } else {
            console.log(chalk.red('File does not exist'));
        }

    }

    // Now read console input
    await readConsole();

    //term.moveTo(1, 1, 'Hello, world!')
    //term.red('Helloer, world!')

};


//
// Main Menu
//
const readConsole = async function () {

    let response = {
        menu: '1'
    };

    while (response.menu != '5') {
        response = await prompts({
            type: 'select',
            name: 'menu',
            message: 'Main Menu',
            choices: [{
                    title: 'Edit Create Watch Data',
                    value: '1'
                },
                {
                    title: 'Communications Menu',
                    value: '2'
                },
                {
                    title: 'Print Watch Data',
                    value: '3'
                },
                {
                    title: 'System Menu',
                    value: '4'
                },
                {
                    title: 'Quit',
                    value: '5'
                }
            ],
        });
        //console.log(response);

        switch (response.menu) {
            case '1':
                await editCreateWatchData();
                break;
            case '2':
                await communicationsMenu();
                break;
            case '3':
                await printWatchData();
                break;
            case '4':
                await systemMenu();
                break;
            case '5':
                console.log(chalk.green('Quitting'));
                break;
            default:
                console.log(chalk.green('Quitting'));
                break;
        }
    }
};


//
//
//
const editCreateWatchData = async function () {


    // display the labels we are going to edit
    let labels = watch.getLabels();
    console.log(chalk.green('Edit/Create Watch Data'));
    console.log(chalk.green(`${labels.length} / 11 labels`));

    // Build the choices
    let choices = [];
    for (let i = 0; i < labels.length; i++) {
        choices.push({
            title: '> ' + labels[i].label,
            value: i
        });
    }

    // add the new label option
    choices.push({
        title: '+ New Label',
        value: '90'
    });

    // finally add the back option
    choices.push({
        title: '< Back to Main Menu',
        value: '99'
    });


    let response = await prompts({
        type: 'select',
        name: 'menu',
        message: 'Select Label to Edit',
        choices: choices
    });

    // based upon the response grab the label and edit it
    if (response.menu == '90') {
        // new label
        await newLabel();
    }
    if (response.menu == '99') {
        // back to main menu
        return;
    }

    // edit the label
    await editLabel(response.menu);

};


//
//
//
const editLabel = async function (index) {

    let labels = watch.getLabels();
    let label = labels[index];
    let data = label.getData();

    // display the data
    console.log(chalk.green('Edit/Create Watch Data'));


    // Build the choices, based upon the data
    let choices = [];
    for (let i = 0; i < data.length; i++) {
        choices.push({
            title: '> ' + data[i],
            value: i
        });
    }

    // Add the back to menu option
    choices.push({
        title: '< Back to Label Menu',
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
    }

    // edit the label
    let value = await editData(data[response.menu]);
    // If the value is empty then delete the data
    if (value == '') {
        data.splice(response.menu, 1);
    } else {
        data[response.menu] = value;
    }
    // redraw the screen
    await editLabel(index);
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
            if (!isLoaded) {
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


// Let us start
console.log(chalk.blue('SEIKO'));
console.log(chalk.blue('Wrist Terminal RC-4000'));
console.log(chalk.blue('Data Manager Program'));
console.log('');
console.log(chalk.magenta('Version 1.0'));
console.log(chalk.magenta(''));
start().catch(err => {
    console.error('Error:');
    console.log(err);
    console.error('');
}).finally(() => {
    process.exit(0); // ensure that we really exit the process
});