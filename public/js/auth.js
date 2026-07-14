const Auth = {
    currentUser: null,
    isSignupMode: false,

    async init() {
        this.bindEvents();

        if (!window.firebaseAuth) {
            console.log("Running in demo mode - no authentication needed");
            // Auto login in demo mode (as owner for testing)
            this.currentUser = {
                id: "demo-user-123",
                name: "Demo Owner",
                email: "abdurrahmanpalashbd@gmail.com",
                role: "owner",
                loginTime: new Date().toISOString()
            };
            const storage = this.getStorage();
            if (storage) storage.set("currentUser", this.currentUser);
            this.showApp();
            return;
        }

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
                // Define owner email (you can change this to your owner email)
                const ownerEmail = "abdurrahmanpalashbd@gmail.com";
                const isOwner = user.email === ownerEmail;

                this.currentUser = {
                    id: user.uid,
                    name: user.displayName || user.email || "User",
                    email: user.email || "",
                    role: isOwner ? "owner" : "user",
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
        const signinBtn = document.getElementById("signin-btn");
        const googleSigninBtn = document.getElementById("google-signin-btn");

        if (loginForm) {
            loginForm.addEventListener("submit", (e) => {
                if (this.isSignupMode) {
                    this.handleSignup(e);
                } else {
                    this.handleLogin(e);
                }
            });
        }

        if (signupBtn) {
            signupBtn.addEventListener("click", () => this.toggleSignupMode(true));
        }

        if (signinBtn) {
            signinBtn.addEventListener("click", () => this.toggleSignupMode(false));
        }

        if (googleSigninBtn) {
            googleSigninBtn.addEventListener("click", () => this.handleGoogleSignIn());
        }

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
        const fullName = document.getElementById("full-name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
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

        if (!window.firebaseAuth) {
            // Demo mode login
            this.currentUser = {
                id: "demo-user-123",
                name: email.split('@')[0] || "Demo User",
                email: email || "demo@example.com",
                role: "owner",
                loginTime: new Date().toISOString()
            };
            const storage = this.getStorage();
            if (storage) storage.set("currentUser", this.currentUser);
            this.showApp();
            return;
        }

        if (!email || !password) {
            this.showMessage("Enter your email and password.", true);
            return;
        }

        await this.runAuthAction(async () => {
            console.log("=== Starting Login Flow ===");
            console.log("Email:", email);

            // Use only Firebase Authentication for login
            console.log("Attempting Firebase Auth login...");
            const userCredential = await window.firebaseAuth.signInWithEmailAndPassword(email, password);
            console.log("Firebase Auth login successful");
            console.log("User ID:", userCredential.user.uid);
            console.log("User email:", userCredential.user.email);
            console.log("Display name:", userCredential.user.displayName);

            console.log("=== Login Flow Complete ===");
            this.showMessage("Signed in successfully.");
        });
    },

    async handleSignup(e) {
        if (e) e.preventDefault();
        const { fullName, email, password } = this.getCredentials();

        if (!window.firebaseAuth) {
            // Demo mode signup
            this.currentUser = {
                id: "demo-user-123",
                name: fullName || email.split('@')[0] || "Demo User",
                email: email || "demo@example.com",
                role: "owner",
                loginTime: new Date().toISOString()
            };
            const storage = this.getStorage();
            if (storage) storage.set("currentUser", this.currentUser);
            this.showApp();
            return;
        }

        if (!fullName || !email || !password) {
            this.showMessage("Please fill in all fields (Full Name, Email, Password).", true);
            return;
        }

        const passwordError = this.validatePassword(password);
        if (passwordError) {
            this.showMessage(passwordError, true);
            return;
        }

        await this.runAuthAction(async () => {
            console.log("=== Starting Registration Flow ===");
            console.log("Email:", email);
            console.log("Full Name:", fullName);

            // Step 1: Create Firebase Authentication user
            console.log("Step 1: Creating Firebase Auth user...");
            const userCredential = await window.firebaseAuth.createUserWithEmailAndPassword(email, password);
            console.log("Firebase Auth user created successfully");
            console.log("User ID:", userCredential.user.uid);
            console.log("User email:", userCredential.user.email);

            // Step 2: Update user profile with display name
            console.log("Step 2: Updating user profile with display name...");
            await userCredential.user.updateProfile({ displayName: fullName });
            console.log("Display name updated successfully");

            // Step 3: Sign out the user (they need to login again)
            console.log("Step 3: Signing out user for manual login...");
            await window.firebaseAuth.signOut();
            console.log("User signed out successfully");

            console.log("=== Registration Flow Complete ===");
            this.showMessage("Account created successfully. Please sign in with your credentials.");

            // Switch to login mode after successful signup
            setTimeout(() => {
                this.toggleSignupMode(false);
                this.clearMessage();
            }, 2000);
        });
    },

    async handleGoogleSignIn() {
        if (!window.firebaseAuth) {
            // Demo mode Google sign-in
            this.currentUser = {
                id: "demo-google-user-123",
                name: "Demo Google User",
                email: "demo-google@example.com",
                loginTime: new Date().toISOString()
            };
            const storage = this.getStorage();
            if (storage) storage.set("currentUser", this.currentUser);
            this.showApp();
            return;
        }

        await this.runAuthAction(async () => {
            await window.firebaseAuth.signInWithPopup(window.googleProvider);
            this.showMessage("Google sign-in successful.");
        });
    },

    async handleLogout() {
        if (!window.firebaseAuth) {
            // Demo mode logout
            this.currentUser = null;
            const storage = this.getStorage();
            if (storage) storage.remove("currentUser");
            this.showLogin();
            return;
        }

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
            console.error("Authentication error:", error);
            console.error("Error code:", error.code);
            console.error("Error message:", error.message);
            console.error("Full error object:", JSON.stringify(error, null, 2));

            // Try to get more details from the error
            if (error.customData) {
                console.error("Custom error data:", JSON.stringify(error.customData, null, 2));
            }

            this.showMessage(this.getErrorMessage(error), true);
        }
    },

    getErrorMessage(error) {
        console.error("Firebase Auth Error:", error.code, error.message);
        const messages = {
            "auth/email-already-in-use": "This email is already registered. If you registered with Google, please use Google Sign-In. Otherwise, please sign in with your password.",
            "auth/invalid-credential": "Invalid email or password. If you registered with Google, please use Google Sign-In instead.",
            "auth/invalid-email": "Enter a valid email address.",
            "auth/missing-password": "Password is required.",
            "auth/popup-closed-by-user": "Google sign-in was closed before completion.",
            "auth/too-many-requests": "Too many attempts. Please try again later.",
            "auth/unauthorized-domain": "This domain is not authorized in Firebase Authentication settings.",
            "auth/user-not-found": "No account found with this email. Please create an account first.",
            "auth/weak-password": "Password must be at least 6 characters.",
            "auth/account-exists-with-different-credential": "This email is registered with a different authentication method. Please try signing in with Google.",
            "auth/wrong-password": "Incorrect password. Please try again.",
            "auth/operation-not-allowed": "Email/Password authentication is not enabled. Please enable it in Firebase Console."
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
