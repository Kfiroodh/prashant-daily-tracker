/**
 * PRASHANT Chat Module
 * Real-time messaging with Firestore
 */

class ChatManager {
  constructor() {
    this.currentChatId = null;
    this.currentUser = null;
    this.messagesRef = null;
    this.unsubscribeMessages = null;
  }

  /**
   * Initialize chat manager
   */
  async initialize(user) {
    this.currentUser = user;
    this.setupEventListeners();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    const sendBtn = document.getElementById('sendMessageBtn');
    const messageInput = document.getElementById('messageInput');
    const attachFileBtn = document.getElementById('attachFileBtn');

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

    if (attachFileBtn) {
      attachFileBtn.addEventListener('click', () => {
        document.getElementById('fileInput').click();
      });
    }

    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
    }
  }

  /**
   * Open chat with a friend
   */
  async openChat(friendId, friendName) {
    try {
      const userId = this.currentUser.uid;
      
      // Create chat ID (sorted so same chat always has same ID)
      const chatId = [userId, friendId].sort().join('_');
      this.currentChatId = chatId;

      // Update UI
      const chatHeaderName = document.getElementById('chatHeaderName');
      if (chatHeaderName) chatHeaderName.textContent = friendName;

      // Load messages
      this.loadMessages(chatId);

      // Show chat window
      const chatWindow = document.getElementById('chatWindow');
      if (chatWindow) chatWindow.style.display = 'flex';

    } catch (error) {
      console.error("❌ Error opening chat:", error);
    }
  }

  /**
   * Load messages from Firestore
   */
  loadMessages(chatId) {
    try {
      const db = firebase.firestore();
      
      // Unsubscribe from previous listener
      if (this.unsubscribeMessages) {
        this.unsubscribeMessages();
      }

      // Real-time listener
      this.unsubscribeMessages = db
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .orderBy('timestamp', 'asc')
        .onSnapshot((snapshot) => {
          const messagesContainer = document.getElementById('messagesContainer');
          if (!messagesContainer) return;

          messagesContainer.innerHTML = '';

          snapshot.forEach((doc) => {
            const message = doc.data();
            this.renderMessage(message, messagesContainer);
          });

          // Scroll to bottom
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });

    } catch (error) {
      console.error("❌ Error loading messages:", error);
    }
  }

  /**
   * Render a single message
   */
  renderMessage(message, container) {
    const msgEl = document.createElement('div');
    msgEl.className = message.senderId === this.currentUser.uid ? 'message-own' : 'message-other';
    
    let content = `
      <div class="message-bubble">
        <div class="message-sender">${message.senderName}</div>
    `;

    if (message.type === 'text') {
      content += `<div class="message-text">${this.escapeHtml(message.text)}</div>`;
    } else if (message.type === 'image') {
      content += `
        <img src="${message.fileUrl}" class="message-image" alt="Photo">
      `;
    } else if (message.type === 'file') {
      content += `
        <a href="${message.fileUrl}" class="message-file" download>
          📎 ${message.fileName} (${message.fileSize})
        </a>
      `;
    } else if (message.type === 'note') {
      content += `
        <div class="message-note">
          <strong>${message.noteTitle}</strong><br>
          ${this.escapeHtml(message.noteContent)}
        </div>
      `;
    }

    content += `
        <div class="message-time">${new Date(message.timestamp.toDate()).toLocaleTimeString()}</div>
      </div>
    `;

    msgEl.innerHTML = content;
    container.appendChild(msgEl);
  }

  /**
   * Send text message
   */
  async sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const text = messageInput ? messageInput.value.trim() : '';

    if (!text) return;

    try {
      const db = firebase.firestore();
      const message = {
        senderId: this.currentUser.uid,
        senderName: this.currentUser.displayName || 'Anonymous',
        senderPhoto: this.currentUser.photoURL || '',
        type: 'text',
        text: text,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      };

      await db
        .collection('chats')
        .doc(this.currentChatId)
        .collection('messages')
        .add(message);

      if (messageInput) messageInput.value = '';

    } catch (error) {
      console.error("❌ Error sending message:", error);
      alert('Failed to send message');
    }
  }

  /**
   * Handle file upload (images, notes, etc.)
   */
  async handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const progressEl = document.getElementById('uploadProgress');
      if (progressEl) progressEl.style.display = 'block';

      const isImage = file.type.startsWith('image/');
      const storage = firebase.storage();
      const fileName = `${Date.now()}_${file.name}`;
      const path = isImage ? `images/${fileName}` : `files/${fileName}`;

      const uploadTask = storage.ref(path).put(file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (progressEl) progressEl.textContent = `Uploading... ${progress.toFixed(0)}%`;
        },
        (error) => {
          console.error("❌ Upload error:", error);
          alert('Upload failed');
          if (progressEl) progressEl.style.display = 'none';
        },
        async () => {
          const fileUrl = await uploadTask.snapshot.ref.getDownloadURL();

          const db = firebase.firestore();
          const message = {
            senderId: this.currentUser.uid,
            senderName: this.currentUser.displayName || 'Anonymous',
            senderPhoto: this.currentUser.photoURL || '',
            type: isImage ? 'image' : 'file',
            fileUrl: fileUrl,
            fileName: file.name,
            fileSize: this.formatFileSize(file.size),
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          };

          await db
            .collection('chats')
            .doc(this.currentChatId)
            .collection('messages')
            .add(message);

          if (progressEl) progressEl.style.display = 'none';
          event.target.value = '';
        }
      );

    } catch (error) {
      console.error("❌ File upload error:", error);
      alert('File upload failed');
    }
  }

  /**
   * Send note
   */
  async sendNote(title, content) {
    try {
      const db = firebase.firestore();
      const message = {
        senderId: this.currentUser.uid,
        senderName: this.currentUser.displayName || 'Anonymous',
        senderPhoto: this.currentUser.photoURL || '',
        type: 'note',
        noteTitle: title,
        noteContent: content,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      };

      await db
        .collection('chats')
        .doc(this.currentChatId)
        .collection('messages')
        .add(message);

    } catch (error) {
      console.error("❌ Error sending note:", error);
      alert('Failed to send note');
    }
  }

  /**
   * Share activity/productivity data
   */
  async shareProductivityData(entryData) {
    try {
      const db = firebase.firestore();
      const message = {
        senderId: this.currentUser.uid,
        senderName: this.currentUser.displayName || 'Anonymous',
        senderPhoto: this.currentUser.photoURL || '',
        type: 'productivity',
        data: entryData,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      };

      await db
        .collection('chats')
        .doc(this.currentChatId)
        .collection('messages')
        .add(message);

    } catch (error) {
      console.error("❌ Error sharing data:", error);
    }
  }

  /**
   * Get friends list
   */
  async getFriendsList() {
    try {
      const db = firebase.firestore();
      const usersSnapshot = await db.collection('users').get();
      const friends = [];

      usersSnapshot.forEach((doc) => {
        const user = doc.data();
        if (user.uid !== this.currentUser.uid) {
          friends.push(user);
        }
      });

      return friends;
    } catch (error) {
      console.error("❌ Error getting friends list:", error);
      return [];
    }
  }

  /**
   * Close chat window
   */
  closeChat() {
    const chatWindow = document.getElementById('chatWindow');
    if (chatWindow) chatWindow.style.display = 'none';

    if (this.unsubscribeMessages) {
      this.unsubscribeMessages();
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

  /**
   * Helper: Format file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

// Initialize chat manager
let chatManager = null;

function initializeChatManager(user) {
  if (!chatManager) {
    chatManager = new ChatManager();
    chatManager.initialize(user);
  }
}
