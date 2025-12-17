const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let startScreen = document.getElementById("startScreen");
let endingScreen = document.getElementById("endingScreen");
let dialogueBox = document.getElementById("dialogueBox");
let coinText = document.getElementById("coinCount");
let timerText = document.getElementById("timer");

let catImg = new Image();
catImg.src = "assets/image1.png";

let monsterImg = new Image();
monsterImg.src = "assets/image2.png";

let coinImg = new Image();
coinImg.src = "assets/image3.png";

let bgImage = new Image();
bgImage.src = "assets/bg.png";

let gameStarted = false;
let gameEnded = false;

let timeLimit = 90; 
let timer = 0;

let keys = {};
let gravity = 1.1;

let player = {
    x: 50,
    y: 400,
    width: 80,
    height: 80,
    dx: 0,
    dy: 0,
    speed: 5,
    jumpPower: 18,
    canDoubleJump: true,
    onGround: false,
    dash: false,
};

let platforms = [];
let coins = [];
let monsters = [];

let coinCount = 0;

// Generate platforms (8)
for (let i = 0; i < 8; i++) {
    platforms.push({
        x: 400 + i * 250,
        y: 350 - (Math.random() * 120),
        width: 150,
        height: 20
    });
}

// Generate coins (10)
for (let i = 0; i < 10; i++) {
    coins.push({
        x: 300 + i * 200,
        y: 250 - (Math.random() * 150),
        collected: false
    });
}

// Generate monsters (7)
for (let i = 0; i < 7; i++) {
    monsters.push({
        x: 600 + i * 350,
        y: 430,
        width: 60,
        height: 60
    });
}

// Dialogue trigger positions
let dialoguePoints = [900, 1800, 2600];
let currentDialogueIndex = 0;
let dialogueActive = false;
let selectedItem = null;

document.addEventListener("keydown", (e) => keys[e.key] = true);
document.addEventListener("keyup", (e) => keys[e.key] = false);


// Main game loop
function update() {
    if (!gameStarted || dialogueActive || gameEnded) return;

    timer += 1 / 60;
    timerText.textContent = "Time: " + Math.floor(timer);

    if (timer >= timeLimit) {
        endGame(false);
    }

    // Move left/right
    if (keys["a"]) player.x -= player.speed;
    if (keys["d"]) player.x += player.speed;

    // Dash when item is unlocked
    if (player.dash && keys["Shift"]) {
        player.x += 10;
    }

    // Jump
    if (keys["w"]) {
        if (player.onGround) {
            player.dy = -player.jumpPower;
            player.onGround = false;
        } else if (player.canDoubleJump) {
            player.dy = -player.jumpPower;
            player.canDoubleJump = false;
        }
    }

    player.dy += gravity;
    player.y += player.dy;

    if (player.y > 400) {
        player.y = 400;
        player.onGround = true;
        player.canDoubleJump = true;
    }

    // Check platforms
    platforms.forEach(p => {
        if (player.x + player.width > p.x &&
            player.x < p.x + p.width &&
            player.y + player.height > p.y &&
            player.y + player.height < p.y + 20 &&
            player.dy > 0
        ) {
            player.y = p.y - player.height;
            player.dy = 0;
            player.onGround = true;
            player.canDoubleJump = true;
        }
    });

    // Monsters collision → restart
    monsters.forEach(m => {
        if (player.x < m.x + m.width &&
            player.x + player.width > m.x &&
            player.y < m.y + m.height &&
            player.y + player.height > m.y
        ) {
            restartGame();
        }
    });

    // Coin collection
    coins.forEach(c => {
        if (!c.collected &&
            player.x < c.x + 40 &&
            player.x + player.width > c.x &&
            player.y < c.y + 40 &&
            player.y + player.height > c.y
        ) {
            c.collected = true;
            coinCount++;
            coinText.textContent = "Coins: " + coinCount + " / 10";
        }
    });

    // Narrative interaction trigger
    if (currentDialogueIndex < dialoguePoints.length &&
        player.x >= dialoguePoints[currentDialogueIndex]) {
        showDialogue();
        currentDialogueIndex++;
    }

    // Win condition
    if (player.x >= 3500 && coinCount >= 7) {
        endGame(true);
    }

    draw();
    requestAnimationFrame(update);
}


// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.drawImage(bgImage, -player.x / 3, 0, 2000, 600);

    // Platforms
    ctx.fillStyle = "#444";
    platforms.forEach(p => ctx.fillRect(p.x - player.x + 200, p.y, p.width, p.height));

    // Coins
    coins.forEach(c => {
        if (!c.collected) {
            ctx.drawImage(coinImg, c.x - player.x + 200, c.y, 40, 40);
        }
    });

    // Monsters
    monsters.forEach(m => {
        ctx.drawImage(monsterImg, m.x - player.x + 200, m.y, m.width, m.height);
    });

    // Player
    ctx.drawImage(catImg, 200, player.y, player.width, player.height);
}


// Dialogue system
function showDialogue() {
    dialogueActive = true;
    dialogueBox.style.display = "block";
}

document.querySelectorAll(".choiceBtn").forEach(btn => {
    btn.addEventListener("click", () => {
        let item = btn.dataset.item;
        applyItem(item);
        dialogueActive = false;
        dialogueBox.style.display = "none";
    });
});

function applyItem(item) {
    if (item === "spring") {
        player.jumpPower = 28;
        setTimeout(() => player.jumpPower = 18, 5000);
    }
    if (item === "fish") {
        player.speed = 9;
        setTimeout(() => player.speed = 5, 5000);
    }
    if (item === "balloon") {
        gravity = 0.3;
        setTimeout(() => gravity = 1.1, 5000);
    }
}


// Restart game if hit monster
function restartGame() {
    location.reload();
}


// Ending screen
function endGame(success) {
    gameEnded = true;
    endingScreen.style.display = "flex";
    document.getElementById("endingMessage").textContent =
        success ? 
        "You collected enough coins! Great job!" : 
        "Time is up!";
}


// Start button
document.getElementById("startBtn").onclick = () => {
    startScreen.style.display = "none";
    gameStarted = true;
    update();
};

// Restart button
document.getElementById("restartBtn").onclick = () => {
    location.reload();
};
