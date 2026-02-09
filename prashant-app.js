/**
 * PRASHANT Integration Module
 * Connects all features: Tracker, Chat, Share, Friends
 */

class PrashantApp {
  constructor() {
    this.user = null;
    this.initializeApp();
  }

  async initializeApp() {
    this.setupAuthUI();
    this.setupTabNavigation();
    this.setupEventListeners();
  }

  /**
   * Setup Authentication UI
   */
  setupAuthUI() {
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    if (googleSignInBtn) {
      googleSignInBtn.addEventListener('click', () => this.signInWithGoogle());
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }

    // Auth state listener
    firebase.auth().onAuthStateChanged((user) => {
      this.user = user;
      if (user) {
        this.showMainApp(user);
      } else {
        this.showAuthScreen();
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
      console.log('✅ Signed in:', result.user.email);
      return result.user;
    } catch (error) {
      console.error('❌ Sign-in error:', error);
      alert(`Login failed: ${error.message}`);
    }
  }

  /**
   * Logout
   */
  async logout() {
    if(confirm('क्या आप सुनिश्चित हैं?')) {
      try {
        await firebase.auth().signOut();
        console.log('✅ Logged out');
      } catch (error) {
        console.error('❌ Logout error:', error);
      }
    }
  }

  /**
   * Show Auth Screen
   */
  showAuthScreen() {
    const authScreen = document.getElementById('authScreen');
    const mainApp = document.getElementById('mainApp');

    if (authScreen) authScreen.classList.add('active-screen');
    if (mainApp) mainApp.classList.remove('active-screen');
  }

  /**
   * Show Main App
   */
  showMainApp(user) {
    const authScreen = document.getElementById('authScreen');
    const mainApp = document.getElementById('mainApp');

    if (authScreen) authScreen.classList.remove('active-screen');
    if (mainApp) mainApp.classList.add('active-screen');

    // Update user info
    document.getElementById('userName').textContent = user.displayName || 'User';
    document.getElementById('menuUserName').textContent = user.displayName || 'User';
    document.getElementById('menuUserEmail').textContent = user.email || '';

    // Initialize features
    this.initializeTracking(user);
    this.initializeChatFeature(user);
    this.initializeFriendsFeature(user);
    this.initializeGroupChatFeature(user);
    this.initializeSharingFeature(user);
  }

  /**
   * Setup Tab Navigation
   */
  setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;

        // Remove active class
        tabButtons.forEach((b) => b.classList.remove('active'));
        tabContents.forEach((c) => c.classList.remove('active'));

        // Add active class
        btn.classList.add('active');
        document.getElementById(tabName + 'Tab').classList.add('active');
      });
    });
  }

  /**
   * Initialize Tracking Feature
   */
  initializeTracking(user) {
    // Already handled by app.js
    // This is called to ensure proper initialization
    renderHistory();
  }

  /**
   * Initialize Chat Feature
   */
  initializeChatFeature(user) {
    if (typeof ChatManager !== 'undefined') {
      if (!window.chatManager) {
        window.chatManager = new ChatManager(user);
      }
    }
  }

  /**
   * Initialize Friends Feature
   */
  initializeFriendsFeature(user) {
    if (typeof FriendsManager !== 'undefined') {
      if (!window.friendsManager) {
        window.friendsManager = new FriendsManager(user);
      }
    }
  }

  /**
   * Initialize Group Chat Feature
   */
  initializeGroupChatFeature(user) {
    if (typeof GroupChatManager !== 'undefined') {
      if (!window.groupChatManager) {
        window.groupChatManager = new GroupChatManager(user);
      }
    }
  }

  /**
   * Initialize Sharing Feature
   */
  initializeSharingFeature(user) {
    if (typeof ShareManager !== 'undefined') {
      if (!window.shareManager) {
        window.shareManager = new ShareManager(user);
      }
    }
  }

  /**
   * Load Friends List
   */
  async loadFriendsList(user) {
    try {
      const db = firebase.firestore();
      const usersSnapshot = await db.collection('users').get();
      const friendsList = document.getElementById('friendsList');

      if (!friendsList) return;

      friendsList.innerHTML = '';

      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.uid !== user.uid) {
          const friendEl = document.createElement('div');
          friendEl.className = 'friend-item';
          friendEl.innerHTML = `
            <div class="friend-info">
              <div class="friend-name">${userData.displayName || 'User'}</div>
              <div class="friend-email">${userData.email}</div>
            </div>
            <button class="btn-secondary" onclick="window.prashantApp.openChat('${userData.uid}', '${userData.displayName}')">
              💬 Chat
            </button>
          `;
          friendsList.appendChild(friendEl);
        }
      });

    } catch (error) {
      console.error('❌ Error loading friends:', error);
    }
  }

  /**
   * Open Chat with Friend
   */
  openChat(friendId, friendName) {
    const chatTab = document.querySelector('[data-tab="chat"]');
    if (chatTab) chatTab.click();

    if (window.chatManager) {
      window.chatManager.openChat(this.user.uid, friendId, friendName);
    }
  }

  /**
   * Setup Friend Actions
   */
  setupFriendActions(user) {
    const addFriendBtn = document.getElementById('addFriendBtn');
    if (addFriendBtn) {
      addFriendBtn.addEventListener('click', () => this.addFriend(user));
    }
  }

  /**
   * Add Friend by Email
   */
  async addFriend(user) {
    const emailInput = document.getElementById('friendEmail');
    if (!emailInput) return;

    const friendEmail = emailInput.value.trim();
    if (!friendEmail) {
      alert('कृपया ईमेल दर्ज करें');
      return;
    }

    try {
      const db = firebase.firestore();
      const userSnapshot = await db.collection('users').where('email', '==', friendEmail).get();

      if (userSnapshot.empty) {
        alert('यह user मौजूद नहीं है');
        return;
      }

      // Add friend relationship
      const friendDoc = userSnapshot.docs[0];
      const friendId = friendDoc.id;

      await db.collection('users').doc(user.uid).update({
        friends: firebase.firestore.FieldValue.arrayUnion(friendId)
      });

      alert('✅ दोस्त जोड़ दिया गया!');
      emailInput.value = '';
      this.loadFriendsList(user);

    } catch (error) {
      console.error('❌ Error adding friend:', error);
      alert('दोस्त जोड़ने में error');
    }
  }

  /**
   * Setup Event Listeners
   */
  setupEventListeners() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userMenu = document.getElementById('userMenu');

    if (userMenuBtn && userMenu) {
      userMenuBtn.addEventListener('click', () => {
        userMenu.style.display = userMenu.style.display === 'none' ? 'block' : 'none';
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!userMenuBtn.contains(e.target) && !userMenu.contains(e.target)) {
          userMenu.style.display = 'none';
        }
      });
    }
  }
}

// Initialize app when Firebase is ready
let prashantApp = null;

function initializePrashantApp() {
  if (!prashantApp) {
    prashantApp = new PrashantApp();
  }
}

// Wait for Firebase to initialize
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initializePrashantApp, 1000);
});
