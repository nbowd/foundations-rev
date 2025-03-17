const baseUrl = `http://localhost:8080`;
let user;
let token;

// MODALS
const loginDialog = document.querySelector("#login-dialog");
const loginShowButton = document.querySelector("#login-button");
const loginCloseButton = document.querySelector("#login-dialog-close");

// "Show the loginDialog" button opens the loginDialog modally
loginShowButton.addEventListener("mousedown", () => {
  loginDialog.showModal();
});

// Clicking outside of element closes the loginDialog
loginDialog.addEventListener("mousedown", (event) => {

    if (event.target == loginDialog) {
        loginDialog.close();
    }
});

// "Close" button closes the loginDialog
loginCloseButton.addEventListener("mousedown", (event) => {
    loginDialog.close();
    
});
// MODALS
const ticketDialog = document.querySelector("#ticket-dialog");
const ticketShowButton = document.querySelector("#ticket-button");
const ticketCloseButton = document.querySelector("#ticket-dialog-close");

// "Show the ticketDialog" button opens the ticketDialog modally
ticketShowButton.addEventListener("mousedown", () => {
  ticketDialog.showModal();
});

// Clicking outside of element closes the ticketDialog
ticketDialog.addEventListener("mousedown", (event) => {

    if (event.target == ticketDialog) {
        ticketDialog.close();
    }
});

// "Close" button closes the ticketDialog
ticketCloseButton.addEventListener("mousedown", (event) => {
    ticketDialog.close();
});


// LOGIN
function toggleForm(form) {
    if (form === 'create-account') {
        document.getElementById('login-form').classList.remove('active');
        document.getElementById('create-account-form').classList.add('active');
    } else {
        document.getElementById('create-account-form').classList.remove('active');
        document.getElementById('login-form').classList.add('active');
    }
}

function validateEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

async function validateLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    let valid = true;

    // Clear previous errors
    document.getElementById('login-error').textContent = '';

    if (!validateEmail(email)) {
        document.getElementById('login-error').textContent = 'Please enter a valid email.';
        valid = false;
    }

    if (valid) {
        login(email, password);
    }
}

async function login(email, password) {
    try {
        const res = await axios.post(`${baseUrl}/login`,{
            username: email,
            password
        });
        if (res.status == 200) {
            user = res.data.user;
            token = res.data.token;
            document.getElementById('login-success').textContent = "Login Successful";
            await getTableData();
            loginDialog.close();
        }
    } catch (error) {
        console.log(error)
        document.getElementById('login-error').textContent = error.response.data.message;
    }
}

async function createUser(email, password) {
    try {
        const res = await axios.post(`${baseUrl}/users`, {
            username: email,
            password
        })
        console.log(res)
        if (res.status != 201) {
            document.getElementById('create-error').textContent = 'User could not be created.';
            return;
        }

        await login(email, password);
        document.getElementById('create-success').textContent = 'Account created successfully!';

    } catch (error) {
        document.getElementById('create-error').textContent = error.response.data.message;
    }
}

function validateCreateAccount() {
    const email = document.getElementById('create-email').value;
    const password = document.getElementById('create-password').value;
    const passwordConfirm = document.getElementById('create-password-confirm').value;
    let valid = true;

    // Clear previous errors
    document.getElementById('create-error').textContent = '';
    document.getElementById('create-success').textContent = '';

    if (!validateEmail(email)) {
        document.getElementById('create-error').textContent = 'Please enter a valid email.';
        valid = false;
    }

    if (password !== passwordConfirm) {
        document.getElementById('create-error').textContent = 'Passwords do not match.';
        valid = false;
    }

    if (valid) {
        createUser(email, password);
    }
}

async function createTicket(user_id, description, type, amount, file ) {
    try {
        const requestData = {
            author: user_id,
            description,
            type,
            amount 
        }
        const res = await axios.post(`${baseUrl}/tickets`, requestData, 
            {
                headers: {
                    Authorization: "Bearer " + token,
                    'Content-Type': 'application/json' 
                }
            }
        );
        if (res.status != 201) return;

        if (!file) {
            document.getElementById('ticket-success').textContent = 'Ticket Created';
            await getTableData();
            ticketDialog.close();
            return;
        }

        const response = await axios.post(`${baseUrl}/tickets/${res.data.ticket_id}/receipt`, file, {
            headers: {
                "Content-Type": "image/jpeg",
                Authorization: "Bearer " + token
            }
        })
        if (response.status == 202) {
            document.getElementById('ticket-success').textContent = 'Ticket Created';
            const filterType = document.querySelector("#filter-ticket-type");
            filterType.value = 'none';
            await getTableData();
            ticketDialog.close();
        }
    } catch (error) {
        console.log(error);
        document.getElementById('ticket-error').textContent = error.response.data.message;
    }
}

