const pool = require('./db');

/**
 * Save or update invoice in database with full invoice data
 * @param {Object} invoiceData - The complete invoice data to save
 * @returns {Promise<Object>} The saved invoice record
 */
async function saveInvoice(invoiceData) {
  try {
    const query = `
      INSERT INTO invoices (invoice_id, last_modified, invoice_data)
      VALUES ($1, CURRENT_TIMESTAMP, $2)
      ON CONFLICT (invoice_id) 
      DO UPDATE SET last_modified = CURRENT_TIMESTAMP, invoice_data = $2
      RETURNING *;
    `;
    
    const result = await pool.query(query, [invoiceData.id, JSON.stringify(invoiceData)]);
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
    
    const invoice = result.rows[0];
    // Parse the JSON data
    if (invoice.invoice_data) {
      return JSON.parse(invoice.invoice_data);
    }
    
    console.log('Invoice retrieved:', invoice);
    return invoice;
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
    
    // Parse JSON data for each invoice
    return result.rows.map(row => {
      if (row.invoice_data) {
        return JSON.parse(row.invoice_data);
      }
      return row;
    });
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
