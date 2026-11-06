// ═══════════════════════════════════════════════
// ═══════ داشبورد هوشمند ═══════
// ═══════════════════════════════════════════════

// ===== داده‌ها =====
let tasks = [];
let expenses = [];
let notes = [];
let budget = 0;

// ===== چارت‌ها =====
let expensesWeekChart = null;
let tasksWeekChart = null;

// ===== شروع =====
document.addEventListener("DOMContentLoaded", function() {

    // ۱. خواندن داده‌ها
    tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    notes = JSON.parse(localStorage.getItem("notes")) || [];
    budget = Number(localStorage.getItem("budget")) || 0;

    // ۲. اجرای هدر و منو
    if (typeof initThemeAndSidebar === 'function' && !document.querySelector('.desktop-nav')) {
        initThemeAndSidebar();
    } else {
        if (typeof applySavedTheme === 'function') applySavedTheme();
    }

    // ۳. دکمه تم
    const homeThemeBtn = document.getElementById("themeBtn");
    if (homeThemeBtn && typeof toggleTheme === 'function') {
        homeThemeBtn.addEventListener("click", toggleTheme);
    }

    // ۴. هدر و جمله روز
    initHeader();
    initQuoteModal();

    // ۵. حلقه پیشرفت
    updateProgressRing();

    // ۶. کارهای امروز
    renderTodayTasks();

    // ۷. هزینه امروز
    renderTodayExpenses();

    // ۸. بودجه ماه
    renderBudget();

    // ۹. یادداشت‌های اخیر
    renderRecentNotes();

    // ۱۰. نمودارها
    setTimeout(function() {
        renderExpensesWeekChart();
        renderTasksWeekChart();
    }, 100);
});

// ═══════════════════════════════════════════════
// ═══════ هدر ═══════
// ═══════════════════════════════════════════════

function initHeader() {
    const currentDateEl = document.getElementById("currentDate");
    const greetingEl = document.getElementById("greetingText");

    if (currentDateEl) {
        currentDateEl.textContent = toPersianDate(getTodayString());
    }

    const hour = new Date().getHours();
    let greet = "سلام 👋";
    if (hour < 12) greet = "صبح بخیر ☀️";
    else if (hour < 18) greet = "ظهر بخیر 🌤️";
    else greet = "شب بخیر 🌙";
    if (greetingEl) greetingEl.textContent = greet;
}

// ═══════════════════════════════════════════════
// ═══════ مودال جمله روز ═══════
// ═══════════════════════════════════════════════

function initQuoteModal() {
    const modal = document.getElementById("quoteModal");
    const quoteText = document.getElementById("quoteText");
    const closeBtn = document.getElementById("closeQuoteBtn");

    if (!modal || !quoteText) return;

    // لیست جمله‌ها
    const quotes = [
        "امروز بهترین روز برای شروع است.",
        "موفقیت از قدم‌های کوچک شروع می‌شود.",
        "بهترین زمان برای کاشتن درخت، ۲۰ سال پیش بود. دومین بهترین زمان، الان است.",
        "به جای اینکه منتظر انگیزه باشی، شروع کن؛ انگیزه در مسیر پیدا می‌شود.",
        "هر روز یک فرصت جدید برای بهتر شدن است.",
        "کارهای بزرگ با قدم‌های کوچک ساخته می‌شوند.",
        "شکست، پله‌ای برای رسیدن به موفقیت است.",
        "به خودت ایمان داشته باش، تو توانایی بیشتری از آنچه فکر می‌کنی داری.",
        "تنها راه انجام دادن کارها، شروع کردن است.",
        "پیشرفت، نتیجه‌ی تکرار کارهای کوچک است.",
        "اگر می‌خواهی چیزی را تغییر دهی، از خودت شروع کن.",
        "به جای تمرکز بر موانع، بر اهدافت تمرکز کن.",
        "هر صبح یک شانس جدید است.",
        "تلاش امروز، موفقیت فرداست.",
        "به خودت سخت نگیر، فقط هر روز بهتر از دیروز باش.",
        "زمانی که فکر می‌کنی نمی‌توانی، همان زمانی است که باید ادامه بدهی.",
        "زندگی کوتاه‌تر از آن است که با پشیمانی بگذرد.",
        "لبخند بزن، فردا روز بهتری است.",
        "اولین قدم همیشه سخت‌ترین است.",
        "خودت را با هیچ‌کس مقایسه نکن، تو مسیر خودت را داری."
    ];

    // انتخاب جمله بر اساس روز سال (ثابت در طول یک روز)
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const quote = quotes[dayOfYear % quotes.length];

    quoteText.textContent = `«${quote}»`;

    // نمایش مودال با تأخیر کوتاه برای انیمیشن
    setTimeout(function() {
        modal.classList.add("active");
    }, 300);

    // بستن با دکمه
    if (closeBtn) {
        closeBtn.addEventListener("click", function() {
            closeQuoteModal();
        });
    }

    // بستن با کلیک بیرون
    modal.addEventListener("click", function(e) {
        if (e.target === modal) closeQuoteModal();
    });

    // بستن با Escape
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape" && modal.classList.contains("active")) {
            closeQuoteModal();
        }
    });

    function closeQuoteModal() {
        modal.classList.remove("active");
    }
}

