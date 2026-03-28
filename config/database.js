const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

console.log('🔌 Connecting to MongoDB with URI:', mongoUri ? 'URI provided' : 'No URI found');

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('Database connect');
  })
  .catch((err) => {
    console.log('Error connecting to database');
    console.log(err);
  });

module.exports = mongoose;