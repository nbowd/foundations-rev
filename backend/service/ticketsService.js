const ticketsDao = require('../repository/ticketsDao');
const userDao = require('../repository/usersDao');
const uuid = require('uuid');

/* istanbul ignore next */
async function attachUser(tickets) {
    if (tickets.length == 0) return;
    let result = [];
    for (let ticket of tickets) {
        let author = await userDao.getUserById(ticket.author);
        ticket.author = { user_id: author.user_id, username: author.username };
        result.push(ticket);
    }
    return result;
}

/* istanbul ignore next */
async function getTickets() {
    const tickets = await ticketsDao.getTickets();

    if (!tickets) {
        return {error: "Bad Request", status: 400, message: "Failed to get tickets"};
    } else {
        let result = await attachUser(tickets);
        return {message: "Found tickets", tickets: result}
    }
};

/* istanbul ignore next */
async function getTicketsByStatus(status, user_id) {
    const user = await userDao.getUserById(user_id);

    if (!user) {
        return {error: "Bad Request", status: 400, message: "Failed to update user"};
    }

    if (user.role !== 'manager') {
        return {error: "Forbidden Access", status: 403, message: "Manager only endpoint"};
    }

    const tickets = await ticketsDao.getTicketsByStatus(status);
    
    if (!tickets) {
        return {error: "Bad Request", status: 400, message: "Failed to get tickets"};
    } else {
        let result = await attachUser(tickets);
        return {message: "Found tickets", tickets: result}
    }
};

/* istanbul ignore next */
async function getTicketsByAuthor(author) {
    const tickets = await ticketsDao.getTicketsByAuthor(author);

    if (!tickets) {
        return {error: "Bad Request", status: 400, message: "Failed to get tickets"};
    } else {
        let result = await attachUser(tickets);
        return {message: "Found tickets", tickets: result}
    }
};

/* istanbul ignore next */
async function getTicketsByType(author, type) {
    const tickets = await ticketsDao.getTicketsByType(author, type);

    if (!tickets) {
        return {error: "Bad Request", status: 400, message: "Failed to get tickets"};
    } else {
        let result = await attachUser(tickets);
        return {message: "Found tickets", tickets: result}
    }
};

/* istanbul ignore next */
async function createTicket({description, type, amount}, user) {
    const newTicket = {
        ticket_id: uuid.v4(),
        description,
        amount,
        type,
        author: user.id,
        resolver: "",
        status: "pending",
        receipt: "",
        date_created: Date.now()
    };

    const result = await ticketsDao.createTicket(newTicket);

    if (!result) {
        return {error: "Bad Request", status: 400, message: "Failed to create ticket"};
    } else {
        return {message: "Created ticket", ticket: result};
    }
};

/* istanbul ignore next */
async function changeStatus(ticket_id, user_id, status) {
    const user = await userDao.getUserById(user_id);
    
    if (!user) {
        return {error: "Bad Request", status:400, message: "User id not found"};
    }

    const ticket = await ticketsDao.getTicketsById(ticket_id);
    
    if (!ticket) {
        return {error: "Bad Request", status:400, message: "Ticket id not found"};
    }

    if (ticket.status !== 'pending') {
        return {error: "Forbidden Access", status: 403, message: "Cannot edit resolved tickets"};
    }

    if (ticket.author == user.user_id) {
        return {error: "Forbidden Access", status: 403, message: "Cannot resolve own tickets"};
    }
    
    const result = await ticketsDao.changeStatus(ticket_id, user_id, status);
    
    if (!result) {
        return {error: "Bad Request", status:400, message: "Ticket could not be updated"};
    }

    return {message: "Ticket updated", ticket: result};
};

/* istanbul ignore next */
async function addReceipt(ticket_id, file, user) {
    const ticket = await ticketsDao.getTicketsById(ticket_id);

    if (!ticket) {
        return {error: "Bad Request", status:400,  message: "Ticket not found"}
    }

    if (user.id !== ticket.author) {
        return {error: "Forbidden Access", status: 403, message: "Ticket is not owned by requester"};
    }

    const fileName = await ticketsDao.uploadReceipt(file);
    const newTicket = await ticketsDao.updateTicket(ticket.ticket_id, fileName);

    return {message: "Ticket found", ticket: newTicket};
}

/* istanbul ignore next */
async function deleteTicket(ticket_id) {
    const user = await ticketsDao.deleteTicket(ticket_id);

    if (!user) {
        return {error: "Bad Request", status:400, message: 'No user matching provided id'};
    }
    return user;
}

module.exports = { getTickets, createTicket, getTicketsByStatus, getTicketsByAuthor, changeStatus, deleteTicket, getTicketsByType, addReceipt };