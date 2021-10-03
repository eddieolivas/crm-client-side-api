const nodemailer = require("nodemailer");

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const send = (info) => {
  return new Promise(async (resolve, reject) => {
    try {
      // send mail with defined transport object
      let result = await transporter.sendMail(info);

      resolve(result);
    } catch (error) {
      console.log(error);
    }
  });
};

const emailProcessor = async ({ email, pin, type }) => {
  let info = "";

  switch (type) {
    case "request-new-password":
      info = {
        from: '"CRM Company" <eddie@chrysaliswebdevelopment.com>', // sender address
        to: email, // list of receivers
        subject: "Your password reset pin", // Subject line
        text: `Here is your password reset pin: ${pin} This pin will expire in 1 day`, // plain text body
        html: `<strong>Hello</strong>
        <p>Here is your password reset pin: <strong>${pin}</strong></p>
        <p>This pin will expire in 1 day</p>`, // html body
      };

      send(info);
      break;
    case "password-update-success":
      info = {
        from: '"CRM Company" <eddie@chrysaliswebdevelopment.com>', // sender address
        to: email, // list of receivers
        subject: "Password updated.", // Subject line
        text: `Your password has been reset successfully.`, // plain text body
        html: `<strong>Hello</strong>
        <p>Your password has been reset successfully.</p>`, // html body
      };

      send(info);
      break;
  }
};

module.exports = {
  emailProcessor,
};
