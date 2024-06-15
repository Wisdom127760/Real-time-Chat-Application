const express = require('express');
const routers = express.Router();
const users = require('../models/user');
const friends = require('../models/friends');
const { promise } = require('bcrypt/promises');
const { getRequestBasedOnStatus, limitRequests } = require('../services/friendsService');

routers.post('/sendrequest', async (req, res) => {
    const { userId, friendId } = req.body;

    // console.log(userId, friendId);
    try {

        //check if user exists

        const { sender, reciever }  = await promise.all([
            users.findId({_id: userId}),
            users.findId({_id: friendId}),
        ]);

        if (!sender || !reciever) {
            res.status(404).send({ message: "Both sender and reciever must be valid users" });
            return;

        }
        // check if sender and reciever are already friends
        const isFriend = await promise.all([
        
            friends.find({ userId: userId}),
            friends.find({ userId: friendId}),
           
        ]);
        
        if (isFriend[0] && isFriend[1]) {
           return res.status(409).send({ message: `Both ${isFriend[0]} and ${isFriend[1]} are friends already` });
        }
        
        


        // const user = await users.findOne({ _id: userId });
        // const friend = await users.findOne({ _id: friendId });
        // if (!user || !friend) {
        //     res.status(400).send({ message: "Invalid user id" });
        //     return;
        // }
        // const prevFriend = await friends.findOne({ userId: userId, friendId: friendId });
        // if (prevFriend) {
        //     res.status(400).send({ message: "Friend request already sent" });
        //     return;
        // }
        // const newFriend = new friends({ userId: userId, friendId: friendId });
        // newFriend.save();
        // res.status(200).send({ message: "Friend request sent" });
    } catch (error) {
        res.status(500).send({ message: "Error sending friend request" });
    }
});

routers.get('/getrequests/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await users.findOne({ _id: userId });
        if (!user) {
            res.status(400).send({ message: "Invalid user id" });
            return;
        }
        const friendRequests = await friends.find({ friendId: userId });
        let requests = [];

        for (let i = 0; i < friendRequests.length; i++) {
            console.log(friendRequests[i].userId);
            const friend = await users.findOne({ _id: friendRequests[i].userId });
            requests.push(friend);
        }
        res.status(200).send(requests);
    } catch (error) {
        if (userId.length !== 24) {
            res.status(400).send({ message: " Invalid user id : The lenght of the user ID is too much." });
            return;
        }
        res.status(500).send({ message: "Error getting friend requests" });
    }
});

routers.post('/acceptrequest', async (req, res) => { 
    const { userId, friendId } = req.body;
    try {
        const user = await users.findOne({ _id: userId });
        const friend = await users.findOne({ _id: friendId });
        if (!user || !friend) {
            res.status(400).send({ message: "Invalid user id" });
            return;
        }
        const prevFriend = await friends.findOne({ userId: friendId, friendId: userId });
        if (!prevFriend) {
            res.status(400).send({ message: "No friend request found" });
            return;
        }
        const newFriend = new friends({ userId: userId, friendId: friendId });
        newFriend.save();
        res.status(200).send({ message: "Friend request accepted" });
    } catch (error) {
        res.status(500).send({ message: "Error accepting friend request" });
    }
}
);
routers.post('/rejectrequest', async (req, res) => {
    const { userId, friendId } = req.body;
    try {
        const user = await users.findOne({ _id: userId });
        const friend = await users.findOne({ _id: friendId });
        if (!user || !friend) {
            res.status(400).send({ message: "Invalid user id" });
            return;
        }
        const prevFriend = await friends.findOne({ userId: friendId, friendId: userId });
        if (!prevFriend) {
            res.status(400).send({ message: "No friend request found" });
            return;
        }
        prevFriend.remove();
        res.status(200).send({ message: "Friend request rejected" });
    } catch (error) {
        res.status(500).send({ message: "Error rejecting friend request" });
    }
}); 

module.exports = routers;