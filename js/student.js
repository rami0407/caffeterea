// ========================================
// بذور المعرفة - Smart Eco-Market
// Student Portal Logic
// ========================================

// Global state
let currentUser = null;
let products = [];
let cart = [];
let currentCategory = 'all';

// Sample products (will be replaced with Firebase data)
const sampleProducts = [
    {
        id: '1',
        name_ar: 'سندويش جبنة صفراء',
        name_he: 'כריך גבינה צהובה',
        price: 5,
        category: 'sandwiches',
        icon: '🧀',
        calories: 250,
        sugar: 1,
        available: true
    },
    {
        id: '2',
        name_ar: 'سندويش لبنة وزعتر',
        name_he: 'כריך לבנה וזעתר',
        price: 4,
        category: 'sandwiches',
        icon: '🥙',
        calories: 180,
        sugar: 1,
        available: true
    },
    {
        id: '3',
        name_ar: 'سندويش حمص',
        name_he: 'כריך חומוס',
        price: 4,
        category: 'sandwiches',
        icon: '🥙',
        calories: 220,
        sugar: 0,
        available: true
    },
    {
        id: '4',
        name_ar: 'عصير برتقال طبيعي',
        name_he: 'מיץ תפוזים טבעי',
        price: 6,
        category: 'drinks',
        icon: '🍊',
        calories: 120,
        sugar: 20,
        available: true
    },
    {
        id: '5',
        name_ar: 'ماء معدني',
        name_he: 'מים מינרליים',
        price: 2,
        category: 'drinks',
        icon: '💧',
        calories: 0,
        sugar: 0,
        available: true
    },
    {
        id: '6',
        name_ar: 'عصير تفاح',
        name_he: 'מיץ תפוחים',
        price: 5,
        category: 'drinks',
        icon: '🍎',
        calories: 110,
        sugar: 23,
        available: true
    },
    {
        id: '7',
        name_ar: 'بسكويت شوفان',
        name_he: 'עוגיות שיבולת שועל',
        price: 3,
        category: 'snacks',
        icon: '🍪',
        calories: 150,
        sugar: 8,
        available: true
    },
    {
        id: '8',
        name_ar: 'كعكة تمر',
        name_he: 'עוגת תמרים',
        price: 4,
        category: 'snacks',
        icon: '🧁',
        calories: 280,
        sugar: 25,
        available: true
    },
    {
        id: '9',
        name_ar: 'سلطة خضار',
        name_he: 'סלט ירקות',
        price: 6,
        category: 'healthy',
        icon: '🥗',
        calories: 80,
        sugar: 2,
        available: true
    },
    {
        id: '10',
        name_ar: 'فواكه مقطعة',
        name_he: 'פירות חתוכים',
        price: 5,
        category: 'healthy',
        icon: '🍇',
        calories: 60,
        sugar: 12,
        available: true
    },
    {
        id: '11',
        name_ar: 'لبن زبادي',
        name_he: 'יוגורט',
        price: 3,
        category: 'healthy',
        icon: '🥛',
        calories: 100,
        sugar: 9,
        available: true
    },
    {
        id: '12',
        name_ar: 'شوكولاتة',
        name_he: 'שוקולד',
        price: 4,
        category: 'snacks',
        icon: '🍫',
        calories: 500,
        sugar: 50,
        available: true
    }
];

// Calculate Traffic Light Color
function calculateTrafficLight(calories, sugar) {
    if (sugar > 20 || calories > 400) return 'red';
    if (sugar > 10 || calories > 200) return 'yellow';
    return 'green';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Firebase
    initializeFirebase();

    // Initialize i18n
    initI18n();

    // Load saved cart
    loadCart();

    // Setup event listeners
    setupEventListeners();

    // Check auth and load data
    checkAuthAndLoad();
});

// Check authentication and load data
function checkAuthAndLoad() {
    onAuthStateChange(async ({ user, userData }) => {
        if (user && userData) {
            currentUser = userData;
            // Persistence: Display Name
            const nameDisplay = document.getElementById('userNameDisplay');
            if (nameDisplay) nameDisplay.textContent = `مرحباً، ${userData.name || 'طالب'}`;

            updateBalanceDisplay();
            await loadProducts();
        } else {
            // For demo, allow guest access
            currentUser = { balance: 50, role: 'student' };
            updateBalanceDisplay();
            loadSampleProducts();
        }
    });
}

