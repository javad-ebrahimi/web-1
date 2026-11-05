// ===== توابع تاریخ =====
function getTodayString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function addDays(dateString, days) {
    const date = new Date(dateString + "T00:00:00");
    date.setDate(date.getDate() + days);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function toPersianDate(dateString) {
    return new Date(dateString + "T00:00:00").toLocaleDateString("fa-IR", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
    });
}

function formatNumber(num) { return num.toLocaleString("fa-IR"); }

// ===== تم تاریک/روشن =====
function applySavedTheme() {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") document.body.classList.add("dark");
    
    // آپدیت آیکون دکمه تم صفحه اصلی
    const homeThemeBtn = document.getElementById("themeBtn");
    if (homeThemeBtn) homeThemeBtn.textContent = (saved === "dark") ? "☀️" : "🌙";
}

function toggleTheme() {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    
    localStorage.setItem("theme", isDark ? "dark" : "light");
    
    // آپدیت آیکون دکمه تم صفحه اصلی
    const homeThemeBtn = document.getElementById("themeBtn");
    if (homeThemeBtn) homeThemeBtn.textContent = isDark ? "☀️" : "🌙";
    
    window.dispatchEvent(new Event("themeChanged"));
}

// ===== 🚀 ساخت منوها =====
function initThemeAndSidebar() {
    if (!document.querySelector('link[href="css/theme.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/theme.css';
        document.head.appendChild(link);
    }

    if (!document.querySelector('.desktop-nav')) {
        
        // 👇 ۱. منوی دسکتاپ (بدون دکمه تم)
        const desktopNav = document.createElement('aside');
        desktopNav.className = 'desktop-nav';
        desktopNav.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 5px; width: 100%;">
                <a href="index.html" class="nav-item-home" title="خانه">🏠 <span>خانه</span></a>
                <a href="tasks.html" class="nav-item-home" title="کارها">📋 <span>کارها</span></a>
                <a href="expenses.html" class="nav-item-home" title="هزینه‌ها">💰 <span>هزینه‌ها</span></a>
                <a href="calculator.html" class="nav-item-home" title="ماشین‌حساب">🧮 <span>ماشین‌حساب</span></a>
                <a href="calendar.html" class="nav-item-home" title="تقویم">📅 <span>تقویم</span></a>
                <a href="notes.html" class="nav-item-home" title="یادداشت‌ها">📝 <span>یادداشت</span></a>
                <a href="password.html" class="nav-item-home" title="تولید رمز">🔐 <span>تولید رمز</span></a>
                <a href="memory.html" class="nav-item-home" title="بازی حافظه">🧠 <span>بازی حافظه</span></a>
                <a href="qrcode.html" class="nav-item-home" title="QR Code">📱 <span>QR Code</span></a>
                <a href="settings.html" class="nav-item-home" title="تنظیمات">⚙️ <span>تنظیمات</span></a>
            </div>
        `;
        document.body.appendChild(desktopNav);

        // 👇 ۲. هدر موبایل (بدون دکمه تم)
        const mobileHeader = document.createElement('div');
        mobileHeader.className = 'mobile-header';
        mobileHeader.innerHTML = `
            <button class="mobile-menu-btn">☰</button>
            <div class="mobile-title">برنامه‌ریزی من</div>
            <a href="index.html" class="mobile-logo-btn" title="بازگشت به خانه">🏠</a>
        `;
        document.body.prepend(mobileHeader);
        
        const mobileBtn = mobileHeader.querySelector('.mobile-menu-btn');

        // 👇 ۳. منوی کشویی موبایل
        const mobileMenu = document.createElement('aside');
        mobileMenu.className = 'mobile-menu-overlay';
        mobileMenu.innerHTML = `
            <div class="mobile-menu-content">
                <button class="mobile-menu-close" id="closeMobileMenu">✕</button>
                <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 20px;">
                    <a href="index.html" class="nav-item-home" style="flex-direction: row;">🏠 <span>خانه</span></a>
                    <a href="tasks.html" class="nav-item-home" style="flex-direction: row;">📋 <span>کارها</span></a>
                    <a href="expenses.html" class="nav-item-home" style="flex-direction: row;">💰 <span>هزینه‌ها</span></a>
                    <a href="calculator.html" class="nav-item-home" style="flex-direction: row;">🧮 <span>ماشین‌حساب</span></a>
                    <a href="calendar.html" class="nav-item-home" style="flex-direction: row;">📅 <span>تقویم</span></a>
                    <a href="notes.html" class="nav-item-home" style="flex-direction: row;">📝 <span>یادداشت‌ها</span></a>
                    <a href="password.html" class="nav-item-home" style="flex-direction: row;">🔐 <span>تولید رمز</span></a>
                    <a href="memory.html" class="nav-item-home" style="flex-direction: row;">🧠 <span>بازی حافظه</span></a>
                    <a href="qrcode.html" class="nav-item-home" style="flex-direction: row;">📱 <span>QR Code</span></a>
                    <a href="settings.html" class="nav-item-home" style="flex-direction: row;">⚙️ <span>تنظیمات</span></a>
                </div>
            </div>
        `;
        document.body.appendChild(mobileMenu);

        mobileBtn.addEventListener('click', () => {
            mobileMenu.classList.add('active');
        });
        document.getElementById('closeMobileMenu').addEventListener('click', () => {
            mobileMenu.classList.remove('active');
        });
        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) mobileMenu.classList.remove('active');
        });
    }

    applySavedTheme();
    
    // 🌟 اتصال دکمه تم صفحه اصلی (اگه وجود داشت)
    const homeThemeBtn = document.getElementById("themeBtn");
    if (homeThemeBtn) {
        homeThemeBtn.addEventListener("click", toggleTheme);
    }
}

document.addEventListener("DOMContentLoaded", initThemeAndSidebar);