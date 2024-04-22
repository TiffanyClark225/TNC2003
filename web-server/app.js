const express = require("express");
const morgan = require("morgan");
const winston = require("winston");
const { rateLimit } = require("express-rate-limit");
const helmet = require("helmet");

const app = express();
const port = 80;

// Define your severity levels.
// With them, You can create log files,
// see or hide levels based on the running ENV.
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
  silly: 5,
};

// This method set the current severity based on
// the current NODE_ENV: show all the log levels
// if the server was run in development or staging mode; otherwise,
// if it was run in production, show only warn and error messages.
const level = () => {
  return "debug";
};

// Define different colors for each level.
// Colors make the log message more visible,
// adding the ability to focus or ignore messages.
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "cyan",
  debug: "white",
  silly: "pink",
};

// Tell winston that you want to link the colors
// defined above to the severity levels.
winston.addColors(colors);

// Chose the aspect of your log customizing the log format.
const format = winston.format.combine(
  // Add the message timestamp with the preferred format
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  // Tell Winston that the logs must be colored
  winston.format.colorize({ all: true }),
  // Define the format of the message showing the timestamp, the level and the message
  winston.format.printf(
    (info) => `[${info.timestamp}] ${info.level}: ${info.message}`
  )
);

// Define which transports the logger must use to print out messages.
// In this example, we are using three different transports
const transports = [
  // Allow the use the console to print the messages
  new winston.transports.Console(),
  // Allow to print all the error level messages inside the error.log file
  new winston.transports.File({
    filename: "logs/error.log",
    level: "error",
  }),
  // Allow to print all the error message inside the all.log file
  // (also the error log that are also printed inside the error.log(
  new winston.transports.File({ filename: "logs/all.log" }),
];

// Create the logger instance that has to be exported
// and used to log messages.
const Logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

// Override the stream method by telling
// Morgan to use our custom logger instead of the console.log.
const stream = {
  // Use the http severity
  write: (message) => Logger.http(message),
};

// Skip all the Morgan http log if the
// application is not running in development mode.
// This method is not really needed here since
// we already told to the logger that it should print
// only warning and error messages in production.
const skip = () => {
  return false;
};

// Build the morgan middleware
const Morgan = morgan(
  // Define message format string (this is the default one).
  // The message format is made from tokens, and each token is
  // defined inside the Morgan library.
  // You can create your custom token to show what do you want from a request.
  ":method :url :status - :response-time ms",
  // Options: in this case, I overwrote the stream and the skip logic.
  // See the methods above.
  { stream, skip }
);

// Rate Limiting
app.use(
  rateLimit({
    message: "Too many requests from this IP, please try again later",
  })
);

// Secure HTTP headers
app.use(helmet());

// Setup middleware
app.use(Morgan);

app.disable("x-powered-by");

// Serve static files
app.use(express.static("public"));

// Custom Error Handler
app.use((err, req, res, next) => {
  // Logging the API request route
  const route = `${req.method} ${req.originalUrl}`;

  const routeError = `[Route: ${route}]`;
  Logger.error(`${userError} ${routeError} ${statusError} ${metadataError}`);

  Logger.error("Debug Information (Stack & Data)");
  Logger.error(err.stack);

  res.status(500).send("Something broke!");
});

app.listen(port, () => {
  Logger.info(`Server running on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  Logger.error(`Server Unhandled Rejection Error: ${err.message}`);
});
