// ========================================
// بذور المعرفة - Smart Eco-Market
// Firebase Configuration
// ========================================

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyD2B2Fx0xR8dWNvO82YQaRAv3Mhq--oKVw",
    authDomain: "smart-eco-market.firebaseapp.com",
    databaseURL: "https://smart-eco-market-default-rtdb.firebaseio.com",
    projectId: "smart-eco-market",
    storageBucket: "smart-eco-market.firebasestorage.app",
    messagingSenderId: "468823791766",
    appId: "1:468823791766:web:953ee5be487b2b185f8ab7",
    measurementId: "G-EFMKZLPK18"
};

// Initialize Firebase (using compat version for simpler setup)
// Include these scripts in HTML:
// <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js"></script>

let app, auth, db;

function initializeFirebase() {
    if (typeof firebase !== 'undefined') {
        app = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();

        // Expose to window for other scripts
        window.app = app;
        window.auth = auth;
        window.db = db;

        // Set RTL language for auth UI
        auth.languageCode = 'ar';

        console.log('✅ Firebase initialized successfully');
        return { app, auth, db };
    } else {
        console.error('❌ Firebase SDK not loaded');
        return null;
    }
}

// ========================================
// Authentication Functions
// ========================================

// Sign up with email and password
async function signUp(email, password, userData) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Create user document in Firestore
        await db.collection('users').doc(user.uid).set({
            uid: user.uid,
            email: email,
            name: userData.name,
            role: userData.role,
            balance: 0,
            approved: userData.approved,
            educatorName: userData.educatorName || '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log('✅ User created:', user.uid);
        return { success: true, user };
    } catch (error) {
        console.error('❌ Sign up error:', error);
        return { success: false, error: error.message };
    }
}

// Sign in with email and password
async function signIn(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Get user data from Firestore
        const userDoc = await db.collection('users').doc(user.uid).get();
        let userData = userDoc.data();

        // If user document doesn't exist, create it (especially for admin)
        if (!userData) {
            console.warn('⚠️ User document missing, creating it now...');

            // Determine role based on email
            let role = 'student'; // default
            if (email === 'rami_admin@knowledge-canteen.com') {
                role = 'admin';
            } else if (email.includes('@educator.')) {
                role = 'educator';
            } else if (email.includes('@cafeteria.')) {
                role = 'cafeteria';
            }

            userData = {
                uid: user.uid,
                email: email,
                name: role === 'admin' ? 'Admin Rami' : 'User',
                role: role,
                balance: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('users').doc(user.uid).set(userData);
            console.log('✅ User document created:', role);
        }

        console.log('✅ User signed in:', userData.role);
        return { success: true, user, userData };
    } catch (error) {
        console.error('❌ Sign in error:', error);
        return { success: false, error: error.message };
    }
}

// Reset Password
async function resetPassword(email) {
    try {
        await auth.sendPasswordResetEmail(email);
        return { success: true };
    } catch (error) {
        console.error('Error sending reset email:', error);
        return { success: false, error: error.message };
    }
}

// Sign out
async function signOut() {
    try {
        await auth.signOut();
        console.log('✅ User signed out');
        return { success: true };
    } catch (error) {
        console.error('❌ Sign out error:', error);
        return { success: false, error: error.message };
    }
}

// Get current user data
async function getCurrentUserData() {
    const user = auth.currentUser;
    if (!user) return null;

    const userDoc = await db.collection('users').doc(user.uid).get();
    return userDoc.exists ? userDoc.data() : null;
}

// Auth state observer
function onAuthStateChange(callback) {
    return auth.onAuthStateChanged(async (user) => {
        if (user) {
            const userData = await getCurrentUserData();
            callback({ user, userData });
        } else {
            callback({ user: null, userData: null });
        }
    });
}

// Get all users (Admin only)
async function getAllUsers() {
    try {
        const snapshot = await db.collection('users').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('❌ Error getting users (trying without sort):', error);
        try {
            const snapshot = await db.collection('users').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            console.error('❌ Error getting users (fallback failed):', e);
            return [];
        }
    }
}

// ========================================
// Database Functions - Products
// ========================================

// Get all products (Public - Available only)
async function getProducts() {
    try {
        const snapshot = await db.collection('products').where('available', '==', true).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('❌ Error getting products:', error);
        return [];
    }
}

// Get ALL products (Admin - All)
// Get ALL products (Admin - All)
async function getAllProducts() {
    try {
        // Try server-side sorting first
        const snapshot = await db.collection('products').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.warn('⚠️ getAllProducts: Server-side sort failed (missing index?), falling back to client-side sort.', error);
        // Fallback: Get all and sort in memory
        try {
            const snapshot = await db.collection('products').get();
            const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Manual Sort (Newest first)
            return products.sort((a, b) => {
                const timeA = a.createdAt ? a.createdAt.toMillis() : 0;
                const timeB = b.createdAt ? b.createdAt.toMillis() : 0;
                return timeB - timeA;
            });
        } catch (e) {
            console.error('❌ getAllProducts: Fatal error', e);
            throw e; // Let the caller handle the error
        }
    }
}

