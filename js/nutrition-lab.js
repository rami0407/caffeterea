// ========================================
// بذور المعرفة - مختبر التغذية الافتراضي
// Nutrition Lab Logic
// ========================================

// بيانات العناصر الغذائية
const nutrients = [
    {
        id: 'protein',
        name: 'البروتين',
        icon: '🥩',
        color: '#ef4444',
        description: 'أساس بناء العضلات والخلايا',
        benefits: ['بناء العضلات', 'إصلاح الأنسجة', 'إنتاج الإنزيمات'],
        sources: ['اللحوم', 'البيض', 'الألبان', 'البقوليات'],
        dailyNeed: 'حوالي 1 غرام لكل كيلوغرام من الوزن'
    },
    {
        id: 'carbs',
        name: 'الكربوهيدرات',
        icon: '🍞',
        color: '#f59e0b',
        description: 'الوقود الرئيسي للجسم والدماغ',
        benefits: ['توفير الطاقة', 'تحسين الذاكرة', 'دعم النشاط البدني'],
        sources: ['الخبز', 'الأرز', 'المعكرونة', 'الفواكه'],
        dailyNeed: '50-60% من السعرات اليومية'
    },
    {
        id: 'fats',
        name: 'الدهون الصحية',
        icon: '🥑',
        color: '#10b981',
        description: 'ضرورية لامتصاص الفيتامينات',
        benefits: ['حماية الأعضاء', 'امتصاص فيتامينات A,D,E,K', 'صحة الدماغ'],
        sources: ['المكسرات', 'زيت الزيتون', 'الأفوكادو', 'الأسماك'],
        dailyNeed: '20-30% من السعرات اليومية'
    },
    {
        id: 'vitamins',
        name: 'الفيتامينات',
        icon: '🍊',
        color: '#f97316',
        description: 'مغذيات دقيقة ضرورية للصحة',
        benefits: ['تقوية المناعة', 'صحة الجلد', 'قوة العظام'],
        sources: ['الفواكه', 'الخضروات', 'الألبان'],
        dailyNeed: 'حسب نوع الفيتامين'
    },
    {
        id: 'minerals',
        name: 'المعادن',
        icon: '🥛',
        color: '#3b82f6',
        description: 'عناصر أساسية لوظائف الجسم',
        benefits: ['قوة العظام', 'تكوين الدم', 'توازن السوائل'],
        sources: ['الألبان', 'الخضروات الورقية', 'اللحوم'],
        dailyNeed: 'حسب نوع المعدن'
    },
    {
        id: 'fiber',
        name: 'الألياف',
        icon: '🥗',
        color: '#22c55e',
        description: 'تحسن الهضم وصحة الأمعاء',
        benefits: ['تحسين الهضم', 'الشعور بالشبع', 'صحة القلب'],
        sources: ['الخضروات', 'الفواكه', 'الحبوب الكاملة'],
        dailyNeed: '25-30 غرام يومياً'
    }
];

// حقائق "هل تعلم؟"
const facts = [
    {
        icon: '🧠',
        title: 'الدماغ يحتاج للسكر',
        text: 'دماغك يستهلك 20% من طاقة جسمك، رغم أنه يشكل فقط 2% من وزنك!'
    },
    {
        icon: '💧',
        title: 'الماء أساسي للحياة',
        text: 'جسم الإنسان يتكون من 60% ماء، ويحتاج إلى 8 أكواب يومياً'
    },
    {
        icon: '🥕',
        title: 'الجزر والع EYES',
        text: 'الجزر غني بفيتامين A الذي يحسن الرؤية في الظلام'
    },
    {
        icon: '🍎',
        title: 'التفاح كشناق صحي',
        text: 'تفاحة واحدة في اليوم تبقيك بعيداً عن الطبيب - مثل إنجليزي'
    },
    {
        icon: '🦴',
        title: 'الحليب للعظام القوية',
        text: 'كوب من الحليب يحتوي على 30% من احتياجك اليومي من الكالسيوم'
    },
    {
        icon: '🍌',
        title: 'الموز للطاقة',
        text: 'موزة واحدة تمنحك طاقة تكفي لمدة 90 دقيقة من التمارين'
    }
];

