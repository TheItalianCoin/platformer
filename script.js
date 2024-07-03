const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = Math.min(800, window.innerWidth);
    canvas.height = Math.min(400, window.innerHeight / 2);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const loadImage = src => {
    const img = new Image();
    img.src = src;
    return img;
};
const loadSound = src => new Audio(src);

const playerImage = loadImage('img/player.png');
const platformImage = loadImage('img/platform.png');
const coinImage = loadImage('img/coin.png');
const enemyImage = loadImage('img/enemy.png');
const bgImage = loadImage('img/background.png'); // Immagine di sfondo
const gameOverImage = loadImage('img/gameover.gif'); // Immagine di game over

const jumpSound = loadSound('sound/jumpSound.mp3');
const coinSound = loadSound('sound/coinSound.mp3');
const gameOverSound = loadSound('sound/gameOverSound.mp3');

let score = 0;
let gameSpeed = 2;
let isGameOver = true;
let isGameStarted = false;

const player = {
    x: 50,
    y: canvas.height - 100,
    width: 50,
    height: 50,
    speed: 5,
    dy: 0,
    gravity: 0.6,
    jumpPower: 12,
    grounded: false
};

const keys = { right: false, left: false, up: false };

let platforms = [
    { x: 0, y: canvas.height - 50, width: canvas.width, height: 50 },
    { x: 400, y: canvas.height - 60, width: 80, height: 60 },
    { x: 800, y: canvas.height - 120, width: 160, height: 60 },
    { x: 1200, y: canvas.height - 180, width: 140, height: 60 }
];
const initialPlatforms = JSON.parse(JSON.stringify(platforms));

let coins = [
    { x: 500, y: canvas.height - 150, width: 30, height: 30 },
    { x: 600, y: canvas.height - 200, width: 30, height: 30 },
    { x: 700, y: canvas.height - 250, width: 30, height: 30 },
    { x: 900, y: canvas.height - 200, width: 30, height: 30 },
    { x: 1000, y: canvas.height - 150, width: 30, height: 30 },
    { x: 1100, y: canvas.height - 100, width: 30, height: 30 }
];
const initialCoins = JSON.parse(JSON.stringify(coins));

let enemies = [];
let enemyFrequency = 3000;
let maxEnemies = 5;
let lastEnemySpawn = 0;

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

document.getElementById('startButton').addEventListener('click', startButtonClick);

function startButtonClick() {
    startGame();
    resetBackgroundMusic();
}

function startGame() {
    score = 0;
    gameSpeed = 2;
    isGameOver = false;
    isGameStarted = true;
    player.x = 50;
    player.y = canvas.height - 100;
    player.dy = 0;
    player.grounded = false;
    platforms = JSON.parse(JSON.stringify(initialPlatforms));
    coins = JSON.parse(JSON.stringify(initialCoins));
    enemies = [];
    lastEnemySpawn = 0;
    enemyFrequency = 3000;

    document.getElementById('startButton').style.display = 'none';
    document.getElementById('introVideo').style.display = 'none';
    canvas.style.display = 'block';

    playBackgroundMusic();
    requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
    if (isGameOver) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGameOver(); // Disegna l'immagine di game over

        ctx.fillStyle = 'black';
        ctx.font = '24px "Press Start 2P"';
        const scoreText = `Score: ${score}`;
        const scoreTextWidth = ctx.measureText(scoreText).width;
        ctx.fillText(scoreText, canvas.width / 2 - scoreTextWidth / 2, canvas.height / 2 + 30);

        document.getElementById('startButton').style.display = 'block';
        pauseBackgroundMusic();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground(); // Disegna l'immagine di sfondo
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

function drawGameOver() {
    ctx.drawImage(gameOverImage, 0, 0, canvas.width, canvas.height);
}

function drawBackground() {
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
}

function drawPlayer() {
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
}

function drawPlatforms() {
    platforms.forEach(platform => {
        let xPos = platform.x;
        while (xPos < platform.x + platform.width) {
            ctx.drawImage(platformImage, xPos, platform.y, 60, 60);
            xPos += 60;
        }
    });
}

function drawCoins() {
    coins.forEach(coin => {
        ctx.drawImage(coinImage, coin.x, coin.y, coin.width, coin.height);
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '24px "Press Start 2P"';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function updatePlayer() {
    if (keys.right) player.x += player.speed;
    if (keys.left) player.x -= player.speed;

    if (keys.up && player.grounded) {
        player.dy = -player.jumpPower;
        player.grounded = false;
        jumpSound.currentTime = 0;
        jumpSound.play();
    }

    player.dy += player.gravity;
    player.y += player.dy;

    player.grounded = false;
    platforms.forEach(platform => {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y < platform.y + platform.height &&
            player.y + player.height > platform.y) {
                if (player.dy > 0) {
                    player.y = platform.y - player.height;
                    player.dy = 0;
                    player.grounded = true;
                }
            }
    });

    coins = coins.filter(coin => {
        if (player.x < coin.x + coin.width &&
            player.x + player.width > coin.x &&
            player.y < coin.y + coin.height &&
            player.y + player.height > coin.y) {
                score++;
                coinSound.currentTime = 0;
                coinSound.play();
                return false;
        }
        return true;
    });

    enemies.forEach(enemy => {
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
                isGameOver = true;
                gameOverSound.currentTime = 0;
                gameOverSound.play();
        }
    });

    if (player.y + player.height > canvas.height) {
        isGameOver = true;
        gameOverSound.currentTime = 0;
        gameOverSound.play();
    }

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

function updatePlatforms() {
    platforms.forEach(platform => {
        platform.x -= gameSpeed;

        if (platform.x + platform.width < 0) {
            let newX = canvas.width + Math.random() * 200;
            let newY = canvas.height - 50 - Math.random() * 200;
            let newWidth = 50 + Math.random() * 100;

            let overlaps = platforms.some(existingPlatform => {
                return (newX < existingPlatform.x + existingPlatform.width &&
                        newX + newWidth > existingPlatform.x &&
                        newY < existingPlatform.y + existingPlatform.height &&
                        newY + 50 > existingPlatform.y);
            });

            if (!overlaps) {
                platform.x = newX;
                platform.y = newY;
                platform.width = newWidth;
                score++;
                gameSpeed += 0.1;
            }
        }
    });
}

function updateCoins() {
    coins.forEach(coin => {
        coin.x -= gameSpeed;

        if (coin.x + coin.width < 0) {
            coin.x = canvas.width + Math.random() * 200;
            coin.y = canvas.height - 50 - Math.random() * 200;
        }
    });
}

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
        enemyFrequency = Math.max(2500, enemyFrequency - 50);
    }

    enemies.forEach(enemy => {
        enemy.x -= enemy.speed;

        if (enemy.x + enemy.width < 0) {
            enemies.shift();
        }
    });
}

const bgMusic = new Audio('sound/bgMusic.mp3');

function playBackgroundMusic() {
    bgMusic.currentTime = 0;
    bgMusic.loop = true;
    bgMusic.volume = 0.5;
    bgMusic.play();
}

function pauseBackgroundMusic() {
    bgMusic.pause();
}

function resetBackgroundMusic() {
    pauseBackgroundMusic();
    bgMusic.currentTime = 0;
    playBackgroundMusic();
}
