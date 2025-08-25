// config/db.js
const sql = require('mssql');
const config = require('./config');

const connectDB = async () => {
  try {
    await sql.connect(config.db);
    console.log('Connected to SQL Server');
  } catch (err) {
    console.error('Error connecting to SQL Server', err);
  }
};

module.exports = connectDB;
