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
        const file = await fs.readFile(options.load, 'utf8');
        //console.log(file);
        parse(file);
    }

};

// Let us start
console.log('');
console.log('');
start().catch(err => {
    console.error('Error:');
    console.log(err);
    console.error('');
}).finally(() => {
    process.exit(0); // ensure that we really exit the process
});