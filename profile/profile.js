// ============================================
// HEALTEACH - Profile Page JavaScript
// Mengelola tampilan profil dan edit profil
// ============================================

// ========== DATA DEFAULT ==========

const defaultProfileData = {
    fullName: '',
    email: '',
    age: 0,
    gender: '',
    weight: 0,
    height: 0,
    goal: '',
    joinDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    points: 0,
    checklistCount: 0
};

// ========== FUNGSI PEMBANTU ==========

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

function getLevel(points) {
    if (points < 100) return { name: 'Pemula', icon: 'fa-seedling', color: '#4caf50' };
    if (points < 300) return { name: 'Perunggu', icon: 'fa-medal', color: '#cd7f32' };
    if (points < 600) return { name: 'Silver', icon: 'fa-medal', color: '#c0c0c0' };
    if (points < 1000) return { name: 'Emas', icon: 'fa-crown', color: '#ffd700' };
    return { name: 'Platinum', icon: 'fa-gem', color: '#e5e4e2' };
}

// ========== FUNGSI MEMUAT DATA PROFIL ==========

function loadProfileData() {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        window.location.href = '../login.html';
        return null;
    }
    
    let profileData = localStorage.getItem('userProfile');
    if (profileData) {
        profileData = JSON.parse(profileData);
    } else {
        profileData = {
            ...defaultProfileData,
            fullName: currentUser.name || 'User',
            email: currentUser.email || '-',
            joinDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        };
    }
    
    return profileData;
}

// ========== MENAMPILKAN PROFIL ==========

function displayProfile() {
    const profileData = loadProfileData();
    if (!profileData) return;
    
    const currentUser = getCurrentUser();
    const bmi = calculateBMI(profileData.weight, profileData.height);
    const bmiStatus = getBMIStatus(bmi);
    const bmiDisplay = bmi ? `${bmi} (${bmiStatus})` : '-';
    const ageDisplay = profileData.age ? `${profileData.age} tahun` : '-';
    const level = getLevel(profileData.points || 0);
    
    document.getElementById('profileName').textContent = profileData.fullName || currentUser?.name || 'User';
    document.getElementById('profileEmail').textContent = profileData.email || currentUser?.email || '-';
    document.getElementById('profileAge').textContent = ageDisplay;
    document.getElementById('profileGender').textContent = profileData.gender || '-';
    document.getElementById('profileWeight').textContent = profileData.weight ? `${profileData.weight} kg` : '-';
    document.getElementById('profileHeight').textContent = profileData.height ? `${profileData.height} cm` : '-';
    document.getElementById('profileBMI').textContent = bmiDisplay;
    document.getElementById('profileGoal').textContent = profileData.goal || 'Belum ditentukan';
    document.getElementById('profileRank').innerHTML = `<i class="fas ${level.icon}" style="color: ${level.color}"></i> ${level.name}`;
    document.getElementById('profileLevel').innerHTML = `<i class="fas ${level.icon}"></i> ${level.name} Level`;
    document.getElementById('memberSince').textContent = profileData.joinDate || '-';
    document.getElementById('totalPoints').textContent = profileData.points || 0;
    document.getElementById('totalChecklist').textContent = profileData.checklistCount || 0;
}

// ========== EDIT PROFIL FUNCTIONS ==========

function loadProfileToForm() {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        window.location.href = '../login.html';
        return;
    }
    
    let profileData = localStorage.getItem('userProfile');
    if (profileData) {
        profileData = JSON.parse(profileData);
    } else {
        profileData = {
            fullName: currentUser.name || '',
            email: currentUser.email || '',
            age: '',
            gender: '',
            weight: '',
            height: '',
            goal: '',
            joinDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
            points: 0,
            checklistCount: 0
        };
    }
    
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const ageInput = document.getElementById('age');
    const genderSelect = document.getElementById('gender');
    const weightInput = document.getElementById('weight');
    const heightInput = document.getElementById('height');
    const goalSelect = document.getElementById('goal');
    
    if (fullNameInput) fullNameInput.value = profileData.fullName || '';
    if (emailInput) emailInput.value = profileData.email || currentUser?.email || '';
    if (ageInput) ageInput.value = profileData.age || '';
    if (genderSelect) genderSelect.value = profileData.gender || '';
    if (weightInput) weightInput.value = profileData.weight || '';
    if (heightInput) heightInput.value = profileData.height || '';
    if (goalSelect) goalSelect.value = profileData.goal || '';
}

