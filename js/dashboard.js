// ═══════════════════════════════════════════════
// ═══════ داشبورد ═══════
// ═══════════════════════════════════════════════

let tasks = [];
let expenses = [];
let notes = [];
let budget = 0;

document.addEventListener("DOMContentLoaded", function() {
    tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    notes = JSON.parse(localStorage.getItem("notes")) || [];
    budget = Number(localStorage.getItem("budget")) || 0;

    if (typeof initThemeAndSidebar === 'function') initThemeAndSidebar();

    initHeader();
    initQuoteModal();
    checkBackupReminder();
    updateProgressRing();
    renderTodayTasks();
    renderTodayExpenses();
    renderRecentNotes();
});

function initHeader() {
    const currentDateEl = document.getElementById("currentDate");
    const greetingEl = document.getElementById("greetingText");
    if (currentDateEl) currentDateEl.textContent = toPersianDate(getTodayString());
    const hour = new Date().getHours();
    let greet = "سلام 👋";
    if (hour < 12) greet = "صبح بخیر ☀️";
    else if (hour < 18) greet = "ظهر بخیر 🌤️";
    else greet = "شب بخیر 🌙";
    if (greetingEl) greetingEl.textContent = greet;
}

function checkBackupReminder() {
    const banner = document.getElementById("backupBanner");
    if (!banner) return;

    const lastBackup = localStorage.getItem("lastBackupDate");
    let showBanner = false;

    if (!lastBackup) {
        const totalItems = tasks.length + expenses.length + notes.length;
        if (totalItems >= 3) showBanner = true;
    } else {
        const lastDate = new Date(lastBackup);
        const now = new Date();
        const diffDays = Math.ceil(Math.abs(now - lastDate) / (1000 * 60 * 60 * 24));
        if (diffDays >= 7) showBanner = true;
    }

    if (showBanner) banner.style.display = "flex";
    else banner.style.display = "none";

    const closeBtn = document.getElementById("closeBackupBanner");
    if (closeBtn) {
        closeBtn.addEventListener("click", function() {
            banner.style.display = "none";
            localStorage.setItem("lastBackupDate", new Date().toISOString());
        });
    }
}

function updateProgressRing() {
    const today = getTodayString();
    const todayTasks = tasks.filter(t => t.date === today);
    const done = todayTasks.filter(t => t.done).length;
    const total = todayTasks.length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);

    const ring = document.getElementById("progressRing");
    if (!ring) return;

    const offset = (2 * Math.PI * 52) - (percent / 100) * (2 * Math.PI * 52);
    ring.style.strokeDashoffset = offset;
    ring.style.stroke = percent >= 80 ? "#34c759" : percent >= 40 ? "#ff9500" : percent > 0 ? "#0071e3" : "#e5e5ea";

    document.getElementById("progressPercent").textContent = formatNumber(percent) + "٪";
    document.getElementById("progressDetail").textContent = `${formatNumber(done)} از ${formatNumber(total)} انجام شده`;
    document.getElementById("progressTitle").textContent = total === 0 ? "کاری ثبت نشده" : percent === 100 ? "🎉 همه انجام شد!" : "کارهای امروز";
    document.getElementById("statStreak").textContent = formatNumber(calculateStreak());
    document.getElementById("statTotalTasks").textContent = formatNumber(tasks.length);
}

function calculateStreak() {
    if (tasks.length === 0) return 0;
    let streak = 0;
    let checkDate = getTodayString();
    for (let i = 0; i < 365; i++) {
        const dayTasks = tasks.filter(t => t.date === checkDate);
        const dayDone = dayTasks.filter(t => t.done).length;
        if (dayTasks.length > 0 && dayDone === 0) break;
        if (dayDone > 0) streak++;
        checkDate = addDays(checkDate, -1);
    }
    return streak;
}

