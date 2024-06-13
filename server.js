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
const requestRouter = require("./controllers/request");
// Import the chat router
//const chatRouter = require("./controllers/chat");

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
//router.use("/friends", friendsRouter); // Register the friends router 
router.use("/request", requestRouter); // Register the request router
//router.use("/chat", chatRouter); // Register the chat router


// My html file
router.get('/', async (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// My socket.io connection
const io = new Server(server); // Create a new instance of the Server object

io.on('connection', (socket) => { // Add a socket connection event handler
  io.emit('chat message', 'User Connected!');

  socket.on('disconnect', () => {
    io.emit('chat message', 'User Disconnected!');
  });

  socket.on('chat message', (user, msg, messageId) => {
    //io.emit('chat message', msg);
    io.emit('chat message', user, msg, messageId);
  });

  socket.on('seen', (msg) => {
    socket.broadcast.emit('seen', msg);
  });

  socket.on('delivered', (msg) => {
    socket.broadcast.emit('delivered', msg);
  });
});

const port = process.env.PORT;

server.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
