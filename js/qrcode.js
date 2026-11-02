// ===== المان‌ها =====
const qrText = document.getElementById("qrText");
const generateQrBtn = document.getElementById("generateQrBtn");
const qrResultCard = document.getElementById("qrResultCard");
const qrcodeContainer = document.getElementById("qrcode");
const downloadQrBtn = document.getElementById("downloadQrBtn");

let qrCodeInstance = null;

// ===== ساخت QR Code =====
function generateQR() {
    const text = qrText.value.trim();

    if (text === "") {
        alert("لطفاً یک متن یا لینک وارد کنید");
        return;
    }

    // پاک کردن QR قبلی
    qrcodeContainer.innerHTML = "";

    // ساخت QR جدید با کتابخانه
    qrCodeInstance = new QRCode(qrcodeContainer, {
        text: text,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H // سطح تصحیح خطای بالا
    });

    // نمایش کارت نتیجه
    qrResultCard.style.display = "block";
}

// ===== دانلود تصویر =====
function downloadQR() {
    // کتابخانه qrcodejs ممکنه تگ canvas یا img بسازه
    const canvas = qrcodeContainer.querySelector("canvas");
    const img = qrcodeContainer.querySelector("img");

    let dataURL = "";

    if (canvas) {
        dataURL = canvas.toDataURL("image/png");
    } else if (img) {
        dataURL = img.src;
    }

    if (!dataURL) {
        alert("خطا در دانلود تصویر");
        return;
    }

    // ساخت لینک دانلود
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "qrcode.png";
    link.click();
}

// ===== رویدادها =====
generateQrBtn.addEventListener("click", generateQR);
downloadQrBtn.addEventListener("click", downloadQR);

// ساخت با زدن Enter (اگر تک خط بود)
qrText.addEventListener("keypress", function(e) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault(); // جلوگیری از خط جدید
        generateQR();
    }
});

// ===== شروع =====
initCommon();