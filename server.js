const express = require("express"); // Express framework for building web applications
const dotenv = require("dotenv"); // Dotenv module for loading environment variables from a.env file
const mongoose = require("mongoose"); // Mongoose module for interacting with MongoDB
const app = express(); // Initialize an Express application
// Initialize an Express router
const router = express.Router();
// Import the user router
const userRouter = require("./controllers/user");
// Import the authentication router
const authRouter = require("./controllers/auth");
const session = require('express-session');

//Where Socket.io is being used
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io'); // Import the Server object from socket.io
//const io = new Server(server);

// const fs = require('fs');
// const path = require('path');
// const multer = require('multer');
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//       cb(null, 'uploads')
//   },
//   filename: (req, file, cb) => {
//       cb(null, file.fieldname + '-' + Date.now())
//   }
// });
// const upload = multer({ storage: storage});



dotenv.config();


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

// My html file
router.get('/', async (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// My socket.io connection
const io = new Server(server); // Create a new instance of the Server object

io.on('connection', (socket) => { // Add a socket connection event handler
  //console.log('New client connected');
  io.emit('chat message', 'User Connected!');

  socket.on('disconnect', () => {
      //console.log('Client disconnected');
      io.emit('chat message', 'User Disconnected!');
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
    //console.log('message: ' + msg);
  });

});

const port = process.env.PORT;

server.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
