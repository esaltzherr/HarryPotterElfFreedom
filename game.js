const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gravity = 0.5;
const friction = 0.7;

// Player properties
const player = {
    x: 100,
    y: 100,
    width: 50,
    height: 50,
    color: 'blue',
    speed: 5,
    velocityX: 0,
    velocityY: 0,
    jumping: false,
};

// Platforms properties
const platforms = [
    { x: 0, y: 350, width: canvas.width, height: 20, color: 'green' },
    // Add more platforms as needed
    // { x: 200, y: 250, width: 150, height: 20, color: 'brown' },
];

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawPlatform(platform) {
    ctx.fillStyle = platform.color;
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
}

function update() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gravity and friction
    player.velocityY += gravity;
    player.velocityX *= friction;

    // Player movement
    if (keys.right.pressed) {
        player.velocityX = player.speed;
    } else if (keys.left.pressed) {
        player.velocityX = -player.speed;
    }

    // Update player position
    player.x += player.velocityX;
    player.y += player.velocityY;

    // Collision detection for each platform
    player.jumping = true; // Assume player is falling until collision detected
    platforms.forEach(platform => {
        if (
            player.y + player.height + player.velocityY >= platform.y &&
            player.y < platform.y &&
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width
        ) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.jumping = false;
        }
    });

    drawPlayer();

    platforms.forEach(drawPlatform);

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
