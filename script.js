const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Resize canvas for mobile compatibility
function resizeCanvas() {
    canvas.width = window.innerWidth > 800 ? 800 : window.innerWidth;
    canvas.height = window.innerHeight > 400 ? 400 : window.innerHeight / 2;
}
resizeCanvas(); // Call the function initially

window.addEventListener('resize', resizeCanvas); // Resize canvas when window size changes

// Load images
const playerImage = new Image();
playerImage.src = 'player.png';
const platformImage = new Image();
platformImage.src = 'platform.png';
const coinImage = new Image();
coinImage.src = 'coin.png';
const coin2Image = new Image();
coin2Image.src = 'coin2.png'; // Replace with your coin2 image path
const enemyImage = new Image();
enemyImage.src = 'enemy.png';

// Game variables
let score = 0;
let gameSpeed = 2;
let isGameOver = true; // Game starts as over

// Player properties
const player = {
    x: 50,
    y: canvas.height - 100,
    width: 50,
    height: 50,
    speed: 5,
    dy: 0,
    gravity: 0.5,
    jumpPower: 10,
    grounded: false
};

// Key press tracking
const keys = {
    right: false,
    left: false,
    up: false
};

// Platform properties
let platforms = [
    { x: 0, y: canvas.height - 50, width: canvas.width, height: 50 },
    { x: 400, y: canvas.height - 100, width: 100, height: 20 },
    { x: 800, y: canvas.height - 150, width: 150, height: 20 },
    { x: 1200, y: canvas.height - 200, width: 100, height: 20 }
];

// Initial platforms (for restart)
const initialPlatforms = JSON.parse(JSON.stringify(platforms));

// Coin properties
let coins = [
    { x: 500, y: canvas.height - 150, width: 30, height: 30 },
    { x: 600, y: canvas.height - 200, width: 30, height: 30 },
    { x: 700, y: canvas.height - 250, width: 30, height: 30 },
    { x: 900, y: canvas.height - 200, width: 30, height: 30 },
    { x: 1000, y: canvas.height - 150, width: 30, height: 30 },
    { x: 1100, y: canvas.height - 100, width: 30, height: 30 }
];

// Initial coins (for restart)
const initialCoins = JSON.parse(JSON.stringify(coins));

// Enemy properties
let enemies = [];

// Game properties
let enemyFrequency = 3000; // Initial enemy spawn frequency
let maxEnemies = 5; // Maximum number of enemies on screen
let lastEnemySpawn = 0;

// Event listeners for key presses
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

function handleKeyDown(e) {
    if (e.code === 'ArrowRight') keys.right = true;
    if (e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'ArrowUp') keys.up = true;
}

function handleKeyUp(e) {
    if (e.code === 'ArrowRight') keys.right = false;
    if (e.code === 'ArrowLeft') keys.left = false;
    if (e.code === 'ArrowUp') keys.up = false;
}

// Event listener for restart button click
document.getElementById('restartButton').addEventListener('click', () => {
    restartGame();
    requestAnimationFrame(gameLoop); // Restart game loop
});

// Event listener for start button click
document.getElementById('startButton').addEventListener('click', () => {
    startGame();
});

// Function to start the game
function startGame() {
    document.getElementById('startButton').style.display = 'none'; // Hide the start button
    document.getElementById('controls').style.display = 'block'; // Show game controls

    isGameOver = false;
    requestAnimationFrame(gameLoop);
}

