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
    console.log('here')

    if (event.target == loginDialog) {
        loginDialog.close();
    }
});

// "Close" button closes the loginDialog
loginCloseButton.addEventListener("mousedown", (event) => {
    console.log('there')

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

        if (res.status != 201) {
            document.getElementById('create-error').textContent = 'User could not be created.';
            return;
        }

        await login(email, password);
    } catch (error) {
        
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
        document.getElementById('create-success').textContent = 'Account created successfully!';
    }
}

async function createTicket(user_id, description, type, amount ) {
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
        if (res.status == 201) {
            document.getElementById('ticket-success').textContent = 'Ticket Created';
            await getTableData();
            ticketDialog.close();
        } 
    } catch (error) {
        console.log(error);
    }
}

function validateTicket() {
    const description = document.getElementById('ticket-description').value;
    const type = document.getElementById('ticket-type').value;
    const amount = document.getElementById('ticket-amount').value;

    document.getElementById('ticket-error').textContent = '';
    document.getElementById('ticket-success').textContent = '';

    if (!description || description.length == 0) {
        document.getElementById('ticket-error').textContent = 'Please enter a valid description.';
        return;
    }
    if (!type || type == 'none') {
        document.getElementById('ticket-error').textContent = 'Please choose a valid type.';
        return;
    }
    if (!amount || amount <= 0) {
        document.getElementById('ticket-error').textContent = 'Please enter a valid amount.';
        return;
    }
    createTicket(user.user_id, description, type, amount);
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

    console.log('tickets',tickets)
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

    // Edit button for ticket, returns td element containing button
    let editButton = makeEdit(tr, ticket);
    
    // Close ticket button, hidden until edit toggle
    // let closeButton = makeOptions(editButton, 'Close Edit', ticket.ticket_id)
    // closeButton.classList.add('close-btn')
    
    // Creates approve button, hidden
    let approveButton = makeOptions(editButton, 'Approve', ticket.ticket_id)
    approveButton.classList.add('approve-btn')

    // Creates delete button, hidden
    let denyButton = makeOptions(editButton, 'Deny', ticket.ticket_id)
    denyButton.classList.add('deny-btn')
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

        if (rowInputs[ips].value === 'Edit'){
            rowInputs[ips].hidden = true;
        }
    };
};   






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
    if (target.value === 'Edit'){
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

    if (target.value === 'Close Edit'){
        let statusCell = document.querySelector(`#status${target.id}`)
        statusCell.textContent = 'Closed'
    }

    // Submit button, send a put request to the server
    if (target.value === 'Approve'){
        await resolveTicket(target.id, 'approved');
        // let targetRow = document.querySelector(`#row${target.id}`);
        // let revision = targetRow.querySelectorAll('td')
        // let texts = Array.prototype.map.call(revision, function(t) { return t.textContent; });
        // console.log(target.id)
        // // Assigns status value
        // let statusCell = document.querySelector(`#status${target.id}`)
        // let statusValue = 0
        // if (statusCell.textContent === 'Closed') {
        //     statusValue = 1
        // } 

        // let issueText = document.querySelector(`.issue${target.id}`)
        // let context = {name:texts[0], subject: texts[1], issue: issueText.placeholder, contact:texts[3], status: statusValue, date:texts[5]}
        
        // document.getElementById('tbody').innerHTML = '';  // Resets table for repopulation

        // let res = await axios.put(baseUrl+`?id=${target.id}`, context);
        // const rowsArray = res.data.rows;
        // for (let row in rowsArray) {
        //     makeRow(rowsArray[row]); // Repopulates rows       
        // }  
    }     
    
    // Delete button, sends a delete request to server
    if (target.value === 'Deny'){
        console.log('Denied')
        // document.getElementById('tbody').innerHTML = '';  // Resets table for repopulation

        // let res = await axios.delete(baseUrl+`?id=${target.id}`);
        // const rowsArray = res.data.rows;
        // for (let row in rowsArray) {
        //     makeRow(rowsArray[row]);        
        // }
    }
});








// get data (async) on window load gets current row data from db
window.onload = async (e) => {
    // const res = await axios.get(baseUrl);
    // const ticketsArray = [{
    //     "ticket_id": "e4c7c1b5-3c30-4e1c-b348-7b73eb5d3dcc",
    //     "description": "Donor dinner at McDonalds",
    //     "amount": 350,
    //     "type": "food",
    //     "author": "b592132a-ad52-438b-9abd-7430016596d1",
    //     "resolver": "",
    //     "status": "pending",
    //     "receipt": ""
    // }];
    // // const ticketsArray = res.data.rows;
    // for (let ticket in ticketsArray) {
    //     makeRow(ticketsArray[ticket]);
    // }; 
};