// ═══════════════════════════════════════════════
// ═══════ صفحه آمار و دستاوردها ═══════
// ═══════════════════════════════════════════════

let expensesWeekChart = null;
let tasksWeekChart = null;
let tasksData = [];
let expensesData = [];

const ALL_ACHIEVEMENTS = [
    { id: "first_task", icon: "🎯", title: "اولین قدم", desc: "اولین کارت رو ثبت کردی!", check: (s) => s.totalTasks >= 1 },
    { id: "first_task_done", icon: "✅", title: "کارآفرین", desc: "اولین کارت رو انجام دادی!", check: (s) => s.tasksDone >= 1 },
    { id: "ten_tasks", icon: "📋", title: "کاربلد", desc: "۱۰ کار انجام دادی!", check: (s) => s.tasksDone >= 10 },
    { id: "fifty_tasks", icon: "🔥", title: "ماشین انجام کار", desc: "۵۰ کار انجام دادی!", check: (s) => s.tasksDone >= 50 },
    { id: "streak_3", icon: "🔥", title: "گرم شدن", desc: "۳ روز پشت‌سرهم فعال بودی!", check: (s) => s.streak >= 3 },
    { id: "streak_7", icon: "🌟", title: "هفته طلایی", desc: "۷ روز پشت‌سرهم فعال بودی!", check: (s) => s.streak >= 7 },
    { id: "streak_30", icon: "👑", title: "سلطان استریک", desc: "۳۰ روز پشت‌سرهم فعال بودی!", check: (s) => s.streak >= 30 },
    { id: "first_expense", icon: "💰", title: "حسابدار", desc: "اولین هزینه‌ت رو ثبت کردی!", check: (s) => s.totalExpenses >= 1 },
    { id: "ten_expenses", icon: "📊", title: "مدیر مالی", desc: "۱۰ هزینه ثبت کردی!", check: (s) => s.totalExpenses >= 10 },
    { id: "first_note", icon: "📝", title: "نویسنده", desc: "اولین یادداشتت رو نوشتی!", check: (s) => s.totalNotes >= 1 },
    { id: "five_notes", icon: "✍️", title: "خوش‌قلم", desc: "۵ یادداشت نوشتی!", check: (s) => s.totalNotes >= 5 },
    { id: "first_goal", icon: "🎯", title: "رؤیاپرداز", desc: "اولین هدفت رو تعریف کردی!", check: (s) => s.totalGoals >= 1 },
    { id: "completed_goal", icon: "🏆", title: "رؤیا به واقعیت", desc: "یکی از اهدافت رو تکمیل کردی!", check: (s) => s.completedGoals >= 1 },
    { id: "budget_set", icon: "🎯", title: "برنامه‌ریز", desc: "بودجه ماهانه‌ت رو تنظیم کردی!", check: (s) => s.budgetSet },
    { id: "under_budget", icon: "🏅", title: "صبور و منظم", desc: "زیر بودجه موندی!", check: (s) => s.underBudget },
    { id: "all_rounder", icon: "⭐", title: "همه‌فن‌حریف", desc: "از هر بخش اپ استفاده کردی!", check: (s) => s.totalTasks >= 1 && s.totalExpenses >= 1 && s.totalNotes >= 1 && s.totalGoals >= 1 }
];

