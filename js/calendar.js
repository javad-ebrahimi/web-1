// ===== متغیرهای سراسری =====
let tasks = [];
let expenses = [];
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let selectedDate = null;

const weekdays = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];

// ===== المان‌ها =====
const monthLabel = document.getElementById("monthLabel");
const calendarGrid = document.getElementById("calendarGrid");
const dayInfo = document.getElementById("dayInfo");

// ===== توابع تقویم =====
function formatDate(year, month, day) {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
}

function renderCalendar() {
    calendarGrid.innerHTML = "";

    const monthName = new Date(currentYear, currentMonth, 1).toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "long"
    });
    
    monthLabel.textContent = monthName;
    monthLabel.className = "calendar-month-label"; 

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    let startOffset = (firstDay + 1) % 7;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // سرصفحه روزهای هفته
    const weekdaysRow = document.createElement("div");
    weekdaysRow.className = "calendar-weekdays";
    weekdaysRow.style.gridColumn = "1 / -1";
    weekdays.forEach(function(day) {
        const wd = document.createElement("div");
        wd.className = "calendar-weekday";
        wd.textContent = day;
        weekdaysRow.appendChild(wd);
    });
    calendarGrid.appendChild(weekdaysRow);

    // فضای خالی
    for (let i = 0; i < startOffset; i++) {
        const empty = document.createElement("button");
        empty.className = "calendar-day empty";
        empty.disabled = true;
        calendarGrid.appendChild(empty);
    }

    // روزها
    for (let day = 1; day <= daysInMonth; day++) {
        const btn = document.createElement("button");
        btn.className = "calendar-day";

        const dateStr = formatDate(currentYear, currentMonth, day);
        const dayNum = document.createElement("span");
        dayNum.textContent = day;
        btn.appendChild(dayNum);

        if (dateStr === getTodayString()) btn.classList.add("today");
        if (dateStr === selectedDate) btn.classList.add("selected");

        const dayTasks = tasks.filter(t => t.date === dateStr);
        const dayExpenses = expenses.filter(e => e.date === dateStr);

        if (dayTasks.length > 0 || dayExpenses.length > 0) {
            const dots = document.createElement("div");
            dots.className = "dot";
            if (dayTasks.length > 0) {
                const dot = document.createElement("span");
                dot.className = "dot-task";
                dots.appendChild(dot);
            }
            if (dayExpenses.length > 0) {
                const dot = document.createElement("span");
                dot.className = "dot-expense";
                dots.appendChild(dot);
            }
            btn.appendChild(dots);
        }

        btn.addEventListener("click", function() {
            selectedDate = dateStr;
            renderCalendar();
            showDayInfo(dateStr);
        });

        calendarGrid.appendChild(btn);
    }
}

function showDayInfo(dateStr) {
    const dayTasks = tasks.filter(t => t.date === dateStr);
    const dayExpenses = expenses.filter(e => e.date === dateStr);
    const persianDate = toPersianDate(dateStr);

    let html = `<div class="day-info-title">${persianDate}</div>`;

    if (dayTasks.length === 0 && dayExpenses.length === 0) {
        html += `<div style="text-align:center; color:#aaa; padding:20px;">این روز خالی است</div>`;
        dayInfo.innerHTML = html;
        return;
    }

    // کارها
    if (dayTasks.length > 0) {
        html += `<div style="margin-bottom: 15px;">`;
        html += `<h4 style="font-size: 13px; margin-bottom: 8px; color: #888;">📋 کارها (${dayTasks.length})</h4>`;
        html += `<ul class="day-info-list">`;
        dayTasks.forEach(function(task) {
            html += `<li class="${task.done ? 'done' : ''}">
                <span>${task.done ? "☑" : "☐"}</span>
                <span>${task.text}</span>
            </li>`;
        });
        html += `</ul></div>`;
    }

    // هزینه‌ها
    if (dayExpenses.length > 0) {
        let total = 0;
        html += `<div>`;
        html += `<h4 style="font-size: 13px; margin-bottom: 8px; color: #888;">💰 هزینه‌ها (${dayExpenses.length})</h4>`;
        html += `<ul class="day-info-list">`;
        dayExpenses.forEach(function(exp) {
            total += exp.amount;
            html += `<li>
                <span>💵</span>
                <span>${exp.desc}</span>
                <span class="expense-amount" style="margin-right:auto;">${formatNumber(exp.amount)} ریال</span>
            </li>`;
        });
        html += `</ul>`;
        html += `<div class="day-info-total"><span>جمع:</span><span>${formatNumber(total)} ریال</span></div>`;
        html += `</div>`;
    }

    dayInfo.innerHTML = html;
}

// ===== 🌟 شروع نهایی (بعد از لود کامل DOM) =====
document.addEventListener("DOMContentLoaded", function() {
    // ۱. خواندن داده‌ها
    tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    expenses = JSON.parse(localStorage.getItem("expenses")) || [];

    // ۲. اجرای تم
    if (typeof initCommon === 'function') initCommon();

    // ۳. نمایش اولیه تقویم
    renderCalendar();

    // ۴. اتصال دکمه‌های تغییر ماه
    document.getElementById("prevMonthBtn").addEventListener("click", function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    document.getElementById("nextMonthBtn").addEventListener("click", function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });
});