// Load products from Firebase
let productsUnsubscribe = null;

async function loadProducts() {
    try {
        // Subscribe to products for real-time updates
        if (typeof subscribeToProducts === 'function') {
            productsUnsubscribe = subscribeToProducts((newProducts) => {
                products = newProducts;
                console.log('✅ Student products updated:', products.length);

                // If empty and seed available, seed once
                if (products.length === 0 && typeof seedProducts === 'function') {
                    seedProducts().then(() => {
                        // Subscription will auto-update
                    });
                }

                renderCategories();
                renderProducts();
            });
        } else {
            console.error('subscribeToProducts function not found');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('productsGrid').innerHTML = '<p class="error-text">حدث خطأ في تحميل المنتجات</p>';
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (productsUnsubscribe) {
        productsUnsubscribe();
    }
});

// Load sample products (removed)
function loadSampleProducts() {
    console.warn('Sample products removed. Using Firebase data only.');
}

// Render products
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    const lang = getCurrentLang();

    const filteredProducts = currentCategory === 'all'
        ? products
        : products.filter(p => p.category === currentCategory);

    if (filteredProducts.length === 0) {
        grid.innerHTML = `
            <div class="loading-state">
                <span style="font-size: 3rem; opacity: 0.5;">🔍</span>
                <p>${t('noResults')}</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filteredProducts.map(product => {
        const trafficColor = calculateTrafficLight(product.calories || 0, product.sugar || 0);
        // Better fallback: check both language versions
        const productName = lang === 'he'
            ? (product.name_he || product.name_ar || product.name || 'منتج')
            : (product.name_ar || product.name_he || product.name || 'منتج');

        const caloriesBadge = product.calories ? `<div style="font-size: 0.8rem; color: #64748b; margin-top: 3px;">🔥 ${product.calories} ${lang === 'he' ? 'קלוריות' : 'سعرة'}</div>` : '';

        return `
        <div class="product-card" data-id="${product.id}">
            <div class="nutrition-badge ${trafficColor}">
                ${trafficColor === 'green' ? '●' : trafficColor === 'yellow' ? '●' : '●'}
            </div>
            <div class="product-image">${product.icon || '🍽️'}</div>
            <h3 class="product-name">${productName}</h3>
            <div class="product-price">${product.price}</div>
            ${caloriesBadge}
            <button class="add-to-cart-btn" onclick="addToCart('${product.id}')">
                ${t('addToCart')} +
            </button>
        </div>
    `;
    }).join('');
}

// Setup dynamic categories
function renderCategories() {
    const nav = document.querySelector('.categories-nav');
    if (!nav) return;

    // Get unique categories from products
    const categories = new Set(['all']); // Always start with 'all'
    products.forEach(p => {
        if (p.category) categories.add(p.category);
    });

    // Known translations for standard categories
    const catLabels = {
        'all': '🍽️ الكل',
        'sandwiches': '🥪 سندويشات',
        'drinks': '🥤 مشروبات',
        'snacks': '🍪 وجبات خفيفة',
        'healthy': '🥗 صحي'
    };

    nav.innerHTML = Array.from(categories).map(cat => {
        // Simple translation fallback for now, ideally use i18n
        let label = catLabels[cat] || `📦 ${cat}`;

        // Try i18n key lookup if it exists
        if (typeof t === 'function' && catLabels[cat]) {
            // If we had keys for them, but for now we stick to the map above or custom input
        }

        const isActive = currentCategory === cat ? 'active' : '';
        return `
            <button class="category-btn ${isActive}" data-category="${cat}">
                <span class="category-icon">${cat === 'all' ? '🍽️' : '📦'}</span>
                <span>${label}</span>
            </button>
        `;
    }).join('');

    // Re-attach listeners
    setupCategoryListeners();
}

// Setup event listeners
function setupEventListeners() {
    // Category buttons logic is handled after render
    setupCategoryListeners();

    // Cart button
    // ... rest of listeners

    document.getElementById('cartBtn').addEventListener('click', openCart);
    document.getElementById('closeCartBtn').addEventListener('click', closeCart);
    document.getElementById('cartOverlay').addEventListener('click', closeCart);

    // Checkout button
    document.getElementById('checkoutBtn').addEventListener('click', checkout);

    // Success modal close
    document.getElementById('closeSuccessBtn').addEventListener('click', () => {
        document.getElementById('successModal').classList.add('hidden');
        // Show waiting message after success modal closes
        setTimeout(() => {
            showWaitingMessage();
        }, 300);
    });

    // Waiting modal close
    document.getElementById('closeWaitingBtn').addEventListener('click', () => {
        document.getElementById('waitingModal').classList.add('hidden');
        // Show feedback modal after waiting message
        setTimeout(() => {
            showFeedbackModal();
        }, 500);
    });

    // Feedback modal
    document.getElementById('closeFeedbackBtn').addEventListener('click', closeFeedbackModal);
    document.querySelectorAll('.emoji-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
    document.getElementById('submitFeedbackBtn').addEventListener('click', submitFeedback);
}

function setupCategoryListeners() {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            renderProducts();
        });
    });
}

// Language buttons
document.querySelectorAll('.lang-mini-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.lang-mini-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        setLanguage(btn.dataset.lang);
        renderProducts();
        renderCart();
    });
});

// Cart functions
function loadCart() {
    const savedCart = localStorage.getItem('eco-market-cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
    }
}

function saveCart() {
    localStorage.setItem('eco-market-cart', JSON.stringify(cart));
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name_ar: product.name_ar,
            name_he: product.name_he,
            price: product.price,
            icon: product.icon,
            calories: product.calories || 0,
            quantity: 1
        });
    }

    saveCart();
    updateCartDisplay();

    // Visual feedback
    showToast(t('addToCart') + ' ✓', 'success');

    // Animate cart button
    const cartBtn = document.getElementById('cartBtn');
    cartBtn.style.transform = 'scale(1.2)';
    setTimeout(() => {
        cartBtn.style.transform = '';
    }, 200);
}

function updateQuantity(productId, delta) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    item.quantity += delta;

    if (item.quantity <= 0) {
        cart = cart.filter(item => item.id !== productId);
    }

    saveCart();
    updateCartDisplay();
    renderCart();
}

function updateCartDisplay() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cartTotal').textContent = total;

    // Show/hide empty state and footer
    const isEmpty = cart.length === 0;
    document.getElementById('cartEmpty').classList.toggle('hidden', !isEmpty);
    document.getElementById('cartItems').style.display = isEmpty ? 'none' : 'block';
    document.getElementById('cartFooter').style.display = isEmpty ? 'none' : 'block';
}

function renderCart() {
    const container = document.getElementById('cartItems');
    const lang = getCurrentLang();

    let totalCalories = 0;
    container.innerHTML = cart.map(item => {
        totalCalories += (item.calories || 0) * item.quantity;
        return `
        <div class="cart-item">
            <div class="cart-item-image">${item.icon || '🍽️'}</div>
            <div class="cart-item-details">
                <div class="cart-item-name">${lang === 'he' ? item.name_he : item.name_ar}</div>
                <div class="cart-item-price">${item.price} ${t('coins')}${item.calories ? ` | ${item.calories} ${lang === 'he' ? 'קלוריות' : 'سعرة'}` : ''}</div>
                <div class="cart-item-quantity">
                    <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">−</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                </div>
            </div>
        </div>
    `}).join('');

    updateCartDisplay();

    // Show total calories
    let calorieEl = document.getElementById('studentCartCalories');
    if (totalCalories > 0) {
        if (!calorieEl) {
            calorieEl = document.createElement('div');
            calorieEl.id = 'studentCartCalories';
            calorieEl.style.cssText = 'text-align: center; color: #ff6b35; font-weight: 600; margin: 10px 0; font-size: 0.95rem;';
            const footer = document.getElementById('cartFooter');
            if (footer) {
                footer.insertBefore(calorieEl, footer.firstChild);
            }
        }
        calorieEl.textContent = `🔥 ${lang === 'he' ? 'סך כל קלוריות' : 'إجمالي السعرات'}: ${totalCalories} ${lang === 'he' ? 'קלוריות' : 'سعرة'}`;
        calorieEl.style.display = 'block';
    } else if (calorieEl) {
        calorieEl.style.display = 'none';
    }
}

function openCart() {
    document.getElementById('cartSidebar').classList.add('show');
    document.getElementById('cartOverlay').classList.add('show');
    renderCart();
}

function closeCart() {
    document.getElementById('cartSidebar').classList.remove('show');
    document.getElementById('cartOverlay').classList.remove('show');
}

// Checkout
async function checkout() {
    if (cart.length === 0) return;

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Check balance
    if (currentUser.balance < total) {
        showToast(t('insufficientBalance'), 'error');
        return;
    }

    // Show loading
    const checkoutBtn = document.getElementById('checkoutBtn');
    const originalText = checkoutBtn.innerHTML;
    checkoutBtn.innerHTML = '<span class="spinner" style="width:20px;height:20px;border-width:2px;"></span>';
    checkoutBtn.disabled = true;

    try {
        // Create order
        const items = cart.map(item => ({
            id: item.id,
            name: getCurrentLang() === 'he' ? item.name_he : item.name_ar,
            price: item.price,
            quantity: item.quantity
        }));

        let orderNumber;

        if (currentUser.uid) {
            // Real Firebase order
            const result = await createOrder(currentUser.uid, items, total);
            if (result.success) {
                orderNumber = result.orderNumber;
                currentUser.balance -= total;
            } else {
                throw new Error(result.error);
            }
        } else {
            // Demo mode
            orderNumber = Math.floor(Math.random() * 100) + 1;
            currentUser.balance -= total;
        }

        // Clear cart
        cart = [];
        saveCart();
        updateCartDisplay();
        closeCart();

        // Update balance display
        updateBalanceDisplay();

        // Show success modal
        document.getElementById('orderNumberDisplay').textContent = orderNumber;
        document.getElementById('successModal').classList.remove('hidden');

        // Note: Waiting message and feedback will show after success modal is closed

    } catch (error) {
        console.error('Checkout error:', error);
        showToast(t('error'), 'error');
    } finally {
        checkoutBtn.innerHTML = originalText;
        checkoutBtn.disabled = false;
    }
}

// Update balance display
function updateBalanceDisplay() {
    if (currentUser) {
        document.getElementById('balanceDisplay').textContent = currentUser.balance || 0;
    }
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast toast-${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// Waiting Message
function showWaitingMessage() {
    document.getElementById('waitingModal').classList.remove('hidden');
}

// Feedback System
let selectedRating = null;

function showFeedbackModal() {
    document.getElementById('feedbackModal').classList.remove('hidden');
    selectedRating = null;
    document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById('feedbackText').value = '';
}

function closeFeedbackModal() {
    document.getElementById('feedbackModal').classList.add('hidden');
}

async function submitFeedback() {
    const feedbackText = document.getElementById('feedbackText').value.trim();

    // Get selected emoji rating
    const selectedBtn = document.querySelector('.emoji-btn.selected');
    if (selectedBtn) {
        selectedRating = selectedBtn.dataset.rating;
    }

    // At least one feedback method required
    if (!selectedRating && !feedbackText) {
        showToast('الرجاء اختيار تقييم أو كتابة رأيك', 'error');
        return;
    }

    const feedbackData = {
        rating: selectedRating,
        comment: feedbackText,
        userId: currentUser?.uid || 'guest',
        timestamp: new Date(),
        type: 'student'
    };

    try {
        // Save to Firestore if user is logged in
        if (window.firebase && firebase.firestore) {
            await firebase.firestore().collection('feedback').add(feedbackData);
        }

        showToast('شكراً لتقييمك! 💚', 'success');
        closeFeedbackModal();
    } catch (error) {
        console.error('Error submitting feedback:', error);
        showToast('تم حفظ رأيك محلياً ✓', 'success');
        closeFeedbackModal();
    }
}

// Logout function for students
function handleLogout() {
    if (confirm('هل تريد تسجيل الخروج؟')) {
        // Sign out from Firebase
        if (typeof signOut === 'function') {
            signOut();
        }
        // Redirect to login page
        window.location.href = '../login.html?role=student';
    }
}

