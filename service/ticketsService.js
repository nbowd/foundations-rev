const ticketsDao = require('../repository/ticketsDao');
const uuid = require('uuid');

async function getTickets() {
    const result = await ticketsDao.getTickets();

    if (!result) {
        return {message: "Failed to get tickets"};
    } else {
        return {message: "Found tickets", tickets: result}
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
}

module.exports = { getTickets, createTicket };