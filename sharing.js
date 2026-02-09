/**
 * PRASHANT Sharing Module
 * Share notes, activities, and files with friends
 */

class SharingManager {
  constructor() {
    this.setupUI();
  }

  setupUI() {
    const shareNoteBtn = document.getElementById('shareNoteBtn');
    const shareActivityBtn = document.getElementById('shareActivityBtn');

    if (shareNoteBtn) {
      shareNoteBtn.addEventListener('click', () => this.showNoteDialog());
    }

    if (shareActivityBtn) {
      shareActivityBtn.addEventListener('click', () => this.showActivityDialog());
    }
  }

  /**
   * Show dialog to create and share note
   */
  showNoteDialog() {
    const title = prompt('📝 Note Title:');
    if (!title) return;

    const content = prompt('📝 Note Content:');
    if (!content) return;

    if (chatManager && chatManager.currentChatId) {
      chatManager.sendNote(title, content);
      alert('✅ Note shared!');
    } else {
      alert('⚠️ Open a chat first!');
    }
  }

  /**
   * Show dialog to share activity/productivity data
   */
  showActivityDialog() {
    if (!chatManager || !chatManager.currentChatId) {
      alert('⚠️ Open a chat first!');
      return;
    }

    const entries = loadEntries();
    if (!entries.length) {
      alert('⚠️ No activity data to share!');
      return;
    }

    const lastEntry = entries[entries.length - 1];
    const confirmShare = confirm(
      `📊 Share today's activity?\n\nDate: ${lastEntry.date}\nStudy: ${lastEntry.sessions.length} sessions\nMood: ${['😢', '😕', '😐', '🙂', '😄'][lastEntry.mood - 1] || '?'}`
    );

    if (confirmShare) {
      chatManager.shareProductivityData(lastEntry);
      alert('✅ Activity shared!');
    }
  }

  /**
   * Get shared notes for current user
   */
  async getSharedNotes(userId) {
    try {
      const db = firebase.firestore();
      const snapshot = await db
        .collectionGroup('messages')
        .where('type', '==', 'note')
        .where('senderId', '==', userId)
        .get();

      const notes = [];
      snapshot.forEach((doc) => {
        notes.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return notes;
    } catch (error) {
      console.error('❌ Error fetching notes:', error);
      return [];
    }
  }

  /**
   * Share note to multiple friends
   */
  async shareNoteToMultipleFriends(noteTitle, noteContent, friendIds) {
    try {
      if (!chatManager) return;

      const currentUser = prashantAuth.getUser();
      const db = firebase.firestore();

      for (const friendId of friendIds) {
        const chatId = [currentUser.uid, friendId].sort().join('_');

        await db
          .collection('chats')
          .doc(chatId)
          .collection('messages')
          .add({
            senderId: currentUser.uid,
            senderName: currentUser.displayName || 'Anonymous',
            senderPhoto: currentUser.photoURL || '',
            type: 'note',
            noteTitle: noteTitle,
            noteContent: noteContent,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          });
      }

      return true;
    } catch (error) {
      console.error('❌ Error sharing note:', error);
      return false;
    }
  }

  /**
   * Get all media shared by user
   */
  async getUserMediaGallery(userId) {
    try {
      const db = firebase.firestore();
      const snapshot = await db
        .collectionGroup('messages')
        .where('senderId', '==', userId)
        .where('type', 'in', ['image', 'file'])
        .get();

      const media = [];
      snapshot.forEach((doc) => {
        media.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return media;
    } catch (error) {
      console.error('❌ Error fetching media:', error);
      return [];
    }
  }
}

// Initialize sharing manager
let sharingManager = null;

function initializeSharingManager() {
  if (!sharingManager) {
    sharingManager = new SharingManager();
  }
}
