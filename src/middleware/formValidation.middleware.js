const Joi = require("joi");

const email = Joi.string()
  .email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  })
  .required();

const pin = Joi.number().min(100000).max(999999).required();

const password = Joi.string().alphanum().min(3).max(30).required();

const shortString = Joi.string().min(2).max(50);
const longString = Joi.string().min(2).max(100);
const date = Joi.date();

const resetPassReqValidation = (req, res, next) => {
  const schema = Joi.object({ email });
  const value = schema.validate(req.body);

  if (value.error) {
    return res.json({ status: "error", message: value.error.message });
  }
  next();
};

const updatePassValidation = (req, res, next) => {
  const schema = Joi.object({ email, pin, password });
  const value = schema.validate(req.body);

  if (value.error) {
    return res.json({ status: "error", message: value.error.message });
  }
  next();
};

const createNewTicketValidation = (req, res, next) => {
  const schema = Joi.object({
    subject: shortString.required(),
    sender: shortString.required(),
    message: longString.required(),
    createDate: date.required(),
  });
  const value = schema.validate(req.body);

  if (value.error) {
    return res.json({ status: "error", message: value.error.message });
  }
  next();
};

const replyTicketValidation = (req, res, next) => {
  const schema = Joi.object({
    sender: shortString.required(),
    message: longString.required(),
  });
  const value = schema.validate(req.body);

  if (value.error) {
    return res.json({ status: "error", message: value.error.message });
  }
  next();
};

module.exports = {
  resetPassReqValidation,
  updatePassValidation,
  createNewTicketValidation,
  replyTicketValidation,
};
