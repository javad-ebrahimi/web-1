// ===== المان‌ها =====
const calcDisplay = document.getElementById("calcDisplay");
const calcHistory = document.getElementById("calcHistory");

// ===== متغیرها =====
let currentValue = "0";
let previousValue = null;
let operator = null;
let waitingForNumber = false;
let historyText = "";

// ===== نمایش =====
function updateDisplay() {
    if (currentValue === "خطا") {
        calcDisplay.textContent = "خطا";
    } else {
        let displayValue = currentValue;

        if (!displayValue.includes(".")) {
            const num = Number(displayValue);
            if (!isNaN(num)) {
                displayValue = num.toLocaleString("en-US");
            }
        }

        calcDisplay.textContent = displayValue;
    }

    calcHistory.textContent = historyText;
}

// ===== پاک‌سازی =====
function getCleanNumber(value) {
    if (value === "خطا") return 0;
    return Number(String(value).replace(/,/g, ""));
}

// ===== زدن عدد =====
function inputNumber(num) {
    if (currentValue === "خطا") {
        currentValue = "0";
        historyText = "";
    }

    if (waitingForNumber) {
        currentValue = num;
        waitingForNumber = false;
    } else {
        if (currentValue === "0" && num !== ".") {
            currentValue = num;
        } else {
            if (num === "." && currentValue.includes(".")) return;
            currentValue += num;
        }
    }

    updateDisplay();
}

// ===== زدن عملگر =====
function inputOperator(op) {
    if (currentValue === "خطا") return;

    if (operator && !waitingForNumber) {
        calculate();
        previousValue = getCleanNumber(currentValue);
        operator = op;
        waitingForNumber = true;
        historyText = `${formatForHistory(previousValue)} ${op}`;
        updateDisplay();
        return;
    }

    previousValue = getCleanNumber(currentValue);
    operator = op;
    waitingForNumber = true;
    historyText = `${formatForHistory(previousValue)} ${op}`;
    updateDisplay();
}

// ===== محاسبه =====
function calculate() {
    if (operator === null || previousValue === null) return;

    const current = getCleanNumber(currentValue);
    let result = 0;

    switch (operator) {
        case "+": result = previousValue + current; break;
        case "−": result = previousValue - current; break;
        case "×": result = previousValue * current; break;
        case "÷":
            if (current === 0) {
                currentValue = "خطا";
                operator = null;
                previousValue = null;
                historyText = "";
                updateDisplay();
                return;
            }
            result = previousValue / current;
            break;
    }

    result = Math.round(result * 100000000) / 100000000;
    historyText = `${formatForHistory(previousValue)} ${operator} ${formatForHistory(current)} =`;
    currentValue = String(result);
    operator = null;
    previousValue = null;
    waitingForNumber = true;

    updateDisplay();
}

function formatForHistory(num) {
    return Number(num).toLocaleString("en-US");
}

// ===== پاک کردن =====
function clearAll() {
    currentValue = "0";
    previousValue = null;
    operator = null;
    waitingForNumber = false;
    historyText = "";
    updateDisplay();
}

// ===== تغییر علامت =====
function toggleSign() {
    if (currentValue === "0" || currentValue === "خطا") return;
    if (currentValue.startsWith("-")) {
        currentValue = currentValue.slice(1);
    } else {
        currentValue = "-" + currentValue;
    }
    updateDisplay();
}

// ===== درصد =====
function percent() {
    if (currentValue === "خطا") return;
    const current = getCleanNumber(currentValue);
    if (operator && previousValue !== null) {
        currentValue = String((previousValue * current) / 100);
    } else {
        currentValue = String(current / 100);
    }
    updateDisplay();
}

// ===== اتصال دکمه‌ها =====
document.querySelectorAll(".calc-num").forEach(function(btn) {
    btn.addEventListener("click", function() { inputNumber(btn.dataset.num); });
});

document.querySelectorAll(".calc-operator").forEach(function(btn) {
    btn.addEventListener("click", function() { inputOperator(btn.dataset.op); });
});

document.querySelectorAll("[data-action]").forEach(function(btn) {
    btn.addEventListener("click", function() {
        const action = btn.dataset.action;
        if (action === "clear") clearAll();
        else if (action === "sign") toggleSign();
        else if (action === "percent") percent();
        else if (action === "equals") calculate();
    });
});

// ===== کیبورد =====
document.addEventListener("keydown", function(e) {
    if (e.key >= "0" && e.key <= "9") inputNumber(e.key);
    else if (e.key === ".") inputNumber(".");
    else if (e.key === "+") inputOperator("+");
    else if (e.key === "-") inputOperator("−");
    else if (e.key === "*") inputOperator("×");
    else if (e.key === "/") { e.preventDefault(); inputOperator("÷"); }
    else if (e.key === "Enter" || e.key === "=") { e.preventDefault(); calculate(); }
    else if (e.key === "Escape" || e.key === "c" || e.key === "C") clearAll();
    else if (e.key === "%") percent();
    else if (e.key === "Backspace") {
        if (currentValue.length > 1 && currentValue !== "خطا") {
            currentValue = currentValue.slice(0, -1);
            if (currentValue === "-") currentValue = "0";
        } else {
            currentValue = "0";
        }
        updateDisplay();
    }
});

// ===== شروع =====
initCommon();
updateDisplay();

