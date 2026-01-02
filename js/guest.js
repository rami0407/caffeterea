
// Guest Cart System
let cart = [];
const GUEST_CART_KEY = 'knowledge_canteen_guest_cart';

// Load cart on startup
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    updateCartUI();
});

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

    grid.innerHTML = filtered.map(product => `
        <div class="guest-product-card">
            <div class="nutrition-dot ${product.trafficLight}"></div>
            <div class="product-image">${product.icon}</div>
            <h3 class="product-name">${product.name}</h3>
            <div class="product-price">${product.price} نقطة</div>
            <button onclick="addToCart({
                id: '${product.id}', 
                name: '${product.name}', 
                price: ${product.price}
            })" class="btn-add-cart">
                أضف للسلة +
            </button>
        </div>
    `).join('');
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
        return;
    }

    let total = 0;
    container.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.price} نقطة</p>
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

    const orderData = {
        userId: 'guest',
        guestName: guestName,
        items: cart,
        totalPoints: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'pending',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        date: new Date().toISOString().split('T')[0]
    };

    try {
        const btn = document.getElementById('btnCheckout');
        const originalText = btn.textContent;
        btn.textContent = 'جاري الطلب...';
        btn.disabled = true;

        await db.collection('orders').add(orderData);

        showToast('تم إرسال الطلب بنجاح! ✅');
        clearCart();
        closeCart();
        document.getElementById('guestNameInput').value = '';

    } catch (error) {
        console.error('Order Error:', error);
        showToast('حدث خطأ أثناء الطلب', true);
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
