/**
 * PRASHANT Authentication Module
 * Google Sign-in / Sign-out functionality
 */

class PrashantAuth {
  constructor() {
    this.user = null;
    this.initializeAuthUI();
  }

  initializeAuthUI() {
    // Listen for auth state changes
    firebase.auth().onAuthStateChanged((user) => {
      this.user = user;
      this.updateAuthUI();
      
      if (user) {
        console.log(`✅ User logged in: ${user.displayName} (${user.email})`);
        this.saveUserToFirestore(user);
        this.showAppUI();
      } else {
        console.log("❌ User logged out");
        this.showLoginScreen();
      }
    });
  }

  /**
   * Google Sign-in
   */
  async signInWithGoogle() {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await firebase.auth().signInWithPopup(provider);
      console.log("✅ Google Sign-in successful:", result.user.email);
      return result.user;
    } catch (error) {
      console.error("❌ Google Sign-in error:", error);
      alert(`Login failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Sign-out
   */
  async signOut() {
    try {
      await firebase.auth().signOut();
      console.log("✅ Signed out successfully");
      return true;
    } catch (error) {
      console.error("❌ Sign-out error:", error);
      alert(`Sign-out failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Save user to Firestore (for accessing friends list, etc.)
   */
  async saveUserToFirestore(user) {
    try {
      const db = firebase.firestore();
      const userRef = db.collection('users').doc(user.uid);
      
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL || '',
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      };
      
      // Merge so we don't overwrite existing data
      await userRef.set(userData, { merge: true });
      console.log("✅ User saved to Firestore");
    } catch (error) {
      console.error("❌ Error saving user:", error);
    }
  }

  /**
   * Update UI based on auth state
   */
  updateAuthUI() {
    const loginSection = document.getElementById('loginSection');
    const userProfile = document.getElementById('userProfile');
    const userNameEl = document.getElementById('userName');
    const userEmailEl = document.getElementById('userEmail');
    const userPhotoEl = document.getElementById('userPhoto');

    if (this.user) {
      if (loginSection) loginSection.style.display = 'none';
      if (userProfile) {
        userProfile.style.display = 'flex';
        if (userNameEl) userNameEl.textContent = this.user.displayName || 'User';
        if (userEmailEl) userEmailEl.textContent = this.user.email;
        if (userPhotoEl && this.user.photoURL) {
          userPhotoEl.src = this.user.photoURL;
        }
      }
    } else {
      if (loginSection) loginSection.style.display = 'block';
      if (userProfile) userProfile.style.display = 'none';
    }
  }

  /**
   * Show login screen
   */
  showLoginScreen() {
    const appContainer = document.getElementById('appContainer');
    const loginScreen = document.getElementById('loginSection');
    
    if (appContainer) appContainer.style.display = 'none';
    if (loginScreen) loginScreen.style.display = 'block';
  }

  /**
   * Show app UI
   */
  showAppUI() {
    const appContainer = document.getElementById('appContainer');
    const loginScreen = document.getElementById('loginSection');
    
    if (appContainer) appContainer.style.display = 'block';
    if (loginScreen) loginScreen.style.display = 'none';
  }

  /**
   * Get current user
   */
  getUser() {
    return this.user;
  }

  /**
   * Get user ID
   */
  getUserId() {
    return this.user ? this.user.uid : null;
  }
}

// Initialize auth on page load
let prashantAuth = null;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      prashantAuth = new PrashantAuth();
    }, 500); // Wait for Firebase to initialize
  });
} else {
  setTimeout(() => {
    prashantAuth = new PrashantAuth();
  }, 500);
}
