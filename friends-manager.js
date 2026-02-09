/**
 * PRASHANT Friends & Requests Manager
 * Friend system with requests, accept/reject, and friend-only sharing
 */

class FriendsManager {
  constructor(user) {
    this.user = user;
    this.friends = [];
    this.pendingRequests = [];
    this.setupListeners();
    this.loadFriends();
    this.loadAllUsers();
  }

  setupListeners() {
    const addFriendBtn = document.getElementById('addFriendBtn');
    if (addFriendBtn) {
      addFriendBtn.addEventListener('click', () => this.showFriendSearch());
    }
  }

  /**
   * Load all users (for friend list and requests)
   */
  async loadAllUsers() {
    try {
      const res = await pb.collection('users').getList(1, 100);
      const container = document.getElementById('friendsList');
      if (!container) return;

      container.innerHTML = '';

      // Group users: friends, sent requests, received requests, others
      const friends = [];
      const sent = [];
      const received = [];
      const others = [];

      for (const user of res.items) {
        if (user.id === this.user.uid) continue; // Skip self

        const isFriend = this.friends.includes(user.id);
        const sentStatus = this.pendingRequests.find(r => r.from === this.user.uid && r.to === user.id);
        const receivedStatus = this.pendingRequests.find(r => r.from === user.id && r.to === this.user.uid);

        if (isFriend) {
          friends.push(user);
        } else if (sentStatus) {
          sent.push({ user, status: sentStatus.status });
        } else if (receivedStatus) {
          received.push({ user, status: receivedStatus.status });
        } else {
          others.push(user);
        }
      }

      // Render friends
      if (friends.length > 0) {
        const friendsSection = document.createElement('div');
        friendsSection.className = 'friends-section';
        friendsSection.innerHTML = '<h4>✅ मेरे दोस्त</h4>';

        friends.forEach(u => {
          const el = document.createElement('div');
          el.className = 'friend-item';
          el.innerHTML = `
            <div class="friend-info">
              <strong>${this.escapeHtml(u.displayName || u.name)}</strong>
              <small>${u.email}</small>
            </div>
            <button class="btn-secondary" onclick="window.friendsManager.openChat('${u.id}', '${(u.displayName || u.name).replace(/'/g, "\\'")}')">💬 Chat</button>
          `;
          friendsSection.appendChild(el);
        });
        container.appendChild(friendsSection);
      }

      // Render sent requests (awaiting)
      if (sent.length > 0) {
        const sentSection = document.createElement('div');
        sentSection.className = 'requests-section';
        sentSection.innerHTML = '<h4>⏳ भेजे गए अनुरोध (प्रतीक्षा में)</h4>';

        sent.forEach(({ user: u }) => {
          const el = document.createElement('div');
          el.className = 'friend-item';
          el.innerHTML = `
            <div class="friend-info">
              <strong>${this.escapeHtml(u.displayName || u.name)}</strong>
              <small>${u.email}</small>
            </div>
            <button class="btn-secondary" disabled>⏳ Pending</button>
          `;
          sentSection.appendChild(el);
        });
        container.appendChild(sentSection);
      }

      // Render received requests (action needed)
      if (received.length > 0) {
        const receivedSection = document.createElement('div');
        receivedSection.className = 'requests-section highlight';
        receivedSection.innerHTML = '<h4>📬 नए अनुरोध</h4>';

        received.forEach(({ user: u, status }) => {
          const el = document.createElement('div');
          el.className = 'friend-item';
          el.innerHTML = `
            <div class="friend-info">
              <strong>${this.escapeHtml(u.displayName || u.name)}</strong>
              <small>${u.email}</small>
            </div>
            <div class="btn-group">
              <button class="btn-success" onclick="window.friendsManager.acceptRequest('${u.id}')">✅ स्वीकार करें</button>
              <button class="btn-danger" onclick="window.friendsManager.rejectRequest('${u.id}')">❌ अस्वीकार करें</button>
            </div>
          `;
          receivedSection.appendChild(el);
        });
        container.appendChild(receivedSection);
      }

      // Render others (can send request)
      if (others.length > 0) {
        const othersSection = document.createElement('div');
        othersSection.className = 'others-section';
        othersSection.innerHTML = '<h4>👤 अन्य उपयोगकर्ता</h4>';

        others.forEach(u => {
          const el = document.createElement('div');
          el.className = 'friend-item';
          el.innerHTML = `
            <div class="friend-info">
              <strong>${this.escapeHtml(u.displayName || u.name)}</strong>
              <small>${u.email}</small>
            </div>
            <button class="btn-primary" onclick="window.friendsManager.sendRequest('${u.id}', '${(u.displayName || u.name).replace(/'/g, "\\'")}')">➕ अनुरोध भेजें</button>
          `;
          othersSection.appendChild(el);
        });
        container.appendChild(othersSection);
      }

    } catch (error) {
      console.error('❌ Error loading users:', error);
    }
  }

