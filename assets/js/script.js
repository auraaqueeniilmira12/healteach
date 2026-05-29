// ============================================
// HEALTEACH - Main JavaScript
// Mengelola data user, sambutan, streak, pencapaian, statistik mingguan, grafik berat badan, dan konten harian
// ============================================

// ========== DATA USER MANAGEMENT ==========

function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
        return JSON.parse(userData);
    }
    return null;
}

function getAllUsers() {
    const users = localStorage.getItem('registeredUsers');
    if (users) {
        return JSON.parse(users);
    }
    return [];
}

function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function isUserLoggedIn() {
    return getCurrentUser() !== null;
}

// ========== STREAK MANAGEMENT ==========

function updateStreak() {
    const currentUser = getCurrentUser();
    if (!currentUser) return 0;
    
    const today = new Date().toLocaleDateString('id-ID');
    let userStreak = localStorage.getItem(`streak_${currentUser.id || currentUser.email}`);
    
    if (userStreak) {
        userStreak = JSON.parse(userStreak);
        
        const lastDate = userStreak.lastDate;
        const currentStreak = userStreak.currentStreak;
        
        if (lastDate === today) {
            return currentStreak;
        } else {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toLocaleDateString('id-ID');
            
            if (lastDate === yesterdayStr) {
                const newStreak = currentStreak + 1;
                userStreak = {
                    currentStreak: newStreak,
                    lastDate: today,
                    bestStreak: Math.max(newStreak, userStreak.bestStreak || 0)
                };
                localStorage.setItem(`streak_${currentUser.id || currentUser.email}`, JSON.stringify(userStreak));
                return newStreak;
            } else {
                userStreak = {
                    currentStreak: 1,
                    lastDate: today,
                    bestStreak: userStreak.bestStreak || 0
                };
                localStorage.setItem(`streak_${currentUser.id || currentUser.email}`, JSON.stringify(userStreak));
                return 1;
            }
        }
    } else {
        const newStreak = {
            currentStreak: 1,
            lastDate: today,
            bestStreak: 1
        };
        localStorage.setItem(`streak_${currentUser.id || currentUser.email}`, JSON.stringify(newStreak));
        return 1;
    }
}

function getCurrentStreak() {
    const currentUser = getCurrentUser();
    if (!currentUser) return 0;
    
    const userStreak = localStorage.getItem(`streak_${currentUser.id || currentUser.email}`);
    if (userStreak) {
        return JSON.parse(userStreak).currentStreak;
    }
    return 0;
}

function getBestStreak() {
    const currentUser = getCurrentUser();
    if (!currentUser) return 0;
    
    const userStreak = localStorage.getItem(`streak_${currentUser.id || currentUser.email}`);
    if (userStreak) {
        return JSON.parse(userStreak).bestStreak || 0;
    }
    return 0;
}

// ========== ACHIEVEMENT / BADGES ==========

const availableBadges = [
    { id: 'first_login', name: 'Pemula', icon: 'fa-seedling', description: 'Login pertama kali', requirement: { type: 'streak', value: 1 } },
    { id: 'streak_3', name: 'Semangat Baru', icon: 'fa-fire', description: 'Streak 3 hari berturut-turut', requirement: { type: 'streak', value: 3 } },
    { id: 'streak_7', name: 'Konsisten', icon: 'fa-calendar-check', description: 'Streak 7 hari berturut-turut', requirement: { type: 'streak', value: 7 } },
    { id: 'streak_14', name: 'Disiplin', icon: 'fa-star', description: 'Streak 14 hari berturut-turut', requirement: { type: 'streak', value: 14 } },
    { id: 'streak_30', name: 'Sehat Sebulan', icon: 'fa-crown', description: 'Streak 30 hari berturut-turut', requirement: { type: 'streak', value: 30 } },
    { id: 'checklist_5', name: 'Rajin Pemula', icon: 'fa-check-circle', description: 'Menyelesaikan 5 checklist', requirement: { type: 'checklist', value: 5 } },
    { id: 'checklist_20', name: 'Produktif', icon: 'fa-rocket', description: 'Menyelesaikan 20 checklist', requirement: { type: 'checklist', value: 20 } },
    { id: 'bmi_normal', name: 'Berat Ideal', icon: 'fa-heartbeat', description: 'Memiliki BMI normal', requirement: { type: 'bmi', value: 'normal' } },
    { id: 'profile_complete', name: 'Profil Lengkap', icon: 'fa-id-card', description: 'Melengkapi data profil', requirement: { type: 'profile', value: true } }
];

