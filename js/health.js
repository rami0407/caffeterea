// Health Page Logic
let currentUser = null;
let currentCalories = 0;
let activities = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeFirebase();

    onAuthStateChange(({ user, userData }) => {
        currentUser = userData;
        if (userData) {
            loadUserChallenge(userData.uid);
            updateCouponDisplay();
        }
    });

    // Set initial state for duration field
    toggleDurationField();
});

// Calculator Functions
function calculateDistance() {
    const weight = parseFloat(document.getElementById('weightInput').value);
    const calories = parseFloat(document.getElementById('caloriesInput').value);

    if (!weight || !calories || weight < 30 || weight > 150) {
        showToast('الرجاء إدخال وزن صحيح (30-150 كجم)', 'error');
        return;
    }

    if (calories < 10) {
        showToast('الرجاء إدخال عدد سعرات أكبر من 10', 'error');
        return;
    }

    // Walking: ~0.57 calories per kg per km
    const walkDistance = (calories / (0.57 * weight)).toFixed(2);
    const walkTime = Math.round((walkDistance / 5) * 60); // 5 km/h average

    // Running: ~0.95 calories per kg per km
    const runDistance = (calories / (0.95 * weight)).toFixed(2);
    const runTime = Math.round((runDistance / 8) * 60); // 8 km/h average

    // Display results
    document.getElementById('walkDistance').textContent = walkDistance;
    document.getElementById('walkTime').textContent = walkTime;
    document.getElementById('runDistance').textContent = runDistance;
    document.getElementById('runTime').textContent = runTime;

    document.getElementById('calculatorResult').classList.remove('hidden');
}

// Toggle Duration Field
function toggleDurationField() {
    const activityType = document.getElementById('activityType').value;
    const durationGroup = document.getElementById('durationGroup');
    const durationInput = document.getElementById('activityDuration');

    if (activityType === 'pe') {
        durationGroup.style.display = 'none';
        durationInput.value = '';
        durationInput.required = false;
    } else {
        durationGroup.style.display = 'block';
        durationInput.required = true;
    }
}

