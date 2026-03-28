require('./config/database');
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
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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
  res.json({ 
    message: 'Habits Tracker Backend API',
    status: 'running',
    timestamp: new Date().toISOString()
  });
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
