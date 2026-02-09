/**
 * PRASHANT - Group/Circle Chat Manager
 * Circle chats for groups, teams, and reporting
 */

class GroupChatManager {
  constructor(user) {
    this.user = user;
    this.groups = [];
    this.currentGroup = null;
    this.groupSubscription = null;
    this.setupListeners();
    this.loadGroups();
  }

  setupListeners() {
    // Will be set up when friend system initializes
  }

  /**
   * Load user's groups
   */
  async loadGroups() {
    try {
      const res = await pb.collection('groupChats').getList(1, 50, {
        filter: `members.id?~'${this.user.uid}'`
      });
      this.groups = res.items;
      this.renderGroupsList();
    } catch (error) {
      console.error('❌ Error loading groups:', error);
    }
  }

  /**
   * Create new group
   */
  async createGroup(name, memberIds) {
    try {
      const members = memberIds.map(id => ({ id: id, joined: new Date() }));
      members.push({ id: this.user.uid, joined: new Date() }); // Add creator

      const group = await pb.collection('groupChats').create({
        name: name,
        createdBy: this.user.uid,
        members: members
      });

      alert(`✅ Group "${name}" बना दिया गया!`);
      await this.loadGroups();
      return group;
    } catch (error) {
      console.error('❌ Error creating group:', error);
      alert('Group बनाने में error');
      return null;
    }
  }

  /**
   * Open group chat
   */
  openGroup(groupId, groupName) {
    this.currentGroup = { id: groupId, name: groupName };

    const chatWindow = document.getElementById('chatWindow');
    const noChatSelected = document.getElementById('noChatSelected');
    const chatFriendName = document.getElementById('chatFriendName');

    if (chatWindow) {
      chatWindow.style.display = 'flex';
      // Change title to show circle icon
      if (chatFriendName) chatFriendName.innerHTML = `<span>🔴 ${this.escapeHtml(groupName)}</span>`;
    }
    if (noChatSelected) noChatSelected.style.display = 'none';

    this.loadGroupMessages();
  }

  /**
   * Load group messages
   */
  async loadGroupMessages() {
    try {
      const messagesContainer = document.getElementById('messagesContainer');
      messagesContainer.innerHTML = '';

      const filter = `groupId="${this.currentGroup.id}"`;
      const res = await pb.collection('groupMessages').getList(1, 200, { filter, sort: 'created' });

      res.items.forEach((msg) => this.renderGroupMessage(msg, messagesContainer));
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      this.subscribeToGroupMessages();
    } catch (error) {
      console.error('❌ Error loading group messages:', error);
    }
  }

  /**
   * Render group message
   */
  renderGroupMessage(msg, container) {
    const msgDiv = document.createElement('div');
    const isOwn = msg.senderId === this.user.uid;
    msgDiv.className = `message ${isOwn ? 'own' : 'other'}`;

    let content = `
      <div class="msg-bubble">
        <div class="msg-sender">${this.escapeHtml(msg.senderName)}</div>
    `;

    if (msg.type === 'text') {
      content += `<div>${this.escapeHtml(msg.text || '')}</div>`;
    } else if (msg.type === 'image') {
      const url = pb.getFileUrl(msg, 'file');
      content += `<img src="${url}" style="max-width: 200px; border-radius: 8px;">`;
    } else if (msg.type === 'file') {
      const url = pb.getFileUrl(msg, 'file');
      content += `<a href="${url}" target="_blank">📄 ${this.escapeHtml(msg.fileName || '')}</a>`;
    }

    const time = msg.created ? new Date(msg.created).toLocaleTimeString('hi-IN') : '';
    content += `
        <div class="msg-time">${time}</div>
      </div>
    `;

    msgDiv.innerHTML = content;
    container.appendChild(msgDiv);
  }

  /**
   * Send group message
   */
  async sendGroupMessage(text, file = null) {
    if (!this.currentGroup) return;

    try {
      if (file) {
        const formData = new FormData();
        formData.append('groupId', this.currentGroup.id);
        formData.append('senderId', this.user.uid);
        formData.append('senderName', this.user.displayName || this.user.name || 'User');
        formData.append('type', 'file');
        formData.append('file', file);
        await pb.collection('groupMessages').create(formData);
      } else if (text.trim()) {
        await pb.collection('groupMessages').create({
          groupId: this.currentGroup.id,
          senderId: this.user.uid,
          senderName: this.user.displayName || this.user.name || 'User',
          type: 'text',
          text: text
        });
      }
    } catch (error) {
      console.error('❌ Error sending group message:', error);
    }
  }

  /**
   * Subscribe to group messages
   */
  subscribeToGroupMessages() {
    if (this.groupSubscription) {
      try { this.groupSubscription.unsubscribe(); } catch (e) {}
    }

    this.groupSubscription = pb.collection('groupMessages').subscribe('*', (e) => {
      try {
        const rec = e.record;
        if (!rec || rec.groupId !== this.currentGroup.id) return;

        const container = document.getElementById('messagesContainer');
        if (e.action === 'create') {
          this.renderGroupMessage(rec, container);
          container.scrollTop = container.scrollHeight;
        }
      } catch (err) {
        console.error('❌ Group subscription error:', err);
      }
    });
  }

  /**
   * Render groups list in UI
   */
  renderGroupsList() {
    // This would render in a groups sidebar or dropdown
    // For now, just keep track internally
    console.log('📍 Groups loaded:', this.groups.length);
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
let groupChatManager = null;
