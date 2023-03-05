/**
 *
 */

import prompts from "prompts";
import {
    sendData
} from "../lib/serial.js";

const communicationsMenu = async function () {

    let response = await prompts({
        type: 'select',
        name: 'menu',
        message: 'Communication Menu',
        choices: [{
                title: 'Send Data to Watch',
                description: 'Send data to the watch over the serial port',
                value: '1'
            },
            {
                title: String.fromCharCode(9204) + ' Main Menu',
                description: 'Return to the main menu',
                value: '5'
            }
        ],
    });

    switch (response.menu) {
        case '1':
            await sendData();
            break;
        case '5':
            //            console.log(chalk.green('Quitting'));
            break;
        default:
            //          console.log(chalk.green('Quitting'));
            break;
    }
};


export {
    communicationsMenu
}