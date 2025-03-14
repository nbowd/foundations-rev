const router = require('express');
const ticketsService = require('../service/ticketsService');
const { validateTicketMiddleware, authenticateToken, validateManagerMiddleWare, validateReceiptMiddleware } = require('../utils/middleware');

const ticketsRouter = router.Router();

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

ticketsRouter.post('/', authenticateToken, async function(req, res) {
    const ticket = await ticketsService.createTicket(req.body, req.user);

    if (ticket.error) {
        return res.status(400).send(ticket.message);
    }

    return res.status(201).json(ticket.ticket);
})

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

ticketsRouter.delete('/:ticket_id', async function(req, res) {
    const ticket = await ticketsService.deleteTicket(req.params.ticket_id);

    if (ticket.error == 'missing') {
        return res.status(404).send(ticket.message);
    }

    return res.status(200).json(ticket);
})

module.exports = ticketsRouter;