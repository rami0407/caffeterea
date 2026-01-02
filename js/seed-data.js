// ========================================
// بذور المعرفة - Smart Eco-Market
// Data Seeding Script
// ========================================

const initialProducts = [
    {
        name_ar: 'سندويش جبنة صفراء',
        name_he: 'כריך גבינה צהובה',
        price: 5,
        category: 'sandwiches',
        icon: '🧀',
        trafficLight: 'yellow',
        available: true
    },
    {
        name_ar: 'سندويش لبنة وزعتر',
        name_he: 'כריך לבנה וזעתר',
        price: 4,
        category: 'sandwiches',
        icon: '🥙',
        trafficLight: 'green',
        available: true
    },
    {
        name_ar: 'سندويش حمص',
        name_he: 'כריך חומוס',
        price: 4,
        category: 'sandwiches',
        icon: '🥙',
        trafficLight: 'green',
        available: true
    },
    {
        name_ar: 'عصير برتقال طبيعي',
        name_he: 'מיץ תפוזים טבעי',
        price: 6,
        category: 'drinks',
        icon: '🍊',
        trafficLight: 'green',
        available: true
    },
    {
        name_ar: 'ماء معدني',
        name_he: 'מים מינרליים',
        price: 2,
        category: 'drinks',
        icon: '💧',
        trafficLight: 'green',
        available: true
    },
    {
        name_ar: 'عصير تفاح',
        name_he: 'מיץ תפוחים',
        price: 5,
        category: 'drinks',
        icon: '🍎',
        trafficLight: 'yellow',
        available: true
    },
    {
        name_ar: 'بسكويت شوفان',
        name_he: 'עוגיות שיבולת שועל',
        price: 3,
        category: 'snacks',
        icon: '🍪',
        trafficLight: 'yellow',
        available: true
    },
    {
        name_ar: 'كعكة تمر',
        name_he: 'עוגת תמרים',
        price: 4,
        category: 'snacks',
        icon: '🧁',
        trafficLight: 'yellow',
        available: true
    },
    {
        name_ar: 'سلطة خضار',
        name_he: 'סלט ירקות',
        price: 6,
        category: 'healthy',
        icon: '🥗',
        trafficLight: 'green',
        available: true
    },
    {
        name_ar: 'فواكه مقطعة',
        name_he: 'פירות חתוכים',
        price: 5,
        category: 'healthy',
        icon: '🍇',
        trafficLight: 'green',
        available: true
    },
    {
        name_ar: 'لبن زبادي',
        name_he: 'יוגורט',
        price: 3,
        category: 'healthy',
        icon: '🥛',
        trafficLight: 'green',
        available: true
    },
    {
        name_ar: 'شوكولاتة',
        name_he: 'שוקולד',
        price: 4,
        category: 'snacks',
        icon: '🍫',
        trafficLight: 'red',
        available: true
    }
];

async function seedProducts() {
    console.log('🌱 Starting data seeding...');

    // Check if products already exist
    const snapshot = await db.collection('products').limit(1).get();
    if (!snapshot.empty) {
        console.log('✅ Products already exist. Skipping seed.');
        return;
    }

    // Add all products
    const batch = db.batch();

    initialProducts.forEach(product => {
        const docRef = db.collection('products').doc();
        batch.set(docRef, {
            ...product,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    });

    try {
        await batch.commit();
        console.log('✅ Products seeded successfully!');
        showToast('طما تمت إضافة المنتجات بنجاح', 'success');
    } catch (error) {
        console.error('❌ Error seeding products:', error);
        showToast('خطأ في إضافة المنتجات', 'error');
    }
}
