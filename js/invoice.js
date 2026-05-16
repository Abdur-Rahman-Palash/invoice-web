// Invoice Module

const Invoice = {
    currentInvoice: null,
    productRows: [],

    init() {
        this.bindEvents();
        this.renderInvoicesTable();
    },

    bindEvents() {
        // Create invoice button
        const createInvoiceBtn = document.getElementById('create-invoice-btn');
        if (createInvoiceBtn) {
            createInvoiceBtn.addEventListener('click', () => this.openCreateInvoice());
        }

        // Invoice form
        const invoiceForm = document.getElementById('create-invoice-form');
        if (invoiceForm) {
            invoiceForm.addEventListener('submit', (e) => this.handleSaveInvoice(e));
        }

        // Add product row button
        const addProductRowBtn = document.getElementById('add-product-row');
        if (addProductRowBtn) {
            addProductRowBtn.addEventListener('click', () => this.addProductRow());
        }

        // Cancel invoice button
        const cancelInvoiceBtn = document.getElementById('cancel-invoice');
        if (cancelInvoiceBtn) {
            cancelInvoiceBtn.addEventListener('click', () => this.cancelInvoice());
        }

        // Preview invoice button
        const previewInvoiceBtn = document.getElementById('preview-invoice');
        if (previewInvoiceBtn) {
            previewInvoiceBtn.addEventListener('click', () => this.previewInvoice());
        }

        // Search and filter
        const searchBtn = document.getElementById('invoice-search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.searchInvoices());
        }

        const filterBtn = document.getElementById('filter-date-btn');
        if (filterBtn) {
            filterBtn.addEventListener('click', () => this.filterByDate());
        }

        const clearFilterBtn = document.getElementById('clear-filter-btn');
        if (clearFilterBtn) {
            clearFilterBtn.addEventListener('click', () => this.clearFilters());
        }

        // Modal events
        const closeModalBtn = document.getElementById('close-modal');
        const closeModalFooterBtn = document.getElementById('close-modal-btn');
        const printInvoiceBtn = document.getElementById('print-invoice');
        const downloadInvoiceBtn = document.getElementById('download-invoice');

        if (closeModalBtn) closeModalBtn.addEventListener('click', () => this.closeModal());
        if (closeModalFooterBtn) closeModalFooterBtn.addEventListener('click', () => this.closeModal());
        if (printInvoiceBtn) printInvoiceBtn.addEventListener('click', () => this.printInvoice());
        if (downloadInvoiceBtn) downloadInvoiceBtn.addEventListener('click', () => this.downloadInvoice());
    },

    openCreateInvoice() {
        App.navigateTo('create-invoice');
        this.resetForm();
        this.generateInvoiceId();
        this.addProductRow();
        document.getElementById('invoice-date').value = new Date().toISOString().split('T')[0];
    },

    resetForm() {
        document.getElementById('create-invoice-form').reset();
        document.getElementById('product-rows').innerHTML = '';
        this.productRows = [];
        document.getElementById('subtotal').textContent = 'BDT 0';
        document.getElementById('grand-total').textContent = 'BDT 0';
    },

    generateInvoiceId() {
        const invoices = Storage.get('invoices') || [];
        const nextId = invoices.length + 1;
        const invoiceId = `INV-${String(nextId).padStart(4, '0')}`;
        document.getElementById('invoice-id').value = invoiceId;
    },

    addProductRow() {
        const products = Storage.get('products') || [];
        const productRowsContainer = document.getElementById('product-rows');
        const rowId = Date.now();

        const categories = [...new Set(products.map(p => p.category))];
        
        // Add default categories if no products exist
        const defaultCategories = ['Shoe', 'Bag', 'Sanitary', 'Other'];
        const allCategories = categories.length > 0 ? categories : defaultCategories;

        const rowHtml = `
            <div class="product-row" data-row-id="${rowId}">
                <div class="form-group">
                    <label>Category</label>
                    <select class="product-category" onchange="Invoice.loadProducts(this, '${rowId}')">
                        <option value="">Select category</option>
                        ${allCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Product</label>
                    <select class="product-name" onchange="Invoice.handleProductSelect(this, '${rowId}')">
                        <option value="">Select product</option>
                        <option value="manual">-- Enter Manually --</option>
                    </select>
                    <input type="text" class="manual-product-name" placeholder="Enter product name" style="display: none; margin-top: 4px;">
                </div>
                <div class="form-group">
                    <label>Price</label>
                    <input type="number" class="product-price" placeholder="Enter price" onchange="Invoice.calculateTotals()">
                </div>
                <div class="form-group">
                    <label>Quantity</label>
                    <input type="number" class="product-quantity" value="1" min="1" onchange="Invoice.calculateTotals()">
                </div>
                <button type="button" class="remove-product" onclick="Invoice.removeProductRow('${rowId}')">&times;</button>
            </div>
        `;

        productRowsContainer.insertAdjacentHTML('beforeend', rowHtml);
        this.productRows.push(rowId);
    },

    loadProducts(categorySelect, rowId) {
        const category = categorySelect.value;
        const products = Storage.get('products') || [];
        const filteredProducts = products.filter(p => p.category === category);
        
        const row = document.querySelector(`[data-row-id="${rowId}"]`);
        const productSelect = row.querySelector('.product-name');
        const priceInput = row.querySelector('.product-price');
        const manualNameInput = row.querySelector('.manual-product-name');
        
        productSelect.innerHTML = '<option value="">Select product</option>' + 
            filteredProducts.map(p => `<option value="${p.name}" data-price="${p.price}">${p.name}</option>`).join('') +
            '<option value="manual">-- Enter Manually --</option>';
        
        // Reset inputs when category changes
        priceInput.value = '';
        priceInput.readOnly = false;
        manualNameInput.style.display = 'none';
        manualNameInput.value = '';
    },

    handleProductSelect(productSelect, rowId) {
        const selectedValue = productSelect.value;
        const row = document.querySelector(`[data-row-id="${rowId}"]`);
        const priceInput = row.querySelector('.product-price');
        const manualNameInput = row.querySelector('.manual-product-name');
        
        if (selectedValue === 'manual') {
            // Enable manual entry
            priceInput.readOnly = false;
            priceInput.value = '';
            priceInput.placeholder = 'Enter price';
            manualNameInput.style.display = 'block';
            manualNameInput.focus();
        } else if (selectedValue) {
            // Auto-fill price from selected product
            const selectedOption = productSelect.options[productSelect.selectedIndex];
            const price = selectedOption.dataset.price || 0;
            priceInput.value = price;
            priceInput.readOnly = true;
            manualNameInput.style.display = 'none';
            manualNameInput.value = '';
        } else {
            priceInput.value = '';
            priceInput.readOnly = false;
            manualNameInput.style.display = 'none';
            manualNameInput.value = '';
        }
        
        this.calculateTotals();
    },

    removeProductRow(rowId) {
        const row = document.querySelector(`[data-row-id="${rowId}"]`);
        if (row) {
            row.remove();
            this.productRows = this.productRows.filter(id => id !== rowId);
            this.calculateTotals();
        }
    },

    calculateTotals() {
        const rows = document.querySelectorAll('.product-row');
        let subtotal = 0;

        rows.forEach(row => {
            const price = parseFloat(row.querySelector('.product-price').value) || 0;
            const quantity = parseFloat(row.querySelector('.product-quantity').value) || 0;
            subtotal += price * quantity;
        });

        const discount = parseFloat(document.getElementById('discount').value) || 0;
        const taxRate = parseFloat(document.getElementById('tax').value) || 0;
        const taxAmount = (subtotal - discount) * (taxRate / 100);
        const grandTotal = subtotal - discount + taxAmount;

        document.getElementById('subtotal').textContent = `BDT ${subtotal.toFixed(2)}`;
        document.getElementById('grand-total').textContent = `BDT ${grandTotal.toFixed(2)}`;
    },

    handleSaveInvoice(e) {
        e.preventDefault();

        const invoiceId = document.getElementById('invoice-id').value;
        const date = document.getElementById('invoice-date').value;
        const customerName = document.getElementById('customer-name').value;
        const customerAddress = document.getElementById('customer-address').value;
        const customerContact = document.getElementById('customer-contact').value;
        const customerEmail = document.getElementById('customer-email').value;

        // Get products
        const products = [];
        document.querySelectorAll('.product-row').forEach(row => {
            const category = row.querySelector('.product-category').value;
            const productSelect = row.querySelector('.product-name').value;
            const manualProductName = row.querySelector('.manual-product-name').value;
            const price = parseFloat(row.querySelector('.product-price').value) || 0;
            const quantity = parseFloat(row.querySelector('.product-quantity').value) || 0;

            // Use manual name if "Enter Manually" is selected, otherwise use dropdown value
            const productName = productSelect === 'manual' ? manualProductName : productSelect;

            if (productName && quantity > 0 && price > 0) {
                products.push({
                    category,
                    name: productName,
                    price,
                    quantity,
                    total: price * quantity
                });
            }
        });

        if (products.length === 0) {
            alert('Please add at least one product');
            return;
        }

        const subtotal = products.reduce((sum, p) => sum + p.total, 0);
        const discount = parseFloat(document.getElementById('discount').value) || 0;
        const taxRate = parseFloat(document.getElementById('tax').value) || 0;
        const taxAmount = (subtotal - discount) * (taxRate / 100);
        const grandTotal = subtotal - discount + taxAmount;

        const invoice = {
            id: invoiceId,
            date,
            customerName,
            customerAddress,
            customerContact,
            customerEmail,
            products,
            subtotal,
            discount,
            taxRate,
            taxAmount,
            grandTotal,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Save to storage
        const invoices = Storage.get('invoices') || [];
        invoices.push(invoice);
        Storage.set('invoices', invoices);

        // Update dashboard
        Dashboard.updateStats();
        Dashboard.renderRecentInvoices();
        Payment.updateStats();

        alert('Invoice saved successfully!');
        this.resetForm();
        App.navigateTo('invoices');
        this.renderInvoicesTable();
    },

    cancelInvoice() {
        if (confirm('Are you sure you want to cancel?')) {
            this.resetForm();
            App.navigateTo('dashboard');
        }
    },

    previewInvoice() {
        const invoice = this.getFormData();
        if (!invoice) return;

        this.currentInvoice = invoice;
        this.renderInvoicePreview(invoice);
        document.getElementById('invoice-modal').classList.remove('hidden');
    },

    getFormData() {
        const invoiceId = document.getElementById('invoice-id').value;
        const date = document.getElementById('invoice-date').value;
        const customerName = document.getElementById('customer-name').value;

        if (!customerName) {
            alert('Please enter customer name');
            return null;
        }

        const products = [];
        document.querySelectorAll('.product-row').forEach(row => {
            const category = row.querySelector('.product-category').value;
            const productSelect = row.querySelector('.product-name').value;
            const manualProductName = row.querySelector('.manual-product-name').value;
            const price = parseFloat(row.querySelector('.product-price').value) || 0;
            const quantity = parseFloat(row.querySelector('.product-quantity').value) || 0;

            // Use manual name if "Enter Manually" is selected, otherwise use dropdown value
            const productName = productSelect === 'manual' ? manualProductName : productSelect;

            if (productName && quantity > 0 && price > 0) {
                products.push({
                    category,
                    name: productName,
                    price,
                    quantity,
                    total: price * quantity
                });
            }
        });

        if (products.length === 0) {
            alert('Please add at least one product');
            return null;
        }

        const subtotal = products.reduce((sum, p) => sum + p.total, 0);
        const discount = parseFloat(document.getElementById('discount').value) || 0;
        const taxRate = parseFloat(document.getElementById('tax').value) || 0;
        const taxAmount = (subtotal - discount) * (taxRate / 100);
        const grandTotal = subtotal - discount + taxAmount;

        return {
            id: invoiceId,
            date,
            customerName,
            customerAddress: document.getElementById('customer-address').value,
            customerContact: document.getElementById('customer-contact').value,
            customerEmail: document.getElementById('customer-email').value,
            products,
            subtotal,
            discount,
            taxRate,
            taxAmount,
            grandTotal
        };
    },

    renderInvoicePreview(invoice) {
        const previewContent = document.getElementById('invoice-preview-content');
        
        previewContent.innerHTML = `
            <div class="invoice-preview">
                <div class="invoice-preview-header">
                    <h1>INVOICE</h1>
                    <div>
                        <p><strong>Invoice ID:</strong> ${invoice.id}</p>
                        <p><strong>Date:</strong> ${this.formatDate(invoice.date)}</p>
                    </div>
                </div>

                <div class="invoice-preview-details">
                    <div class="invoice-preview-section">
                        <h3>Bill To</h3>
                        <p><strong>${invoice.customerName}</strong></p>
                        <p>${invoice.customerAddress || 'N/A'}</p>
                        <p>${invoice.customerContact || 'N/A'}</p>
                        <p>${invoice.customerEmail || 'N/A'}</p>
                    </div>
                    <div class="invoice-preview-section">
                        <h3>From</h3>
                        <p><strong>Your Company</strong></p>
                        <p>Your Address</p>
                        <p>Your Phone</p>
                        <p>your@email.com</p>
                    </div>
                </div>

                <table class="invoice-preview-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.products.map(p => `
                            <tr>
                                <td>${p.name}</td>
                                <td>${p.category}</td>
                                <td>BDT ${p.price.toFixed(2)}</td>
                                <td>${p.quantity}</td>
                                <td>BDT ${p.total.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="invoice-preview-total">
                    <div><span class="label">Subtotal:</span><span class="value">BDT ${invoice.subtotal.toFixed(2)}</span></div>
                    <div><span class="label">Discount:</span><span class="value">BDT ${invoice.discount.toFixed(2)}</span></div>
                    <div><span class="label">Tax (${invoice.taxRate}%):</span><span class="value">BDT ${invoice.taxAmount.toFixed(2)}</span></div>
                    <div class="grand-total"><span class="label">Grand Total:</span><span class="value">BDT ${invoice.grandTotal.toFixed(2)}</span></div>
                </div>
            </div>
        `;
    },

    renderInvoicesTable() {
        const invoices = Storage.get('invoices') || [];
        const tbody = document.getElementById('invoices-table-body');
        
        if (invoices.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="no-data">No invoices found</td></tr>';
            return;
        }

        tbody.innerHTML = invoices.slice().reverse().map(inv => `
            <tr>
                <td><a href="#" class="invoice-link" data-id="${inv.id}">${inv.id}</a></td>
                <td>${inv.customerName}</td>
                <td>${this.formatDate(inv.date)}</td>
                <td>${this.formatDate(inv.updatedAt)}</td>
                <td>BDT ${inv.grandTotal.toFixed(2)}</td>
                <td><span class="status-badge status-${inv.status}">${inv.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="Invoice.viewInvoice('${inv.id}')">View</button>
                    <button class="btn btn-sm btn-outline" onclick="Invoice.deleteInvoice('${inv.id}')">Delete</button>
                </td>
            </tr>
        `).join('');

        // Bind click events for invoice links
        document.querySelectorAll('.invoice-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.viewInvoice(e.target.dataset.id);
            });
        });
    },

    viewInvoice(invoiceId) {
        const invoices = Storage.get('invoices') || [];
        const invoice = invoices.find(inv => inv.id === invoiceId);
        
        if (invoice) {
            this.currentInvoice = invoice;
            this.renderInvoicePreview(invoice);
            document.getElementById('invoice-modal').classList.remove('hidden');
        }
    },

    deleteInvoice(invoiceId) {
        if (confirm('Are you sure you want to delete this invoice?')) {
            const invoices = Storage.get('invoices') || [];
            const filtered = invoices.filter(inv => inv.id !== invoiceId);
            Storage.set('invoices', filtered);
            
            this.renderInvoicesTable();
            Dashboard.updateStats();
            Dashboard.renderRecentInvoices();
            Payment.updateStats();
        }
    },

    searchInvoices() {
        const searchTerm = document.getElementById('invoice-search').value.toLowerCase();
        const invoices = Storage.get('invoices') || [];
        
        const filtered = invoices.filter(inv => 
            inv.id.toLowerCase().includes(searchTerm) ||
            inv.customerName.toLowerCase().includes(searchTerm)
        );

        this.renderFilteredInvoices(filtered);
    },

    filterByDate() {
        const fromDate = document.getElementById('filter-date-from').value;
        const toDate = document.getElementById('filter-date-to').value;
        const invoices = Storage.get('invoices') || [];

        const filtered = invoices.filter(inv => {
            const invoiceDate = new Date(inv.date);
            const from = fromDate ? new Date(fromDate) : null;
            const to = toDate ? new Date(toDate) : null;

            if (from && invoiceDate < from) return false;
            if (to && invoiceDate > to) return false;
            return true;
        });

        this.renderFilteredInvoices(filtered);
    },

    clearFilters() {
        document.getElementById('invoice-search').value = '';
        document.getElementById('filter-date-from').value = '';
        document.getElementById('filter-date-to').value = '';
        this.renderInvoicesTable();
    },

    renderFilteredInvoices(invoices) {
        const tbody = document.getElementById('invoices-table-body');
        
        if (invoices.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="no-data">No invoices found</td></tr>';
            return;
        }

        tbody.innerHTML = invoices.slice().reverse().map(inv => `
            <tr>
                <td><a href="#" class="invoice-link" data-id="${inv.id}">${inv.id}</a></td>
                <td>${inv.customerName}</td>
                <td>${this.formatDate(inv.date)}</td>
                <td>${this.formatDate(inv.updatedAt)}</td>
                <td>BDT ${inv.grandTotal.toFixed(2)}</td>
                <td><span class="status-badge status-${inv.status}">${inv.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="Invoice.viewInvoice('${inv.id}')">View</button>
                    <button class="btn btn-sm btn-outline" onclick="Invoice.deleteInvoice('${inv.id}')">Delete</button>
                </td>
            </tr>
        `).join('');

        document.querySelectorAll('.invoice-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.viewInvoice(e.target.dataset.id);
            });
        });
    },

    closeModal() {
        document.getElementById('invoice-modal').classList.add('hidden');
    },

    printInvoice() {
        window.print();
    },

    downloadInvoice() {
        const invoice = this.currentInvoice;
        if (!invoice) return;

        const content = `
INVOICE
=======
Invoice ID: ${invoice.id}
Date: ${this.formatDate(invoice.date)}

BILL TO
-------
Name: ${invoice.customerName}
Address: ${invoice.customerAddress || 'N/A'}
Contact: ${invoice.customerContact || 'N/A'}
Email: ${invoice.customerEmail || 'N/A'}

PRODUCTS
--------
${invoice.products.map(p => `
${p.name} (${p.category})
Price: BDT ${p.price.toFixed(2)} x ${p.quantity} = BDT ${p.total.toFixed(2)}
`).join('')}

SUMMARY
-------
Subtotal: BDT ${invoice.subtotal.toFixed(2)}
Discount: BDT ${invoice.discount.toFixed(2)}
Tax (${invoice.taxRate}%): BDT ${invoice.taxAmount.toFixed(2)}
GRAND TOTAL: BDT ${invoice.grandTotal.toFixed(2)}
        `;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${invoice.id}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
};
