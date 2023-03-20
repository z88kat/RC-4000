// jquery is ready
$(document).ready(function () {
    // init the application
    initApplication();

    console.log(watch.getNumberOfLabelsFree());
});

const initApplication = () => {
    // set the timestamp
    $('#timestamp').html('2021-01-01 00:00:00');

    $('#btnWeekly').click(addWeelkyLabel);
    $('#btnScheduled').click(addScheduledLabel);
    $('#btnMemo').click(addMemoLabel);

    // capture all text entered into the input fields and make uppercase
    $('.form-input').on('input', function () {
        this.value = this.value.toUpperCase();
        // only characters in the ascii range 32 to 128 are allowed
        this.value = this.value.replace(/[^A-Z0-9;.,-/#/*+]/g, '');
    });
}

const addWeelkyLabel = () => {

    addRowToTable();
};

const addScheduledLabel = () => {};

//
//
//
const addMemoLabel = () => {

    // open the dialog
    const dialog = document.querySelector('#dialog-memo');
    dialog.show()

    setTimeout(() => {
        $('#memo-text').focus();
    }, 200);

    actions.addMemoLabel('TEST');

    const closeButton = dialog.querySelector('sl-button[slot="footer"]');
    closeButton.addEventListener('click', () => dialog.hide());
};


const addRowToTable = (data) => {

    let html = tableRowHtml(data);
    $('#tableBody').append(html);
};

const buildTable = (data) => {

};


//
// Create a single table row entry for either a label or data entry
//
const tableRowHtml = (data) => {

    let d = `
        <tr data-type="${data}">
            <td>
                <i class="fa-regular fa-bell"></i>
            </td>
            <td>
                TEXT
            </td>
            <td>
                <i class="fa-regular fa-pen-to-square"></i>
            </td>
            <td>
                <a href="#" class="delete-entry">
                    <i class="fa-regular fa-trash-can"></i>
                </a>
            </td>
        </tr>`;

    return d;
};