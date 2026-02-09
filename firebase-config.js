/**
 * Firebase Configuration for PRASHANT
 * Features: Google Auth, Real-time Chat, File Storage
 */

// Firebase config - REPLACE WITH YOUR OWN CREDENTIALS
const firebaseConfig = {
  apiKey: "AIzaSyC_YOUR_API_KEY_HERE",  // Get from Firebase Console
  authDomain: "prashant-app-xxxxx.firebaseapp.com",
  projectId: "prashant-app-xxxxx",
  storageBucket: "prashant-app-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxx"
};

// Initialize Firebase
let firebase_initialized = false;

async function initFirebase() {
  try {
    // Firebase is dynamically loaded via CDN in HTML
    firebase.initializeApp(firebaseConfig);
    firebase_initialized = true;
    console.log("✅ Firebase initialized successfully");
  } catch (error) {
    console.error("❌ Firebase initialization error:", error);
    firebase_initialized = false;
  }
}

// Auth instance getters
function getAuth() {
  return firebase.auth();
}

function getFirestore() {
  return firebase.firestore();
}

function getStorage() {
  return firebase.storage();
}

// Check if user is authenticated
function isUserAuthenticated() {
  return firebase.auth().currentUser !== null;
}

// Get current user
function getCurrentUser() {
  return firebase.auth().currentUser;
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFirebase);
} else {
  initFirebase();
}
