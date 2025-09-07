const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'afari_app',
    password: 'Edmond0209732250',
    database: 'afari_real_estate_v2',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    console.log('Connecting to MySQL...');
    await connection.connect();
    console.log('Connected to MySQL successfully!');
    
    // List all tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Database tables:', tables);
    
    // Check agents table
    const [agents] = await connection.query('SELECT COUNT(*) as count FROM Agent');
    console.log(`Found ${agents[0].count} agents`);
    
    // Check listings table
    const [listings] = await connection.query('SELECT COUNT(*) as count FROM Listing');
    console.log(`Found ${listings[0].count} listings`);
    
  } catch (error) {
    console.error('Error connecting to MySQL:', error);
  } finally {
    await connection.end();
  }
}

testConnection().catch(console.error);
