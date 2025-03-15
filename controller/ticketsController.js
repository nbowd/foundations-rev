const express = require('express');
const ticketsService = require('../service/ticketsService');
const { authenticateToken, validateManagerMiddleWare } = require('../utils/middleware');

const ticketsRouter = express.Router();

function validateReceipt(ticket_id, file) {
    if (!ticket_id || !file) {
        return false;
    } else {
        return ticket_id.length > 0 && file.length > 0;
    }
}

/* istanbul ignore next */
function validateReceiptMiddleware(req, res, next) {
    if (validateReceipt(req.params.ticket_id, req.body)) {
        next();
    } else {
        return res.status(400).json({error: "Bad Request", status:400, message: "No image uploaded"});
    }
}

function validateStatusChange(ticket_id, status) {
    if (!ticket_id || !status) {
        return false;
    } else {
        return ticket_id.length > 0 && (status === 'approved' || status === 'denied')
    }
}

/* istanbul ignore next */
function validateStatusChangeMiddleware(req, res, next) {
    const ticket_id = req.params.ticket_id;
    const status = req.body.status;

    if (validateStatusChange(ticket_id, status)) {
        next()
    } else {
        return res.status(400).json({error:"Bad Request", status:400, message: "'ticket_id' path parameter, and 'status' JSON body required"});
    }
}

function validateTicketPost({amount, description}) {
    if (!amount || !description) {
        return false;
    } else {
        return amount > 0 && description.length > 0;
    }
}

/* istanbul ignore next */
function validateTicketPostMiddleware(req, res, next) {
    if (validateTicketPost(req.body)) {
        next();
    } else {
        return res.status(400).json({error: "Bad Request", status:400, message: "Missing/Empty amount and/or description attributes"});
    }
}

/* istanbul ignore next */
ticketsRouter.get('/', authenticateToken, async function(req, res) {
    const queryParams = req.query;
    
    if (queryParams.status) {
        const tickets = await ticketsService.getTicketsByStatus(queryParams.status, req.user.id);
        if (tickets.error) {
            return res.status(tickets.status).json(tickets);
        }
        return res.status(200).json(tickets.tickets);
    }

    if (queryParams.author) {
        const tickets = await ticketsService.getTicketsByAuthor(queryParams.author);
        if (tickets.error) {
            return res.status(tickets.status).json(tickets);
        }
        return res.status(200).json(tickets.tickets);
    }

    if (queryParams.type) {
        const tickets = await ticketsService.getTicketsByType(queryParams.type);
        if (tickets.error) {
            return res.status(tickets.status).json(tickets);
        }
        return res.status(200).json(tickets.tickets);
    }

    const tickets = await ticketsService.getTickets();

    if (tickets.error) {
        return res.status(tickets.status).json(tickets);
    }

    return res.status(200).json(tickets);
})

/* istanbul ignore next */
ticketsRouter.post('/', authenticateToken, validateTicketPostMiddleware, async function(req, res) {
    const ticket = await ticketsService.createTicket(req.body, req.user);

    if (ticket.error) {
        return res.status(ticket.status).json(ticket);
    }

    return res.status(201).json(ticket.ticket);
})

/* istanbul ignore next */
ticketsRouter.post('/:ticket_id/receipt', authenticateToken, validateReceiptMiddleware, async function(req, res) {

    const ticket_id = req.params.ticket_id;
    const ticket = await ticketsService.addReceipt(ticket_id, req.body, req.user);

    if (ticket.error) {
        return res.status(ticket.status).json(ticket);
    }

    return res.status(202).json(ticket.ticket);
});

/* istanbul ignore next */
ticketsRouter.patch('/:ticket_id', validateStatusChangeMiddleware, authenticateToken, validateManagerMiddleWare, async function(req, res) {
    const ticket_id = req.params.ticket_id;
    const user_id = req.user.id;
    const status = req.body.status;

    const result = await ticketsService.changeStatus(ticket_id, user_id, status);

    if (result.error) {
        return res.status(result.status).json(result);
    }

    return res.status(202).json(result.ticket);
})

/* istanbul ignore next */
ticketsRouter.delete('/:ticket_id', async function(req, res) {
    const ticket = await ticketsService.deleteTicket(req.params.ticket_id);

    if (ticket.error) {
        return res.status(ticket.status).json(ticket);
    }

    return res.status(200).json(ticket);
})

module.exports = {validateTicketPost, validateReceipt, validateStatusChange , ticketsRouter};