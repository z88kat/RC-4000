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
} from "./lib/parser.js";
import prompts from "prompts";
import {
    systemMenu
} from "./menus/system.js";
import {
    communicationsMenu
} from "./menus/communication.js";
import {
    editCreateWatchData
} from "./menus/create.js";
import {
    watch
} from "./lib/watch.js";

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
            // Set the filename
            watch.setFilename(options.load);
        } else {
            console.log(chalk.redBright('File does not exist'));
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
                    title: 'Quit Program',
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
        }
    }
};




// Set the current date time and update once per second
/*setInterval(() => {

    // Get the current date in the format DD-MM DAY
    let date = moment().format('DD-MM ddd') + ' ' + moment().format('HH:mm:ss');
    process.stdout.clearLine();
    process.stdout.cursorTo(process.stdout.columns - (date.length + 15));
    process.stdout.write(date + ' ' + moment().format('HH:mm:ss'));

}, 1000);*/


// Get the current date in the format DD-MM DAY
let date = moment().format('DD-MM ddd') + ' ' + moment().format('HH:mm:ss');

// Let us start

// Clear the console
process.stdout.write("\u001b[2J\u001b[0;0H");

console.log(chalk.blue('SEIKO'));
console.log(chalk.blue('Wrist Terminal RC-4000'));
console.log(chalk.blue('Data Manager Program'));
console.log(chalk.magenta(String.fromCharCode(9608) + ' Version ' + VERSION) + ' ' + String.fromCharCode(183) + ' ' + chalk.magenta(date));
console.log(chalk.magenta(''));
start().catch(err => {
    console.error('Error:');
    console.log(err);
    console.error('');
}).finally(() => {
    process.exit(0); // ensure that we really exit the process
});