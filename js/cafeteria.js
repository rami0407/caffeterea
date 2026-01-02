// ========================================
// بذور المعرفة - Smart Eco-Market
// Cafeteria Portal Logic
// ========================================

// Global state
let orders = [];
let currentStatus = 'pending';
let unsubscribe = null;

// Sample orders for demo
// Sample orders removed - using Firebase
const sampleOrders = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeFirebase();
    initI18n();

    setupEventListeners();
    loadOrders();
});

// Setup event listeners
function setupEventListeners() {
    // Language buttons
    document.querySelectorAll('.lang-mini-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.lang-mini-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            setLanguage(btn.dataset.lang);
            renderOrders();
        });
    });

    // Status tabs
    document.querySelectorAll('.status-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.status-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentStatus = tab.dataset.status;
            renderOrders();
        });
    });
}

// Load orders
function loadOrders() {
    // Try real-time subscription first
    try {
        if (typeof subscribeToPendingOrders === 'function') {
            unsubscribe = subscribeToPendingOrders((newOrders) => {
                const oldCount = orders.filter(o => o.status === 'pending').length;
                orders = newOrders;

                // Play sound for new orders
                if (orders.filter(o => o.status === 'pending').length > oldCount) {
                    playNotificationSound();
                }

                updateCounts();
                renderOrders();
            });
        }
    } catch (error) {
        console.log('Realtime updates not available');
    }

    // Initial load (if not using realtime or as backup)
    // orders = await getPendingOrders(); // If we had a one-time fetch function
    // For now, we rely on subscription. If that fails, we show empty.
    updateCounts();
    renderOrders();
}

// Update counts
function updateCounts() {
    const pending = orders.filter(o => o.status === 'pending').length;
    const preparing = orders.filter(o => o.status === 'preparing').length;
    const ready = orders.filter(o => o.status === 'ready').length;

    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('preparingCount').textContent = preparing;
    document.getElementById('readyCount').textContent = ready;
    document.getElementById('ordersCount').textContent = pending + preparing + ready;
}

// Render orders
function renderOrders() {
    const container = document.getElementById('ordersDisplay');
    const emptyState = document.getElementById('emptyState');

    const filteredOrders = orders.filter(o => o.status === currentStatus);

    if (filteredOrders.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    container.innerHTML = filteredOrders.map(order => {
        const timeAgo = getTimeAgo(order.createdAt);

        let actionButtons = '';
        if (order.status === 'pending') {
            actionButtons = `
                <button class="action-btn preparing-btn" onclick="updateStatus('${order.id}', 'preparing')">
                    <span>👨‍🍳</span>
                    <span>بدء التحضير</span>
                </button>
            `;
        } else if (order.status === 'preparing') {
            actionButtons = `
                <button class="action-btn ready-btn" onclick="updateStatus('${order.id}', 'ready')">
                    <span>✅</span>
                    <span>جاهز</span>
                </button>
            `;
        } else if (order.status === 'ready') {
            actionButtons = `
                <button class="action-btn complete-btn" onclick="updateStatus('${order.id}', 'completed')">
                    <span>✓</span>
                    <span>تم التسليم</span>
                </button>
            `;
        }

        return `
            <div class="cafe-order-card ${order.status}">
                <div class="cafe-order-header">
                    <div class="order-number-large">
                        <span class="label">طلب رقم</span>
                        <span class="number">${order.orderNumber}</span>
                    </div>
                    <span class="order-time-badge">${timeAgo}</span>
                </div>
                
                <div class="cafe-order-items">
                    ${order.items.map(item => `
                        <div class="cafe-item">
                            <span>
                                <span class="item-qty">${item.quantity}</span>
                                <span class="item-name">${item.name}</span>
                            </span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="cafe-order-actions">
                    ${actionButtons}
                </div>
            </div>
        `;
    }).join('');
}

// Update order status
async function updateStatus(orderId, newStatus) {
    try {
        // Update in Firebase
        if (typeof updateOrderStatus === 'function') {
            await updateOrderStatus(orderId, newStatus);
        }

        // Update locally
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.status = newStatus;

            // Remove completed orders from view
            if (newStatus === 'completed') {
                orders = orders.filter(o => o.id !== orderId);
            }

            updateCounts();
            renderOrders();

            showToast(getStatusMessage(newStatus), 'success');
        }
    } catch (error) {
        console.error('Error updating status:', error);
        showToast('حدث خطأ', 'error');
    }
}

// Get status message
function getStatusMessage(status) {
    switch (status) {
        case 'preparing': return '👨‍🍳 بدأ التحضير';
        case 'ready': return '✅ الطلب جاهز!';
        case 'completed': return '✓ تم التسليم';
        default: return 'تم التحديث';
    }
}

// Get time ago
function getTimeAgo(timestamp) {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return 'الآن';
    if (seconds < 3600) return `منذ ${Math.floor(seconds / 60)} د`;
    if (seconds < 86400) return `منذ ${Math.floor(seconds / 3600)} س`;
    return 'أكثر من يوم';
}

// Play notification sound
function playNotificationSound() {
    try {
        const sound = document.getElementById('notificationSound');
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(() => { });
        }
    } catch (e) { }
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

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (unsubscribe) {
        unsubscribe();
    }
});

// ==========================================
// NEW: Security & Product Management Logic
// ==========================================

// Check passcode
function checkCafePasscode() {
    const input = document.getElementById('cafePasscode');
    const error = document.getElementById('passError');
    const modal = document.getElementById('securityModal');

    if (input.value === 'cafe123') {
        // Success
        modal.style.display = 'none';
        sessionStorage.setItem('cafeteria_unlocked', 'true');
        playNotificationSound(); // Tiny feedback

        // Refresh orders 
        loadOrders();
    } else {
        // Fail
        error.style.display = 'block';
        input.value = '';
        input.focus();
    }
}

// Check if already unlocked (on load)
function checkAlreadyUnlocked() {
    if (sessionStorage.getItem('cafeteria_unlocked') === 'true') {
        document.getElementById('securityModal').style.display = 'none';
    }
}

// Switch between Orders & Products View
function switchMode(mode) {
    // Update buttons
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active'); // Assumes triggered by click event

    // Show sections
    if (mode === 'orders') {
        document.getElementById('ordersView').style.display = 'block';
        document.getElementById('productsView').style.display = 'none';
    } else {
        document.getElementById('ordersView').style.display = 'none';
        document.getElementById('productsView').style.display = 'block';
    }
}

// Handle Add Product Form
async function handleAddProduct(e) {
    e.preventDefault();

    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = '⏳ جاري الإضافة...';

    const productData = {
        name_ar: document.getElementById('prodNameAr').value.trim(),
        name_he: document.getElementById('prodNameHe').value.trim(),
        price: parseInt(document.getElementById('prodPrice').value),
        category: document.getElementById('prodCategory').value,
        icon: document.getElementById('prodIcon').value.trim() || '📦',
        trafficLight: document.getElementById('prodTraffic').value,
        available: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection('products').add(productData);

        showToast('تم إضافة المنتج الجديد بنجاح! 🎉', 'success');
        e.target.reset(); // Clear form

        // Switch back to orders view or stay? Let's stay to add more.
    } catch (error) {
        console.error('Error adding product:', error);
        showToast('حدث خطأ أثناء الإضافة', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = '✨ إضافة للمائمة';
    }
}

// Call check on load
document.addEventListener('DOMContentLoaded', () => {
    checkAlreadyUnlocked();
});
