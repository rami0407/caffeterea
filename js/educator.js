// ========================================
// بذور المعرفة - Smart Eco-Market
// Educator Portal Logic
// ========================================

// Global state
let currentEducator = null;
let students = [];
let selectedStudent = null;

// Sample students for demo
// Sample data removed
const sampleStudents = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeFirebase();
    initI18n();

    setupEventListeners();
    checkAuthAndLoad();
});

// Check authentication and load data
function checkAuthAndLoad() {
    onAuthStateChange(async ({ user, userData }) => {
        if (user && userData && userData.role === 'educator') {
            currentEducator = userData;
            // Update Header Name
            const welcomeEl = document.getElementById('educatorWelcomeName');
            if (welcomeEl) welcomeEl.textContent = `مرحباً، ${userData.name}`;

            await loadStudents();
        } else {
            window.location.href = '../login.html';
        }
    });
}

// Load students from Firebase
async function loadStudents() {
    try {
        // Query active and pending students for THIS educator
        const allStudents = await getEducatorStudents(currentEducator.name); // Using Name for matching

        students = allStudents.filter(s => s.approved === true);
        pendingStudents = allStudents.filter(s => s.approved === false || s.approved === undefined);

        renderStudentTabs();
    } catch (error) {
        console.error('Error loading students:', error);
        document.getElementById('studentsList').innerHTML = '<p class="error-text">حدث خطأ في تحميل بيانات الطلاب</p>';
    }
}

let activeTab = 'active';
let pendingStudents = [];

function renderStudentTabs() {
    if (activeTab === 'active') {
        renderStudents(students, 'studentsList');
        document.getElementById('pendingList').classList.add('hidden');
        document.getElementById('studentsList').classList.remove('hidden');
    } else {
        renderPendingStudents();
        document.getElementById('studentsList').classList.add('hidden');
        document.getElementById('pendingList').classList.remove('hidden');
    }
    updateStats();
}

function switchTab(tab) {
    activeTab = tab;
    // Update UI tabs
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');
    renderStudentTabs();
}

// Render active students list
function renderStudents(list, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 2rem; color: #6b7280;">
                <span style="font-size: 3rem; display: block; margin-bottom: 1rem;">👨‍🎓</span>
                <p>لا يوجد طلاب</p>
            </div>
        `;
        return;
    }

    container.innerHTML = list.map(student => `
        <div class="student-card" onclick="openRewardModal('${student.id}')">
            <div class="student-avatar">👨‍🎓</div>
            <div class="student-info">
                <div class="student-name">${student.name}</div>
                <div class="student-class">${student.class || ''}</div>
            </div>
            <div class="student-balance">
                <span class="balance-amount">${student.balance}</span>
                <span class="balance-label">نقطة</span>
            </div>
            <button class="add-reward-btn" onclick="event.stopPropagation(); openRewardModal('${student.id}')">
                🎁
            </button>
        </div>
    `).join('');
}

// Render pending students
function renderPendingStudents() {
    const container = document.getElementById('pendingList');
    if (!container) return;

    if (pendingStudents.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 2rem; color: #6b7280;">
                <p>لا يوجد طلبات جديدة</p>
            </div>
        `;
        return;
    }

    container.innerHTML = pendingStudents.map(student => `
        <div class="student-card pending-card">
            <div class="student-avatar">⏳</div>
            <div class="student-info">
                <div class="student-name">${student.name}</div>
                <div class="student-class">${student.phone || 'رقم الهاتف: ' + student.email}</div>
            </div>
            <button class="btn btn-success" onclick="approveStudent('${student.id}')" style="background:#10b981; color:white; padding: 5px 15px; border-radius:15px; border:none; cursor:pointer;">
                قبول ✅
            </button>
        </div>
    `).join('');
}

async function approveStudent(studentId) {
    if (!confirm('هل تريد قبول هذا الطالب؟')) return;

    try {
        await db.collection('users').doc(studentId).update({
            approved: true
        });
        showToast('تم قبول الطالب بنجاح! 🎉');
        loadStudents(); // Reload
    } catch (error) {
        console.error('Error approving student:', error);
        showToast('حدث خطأ أثناء القبول', 'error');
    }
}

// Update stats
function updateStats() {
    document.getElementById('totalStudents').textContent = students.length;

    // Update Pending Badge if exists
    const pendingBadge = document.getElementById('pendingCountBadge');
    if (pendingBadge) {
        pendingBadge.textContent = pendingStudents.length;
        pendingBadge.style.display = pendingStudents.length > 0 ? 'inline-block' : 'none';
    }

    const totalGiven = students.reduce((sum, s) => sum + s.balance, 0);
    document.getElementById('totalGiven').textContent = totalGiven;
}

// Setup event listeners
function setupEventListeners() {
    // Language buttons
    document.querySelectorAll('.lang-mini-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.lang-mini-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            setLanguage(btn.dataset.lang);
        });
    });

    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (query === '') {
            renderStudents();
        } else {
            const filtered = students.filter(s =>
                s.name.toLowerCase().includes(query)
            );
            renderStudents(filtered);
        }
    });

    // Reason chips
    document.querySelectorAll('.reason-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.reason-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            document.getElementById('rewardReason').value = chip.dataset.reason;
        });
    });

    // Reward form
    document.getElementById('rewardForm').addEventListener('submit', handleRewardSubmit);

    // Close modal on overlay click
    document.getElementById('rewardModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('rewardModal')) {
            closeRewardModal();
        }
    });

    // Initialize Bulk Listeners
    setupBulkListeners();
}

