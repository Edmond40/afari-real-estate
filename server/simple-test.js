const net = require('net');
const mysql = require('mysql2/promise');

async function testConnection() {
  // First, check if we can connect to the MySQL port
  console.log('Testing MySQL server connection...');
  
  const portCheck = new Promise((resolve) => {
    const socket = net.createConnection(3306, 'localhost');
    
    socket.on('connect', () => {
      console.log('Successfully connected to MySQL server on port 3306');
      socket.destroy();
      resolve(true);
    });
    
    socket.on('error', (err) => {
      console.error('Error connecting to MySQL server:', err.message);
      console.log('\nTroubleshooting steps:');
      console.log('1. Make sure MySQL server is running');
      console.log('2. Check if MySQL is listening on port 3306');
      console.log('3. Verify the MySQL service is started (services.msc)');
      resolve(false);
    });
  });
  
  const portAvailable = await portCheck;
  if (!portAvailable) return;
  
  // Now try to connect with credentials
  console.log('\nTesting database credentials...');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'afari_app',
      password: 'Edmond0209732250',
      database: 'mysql', // Connect to system database first
      connectTimeout: 5000
    });
    
    console.log('Successfully connected to MySQL with provided credentials');
    
    // Check if our database exists
    const [dbs] = await connection.query('SHOW DATABASES');
    const dbExists = dbs.some(db => db.Database === 'afari_real_estate_v2');
    console.log(`\nDatabase 'afari_real_estate_v2' exists: ${dbExists ? 'YES' : 'NO'}`);
    
    if (dbExists) {
      // Switch to our database
      await connection.changeUser({ database: 'afari_real_estate_v2' });
      
      // List tables
      const [tables] = await connection.query('SHOW TABLES');
      console.log(`\nFound ${tables.length} tables in afari_real_estate_v2:`);
      console.log(tables.map(t => Object.values(t)[0]).join(', '));
    } else {
      console.log('\nTo create the database, run:');
      console.log('1. mysql -u root -p');
      console.log('2. CREATE DATABASE afari_real_estate_v2;');
      console.log('3. GRANT ALL PRIVILEGES ON afari_real_estate_v2.* TO afari_app@localhost IDENTIFIED BY \'Edmond0209732250\';');
      console.log('4. FLUSH PRIVILEGES;');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('\nError connecting to MySQL:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\nTroubleshooting:');
      console.log('1. Check the username and password in your .env file');
      console.log('2. Verify the MySQL user has proper permissions');
      console.log('3. Try connecting as root to verify credentials');
    }
  }
}

testConnection().catch(console.error);
