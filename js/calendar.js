// ===== داده‌ها =====
const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
const expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// ===== المان‌ها =====
const monthLabel = document.getElementById("monthLabel");
const calendarGrid = document.getElementById("calendarGrid");
const dayInfo = document.getElementById("dayInfo");

// ===== متغیرها =====
const today = new Date();
let currentYear = today.getFullYear();
let currentMonth = today.getMonth();
let selectedDate = null;

const weekdays = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];

// ===== نمایش ماه =====
function renderCalendar() {
    calendarGrid.innerHTML = "";

    const monthName = new Date(currentYear, currentMonth, 1).toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "long"
    });
    monthLabel.textContent = monthName;

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    let startOffset = (firstDay + 1) % 7;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // سرصفحه
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

// ===== فرمت تاریخ =====
function formatDate(year, month, day) {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
}

// ===== نمایش اطلاعات روز =====
function showDayInfo(dateStr) {
    const dayTasks = tasks.filter(t => t.date === dateStr);
    const dayExpenses = expenses.filter(e => e.date === dateStr);

    const persianDate = toPersianDate(dateStr);

    let html = `<div class="day-info-title">${persianDate}</div>`;

    if (dayTasks.length === 0 && dayExpenses.length === 0) {
        html += `<div class="day-info-empty">این روز خالی است</div>`;
        dayInfo.innerHTML = html;
        return;
    }

    // کارها
    if (dayTasks.length > 0) {
        html += `<div class="day-info-section">`;
        html += `<h4>📋 کارها (${dayTasks.length})</h4>`;
        html += `<ul class="day-info-list">`;

        dayTasks.forEach(function(task) {
            html += `
                <li class="${task.done ? "done" : ""}">
                    <span>${task.done ? "☑" : "☐"}</span>
                    <span>${task.text}</span>
                </li>
            `;
        });
        html += `</ul></div>`;
    }

    // هزینه‌ها
    if (dayExpenses.length > 0) {
        let total = 0;
        html += `<div class="day-info-section">`;
        html += `<h4>💰 هزینه‌ها (${dayExpenses.length})</h4>`;
        html += `<ul class="day-info-list">`;

        dayExpenses.forEach(function(exp) {
            total += exp.amount;
            html += `
                <li>
                    <span>💵</span>
                    <span>${exp.desc}</span>
                    <span style="margin-right:auto; color:#10b981; font-weight:bold;">${formatNumber(exp.amount)} تومان</span>
                </li>
            `;
        });
        html += `</ul>`;
        html += `<div class="day-info-total"><span>جمع:</span><span>${formatNumber(total)} تومان</span></div>`;
        html += `</div>`;
    }

    dayInfo.innerHTML = html;
}

// ===== تغییر ماه =====
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

// ===== شروع =====
initCommon();
renderCalendar();