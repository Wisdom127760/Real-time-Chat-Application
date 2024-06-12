const mongoose = require("mongoose");

const friendsSchema = new mongoose.Schema({


    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UsersRealTimeChatApp",
        required: true,
    },
    friendId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UsersRealTimeChatApp",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },  
    accpeted: {
        type: Boolean,
        default: false,
    }


});

module.exports = mongoose.model("Friends", friendsSchema);
