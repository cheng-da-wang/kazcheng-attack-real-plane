const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const BULLET_SPEED = 5;

const gameState = {
  score: 0,
  hp: 100,
  timer: 60 * 1000,
};

const spaceship = {
  x: 200,
  y: canvas.height / 2,
  width: 50 * 6,
  height: 30 * 6,
  speed: 50,
  speedX: 60,
};

const backgroundImage = new Image();
backgroundImage.src = "background.jpg";

const spaceshipImage = new Image();
spaceshipImage.src = "spaceship.png";

const enemyImages = [];
for (let i = 1; i <= 4; i++) {
  const img = new Image();
  img.src = "enemy" + i + ".png"; // Set your own image files names
  enemyImages.push(img);
}

const bulletImage = new Image();
bulletImage.src = "bullet.png";

const explosionImage = new Image();
explosionImage.src = "explosion_spritesheet.png";
const explosionFrames = 16;
const explosionSize = {
  width: 64,
  height: 64,
};

const spaceshipPowerUp = {
  isActive: false,
  timer: null,
};

let backgroundX = 0;

function drawBackground() {
  ctx.drawImage(backgroundImage, backgroundX, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImage, backgroundX + canvas.width, 0, canvas.width, canvas.height);
}

function drawSpaceship() {
  ctx.drawImage(spaceshipImage, spaceship.x, spaceship.y, spaceship.width, spaceship.height);
}

document.addEventListener("keydown", (e) => {
  if (e.code === "ArrowUp" && spaceship.y > 0) {
    spaceship.y -= spaceship.speed;
  } else if (e.code === "ArrowDown" && spaceship.y < canvas.height - spaceship.height) {
    spaceship.y += spaceship.speed;
  } else if (e.code === "ArrowLeft" && spaceship.x > 0) {
    spaceship.x -= spaceship.speedX;
  } else if (e.code === "ArrowRight" && spaceship.x < canvas.width - spaceship.width) {
    spaceship.x += spaceship.speedX;
  } else if (e.code === "Space") {
    shootBullet();
  }
});

const enemies = [];

function spawnEnemy() {
  const enemyType = Math.floor(Math.random() * 4);
  const baseSpeed = 3;
  const enemy = {
    type: enemyType,
    x: canvas.width,
    y: Math.random() * (canvas.height - 30 * 6),
    width: 50 * 6,
    height: 30 * 6,
    speed: baseSpeed + enemyType * 2 + Math.random() * 3,
  };

  enemies.push(enemy);
}

function moveEnemies() {
  enemies.forEach((enemy, index) => {
    switch (enemy.type) {
      case 0:
        enemy.x -= enemy.speed;
        break;
      case 1:
        enemy.x -= enemy.speed;
        enemy.y += Math.sin(enemy.x / 20) * 5;
        break;
      case 2:
        enemy.x -= enemy.speed * 0.8;
        enemy.y += Math.cos(enemy.x / 50) * 5;
        break;
      case 3:
        enemy.x -= enemy.speed * 0.6;
        enemy.y -= Math.sin(enemy.x / 33) * 5;
        break;
    }

    if (enemy.x < -enemy.width) {
      enemies.splice(index, 1);
    }
  });
}

function drawEnemies() {
  enemies.forEach((enemy) => {
    ctx.drawImage(enemyImages[enemy.type], enemy.x, enemy.y, enemy.width, enemy.height);
  });
}

function manageEnemies() {
  if (Math.random() < 0.02) {
    spawnEnemy();
  }
  moveEnemies();
  drawEnemies();
}

const bullets = [];

function shootBullet() {
  const basicBullet = {
    x: spaceship.x + spaceship.width,
    y: spaceship.y + spaceship.height / 2,
    width: 30 * 6,
    height: 20 * 6,
    speed: BULLET_SPEED,
};

if (!spaceshipPowerUp.isActive) {
  bullets.push(basicBullet);
} else {
  bullets.push(basicBullet);
  bullets.push({
    ...basicBullet,
    y: spaceship.y + spaceship.height / 2 - 40,
  });
  bullets.push({
    ...basicBullet,
    y: spaceship.y + spaceship.height / 2 + 40,
  });
}
}

