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
        document.getElementById('total-invoices').textContent = invoices.length;

        // Total revenue
        const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
        document.getElementById('total-revenue').textContent = `BDT ${totalRevenue.toFixed(2)}`;

        // Pending payments
        const pendingPayments = invoices.filter(inv => inv.status === 'pending').length;
        document.getElementById('pending-payments').textContent = pendingPayments;

        // Total products
        document.getElementById('total-products').textContent = products.length;
    },

    renderRecentInvoices() {
        const invoices = Storage.get('invoices') || [];
        const tbody = document.getElementById('recent-invoices-body');
        
        if (invoices.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="no-data">No invoices yet</td></tr>';
            return;
        }

        // Get last 5 invoices
        const recentInvoices = invoices.slice(-5).reverse();

        tbody.innerHTML = recentInvoices.map(inv => `
            <tr>
                <td>${inv.id}</td>
                <td>${inv.customerName}</td>
                <td>${this.formatDate(inv.date)}</td>
                <td>BDT ${inv.grandTotal.toFixed(2)}</td>
                <td><span class="status-badge status-${inv.status}">${inv.status}</span></td>
            </tr>
        `).join('');
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
            month: 'short',
            day: 'numeric'
        });
    }
};

window.Dashboard = Dashboard;
