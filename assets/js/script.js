// ============================================
// HEALTEACH - Main JavaScript
// Mengelola data user, sambutan, dan interaksi
// ============================================

// ========== DATA USER MANAGEMENT ==========

// Fungsi untuk mendapatkan data user yang sedang login dari localStorage
function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
        return JSON.parse(userData);
    }
    return null;
}

// Fungsi untuk mendapatkan semua user terdaftar
function getAllUsers() {
    const users = localStorage.getItem('registeredUsers');
    if (users) {
        return JSON.parse(users);
    }
    return [];
}

// Fungsi untuk menyimpan user yang sedang login
function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

// Fungsi untuk cek apakah user sudah login
function isUserLoggedIn() {
    return getCurrentUser() !== null;
}

// ========== GREETING FUNCTIONS ==========

// Fungsi untuk menampilkan sapaan berdasarkan waktu
function getGreeting() {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 11) {
        return 'Selamat Pagi';
    } else if (hour >= 11 && hour < 15) {
        return 'Selamat Siang';
    } else if (hour >= 15 && hour < 18) {
        return 'Selamat Sore';
    } else {
        return 'Selamat Malam';
    }
}

// Fungsi untuk menampilkan kutipan motivasi random
function getRandomQuote() {
    const quotes = [
        'Tetap semangat untuk hidup sehat hari ini!',
        'Sehat itu investasi, bukan pengeluaran.',
        'Hari ini lebih baik dari kemarin.',
        'Small steps every day, big results later.',
        'Jaga tubuh, karena hanya satu yang kita punya.',
        'Kesehatan adalah mahkota di kepala orang sehat.',
        'Mulai hari dengan hal positif untuk tubuh.',
        'Konsistensi lebih penting dari intensitas.'
    ];
    
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
}

// ========== GREETING DISPLAY ==========

// Fungsi untuk menampilkan greeting card di halaman utama
function displayGreeting() {
    const currentUser = getCurrentUser();
    const greetingMessageEl = document.getElementById('greeting-message');
    const userNameEl = document.getElementById('user-name');
    const motivationQuoteEl = document.getElementById('motivation-quote');
    
    // Dapatkan sapaan berdasarkan waktu
    const greeting = getGreeting();
    
    if (currentUser) {
        // User sudah login - tampilkan sapaan personal dengan nama user
        if (greetingMessageEl) {
            greetingMessageEl.innerHTML = `${greeting}, <i class="fas fa-smile-wink" style="font-size: 18px;"></i>`;
        }
        if (userNameEl) {
            userNameEl.innerHTML = currentUser.name;
        }
    } else {
        // User belum login - tampilkan sapaan umum
        if (greetingMessageEl) {
            greetingMessageEl.innerHTML = `${greeting}, <i class="fas fa-leaf" style="font-size: 18px;"></i>`;
        }
        if (userNameEl) {
            userNameEl.innerHTML = `Pengunjung`;
        }
    }
    
    // Tampilkan kutipan motivasi random
    if (motivationQuoteEl) {
        motivationQuoteEl.innerHTML = `<i class="fas fa-quote-left" style="font-size: 12px; margin-right: 6px; color: #6a1b9a;"></i> ${getRandomQuote()}`;
    }
}

// ========== LOGOUT FUNCTION ==========

function logoutUser() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        const confirmLogout = confirm(`Apakah Anda yakin ingin logout, ${currentUser.name}?`);
        if (confirmLogout) {
            localStorage.removeItem('currentUser');
            alert('Anda telah berhasil logout');
            window.location.href = 'login.html';
        }
    } else {
        window.location.href = 'login.html';
    }
}

// ========== SEARCH FUNCTIONALITY ==========

function initSearch() {
    const searchBtns = document.querySelectorAll('.search-btn, .mobile-search-btn');
    
    searchBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            alert('Fitur pencarian akan segera hadir');
        });
    });
}

// ========== AVATAR CLICK (Mobile Only - Tanpa Dropdown) ==========

function initAvatarClick() {
    // Untuk mobile header - hanya alert biasa (tanpa dropdown)
    const mobileAvatarBtn = document.getElementById('mobileAvatarBtn');
    if (mobileAvatarBtn) {
        mobileAvatarBtn.addEventListener('click', () => {
            const currentUser = getCurrentUser();
            if (currentUser) {
                alert(`Halo ${currentUser.name}! Fitur profil akan segera hadir.`);
            } else {
                alert('Silakan login terlebih dahulu');
                window.location.href = 'login.html';
            }
        });
    }
    
    // Untuk desktop avatar - tidak melakukan apa-apa (biarkan kosong/tanpa aksi)
    // const avatarBtn = document.getElementById('avatarBtn'); - TIDAK DIBUATKAN EVENT
}

// ========== ADD CSS ANIMATIONS ==========

function addAnimationStyles() {
    if (document.getElementById('healtech-animations')) return;
    
    const style = document.createElement('style');
    style.id = 'healtech-animations';
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// ========== INITIALIZATION ==========

document.addEventListener('DOMContentLoaded', function() {
    addAnimationStyles();
    displayGreeting();
    initSearch();
    initAvatarClick();
    
    console.log('HEALTEACH - Siap digunakan');
});

// ========== EXPOSE FUNCTIONS TO GLOBAL SCOPE ==========
window.getCurrentUser = getCurrentUser;
window.getAllUsers = getAllUsers;
window.setCurrentUser = setCurrentUser;
window.isUserLoggedIn = isUserLoggedIn;
window.logoutUser = logoutUser;
window.getGreeting = getGreeting;
window.getRandomQuote = getRandomQuote;