// Global State
const STATE = {
    players: ["Khoa", "Minh"],
    currentPlayerIndex: 0, // 0 = Khoa, 1 = Minh
    currentLevel: 1,
    usedQuestionIds: [],
    turnCount: 0,
    surpriseTriggered: false
};

// DOM Elements
const screens = {
    splash: document.getElementById('screen-splash'),
    home: document.getElementById('screen-home'),
    game: document.getElementById('screen-game'),
    surprise: document.getElementById('screen-surprise')
};

const UI = {
    btnStart: document.getElementById('btn-start'),
    levelCards: document.querySelectorAll('.level-card'),
    btnBackHome: document.getElementById('btn-back-home'),
    
    playerName: document.getElementById('current-player-name'),
    levelDisplay: document.getElementById('current-level-display'),
    
    gameChoice: document.getElementById('game-choice'),
    gameReveal: document.getElementById('game-reveal'),
    
    btnListen: document.querySelector('.btn-listen'),
    btnAction: document.querySelector('.btn-action'),
    
    playingCard: document.querySelector('.playing-card'),
    cardBadge: document.getElementById('card-badge'),
    cardText: document.getElementById('card-text'),
    btnNextTurn: document.getElementById('btn-next-turn'),
    btnDaaa: document.getElementById('btn-daaa'),
    
    notiContainer: document.getElementById('notification-container'),
    
    // Surprise
    btnSurpriseDone: document.getElementById('btn-surprise-done'),
    devTrigger: document.getElementById('dev-trigger-surprise')
};

// --- NAVIGATION LOGIC ---

function showScreen(screenId) {
    Object.values(screens).forEach(s => s.classList.add('hidden'));
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenId].classList.remove('hidden');
    screens[screenId].classList.add('active');
}

// Splash -> Home
UI.btnStart.addEventListener('click', () => {
    showScreen('home');
});

// Home -> Game (Select Level)
UI.levelCards.forEach(card => {
    card.addEventListener('click', (e) => {
        const level = parseInt(e.currentTarget.dataset.level);
        startGame(level);
    });
});

// Game -> Home
UI.btnBackHome.addEventListener('click', () => {
    // Reset state but keep used questions
    showScreen('home');
    resetGameSpace();
});


// --- GAME LOGIC ---

function startGame(level) {
    STATE.currentLevel = level;
    
    // Set UI labels
    const levelNames = ["Cấp 1", "Cấp 2", "Cấp 3"];
    UI.levelDisplay.textContent = levelNames[level - 1];
    
    // Randomize who goes first on new level start
    STATE.currentPlayerIndex = Math.random() > 0.5 ? 0 : 1;
    updatePlayerTurnUI();
    
    resetGameSpace();
    showScreen('game');
    
    // Trigger random notification
    scheduleRandomNotification();
}

function resetGameSpace() {
    UI.gameChoice.classList.remove('hidden');
    UI.gameChoice.classList.add('active');
    
    UI.gameReveal.classList.add('hidden');
    UI.gameReveal.classList.remove('active');
    
    UI.playingCard.classList.remove('flipped');
}

function updatePlayerTurnUI() {
    const currentPlayer = STATE.players[STATE.currentPlayerIndex];
    UI.playerName.textContent = currentPlayer;
    
    // Swap color context
    if(currentPlayer === "Minh") {
        UI.playerName.style.color = "#ff758c"; // Pinkish for Minh
    } else {
        UI.playerName.style.color = "#a18cd1"; // Violet for Khoa
    }
}

// Draw a question
function drawCard(type) {
    const available = questionsDatabase.filter(q => 
        q.level === STATE.currentLevel && 
        q.type === type && 
        !STATE.usedQuestionIds.includes(q.id)
    );
    
    if (available.length === 0) {
        alert("Đã hết câu hỏi/thử thách ở cấp độ này rồi! Hãy lên cấp hoặc chơi lại từ đầu nhé.");
        return null;
    }
    
    // Random pick
    const q = available[Math.floor(Math.random() * available.length)];
    STATE.usedQuestionIds.push(q.id);
    return q;
}

// Handle Choice Click
function handleChoice(type) {
    const q = drawCard(type);
    if(!q) return;
    
    // Update Card UI
    UI.cardText.textContent = q.text;
    
    if (type === 'listen') {
        UI.cardBadge.textContent = "Lắng Nghe";
        UI.cardBadge.className = "card-type-badge"; 
    } else {
        UI.cardBadge.textContent = "Hành Động";
        UI.cardBadge.className = "card-type-badge action";
    }
    
    // Special Feature: Nút làm nũng "Daaaa" chỉ xuất hiện cho Minh khi ở cấp 2 hoặc 3
    if (STATE.players[STATE.currentPlayerIndex] === "Minh" && STATE.currentLevel >= 2 && Math.random() > 0.5) {
        UI.btnDaaa.classList.remove('hidden');
    } else {
        UI.btnDaaa.classList.add('hidden');
    }
    
    // Animate Reveal
    UI.gameChoice.classList.remove('active');
    UI.gameChoice.classList.add('hidden');
    
    UI.gameReveal.classList.remove('hidden');
    UI.gameReveal.classList.add('active');
    
    // Slight delay for hardware acceleration
    setTimeout(() => {
        UI.playingCard.classList.add('flipped');
    }, 100);

    STATE.turnCount++;
}