function checkAndUpdateBadges() {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    
    const currentStreak = getCurrentStreak();
    const userProfile = getProfileData();
    const totalChecklist = getTotalChecklist();
    const userBadges = getUserBadges();
    
    const newlyUnlocked = [];
    
    availableBadges.forEach(badge => {
        const alreadyOwned = userBadges.some(b => b.id === badge.id);
        if (alreadyOwned) return;
        
        let isUnlocked = false;
        
        switch (badge.requirement.type) {
            case 'streak':
                if (currentStreak >= badge.requirement.value) {
                    isUnlocked = true;
                }
                break;
            case 'checklist':
                if (totalChecklist >= badge.requirement.value) {
                    isUnlocked = true;
                }
                break;
            case 'bmi':
                if (userProfile && userProfile.weight && userProfile.height) {
                    const bmi = calculateBMI(userProfile.weight, userProfile.height);
                    const bmiStatus = getBMIStatus(parseFloat(bmi));
                    if (badge.requirement.value === 'normal' && bmiStatus === 'Normal') {
                        isUnlocked = true;
                    }
                }
                break;
            case 'profile':
                if (userProfile && userProfile.fullName && userProfile.gender && userProfile.age) {
                    isUnlocked = true;
                }
                break;
        }
        
        if (isUnlocked) {
            userBadges.push({
                id: badge.id,
                name: badge.name,
                icon: badge.icon,
                description: badge.description,
                unlockedAt: new Date().toLocaleDateString('id-ID')
            });
            newlyUnlocked.push(badge);
        }
    });
    
    localStorage.setItem(`badges_${currentUser.id || currentUser.email}`, JSON.stringify(userBadges));
    
    if (newlyUnlocked.length > 0) {
        newlyUnlocked.forEach(badge => {
            showNotification(`Lencana baru: ${badge.name}`, 'success');
        });
    }
    
    return userBadges;
}

function getUserBadges() {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    
    const badges = localStorage.getItem(`badges_${currentUser.id || currentUser.email}`);
    if (badges) {
        return JSON.parse(badges);
    }
    return [];
}

function getTotalChecklist() {
    const currentUser = getCurrentUser();
    if (!currentUser) return 0;
    
    const checklistData = localStorage.getItem(`checklist_${currentUser.id || currentUser.email}`);
    if (checklistData) {
        const parsed = JSON.parse(checklistData);
        return parsed.completed || 0;
    }
    return 0;
}

function getProfileData() {
    const profileData = localStorage.getItem('userProfile');
    if (profileData) {
        return JSON.parse(profileData);
    }
    return null;
}

// ========== GREETING FUNCTIONS ==========

function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'Selamat Pagi';
    if (hour >= 11 && hour < 15) return 'Selamat Siang';
    if (hour >= 15 && hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
}

