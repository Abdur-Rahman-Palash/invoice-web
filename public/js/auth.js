const Auth = {
    currentUser: null,
    isSignupMode: false,
    apiBase: window.CONFIG?.API_BASE_URL || 'http://localhost:3000/api',

    async init() {
        this.bindEvents();
        this.checkSession();
        this.initFirebaseAuth();
    },

    initFirebaseAuth() {
        if (window.firebaseAuth) {
            window.firebaseAuth.onAuthStateChanged((user) => {
                if (user) {
                    this.handleFirebaseUser(user);
                } else {
                    console.log('Firebase user signed out');
                }
            });
        }
    },

    async handleFirebaseUser(firebaseUser) {
        try {
            const idToken = await firebaseUser.getIdToken();
            const response = await fetch(`${this.apiBase}/auth/firebase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    idToken,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0]
                })
            });

            const result = await response.json();
            if (result.success) {
                this.currentUser = result.data.user;
                localStorage.setItem('sessionId', result.data.sessionId);
                localStorage.setItem('sessionToken', result.data.sessionToken);
                
                const storage = this.getStorage();
                if (storage) {
                    storage.set("currentUser", this.currentUser);
                }
                
                this.showApp();
            } else {
                alert('Authentication failed: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Firebase auth error:', error);
            alert('Authentication failed. Please try again.');
        }
    },

    async signInWithGoogle() {
        if (!window.firebaseAuth) {
            alert('Firebase is not configured. Please set up Firebase configuration.');
            return;
        }

        try {
            const result = await window.firebaseAuth.signInWithPopup(window.googleProvider);
            await this.handleFirebaseUser(result.user);
        } catch (error) {
            console.error('Google sign-in error:', error);
            if (error.code === 'auth/popup-blocked') {
                alert('Please allow popups for this site to use Google Sign-In.');
            } else if (error.code === 'auth/cancelled-popup-request') {
                console.log('Google sign-in cancelled by user');
            } else {
                alert('Google Sign-In failed: ' + error.message);
            }
        }
    },

    getStorage() {
        return window.Storage;
    },

    getDashboard() {
        return window.Dashboard;
    },

    async checkSession() {
        const sessionId = localStorage.getItem('sessionId');
        const sessionToken = localStorage.getItem('sessionToken');

        if (sessionId && sessionToken) {
            try {
                const response = await fetch(`${this.apiBase}/auth/session?sessionId=${sessionId}&token=${sessionToken}`);

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        this.currentUser = result.data.user;
                        const storage = this.getStorage();
                        if (storage) {
                            storage.set("currentUser", this.currentUser);
                        }
                        this.showApp();
                        return;
                    }
                }
            } catch (error) {
                console.error('Session validation error:', error);
            }
        }

        this.showLogin();
    },

    bindEvents() {
        const loginForm = document.getElementById("login-form");
        const registerForm = document.getElementById("register-form");
        const logoutBtn = document.getElementById("logout-btn");
        const googleSignInBtn = document.getElementById("google-signin-btn");

        // Handle login form submission
        if (loginForm) {
            loginForm.addEventListener("submit", (e) => {
                this.handleLogin(e);
            });
        }

        // Handle register form submission
        if (registerForm) {
            registerForm.addEventListener("submit", (e) => {
                this.handleSignup(e);
            });
        }

        // Handle Google Sign In
        if (googleSignInBtn) {
            googleSignInBtn.addEventListener("click", () => this.signInWithGoogle());
        }

        // Handle logout
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => this.handleLogout());
        }
    },

    toggleSignupMode(isSignup) {
        this.isSignupMode = isSignup;
        const nameGroup = document.getElementById("name-group");
        const signupBtn = document.getElementById("signup-btn");
        const signinBtn = document.getElementById("signin-btn");
        const formTitle = document.querySelector(".login-header h1");

        if (isSignup) {
            nameGroup.style.display = "block";
            signupBtn.style.display = "none";
            signinBtn.style.display = "block";
            signinBtn.textContent = "Sign In";
            formTitle.textContent = "Create Account";
        } else {
            nameGroup.style.display = "none";
            signupBtn.style.display = "block";
            signinBtn.style.display = "none";
            formTitle.textContent = "Office Management";
        }

        this.clearMessage();
    },

    getCredentials() {
        const fullNameElement = document.getElementById("full-name");
        const emailElement = document.getElementById("email");
        const passwordElement = document.getElementById("password");

        const fullName = fullNameElement ? fullNameElement.value.trim() : '';
        const email = emailElement ? emailElement.value.trim() : '';
        const password = passwordElement ? passwordElement.value : '';

        return { fullName, email, password };
    },

    validatePassword(password) {
        // Password must be at least 6 characters
        if (password.length < 6) {
            return "Password must be at least 6 characters";
        }
        return null;
    },

    async handleLogin(e) {
        e.preventDefault();
        const { email, password } = this.getCredentials();

        if (!email || !password) {
            this.showMessage("Enter your email and password.", true);
            return;
        }

        try {
            console.log('Attempting login with:', { email });
            const response = await fetch(`${this.apiBase}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            console.log('Login response status:', response.status);
            const result = await response.json();
            console.log('Login result:', result);

            if (result.success) {
                // Save session
                localStorage.setItem('sessionId', result.data.session.id);
                localStorage.setItem('sessionToken', result.data.session.token);

                this.currentUser = result.data.user;
                const storage = this.getStorage();
                if (storage) {
                    storage.set("currentUser", this.currentUser);
                }

                this.showMessage("Signed in successfully. Redirecting...");
                // Redirect to main app
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                this.showMessage(result.error || "Login failed", true);
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage("Login failed. Please try again.", true);
        }
    },

    async handleSignup(e) {
        if (e) e.preventDefault();
        const { fullName, email, password } = this.getCredentials();

        if (!fullName || !email || !password) {
            this.showMessage("Please fill in all fields (Full Name, Email, Password).", true);
            return;
        }

        const passwordError = this.validatePassword(password);
        if (passwordError) {
            this.showMessage(passwordError, true);
            return;
        }

        try {
            console.log('Attempting registration with:', { name: fullName, email });
            const response = await fetch(`${this.apiBase}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: fullName, email, password })
            });

            console.log('Registration response status:', response.status);
            const result = await response.json();
            console.log('Registration result:', result);

            if (result.success) {
                this.showMessage("Account created successfully. Redirecting to login...");
                // Redirect to login page after successful signup
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                this.showMessage(result.error || "Registration failed", true);
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showMessage("Registration failed. Please try again.", true);
        }
    },

    async handleLogout() {
        const sessionId = localStorage.getItem('sessionId');

        if (sessionId) {
            try {
                await fetch(`${this.apiBase}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ sessionId })
                });
            } catch (error) {
                console.error('Logout error:', error);
            }
        }

        // Clear session
        localStorage.removeItem('sessionId');
        localStorage.removeItem('sessionToken');

        this.currentUser = null;
        const storage = this.getStorage();
        if (storage) storage.remove("currentUser");
        this.showLogin();
    },

    showMessage(message, isError = false) {
        const messageBox = document.getElementById("auth-message");
        if (!messageBox) return;

        messageBox.textContent = message;
        messageBox.classList.remove("hidden", "auth-message-error", "auth-message-success");
        messageBox.classList.add(isError ? "auth-message-error" : "auth-message-success");
    },

    clearMessage() {
        const messageBox = document.getElementById("auth-message");
        if (!messageBox) return;

        messageBox.textContent = "";
        messageBox.classList.add("hidden");
        messageBox.classList.remove("auth-message-error", "auth-message-success");
    },

    showLogin() {
        // Redirect to login page if not already there
        if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('register.html')) {
            window.location.href = 'login.html';
        }
    },

    showApp() {
        // Redirect to main app if not already there
        if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
            window.location.href = 'index.html';
            return;
        }

        if (this.currentUser) {
            document.getElementById("user-name").textContent = this.currentUser.name;
        }

        // Hide Settings button for non-owner users
        const settingsBtn = document.getElementById("settings-btn");
        if (settingsBtn) {
            if (this.currentUser && this.currentUser.role === "owner") {
                settingsBtn.style.display = "flex";
            } else {
                settingsBtn.style.display = "none";
            }
        }

        const dashboard = this.getDashboard();
        if (dashboard) {
            dashboard.init();
        }
    }
};

window.Auth = Auth;

document.addEventListener("DOMContentLoaded", () => {
    Auth.init();
});
