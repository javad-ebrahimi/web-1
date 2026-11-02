// ===== داده‌ها =====
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let activeDate = getTodayString();

// ===== المان‌ها =====
const expenseDesc = document.getElementById("expenseDesc");
const expenseAmount = document.getElementById("expenseAmount");
const addExpenseBtn = document.getElementById("addExpenseBtn");
const expenseList = document.getElementById("expenseList");
const expenseTotal = document.getElementById("expenseTotal");

const dateLabel = document.getElementById("dateLabel");
const prevDayBtn = document.getElementById("prevDayBtn");
const nextDayBtn = document.getElementById("nextDayBtn");

const monthTotal = document.getElementById("monthTotal");
const monthCount = document.getElementById("monthCount");

// ===== نمودار =====
let expensesChart = null;

// ===== نمایش تاریخ =====
function updateDateLabel() {
    const today = getTodayString();
    let prefix = "";

    if (activeDate === today) prefix = "امروز — ";
    else if (activeDate === addDays(today, -1)) prefix = "دیروز — ";
    else if (activeDate === addDays(today, 1)) prefix = "فردا — ";

    dateLabel.textContent = prefix + toPersianDate(activeDate);
}

// ===== جداکننده هزارگان در input =====
function formatInputNumber(value) {
    const digits = value.replace(/\D/g, "");
    if (digits === "") return "";
    return Number(digits).toLocaleString("en-US");
}

// ===== پاک کردن کاما برای ذخیره =====
function cleanNumber(value) {
    return Number(value.replace(/,/g, ""));
}

// ===== ذخیره =====
function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

// ===== افزودن هزینه =====
function addExpense() {
    const desc = expenseDesc.value.trim();
    const amount = cleanNumber(expenseAmount.value);

    if (desc === "") {
        alert("لطفاً توضیح هزینه را بنویس");
        return;
    }
    if (!amount || amount <= 0) {
        alert("لطفاً مبلغ معتبر وارد کن");
        return;
    }

    expenses.push({
        desc: desc,
        amount: amount,
        date: activeDate
    });

    expenseDesc.value = "";
    expenseAmount.value = "";

    saveExpenses();
    showExpenses();
}

// ===== حذف هزینه =====
function deleteExpense(index) {
    expenses.splice(index, 1);
    saveExpenses();
    showExpenses();
}

// ===== نمایش هزینه‌های روز =====
function showExpenses() {
    const dayExpenses = expenses.filter(e => e.date === activeDate);

    expenseList.innerHTML = "";

    if (dayExpenses.length === 0) {
        expenseList.innerHTML = '<li class="expense-empty">هزینه‌ای ثبت نشده</li>';
        expenseTotal.textContent = "۰ تومان";
        updateMonthStats();
        renderChart();
        return;
    }

    let total = 0;

    dayExpenses.forEach(function(expense) {
        const index = expenses.indexOf(expense);
        total += expense.amount;

        const li = document.createElement("li");
        li.className = "expense-item";
        li.innerHTML = `
            <span class="expense-desc">${expense.desc}</span>
            <span class="expense-amount">${formatNumber(expense.amount)} تومان</span>
            <button class="expense-del" onclick="deleteExpense(${index})">✕</button>
        `;
        expenseList.appendChild(li);
    });

    expenseTotal.textContent = formatNumber(total) + " تومان";
    updateMonthStats();
    renderChart();
}

// ===== آمار ماه =====
function updateMonthStats() {
    const refDate = new Date(activeDate + "T00:00:00");
    const year = refDate.getFullYear();
    const month = refDate.getMonth();

    const monthExpenses = expenses.filter(function(e) {
        const d = new Date(e.date + "T00:00:00");
        return d.getFullYear() === year && d.getMonth() === month;
    });

    const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

    monthTotal.textContent = formatNumber(total) + " تومان";
    monthCount.textContent = formatNumber(monthExpenses.length);
}

// ===== رندر نمودار =====
function renderChart() {
    const canvas = document.getElementById("expensesChart");
    if (!canvas) return;

    const refDate = new Date(activeDate + "T00:00:00");
    const year = refDate.getFullYear();
    const month = refDate.getMonth();

    // کارهای این ماه
    const monthExpenses = expenses.filter(function(e) {
        const d = new Date(e.date + "T00:00:00");
        return d.getFullYear() === year && d.getMonth() === month;
    });

    // گروه‌بندی بر اساس توضیحات
    const categories = {};

    monthExpenses.forEach(function(exp) {
        const desc = exp.desc.trim();
        if (!categories[desc]) {
            categories[desc] = 0;
        }
        categories[desc] += exp.amount;
    });

    // پیدا کردن ۵ دسته‌ی برتر
    let sorted = Object.keys(categories)
        .map(key => ({ name: key, amount: categories[key] }))
        .sort((a, b) => b.amount - a.amount);

    // اگه داده‌ای نبود
    if (sorted.length === 0) {
        if (expensesChart) {
            expensesChart.destroy();
            expensesChart = null;
        }
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#aaa";
        ctx.font = "14px Tahoma";
        ctx.textAlign = "center";
        ctx.fillText("این ماه هزینه‌ای ثبت نشده", canvas.width / 2, canvas.height / 2);
        return;
    }

    // اگه بیشتر از ۵ دسته بود، بقیه رو در "سایر" جمع کن
    if (sorted.length > 5) {
        const others = sorted.slice(5);
        const otherSum = others.reduce((sum, o) => sum + o.amount, 0);
        sorted = sorted.slice(0, 5);
        sorted.push({ name: "سایر", amount: otherSum });
    }

    const labels = sorted.map(s => s.name);
    const data = sorted.map(s => s.amount);

    const colors = [
        "#4a6cf7",  // آبی
        "#10b981",  // سبز
        "#f59e0b",  // زرد
        "#ef4444",  // قرمز
        "#8b5cf6",  // بنفش
        "#ec4899"   // صورتی
    ];

    // اگه نمودار قبلی بود، پاک کن
    if (expensesChart) expensesChart.destroy();

    // بررسی تم تاریک
    const isDark = document.body.classList.contains("dark");
    const textColor = isDark ? "#e5e7eb" : "#333";
    const gridColor = isDark ? "#424861" : "#e5e9f2";

    // ساخت نمودار
    const ctx = canvas.getContext("2d");
    expensesChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "هزینه (تومان)",
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y.toLocaleString("fa-IR") + " تومان";
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColor,
                        font: {
                            family: "Tahoma",
                            size: 11
                        },
                        callback: function(value) {
                            return value.toLocaleString("fa-IR");
                        }
                    },
                    grid: {
                        color: gridColor
                    }
                },
                x: {
                    ticks: {
                        color: textColor,
                        font: {
                            family: "Tahoma",
                            size: 11
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// ===== تغییر روز =====
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

// ===== فرمت زنده مبلغ =====
expenseAmount.addEventListener("input", function() {
    expenseAmount.value = formatInputNumber(expenseAmount.value);
});

// ===== اتصال دکمه افزودن =====
addExpenseBtn.addEventListener("click", addExpense);

// ===== Enter هم کار کند =====
expenseAmount.addEventListener("keypress", function(e) {
    if (e.key === "Enter") addExpense();
});

expenseDesc.addEventListener("keypress", function(e) {
    if (e.key === "Enter") addExpense();
});

// ===== تغییر تم =====
window.addEventListener("themeChanged", function() {
    renderChart();
});

// ===== شروع =====
initCommon();
updateDateLabel();
showExpenses();
renderChart();