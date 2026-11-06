// ═══════════════════════════════════════════════
// ═══════ بخش هزینه‌ها — نسخه کامل ═══════
// ═══════════════════════════════════════════════

// ===== متغیرهای سراسری =====
let expenses = [];
let activeDate = "";
let budget = 0;
let expenseChart = null;

// ===== المان‌ها =====
const expenseDesc = document.getElementById("expenseDesc");
const expenseAmount = document.getElementById("expenseAmount");
const expenseCategory = document.getElementById("expenseCategory");
const addExpenseBtn = document.getElementById("addExpenseBtn");
const expenseList = document.getElementById("expenseList");
const expenseTotal = document.getElementById("expenseTotal");

const dayPrefixEl = document.getElementById("dayPrefix");
const dateLabelEl = document.getElementById("dateLabel");
const prevDayBtn = document.getElementById("prevDayBtn");
const nextDayBtn = document.getElementById("nextDayBtn");

const monthTotal = document.getElementById("monthTotal");
const monthCount = document.getElementById("monthCount");

// بودجه
const editBudgetBtn = document.getElementById("editBudgetBtn");
const budgetModal = document.getElementById("budgetModal");
const closeBudgetBtn = document.getElementById("closeBudgetBtn");
const cancelBudgetBtn = document.getElementById("cancelBudgetBtn");
const saveBudgetBtn = document.getElementById("saveBudgetBtn");
const budgetInput = document.getElementById("budgetInput");
const budgetAmountEl = document.getElementById("budgetAmount");
const budgetProgressFill = document.getElementById("budgetProgressFill");
const budgetStatus = document.getElementById("budgetStatus");

// مودال افزودن
const addExpenseModal = document.getElementById("addExpenseModal");
const openAddExpenseBtn = document.getElementById("openAddExpense");
const closeAddExpenseBtn = document.getElementById("closeAddExpense");

// ═══════════════════════════════════════════════
// ═══════ توابع تاریخ ═══════
// ═══════════════════════════════════════════════

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

// ═══════════════════════════════════════════════
// ═══════ توابع عددی ═══════
// ═══════════════════════════════════════════════

function formatInputNumber(value) {
    const digits = String(value).replace(/\D/g, "");
    if (digits === "") return "";
    return Number(digits).toLocaleString("en-US");
}

function cleanNumber(value) {
    return Number(String(value).replace(/,/g, ""));
}

// ═══════════════════════════════════════════════
// ═══════ ذخیره و بازیابی ═══════
// ═══════════════════════════════════════════════

function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

function saveBudget() {
    localStorage.setItem("budget", String(budget));
}

function loadBudget() {
    budget = Number(localStorage.getItem("budget")) || 0;
}

// ═══════════════════════════════════════════════
// ═══════ مودال افزودن ═══════
// ═══════════════════════════════════════════════

function openAddExpenseModal() {
    addExpenseModal.classList.add("active");
    expenseDesc.value = "";
    expenseAmount.value = "";
    expenseCategory.value = "غذا";
    expenseDesc.focus();
}

function closeAddExpenseModal() {
    addExpenseModal.classList.remove("active");
}

// ═══════════════════════════════════════════════
// ═══════ افزودن و حذف هزینه ═══════
// ═══════════════════════════════════════════════

function addExpense() {
    const desc = expenseDesc.value.trim();
    const amount = cleanNumber(expenseAmount.value);
    const category = expenseCategory.value;

    if (desc === "") { alert("لطفاً توضیح هزینه را بنویس"); return; }
    if (!amount || amount <= 0) { alert("لطفاً مبلغ معتبر وارد کن"); return; }

    expenses.push({
        desc: desc,
        amount: amount,
        category: category,
        date: activeDate
    });

    saveExpenses();
    showExpenses();
    closeAddExpenseModal();
}

window.deleteExpense = function(index) {
    if (!confirm("این هزینه حذف بشه؟")) return;
    expenses.splice(index, 1);
    saveExpenses();
    showExpenses();
}

// ═══════════════════════════════════════════════
// ═══════ نمایش هزینه‌ها ═══════
// ═══════════════════════════════════════════════