function getRandomQuote() {
    const quotes = [
        'Tetap semangat untuk hidup sehat hari ini!',
        'Sehat itu investasi, bukan pengeluaran.',
        'Hari ini lebih baik dari kemarin.',
        'Small steps every day, big results later.',
        'Jaga tubuh, karena hanya satu yang kita punya.',
        'Kesehatan adalah mahkota di kepala orang sehat.'
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
}

function displayGreeting() {
    const currentUser = getCurrentUser();
    const greetingMessageEl = document.getElementById('greeting-message');
    const userNameEl = document.getElementById('user-name');
    const motivationQuoteEl = document.getElementById('motivation-quote');
    
    const greeting = getGreeting();
    
    if (greetingMessageEl) {
        greetingMessageEl.innerHTML = `${greeting}, <i class="fas fa-smile-wink" style="font-size: 18px;"></i>`;
    }
    if (userNameEl) {
        userNameEl.innerHTML = currentUser?.name || 'Pengunjung';
    }
    if (motivationQuoteEl) {
        motivationQuoteEl.innerHTML = `<i class="fas fa-quote-left" style="font-size: 12px; margin-right: 6px; color: #6a1b9a;"></i> ${getRandomQuote()}`;
    }
}

// ========== DISPLAY STREAK & ACHIEVEMENTS ==========

function displayStreakAndAchievements() {
    const streak = getCurrentStreak();
    const badges = getUserBadges();
    
    const streakValueEl = document.getElementById('streakValue');
    const achievementCountEl = document.getElementById('achievementCount');
    
    if (streakValueEl) {
        streakValueEl.textContent = streak;
    }
    if (achievementCountEl) {
        achievementCountEl.textContent = badges.length;
    }
    
    updateProfileStats(streak, badges.length);
}

function updateProfileStats(streak, badgeCount) {
    let userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
        userProfile = JSON.parse(userProfile);
        userProfile.points = streak * 10;
        userProfile.checklistCount = getTotalChecklist();
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }
}

// ========== WEEKLY STATISTICS ==========

function getUserStatsKey() {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;
    return `weeklyStats_${currentUser.id || currentUser.email}`;
}

function getWeeklyStatsData() {
    const key = getUserStatsKey();
    if (!key) return null;
    
    let weeklyStats = localStorage.getItem(key);
    if (weeklyStats) {
        return JSON.parse(weeklyStats);
    }
    return null;
}

function saveWeeklyStatsData(data) {
    const key = getUserStatsKey();
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(data));
}

function getOrInitWeeklyStats() {
    let weeklyStats = getWeeklyStatsData();
    
    if (!weeklyStats) {
        weeklyStats = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            weeklyStats.push({
                date: date.toLocaleDateString('id-ID'),
                steps: 0,
                calories: 0,
                water: 0,
                sleep: 0
            });
        }
        saveWeeklyStatsData(weeklyStats);
    }
    
    return weeklyStats;
}

function getWeeklyTotals() {
    const weeklyStats = getOrInitWeeklyStats();
    
    const totals = {
        steps: 0,
        calories: 0,
        water: 0,
        sleep: 0
    };
    
    weeklyStats.forEach(day => {
        totals.steps += day.steps || 0;
        totals.calories += day.calories || 0;
        totals.water += day.water || 0;
        totals.sleep += day.sleep || 0;
    });
    
    return totals;
}

function getWeeklyAverages() {
    const totals = getWeeklyTotals();
    const daysCount = 7;
    
    return {
        steps: Math.round(totals.steps / daysCount),
        calories: Math.round(totals.calories / daysCount),
        water: (totals.water / daysCount).toFixed(1),
        sleep: (totals.sleep / daysCount).toFixed(1)
    };
}

function getTrends() {
    const trends = {
        steps: { value: Math.floor(Math.random() * 20) - 5, unit: '%' },
        calories: { value: Math.floor(Math.random() * 20) - 5, unit: '%' },
        water: { value: Math.floor(Math.random() * 20) - 5, unit: '%' },
        sleep: { value: (Math.random() * 1 - 0.5).toFixed(1), unit: 'jam' }
    };
    
    return trends;
}

function updateDailyStat(type, value) {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    const today = new Date().toLocaleDateString('id-ID');
    let weeklyStats = getOrInitWeeklyStats();
    
    const todayIndex = weeklyStats.findIndex(day => day.date === today);
    
    if (todayIndex !== -1) {
        switch(type) {
            case 'steps':
                weeklyStats[todayIndex].steps += value;
                break;
            case 'calories':
                weeklyStats[todayIndex].calories += value;
                break;
            case 'water':
                weeklyStats[todayIndex].water += value;
                break;
            case 'sleep':
                weeklyStats[todayIndex].sleep = value;
                break;
        }
    } else {
        const newDay = {
            date: today,
            steps: type === 'steps' ? value : 0,
            calories: type === 'calories' ? value : 0,
            water: type === 'water' ? value : 0,
            sleep: type === 'sleep' ? value : 0
        };
        weeklyStats.push(newDay);
        
        if (weeklyStats.length > 7) {
            weeklyStats.shift();
        }
    }
    
    saveWeeklyStatsData(weeklyStats);
    displayWeeklyStats();
    return true;
}

