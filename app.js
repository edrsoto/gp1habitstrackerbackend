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

const { specs, swaggerUi } = require('./config/swagger');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// Complete CORS bypass - allow everything
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'false');
  
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Max-Age', '86400');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.sendStatus(200);
    return;
  }
  next();
});

app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// Swagger Documentation
app.use('/api-docs', (req, res, next) => {
  // Set CORS headers specifically for Swagger UI
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'false');
  
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Max-Age', '86400');
    res.sendStatus(200);
    return;
  }
  next();
}, swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Habits Tracker API Documentation'
}));

// API root route
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Habits Tracker API',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      users: '/users',
      habits: '/habits',
      login: '/users/login',
      register: '/users/register',
      swagger: '/api-docs'
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
