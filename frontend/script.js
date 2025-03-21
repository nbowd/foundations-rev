const baseUrl = `http://localhost:8080`;
let user;
let token;
let profile;

// MODALS
const loginDialog = document.querySelector("#login-dialog");
const loginShowButton = document.querySelector("#login-button");
const loginCloseButton = document.querySelector("#login-dialog-close");

// "Show the loginDialog" button opens the loginDialog modally
loginShowButton.addEventListener("mousedown", () => {
    loginDialog.showModal();
    const email = document.getElementById('login-email').value = "";
    const password = document.getElementById('login-password').value = "";
    document.getElementById('login-success').textContent = "";
    document.getElementById('login-error').textContent = "";

    document.getElementById('create-email').value = "";
    document.getElementById('create-password').value = "";
    document.getElementById('create-password-confirm').value = "";
    document.getElementById('create-success').textContent = "";
    document.getElementById('create-error').textContent = "";
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

const ticketDialog = document.querySelector("#ticket-dialog");
const ticketShowButton = document.querySelector("#ticket-button");
const ticketCloseButton = document.querySelector("#ticket-dialog-close");

// "Show the ticketDialog" button opens the ticketDialog modally
ticketShowButton.addEventListener("mousedown", () => {
    document.getElementById('ticket-description').value = '';
    document.getElementById('ticket-type').value = '';
    document.getElementById('ticket-amount').value = '';
    document.getElementById('ticket-file-input').value = '';
    document.getElementById('ticket-success').textContent = "";
    document.getElementById('ticket-error').textContent = "";
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

const changeRoleDialog = document.querySelector("#change-role-dialog");
const changeRoleShowButton = document.querySelector("#change-role-button");
const changeRoleCloseButton = document.querySelector("#change-role-dialog-close");

// "Show the changeRoleDialog" button opens the changeRoleDialog modally
changeRoleShowButton.addEventListener("mousedown", () => {
    document.getElementById('change-role-employee').value = '';
    document.getElementById('change-role-role').value = '';
    document.getElementById('change-role-success').textContent = "";
    document.getElementById('change-role-error').textContent = "";
    changeRoleDialog.showModal();
});

// Clicking outside of element closes the changeRoleDialog
changeRoleDialog.addEventListener("mousedown", (event) => {

    if (event.target == changeRoleDialog) {
        changeRoleDialog.close();
    }
});

// "Close" button closes the changeRoleDialog
changeRoleCloseButton.addEventListener("mousedown", (event) => {
    changeRoleDialog.close();
});

const profileDialog = document.querySelector("#profile-dialog");
const profileShowButton = document.querySelector("#profile-button");
const profileCloseButton = document.querySelector("#profile-dialog-close");

// "Show the profileDialog" button opens the profileDialog modally
profileShowButton.addEventListener("mousedown", () => {
    document.getElementById('profile-first').value = '';
    document.getElementById('profile-last').value = '';
    document.getElementById('profile-location').value = '';
    document.getElementById('profile-title').value = '';
    document.getElementById('profile-file-input').value = '';
    document.getElementById('profile-success').textContent = "";
    document.getElementById('profile-error').textContent = "";
    profileDialog.showModal();
});

// Clicking outside of element closes the profileDialog
profileDialog.addEventListener("mousedown", (event) => {

    if (event.target == profileDialog) {
        profileDialog.close();
    }
});

// "Close" button closes the profileDialog
profileCloseButton.addEventListener("mousedown", (event) => {
    profileDialog.close();
});






// PROFILE
function toggleUpload(view) {
    if (view === 'upload') {
        document.getElementById('profile-upload').classList.add('active');
        document.getElementById('toggle-upload-input').classList.remove('active');
    } else {
        document.getElementById('toggle-upload-input').classList.add('active');
        document.getElementById('profile-upload').classList.remove('active');
    }
}

async function changeRole(employee_id, role) {
    const successMsg = document.getElementById('change-role-success');
    const errorMsg = document.getElementById('change-role-error');
    try {
        const res = await axios.patch(`${baseUrl}/users/${employee_id}`, { role }, {
            headers: {
                Authorization: "Bearer " + token,
                'Content-Type': 'application/json'
            }
        })
        if (res.status == 200) {
            successMsg.textContent = 'Role successfully changed';
            setTimeout(() => {
                changeRoleDialog.close();
            }, 1500);
        }
    } catch (error) {
        errorMsg.textContent = error.response.data.message;
    }
}

function validateChangeRole() {
    const employee_id = document.getElementById('change-role-employee').value;
    const role = document.getElementById('change-role-role').value;
    const successMsg = document.getElementById('change-role-success')
    const errorMsg = document.getElementById('change-role-error')
    
    successMsg.textContent = '';
    errorMsg.textContent = '';
    // Clear previous errors

    if (user.role != 'manager') {
        errorMsg.textContent = 'Manager Access Only'
    }

    if (!employee_id || employee_id.length == 0){
        errorMsg.textContent = "Missing or invalid employee ID."
        return;
    }

    if (role == 'none') {
        errorMsg.textContent = "Valid role is required."
        return;
    }

    changeRole(employee_id.trim(), role);
}

async function updateProfile(updateObject, file) {
    try {
        const res = await axios.patch(`${baseUrl}/profile/${user.user_id}`, updateObject, {
            headers: {
                Authorization: "Bearer " + token,
                'Content-Type': 'application/json' 
            }
        })

        if (res.status != 200) return;
        profile = res.data;
        document.getElementById('profile-success').textContent = 'Profile updated';
        if (!file) return;
        const response = await axios.post(`${baseUrl}/profile/${user.user_id}/photo`, file, {
            headers: {
                "Content-Type": "image/jpeg",
                Authorization: "Bearer " + token
            }
        })

        
        if (response.status != 200) return;
        profile = response.data;
        document.getElementById('profile-success').textContent = 'Profile updated';
    } catch (error) {
        console.log(error)
        document.getElementById('profile-error').textContent = error.response.data.message;
    }
}

async function validateProfile() {
    const first_name = document.getElementById('profile-first').value;
    const last_name = document.getElementById('profile-last').value;
    const office_location = document.getElementById('profile-location').value;
    const title = document.getElementById('profile-title').value;
    const fileInput = document.getElementById('profile-file-input');

    document.getElementById('profile-success').textContent = '';
    document.getElementById('profile-error').textContent = '';


    const file = fileInput.files[0];
    if (file && file.type !== "image/jpeg") {
        document.getElementById('profile-error').textContent = 'Invalid file type. image/jpeg only.';
        return;
    };
    if (file && file.size > 5 * 1024 * 1024) {
        document.getElementById('profile-error').textContent = 'Invalid file size. 5MB or less.';
        return;
    }

    const updateObject = {};
    if (first_name) {
        updateObject.first_name = first_name;
    }
    if (last_name) {
        updateObject.last_name = last_name;
    }
    if (office_location && office_location != 'none') {
        updateObject.office_location = office_location;
    }
    if (title && title != 'none') {
        updateObject.title = title;
    }
    await updateProfile(updateObject, file);
    await setProfile(profile);
    profileDialog.close();
}

async function setProfile(profile){
    document.querySelector(".profile-name").textContent = `${profile.first_name} ${profile.last_name}`;
    document.querySelector(".profile-title").textContent = profile.title;
    document.querySelector(".profile-location").textContent = profile.office_location;
    
    if (profile.profile_picture) {
        const response = await axios.get(`${baseUrl}/profile?key_id=${profile.profile_picture}`,{
            headers: {
                Authorization: "Bearer " + token
            }
        });
        document.querySelector(".profile-picture").src = response.data.signedUrl.signedUrl;
    } else {
        document.querySelector(".profile-picture").src = '../frontend/images/default-profile.jpg'
    }
}

// LOGIN
function toggleForm(form) {
    // Reset Login Form
    document.getElementById('login-email').value = "";
    document.getElementById('login-password').value = "";
    document.getElementById('login-success').textContent = "";
    document.getElementById('login-error').textContent = "";

    // Reset Create Form
    document.getElementById('create-email').value = "";
    document.getElementById('create-password').value = "";
    document.getElementById('create-password-confirm').value = "";
    document.getElementById('create-success').textContent = "";
    document.getElementById('create-error').textContent = "";

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

async function makeVisible() {
    const newTicket = document.querySelector("#ticket-button");
    const changeRole = document.querySelector("#change-role-button");
    const editProfile = document.querySelector("#profile-button");
    const filterType = document.querySelector("#filter-type");
    const filterStatus = document.querySelector("#filter-status");

    if (user.role == 'manager') {
        changeRole.classList.add('active');
        filterStatus.classList.add('active')
    }

    if (user.role == 'employee') {
        filterType.classList.add('active')
    }
    
    newTicket.classList.add('active');
    editProfile.classList.add('active');
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
            profile = res.data.user.profile;

            makeVisible();
            await setProfile(profile);
            document.getElementById('login-success').textContent = "Login Successful";
            await getTableData();
            loginDialog.close();
        }
    } catch (error) {
        console.log(error)
        // document.getElementById('login-error').textContent = error.response.data.message;
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

function sortTickets(tickets, direction) {
    if (tickets.length == 0) return;
    if (direction == 'asc') {
        tickets = tickets.sort((a, b) => b.date_created - a.date_created);
    } else {
        tickets = tickets.sort((a, b) => a.date_created - b.date_created);
    }
}

async function getTableData() {
    if (!user || !token) return;
    let tickets = [];
    try {
        if (user.role === 'manager') {
            const res = await axios.get(`${baseUrl}/tickets`, {
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
        if (tickets.length == 0) return;
        document.querySelector('#tbody').innerHTML = "";
        sortTickets(tickets, 'asc');
        for (let ticket of tickets) {
            // if (user.role == 'manager' && ticket.author.user_id == user.user_id){
            //     continue;
            // }
            makeRow(ticket);
        }
    } catch (error) {
        console.log(error);
    }
}

async function getTableDataByType(type) {
    if (!user || !token || user.role != 'employee') return;

    try {
        let tickets = [];
        const res = await axios.get(`${baseUrl}/tickets?type=${type}&author=${user.user_id}`, {
            headers: {
                Authorization: "Bearer " + token
            }
        });
        tickets = res.data;
        document.querySelector('#tbody').innerHTML = "";
        if (tickets.length == 0) return;
        sortTickets(tickets, 'asc');
        for (let ticket of tickets) {
            makeRow(ticket);
        }
    } catch (error) {
        console.log(error);
    }

}

async function getTableDataByStatus(status) {
    if (!user || !token || user.role != 'manager') return;
    try {
        let tickets = [];
        const res = await axios.get(`${baseUrl}/tickets?status=${status}`, {
                headers: {
                    Authorization: "Bearer " + token
                }
        });
        tickets = res.data;
        document.querySelector('#tbody').innerHTML = "";
        if (tickets.length == 0) return;
        sortTickets(tickets, 'desc');
        for (let ticket of tickets) {
            if (user.role == 'manager' && ticket.author.user_id == user.user_id){
                continue;
            }
            makeRow(ticket);
        }
    } catch (error) {
        console.log(error);
    }
}

async function resolveTicket(ticket_id, status) {
    try {
        const res = await axios.patch(`${baseUrl}/tickets/${ticket_id}`, { status }, {
            headers: {
                Authorization: "Bearer " + token
            }
        });
        if (res.status != 202) return;
        
        let filterStatus = document.querySelector('#filter-ticket-status').value;
        if (filterStatus == 'none') {
            await getTableData();
        } else {
            await getTableDataByStatus(filterStatus);
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

function copyUserId(user_id) {
    navigator.clipboard.writeText(user_id);
    alert("Copied text: " + user_id);
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
    // makeCell(tr, ticket.author.username);
    makeAuthor(tr, ticket.author);
// 

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

    if (user.role == 'manager' && ticket.status == 'pending' && user.user_id != ticket.author.user_id) {
        // Edit button for ticket, returns td element containing button
        let editButton = makeEdit(tr, ticket);

        // Creates approve button, hidden
        let approveButton = makeOptions(editButton, 'Approve', 'approve'+ ticket.ticket_id)
        approveButton.classList.add('approve-btn')
    
        // Creates delete button, hidden
        let denyButton = makeOptions(editButton, 'Deny', 'deny' +  ticket.ticket_id)
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
    editButton.id = 'resolve' + row.ticket_id;
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

const makeAuthor = (tr, author) => {
    let cell = tr.appendChild(document.createElement('td'));
    let span = cell.appendChild(document.createElement('span'));
    span.classList.add('copy-author');
    span.textContent = author.username;
    span.onclick = () => copyUserId(author.user_id);
}

// Reveals hidden buttons, hides edit button
const enableRow = (rowTarget) => {
    let parsedTarget = rowTarget.split('resolve')[1];
    let row = document.querySelector('#row'+parsedTarget);
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

const filterStatus = document.querySelector("#filter-status");
filterStatus.addEventListener("change", async (event) => {
    const status = event.target.value;
    if (status == 'none') {
        await getTableData();
    } else {
        await getTableDataByStatus(status);
    }
})  

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
        let parsedId = target.id.split('approve')[1];
        let denyBtn = document.querySelector(`#deny${parsedId}`);
        let resolveBtn = document.querySelector(`#resolve${parsedId}`);

        resolveBtn.hidden = false;
        denyBtn.hidden = true;
        target.hidden = true;
        await resolveTicket(parsedId, 'approved');
    }     
    
    // Delete button, sends a delete request to server
    if (target.value === 'Deny'){
        let parsedId = target.id.split('deny')[1];
        let approveBtn = document.querySelector(`#approve${parsedId}`);
        let resolveBtn = document.querySelector(`#resolve${parsedId}`);

        resolveBtn.hidden = false;
        approveBtn.hidden = true;
        target.hidden = true;
        await resolveTicket(parsedId, 'denied');
    }

    if (target.value === 'Upload') {
        event.preventDefault();
        await uploadReceipt(target.id)
    }
});
