/**
 * This is a wrapper around the main menu functions so that we acn access functons
 * like addMemoLabel() from the renderer process
 */

import Memo from "./memo.mjs";
import watch from "./watch.mjs";

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

}

export {
    addMemoLabel
}

export default {
    addMemoLabel: addMemoLabel
}