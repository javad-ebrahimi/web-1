// ===== داده‌ها =====
const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
const notes = JSON.parse(localStorage.getItem("notes")) || [];

// ===== المان‌ها =====
const greeting = document.getElementById("greeting");
const tasksSummary = document.getElementById("tasksSummary");
const expensesSummary = document.getElementById("expensesSummary");
const notesSummary = document.getElementById("notesSummary");

// ===== تاریخ امروز =====
const todayStr = getTodayString();
const todayPersian = toPersianDate(todayStr);

// ===== سلام بر اساس ساعت =====
function updateGreeting() {
    const hour = new Date().getHours();
    let text = "";

    if (hour < 12) text = "صبح بخیر ☀️";
    else if (hour < 18) text = "ظهر بخیر 🌤️";
    else text = "شب بخیر 🌙";

    greeting.textContent = text + " — " + todayPersian;
}

// ===== خلاصه کارها =====
function renderTasksSummary() {
    const todayTasks = tasks.filter(t => t.date === todayStr);

    if (todayTasks.length === 0) {
        tasksSummary.innerHTML = '<div class="dashboard-empty">کاری برای امروز ثبت نکردی</div>';
        return;
    }

    const done = todayTasks.filter(t => t.done).length;
    const total = todayTasks.length;

    let html = `<div style="margin-bottom: 10px; font-weight: bold;">
        ${formatNumber(done)} از ${formatNumber(total)} انجام شده
    </div>`;

    html += '<ul class="dashboard-task-list">';
    todayTasks.slice(0, 3).forEach(function(task) {
        html += `
            <li class="${task.done ? 'done' : ''}">
                <span>${task.done ? '☑' : '☐'}</span>
                <span>${escapeHtml(task.text)}</span>
            </li>
        `;
    });
    if (total > 3) {
        html += `<li style="color: #888; font-size: 12px; justify-content: center;">و ${formatNumber(total - 3)} کار دیگر...</li>`;
    }
    html += '</ul>';

    tasksSummary.innerHTML = html;
}

// ===== خلاصه هزینه‌ها =====
function renderExpensesSummary() {
    const todayExpenses = expenses.filter(e => e.date === todayStr);

    if (todayExpenses.length === 0) {
        expensesSummary.innerHTML = '<div class="dashboard-empty">امروز هزینه‌ای ثبت نکردی</div>';
        return;
    }

    const total = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

    let html = `<div style="margin-bottom: 8px; font-weight: bold; color: #10b981; font-size: 16px;">
        ${formatNumber(total)} تومان
    </div>
    <div style="color: #888; font-size: 12px;">
        در ${formatNumber(todayExpenses.length)} تراکنش
    </div>`;

    expensesSummary.innerHTML = html;
}

// ===== خلاصه یادداشت‌ها =====
function renderNotesSummary() {
    const recentNotes = [...notes].sort((a, b) => b.id - a.id).slice(0, 2);

    if (recentNotes.length === 0) {
        notesSummary.innerHTML = '<div class="dashboard-empty">هنوز یادداشتی نساختی</div>';
        return;
    }

    let html = '';
    recentNotes.forEach(function(note) {
        html += `
            <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
                <div style="font-weight: bold; color: #4a6cf7; margin-bottom: 4px;">${escapeHtml(note.title)}</div>
                <div style="color: #666; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${escapeHtml(note.content)}
                </div>
            </div>
        `;
    });

    notesSummary.innerHTML = html;
}

// ===== جلوگیری از XSS =====
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// ===== شروع =====
initCommon();
updateGreeting();
renderTasksSummary();
renderExpensesSummary();
renderNotesSummary();