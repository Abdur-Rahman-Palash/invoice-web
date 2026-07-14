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

        // Add payment button on form
        const addPaymentBtn = document.getElementById('add-payment-btn');
        if (addPaymentBtn) {
            addPaymentBtn.addEventListener('click', () => this.handleAddPayment());
        }

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

        // Event delegation for invoices table
        const invoicesTableBody = document.getElementById('invoices-table-body');
        if (invoicesTableBody) {
            invoicesTableBody.addEventListener('click', (e) => {
                // Handle mark as paid button
                if (e.target.classList.contains('mark-paid-btn')) {
                    e.stopPropagation();
                    const invoiceId = e.target.dataset.invoiceId;
                    Payment.markAsPaid(invoiceId);
                }
                // Handle edit button
                if (e.target.classList.contains('edit-invoice-row-btn')) {
                    e.stopPropagation();
                    const invoiceId = e.target.dataset.invoiceId;
                    const invoice = Storage.get('invoices').find(inv => inv.id === invoiceId);
                    if (invoice) {
                        this.populateForm(invoice);
                    }
                }
                // Handle delete button
                if (e.target.classList.contains('delete-invoice-btn')) {
                    e.stopPropagation();
                    const invoiceId = e.target.dataset.invoiceId;
                    this.deleteInvoice(invoiceId);
                }
                // Handle invoice link
                if (e.target.classList.contains('invoice-link')) {
                    e.preventDefault();
                    const invoiceId = e.target.dataset.id;
                    this.viewInvoice(invoiceId);
                }
            });
        }
    },

    bindModalButtons() {
        const closeModalBtn = document.getElementById('close-modal');
        const closeModalFooterBtn = document.getElementById('close-modal-btn');
        const printInvoiceBtn = document.getElementById('print-invoice');
        const downloadInvoiceBtn = document.getElementById('download-invoice');
        const editInvoiceBtn = document.getElementById('edit-invoice');
        const finalizeInvoiceBtn = document.getElementById('finalize-invoice');
        const addPaymentBtn = document.getElementById('add-payment-btn');

        if (closeModalBtn) closeModalBtn.addEventListener('click', () => this.closeModal());
        if (closeModalFooterBtn) closeModalFooterBtn.addEventListener('click', () => this.closeModal());
        if (printInvoiceBtn) printInvoiceBtn.addEventListener('click', () => this.printInvoice());
        if (downloadInvoiceBtn) downloadInvoiceBtn.addEventListener('click', () => this.downloadInvoice());
        if (editInvoiceBtn) editInvoiceBtn.addEventListener('click', () => this.editInvoice());
        if (finalizeInvoiceBtn) {
            finalizeInvoiceBtn.addEventListener('click', () => {
                console.log('Final button clicked');
                this.finalizeInvoice();
            });
        }
        if (addPaymentBtn) {
            addPaymentBtn.addEventListener('click', () => this.handleAddPayment());
        }
    },

    handleAddPayment() {
        const paymentAmount = prompt('Enter payment amount:');
        if (paymentAmount === null || paymentAmount === '') return;

        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid payment amount');
            return;
        }

        const paidInput = document.getElementById('paid');
        const currentPaid = parseFloat(paidInput.value) || 0;
        paidInput.value = (currentPaid + amount).toFixed(2);
        this.calculateTotals();
    },

    showFinalModalButtons() {
        const modalFooter = document.querySelector('#invoice-modal .modal-footer');
        if (!modalFooter) return;

        modalFooter.innerHTML = `
            <button class="btn btn-secondary" id="edit-invoice">Edit</button>
            <button class="btn btn-primary" id="finalize-invoice">Final</button>
        `;

        // Small delay to ensure DOM is updated before binding events
        setTimeout(() => {
            this.bindModalButtons();
        }, 10);
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

        // Small delay to ensure DOM is updated before binding events
        setTimeout(() => {
            this.bindModalButtons();
        }, 10);
    },

    openCreateInvoice() {
        App.navigateTo('create-invoice');
        this.resetForm();
        // Small delay to ensure DOM is ready after navigation
        setTimeout(() => {
            this.showPreviewInvoiceId();
            this.addProductRow();
            document.getElementById('invoice-date').value = new Date().toISOString().split('T')[0];
        }, 50);
    },

    openEditInvoice() {
        const invoices = Storage.get('invoices') || [];
        if (invoices.length === 0) {
            alert('No invoices available to edit. Please create an invoice first.');
            return;
        }

        App.navigateTo('invoices');
    },

    resetForm() {
        const form = document.getElementById('create-invoice-form');
        if (form) {
            form.reset();
        }
        document.getElementById('product-rows').innerHTML = '';
        this.productRows = [];
        this.editingInvoiceId = null;
        this.currentInvoice = null;
        document.getElementById('subtotal').textContent = '$0';
        document.getElementById('grand-total').textContent = '$0';
        // Clear invoice ID field separately since it's readonly
        const invoiceIdField = document.getElementById('invoice-id');
        if (invoiceIdField) {
            invoiceIdField.value = '';
        }
    },

    showPreviewInvoiceId() {
        const invoices = Storage.get('invoices') || [];
        let maxId = 0;

        // Find the maximum existing invoice ID
        invoices.forEach(inv => {
            const match = inv.id.match(/INV-(\d+)/);
            if (match) {
                const idNum = parseInt(match[1], 10);
                if (idNum > maxId) {
                    maxId = idNum;
                }
            }
        });

        const nextId = maxId + 1;
        const invoiceId = `INV-${String(nextId).padStart(4, '0')}`;
        const invoiceIdField = document.getElementById('invoice-id');
        if (invoiceIdField) {
            invoiceIdField.value = invoiceId;
            console.log('Preview Invoice ID set:', invoiceId);
        } else {
            console.error('Invoice ID field not found');
        }
    },

    generateInvoiceId() {
        const invoices = Storage.get('invoices') || [];
        let maxId = 0;

        // Find the maximum existing invoice ID
        invoices.forEach(inv => {
            const match = inv.id.match(/INV-(\d+)/);
            if (match) {
                const idNum = parseInt(match[1], 10);
                if (idNum > maxId) {
                    maxId = idNum;
                }
            }
        });

        const nextId = maxId + 1;
        return `INV-${String(nextId).padStart(4, '0')}`;
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
                    <div class="line-total-box product-line-total">$0.00</div>
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

        const paid = parseFloat(document.getElementById('paid').value) || 0;
        const payable = Math.max(subtotal - paid, 0);

        document.getElementById('subtotal').textContent = `BDT ${subtotal.toFixed(2)}`;
        document.getElementById('grand-total').textContent = `BDT ${payable.toFixed(2)}`;
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

    async finalizeInvoice() {
        if (!this.currentInvoice) return;

        // Check stock availability before finalizing
        const products = Storage.get('products') || [];
        const stockErrors = [];

        for (const item of this.currentInvoice.products) {
            const product = products.find(p => p.name === item.name);
            if (product) {
                if (item.quantity > product.stock) {
                    stockErrors.push({
                        name: item.name,
                        requested: item.quantity,
                        available: product.stock
                    });
                }
            }
        }

        if (stockErrors.length > 0) {
            const errorMessage = stockErrors.map(err =>
                `${err.name}: Requested ${err.requested}, Available ${err.available}`
            ).join('\n');
            alert(`Insufficient stock for the following products:\n\n${errorMessage}\n\nPlease reduce quantities or update product stock.`);
            return;
        }

        // Generate invoice ID only when finalizing (not when opening form)
        if (!this.currentInvoice.id) {
            this.currentInvoice.id = this.generateInvoiceId();
        }

        // Update invoice ID field display
        const invoiceIdField = document.getElementById('invoice-id');
        if (invoiceIdField) {
            invoiceIdField.value = this.currentInvoice.id;
        }

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
            await Storage.set('invoices', invoices);
            this.currentInvoice = invoiceToSave;
        } else {
            Object.assign(existingInvoice, this.currentInvoice, {
                status: existingInvoice.status || 'pending',
                createdAt: existingInvoice.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            await Storage.set('invoices', invoices);
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
        const paid = parseFloat(document.getElementById('paid').value) || 0;
        const payable = Math.max(subtotal - paid, 0);

        return {
            id: invoiceId,
            date,
            customerName,
            customerAddress: document.getElementById('customer-address').value,
            customerContact: document.getElementById('customer-contact').value,
            customerEmail: document.getElementById('customer-email').value,
            products,
            subtotal,
            paid,
            payable
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
        document.getElementById('paid').value = invoice.paid || 0;

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
        
        const hasSignature = settings.ownerName || settings.ownerTitle;
        
        previewContent.innerHTML = `
            <div class="invoice-preview">
                <!-- Header Section - Corporate Layout -->
                <div class="invoice-header">
                    <div class="invoice-header-left">
                        <div class="company-logo">
                            <div class="logo-icon"></div>
                            <span class="company-name">${settings.companyName || 'Your Company'}</span>
                        </div>
                        
                        <div class="company-info">
                            <p>${settings.companyAddress || ''}</p>
                            <p>${settings.companyPhone || ''}</p>
                            <p>${settings.companyEmail || ''}</p>
                        </div>
                        
                        <div class="invoice-to">
                            <p class="invoice-to-label">Bill To</p>
                            <p class="customer-name">${invoice.customerName}</p>
                            <p class="customer-address">${invoice.customerAddress || ''}</p>
                            <p class="customer-contact">${invoice.customerContact || ''}</p>
                            <p class="customer-contact">${invoice.customerEmail || ''}</p>
                        </div>
                    </div>
                    
                    <div class="invoice-header-right">
                        <div>
                            <h1 class="invoice-title">INVOICE</h1>
                        </div>
                        <div class="invoice-meta-right">
                            <p><strong>Invoice #</strong> ${invoice.id}</p>
                            <p><strong>Date</strong> ${this.formatDate(invoice.date)}</p>
                        </div>
                    </div>
                </div>
                
                <!-- Product Table -->
                <div class="invoice-products">
                    <div class="product-table-header">
                        <div class="product-col-description">Description</div>
                        <div class="product-col-price">Price</div>
                        <div class="product-col-qty">Qty</div>
                        <div class="product-col-total">Total</div>
                    </div>
                    ${invoice.products.map((product, index) => `
                        <div class="product-table-row ${index % 2 === 1 ? 'row-alt' : ''}">
                            <div class="product-col-description">${product.name}</div>
                            <div class="product-col-price">$${product.price.toFixed(2)}</div>
                            <div class="product-col-qty">${product.quantity}</div>
                            <div class="product-col-total">$${product.total.toFixed(2)}</div>
                        </div>
                    `).join('')}
                </div>
                
                <!-- Footer Section -->
                <div class="invoice-footer">
                    <div class="footer-left">
                        <div class="payment-section">
                            <h3>Payment Information</h3>
                            <p>Bank Transfer</p>
                            <p><strong>Routing:</strong> 012345678</p>
                            <p><strong>Account:</strong> 1234567890</p>
                        </div>
                        
                        <div class="terms-section">
                            <h3>Terms</h3>
                            <p>Net 30 Days</p>
                            <p>Thank you for your business!</p>
                        </div>
                    </div>
                    
                    <div class="footer-right">
                        <div class="total-item">
                            <span class="total-label">Subtotal</span>
                            <span class="total-value">BDT ${invoice.subtotal.toFixed(2)}</span>
                        </div>
                        ${invoice.paid > 0 ? `
                        <div class="total-item">
                            <span class="total-label">Paid</span>
                            <span class="total-value">BDT ${invoice.paid.toFixed(2)}</span>
                        </div>
                        ` : ''}
                        <div class="total-grand">
                            <span class="total-label">Payable</span>
                            <span class="total-value">BDT ${invoice.payable.toFixed(2)}</span>
                        </div>
                        ${hasSignature ? `
                        <div class="signature-section">
                            <div class="signature-line"></div>
                            ${settings.ownerName ? `<p class="signature-name">${settings.ownerName}</p>` : ''}
                            ${settings.ownerTitle ? `<p class="signature-title">${settings.ownerTitle}</p>` : ''}
                        </div>
                        ` : `
                        <div class="signature-section">
                            <div class="signature-line"></div>
                            <p>Authorized Signature</p>
                        </div>
                        `}
                    </div>
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

    async deleteInvoice(invoiceId) {
        if (confirm('Are you sure you want to delete this invoice?')) {
            const invoices = Storage.get('invoices') || [];
            const filtered = invoices.filter(inv => inv.id !== invoiceId);
            await Storage.set('invoices', filtered);
            
            // Delete from database
            try {
                const API_BASE_URL = window.CONFIG?.API_BASE_URL || 'https://your-deployed-server-url.com/api';
                const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    console.log('Invoice deleted from database successfully');
                } else {
                    console.error('Failed to delete invoice from database');
                }
            } catch (error) {
                console.error('Error deleting invoice from database:', error);
            }
            
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
            tbody.innerHTML = '<tr><td colspan="6" class="no-data">No invoices found</td></tr>';
            return;
        }

        const sortedInvoices = invoices.slice().sort((a, b) => new Date(b.updatedAt || b.createdAt || b.date) - new Date(a.updatedAt || a.createdAt || a.date));

        tbody.innerHTML = sortedInvoices.map(inv => `
            <tr>
                <td><a href="#" class="invoice-link" data-id="${inv.id}">${inv.id}</a></td>
                <td>${inv.customerName}</td>
                <td>${this.formatDate(inv.date)}</td>
                <td>${this.formatDate(inv.updatedAt)}</td>
                <td><span class="status-badge status-${inv.status}">${inv.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-secondary edit-invoice-row-btn" data-invoice-id="${inv.id}">Edit</button>
                    ${inv.status === 'pending' 
                        ? `<button class="btn btn-sm btn-primary mark-paid-btn" data-invoice-id="${inv.id}">Mark as Paid</button>`
                        : `<span class="text-success">✓ Paid</span>`
                    }
                    <button class="btn btn-sm btn-danger delete-invoice-btn" data-invoice-id="${inv.id}">Delete</button>
                </td>
            </tr>
        `).join('');
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
        const invoicePreview = document.querySelector('.invoice-preview');
        if (!invoicePreview) return;

        // Clone the invoice preview
        const clone = invoicePreview.cloneNode(true);
        clone.id = 'temp-print-container';
        document.body.appendChild(clone);

        window.print();

        // Remove the clone after print
        setTimeout(() => {
            if (document.getElementById('temp-print-container')) {
                document.getElementById('temp-print-container').remove();
            }
        }, 1000);
    },

    downloadInvoice() {
        this.printInvoice();
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }
};

window.Invoice = Invoice;
