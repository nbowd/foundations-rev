const ticketsDao = require('../repository/ticketsDao');
const userDao = require('../repository/usersDao');
const uuid = require('uuid');

async function getTickets() {
    const result = await ticketsDao.getTickets();

    if (!result) {
        return {message: "Failed to get tickets"};
    } else {
        return {message: "Found tickets", tickets: result}
    }
};

async function getTicketsByStatus(status) {
    const tickets = await ticketsDao.getTicketsByStatus(status);
    
    if (!tickets) {
        return {message: "Failed to get tickets"};
    } else {
        return {message: "Found tickets", tickets}
    }
};

async function getTicketsByAuthor(author) {
    const tickets = await ticketsDao.getTicketsByAuthor(author);

    if (!tickets) {
        return {message: "Failed to get tickets"};
    } else {
        return {message: "Found tickets", tickets}
    }
};

async function createTicket({author, description, type, amount}) {
    if (!description) {
        return {error: 'description', message: 'Description is required'};
    }

    if (!amount) {
        return {error: 'amount', message: 'Amount is required'};
    }
    
    const newTicket = {
        ticket_id: uuid.v4(),
        description,
        amount,
        type,
        author,
        resolver: "",
        status: "pending"
    };

    const result = await ticketsDao.createTicket(newTicket);

    if (!result) {
        return {message: "Failed to create ticket"};
    } else {
        return {message: "Created ticket", ticket: result};
    }
};

async function changeStatus(ticket_id, user_id, status) {
    const user = await userDao.getUserById(user_id);
    
    if (!user) {
        return {error: "invalid", message: "User id not found"};
    }

    const ticket = await ticketsDao.getTicketsById(ticket_id);
    
    if (!ticket) {
        return {error: "invalid", message: "Ticket id not found"};
    }

    if (user.role === "employee" || ticket.status !== 'pending') {
        return {error: "forbidden", message: "Forbidden access to edits"};
    }

    const result = await ticketsDao.changeStatus(ticket_id, user_id, status);
    
    if (!result) {
        return {error: "invalid", message: "Ticket could not be updated"};
    }

    return {message: "Ticket updated", ticket: result};
};

async function deleteTicket(ticket_id) {
    const user = await ticketsDao.deleteTicket(ticket_id);

    if (!user) {
        return {error: 'missing', message: 'No user matching provided id'};
    }
    return user;
}

module.exports = { getTickets, createTicket, getTicketsByStatus, getTicketsByAuthor, changeStatus, deleteTicket };