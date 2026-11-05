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
    const btn = document.getElementById("themeBtn");
    if (btn) btn.textContent = (saved === "dark") ? "☀️" : "🌙";
}

function toggleTheme() {
    document.body.classList.toggle("dark");
    const themeBtn = document.getElementById("themeBtn");
    if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
        if (themeBtn) themeBtn.textContent = "☀️";
    } else {
        localStorage.setItem("theme", "light");
        if (themeBtn) themeBtn.textContent = "🌙";
    }
}

// ===== 🚀 تزریق سایدبار =====
function initThemeAndSidebar() {
    if (!document.querySelector('link[href="css/theme.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/theme.css';
        document.head.appendChild(link);
    }

    if (!document.querySelector('.sidebar')) {
        // ۱. منوی کامل برای دسکتاپ
        const desktopNav = document.createElement('aside');
        desktopNav.className = 'sidebar desktop-nav';
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
                <a href="settings.html" class="nav-item-home" title="تنظیمات">⚙️ <span>تنظیمات</span></a>
            </div>
        `;
        document.body.appendChild(desktopNav);

        // ۲. منوی موبایل (فقط دکمه خانه)
        const mobileNav = document.createElement('aside');
        mobileNav.className = 'sidebar mobile-nav';
        mobileNav.innerHTML = `
            <a href="index.html" class="nav-item-home" title="بازگشت به خانه">🏠</a>
        `;
        document.body.appendChild(mobileNav);
    }

    const oldApp = document.querySelector('.app');
    if (oldApp) {
        oldApp.className = 'main-content'; 
        oldApp.style.cssText = ''; 
    }

    applySavedTheme();
    const themeBtn = document.getElementById("themeBtn");
    if (themeBtn) themeBtn.addEventListener("click", toggleTheme);
}

// ===== شروع =====
document.addEventListener("DOMContentLoaded", initThemeAndSidebar);