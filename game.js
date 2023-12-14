const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gravity = 0.1;
const friction = 0.5;

// Player properties
const player = {
    x: 100,
    y: 500,
    width: 25,
    height: 25,
    color: 'blue',
    speed: 2,
    velocityX: 0,
    velocityY: 0,
    jumpStrength: 5,
    jumping: false,

};

let platforms = [];
let collectibles = [];
let enemies = [];
let currentLevel = 1;

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawPlatform(platform) {
    ctx.fillStyle = platform.color;
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
}

function drawCollectible(collectible) {
    if (!collectible.collected) {
        ctx.fillStyle = collectible.color;
        ctx.fillRect(collectible.x, collectible.y, collectible.width, collectible.height);
    }
}

function angleBetweenVectors(v1, v2) {
    const dot = v1.x * v2.x + v1.y * v2.y;
    const magnitude1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const magnitude2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
    return Math.acos(dot / (magnitude1 * magnitude2));
}



function drawEnemy(enemy) {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

    // Define the vision cone angle (22.5 degrees in radians)
    const visionConeAngle = Math.PI / 8; 

    ctx.beginPath();
    ctx.moveTo(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);

    if (enemy.velocityX > 0) {
        // Right-facing vision cone
        ctx.lineTo(enemy.x + enemy.width / 2 + enemy.visionRange * Math.cos(-visionConeAngle), 
                   enemy.y + enemy.height / 2 + enemy.visionRange * Math.sin(-visionConeAngle));
        ctx.lineTo(enemy.x + enemy.width / 2 + enemy.visionRange * Math.cos(visionConeAngle), 
                   enemy.y + enemy.height / 2 + enemy.visionRange * Math.sin(visionConeAngle));
    } else {
        // Left-facing vision cone
        ctx.lineTo(enemy.x + enemy.width / 2 + enemy.visionRange * Math.cos(Math.PI + visionConeAngle), 
                   enemy.y + enemy.height / 2 + enemy.visionRange * Math.sin(Math.PI + visionConeAngle));
        ctx.lineTo(enemy.x + enemy.width / 2 + enemy.visionRange * Math.cos(Math.PI - visionConeAngle), 
                   enemy.y + enemy.height / 2 + enemy.visionRange * Math.sin(Math.PI - visionConeAngle));
    }

    ctx.closePath();
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx.fill();
}


let gameRunning = true;

function showGameOverMenu() {
    document.getElementById("gameOverMenu").classList.add("show");
    document.getElementById("gameCanvas").style.display = 'none';
    gameRunning = false;
}

function restartLevel() {
    document.getElementById("gameOverMenu").classList.remove("show");
    document.getElementById("gameCanvas").style.display = 'block';
    resetGameState(currentLevel);
    gameRunning = true;
    cancelAnimationFrame(animationFrameId); // Cancel any existing game loop
    update();
}

function showMainMenu() {
    document.getElementById("mainMenu").classList.add("show");
    document.getElementById("gameOverMenu").classList.remove("show");
    document.getElementById("gameCanvas").style.display = 'none';
    gameRunning = false;
}



function updateEnemy(enemy) {
    enemy.x += enemy.velocityX;
    if (enemy.x > enemy.endX || enemy.x < enemy.startX) {
        enemy.velocityX *= -1;
    }
    drawEnemy(enemy);

    // Create direction vector based on the enemy's current direction
    const directionVector = { x: enemy.velocityX > 0 ? 1 : -1, y: 0 };

    // Vector from enemy to player
    const toPlayerVector = { x: player.x - enemy.x, y: player.y - enemy.y };

    // Calculate the angle between the direction vector and toPlayerVector
    const angle = angleBetweenVectors(directionVector, toPlayerVector);

    // Check if player is within vision cone (45 degrees total) and within vision range
    if (angle < Math.PI / 8 && Math.hypot(toPlayerVector.x, toPlayerVector.y) < enemy.visionRange) {
        showGameOverMenu();
        console.log("Player Detected! Game Over!");
    }
}



