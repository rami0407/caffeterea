
// Guest Cart System
console.log('🚀 Guest Script Loaded v1.5');
let cart = [];
const GUEST_CART_KEY = 'knowledge_canteen_guest_cart';
let currentCategory = 'all';

// Product Data
// Product Data
let products = [];

// Load cart on startup
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    updateCartUI();

    // Initial Render if on guest page
    const grid = document.getElementById('productsGrid');
    if (grid) {
        loadProducts();
        setupCategoryListeners();
    }
});

// Load products from Firebase
let productsUnsubscribe = null; // Store unsubscribe function

async function loadProducts() {
    const grid = document.getElementById('productsGrid');
    if (grid) grid.innerHTML = '<div class="spinner"></div><p style="text-align:center;width:100%;">جاري تحميل القائمة...</p>';

    try {
        // Wait for Firebase to be ready if needed
        if (!window.db && typeof initializeFirebase === 'function') {
            initializeFirebase();
        }

        // Subscribe to products for real-time updates
        if (typeof subscribeToProducts === 'function') {
            productsUnsubscribe = subscribeToProducts((newProducts) => {
                products = newProducts;
                console.log('✅ Products updated:', products.length);
                renderCategories(); // Update categories
                renderProducts(); // Re-render products
            });
        } else {
            console.error('subscribeToProducts function not found');
        }

    } catch (error) {
        console.error('Error loading products:', error);
        if (grid) grid.innerHTML = '<p class="error-msg">حدث خطأ في تحميل المنتجات. الرجاء المحاولة لاحقاً.</p>';
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (productsUnsubscribe) {
        productsUnsubscribe();
    }
});

// Setup dynamic categories
function renderCategories() {
    const nav = document.querySelector('.guest-categories');
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
        const label = catLabels[cat] || `📦 ${cat}`; // Fallback for custom categories
        const isActive = currentCategory === cat ? 'active' : '';
        return `<button class="category-chip ${isActive}" data-category="${cat}">${label}</button>`;
    }).join('');

    // Re-attach listeners
    setupCategoryListeners();
}

function setupCategoryListeners() {
    document.querySelectorAll('.category-chip').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-chip').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            renderProducts();
        });
    });
}

function loadCart() {
    const saved = localStorage.getItem(GUEST_CART_KEY);
    if (saved) {
        cart = JSON.parse(saved);
    }
}

function saveCart() {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    updateCartUI();
}

