document.addEventListener('DOMContentLoaded', () => {
    initializeFirebase(); // Fix: Initialize Firebase
    loadEntries();

    const postForm = document.getElementById('postForm');
    if (postForm) {
        postForm.addEventListener('submit', handlePost);
    }
});

async function handlePost(e) {
    e.preventDefault();

    const name = document.getElementById('posterName').value;
    const content = document.getElementById('postContent').value;
    const submitBtn = document.getElementById('submitBtn');

    if (!content.trim()) return;

    submitBtn.disabled = true;
    submitBtn.textContent = '...';

    try {
        // Save Post to Firestore
        await db.collection('competition_entries').add({
            name: name, // User's name
            text: content, // Text content
            type: 'text',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'approved', // Auto-approve for now
            likes: 0,
            commentsCount: 0
        });

        // Success
        alert('تم نشر مشاركتك بنجاح!');

        // Reset Form
        document.getElementById('postForm').reset();

        // Refresh Feed
        loadEntries();

    } catch (error) {
        console.error('Post error:', error);
        alert('حدث خطأ: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'نشر';
    }
}

async function loadEntries() {
    const feedContainer = document.getElementById('postsFeed');
    if (!feedContainer) return;

    feedContainer.innerHTML = '<p style="text-align:center">جاري التحميل...</p>';

    try {
        const snapshot = await db.collection('competition_entries')
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();

        feedContainer.innerHTML = '';

        if (snapshot.empty) {
            feedContainer.innerHTML = '<p style="text-align:center" data-i18n="noResults">لا توجد مشاركات بعد. كن أول من يشارك!</p>';
            return;
        }

        snapshot.forEach(doc => {
            const entry = doc.data();
            const entryId = doc.id;
            const isLiked = localStorage.getItem(`liked_${entryId}`) === 'true';
            const time = entry.createdAt ? new Date(entry.createdAt.toDate()).toLocaleDateString('ar-EG', { weekday: 'long', hour: '2-digit', minute: '2-digit' }) : 'الآن';
            const initial = entry.name ? entry.name.charAt(0).toUpperCase() : '?';

            const div = document.createElement('div');
            div.className = 'post-card';
            div.innerHTML = `
                <div class="post-header">
                    <div class="post-avatar">${initial}</div>
                    <div class="post-info">
                        <h3>${entry.name}</h3>
                        <div class="post-date">${time}</div>
                    </div>
                </div>

                <div class="post-body">
                    ${entry.text || ''}
                    ${entry.imageUrl ? `<br><img src="${entry.imageUrl}" style="max-width:100%; border-radius:10px; margin-top:10px;">` : ''}
                </div>
                
                <div class="post-actions">
                    <button class="action-btn ${isLiked ? 'active' : ''}" onclick="handleLike('${entryId}', this)">
                        <span class="icon">❤️</span>
                        <span class="count">${entry.likes || 0}</span> أعجبني
                    </button>
                    <button class="action-btn" onclick="toggleComments('${entryId}')">
                        <span class="icon">💬</span>
                        <span class="count">${entry.commentsCount || 0}</span> تعليق
                    </button>
                </div>

                <div id="comments-${entryId}" class="comments-section">
                    <div class="comments-list" id="list-${entryId}">
                        <!-- Comments loaded here -->
                    </div>
                    <form class="comment-form" onsubmit="submitComment(event, '${entryId}')">
                        <input type="text" class="comment-input" placeholder="اكتب تعليقاً..." required>
                        <button type="submit" class="comment-submit">إرسال</button>
                    </form>
                </div>
            `;
            feedContainer.appendChild(div);
        });

    } catch (error) {
        console.error('Error loading entries:', error);
        feedContainer.innerHTML = '<p style="color:red; text-align:center">حدث خطأ في تحميل المنشورات</p>';
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
