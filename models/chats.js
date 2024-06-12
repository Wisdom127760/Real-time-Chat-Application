const { Timestamp } = require('mongodb');
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    friendId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Friends',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UsersRealTimeChatApp',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    delivered: {
        type: Boolean,
        default: false
    },
    seen:{
        type: Boolean,
        default: false
    },
    createdTime:
    {
        timestamps: true
    }
});
module.exports = mongoose.model('Chat', chatSchema);