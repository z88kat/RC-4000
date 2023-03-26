/**
 * Frontend application code
 */

// jquery is ready
$(document).ready(function () {
    // init the application
    initApplication();
    // check the label status and disable buttons if needed
    checkLabelNumberStatus();
});

//
// Setup the UI events
//
const initApplication = () => {
    // set the timestamp
    $('#timestamp').html('2021-01-01 00:00:00');

    $('#btnWeekly').click(addWeelkyLabel);
    $('#btnScheduled').click(addScheduledLabel);
    $('#btnMemo').click(addMemoLabel);

    // add a new memo label entry
    $('#btnAddMemoLabel').click(addMemoLabelEntry);
    // add a new scheduled label entry
    $('#btnAddScheduledLabel').click(addScheduledLabelEntry);
    // add a new weekly label entry
    $('#btnAddWeeklyLabel').click(addWeeklyLabelEntry);

    // edit a label entry
    $(document).on('click', '.edit-entry', editLabelEntry);
    // delete a label entry
    $(document).on('click', '.delete-entry', deleteLabelEntry);

    // add a new data entry, show the dialog
    $(document).on('click', '.add-data-entry', addDataEntryDialog);
    $('#btnAddMemoData').click(addMemoDataEntry);

    // delete a data entry
    $(document).on('click', '.delete-data', deleteDataEntry);

    // send data to watch
    $('#btnSendData').on('click', sendDataToWatch);

    // save the port
    $('#btnSaveSerialPort').on('click', saveSerialPort);

    // capture all text entered into the input fields and make uppercase
    $('.form-input').on('input', function () {
        this.value = this.value.toUpperCase();
        // only characters in the ascii range 32 to 128 are allowed
        this.value = this.value.replace(/[^A-Z0-9;.,-/#/*+]/g, '');
    });

    // Listen for the menu navigation event send from the main process
    // Listen for message updates from the main thread.
    window.ipcRender.receive('message:update', (message, action) => {
        if (message === 'communication-send-data') {
            // Send the data
            showSendDataDialog();
        } else if (message === 'communication-set-port') {
            // Set the port
            setPort();
        } else if (message === 'communication-load-file') {
            // Load the file
            files.openLoadDialog();

        } else if (message === 'communication-save-file') {
            // Save the file
            files.openSaveDialog();

        } else if (message === 'communication-save-current-file') {
            // Save the file
            let result = actions.saveCurrentFile();
            console.log(result);
            if (!result.success) {
                showError(result.message);
            } else {
                showToast('File saved');
            }

        } else if (message === 'communication-file-loaded') {
            // File is loaded, update the UI
            //
            // I need some kind of callback here once the file is loaded
            // still need to figure this electron stuff better
            actions.loadFile(action);
            setTimeout(() => {
                updateUIForLoadedFile();
            }, 500);

        } else if (message === 'communication-file-saved') {
            // File is saved, nothing else to do really
            //
            let result = actions.saveFile(action);
            if (!result.success) {
                showError(result.message);
            }
        }
    });
}

//
// Show an error message
// https://github.com/apvarun/toastify-js
//
const showError = (message) => {

    if (!message) return;
    if (message == '') return;

    Toastify({
        text: message,
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "left", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            //background: "linear-gradient(to right, #00b09b, #96c93d)",
            color: "red"
        },
        onClick: function () {} // Callback after click
    }).showToast();
};


//
// Show a single toast message
//
const showToast = (message) => {
    Toastify({
        text: message,
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "left", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        onClick: function () {} // Callback after click
    }).showToast();
}


//
// Open the dialog to confirm sending the data to the watch
//
const showSendDataDialog = () => {
    // open the dialog
    const dialog = document.querySelector('#dialog-send');
    dialog.show();

    // Add the close button listener, basically it adds the event listener to the first button
    // which happens to be the close button
    const closeButton = dialog.querySelector('sl-button[slot="footer"]');
    closeButton.addEventListener('click', () => dialog.hide());
};

//
// Send the data to the watch
//
const sendDataToWatch = (e) => {

    e.preventDefault();

    const dialog = document.querySelector('#dialog-send');
    dialog.hide();

    actions.sendDataToWatch();

    // display a progress bar, to simulate the data transfer
    sendDataProgress();
};

//
// Save the serial port
//
const saveSerialPort = (e) => {
    e.preventDefault();

    // grab the value from the input field
    let val = $('#port-text').val().trim();

    const dialog = document.querySelector('#dialog-port');
    dialog.hide();

    if (val.length > 3) {
        actions.setPort(val);
    }
}

//
// Data is being sent to the watch, update a progress bar
//
const sendDataProgress = () => {
    // Add progress indicator in the footer
    $('#footer').html('<sl-progress-bar value="0"></sl-progress-bar>');
    // Now update the progress bar every 100ms by 10 steps until 100 which is the max
    let progress = 0;
    const interval = setInterval(() => {
        progress = progress + 5;
        if (progress > 100) {
            progress = 100;
            clearInterval(interval);
            // wait another 1000ms and then hide the progress bar
            setTimeout(() => {
                $('#footer').html('');
            }, 1000);
        }
        // update the progress bar
        $('#footer').html('<sl-progress-bar value="' + progress + '"></sl-progress-bar>');
    }, 400);
};

//
// Set the port
//
const setPort = () => {
    // open the dialog
    const dialog = document.querySelector('#dialog-port');
    dialog.show();
    const closeButton = dialog.querySelector('sl-button[slot="footer"]');
    closeButton.addEventListener('click', () => dialog.hide());

    $('#port-text').val(actions.getPort());

    setTimeout(() => {
        $('#port-text').focus();
    }, 200);
};

//
// Check if we have reached the maximum number of labels for each type
//
//
const checkLabelNumberStatus = () => {

    // update the number of labels remaining
    $('#labelRemaining').html(watch.getNumberOfLabelsFree());

    // check the weekly alarm
    if (watch.hasWeeklyAlarm()) {
        $('#btnWeekly').prop('disabled', true);
    } else {
        $('#btnWeekly').prop('disabled', false);
    }
    // check the scheduled alarm
    if (watch.hasScheduledAlarm()) {
        $('#btnScheduled').prop('disabled', true);
    } else {
        $('#btnScheduled').prop('disabled', false);
    }
    // check if we have reached the limit of 11 labels
    if (watch.getNumberOfLabelsFree() === 0) {
        $('#btnWeekly').prop('disabled', true);
        $('#btnScheduled').prop('disabled', true);
        $('#btnMemo').prop('disabled', true);
    } else {
        $('#btnMemo').prop('disabled', false);
    }

};

//
// Add a weekly label
//
const addWeelkyLabel = () => {

    $('#dialog-weekly').data('action', 'add');

    // open the dialog
    const dialog = document.querySelector('#dialog-weekly');
    dialog.show();
    // Modify the dialog button to Add
    let button = dialog.querySelector('sl-button[slot="footer"][variant="primary"]');
    button.innerHTML = '<i class="fa-solid fa-plus"></i> Add';

    $('#weekly-text').val('');

    setTimeout(() => {
        $('#weekly-text').focus();
    }, 200);

    const closeButton = dialog.querySelector('sl-button[slot="footer"]');
    closeButton.addEventListener('click', () => dialog.hide());
};

//
// Add a new scheduled label
//
const addScheduledLabel = () => {

    $('#dialog-scheduled').data('action', 'add');

    // open the dialog
    const dialog = document.querySelector('#dialog-scheduled');
    dialog.show()
    // Modify the dialog button to Add
    let button = dialog.querySelector('sl-button[slot="footer"][variant="primary"]');
    button.innerHTML = '<i class="fa-solid fa-plus"></i> Add';

    $('#scheduled-text').val('');

    setTimeout(() => {
        $('#scheduled-text').focus();
    }, 200);

    const closeButton = dialog.querySelector('sl-button[slot="footer"]');
    closeButton.addEventListener('click', () => dialog.hide());
};

//
// Add a new memo Label
//
const addMemoLabel = () => {

    // we are adding, not editing
    $('#dialog-scheduled').data('action', 'add');

    // open the dialog
    const dialog = document.querySelector('#dialog-memo');
    dialog.show()
    // Modify the dialog button to Add
    let button = dialog.querySelector('sl-button[slot="footer"][variant="primary"]');
    button.innerHTML = '<i class="fa-solid fa-plus"></i> Add';

    $('#memo-text').val('');

    setTimeout(() => {
        $('#memo-text').focus();
    }, 200);

    const closeButton = dialog.querySelector('sl-button[slot="footer"]');
    closeButton.addEventListener('click', () => dialog.hide());
};


//
// add a single memo label entry
//
const addMemoLabelEntry = () => {
    let name = $('#memo-text').val().trim();
    if (!name) return;
    if (name.length < 1) return;

    const action = $('#dialog-memo').closest('.dialog-label').data('action');

    if (action === 'edit') {
        // we are editing an existing label
        let id = $('#dialog-memo').closest('.dialog-label').data('id');;
        actions.updateLabelEntry(id, name);

        // find and update the table row using the id and the category L
        let row = $('#tableBody tr[data-id="' + id + '"][data-category="L"]');
        console.log(row)
        row.find('td:nth-child(2)').html(name);

    } else {
        // Add a new memo label
        let memo = actions.addMemoLabel(name);
        // insert the new label into the table
        addRowToTable({
            id: memo.id,
            type: memo.type,
            category: 'L',
            label: memo.label
        });
    }

    const dialog = document.querySelector('#dialog-memo');
    dialog.hide();

    // check if we have reached the maximum number of labels
    checkLabelNumberStatus();
};


//
// add a single weekly label entry
//
const addWeeklyLabelEntry = () => {
    let name = $('#weekly-text').val().trim();
    if (!name) return;
    if (name.length < 1) return;

    // Add a new memo label
    let memo = actions.addWeeklyLabel(name);
    // insert the new label into the table
    addRowToTable({
        id: memo.id,
        type: memo.type,
        category: 'L',
        label: memo.label
    });

    const dialog = document.querySelector('#dialog-weekly');
    dialog.hide();

    // check if we have reached the maximum number of labels
    checkLabelNumberStatus();
};


//
// add a single scheduled label entry
//
const addScheduledLabelEntry = () => {
    let name = $('#scheduled-text').val().trim();
    if (!name) return;
    if (name.length < 1) return;

    // Add a new memo label
    let memo = actions.addScheduledLabel(name);
    // insert the new label into the table
    addRowToTable({
        id: memo.id,
        type: memo.type,
        category: 'L',
        label: memo.label
    });

    const dialog = document.querySelector('#dialog-scheduled');
    dialog.hide();

    // check if we have reached the maximum number of labels
    checkLabelNumberStatus();
};


//
// Add a single row of data to the table (label or data)
//
const addRowToTable = (data) => {
    let html = tableRowHtml(data);
    $('#tableBody').append(html);
};

//
// Add a single row of data to the table (label or data)
//
const addDataRowToTable = (data, id, index) => {
    let html = tableDataRowHtml(data, id, index);
    $('#tableBody').append(html);
};

const buildTable = (data) => {

};


//
// Create a single table row entry for either a label or data entry
//
const tableRowHtml = (data) => {

    //console.log(data)

    let icon = '';
    if (data.type === 2) icon = 'fa-regular fa-bell'; // weekly
    if (data.type === 1) icon = 'fa-regular fa-calendar-days'; // scheduled
    if (data.type === 0) icon = 'fa-solid fa-tag'; // memo

    // delete is disabled if they contain at least one data entry
    let deleteDisabled = '';
    if (data.store && data.store.length > 0) deleteDisabled = 'disabled';

    let d = `
        <tr data-type="${data.type}" data-id="${data.id}" data-category="${data.category}">
            <td style="width:20px">
                <i class="${icon}"></i>
            </td>
            <td class="label">
                ${data.label}
            </td>
            <td style="width:20px">
                <a href="#" class="add-data-entry" title="Add Data">
                    <i class="fa-regular fa-add"></i>
                </a>
            </td>
            <td style="width:20px" title="Edit Label">
                <a href="#" class="edit-entry">
                    <i class="fa-regular fa-pen-to-square"></i>
                </a>
            </td>
            <td style="width:20px">
                <a href="#" class="delete-entry ${deleteDisabled}" title="Delete Label">
                    <i class="fa-regular fa-trash-can"></i>
                </a>
            </td>
        </tr>`;

    return d;
};


//
// Create a single table row entry for either a label or data entry
//
const tableDataRowHtml = (data, id, index) => {


    let d = `
        <tr data-index="${index}" data-id="${id}" data-category"d">
            <td style="width:20px">
                <!-- nothing -->
            </td>
            <td class="terminal">
                ${data}
            </td>
            <td style="width:20px" class="edit-entry">
                <!-- Nothing -->
            </td>
            <td style="width:20px" class="edit-entry" title="Edit Data">
                <a href="#" class="edit-data">
                    <i class="fa-solid fa-pencil"></i>
                </a>
            </td>
            <td style="width:20px">
                <a href="#" class="delete-data" title="Delete Data">
                    <i class="fa-solid fa-xmark"></i>
                </a>
            </td>
        </tr>`;

    return d;
};


//
// Edit the selected label entry
//
const editLabelEntry = (e) => {

    e.preventDefault();

    let row = $(e.target).closest('tr');
    let id = row.data('id');
    let type = row.data('type');

    if (!id) return; // hmmmm?

    // open the dialog
    let dialog = null;
    if (type === 0) dialog = document.querySelector('#dialog-memo');
    if (type === 1) dialog = document.querySelector('#dialog-scheduled');
    if (type === 2) dialog = document.querySelector('#dialog-weekly');
    dialog.show();

    // store the action and label id in the dialog so we know what to update
    if (type === 0) $('#dialog-memo').data('action', 'edit').data('id', id);
    if (type === 1) $('#dialog-scheduled').data('action', 'edit').data('id', id);
    if (type === 2) $('#dialog-weekly').data('action', 'edit').data('id', id);

    let name = row.find('td:nth-child(2)').text().trim();
    // Find the text area in the dialog and populate it with the label name
    if (type === 0) $('#memo-text').val(name);
    if (type === 1) $('#scheduled-text').val(name);
    if (type === 2) $('#weekly-text').val(name);

    // Modify the dialog button from Add to Update
    let button = dialog.querySelector('sl-button[slot="footer"][variant="primary"]');
    button.innerHTML = '<i class="fa-solid fa-file-pen"></i> Update';

    setTimeout(() => {
        if (type === 0) $('#memo-text').focus();
        if (type === 1) $('#scheduled-text').focus();
        if (type === 2) $('#weekly-text').focus();
    }, 200);

    const closeButton = dialog.querySelector('sl-button[slot="footer"]');
    closeButton.addEventListener('click', () => dialog.hide());
};



//
// Delete the selected label entry
//
const deleteLabelEntry = (e) => {

    e.preventDefault();

    let row = $(e.target).closest('tr');
    let id = row.data('id');

    if (!id) return;

    // delete the label from the watch
    actions.deleteLabelEntry(id);

    // remove the row from the table
    row.remove();

    // check if we have reached the maximum number of labels
    checkLabelNumberStatus();
}


//
// Add a new data entry to the selected label
//
const addDataEntryDialog = (e) => {
    e.preventDefault();

    let row = $(e.target).closest('tr');
    // get the type of label
    let type = row.data('type');
    // get the label id
    let id = row.data('id');

    if (!id) return; // hmmmm?

    // show the add data dialog
    let dialog = null;
    if (type === 0) dialog = document.querySelector('#dialog-memo-data');
    if (type === 1) dialog = document.querySelector('#dialog-scheduled-data');
    if (type === 2) dialog = document.querySelector('#dialog-weekly-data');
    dialog.show();

    // clear the text area
    $(dialog).find('textarea').val('');

    // Add the data id
    // store the action and label id in the dialog so we know what to update
    if (type === 0) $('#dialog-memo-data').data('id', id).data('action', 'add').data('label-id', id);
    if (type === 1) $('#dialog-scheduled-data').data('action', 'add').data('label-id', id);
    if (type === 2) $('#dialog-weekly-data').data('action', 'add').data('label-id', id);

    // set the focus to the text area
    setTimeout(() => {
        // just find the text area and set the focus
        $(dialog).find('textarea').focus();
    }, 200);

    // add the close button action to the dialog
    const closeButton = dialog.querySelector('sl-button[slot="footer"]');
    closeButton.addEventListener('click', () => dialog.hide());
};

//
// Add a new memo data entry
//
const addMemoDataEntry = (e) => {

    e.preventDefault();

    let name = $('#memo-data-text').val().trim().toUpperCase();
    if (!name) return;
    if (name.length < 1) return;

    // Get the id of the label we are adding the data to
    let id = $('#dialog-memo-data').data('label-id');
    if (!id) return;

    const dialog = document.querySelector('#dialog-memo-data');
    dialog.hide();

    // Add a new memo data
    let index = actions.addMemoData(id, name);
    // Add the row
    let html = tableDataRowHtml(name, id, index);

    // find the row with the id and append the new row after it
    let row = $(`tr[data-id="${id}"]`).last();
    row.after(html);

    // Scroll to the new row
    setTimeout(() => {
        let newrow = $(`tr[data-id="${id}"][data-index="${index}"]`).prevAll().length; // Find all sibling element in front of it
        $("#table-scroller").animate({
            scrollTop: newrow * 30
        });
    }, 200);

};

//
// Delete a single data entry
//
const deleteDataEntry = (e) => {

    e.preventDefault();

    let row = $(e.target).closest('tr');
    let index = row.data('index'); // index 0 is possible so be careful of boolean checks
    let id = row.data('id'); // this is the label id
    if (!id) return;

    // Look back at the preview rows until we find the label row
    let labelRow = row.prevUntil('tr[data-category="L"]').last();

    // delete the label from the watch
    actions.deleteDataEntry(id, index);

    // remove the row from the table
    row.remove();

    // This is a bit clunky due to how I did the initial data store, we need to
    // re-index the data entries after we delete one
    let dataRows = $(`tr[data-category="d"][data-id="${id}"]`);
    for (let i = 0; i < dataRows.length; i++) {
        let dataRow = $(dataRows[i]);
        dataRow.data('index', i);
    }

    // check if there are any data entries left in the table, category = d, id = §id
    dataRows = $(`tr[data-category="d"][data-id="${id}"]`);
    if (dataRows.length === 0) {
        // no data rows left so we need to enable the delete button
        labelRow.find('.delete-entry').removeClass('disabled');
    }

    // check if we have reached the maximum number of labels
    checkLabelNumberStatus();
}

//
// A file has been loaded into the main watch data
// what we need to do now is read the data and populate the table
// and adjust any of the buttons that need to be disabled
//
const updateUIForLoadedFile = () => {

    // clear the table
    $('#tableBody').empty();

    // get the data from the watch
    let data = watch.getLabels();

    // populate the table
    for (let i = 0; i < data.length; i++) {
        let d = data[i];
        console.log(d);
        addRowToTable(d);
        // Loop over any data entries and add them to the table
        d.store.forEach((item, index) => {
            addDataRowToTable(item, d.id, index);
        });
    }

    // check if we have reached the maximum number of labels
    checkLabelNumberStatus();

};