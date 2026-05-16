// Authentication Module

const Auth = {
    currentUser: null,

    // Initialize auth
    init() {
        this.checkAuth();
        this.bindEvents();
    },

    // Check if user is authenticated
    checkAuth() {
        const user = Storage.get('currentUser');
        if (user) {
            this.currentUser = user;
            this.showApp();
        } else {
            this.showLogin();
        }
    },

    // Bind authentication events
    bindEvents() {
        const loginForm = document.getElementById('login-form');
        const logoutBtn = document.getElementById('logout-btn');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    },

    // Handle login
    handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username && password) {
            // For demo purposes, accept any credentials
            this.currentUser = {
                id: username,
                name: username,
                loginTime: new Date().toISOString()
            };

            Storage.set('currentUser', this.currentUser);
            this.showApp();
        }
    },

    // Handle logout
    handleLogout() {
        this.currentUser = null;
        Storage.remove('currentUser');
        this.showLogin();
    },

    // Show login page
    showLogin() {
        document.getElementById('login-page').classList.remove('hidden');
        document.getElementById('app-container').classList.add('hidden');
    },

    // Show main app
    showApp() {
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        
        if (this.currentUser) {
            document.getElementById('user-name').textContent = this.currentUser.name;
        }

        // Initialize dashboard
        Dashboard.init();
    }
};

// Initialize auth when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});