function displayWeeklyStats() {
    const weeklyAverages = getWeeklyAverages();
    const trends = getTrends();
    
    const stepsEl = document.getElementById('weeklySteps');
    const caloriesEl = document.getElementById('weeklyCalories');
    const waterEl = document.getElementById('weeklyWater');
    const sleepEl = document.getElementById('weeklySleep');
    
    const stepsTrendEl = document.getElementById('stepsTrend');
    const caloriesTrendEl = document.getElementById('caloriesTrend');
    const waterTrendEl = document.getElementById('waterTrend');
    const sleepTrendEl = document.getElementById('sleepTrend');
    
    if (stepsEl) stepsEl.textContent = weeklyAverages.steps.toLocaleString();
    if (caloriesEl) caloriesEl.textContent = weeklyAverages.calories.toLocaleString();
    if (waterEl) waterEl.textContent = weeklyAverages.water + ' gelas';
    if (sleepEl) sleepEl.textContent = weeklyAverages.sleep + ' jam';
    
    if (stepsTrendEl) {
        const stepTrend = trends.steps.value;
        if (stepTrend > 0) {
            stepsTrendEl.innerHTML = `<i class="fas fa-arrow-up"></i> +${stepTrend}%`;
            stepsTrendEl.className = 'stat-item-trend positive';
        } else if (stepTrend < 0) {
            stepsTrendEl.innerHTML = `<i class="fas fa-arrow-down"></i> ${stepTrend}%`;
            stepsTrendEl.className = 'stat-item-trend negative';
        } else {
            stepsTrendEl.innerHTML = `<i class="fas fa-minus-circle"></i> 0%`;
            stepsTrendEl.className = 'stat-item-trend neutral';
        }
    }
    
    if (caloriesTrendEl) {
        const calTrend = trends.calories.value;
        if (calTrend > 0) {
            caloriesTrendEl.innerHTML = `<i class="fas fa-arrow-up"></i> +${calTrend}%`;
            caloriesTrendEl.className = 'stat-item-trend positive';
        } else if (calTrend < 0) {
            caloriesTrendEl.innerHTML = `<i class="fas fa-arrow-down"></i> ${calTrend}%`;
            caloriesTrendEl.className = 'stat-item-trend negative';
        } else {
            caloriesTrendEl.innerHTML = `<i class="fas fa-minus-circle"></i> 0%`;
            caloriesTrendEl.className = 'stat-item-trend neutral';
        }
    }
    
    if (waterTrendEl) {
        const waterTrend = trends.water.value;
        if (waterTrend > 0) {
            waterTrendEl.innerHTML = `<i class="fas fa-arrow-up"></i> +${waterTrend}%`;
            waterTrendEl.className = 'stat-item-trend positive';
        } else if (waterTrend < 0) {
            waterTrendEl.innerHTML = `<i class="fas fa-arrow-down"></i> ${waterTrend}%`;
            waterTrendEl.className = 'stat-item-trend negative';
        } else {
            waterTrendEl.innerHTML = `<i class="fas fa-minus-circle"></i> 0%`;
            waterTrendEl.className = 'stat-item-trend neutral';
        }
    }
    
    if (sleepTrendEl) {
        const sleepTrend = parseFloat(trends.sleep.value);
        if (sleepTrend > 0) {
            sleepTrendEl.innerHTML = `<i class="fas fa-arrow-up"></i> +${sleepTrend} ${trends.sleep.unit}`;
            sleepTrendEl.className = 'stat-item-trend positive';
        } else if (sleepTrend < 0) {
            sleepTrendEl.innerHTML = `<i class="fas fa-arrow-down"></i> ${sleepTrend} ${trends.sleep.unit}`;
            sleepTrendEl.className = 'stat-item-trend negative';
        } else {
            sleepTrendEl.innerHTML = `<i class="fas fa-minus-circle"></i> 0 ${trends.sleep.unit}`;
            sleepTrendEl.className = 'stat-item-trend neutral';
        }
    }
    
    const weekRangeEl = document.getElementById('weekRange');
    if (weekRangeEl) {
        const weeklyStats = getOrInitWeeklyStats();
        if (weeklyStats.length > 0) {
            const firstDate = weeklyStats[0].date;
            const lastDate = weeklyStats[weeklyStats.length - 1].date;
            weekRangeEl.textContent = `${firstDate} - ${lastDate}`;
        }
    }
}

