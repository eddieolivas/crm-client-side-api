const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// API security
app.use(helmet());

// Handle CORS errors
app.use(cors());

// Logger
app.use(morgan("tiny"));

// Set bodyParser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const port = process.env.PORT || 3001;

// Load routers
const userRouter = require("./src/routers/user");
const ticketRouter = require("./src/routers/ticket");

// Use routers
app.use("/v1/user", userRouter);
app.use("/v1/ticket", ticketRouter);

// Error handler
const handleError = require("./src/utils/errorHandler");

app.use((req, res, next) => {
  const error = new Error("Resource not found.");
  error.status = 404;
  return handleError(error, res);
});

app.listen(port, () => {
  console.log(`API is listening on http://localhost:${port}`);
});