// Log Activity
async function logActivity() {
    if (!currentUser) {
        showToast('الرجاء تسجيل الدخول أولاً', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    const activityType = document.getElementById('activityType').value;
    const duration = parseInt(document.getElementById('activityDuration').value);

    if (activityType !== 'pe' && (!duration || duration < 1)) {
        showToast('الرجاء إدخال مدة صحيحة', 'error');
        return;
    }

    // Calculate calories based on activity
    let caloriesBurned = 0;
    let activityName = '';
    let durationText = '';

    switch (activityType) {
        case 'pe':
            caloriesBurned = 50;
            activityName = '🏅 حصة تربية بدنية';
            durationText = 'حصة واحدة';
            break;
        case 'walk':
            caloriesBurned = Math.round((duration / 60) * 280);
            activityName = '🚶‍♂️ مشي';
            durationText = `${duration} دقيقة`;
            break;
        case 'run':
            caloriesBurned = Math.round((duration / 60) * 480);
            activityName = '🏃‍♂️ جري';
            durationText = `${duration} دقيقة`;
            break;
        case 'swim':
            caloriesBurned = Math.round((duration / 60) * 400);
            activityName = '🏊‍♂️ سباحة';
            durationText = `${duration} دقيقة`;
            break;
        case 'bike':
            caloriesBurned = Math.round((duration / 60) * 350);
            activityName = '🚴‍♂️ ركوب دراجة';
            durationText = `${duration} دقيقة`;
            break;
    }

    // Add to activities
    const activity = {
        type: activityName,
        duration: durationText,
        calories: caloriesBurned,
        timestamp: new Date().toISOString()
    };

    activities.push(activity);
    currentCalories += caloriesBurned;

    // Update UI
    renderActivities();
    updateProgress();

    // Save to Firebase
    await saveChallenge();

    // Reset form
    document.getElementById('activityDuration').value = '';

    showToast(`✅ تم تسجيل ${caloriesBurned} سعرة حرارية!`, 'success');
}

// Render Activities
function renderActivities() {
    const list = document.getElementById('activityList');

    if (activities.length === 0) {
        list.innerHTML = '<p class="empty-state">لم تسجل أي نشاط بعد</p>';
        return;
    }

    list.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-item-info">
                <div class="activity-item-type">${activity.type}</div>
                <div class="activity-item-details">${activity.duration}</div>
            </div>
            <div class="activity-item-calories">🔥 ${activity.calories}</div>
        </div>
    `).join('');
}

// Update Progress
function updateProgress() {
    const percentage = Math.min((currentCalories / 100) * 100, 100);

    document.getElementById('currentCalories').textContent = currentCalories;
    document.getElementById('progressFill').style.width = percentage + '%';

    // Show claim button if goal reached
    const claimBtn = document.getElementById('claimRewardBtn');
    if (currentCalories >= 100 && !claimBtn.classList.contains('claimed')) {
        claimBtn.classList.remove('hidden');
    }
}

// Claim Reward
async function claimReward() {
    if (!currentUser) {
        showToast('الرجاء تسجيل الدخول', 'error');
        return;
    }

    if (currentCalories < 100) {
        showToast('لم تصل للهدف بعد!', 'error');
        return;
    }

    try {
        // Award coupons
        const db = firebase.firestore();
        await db.collection('students').doc(currentUser.uid).update({
            coupons: firebase.firestore.FieldValue.increment(3),
            'challenges.completed': firebase.firestore.FieldValue.increment(1)
        });

        // Reset challenge
        currentCalories = 0;
        activities = [];

        await saveChallenge();

        renderActivities();
        updateProgress();
        updateCouponDisplay();

        const claimBtn = document.getElementById('claimRewardBtn');
        claimBtn.classList.add('hidden', 'claimed');

        showToast('🎉 مبروك! حصلت على 3 كوبونات!', 'success');

        // Visual celebration
        confetti();
    } catch (error) {
        console.error('Error claiming reward:', error);
        showToast('حدث خطأ، حاول مرة أخرى', 'error');
    }
}

// Save Challenge to Firebase
async function saveChallenge() {
    if (!currentUser) return;

    try {
        const db = firebase.firestore();
        await db.collection('students').doc(currentUser.uid).set({
            challenges: {
                current: {
                    caloriesBurned: currentCalories,
                    activities: activities,
                    startDate: firebase.firestore.FieldValue.serverTimestamp()
                }
            }
        }, { merge: true });
    } catch (error) {
        console.error('Error saving challenge:', error);
    }
}

// Load User Challenge
async function loadUserChallenge(uid) {
    try {
        const db = firebase.firestore();
        const doc = await db.collection('students').doc(uid).get();

        if (doc.exists) {
            const data = doc.data();
            if (data.challenges && data.challenges.current) {
                currentCalories = data.challenges.current.caloriesBurned || 0;
                activities = data.challenges.current.activities || [];

                renderActivities();
                updateProgress();
            }
        }
    } catch (error) {
        console.error('Error loading challenge:', error);
    }
}

// Update Coupon Display
async function updateCouponDisplay() {
    if (!currentUser) return;

    try {
        const db = firebase.firestore();
        const doc = await db.collection('students').doc(currentUser.uid).get();

        if (doc.exists) {
            const coupons = doc.data().coupons || 0;
            document.getElementById('couponCount').textContent = coupons;
        }
    } catch (error) {
        console.error('Error loading coupons:', error);
    }
}

// Simple Confetti Effect
function confetti() {
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        // Create confetti
        const confetti = document.createElement('div');
        confetti.textContent = ['🎉', '🎊', '⭐', '💫', '✨'][Math.floor(Math.random() * 5)];
        confetti.style.position = 'fixed';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-50px';
        confetti.style.fontSize = '2rem';
        confetti.style.zIndex = '9999';
        confetti.style.pointerEvents = 'none';
        confetti.style.transition = 'all 2s ease-out';

        document.body.appendChild(confetti);

        setTimeout(() => {
            confetti.style.top = '100vh';
            confetti.style.opacity = '0';
        }, 10);

        setTimeout(() => confetti.remove(), 2000);
    }, 100);
}

// Toast
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type === 'error' ? 'error' : ''}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
