require('./config/database');

// Add database connection logging
const mongoose = require('mongoose');
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected successfully');
});
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});
mongoose.connection.on('disconnected', () => {
  console.log('🔌 MongoDB disconnected');
});
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allowed origins
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'https://localhost:3000',
      'http://localhost:3001',
      'https://gp1habitstrackerbackend.vercel.app',
      'https://gp1habitstrackerbackend-htyl9geu5-ess-projects-ecec6cc8.vercel.app'
    ].filter(Boolean);
    
    if (process.env.NODE_ENV === 'development') {
      // In development, allow all origins
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// API root route
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Habits Tracker API',
    version: '1.0.0',
    endpoints: {
      users: '/users',
      habits: '/habits',
      login: '/users/login',
      register: '/users/register'
    }
  });
});

// Root route for health check
app.get('/', (req, res) => {
  try {
    console.log('🏥 Health check requested');
    console.log('📊 DB connection state:', mongoose.connection.readyState);
    
    const response = { 
      message: 'Habits Tracker Backend API',
      status: 'running',
      timestamp: new Date().toISOString(),
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    };
    
    console.log('✅ Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('❌ Error in root route:', error);
    res.status(500).json({ 
      error: error.message,
      status: 'error'
    });
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.locals.title = 'Error';

  // render the error page
  res.status(err.status || 500);
  
  // For API routes, return JSON
  if (req.path.startsWith('/api/') || req.path.startsWith('/users') || req.path.startsWith('/habits')) {
    res.json({ 
      error: err.message || 'Internal Server Error',
      status: err.status || 500
    });
  } else {
    // For other routes, try to render error page
    try {
      res.render('error');
    } catch (renderError) {
      // If rendering fails, return JSON
      res.json({ 
        error: err.message || 'Internal Server Error',
        status: err.status || 500
      });
    }
  }
});

module.exports = app;
