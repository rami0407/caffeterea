// ========================================
// بذور المعرفة - آلة حاسبة التغذية الذكية
// Nutrition Calculator Logic
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('nutritionForm');
    const resultsSection = document.getElementById('results');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        calculateNutrition();
    });
});

/**
 * حساب الاحتياجات الغذائية
 */
function calculateNutrition() {
    // Get form values
    const age = parseInt(document.getElementById('age').value);
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    const activityLevel = parseFloat(document.getElementById('activity').value);

    // Calculate BMI
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);

    // Calculate BMR using Harris-Benedict Equation
    let bmr;
    if (gender === 'male') {
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    // Calculate total daily calories
    const calories = Math.round(bmr * activityLevel);

    // Calculate macronutrients
    // Carbs: 50% of calories (4 cal/gram)
    const carbs = Math.round((calories * 0.50) / 4);

    // Protein: 30% of calories (4 cal/gram)
    const protein = Math.round((calories * 0.30) / 4);

    // Fats: 20% of calories (9 cal/gram)
    const fats = Math.round((calories * 0.20) / 9);

    // Water: 30-40 ml per kg of body weight
    const water = ((weight * 35) / 1000).toFixed(1);

    // Display results
    displayResults({
        bmi: bmi.toFixed(1),
        calories,
        protein,
        carbs,
        fats,
        water,
        age,
        gender,
        weight
    });
}

/**
 * عرض النتائج
 */
function displayResults(data) {
    // Show results section
    const resultsSection = document.getElementById('results');
    resultsSection.classList.remove('hidden');

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Display BMI
    document.getElementById('bmiValue').textContent = data.bmi;
    const bmiStatus = document.getElementById('bmiStatus');
    const bmiCategory = getBMICategory(parseFloat(data.bmi), data.age);
    bmiStatus.textContent = bmiCategory.text;
    bmiStatus.style.color = bmiCategory.color;

    // Display calories and macros
    document.getElementById('caloriesValue').textContent = data.calories;
    document.getElementById('proteinValue').textContent = data.protein + ' غ';
    document.getElementById('carbsValue').textContent = data.carbs + ' غ';
    document.getElementById('fatsValue').textContent = data.fats + ' غ';
    document.getElementById('waterValue').textContent = data.water + ' ل';

    // Animate numbers
    animateNumbers();

    // Generate recommendations
    generateRecommendations(data);

    // Generate meal plan
    generateMealPlan(data);

    // Show success toast
    showToast('تم حساب احتياجاتك بنجاح! 🎉', 'success');
}

/**
 * تحديد فئة BMI للأطفال والبالغين
 */
function getBMICategory(bmi, age) {
    // BMI categories for adults (18+)
    if (age >= 18) {
        if (bmi < 18.5) {
            return { text: 'نحيف', color: '#f59e0b' };
        } else if (bmi < 25) {
            return { text: 'وزن طبيعي ✓', color: '#10b981' };
        } else if (bmi < 30) {
            return { text: 'وزن زائد', color: '#f59e0b' };
        } else {
            return { text: 'سمنة', color: '#ef4444' };
        }
    }

    // BMI categories for children (simplified)
    if (bmi < 16) {
        return { text: 'نحيف جداً', color: '#ef4444' };
    } else if (bmi < 18.5) {
        return { text: 'نحيف', color: '#f59e0b' };
    } else if (bmi < 25) {
        return { text: 'طبيعي ✓', color: '#10b981' };
    } else if (bmi < 30) {
        return { text: 'وزن زائد', color: '#f59e0b' };
    } else {
        return { text: 'سمنة', color: '#ef4444' };
    }
}

/**
 * تحريك الأرقام
 */
function animateNumbers() {
    const resultBoxes = document.querySelectorAll('.result-box');
    resultBoxes.forEach((box, index) => {
        box.style.animation = `fadeInUp 0.5s ease-out ${index * 0.1}s forwards`;
        box.style.opacity = '0';
    });
}

/**
 * إنشاء التوصيات
 */
function generateRecommendations(data) {
    const recommendationList = document.getElementById('recommendationList');

    const recommendations = [
        {
            icon: '🥗',
            title: 'تنوع الطعام',
            text: 'احرصوا على تنويع الأطعمة لتشمل جميع المجموعات الغذائية'
        },
        {
            icon: '💧',
            title: 'شرب الماء',
            text: `يحتاج طفلك إلى ${data.water} لتر من الماء يومياً`
        },
        {
            icon: '🍎',
            title: 'الفواكه والخضروات',
            text: 'يُنصح بتناول 5 حصص من الفواكه والخضروات يومياً'
        },
        {
            icon: '🥛',
            title: 'منتجات الألبان',
            text: 'منتجات الألبان مهمة لبناء العظام القوية'
        },
        {
            icon: '🏃',
            title: 'النشاط البدني',
            text: 'ساعة واحدة من النشاط البدني يومياً ضرورية للنمو الصحي'
        },
        {
            icon: '🚫',
            title: 'تجنب السكريات',
            text: 'قللوا من المشروبات الغازية والحلويات المصنعة'
        }
    ];

    recommendationList.innerHTML = recommendations.map(rec => `
        <div class="recommendation-item">
            <div class="recommendation-icon">${rec.icon}</div>
            <div class="recommendation-content">
                <h5>${rec.title}</h5>
                <p>${rec.text}</p>
            </div>
        </div>
    `).join('');
}

/**
 * إنشاء خطة وجبات
 */
function generateMealPlan(data) {
    const mealPlan = document.getElementById('mealPlan');

    const meals = [
        {
            icon: '🌅',
            name: 'الإفطار',
            time: '7:00 صباحاً',
            calories: Math.round(data.calories * 0.25),
            items: [
                'حليب أو لبن',
                'خبز القمح الكامل',
                'بيض أو جبنة',
                'فواكه طازجة'
            ]
        },
        {
            icon: '🌞',
            name: 'وجبة خفيفة',
            time: '10:00 صباحاً',
            calories: Math.round(data.calories * 0.10),
            items: [
                'فواكه موسمية',
                'حفنة من المكسرات',
                'عصير طبيعي'
            ]
        },
        {
            icon: '☀️',
            name: 'الغداء',
            time: '1:00 ظهراً',
            calories: Math.round(data.calories * 0.35),
            items: [
                'أرز أو معكرونة',
                'لحم أو دجاج أو سمك',
                'سلطة خضراء',
                'خضروات مطبوخة'
            ]
        },
        {
            icon: '🌤️',
            name: 'وجبة خفيفة',
            time: '4:00 عصراً',
            calories: Math.round(data.calories * 0.10),
            items: [
                'زبادي',
                'خضروات طازجة',
                'ساندويتش صغير'
            ]
        },
        {
            icon: '🌙',
            name: 'العشاء',
            time: '7:00 مساءً',
            calories: Math.round(data.calories * 0.20),
            items: [
                'شوربة خضار',
                'ساندويتش صحي',
                'سلطة أو فواكه'
            ]
        }
    ];

    mealPlan.innerHTML = meals.map(meal => `
        <div class="meal-card">
            <div class="meal-header">
                <div class="meal-icon">${meal.icon}</div>
                <div class="meal-info">
                    <h4>${meal.name}</h4>
                    <p class="meal-time">${meal.time}</p>
                </div>
                <div class="meal-calories">${meal.calories} سعرة</div>
            </div>
            <ul class="meal-items">
                ${meal.items.map(item => `<li>${item}</li>`).join('')}
            </ul>
        </div>
    `).join('');
}

/**
 * عرض إشعار Toast
 */
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type === 'error' ? 'error' : ''}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
