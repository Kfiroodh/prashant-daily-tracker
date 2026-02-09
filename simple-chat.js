/**
 * PRASHANT - Simple Chat Manager (PocketBase)
 * Uses PocketBase `messages` collection and Storage for files
 */

class ChatManager {
  constructor(user) {
    this.user = user;
    this.currentChatId = null;
    this.subscription = null;
    this.setupListeners();
  }

  setupListeners() {
    const sendBtn = document.getElementById('sendMessageBtn');
    const messageInput = document.getElementById('messageInput');
    const uploadFileBtn = document.getElementById('uploadFileBtn');
    const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
    const closeChatBtn = document.getElementById('closeChatBtn');

    if (sendBtn) {
      sendBtn.addEventListener('click', () => this.sendMessage());
    }

    if (messageInput) {
      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }

    if (uploadFileBtn) {
      uploadFileBtn.addEventListener('click', () => {
        document.getElementById('chatFileInput').click();
      });
    }

    if (uploadPhotoBtn) {
      uploadPhotoBtn.addEventListener('click', () => {
        document.getElementById('chatPhotoInput').click();
      });
    }

    if (closeChatBtn) {
      closeChatBtn.addEventListener('click', () => this.closeChat());
    }

    // File input handlers
    const fileInput = document.getElementById('chatFileInput');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.uploadFile(e, 'file'));
    }

    const photoInput = document.getElementById('chatPhotoInput');
    if (photoInput) {
      photoInput.addEventListener('change', (e) => this.uploadFile(e, 'photo'));
    }
  }

  /**
   * Open Chat
   */
  openChat(myId, friendId, friendName) {
    this.currentChatId = [myId, friendId].sort().join('_');
    
    const chatWindow = document.getElementById('chatWindow');
    const noChatSelected = document.getElementById('noChatSelected');
    const chatFriendName = document.getElementById('chatFriendName');

    if (chatWindow) chatWindow.style.display = 'flex';
    if (noChatSelected) noChatSelected.style.display = 'none';
    if (chatFriendName) chatFriendName.textContent = friendName;

    this.loadMessages();
    this.subscribeToMessages();
  }

  /**
   * Close Chat
   */
  closeChat() {
    this.currentChatId = null;
    const chatWindow = document.getElementById('chatWindow');
    const noChatSelected = document.getElementById('noChatSelected');

    if (chatWindow) chatWindow.style.display = 'none';
    if (noChatSelected) noChatSelected.style.display = 'block';
    if (this.subscription) {
      try { this.subscription.unsubscribe(); } catch(e) {}
      this.subscription = null;
    }
  }

  /**
   * Load Messages Real-time
   */
  loadMessages() {
    try {
      const messagesContainer = document.getElementById('messagesContainer');
      messagesContainer.innerHTML = '';

      // Fetch existing messages for this chat from PocketBase
      const page = 1;
      const perPage = 200;
      const filter = `chatId="${this.currentChatId}"`;

      pb.collection('messages').getList(page, perPage, { filter, sort: 'created' })
        .then((res) => {
          res.items.forEach((msg) => this.renderMessage(msg, messagesContainer));
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        })
        .catch((err) => console.error('❌ PB load messages error', err));

    } catch (error) {
      console.error('❌ Error loading messages:', error);
    }
  }

  /**
   * Render Message
   */
  renderMessage(msg, container) {
    const msgDiv = document.createElement('div');
    const isOwn = (msg.senderId === this.user.uid) || (msg.senderId === this.user?.uid);
    msgDiv.className = `message ${isOwn ? 'own' : 'other'}`;

    let content = `
      <div class="msg-bubble">
        <div class="msg-sender">${this.escapeHtml(msg.senderName || msg.sender)}</div>
    `;

    if (msg.type === 'text') {
      content += `<div>${this.escapeHtml(msg.text || msg.body || '')}</div>`;
    } else if (msg.type === 'image') {
      const url = pb.getFileUrl(msg, 'file');
      content += `<img src="${url}" style="max-width: 200px; border-radius: 8px;">`;
    } else if (msg.type === 'file') {
      const url = pb.getFileUrl(msg, 'file');
      content += `<a href="${url}" target="_blank">📄 ${this.escapeHtml(msg.fileName || msg.file || '')}</a>`;
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
   * Send Message
   */
  async sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    if (!text || !this.currentChatId) return;

    try {
      const data = {
        chatId: this.currentChatId,
        senderId: this.user.uid,
        senderName: this.user.displayName || this.user.name || 'User',
        type: 'text',
        text: text,
      };

      await pb.collection('messages').create(data);
      input.value = '';
    } catch (error) {
      console.error('❌ PB Error sending message:', error);
    }
  }

  /**
   * Upload File
   */
  async uploadFile(event, type) {
    const file = event.target.files[0];
    if (!file || !this.currentChatId) return;
    try {
      const formData = new FormData();
      formData.append('chatId', this.currentChatId);
      formData.append('senderId', this.user.uid);
      formData.append('senderName', this.user.displayName || this.user.name || 'User');
      formData.append('type', type === 'photo' ? 'image' : 'file');
      formData.append('file', file);

      // PocketBase supports FormData for file upload
      await pb.collection('messages').create(formData);

      event.target.value = '';
      alert('✅ File shared!');
    } catch (error) {
      console.error('❌ PB Upload error:', error);
      alert('Upload failed');
    }
  }

  subscribeToMessages() {
    // Unsubscribe previous
    if (this.subscription) {
      try { this.subscription.unsubscribe(); } catch(e){}
      this.subscription = null;
    }

    // Subscribe to collection events and filter by chatId
    this.subscription = pb.collection('messages').subscribe('*', (e) => {
      try {
        const rec = e.record;
        if (!rec || rec.chatId !== this.currentChatId) return;

        const messagesContainer = document.getElementById('messagesContainer');
        // Simple handling: append new/updated records
        if (e.action === 'create') {
          this.renderMessage(rec, messagesContainer);
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        // For update/delete, a full reload is simpler
        if (e.action === 'update' || e.action === 'delete') {
          this.loadMessages();
        }
      } catch (err) {
        console.error('❌ PB subscription handler error', err);
      }
    });
  }

  /**
   * Helper: Escape HTML
   */
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
