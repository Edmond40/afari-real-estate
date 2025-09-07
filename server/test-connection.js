const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  const config = {
    host: 'localhost',
    user: 'afari_app',
    password: 'Edmond0209732250',
    database: 'afari_real_estate_v2',
    connectTimeout: 10000,
    waitForConnections: true,
    connectionLimit: 1,
    queueLimit: 0
  };

  console.log('Attempting to connect to MySQL with config:', {
    ...config,
    password: '***' // Don't log the actual password
  });

  try {
    const connection = await mysql.createConnection(config);
    console.log('Successfully connected to MySQL!');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('Test query result:', rows);
    
    // List databases
    const [dbs] = await connection.execute('SHOW DATABASES');
    console.log('Available databases:', dbs.map(db => db.Database));
    
    // Check if our database exists
    const dbExists = dbs.some(db => db.Database === 'afari_real_estate_v2');
    console.log(`Database 'afari_real_estate_v2' exists: ${dbExists}`);
    
    if (dbExists) {
      // List tables in our database
      await connection.changeUser({ database: 'afari_real_estate_v2' });
      const [tables] = await connection.execute('SHOW TABLES');
      console.log('Tables in afari_real_estate_v2:', tables);
    }
    
    await connection.end();
    console.log('Connection closed');
    
  } catch (error) {
    console.error('Error connecting to MySQL:', error);
    
    // Provide troubleshooting steps based on common errors
    if (error.code === 'ECONNREFUSED') {
      console.error('\nTroubleshooting:');
      console.error('1. Make sure MySQL server is running');
      console.error('2. Verify the MySQL port (default is 3306)');
      console.error('3. Check if the user has proper permissions');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\nTroubleshooting:');
      console.error('1. Check the username and password in your .env file');
      console.error('2. Verify the user has proper permissions');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\nTroubleshooting:');
      console.error('1. The database does not exist');
      console.error('2. Create the database: CREATE DATABASE afari_real_estate_v2');
    }
  }
}

testConnection().catch(console.error);