function showExpenses() {
    const dayExpenses = expenses.filter(e => e.date === activeDate);
    expenseList.innerHTML = "";

    if (dayExpenses.length === 0) {
        expenseList.innerHTML = '<li style="text-align:center; color:#aaa; padding:25px; background:none !important; border:none !important;">هزینه‌ای ثبت نشده — با دکمه بالا اضافه کن</li>';
        expenseTotal.textContent = "۰ ریال";
        updateMonthStats();
        updateBudgetUI();
        updateChart();
        return;
    }

    let total = 0;
    dayExpenses.forEach(function(expense) {
        const index = expenses.indexOf(expense);
        total += expense.amount;

        const catEmoji = getCategoryEmoji(expense.category);

        const li = document.createElement("li");
        li.className = "expense-item";
        li.innerHTML = `
            <div style="flex:1; text-align:right; display:flex; align-items:center; gap:10px;">
                <span style="font-size:18px;">${catEmoji}</span>
                <div>
                    <div class="expense-desc" style="font-weight:600;">${escapeHtml(expense.desc)}</div>
                    <div style="font-size:11px; color:#86868b; margin-top:2px;">${expense.category || ""}</div>
                </div>
            </div>
            <span class="expense-amount" style="margin-left:10px;">${formatNumber(expense.amount)} ریال</span>
            <button class="expense-del" onclick="deleteExpense(${index})">✕</button>
        `;
        expenseList.appendChild(li);
    });

    expenseTotal.textContent = formatNumber(total) + " ریال";
    updateMonthStats();
    updateBudgetUI();
    updateChart();
}

function getCategoryEmoji(cat) {
    const map = {
        "غذا": "🍔",
        "حمل و نقل": "🚕",
        "خرید": "🛍️",
        "قبوض": "📄",
        "سلامت": "💊",
        "سرگرمی": "🎮",
        "سایر": "📦"
    };
    return map[cat] || "📦";
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// ═══════════════════════════════════════════════
// ═══════ آمار ماه و مقایسه ═══════
// ═══════════════════════════════════════════════

function updateMonthStats() {
    const refDate = new Date(activeDate + "T00:00:00");
    const year = refDate.getFullYear();
    const month = refDate.getMonth();

    // آمار این ماه
    const monthExpenses = expenses.filter(function(e) {
        const d = new Date(e.date + "T00:00:00");
        return d.getFullYear() === year && d.getMonth() === month;
    });

    const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

    if (monthTotal) monthTotal.textContent = formatNumber(total) + " ریال";
    if (monthCount) monthCount.textContent = formatNumber(monthExpenses.length);

    // آمار ماه قبل
    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth < 0) { prevMonth = 11; prevYear--; }

    const prevMonthExpenses = expenses.filter(function(e) {
        const d = new Date(e.date + "T00:00:00");
        return d.getFullYear() === prevYear && d.getMonth() === prevMonth;
    });
    const prevTotal = prevMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    // نام ماه‌ها
    const currentMonthName = refDate.toLocaleDateString("fa-IR", { month: "long" });
    const prevMonthDate = new Date(prevYear, prevMonth, 1);
    const prevMonthName = prevMonthDate.toLocaleDateString("fa-IR", { month: "long" });

    // نمایش
    const currentMonthLabel = document.getElementById("currentMonthLabel");
    const prevMonthLabel = document.getElementById("prevMonthLabel");
    const currentMonthTotal = document.getElementById("currentMonthTotal");
    const prevMonthTotal = document.getElementById("prevMonthTotal");
    const compareResult = document.getElementById("compareResult");

    if (currentMonthLabel) {
        currentMonthLabel.textContent = `این ماه (${currentMonthName}):`;
        prevMonthLabel.textContent = `ماه قبل (${prevMonthName}):`;
        currentMonthTotal.textContent = formatNumber(total) + " ریال";
        prevMonthTotal.textContent = formatNumber(prevTotal) + " ریال";

        compareResult.className = "compare-badge";

        if (prevTotal === 0 && total === 0) {
            compareResult.textContent = "هزینه‌ای در این دو ماه ثبت نشده";
            compareResult.classList.add("same");
        } else if (prevTotal === 0) {
            compareResult.textContent = "📊 ماه قبل هزینه‌ای ثبت نشده بود";
            compareResult.classList.add("same");
        } else {
            const changePercent = Math.round(((total - prevTotal) / prevTotal) * 100);

            if (changePercent > 0) {
                compareResult.textContent = `📈 ${formatNumber(changePercent)}٪ افزایش نسبت به ماه قبل`;
                compareResult.classList.add("increase");
            } else if (changePercent < 0) {
                compareResult.textContent = `📉 ${formatNumber(Math.abs(changePercent))}٪ کاهش نسبت به ماه قبل`;
                compareResult.classList.add("decrease");
            } else {
                compareResult.textContent = "➖ برابر با ماه قبل";
                compareResult.classList.add("same");
            }
        }
    }
}

// ═══════════════════════════════════════════════
// ═══════ بودجه ماهانه ═══════
// ═══════════════════════════════════════════════

