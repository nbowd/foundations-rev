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
        return res.status(400).send("No image uploaded");
    }
}

function validateTicket(ticket_id, status) {
    if (!ticket_id || !status) {
        return false;
    } else {
        return ticket_id.length > 0 && (status === 'approved' || status === 'denied')
    }
}

/* istanbul ignore next */
function validateTicketMiddleware(req, res, next) {
    const ticket_id = req.params.ticket_id;
    const status = req.body.status;

    if (validateTicket(ticket_id, status)) {
        next()
    } else {
        res.status(400).send("'ticket_id' path parameter, and 'status' JSON body required");
    }
}

/* istanbul ignore next */
ticketsRouter.get('/', authenticateToken, async function(req, res) {
    const queryParams = req.query;
    
    if (queryParams.status) {
        const tickets = await ticketsService.getTicketsByStatus(queryParams.status, req.user);
        if (tickets.error) {
            return res.status(403).send(tickets.message);
        }
        return res.status(200).json(tickets.tickets);
    }

    if (queryParams.author) {
        const tickets = await ticketsService.getTicketsByAuthor(queryParams.author);
        return res.status(200).json(tickets.tickets);
    }

    if (queryParams.type) {
        const tickets = await ticketsService.getTicketsByType(queryParams.type);
        return res.status(200).json(tickets.tickets);
    }

    const tickets = await ticketsService.getTickets();
    return res.status(200).json(tickets);
})

/* istanbul ignore next */
ticketsRouter.post('/', authenticateToken, async function(req, res) {
    const ticket = await ticketsService.createTicket(req.body, req.user);

    if (ticket.error) {
        return res.status(400).send(ticket.message);
    }

    return res.status(201).json(ticket.ticket);
})

/* istanbul ignore next */
ticketsRouter.post('/:ticket_id/receipt', authenticateToken, validateReceiptMiddleware, async function(req, res) {

    const ticket_id = req.params.ticket_id;
    const ticket = await ticketsService.addReceipt(ticket_id, req.body, req.user);

    if (ticket && ticket.error === 'Missing') {
        return res.status(400).send(ticket.message);
    }

    if (ticket && ticket.error === 'Forbidden') {
        return res.status(403).send(ticket.message);
    }

    return res.status(202).json(ticket.ticket);
});

/* istanbul ignore next */
ticketsRouter.patch('/:ticket_id', validateTicketMiddleware, authenticateToken, validateManagerMiddleWare, async function(req, res) {
    const ticket_id = req.params.ticket_id;
    const user_id = req.user.id;
    const status = req.body.status;

    const result = await ticketsService.changeStatus(ticket_id, user_id, status);

    if (result && result.error === 'invalid') {
        return res.status(400).send(result.message);
    }

    if (result && result.error === 'forbidden') {
        return res.status(403).send(result.message);
    }

    return res.status(202).json(result.ticket);
})

/* istanbul ignore next */
ticketsRouter.delete('/:ticket_id', async function(req, res) {
    const ticket = await ticketsService.deleteTicket(req.params.ticket_id);

    if (ticket.error == 'missing') {
        return res.status(404).send(ticket.message);
    }

    return res.status(200).json(ticket);
})

module.exports = {validateReceipt, validateTicket , ticketsRouter};