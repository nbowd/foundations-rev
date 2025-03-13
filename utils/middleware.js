function validateUser(data) {
    return (data.username && data.password)
}

function validateUserMiddleware(req, res, next) {
    const data = req.body;

    if (validateUser(data)) {
        next();
    } else {
        res.status(400).send("Missing Username or Password")
    }
}

function validateTicket(ticket_id, user_id, status) {
    return (ticket_id && user_id && status);
}

function validateTicketMiddleware(req, res, next) {
    const ticket_id = req.params.ticket_id;
    const user_id = req.headers['current-user'];
    const status = req.body.status;

    if (validateTicket(ticket_id, user_id, status)) {
        next()
    } else {
        res.status(400).send("'current-user' header, 'ticket_id' path parameter, and 'status' JSON body required");
    }
}
module.exports = { validateUserMiddleware, validateTicketMiddleware };