// Open reward modal
function openRewardModal(studentId) {
    selectedStudent = students.find(s => s.id === studentId);
    if (!selectedStudent) return;

    document.getElementById('modalStudentName').textContent = selectedStudent.name;
    document.getElementById('modalCurrentBalance').textContent = selectedStudent.balance;
    document.getElementById('rewardAmount').value = 5;
    document.getElementById('rewardReason').value = '';
    document.querySelectorAll('.reason-chip').forEach(c => c.classList.remove('active'));

    document.getElementById('rewardModal').classList.remove('hidden');
}

// Close reward modal
function closeRewardModal() {
    document.getElementById('rewardModal').classList.add('hidden');
    selectedStudent = null;
}

// Adjust points
function adjustPoints(delta) {
    const input = document.getElementById('rewardAmount');
    let value = parseInt(input.value) || 0;
    value = Math.max(1, Math.min(100, value + delta));
    input.value = value;
}

// Handle reward submit
async function handleRewardSubmit(e) {
    e.preventDefault();

    if (!selectedStudent) return;

    const amount = parseInt(document.getElementById('rewardAmount').value) || 0;
    const reason = document.getElementById('rewardReason').value.trim();

    if (amount <= 0) {
        showToast('يرجى إدخال عدد نقاط صحيح', 'error');
        return;
    }

    if (!reason) {
        showToast('يرجى إدخال سبب المكافأة', 'error');
        return;
    }

    // Show loading
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner" style="width:20px;height:20px;border-width:2px;"></span>';
    submitBtn.disabled = true;

    try {
        if (currentEducator.uid !== 'demo') {
            // Real Firebase operation
            const result = await addReward(currentEducator.uid, selectedStudent.id, amount, reason);
            if (!result.success) throw new Error(result.error);
        }

        // Update local data
        selectedStudent.balance += amount;

        // Close modal and refresh
        closeRewardModal();
        renderStudents();
        updateStats();

        showToast(`تم إضافة ${amount} نقطة لـ ${selectedStudent.name}! 🎉`, 'success');

    } catch (error) {
        console.error('Reward error:', error);
        showToast('حدث خطأ، حاول مرة أخرى', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Handle logout
async function handleLogout() {
    try {
        await signOut();
        window.location.href = '../index.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast toast-${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ========================================
// Bulk Reward Logic
// ========================================

function openBulkRewardModal() {
    if (students.length === 0) {
        showToast('لا يوجد طلاب لتوزيع النقاط عليهم', 'error');
        return;
    }
    document.getElementById('bulkStudentCount').textContent = `عدد الطلاب: ${students.length}`;
    document.getElementById('bulkRewardAmount').value = 5;
    document.getElementById('bulkRewardReason').value = '';
    document.querySelectorAll('#bulkReasonChips .reason-chip').forEach(c => c.classList.remove('active'));

    document.getElementById('bulkRewardModal').classList.remove('hidden');
}

function closeBulkRewardModal() {
    document.getElementById('bulkRewardModal').classList.add('hidden');
}

function adjustBulkPoints(delta) {
    const input = document.getElementById('bulkRewardAmount');
    let value = parseInt(input.value) || 0;
    value = Math.max(1, Math.min(100, value + delta));
    input.value = value;
}

// Setup Bulk Listeners (Called in setupEventListeners)
function setupBulkListeners() {
    // Bulk Chips
    document.querySelectorAll('#bulkReasonChips .reason-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('#bulkReasonChips .reason-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            document.getElementById('bulkRewardReason').value = chip.dataset.reason;
        });
    });

    // Bulk Form
    document.getElementById('bulkRewardForm').addEventListener('submit', handleBulkRewardSubmit);

    // Close Modal
    document.getElementById('bulkRewardModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('bulkRewardModal')) {
            closeBulkRewardModal();
        }
    });

    // Add CSS for Actions Bar (Injected here for simplicity, ideally in CSS file)
    const style = document.createElement('style');
    style.textContent = `
        .actions-bar {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
        }
        .actions-bar .search-box {
            flex: 1;
            margin-bottom: 0;
        }
        .bulk-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            white-space: nowrap;
        }
    `;
    document.head.appendChild(style);
}

// Handle Bulk Submit
async function handleBulkRewardSubmit(e) {
    e.preventDefault();

    const amount = parseInt(document.getElementById('bulkRewardAmount').value) || 0;
    const reason = document.getElementById('bulkRewardReason').value.trim();

    if (amount <= 0 || !reason) {
        showToast('يرجى تعبئة جميع البيانات', 'error');
        return;
    }

    const confirmMsg = `هل أنت متأكد من توزيع ${amount} نقطة لـ ${students.length} طالب؟`;
    if (!confirm(confirmMsg)) return;

    // Show Loading
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner">⏳ جاري التوزيع...</span>';
    submitBtn.disabled = true;

    try {
        let successCount = 0;

        // Process in batches ( sequentially for MVP simplicity )
        for (const student of students) {
            try {
                if (currentEducator.uid !== 'demo') {
                    await addReward(currentEducator.uid, student.id, amount, reason);
                }
                student.balance += amount; // Update local state
                successCount++;
            } catch (err) {
                console.error(`Failed for ${student.name}`, err);
            }
        }

        closeBulkRewardModal();
        renderStudents();
        updateStats();
        showToast(`تم توزيع النقاط بنجاح على ${successCount} طالب!`, 'success');

    } catch (error) {
        console.error('Bulk error:', error);
        showToast('حدث خطأ أثناء التوزيع', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}
