const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const config = require('./config/env');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();

// CORS configuration - allow frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  config.clientUrl,
  /^https:\/\/.*\.vercel\.app$/  // Allow all Vercel deployments
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);

    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') return allowed === origin;
      if (allowed instanceof RegExp) return allowed.test(origin);
      return false;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Chat API Server',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/auth/*',
      users: '/users/*',
      chats: '/chats/*',
      messages: '/messages/*'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/chats', chatRoutes);
app.use('/', messageRoutes);

module.exports = app;