function renderTodayTasks() {
    const today = getTodayString();
    const todayTasks = tasks.filter(t => t.date === today);
    const listEl = document.getElementById("homeTaskList");
    if (!listEl) return;

    if (todayTasks.length === 0) {
        listEl.innerHTML = '<li style="text-align:center; color:#aaa; font-size:12px; padding:15px 0; border:none;">کاری ثبت نشده</li>';
        return;
    }

    const sorted = [...todayTasks].sort((a, b) => {
        if (a.done !== b.done) return a.done ? 1 : -1;
        return (a.time || "").localeCompare(b.time || "");
    });

    listEl.innerHTML = "";
    sorted.slice(0, 4).forEach(task => {
        const li = document.createElement("li");
        if (task.done) li.classList.add("done");
        li.innerHTML = `
            <span>${task.done ? '☑' : '☐'}</span>
            <span class="task-mini-text">${escapeHtml(task.text)}</span>
            ${task.time ? `<span class="task-mini-time">${task.time}</span>` : ""}
        `;
        listEl.appendChild(li);
    });

    if (todayTasks.length > 4) {
        const li = document.createElement("li");
        li.style.cssText = "text-align:center; color:#0071e3; font-size:11px; padding:8px 0; border:none; font-weight:bold;";
        li.textContent = `و ${formatNumber(todayTasks.length - 4)} کار دیگر`;
        listEl.appendChild(li);
    }
}

function renderTodayExpenses() {
    const today = getTodayString();
    const todayExpenses = expenses.filter(e => e.date === today);
    const listEl = document.getElementById("homeExpensesList");
    if (!listEl) return;

    if (todayExpenses.length === 0) {
        listEl.innerHTML = '<div style="text-align:center; color:#aaa; font-size:12px; padding:15px 0;">هزینه‌ای ثبت نشده</div>';
        return;
    }

    const total = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
    listEl.innerHTML = `
        <div class="mini-expense-total">${formatNumber(total)}</div>
        <div class="mini-expense-unit">ریال</div>
        <div class="mini-expense-count">در ${formatNumber(todayExpenses.length)} تراکنش</div>
    `;
}

function renderRecentNotes() {
    const listEl = document.getElementById("homeNotesList");
    if (!listEl) return;

    const recent = [...notes].sort((a, b) => b.id - a.id).slice(0, 2);

    if (recent.length === 0) {
        listEl.innerHTML = '<div style="text-align:center; color:#aaa; font-size:12px; padding:15px 0;">یادداشتی نداری</div>';
        return;
    }

    listEl.innerHTML = "";
    recent.forEach(note => {
        const a = document.createElement("a");
        a.href = "notes.html";
        a.className = "mini-note";
        a.innerHTML = `
            <div class="mini-note-title">${escapeHtml(note.title)}</div>
            <div class="mini-note-preview">${escapeHtml(note.content)}</div>
        `;
        listEl.appendChild(a);
    });
}

function initQuoteModal() {
    const modal = document.getElementById("quoteModal");
    const quoteText = document.getElementById("quoteText");
    const closeBtn = document.getElementById("closeQuoteBtn");
    if (!modal || !quoteText) return;

    const quotes = [
        "امروز بهترین روز برای شروع است.",
        "موفقیت از قدم‌های کوچک شروع می‌شود.",
        "به جای اینکه منتظر انگیزه باشی، شروع کن؛ انگیزه در مسیر پیدا می‌شود.",
        "هر روز یک فرصت جدید برای بهتر شدن است.",
        "کارهای بزرگ با قدم‌های کوچک ساخته می‌شوند.",
        "تنها راه انجام دادن کارها، شروع کردن است.",
        "پیشرفت، نتیجه‌ی تکرار کارهای کوچک است.",
        "به خودت ایمان داشته باش، تو توانایی بیشتری از آنچه فکر می‌کنی داری."
    ];

    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    quoteText.textContent = `«${quotes[dayOfYear % quotes.length]}»`;

    setTimeout(() => modal.classList.add("active"), 300);
    if (closeBtn) closeBtn.addEventListener("click", () => modal.classList.remove("active"));
    modal.addEventListener("click", e => { if (e.target === modal) modal.classList.remove("active"); });
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}