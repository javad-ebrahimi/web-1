// ===== داده‌ها =====
let notes = JSON.parse(localStorage.getItem("notes")) || [];

// ===== المان‌ها =====
const notesList = document.getElementById("notesList");
const emptyState = document.getElementById("emptyState");
const addNoteBtn = document.getElementById("addNoteBtn");

const noteModal = document.getElementById("noteModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelNoteBtn = document.getElementById("cancelNoteBtn");
const saveNoteBtn = document.getElementById("saveNoteBtn");
const modalTitle = document.getElementById("modalTitle");
const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");

// ===== متغیر ویرایش =====
let editingNoteId = null;

// ===== ذخیره =====
function saveNotes() {
    localStorage.setItem("notes", JSON.stringify(notes));
}

// ===== رندر لیست =====
function renderNotes() {
    notesList.innerHTML = "";

    if (notes.length === 0) {
        emptyState.style.display = "block";
        notesList.style.display = "none";
        return;
    }

    emptyState.style.display = "none";
    notesList.style.display = "flex";

    // مرتب‌سازی: جدیدترین بالا
    const sortedNotes = [...notes].sort((a, b) => b.id - a.id);

    sortedNotes.forEach(function(note) {
        const card = document.createElement("div");
        card.className = "note-card";

        // کوتاه کردن متن اگه طولانی بود
        const preview = note.content.length > 150
            ? note.content.slice(0, 150) + "..."
            : note.content;

        card.innerHTML = `
            <div class="note-card-header">
                <div class="note-title">${escapeHtml(note.title)}</div>
                <button class="note-delete" data-id="${note.id}">✕</button>
            </div>
            <div class="note-content">${escapeHtml(preview)}</div>
            <div class="note-date">${note.date}</div>
        `;

        // کلیک روی کارت ← ویرایش
        card.addEventListener("click", function(e) {
            if (e.target.classList.contains("note-delete")) return;
            openEditModal(note.id);
        });

        // کلیک روی حذف
        const deleteBtn = card.querySelector(".note-delete");
        deleteBtn.addEventListener("click", function(e) {
            e.stopPropagation();
            deleteNote(note.id);
        });

        notesList.appendChild(card);
    });
}

// ===== جلوگیری از XSS =====
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// ===== باز کردن مودال (افزودن) =====
function openAddModal() {
    editingNoteId = null;
    modalTitle.textContent = "یادداشت جدید";
    noteTitle.value = "";
    noteContent.value = "";
    noteModal.classList.add("active");
    noteTitle.focus();
}

// ===== باز کردن مودال (ویرایش) =====
function openEditModal(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    editingNoteId = id;
    modalTitle.textContent = "ویرایش یادداشت";
    noteTitle.value = note.title;
    noteContent.value = note.content;
    noteModal.classList.add("active");
    noteTitle.focus();
}

// ===== بستن مودال =====
function closeModal() {
    noteModal.classList.remove("active");
    editingNoteId = null;
}

// ===== ذخیره یادداشت =====
function saveNote() {
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();

    if (title === "") {
        alert("لطفاً یه عنوان بنویس");
        return;
    }

    if (content === "") {
        alert("لطفاً متن یادداشت رو بنویس");
        return;
    }

    const today = new Date().toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    if (editingNoteId !== null) {
        const index = notes.findIndex(n => n.id === editingNoteId);
        if (index !== -1) {
            notes[index].title = title;
            notes[index].content = content;
            notes[index].date = today;
        }
    } else {
        notes.push({
            id: Date.now(),
            title: title,
            content: content,
            date: today
        });
    }

    saveNotes();
    renderNotes();
    closeModal();
}

// ===== حذف =====
function deleteNote(id) {
    if (!confirm("مطمئنی می‌خوای این یادداشت رو حذف کنی؟")) return;
    notes = notes.filter(n => n.id !== id);
    saveNotes();
    renderNotes();
}

// ===== رویدادها =====
addNoteBtn.addEventListener("click", openAddModal);
closeModalBtn.addEventListener("click", closeModal);
cancelNoteBtn.addEventListener("click", closeModal);
saveNoteBtn.addEventListener("click", saveNote);

// کلیک بیرون مودال ← بستن
noteModal.addEventListener("click", function(e) {
    if (e.target === noteModal) closeModal();
});

// Ctrl+Enter در متن ← ذخیره
noteContent.addEventListener("keydown", function(e) {
    if (e.ctrlKey && e.key === "Enter") {
        saveNote();
    }
});

// ===== شروع =====
initCommon();
renderNotes();