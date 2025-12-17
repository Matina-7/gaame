// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// Game variables
let score = 0;
const scoreElement = document.getElementById('score');

// Load images
const images = {
    cat: new Image(),
    monster: new Image(),
    coin: new Image(),
    background: new Image()
};

images.cat.src = 'assets/image1.png';
images.monster.src = 'assets/image2.png';
images.coin.src = 'assets/image3.png';
images.background.src = 'assets/bg.png';

// Game objects
const player = {
    x: 100,
    y: canvas.height - 150,
    width: 80,
    height: 80,
    speed: 5,
    dx: 0,
    dy: 0
};

const coins = [];
const monsters = [];

// Keyboard controls
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Update player movement
function updatePlayer() {
    if (keys['ArrowLeft'] || keys['a']) {
        player.dx = -player.speed;
    } else if (keys['ArrowRight'] || keys['d']) {
        player.dx = player.speed;
    } else {
        player.dx = 0;
    }

    if (keys['ArrowUp'] || keys['w']) {
        player.dy = -player.speed;
    } else if (keys['ArrowDown'] || keys['s']) {
        player.dy = player.speed;
    } else {
        player.dy = 0;
    }

    player.x += player.dx;
    player.y += player.dy;

    // Boundary detection
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
}

// Create coins
function createCoin() {
    const coin = {
        x: Math.random() * (canvas.width - 50),
        y: Math.random() * (canvas.height - 50),
        width: 40,
        height: 40
    };
    coins.push(coin);
}

// Create monsters
function createMonster() {
    const monster = {
        x: Math.random() * (canvas.width - 60),
        y: -60,
        width: 60,
        height: 60,
        speed: 2 + Math.random() * 2
    };
    monsters.push(monster);
}

// Update monsters
function updateMonsters() {
    monsters.forEach((monster, index) => {
        monster.y += monster.speed;

        // Remove if off screen
        if (monster.y > canvas.height) {
            monsters.splice(index, 1);
        }

        // Check collision with player
        if (checkCollision(player, monster)) {
            alert('Game Over! Score: ' + score);
            resetGame();
        }
    });
}

// Check collision
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Collect coins
function collectCoins() {
    coins.forEach((coin, index) => {
        if (checkCollision(player, coin)) {
            coins.splice(index, 1);
            score += 10;
            scoreElement.textContent = 'Score: ' + score;
        }
    });
}

// Draw everything
function draw() {
    // Draw background
    ctx.drawImage(images.background, 0, 0, canvas.width, canvas.height);

    // Draw player (cat)
    ctx.drawImage(images.cat, player.x, player.y, player.width, player.height);

    // Draw coins
    coins.forEach(coin => {
        ctx.drawImage(images.coin, coin.x, coin.y, coin.width, coin.height);
    });

    // Draw monsters
    monsters.forEach(monster => {
        ctx.drawImage(images.monster, monster.x, monster.y, monster.width, monster.height);
    });
}

// Reset game
function resetGame() {
    score = 0;
    scoreElement.textContent = 'Score: ' + score;
    coins.length = 0;
    monsters.length = 0;
    player.x = 100;
    player.y = canvas.height - 150;
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updatePlayer();
    updateMonsters();
    collectCoins();
    draw();
    requestAnimationFrame(gameLoop);
}

// Initialize game
let coinInterval;
let monsterInterval;

images.background.onload = () => {
    // Start game when all images are loaded
    gameLoop();

    // Spawn coins every 3 seconds
    coinInterval = setInterval(createCoin, 3000);

    // Spawn monsters every 2 seconds
    monsterInterval = setInterval(createMonster, 2000);

    // Create initial coins
    createCoin();
    createCoin();
};
