const express = require('express');
const morgan = require('morgan');
const winston = require('winston');

const app = express();
const port = 80;

// Logger configuration
const logConfiguration = {
    transports: [
        new winston.transports.Console()
    ]
};

// Create the logger
const logger = winston.createLogger(logConfiguration);

// Setup middleware
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) }}));

// Serve static files
app.use(express.static('public'));

app.listen(port, () => {
    logger.info(`Server running on http://localhost:${port}`);
});
