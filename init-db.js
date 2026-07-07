const pool = require('./db');

async function initDatabase() {
  try {
    console.log('Connecting to database...');
    
    // Create invoices table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        invoice_id VARCHAR(255) UNIQUE NOT NULL,
        last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await pool.query(createTableQuery);
    console.log('Table "invoices" created successfully!');
    
    // Create index on invoice_id for faster lookups
    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_invoice_id ON invoices(invoice_id);
    `;
    
    await pool.query(createIndexQuery);
    console.log('Index on invoice_id created successfully!');
    
    console.log('Database initialization complete!');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await pool.end();
  }
}

initDatabase();
