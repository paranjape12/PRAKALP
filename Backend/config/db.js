require('dotenv').config();
const mysql = require('mysql2');

// Create a connection pool with configuration options
const db = mysql.createPool({
  host: process.env.DB_HOST,        
  user: process.env.DB_USER,        
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME,     
  waitForConnections: true,          // Wait for connections if none are available
  connectionLimit: 10,               // Maximum number of connections in the pool
  queueLimit: 0,                     // No limit for queued connection requests
  connectTimeout: 10000,             // Timeout for initial connection attempt (10 seconds)
  enableKeepAlive: true,             // Enable TCP keep-alive to prevent idle disconnection
});


db.getConnection((err, connection) => {
  if (err) {
    switch (err.code) {
      case 'PROTOCOL_CONNECTION_LOST':
        console.error('Database connection was closed.');
        break;
      case 'ER_CON_COUNT_ERROR':
        console.error('Too many connections to the database.');
        break;
      case 'ECONNREFUSED':
        console.error('Database connection was refused.');
        break;
      default:
        console.error('Unexpected MySQL error:', err);
    }
  } else {
    console.log('Successfully connected to MySQL database');
    connection.release(); // Release the connection back to the pool
  }
});

module.exports = db;

