// Main Application Module

const App = {
    currentPage: 'dashboard',
    pageHistory: [],

    init() {
        this.bindNavigation();
        this.bindMobileMenu();
        this.bindDiscountTaxEvents();
        this.bindSettingsEvents();
        this.insertBackButtons();
        
        // Initialize all modules
        Invoice.init();
        Product.init();
    },

    insertBackButtons() {
        document.querySelectorAll('.content-page .page-header').forEach(header => {
            if (!header.querySelector('.back-button')) {
                header.insertAdjacentHTML('afterbegin', `
                    <button type="button" class="btn btn-outline back-button hidden" onclick="App.goBack()">
                        Back
                    </button>
                `);
            }
        });
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

    bindSettingsEvents() {
        const settingsBtn = document.getElementById('settings-btn');
        const closeSettingsModal = document.getElementById('close-settings-modal');
        const cancelSettings = document.getElementById('cancel-settings');
        const saveSettings = document.getElementById('save-settings');

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.openSettings());
        }

        if (closeSettingsModal) {
            closeSettingsModal.addEventListener('click', () => this.closeSettings());
        }

        if (cancelSettings) {
            cancelSettings.addEventListener('click', () => this.closeSettings());
        }

        if (saveSettings) {
            saveSettings.addEventListener('click', () => this.saveSettings());
        }
    },

    openSettings() {
        const settings = Storage.get('settings') || {};
        
        document.getElementById('company-name').value = settings.companyName || '';
        document.getElementById('company-address').value = settings.companyAddress || '';
        document.getElementById('company-phone').value = settings.companyPhone || '';
        document.getElementById('company-email').value = settings.companyEmail || '';
        document.getElementById('owner-name').value = settings.ownerName || '';
        document.getElementById('owner-title').value = settings.ownerTitle || '';
        
        document.getElementById('settings-modal').classList.remove('hidden');
    },

    closeSettings() {
        document.getElementById('settings-modal').classList.add('hidden');
    },

    saveSettings() {
        const settings = {
            companyName: document.getElementById('company-name').value,
            companyAddress: document.getElementById('company-address').value,
            companyPhone: document.getElementById('company-phone').value,
            companyEmail: document.getElementById('company-email').value,
            ownerName: document.getElementById('owner-name').value,
            ownerTitle: document.getElementById('owner-title').value,
            currency: 'USD',
            taxRate: 0
        };

        Storage.set('settings', settings);
        this.closeSettings();
    },

    navigateTo(page, addToHistory = true) {
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

        // Update current page and history
        if (addToHistory && this.currentPage && this.currentPage !== page) {
            this.pageHistory.push(this.currentPage);
        }
        this.currentPage = page;
        this.updateBackButton();

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
        }

        // Close mobile menu
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            navMenu.classList.remove('active');
        }
    },

    goBack() {
        const previousPage = this.pageHistory.pop();
        if (previousPage) {
            this.navigateTo(previousPage, false);
        } else {
            this.navigateTo('dashboard', false);
        }
    },

    updateBackButton() {
        const backButtons = document.querySelectorAll('.back-button');
        const showBack = this.currentPage && this.currentPage !== 'dashboard' && this.pageHistory.length > 0;
        backButtons.forEach(button => {
            if (showBack) {
                button.classList.remove('hidden');
            } else {
                button.classList.add('hidden');
            }
        });
    }
};

window.App = App;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
