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
            tbody.innerHTML = '<tr><td colspan="5" class="no-data">No invoices yet</td></tr>';
            return;
        }

        // Get last 5 invoices
        const recentInvoices = invoices.slice(-5).reverse();

        tbody.innerHTML = recentInvoices.map(inv => {
            const isPaid = inv.status === 'paid';
            const statusClass = isPaid ? 'status-paid' : 'status-due';
            const statusText = isPaid ? 'Paid' : 'Due';
            const cursorStyle = isPaid ? 'default' : 'pointer';
            const dataAttribute = isPaid ? '' : `data-invoice-id="${inv.id}" data-clickable="true"`;

            return `
            <tr>
                <td>${inv.id}</td>
                <td>${inv.customerName}</td>
                <td>${this.formatDate(inv.date)}</td>
                <td>BDT ${(inv.payable || inv.grandTotal || 0).toFixed(2)}</td>
                <td><span class="status-badge ${statusClass}" style="cursor: ${cursorStyle}" ${dataAttribute}>${statusText}</span></td>
            </tr>
        `;
        }).join('');

        // Re-bind click events after rendering
        this.bindStatusBadgeClicks();
    },

    bindStatusBadgeClicks() {
        const recentInvoicesBody = document.getElementById('recent-invoices-body');
        if (!recentInvoicesBody) return;

        // Remove existing listener to avoid duplicates
        const newBody = recentInvoicesBody.cloneNode(true);
        recentInvoicesBody.parentNode.replaceChild(newBody, recentInvoicesBody);

        // Add click handler
        newBody.addEventListener('click', (e) => {
            const statusBadge = e.target.closest('.status-badge');
            if (statusBadge && statusBadge.dataset.clickable === 'true') {
                const invoiceId = statusBadge.dataset.invoiceId;
                console.log('Status badge clicked, invoice ID:', invoiceId);
                if (invoiceId && window.Invoice && window.Invoice.editInvoice) {
                    window.Invoice.editInvoice(invoiceId);
                } else {
                    console.error('Invoice module or editInvoice function not available');
                }
            }
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
