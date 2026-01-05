// Weight Loss Plan Generator
let currentPlan = null;

// Generate Weight Loss Plan
function generateWeightLossPlan() {
    // Get form values
    const age = parseInt(document.getElementById('wlAge').value);
    const gender = document.getElementById('wlGender').value;
    const height = parseInt(document.getElementById('wlHeight').value);
    const currentWeight = parseFloat(document.getElementById('wlCurrentWeight').value);
    const targetWeight = parseFloat(document.getElementById('wlTargetWeight').value);
    const activity = parseFloat(document.getElementById('wlActivity').value);
    const speed = document.getElementById('wlSpeed').value;
    const mealsPerDay = parseInt(document.getElementById('wlMeals').value);

    // Validation
    if (!age || !gender || !height || !currentWeight || !targetWeight || !activity || !speed || !mealsPerDay) {
        showToast('الرجاء تعبئة جميع الحقول', 'error');
        return;
    }

    if (targetWeight >= currentWeight) {
        showToast('الوزن المستهدف يجب أن يكون أقل من الوزن الحالي', 'error');
        return;
    }

    // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
        bmr = 10 * currentWeight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * currentWeight + 6.25 * height - 5 * age - 161;
    }

    // Calculate TDEE (Total Daily Energy Expenditure)
    const tdee = Math.round(bmr * activity);

    // Calculate deficit based on speed
    let deficit, weeklyloss;
    if (speed === 'slow') {
        deficit = 300; // Safe 300-400 cal deficit
        weeklyloss = '0.3-0.5';
    } else if (speed === 'moderate') {
        deficit = 500; // Standard 500 cal deficit
        weeklyloss = '0.5-0.7';
    } else { // fast
        deficit = 750; // Aggressive 750-1000 cal deficit
        weeklyloss = '0.8-1';
    }

    // Calculate daily calorie target
    let dailyCalories = tdee - deficit;

    // Safety check - minimum calories
    const minCalories = gender === 'male' ? 1500 : 1200;
    if (dailyCalories < minCalories) {
        dailyCalories = minCalories;
        showToast(`تم تعديل السعرات للحد الأدنى الآمن (${minCalories} سعرة)`, 'warning');
    }

    // Calculate macros
    const proteinGrams = Math.round(currentWeight * 2); // 2g per kg
    const proteinCals = proteinGrams * 4;

    const fatPercentage = 0.25; // 25% of calories
    const fatCals = Math.round(dailyCalories * fatPercentage);
    const fatGrams = Math.round(fatCals / 9);

    const carbsCals = dailyCalories - proteinCals - fatCals;
    const carbsGrams = Math.round(carbsCals / 4);

    // Calculate estimated duration
    const weightToLose = currentWeight - targetWeight;
    const weeksNeeded = Math.ceil(weightToLose / parseFloat(weeklyloss.split('-')[1]));

    // Build plan object
    currentPlan = {
        personalInfo: {
            age, gender, height, currentWeight, targetWeight, activity, speed, mealsPerDay
        },
        calculations: {
            bmr: Math.round(bmr),
            tdee,
            deficit,
            dailyCalories,
            proteinGrams,
            carbsGrams,
            fatGrams,
            weightToLose: weightToLose.toFixed(1),
            weeklyloss,
            weeksNeeded
        }
    };

    // Display the plan
    displayWeightLossPlan();
}

