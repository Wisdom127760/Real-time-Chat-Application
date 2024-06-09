const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
    firstname: {
      required: true,
      type: String,
    },
    lastname: {
      required: true,
      type: String,
    },
    email: {
      required: true,
      type: String,
    },
    username: {
      required: true,
      type: String,
    },
    password: {
      required: true,
      type: String,
    },
    resetToken: {
      required: false,
      type: String,
    }
  });

  module.exports = mongoose.model("UsersRealTimeChatApp", usersSchema);