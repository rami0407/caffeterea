// ========================================
// بذور المعرفة - Smart Eco-Market
// Internationalization (i18n) System
// Arabic & Hebrew
// ========================================

// Language data
const translations = {
    ar: {
        // App
        appName: "مقصف المعرفة",
        tagline: "منظومة المقصف الذكي والمستدام",
        footer: "🌍 من الكود إلى الأخضر | Smart Eco-Market",

        // Roles
        selectRole: "اختر نوع المستخدم",
        student: "طالب",
        studentDesc: "اطلب وجبتك واستمتع!",
        educator: "مربي",
        educatorDesc: "أدِر مكافآت طلابك",
        cafeteria: "المقصف",
        cafeteriaDesc: "إدارة الطلبات",
        admin: "الإدارة",
        adminDesc: "لوحة التحكم الكاملة",
        guest: "ضيف",
        guestDesc: "تصفح القائمة",

        // Login
        login: "تسجيل الدخول",
        loginTitle: "مرحباً بعودتك!",
        email: "البريد الإلكتروني",
        password: "كلمة المرور",
        loginBtn: "دخول",
        noAccount: "ليس لديك حساب؟",
        register: "سجل الآن",
        forgotPassword: "نسيت كلمة المرور؟",

        // Register
        registerTitle: "إنشاء حساب جديد",
        fullName: "الاسم الكامل",
        confirmPassword: "تأكيد كلمة المرور",
        className: "الصف",
        registerBtn: "إنشاء حساب",
        hasAccount: "لديك حساب بالفعل؟",
        selectGrade: "اختر الصف",
        selectSection: "اختر الشعبة",
        grade1: "الصف الأول",
        grade2: "الصف الثاني",
        grade3: "الصف الثالث",
        grade4: "الصف الرابع",
        grade5: "الصف الخامس",
        grade6: "الصف السادس",
        section1: "شعبة 1",
        section2: "شعبة 2",
        section3: "شعبة 3",

        // Menu
        menu: "القائمة",
        categories: "الأقسام",
        allItems: "جميع المنتجات",
        sandwiches: "سندويشات",
        drinks: "مشروبات",
        snacks: "وجبات خفيفة",
        healthy: "صحي",
        addToCart: "أضف للسلة",

        // Cart
        cart: "سلة الطلبات",
        emptyCart: "السلة فارغة",
        total: "المجموع",
        checkout: "إتمام الطلب",
        orderSuccess: "تم الطلب بنجاح!",
        orderNumber: "رقم طلبك",
        ecoTriggerTitle: "شكراً لطلبك!",
        ecoTriggerMessage: "لا تنس مسح الرمز المربع على العلبة لتحويلها إلى أصيص زرع 🌱",

        // Wallet
        wallet: "المحفظة",
        balance: "الرصيد",
        coins: "نقطة",
        recentTransactions: "آخر المعاملات",
        reward: "مكافأة",
        purchase: "شراء",

        // Orders
        orders: "طلباتي",
        orderHistory: "سجل الطلبات",
        pending: "قيد الانتظار",
        preparing: "قيد التحضير",
        ready: "جاهز للاستلام",
        completed: "تم التسليم",
        noOrders: "لا توجد طلبات",

        // Educator
        myStudents: "طلابي",
        addReward: "إضافة مكافأة",
        rewardAmount: "عدد النقاط",
        rewardReason: "سبب المكافأة",
        confirmReward: "تأكيد المكافأة",
        rewardSuccess: "تم إضافة المكافأة!",

        // Cafeteria
        incomingOrders: "الطلبات الواردة",
        markPreparing: "بدء التحضير",
        markReady: "جاهز",
        markCompleted: "تم التسليم",

        // Admin
        dashboard: "لوحة التحكم",
        manageMenu: "إدارة القائمة",
        manageUsers: "إدارة المستخدمين",
        reports: "التقارير",
        addProduct: "إضافة منتج",
        editProduct: "تعديل المنتج",
        deleteProduct: "حذف المنتج",
        totalSales: "إجمالي المبيعات",
        totalOrders: "عدد الطلبات",
        popularProducts: "الأكثر مبيعاً",

        // Nutrition
        nutritionInfo: "القيم الغذائية",
        calories: "سعرات",
        protein: "بروتين",
        carbs: "كربوهيدرات",
        fat: "دهون",
        healthyChoice: "خيار صحي",
        moderate: "متوسط",
        treat: "حلوى",

        // Navigation
        home: "الرئيسية",
        back: "رجوع",
        logout: "تسجيل الخروج",
        settings: "الإعدادات",
        profile: "الملف الشخصي",

        // Messages
        loading: "جاري التحميل...",
        error: "حدث خطأ",
        success: "تم بنجاح",
        confirm: "تأكيد",
        cancel: "إلغاء",
        save: "حفظ",
        delete: "حذف",
        edit: "تعديل",
        search: "بحث...",
        noResults: "لا توجد نتائج",
        insufficientBalance: "رصيد غير كافٍ",

        // QR Code
        scanQR: "امسح الكود",
        qrInfo: "امسح الكود لمعرفة المزيد",

        // Days
        today: "اليوم",
        yesterday: "أمس",

        // Errors
        emailRequired: "البريد الإلكتروني مطلوب",
        passwordRequired: "كلمة المرور مطلوبة",
        invalidEmail: "بريد إلكتروني غير صحيح",
        weakPassword: "كلمة المرور ضعيفة",
        emailInUse: "البريد مستخدم مسبقاً",
        wrongPassword: "كلمة المرور خاطئة",
        userNotFound: "المستخدم غير موجود",

        // Phone Auth
        phone: "رقم الهاتف",
        phoneRequired: "رقم الهاتف مطلوب",
        invalidPhone: "رقم الهاتف غير صحيح (يجب أن يكون 10 أرقام)",
        phoneInUse: "رقم الهاتف مسجل مسبقاً",
        selectEducator: "اختر المربي",
        selectEducatorPlaceholder: "اختر اسم المربي...",
        accountPending: "الحساب بانتظار موافقة المربي",
        waitForApproval: "يرجى الانتظار حتى يقوم المربي بتفعيل حسابك",

        // Competition
        competitionTitle: "مسابقة أجمل شعار",
        competitionDesc: "شاركنا إبداعك واربح جوائز!",
        uploadDesign: "ارفع تصميمك",
        uploaderName: "الاسم الرباعي",
        uploaderPhone: "رقم الهاتف (اختياري)",
        uploadBtn: "إرسال المشاركة",
        uploadSuccess: "تم استلام مشاركتك بنجاح!",
        recentEntries: "المشاركات الحالية",
        shareThoughts: "شاركنا شعارك",
        postContent: "شعارك المبدع",
        publishBtn: "شارك الآن",
        like: "إعجاب",
        comment: "تعليق",
        writeComment: "اكتب تعليقاً...",
        send: "إرسال",
        noComments: "كن أول المعلقين!",
        likesCount: "إعجاب",
        commentsCount: "تعليق",

        // About Page
        about: "نبذة عن المشروع",
        aboutTitle: "عن مقصف المعرفة",
        ourVision: "رؤيتنا",
        visionText: "نسعى لبناء جيل واعٍ صحياً وبيئياً من خلال دمج التكنولوجيا في حياتهم اليومية.",
        contactUs: "تواصل معنا",
        email: "البريد الإلكتروني",
        location: "الموقع",
        phone: "الهاتف"
    },

    he: {
        // App
        appName: "קנטינה הידע",
        tagline: "מערכת הקפיטריה החכמה והירוקה",
        footer: "🌍 מקוד לירוק | Smart Eco-Market",

        // Roles
        selectRole: "בחר סוג משתמש",
        student: "תלמיד",
        studentDesc: "הזמן את הארוחה שלך!",
        educator: "מחנך",
        educatorDesc: "נהל את התגמולים לתלמידים",
        cafeteria: "קפיטריה",
        cafeteriaDesc: "ניהול הזמנות",
        admin: "ניהול",
        adminDesc: "לוח בקרה מלא",
        guest: "אורח",
        guestDesc: "צפה בתפריט",

        // Login
        login: "התחברות",
        loginTitle: "!ברוך שובך",
        email: "אימייל",
        password: "סיסמה",
        loginBtn: "התחבר",
        noAccount: "?אין לך חשבון",
        register: "הירשם עכשיו",
        forgotPassword: "?שכחת סיסמה",

        // Register
        registerTitle: "יצירת חשבון חדש",
        fullName: "שם מלא",
        confirmPassword: "אימות סיסמה",
        className: "כיתה",
        registerBtn: "צור חשבון",
        hasAccount: "?כבר יש לך חשבון",
        selectGrade: "בחר כיתה",
        selectSection: "בחר חטיבה",
        grade1: "כיתה א'",
        grade2: "כיתה ב'",
        grade3: "כיתה ג'",
        grade4: "כיתה ד'",
        grade5: "כיתה ה'",
        grade6: "כיתה ו'",
        section1: "חטיבה 1",
        section2: "חטיבה 2",
        section3: "חטיבה 3",

        // Menu
        menu: "תפריט",
        categories: "קטגוריות",
        allItems: "כל המוצרים",
        sandwiches: "כריכים",
        drinks: "משקאות",
        snacks: "חטיפים",
        healthy: "בריא",
        addToCart: "הוסף לעגלה",

        // Cart
        cart: "עגלת קניות",
        emptyCart: "העגלה ריקה",
        total: 'סה"כ',
        checkout: "לתשלום",
        orderSuccess: "!ההזמנה בוצעה בהצלחה",
        orderNumber: "מספר הזמנה",
        ecoTriggerTitle: "!תודה על הזמנתך",
        ecoTriggerMessage: "אל תשכח לסרוק את הברקוד על הקופסה כדי להפוך אותה לעציץ 🌱",

        // Wallet
        wallet: "ארנק",
        balance: "יתרה",
        coins: "נקודות",
        recentTransactions: "פעולות אחרונות",
        reward: "תגמול",
        purchase: "רכישה",

        // Orders
        orders: "ההזמנות שלי",
        orderHistory: "היסטוריית הזמנות",
        pending: "ממתין",
        preparing: "בהכנה",
        ready: "מוכן לאיסוף",
        completed: "הושלם",
        noOrders: "אין הזמנות",

        // Educator
        myStudents: "התלמידים שלי",
        addReward: "הוסף תגמול",
        rewardAmount: "כמות נקודות",
        rewardReason: "סיבת התגמול",
        confirmReward: "אשר תגמול",
        rewardSuccess: "!התגמול נוסף בהצלחה",

        // Cafeteria
        incomingOrders: "הזמנות נכנסות",
        markPreparing: "התחל הכנה",
        markReady: "מוכן",
        markCompleted: "הושלם",

        // Admin
        dashboard: "לוח בקרה",
        manageMenu: "ניהול תפריט",
        manageUsers: "ניהול משתמשים",
        reports: "דוחות",
        addProduct: "הוסף מוצר",
        editProduct: "ערוך מוצר",
        deleteProduct: "מחק מוצר",
        totalSales: "סך מכירות",
        totalOrders: "מספר הזמנות",
        popularProducts: "הנמכרים ביותר",

        // Nutrition
        nutritionInfo: "ערכים תזונתיים",
        calories: "קלוריות",
        protein: "חלבון",
        carbs: "פחמימות",
        fat: "שומן",
        healthyChoice: "בחירה בריאה",
        moderate: "מתון",
        treat: "פינוק",

        // Navigation
        home: "בית",
        back: "חזרה",
        logout: "התנתק",
        settings: "הגדרות",
        profile: "פרופיל",

        // Messages
        loading: "...טוען",
        error: "אירעה שגיאה",
        success: "בוצע בהצלחה",
        confirm: "אישור",
        cancel: "ביטול",
        save: "שמור",
        delete: "מחק",
        edit: "ערוך",
        search: "...חיפוש",
        noResults: "אין תוצאות",
        insufficientBalance: "יתרה לא מספיקה",

        // QR Code
        scanQR: "סרוק קוד",
        qrInfo: "סרוק לקבלת מידע נוסף",

        // Days
        today: "היום",
        yesterday: "אתמול",

        // Errors
        emailRequired: "נדרש אימייל",
        passwordRequired: "נדרשת סיסמה",
        invalidEmail: "אימייל לא תקין",
        weakPassword: "סיסמה חלשה",
        emailInUse: "האימייל כבר בשימוש",
        wrongPassword: "סיסמה שגויה",
        userNotFound: "משתמש לא נמצא",

        // Phone Auth
        phone: "מספר טלפון",
        phoneRequired: "נדרש מספר טלפון",
        invalidPhone: "מספר טלפון לא תקין (חייב להיות 10 ספרות)",
        phoneInUse: "מספר הטלפון קיים במערכת",
        selectEducator: "בחר מחנך",
        selectEducatorPlaceholder: "בחר שם המחנך...",
        accountPending: "החשבון ממתין לאישור המחנך",
        waitForApproval: "אנא המתן עד שהמחנך יפעיל את חשבונך",

        // Competition
        competitionTitle: "תחרות הלוגו היפה ביותר",
        competitionDesc: "!שתף אותנו ביצירתיות שלך וזכה בפרסים",
        uploadDesign: "העלה את העיצוב שלך",
        uploaderName: "שם מלא",
        uploaderPhone: "מספר טלפון (אופציונלי)",
        uploadBtn: "שלח השתתפות",
        uploadSuccess: "!ההשתתפות התקבלה בהצלחה",
        recentEntries: "משתתפים אחרונים",
        shareThoughts: "שתף את הלוגו שלך",
        postContent: "הלוגו היצירתי שלך",
        publishBtn: "שתף עכשיו",
        like: "לייק",
        comment: "תגובה",
        writeComment: "...כתוב תגובה",
        send: "שלח",
        noComments: "!היה הראשון להגיב",
        likesCount: "לייקים",
        commentsCount: "תגובות",

        // About Page
        about: "אודות הפרויקט",
        aboutTitle: "על קנטינה הידע",
        ourVision: "החזון שלנו",
        visionText: "אנו שואפים לבנות דור מודע בריאותית וסביבתית באמצעות שילוב טכנולוגיה בחיי היומיום.",
        contactUs: "צור קשר",
        email: "אימייל",
        location: "מיקום",
        phone: "טלפון"
    }
};

