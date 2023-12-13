const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gravity = 0.3;
const friction = 0.7;

// Player properties
const player = {
    x: 100,
    y: 500,
    width: 25,
    height: 25,
    color: 'blue',
    speed: 2.5,
    velocityX: 0,
    velocityY: 0,
    jumping: false,
};

// Platforms properties
const platforms = [
    // Ground floor
    { x: 0, y: 550, width: canvas.width, height: 20, color: 'saddlebrown' },
    // Second floor
    { x: 0, y: 350, width: 500, height: 20, color: 'grey' },
    { x: 800, y: 350, width: 400, height: 20, color: 'grey' },
    // Third floor
    { x: 0, y: 150, width: 400, height: 20, color: 'grey' },
    { x: 900, y: 150, width: 300, height: 20, color: 'grey' },
    // Stairs
    { x: 550, y: 450, width: 200, height: 20, color: 'peru' },
    { x: 400, y: 250, width: 200, height: 20, color: 'peru' },
    { x: 700, y: 250, width: 200, height: 20, color: 'peru' },
    // Invisible barriers
    { x: -10, y: -50, width: 10, height: canvas.height + 50, color: '' },
    { x: canvas.width, y: -50, width: 10, height: canvas.height + 50, color: '' },
];

// Collectibles properties
const collectibles = [
    { x: 150, y: 320, width: 10, height: 10, color: 'gold', collected: false },
    // Add more collectibles as needed
];

// Enemies properties
const enemies = [
    { x: 200, y: 520, width: 30, height: 30, color: 'red', velocityX: 1, visionRange: 100 },
    { x: 200, y: 200, width: 30, height: 30, color: 'red', velocityX: 1, visionRange: 100 },
   
];

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

function drawEnemy(enemy) {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

    // Drawing vision cone
    ctx.beginPath();
    ctx.moveTo(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);

    if (enemy.velocityX > 0) { // Enemy moving right
        ctx.lineTo(enemy.x + enemy.width / 2 + enemy.visionRange, enemy.y - enemy.visionRange);
        ctx.lineTo(enemy.x + enemy.width / 2 + enemy.visionRange, enemy.y + enemy.height + enemy.visionRange);
    } else { // Enemy moving left
        ctx.lineTo(enemy.x + enemy.width / 2 - enemy.visionRange, enemy.y - enemy.visionRange);
        ctx.lineTo(enemy.x + enemy.width / 2 - enemy.visionRange, enemy.y + enemy.height + enemy.visionRange);
    }

    ctx.closePath();
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx.fill();
}


function update() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gravity and friction
    player.velocityY += gravity;
    player.velocityX *= friction;

    // Process left and right movement
    if (keys.right.pressed && !keys.left.pressed) {
        player.velocityX = player.speed;
    } else if (keys.left.pressed && !keys.right.pressed) {
        player.velocityX = -player.speed;
    } else {
        player.velocityX = 0;
    }

    // Calculate the next position
    let nextX = player.x + player.velocityX;
    let nextY = player.y + player.velocityY;

    // Assume player is falling until collision detected
    player.jumping = true;

    // Check for collision before updating player's position
    platforms.forEach(platform => {
        // Vertical collision from the top
        if (
            nextY + player.height > platform.y && 
            player.y + player.height <= platform.y &&
            nextX + player.width > platform.x && 
            nextX < platform.x + platform.width
        ) {
            player.velocityY = 0;
            player.jumping = false;
            nextY = platform.y - player.height;
        }

        // Vertical collision from the bottom
        if (
            nextY < platform.y + platform.height && 
            player.y >= platform.y + platform.height &&
            nextX + player.width > platform.x && 
            nextX < platform.x + platform.width
        ) {
            player.velocityY = 0;
            nextY = player.y; // Keep the player at the current position
        }

        // Horizontal collision
        if (
            nextY + player.height > platform.y && 
            nextY < platform.y + platform.height
        ) {
            if (
                nextX + player.width > platform.x && 
                player.x + player.width <= platform.x
            ) {
                player.velocityX = 0;
                nextX = platform.x - player.width;
            }
            if (
                nextX < platform.x + platform.width && 
                player.x >= platform.x + platform.width
            ) {
                player.velocityX = 0;
                nextX = platform.x + platform.width;
            }
        }
    });

    // Check for collectible collection
    collectibles.forEach(collectible => {
        if (!collectible.collected &&
            player.x < collectible.x + collectible.width &&
            player.x + player.width > collectible.x &&
            player.y < collectible.y + collectible.height &&
            player.y + player.height > collectible.y) {
                collectible.collected = true;
                // Add score or trigger event
        }
    });

    // Update and draw enemies
    enemies.forEach(enemy => {
        enemy.x += enemy.velocityX;
        // Change direction if enemy hits a wall
        if (enemy.x + enemy.width > canvas.width || enemy.x < 0) {
            enemy.velocityX *= -1;
        }

        // Check for player detection
        if (player.x > enemy.x && player.x < enemy.x + enemy.visionRange && 
            player.y > enemy.y - enemy.visionRange && player.y < enemy.y + enemy.height + enemy.visionRange) {
            // Player detected
            console.log("Player Detected! Game Over!");
            // Implement game over logic
        }

        drawEnemy(enemy);
    });

    // Update player's position
    player.x = nextX;
    player.y = nextY;

    // Draw elements
    drawPlayer();
    platforms.forEach(drawPlatform);
    collectibles.forEach(drawCollectible);

    requestAnimationFrame(update);
}

const keys = {
    right: {
        pressed: false
    },
    left: {
        pressed: false
    },
    up: {
        pressed: false
    }
};

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
                player.velocityY = -10;
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
