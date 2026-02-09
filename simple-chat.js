/**
 * PRASHANT - Simple Chat Manager
 * Real-time messaging with Firestore
 */

class ChatManager {
  constructor(user) {
    this.user = user;
    this.currentChatId = null;
    this.unsubscribe = null;
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

    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  /**
   * Load Messages Real-time
   */
  loadMessages() {
    try {
      const db = firebase.firestore();
      const messagesContainer = document.getElementById('messagesContainer');

      if (this.unsubscribe) {
        this.unsubscribe();
      }

      this.unsubscribe = db
        .collection('chats')
        .doc(this.currentChatId)
        .collection('messages')
        .orderBy('timestamp', 'asc')
        .onSnapshot((snapshot) => {
          messagesContainer.innerHTML = '';

          snapshot.forEach((doc) => {
            const msg = doc.data();
            this.renderMessage(msg, messagesContainer);
          });

          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });

    } catch (error) {
      console.error('❌ Error loading messages:', error);
    }
  }

  /**
   * Render Message
   */
  renderMessage(msg, container) {
    const msgDiv = document.createElement('div');
    const isOwn = msg.senderId === this.user.uid;
    msgDiv.className = `message ${isOwn ? 'own' : 'other'}`;

    let content = `
      <div class="msg-bubble">
        <div class="msg-sender">${msg.senderName}</div>
    `;

    if (msg.type === 'text') {
      content += `<div>${this.escapeHtml(msg.text)}</div>`;
    } else if (msg.type === 'image') {
      content += `<img src="${msg.fileUrl}" style="max-width: 200px; border-radius: 8px;">`;
    } else if (msg.type === 'file') {
      content += `<a href="${msg.fileUrl}" target="_blank">📄 ${msg.fileName}</a>`;
    }

    content += `
        <div class="msg-time">${new Date(msg.timestamp.toDate()).toLocaleTimeString('hi-IN')}</div>
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
      const db = firebase.firestore();
      await db
        .collection('chats')
        .doc(this.currentChatId)
        .collection('messages')
        .add({
          senderId: this.user.uid,
          senderName: this.user.displayName || 'User',
          type: 'text',
          text: text,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        });

      input.value = '';
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  }

  /**
   * Upload File
   */
  async uploadFile(event, type) {
    const file = event.target.files[0];
    if (!file || !this.currentChatId) return;

    try {
      const storage = firebase.storage();
      const fileName = `${Date.now()}_${file.name}`;
      const path = type === 'photo' ? `photos/${fileName}` : `files/${fileName}`;

      const snapshot = await storage.ref(path).put(file);
      const fileUrl = await snapshot.ref.getDownloadURL();

      const db = firebase.firestore();
      await db
        .collection('chats')
        .doc(this.currentChatId)
        .collection('messages')
        .add({
          senderId: this.user.uid,
          senderName: this.user.displayName || 'User',
          type: type === 'photo' ? 'image' : 'file',
          fileUrl: fileUrl,
          fileName: file.name,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        });

      event.target.value = '';
      alert('✅ File shared!');
    } catch (error) {
      console.error('❌ Upload error:', error);
      alert('Upload failed');
    }
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
