// Payment Module

const Payment = {
    init() {
        this.updateStats();
        this.renderTransactions();
        this.bindEvents();
    },

    bindEvents() {
        const tbody = document.getElementById('transactions-body');
        if (tbody) {
            tbody.addEventListener('click', (e) => {
                if (e.target.classList.contains('mark-paid-btn')) {
                    const invoiceId = e.target.dataset.invoiceId;
                    this.markAsPaid(invoiceId);
                }
            });
        }
    },

    markAsPaid(invoiceId) {
        const invoices = Storage.get('invoices') || [];
        const invoice = invoices.find(inv => inv.id === invoiceId);

        if (invoice && invoice.status !== 'paid') {
            invoice.status = 'paid';
            invoice.paidAt = new Date().toISOString();
            invoice.updatedAt = new Date().toISOString();
            Storage.set('invoices', invoices);

            // Update all displays
            this.updateStats();
            this.renderTransactions();
            Dashboard.updateStats();
            Dashboard.renderRecentInvoices();
            Invoice.renderInvoicesTable();
        }
    },

    updateStats() {
        const invoices = Storage.get('invoices') || [];

        // Paid invoices
        const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
        document.getElementById('paid-invoices').textContent = paidInvoices;

        // Pending invoices
        const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length;
        document.getElementById('pending-invoices').textContent = pendingInvoices;

        // Total earnings
        const totalEarnings = invoices
            .filter(inv => inv.status === 'paid')
            .reduce((sum, inv) => sum + inv.grandTotal, 0);
        document.getElementById('total-earnings').textContent = `$${totalEarnings.toFixed(2)}`;
    },

    renderTransactions() {
        const invoices = Storage.get('invoices') || [];
        const tbody = document.getElementById('transactions-body');

        if (invoices.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="no-data">No transactions yet</td></tr>';
            return;
        }

        // Get last 10 invoices
        const recentInvoices = invoices.slice(-10).reverse();

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

window.Payment = Payment;
