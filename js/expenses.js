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

// ===== شروع =====
initCommon();
updateDateLabel();
showExpenses();