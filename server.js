const express = require('express');
const cors = require('cors');
const { saveInvoice, getInvoice, getAllInvoices, deleteInvoice } = require('./invoice-db');
const { saveProduct, saveProducts, getAllProducts, deleteProduct } = require('./product-db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Save invoice
app.post('/api/invoices', async (req, res) => {
  try {
    const invoiceData = req.body;
    const result = await saveInvoice(invoiceData);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error saving invoice:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all invoices
app.get('/api/invoices', async (req, res) => {
  try {
    const invoices = await getAllInvoices();
    res.json({ success: true, data: invoices });
  } catch (error) {
    console.error('Error getting invoices:', error);
    res.status(500).json({ success: false, error: error.message, details: error.stack });
  }
});

// Get single invoice
app.get('/api/invoices/:id', async (req, res) => {
  try {
    const invoice = await getInvoice(req.params.id);
    if (!invoice) {
      res.status(404).json({ success: false, error: 'Invoice not found' });
      return;
    }
    res.json({ success: true, data: invoice });
  } catch (error) {
    console.error('Error getting invoice:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete invoice
app.delete('/api/invoices/:id', async (req, res) => {
  try {
    const result = await deleteInvoice(req.params.id);
    res.json({ success: true, deleted: result });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save product or products
app.post('/api/products', async (req, res) => {
  try {
    const payload = req.body;
    let result;

    if (Array.isArray(payload)) {
      result = await saveProducts(payload);
    } else {
      result = await saveProduct(payload);
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error saving product(s):', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await getAllProducts();
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const deleted = await deleteProduct(req.params.id);
    res.json({ success: true, deleted });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