// ===== محاسبه آمار =====
function getUserStats() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    const goals = JSON.parse(localStorage.getItem("goals")) || [];
    const budget = Number(localStorage.getItem("budget")) || 0;

    const tasksDone = tasks.filter(t => t.done).length;
    const completedGoals = goals.filter(g => g.current >= g.target).length;

    let streak = 0;
    let checkDate = getTodayString();
    for (let i = 0; i < 365; i++) {
        const dayTasks = tasks.filter(t => t.date === checkDate);
        const dayDone = dayTasks.filter(t => t.done).length;
        if (dayTasks.length > 0 && dayDone === 0) break;
        if (dayDone > 0) streak++;
        checkDate = addDays(checkDate, -1);
    }

    const now = new Date();
    const monthExpenses = expenses.filter(e => {
        const d = new Date(e.date + "T00:00:00");
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
    const monthSpent = monthExpenses.reduce((s, e) => s + e.amount, 0);
    const underBudget = budget > 0 && monthSpent <= budget;

    return {
        totalTasks: tasks.length,
        tasksDone: tasksDone,
        streak: streak,
        totalExpenses: expenses.length,
        totalNotes: notes.length,
        totalGoals: goals.length,
        completedGoals: completedGoals,
        budgetSet: budget > 0,
        underBudget: underBudget
    };
}

// ===== دستاوردها =====
function getUnlockedAchievements() {
    return JSON.parse(localStorage.getItem("unlockedAchievements")) || [];
}

function unlockAchievement(id) {
    const unlocked = getUnlockedAchievements();
    if (!unlocked.includes(id)) {
        unlocked.push(id);
        localStorage.setItem("unlockedAchievements", JSON.stringify(unlocked));
        return true;
    }
    return false;
}

function checkAchievements() {
    const stats = getUserStats();
    ALL_ACHIEVEMENTS.forEach(function(ach) {
        if (ach.check(stats)) {
            const isNew = unlockAchievement(ach.id);
            if (isNew) showAchievementToast(ach);
        }
    });
}

function showAchievementToast(achievement) {
    const oldToast = document.querySelector(".achievement-toast");
    if (oldToast) oldToast.remove();

    const toast = document.createElement("div");
    toast.className = "achievement-toast";
    toast.innerHTML = `
        <div class="toast-icon">${achievement.icon}</div>
        <div class="toast-content">
            <div class="toast-label">🏆 دستاورد جدید!</div>
            <div class="toast-title">${achievement.title}</div>
            <div class="toast-desc">${achievement.desc}</div>
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 500);
    }, 5000);
}

// ===== نمایش صفحه آمار =====
function renderStatsPage() {
    const stats = getUserStats();
    const unlocked = getUnlockedAchievements();

    document.getElementById("statTasksDone").textContent = formatNumber(stats.tasksDone);
    document.getElementById("statStreak").textContent = formatNumber(stats.streak) + " روز";
    document.getElementById("statExpenses").textContent = formatNumber(stats.totalExpenses);
    document.getElementById("statGoalsDone").textContent = formatNumber(stats.completedGoals);

    const overallPercent = Math.round((unlocked.length / ALL_ACHIEVEMENTS.length) * 100);
    document.getElementById("overallSub").textContent = `${formatNumber(unlocked.length)} از ${formatNumber(ALL_ACHIEVEMENTS.length)} نشان`;
    document.getElementById("overallPercent").textContent = formatNumber(overallPercent) + "٪";
    document.getElementById("overallFill").style.width = overallPercent + "%";

    const list = document.getElementById("achievementsList");
    list.innerHTML = "";

    ALL_ACHIEVEMENTS.forEach(function(ach) {
        const isUnlocked = unlocked.includes(ach.id);
        const card = document.createElement("div");
        card.className = "achievement-card " + (isUnlocked ? "unlocked" : "locked");
        card.innerHTML = `
            <span class="achievement-icon">${ach.icon}</span>
            <div class="achievement-title">${ach.title}</div>
            <div class="achievement-desc">${ach.desc}</div>
        `;
        list.appendChild(card);
    });
}

// ===== نمودار هزینه ۷ روز =====
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
        labels.push(d.toLocaleDateString("fa-IR", { weekday: "short" }));
        const total = expensesData.filter(e => e.date === dateStr).reduce((s, e) => s + e.amount, 0);
        data.push(total);
    }

    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, 220);
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
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: { label: ctx => ctx.parsed.y.toLocaleString("fa-IR") + " ریال" },
                    bodyFont: { family: "Vazirmatn" }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: { family: "Vazirmatn", size: 10 },
                        callback: v => v >= 1000 ? (v/1000).toFixed(0) + "K" : v
                    }
                },
                x: { ticks: { font: { family: "Vazirmatn", size: 10 } } }
            }
        }
    });
}

// ===== نمودار عملکرد هفته =====
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
        labels.push(d.toLocaleDateString("fa-IR", { weekday: "short" }));
        
        const dayTasks = tasksData.filter(t => t.date === dateStr);
        const done = dayTasks.filter(t => t.done).length;
        doneData.push(done);
        pendingData.push(dayTasks.length - done);
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
                    labels: { font: { family: "Vazirmatn", size: 11 }, usePointStyle: true }
                },
                tooltip: { bodyFont: { family: "Vazirmatn" } }
            },
            scales: {
                x: { stacked: true, ticks: { font: { family: "Vazirmatn", size: 10 } } },
                y: { stacked: true, beginAtZero: true, ticks: { font: { family: "Vazirmatn", size: 10 }, stepSize: 1 } }
            }
        }
    });
}

// ===== شروع =====
document.addEventListener("DOMContentLoaded", function() {
    if (typeof initThemeAndSidebar === 'function') initThemeAndSidebar();

    tasksData = JSON.parse(localStorage.getItem("tasks")) || [];
    expensesData = JSON.parse(localStorage.getItem("expenses")) || [];

    if (document.getElementById("achievementsList")) {
        renderStatsPage();
        setTimeout(function() {
            renderExpensesWeekChart();
            renderTasksWeekChart();
        }, 150);
    }
});