// Description: Model for friends collection
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
    requestStatus: {
        type: String,
        enum : ["pending", "accepted", "rejected"],
        default: "pending",
    }
},
    {
        timestamps: true,
    
    }


);

module.exports = mongoose.model("Friends", friendsSchema);
