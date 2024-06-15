const res = require("express/lib/response");
const friends = require("../models/friendsModel");


const getRequestBasedOnStatus = async (req, status) => {
    try{
    
    const getRequests = await friends.find({
        
        $and: [{
            
            $and: [
                    {friendId: req.body ["friendId"]},
                    {userId : req.body["userId"]},
                ] 
                },
                {
                    requestStatus: { $eq: status }
                
                }
             ]
    });

    const isFound = getRequests.length !== 0;
    return {isFound: isFound, docsCount: getRequests.length};

        
    
    
    }catch(error){
        res.status(500).send({message: "Error getting friend requests"});}
};

const limitRequests = async (req, status, maxCount) => {
    //check the status of the request first of all

    const getStatus = await getRequestBasedOnStatus(req, status); //get the status of the request
    if (getStatus.isFound){
        return res.status(400).send({message: `You already have a ${status} request for this user`});
    } else if (getStatus.docsCount >= maxCount){
        return res.status(400).send({message: `You have reached the limit of ${maxCount} requests`});
    }
};

module.exports = {
    getRequestBasedOnStatus, 
    limitRequests
  };