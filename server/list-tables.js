const { PrismaClient } = require('@prisma/client');

async function listTables() {
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

  try {
    console.log('Connecting to the database...');
    await prisma.$connect();
    console.log('Connected to the database successfully!');
    
    // List all tables using raw query
    const tables = await prisma.$queryRaw`SHOW TABLES`;
    console.log('Database tables:', JSON.stringify(tables, null, 2));
    
    // If we have tables, show some sample data
    if (tables && tables.length > 0) {
      console.log('\nSample data from tables:');
      
      // Try to get a count from each table
      for (const table of tables) {
        const tableName = Object.values(table)[0];
        try {
          const count = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM \`${tableName}\``);
          console.log(`Table ${tableName}: ${count[0].count} rows`);
          
          // Show first row if table is not empty
          if (count[0].count > 0) {
            const firstRow = await prisma.$queryRawUnsafe(`SELECT * FROM \`${tableName}\` LIMIT 1`);
            console.log(`First row in ${tableName}:`, JSON.stringify(firstRow[0], null, 2));
          }
        } catch (err) {
          console.error(`Error querying table ${tableName}:`, err.message);
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Disconnected from database');
  }
}

listTables();
