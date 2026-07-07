const pool = require('./db');

/**
 * Save or update invoice in database
 * @param {string} invoiceId - The invoice ID to save
 * @returns {Promise<Object>} The saved invoice record
 */
async function saveInvoice(invoiceId) {
  try {
    const query = `
      INSERT INTO invoices (invoice_id, last_modified)
      VALUES ($1, CURRENT_TIMESTAMP)
      ON CONFLICT (invoice_id) 
      DO UPDATE SET last_modified = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    
    const result = await pool.query(query, [invoiceId]);
    console.log('Invoice saved successfully:', result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error('Error saving invoice:', error);
    throw error;
  }
}

/**
 * Get invoice by ID
 * @param {string} invoiceId - The invoice ID to retrieve
 * @returns {Promise<Object|null>} The invoice record or null if not found
 */
async function getInvoice(invoiceId) {
  try {
    const query = 'SELECT * FROM invoices WHERE invoice_id = $1';
    const result = await pool.query(query, [invoiceId]);
    
    if (result.rows.length === 0) {
      console.log('Invoice not found:', invoiceId);
      return null;
    }
    
    console.log('Invoice retrieved:', result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error('Error getting invoice:', error);
    throw error;
  }
}

/**
 * Get all invoices
 * @returns {Promise<Array>} Array of all invoice records
 */
async function getAllInvoices() {
  try {
    const query = 'SELECT * FROM invoices ORDER BY last_modified DESC';
    const result = await pool.query(query);
    console.log('All invoices retrieved:', result.rows.length);
    return result.rows;
  } catch (error) {
    console.error('Error getting all invoices:', error);
    throw error;
  }
}

/**
 * Delete invoice by ID
 * @param {string} invoiceId - The invoice ID to delete
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
async function deleteInvoice(invoiceId) {
  try {
    const query = 'DELETE FROM invoices WHERE invoice_id = $1 RETURNING *';
    const result = await pool.query(query, [invoiceId]);
    
    if (result.rows.length === 0) {
      console.log('Invoice not found for deletion:', invoiceId);
      return false;
    }
    
    console.log('Invoice deleted:', invoiceId);
    return true;
  } catch (error) {
    console.error('Error deleting invoice:', error);
    throw error;
  }
}

module.exports = {
  saveInvoice,
  getInvoice,
  getAllInvoices,
  deleteInvoice
};