function validateTicket() {
    const description = document.getElementById('ticket-description').value;
    const type = document.getElementById('ticket-type').value;
    const amount = document.getElementById('ticket-amount').value;
    const fileInput =document.getElementById('ticket-file-input');

    const file = fileInput.files[0];

    document.getElementById('ticket-error').textContent = '';
    document.getElementById('ticket-success').textContent = '';
    
    if (!type || type == 'none') {
        document.getElementById('ticket-error').textContent = 'Please choose a valid type.';
        return;
    }
    if (!description || description.length == 0) {
        document.getElementById('ticket-error').textContent = 'Please enter a valid description.';
        return;
    }
    if (!amount || amount <= 0) {
        document.getElementById('ticket-error').textContent = 'Please enter a valid amount.';
        return;
    }

    if (file && file.type !== "image/jpeg") {
        document.getElementById('ticket-error').textContent = 'Invalid file type. image/jpeg only.';
        return;
    };
    if (file && file.size > 5 * 1024 * 1024) {
        document.getElementById('ticket-error').textContent = 'Invalid file size. 5MB or less.';
        return;
    };
    createTicket(user.user_id, description, type, amount, file);
}



async function getTableData() {
    if (!user || !token) return;
    let tickets = [];
    try {
        if (user.role === 'manager') {
            const res = await axios.get(`${baseUrl}/tickets?status=pending`, {
                    headers: {
                        Authorization: "Bearer " + token
                    }
                });
            tickets = res.data;
        }

        if (user.role === 'employee') {
            const res = await axios.get(`${baseUrl}/tickets?author=${user.user_id}`, {
                headers: {
                    Authorization: "Bearer " + token
                }
            });
            tickets = res.data;
        }        
    } catch (error) {
        console.log(error);
    }

    if (tickets.length == 0) return;
    document.querySelector('#tbody').innerHTML = "";
    for (let ticket of tickets) {
        makeRow(ticket);
    }
}

async function getTableDataByType(type) {
    if (!user || !token || user.role != 'employee') return;
    let tickets = [];

    try {
        const res = await axios.get(`${baseUrl}/tickets?type=${type}&author=${user.user_id}`, {
            headers: {
                Authorization: "Bearer " + token
            }
        });
        tickets = res.data;
    } catch (error) {
        console.log(error);
    }

    if (tickets.length == 0) return;
    document.querySelector('#tbody').innerHTML = "";
    for (let ticket of tickets) {
        makeRow(ticket);
    }
}

async function resolveTicket(ticket_id, status) {
    try {
        const res = await axios.patch(`${baseUrl}/tickets/${ticket_id}`, { status }, {
            headers: {
                Authorization: "Bearer " + token
            }
        });
        if (res.status == 202) {
            await getTableData();
        } 
    } catch (error) {
        console.log(error);
    }
}

async function uploadReceipt(id) {
    const result = id.split('upload');
    const ticket_id = result[1];

    const fileInput = document.getElementById(`fileInput${ticket_id}`);
    const file = fileInput.files[0];

    if (!file) return;
    if (file.type !== "image/jpeg") return;
    if (file.size > 5 * 1024 * 1024) return;
    
    try {
        const response = await axios.post(`${baseUrl}/tickets/${ticket_id}/receipt`, file, {
            headers: {
                "Content-Type": "image/jpeg",
                Authorization: "Bearer " + token
            }
        })
        if (response.status == 202) {
            const filterType = document.querySelector("#filter-ticket-type");
            filterType.value = 'none';
            await getTableData();
        }
    } catch (error) {
        console.log(error);
    }
}
// TABLE
const makeRow = (ticket) => {

    let tbody = document.querySelector('#tbody');
    let tr = tbody.appendChild(document.createElement('tr'));
    // Assign table id as row name
    tr.id = 'row'+ticket.ticket_id;

    // Create ticket_id cell
    makeCell(tr, ticket.ticket_id);

    // Author Cell
    makeCell(tr, ticket.author);

    // View Issue Button
    // issueSetup(tr, ticket)
    makeCell(tr, ticket.description);

    // Type Cell
    makeCell(tr, ticket.type);

    // Amount cell
    makeCell(tr, ticket.amount);
    
    // Receipt Cell
    makeCell(tr, ticket.receipt);
    
    // Resolver Cell
    makeCell(tr, ticket.resolver);
    
    //Status Cell
    statusSetup(tr, ticket); 
    // makeCell(tr, ticket.status);

    if (user.role == 'employee') {
        makeUpload(tr, ticket);
    }

    if (user.role == 'manager') {
        // Edit button for ticket, returns td element containing button
        let editButton = makeEdit(tr, ticket);

        // Creates approve button, hidden
        let approveButton = makeOptions(editButton, 'Approve', ticket.ticket_id)
        approveButton.classList.add('approve-btn')
    
        // Creates delete button, hidden
        let denyButton = makeOptions(editButton, 'Deny', ticket.ticket_id)
        denyButton.classList.add('deny-btn')
    }
};

