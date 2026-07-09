// Database Storage Utility Functions (Neon Database via API)

// Use config file for API URL
const API_BASE_URL = window.CONFIG?.API_BASE_URL || 'https://your-deployed-server-url.com/api';

const Storage = {
    // Cache for local data
    cache: {
        invoices: [],
        products: [],
        settings: {
            companyName: 'Your Company Name',
            companyAddress: 'Your Address',
            companyPhone: 'Your Phone',
            companyEmail: 'your@email.com',
            ownerName: '',
            ownerTitle: '',
            currency: 'USD',
            taxRate: 0
        }
    },

    // Get data from cache (sync for compatibility)
    get(key) {
        return this.cache[key] || null;
    },

    // Set data to cache and database (async)
    async set(key, value) {
        this.cache[key] = value;
        
        try {
            if (key === 'invoices') {
                for (const invoice of value) {
                    await fetch(`${API_BASE_URL}/invoices`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(invoice)
                    });
                }
            }

            if (key === 'products') {
                await fetch(`${API_BASE_URL}/products`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(value)
                });
            }
        } catch (error) {
            console.error(`Error saving ${key} to database:`, error);
        }
        
        return true;
    },

    // Remove data from cache and database (async)
    async remove(key) {
        this.cache[key] = null;
        return true;
    },

    // Clear all data
    clear() {
        this.cache = {
            invoices: [],
            products: [],
            settings: {
                companyName: 'Your Company Name',
                companyAddress: 'Your Address',
                companyPhone: 'Your Phone',
                companyEmail: 'your@email.com',
                ownerName: '',
                ownerTitle: '',
                currency: 'USD',
                taxRate: 0
            }
        };
        return true;
    },

    // Initialize default data
    async initializeDefaults() {
        // Load invoices from database
        try {
            const response = await fetch(`${API_BASE_URL}/invoices`);
            const data = await response.json();
            if (data.success) {
                this.cache.invoices = data.data;
                console.log('Loaded invoices from database:', this.cache.invoices.length);
            } else {
                console.error('Failed to load invoices:', data.error);
                if (!this.cache.invoices) {
                    this.cache.invoices = [];
                }
            }
        } catch (error) {
            console.error('Error loading invoices from database:', error);
            if (!this.cache.invoices) {
                this.cache.invoices = [];
            }
        }

        // Load products from database
        try {
            const response = await fetch(`${API_BASE_URL}/products`);
            const data = await response.json();
            if (data.success) {
                this.cache.products = data.data;
                console.log('Loaded products from database:', this.cache.products.length);
            } else {
                console.error('Failed to load products:', data.error);
                if (!this.cache.products) {
                    this.cache.products = [];
                }
            }
        } catch (error) {
            console.error('Error loading products from database:', error);
            if (!this.cache.products) {
                this.cache.products = [];
            }
        }

        // Initialize invoices array if missing
        if (!this.cache.invoices) {
            this.cache.invoices = [];
        }

        // Initialize products array if missing
        if (!this.cache.products) {
            this.cache.products = [];
        }

        // Initialize settings
        if (!this.cache.settings) {
            this.cache.settings = {
                companyName: 'Your Company Name',
                companyAddress: 'Your Address',
                companyPhone: 'Your Phone',
                companyEmail: 'your@email.com',
                ownerName: '',
                ownerTitle: '',
                currency: 'USD',
                taxRate: 0
            };
        }
    },

    // Refresh data from database
    async refresh() {
        try {
            const [invoiceResponse, productResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/invoices`),
                fetch(`${API_BASE_URL}/products`)
            ]);

            const invoicesData = await invoiceResponse.json();
            if (invoicesData.success) {
                this.cache.invoices = invoicesData.data;
            }

            const productsData = await productResponse.json();
            if (productsData.success) {
                this.cache.products = productsData.data;
            }
        } catch (error) {
            console.error('Error refreshing data from database:', error);
        }
    }
};

window.Storage = Storage;