// ========== WEIGHT CHART / GRAFIK BERAT BADAN ==========

let weightChart = null;

function getWeightData() {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;
    
    const weightData = localStorage.getItem(`weightData_${currentUser.id || currentUser.email}`);
    if (weightData) {
        return JSON.parse(weightData);
    }
    
    const defaultData = {
        currentWeight: 65,
        startWeight: 68,
        targetWeight: 60,
        history: [68, 67, 66, 65, 64.5, 64, 63.5, 63, 62.5, 62, 61.5, 61],
        labels: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12'],
        lastUpdated: new Date().toLocaleDateString('id-ID')
    };
    
    saveWeightData(defaultData);
    return defaultData;
}

function saveWeightData(data) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    localStorage.setItem(`weightData_${currentUser.id || currentUser.email}`, JSON.stringify(data));
}

function updateCurrentWeight(newWeight) {
    const weightData = getWeightData();
    if (!weightData) return false;
    
    weightData.currentWeight = newWeight;
    weightData.lastUpdated = new Date().toLocaleDateString('id-ID');
    
    weightData.history.push(newWeight);
    if (weightData.history.length > 12) {
        weightData.history.shift();
    }
    
    saveWeightData(weightData);
    displayWeightChart();
    displayWeightSummary();
    return true;
}

function displayWeightChart() {
    const weightData = getWeightData();
    if (!weightData) return;
    
    const ctx = document.getElementById('weightChart');
    if (!ctx) return;
    
    if (weightChart) {
        weightChart.destroy();
    }
    
    const progress = weightData.startWeight - weightData.targetWeight;
    const currentProgress = weightData.startWeight - weightData.currentWeight;
    const progressPercent = Math.round((currentProgress / progress) * 100);
    const progressText = progressPercent > 0 ? `▼ -${currentProgress} kg` : `▲ +${Math.abs(currentProgress)} kg`;
    
    const targetValueEl = document.getElementById('weightTarget');
    const targetProgressEl = document.getElementById('weightProgress');
    if (targetValueEl) targetValueEl.textContent = `${weightData.targetWeight} kg`;
    if (targetProgressEl) targetProgressEl.textContent = progressText;
    
    const currentWeightEl = document.getElementById('currentWeight');
    const startWeightEl = document.getElementById('startWeight');
    const targetWeightDisplayEl = document.getElementById('targetWeightDisplay');
    
    if (currentWeightEl) currentWeightEl.textContent = `${weightData.currentWeight} kg`;
    if (startWeightEl) startWeightEl.textContent = `${weightData.startWeight} kg`;
    if (targetWeightDisplayEl) targetWeightDisplayEl.textContent = `${weightData.targetWeight} kg`;
    
    weightChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: weightData.labels,
            datasets: [{
                label: 'Berat Badan (kg)',
                data: weightData.history,
                borderColor: '#6a1b9a',
                backgroundColor: 'rgba(106, 27, 154, 0.1)',
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: '#6a1b9a',
                pointBorderColor: 'white',
                pointBorderWidth: 2,
                tension: 0.3,
                fill: true
            }, {
                label: 'Target',
                data: Array(weightData.labels.length).fill(weightData.targetWeight),
                borderColor: '#ff9800',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'top', labels: { font: { size: 11 }, boxWidth: 10 } },
                tooltip: { callbacks: { label: function(context) { return `${context.dataset.label}: ${context.raw} kg`; } } }
            },
            scales: {
                y: { title: { display: true, text: 'Berat (kg)', font: { size: 11 } }, min: Math.min(...weightData.history, weightData.targetWeight) - 2, max: Math.max(...weightData.history, weightData.startWeight) + 2 },
                x: { title: { display: true, text: 'Bulan', font: { size: 11 } } }
            }
        }
    });
}