function moveBullets() {
bullets.forEach((bullet, index) => {
  bullet.x += bullet.speed;
  if (bullet.x > canvas.width) {
    bullets.splice(index, 1);
  }
});
}

function drawBullets() {
bullets.forEach((bullet) => {
  ctx.drawImage(bulletImage, bullet.x, bullet.y, bullet.width, bullet.height);
});
}

function isColliding(a, b) {
return (
  a.x < b.x + b.width &&
  a.x + a.width > b.x &&
  a.y < b.y + b.height &&
  a.y + a.height > b.y
);
}

function checkBulletEnemyCollisions() {
for (let iBullet = bullets.length - 1; iBullet >= 0; iBullet--) {
  const bullet = bullets[iBullet];

  for (let iEnemy = enemies.length - 1; iEnemy >= 0; iEnemy--) {
    const enemy = enemies[iEnemy];

    if (isColliding(bullet, enemy)) {
      bullets.splice(iBullet, 1);
      enemies.splice(iEnemy, 1);
      gameState.score += 100;
      break;
    }
  }
}
}

function checkSpaceshipEnemyCollisions() {
enemies.forEach((enemy) => {
  if (isColliding(spaceship, enemy)) {
    gameState.hp -= 10;
  }
});
}

const powerUps = [];

function spawnPowerUp() {
const powerUp = {
  x: canvas.width,
  y: Math.random() * (canvas.height - 30),
  width: 30,
  height: 30,
  speed: 3 + Math.random() * 3,
};

powerUps.push(powerUp);
}

function movePowerUps() {
powerUps.forEach((powerUp, index) => {
  powerUp.x -= powerUp.speed;
  if (powerUp.x < -powerUp.width) {
    powerUps.splice(index, 1);
  }
});
}

function drawPowerUps() {
ctx.fillStyle = "green";
powerUps.forEach((powerUp) => {
  ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
});
}

function checkSpaceshipPowerUpCollisions() {
powerUps.forEach((powerUp, index) => {
  if (isColliding(spaceship, powerUp)) {
    powerUps.splice(index, 1);
    activateSpaceshipPowerUp();
  }
});
}

function drawScore() {
ctx.font = "20px Arial";
ctx.fillStyle = "black";
ctx.fillText("Score: " + gameState.score, 10, 30);
}

function drawHp() {
ctx.font = "20px Arial";
ctx.fillStyle = "black";
ctx.fillText("HP: " + gameState.hp, 10, 60);
}

function drawGameOver() {
ctx.font = "40px Arial";
ctx.fillStyle = "red";
ctx.fillText("GAME OVER", canvas.width / 2 - 100, canvas.height / 2);

setTimeout(() => {
  location.reload(); // Reload the page to restart the game
}, 3000);
}

function drawNextLevel() {
ctx.font = "32px Arial";
ctx.fillStyle = "green";
ctx.fillText("进入下一关", canvas.width / 2 - 80, canvas.height / 2);

setTimeout(() => {
  location.reload(); // Reload the page to restart the game at the next level
}, 3000);
}

function clearCanvas() {
ctx.clearRect(0, 0, canvas.width, canvas.height);
}

let startTimestamp = null;
let lastPowerUpSpawn = 0;

function gameLoop(timestamp) {
if (gameState.hp <= 0) {
  drawGameOver();
  return;
}

if (startTimestamp === null) {
  startTimestamp = timestamp;
}

if (timestamp - startTimestamp > gameState.timer && gameState.hp > 0) {
  drawNextLevel();
  return;
}

clearCanvas();

backgroundX -= 2;
if (backgroundX <= -canvas.width) {
  backgroundX = 0;
}

drawBackground();
drawSpaceship();
manageEnemies();
moveBullets();
drawBullets();
checkBulletEnemyCollisions();
checkSpaceshipEnemyCollisions();
movePowerUps();
drawPowerUps();
checkSpaceshipPowerUpCollisions();
drawScore();
drawHp();

requestAnimationFrame(gameLoop);
}

gameLoop(0);