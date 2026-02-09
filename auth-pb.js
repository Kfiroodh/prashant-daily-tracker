/**
 * Simple PocketBase auth adapter for PRASHANT
 * - Uses email + password (adds `authPassword` input to UI)
 * - Creates account if not exists
 */

class PrashantAuthPB {
  constructor() {
    this.user = null;
    this.init();
  }

  init() {
    // Wire UI
    const emailBtn = document.getElementById('emailSignInBtn');
    if (emailBtn) {
      emailBtn.addEventListener('click', () => this.signInWithEmail());
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.signOut());
    }

    // If already authenticated in pb, restore UI
    if (isPBAuthenticated()) {
      this.user = getPBCurrentUser();
      this.onLogin();
    }
  }

  async signInWithEmail() {
    const email = (document.getElementById('authEmail')||{}).value?.trim();
    const password = (document.getElementById('authPassword')||{}).value || '';
    const name = (document.getElementById('authName')||{}).value?.trim() || '';

    if (!email || !password) {
      alert('कृपया ईमेल और पासवर्ड दर्ज करें');
      return;
    }

    try {
      // Try to auth
      const authData = await pb.collection('users').authWithPassword(email, password);
      this.user = authData.record || authData.model || pb.authStore.model;
      console.log('✅ PB sign-in successful', this.user.email);
      this.onLogin();
      return this.user;
    } catch (err) {
      // If user not found, create account
      if (err?.status === 400 || err?.data?.data) {
        // Attempt signup
        try {
          const created = await pb.collection('users').create({
            email: email,
            password: password,
            passwordConfirm: password,
            name: name || email.split('@')[0]
          });
          // After create, authenticate
          const authData = await pb.collection('users').authWithPassword(email, password);
          this.user = authData.record || authData.model || pb.authStore.model;
          console.log('✅ PB account created and signed in', this.user.email);
          this.onLogin();
          return this.user;
        } catch (createErr) {
          console.error('❌ PB signup error', createErr);
          alert('Signup failed: ' + (createErr?.message || createErr));
          return null;
        }
      }

      console.error('❌ PB sign-in error', err);
      alert('Login failed: ' + (err?.message || err));
      return null;
    }
  }

  async signOut() {
    try {
      pb.authStore.clear();
      this.user = null;
      // reload to reset state
      window.location.reload();
    } catch (err) {
      console.error('❌ PB sign-out error', err);
      alert('Sign-out failed');
    }
  }

  onLogin() {
    // Update UI and initialize app
    const user = this.user || getPBCurrentUser();
    if (!user) return;

    // Create a minimal user object compatible with existing app
    const appUser = {
      uid: user.id || user._id || user.id,
      email: user.email,
      displayName: user.name || user.displayName || user.email.split('@')[0],
      photoURL: user.avatar || ''
    };

    // If app is ready, use its methods
    if (window.prashantApp) {
      window.prashantApp.user = appUser;
      window.prashantApp.showMainApp(appUser);
    } else {
      // Ensure PrashantApp initializes
      if (typeof initializePrashantApp === 'function') initializePrashantApp();
      // small delay then show
      setTimeout(() => {
        if (window.prashantApp) {
          window.prashantApp.user = appUser;
          window.prashantApp.showMainApp(appUser);
        }
      }, 500);
    }
  }
}

// Instantiate on load
let prashantAuthPB = null;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { prashantAuthPB = new PrashantAuthPB(); });
} else {
  prashantAuthPB = new PrashantAuthPB();
}
