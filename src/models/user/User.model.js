const { UserSchema } = require("./User.schema");

const insertUser = (userObject) => {
  return new Promise((resolve, reject) => {
    UserSchema(userObject)
      .save()
      .then((data) => {
        resolve(data);
      })
      .catch((error) => reject(error));
  });
};

const getUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    if (!email) return false;

    try {
      UserSchema.findOne({ email }, (error, data) => {
        if (error) {
          reject(error);
        }

        resolve(data);
      });
    } catch (error) {
      reject(error);
    }
  });
};

const storeUserRefreshJWT = (_id, token) => {
  return new Promise((resolve, reject) => {
    try {
      UserSchema.findOneAndUpdate(
        { _id },
        {
          $set: {
            "refreshJWT.token": token,
          },
        }
      );
    } catch (error) {}
  });
  console.log("test");
};

module.exports = {
  insertUser,
  getUserByEmail,
};
