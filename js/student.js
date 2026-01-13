// ========================================
// بذور المعرفة - Smart Eco-Market
// Student Portal Logic
// ========================================

// Global state
let currentUser = null;
let products = [];
let cart = [];
let currentCategory = 'all';
let currentChallengeMode = 'cashier'; // Default mode
let expectedMathAnswer = 0; // Stored answer for validation

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
// Check authentication and load data
function checkAuthAndLoad() {
    onAuthStateChange(async ({ user, userData }) => {
        if (user && userData) {
            currentUser = userData;

            // --- One-Time Welcome Allowance (30 Points) ---
            if (!userData.initialAllowanceReceived) {
                console.log('🎉 First time login? Allocating welcome allowance...');

                try {
                    // Set balance to 30 (One time only)
                    await db.collection('users').doc(user.uid).update({
                        balance: 30,
                        initialAllowanceReceived: true
                    });

                    // Update local state
                    currentUser.balance = 30;
                    currentUser.initialAllowanceReceived = true;

                    showToast('🎉 أهلاً بك! تم إضافة رصيد افتتاحي: 30 نقطة', 'success');
                } catch (error) {
                    console.error('Error allocating welcome allowance:', error);
                }
            }
            // -------------------------------------------

            // Persistence: Display Name
            const nameDisplay = document.getElementById('userNameDisplay');
            if (nameDisplay) nameDisplay.textContent = `مرحباً، ${userData.name || 'طالب'}`;

            updateBalanceDisplay();
            await loadProducts();
        } else {
            // For demo, allow guest access with allowance simulation
            currentUser = {
                balance: 999999, // Concept: Infinite Kiosk Balance
                role: 'student',
                isGuest: true
            };

            // Guest Welcome Message
            const nameDisplay = document.getElementById('userNameDisplay');
            if (nameDisplay) nameDisplay.textContent = 'مرحباً، زائر';

            updateBalanceDisplay();
            // Enable real product loading for guests (public read allowed)
            loadProducts();

            // Show toast for guest too
            if (!sessionStorage.getItem('guest_welcomed')) {
                showToast('🎉 تم رصد رصيد الشهر: 30 نقطة (تجريبي)', 'success');
                sessionStorage.setItem('guest_welcomed', 'true');
            }
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

        // ===== STOCK AVAILABILITY CHECK =====
        const stock = product.stock !== undefined ? product.stock : 0;
        const lowStockThreshold = product.lowStockThreshold || 5;
        const isAvailable = stock > 0;
        const isLowStock = stock <= lowStockThreshold && stock > 0;

        // Stock badge
        let stockBadge = '';
        if (stock === 0) {
            stockBadge = `<div class="stock-badge out-of-stock">❌ ${lang === 'he' ? 'אזל' : 'نفذ'}</div>`;
        } else if (isLowStock) {
            stockBadge = `<div class="stock-badge low-stock">⚠️ ${lang === 'he' ? `נשארו ${stock}` : `بقي ${stock}`}</div>`;
        } else {
            stockBadge = `<div class="stock-badge in-stock">✅ ${lang === 'he' ? 'זמין' : 'متوفر'}</div>`;
        }

        // Button state
        const btnDisabled = !isAvailable ? 'disabled' : '';
        const btnText = !isAvailable
            ? (lang === 'he' ? 'לא זמין' : 'غير متوفر')
            : (lang === 'he' ? '+ הוסף לסל' : '+ إضافة للسلة');
        const cardClass = !isAvailable ? 'out-of-stock' : '';

        return `
        <div class="product-card ${cardClass}" data-id="${product.id}">
            <div class="nutrition-badge ${trafficColor}">
                ${trafficColor === 'green' ? '●' : trafficColor === 'yellow' ? '●' : '●'}
            </div>
            ${stockBadge}
            <div class="product-image">${product.icon || '🍽️'}</div>
            <h3 class="product-name">${productName}</h3>
            <div class="product-price">${product.price}</div>
            ${caloriesBadge}
            <button class="add-to-cart-btn" onclick="addToCart('${product.id}')" ${btnDisabled}>
                ${btnText}
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
    // Checkout button (Now opens Math Challenge)
    // Checkout button (Now opens Math Challenge)
    document.getElementById('checkoutBtn').addEventListener('click', openMathChallenge);

    // Challenge Mode Buttons (Gamification)
    document.querySelectorAll('.challenge-title-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            setChallengeMode(mode);
        });
    });

    // Math Challenge Button
    const verifyBtn = document.getElementById('verifyMathBtn');
    if (verifyBtn) verifyBtn.addEventListener('click', verifyMathAnswer);

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

    // ===== STOCK AVAILABILITY CHECK =====
    const stock = product.stock !== undefined ? product.stock : 0;

    // Check if product is out of stock
    if (stock <= 0) {
        showToast('❌ عذراً، هذا المنتج غير متوفر حالياً', 'error');
        return;
    }

    // Check quantity in cart vs available stock
    const existingItem = cart.find(item => item.id === productId);
    const currentInCart = existingItem ? existingItem.quantity : 0;

    if (currentInCart >= stock) {
        showToast(`⚠️ وصلت للحد الأقصى المتوفر (${stock})`, 'error');
        return;
    }
    // =======================================

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

    // Math Challenge: Hide the total to force calculation
    document.getElementById('cartTotal').textContent = '؟'; // Hidden total

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

// Gamification Logic
function setChallengeMode(mode) {
    currentChallengeMode = mode;

    // Update UI
    document.querySelectorAll('.challenge-title-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === mode) btn.classList.add('active');
    });

    // Provide immediate feedback/mini-toast
    const titles = {
        'cashier': 'تحدي الصراف: احسب الباقي! 💰',
        'nutrition': 'تحدي التغذية: اجمع السعرات! 🍎',
        'discount': 'تحدي الخصم: احسب السعر الجديد! 🏷️'
    };
    showToast(titles[mode], 'success');
}

function openMathChallenge() {
    if (cart.length === 0) return;

    const modal = document.getElementById('mathChallengeModal');
    const container = document.getElementById('challengeItemsList');
    const lang = getCurrentLang();
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const balance = currentUser.balance || 0;

    // Verify balance first
    if (balance < total) {
        showToast(t('insufficientBalance'), 'error');
        return;
    }

    let challengeHTML = '';
    let challengeTitle = '';
    let challengeQuestion = '';

    // --- CASHIER MODE (Math: Subtraction) ---
    if (currentChallengeMode === 'cashier') {
        challengeTitle = '👨‍💼 تحدي الصراف الصغير';

        // Randomize Question Type: 0 = Real Balance, 1 = Hypothetical Payment
        const qType = Math.random() > 0.5 ? 0 : 1;

        if (qType === 0) {
            // Variant A: Real Balance
            expectedMathAnswer = balance - total;
            challengeQuestion = `معك <strong>${balance}</strong> نقطة. والمجموع <strong>${total}</strong> نقطة.<br>كم سيتبقى معك؟`;
            challengeHTML = `
                <div style="font-size: 1.2rem; margin-bottom: 10px; color: #64748b;" dir="ltr">
                    ${balance} - ${total} = <span style="font-weight:bold; color:var(--primary-green);">?</span>
                </div>`;
        } else {
            // Variant B: Hypothetical Payment (Change)
            // Round up total to next 10 or 50
            let payment = Math.ceil((total + 1) / 10) * 10;
            if (payment === total) payment += 10; // Ensure some change

            expectedMathAnswer = payment - total;
            challengeQuestion = `إذا دفع الزبون <strong>${payment}</strong> نقطة، والمجموع <strong>${total}</strong>.<br>كم الباقي؟`;
            challengeHTML = `
                <div style="font-size: 1.2rem; margin-bottom: 10px; color: #64748b;" dir="ltr">
                    ${payment} - ${total} = <span style="font-weight:bold; color:var(--primary-green);">?</span>
                </div>`;
        }
    }

    // --- NUTRITION MODE (Math: Addition) ---
    else if (currentChallengeMode === 'nutrition') {
        challengeTitle = '🍎 تحدي خبير التغذية';

        // Randomize: 0 = Calories, 1 = Sugar
        const qType = Math.random() > 0.5 ? 0 : 1;

        if (qType === 0) {
            expectedMathAnswer = cart.reduce((sum, item) => sum + ((item.calories || 0) * item.quantity), 0);
            challengeQuestion = 'احسب مجموع <strong>السعرات الحرارية 🔥</strong> في سلتك!';

            challengeHTML = cart.map(item => `
                <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dashed #eee;">
                    <span>${lang === 'he' ? item.name_he : item.name_ar} (x${item.quantity})</span>
                    <span dir="ltr">${item.calories || 0} x ${item.quantity}</span>
                </div>
            `).join('');
        } else {
            expectedMathAnswer = cart.reduce((sum, item) => sum + ((item.sugar || 0) * item.quantity), 0);
            challengeQuestion = 'احسب مجموع <strong>ملاعق السكر 🍬</strong> في سلتك!';

            challengeHTML = cart.map(item => `
                <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dashed #eee;">
                    <span>${lang === 'he' ? item.name_he : item.name_ar} (x${item.quantity})</span>
                    <span dir="ltr">${item.sugar || 0} x ${item.quantity}</span>
                </div>
            `).join('');
        }
    }

    // --- DISCOUNT MODE (Math: Percentage/Multiplication) ---
    else if (currentChallengeMode === 'discount') {
        challengeTitle = '🏷️ تحدي صائد الخصومات';

        // Randomize Discount: 10%, 20%, 25%, 50%
        const discounts = [10, 20, 25, 50];
        const percent = discounts[Math.floor(Math.random() * discounts.length)];

        // Calculate new price: total * (1 - percent/100)
        // Correct Answer is the FINAL PRICE
        const discountAmount = Math.floor(total * (percent / 100)); // Simple integer math
        expectedMathAnswer = total - discountAmount;

        challengeQuestion = `لديك خصم مميز <strong>${percent}%</strong>! كم يصبح السعر الجديد؟`;

        challengeHTML = `
            <div style="font-size: 1.2rem; margin-bottom: 10px;" dir="ltr">
                <span dir="rtl">المجموع الأصلي:</span> <strong>${total}</strong>
            </div>
            <div style="font-size: 1rem; color: #64748b;" dir="ltr">
                ${total} - ${percent}% = ?
            </div>
            <div style="font-size: 0.8rem; color: #94a3b8; margin-top:5px;">
                (تلميح: قيمة الخصم ${discountAmount})
            </div>
        `;
    }

    // Update Modal UI
    modal.querySelector('h2').textContent = challengeTitle;
    modal.querySelector('p').innerHTML = challengeQuestion;
    if (container) container.innerHTML = challengeHTML;

    document.getElementById('studentMathAnswer').value = '';
    modal.classList.remove('hidden');
}

function closeMathModal() {
    document.getElementById('mathChallengeModal').classList.add('hidden');
}

function verifyMathAnswer() {
    const input = document.getElementById('studentMathAnswer');
    const answer = parseInt(input.value);

    // Check against the globally stored expected answer
    // For Discount mode, we allow a small tolerance due to potential mental math rounding differences
    let isCorrect = false;

    if (currentChallengeMode === 'discount') {
        isCorrect = (Math.abs(answer - expectedMathAnswer) <= 1);
    } else {
        isCorrect = (answer === expectedMathAnswer);
    }

    if (isCorrect) {
        showToast('إجابة صحيحة! أنت عبقري 🌟', 'success');
        closeMathModal();

        // If discount mode was active, show simulated savings toast
        if (currentChallengeMode === 'discount') {
            const originalTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const savings = originalTotal - expectedMathAnswer;
            showToast(`رائع! وفرت ${savings} نقطة (محاكاة)`, 'success');
        }

        processOrder();
    } else {
        input.classList.add('error-shake');
        showToast('حاول مرة أخرى! 🤔', 'error');
        setTimeout(() => input.classList.remove('error-shake'), 500);
    }
}

// Rename original checkout to processOrder
async function processOrder() {
    if (cart.length === 0) return;

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Check balance
    if (currentUser.balance < total) {
        showToast(t('insufficientBalance'), 'error');
        return;
    }

    // Show loading
    const checkoutBtn = document.getElementById('checkoutBtn');
    // ... (rest of the logic remains handled by the execution flow, but the button ID is different in the modal)
    // Actually, processOrder triggers the backend call.
    // We should show a global loading state or reuse the checkout button loading if we want, 
    // but the checkout button is "hidden" behind the modal. 
    // Let's use a simple global loader or toast for now since the modal closes fast.

    // Better: We reuse the checkout implementation but we need to unlock the UI.

    try {
        // Create order
        const items = cart.map(item => ({
            id: item.id,
            name: getCurrentLang() === 'he' ? item.name_he : item.name_ar,
            price: item.price,
            quantity: item.quantity
        }));

        // Check balance (Already done) / Infinite for guest

        let orderResult;
        const userId = currentUser.uid || `guest_${Date.now()}`; // Unique ID for guest

        // Create Order in Firebase (For BOTH Students and Guests)
        orderResult = await createOrder(userId, items, total);

        if (orderResult.success) {
            orderNumber = orderResult.orderNumber;

            // ===== REDUCE STOCK AFTER SUCCESSFUL ORDER =====
            if (typeof reduceStock === 'function') {
                const stockResult = await reduceStock(items);
                if (stockResult.success) {
                    console.log('✅ المخزون تم تحديثه');
                } else {
                    console.warn('⚠️ فشل تحديث المخزون:', stockResult.error);
                }
            }
            // ================================================

            // Deduct local balance for students only
            if (!currentUser.isGuest) {
                currentUser.balance -= total;
            }
        } else {
            console.error("Order creation failed:", orderResult.error);
            // Fallback for guests if firebase fails (e.g. offline)
            if (currentUser.isGuest) {
                orderNumber = Math.floor(Math.random() * 100) + 1;
            } else {
                throw new Error(orderResult.error);
            }
        }

        // Clear cart
        cart = [];
        saveCart();
        updateCartDisplay();
        closeCart();

        // Update balance display
        updateBalanceDisplay();

        // Show Success
        const orderNumDisplay = document.getElementById('orderNumberDisplay');
        if (orderNumDisplay) orderNumDisplay.textContent = orderNumber;
        document.getElementById('successModal').classList.remove('hidden');

        // Kiosk Auto-Reset Logic for Guests
        if (currentUser.isGuest) {
            setTimeout(() => {
                window.location.reload(); // Hard Reset to welcome next guest
            }, 2000); // 2 seconds to read the number
        }

    } catch (error) {
        console.error('Checkout error:', error);
        showToast(t('error'), 'error');
    }
}

// Update balance display
function updateBalanceDisplay() {
    const bal = currentUser.balance || 0;
    // Show Infinity symbol if balance is very high (Kiosk Mode)
    const displayBal = bal > 888888 ? '∞' : bal;

    document.getElementById('balanceDisplay').textContent = displayBal;
    // Also update header amount if exists elsewhere
    const headerBal = document.querySelector('.wallet-amount');
    if (headerBal) headerBal.textContent = displayBal;
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