const makeCell = (tr, rowProp) => {
    let cell = tr.appendChild(document.createElement('td'));
    cell.textContent = rowProp
}

const statusSetup = (tr, row) => {
    let tdStatus = tr.appendChild(document.createElement('td'));
    tdStatus.id = 'status'+row.ticket_id
    tdStatus.textContent = row.status; 
}

const makeUpload = (tr, row) => {
    let tdUpload = tr.appendChild(document.createElement('td'));
    let uploadForm = tdUpload.appendChild(document.createElement('form'));
    let uploadInput = uploadForm.appendChild(document.createElement('input'));
    let uploadButton = uploadForm.appendChild(document.createElement('input'));

    uploadForm.classList.add('upload-form');

    uploadInput.classList.add('file-input');
    uploadInput.type = 'file';
    uploadInput.accept = 'image/jpeg';
    uploadInput.required = true;
    uploadInput.id = `fileInput${row.ticket_id}`

    uploadButton.classList.add('upload-button');
    uploadButton.type = 'submit';
    uploadButton.value = 'Upload'
    uploadButton.id = `upload${row.ticket_id}`

};

const makeEdit = (tr, row) => {
    let tdEdit = tr.appendChild(document.createElement('td'));
    let editButton = tdEdit.appendChild(document.createElement('input'));
    editButton.type = 'submit';
    editButton.value = 'Resolve';
    editButton.id = row.ticket_id;
    editButton.classList.add('edit-btn');
    return tdEdit
}
const makeOptions = (td, text, id) => {
    let optionsButton = td.appendChild(document.createElement('input'));
    optionsButton.type = 'submit';
    optionsButton.value = text;
    optionsButton.id = id;
    optionsButton.hidden = true;
    optionsButton.classList.add('edit-btn');
    return optionsButton
}

// Reveals hidden buttons, hides edit button
const enableRow = (rowTarget) => {
  let row = document.querySelector('#row'+rowTarget);
  let rowInputs = row.querySelectorAll('input');
    for (let ips in rowInputs){
        if (rowInputs[ips].hidden === true){
            rowInputs[ips].hidden = false;
        }

        if (rowInputs[ips].value === 'Resolve'){
            rowInputs[ips].hidden = true;
        }
    };
};   

const filterByType = document.querySelector("#filter-ticket-type");
filterByType.addEventListener("change", async (event) => {
    const type = event.target.value;
    if (type == 'none') {
        await getTableData();
    } else {
        await getTableDataByType(type);
    }
})

// const uploadReceipt = document.querySelector(".upload-form");
// uploadReceipt.addEventListener("submit", (event) => {
//     event.preventDefault();
//     console.log(event);
//     // const fileInput = document.querySelector(`#${event.target.id}`);
//     // const file = fileInput.files[0];
//     // console.log('here',file);
// })


// Single event listener on the table element, action in response depends on the target clicked
// Edit button reveals hidden buttons, hides itself
// View activates a modal containing the connected issue
// Close Ticket changes the current status of that ticket to closed, still needs to be submitted
// Submit button gets the current table values and makes an update query
// Delete button takes the row id and sends a delete request with the row id as the query string
const table = document.getElementById('table');
table.addEventListener('click', async (event) => {
    
    let target = event.target;
    console.log(target)
    
    // Edit button
    if (target.value === 'Resolve'){
        enableRow(target.id);
    }

    // View button
    if (target.value === 'View'){
        
        let modTarget = document.querySelector(target.dataset.modalTarget)
        let targetRow = document.querySelector(`#row${target.id}`);
        let revision = targetRow.querySelectorAll('td')

        let issueHeader = document.querySelector("#issue-header")
        issueHeader.textContent = revision[1].textContent

        let issueBody = document.querySelector('#issue-body')
        issueBody.textContent = target.placeholder

        openModal(modTarget)
    }

    // Submit button, send a put request to the server
    if (target.value === 'Approve'){
        await resolveTicket(target.id, 'approved');
    }     
    
    // Delete button, sends a delete request to server
    if (target.value === 'Deny'){
        await resolveTicket(target.id, 'denied');
    }

    if (target.value === 'Upload') {
        event.preventDefault();
        await uploadReceipt(target.id)
    }
});
