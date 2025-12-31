// ========================================
// بذور المعرفة - Smart Eco-Market
// Authentication Logic
// ========================================

// Role icons mapping
const roleIcons = {
    student: '👨‍🎓',
    educator: '👨‍🏫',
    cafeteria: '👨‍🍳',
    admin: '👨‍💼'
};

// Role redirect paths
const roleRedirects = {
    student: 'student/menu.html',
    educator: 'educator/students.html',
    cafeteria: 'cafeteria/orders.html',
    admin: 'admin/dashboard.html'
};

// Get role from URL
function getRoleFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('role') || 'student';
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Firebase
    initializeFirebase();

    // Initialize i18n
    initI18n();

    // Set role icon
    const role = getRoleFromURL();
    const roleIcon = document.getElementById('roleIcon');
    if (roleIcon) {
        roleIcon.textContent = roleIcons[role] || '👨‍🎓';
    }

    // Show student-only fields if student
    if (role === 'student') {
        document.body.classList.add('show-student-fields');
    }

    // Language switcher
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            setLanguage(btn.dataset.lang);
        });
    });

    // Tab switching
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;

            // Update active tab
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Show/hide forms
            document.getElementById('loginForm').classList.toggle('hidden', tabName !== 'login');
            document.getElementById('registerForm').classList.toggle('hidden', tabName !== 'register');

            // Hide error
            hideError();
        });
    });

    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);

    // Register form
    document.getElementById('registerForm').addEventListener('submit', handleRegister);

    // Check if already logged in
    onAuthStateChange(({ user, userData }) => {
        if (user && userData) {
            // Redirect to appropriate page
            window.location.href = roleRedirects[userData.role] || 'index.html';
        }
    });
});

// Handle login
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Validate
    if (!email) {
        showError(t('emailRequired'));
        return;
    }
    if (!password) {
        showError(t('passwordRequired'));
        return;
    }

    // Show loading
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `<span class="spinner" style="width:20px;height:20px;border-width:2px;"></span>`;
    submitBtn.disabled = true;

    try {
        const result = await signIn(email, password);

        if (result.success) {
            showToast(t('success'), 'success');

            // Redirect based on role
            setTimeout(() => {
                window.location.href = roleRedirects[result.userData.role] || 'index.html';
            }, 500);
        } else {
            // Handle specific errors
            let errorMsg = t('error');
            if (result.error.includes('user-not-found')) {
                errorMsg = t('userNotFound');
            } else if (result.error.includes('wrong-password')) {
                errorMsg = t('wrongPassword');
            } else if (result.error.includes('invalid-email')) {
                errorMsg = t('invalidEmail');
            }
            showError(errorMsg);
        }
    } catch (error) {
        showError(t('error'));
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Handle register
async function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const className = document.getElementById('regClass')?.value.trim() || '';
    const role = getRoleFromURL();

    // Validate
    if (!name) {
        showError('الاسم مطلوب');
        return;
    }
    if (!email) {
        showError(t('emailRequired'));
        return;
    }
    if (!password) {
        showError(t('passwordRequired'));
        return;
    }
    if (password.length < 6) {
        showError(t('weakPassword'));
        return;
    }
    if (password !== confirmPassword) {
        showError('كلمات المرور غير متطابقة');
        return;
    }

    // Show loading
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `<span class="spinner" style="width:20px;height:20px;border-width:2px;"></span>`;
    submitBtn.disabled = true;

    try {
        const result = await signUp(email, password, {
            name,
            role,
            class: className
        });

        if (result.success) {
            showToast(t('success'), 'success');

            // Redirect based on role
            setTimeout(() => {
                window.location.href = roleRedirects[role] || 'index.html';
            }, 500);
        } else {
            // Handle specific errors
            let errorMsg = t('error');
            if (result.error.includes('email-already-in-use')) {
                errorMsg = t('emailInUse');
            } else if (result.error.includes('weak-password')) {
                errorMsg = t('weakPassword');
            } else if (result.error.includes('invalid-email')) {
                errorMsg = t('invalidEmail');
            }
            showError(errorMsg);
        }
    } catch (error) {
        showError(t('error'));
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Show error message
function showError(message) {
    const errorEl = document.getElementById('errorMessage');
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
}

// Hide error message
function hideError() {
    const errorEl = document.getElementById('errorMessage');
    errorEl.classList.add('hidden');
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast toast-${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
