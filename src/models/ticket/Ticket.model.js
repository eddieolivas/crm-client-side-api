const { TicketSchema } = require("./Ticket.schema");

const insertTicket = (ticketObject) => {
  return new Promise((resolve, reject) => {
    TicketSchema(ticketObject)
      .save()
      .then((data) => {
        resolve(data);
      })
      .catch((error) => reject(error));
  });
};

module.exports = {
  insertTicket,
};
