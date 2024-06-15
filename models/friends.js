const { status } = require("express/lib/response");
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
    requestStatus: {
        type: Boolean,
        enum : ["pending", "accepted", "rejected"],
        default: "pending",
    }


});

module.exports = mongoose.model("Friends", friendsSchema);
