// ===== المان‌ها =====
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");
const clearAllBtn = document.getElementById("clearAllBtn");

// ===== 🌟 شروع نهایی (بعد از لود کامل DOM) =====
document.addEventListener("DOMContentLoaded", function() {
    if (typeof initCommon === 'function') initCommon();

    // ۱. دانلود پشتیبان (Export)
    if (exportBtn) {
        exportBtn.addEventListener("click", function() {
            // خواندن تمام داده‌ها از حافظه مرورگر (شامل یادداشت‌ها)
            const data = {
                tasks: JSON.parse(localStorage.getItem("tasks")) || [],
                expenses: JSON.parse(localStorage.getItem("expenses")) || [],
                notes: JSON.parse(localStorage.getItem("notes")) || [], // 👈 اضافه شد
                theme: localStorage.getItem("theme") || "light"
            };

            // تبدیل به متن و ساخت فایل دانلود
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            const today = new Date().toISOString().split("T")[0];
            a.download = `backup-${today}.json`;
            a.click();

            URL.revokeObjectURL(url);
            alert("فایل پشتیبان (شامل کارها، هزینه‌ها و یادداشت‌ها) دانلود شد ✅");
        });
    }

    // ۲. بازیابی از پشتیبان (Import)
    if (importBtn && importFile) {
        importBtn.addEventListener("click", function() {
            importFile.click();
        });

        importFile.addEventListener("change", function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();

            reader.onload = function(event) {
                try {
                    const data = JSON.parse(event.target.result);

                    // بررسی معتبر بودن فایل
                    if (!data.tasks && !data.expenses && !data.notes) {
                        alert("فایل پشتیبان نامعتبر است!");
                        return;
                    }

                    if (!confirm("⚠️ هشدار!\nتمام داده‌های فعلی شما پاک شده و با فایل پشتیبان جایگزین می‌شوند.\nآیا مطمئن هستید؟")) {
                        return;
                    }

                    // بازیابی داده‌ها به حافظه
                    if (data.tasks) localStorage.setItem("tasks", JSON.stringify(data.tasks));
                    if (data.expenses) localStorage.setItem("expenses", JSON.stringify(data.expenses));
                    if (data.notes) localStorage.setItem("notes", JSON.stringify(data.notes)); // 👈 اضافه شد
                    if (data.theme) localStorage.setItem("theme", data.theme);

                    alert("بازیابی با موفقیت انجام شد! ✅\nصفحه دوباره بارگذاری می‌شود.");
                    location.reload();

                } catch (error) {
                    alert("خطا در خواندن فایل! مطمئن شوید فایل یک JSON معتبر است.");
                }
            };

            reader.readAsText(file);
            importFile.value = "";
        });
    }

    // ۳. پاک کردن کل داده‌ها
    if (clearAllBtn) {
        clearAllBtn.addEventListener("click", function() {
            const firstConfirm = confirm("⚠️ آیا مطمئن هستید که می‌خواهید تمام داده‌ها را پاک کنید؟");
            if (!firstConfirm) return;

            const secondConfirm = confirm("این کار قابل بازگشت نیست! (توصیه می‌شود اول پشتیبان بگیرید)\nآیا واقعاً مطمئنید؟");
            if (!secondConfirm) return;

            localStorage.removeItem("tasks");
            localStorage.removeItem("expenses");
            localStorage.removeItem("notes"); // 👈 یادداشت‌ها هم پاک می‌شن

            alert("تمام اطلاعات پاک شد.");
            location.reload();
        });
    }
});