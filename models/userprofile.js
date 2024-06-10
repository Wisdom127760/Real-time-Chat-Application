const mongoose = require('mongoose');
const imageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UsersRealTimeChatApp',
        required: true
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email:
    {
        type: String,
        required: true
    },
    username:
    {
        type: String,
        required: true
    },
    password:
    {
        type: String,
        required: true
    },

    phone :
    {
        type: Number,
        required: true
    },
    img:
    {
        data: Buffer,
        contentType: String
    },
    createdAt:{
        type: Date,
        default: Date.now
    
    }
});
 
module.exports = mongoose.model('Image', imageSchema);