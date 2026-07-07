const pool = require('./db');

async function updateSchema() {
  try {
    console.log('Updating database schema...');
    
    // Add invoice_data column to invoices table
    const addColumnQuery = `
      ALTER TABLE invoices 
      ADD COLUMN IF NOT EXISTS invoice_data JSONB;
    `;
    
    await pool.query(addColumnQuery);
    console.log('invoice_data column added successfully!');
    
    console.log('Schema update complete!');
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    await pool.end();
  }
}

updateSchema();
