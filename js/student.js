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
async function loadProducts() {
    try {
        products = await getProducts();
        if (products.length === 0) {
            // Seed database if empty
            if (typeof seedProducts === 'function') {
                await seedProducts();
                products = await getProducts();
            }
        }
        renderProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        // Minimal fallback to avoid breaking UI completely if offline
        document.getElementById('productsGrid').innerHTML = '<p class="error-text">حدث خطأ في تحميل المنتجات</p>';
    }
}

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
        return `
        <div class="product-card" data-id="${product.id}">
            <div class="nutrition-badge ${trafficColor}">
                ${trafficColor === 'green' ? '●' : trafficColor === 'yellow' ? '●' : '●'}
            </div>
            <div class="product-image">${product.icon || '🍽️'}</div>
            <h3 class="product-name">${lang === 'he' ? product.name_he : product.name_ar}</h3>
            <div class="product-price">${product.price}</div>
            <button class="add-to-cart-btn" onclick="addToCart('${product.id}')">
                ${t('addToCart')} +
            </button>
        </div>
    `;
    }).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            renderProducts();
        });
    });

    // Cart button
    document.getElementById('cartBtn').addEventListener('click', openCart);
    document.getElementById('closeCartBtn').addEventListener('click', closeCart);
    document.getElementById('cartOverlay').addEventListener('click', closeCart);

    // Checkout button
    document.getElementById('checkoutBtn').addEventListener('click', checkout);

    // Success modal close
    document.getElementById('closeSuccessBtn').addEventListener('click', () => {
        document.getElementById('successModal').classList.add('hidden');
    });

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
}

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

    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">${item.icon || '🍽️'}</div>
            <div class="cart-item-details">
                <div class="cart-item-name">${lang === 'he' ? item.name_he : item.name_ar}</div>
                <div class="cart-item-price">${item.price} ${t('coins')}</div>
                <div class="cart-item-quantity">
                    <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">−</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                </div>
            </div>
        </div>
    `).join('');

    updateCartDisplay();
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
