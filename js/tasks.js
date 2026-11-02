    // ===== داده‌ها =====
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let specificDates = [];
let activeDate = getTodayString();

// ===== المان‌ها =====
const taskInput = document.getElementById("taskInput");
const timeInput = document.getElementById("timeInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const counter = document.getElementById("counter");
const dateLabel = document.getElementById("dateLabel");
const prevDayBtn = document.getElementById("prevDayBtn");
const nextDayBtn = document.getElementById("nextDayBtn");

const todayStats = document.getElementById("todayStats");
const todayProgress = document.getElementById("todayProgress");
const streakStats = document.getElementById("streakStats");
const totalStats = document.getElementById("totalStats");

const reportBtn = document.getElementById("reportBtn");
const reportModal = document.getElementById("reportModal");
const closeReportBtn = document.getElementById("closeReportBtn");
const reportBody = document.getElementById("reportBody");

const recurringBtn = document.getElementById("recurringBtn");
const recurringModal = document.getElementById("recurringModal");
const closeRecurringBtn = document.getElementById("closeRecurringBtn");
const recCancelBtn = document.getElementById("recCancelBtn");
const recSubmitBtn = document.getElementById("recSubmitBtn");
const recTitle = document.getElementById("recTitle");
const recTime = document.getElementById("recTime");
const recTypeRadios = document.querySelectorAll('input[name="recType"]');
const recRangeSection = document.getElementById("recRangeSection");
const recWeekdaysSection = document.getElementById("recWeekdaysSection");
const recSpecificSection = document.getElementById("recSpecificSection");
const recStartDate = document.getElementById("recStartDate");
const recEndDate = document.getElementById("recEndDate");
const recWeekStart = document.getElementById("recWeekStart");
const recWeekEnd = document.getElementById("recWeekEnd");
const recSpecificDate = document.getElementById("recSpecificDate");
const addSpecificDateBtn = document.getElementById("addSpecificDateBtn");
const specificDatesList = document.getElementById("specificDatesList");

// ===== نمایش تاریخ =====
function updateDateLabel() {
    const today = getTodayString();
    let prefix = "";

    if (activeDate === today) prefix = "امروز — ";
    else if (activeDate === addDays(today, -1)) prefix = "دیروز — ";
    else if (activeDate === addDays(today, 1)) prefix = "فردا — ";

    dateLabel.textContent = prefix + toPersianDate(activeDate);
}

// ===== نمایش کارها =====
function showTasks() {
    const dayTasks = tasks.filter(t => t.date === activeDate);

    taskList.innerHTML = "";

    if (dayTasks.length === 0) {
        taskList.innerHTML = "<li style='text-align:center; color:#aaa; padding:20px;'>برای این روز کاری نیست</li>";
        counter.textContent = "۰ کار";
        updateStats();
        return;
    }

    dayTasks.forEach(function(task) {
        const index = tasks.indexOf(task);
        const li = document.createElement("li");
        li.className = "task-item";

        if (task.done) li.classList.add("done");

        li.innerHTML = `
            <input type="checkbox" ${task.done ? "checked" : ""} onchange="toggleTask(${index})">
            <div class="task-body">
                <span class="task-text">${task.text}</span>
                ${task.time ? `<span class="task-meta">⏰ ${task.time}</span>` : ""}
            </div>
            <button class="delete-btn" onclick="deleteTask(${index})">✕</button>
        `;

        taskList.appendChild(li);
    });

    const doneCount = dayTasks.filter(t => t.done).length;
    counter.textContent = `${doneCount} از ${dayTasks.length} انجام شده`;

    updateStats();
}

// ===== آمار =====
function updateStats() {
    const today = getTodayString();
    const todayTasks = tasks.filter(t => t.date === today);
    const todayDone = todayTasks.filter(t => t.done).length;
    const todayTotal = todayTasks.length;
    const todayPercent = todayTotal === 0 ? 0 : Math.round((todayDone / todayTotal) * 100);

    todayStats.textContent = `${todayDone} از ${todayTotal} انجام شده (${todayPercent}٪)`;
    todayProgress.style.width = todayPercent + "%";

    const streak = calculateStreak();

    if (streak === 0) streakStats.textContent = "شروع کن! 💪";
    else if (streak === 1) streakStats.textContent = "۱ روز";
    else streakStats.textContent = `${streak} روز`;

    const totalAll = tasks.length;
    const doneAll = tasks.filter(t => t.done).length;
    totalStats.textContent = `${doneAll} از ${totalAll} کار`;
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

// ===== عملیات کارها =====
function addTask() {
    const text = taskInput.value.trim();

    if (text === "") {
        alert("لطفاً یک کار بنویس");
        return;
    }

    tasks.push({
        text: text,
        done: false,
        date: activeDate,
        time: timeInput.value
    });

    taskInput.value = "";
    timeInput.value = "";

    saveTasks();
    showTasks();
}

function toggleTask(index) {
    tasks[index].done = !tasks[index].done;
    saveTasks();
    showTasks();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    showTasks();
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ===== تغییر روز =====
prevDayBtn.addEventListener("click", function() {
    activeDate = addDays(activeDate, -1);
    updateDateLabel();
    showTasks();
});

nextDayBtn.addEventListener("click", function() {
    activeDate = addDays(activeDate, 1);
    updateDateLabel();
    showTasks();
});

// ===== گزارش ماهانه =====
function showMonthlyReport() {
    const refDate = new Date(activeDate + "T00:00:00");
    const year = refDate.getFullYear();
    const month = refDate.getMonth();

    const monthTasks = tasks.filter(function(task) {
        const t = new Date(task.date + "T00:00:00");
        return t.getFullYear() === year && t.getMonth() === month;
    });

    const total = monthTasks.length;
    const done = monthTasks.filter(t => t.done).length;
    const pending = total - done;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);

    const monthName = refDate.toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "long"
    });

    let html = `<h3 style="margin-top:0; text-align:center; color:#4a6cf7;">${monthName}</h3>`;

    if (total === 0) {
        html += `<p class="empty-report">این ماه هیچ کاری ثبت نشده</p>`;
        reportBody.innerHTML = html;
        return;
    }

    html += `
        <div class="report-stats">
            <div class="stat-box"><div class="number">${total}</div><div class="label">کل کارها</div></div>
            <div class="stat-box done"><div class="number">${done}</div><div class="label">انجام‌شده</div></div>
            <div class="stat-box pending"><div class="number">${pending}</div><div class="label">باقی‌مانده</div></div>
            <div class="stat-box"><div class="number">${percent}%</div><div class="label">درصد انجام</div></div>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width: ${percent}%"></div></div>
        <p class="progress-text">${done} از ${total} کار انجام شده</p>
    `;

    const dayCounts = {};
    monthTasks.forEach(function(task) {
        if (!dayCounts[task.date]) dayCounts[task.date] = { total: 0, done: 0 };
        dayCounts[task.date].total++;
        if (task.done) dayCounts[task.date].done++;
    });

    html += `<div class="month-section"><h3>روزهای فعال</h3>`;
    Object.keys(dayCounts).sort().forEach(function(date) {
        const c = dayCounts[date];
        html += `<div class="day-row"><span class="day-date">${toPersianDate(date)}</span><span class="day-count">${c.done} از ${c.total}</span></div>`;
    });
    html += `</div>`;

    reportBody.innerHTML = html;
}

