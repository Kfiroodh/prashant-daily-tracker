/**
 * PRASHANT - Share Manager
 * Share notes, photos, and files with friends
 */

class ShareManager {
  constructor(user) {
    this.user = user;
    this.setupListeners();
    this.loadSharedItems();
  }

  setupListeners() {
    const browseBtn = document.getElementById('browseFileBtn');
    const shareBtn = document.getElementById('shareBtn');
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('shareFileInput');

    if (browseBtn) {
      browseBtn.addEventListener('click', () => fileInput.click());
    }

    if (shareBtn) {
      shareBtn.addEventListener('click', () => this.shareItem());
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    }

    // Drag and drop
    if (uploadArea) {
      uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.backgroundColor = '#f0f4ff';
      });

      uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.backgroundColor = 'transparent';
      });

      uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.backgroundColor = 'transparent';
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          fileInput.files = files;
          this.handleFileSelect({ target: { files } });
        }
      });
    }
  }

  /**
   * Handle File Select
   */
  handleFileSelect(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('uploadPreview');

    if (!file) return;

    preview.innerHTML = '';

    if (file.type.startsWith('image/')) {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.style.maxWidth = '200px';
      img.style.borderRadius = '8px';
      preview.appendChild(img);
    } else {
      preview.innerHTML = `<p>✅ ${file.name}</p>`;
    }
  }

  /**
   * Share Item
   */
  async shareItem() {
    const title = document.getElementById('shareTitle').value.trim();
    const description = document.getElementById('shareDescription').value.trim();
    const fileInput = document.getElementById('shareFileInput');

    if (!title) {
      alert('कृपया title दें');
      return;
    }

    try {
      let fileUrl = null;
      let fileName = null;

      // Upload file if selected
      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const storage = firebase.storage();
        const storagePath = `shared/${Date.now()}_${file.name}`;

        const snapshot = await storage.ref(storagePath).put(file);
        fileUrl = await snapshot.ref.getDownloadURL();
        fileName = file.name;
      }

      const db = firebase.firestore();
      const sharedItem = {
        id: Date.now(),
        title: title,
        description: description,
        fileUrl: fileUrl,
        fileName: fileName,
        isImage: fileInput.files[0]?.type.startsWith('image/'),
        sharedBy: this.user.uid,
        sharedByName: this.user.displayName,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        likes: 0,
      };

      await db.collection('shared').add(sharedItem);

      alert('✅ Share कर दिया गया!');
      
      // Reset form
      document.getElementById('shareTitle').value = '';
      document.getElementById('shareDescription').value = '';
      document.getElementById('uploadPreview').innerHTML = '';
      fileInput.value = '';

      this.loadSharedItems();

    } catch (error) {
      console.error('❌ Share error:', error);
      alert('Share करने में error');
    }
  }

  /**
   * Load Shared Items
   */
  async loadSharedItems() {
    try {
      const db = firebase.firestore();

      // Shared with me
      const sharedWithMeDiv = document.getElementById('sharedWithMe');
      const allShared = await db.collection('shared').orderBy('timestamp', 'desc').get();

      if (sharedWithMeDiv) {
        sharedWithMeDiv.innerHTML = '';
        allShared.forEach((doc) => {
          const item = doc.data();
          if (item.sharedBy !== this.user.uid) {
            this.renderSharedItem(item, sharedWithMeDiv);
          }
        });
      }

      // My shared
      const mySharedDiv = document.getElementById('myShared');
      if (mySharedDiv) {
        mySharedDiv.innerHTML = '';
        allShared.forEach((doc) => {
          const item = doc.data();
          if (item.sharedBy === this.user.uid) {
            this.renderSharedItem(item, mySharedDiv);
          }
        });
      }

    } catch (error) {
      console.error('❌ Error loading shared items:', error);
    }
  }

  /**
   * Render Shared Item
   */
  renderSharedItem(item, container) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'shared-item';
    itemDiv.innerHTML = `
      <div class="item-header">
        <h3>${item.title}</h3>
        <small>${new Date(item.timestamp.toDate()).toLocaleDateString('hi-IN')}</small>
      </div>
      ${item.description ? `<p>${item.description}</p>` : ''}
      ${item.isImage ? `<img src="${item.fileUrl}" style="max-width: 100%; border-radius: 8px; margin: 10px 0;">` : ''}
      ${item.fileUrl && !item.isImage ? `<a href="${item.fileUrl}" target="_blank" class="btn-secondary">📥 Download ${item.fileName}</a>` : ''}
      <div class="item-footer">
        <small>🙋 ${item.sharedByName}</small>
        <button class="btn-icon" onclick="alert('❤️ Liked!')">❤️</button>
      </div>
    `;
    container.appendChild(itemDiv);
  }
}
