const pool = require('./db');

async function updateSchema() {
  try {
    console.log('Updating database schema...');
    
    // Add invoice_data column to invoices table
    const addInvoiceColumnQuery = `
      ALTER TABLE invoices 
      ADD COLUMN IF NOT EXISTS invoice_data JSONB;
    `;
    
    await pool.query(addInvoiceColumnQuery);
    console.log('invoice_data column added successfully!');
    
    // Create products table
    const createProductsTableQuery = `
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        product_id VARCHAR(255) UNIQUE NOT NULL,
        product_data JSONB,
        last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await pool.query(createProductsTableQuery);
    console.log('products table created successfully!');
    
    // Create index on product_id
    const createProductIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_product_id ON products(product_id);
    `;
    
    await pool.query(createProductIndexQuery);
    console.log('Index on product_id created successfully!');
    
    console.log('Schema update complete!');
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    await pool.end();
  }
}

updateSchema();
