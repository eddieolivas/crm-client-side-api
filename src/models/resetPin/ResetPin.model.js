const { randomPinNumber } = require("../../utils/randomPinGenerator");
const { ResetPinSchema } = require("./ResetPin.schema");

const setPasswordResetPin = async (email) => {
  // Create random 6 digit value
  const pinLength = 6;
  const randomPin = await randomPinNumber(pinLength);

  const resetObject = {
    email,
    pin: randomPin,
  };

  return new Promise((resolve, reject) => {
    ResetPinSchema(resetObject)
      .save()
      .then((data) => {
        resolve(data);
      })
      .catch((error) => reject(error));
  });
};

module.exports = {
  setPasswordResetPin,
};
