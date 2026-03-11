require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/database');
const chatHandler = require('./socket/chatHandler');
const { startDataRetentionScheduler } = require('./services/dataRetentionScheduler');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with environment-aware CORS
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? process.env.CLIENT_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Connect to database
connectDB();

// Initialize WebSocket chat handler
chatHandler(io);

// Make io available globally for controllers
global.io = io;

// Start data retention scheduler (runs daily at 2 AM)
if (process.env.NODE_ENV === 'production') {
  startDataRetentionScheduler();
} else {
  console.log('💡 Data retention scheduler disabled in development mode');
  console.log('   Set NODE_ENV=production to enable automatic cleanup');
}

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
