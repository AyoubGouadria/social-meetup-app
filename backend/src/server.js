require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/database');
const chatHandler = require('./socket/chatHandler');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
});

// Connect to database
connectDB();

// Initialize WebSocket chat handler
chatHandler(io);

// Start server
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║                                        ║
║   🚀 Meetly Backend Server Running    ║
║                                        ║
║   📍 Port: ${PORT}                      ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}     ║
║   🔗 API: http://localhost:${PORT}     ║
║                                        ║
╚════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});
