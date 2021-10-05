const express = require("express");
const router = express.Router();

const { insertTicket } = require("../models/ticket/Ticket.model");

// TODOS

// 5. Retrieve all tickets for the specific user
// 6. Retrieve a single ticket for the specific user
// 7. Update the message conversation in the ticket table
// 8. Update the ticket status (closed, pending admin response, pending client response)
// 9. Delete ticket from Mongodb

router.all("/", (req, res, next) => {
  //res.json({ message: "Response from ticket router." });

  next();
});

// 1. Create URL endpoints

router.post("/", async (req, res) => {
  try {
    // 2. Receive new ticket data
    const { subject, sender, message } = req.body;

    const ticketObject = {
      clientId: "6158b92e39ded5da95bf5725",
      subject,
      conversations: [
        {
          sender,
          message,
        },
      ],
    };

    // 3. Authorize every request with JWT

    // 4. Insert ticket into Mongodb
    const result = await insertTicket(ticketObject);

    if (result._id) {
      res.json({ status: "success", message: "Your ticket has been created." });
    }
  } catch (error) {
    res.json({ status: "error", message: error.message });
  }
});

router.get("/", (req, res) => {});

module.exports = router;
