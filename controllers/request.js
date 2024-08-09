const express = require("express");
const routers = express.Router();
const users = require("../models/user");
const friends = require("../models/friends");
const dotenv = require("dotenv");
dotenv.config();
//const { promise } = require('bcrypt/promises');
const { getRequestBasedOnStatus } = require("../service/friendsService");

routers.post("/sendrequest", async (req, res) => {
  const { userId, friendId } = req.body;

  console.log("Request Body:", userId, friendId);

  try {
    // Find sender and receiver in the users collection
    const [sender, receiver] = await Promise.all([
      users.findById(userId),
      users.findById(friendId),
    ]);

    if (!sender || !receiver) {
      res
        .status(404)
        .send({ message: "Both sender and receiver must be valid users" });
      return;
    }

    // Check if a friendship already exists
    const isFoundFriendship = await friends.find({
      $or: [
        { userId: userId, friendId: friendId },
        { userId: friendId, friendId: userId },
      ],
    });

    console.log("Friendship Check Result:", isFoundFriendship);

    if (isFoundFriendship.length > 0) {
      const isPending = isFoundFriendship.filter(
        (friend) => friend.requestStatus === "pending"
      );
      if (isPending.length > 0) {
        return res.status(409).send({
          message: `Friendship request already exists between ${sender.username} and ${receiver.username}. ${sender.username} is waiting for ${receiver.username} to accept the request!`,
        });
      }
      const isAccepted = isFoundFriendship.filter(
        (friend) => friend.requestStatus === "accepted"
      );
      if (isAccepted.length > 0) {
        return res.status(409).send({
          message: `Friendship request already exists between ${sender.username} and ${receiver.username}.`,
        });
      }
    }

    const isRequestSent = await getRequestBasedOnStatus(req, "pending");
    if (isRequestSent.isFound && isRequestSent.docsCount > 0) {
      return res
        .status(409)
        .send({ message: `You already have a pending request for this user` });
    }
    //console.log('isRequestSent', isRequestSent);

    const newFriendRequest = await friends.create({
      userId: userId,
      friendId: friendId,
      requestStatus: "pending",
    });

    if (!newFriendRequest) {
      return res.status(500).send({ message: "Error sending friend request" });
    } else {
      await users.findByIdAndUpdate(
        userId,
        {
          $push: {
            sentRequest: newFriendRequest,
          },
        },
        { new: true }
      );

      // Update the recipient's receivedRequest array
      await users.findByIdAndUpdate(
        friendId,
        {
          $push: {
            request: newFriendRequest,
          },
        },
        { new: true }
      );

      return res.status(201).send({
        message: "Friend request sent successfully",
        data: newFriendRequest,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({
      message: "Error sending friend request",
      error: error.message,
    });
  }
});

routers.get("/getrequests/:userId", async (req, res) => {
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
      res.status(400).send({
        message: " Invalid user id : The lenght of the user ID is too much.",
      });
      return;
    }
    res.status(500).send({ message: "Error getting friend requests" });
  }
});

routers.post("/acceptrequest", async (req, res) => {
  const { userId, friendId } = req.body;
  try {
    const user = await users.findOne({ _id: userId });
    const friend = await users.findOne({ _id: friendId });
    if (!user || !friend) {
      res.status(400).send({ message: "Invalid user id" });
      return;
    }
    const prevFriend = await friends.findOne({
      userId: friendId,
      friendId: userId,
    });
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
});
// routers.post("/rejectrequest", async (req, res) => {
//   const { currentUser, friendId } = req.body;

//   console.log("Request Body:", currentUser, friendId);
//   try {
//     const user = await users.findOne({ _id: currentUser });
//     const friend = await users.findOne({ _id: friendId });
//     if (!user || !friend) {
//       res.status(400).send({ message: "Invalid user id" });
//       return;
//     }

//     const requestStatus = await getRequestBasedOnStatus(req, "pending");

//     console.log("Request Status:", requestStatus);

//     if (!requestStatus.isFound && !requestStatus.docsCount > 0) {
//       return res
//         .status(404)
//         .send({ message: `No pending request found for ${user.username}` });
//     }
//     const pendingRequest = await friends.findOneAndUpdate(
//       { userId: friendId, friendId: currentUser, requestStatus: "pending" },
//       { requestStatus: "rejected" },
//       { new: true }
//     );
//     if (!pendingRequest) {
//       return res
//         .status(404)
//         .send({ message: `No pending request found for ${user.username}` });
//     }
//     return res.status(200).send({ message: "Friend request rejected" });
//   } catch (error) {
//     res.status(500).send({
//       message: "Error rejecting friend request",
//       error: error.message,
//     });
//   }
// });

//strategy is to receive the Friend req id and current user id,it would be easier this way

routers.post("/rejectrequest", async (req, res) => {
  const { userId, friendRequestId } = req.body;

  try {
    // Find the friend request in the Friends collection
    const friendRequest = await friends.findById(friendRequestId);

    if (!friendRequest || friendRequest.requestStatus !== "pending") {
      return res.status(400).send({
        message: "Friend request not found or already processed.",
      });
    }

    // Update the friend request status to 'rejected'
    friendRequest.requestStatus = "rejected";
    await friendRequest.save();

    return res.status(200).send({
      message: "Friend request rejected successfully",
      data: friendRequest,
    });
  } catch (error) {
    return res.status(500).send({
      message: "An error occurred while rejecting the friend request.",
      error: error.message,
    });
  }
});

module.exports = routers;
