// ═══════════════════════════════════════════════
// ═══════ مدیریت هزینه‌ها ═══════
// ═══════════════════════════════════════════════

let expenses = [];
let categories = [];
let budget = 0;
let activeDate = "";

let currentFilter = "today"; 
let filterCategory = "all";
let searchQuery = "";

let expensesChart = null;
let trendChart = null;

// تقویم شمسی
let shamsiYear = 1403;
let shamsiMonth = 1;
let selectedShamsiDate = "";
const shamsiMonths = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];

// ===== المان‌ها =====
const expenseDesc = document.getElementById("expenseDesc");
const expenseAmount = document.getElementById("expenseAmount");
const expenseCategory = document.getElementById("expenseCategory");
const expenseDate = document.getElementById("expenseDate");
const addExpenseBtn = document.getElementById("addExpenseBtn");
const expenseList = document.getElementById("expenseList");
const expenseTotal = document.getElementById("expenseTotal");
const activeFilterBadge = document.getElementById("activeFilterBadge");

const dayPrefixEl = document.getElementById("dayPrefix");
const dateLabelEl = document.getElementById("dateLabel");
const prevDayBtn = document.getElementById("prevDayBtn");
const nextDayBtn = document.getElementById("nextDayBtn");

const budgetModal = document.getElementById("budgetModal");
const closeBudgetBtn = document.getElementById("closeBudgetBtn");
const cancelBudgetBtn = document.getElementById("cancelBudgetBtn");
const saveBudgetBtn = document.getElementById("saveBudgetBtn");
const budgetInput = document.getElementById("budgetInput");
const budgetAmountEl = document.getElementById("budgetAmount");
const budgetProgressFill = document.getElementById("budgetProgressFill");
const budgetStatus = document.getElementById("budgetStatus");

const addExpenseModal = document.getElementById("addExpenseModal");
const openAddExpenseBtn = document.getElementById("openAddExpense");
const closeAddExpenseBtn = document.getElementById("closeAddExpense");
const editBudgetBtn = document.getElementById("editBudgetBtn");

// فیلتر
const filterModal = document.getElementById("filterModal");
const openFilterBtn = document.getElementById("openFilterBtn");
const closeFilterBtn = document.getElementById("closeFilterBtn");
const searchInput = document.getElementById("searchExpense");
const filterCategorySelect = document.getElementById("filterCategory");
const filterChips = document.querySelectorAll(".filter-chip");

// دسته‌بندی‌ها
const categoriesModal = document.getElementById("categoriesModal");
const manageCategoriesBtn = document.getElementById("manageCategoriesBtn");
const closeCategoriesBtn = document.getElementById("closeCategoriesBtn");
const newCategoryInput = document.getElementById("newCategoryInput");
const addCategoryBtn = document.getElementById("addCategoryBtn");
const categoryList = document.getElementById("categoryList");

// آمار و مقایسه
const statsModal = document.getElementById("statsModal");
const openStatsBtn = document.getElementById("openStatsBtn");
const closeStatsBtn = document.getElementById("closeStatsBtn");
const compareModal = document.getElementById("compareModal");
const openCompareBtn = document.getElementById("openCompareBtn");
const closeCompareBtn = document.getElementById("closeCompareBtn");

// ===== ذخیره و بازیابی =====
function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
    if (typeof checkAchievements === 'function') setTimeout(checkAchievements, 100);
}

function saveCategories() {
    localStorage.setItem("expenseCategories", JSON.stringify(categories));
}

function loadData() {
    expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    budget = Number(localStorage.getItem("budget")) || 0;
    
    const savedCats = JSON.parse(localStorage.getItem("expenseCategories"));
    if (savedCats && savedCats.length > 0) {
        categories = savedCats;
    } else {
        categories = ["غذا", "حمل و نقل", "خرید", "قبوض", "سلامت", "سرگرمی", "سایر"];
    }
}