function displayWeightSummary() {
    const weightData = getWeightData();
    if (!weightData) return;
    
    const currentWeightEl = document.getElementById('currentWeight');
    const startWeightEl = document.getElementById('startWeight');
    const targetWeightDisplayEl = document.getElementById('targetWeightDisplay');
    
    if (currentWeightEl) currentWeightEl.textContent = `${weightData.currentWeight} kg`;
    if (startWeightEl) startWeightEl.textContent = `${weightData.startWeight} kg`;
    if (targetWeightDisplayEl) targetWeightDisplayEl.textContent = `${weightData.targetWeight} kg`;
    
    const targetValueEl = document.getElementById('weightTarget');
    const targetProgressEl = document.getElementById('weightProgress');
    if (targetValueEl) targetValueEl.textContent = `${weightData.targetWeight} kg`;
    
    const progress = weightData.startWeight - weightData.targetWeight;
    const currentProgress = weightData.startWeight - weightData.currentWeight;
    const progressText = progress > 0 ? `▼ -${currentProgress} kg` : `▲ +${Math.abs(currentProgress)} kg`;
    if (targetProgressEl) targetProgressEl.textContent = progressText;
}

// ========== KONTEN HARIAN DINAMIS ==========

// Database konten (bisa ditambah/dikembangkan nanti)
const contentDatabase = {
    gerakan: [
        { id: 1, title: '1 Gerakan Hari Ini', description: 'Squat yang benar untuk pemula', duration: '2 menit', icon: 'fa-running', link: 'konten.html?tab=olahraga&id=1', image: null },
        { id: 2, title: '1 Gerakan Hari Ini', description: 'Push-up untuk pemula', duration: '3 menit', icon: 'fa-running', link: 'konten.html?tab=olahraga&id=2', image: null },
        { id: 3, title: '1 Gerakan Hari Ini', description: 'Plank 30 detik', duration: '1 menit', icon: 'fa-running', link: 'konten.html?tab=olahraga&id=3', image: null },
        { id: 4, title: '1 Gerakan Hari Ini', description: 'Lunge untuk kaki kuat', duration: '2 menit', icon: 'fa-running', link: 'konten.html?tab=olahraga&id=4', image: null },
        { id: 5, title: '1 Gerakan Hari Ini', description: 'Jumping jack 50x', duration: '2 menit', icon: 'fa-running', link: 'konten.html?tab=olahraga&id=5', image: null }
    ],
    resep: [
        { id: 1, title: 'Resep Hari Ini', description: 'Salad sayur segar dengan yogurt', duration: '5 menit baca', icon: 'fa-salad', link: 'konten.html?tab=nutrisi&id=1', image: null },
        { id: 2, title: 'Resep Hari Ini', description: 'Smoothie bowl buah', duration: '4 menit baca', icon: 'fa-salad', link: 'konten.html?tab=nutrisi&id=2', image: null },
        { id: 3, title: 'Resep Hari Ini', description: 'Oatmeal sehat', duration: '3 menit baca', icon: 'fa-salad', link: 'konten.html?tab=nutrisi&id=3', image: null },
        { id: 4, title: 'Resep Hari Ini', description: 'Ayam panggang rempah', duration: '6 menit baca', icon: 'fa-salad', link: 'konten.html?tab=nutrisi&id=4', image: null },
        { id: 5, title: 'Resep Hari Ini', description: 'Jus detoks sayur', duration: '3 menit baca', icon: 'fa-salad', link: 'konten.html?tab=nutrisi&id=5', image: null }
    ],
    tips: [
        { id: 1, title: 'Tips Screen Time', description: 'Istirahat mata 20 detik setiap 20 menit', duration: '30 detik baca', icon: 'fa-mobile-alt', link: 'konten.html?tab=wellness&id=1', image: null },
        { id: 2, title: 'Tips Screen Time', description: 'Posisi duduk ergonomis', duration: '2 menit baca', icon: 'fa-mobile-alt', link: 'konten.html?tab=wellness&id=2', image: null },
        { id: 3, title: 'Tips Screen Time', description: 'Batasi screen time sebelum tidur', duration: '3 menit baca', icon: 'fa-mobile-alt', link: 'konten.html?tab=wellness&id=3', image: null },
        { id: 4, title: 'Tips Screen Time', description: 'Mode malam untuk kesehatan mata', duration: '2 menit baca', icon: 'fa-mobile-alt', link: 'konten.html?tab=wellness&id=4', image: null },
        { id: 5, title: 'Tips Screen Time', description: 'Jarak ideal mata ke layar', duration: '2 menit baca', icon: 'fa-mobile-alt', link: 'konten.html?tab=wellness&id=5', image: null }
    ]
};

