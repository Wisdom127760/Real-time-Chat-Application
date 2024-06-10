const express = require('express');
const router = express.Router();
const users = require('../models/user');
const userprofile = require('../models/userprofile');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
const upload = multer({ storage: storage});


// Define your routes here
router.get('/', async (req, res) => {
    const allPrevUser = await users.find();
    res.status(200).json(allPrevUser);
});

router.get('/:_id', async (req, res)=>{
    const {_id}  = req.params;
    try{
        const user = await users.findById(_id);
        res.status(200).send({message: 'User found', data: user});

    }catch(error){
        res.status(400).send({message: "Invalid user id"});
    }
});

router.post('/userprofile', upload.single('img') , async (req,res)=>{
    const {userId, phone, img, createdAt} = req.body;
    
    const validId = await users.findOne({_id: userId});
    console.log(validId);
    if(!validId){
        res.status(400).send({message: "Invalid user id"});
        return;
    }
    const newProfile = new userprofile({
        userId: validId._id,
        firstname: validId.firstname,
        lastname: validId.lastname,
        email: validId.email,
        username: validId.username,
        password: validId.password,
        phone: req.body.phone,
        img: req.file ? {
            data: fs.readFileSync(path.join(__dirname, '..', 'uploads', req.file.filename)),
            contentType: req.file.mimetype,
        } : null,
        createdAt: req.body.createdAt
    });
    newProfile.save();
    res.status(200).json({message: 'User profile created successfully'});

});

module.exports = router;