const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gravity = 0.3;
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
    // Ground floor
    { x: 0, y: 550, width: canvas.width, height: 20, color: 'saddlebrown' },

    // Second floor
    { x: 300, y: 350, width: 600, height: 20, color: 'grey' },

    // Stairs (Example of three steps)
    { x: 100, y: 500, width: 100, height: 20, color: 'peru' },
    { x: 150, y: 450, width: 100, height: 20, color: 'peru' },
    { x: 200, y: 400, width: 100, height: 20, color: 'peru' },

    // Furniture (Example of a table)
    //{ x: 50, y: 300, width: 150, height: 20, color: 'sienna' },

    // Invisible barriers
    { x: -10, y: 0, width: 10, height: canvas.height, color: '' },
    { x: canvas.width, y: 0, width: 10, height: canvas.height, color: '' },
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

    // Update player's position
    player.x = nextX;
    player.y = nextY;

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
