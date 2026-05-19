const firebaseConfig = window.__FIREBASE_CONFIG__ || {};

firebase.initializeApp(firebaseConfig);

window.firebaseApp = firebase.app();
window.firebaseAuth = firebase.auth();
window.googleProvider = new firebase.auth.GoogleAuthProvider();
