const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const config = require('./config/env');
const registerSocketHandlers = require('./sockets/socket');

async function start() {
  await connectDB();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: config.clientUrl,
      credentials: true,
    },
  });

  registerSocketHandlers(io);

  server.listen(config.port, () => {
    console.log(`Server listening on port ${config.port}`);
  });
}

start();
