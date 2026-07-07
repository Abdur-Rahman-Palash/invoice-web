const { saveInvoice } = require('./invoice-db');
const fs = require('fs');

// Read invoice data from JSON file
let existingInvoices = [];

try {
  const data = fs.readFileSync('./invoices-backup.json', 'utf8');
  existingInvoices = JSON.parse(data);
  console.log(`Loaded ${existingInvoices.length} invoices from backup file`);
} catch (error) {
  console.log('No backup file found, using sample data');
  existingInvoices = [
    {
      id: 'INV-0001',
      date: '2026-06-03',
      customerName: 'Md Abdur Rahman',
      customerAddress: '',
      customerContact: '',
      customerEmail: '',
      products: [],
      subtotal: 0,
      discount: 0,
      taxRate: 0,
      taxAmount: 0,
      grandTotal: 0,
      status: 'paid',
      createdAt: '2026-06-03T00:00:00.000Z',
      updatedAt: '2026-06-04T00:00:00.000Z'
    },
    {
      id: 'INV-0002',
      date: '2026-06-06',
      customerName: 'Md Abdur Rahman',
      customerAddress: '',
      customerContact: '',
      customerEmail: '',
      products: [],
      subtotal: 0,
      discount: 0,
      taxRate: 0,
      taxAmount: 0,
      grandTotal: 0,
      status: 'paid',
      createdAt: '2026-06-06T00:00:00.000Z',
      updatedAt: '2026-06-09T00:00:00.000Z'
    },
    {
      id: 'INV-0003',
      date: '2026-07-07',
      customerName: 'Md Abdur Rahman',
      customerAddress: '',
      customerContact: '',
      customerEmail: '',
      products: [],
      subtotal: 1114905,
      discount: 0,
      taxRate: 0,
      taxAmount: 0,
      grandTotal: 1114905,
      status: 'paid',
      createdAt: '2026-07-07T00:00:00.000Z',
      updatedAt: '2026-07-08T00:00:00.000Z'
    },
    {
      id: 'INV-0004',
      date: '2026-07-07',
      customerName: 'Md Abdur Rahman',
      customerAddress: '',
      customerContact: '',
      customerEmail: '',
      products: [],
      subtotal: 0,
      discount: 0,
      taxRate: 0,
      taxAmount: 0,
      grandTotal: 0,
      status: 'pending',
      createdAt: '2026-07-07T00:00:00.000Z',
      updatedAt: '2026-07-08T00:00:00.000Z'
    }
  ];
}

async function syncInvoices() {
  try {
    console.log('Syncing invoices to database...');
    
    for (const invoice of existingInvoices) {
      console.log(`Saving invoice ${invoice.id}...`);
      await saveInvoice(invoice);
      console.log(`Invoice ${invoice.id} saved successfully`);
    }
    
    console.log('All invoices synced successfully!');
  } catch (error) {
    console.error('Error syncing invoices:', error);
  }
}

syncInvoices();
