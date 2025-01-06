const mysql = require('mysql2/promise');
// const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // await mongoose.connect('mongodb+srv://ys97:Alw8vCXYRq0Ao2LM@cluster0.tnyfu.mongodb.net/', {
    const connection = await mysql.createConnection({
      host: 'sql1.njit.edu',
      user: 'tt226',
      password: '490Group7+490',
      database: 'tt226'
    });
    console.log('MySQL connected');
    return connection;
  } catch (err) {
    console.error('Error connecting to MySQL:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;