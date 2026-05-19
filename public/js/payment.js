// Payment Module

const Payment = {
    init() {
        this.updateStats();
        this.renderTransactions();
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
        document.getElementById('total-earnings').textContent = `BDT ${totalEarnings.toFixed(2)}`;
    },

    renderTransactions() {
        const invoices = Storage.get('invoices') || [];
        const tbody = document.getElementById('transactions-body');

        if (invoices.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="no-data">No transactions yet</td></tr>';
            return;
        }

        // Get last 10 invoices
        const recentInvoices = invoices.slice(-10).reverse();

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

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
};