// ═══════════════════════════════════════════════
// ═══════ حلقه پیشرفت ═══════
// ═══════════════════════════════════════════════

function updateProgressRing() {
    const today = getTodayString();
    const todayTasks = tasks.filter(t => t.date === today);
    const done = todayTasks.filter(t => t.done).length;
    const total = todayTasks.length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);

    const ring = document.getElementById("progressRing");
    const percentEl = document.getElementById("progressPercent");
    const detailEl = document.getElementById("progressDetail");
    const titleEl = document.getElementById("progressTitle");
    const streakEl = document.getElementById("statStreak");
    const totalEl = document.getElementById("statTotalTasks");

    if (!ring) return;

    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;
    ring.style.strokeDashoffset = offset;

    if (percent >= 80) ring.style.stroke = "#34c759";
    else if (percent >= 40) ring.style.stroke = "#ff9500";
    else if (percent > 0) ring.style.stroke = "#0071e3";
    else ring.style.stroke = "#e5e5ea";

    if (percentEl) percentEl.textContent = formatNumber(percent) + "٪";
    if (detailEl) detailEl.textContent = `${formatNumber(done)} از ${formatNumber(total)} انجام شده`;
    if (titleEl) {
        if (total === 0) titleEl.textContent = "کاری ثبت نشده";
        else if (percent === 100) titleEl.textContent = "🎉 همه انجام شد!";
        else titleEl.textContent = "کارهای امروز";
    }

    const streak = calculateStreak();
    if (streakEl) streakEl.textContent = formatNumber(streak);
    if (totalEl) totalEl.textContent = formatNumber(tasks.length);
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

// ═══════════════════════════════════════════════
// ═══════ کارهای امروز ═══════
// ═══════════════════════════════════════════════

function renderTodayTasks() {
    const today = getTodayString();
    const todayTasks = tasks.filter(t => t.date === today);
    const listEl = document.getElementById("homeTaskList");
    if (!listEl) return;

    if (todayTasks.length === 0) {
        listEl.innerHTML = '<li style="text-align:center; color:#aaa; font-size:12px; padding:15px 0; border:none;">کاری ثبت نشده</li>';
        return;
    }

    const sorted = [...todayTasks].sort(function(a, b) {
        if (a.done !== b.done) return a.done ? 1 : -1;
        if (a.time && b.time) return a.time.localeCompare(b.time);
        if (a.time) return -1;
        if (b.time) return 1;
        return 0;
    });

    listEl.innerHTML = "";
    sorted.slice(0, 5).forEach(function(task) {
        const li = document.createElement("li");
        if (task.done) li.classList.add("done");
        li.innerHTML = `
            <span>${task.done ? '☑' : '☐'}</span>
            <span class="task-mini-text">${escapeHtml(task.text)}</span>
            ${task.time ? `<span class="task-mini-time">${task.time}</span>` : ""}
        `;
        listEl.appendChild(li);
    });

    if (todayTasks.length > 5) {
        const li = document.createElement("li");
        li.style.cssText = "text-align:center; color:#86868b; font-size:11px; padding:8px 0; border:none;";
        li.textContent = `و ${formatNumber(todayTasks.length - 5)} کار دیگر...`;
        listEl.appendChild(li);
    }
}

// ═══════════════════════════════════════════════
// ═══════ هزینه امروز ═══════
// ═══════════════════════════════════════════════

function renderTodayExpenses() {
    const today = getTodayString();
    const todayExpenses = expenses.filter(e => e.date === today);
    const listEl = document.getElementById("homeExpensesList");
    if (!listEl) return;

    const total = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

    if (todayExpenses.length === 0) {
        listEl.innerHTML = '<div style="text-align:center; color:#aaa; font-size:12px; padding:15px 0;">هزینه‌ای ثبت نشده</div>';
        return;
    }

    listEl.innerHTML = `
        <div class="mini-expense-total">${formatNumber(total)}</div>
        <div class="mini-expense-unit">ریال</div>
        <div class="mini-expense-count">در ${formatNumber(todayExpenses.length)} تراکنش</div>
    `;
}

// ═══════════════════════════════════════════════
// ═══════ بودجه ماه ═══════
// ═══════════════════════════════════════════════

