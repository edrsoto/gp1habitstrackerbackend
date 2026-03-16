const mongoose = require('mongoose');
require('dotenv').config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Database connect');
  })
  .catch((err) => {
    console.log('Error connecting to database');
    console.log(err);
  });

module.exports = mongoose;