// Add product (admin only)
async function addProduct(productData) {
    try {
        const docRef = await db.collection('products').add({
            ...productData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('❌ Error adding product:', error);
        return { success: false, error: error.message };
    }
}

// Update product (admin only)
async function updateProduct(productId, updates) {
    try {
        await db.collection('products').doc(productId).update(updates);
        return { success: true };
    } catch (error) {
        console.error('❌ Error updating product:', error);
        return { success: false, error: error.message };
    }
}

// ========================================
// Database Functions - Orders
// ========================================

// Generate order number
async function generateOrderNumber() {
    const today = new Date().toISOString().split('T')[0];
    const counterRef = db.collection('counters').doc(today);

    const result = await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(counterRef);
        let orderNum = 1;

        if (doc.exists) {
            orderNum = doc.data().count + 1;
        }

        transaction.set(counterRef, { count: orderNum });
        return orderNum;
    });

    return result;
}

// Create order
async function createOrder(studentId, items, total) {
    try {
        const orderNumber = await generateOrderNumber();

        const orderRef = await db.collection('orders').add({
            studentId,
            orderNumber,
            items,
            total,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Deduct from student balance
        await db.collection('users').doc(studentId).update({
            balance: firebase.firestore.FieldValue.increment(-total)
        });

        return { success: true, orderId: orderRef.id, orderNumber };
    } catch (error) {
        console.error('❌ Error creating order:', error);
        return { success: false, error: error.message };
    }
}

// Get orders for student
async function getStudentOrders(studentId) {
    try {
        const snapshot = await db.collection('orders')
            .where('studentId', '==', studentId)
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('❌ Error getting orders:', error);
        return [];
    }
}

// Get pending orders (for cafeteria)
function subscribeToPendingOrders(callback) {
    return db.collection('orders')
        .where('status', 'in', ['pending', 'preparing'])
        .orderBy('createdAt', 'asc')
        .onSnapshot(snapshot => {
            const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(orders);
        });
}

// Update order status
async function updateOrderStatus(orderId, status) {
    try {
        await db.collection('orders').doc(orderId).update({
            status,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('❌ Error updating order:', error);
        return { success: false, error: error.message };
    }
}

// ========================================
// Database Functions - Transactions (Rewards)
// ========================================

// Add reward (educator adds balance to student)
async function addReward(educatorId, studentId, amount, reason) {
    try {
        // Create transaction record
        await db.collection('transactions').add({
            studentId,
            educatorId,
            amount,
            type: 'reward',
            reason,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Update student balance
        await db.collection('users').doc(studentId).update({
            balance: firebase.firestore.FieldValue.increment(amount)
        });

        return { success: true };
    } catch (error) {
        console.error('❌ Error adding reward:', error);
        return { success: false, error: error.message };
    }
}

// Get students for educator
async function getEducatorStudents(educatorName) {
    try {
        const snapshot = await db.collection('users')
            .where('role', '==', 'student')
            .where('educatorName', '==', educatorName)
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('❌ Error getting students:', error);
        return [];
    }
}

// Get transaction history for student
async function getStudentTransactions(studentId) {
    try {
        const snapshot = await db.collection('transactions')
            .where('studentId', '==', studentId)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('❌ Error getting transactions:', error);
        return [];
    }
}

// ========================================
// Database Functions - Reports (Admin)
// ========================================

// Get sales report
async function getSalesReport(startDate, endDate) {
    try {
        const snapshot = await db.collection('orders')
            .where('status', '==', 'completed')
            .where('createdAt', '>=', startDate)
            .where('createdAt', '<=', endDate)
            .get();

        const orders = snapshot.docs.map(doc => doc.data());
        const totalSales = orders.reduce((sum, order) => sum + order.total, 0);

        return {
            totalOrders: orders.length,
            totalSales,
            orders
        };
    } catch (error) {
        console.error('❌ Error getting sales report:', error);
        return { totalOrders: 0, totalSales: 0, orders: [] };
    }
}

// Get popular products
async function getPopularProducts() {
    try {
        const snapshot = await db.collection('orders')
            .where('status', '==', 'completed')
            .get();

        const productCounts = {};
        snapshot.docs.forEach(doc => {
            const order = doc.data();
            order.items.forEach(item => {
                productCounts[item.name] = (productCounts[item.name] || 0) + item.quantity;
            });
        });

        return Object.entries(productCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
    } catch (error) {
        console.error('❌ Error getting popular products:', error);
        return [];
    }
}
