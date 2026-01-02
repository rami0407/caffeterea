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

    // Configure UI based on role
    configureRoleUI(role);

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
    document.getElementById('loginForm').addEventListener('submit', (e) => handleLogin(e, role));

    // Register form
    document.getElementById('registerForm').addEventListener('submit', (e) => handleRegister(e, role));

    // Check if already logged in
    onAuthStateChange(async ({ user, userData }) => {
        if (user && userData) {
            // Check if logged-in role matches the requested role (from URL)
            // If mismatch (e.g. Admin on Student login), sign out to allow switching
            if (userData.role !== role) {
                console.log(`Role mismatch: ${userData.role} vs ${role}. Signing out...`);
                await signOut();
                window.location.reload();
                return;
            }

            // Security: Check if student is approved
            if (userData.role === 'student' && userData.approved === false) {
                console.log('User not approved. Signing out...');
                await signOut();
                showError('الحساب بانتظار موافقة المربي. يرجى مراجعة مربي الصف.', true);
                return;
            }

            // Redirect to appropriate page
            window.location.href = roleRedirects[userData.role] || 'index.html';
        }
    });

    // Forgot Password Handler
    const forgotLink = document.getElementById('forgotPasswordLink');
    if (forgotLink) {
        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (role === 'student') {
                showError(t('accountPending') || 'يرجى مراجعة مربي الصف لاستعادة كلمة المرور', true);
            } else {
                openResetModal();
            }
        });
    }
});

// Reset Modal Functions
function openResetModal() {
    const modal = document.getElementById('resetPasswordModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.remove('hidden');
    }
}

function closeResetModal() {
    const modal = document.getElementById('resetPasswordModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.add('hidden');
    }
}

async function handleResetSubmit() {
    const email = document.getElementById('resetEmailInput').value.trim();
    if (!email) {
        alert('يرجى إدخال البريد الإلكتروني');
        return;
    }

    const btn = document.querySelector('#resetPasswordModal button.btn-primary');
    const originalText = btn.textContent;
    btn.textContent = 'جاري الإرسال...';
    btn.disabled = true;

    const result = await resetPassword(email);

    if (result.success) {
        alert('تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني.');
        closeResetModal();
    } else {
        alert('حدث خطأ: ' + result.error);
    }

    btn.textContent = originalText;
    btn.disabled = false;
}

// Configure UI for specific role
function configureRoleUI(role) {
    // Show student-only fields if student
    if (role === 'student') {
        document.body.classList.add('show-student-fields');

        // Update labels to "Phone Number" instead of "Email"
        updateInputType('loginEmail', 'lblLoginEmail', 'phone');
        updateInputType('regEmail', 'lblRegEmail', 'phone');
    }

    // ADMIN UI: Hide registration tab
    if (role === 'admin') {
        // Hide the tabs container or just the register tab
        const tabs = document.querySelector('.auth-tabs');
        if (tabs) tabs.style.display = 'none'; // Lock to "Login" only

        // Ensure title reflects role
        const title = document.querySelector('.auth-tab[data-tab="login"]');
        if (title) title.textContent = 'دخول الإدارة';
    }
}

// Update input type and label
function updateInputType(inputId, labelId, type) {
    const input = document.getElementById(inputId);
    const label = document.getElementById(labelId);

    if (type === 'phone') {
        input.type = 'tel';
        input.pattern = '[0-9]{10}';
        input.inputMode = 'numeric';
        input.setAttribute('data-i18n-placeholder', 'phone');
        label.setAttribute('data-i18n', 'phone');

        // Trigger translation update if i18n is ready
        if (typeof applyLanguage === 'function') applyLanguage();
    }
}

// Handle login
async function handleLogin(e, role) {
    e.preventDefault();

    let identifier = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Validation
    if (!identifier) {
        showError(role === 'student' ? t('phoneRequired') : t('emailRequired'));
        return;
    }

    // Process identifier based on role
    if (role === 'student') {
        if (!isValidPhone(identifier)) {
            showError(t('invalidPhone'));
            return;
        }
        // Convert phone to email logic
        identifier = `${identifier}@student.smart-eco.market`;
    }

    // ADMIN SECURITY: Enforce specific credentials
    if (role === 'admin') {
        if (identifier !== 'rami_admin@knowledge-canteen.com') {
            showError('عذراً، هذا البريد غير مصرح له بالدخول كمسؤول.');
            return;
        }

        // Enforce specific password check on frontend (as requested)
        if (password !== 'rami2244') {
            showError('كلمة المرور غير صحيحة للإدارة.'); // Custom error before even trying Firebase
            return;
        }
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
        const result = await signIn(identifier, password);

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
                errorMsg = role === 'student' ? t('invalidPhone') : t('invalidEmail');
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
async function handleRegister(e, role) {
    e.preventDefault();

    const name = document.getElementById('regName').value.trim();
    let identifier = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    // Get Educator
    const educatorName = document.getElementById('regEducator')?.value || '';

    // Validate
    if (!name) {
        showError('الاسم مطلوب');
        return;
    }

    if (role === 'student' && !educatorName) {
        showError('يرجى اختيار المربي');
        return;
    }

    // Generic Identifier Validation
    if (!identifier) {
        showError(role === 'student' ? t('phoneRequired') : t('emailRequired'));
        return;
    }

    // SECURITY: Prevent public registration for restricted roles
    if (role === 'cafeteria' || role === 'admin') {
        showError('عذراً، تسجيل حساب المقصف والإدارة يتم عن طريق النظام فقط.');
        return;
    }

    if (role === 'student') {
        if (!isValidPhone(identifier)) {
            showError(t('invalidPhone'));
            return;
        }
        // Convert phone to email logic
        identifier = `${identifier}@student.smart-eco.market`;
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
        const result = await signUp(identifier, password, {
            name,
            role,
            educatorName: role === 'student' ? educatorName : '',
            approved: role !== 'student', // Students need approval, others auto-approved
            // Store original phone if needed
            phone: role === 'student' ? identifier.split('@')[0] : null
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
                errorMsg = role === 'student' ? t('phoneInUse') : t('emailInUse');
            } else if (result.error.includes('weak-password')) {
                errorMsg = t('weakPassword');
            } else if (result.error.includes('invalid-email')) {
                errorMsg = role === 'student' ? t('invalidPhone') : t('invalidEmail');
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

// Validate Phone Number (10 digits)
function isValidPhone(phone) {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
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
