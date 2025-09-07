const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'afari_app',
  password: 'Edmond0209732250'
});

// Check connection
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  
  console.log('Connected to MySQL server');
  
  // Check if database exists
  connection.query("SHOW DATABASES LIKE 'afari_real_estate_v2'", (err, results) => {
    if (err) {
      console.error('Error checking database:', err);
      connection.end();
      return;
    }
    
    if (results.length === 0) {
      console.log('Database does not exist. Creating database...');
      connection.query('CREATE DATABASE afari_real_estate_v2', (err) => {
        if (err) {
          console.error('Error creating database:', err);
        } else {
          console.log('Database created successfully');
        }
        connection.end();
      });
    } else {
      console.log('Database exists');
      connection.end();
    }
  });
});