function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    showToast(`تم إضافة ${product.name} للسلة!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
}

function updateQuantity(productId, delta) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
        }
    }
}

function clearCart() {
    cart = [];
    saveCart();
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    // Update cart modal if open
    renderCartItems();
}

// Render products with "Add to Cart" button handles
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    const filtered = currentCategory === 'all'
        ? products
        : products.filter(p => p.category === currentCategory);

    grid.innerHTML = filtered.map(product => {
        // Better name fallback: try Arabic, then Hebrew, then generic
        const name = product.name_ar || product.name_he || product.name || 'منتج';
        const caloriesBadge = product.calories ? `<div style="font-size: 0.8rem; color: #64748b; margin-top: 5px;">🔥 ${product.calories} سعرة</div>` : '';

        return `
        <div class="guest-product-card">
            <div class="nutrition-dot ${product.trafficLight || 'green'}"></div>
            <div class="product-image">${product.icon || '📦'}</div>
            <h3 class="product-name">${name}</h3>
            <div class="product-price">${product.price} نقطة</div>
            ${caloriesBadge}
            <button onclick="addToCart({
                id: '${product.id}', 
                name: '${name}', 
                price: ${product.price},
                calories: ${product.calories || 0}
            })" class="btn-add-cart">
                أضف للسلة +
            </button>
        </div>
    `}).join('');
}

// Cart Modal Logic
function openCart() {
    const modal = document.getElementById('cartModal');
    modal.classList.add('active');
    renderCartItems();
}

function closeCart() {
    document.getElementById('cartModal').classList.remove('active');
}

function renderCartItems() {
    const container = document.getElementById('cartItems');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '<div class="empty-cart-msg">السلة فارغة 🛒</div>';
        document.getElementById('cartTotal').textContent = '0';
        // Hide calorie counter if exists
        const calorieEl = document.getElementById('cartCalories');
        if (calorieEl) calorieEl.style.display = 'none';
        return;
    }

    let total = 0;
    let totalCalories = 0;
    container.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        totalCalories += (item.calories || 0) * item.quantity;

        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.price} نقطة${item.calories ? ` | ${item.calories} سعرة` : ''}</p>
                </div>
                <div class="cart-item-controls">
                    <button onclick="updateQuantity('${item.id}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity('${item.id}', 1)">+</button>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('cartTotal').textContent = total;

    // Show total calories if any
    let calorieEl = document.getElementById('cartCalories');
    if (totalCalories > 0) {
        if (!calorieEl) {
            // Create calorie display element
            calorieEl = document.createElement('div');
            calorieEl.id = 'cartCalories';
            calorieEl.style.cssText = 'text-align: center; color: #ff6b35; font-weight: 600; margin-top: 10px; font-size: 0.95rem;';
            const totalEl = document.getElementById('cartTotal');
            if (totalEl && totalEl.parentElement) {
                totalEl.parentElement.appendChild(calorieEl);
            }
        }
        calorieEl.textContent = `🔥 إجمالي السعرات: ${totalCalories} سعرة حرارية`;
        calorieEl.style.display = 'block';
    } else if (calorieEl) {
        calorieEl.style.display = 'none';
    }
}

// Checkout Logic
async function submitGuestOrder() {
    const guestName = document.getElementById('guestNameInput').value.trim();
    if (!guestName) {
        showToast('الرجاء إدخال الاسم', true);
        return;
    }

    if (cart.length === 0) {
        showToast('السلة فارغة!', true);
        return;
    }

    // Generate order number (simple random for guests)
    const orderNumber = Math.floor(1000 + Math.random() * 9000);

    const orderData = {
        userId: 'guest',
        studentId: null, // Explicitly null to ensure rule compliance
        guestName: guestName,
        orderNumber: orderNumber, // Added orderNumber
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        totalPoints: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'pending',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        date: new Date().toISOString().split('T')[0]
    };

    console.log('📦 Guest Order Data:', orderData); // Debug log

    // Check if DB is initialized (fallback to window.db or re-init)
    if (!db) {
        if (window.db) {
            db = window.db;
        } else if (typeof initializeFirebase === 'function') {
            console.warn('⚠️ DB not found, attempting re-initialization...');
            const init = initializeFirebase();
            if (init) db = init.db;
        }
    }

    if (!db) {
        showToast('خطأ: فشل الاتصال بقاعدة البيانات. (DB Refresh Failed)', true);
        console.error('Database not initialized after retry');
        return;
    }

    try {
        const btn = document.getElementById('btnCheckout');
        const originalText = btn.textContent;
        btn.textContent = 'جاري الطلب...';
        btn.disabled = true;

        const docRef = await db.collection('orders').add(orderData);
        console.log('✅ Guest Order Created! ID:', docRef.id, 'OrderNum:', orderNumber);

        showToast('تم إرسال الطلب بنجاح! ✅');
        clearCart();
        closeCart();
        document.getElementById('guestNameInput').value = '';

    } catch (error) {
        console.error('Order Error FULL OBJECT:', error);

        // Show raw error for debugging
        const errorCode = error.code || 'unknown';
        const errorMsg = error.message || JSON.stringify(error);

        let displayMsg = `خطأ (${errorCode}): ${errorMsg}`;

        if (errorCode === 'permission-denied') {
            displayMsg = 'عذراً، ليس لديك صلاحية لإرسال الطلب (Permission Denied). تأكد من إعدادات الأمان.';
        } else if (errorCode === 'unavailable') {
            displayMsg = 'عذراً، الخدمة غير متوفرة حالياً (Offline). تأكد من اتصالك بالإنترنت.';
        }

        showToast(displayMsg, true);
    } finally {
        const btn = document.getElementById('btnCheckout');
        if (btn) {
            btn.textContent = 'تأكيد الطلب';
            btn.disabled = false;
        }
    }
}

// Utility: Toast
function showToast(msg, isError = false) {
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'error' : 'success'}`;
    toast.textContent = msg;
    document.body.appendChild(toast);

    // Add CSS for toast if not exists
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }, 100);
}
