const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const errorHandler = require('./middleware/errorHandler');
const { httpsRedirect, hstsMiddleware } = require('./middleware/httpsEnforcement');

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const joinRequestRoutes = require('./routes/joinRequests');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications');
const userRoutes = require('./routes/users');
const uploadRoutes = require('./routes/upload');
const testimonialRoutes = require('./routes/testimonials');
const moderationRoutes = require('./routes/moderation');

const app = express();

// CRITICAL: HTTPS enforcement in production (German legal requirement)
app.use(httpsRedirect);
app.use(hstsMiddleware);

// Rate Limiting Configuration
// More lenient limits for development, stricter for production
const isDevelopment = process.env.NODE_ENV !== 'production';

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 100, // Development: 1000 requests, Production: 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later'
    });
  }
});

// Strict limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 50 : 5, // Development: 50 attempts, Production: 5 attempts per windowMs
  skipSuccessfulRequests: true, // Don't count successful requests
  message: 'Too many login attempts, please try again after 15 minutes',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again after 15 minutes'
    });
  }
});

// Middleware
// CORS Configuration - Development and Production
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? process.env.CLIENT_URL.split(',').map(url => url.trim()) // Production: from env variable (comma-separated)
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000']; // Development: localhost

// Enhanced Helmet configuration with comprehensive security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
      connectSrc: ["'self'", ...allowedOrigins], // Allow frontend origins for API calls
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: true, // Prevents loading cross-origin resources
  crossOriginOpenerPolicy: { policy: 'same-origin' }, // Isolates browsing context
  crossOriginResourcePolicy: { policy: 'same-origin' }, // Prevents cross-origin resource loading
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }, // Control referrer info
  xssFilter: true, // Enable XSS filter
  noSniff: true, // Prevent MIME type sniffing
  frameguard: { action: 'deny' }, // Prevent clickjacking
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  permissionsPolicy: {
    camera: ['()'], // Disable camera
    microphone: ['()'], // Disable microphone
    geolocation: ['()'], // Disable geolocation
    payment: ['()'], // Disable payment APIs
  }
}));

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `CORS policy: Origin ${origin} is not allowed`;
      console.warn(`⚠️  CORS blocked: ${origin}`);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // Allow cookies and authentication headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'], // CRITICAL: Allow CSRF token header
  exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
  maxAge: 86400 // 24 hours - cache preflight requests
}));
app.use(compression()); // Compress responses
app.use(cookieParser()); // Parse cookies
app.use(express.json({ limit: '10mb' })); // Parse JSON with size limit
app.use(express.urlencoded({ extended: true, limit: '10mb', parameterLimit: 1000 })); // Parse URL-encoded

// NoSQL Injection Protection
app.use(mongoSanitize({
  replaceWith: '_', // Replace prohibited characters with underscore
  onSanitize: ({ req, key }) => {
    console.warn(`⚠️  NoSQL injection attempt detected from ${req.ip} - Sanitized key: ${key}`);
  },
}));

// XSS Protection - Sanitize user input in req.body, req.query, req.params
app.use(xss());

// HTTP Parameter Pollution Protection
app.use(hpp({
  whitelist: ['languages', 'interests', 'lookingFor', 'participants', 'tags'] // Allow arrays for these params
}));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// CRITICAL: CSRF Protection (prevents cross-site request forgery attacks)
const csrfProtection = csrf({ cookie: true });

// CSRF token endpoint - frontend must call this to get token
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ 
    success: true, 
    csrfToken: req.csrfToken() 
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
// Apply rate limiting to all API routes
app.use('/api/', globalLimiter);

// Apply strict rate limiting to auth routes
app.use('/api/auth', authLimiter, authRoutes);

// CRITICAL: Apply CSRF protection to all state-changing routes
// GET requests (read-only) don't need CSRF protection
app.use('/api/events', csrfProtection, eventRoutes);
app.use('/api/join-requests', csrfProtection, joinRequestRoutes);
app.use('/api/messages', csrfProtection, messageRoutes);
app.use('/api/notifications', csrfProtection, notificationRoutes);
app.use('/api/users', csrfProtection, userRoutes);
app.use('/api/upload', csrfProtection, uploadRoutes);
app.use('/api/testimonials', csrfProtection, testimonialRoutes);
app.use('/api/moderation', csrfProtection, moderationRoutes); // Blocking & Reporting

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
