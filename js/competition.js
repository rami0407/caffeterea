document.addEventListener('DOMContentLoaded', () => {
    loadEntries();

    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleUpload);
    }
});

async function handleUpload(e) {
    e.preventDefault();

    const name = document.getElementById('uploaderName').value;
    const phone = document.getElementById('uploaderPhone').value;
    const fileInput = document.getElementById('logoFile');
    const file = fileInput.files[0];
    const submitBtn = document.getElementById('submitBtn');

    if (!file) {
        alert(t('uploadDesign'));
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = '...';

    try {
        // 1. Upload Image to Storage
        const timestamp = Date.now();
        const filename = `${timestamp}_${file.name}`;
        const storageRef = storage.ref('competitions/logos/' + filename);

        const snapshot = await storageRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();

        // 2. Save Entry to Firestore
        await db.collection('competition_entries').add({
            name: name,
            phone: phone,
            imageUrl: downloadURL,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'pending',
            likes: 0,
            commentsCount: 0
        });

        // 3. Success
        alert(t('uploadSuccess'));

        // Reset Form
        document.getElementById('uploadForm').reset();
        document.getElementById('imagePreview').style.display = 'none';

        // Refresh Gallery
        loadEntries();

    } catch (error) {
        console.error('Upload error:', error);
        alert(t('error') + ': ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = t('uploadBtn');
    }
}

async function loadEntries() {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;

    galleryGrid.innerHTML = '<p>' + t('loading') + '</p>';

    try {
        const snapshot = await db.collection('competition_entries')
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();

        galleryGrid.innerHTML = '';

        if (snapshot.empty) {
            galleryGrid.innerHTML = '<p>' + t('noResults') + '</p>';
            return;
        }

        snapshot.forEach(doc => {
            const entry = doc.data();
            const entryId = doc.id;
            const isLiked = localStorage.getItem(`liked_${entryId}`) === 'true';

            const div = document.createElement('div');
            div.className = 'gallery-item';
            div.innerHTML = `
                <img src="${entry.imageUrl}" alt="${entry.name}" class="gallery-img" loading="lazy">
                <div class="gallery-info">
                    <div class="gallery-name">${entry.name}</div>
                    
                    <div class="social-actions">
                        <button class="social-btn ${isLiked ? 'active' : ''}" onclick="handleLike('${entryId}', this)">
                            <span class="icon">❤️</span>
                            <span class="count">${entry.likes || 0}</span>
                        </button>
                        <button class="social-btn" onclick="toggleComments('${entryId}')">
                            <span class="icon">💬</span>
                            <span class="count">${entry.commentsCount || 0}</span>
                        </button>
                    </div>

                    <div id="comments-${entryId}" class="comments-section">
                        <div class="comments-list" id="list-${entryId}">
                            <!-- Comments loaded here -->
                        </div>
                        <form class="comment-form" onsubmit="submitComment(event, '${entryId}')">
                            <input type="text" class="comment-input" placeholder="${t('writeComment')}" required>
                            <button type="submit" class="comment-submit">${t('send')}</button>
                        </form>
                    </div>
                </div>
            `;
            galleryGrid.appendChild(div);
        });

    } catch (error) {
        console.error('Error loading entries:', error);
        galleryGrid.innerHTML = '<p style="color:red">' + t('error') + '</p>';
    }
}

async function handleLike(entryId, btn) {
    if (localStorage.getItem(`liked_${entryId}`) === 'true') {
        return; // Already liked
    }

    try {
        // Optimistic update
        const countSpan = btn.querySelector('.count');
        let currentLikes = parseInt(countSpan.textContent) || 0;
        countSpan.textContent = currentLikes + 1;
        btn.classList.add('active');
        localStorage.setItem(`liked_${entryId}`, 'true');

        // Firestore Update
        await db.collection('competition_entries').doc(entryId).update({
            likes: firebase.firestore.FieldValue.increment(1)
        });

    } catch (error) {
        console.error('Error liking:', error);
        // Revert on error
        btn.classList.remove('active');
        localStorage.removeItem(`liked_${entryId}`);
        loadEntries(); // Refresh to get real count
    }
}

async function toggleComments(entryId) {
    const section = document.getElementById(`comments-${entryId}`);
    if (section.style.display === 'block') {
        section.style.display = 'none';
    } else {
        section.classList.add('show');
        loadComments(entryId);
    }
}

async function loadComments(entryId) {
    const list = document.getElementById(`list-${entryId}`);
    list.innerHTML = '<p>...</p>';

    try {
        const snapshot = await db.collection('competition_entries')
            .doc(entryId)
            .collection('comments')
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();

        list.innerHTML = '';
        if (snapshot.empty) {
            list.innerHTML = `<p style="text-align:center; color:#94a3b8; font-size:0.8rem">${t('noComments')}</p>`;
            return;
        }

        snapshot.forEach(doc => {
            const comment = doc.data();
            const time = new Date(comment.createdAt?.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const div = document.createElement('div');
            div.className = 'comment-item';
            div.innerHTML = `
                <strong>${comment.author} <span style="float:left; font-weight:400; color:#cbd5e1; font-size:0.7rem">${time}</span></strong>
                ${comment.text}
            `;
            list.appendChild(div);
        });

    } catch (error) {
        console.error('Error loading comments:', error);
        list.innerHTML = '<p style="color:red">Error</p>';
    }
}

async function submitComment(e, entryId) {
    e.preventDefault();
    const input = e.target.querySelector('input');
    const text = input.value.trim();
    if (!text) return;

    // Use "Guest" if not logged in, or generic name
    // Since this is public, we'll ask for name or use "Visitor" in real app
    // For now, we'll use a random name or check auth
    let author = t('guest');
    const user = auth.currentUser;
    if (user) {
        // Try getting name from profile if possible, otherwise just use user's unknown name
        // We'll trust the user context if available
        // For simplicity: get from session or random
    }

    // Quick prompt for name if it's a guest
    if (!sessionStorage.getItem('guest_name')) {
        const name = prompt(t('uploaderName'));
        if (name) sessionStorage.setItem('guest_name', name);
    }
    author = sessionStorage.getItem('guest_name') || t('guest');

    try {
        input.value = '';

        await db.collection('competition_entries').doc(entryId).collection('comments').add({
            text: text,
            author: author,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Increment comment count
        await db.collection('competition_entries').doc(entryId).update({
            commentsCount: firebase.firestore.FieldValue.increment(1)
        });

        loadComments(entryId);
        // update count in UI
        loadEntries(); // Refresh to show new count

    } catch (error) {
        console.error('Error posting comment:', error);
        alert(t('error'));
    }
}