// أسئلة الاختبار
const quizQuestions = [
    {
        question: 'ما هو العنصر الغذائي المسؤول عن بناء العضلات؟',
        options: ['البروتين', 'الكربوهيدرات', 'الفيتامينات', 'الماء'],
        correct: 0,
        explanation: 'البروتين هو المسؤول الرئيسي عن بناء وإصلاح العضلات والأنسجة'
    },
    {
        question: 'كم نسبة الماء في جسم الإنسان؟',
        options: ['30%', '50%', '60%', '80%'],
        correct: 2,
        explanation: 'جسم الإنسان يتكون من حوالي 60% ماء'
    },
    {
        question: 'أي من هذه الأطعمة غني بالألياف؟',
        options: ['البطاطس المقلية', 'الخضروات', 'الحلويات', 'المشروبات الغازية'],
        correct: 1,
        explanation: 'الخضروات غنية بالألياف التي تحسن عملية الهضم'
    },
    {
        question: 'ما هو الفيتامين الموجود في البرتقال؟',
        options: ['فيتامين A', 'فيتامين B', 'فيتامين C', 'فيتامين D'],
        correct: 2,
        explanation: 'البرتقال غني بفيتامين C الذي يقوي المناعة'
    },
    {
        question: 'كم كوب ماء يحتاج الجسم يومياً؟',
        options: ['2-3 أكواب', '4-5 أكواب', '6-8 أكواب', '10-12 كوب'],
        correct: 2,
        explanation: 'الجسم يحتاج من 6 إلى 8 أكواب من الماء يومياً'
    }
];

// الشارات
const badges = [
    { id: 'beginner', name: 'مبتدئ التغذية', icon: '🌱', requirement: 0, unlocked: true },
    { id: 'learner', name: 'متعلم نشيط', icon: '📚', requirement: 50, unlocked: false },
    { id: 'expert', name: 'خبير التغذية', icon: '🏆', requirement: 100, unlocked: false },
    { id: 'master', name: 'أستاذ العلوم', icon: '👨‍🔬', requirement: 200, unlocked: false }
];

// المتغيرات العامة
let currentFactIndex = 0;
let currentQuestionIndex = 0;
let score = 0;
let totalPoints = parseInt(localStorage.getItem('labPoints') || '0');

// ========================================
// التهيئة
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    displayNutrients();
    displayFact();
    loadQuiz();
    displayBadges();
    updatePointsDisplay();
});

// ========================================
// عرض العناصر الغذائية
// ========================================
function displayNutrients() {
    const grid = document.getElementById('nutrientsGrid');
    grid.innerHTML = nutrients.map((nutrient, index) => `
        <div class="nutrient-card" style="animation-delay: ${index * 0.1}s" onclick="openNutrientModal('${nutrient.id}')">
            <div class="nutrient-icon" style="background: ${nutrient.color}">${nutrient.icon}</div>
            <h4>${nutrient.name}</h4>
            <p>${nutrient.description}</p>
            <button class="btn-learn">تعلم المزيد →</button>
        </div>
    `).join('');
}

// ========================================
// عرض الحقائق
// ========================================
function displayFact() {
    const fact = facts[currentFactIndex];
    document.getElementById('factDisplay').innerHTML = `
        <div class="fact-card">
            <div class="fact-icon">${fact.icon}</div>
            <h4>${fact.title}</h4>
            <p>${fact.text}</p>
        </div>
    `;
}

function nextFact() {
    currentFactIndex = (currentFactIndex + 1) % facts.length;
    displayFact();
}

function prevFact() {
    currentFactIndex = (currentFactIndex - 1 + facts.length) % facts.length;
    displayFact();
}

// ========================================
// الاختبار
// ========================================
function loadQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    displayQuestion();
}

function displayQuestion() {
    if (currentQuestionIndex >= quizQuestions.length) {
        showQuizResults();
        return;
    }

    const question = quizQuestions[currentQuestionIndex];
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    document.getElementById('totalQuestions').textContent = quizQuestions.length;
    document.getElementById('quizQuestion').textContent = question.question;

    const optionsHTML = question.options.map((option, index) => `
        <button class="quiz-option" onclick="checkAnswer(${index})">
            ${option}
        </button>
    `).join('');

    document.getElementById('quizOptions').innerHTML = optionsHTML;
    document.getElementById('quizFeedback').classList.add('hidden');
    document.getElementById('quizNextBtn').style.display = 'none';
}

