const firebaseConfig = window.__FIREBASE_CONFIG__ || {};

// Check if configuration is missing or still contains placeholders
const isConfigValid = firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('%');

if (isConfigValid) {
    try {
        firebase.initializeApp(firebaseConfig);
        window.firebaseApp = firebase.app();
        window.firebaseAuth = firebase.auth();
        window.googleProvider = new firebase.auth.GoogleAuthProvider();
        console.log("Firebase initialized successfully");
    } catch (error) {
        console.error("Firebase initialization error:", error);
    }
} else {
    console.log("Firebase not configured - running in demo mode");
    window.firebaseAuth = null;
}