function saveProfileData(event) {
    if (event) event.preventDefault();
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = '../login.html';
        return;
    }
    
    const fullNameInput = document.getElementById('fullName');
    const ageInput = document.getElementById('age');
    const genderSelect = document.getElementById('gender');
    const weightInput = document.getElementById('weight');
    const heightInput = document.getElementById('height');
    const goalSelect = document.getElementById('goal');
    
    const fullName = fullNameInput ? fullNameInput.value.trim() : '';
    const age = parseInt(ageInput?.value) || '';
    const gender = genderSelect?.value || '';
    const weight = parseFloat(weightInput?.value) || '';
    const height = parseFloat(heightInput?.value) || '';
    const goal = goalSelect?.value || '';
    
    if (!fullName) {
        alert('Nama lengkap tidak boleh kosong');
        if (fullNameInput) fullNameInput.focus();
        return;
    }
    
    let existingProfile = localStorage.getItem('userProfile');
    if (existingProfile) {
        existingProfile = JSON.parse(existingProfile);
    } else {
        existingProfile = {};
    }
    
    const updatedProfile = {
        ...existingProfile,
        fullName: fullName,
        age: age,
        gender: gender,
        weight: weight,
        height: height,
        goal: goal,
        email: currentUser.email,
        joinDate: existingProfile.joinDate || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        points: existingProfile.points || 0,
        checklistCount: existingProfile.checklistCount || 0
    };
    
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    
    const updatedCurrentUser = {
        ...currentUser,
        name: fullName
    };
    localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
    
    alert('Profil berhasil diperbarui');
    window.location.href = 'index.html';
}

// ========== LOGOUT FUNCTION ==========

function handleLogout() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        const confirmLogout = confirm(`Apakah Anda yakin ingin logout, ${currentUser.name}?`);
        if (confirmLogout) {
            localStorage.removeItem('currentUser');
            alert('Anda telah berhasil logout');
            window.location.href = '../login.html';
        }
    }
}

// ========== INISIALISASI ==========

function initEditProfilePage() {
    loadProfileToForm();
    
    const form = document.getElementById('editProfileForm');
    if (form) {
        form.addEventListener('submit', saveProfileData);
    }
}

function initProfilePage() {
    displayProfile();
    
    const editBtn = document.getElementById('editProfileBtn');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            window.location.href = 'edit-profile.html';
        });
    }
    
    const changePhotoBtn = document.getElementById('changePhotoBtn');
    if (changePhotoBtn) {
        changePhotoBtn.addEventListener('click', () => {
            alert('Fitur ganti foto akan segera hadir');
        });
    }
    
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', () => {
            alert('Fitur ubah password akan segera hadir');
        });
    }
    
    const privacyBtn = document.getElementById('privacyPolicyBtn');
    if (privacyBtn) {
        privacyBtn.addEventListener('click', () => {
            alert('Kebijakan Privasi HEALTEACH\n\nData Anda aman bersama kami. Kami tidak akan membagikan data pribadi Anda kepada pihak ketiga tanpa izin Anda.');
        });
    }
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Deteksi halaman mana yang sedang dibuka
document.addEventListener('DOMContentLoaded', function() {
    const isEditPage = window.location.pathname.includes('edit-profile.html');
    
    if (isEditPage) {
        initEditProfilePage();
    } else {
        initProfilePage();
    }
});