const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load the background image
const background = new Image();
background.src = './assets/sprites/background.png';

// Draw the background image once it loads
background.onload = () => {
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
};

let bird;
let pipes = [];
let score = 0;
let gameOver = false;

const startButton = document.getElementById('startButton');

startButton.addEventListener('click', () => {
    startButton.style.display = 'none'; // Hide the button after starting the game
    init(); // Start the game
});

const restartButton = document.getElementById('restartButton');

restartButton.addEventListener('click', () => {
    restartButton.style.display = 'none'; // Hide the restart button
    init(); // Restart the game
});

function init() {
    bird = new Bird();
    pipes = [];
    score = 0;
    gameOver = false;
    pipes.push(new Pipe());
    document.addEventListener('keydown', handleKeyPress);
    canvas.addEventListener('mousedown', handleMouseClick); // Mouse click
    canvas.addEventListener('touchstart', handleTouchStart); // Screen tap
    gameLoop();
}

function handleKeyPress(event) {
    if (event.code === 'Space' && !gameOver) {
        bird.flap();
    }
}

function handleMouseClick() {
    if (!gameOver) {
        bird.flap();
    }
}

function handleTouchStart() {
    if (!gameOver) {
        bird.flap();
    }
}

function gameLoop() {
    if (gameOver) {
        restartButton.style.display = 'block'; // Show the restart button
        return;
    }
    
    update();
    render();
    requestAnimationFrame(gameLoop);
}

function update() {
    bird.update();

    // Adjust the spacing between buildings by reducing the distance condition
    if (pipes.length > 0 && pipes[pipes.length - 1].x < canvas.width - 150) { // Reduced from 200 to 150
        pipes.push(new Pipe());
    }

    pipes.forEach(pipe => {
        pipe.update();
        if (pipe.x + pipe.width < 0) {
            pipes.shift();
            score++;
        }
        if (pipe.collidesWith(bird)) {
            gameOver = true;
        }
    });
}

function render() {
    // Draw the background image
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Render the bird
    bird.render(ctx);

    // Render the pipes
    pipes.forEach(pipe => pipe.render(ctx));

    // Render the score
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 20);
}

class Bird {
    constructor() {
        this.x = 50;
        this.y = canvas.height / 2;
        this.width = 150; // Scaled width of the bird on the canvas
        this.height = 150; // Scaled height of the bird on the canvas
        this.gravity = 0.3; // Reduced gravity
        this.lift = -15;
        this.velocity = 0;

        // Sprite animation properties
        this.sprite = new Image();
        this.sprite.src = './assets/sprites/bird-sprite.png'; // Path to the sprite sheet
        this.frameIndex = 0; // Current frame index
        this.frameCount = 5; // Total number of frames in the sprite sheet
        this.frameWidth = 500; // Width of each frame in the sprite sheet
        this.frameHeight = 500; // Height of each frame in the sprite sheet
        this.frameDelay = 5; // Delay between frames
        this.frameCounter = 0; // Counter to control animation speed

        // Debugging: Check if the sprite loads successfully
        this.sprite.onload = () => {
            console.log('Bird sprite loaded successfully');
        };
        this.sprite.onerror = () => {
            console.error('Failed to load bird sprite');
        };
    }

    flap() {
        this.velocity += this.lift;
    }

    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;
    
        // Prevent the bird from going above the canvas
        if (this.y < -100) { // Allow the bird to go slightly above the canvas
            this.y = -100;
            this.velocity = 0;
        }
    
        // Allow half of the bird to go off the bottom of the canvas
        if (this.y + this.height / 1.6 > canvas.height) {
            this.y = canvas.height - this.height / 1.6;
            this.velocity = 0;
        }

    
        // Update animation frame
        this.frameCounter++;
        if (this.frameCounter >= this.frameDelay) {
            this.frameCounter = 0;
            this.frameIndex = (this.frameIndex + 1) % this.frameCount; // Loop through frames
        }
    }

    render(ctx) {
        // Draw the current frame of the sprite
        ctx.drawImage(
            this.sprite,
            this.frameIndex * this.frameWidth, // Source X (frame position in the sprite sheet)
            0, // Source Y (assuming all frames are in one row)
            this.frameWidth, // Source width
            this.frameHeight, // Source height
            this.x, // Destination X
            this.y, // Destination Y
            this.width, // Destination width (scaled width on the canvas)
            this.height // Destination height (scaled height on the canvas)
        );
    }
}

