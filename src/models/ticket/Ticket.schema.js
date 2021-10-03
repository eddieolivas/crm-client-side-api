const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TicketSchema = new Schema({
  clientId: {
    type: Schema.Types.ObjectId,
  },
  subject: {
    type: String,
    maxlength: 100,
    required: true,
    default: "",
  },
  addedOn: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  status: {
    type: String,
    required: true,
    maxlength: 30,
    default: "Pending Admin Response",
  },
  sender: {
    type: String,
    maxlength: 50,
    required: true,
  },
  message: {
    type: String,
    maxlength: 800,
  },
});

module.exports = {
  TicketSchema: mongoose.model("Ticket", TicketSchema),
};
