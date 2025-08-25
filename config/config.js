// // config/config.js
const dotenv = require('dotenv');

dotenv.config();
//console.log('DB_SERVER:', process.env.DB_SERVER); 

const config = {
  db: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
      encrypt: true, 
      trustServerCertificate: true, 
      enableArithAbort: true,
      requestTimeout: 60000 
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000 
    }
  },
  port: process.env.PORT || 4000
};

module.exports = config;
