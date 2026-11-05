// ===== متغیرهای سراسری =====
let expenses = [];
let activeDate = "";

// ===== المان‌ها =====
const expenseDesc = document.getElementById("expenseDesc");
const expenseAmount = document.getElementById("expenseAmount");
const addExpenseBtn = document.getElementById("addExpenseBtn");
const expenseList = document.getElementById("expenseList");
const expenseTotal = document.getElementById("expenseTotal");

const dayPrefixEl = document.getElementById("dayPrefix");
const dateLabelEl = document.getElementById("dateLabel");
const prevDayBtn = document.getElementById("prevDayBtn");
const nextDayBtn = document.getElementById("nextDayBtn");

const monthTotal = document.getElementById("monthTotal");
const monthCount = document.getElementById("monthCount");

// ===== توابع =====
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

function formatInputNumber(value) {
    const digits = value.replace(/\D/g, "");
    if (digits === "") return "";
    return Number(digits).toLocaleString("en-US");
}

function cleanNumber(value) {
    return Number(value.replace(/,/g, ""));
}

function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

function addExpense() {
    const desc = expenseDesc.value.trim();
    const amount = cleanNumber(expenseAmount.value);

    if (desc === "") { alert("لطفاً توضیح هزینه را بنویس"); return; }
    if (!amount || amount <= 0) { alert("لطفاً مبلغ معتبر وارد کن"); return; }

    expenses.push({ desc: desc, amount: amount, date: activeDate });
    expenseDesc.value = "";
    expenseAmount.value = "";
    saveExpenses();
    showExpenses();
}

window.deleteExpense = function(index) {
    expenses.splice(index, 1);
    saveExpenses();
    showExpenses();
}

function showExpenses() {
    const dayExpenses = expenses.filter(e => e.date === activeDate);
    expenseList.innerHTML = "";

    if (dayExpenses.length === 0) {
        expenseList.innerHTML = '<li class="expense-empty" style="text-align:center; color:#aaa; padding:20px;">هزینه‌ای ثبت نشده</li>';
        expenseTotal.textContent = "۰ ریال";
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
            <span class="expense-amount">${formatNumber(expense.amount)} ریال</span>
            <button class="expense-del" onclick="deleteExpense(${index})">✕</button>
        `;
        expenseList.appendChild(li);
    });

    expenseTotal.textContent = formatNumber(total) + " ریال";
    updateMonthStats();
}

function updateMonthStats() {
    const refDate = new Date(activeDate + "T00:00:00");
    const year = refDate.getFullYear();
    const month = refDate.getMonth();

    const monthExpenses = expenses.filter(function(e) {
        const d = new Date(e.date + "T00:00:00");
        return d.getFullYear() === year && d.getMonth() === month;
    });

    const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    monthTotal.textContent = formatNumber(total) + " ریال";
    monthCount.textContent = formatNumber(monthExpenses.length);
}

// ===== 🌟 شروع نهایی =====
document.addEventListener("DOMContentLoaded", function() {
    expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    activeDate = getTodayString();

    if (typeof initCommon === 'function') initCommon();

    updateDateLabel();
    showExpenses();

    addExpenseBtn.addEventListener("click", addExpense);
    expenseAmount.addEventListener("input", function() { expenseAmount.value = formatInputNumber(expenseAmount.value); });
    expenseAmount.addEventListener("keypress", function(e) { if (e.key === "Enter") addExpense(); });
    expenseDesc.addEventListener("keypress", function(e) { if (e.key === "Enter") addExpense(); });

    prevDayBtn.addEventListener("click", function() { activeDate = addDays(activeDate, -1); updateDateLabel(); showExpenses(); });
    nextDayBtn.addEventListener("click", function() { activeDate = addDays(activeDate, 1); updateDateLabel(); showExpenses(); });
});