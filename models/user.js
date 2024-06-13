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
    },
    expireToken: {
      required: false,
      type: Date,
    },
    friendsList: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Friends",
    }],
    sentRequest: [{
      type: String,
      default: " ",
    }],
    request: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UsersRealTimeChatApp",
      },
      username: {
        type: String,
      }
    }],
    totalRequest: {
      type: Number,
      default: 0,
    }
  });

  module.exports = mongoose.model("UsersRealTimeChatApp", usersSchema);