class Pipe {
    constructor() {
        this.width = 50 + Math.random() * 30; // Random width for variety
        this.height = Math.random() * (canvas.height / 2) + 50; // Random height for the building
        this.x = canvas.width;
        this.color = this.getRandomColor(); // Assign a random color for the building
        this.windowColor = this.getRandomWindowColor(); // Assign a random color for the windows
        this.topType = this.getRandomTopType(); // Randomly decide the top type
        this.windowType = this.getRandomWindowType(); // Randomly decide the window type
    }

    getRandomColor() {
        const colors = ['#A9A9A9', '#808080', '#D3D3D3', '#C0C0C0', '#8B4513', '#A0522D', '#B22222']; // Natural building colors
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getRandomWindowColor() {
        const colors = ['#FFFFFF', '#F0F8FF', '#E6E6FA', '#B0E0E6', '#ADD8E6']; // Natural window colors: white and shades of blue
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getRandomTopType() {
        const types = ['flat', 'pointed', 'antenna', 'dome', 'slanted']; // Possible top types
        return types[Math.floor(Math.random() * types.length)];
    }

    getRandomWindowType() {
        const types = ['square', 'rectangular']; // Possible window types
        return types[Math.floor(Math.random() * types.length)];
    }

    update() {
        this.x -= 2; // Move the building to the left
    }

    render(ctx) {
        ctx.fillStyle = this.color;
        // Draw the building starting from the bottom of the canvas
        ctx.fillRect(this.x, canvas.height - this.height, this.width, this.height);

        // Add windows to the building
        ctx.fillStyle = this.windowColor; // Use the random window color
        const windowSpacing = 5;
        const windowWidth = this.windowType === 'square' ? 10 : 10; // Width is always 10
        const windowHeight = this.windowType === 'square' ? 10 : 20; // Height depends on the window type

        for (let y = canvas.height - this.height + windowSpacing; y < canvas.height - windowHeight; y += windowHeight + windowSpacing) {
            for (let x = this.x + windowSpacing; x < this.x + this.width - windowWidth; x += windowWidth + windowSpacing) {
                ctx.fillRect(x, y, windowWidth, windowHeight);
            }
        }

        // Draw the top of the building
        if (this.topType === 'pointed') {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(this.x, canvas.height - this.height); // Left corner
            ctx.lineTo(this.x + this.width / 2, canvas.height - this.height - 20); // Point
            ctx.lineTo(this.x + this.width, canvas.height - this.height); // Right corner
            ctx.closePath();
            ctx.fill();
        } else if (this.topType === 'antenna') {
            ctx.fillStyle = '#000000'; // Black antenna
            ctx.fillRect(this.x + this.width / 2 - 2, canvas.height - this.height - 20, 4, 20); // Antenna pole
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, canvas.height - this.height - 25, 5, 0, Math.PI * 2); // Antenna tip
            ctx.fill();
        } else if (this.topType === 'dome') {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, canvas.height - this.height, this.width / 2, 0, Math.PI, true); // Dome shape
            ctx.fill();
        } else if (this.topType === 'slanted') {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(this.x, canvas.height - this.height); // Left corner
            ctx.lineTo(this.x + this.width, canvas.height - this.height - 20); // Slanted top
            ctx.lineTo(this.x + this.width, canvas.height - this.height); // Right corner
            ctx.closePath();
            ctx.fill();
        }
    }

    collidesWith(bird) {
        return bird.x < this.x + this.width &&
               bird.x + bird.width > this.x &&
               bird.y + bird.height > canvas.height - this.height;
    }
}