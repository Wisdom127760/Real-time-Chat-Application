const express = require('express');
const router = express.Router();
const user = require('../models/user');

// Define your routes here
router.get('/', async (req, res) => {
    const allPrevUser = await user.find();
    res.status(200).json(allPrevUser);
});

module.exports = router;