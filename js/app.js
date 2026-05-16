// Main Application Module

const App = {
    currentPage: 'dashboard',

    init() {
        this.bindNavigation();
        this.bindMobileMenu();
        this.bindDiscountTaxEvents();
        
        // Initialize all modules
        Invoice.init();
        Product.init();
    },

    bindNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.dataset.page;
                this.navigateTo(page);
            });
        });
    },

    bindMobileMenu() {
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }
    },

    bindDiscountTaxEvents() {
        const discountInput = document.getElementById('discount');
        const taxInput = document.getElementById('tax');

        if (discountInput) {
            discountInput.addEventListener('input', () => Invoice.calculateTotals());
        }

        if (taxInput) {
            taxInput.addEventListener('input', () => Invoice.calculateTotals());
        }
    },

    navigateTo(page) {
        // Hide all pages
        document.querySelectorAll('.content-page').forEach(p => p.classList.add('hidden'));

        // Show selected page
        const pageElement = document.getElementById(`${page}-page`);
        if (pageElement) {
            pageElement.classList.remove('hidden');
        }

        // Update nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === page) {
                link.classList.add('active');
            }
        });

        // Update current page
        this.currentPage = page;

        // Initialize page-specific logic
        switch(page) {
            case 'dashboard':
                Dashboard.updateStats();
                Dashboard.renderRecentInvoices();
                break;
            case 'invoices':
                Invoice.renderInvoicesTable();
                break;
            case 'payments':
                Payment.updateStats();
                Payment.renderTransactions();
                break;
            case 'store':
                Product.renderProducts();
                break;
            case 'create-invoice':
                Invoice.resetForm();
                Invoice.generateInvoiceId();
                Invoice.addProductRow();
                document.getElementById('invoice-date').value = new Date().toISOString().split('T')[0];
                break;
        }

        // Close mobile menu
        document.querySelector('.nav-menu').classList.remove('active');
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
