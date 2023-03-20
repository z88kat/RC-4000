/**
 * Seiko RC-1000/4000 Watch Manager
 *
 * https://symbl.cc/en/search/?q=block
 */
import chalk from 'chalk';
import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import fs from 'fs-extra';
import {
    parse
} from "./lib/parser.mjs";
import prompts from "prompts";
import {
    systemMenu
} from "./menus/system.mjs";
import {
    communicationsMenu
} from "./menus/communication.mjs";
import {
    editCreateWatchData
} from "./menus/create.mjs";
import {
    watch
} from "./lib/watch.mjs";

import moment from 'moment';

const VERSION = '1.0';


const optionDefinitions = [{
        name: 'load',
        type: String
    },
    {
        name: 'port',
        type: String,
        default: '/dev/ttyUSB0'
    }, {
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
                name: 'port',
                description: 'The serial port to use to communicate with the watch. Default is /dev/ttyUSB0',
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


let usage, options;
try {
    usage = commandLineUsage(sections);
    options = commandLineArgs(optionDefinitions);
} catch (err) {
    console.log(chalk.redBright('Error parsing command line options. try --help'));
    process.exit(1);
}

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
            // Set the filename
            watch.setFilename(options.load);
        } else {
            console.log(chalk.redBright('File does not exist'));
        }

    }

    // Now read console input
    await readConsole();

};


//
// Main Menu
//
const readConsole = async function () {

    let response = {
        menu: '1'
    };

    // Continue to display the menu unti quit is selected
    while (response.menu != '5') {
        // console.clear();
        response = await prompts({
            type: 'select',
            name: 'menu',
            message: 'Main Menu',
            choices: [{
                    title: 'Edit Create Watch Data',
                    description: 'Edit or create watch data',
                    value: '1'
                },
                {
                    title: 'Communications Menu',
                    value: '2',
                    description: 'Send data to the watch'
                },
                // {
                //     title: 'Print Watch Data',
                //     description: 'Print the current watch data',
                //     value: '3'
                // },
                {
                    title: 'System Menu',
                    description: 'Load and save data',
                    value: '4'
                },
                {
                    title: String.fromCharCode(9204) + ' Quit Program',
                    description: 'Quit the program',
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
                // There is no easy way to print the watch data
                // case '3':
                //     await printWatchData();
                //     break;
            case '4':
                await systemMenu();
                break;
            case '5':
                console.log(chalk.green('Quitting'));
                break;
            default:
                console.log(chalk.red('Invalid option'));
                break;
        }
    }
};

// Clear the console
console.clear();

// Will display the current data and time, like a watch
// Set the current date time and update once per second
let timer = setInterval(() => {
    // Get the current date in the format DD-MM DAY
    const dateFormat = moment().format('DD-MM ddd') + ' ' + moment().format('HH:mm:ss');
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    //process.stdout.cursorTo(process.stdout.columns - (date.length + 15));
    process.stdout.write(chalk.magenta(dateFormat));
}, 1000);

//
// Let us start
//


const letsGetStarted = async function () {


    let line = '';
    for (let i = 0; i < 34; i++) {
        line += String.fromCharCode(8213);
    }

    // Take a look here for some ascii art
    // https://symbl.cc/en/search/?q=square
    console.log(chalk.blue('SEIKO'));
    console.log(chalk.blue('Wrist Terminal RC-1000 / RC-4000'));
    console.log(chalk.blue('Data Manager Program'));
    console.log(chalk.gray(line));
    console.log(chalk.magenta(String.fromCharCode(9608) + ' Version ' + VERSION) + ' ' + String.fromCharCode(183) + ' ' + options.load);
    console.log(chalk.gray(line));
    console.log(chalk.gray('Please read the operation manual before using this program.'));
    console.log(chalk.gray(line));
    console.log(chalk.white(String.fromCharCode(9642) + ' Schedule Alarms'));
    console.log(chalk.white(String.fromCharCode(9642)) + ' Weekly/Daily Alarms');
    console.log(chalk.white(String.fromCharCode(9642)) + ' Memos');
    console.log('');

    // This is a funny bug whereby the select prompt gets displayed twice, i work around it by displaying this
    // simple confirm prompt first
    let response = await prompts({
        type: 'confirm',
        name: 'value',
        message: 'Continue?',
        initial: true
    });

    // remove the display of the clock
    clearInterval(timer);


    // Clear the console
    if (response.value) {
        console.clear();
        start().catch(err => {
            console.error('Error:');
            console.error(err);
            console.error('');
        }).finally(() => {
            process.exit(0); // ensure that we really exit the process
        });
    } else {
        process.exit(0);
    }

};


//
// Display welcome message and start prompt
//
letsGetStarted().catch(err => {
    console.error('Error:');
    console.error(err);
});