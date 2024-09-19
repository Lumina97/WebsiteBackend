const pino = require('pino');
const path = require('path');
const fs = require('fs');

const logDirectory = path.join(__dirname, "Log");
const logFilePath = path.join(logDirectory, "app.log");

// Create the log directory if it does not exist
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

const transport = pino.transport({
    targets: [
        {
            level: 'trace',
            target: 'pino/file',
            options: {
                destination: logFilePath,
            },
        },
        {
            level: 'trace',
            target: 'pino-pretty',
            options: {},
        },
    ],
});


// Create the Pino logger with pretty-printing for console
const log = pino(transport);

module.exports = {
    log
};