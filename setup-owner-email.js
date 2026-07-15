const pool = require('./db');

async function updateOwnerEmail(newOwnerEmail) {
  try {
    console.log('Updating owner email to:', newOwnerEmail);
    
    // Update or insert the owner email in settings
    await pool.query(`
      INSERT INTO settings (key, value) 
      VALUES ('ownerEmail', $1)
      ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = CURRENT_TIMESTAMP
    `, [newOwnerEmail]);
    
    console.log('✓ Owner email updated successfully!');
    console.log('New owner email:', newOwnerEmail);
    console.log('');
    console.log('The new owner can now:');
    console.log('1. Login with their email (register if needed)');
    console.log('2. Access Settings with full owner privileges');
    console.log('3. Change company information and other settings');
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating owner email:', error);
    process.exit(1);
  }
}

// Get email from command line argument
const newOwnerEmail = process.argv[2];

if (!newOwnerEmail) {
  console.log('Usage: node setup-owner-email.js <new-owner-email>');
  console.log('Example: node setup-owner-email.js newowner@gmail.com');
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(newOwnerEmail)) {
  console.log('Error: Invalid email format');
  process.exit(1);
}

updateOwnerEmail(newOwnerEmail);
