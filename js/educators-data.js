// ========================================
// بذور المعرفة - Smart Eco-Market
// Educators Database
// ========================================

/**
 * قائمة المربين في المدرسة
 * 18 مربي - 6 صفوف × 3 شعب
 */
const EDUCATORS_DB = [
    // الصف الأول
    {
        id: 'edu_1_1',
        name: 'سهير',
        fullName: 'سهير',
        phone: '0506707216',
        grade: 1,
        section: 1,
        weeklyPointsLimit: 5
    },
    {
        id: 'edu_1_2',
        name: 'ناريمان اغبارية',
        fullName: 'ناريمان اغبارية',
        phone: '0504844175',
        grade: 1,
        section: 2,
        weeklyPointsLimit: 5
    },
    {
        id: 'edu_1_3',
        name: 'نعمة اغبارية',
        fullName: 'نعمة اغبارية',
        phone: '0526677965',
        grade: 1,
        section: 3,
        weeklyPointsLimit: 5
    },

    // الصف الثاني
    {
        id: 'edu_2_1',
        name: 'زهرة جمال',
        fullName: 'زهرة جمال',
        phone: '0509452999',
        grade: 2,
        section: 1,
        weeklyPointsLimit: 5
    },
    {
        id: 'edu_2_2',
        name: 'سعاد اغبارية',
        fullName: 'سعاد اغبارية',
        phone: '0507877331',
        grade: 2,
        section: 2,
        weeklyPointsLimit: 5
    },
    {
        id: 'edu_2_3',
        name: 'ايمان اغبارية',
        fullName: 'ايمان اغبارية',
        phone: '0523993813',
        grade: 2,
        section: 3,
        weeklyPointsLimit: 5
    },

    // الصف الثالث
    {
        id: 'edu_3_1',
        name: 'راضية اغبارية',
        fullName: 'راضية اغبارية',
        phone: '0526459026',
        grade: 3,
        section: 1,
        weeklyPointsLimit: 5
    },
    {
        id: 'edu_3_2',
        name: 'جيهان اغبارية',
        fullName: 'جيهان اغبارية',
        phone: '0506391826',
        grade: 3,
        section: 2,
        weeklyPointsLimit: 5
    },
    {
        id: 'edu_3_3',
        name: 'سمير ملحم',
        fullName: 'سمير ملحم',
        phone: '0526733315',
        grade: 3,
        section: 3,
        weeklyPointsLimit: 5
    },

    // الصف الرابع
    {
        id: 'edu_4_1',
        name: 'سماهر اغبارية',
        fullName: 'سماهر اغبارية',
        phone: '0505946936',
        grade: 4,
        section: 1,
        weeklyPointsLimit: 5
    },
    {
        id: 'edu_4_2',
        name: 'اوصاف جبارين',
        fullName: 'اوصاف جبارين',
        phone: '0542279841',
        grade: 4,
        section: 2,
        weeklyPointsLimit: 5
    },
    {
        id: 'edu_4_3',
        name: 'فاتن غنايم',
        fullName: 'فاتن غنايم',
        phone: '0502720301',
        grade: 4,
        section: 3,
        weeklyPointsLimit: 5
    },

    // الصف الخامس
    {
        id: 'edu_5_1',
        name: 'فايزة جبارين',
        fullName: 'فايزة جبارين',
        phone: '0507502153',
        grade: 5,
        section: 1,
        weeklyPointsLimit: 5
    },
    {
        id: 'edu_5_2',
        name: 'عليا جبارين',
        fullName: 'عليا جبارين',
        phone: '0526888653',
        grade: 5,
        section: 2,
        weeklyPointsLimit: 5
    },
    {
        id: 'edu_5_3',
        name: 'نهى شربجي',
        fullName: 'نهى شربجي',
        phone: '0508820402',
        grade: 5,
        section: 3,
        weeklyPointsLimit: 5
    },

    // الصف السادس
    {
        id: 'edu_6_1',
        name: 'محمد اغبارية',
        fullName: 'محمد اغبارية',
        phone: '0505666228',
        grade: 6,
        section: 1,
        weeklyPointsLimit: 5
    },
    {
        id: 'edu_6_2',
        name: 'رقية جبارين',
        fullName: 'رقية جبارين',
        phone: '0523202225',
        grade: 6,
        section: 2,
        weeklyPointsLimit: 5
    },
    {
        id: 'edu_6_3',
        name: 'ملاك اغبارية',
        fullName: 'ملاك اغبارية',
        phone: '0505440465',
        grade: 6,
        section: 3,
        weeklyPointsLimit: 5
    }
];

/**
 * البحث عن مربي برقم الهاتف
 * @param {string} phone - رقم الهاتف
 * @returns {object|null} - بيانات المربي أو null
 */
function findEducatorByPhone(phone) {
    // إزالة المسافات والأحرف الخاصة
    const cleanPhone = phone.replace(/\s+/g, '').replace(/\D/g, '');

    return EDUCATORS_DB.find(edu => {
        const eduPhone = edu.phone.replace(/\s+/g, '').replace(/\D/g, '');
        return eduPhone === cleanPhone;
    });
}

/**
 * الحصول على مربي حسب الصف والشعبة
 * @param {number} grade - رقم الصف (1-6)
 * @param {number} section - رقم الشعبة (1-3)
 * @returns {object|null} - بيانات المربي
 */
function getEducatorByClass(grade, section) {
    return EDUCATORS_DB.find(edu =>
        edu.grade === parseInt(grade) && edu.section === parseInt(section)
    );
}

/**
 * الحصول على جميع المربين
 * @returns {array} - قائمة جميع المربين
 */
function getAllEducators() {
    return [...EDUCATORS_DB];
}

/**
 * رفع بيانات المربين إلى Firebase
 * يجب استدعاء هذه الدالة مرة واحدة فقط لإنشاء قاعدة البيانات
 */
async function uploadEducatorsToFirebase() {
    if (!window.db) {
        console.error('❌ Firebase not initialized');
        return { success: false, error: 'Firebase not initialized' };
    }

    try {
        const batch = db.batch();

        EDUCATORS_DB.forEach(educator => {
            const docRef = db.collection('educators').doc(educator.id);
            batch.set(docRef, {
                ...educator,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                active: true
            });
        });

        await batch.commit();
        console.log('✅ Educators uploaded successfully!');
        return { success: true, count: EDUCATORS_DB.length };
    } catch (error) {
        console.error('❌ Error uploading educators:', error);
        return { success: false, error: error.message };
    }
}

// تصدير للاستخدام في ملفات أخرى
if (typeof window !== 'undefined') {
    window.EDUCATORS_DB = EDUCATORS_DB;
    window.findEducatorByPhone = findEducatorByPhone;
    window.getEducatorByClass = getEducatorByClass;
    window.getAllEducators = getAllEducators;
    window.uploadEducatorsToFirebase = uploadEducatorsToFirebase;
}