  /**
   * Load friends list
   */
  async loadFriends() {
    try {
      const userDoc = await pb.collection('users').getOne(this.user.uid);
      this.friends = userDoc.friends || [];
      this.pendingRequests = await this.loadPendingRequests();
      await this.loadAllUsers();
    } catch (error) {
      console.error('❌ Error loading friends:', error);
    }
  }

  /**
   * Load pending requests
   */
  async loadPendingRequests() {
    try {
      const res = await pb.collection('friendRequests').getList(1, 100, {
        filter: `(from="${this.user.uid}" || to="${this.user.uid}")`
      });
      return res.items;
    } catch (error) {
      console.error('❌ Error loading requests:', error);
      return [];
    }
  }

  /**
   * Send friend request
   */
  async sendRequest(toId, toName) {
    try {
      await pb.collection('friendRequests').create({
        from: this.user.uid,
        fromName: this.user.displayName || this.user.name || 'User',
        to: toId,
        status: 'pending'
      });

      alert(`✅ अनुरोध ${toName} को भेज दिया गया!`);
      this.loadFriends();
    } catch (error) {
      console.error('❌ Error sending request:', error);
      alert('अनुरोध भेजने में error');
    }
  }

  /**
   * Accept friend request
   */
  async acceptRequest(fromId) {
    try {
      // Update friend request status
      const reqs = await pb.collection('friendRequests').getList(1, 100, {
        filter: `from="${fromId}" && to="${this.user.uid}"`
      });

      if (reqs.items.length > 0) {
        await pb.collection('friendRequests').update(reqs.items[0].id, {
          status: 'accepted'
        });
      }

      // Add to friends list (both ways)
      const myUser = await pb.collection('users').getOne(this.user.uid);
      const theirUser = await pb.collection('users').getOne(fromId);

      const myFriends = myUser.friends || [];
      const theirFriends = theirUser.friends || [];

      if (!myFriends.includes(fromId)) myFriends.push(fromId);
      if (!theirFriends.includes(this.user.uid)) theirFriends.push(this.user.uid);

      await pb.collection('users').update(this.user.uid, { friends: myFriends });
      await pb.collection('users').update(fromId, { friends: theirFriends });

      alert('✅ अनुरोध स्वीकार कर दिया गया!');
      this.loadFriends();
    } catch (error) {
      console.error('❌ Error accepting request:', error);
      alert('अनुरोध स्वीकार करने में error');
    }
  }

  /**
   * Reject friend request
   */
  async rejectRequest(fromId) {
    try {
      const reqs = await pb.collection('friendRequests').getList(1, 100, {
        filter: `from="${fromId}" && to="${this.user.uid}"`
      });

      if (reqs.items.length > 0) {
        await pb.collection('friendRequests').delete(reqs.items[0].id);
      }

      alert('✅ अनुरोध अस्वीकार कर दिया गया');
      this.loadFriends();
    } catch (error) {
      console.error('❌ Error rejecting request:', error);
    }
  }

  /**
   * Open chat with friend
   */
  openChat(friendId, friendName) {
    const chatTab = document.querySelector('[data-tab="chat"]');
    if (chatTab) chatTab.click();

    if (window.chatManager) {
      window.chatManager.openChat(this.user.uid, friendId, friendName);
    }
  }

  /**
   * Show friend search
   */
  showFriendSearch() {
    const email = prompt('दोस्त की ईमेल दें (या अनुरोध के लिए नाम दें):');
    if (email) {
      this.searchAndAdd(email);
    }
  }

  async searchAndAdd(email) {
    try {
      const users = await pb.collection('users').getList(1, 100, {
        filter: `email="${email}"`
      });

      if (users.items.length === 0) {
        alert('यह user नहीं मिला');
        return;
      }

      const user = users.items[0];
      await this.sendRequest(user.id, user.displayName || user.name);
    } catch (error) {
      console.error('❌ Error searching user:', error);
    }
  }

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}

// Initialize when ready
let friendsManager = null;
