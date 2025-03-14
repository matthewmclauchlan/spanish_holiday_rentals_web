/* eslint-disable @typescript-eslint/no-require-imports */
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { connectDB } = require('./db');

const app = express();
app.use(cors());
app.use(express.json()); // For parsing JSON bodies

// Create HTTP server and set up Socket.IO with CORS options
const server = http.createServer(app);
const io = new socketIo.Server(server, {
  cors: {
    origin: '*', // Adjust for production
    methods: ['GET', 'POST'],
  },
});

// Connect to MongoDB Atlas and store the database instance
let db;
connectDB()
  .then((database) => {
    db = database;
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Chat Backend is running!');
});

/* -------------------------------------------
   SUPPORT CONVERSATION API ENDPOINT
------------------------------------------- */
app.post('/createSupportConversation', async (req, res) => {
  const { bookingId, userId } = req.body;
  if (!bookingId || !userId) {
    return res.status(400).json({ error: 'bookingId and userId are required' });
  }

  try {
    const conversationsCollection = db.collection('conversations');
    // Create a unique conversation ID for support (e.g. "bookingId-userId-support")
    const conversationId = `${bookingId}-${userId}-support`;

    // Check if the conversation already exists
    let conversation = await conversationsCollection.findOne({ _id: conversationId });
    if (!conversation) {
      conversation = {
        _id: conversationId,
        participants: [userId, 'support'], // 'support' represents the support agent/channel
        messages: [],
        conversationType: 'support',  // Explicitly mark this as a support conversation
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await conversationsCollection.insertOne(conversation);
    }
    res.json({ conversationId });
  } catch (error) {
    console.error('Error creating support conversation:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/* -------------------------------------------
   HOST CONVERSATIONS API ENDPOINT
------------------------------------------- */
app.get('/api/hostConversations', async (req, res) => {
  const { hostId } = req.query;
  if (!hostId || typeof hostId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid hostId query parameter' });
  }

  try {
    const conversationsCollection = db.collection('conversations');
    // Find all conversations where the participants array includes the hostId.
    const conversations = await conversationsCollection.find({
      participants: hostId
    }).toArray();
    res.json({ conversations });
  } catch (error) {
    console.error('Error fetching host conversations:', error);
    res.status(500).json({ error: error.message });
  }
});

/* -------------------------------------------
   SOCKET.IO HANDLERS
------------------------------------------- */
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // When a client joins a conversation room
  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
  });

  // When a message is sent, save it to the conversation and emit to the room
  socket.on('sendMessage', async (data) => {
    const { conversationId, senderId, content } = data;
    // Create the message with a default read flag set to false.
    const message = {
      senderId,
      content,
      timestamp: new Date().toISOString(),
      read: false
    };

    try {
      const conversationsCollection = db.collection('conversations');
      let conversation = await conversationsCollection.findOne({ _id: conversationId });
      if (!conversation) {
        // If conversation doesn't exist, create it (this should rarely happen if using the API endpoint)
        conversation = {
          _id: conversationId,
          participants: [senderId, 'support'],
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await conversationsCollection.insertOne(conversation);
      }
      // Push the new message into the conversation
      await conversationsCollection.updateOne(
        { _id: conversationId },
        { $push: { messages: message }, $set: { updatedAt: new Date().toISOString() } }
      );
      // Emit the new message to all clients in the conversation room
      io.to(conversationId).emit('receiveMessage', message);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  // When a message is marked as read, update the conversation in the database
  socket.on('markAsRead', async (data) => {
    const { conversationId, messageTimestamp } = data;
    try {
      const conversationsCollection = db.collection('conversations');
      const updateResult = await conversationsCollection.updateOne(
        { _id: conversationId, "messages.timestamp": messageTimestamp },
        { $set: { "messages.$.read": true, updatedAt: new Date().toISOString() } }
      );
      console.log('Read update result:', updateResult);
      io.to(conversationId).emit('messageRead', { messageTimestamp });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start the server on port 4000
server.listen(4000, () => {
  console.log('Socket.IO server running on port 4000');
});