// ===== تاریخ =====
function updateDateLabel() {
    const today = getTodayString();

    if (activeDate === today) dayPrefixEl.textContent = "امروز";
    else if (activeDate === addDays(today, -1)) dayPrefixEl.textContent = "دیروز";
    else if (activeDate === addDays(today, 1)) dayPrefixEl.textContent = "فردا";
    else dayPrefixEl.textContent = "تاریخ";

    const persianDate = new Date(activeDate + "T00:00:00").toLocaleDateString("fa-IR", {
        weekday: "long", month: "long", day: "numeric"
    });
    dateLabelEl.textContent = persianDate;
}

// ===== کمک‌کننده‌ها =====
function formatInputNumber(value) {
    const digits = String(value).replace(/\D/g, "");
    if (digits === "") return "";
    return Number(digits).toLocaleString("en-US");
}

function cleanNumber(value) {
    return Number(String(value).replace(/,/g, ""));
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function getCategoryEmoji(cat) {
    const map = { "غذا": "🍔", "حمل و نقل": "🚕", "خرید": "🛍️", "قبوض": "📄", "سلامت": "💊", "سرگرمی": "🎮", "سایر": "📦" };
    return map[cat] || "📦";
}

function toPersianShortDate(dateStr) {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("fa-IR", { month: "short", day: "numeric" });
}

// ===== فیلتر اصلی (برای صفحه) =====
function getFilteredExpenses() {
    const today = getTodayString();
    const now = new Date();
    let filtered = [...expenses];

    if (currentFilter === "today" && activeDate) {
        filtered = filtered.filter(e => e.date === activeDate);
    } else if (currentFilter === "week") {
        const weekAgo = addDays(today, -7);
        filtered = filtered.filter(e => e.date >= weekAgo && e.date <= today);
    } else if (currentFilter === "month") {
        const year = now.getFullYear(); const month = now.getMonth();
        filtered = filtered.filter(e => {
            const d = new Date(e.date + "T00:00:00");
            return d.getFullYear() === year && d.getMonth() === month;
        });
    }

    if (filterCategory !== "all") {
        filtered = filtered.filter(e => e.category === filterCategory);
    }

    if (searchQuery.trim() !== "") {
        const q = searchQuery.trim().toLowerCase();
        filtered = filtered.filter(e => e.desc.toLowerCase().includes(q) || (e.category && e.category.toLowerCase().includes(q)));
    }

    return filtered.sort((a, b) => b.date.localeCompare(a.date));
}

// ===== فیلتر زنده (برای مودال) =====
function liveFilter() {
    const tempSearch = searchInput.value;
    const tempCategory = filterCategorySelect.value;
    let tempFilter = "today";
    filterChips.forEach(c => {
        if (c.classList.contains("active")) tempFilter = c.dataset.filter;
    });

    const today = getTodayString();
    const now = new Date();
    let tempFiltered = [...expenses];

    if (tempFilter === "today" && activeDate) {
        tempFiltered = tempFiltered.filter(e => e.date === activeDate);
    } else if (tempFilter === "week") {
        const weekAgo = addDays(today, -7);
        tempFiltered = tempFiltered.filter(e => e.date >= weekAgo && e.date <= today);
    } else if (tempFilter === "month") {
        const year = now.getFullYear(); const month = now.getMonth();
        tempFiltered = tempFiltered.filter(e => {
            const d = new Date(e.date + "T00:00:00");
            return d.getFullYear() === year && d.getMonth() === month;
        });
    }

    if (tempCategory !== "all") {
        tempFiltered = tempFiltered.filter(e => e.category === tempCategory);
    }

    if (tempSearch.trim() !== "") {
        const q = tempSearch.trim().toLowerCase();
        tempFiltered = tempFiltered.filter(e => e.desc.toLowerCase().includes(q) || (e.category && e.category.toLowerCase().includes(q)));
    }

    tempFiltered.sort((a, b) => b.date.localeCompare(a.date));

    // نمایش نتایج
    const resultList = document.getElementById("filterResultList");
    const resultCount = document.getElementById("filterResultCount");
    const resultTotal = document.getElementById("filterResultTotal");

    resultList.innerHTML = "";
    resultCount.textContent = formatNumber(tempFiltered.length);
    resultTotal.textContent = formatNumber(tempFiltered.reduce((s, e) => s + e.amount, 0)) + " ریال";

    if (tempFiltered.length === 0) {
        resultList.innerHTML = '<li class="res-empty">هزینه‌ای با این فیلتر پیدا نشد</li>';
    } else {
        tempFiltered.forEach(expense => {
            const li = document.createElement("li");
            li.innerHTML = `
                <span class="res-desc">${getCategoryEmoji(expense.category)} ${escapeHtml(expense.desc)}</span>
                <span class="res-amount">${formatNumber(expense.amount)}</span>
            `;
            resultList.appendChild(li);
        });
    }
}

// ===== نمایش لیست صفحه اصلی =====
function showExpenses() {
    const filtered = getFilteredExpenses();
    expenseList.innerHTML = "";

    if (currentFilter !== "today" || filterCategory !== "all" || searchQuery.trim() !== "") {
        let parts = [];
        if (currentFilter === "week") parts.push("این هفته");
        if (currentFilter === "month") parts.push("این ماه");
        if (currentFilter === "all") parts.push("همه زمان‌ها");
        if (filterCategory !== "all") parts.push(filterCategory);
        if (searchQuery.trim() !== "") parts.push(`"${searchQuery}"`);
        
        activeFilterBadge.style.display = "block";
        activeFilterBadge.querySelector("span").textContent = "فیلتر فعال: " + parts.join(" | ");
    } else {
        activeFilterBadge.style.display = "none";
    }

    if (filtered.length === 0) {
        expenseList.innerHTML = '<li style="text-align:center; color:#aaa; padding:25px; background:none !important; border:none !important;">هزینه‌ای پیدا نشد</li>';
    } else {
        filtered.forEach(function(expense) {
            const index = expenses.indexOf(expense);
            const catEmoji = getCategoryEmoji(expense.category);
            const li = document.createElement("li");
            li.innerHTML = `
                <div style="flex:1; text-align:right; display:flex; align-items:center; gap:10px;">
                    <span style="font-size:18px;">${catEmoji}</span>
                    <div>
                        <div class="expense-desc" style="font-weight:600;">${escapeHtml(expense.desc)}</div>
                        <div style="font-size:11px; color:#86868b; margin-top:2px;">${expense.category || ""} • ${toPersianShortDate(expense.date)}</div>
                    </div>
                </div>
                <span class="expense-amount" style="margin-left:10px;">${formatNumber(expense.amount)} ریال</span>
                <button class="expense-del" onclick="deleteExpense(${index})">✕</button>
            `;
            expenseList.appendChild(li);
        });
    }

    const total = filtered.reduce((sum, e) => sum + e.amount, 0);
    expenseTotal.textContent = formatNumber(total) + " ریال";

    updateBudgetUI();
    updateMonthStats();
    updateStats();
    updateCharts();
}

// ===== ثبت و حذف =====
function openAddExpenseModal() {
    addExpenseModal.classList.add("active");
    expenseDesc.value = ""; 
    expenseAmount.value = ""; 
    
    expenseCategory.innerHTML = "";
    categories.forEach(cat => {
        expenseCategory.innerHTML += `<option value="${cat}">${getCategoryEmoji(cat)} ${cat}</option>`;
    });
    
    const persianToday = new Date(activeDate + "T00:00:00").toLocaleDateString("fa-IR-u-nu-latn");
    const parts = persianToday.split("/");
    if (parts.length === 3) {
        shamsiYear = Number(parts[0]);
        shamsiMonth = Number(parts[1]);
        selectedShamsiDate = parts.map(p => p.padStart(2, "0")).join("/");
    }
    document.getElementById("expenseDate").value = activeDate;
    document.getElementById("shamsiDateText").textContent = toPersianShortDate(activeDate);
    document.getElementById("shamsiCalendar").style.display = "none";
    
    expenseDesc.focus();
}

function closeAddExpenseModal() { addExpenseModal.classList.remove("active"); }

function addExpense() {
    const desc = expenseDesc.value.trim();
    const amount = cleanNumber(expenseAmount.value);
    const category = expenseCategory.value;
    const date = expenseDate.value || activeDate || getTodayString();

    if (desc === "") { alert("لطفاً توضیح هزینه را بنویس"); return; }
    if (!amount || amount <= 0) { alert("لطفاً مبلغ معتبر وارد کن"); return; }

    expenses.push({ desc, amount, category, date });
    saveExpenses();
    showExpenses();
    closeAddExpenseModal();
}

window.deleteExpense = function(index) {
    if (!confirm("این هزینه حذف بشه؟")) return;
    expenses.splice(index, 1);
    saveExpenses();
    showExpenses();
};

// ===== دسته‌بندی‌ها =====
function openCategoriesModal() {
    categoriesModal.classList.add("active");
    renderCategoryList();
}

function renderCategoryList() {
    categoryList.innerHTML = "";
    categories.forEach((cat, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${getCategoryEmoji(cat)} ${cat}</span>
            <button onclick="deleteCategory(${index})" style="background:none; border:none; color:#ff3b30; cursor:pointer; font-size:16px;">✕</button>
        `;
        categoryList.appendChild(li);
    });
}

function addNewCategory() {
    const name = newCategoryInput.value.trim();
    if (name === "") return;
    if (categories.includes(name)) { alert("این دسته قبلاً وجود داره!"); return; }
    
    categories.push(name);
    saveCategories();
    renderCategoryList();
    newCategoryInput.value = "";
    updateCategorySelects();
}

window.deleteCategory = function(index) {
    const catName = categories[index];
    const hasExpense = expenses.some(e => e.category === catName);
    if (hasExpense) {
        alert("نمی‌تونی این دسته رو حذف کنی چون هزینه‌هایی با این دسته ثبت شده!");
        return;
    }
    if (!confirm("این دسته حذف بشه؟")) return;
    
    categories.splice(index, 1);
    saveCategories();
    renderCategoryList();
    updateCategorySelects();
};

function updateCategorySelects() {
    expenseCategory.innerHTML = "";
    categories.forEach(cat => {
        expenseCategory.innerHTML += `<option value="${cat}">${getCategoryEmoji(cat)} ${cat}</option>`;
    });

    filterCategorySelect.innerHTML = '<option value="all">همه دسته‌ها</option>';
    categories.forEach(cat => {
        filterCategorySelect.innerHTML += `<option value="${cat}">${getCategoryEmoji(cat)} ${cat}</option>`;
    });
}

// ===== بودجه =====
function updateBudgetUI() {
    if (!budgetAmountEl) return;
    const now = new Date();
    const monthExpenses = expenses.filter(e => {
        const d = new Date(e.date + "T00:00:00");
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
    const spent = monthExpenses.reduce((s, e) => s + e.amount, 0);
    budgetAmountEl.textContent = formatNumber(budget) + " ریال";

    if (budget <= 0) {
        budgetProgressFill.style.width = "0%";
        budgetProgressFill.className = "budget-bar-fill";
        budgetStatus.textContent = "بودجه‌ای تنظیم نشده — روی ✎ بزن";
        budgetStatus.style.color = "#888";
        return;
    }
    const percent = Math.min((spent / budget) * 100, 100);
    budgetProgressFill.style.width = percent + "%";
    budgetProgressFill.className = "budget-bar-fill";
    const remaining = budget - spent;

    if (spent > budget) {
        budgetProgressFill.classList.add("danger");
        budgetStatus.textContent = `⚠️ ${formatNumber(Math.abs(remaining))} ریال بیش از بودجه!`;
        budgetStatus.style.color = "#ff3b30";
    } else if (percent >= 80) {
        budgetProgressFill.classList.add("warning");
        budgetStatus.textContent = `⏰ ${formatNumber(remaining)} ریال باقی مونده`;
        budgetStatus.style.color = "#ff9500";
    } else {
        budgetStatus.textContent = `✅ ${formatNumber(remaining)} ریال باقی مونده`;
        budgetStatus.style.color = "#34c759";
    }
}

function openBudgetModal() {
    budgetInput.value = budget > 0 ? budget.toLocaleString("en-US") : "";
    budgetModal.classList.add("active");
    budgetInput.focus();
}

function closeBudgetModal() { budgetModal.classList.remove("active"); }

function saveBudgetHandler() {
    const value = cleanNumber(budgetInput.value);
    if (isNaN(value) || value < 0) { alert("مبلغ معتبر وارد کن"); return; }
    budget = value;
    localStorage.setItem("budget", String(budget));
    updateBudgetUI();
    closeBudgetModal();
    if (typeof checkAchievements === 'function') checkAchievements();
}

// ===== آمار ماه =====
function updateMonthStats() {
    const now = new Date();
    const currentMonth = now.getMonth(); const currentYear = now.getFullYear();
    let prevMonth = currentMonth - 1; let prevYear = currentYear;
    if (prevMonth < 0) { prevMonth = 11; prevYear--; }

    const monthExpenses = expenses.filter(e => {
        const d = new Date(e.date + "T00:00:00");
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
    const prevMonthExpenses = expenses.filter(e => {
        const d = new Date(e.date + "T00:00:00");
        return d.getFullYear() === prevYear && d.getMonth() === prevMonth;
    });

    const total = monthExpenses.reduce((s, e) => s + e.amount, 0);
    const prevTotal = prevMonthExpenses.reduce((s, e) => s + e.amount, 0);

    document.getElementById("currentMonthLabel").textContent = `این ماه (${now.toLocaleDateString("fa-IR", { month: "long" })}):`;
    document.getElementById("prevMonthLabel").textContent = `ماه قبل (${new Date(prevYear, prevMonth, 1).toLocaleDateString("fa-IR", { month: "long" })}):`;
    document.getElementById("currentMonthTotal").textContent = formatNumber(total) + " ریال";
    document.getElementById("prevMonthTotal").textContent = formatNumber(prevTotal) + " ریال";

    const compareEl = document.getElementById("compareResult");
    compareEl.className = "compare-badge";

    if (prevTotal === 0 && total === 0) {
        compareEl.textContent = "هزینه‌ای در این دو ماه ثبت نشده";
        compareEl.classList.add("same");
    } else if (prevTotal === 0) {
        compareEl.textContent = "📊 ماه قبل هزینه‌ای نبود";
        compareEl.classList.add("same");
    } else {
        const diff = Math.round(((total - prevTotal) / prevTotal) * 100);
        if (diff > 0) { compareEl.textContent = `📈 ${formatNumber(diff)}٪ افزایش`; compareEl.classList.add("increase"); }
        else if (diff < 0) { compareEl.textContent = `📉 ${formatNumber(Math.abs(diff))}٪ کاهش`; compareEl.classList.add("decrease"); }
        else { compareEl.textContent = "➖ برابر با ماه قبل"; compareEl.classList.add("same"); }
    }
}

// ===== آمار پیشرفته =====
function updateStats() {
    const filtered = getFilteredExpenses();
    document.getElementById("statCount").textContent = formatNumber(filtered.length);
    const biggest = filtered.length > 0 ? Math.max(...filtered.map(e => e.amount)) : 0;
    document.getElementById("statBiggest").textContent = formatNumber(biggest);
    
    if (filtered.length === 0) {
        document.getElementById("statAvgDaily").textContent = "۰";
    } else {
        const dates = new Set(filtered.map(e => e.date));
        const total = filtered.reduce((s, e) => s + e.amount, 0);
        document.getElementById("statAvgDaily").textContent = formatNumber(Math.round(total / dates.size));
    }
}

// ===== نمودارها =====
function updateCharts() {
    const pieCanvas = document.getElementById("expensesChart");
    const lineCanvas = document.getElementById("trendChart");
    
    if (!pieCanvas || typeof Chart === "undefined") return;
    if (expensesChart) { expensesChart.destroy(); expensesChart = null; }
    if (trendChart) { trendChart.destroy(); trendChart = null; }

    const filtered = getFilteredExpenses();
    const catTotals = {};
    filtered.forEach(e => { const cat = e.category || "سایر"; catTotals[cat] = (catTotals[cat] || 0) + e.amount; });
    const labels = Object.keys(catTotals);
    const data = Object.values(catTotals);
    const colors = ["#0071e3", "#34c759", "#ff9500", "#ff3b30", "#af52de", "#5ac8fa", "#ffcc00"];

    if (labels.length > 0) {
        expensesChart = new Chart(pieCanvas, {
            type: "doughnut",
            data: { labels: labels, datasets: [{ data: data, backgroundColor: colors.slice(0, labels.length), borderWidth: 2, borderColor: "#fff" }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { font: { family: "Vazirmatn", size: 11 }, padding: 12, usePointStyle: true } }, tooltip: { callbacks: { label: ctx => ctx.label + ": " + ctx.parsed.toLocaleString("fa-IR") + " ریال" }, bodyFont: { family: "Vazirmatn" } } } }
        });
    }

    if (!lineCanvas) return;
    const lineLabels = []; const lineData = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today); d.setDate(d.getDate() - i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        lineLabels.push(d.toLocaleDateString("fa-IR", { weekday: "short" }));
        lineData.push(expenses.filter(e => e.date === dateStr).reduce((s, e) => s + e.amount, 0));
    }

    const ctx = lineCanvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, 220);
    gradient.addColorStop(0, "rgba(0, 113, 227, 0.3)"); gradient.addColorStop(1, "rgba(0, 113, 227, 0.02)");

    trendChart = new Chart(lineCanvas, {
        type: "line",
        data: { labels: lineLabels, datasets: [{ label: "هزینه روزانه", data: lineData, borderColor: "#0071e3", backgroundColor: gradient, borderWidth: 3, fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: "#0071e3", pointBorderColor: "#fff", pointBorderWidth: 2 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.parsed.y.toLocaleString("fa-IR") + " ریال" }, bodyFont: { family: "Vazirmatn" } } }, scales: { y: { beginAtZero: true, ticks: { font: { family: "Vazirmatn", size: 10 }, callback: v => v >= 1000 ? (v/1000).toFixed(0) + "K" : v } }, x: { ticks: { font: { family: "Vazirmatn", size: 10 } } } } }
    });
}

// ===== تقویم شمسی =====
function initShamsiCalendar() {
    const shamsiDateBtn = document.getElementById("shamsiDateBtn");
    const shamsiCalendar = document.getElementById("shamsiCalendar");
    if (!shamsiDateBtn || !shamsiCalendar) return;

    shamsiDateBtn.addEventListener("click", function() {
        if (shamsiCalendar.style.display === "none") {
            shamsiCalendar.style.display = "block";
            renderShamsiCalendar();
        } else {
            shamsiCalendar.style.display = "none";
        }
    });
}

function renderShamsiCalendar() {
    const container = document.getElementById("shamsiCalendar");
    if (!container) return;

    const daysInMonth = getShamsiDaysInMonth(shamsiYear, shamsiMonth);
    const firstDayOfWeek = getShamsiFirstDayOfWeek(shamsiYear, shamsiMonth);

    let html = `
        <div class="shamsi-header">
            <button type="button" id="prevShamsiMonth">▶</button>
            <div class="shamsi-month-year">${shamsiMonths[shamsiMonth - 1]} ${shamsiYear}</div>
            <button type="button" id="nextShamsiMonth">◀</button>
        </div>
        <div class="shamsi-weekdays">
            <span>ش</span><span>ی</span><span>د</span><span>س</span><span>چ</span><span>پ</span><span>ج</span>
        </div>
        <div class="shamsi-days">
    `;

    for (let i = 0; i < firstDayOfWeek; i++) html += `<div class="shamsi-day empty"></div>`;

    for (let d = 1; d <= daysInMonth; d++) {
        const dStr = String(d).padStart(2, "0");
        const mStr = String(shamsiMonth).padStart(2, "0");
        const dateStr = `${shamsiYear}/${mStr}/${dStr}`;
        const isSelected = dateStr === selectedShamsiDate ? "selected" : "";
        html += `<button type="button" class="shamsi-day ${isSelected}" data-date="${dateStr}">${d}</button>`;
    }

    html += `</div>`;
    container.innerHTML = html;

    document.getElementById("prevShamsiMonth").addEventListener("click", function(e) {
        e.preventDefault();
        shamsiMonth--;
        if (shamsiMonth < 1) { shamsiMonth = 12; shamsiYear--; }
        renderShamsiCalendar();
    });
    document.getElementById("nextShamsiMonth").addEventListener("click", function(e) {
        e.preventDefault();
        shamsiMonth++;
        if (shamsiMonth > 12) { shamsiMonth = 1; shamsiYear++; }
        renderShamsiCalendar();
    });

    container.querySelectorAll(".shamsi-day:not(.empty)").forEach(function(btn) {
        btn.addEventListener("click", function(e) {
            e.preventDefault();
            selectedShamsiDate = this.dataset.date;
            const gregorian = shamsiToGregorian(selectedShamsiDate);
            document.getElementById("expenseDate").value = gregorian;
            const parts = selectedShamsiDate.split("/");
            const m = Number(parts[1]);
            const d = Number(parts[2]);
            document.getElementById("shamsiDateText").textContent = `${d} ${shamsiMonths[m - 1]} ${parts[0]}`;
            container.style.display = "none";
        });
    });
}

function getShamsiDaysInMonth(year, month) {
    if (month <= 6) return 31;
    if (month <= 11) return 30;
    return isLeapShamsiYear(year) ? 30 : 29;
}

function isLeapShamsiYear(year) {
    const leapYears = [1, 5, 9, 13, 17, 22, 26, 30];
    return leapYears.includes(year % 33);
}

function getShamsiFirstDayOfWeek(year, month) {
    const gregorian = shamsiToGregorian(`${year}/${String(month).padStart(2, "0")}/01`);
    const d = new Date(gregorian + "T00:00:00");
    let day = d.getDay();
    return (day + 1) % 7;
}

function shamsiToGregorian(shamsiStr) {
    if (!shamsiStr) return getTodayString();
    const parts = shamsiStr.split("/");
    if (parts.length !== 3) return getTodayString();
    
    const y = Number(parts[0]); const m = Number(parts[1]); const d = Number(parts[2]);
    let jy = y - 979; let jm = m - 1; let jd = d - 1;
    let j_day_no = 365 * jy + Math.floor(jy / 33) * 8 + Math.floor((jy % 33 + 3) / 4);
    for (let i = 0; i < jm; ++i) j_day_no += (i < 6) ? 31 : 30;
    j_day_no += jd;
    let g_day_no = j_day_no + 79;
    let gy = 1600 + 400 * Math.floor(g_day_no / 146097);
    g_day_no = g_day_no % 146097;
    let leap = true;
    if (g_day_no >= 36525) {
        g_day_no--; gy += 100 * Math.floor(g_day_no / 36524); g_day_no = g_day_no % 36524;
        if (g_day_no >= 365) g_day_no++; else leap = false;
    }
    gy += 4 * Math.floor(g_day_no / 1461); g_day_no %= 1461;
    if (g_day_no >= 366) { leap = false; g_day_no--; gy += Math.floor(g_day_no / 365); g_day_no = g_day_no % 365; }
    let gd = g_day_no + 1; let gm = 0;
    let g_days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    for (let i = 0; i < 12; i++) {
        let days = (i === 1 && leap) ? 29 : g_days_in_month[i];
        if (gd <= days) { gm = i + 1; break; }
        gd -= days;
    }
    return `${gy}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`;
}

// ===== شروع =====
document.addEventListener("DOMContentLoaded", function() {
    loadData();
    activeDate = getTodayString();
    
    if (typeof initThemeAndSidebar === 'function') initThemeAndSidebar();

   

    updateCategorySelects();
    
    updateDateLabel();
    showExpenses();
    initShamsiCalendar();

    // دکمه‌های تاریخ
    prevDayBtn.addEventListener("click", function() {
        activeDate = addDays(activeDate, -1);
        updateDateLabel();
        if (currentFilter !== "today") {
            currentFilter = "today";
            filterChips.forEach(c => c.classList.toggle("active", c.dataset.filter === "today"));
        }
        showExpenses();
    });
    nextDayBtn.addEventListener("click", function() {
        activeDate = addDays(activeDate, 1);
        updateDateLabel();
        if (currentFilter !== "today") {
            currentFilter = "today";
            filterChips.forEach(c => c.classList.toggle("active", c.dataset.filter === "today"));
        }
        showExpenses();
    });

    // مودال ثبت هزینه
    openAddExpenseBtn.addEventListener("click", openAddExpenseModal);
    closeAddExpenseBtn.addEventListener("click", closeAddExpenseModal);
    addExpenseModal.addEventListener("click", e => { if (e.target === addExpenseModal) closeAddExpenseModal(); });
    addExpenseBtn.addEventListener("click", addExpense);
    expenseAmount.addEventListener("input", function() { this.value = formatInputNumber(this.value); });
    expenseDesc.addEventListener("keypress", e => { if (e.key === "Enter") addExpense(); });

    // مدیریت دسته‌بندی‌ها
    manageCategoriesBtn.addEventListener("click", openCategoriesModal);
    closeCategoriesBtn.addEventListener("click", () => categoriesModal.classList.remove("active"));
    addCategoryBtn.addEventListener("click", addNewCategory);
    newCategoryInput.addEventListener("keypress", e => { if (e.key === "Enter") addNewCategory(); });
    categoriesModal.addEventListener("click", e => { if (e.target === categoriesModal) categoriesModal.classList.remove("active"); });

    // ===== مودال فیلتر (زنده) =====
    openFilterBtn.addEventListener("click", function() {
        searchInput.value = searchQuery;
        filterCategorySelect.value = filterCategory;
        filterChips.forEach(c => {
            c.classList.toggle("active", c.dataset.filter === currentFilter);
        });
        
        filterModal.classList.add("active");
        liveFilter();
    });

    closeFilterBtn.addEventListener("click", function() {
        // ذخیره فیلترهای نهایی و اعمال روی صفحه اصلی
        searchQuery = searchInput.value;
        filterCategory = filterCategorySelect.value;
        filterChips.forEach(c => {
            if (c.classList.contains("active")) currentFilter = c.dataset.filter;
        });
        
        showExpenses();
        filterModal.classList.remove("active");
    });

    filterModal.addEventListener("click", e => { 
        if (e.target === filterModal) {
            closeFilterBtn.click(); // همون رفتار دکمه بستن
        }
    });

    // رویدادهای زنده
    searchInput.addEventListener("input", liveFilter);
    filterCategorySelect.addEventListener("change", liveFilter);
    filterChips.forEach(chip => {
        chip.addEventListener("click", function() {
            filterChips.forEach(c => c.classList.remove("active"));
            this.classList.add("active");
            liveFilter();
        });
    });

    // مودال بودجه
    editBudgetBtn.addEventListener("click", openBudgetModal);
    closeBudgetBtn.addEventListener("click", closeBudgetModal);
    cancelBudgetBtn.addEventListener("click", closeBudgetModal);
    saveBudgetBtn.addEventListener("click", saveBudgetHandler);
    budgetModal.addEventListener("click", e => { if (e.target === budgetModal) closeBudgetModal(); });
    budgetInput.addEventListener("input", function() { this.value = formatInputNumber(this.value); });

    // مودال آمار و مقایسه
    openStatsBtn.addEventListener("click", function() { statsModal.classList.add("active"); setTimeout(updateCharts, 100); });
    closeStatsBtn.addEventListener("click", () => statsModal.classList.remove("active"));
    statsModal.addEventListener("click", e => { if (e.target === statsModal) statsModal.classList.remove("active"); });

    openCompareBtn.addEventListener("click", () => compareModal.classList.add("active"));
    closeCompareBtn.addEventListener("click", () => compareModal.classList.remove("active"));
    compareModal.addEventListener("click", e => { if (e.target === compareModal) compareModal.classList.remove("active"); });
});