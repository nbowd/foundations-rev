const { createLogger, transports, format} = require("winston");

/* istanbul ignore next */
const logger = createLogger({
    format: format.combine(
        format.timestamp(),
        format.printf(({timestamp, level, message}) => {
            return `${timestamp} [${level}]: ${message}`;
        })
    ),
    transports: [
        new transports.Console(),
        new transports.File({filename: 'app.log'})
    ]
});

module.exports = logger;