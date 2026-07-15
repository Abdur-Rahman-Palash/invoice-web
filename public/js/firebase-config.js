// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyChcTvRJ4UJViqnTjL5jZJwxcbPCwYTmYw",
    authDomain: "invoice-web-1ca37.firebaseapp.com",
    projectId: "invoice-web-1ca37",
    storageBucket: "invoice-web-1ca37.firebasestorage.app",
    messagingSenderId: "128410955818",
    appId: "1:128410955818:web:3de9feeb3bd4ce7e2a5353"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    window.firebaseApp = firebase.app();
    window.firebaseAuth = firebase.auth();
    window.googleProvider = new firebase.auth.GoogleAuthProvider();
    window.googleProvider.addScope('email');
    window.googleProvider.addScope('profile');
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Firebase initialization error:", error);
    window.firebaseAuth = null;
}
