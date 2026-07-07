const { saveInvoice, getInvoice, getAllInvoices, deleteInvoice } = require('./invoice-db');

async function testInvoiceOperations() {
  try {
    console.log('=== Testing Invoice Database Operations ===\n');
    
    // Test 1: Save a new invoice
    console.log('1. Saving new invoice...');
    const savedInvoice = await saveInvoice('INV-2024-001');
    console.log('Saved:', savedInvoice);
    console.log();
    
    // Test 2: Get the invoice
    console.log('2. Getting invoice...');
    const retrievedInvoice = await getInvoice('INV-2024-001');
    console.log('Retrieved:', retrievedInvoice);
    console.log();
    
    // Test 3: Update the invoice (should update last_modified)
    console.log('3. Updating invoice (should update last_modified)...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    const updatedInvoice = await saveInvoice('INV-2024-001');
    console.log('Updated:', updatedInvoice);
    console.log();
    
    // Test 4: Save another invoice
    console.log('4. Saving another invoice...');
    await saveInvoice('INV-2024-002');
    console.log();
    
    // Test 5: Get all invoices
    console.log('5. Getting all invoices...');
    const allInvoices = await getAllInvoices();
    console.log('All invoices:', allInvoices);
    console.log();
    
    // Test 6: Delete an invoice
    console.log('6. Deleting invoice...');
    const deleted = await deleteInvoice('INV-2024-002');
    console.log('Deleted:', deleted);
    console.log();
    
    // Test 7: Get all invoices after deletion
    console.log('7. Getting all invoices after deletion...');
    const remainingInvoices = await getAllInvoices();
    console.log('Remaining invoices:', remainingInvoices);
    console.log();
    
    console.log('=== All tests completed successfully! ===');
  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    process.exit(0);
  }
}

testInvoiceOperations();