// Game loop
function gameLoop(timestamp) {
    if (isGameOver) {
        ctx.fillStyle = 'black';
        ctx.font = '48px "Press Start 2P"';
        ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
        ctx.font = '24px "Press Start 2P"';
        ctx.fillText(`Score: ${score}`, canvas.width / 2 - 50, canvas.height / 2 + 30);
        document.getElementById('restartButton').style.display = 'block'; // Show restart button
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlatforms();
    updatePlatforms();
    drawPlayer();
    updatePlayer();
    drawCoins();
    updateCoins();
    drawEnemies();
    updateEnemies(timestamp);
    drawScore();
    requestAnimationFrame(gameLoop);
}

// Function to draw player
function drawPlayer() {
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
}

// Function to draw platforms
function drawPlatforms() {
    platforms.forEach(platform => {
        ctx.drawImage(platformImage, platform.x, platform.y, platform.width, platform.height);
    });
}

// Function to draw coins
function drawCoins() {
    coins.forEach(coin => {
        ctx.drawImage(coinImage, coin.x, coin.y, coin.width, coin.height);
    });
}

// Function to draw enemies
function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

// Function to update player position
function updatePlayer() {
    // Horizontal movement
    if (keys.right) player.x += player.speed;
    if (keys.left) player.x -= player.speed;

    // Jumping
    if (keys.up && player.grounded) {
        player.dy = -player.jumpPower;
        player.grounded = false;
    }

    // Apply gravity
    player.dy += player.gravity;
    player.y += player.dy;

    // Collision detection with platforms
    player.grounded = false;
    platforms.forEach(platform => {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y < platform.y + platform.height &&
            player.y + player.height > platform.y) {
                // Player is on top of the platform
                if (player.dy > 0) {
                    player.y = platform.y - player.height;
                    player.dy = 0;
                    player.grounded = true;
                }
            }
    });

    // Collision detection with coins
    coins = coins.filter(coin => {
        if (player.x < coin.x + coin.width &&
            player.x + player.width > coin.x &&
            player.y < coin.y + coin.height &&
            player.y + player.height > coin.y) {
                score += 1;
                // playSound('coin.mp3'); // Uncomment and replace with your coin sound path
                return false;
        }
        return true;
    });

    // Collision detection with enemies
    enemies.forEach(enemy => {
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
                isGameOver = true;
                // Handle collision with enemies (e.g., display effect or play sound)
        }
    });

    // Prevent player from falling through the ground
    if (player.y + player.height > canvas.height) {
        isGameOver = true;
    }

    // Keep player within canvas bounds
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

// Function to update platforms
function updatePlatforms() {
    platforms.forEach(platform => {
        platform.x -= gameSpeed;

        // Recycle platform if it goes off screen
        if (platform.x + platform.width < 0) {
            platform.x = canvas.width + Math.random() * 200;
            platform.y = canvas.height - 50 - Math.random() * 200;
            platform.width = 50 + Math.random() * 100;
            score++;
            gameSpeed += 0.1; // Increase game speed
        }
    });
}

// Function to update coins
function updateCoins() {
    coins.forEach(coin => {
        coin.x -= gameSpeed; // Move coins from right to left

        // Recycle coins if they go off-screen
        if (coin.x + coin.width < 0) {
            coin.x = canvas.width + Math.random() * 200;
            coin.y = canvas.height - 50 - Math.random() * 200;
        }
    });
}

// Function to update enemies
function updateEnemies(timestamp) {
    if (timestamp - lastEnemySpawn > enemyFrequency && enemies.length < maxEnemies) {
        enemies.push({
            x: canvas.width,
            y: canvas.height - 70 - Math.random() * 50,
            width: 50,
            height: 50,
            speed: gameSpeed * (1 + Math.random())
        });
        lastEnemySpawn = timestamp;
        enemyFrequency = Math.max(2500, enemyFrequency - 50); // Increase enemy spawn rate over time
    }

    enemies.forEach(enemy => {
        enemy.x -= enemy.speed; // Move enemies from right to left

        // Remove enemies if they go off-screen
        if (enemy.x + enemy.width < 0) {
            enemies.shift();
        }
    });
}

// Function to draw score
function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '24px "Press Start 2P"';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

// Function to restart the game
function restartGame() {
    score = 0;
    gameSpeed = 2;
    isGameOver = true; // Set game over initially
    player.x = 50;
    player.y = canvas.height - 100;
    player.dy = 0;
    player.grounded = false;
    platforms = JSON.parse(JSON.stringify(initialPlatforms)); // Reset platforms
    coins = JSON.parse(JSON.stringify(initialCoins)); // Reset coins
    enemies = []; // Clear enemies
    lastEnemySpawn = 0;
    enemyFrequency = 3000; // Reset enemy spawn frequency
    document.getElementById('restartButton').style.display = 'none'; // Hide restart button
    document.getElementById('startButton').style.display = 'block'; // Show start button
}
