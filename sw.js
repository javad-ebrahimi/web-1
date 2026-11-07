const CACHE_NAME = 'barnameh-cache-v1';
const ASSETS = [
    './',
    './index.html',
    './tasks.html',
    './expenses.html',
    './goals.html',
    './stats.html',
    './calculator.html',
    './calendar.html',
    './notes.html',
    './password.html',
    './memory.html',
    './qrcode.html',
    './settings.html',
    './css/theme.css',
    './css/dashboard.css',
    './css/tasks.css',
    './css/expenses.css',
    './css/goals.css',
    './css/stats.css',
    './css/calculator.css',
    './css/calendar.css',
    './css/notes.css',
    './css/password.css',
    './css/memory.css',
    './css/qrcode.css',
    './js/common.js',
    './js/dashboard.js',
    './js/tasks.js',
    './js/expenses.js',
    './js/goals.js',
    './js/stats.js',
    './js/calculator.js',
    './js/calendar.js',
    './js/notes.js',
    './js/password.js',
    './js/memory.js',
    './js/qrcode.js',
    './js/settings.js'
];

// نصب و کش کردن فایل‌ها
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// فعال‌سازی و پاک کردن کش‌های قدیمی
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// واکشی فایل‌ها (اول از کش، بعد از اینترنت)
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});