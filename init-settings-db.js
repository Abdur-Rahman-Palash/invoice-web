const pool = require('./db');

async function initSettingsTable() {
  try {
    // Create settings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Settings table created successfully');

    // Insert default owner email if not exists
    await pool.query(`
      INSERT INTO settings (key, value) 
      VALUES ('ownerEmail', 'abdurrahmanpalashbd@gmail.com')
      ON CONFLICT (key) DO NOTHING
    `);

    console.log('Default owner email inserted');

    process.exit(0);
  } catch (error) {
    console.error('Error initializing settings table:', error);
    process.exit(1);
  }
}

initSettingsTable();
