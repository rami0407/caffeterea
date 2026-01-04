// ========================================
// بذور المعرفة - Smart Eco-Market
// Educator Authentication Logic
// ========================================

// Global state
let currentEducator = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeFirebase();
    initI18n();
    setupEducatorLoginForm();
});

/**
 * Setup educator login form
 */
function setupEducatorLoginForm() {
    const form = document.getElementById('educatorLoginForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleEducatorLogin();
    });
}

/**
 * Handle educator login
 */
async function handleEducatorLogin() {
    const phoneInput = document.getElementById('educatorPhone');
    const errorMsg = document.getElementById('errorMessage');
    const successMsg = document.getElementById('successMessage');

    const phone = phoneInput.value.trim();

    // Validation
    if (!phone || phone.length !== 10) {
        showError('يرجى إدخال رقم هاتف صحيح (10 أرقام)');
        return;
    }

    try {
        // Find educator in database
        const educator = findEducatorByPhone(phone);

        if (!educator) {
            showError('رقم الهاتف غير موجود في قاعدة البيانات');
            return;
        }

        // Store educator session in localStorage
        localStorage.setItem('educatorSession', JSON.stringify({
            id: educator.id,
            name: educator.name,
            phone: educator.phone,
            grade: educator.grade,
            section: educator.section,
            weeklyPointsLimit: educator.weeklyPointsLimit,
            loginTime: new Date().toISOString()
        }));

        // Show success message
        successMsg.textContent = `مرحباً ${educator.name}! جاري التوجيه...`;
        successMsg.style.display = 'block';
        errorMsg.classList.add('hidden');

        // Redirect to educator portal
        setTimeout(() => {
            window.location.href = 'educator/students.html';
        }, 1000);

    } catch (error) {
        console.error('Login error:', error);
        showError('حدث خطأ أثناء تسجيل الدخول');
    }
}

/**
 * Show error message
 */
function showError(message) {
    const errorMsg = document.getElementById('errorMessage');
    const successMsg = document.getElementById('successMessage');

    errorMsg.textContent = message;
    errorMsg.classList.remove('hidden');
    successMsg.style.display = 'none';
}

/**
 * Get current educator from session
 */
function getCurrentEducator() {
    const session = localStorage.getItem('educatorSession');
    if (!session) return null;

    try {
        const educator = JSON.parse(session);
        // Check if session is still valid (24 hours)
        const loginTime = new Date(educator.loginTime);
        const now = new Date();
        const hoursDiff = (now - loginTime) / (1000 * 60 * 60);

        if (hoursDiff > 24) {
            // Session expired
            localStorage.removeItem('educatorSession');
            return null;
        }

        return educator;
    } catch (error) {
        console.error('Error parsing educator session:', error);
        return null;
    }
}

/**
 * Logout educator
 */
function logoutEducator() {
    localStorage.removeItem('educatorSession');
    window.location.href = '../educator-login.html';
}

/**
 * Calculate week boundaries (Sunday to Saturday)
 * @returns {object} - { start, end } timestamps
 */
function getWeekBoundaries() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday

    // Start of week (Sunday 00:00:00)
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);

    // End of week (Saturday 23:59:59)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return {
        start: weekStart,
        end: weekEnd,
        weekNumber: getWeekNumber(now)
    };
}

/**
 * Get week number in year
 * @param {Date} date 
 * @returns {string} - Format: YYYY-WW
 */
function getWeekNumber(date) {
    const d = new Date(date);
    const dayOfWeek = d.getDay();

    // Get Sunday of current week
    const sunday = new Date(d);
    sunday.setDate(d.getDate() - dayOfWeek);

    // Get first day of year
    const firstDay = new Date(d.getFullYear(), 0, 1);
    const daysSinceFirstDay = Math.floor((sunday - firstDay) / (24 * 60 * 60 * 1000));
    const weekNum = Math.ceil((daysSinceFirstDay + firstDay.getDay() + 1) / 7);

    return `${d.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.getCurrentEducator = getCurrentEducator;
    window.logoutEducator = logoutEducator;
    window.getWeekBoundaries = getWeekBoundaries;
    window.getWeekNumber = getWeekNumber;
}
