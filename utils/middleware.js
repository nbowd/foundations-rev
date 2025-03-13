const jwt = require("jsonwebtoken");
const logger = require("./logger");

async function decodeJWT(token) {
    try {
        const user = await jwt.verify(token, process.env.secretKey);
        return user;
    } catch (error) {
        logger.error(error);
        throw new Error("Token verification failed");
    }
}

async function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token){
        return res.status(401).send("Missing Authorization");
    } 

    try {
        const user = await decodeJWT(token);
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).send("Invalid token");
    }
       
    
}
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

function validateTicket(ticket_id, status) {
    return (ticket_id && status);
}

function validateTicketMiddleware(req, res, next) {
    const ticket_id = req.params.ticket_id;
    const status = req.body.status;

    if (validateTicket(ticket_id, status)) {
        next()
    } else {
        res.status(400).send("'ticket_id' path parameter, and 'status' JSON body required");
    }
}

function validateManager(user) {
    return user.role === 'manager';
}



function validateManagerMiddleWare(req, res, next) {
    const user = req.user;

    if (validateManager(user)) {
        next();
    } else {
        return res.status(403).send("Manager only endpoint")
    }
    
}

function validateChangeRole(user_id, role, user){
    return (user_id && role && user);
}

function validateChangeRoleMiddleware(req, res, next) {
    const user_id = req.params.user_id;
    const { role } = req.body;
    const user = req.user;

    if (validateChangeRole(user_id, role, user)) {
        next();
    } else {
        return res.status(400).send("Missing user_id path param, role body attribute, user auth");
    }
}

module.exports = { validateUserMiddleware, validateTicketMiddleware, authenticateToken, validateManagerMiddleWare, validateChangeRoleMiddleware };