function updateBudgetUI() {
    if (!budgetAmountEl) return;

    const refDate = new Date(activeDate + "T00:00:00");
    const year = refDate.getFullYear();
    const month = refDate.getMonth();

    const monthExpenses = expenses.filter(function(e) {
        const d = new Date(e.date + "T00:00:00");
        return d.getFullYear() === year && d.getMonth() === month;
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
        budgetStatus.textContent = `⏰ ${formatNumber(remaining)} ریال باقی مونده (${Math.round(percent)}٪)`;
        budgetStatus.style.color = "#ff9500";
    } else {
        budgetStatus.textContent = `✅ ${formatNumber(remaining)} ریال باقی مونده (${Math.round(percent)}٪ مصرف)`;
        budgetStatus.style.color = "#34c759";
    }
}

function openBudgetModal() {
    budgetInput.value = budget > 0 ? budget.toLocaleString("en-US") : "";
    budgetModal.classList.add("active");
    budgetInput.focus();
}

function closeBudgetModal() {
    budgetModal.classList.remove("active");
}

function saveBudgetHandler() {
    const value = cleanNumber(budgetInput.value);
    if (isNaN(value) || value < 0) { alert("مبلغ معتبر وارد کن"); return; }
    budget = value;
    saveBudget();
    updateBudgetUI();
    closeBudgetModal();
}

// ═══════════════════════════════════════════════
// ═══════ نمودار دایره‌ای ═══════
// ═══════════════════════════════════════════════

function updateChart() {
    const canvas = document.getElementById("expensesChart");
    if (!canvas || typeof Chart === "undefined") return;

    const refDate = new Date(activeDate + "T00:00:00");
    const year = refDate.getFullYear();
    const month = refDate.getMonth();

    const monthExpenses = expenses.filter(function(e) {
        const d = new Date(e.date + "T00:00:00");
        return d.getFullYear() === year && d.getMonth() === month;
    });

    const categories = {};
    monthExpenses.forEach(function(e) {
        const cat = e.category || "سایر";
        categories[cat] = (categories[cat] || 0) + e.amount;
    });

    const labels = Object.keys(categories);
    const data = Object.values(categories);

    const colors = [
        "#0071e3", "#34c759", "#ff9500", "#ff3b30",
        "#af52de", "#5ac8fa", "#ffcc00", "#8e8e93"
    ];

    if (expenseChart) {
        expenseChart.destroy();
        expenseChart = null;
    }

    if (labels.length === 0) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    expenseChart = new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: "#fff"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        font: { family: "Vazirmatn", size: 12 },
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ": " + context.parsed.toLocaleString("fa-IR") + " ریال";
                        }
                    },
                    bodyFont: { family: "Vazirmatn" }
                }
            }
        }
    });
}

// ═══════════════════════════════════════════════
// ═══════ شروع نهایی ═══════
// ═══════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", function() {

    // ۱. خواندن داده‌ها
    expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    loadBudget();
    activeDate = getTodayString();

    // ۲. اجرای تم و منو
    if (typeof initThemeAndSidebar === 'function') {
        initThemeAndSidebar();
    } else if (typeof initCommon === 'function') {
        initCommon();
    }

    // ۳. نمایش اولیه
    updateDateLabel();
    showExpenses();

    // ۴. رویدادهای تاریخ
    prevDayBtn.addEventListener("click", function() {
        activeDate = addDays(activeDate, -1);
        updateDateLabel();
        showExpenses();
    });
    nextDayBtn.addEventListener("click", function() {
        activeDate = addDays(activeDate, 1);
        updateDateLabel();
        showExpenses();
    });

    // ۵. مودال افزودن هزینه
    openAddExpenseBtn.addEventListener("click", openAddExpenseModal);
    closeAddExpenseBtn.addEventListener("click", closeAddExpenseModal);
    addExpenseModal.addEventListener("click", function(e) {
        if (e.target === addExpenseModal) closeAddExpenseModal();
    });

    // ۶. فرم افزودن
    addExpenseBtn.addEventListener("click", addExpense);
    expenseAmount.addEventListener("input", function() {
        expenseAmount.value = formatInputNumber(expenseAmount.value);
    });
    expenseAmount.addEventListener("keypress", function(e) {
        if (e.key === "Enter") addExpense();
    });
    expenseDesc.addEventListener("keypress", function(e) {
        if (e.key === "Enter") addExpense();
    });

    // ۷. مودال بودجه
    editBudgetBtn.addEventListener("click", openBudgetModal);
    closeBudgetBtn.addEventListener("click", closeBudgetModal);
    cancelBudgetBtn.addEventListener("click", closeBudgetModal);
    saveBudgetBtn.addEventListener("click", saveBudgetHandler);
    budgetModal.addEventListener("click", function(e) {
        if (e.target === budgetModal) closeBudgetModal();
    });
    budgetInput.addEventListener("input", function() {
        budgetInput.value = formatInputNumber(budgetInput.value);
    });

    // ۸. رسم اولیه نمودار
    setTimeout(updateChart, 150);
});