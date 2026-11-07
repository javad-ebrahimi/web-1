// ═══════════════════════════════════════════════
// ═══════ مدیریت اهداف مالی ═══════
// ═══════════════════════════════════════════════

let goals = [];
let editingGoalId = null;
let currentDepositGoalId = null;

// ===== المان‌ها =====
const goalsList = document.getElementById("goalsList");
const emptyGoals = document.getElementById("emptyGoals");
const addGoalBtn = document.getElementById("addGoalBtn");

const goalModal = document.getElementById("goalModal");
const closeGoalModal = document.getElementById("closeGoalModal");
const cancelGoalBtn = document.getElementById("cancelGoalBtn");
const saveGoalBtn = document.getElementById("saveGoalBtn");
const modalTitle = document.getElementById("modalTitle");
const goalTitle = document.getElementById("goalTitle");
const goalTargetAmount = document.getElementById("goalTargetAmount");
const goalCurrentAmount = document.getElementById("goalCurrentAmount");
const goalIcon = document.getElementById("goalIcon");

const depositModal = document.getElementById("depositModal");
const closeDepositModal = document.getElementById("closeDepositModal");
const cancelDepositBtn = document.getElementById("cancelDepositBtn");
const saveDepositBtn = document.getElementById("saveDepositBtn");
const depositGoalTitle = document.getElementById("depositGoalTitle");
const depositAmount = document.getElementById("depositAmount");

// ===== ذخیره و بازیابی =====
function saveGoals() {
    localStorage.setItem("goals", JSON.stringify(goals));
}

function loadGoals() {
    goals = JSON.parse(localStorage.getItem("goals")) || [];
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

// ===== نمایش لیست اهداف =====
function renderGoals() {
    goalsList.innerHTML = "";

    if (goals.length === 0) {
        emptyGoals.style.display = "block";
        goalsList.style.display = "none";
        return;
    }

    emptyGoals.style.display = "none";
    goalsList.style.display = "flex";

    goals.forEach(function(goal) {
        const percent = goal.target > 0 ? Math.min(Math.round((goal.current / goal.target) * 100), 100) : 0;
        const isComplete = percent >= 100;
        const remaining = Math.max(goal.target - goal.current, 0);

        const card = document.createElement("div");
        card.className = "goal-card";

        card.innerHTML = `
            <div class="goal-header">
                <div class="goal-icon-wrap">${goal.icon || "🎯"}</div>
                <div class="goal-info">
                    <div class="goal-title">${escapeHtml(goal.title)}</div>
                    <div class="goal-amounts">
                        <strong>${formatNumber(goal.current)}</strong> از ${formatNumber(goal.target)} ریال
                    </div>
                </div>
                <button class="goal-delete" onclick="deleteGoal(${goal.id})">✕</button>
            </div>

            <div class="goal-progress-bar">
                <div class="goal-progress-fill ${isComplete ? 'complete' : ''}" style="width: ${percent}%;"></div>
            </div>

            <div class="goal-footer">
                <span class="goal-percent ${isComplete ? 'complete' : ''}">${formatNumber(percent)}٪</span>
                ${isComplete 
                    ? '<span class="goal-percent complete">🎉 تکمیل شد!</span>' 
                    : `<span class="goal-remaining">${formatNumber(remaining)} ریال مونده</span>`
                }
            </div>

            ${!isComplete ? `<button class="goal-deposit-btn" onclick="openDeposit(${goal.id})">+ افزودن به هدف</button>` : ''}
        `;

        goalsList.appendChild(card);
    });
}

// ===== حذف هدف =====
window.deleteGoal = function(id) {
    if (!confirm("این هدف حذف بشه؟")) return;
    goals = goals.filter(g => g.id !== id);
    saveGoals();
    renderGoals();
};

// ===== باز کردن مودال هدف =====
function openAddGoalModal() {
    editingGoalId = null;
    modalTitle.textContent = "🎯 هدف جدید";
    goalTitle.value = "";
    goalTargetAmount.value = "";
    goalCurrentAmount.value = "";
    goalIcon.value = "🎯";
    goalModal.classList.add("active");
    goalTitle.focus();
}

function closeGoalModalFunc() {
    goalModal.classList.remove("active");
    editingGoalId = null;
}

// ===== ذخیره هدف =====
function saveGoal() {
    const title = goalTitle.value.trim();
    const target = cleanNumber(goalTargetAmount.value);
    const current = cleanNumber(goalCurrentAmount.value) || 0;
    const icon = goalIcon.value;

    if (title === "") { alert("اسم هدف رو بنویس"); return; }
    if (!target || target <= 0) { alert("مبلغ هدف رو وارد کن"); return; }

    if (editingGoalId !== null) {
        const goal = goals.find(g => g.id === editingGoalId);
        if (goal) {
            goal.title = title;
            goal.target = target;
            goal.current = current;
            goal.icon = icon;
        }
    } else {
        goals.push({
            id: Date.now(),
            title: title,
            target: target,
            current: current,
            icon: icon,
            createdAt: new Date().toISOString()
        });
    }

    saveGoals();
    renderGoals();
    closeGoalModalFunc();
}

// ===== باز کردن مودال واریز =====
window.openDeposit = function(id) {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    currentDepositGoalId = id;
    depositGoalTitle.textContent = `افزودن به: ${goal.title}`;
    depositAmount.value = "";
    depositModal.classList.add("active");
    depositAmount.focus();
};

function closeDepositModalFunc() {
    depositModal.classList.remove("active");
    currentDepositGoalId = null;
}

// ===== واریز به هدف =====
function saveDeposit() {
    const amount = cleanNumber(depositAmount.value);
    if (!amount || amount <= 0) { alert("مبلغ معتبر وارد کن"); return; }

    const goal = goals.find(g => g.id === currentDepositGoalId);
    if (!goal) return;

    goal.current += amount;
    saveGoals();
    renderGoals();
    closeDepositModalFunc();

    // اگه کامل شد، تبریک
    if (goal.current >= goal.target) {
        setTimeout(() => {
            alert(`🎉 آفرین! هدف «${goal.title}» تکمیل شد!`);
        }, 300);
    }
}

// ===== شروع =====
document.addEventListener("DOMContentLoaded", function() {
    if (typeof initThemeAndSidebar === 'function') initThemeAndSidebar();

  
    loadGoals();
    renderGoals();

    // رویدادها
    addGoalBtn.addEventListener("click", openAddGoalModal);
    closeGoalModal.addEventListener("click", closeGoalModalFunc);
    cancelGoalBtn.addEventListener("click", closeGoalModalFunc);
    saveGoalBtn.addEventListener("click", saveGoal);

    closeDepositModal.addEventListener("click", closeDepositModalFunc);
    cancelDepositBtn.addEventListener("click", closeDepositModalFunc);
    saveDepositBtn.addEventListener("click", saveDeposit);

    // فرمت‌بندی مبلغ‌ها
    goalTargetAmount.addEventListener("input", function() {
        goalTargetAmount.value = formatInputNumber(goalTargetAmount.value);
    });
    goalCurrentAmount.addEventListener("input", function() {
        goalCurrentAmount.value = formatInputNumber(goalCurrentAmount.value);
    });
    depositAmount.addEventListener("input", function() {
        depositAmount.value = formatInputNumber(depositAmount.value);
    });

    // بستن مودال‌ها با کلیک بیرون
    goalModal.addEventListener("click", function(e) {
        if (e.target === goalModal) closeGoalModalFunc();
    });
    depositModal.addEventListener("click", function(e) {
        if (e.target === depositModal) closeDepositModalFunc();
    });
});