// Current language
let currentLang = 'ar';

// Initialize i18n
function initI18n() {
    // Get saved language or default to Arabic
    currentLang = localStorage.getItem('eco-market-lang') || 'ar';
    applyLanguage();
}

// Set language
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('eco-market-lang', lang);
    applyLanguage();
}

// Get current language
function getCurrentLang() {
    return currentLang;
}

// Apply language to page
function applyLanguage() {
    const html = document.documentElement;

    // Set direction
    html.setAttribute('dir', currentLang === 'he' ? 'ltr' : 'rtl');
    html.setAttribute('lang', currentLang);

    // Translate all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = t(key);
        if (translation) {
            element.textContent = translation;
        }
    });

    // Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const translation = t(key);
        if (translation) {
            element.setAttribute('placeholder', translation);
        }
    });

    // Update active language button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
}

// Translate function
function t(key) {
    return translations[currentLang]?.[key] || translations['ar']?.[key] || key;
}

// Format currency (points)
function formatCoins(amount) {
    return `${amount} ${t('coins')}`;
}

// Format date
function formatDate(timestamp) {
    if (!timestamp) return '';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const dayDiff = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (dayDiff === 0) {
        return t('today') + ' ' + date.toLocaleTimeString(currentLang === 'he' ? 'he-IL' : 'ar-EG', {
            hour: '2-digit',
            minute: '2-digit'
        });
    } else if (dayDiff === 1) {
        return t('yesterday');
    } else {
        return date.toLocaleDateString(currentLang === 'he' ? 'he-IL' : 'ar-EG', {
            day: 'numeric',
            month: 'short'
        });
    }
}

// Format number
function formatNumber(num) {
    return new Intl.NumberFormat(currentLang === 'he' ? 'he-IL' : 'ar-EG').format(num);
}
