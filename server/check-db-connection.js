const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });
const { parse: parseUrl } = require('url');

async function checkDatabase() {
  console.log('Checking database connection...');
  
  // Parse DATABASE_URL from environment or use defaults
  let config = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'afari_real_estate_v2',
    waitForConnections: true,
    connectionLimit: 1,
    connectTimeout: 10000
  };

  console.log('DATABASE_URL from env:', process.env.DATABASE_URL);
  
  if (process.env.DATABASE_URL) {
    try {
      const url = parseUrl(process.env.DATABASE_URL, true);
      console.log('Parsed URL:', url);
      config = {
        host: url.hostname || 'localhost',
        user: url.auth ? url.auth.split(':')[0] : 'root',
        password: url.auth && url.auth.split(':')[1] ? url.auth.split(':')[1] : '',
        database: url.pathname ? url.pathname.substring(1) : 'afari_real_estate_v2',
        port: url.port ? parseInt(url.port) : 3306,
        waitForConnections: true,
        connectionLimit: 1,
        connectTimeout: 10000
      };
    } catch (err) {
      console.error('Error parsing DATABASE_URL:', err.message);
    }
  } else {
    console.log('DATABASE_URL not found in environment variables');
  }

  console.log('Using database configuration:', {
    ...config,
    password: config.password ? '***' : '(no password)'
  });

  try {
    // Test connection without specifying a database first
    const connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password
    });

    console.log('\n✅ Successfully connected to MySQL server!');
    
    // Check if database exists
    const [rows] = await connection.execute(`SHOW DATABASES LIKE '${config.database}'`);
    const dbExists = rows.length > 0;
    
    console.log(`\nDatabase '${config.database}' exists:`, dbExists ? '✅ Yes' : '❌ No');
    
    if (dbExists) {
      // Switch to the database
      await connection.changeUser({ database: config.database });
      
      // List tables
      const [tables] = await connection.execute('SHOW TABLES');
      console.log(`\nFound ${tables.length} tables in '${config.database}':`);
      
      if (tables.length > 0) {
        const tableNames = tables.map(t => Object.values(t)[0]);
        console.log(tableNames.join(', '));
        
        // Show row counts for each table
        console.log('\nRow counts:');
        for (const table of tableNames) {
          try {
            const [result] = await connection.execute(`SELECT COUNT(*) as count FROM \`${table}\``);
            console.log(`- ${table}: ${result[0].count} rows`);
          } catch (err) {
            console.error(`  Error counting rows in ${table}:`, err.message);
          }
        }
      }
    } else {
      console.log('\nTo create the database, run these SQL commands:');
      console.log(`CREATE DATABASE ${config.database};`);
      console.log(`GRANT ALL PRIVILEGES ON ${config.database}.* TO '${config.user}'@'localhost';`);
      console.log('FLUSH PRIVILEGES;');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('\n❌ Error connecting to MySQL:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\nTroubleshooting:');
      console.log('1. Make sure MySQL server is running');
      console.log('2. Check if MySQL is listening on the correct port (default: 3306)');
      console.log('3. Verify the MySQL service is started (services.msc)');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\nTroubleshooting:');
      console.log('1. Check your database credentials in .env file');
      console.log('2. Verify the MySQL user has proper permissions');
      console.log('3. Try connecting with root user to verify credentials');
    } else if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      console.log('\nTroubleshooting:');
      console.log('1. The connection to the database was lost');
      console.log('2. Check if the MySQL service is running');
      console.log('3. Verify network connectivity to the database');
    } else {
      console.log('\nUnknown error. Please check the error message above for details.');
    }
  }
}

checkDatabase().catch(console.error);
