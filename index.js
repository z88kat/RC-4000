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
                console.log(chalk.red('Unknown menu option'));

        }
    }
};

//
// Save/Load Watch Data
//
const systemMenu = async function () {

    let response = await prompts({
        type: 'select',
        name: 'menu',
        message: 'Main Menu',
        choices: [{
                title: 'Load Data',
                value: '1'
            },
            {
                title: 'Save Data',
                value: '2'
            },
            {
                title: 'Back to Main Menu',
                value: '5'
            }
        ],
    });
    if (response.menu == '1') {
        await loadFile();
    }
    //    console.log(response);
};

const loadFile = async function () {

    let response = await prompts({
        type: 'text',
        name: 'filename',
        message: 'Enter filename to load',
    });

    // Test the file exists
    if (fs.existsSync(response.filename)) {
        const file = await fs.readFile(response.filename, 'utf8');
        //console.log(file);
        parse(file);
    } else {
        console.log(chalk.redBright('File does not exist'));
    }
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