// Mendapatkan konten berdasarkan tanggal (berganti setiap hari)
function getDailyContent() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    
    // Pilih index berdasarkan tanggal (berganti setiap hari)
    const gerakanIndex = dayOfYear % contentDatabase.gerakan.length;
    const resepIndex = (dayOfYear + 1) % contentDatabase.resep.length;
    const tipsIndex = (dayOfYear + 2) % contentDatabase.tips.length;
    
    return {
        gerakan: contentDatabase.gerakan[gerakanIndex],
        resep: contentDatabase.resep[resepIndex],
        tips: contentDatabase.tips[tipsIndex]
    };
}

// Menampilkan konten harian ke halaman
function displayDailyContent() {
    const dailyContent = getDailyContent();
    
    // Update konten gerakan
    const gerakanTitleEl = document.querySelector('.daily-item:nth-child(1) h4');
    const gerakanDescEl = document.querySelector('.daily-item:nth-child(1) p');
    const gerakanMetaEl = document.querySelector('.daily-item:nth-child(1) .daily-item-meta');
    const gerakanIconEl = document.querySelector('.daily-item:nth-child(1) .daily-item-icon i');
    
    if (gerakanTitleEl) gerakanTitleEl.textContent = dailyContent.gerakan.title;
    if (gerakanDescEl) gerakanDescEl.textContent = dailyContent.gerakan.description;
    if (gerakanMetaEl) gerakanMetaEl.innerHTML = `<i class="fas fa-play-circle"></i> ${dailyContent.gerakan.duration}`;
    if (gerakanIconEl) gerakanIconEl.className = `fas ${dailyContent.gerakan.icon}`;
    
    // Update konten resep
    const resepTitleEl = document.querySelector('.daily-item:nth-child(2) h4');
    const resepDescEl = document.querySelector('.daily-item:nth-child(2) p');
    const resepMetaEl = document.querySelector('.daily-item:nth-child(2) .daily-item-meta');
    const resepIconEl = document.querySelector('.daily-item:nth-child(2) .daily-item-icon i');
    
    if (resepTitleEl) resepTitleEl.textContent = dailyContent.resep.title;
    if (resepDescEl) resepDescEl.textContent = dailyContent.resep.description;
    if (resepMetaEl) resepMetaEl.innerHTML = `<i class="fas fa-book-open"></i> ${dailyContent.resep.duration}`;
    if (resepIconEl) resepIconEl.className = `fas ${dailyContent.resep.icon}`;
    
    // Update konten tips
    const tipsTitleEl = document.querySelector('.daily-item:nth-child(3) h4');
    const tipsDescEl = document.querySelector('.daily-item:nth-child(3) p');
    const tipsMetaEl = document.querySelector('.daily-item:nth-child(3) .daily-item-meta');
    const tipsIconEl = document.querySelector('.daily-item:nth-child(3) .daily-item-icon i');
    
    if (tipsTitleEl) tipsTitleEl.textContent = dailyContent.tips.title;
    if (tipsDescEl) tipsDescEl.textContent = dailyContent.tips.description;
    if (tipsMetaEl) tipsMetaEl.innerHTML = `<i class="fas fa-hourglass-half"></i> ${dailyContent.tips.duration}`;
    if (tipsIconEl) tipsIconEl.className = `fas ${dailyContent.tips.icon}`;
    
    // Simpan ke localStorage untuk tracking
    const currentUser = getCurrentUser();
    if (currentUser) {
        const today = new Date().toLocaleDateString('id-ID');
        const viewedContent = {
            date: today,
            gerakanId: dailyContent.gerakan.id,
            resepId: dailyContent.resep.id,
            tipsId: dailyContent.tips.id
        };
        localStorage.setItem(`dailyContent_${currentUser.id || currentUser.email}`, JSON.stringify(viewedContent));
    }
}