reportBtn.addEventListener("click", function() {
    showMonthlyReport();
    reportModal.classList.add("active");
});

closeReportBtn.addEventListener("click", function() {
    reportModal.classList.remove("active");
});

reportModal.addEventListener("click", function(e) {
    if (e.target === reportModal) reportModal.classList.remove("active");
});

// ===== کار تکراری =====
function openRecurringModal() {
    recTitle.value = "";
    recTime.value = "";
    recStartDate.value = "";
    recEndDate.value = "";
    recWeekStart.value = "";
    recWeekEnd.value = "";
    recSpecificDate.value = "";
    specificDates = [];
    renderSpecificDates();

    recTypeRadios.forEach(r => r.checked = false);
    recTypeRadios[0].checked = true;
    showRecSection("range");

    document.querySelectorAll(".weekday").forEach(cb => cb.checked = false);

    recurringModal.classList.add("active");
}

function showRecSection(type) {
    recRangeSection.style.display = "none";
    recWeekdaysSection.style.display = "none";
    recSpecificSection.style.display = "none";

    if (type === "range") recRangeSection.style.display = "block";
    else if (type === "weekdays") recWeekdaysSection.style.display = "block";
    else if (type === "specific") recSpecificSection.style.display = "block";
}

function renderSpecificDates() {
    specificDatesList.innerHTML = "";

    if (specificDates.length === 0) {
        specificDatesList.innerHTML = '<li style="text-align:center; color:#aaa; background:none;">هنوز روزی اضافه نشده</li>';
        return;
    }

    specificDates.forEach(function(date, index) {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${toPersianDate(date)}</span>
            <button class="remove-date-btn" onclick="removeSpecificDate(${index})">✕</button>
        `;
        specificDatesList.appendChild(li);
    });
}

function removeSpecificDate(index) {
    specificDates.splice(index, 1);
    renderSpecificDates();
}

function buildRecurringTasks() {
    const title = recTitle.value.trim();
    const time = recTime.value;

    if (title === "") {
        alert("لطفاً عنوان کار را بنویس");
        return;
    }

    let type = "";
    recTypeRadios.forEach(r => { if (r.checked) type = r.value; });

    let allDates = [];

    if (type === "range") {
        const start = recStartDate.value;
        const end = recEndDate.value;

        if (!start || !end) {
            alert("لطفاً تاریخ شروع و پایان را انتخاب کن");
            return;
        }
        if (start > end) {
            alert("تاریخ شروع باید قبل از پایان باشد");
            return;
        }

        let current = start;
        while (current <= end) {
            allDates.push(current);
            current = addDays(current, 1);
        }
    }
    else if (type === "weekdays") {
        const selectedWeekdays = [];
        document.querySelectorAll(".weekday").forEach(cb => {
            if (cb.checked) selectedWeekdays.push(Number(cb.value));
        });

        if (selectedWeekdays.length === 0) {
            alert("حداقل یک روز هفته را انتخاب کن");
            return;
        }

        const start = recWeekStart.value;
        const end = recWeekEnd.value;

        if (!start || !end) {
            alert("لطفاً تاریخ شروع و پایان را انتخاب کن");
            return;
        }
        if (start > end) {
            alert("تاریخ شروع باید قبل از پایان باشد");
            return;
        }

        let current = start;
        while (current <= end) {
            const dayOfWeek = new Date(current + "T00:00:00").getDay();
            if (selectedWeekdays.includes(dayOfWeek)) {
                allDates.push(current);
            }
            current = addDays(current, 1);
        }
    }
    else if (type === "specific") {
        if (specificDates.length === 0) {
            alert("حداقل یک روز اضافه کن");
            return;
        }
        allDates = [...specificDates];
    }

    if (allDates.length === 0) {
        alert("هیچ روزی برای ساخت کار پیدا نشد");
        return;
    }

    allDates.forEach(function(date) {
        tasks.push({
            text: title,
            done: false,
            date: date,
            time: time
        });
    });

    saveTasks();
    showTasks();
    recurringModal.classList.remove("active");
    alert(`${allDates.length} کار ساخته شد ✅`);
}

recurringBtn.addEventListener("click", openRecurringModal);

closeRecurringBtn.addEventListener("click", function() {
    recurringModal.classList.remove("active");
});

recCancelBtn.addEventListener("click", function() {
    recurringModal.classList.remove("active");
});

recurringModal.addEventListener("click", function(e) {
    if (e.target === recurringModal) recurringModal.classList.remove("active");
});

recTypeRadios.forEach(function(radio) {
    radio.addEventListener("change", function() {
        showRecSection(radio.value);
    });
});

addSpecificDateBtn.addEventListener("click", function() {
    const date = recSpecificDate.value;
    if (!date) {
        alert("لطفاً یک تاریخ انتخاب کن");
        return;
    }
    if (specificDates.includes(date)) {
        alert("این تاریخ قبلاً اضافه شده");
        return;
    }
    specificDates.push(date);
    specificDates.sort();
    renderSpecificDates();
    recSpecificDate.value = "";
});

recSubmitBtn.addEventListener("click", buildRecurringTasks);

// ===== اتصال دکمه افزودن =====
addBtn.addEventListener("click", addTask);

taskInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") addTask();
});

// ===== کشوی آمار =====
const statsToggle = document.getElementById("statsToggle");
const statsCard = statsToggle ? statsToggle.closest(".stats-card") : null;

if (statsToggle && statsCard) {
    if (localStorage.getItem("statsOpen") === "true") {
        statsCard.classList.add("open");
    }

    statsToggle.addEventListener("click", function() {
        statsCard.classList.toggle("open");
        if (statsCard.classList.contains("open")) {
            localStorage.setItem("statsOpen", "true");
        } else {
            localStorage.setItem("statsOpen", "false");
        }
    });
}

// ===== شروع =====
initCommon();
updateDateLabel();
showTasks();