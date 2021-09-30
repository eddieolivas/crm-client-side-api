require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const port = process.env.PORT || 3001;

// API security
//app.use(helmet());

// Handle CORS errors
app.use(cors());

// MongoDB connection set up
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URL);

if (process.env.NODE_ENV !== "production") {
  const mongDb = mongoose.connection;

  mongDb.on("open", () => {
    console.log("MongoDB is connected.");
  });

  mongDb.on("error", (error) => {
    console.log(error);
  });
}

// Logger
app.use(morgan("tiny"));

// Set bodyParser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Load routers
const userRouter = require("./src/routers/user");
const ticketRouter = require("./src/routers/ticket");
const tokensRouter = require("./src/routers/tokens");

// Use routers
app.use("/v1/user", userRouter);
app.use("/v1/ticket", ticketRouter);
app.use("/v1/tokens", tokensRouter);

// Error handler
const handleError = require("./src/utils/errorHandler");

app.use((req, res, next) => {
  const error = new Error("Resource not found.");
  error.status = 404;
  handleError(error, res);
});

app.listen(port, () => {
  console.log(`API is listening on http://localhost:${port}`);
});
