/**
 *
 */

import prompts from "prompts";
import {
    sendData
} from "../lib/serial.mjs";

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

    // Send the data to the watch
    if (response.menu == 1) {
        try {
            await sendData();
        } catch (error) {
            console.error(error);
        }
    }
};


export {
    communicationsMenu
}