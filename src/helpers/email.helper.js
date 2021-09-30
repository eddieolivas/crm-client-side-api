const nodemailer = require("nodemailer");

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "janie.gerhold71@ethereal.email",
    pass: "dCMaSadWz8q9tmrsJE",
  },
});

const send = (info) => {
  return new Promise(async (resolve, reject) => {
    try {
      // send mail with defined transport object
      let result = await transporter.sendMail(info);

      console.log("Message sent: %s", result.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(result));
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

      resolve(result);
    } catch (error) {
      console.log(error);
    }
  });
};

const emailProcessor = (email, pin) => {
  const info = {
    from: '"CRM Company" <meaghan.kirlin@ethereal.email>', // sender address
    to: email, // list of receivers
    subject: "Your password reset pin", // Subject line
    text: `Here is your password reset pin: ${pin} This pin will expire in 1 day`, // plain text body
    html: `<strong>Hello</strong>
    <p>Here is your password reset pin: <strong>${pin}</strong></p>
    <p>This pin will expire in 1 day</p>`, // html body
  };

  send(info);
};

module.exports = {
  emailProcessor,
};
