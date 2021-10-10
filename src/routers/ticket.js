const express = require("express");
const router = express.Router();

const {
  insertTicket,
  getTickets,
  getTicketById,
  updateClientReply,
  updateStatusClosed,
  deleteTicket,
} = require("../models/ticket/Ticket.model");
const {
  userAuthorization,
} = require("../middleware/userAuthorization.middleware");

// TODOS

// 8. Update the ticket status (closed, pending admin response, pending client response)
// 9. Delete ticket from Mongodb

router.all("/", (req, res, next) => {
  //res.json({ message: "Response from ticket router." });

  next();
});

// Create new ticket
router.post("/", userAuthorization, async (req, res) => {
  try {
    // Receive new ticket data from request body
    const { subject, sender, message } = req.body;
    const userId = req.userId;
    const ticketObject = {
      clientId: userId,
      subject,
      conversations: [
        {
          sender,
          message,
        },
      ],
    };

    // Insert ticket into Mongodb
    const result = await insertTicket(ticketObject);

    if (result._id) {
      res.json({ status: "success", message: "Your ticket has been created." });
    }
  } catch (error) {
    res.json({ status: "error", message: error.message });
  }
});

// Get all tickets
router.get("/", userAuthorization, async (req, res) => {
  try {
    const userId = req.userId;

    // Get tickets from Mongodb
    const result = await getTickets(userId);

    res.json({ status: "success", result });
  } catch (error) {
    res.json({ status: "error", message: error.message });
  }
});

// Get one ticket by ID
router.get("/:ticketId", userAuthorization, async (req, res) => {
  try {
    const userId = req.userId;
    const ticketId = req.params.ticketId;

    // Get ticket from Mongodb
    const result = await getTicketById(userId, ticketId);

    res.json({ status: "success", result });
  } catch (error) {
    res.json({ status: "error", message: error.message });
  }
});

// Update reply message from client
router.put("/:ticketId", userAuthorization, async (req, res) => {
  try {
    const _id = req.params.ticketId;
    const clientId = req.userId;

    const { sender, message } = req.body;

    // Update client reply in Mongodb ticket
    const result = await updateClientReply({ _id, clientId, message, sender });

    if (result._id) {
      return res.json({
        status: "success",
        message: "Your message was sent successfully",
      });
    }

    res.json({
      status: "error",
      message: "Your message could not be sent, please try again later.",
    });
  } catch (error) {
    res.json({ status: "error", message: error.message });
  }
});

// Close ticket
router.patch("/close-ticket/:ticketId", userAuthorization, async (req, res) => {
  try {
    const _id = req.params.ticketId;
    const clientId = req.userId;

    // Get ticket from Mongodb
    const result = await updateStatusClosed({ _id, clientId });

    if (result._id) {
      return res.json({
        status: "success",
        message: "Your ticket was closed successfully",
      });
    }

    res.json({
      status: "error",
      message: "Unable to close the ticket, please try again later.",
    });
  } catch (error) {
    res.json({ status: "error", message: error.message });
  }
});

// DELETE ticket
router.delete("/:ticketId", userAuthorization, async (req, res) => {
  try {
    const _id = req.params.ticketId;
    const clientId = req.userId;

    // Get ticket from Mongodb
    const result = await deleteTicket({ _id, clientId });

    return res.json({
      status: "success",
      message: "Your ticket was deleted successfully",
    });
  } catch (error) {
    res.json({ status: "error", message: error.message });
  }
});

module.exports = router;
