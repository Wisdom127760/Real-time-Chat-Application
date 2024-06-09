const express = require("express"); // Express framework for building web applications
const dotenv = require("dotenv"); // Dotenv module for loading environment variables from a.env file
const mongoose = require("mongoose"); // Mongoose module for interacting with MongoDB
// Initialize an Express router
const router = express.Router();
// Import the user router
const userRouter = require("./controllers/user");
// Import the authentication router
const authRouter = require("./controllers/auth");
const session = require('express-session');

dotenv.config();


const app = express();

app.use(express.json());

// Connect to MongoDB using Mongoose
const url = process.env.MONGODB_URL;
try {
  mongoose.connect(url);
} catch (error) {
  console.error("mongodb connection error: ", error);
}
// Register the router as a middleware for all routes


app.use(router);
// Handle 404 errors for non-existent routes
app.use( "*", (req, res) => {
  res.status(404).json({ error: "this route does not exist" });
});

router.use("/users", userRouter); // Register the user router
router.use("/auth", authRouter); // Register the authentication router

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`App listening at https://localhost:${port}`);
  });