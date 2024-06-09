const express = require('express');
const router = express.Router();
const dotenv = require("dotenv");
const user = require('../models/user');
const {sendConfirmationEmail} = require('../service/authService');
const crypto = require('crypto');
const bycrpt = require("bcrypt");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const session = require('express-session');
dotenv.config();    
router.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true
  }));
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
        // if (!/^[a-zA-Z0-9]+@[a-zA-Z]+\.[a-zA-Z]+$/.test(email)) {
        //     res.status(400).send({ message: "Invalid email" });
        //     return;
        // }
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
            req.session.user = user;
            res.status(200).json({ message: 'Login successful', token: token });

        }catch(err){
            res.status(500).json({ message: 'Error finding user' });
        }

            
        
    });

router.post('/logout', (req, res) => {

    const getUser = req.params;
    console.log(getUser);
    try {
        if (!getUser) {
            res.status(401).json({ message: 'Unauthorized Access' });
            return;
        }
        req.session.destroy();
        res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
        res.status(500).json({ message: 'Error logging out' });
    }
}); //We will focus on this route in the next task

router.post('/request-password-reset', async (req, res) => {
    const {email} = req.body;
    try {
        // Check if the email is valid
        // if (!/^[a-zA-Z0-9]+@[a-zA-Z]+\.[a-zA-Z]+$/.test(email)) {
        //     res.status(400).send({ message: "Invalid email" });
        //     return;
        // }
        // Find the user with the given email
        const prevUser = await user.findOne({ email: email });
        //console.log(prevUser.email);
        if (!prevUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const token = crypto.randomBytes(20).toString('hex');
        prevUser.resetToken = token;
        prevUser.resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour
        await prevUser.save();
        //console.log(token);

        sendConfirmationEmail(email, token);
        

        res.status(200).json({ message: 'Confirmation email sent' });

    } catch (err) {
        res.status(500).json({ message: 'Error resetting password' });
    }
});

router.post('/confirm-password-reset', async (req, res) => {
    const {email, token, newPassword, confirmPassword} = req.body;
    try{
        // Check if the email is valid
        // if (!/^[a-zA-Z0-9]+@[a-zA-Z]+\.[a-zA-Z]+$/.test(email)) {
        //     res.status(400).send({ message: "Invalid email" });
        //     return;
        // }

        // Find the user with the given email
        const prevUser = await user.findOne({ email: email});

        if (!prevUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        console.log("user.resetToken", prevUser.resetToken);
        if (!prevUser.resetToken || prevUser.resetToken !== token ){
            return res.status(400).json({ message: 'Invalid or expired token' });
          }

        if (newPassword !== confirmPassword) {
            res.status(400).json({ message: 'Passwords do not match' });
            return;
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        prevUser.password = hashedPassword;
        prevUser.resetToken = undefined;
        //prevUser.resetPasswordExpires = undefined;
        await prevUser.save();

        res.status(200).json({ message: 'Password reset successful' });

    }catch(err){
        res.status(500).json({ message: 'Error resetting password' });
    }
});
router.post('/change-password/:_id', async (req, res) => {
    // Implement change password logic here
    const {_id} = req.params;
    const {password, newPassword, confirmPassword} = req.body;
    try {
        const prevUser = await user.findOne({ _id: _id});
        if (!prevUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const isMatch = await bcrypt.compareSync(password, prevUser.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid password' });
            return;
        }

        if (newPassword !== confirmPassword) {
            res.status(400).json({ message: 'Passwords do not match' });
            return;
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        prevUser.password = hashedPassword; 
        await prevUser.save();

        res.status(200).json({ message: 'Password change successful' });
    } catch (err) {
        res.status(500).json({ message: 'Error changing password' });
    }
});


module.exports = router;