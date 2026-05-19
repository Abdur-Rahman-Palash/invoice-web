const Auth = {
    currentUser: null,

    async init() {
        this.bindEvents();

        try {
            await window.firebaseAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
            this.observeAuthState();
        } catch (error) {
            this.showMessage(this.getErrorMessage(error), true);
            console.error("Auth init error:", error);
        }
    },

    getStorage() {
        return window.Storage;
    },

    getDashboard() {
        return window.Dashboard;
    },

    observeAuthState() {
        window.firebaseAuth.onAuthStateChanged((user) => {
            const storage = this.getStorage();

            if (user) {
                this.currentUser = {
                    id: user.uid,
                    name: user.displayName || user.email || "User",
                    email: user.email || "",
                    loginTime: new Date().toISOString()
                };

                if (storage) {
                    storage.set("currentUser", this.currentUser);
                }
                this.clearMessage();
                this.showApp();
            } else {
                this.currentUser = null;
                if (storage) {
                    storage.remove("currentUser");
                }
                this.showLogin();
            }
        });
    },

    bindEvents() {
        const loginForm = document.getElementById("login-form");
        const logoutBtn = document.getElementById("logout-btn");
        const signupBtn = document.getElementById("signup-btn");
        const googleSigninBtn = document.getElementById("google-signin-btn");

        if (loginForm) {
            loginForm.addEventListener("submit", (e) => this.handleLogin(e));
        }

        if (signupBtn) {
            signupBtn.addEventListener("click", () => this.handleSignup());
        }

        if (googleSigninBtn) {
            googleSigninBtn.addEventListener("click", () => this.handleGoogleSignIn());
        }

        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => this.handleLogout());
        }
    },

    getCredentials() {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        return { email, password };
    },

    async handleLogin(e) {
        e.preventDefault();
        const { email, password } = this.getCredentials();

        if (!email || !password) {
            this.showMessage("Enter your email and password.", true);
            return;
        }

        await this.runAuthAction(async () => {
            await window.firebaseAuth.signInWithEmailAndPassword(email, password);
            this.showMessage("Signed in successfully.");
        });
    },

    async handleSignup() {
        const { email, password } = this.getCredentials();

        if (!email || !password) {
            this.showMessage("Enter your email and password before creating an account.", true);
            return;
        }

        await this.runAuthAction(async () => {
            await window.firebaseAuth.createUserWithEmailAndPassword(email, password);
            this.showMessage("Account created successfully.");
        });
    },

    async handleGoogleSignIn() {
        await this.runAuthAction(async () => {
            await window.firebaseAuth.signInWithPopup(window.googleProvider);
            this.showMessage("Google sign-in successful.");
        });
    },

    async handleLogout() {
        await this.runAuthAction(async () => {
            await window.firebaseAuth.signOut();
        }, false);
    },

    async runAuthAction(action, showLoading = true) {
        try {
            if (showLoading) {
                this.showMessage("Please wait...");
            }
            await action();
        } catch (error) {
            this.showMessage(this.getErrorMessage(error), true);
            console.error("Authentication error:", error);
        }
    },

    getErrorMessage(error) {
        const messages = {
            "auth/email-already-in-use": "This email is already registered. Please sign in instead.",
            "auth/invalid-credential": "Invalid email or password.",
            "auth/invalid-email": "Enter a valid email address.",
            "auth/missing-password": "Password is required.",
            "auth/popup-closed-by-user": "Google sign-in was closed before completion.",
            "auth/too-many-requests": "Too many attempts. Please try again later.",
            "auth/unauthorized-domain": "This domain is not authorized in Firebase Authentication settings.",
            "auth/user-not-found": "No account found with this email.",
            "auth/weak-password": "Password must be at least 6 characters."
        };

        return messages[error.code] || error.message || "Authentication failed.";
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
        document.getElementById("login-page").classList.remove("hidden");
        document.getElementById("app-container").classList.add("hidden");
    },

    showApp() {
        document.getElementById("login-page").classList.add("hidden");
        document.getElementById("app-container").classList.remove("hidden");

        if (this.currentUser) {
            document.getElementById("user-name").textContent = this.currentUser.name;
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
