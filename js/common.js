// ===== توابع مشترک تاریخ =====

function getTodayString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function addDays(dateString, days) {
    const date = new Date(dateString + "T00:00:00");
    date.setDate(date.getDate() + days);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function toPersianDate(dateString) {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("fa-IR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

function formatNumber(num) {
    return num.toLocaleString("fa-IR");
}

// ===== تم تاریک/روشن =====
function applySavedTheme() {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
        document.body.classList.add("dark");
    }
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

// ===== شروع مشترک =====
function initCommon() {
    applySavedTheme();
    const themeBtn = document.getElementById("themeBtn");
    if (themeBtn) themeBtn.addEventListener("click", toggleTheme);
}