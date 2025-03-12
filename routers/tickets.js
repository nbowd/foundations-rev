const router = require('express');
const ticketsService = require('../service/ticketsService');

const ticketsRouter = router.Router();

ticketsRouter.get('/', async function(req, res) {
    const queryParams = req.query;
    
    if (queryParams.status) {
        const tickets = await ticketsService.getTicketsByStatus(queryParams.status);
        return res.status(200).json(tickets);
    }

    if (queryParams.author) {
        const tickets = await ticketsService.getTicketsByAuthor(queryParams.author);
        return res.status(200).json(tickets);
    }

    const tickets = await ticketsService.getTickets();
    return res.status(200).json(tickets);
})

ticketsRouter.post('/', async function(req, res) {
    const ticket = await ticketsService.createTicket(req.body);

    if (ticket.error == 'amount' || ticket.error == 'description') {
        return res.status(400).send(ticket.message);
    }

    return res.status(201).json(ticket.ticket);
})

module.exports = ticketsRouter;