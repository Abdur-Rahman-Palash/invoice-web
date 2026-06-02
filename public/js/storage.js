// LocalStorage Utility Functions

const Storage = {
    // Get data from localStorage
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Error getting ${key} from localStorage:`, error);
            return null;
        }
    },

    // Set data to localStorage
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error setting ${key} to localStorage:`, error);
            return false;
        }
    },

    // Remove data from localStorage
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing ${key} from localStorage:`, error);
            return false;
        }
    },

    // Clear all data from localStorage
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    },

    // Initialize default data if not exists
    initializeDefaults() {
        // Initialize invoices array
        if (!this.get('invoices')) {
            this.set('invoices', []);
        }

        // Initialize products array
        if (!this.get('products')) {
            this.set('products', []);
        }

        // Initialize settings
        if (!this.get('settings')) {
            this.set('settings', {
                companyName: 'Your Company Name',
                companyAddress: 'Your Address',
                companyPhone: 'Your Phone',
                companyEmail: 'your@email.com',
                ownerName: '',
                ownerTitle: '',
                currency: 'USD',
                taxRate: 0
            });
        }
    }
};

// Initialize storage defaults
Storage.initializeDefaults();
window.Storage = Storage;