function resetGameState(level) {
    // Clear existing game state
    platforms = [];
    collectibles = [];
    enemies = [];

    // General player setup for all levels
    player.x = 100;
    player.y = 500;
    player.velocityX = 0;
    player.velocityY = 0;
    player.jumping = false;

    // Level-specific setup
    if (level === 1) {
        // Level 1 setup (original setup)
        platforms.push(
            { x: 0, y: 550, width: canvas.width, height: 20, color: 'saddlebrown' },
            { x: 0, y: 350, width: 500, height: 20, color: 'grey' },
            { x: 800, y: 350, width: 400, height: 20, color: 'grey' },
            { x: 0, y: 150, width: 400, height: 20, color: 'grey' },
            { x: 900, y: 150, width: 300, height: 20, color: 'grey' },
            { x: 550, y: 450, width: 200, height: 20, color: 'peru' },
            { x: 400, y: 250, width: 200, height: 20, color: 'peru' },
            { x: 700, y: 250, width: 200, height: 20, color: 'peru' },
            // Add other platforms as needed
        );
        collectibles.push({ x: 150, y: 320, width: 10, height: 10, color: 'gold', collected: false });
        enemies.push({ x: 200, y: 520, width: 30, height: 30, color: 'red', velocityX: 1, visionRange: 200, startX: 0, endX: canvas.width },
                     { x: 300, y: 320, width: 30, height: 30, color: 'red', velocityX: 1, visionRange: 200, startX: 0, endX: 500 });
    } else if (level === 2) {
        // Level 2 setup
        platforms.push(
            // More and smaller platforms
            { x: 100, y: 500, width: 300, height: 20, color: 'grey' },
            { x: 500, y: 400, width: 200, height: 20, color: 'grey' },
            { x: 800, y: 300, width: 150, height: 20, color: 'grey' },
            // Moving platform
            { x: 200, y: 200, width: 100, height: 20, color: 'peru', isMoving: true, moveDirection: 'horizontal', moveRange: [200, 400] }
            // ... Add more as needed
        );
        collectibles.push(
            // Collectibles in challenging locations
            { x: 350, y: 380, width: 10, height: 10, color: 'silver', collected: false },
            { x: 850, y: 280, width: 10, height: 10, color: 'silver', collected: false }
            // ... Add more as needed
        );
        enemies.push(
            // Faster and more enemies
            { x: 100, y: 480, width: 30, height: 30, color: 'green', velocityX: 1.5, visionRange: 150, startX: 100, endX: 400 },
            // ... Add more as needed
        );
    } else if (level === 3) {
        // Level 3 setup
        platforms.push(
            // Complex platform arrangements
            { x: 50, y: 450, width: 250, height: 20, color: 'brown' },
            { x: 400, y: 350, width: 100, height: 20, color: 'brown' },
            // Disappearing platform
            { x: 600, y: 250, width: 120, height: 20, color: 'peru', isDisappearing: true, disappearTime: 3000 }
            // ... Add more as needed
        );
        collectibles.push(
            // Hard-to-reach collectibles
            { x: 450, y: 330, width: 10, height: 10, color: 'bronze', collected: false },
            { x: 650, y: 230, width: 10, height: 10, color: 'bronze', collected: false }
            // ... Add more as needed
        );
        enemies.push(
            // Challenging enemies
            { x: 60, y: 430, width: 30, height: 30, color: 'purple', velocityX: 2, visionRange: 200, startX: 50, endX: 300 },
            // ... Add more as needed
        );
    }
}

function startLevel(level) {
    currentLevel = level;
    document.getElementById("mainMenu").classList.remove("show");
    document.getElementById("gameCanvas").style.display = 'block';
    resetGameState(level); // Initialize game state for the level
    if (!gameRunning) {
        gameRunning = true;
        update(); // Start the game loop only if it's not already running
    }
}


function update() {
    if (!gameRunning) return;


    ctx.clearRect(0, 0, canvas.width, canvas.height);

    player.velocityY += gravity;
    player.velocityX *= friction;

    if (keys.right.pressed && !keys.left.pressed) {
        player.velocityX = player.speed;
    } else if (keys.left.pressed && !keys.right.pressed) {
        player.velocityX = -player.speed;
    } else {
        player.velocityX = 0;
    }

    let nextX = player.x + player.velocityX;
    let nextY = player.y + player.velocityY;

    player.jumping = true;

    // Platform collision logic
    platforms.forEach(platform => {
        // Collision from the top
        if (nextY + player.height > platform.y && 
            player.y + player.height <= platform.y &&
            nextX + player.width > platform.x && 
            nextX < platform.x + platform.width) {
            player.velocityY = 0;
            player.jumping = false;
            nextY = platform.y - player.height;
        }

        // Collision from the bottom
        if (nextY < platform.y + platform.height && 
            player.y >= platform.y + platform.height &&
            nextX + player.width > platform.x && 
            nextX < platform.x + platform.width) {
            player.velocityY = 0;
            nextY = player.y;
        }

        // Horizontal collision
        if (nextY + player.height > platform.y && 
            nextY < platform.y + platform.height) {
            if (nextX + player.width > platform.x && 
                player.x + player.width <= platform.x) {
                player.velocityX = 0;
                nextX = platform.x - player.width;
            }
            if (nextX < platform.x + platform.width && 
                player.x >= platform.x + platform.width) {
                player.velocityX = 0;
                nextX = platform.x + platform.width;
            }
        }
    });

    // Collectible collision logic
    collectibles.forEach(collectible => {
        if (!collectible.collected &&
            nextX < collectible.x + collectible.width &&
            nextX + player.width > collectible.x &&
            nextY < collectible.y + collectible.height &&
            nextY + player.height > collectible.y) {
            collectible.collected = true;
            // Add score or trigger event
        }
    });

    enemies.forEach(updateEnemy);

    player.x = nextX;
    player.y = nextY;

    drawPlayer();
    platforms.forEach(drawPlatform);
    collectibles.forEach(drawCollectible);



    

    animationFrameId = requestAnimationFrame(update);
}

// ... [Rest of your existing code]

const keys = {
    right: { pressed: false },
    left: { pressed: false },
    up: { pressed: false }
};

// Event listeners...


window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowRight':
        case 'd':
        case 'D':
            keys.right.pressed = true;
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            keys.left.pressed = true;
            break;
        case 'ArrowUp':
        case 'w':
        case 'W':
        case ' ':
            if (!player.jumping && !keys.up.pressed) {
                player.velocityY = -player.jumpStrength;
                player.jumping = true;
                keys.up.pressed = true;
            }
            break;
    }
});

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'ArrowRight':
        case 'd':
        case 'D':
            keys.right.pressed = false;
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            keys.left.pressed = false;
            break;
        case 'ArrowUp':
        case 'w':
        case 'W':
        case ' ':
            keys.up.pressed = false;
            break;
    }
});

// Start the game loop
update();
