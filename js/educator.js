// ========================================
// بذور المعرفة - Smart Eco-Market
// Educator Portal Logic
// ========================================

// Global state
let currentEducator = null;
let students = [];
let selectedStudent = null;

// Sample students for demo
const sampleStudents = [
    { id: '1', name: 'أحمد محمد', class: 'الصف الخامس أ', balance: 45 },
    { id: '2', name: 'سارة علي', class: 'الصف الخامس أ', balance: 32 },
    { id: '3', name: 'محمود خالد', class: 'الصف الخامس أ', balance: 58 },
    { id: '4', name: 'فاطمة حسن', class: 'الصف الخامس أ', balance: 21 },
    { id: '5', name: 'يوسف أحمد', class: 'الصف الخامس أ', balance: 67 },
    { id: '6', name: 'نور الدين', class: 'الصف الخامس أ', balance: 15 },
    { id: '7', name: 'ليلى عمر', class: 'الصف الخامس أ', balance: 40 },
    { id: '8', name: 'كريم سعيد', class: 'الصف الخامس أ', balance: 28 }
];

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
            await loadStudents();
        } else {
            // Demo mode
            currentEducator = { uid: 'demo', name: 'المربي' };
            students = sampleStudents;
            renderStudents();
            updateStats();
        }
    });
}

// Load students from Firebase
async function loadStudents() {
    try {
        students = await getEducatorStudents(currentEducator.uid);
        if (students.length === 0) {
            students = sampleStudents;
        }
        renderStudents();
        updateStats();
    } catch (error) {
        console.error('Error loading students:', error);
        students = sampleStudents;
        renderStudents();
        updateStats();
    }
}

// Render students list
function renderStudents(filteredList = null) {
    const container = document.getElementById('studentsList');
    const displayList = filteredList || students;

    if (displayList.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 2rem; color: #6b7280;">
                <span style="font-size: 3rem; display: block; margin-bottom: 1rem;">👨‍🎓</span>
                <p>لا يوجد طلاب</p>
            </div>
        `;
        return;
    }

    container.innerHTML = displayList.map(student => `
        <div class="student-card" onclick="openRewardModal('${student.id}')">
            <div class="student-avatar">👨‍🎓</div>
            <div class="student-info">
                <div class="student-name">${student.name}</div>
                <div class="student-class">${student.class}</div>
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

// Update stats
function updateStats() {
    document.getElementById('totalStudents').textContent = students.length;

    // Calculate total points distributed (in real app, this would come from transactions)
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
