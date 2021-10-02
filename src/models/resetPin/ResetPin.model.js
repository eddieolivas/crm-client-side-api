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

const getPinByEmailPin = async (email, pin) => {
  return new Promise((resolve, reject) => {
    try {
      ResetPinSchema.findOne({ email, pin }, (error, data) => {
        if (error || !data) {
          resolve(false);
        }
        resolve(data);
      });
    } catch (error) {
      console.log(error);
    }
  });
};

const deletePin = async (email, pin) => {
  try {
    ResetPinSchema.findOneAndDelete({ email, pin }, (error, data) => {
      if (error || !data) {
        console.log(error);
        resolve(false);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  setPasswordResetPin,
  getPinByEmailPin,
  deletePin,
};
