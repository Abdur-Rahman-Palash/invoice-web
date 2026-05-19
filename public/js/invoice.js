// Invoice Module

const Invoice = {
    currentInvoice: null,
    productRows: [],
    editingInvoiceId: null,

    init() {
        this.bindEvents();
        this.renderInvoicesTable();
    },

    bindEvents() {
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

        // Modal and footer buttons
        this.bindModalButtons();

        // Search and filter
        const searchBtn = document.getElementById('invoice-search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.searchInvoices());
        }

        const searchInput = document.getElementById('invoice-search');
        if (searchInput) {
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.searchInvoices();
                }
            });
        }

        const filterBtn = document.getElementById('filter-date-btn');
        if (filterBtn) {
            filterBtn.addEventListener('click', () => this.filterByDate());
        }

        const clearFilterBtn = document.getElementById('clear-filter-btn');
        if (clearFilterBtn) {
            clearFilterBtn.addEventListener('click', () => this.clearFilters());
        }
    },

    bindModalButtons() {
        const closeModalBtn = document.getElementById('close-modal');
        const closeModalFooterBtn = document.getElementById('close-modal-btn');
        const printInvoiceBtn = document.getElementById('print-invoice');
        const downloadInvoiceBtn = document.getElementById('download-invoice');
        const editInvoiceBtn = document.getElementById('edit-invoice');
        const finalizeInvoiceBtn = document.getElementById('finalize-invoice');

        if (closeModalBtn) closeModalBtn.addEventListener('click', () => this.closeModal());
        if (closeModalFooterBtn) closeModalFooterBtn.addEventListener('click', () => this.closeModal());
        if (printInvoiceBtn) printInvoiceBtn.addEventListener('click', () => this.printInvoice());
        if (downloadInvoiceBtn) downloadInvoiceBtn.addEventListener('click', () => this.downloadInvoice());
        if (editInvoiceBtn) editInvoiceBtn.addEventListener('click', () => this.editInvoice());
        if (finalizeInvoiceBtn) finalizeInvoiceBtn.addEventListener('click', () => this.finalizeInvoice());
    },

    showFinalModalButtons() {
        const modalFooter = document.querySelector('#invoice-modal .modal-footer');
        if (!modalFooter) return;

        modalFooter.innerHTML = `
            <button class="btn btn-secondary" id="edit-invoice">Edit</button>
            <button class="btn btn-primary" id="finalize-invoice">Final</button>
        `;

        this.bindModalButtons();
    },

    showPrintDownloadButtons() {
        const modalFooter = document.querySelector('#invoice-modal .modal-footer');
        if (!modalFooter) return;

        modalFooter.innerHTML = `
            <button class="btn btn-secondary" id="edit-invoice">Edit</button>
            <button class="btn btn-primary" id="print-invoice">Print</button>
            <button class="btn btn-secondary" id="download-invoice">Download</button>
            <button class="btn btn-outline" id="close-modal-btn">Close</button>
        `;

        this.bindModalButtons();
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
        this.editingInvoiceId = null;
        this.currentInvoice = null;
        document.getElementById('subtotal').textContent = 'BDT 0';
        document.getElementById('grand-total').textContent = 'BDT 0';
    },

    generateInvoiceId() {
        const invoices = Storage.get('invoices') || [];
        const nextId = invoices.length + 1;
        const invoiceId = `INV-${String(nextId).padStart(4, '0')}`;
        document.getElementById('invoice-id').value = invoiceId;
    },

    addProductRow(productData = {}) {
        const products = Storage.get('products') || [];
        const productRowsContainer = document.getElementById('product-rows');
        const rowId = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

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
                    <input type="text" class="manual-product-name" placeholder="Enter product name" style="display: none; margin-top: 4px;" oninput="Invoice.calculateTotals()">
                </div>
                <div class="form-group">
                    <label>Unit Price</label>
                    <input type="number" class="product-price" placeholder="Enter price" min="0" step="0.01" oninput="Invoice.calculateTotals()">
                </div>
                <div class="form-group">
                    <label>Quantity</label>
                    <input type="number" class="product-quantity" value="1" min="1" step="1" oninput="Invoice.calculateTotals()">
                </div>
                <div class="form-group">
                    <label>Total (Auto)</label>
                    <div class="line-total-box product-line-total">BDT 0.00</div>
                </div>
                <button type="button" class="remove-product" onclick="Invoice.removeProductRow('${rowId}')">&times;</button>
            </div>
        `;

        productRowsContainer.insertAdjacentHTML('beforeend', rowHtml);
        this.productRows.push(rowId);

        const row = document.querySelector(`[data-row-id="${rowId}"]`);
        if (!row) return;

        if (productData.category) {
            row.querySelector('.product-category').value = productData.category;
            this.loadProducts(row.querySelector('.product-category'), rowId);
        }

        if (productData.name) {
            const productSelect = row.querySelector('.product-name');
            const matchedOption = [...productSelect.options].find(option => option.value === productData.name);

            if (matchedOption) {
                productSelect.value = productData.name;
                this.handleProductSelect(productSelect, rowId);
            } else {
                productSelect.value = 'manual';
                this.handleProductSelect(productSelect, rowId);
                row.querySelector('.manual-product-name').value = productData.name;
            }
        }

        if (typeof productData.price === 'number') {
            row.querySelector('.product-price').value = productData.price;
        }

        if (typeof productData.quantity === 'number') {
            row.querySelector('.product-quantity').value = productData.quantity;
        }

        this.calculateTotals();
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
        this.calculateTotals();
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
            const lineTotal = price * quantity;
            row.querySelector('.product-line-total').textContent = `BDT ${lineTotal.toFixed(2)}`;
            subtotal += lineTotal;
        });

        const discount = parseFloat(document.getElementById('discount').value) || 0;
        const taxRate = parseFloat(document.getElementById('tax').value) || 0;
        const taxableAmount = Math.max(subtotal - discount, 0);
        const taxAmount = taxableAmount * (taxRate / 100);
        const grandTotal = taxableAmount + taxAmount;

        document.getElementById('subtotal').textContent = `BDT ${subtotal.toFixed(2)}`;
        document.getElementById('grand-total').textContent = `BDT ${grandTotal.toFixed(2)}`;
    },

    handleSaveInvoice(e) {
        e.preventDefault();

        const invoice = this.getFormData();
        if (!invoice) return;

        this.currentInvoice = invoice;
        this.renderInvoicePreview(invoice);
        this.showFinalModalButtons();
        document.getElementById('invoice-modal').classList.remove('hidden');
    },

    cancelInvoice() {
        if (confirm('Are you sure you want to cancel?')) {
            this.resetForm();
            App.navigateTo('dashboard');
        }
    },

    finalizeInvoice() {
        if (!this.currentInvoice) return;

        const invoices = Storage.get('invoices') || [];
        const existingInvoice = invoices.find(inv => inv.id === this.currentInvoice.id);

        if (!existingInvoice) {
            const invoiceToSave = {
                ...this.currentInvoice,
                status: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            invoices.push(invoiceToSave);
            Storage.set('invoices', invoices);
            this.currentInvoice = invoiceToSave;
        } else {
            Object.assign(existingInvoice, this.currentInvoice, {
                status: existingInvoice.status || 'pending',
                createdAt: existingInvoice.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            Storage.set('invoices', invoices);
            this.currentInvoice = existingInvoice;
        }

        Dashboard.updateStats();
        Dashboard.renderRecentInvoices();
        Payment.updateStats();
        this.renderInvoicesTable();
        this.showPrintDownloadButtons();
    },

    editInvoice() {
        if (!this.currentInvoice) return;

        this.closeModal();
        this.populateForm(this.currentInvoice);
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
        const taxableAmount = Math.max(subtotal - discount, 0);
        const taxAmount = taxableAmount * (taxRate / 100);
        const grandTotal = taxableAmount + taxAmount;

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

    populateForm(invoice) {
        App.navigateTo('create-invoice');
        this.resetForm();
        this.editingInvoiceId = invoice.id;
        this.currentInvoice = invoice;

        document.getElementById('invoice-id').value = invoice.id;
        document.getElementById('invoice-date').value = invoice.date;
        document.getElementById('customer-name').value = invoice.customerName || '';
        document.getElementById('customer-address').value = invoice.customerAddress || '';
        document.getElementById('customer-contact').value = invoice.customerContact || '';
        document.getElementById('customer-email').value = invoice.customerEmail || '';
        document.getElementById('discount').value = invoice.discount || 0;
        document.getElementById('tax').value = invoice.taxRate || 0;

        if (invoice.products && invoice.products.length) {
            invoice.products.forEach(product => this.addProductRow(product));
        } else {
            this.addProductRow();
        }

        this.calculateTotals();
    },

    renderInvoicePreview(invoice) {
        const previewContent = document.getElementById('invoice-preview-content');
        const settings = Storage.get('settings') || {};
        
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
                        <p><strong>${settings.companyName || 'Your Company'}</strong></p>
                        <p>${settings.companyAddress || 'Your Address'}</p>
                        <p>${settings.companyPhone || 'Your Phone'}</p>
                        <p>${settings.companyEmail || 'your@email.com'}</p>
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
        this.renderFilteredInvoices(Storage.get('invoices') || []);
    },

    viewInvoice(invoiceId) {
        const invoices = Storage.get('invoices') || [];
        const invoice = invoices.find(inv => inv.id === invoiceId);
        
        if (invoice) {
            this.currentInvoice = invoice;
            this.renderInvoicePreview(invoice);
            this.showPrintDownloadButtons();
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
        this.applyFilters();
    },

    filterByDate() {
        this.applyFilters();
    },

    clearFilters() {
        document.getElementById('invoice-search').value = '';
        document.getElementById('filter-date-from').value = '';
        document.getElementById('filter-date-to').value = '';
        this.renderInvoicesTable();
    },

    renderFilteredInvoices(invoices) {
        const tbody = document.getElementById('invoices-table-body');
        
        if (!tbody) return;

        if (invoices.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="no-data">No invoices found</td></tr>';
            return;
        }

        const sortedInvoices = invoices.slice().sort((a, b) => new Date(b.updatedAt || b.createdAt || b.date) - new Date(a.updatedAt || a.createdAt || a.date));

        tbody.innerHTML = sortedInvoices.map(inv => `
            <tr>
                <td><a href="#" class="invoice-link" data-id="${inv.id}">${inv.id}</a></td>
                <td>${inv.customerName}</td>
                <td>${this.formatDate(inv.date)}</td>
                <td>${this.formatDate(inv.updatedAt)}</td>
            </tr>
        `).join('');

        document.querySelectorAll('.invoice-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.viewInvoice(e.target.dataset.id);
            });
        });
    },

    applyFilters() {
        const searchTerm = document.getElementById('invoice-search').value.trim().toLowerCase();
        const fromDate = document.getElementById('filter-date-from').value;
        const toDate = document.getElementById('filter-date-to').value;
        const invoices = Storage.get('invoices') || [];

        const filtered = invoices.filter(inv => {
            const invoiceDate = new Date(inv.date);
            const from = fromDate ? new Date(fromDate) : null;
            const to = toDate ? new Date(toDate) : null;
            const matchesSearch = !searchTerm ||
                inv.id.toLowerCase().includes(searchTerm) ||
                inv.customerName.toLowerCase().includes(searchTerm);

            if (!matchesSearch) return false;
            if (from && invoiceDate < from) return false;
            if (to && invoiceDate > to) return false;
            return true;
        });

        this.renderFilteredInvoices(filtered);
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
