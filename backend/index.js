import express from 'express';
import dotenv from 'dotenv';
import dbConnect from './DB/dbConnect.js';
import authRouter from './rout/authUser.js';
import messageRouter from './rout/messageRout.js';
import userRouter from './rout/userRout.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import { app, server } from './Socket/socket.js';

// Load environment variables
dotenv.config();

// Set the directory name correctly
const __dirname = path.resolve();

// Middleware setup
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/message', messageRouter);
app.use('/api/user', userRouter);

// Serve static files from the frontend build directory
app.use(express.static(path.join(__dirname, 'frontend', 'dist')));

// Catch-all route to serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'), (err) => {
    if (err) {
      res.status(500).send(err); // Handle errors gracefully
    }
  });
});

// Port configuration
const PORT = process.env.PORT || 3000;

// Start the server
server.listen(PORT, async () => {
  try {
    await dbConnect(); // Ensure the database connection is established
    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
});
