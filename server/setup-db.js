const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  // First, connect without specifying a database
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'afari_app',
    password: 'Edmond0209732250',
    multipleStatements: true
  });

  try {
    console.log('Connected to MySQL server');
    
    // Check if database exists
    const [rows] = await connection.query(
      `SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = 'afari_real_estate_v2'`
    );

    if (rows.length === 0) {
      console.log('Database does not exist. Creating database...');
      await connection.query('CREATE DATABASE afari_real_estate_v2');
      console.log('Database created successfully');
      
      // Now run Prisma migrations
      console.log('Running database migrations...');
      const { execSync } = require('child_process');
      execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
      console.log('Migrations completed successfully');
    } else {
      console.log('Database already exists');
      
      // Check if migrations need to be applied
      console.log('Checking for pending migrations...');
      const { execSync } = require('child_process');
      execSync('npx prisma migrate status', { stdio: 'inherit' });
    }
    
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await connection.end();
    process.exit(0);
  }
}

setupDatabase().catch(console.error);
