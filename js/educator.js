// ========================================
// بذور المعرفة - Smart Eco-Market
// Educator Portal Logic (Updated for New System)
// ========================================

// Global state
let currentEducator = null;
let students = [];
let pendingStudents = [];
let selectedStudent = null;
let activeTab = 'active';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeFirebase();
    initI18n();

    // Check educator authentication
    currentEducator = getCurrentEducator();
    if (!currentEducator) {
        window.location.href = '../educator-login.html';
        return;
    }

    // Display educator info
    displayEducatorInfo();

    setupEventListeners();
    loadStudents();
    setupBulkListeners();
});

/**
 * Display educator information
 */
function displayEducatorInfo() {
    const welcomeEl = document.getElementById('educatorWelcomeName');
    if (welcomeEl && currentEducator) {
        welcomeEl.textContent = `مرحباً ${currentEducator.name} - الصف ${currentEducator.grade} شعبة ${currentEducator.section}`;
    }
}

/**
 * Load students from Firebase
 */
async function loadStudents() {
    if (!db || !currentEducator) return;

    try {
        // Load active students (approved and in educator's class)
        const activeSnapshot = await db.collection('users')
            .where('role', '==', 'student')
            .where('grade', '==', currentEducator.grade)
            .where('section', '==', currentEducator.section)
            .where('approved', '==', true)
            .get();

        students = activeSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Load pending students (not approved and in educator's class)
        const pendingSnapshot = await db.collection('users')
            .where('role', '==', 'student')
            .where('grade', '==', currentEducator.grade)
            .where('section', '==', currentEducator.section)
            .where('approved', '==', false)
            .get();

        pendingStudents = pendingSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(`✅ Loaded ${students.length} active students, ${pendingStudents.length} pending`);

        renderStudentTabs();
        updateStats();
    } catch (error) {
        console.error('❌ Error loading students:', error);
        showToast('حدث خطأ في تحميل الطلاب', 'error');
    }
}

/**
 * Render student tabs
 */
function renderStudentTabs() {
    if (activeTab === 'active') {
        renderStudents(students, 'studentsList');
        document.getElementById('studentsList').classList.remove('hidden');
        document.getElementById('pendingList').classList.add('hidden');
    } else {
        renderPendingStudents();
        document.getElementById('studentsList').classList.add('hidden');
        document.getElementById('pendingList').classList.remove('hidden');
    }

    // Update tab buttons
    document.getElementById('tab-active').classList.toggle('active', activeTab === 'active');
    document.getElementById('tab-pending').classList.toggle('active', activeTab === 'pending');

    // Update pending badge
    const badge = document.getElementById('pendingCountBadge');
    if (pendingStudents.length > 0) {
        badge.textContent = pendingStudents.length;
        badge.style.display = 'inline';
    } else {
        badge.style.display = 'none';
    }
}

/**
 * Switch between tabs
 */
function switchTab(tab) {
    activeTab = tab;
    renderStudentTabs();
}

/**
 * Render active students list
 */
function renderStudents(list, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">👨‍🎓</span>
                <p>لا يوجد طلاب نشطون حالياً</p>
            </div>
        `;
        return;
    }

    container.innerHTML = list.map(student => `
        <div class="student-card" data-student-id="${student.id}">
            <div class="student-info">
                <div class="student-avatar">${student.name.charAt(0)}</div>
                <div class="student-details">
                    <h3 class="student-name">${student.name}</h3>
                    <p class="student-meta">الصف ${student.grade || ''} - شعبة ${student.section || ''}</p>
                </div>
            </div>
            <div class="student-balance">
                <span class="balance-value">${student.balance || 0}</span>
                <span class="balance-label">نقطة</span>
            </div>
            <button class="btn btn-icon reward-btn" onclick="openRewardModal('${student.id}')" title="إضافة نقاط">
                <span>🎁</span>
            </button>
        </div>
    `).join('');
}

/**
 * Render pending students
 */
function renderPendingStudents() {
    const container = document.getElementById('pendingList');
    if (!container) return;

    if (pendingStudents.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">✅</span>
                <p>لا توجد طلبات معلقة</p>
            </div>
        `;
        return;
    }

    container.innerHTML = pendingStudents.map(student => `
        <div class="student-card pending-card" data-student-id="${student.id}">
            <div class="student-info">
                <div class="student-avatar">${student.name.charAt(0)}</div>
                <div class="student-details">
                    <h3 class="student-name">${student.name}</h3>
                    <p class="student-meta">الصف ${student.grade || ''} - شعبة ${student.section || ''}</p>
                    <p class="student-meta" style="font-size:0.85rem; color:#888;">📞 ${student.phone || 'غير متوفر'}</p>
                </div>
            </div>
            <div class="pending-actions">
                <button class="btn btn-success btn-sm" onclick="approveStudent('${student.id}')" data-i18n="approveStudent">
                    ✅ قبول
                </button>
                <button class="btn btn-danger btn-sm" onclick="rejectStudent('${student.id}')" data-i18n="rejectStudent">
                    ❌ رفض
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Approve student
 */
async function approveStudent(studentId) {
    if (!confirm('هل تريد قبول هذا الطالب؟')) return;

    try {
        await db.collection('users').doc(studentId).update({
            approved: true,
            approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
            approvedBy: currentEducator.id
        });

        showToast('تم قبول الطالب بنجاح! ✅', 'success');

        // Reload students
        await loadStudents();
    } catch (error) {
        console.error('❌ Error approving student:', error);
        showToast('حدث خطأ في قبول الطالب', 'error');
    }
}

/**
 * Reject student
 */
async function rejectStudent(studentId) {
    if (!confirm('هل تريد رفض هذا الطالب؟ سيتم حذف حسابه نهائياً.')) return;

    try {
        // Delete the user document
        await db.collection('users').doc(studentId).delete();

        showToast('تم رفض وحذف الطالب', 'success');

        // Reload students
        await loadStudents();
    } catch (error) {
        console.error('❌ Error rejecting student:', error);
        showToast('حدث خطأ في رفض الطالب', 'error');
    }
}

/**
 * Update stats
 */
function updateStats() {
    document.getElementById('totalStudents').textContent = students.length;

    // Calculate total points given (this would require tracking in a separate collection)
    // For now, we'll just show the count
    document.getElementById('totalGiven').textContent = '-';
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = students.filter(s =>
                s.name.toLowerCase().includes(query)
            );
            renderStudents(filtered, 'studentsList');
        });
    }

    // Reason chips in reward modal
    document.querySelectorAll('.reason-chip').forEach(chip => {
        chip.addEventListener('click', function () {
            document.getElementById('rewardReason').value = this.dataset.reason;

            // Visual feedback
            document.querySelectorAll('.reason-chip').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Reward form submit
    const rewardForm = document.getElementById('rewardForm');
    if (rewardForm) {
        rewardForm.addEventListener('submit', handleRewardSubmit);
    }
}

/**
 * Open reward modal
 */
function openRewardModal(studentId) {
    selectedStudent = students.find(s => s.id === studentId);
    if (!selectedStudent) return;

    document.getElementById('modalStudentName').textContent = selectedStudent.name;
    document.getElementById('modalCurrentBalance').textContent = selectedStudent.balance || 0;
    document.getElementById('rewardAmount').value = 5;
    document.getElementById('rewardReason').value = '';

    // Remove active class from all chips
    document.querySelectorAll('.reason-chip').forEach(c => c.classList.remove('active'));

    document.getElementById('rewardModal').classList.remove('hidden');
}

/**
 * Close reward modal
 */
function closeRewardModal() {
    document.getElementById('rewardModal').classList.add('hidden');
}

/**
 * Adjust points
 */
function adjustPoints(delta) {
    const input = document.getElementById('rewardAmount');
    let value = parseInt(input.value) || 0;
    value += delta;
    if (value < 1) value = 1;
    if (value > 100) value = 100;
    input.value = value;
}

/**
 * Check weekly points limit for a student
 */
async function checkWeeklyPointsLimit(studentId) {
    const { weekNumber } = getWeekBoundaries();
    const weekKey = `${currentEducator.id}_${studentId}_${weekNumber}`;

    try {
        const doc = await db.collection('weeklyPoints').doc(weekKey).get();

        if (doc.exists) {
            return doc.data().pointsGiven || 0;
        }
        return 0;
    } catch (error) {
        console.error('Error checking weekly limit:', error);
        return 0;
    }
}

/**
 * Update weekly points tracker
 */
async function updateWeeklyPoints(studentId, pointsToAdd) {
    const { weekNumber, start, end } = getWeekBoundaries();
    const weekKey = `${currentEducator.id}_${studentId}_${weekNumber}`;

    try {
        const docRef = db.collection('weeklyPoints').doc(weekKey);
        const doc = await docRef.get();

        if (doc.exists) {
            await docRef.update({
                pointsGiven: firebase.firestore.FieldValue.increment(pointsToAdd),
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            await docRef.set({
                educatorId: currentEducator.id,
                studentId: studentId,
                weekNumber: weekNumber,
                weekStart: firebase.firestore.Timestamp.fromDate(start),
                weekEnd: firebase.firestore.Timestamp.fromDate(end),
                pointsGiven: pointsToAdd,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    } catch (error) {
        console.error('Error updating weekly points:', error);
        throw error;
    }
}

/**
 * Handle reward submit
 */
async function handleRewardSubmit(e) {
    e.preventDefault();

    if (!selectedStudent) return;

    const amount = parseInt(document.getElementById('rewardAmount').value);
    const reason = document.getElementById('rewardReason').value.trim();

    if (!amount || amount < 1) {
        showToast('يرجى إدخال عدد نقاط صحيح', 'error');
        return;
    }

    if (!reason) {
        showToast('يرجى إدخال سبب المكافأة', 'error');
        return;
    }

    // Check weekly limit
    const weeklyPointsUsed = await checkWeeklyPointsLimit(selectedStudent.id);
    if (weeklyPointsUsed + amount > currentEducator.weeklyPointsLimit) {
        showToast(`❌ تجاوزت الحد الأسبوعي! لقد أعطيت ${weeklyPointsUsed} نقاط هذا الأسبوع.`, 'error');
        return;
    }

    try {
        // Add reward transaction
        await addReward(currentEducator.id, selectedStudent.id, amount, reason);

        // Update weekly tracker
        await updateWeeklyPoints(selectedStudent.id, amount);

        showToast(`تمت إضافة ${amount} نقطة لـ ${selectedStudent.name} ✅`, 'success');
        closeRewardModal();

        // Reload students to update balance
        await loadStudents();
    } catch (error) {
        console.error('❌ Error adding reward:', error);
        showToast('حدث خطأ في إضافة المكافأة', 'error');
    }
}

/**
 * Handle logout
 */
function handleLogout() {
    if (confirm('هل تريد تسجيل الخروج؟')) {
        logoutEducator();
    }
}

/**
 * Toast notification
 */
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
    document.getElementById('bulkStudentCount').textContent = `عدد الطلاب: ${students.length}`;
    document.getElementById('bulkRewardAmount').value = 5;
    document.getElementById('bulkRewardReason').value = '';
    document.getElementById('bulkRewardModal').classList.remove('hidden');
}

function closeBulkRewardModal() {
    document.getElementById('bulkRewardModal').classList.add('hidden');
}

function adjustBulkPoints(delta) {
    const input = document.getElementById('bulkRewardAmount');
    let value = parseInt(input.value) || 0;
    value += delta;
    if (value < 1) value = 1;
    if (value > 100) value = 100;
    input.value = value;
}

// Setup Bulk Listeners
function setupBulkListeners() {
    // Bulk reason chips
    document.querySelectorAll('#bulkReasonChips .reason-chip').forEach(chip => {
        chip.addEventListener('click', function () {
            document.getElementById('bulkRewardReason').value = this.dataset.reason;
            document.querySelectorAll('#bulkReasonChips .reason-chip').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Bulk form submit
    const bulkForm = document.getElementById('bulkRewardForm');
    if (bulkForm) {
        bulkForm.addEventListener('submit', handleBulkRewardSubmit);
    }
}

// Handle Bulk Submit
async function handleBulkRewardSubmit(e) {
    e.preventDefault();

    const amount = parseInt(document.getElementById('bulkRewardAmount').value);
    const reason = document.getElementById('bulkRewardReason').value.trim();

    if (!amount || amount < 1) {
        showToast('يرجى إدخال عدد نقاط صحيح', 'error');
        return;
    }

    if (!reason) {
        showToast('يرجى إدخال سبب المكافأة', 'error');
        return;
    }

    if (students.length === 0) {
        showToast('لا يوجد طلاب لتوزيع النقاط عليهم', 'error');
        return;
    }

    if (!confirm(`هل تريد توزيع ${amount} نقطة لكل طالب (${students.length} طالب)؟`)) {
        return;
    }

    try {
        let successCount = 0;
        let failedCount = 0;

        for (const student of students) {
            try {
                // Check weekly limit for each student
                const weeklyPointsUsed = await checkWeeklyPointsLimit(student.id);
                if (weeklyPointsUsed + amount > currentEducator.weeklyPointsLimit) {
                    console.warn(`Skipping ${student.name}: weekly limit reached`);
                    failedCount++;
                    continue;
                }

                await addReward(currentEducator.id, student.id, amount, reason);
                await updateWeeklyPoints(student.id, amount);
                successCount++;
            } catch (error) {
                console.error(`Error for student ${student.id}:`, error);
                failedCount++;
            }
        }

        closeBulkRewardModal();
        showToast(`✅ تم توزيع النقاط على ${successCount} طالب${failedCount > 0 ? ` (${failedCount} فشل)` : ''}`, 'success');

        await loadStudents();
    } catch (error) {
        console.error('❌ Bulk reward error:', error);
        showToast('حدث خطأ في التوزيع الجماعي', 'error');
    }
}
