// ========================================
// بذور المعرفة - Smart Eco-Market
// Educator Authentication Logic (Patched for Security)
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
        // 1. Find educator in local data (Client-side check)
        // Note: findEducatorByPhone is assumed to be in educators-data.js
        const educator = findEducatorByPhone(phone);

        if (!educator) {
            showError('رقم الهاتف غير موجود في قاعدة البيانات');
            return;
        }

        // 2. Perform Real Firebase Login (Anonymous)
        // This creates a valid 'request.auth' token for Firestore Rules
        console.log('🔄 جاري الاتصال بخادم Firebase...');
        await auth.signInAnonymously();
        console.log('✅ تم الاتصال بـ Firebase بنجاح (Anonymous Auth)');

        // 3. Store educator session in localStorage (for UI persistence)
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
        showError('حدث خطأ في الاتصال بالخادم: ' + error.message);
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
async function logoutEducator() {
    try {
        await auth.signOut(); // Sign out from Firebase
    } catch (e) {
        console.warn('Firebase signout error:', e);
    }
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
    const yearStart = new Date(sunday.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((sunday - yearStart + (24 * 60 * 60 * 1000)) / 86400000);
    
    return `${sunday.getFullYear()}-${Math.ceil(dayOfYear / 7)}`;
}