UI.btnListen.addEventListener('click', () => handleChoice('listen'));
UI.btnAction.addEventListener('click', () => handleChoice('action'));

// Next Turn
UI.btnNextTurn.addEventListener('click', proceedToNextTurn);

// Minh skips using Daaa
UI.btnDaaa.addEventListener('click', () => {
    alert("Minh đã dùng quyền làm nũng! Thẻ này sẽ bị hủy... 🌸");
    proceedToNextTurn(); // Normally we might re-draw, but let's just skip the turn for fun
});

function proceedToNextTurn() {
    // Check Surprise Logic - after some turns on Level 3, trigger surprise
    if (STATE.currentLevel === 3 && STATE.turnCount >= 6 && !STATE.surpriseTriggered) {
        triggerSurprise();
        return;
    }

    // Flip card back
    UI.playingCard.classList.remove('flipped');
    
    // Wait for animation then change state
    setTimeout(() => {
        STATE.currentPlayerIndex = STATE.currentPlayerIndex === 0 ? 1 : 0; // Toggle
        updatePlayerTurnUI();
        resetGameSpace();
    }, 400); // match css transition
}

// --- SURPRISE MECHANIC ---

function triggerSurprise() {
    STATE.surpriseTriggered = true;
    showScreen('surprise');
}

UI.devTrigger.addEventListener('click', triggerSurprise);

UI.btnSurpriseDone.addEventListener('click', () => {
    alert("Chúc hai bạn một ngày 14/03 thật hạnh phúc nhé! 💕");
    screens['surprise'].classList.add('hidden'); // Hide overlay
    
    // Reset to game
    STATE.currentPlayerIndex = STATE.currentPlayerIndex === 0 ? 1 : 0;
    updatePlayerTurnUI();
    resetGameSpace();
});

// --- NOTIFICATION ENGINE ---

function scheduleRandomNotification() {
    // Trigger every 30 to 60 seconds
    const delay = Math.floor(Math.random() * 30000) + 30000;
    
    setTimeout(() => {
        // Only show if in game mode
        if (screens.game.classList.contains('active') && !screens.surprise.classList.contains('active')) {
            showNotification();
        }
        scheduleRandomNotification(); // loop
    }, delay);
}

function showNotification() {
    const text = notificationsLove[Math.floor(Math.random() * notificationsLove.length)];
    
    const bubble = document.createElement('div');
    bubble.className = 'noti-bubble';
    bubble.textContent = text;
    
    UI.notiContainer.appendChild(bubble);
    
    // Clean up after animation
    setTimeout(() => {
        bubble.remove();
    }, 4500);
}

// Initial Boot Log
console.log("Nhịp Đập M&K App Started! Designed for Khoa & Minh.");

// --- FALLING PETALS ENGINE ---

const petalEmojis = ['🌸', '💮', '🩷', '✿', '❀', '🩵', '💕'];

function spawnPetal() {
    const petal = document.createElement('div');
    petal.className = 'petal';
    petal.textContent = petalEmojis[Math.floor(Math.random() * petalEmojis.length)];
    
    // Randomize position and animation
    const startX = Math.random() * window.innerWidth;
    const duration = 6 + Math.random() * 6; // 6-12 seconds
    const size = 14 + Math.random() * 16; // 14-30px
    const drift = (Math.random() - 0.5) * 150; // sway left or right
    const spin = Math.random() * 720 - 360; // random rotation
    
    petal.style.left = startX + 'px';
    petal.style.fontSize = size + 'px';
    petal.style.animationDuration = duration + 's';
    petal.style.setProperty('--drift', drift + 'px');
    petal.style.setProperty('--spin', spin + 'deg');
    
    document.body.appendChild(petal);
    
    // Cleanup after animation
    setTimeout(() => petal.remove(), duration * 1000 + 500);
}

// Spawn petals continuously
function startPetalLoop() {
    spawnPetal();
    const nextDelay = 600 + Math.random() * 1200; // every 0.6 - 1.8 seconds
    setTimeout(startPetalLoop, nextDelay);
}
startPetalLoop();

// --- CONFETTI BURST (for Surprise screen) ---

function burstConfetti() {
    const colors = ['#ff758c', '#ff7eb3', '#a18cd1', '#fad0c4', '#ffd1ff', '#ffc3a0', '#f5576c'];
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    for (let i = 0; i < 50; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = centerX + 'px';
        piece.style.top = centerY + 'px';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.width = (6 + Math.random() * 6) + 'px';
        piece.style.height = (6 + Math.random() * 6) + 'px';
        piece.style.setProperty('--cx', (Math.random() - 0.5) * 500 + 'px');
        piece.style.setProperty('--cy', (Math.random() - 0.7) * 600 + 'px');
        piece.style.animationDelay = (Math.random() * 0.3) + 's';
        
        document.body.appendChild(piece);
        setTimeout(() => piece.remove(), 3000);
    }
}

// Hook confetti into surprise trigger
const originalTriggerSurprise = triggerSurprise;
triggerSurprise = function() {
    originalTriggerSurprise();
    setTimeout(burstConfetti, 300);
};
