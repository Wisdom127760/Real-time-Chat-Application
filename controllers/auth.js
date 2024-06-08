const express = require('express');
const router = express.Router();
const user = require('../models/user');
const crypto = require('crypto');
const bycrpt = require("bcrypt");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// Define your routes here
router.post('/signup', async (req, res) => {
    const { firstname, lastname, email, username, password } = req.body;
    try {
        if (!firstname || !lastname || !email || !username || !password) {
            res.status(400).send({ message: "All fields are required" });
            return;
        }
        if (password.length < 6) {
            res.status(400).send({ message: "Password must be at least 6 characters" });
            return;
        }
        if (!/^[a-zA-Z]+$/.test(firstname) || !/^[a-zA-Z]+$/.test(lastname)) {
            res.status(400).send({ message: "First name and last name must be alphabets only" });
            return;
        }
        if (!/^[a-zA-Z0-9]+$/.test(username)) {
            res.status(400).send({ message: "Username must be alphanumeric" });
            return;
        }
        if (!/^[a-zA-Z0-9]+@[a-zA-Z]+\.[a-zA-Z]+$/.test(email)) {
            res.status(400).send({ message: "Invalid email" });
            return;
        }
        if (!/^[a-zA-Z0-9]+$/.test(password)) {
            res.status(400).send({ message: "Password must be alphanumeric" });
            return;
        }
    } catch (error) {
        res.status(500).send({ message: "Error validating user" });
        return;
    }
    try {
        const prevUser = await user.findOne({ email: email });

        if (prevUser) {
            res.status(400).send({ message: "User already exists" });
            return;
        }

        const hashedPassword = await bycrpt.hash(password, 10);

        const newUser = new user({ firstname, lastname, email, username, password: hashedPassword });
        newUser.save()
        res.status(200).json({ message: 'User created successfully' });
    } catch (err) {
        res.status(500).send({ message: "Error creating user" });
        return;
    }
});
router.post('/login', async (req, res) => {
        const { username, password } = req.body;
        try{
            const prevUser = await user.findOne({username: username});
            //console.log(prevUser);
            if (!prevUser) {
                res.status(404).json({ message: 'Username or Password not found' });
                return;
            }

            const isMatch = await bcrypt.compareSync(password, prevUser.password);
            //console.log(isMatch);
            if (!isMatch) {
                res.status(401).json({ message: 'Invalid password' });
                return;
            }
            //console.log(prevUser._id);

            const token = jwt.sign({ _id: prevUser._id }, process.env.SECRET_KEY, { expiresIn: '1h' });
            //console.log(token);
            res.status(200).json({ message: 'Login successful', token: token });

        }catch(err){
            res.status(500).json({ message: 'Error finding user' });
        }

            
        
    });


router.post('/logout', (req, res) => {
    try {
        if (!req.session.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        req.session.destroy();
        res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
        res.status(500).json({ message: 'Error logging out' });
    }
});

router.post('/reset-password', async (req, res) => {
    const { email } = req.body;
    try {
        // Check if the email is valid
        if (!/^[a-zA-Z0-9]+@[a-zA-Z]+\.[a-zA-Z]+$/.test(email)) {
            res.status(400).send({ message: "Invalid email" });
            return;
        }
        // Find the user with the given email
        const prevUser = await user.findOne({ email: email });
        if (!prevUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Generate a new password
        const newPassword = generateNewPassword();
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        // Update the user's password
        prevUser.password = hashedPassword;
        await prevUser.save();
        // Send the new password to the user's email
        sendNewPasswordEmail(email, newPassword);
        res.status(200).json({ message: 'Password reset successful' });
    } catch (err) {
        res.status(500).json({ message: 'Error resetting password' });
    }
});

router.post('/change-password', (req, res) => {
    // Implement change password logic here
    res.status(200).json({ message: 'Password change successful' });
});

module.exports = router;

router.post('/reset-password', (req, res) => {
    // Implement reset password logic here
    res.status(200).json({ message: 'Password reset successful' });
});

router.post('/change-password', (req, res) => {
    // Implement change password logic here
    res.status(200).json({ message: 'Password change successful' });
});

module.exports = router;