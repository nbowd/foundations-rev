const jwt = require("jsonwebtoken");
const logger = require("./logger");

/* istanbul ignore next */
async function decodeJWT(token) {
    try {
        const user = await jwt.verify(token, process.env.secretKey);
        return user;
    } catch (error) {
        logger.error(error);
        throw new Error("Token verification failed");
    }
}

/* istanbul ignore next */
async function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token){
        return res.status(401).json({error: "Unauthorized", status: 401, message: "Missing JWT Authorization"});
    } 

    try {
        const user = await decodeJWT(token);
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({error: "Unauthorized", status:401, message: "JWT token failed verification"});
    }
}

function validateUser(data) {
    if (!data.username || !data.password) {
        return false;
    } else {
        return (data.username.length > 0 && data.password.length > 0);
    }
}

/* istanbul ignore next */
function validateUserMiddleware(req, res, next) {
    const data = req.body;

    if (validateUser(data)) {
        next();
    } else {
        return res.status(400).json({error: "Bad Request", status: 400, message: "Missing or Empty Username or Password"})
    }
}

function validateManager(user) {
    return user.role === 'manager';
}

/* istanbul ignore next */
function validateManagerMiddleWare(req, res, next) {
    const user = req.user;

    if (validateManager(user)) {
        next();
    } else {
        return res.status(403).json({error: "Forbidden Access", status: 403, message: "Manager only endpoint"});
    }
}

module.exports = { validateUser, validateManager, validateUserMiddleware, authenticateToken, validateManagerMiddleWare };