// ========== CALCULATE BMI ==========

function calculateBMI(weight, height) {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
}

function getBMIStatus(bmi) {
    if (!bmi) return '-';
    if (bmi < 18.5) return 'Kurus';
    if (bmi >= 18.5 && bmi < 25) return 'Normal';
    if (bmi >= 25 && bmi < 30) return 'Gemuk';
    return 'Obesitas';
}

// ========== NOTIFICATION ==========

function showNotification(message, type = 'info') {
    let notificationContainer = document.querySelector('.notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        notificationContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(notificationContainer);
    }
    
    const notification = document.createElement('div');
    let bgColor = '#6a1b9a';
    let icon = 'fa-info-circle';
    if (type === 'success') {
        bgColor = '#4caf50';
        icon = 'fa-check-circle';
    }
    
    notification.style.cssText = `
        background: ${bgColor};
        color: white;
        padding: 12px 20px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRight 0.3s ease;
        cursor: pointer;
    `;
    notification.innerHTML = `<i class="fas ${icon}" style="margin-right: 8px;"></i> ${message}`;
    
    notificationContainer.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
        if (notificationContainer.children.length === 0) {
            notificationContainer.remove();
        }
    }, 3000);
    
    notification.addEventListener('click', () => notification.remove());
}

// ========== SEARCH & AVATAR ==========

function initSearch() {
    const searchBtns = document.querySelectorAll('.search-btn, .mobile-search-btn');
    searchBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            alert('Fitur pencarian akan segera hadir');
        });
    });
}

function initAvatarClick() {
    const mobileAvatarBtn = document.getElementById('mobileAvatarBtn');
    if (mobileAvatarBtn) {
        mobileAvatarBtn.addEventListener('click', () => {
            window.location.href = 'profile/index.html';
        });
    }
}

function addAnimationStyles() {
    if (document.getElementById('healtech-animations')) return;
    
    const style = document.createElement('style');
    style.id = 'healtech-animations';
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
}

// ========== INITIALIZATION ==========

document.addEventListener('DOMContentLoaded', function() {
    addAnimationStyles();
    
    updateStreak();
    checkAndUpdateBadges();
    displayGreeting();
    displayStreakAndAchievements();
    displayWeeklyStats();
    displayWeightChart();
    displayWeightSummary();
    displayDailyContent();
    
    initSearch();
    initAvatarClick();
    
    console.log('HEALTEACH - Siap digunakan');
});

// ========== EXPOSE FUNCTIONS ==========
window.getCurrentUser = getCurrentUser;
window.getAllUsers = getAllUsers;
window.setCurrentUser = setCurrentUser;
window.isUserLoggedIn = isUserLoggedIn;
window.updateStreak = updateStreak;
window.getCurrentStreak = getCurrentStreak;
window.getUserBadges = getUserBadges;
window.updateDailyStat = updateDailyStat;
window.displayWeeklyStats = displayWeeklyStats;
window.updateCurrentWeight = updateCurrentWeight;
window.displayWeightChart = displayWeightChart;
window.getDailyContent = getDailyContent;
window.displayDailyContent = displayDailyContent;