function renderBudget() {
    const spentEl = document.getElementById("budgetSpent");
    const limitEl = document.getElementById("budgetLimit");
    const fillEl = document.getElementById("budgetMiniFill");
    const statusEl = document.getElementById("budgetMiniStatus");
    if (!spentEl) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const monthExpenses = expenses.filter(function(e) {
        const d = new Date(e.date + "T00:00:00");
        return d.getFullYear() === year && d.getMonth() === month;
    });
    const spent = monthExpenses.reduce((s, e) => s + e.amount, 0);

    spentEl.textContent = formatNumber(spent) + " ریال";
    limitEl.textContent = formatNumber(budget) + " ریال";

    if (budget <= 0) {
        fillEl.style.width = "0%";
        fillEl.className = "budget-mini-fill";
        statusEl.textContent = "بودجه‌ای تنظیم نشده";
        statusEl.style.color = "#888";
        return;
    }

    const percent = Math.min((spent / budget) * 100, 100);
    fillEl.style.width = percent + "%";
    fillEl.className = "budget-mini-fill";

    const remaining = budget - spent;

    if (spent > budget) {
        fillEl.classList.add("danger");
        statusEl.textContent = `⚠️ ${formatNumber(Math.abs(remaining))} ریال بیش از بودجه!`;
        statusEl.style.color = "#ff3b30";
    } else if (percent >= 80) {
        fillEl.classList.add("warning");
        statusEl.textContent = `⏰ ${formatNumber(remaining)} ریال باقی مونده`;
        statusEl.style.color = "#ff9500";
    } else {
        statusEl.textContent = `✅ ${formatNumber(remaining)} ریال باقی مونده`;
        statusEl.style.color = "#34c759";
    }
}

// ═══════════════════════════════════════════════
// ═══════ یادداشت‌های اخیر ═══════
// ═══════════════════════════════════════════════

function renderRecentNotes() {
    const listEl = document.getElementById("homeNotesList");
    if (!listEl) return;

    const recent = [...notes].sort((a, b) => b.id - a.id).slice(0, 2);

    if (recent.length === 0) {
        listEl.innerHTML = '<div style="text-align:center; color:#aaa; font-size:12px; padding:15px 0;">یادداشتی نداری</div>';
        return;
    }

    listEl.innerHTML = "";
    recent.forEach(function(note) {
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

// ═══════════════════════════════════════════════
// ═══════ نمودار هزینه ۷ روز ═══════
// ═══════════════════════════════════════════════

function renderExpensesWeekChart() {
    const canvas = document.getElementById("expensesWeekChart");
    if (!canvas || typeof Chart === "undefined") return;

    const labels = [];
    const data = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

        const persianDay = d.toLocaleDateString("fa-IR", { weekday: "short" });
        labels.push(persianDay);

        const dayTotal = expenses
            .filter(e => e.date === dateStr)
            .reduce((s, e) => s + e.amount, 0);
        data.push(dayTotal);
    }

    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, 180);
    gradient.addColorStop(0, "rgba(52, 199, 89, 0.4)");
    gradient.addColorStop(1, "rgba(52, 199, 89, 0.02)");

    if (expensesWeekChart) expensesWeekChart.destroy();

    expensesWeekChart = new Chart(canvas, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "هزینه روزانه",
                data: data,
                borderColor: "#34c759",
                backgroundColor: gradient,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: "#34c759",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatNumber(context.parsed.y) + " ریال";
                        }
                    },
                    bodyFont: { family: "Vazirmatn" }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: { family: "Vazirmatn", size: 10 },
                        callback: function(value) {
                            if (value >= 1000000) return (value / 1000000).toFixed(1) + "M";
                            if (value >= 1000) return (value / 1000).toFixed(0) + "K";
                            return value;
                        }
                    },
                    grid: { color: "rgba(0,0,0,0.05)" }
                },
                x: {
                    ticks: { font: { family: "Vazirmatn", size: 10 } },
                    grid: { display: false }
                }
            }
        }
    });
}

// ═══════════════════════════════════════════════
// ═══════ نمودار کارهای هفته ═══════
// ═══════════════════════════════════════════════

function renderTasksWeekChart() {
    const canvas = document.getElementById("tasksWeekChart");
    if (!canvas || typeof Chart === "undefined") return;

    const labels = [];
    const doneData = [];
    const pendingData = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

        const persianDay = d.toLocaleDateString("fa-IR", { weekday: "short" });
        labels.push(persianDay);

        const dayTasks = tasks.filter(t => t.date === dateStr);
        const done = dayTasks.filter(t => t.done).length;
        const pending = dayTasks.length - done;

        doneData.push(done);
        pendingData.push(pending);
    }

    if (tasksWeekChart) tasksWeekChart.destroy();

    tasksWeekChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "انجام‌شده",
                    data: doneData,
                    backgroundColor: "#34c759",
                    borderRadius: 6,
                    borderSkipped: false
                },
                {
                    label: "باقی‌مانده",
                    data: pendingData,
                    backgroundColor: "#ff9500",
                    borderRadius: 6,
                    borderSkipped: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        font: { family: "Vazirmatn", size: 11 },
                        padding: 12,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    bodyFont: { family: "Vazirmatn" }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: { font: { family: "Vazirmatn", size: 10 } },
                    grid: { display: false }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                        font: { family: "Vazirmatn", size: 10 },
                        stepSize: 1,
                        precision: 0
                    },
                    grid: { color: "rgba(0,0,0,0.05)" }
                }
            }
        }
    });
}

// ═══════════════════════════════════════════════
// ═══════ توابع کمکی ═══════
// ═══════════════════════════════════════════════

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}