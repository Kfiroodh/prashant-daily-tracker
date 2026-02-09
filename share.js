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
      let fileName = null;

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('sharedBy', this.user.uid);
      formData.append('sharedByName', this.user.displayName || this.user.name || 'User');
      formData.append('likes', 0);

      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        formData.append('file', file);
        fileName = file.name;
      }

      // Create record in PocketBase
      await pb.collection('shared').create(formData);

      alert('✅ Share कर दिया गया!');
      // Reset form
      document.getElementById('shareTitle').value = '';
      document.getElementById('shareDescription').value = '';
      document.getElementById('uploadPreview').innerHTML = '';
      fileInput.value = '';

      this.loadSharedItems();

    } catch (error) {
      console.error('❌ PB Share error:', error);
      alert('Share करने में error');
    }
  }

  /**
   * Load Shared Items
   */
  async loadSharedItems() {
    try {
      // Fetch from PocketBase
      const sharedWithMeDiv = document.getElementById('sharedWithMe');
      const mySharedDiv = document.getElementById('myShared');

      const page = 1;
      const perPage = 50;
      const res = await pb.collection('shared').getList(page, perPage, { sort: '-created' });

      if (sharedWithMeDiv) {
        sharedWithMeDiv.innerHTML = '';
        res.items.forEach((item) => {
          if (item.sharedBy !== this.user.uid) this.renderSharedItem(item, sharedWithMeDiv);
        });
      }

      if (mySharedDiv) {
        mySharedDiv.innerHTML = '';
        res.items.forEach((item) => {
          if (item.sharedBy === this.user.uid) this.renderSharedItem(item, mySharedDiv);
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
        <h3>${this.escapeHtml(item.title)}</h3>
        <small>${new Date(item.created).toLocaleDateString('hi-IN')}</small>
      </div>
      ${item.description ? `<p>${this.escapeHtml(item.description)}</p>` : ''}
      ${item.file ? `<img src="${pb.getFileUrl(item, 'file')}" style="max-width: 100%; border-radius: 8px; margin: 10px 0;">` : ''}
      ${item.file && !item.file?.includes('image') ? `<a href="${pb.getFileUrl(item, 'file')}" target="_blank" class="btn-secondary">📥 Download</a>` : ''}
      <div class="item-footer">
        <small>🙋 ${this.escapeHtml(item.sharedByName)}</small>
        <button class="btn-icon" onclick="alert('❤️ Liked!')">❤️</button>
      </div>
    `;
    container.appendChild(itemDiv);
  }
}