function checkAnswer(selectedIndex) {
    const question = quizQuestions[currentQuestionIndex];
    const isCorrect = selectedIndex === question.correct;

    if (isCorrect) {
        score++;
    }

    // Update UI
    const options = document.querySelectorAll('.quiz-option');
    options.forEach((option, index) => {
        option.disabled = true;
        if (index === question.correct) {
            option.classList.add('correct');
        } else if (index === selectedIndex && !isCorrect) {
            option.classList.add('wrong');
        }
    });

    // Show feedback
    const feedback = document.getElementById('quizFeedback');
    feedback.innerHTML = `
        <div class="feedback-icon">${isCorrect ? '✅' : '❌'}</div>
        <p><strong>${isCorrect ? 'إجابة صحيحة!' : 'إجابة خاطئة'}</strong></p>
        <p class="feedback-explanation">${question.explanation}</p>
    `;
    feedback.classList.remove('hidden');

    document.getElementById('quizNextBtn').style.display = 'block';
}

function nextQuestion() {
    currentQuestionIndex++;
    displayQuestion();
}

function showQuizResults() {
    document.getElementById('quizCard').classList.add('hidden');
    const resultsEl = document.getElementById('quizResults');
    resultsEl.classList.remove('hidden');

    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalTotal').textContent = quizQuestions.length;

    const earnedPoints = score * 10;
    document.getElementById('earnedPoints').textContent = earnedPoints;

    // Add points
    totalPoints += earnedPoints;
    localStorage.setItem('labPoints', totalPoints.toString());
    updatePointsDisplay();
    checkBadges();

    showToast(`رائع! ربحت ${earnedPoints} نقطة! ⭐`, 'success');
}

function restartQuiz() {
    document.getElementById('quizCard').classList.remove('hidden');
    document.getElementById('quizResults').classList.add('hidden');
    loadQuiz();
}

// ========================================
// الشارات
// ======================================== 
function displayBadges() {
    const grid = document.getElementById('badgesGrid');
    grid.innerHTML = badges.map(badge => {
        const unlocked = totalPoints >= badge.requirement;
        return `
            <div class="badge-card ${unlocked ? 'unlocked' : 'locked'}">
                <div class="badge-icon">${badge.icon}</div>
                <h4>${badge.name}</h4>
                <p>${unlocked ? '✓ مفتوحة' : `🔒 ${badge.requirement} نقطة`}</p>
            </div>
        `;
    }).join('');
}

function checkBadges() {
    badges.forEach(badge => {
        if (!badge.unlocked && totalPoints >= badge.requirement) {
            badge.unlocked = true;
            showToast(`🎉 فتحت شارة جديدة: ${badge.name}!`, 'success');
        }
    });
    displayBadges();
}

// ========================================
// النافذة المنبثقة للعنصر الغذائي
// ========================================
function openNutrientModal(nutrientId) {
    const nutrient = nutrients.find(n => n.id === nutrientId);
    if (!nutrient) return;

    const modalContent = `
        <div class="nutrient-modal-header" style="background: ${nutrient.color}">
            <div class="nutrient-modal-icon">${nutrient.icon}</div>
            <h3>${nutrient.name}</h3>
        </div>
        <div class="nutrient-modal-body">
            <p class="nutrient-description">${nutrient.description}</p>
            
            <h4>🌟 الفوائد:</h4>
            <ul class="benefits-list">
                ${nutrient.benefits.map(b => `<li>${b}</li>`).join('')}
            </ul>
            
            <h4>🍽️ المصادر:</h4>
            <div class="sources-tags">
                ${nutrient.sources.map(s => `<span class="source-tag">${s}</span>`).join('')}
            </div>
            
            <div class="daily-need">
                <strong>📊 الاحتياج اليومي:</strong> ${nutrient.dailyNeed}
            </div>
        </div>
    `;

    document.getElementById('nutrientModalContent').innerHTML = modalContent;
    document.getElementById('nutrientModal').classList.remove('hidden');
}

function closeNutrientModal() {
    document.getElementById('nutrientModal').classList.add('hidden');
}

// ========================================
// عرض النقاط
// ========================================
function updatePointsDisplay() {
    document.querySelector('.points-value').textContent = totalPoints;
}

// ========================================
// Toast
// ========================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type === 'error' ? 'error' : ''}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
