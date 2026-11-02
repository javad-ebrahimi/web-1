// ===== المان‌ها =====
const passwordOutput = document.getElementById("passwordOutput");
const copyBtn = document.getElementById("copyBtn");
const lengthInput = document.getElementById("lengthInput");
const lengthValue = document.getElementById("lengthValue");
const uppercaseCheck = document.getElementById("uppercase");
const lowercaseCheck = document.getElementById("lowercase");
const numbersCheck = document.getElementById("numbers");
const symbolsCheck = document.getElementById("symbols");
const generateBtn = document.getElementById("generateBtn");
const strengthFill = document.getElementById("strengthFill");
const strengthLabel = document.getElementById("strengthLabel");

// ===== کاراکترهای مجاز =====
const CHARS = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?"
};

// ===== تولید عدد تصادفی امن =====
function secureRandom(max) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
}

// ===== تولید رمز =====
function generatePassword() {
    const length = Number(lengthInput.value);

    let chars = "";
    if (uppercaseCheck.checked) chars += CHARS.uppercase;
    if (lowercaseCheck.checked) chars += CHARS.lowercase;
    if (numbersCheck.checked) chars += CHARS.numbers;
    if (symbolsCheck.checked) chars += CHARS.symbols;

    if (chars === "") {
        passwordOutput.textContent = "یه گزینه انتخاب کن!";
        updateStrength(0, length);
        return;
    }

    let password = "";
    for (let i = 0; i < length; i++) {
        password += chars[secureRandom(chars.length)];
    }

    passwordOutput.textContent = password;
    updateStrength(chars.length, length);
}

// ===== محاسبه قدرت رمز =====
function updateStrength(charsetSize, length) {
    const entropy = length * Math.log2(charsetSize || 1);

    let percent = 0;
    let level = "";
    let label = "";

    if (entropy < 40) {
        percent = 30; level = "weak"; label = "ضعیف";
    } else if (entropy < 70) {
        percent = 60; level = "medium"; label = "متوسط";
    } else {
        percent = 100; level = "strong"; label = "قوی";
    }

    strengthFill.className = "strength-fill " + level;
    strengthFill.style.width = percent + "%";
    strengthLabel.className = "strength-label " + level;
    strengthLabel.textContent = "قدرت رمز: " + label;
}

// ===== کپی =====
function copyPassword() {
    const text = passwordOutput.textContent;
    if (!text || text === "-" || text === "یه گزینه انتخاب کن!") return;

    navigator.clipboard.writeText(text).then(function() {
        copyBtn.textContent = "✓";
        copyBtn.classList.add("copied");

        setTimeout(function() {
            copyBtn.textContent = "📋";
            copyBtn.classList.remove("copied");
        }, 1500);
    });
}

// ===== رویدادها =====
lengthInput.addEventListener("input", function() {
    lengthValue.textContent = lengthInput.value;
    generatePassword();
});

[uppercaseCheck, lowercaseCheck, numbersCheck, symbolsCheck].forEach(function(checkbox) {
    checkbox.addEventListener("change", generatePassword);
});

generateBtn.addEventListener("click", generatePassword);
copyBtn.addEventListener("click", copyPassword);

// ===== شروع =====
initCommon();
generatePassword();