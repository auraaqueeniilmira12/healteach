// ============================================
// HEALTEACH - LOGIN & REGISTER SYSTEM
// ============================================

// DOM Elements - Register Page
const registerForm = document.getElementById('register-form');
const registerError = document.getElementById('register-error');

// DOM Elements - Login Page
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

// ==================== REGISTER FUNCTION ====================
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Ambil nilai dari form register
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const name = document.getElementById('reg-name').value.trim();
        const age = document.getElementById('reg-age').value;
        const gender = document.querySelector('input[name="gender"]:checked');
        const weight = document.getElementById('reg-weight').value;
        const height = document.getElementById('reg-height').value;
        
        // Validasi password minimal 6 karakter
        if (password.length < 6) {
            showError(registerError, 'Password minimal 6 karakter!');
            return;
        }
        
        // Validasi jenis kelamin dipilih
        if (!gender) {
            showError(registerError, 'Pilih jenis kelamin terlebih dahulu!');
            return;
        }
        
        // Validasi usia (minimal 1 tahun)
        if (age < 1 || age > 120) {
            showError(registerError, 'Masukkan usia yang valid (1-120 tahun)!');
            return;
        }
        
        // Validasi berat badan
        if (weight < 10 || weight > 300) {
            showError(registerError, 'Masukkan berat badan yang valid (10-300 kg)!');
            return;
        }
        
        // Validasi tinggi badan
        if (height < 50 || height > 250) {
            showError(registerError, 'Masukkan tinggi badan yang valid (50-250 cm)!');
            return;
        }
        
        // Cek apakah email sudah terdaftar
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const emailExists = existingUsers.some(user => user.email === email);
        
        if (emailExists) {
            showError(registerError, 'Email sudah terdaftar! Silakan gunakan email lain.');
            return;
        }
        
        // Hitung BMI
        const bmi = calculateBMI(weight, height);
        let bmiCategory = '';
        if (bmi < 18.5) bmiCategory = 'Kurus';
        else if (bmi >= 18.5 && bmi <= 24.9) bmiCategory = 'Normal';
        else if (bmi >= 25 && bmi <= 29.9) bmiCategory = 'Gemuk';
        else bmiCategory = 'Obesitas';
        
        // Data user baru
        const newUser = {
            id: Date.now(),
            email: email,
            password: password,
            name: name,
            age: parseInt(age),
            gender: gender.value,
            weight: parseFloat(weight),
            height: parseFloat(height),
            bmi: bmi,
            bmiCategory: bmiCategory,
            registeredAt: new Date().toISOString(),
            photo: null, // akan diisi nanti
            streak: 0,
            points: 0,
            achievements: []
        };
        
        // Simpan ke localStorage
        existingUsers.push(newUser);
        localStorage.setItem('users', JSON.stringify(existingUsers));
        
        // Tampilkan pesan sukses
        alert('✅ Registrasi berhasil! Silakan login dengan akun Anda.');
        
        // Redirect ke halaman login
        window.location.href = 'login.html';
    });
}

// ==================== LOGIN FUNCTION ====================
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Ambil nilai dari form login
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-checkbox')?.checked || false;
        
        // Validasi tidak boleh kosong
        if (!email || !password) {
            showError(loginError, 'Email dan password harus diisi!');
            return;
        }
        
        // Ambil data users dari localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Cari user dengan email dan password yang cocok
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Login berhasil
            // Simpan session login
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
            
            // Redirect ke dashboard
            window.location.href = 'index.html';
        } else {
            // Cek apakah email terdaftar
            const emailExists = users.some(u => u.email === email);
            
            if (!emailExists) {
                showError(loginError, 'Email tidak terdaftar! Silakan daftar terlebih dahulu.');
            } else {
                showError(loginError, 'Password salah! Silakan coba lagi.');
            }
        }
    });
    
    // Auto-fill email jika ada remember me
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        const emailInput = document.getElementById('login-email');
        const rememberCheckbox = document.getElementById('remember-checkbox');
        if (emailInput) emailInput.value = rememberedEmail;
        if (rememberCheckbox) rememberCheckbox.checked = true;
    }
}

// ==================== HELPER FUNCTIONS ====================

// Fungsi untuk menghitung BMI
function calculateBMI(weight, height) {
    // height dalam cm, konversi ke meter
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return Math.round(bmi * 10) / 10;
}

// Fungsi untuk menampilkan error message
function showError(element, message) {
    if (element) {
        element.textContent = message;
        element.classList.add('show');
        
        // Hilangkan error setelah 3 detik
        setTimeout(() => {
            element.classList.remove('show');
        }, 3000);
    }
}

// ==================== CHECK LOGIN STATUS ====================
// Fungsi ini akan dijalankan di halaman yang butuh proteksi login
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (isLoggedIn !== 'true') {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Fungsi untuk logout
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Fungsi untuk mendapatkan data user yang sedang login
function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
        return JSON.parse(userData);
    }
    return null;
}