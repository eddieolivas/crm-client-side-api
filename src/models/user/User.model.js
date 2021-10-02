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

const getUserById = (_id) => {
  return new Promise((resolve, reject) => {
    if (!_id) return false;

    try {
      UserSchema.findOne({ _id }, (error, data) => {
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
            "refreshJWT.addedOn": Date.now(),
          },
        },
        { new: true }
      )
        .then((data) => resolve(data))
        .catch((error) => {
          reject(error);
          console.log(error);
        });
    } catch (error) {
      reject(error);
      console.log(error);
    }
  });
};

const updatePassword = async (email, newPassword) => {
  return new Promise((resolve, reject) => {
    try {
      UserSchema.findOneAndUpdate(
        { email },
        {
          $set: {
            password: newPassword,
          },
        },
        { new: true }
      )
        .then((data) => resolve(data))
        .catch((error) => {
          reject(error);
          console.log(error);
        });
    } catch (error) {
      reject(error);
      console.log(error);
    }
  });
};

module.exports = {
  insertUser,
  getUserById,
  getUserByEmail,
  storeUserRefreshJWT,
  updatePassword,
};
