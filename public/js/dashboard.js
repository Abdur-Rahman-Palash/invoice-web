// Dashboard Module

const Dashboard = {
    init() {
        this.updateStats();
        this.renderRecentInvoices();
        this.bindEvents();
    },

    updateStats() {
        const invoices = Storage.get('invoices') || [];
        const products = Storage.get('products') || [];

        // Total invoices
        const totalInvoicesEl = document.getElementById('total-invoices');
        if (totalInvoicesEl) {
            totalInvoicesEl.textContent = invoices.length;
        }

        // Total products
        const totalProductsEl = document.getElementById('total-products');
        if (totalProductsEl) {
            totalProductsEl.textContent = products.length;
        }
    },

    renderRecentInvoices() {
        const invoices = Storage.get('invoices') || [];
        const tbody = document.getElementById('recent-invoices-body');
        
        if (!tbody) return;
        
        if (invoices.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="no-data">No invoices yet</td></tr>';
            return;
        }

        // Get last 5 invoices
        const recentInvoices = invoices.slice(-5).reverse();

        tbody.innerHTML = recentInvoices.map(inv => `
            <tr>
                <td>${inv.id}</td>
                <td>${inv.customerName}</td>
                <td>${this.formatDate(inv.date)}</td>
                <td>$${inv.grandTotal.toFixed(2)}</td>
                <td><span class="status-badge status-${inv.status}">${inv.status}</span></td>
                <td>
                    ${inv.status === 'pending' 
                        ? `<button class="btn btn-sm btn-primary mark-paid-btn" data-invoice-id="${inv.id}">Mark as Paid</button>`
                        : `<span class="text-success">✓ Paid</span>`
                    }
                </td>
            </tr>
        `).join('');

        document.querySelectorAll('.mark-paid-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                Payment.markAsPaid(e.target.dataset.invoiceId);
            });
        });
    },

    bindEvents() {
        // Quick action buttons
        const actionButtons = document.querySelectorAll('.action-btn');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleQuickAction(action);
            });
        });
    },

    handleQuickAction(action) {
        switch(action) {
            case 'create-invoice':
                Invoice.openCreateInvoice();
                break;
            case 'view-invoices':
                App.navigateTo('invoices');
                break;
            case 'add-product':
                App.navigateTo('store');
                Product.openAddModal();
                break;
            case 'print-report':
                window.print();
                break;
        }
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

window.Dashboard = Dashboard;
