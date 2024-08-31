import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
const cors = require('cors');

const app = express();

// Configure CORS options for the Express server
const corsOptions = {
  origin: 'https://chatx-frontend-c20k.onrender.com', // Allow requests only from your frontend URL
  methods: ['GET', 'POST'], // Specify allowed methods
  credentials: true, // Enable this if you are dealing with cookies or credentials
};

// Use CORS middleware with specified options
app.use(cors(corsOptions));

// Set up the HTTP server
const server = http.createServer(app);

// Configure Socket.IO server with CORS
const io = new Server(server, {
  cors: {
    origin: ['https://chatx-frontend-c20k.onrender.com'], // Allow requests from your frontend URL
    methods: ['GET', 'POST'], // Specify allowed methods
  },
});

const userSocketmap = {}; // { userId: socketId }

export const getReceiverSocketId = (receiverId) => {
  return userSocketmap[receiverId];
};

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;

  // If the userId is not "undefined", map the userId to the socket ID
  if (userId !== 'undefined') userSocketmap[userId] = socket.id;

  // Emit the list of online users
  io.emit('getOnlineUsers', Object.keys(userSocketmap));

  // Handle user disconnection
  socket.on('disconnect', () => {
    delete userSocketmap[userId];
    io.emit('getOnlineUsers', Object.keys(userSocketmap));
  });
});

export { server, app, io };
