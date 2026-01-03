// Health Page Logic
let currentUser = null;
let currentCalories = 0;
let activities = [];
let allChallenges = []; // For honor board

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeFirebase();

    onAuthStateChange(({ user, userData }) => {
        currentUser = userData;
        if (userData) {
            loadUserChallenge(userData.uid);
            updateCouponDisplay();
            loadHonorBoard();
        } else {
            loadHonorBoard(); // Load even without login
        }
    });

    // Set initial state for duration field
    toggleDurationField();
});

// Submit Challenge Commitment
async function submitCommitment() {
    const name = document.getElementById('studentName').value.trim();
    const challengeType = document.getElementById('challengeType').value;
    const targetCalories = parseInt(document.getElementById('targetCalories').value);
    const timeframe = document.getElementById('timeframe').value;

    if (!name || !challengeType || !targetCalories || !timeframe) {
        showToast('الرجاء تعبئة جميع الحقول', 'error');
        return;
    }

    if (targetCalories < 50) {
        showToast('التحدي يجب أن يكون 50 سعرة على الأقل', 'error');
        return;
    }

    // Challenge type names
    const challengeNames = {
        'walk': 'مشي يومي',
        'run': 'جري منتظم',
        'swim': 'سباحة أسبوعية',
        'bike': 'ركوب دراجة',
        'pe': 'حصص تربية بدنية',
        'mixed': 'تحدي متنوع'
    };

    const timeframeText = {
        '1': 'يوم واحد',
        '3': '3 أيام',
        '7': 'أسبوع',
        '14': 'أسبوعين',
        '30': 'شهر'
    };

    const commitment = {
        name: name,
        challengeType: challengeNames[challengeType],
        targetCalories: targetCalories,
        timeframe: parseInt(timeframe),
        timeframeText: timeframeText[timeframe],
        timestamp: new Date().toISOString(),
        userId: currentUser ? currentUser.uid : null
    };

    try {
        // Save to Firebase
        const db = firebase.firestore();
        await db.collection('challenges').add(commitment);

        // Generate motivational message
        const message = generateMotivationalMessage(name, targetCalories, timeframeText[timeframe]);

        // Show success
        document.getElementById('commitmentForm').classList.add('hidden');
        document.getElementById('successMessage').innerHTML = message;
        document.getElementById('commitmentSuccess').classList.remove('hidden');

        // Reload honor board
        await loadHonorBoard();

        confetti();
    } catch (error) {
        console.error('Error saving commitment:', error);
        showToast('حدث خطأ، حاول مرة أخرى', 'error');
    }
}

// Generate Motivational Message
function generateMotivationalMessage(name, calories, timeframe) {
    const messages = [
        `🌟 رائع يا <strong>${name}</strong>! التزامك بحرق ${calories} سعرة خلال ${timeframe} يدل على عزيمة قوية!`,
        `💪 أنت بطل يا <strong>${name}</strong>! ${calories} سعرة خلال ${timeframe} هو تحدٍ رائع! نحن فخورون بك!`,
        `🔥 إصرارك مُلهم يا <strong>${name}</strong>! ${calories} سعرة في ${timeframe} - أنت قدوة للجميع!`,
        `⭐ يا له من التزام يا <strong>${name}</strong>! ${calories} سعرة خلال ${timeframe} - استمر وستصل للقمة!`,
        `🏆 تحدي قوي يا <strong>${name}</strong>! ${calories} سعرة في ${timeframe} - نحن معك حتى النهاية!`
    ];

    return messages[Math.floor(Math.random() * messages.length)] +
        '<br><br>🎯 تذكّر: الاستمرارية هي سر النجاح!';
}

// Reset Commitment Form
function resetCommitment() {
    document.getElementById('commitmentSuccess').classList.add('hidden');
    document.getElementById('commitmentForm').classList.remove('hidden');

    // Clear form
    document.getElementById('studentName').value = '';
    document.getElementById('challengeType').value = '';
    document.getElementById('targetCalories').value = '';
    document.getElementById('timeframe').value = '';
}

// Load Honor Board
async function loadHonorBoard() {
    try {
        const db = firebase.firestore();

        // Try with orderBy first
        try {
            const snapshot = await db.collection('challenges')
                .orderBy('targetCalories', 'desc')
                .limit(10)
                .get();

            allChallenges = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (indexError) {
            // If index doesn't exist, get all and sort client-side
            console.log('Using client-side sorting (Firebase index not created yet)');
            const snapshot = await db.collection('challenges').get();

            allChallenges = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => b.targetCalories - a.targetCalories)
                .slice(0, 10);
        }

        renderHonorBoard();
    } catch (error) {
        console.error('Error loading honor board:', error);
        // Show empty state on error
        const board = document.getElementById('honorBoard');
        if (board) {
            board.innerHTML = '<p class="empty-state">حدث خطأ في تحميل لوحة الشرف</p>';
        }
    }
}

// Render Honor Board
function renderHonorBoard() {
    const board = document.getElementById('honorBoard');

    if (allChallenges.length === 0) {
        board.innerHTML = '<p class="empty-state">لا توجد تحديات بعد... كن الأول!</p>';
        return;
    }

    board.innerHTML = allChallenges.map((challenge, index) => {
        const rank = index + 1;
        const rankClass = rank === 1 ? 'first' : rank === 2 ? 'second' : rank === 3 ? 'third' : '';
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

        return `
        <div class="honor-card">
            <div class="honor-rank ${rankClass}">${medal}</div>
            <div class="honor-info">
                <div class="honor-name">${challenge.name}</div>
                <div class="honor-challenge">${challenge.challengeType}</div>
                <div class="honor-stats">
                    <span>🔥 ${challenge.targetCalories} سعرة</span>
                    <span>⏰ ${challenge.timeframeText}</span>
                </div>
            </div>
            <div class="honor-badge">${challenge.targetCalories}</div>
        </div>
    `;
    }).join('');
}

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
