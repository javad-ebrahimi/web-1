// ===== المان‌ها =====
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");
const clearAllBtn = document.getElementById("clearAllBtn");

// ===== ۱. دانلود پشتیبان (Export) =====
exportBtn.addEventListener("click", function() {
    // جمع‌آوری تمام داده‌ها از localStorage
    const data = {
        tasks: JSON.parse(localStorage.getItem("tasks")) || [],
        expenses: JSON.parse(localStorage.getItem("expenses")) || [],
        notes: JSON.parse(localStorage.getItem("notes")) || [],
        theme: localStorage.getItem("theme") || "light"
    };

    // تبدیل به متن JSON
    const jsonString = JSON.stringify(data, null, 2);

    // ساخت فایل برای دانلود
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // ساخت لینک دانلود
    const a = document.createElement("a");
    a.href = url;
    
    // اسم فایل با تاریخ
    const today = new Date().toISOString().split("T")[0];
    a.download = `backup-${today}.json`;
    
    a.click();

    // پاکسازی حافظه
    URL.revokeObjectURL(url);
    
    alert("فایل پشتیبان با موفقیت دانلود شد ✅");
});

// ===== ۲. بازیابی از پشتیبان (Import) =====
// وقتی کاربر روی دکمه کلیک می‌کنه، پنجره انتخاب فایل باز می‌شه
importBtn.addEventListener("click", function() {
    importFile.click();
});

// وقتی کاربر فایل رو انتخاب کرد
importFile.addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(event) {
        try {
            const data = JSON.parse(event.target.result);

            // چک کردن اینکه فایل معتبره
            if (!data.tasks && !data.expenses && !data.notes) {
                alert("فایل پشتیبان نامعتبر است!");
                return;
            }

            // تایید از کاربر
            if (!confirm("⚠️ هشدار!\nتمام داده‌های فعلی شما پاک شده و با فایل پشتیبان جایگزین می‌شوند.\nآیا مطمئن هستید؟")) {
                return;
            }

            // بازیابی داده‌ها
            if (data.tasks) localStorage.setItem("tasks", JSON.stringify(data.tasks));
            if (data.expenses) localStorage.setItem("expenses", JSON.stringify(data.expenses));
            if (data.notes) localStorage.setItem("notes", JSON.stringify(data.notes));
            if (data.theme) localStorage.setItem("theme", data.theme);

            alert("بازیابی با موفقیت انجام شد! ✅\nصفحه دوباره بارگذاری می‌شود.");
            location.reload();

        } catch (error) {
            alert("خطا در خواندن فایل! مطمئن شوید فایل یک JSON معتبر است.");
        }
    };

    reader.readAsText(file);
    
    // پاک کردن مقدار فایل برای اینکه بشه دوباره انتخاب کرد
    importFile.value = "";
});

// ===== ۳. پاک کردن کل داده‌ها =====
clearAllBtn.addEventListener("click", function() {
    const firstConfirm = confirm("⚠️ آیا مطمئن هستید که می‌خواهید تمام داده‌ها را پاک کنید؟");
    if (!firstConfirm) return;

    const secondConfirm = confirm("این کار قابل بازگشت نیست! (توصیه می‌شود اول پشتیبان بگیرید)\nآیا واقعاً مطمئنید؟");
    if (!secondConfirm) return;

    localStorage.removeItem("tasks");
    localStorage.removeItem("expenses");
    localStorage.removeItem("notes");

    alert("تمام اطلاعات پاک شد.");
    location.reload();
});

// ===== شروع =====
initCommon();