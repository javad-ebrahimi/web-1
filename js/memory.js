// ===== المان‌ها =====
const memoryBoard = document.getElementById("memoryBoard");
const movesCount = document.getElementById("movesCount");
const timer = document.getElementById("timer");
const bestScore = document.getElementById("bestScore");
const winMessage = document.getElementById("winMessage");
const winText = document.getElementById("winText");
const newGameBtn = document.getElementById("newGameBtn");
const playAgainBtn = document.getElementById("playAgainBtn");

// ===== ایموجی‌های بازی =====
const EMOJIS = ["🍎", "🍌", "🍇", "🍓", "🍒", "🥝", "🍑", "🍍"];

// ===== متغیرهای بازی =====
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let lockBoard = false;
let timerInterval = null;
let seconds = 0;
let gameStarted = false;

// ===== شروع بازی =====
function startGame() {
    memoryBoard.innerHTML = "";
    winMessage.classList.remove("active");
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    seconds = 0;
    lockBoard = false;
    gameStarted = false;

    if (timerInterval) clearInterval(timerInterval);

    movesCount.textContent = formatNumber(0);
    timer.textContent = "۰۰:۰۰";

    let deck = [...EMOJIS, ...EMOJIS];
    deck = shuffle(deck);

    deck.forEach(function(emoji, index) {
        const card = document.createElement("button");
        card.className = "memory-card";
        card.dataset.emoji = emoji;
        card.dataset.index = index;

        card.innerHTML = `
            <div class="memory-card-face memory-card-back"></div>
            <div class="memory-card-face memory-card-front">${emoji}</div>
        `;

        card.addEventListener("click", function() {
            flipCard(card);
        });

        memoryBoard.appendChild(card);
    });

    showBestScore();
}

// ===== بُر زدن کارت‌ها =====
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ===== برگرداندن کارت =====
function flipCard(card) {
    if (lockBoard) return;
    if (card.classList.contains("flipped")) return;
    if (card.classList.contains("matched")) return;

    if (!gameStarted) {
        gameStarted = true;
        startTimer();
    }

    card.classList.add("flipped");
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        moves++;
        movesCount.textContent = formatNumber(moves);
        checkMatch();
    }
}

// ===== چک کردن تطابق =====
function checkMatch() {
    const [card1, card2] = flippedCards;
    const isMatch = card1.dataset.emoji === card2.dataset.emoji;

    if (isMatch) {
        card1.classList.add("matched");
        card2.classList.add("matched");
        matchedPairs++;
        flippedCards = [];

        if (matchedPairs === EMOJIS.length) {
            endGame();
        }
    } else {
        lockBoard = true;

        setTimeout(function() {
            card1.classList.remove("flipped");
            card2.classList.remove("flipped");
            flippedCards = [];
            lockBoard = false;
        }, 1000);
    }
}

// ===== تایمر =====
function startTimer() {
    timerInterval = setInterval(function() {
        seconds++;
        timer.textContent = formatTime(seconds);
    }, 1000);
}

function formatTime(sec) {
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return String(min).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

// ===== پایان بازی =====
function endGame() {
    clearInterval(timerInterval);

    const best = getBestScore();
    const isNewRecord = best === null || moves < best.moves || (moves === best.moves && seconds < best.time);

    if (isNewRecord) {
        saveBestScore(moves, seconds);
        winText.innerHTML = `🎉 <strong>رکورد جدید!</strong><br>${formatNumber(moves)} حرکت در ${formatTime(seconds)}`;
    } else {
        winText.innerHTML = `${formatNumber(moves)} حرکت در ${formatTime(seconds)}<br>بهترین رکورد: ${formatNumber(best.moves)} حرکت`;
    }

    winMessage.classList.add("active");
    showBestScore();
    winMessage.scrollIntoView({ behavior: "smooth", block: "center" });
}

// ===== رکورد =====
function getBestScore() {
    const best = localStorage.getItem("memoryBest");
    return best ? JSON.parse(best) : null;
}

function saveBestScore(moves, time) {
    localStorage.setItem("memoryBest", JSON.stringify({ moves: moves, time: time }));
}

function showBestScore() {
    const best = getBestScore();
    if (best) {
        bestScore.textContent = formatNumber(best.moves) + " حرکت";
    } else {
        bestScore.textContent = "-";
    }
}

// ===== رویدادها =====
newGameBtn.addEventListener("click", startGame);
playAgainBtn.addEventListener("click", startGame);

// ===== شروع =====
initCommon();
startGame();