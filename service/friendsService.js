const friends = require("../models/friends");


const getRequestBasedOnStatus = async (req, status) => {
    try {
        const getRequests = await friends.find({
            $and: [
                { friendId: req.body["friendId"] },
                { userId: req.body["userId"] },
                { requestStatus: { $eq: status } }
            ]
        });

        const isFound = getRequests.length !== 0;
        return { isFound: isFound, docsCount: getRequests.length };
    } catch (error) {
        throw new Error("Error getting friend requests");
    }
};

const limitRequests = async (req, res, status, maxCount) => {
    try {
        const getStatus = await getRequestBasedOnStatus(req, status);
        if (getStatus.isFound) {
            return res
                .status(400)
                .send({ message: `You already have a ${status} request for this user` });
        } else if (getStatus.docsCount >= maxCount) {
            return res
                .status(400)
                .send({ message: `You have reached the limit of ${maxCount} requests` });
        } else {
            // Proceed with the request
            // ...
        }
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

module.exports = {
    getRequestBasedOnStatus,
    limitRequests
};
