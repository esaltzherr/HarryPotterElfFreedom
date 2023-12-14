const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gravity = 0.1;
const friction = 0.5;
let collectedSocks = 0;

let playerImage;
let enemyImage1;
let enemyImage2;


Promise.all([
    loadImage('images/wizard.png'),
    loadImage('images/Snape.png'),
    loadImage('images/HouseElf.png'),
    loadImage('images/sock.png')
]).then(images => {
    [playerImage, enemyImage1, enemyImage2, sock] = images;
     // Start your game after images are loaded
}).catch(error => {
    console.error("Error loading images", error);
});





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

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}




function drawPlayer() {
    if (playerImage) {
        ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
    }
}

function drawPlatform(platform) {
    ctx.fillStyle = platform.color;
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
}


function checkWinCondition() {
    if (collectedSocks === collectibles.length) {
        //alert("You Win!");
        showMainMenu();
        document.getElementById(`level${currentLevel}`).style.backgroundColor = 'green';
        collectedSocks = 0; // Reset for next game
    }
}


function drawCollectible(collectible) {
    if (!collectible.collected && sock) {
        ctx.drawImage(sock, collectible.x, collectible.y, collectible.width, collectible.height);
    }
}



function angleBetweenVectors(v1, v2) {
    const dot = v1.x * v2.x + v1.y * v2.y;
    const magnitude1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const magnitude2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
    return Math.acos(dot / (magnitude1 * magnitude2));
}



function drawEnemy(enemy) {
    const enemyImage = enemy.type === 'type1' ? enemyImage1 : enemyImage2;

    if (enemyImage) {
        ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
    }

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
    collectedSocks = 0;


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
        collectibles.push({ x: 150, y: 320, width: 30, height: 30, color: 'gold', collected: false },
                          { x: 1000, y: 120, width: 30, height: 30, color: 'gold', collected: false });
        enemies.push({ x: 200, y: 520, width: 30, height: 30, color: 'red', velocityX: 1, visionRange: 200, startX: 0, endX: canvas.width, type:'type1'},
                     { x: 300, y: 320, width: 30, height: 30, color: 'red', velocityX: 1, visionRange: 100, startX: 0, endX: 450, type:'type2'});
    } else // Level 2 setup
    if (level === 2) {
        platforms = [
            // Ground platform
            { x: 0, y: 550, width: canvas.width, height: 20, color: 'saddlebrown' },
            // Elevated static platforms
            { x: 200, y: 450, width: 150, height: 20, color: 'grey' },
            { x: 500, y: 400, width: 200, height: 20, color: 'grey' },
            { x: 800, y: 450, width: 150, height: 20, color: 'grey' },
            { x: 250, y: 300, width: 150, height: 20, color: 'peru' }
        ];
        collectibles = [
            // Hard to reach collectibles
            { x: 250, y: 270, width: 30, height: 30, color: 'silver', collected: false },
            { x: 1100, y: 500, width: 30, height: 30, color: 'silver', collected: false }
        ];
        enemies = [
            // Faster moving enemies
            { x: 600, y: 520, width: 30, height: 30, color: 'red', velocityX: 2, visionRange: 200, startX: 500, endX: 750, type: 'type1' },
            { x: 800, y: 420, width: 30, height: 30, color: 'red', velocityX: .5, visionRange: 100, startX: 800, endX: 950, type: 'type2' }
        ];
    
    } else if (level === 3) {
        platforms = [
            // Ground platform
            { x: 0, y: 550, width: canvas.width, height: 20, color: 'saddlebrown' },
            // Combination of different platforms
            { x: 100, y: 450, width: 200, height: 20, color: 'grey' },
            { x: 300, y: 350, width: 150, height: 20, color: 'peru', isMoving: true, moveDirection: 'horizontal', moveRange: [300, 450] },
            { x: 550, y: 300, width: 150, height: 20, color: 'peru', },
            { x: 750, y: 250, width: 150, height: 20, color: 'peru', },
            { x: 600, y: 160, width: 100, height: 20, color: 'grey', },
        ];
        collectibles = [
            // More collectibles in challenging spots
            { x: 700, y: 520, width: 30, height: 30, color: 'bronze', collected: false },
            { x: 620, y: 130, width: 30, height: 30, color: 'bronze', collected: false }
        ];
        enemies = [
            // Mix of slow and fast enemies
            { x: 200, y: 520, width: 30, height: 30, color: 'purple', velocityX: 2, visionRange: 200, startX: 100, endX: 1000, type: 'type1' },
            { x: 750, y: 220, width: 30, height: 30, color: 'green', velocityX: 1.5, visionRange: 100, startX: 750, endX: 900, type: 'type2' }
        ];
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
            collectedSocks++;
            
            checkWinCondition(); // Moved up to ensure it is checked immediately after collection
        }
        
    });

    enemies.forEach(updateEnemy);

    

    collectibles.forEach(drawCollectible);

    console.log(collectedSocks, collectibles.length)
    

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