// Display Weight Loss Plan
function displayWeightLossPlan() {
    const plan = currentPlan;

    // Hide form, show plan
    document.getElementById('weightLossForm').classList.add('hidden');
    document.getElementById('weightLossPlan').classList.remove('hidden');

    // Fill summary
    const genderText = plan.personalInfo.gender === 'male' ? 'ذكر' : 'أنثى';
    document.getElementById('planSummary').innerHTML = `
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-icon">👤</div>
                <div class="summary-text">
                    <strong>${genderText}</strong>
                    <span>${plan.personalInfo.age} سنة</span>
                </div>
            </div>
            <div class="summary-item">
                <div class="summary-icon">⚖️</div>
                <div class="summary-text">
                    <strong>${plan.personalInfo.currentWeight} كجم → ${plan.personalInfo.targetWeight} كجم</strong>
                    <span>فرق: ${plan.calculations.weightToLose} كجم</span>
                </div>
            </div>
            <div class="summary-item">
                <div class="summary-icon">⏱️</div>
                <div class="summary-text">
                    <strong>المدة المتوقعة</strong>
                    <span>${plan.calculations.weeksNeeded} أسبوع (${Math.ceil(plan.calculations.weeksNeeded / 4)} شهر)</span>
                </div>
            </div>
            <div class="summary-item">
                <div class="summary-icon">📉</div>
                <div class="summary-text">
                    <strong>التنزيل الأسبوعي</strong>
                    <span>${plan.calculations.weeklyloss} كجم</span>
                </div>
            </div>
        </div>
    `;

    // Fill macros
    document.getElementById('planMacros').innerHTML = `
        <div class="macros-grid">
            <div class="macro-card main">
                <div class="macro-icon">🔥</div>
                <div class="macro-value">${plan.calculations.dailyCalories}</div>
                <div class="macro-label">سعرة حرارية/يوم</div>
                <small>من أصل ${plan.calculations.tdee} (عجز ${plan.calculations.deficit})</small>
            </div>
            <div class="macro-card">
                <div class="macro-icon">🥩</div>
                <div class="macro-value">${plan.calculations.proteinGrams}غ</div>
                <div class="macro-label">بروتين</div>
            </div>
            <div class="macro-card">
                <div class="macro-icon">🍞</div>
                <div class="macro-value">${plan.calculations.carbsGrams}غ</div>
                <div class="macro-label">كربوهيدرات</div>
            </div>
            <div class="macro-card">
                <div class="macro-icon">🥑</div>
                <div class="macro-value">${plan.calculations.fatGrams}غ</div>
                <div class="macro-label">دهون صحية</div>
            </div>
        </div>
    `;

    // Fill meal plan
    const caloriesPerMeal = Math.round(plan.calculations.dailyCalories / plan.personalInfo.mealsPerDay);
    let mealHTML = '<div class="meals-timeline">';

    const mealTimes = {
        3: ['الفطور (7:00)', 'الغداء (13:00)', 'العشاء (19:00)'],
        4: ['الفطور (7:00)', 'وجبة خفيفة (11:00)', 'الغداء (14:00)', 'العشاء (19:00)'],
        5: ['الفطور (7:00)', 'سناك صباحي (10:00)', 'الغداء (13:00)', 'سناك مسائي (16:00)', 'العشاء (19:00)'],
        6: ['وجبة 1 (7:00)', 'وجبة 2 (10:00)', 'وجبة 3 (13:00)', 'وجبة 4 (16:00)', 'وجبة 5 (19:00)', 'وجبة خفيفة (21:00)']
    };

    mealTimes[plan.personalInfo.mealsPerDay].forEach(meal => {
        mealHTML += `
            <div class="meal-item">
                <div class="meal-time">${meal}</div>
                <div class="meal-calories">~${caloriesPerMeal} سعرة</div>
            </div>
        `;
    });
    mealHTML += '</div>';
    document.getElementById('planMeals').innerHTML = mealHTML;

    // Fill exercise plan
    const activityLevel = parseFloat(plan.personalInfo.activity);
    let exerciseText = '';
    if (activityLevel <= 1.2) {
        exerciseText = `
            <div class="exercise-recommendation">
                <strong>⚠️ مستوى نشاطك منخفض جداً</strong>
                <p>للحصول على نتائج أفضل وصحة أفضل، ننصح بإضافة:</p>
                <ul>
                    <li>مشي سريع 20-30 دقيقة، 3-4 مرات أسبوعياً</li>
                    <li>تمارين منزلية بسيطة (قرفصاء، ضغط) 2-3 مرات أسبوعياً</li>
                    <li>أي نشاط جسدي تستمتع به</li>
                </ul>
                <small class="exercise-note">💡 البدء بشكل تدريجي أفضل من عدم البدء!</small>
            </div>
        `;
    } else if (activityLevel <= 1.55) {
        exerciseText = `
            <div class="exercise-recommendation">
                <strong>✅ نشاطك جيد - استمر!</strong>
                <p>للحفاظ على كتلتك العضلية مع تنزيل الوزن:</p>
                <ul>
                    <li>تمارين مقاومة (أوزان، تمارين جسم) 3 مرات أسبوعياً</li>
                    <li>كارديو متوسط الشدة 30-45 دقيقة، 3-4 مرات أسبوعياً</li>
                    <li>يوم راحة كامل بين تمارين المقاومة</li>
                </ul>
            </div>
        `;
    } else {
        exerciseText = `
            <div class="exercise-recommendation">
                <strong>🔥 نشاطك ممتاز!</strong>
                <p>مع مستوى نشاطك العالي:</p>
                <ul>
                    <li>ركّز على البروتين للحفاظ على العضلات (${plan.calculations.proteinGrams}غ يومياً)</li>
                    <li>تأكد من الراحة الكافية (7-9 ساعات نوم)</li>
                    <li>لا تفرط في الكارديو - التوازن مهم</li>
                    <li>استمع لجسمك وخذ أيام راحة عند الحاجة</li>
                </ul>
            </div>
        `;
    }
    document.getElementById('planExercise').innerHTML = exerciseText;

    // Fill tips
    document.getElementById('planTips').innerHTML = `
        <div class="tips-list">
            <div class="tip-item">
                <span class="tip-icon">💧</span>
                <div class="tip-content">
                    <strong>شرب الماء</strong>
                    <p>2-3 لتر يومياً (8-12 كوب). الماء يساعد في الشبع ويحسن عملية حرق الدهون.</p>
                </div>
            </div>
            <div class="tip-item">
                <span class="tip-icon">😴</span>
                <div class="tip-content">
                    <strong>النوم الكافي</strong>
                    <p>7-9 ساعات يومياً. قلة النوم تزيد من هرمون الجوع وتصعّب تنزيل الوزن.</p>
                </div>
            </div>
            <div class="tip-item">
                <span class="tip-icon">📊</span>
                <div class="tip-content">
                    <strong>تتبع التقدم</strong>
                    <p>وزن أسبوعي (نفس اليوم والوقت). التغيرات اليومية طبيعية، الأسبوعية هي المهمة.</p>
                </div>
            </div>
            <div class="tip-item">
                <span class="tip-icon">🧠</span>
                <div class="tip-content">
                    <strong>التركيز النفسي</strong>
                    <p>التغيير يأخذ وقتاً. احتفل بالإنجازات الصغيرة وكن صبوراً مع نفسك.</p>
                </div>
            </div>
            <div class="tip-item warning">
                <span class="tip-icon">⚠️</span>
                <div class="tip-content">
                    <strong>تحذيرات مهمة</strong>
                    <p>• لا تنزل عن الحد الأدنى الآمن للسعرات<br>
                    • استشر طبيباً إذا كان لديك أي حالات صحية<br>
                    • توقف واستشر طبيباً إذا شعرت بدوخة، إرهاق شديد، أو أي أعراض غير طبيعية</p>
                </div>
            </div>
        </div>
        <div class="sources">
            <strong>المصادر العلمية:</strong> منظمة الصحة العالمية (WHO)، Mayo Clinic، Harvard Health، American College of Sports Medicine
        </div>
    `;

    // Scroll to plan
    document.getElementById('weightLossPlan').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Reset Plan
function resetWeightLossPlan() {
    document.getElementById('weightLossPlan').classList.add('hidden');
    document.getElementById('weightLossForm').classList.remove('hidden');
    currentPlan = null;

    // Scroll to form
    document.getElementById('weightLossForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Download as PDF
async function downloadPlanAsPDF() {
    if (!currentPlan) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Set font (using default font that supports English)
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Weight Loss Plan / خطة تنزيل الوزن', 105, 20, { align: 'center' });

    let yPos = 35;

    // Personal Info
    doc.setFontSize(12);
    doc.text(`Gender: ${currentPlan.personalInfo.gender === 'male' ? 'Male' : 'Female'} | Age: ${currentPlan.personalInfo.age}`, 20, yPos);
    yPos += 8;
    doc.text(`Current Weight: ${currentPlan.personalInfo.currentWeight} kg → Target: ${currentPlan.personalInfo.targetWeight} kg`, 20, yPos);
    yPos += 8;
    doc.text(`Weight to Lose: ${currentPlan.calculations.weightToLose} kg over ${currentPlan.calculations.weeksNeeded} weeks`, 20, yPos);
    yPos += 15;

    // Calories & Macros
    doc.setFont('helvetica', 'bold');
    doc.text('Daily Nutrition:', 20, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Calories: ${currentPlan.calculations.dailyCalories} kcal/day`, 20, yPos);
    yPos += 6;
    doc.text(`Protein: ${currentPlan.calculations.proteinGrams}g | Carbs: ${currentPlan.calculations.carbsGrams}g | Fat: ${currentPlan.calculations.fatGrams}g`, 20, yPos);
    yPos += 15;

    // Meals
    doc.setFont('helvetica', 'bold');
    doc.text(`Meal Plan (${currentPlan.personalInfo.mealsPerDay} meals/day):`, 20, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    const caloriesPerMeal = Math.round(currentPlan.calculations.dailyCalories / currentPlan.personalInfo.mealsPerDay);
    doc.text(`Each meal: ~${caloriesPerMeal} calories`, 20, yPos);
    yPos += 15;

    // Tips
    doc.setFont('helvetica', 'bold');
    doc.text('Important Tips:', 20, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('- Drink 2-3 liters of water daily', 20, yPos);
    yPos += 5;
    doc.text('- Sleep 7-9 hours per night', 20, yPos);
    yPos += 5;
    doc.text('- Track weight weekly, not daily', 20, yPos);
    yPos += 5;
    doc.text('- Stay patient and consistent', 20, yPos);
    yPos += 10;

    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('Generated by Smart Eco-Market | Sources: WHO, Mayo Clinic, Harvard Health', 105, 280, { align: 'center' });

    // Save
    doc.save(`weight-loss-plan-${new Date().toISOString().split('T')[0]}.pdf`);
    showToast('✅ تم تنزيل الخطة كملف PDF', 'success');
}

// Share via WhatsApp
function shareViaWhatsApp() {
    if (!currentPlan) return;

    const plan = currentPlan;
    const genderText = plan.personalInfo.gender === 'male' ? 'ذكر' : 'أنثى';

    const message = `
🎯 *خطتي لتنزيل الوزن*

👤 المعلومات الشخصية:
${genderText}، ${plan.personalInfo.age} سنة

⚖️ الهدف:
${plan.personalInfo.currentWeight} كجم ← ${plan.personalInfo.targetWeight} كجم
فرق: ${plan.calculations.weightToLose} كجم

⏱️ المدة المتوقعة:
${plan.calculations.weeksNeeded} أسبوع (حوالي ${Math.ceil(plan.calculations.weeksNeeded / 4)} شهر)

🔥 السعرات اليومية:
${plan.calculations.dailyCalories} سعرة حرارية

📊 المغذيات:
• بروتين: ${plan.calculations.proteinGrams}غ
• كربوهيدرات: ${plan.calculations.carbsGrams}غ
• دهون: ${plan.calculations.fatGrams}غ

🍽️ عدد الوجبات: ${plan.personalInfo.mealsPerDay} وجبات يومياً

💡 نصائح:
✓ شرب 2-3 لتر ماء يومياً
✓ النوم 7-9 ساعات
✓ وزن أسبوعي، ليس يومي
✓ الصبر والاستمرارية

⚠️ استشر طبيباً قبل البدء

📱 تم إنشاء هذه الخطة من مقصف المعرفة
`.trim();

    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/?text=${encodedMessage}`;

    window.open(whatsappURL, '_blank');
    showToast('✅ تم فتح واتساب للمشاركة', 'success');
}
