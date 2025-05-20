// knight_game.js

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// --- SPRITE SETUP ---
const knightImg = new Image();
knightImg.src = 'brackeys_platform_assets/sprites/knight.png'; // ścieżka do Twojego sprite'a

const FRAME_W = 32;
const FRAME_H = 32;
const ANIM = {
    idle:  { row: 0, frames: 4, speed: 0.18 },
    run:   { row: 1, frames: 6, speed: 0.12 }
};
let loaded = false;
knightImg.onload = () => { loaded = true; };

// --- PLAYER ---
const player = {
    x: 60,
    y: HEIGHT - 62,
    dx: 0,
    dy: 0,
    w: FRAME_W,
    h: FRAME_H,
    speed: 2,
    jump: 5.2,
    gravity: 0.44,
    onGround: false,
    facing: 1, // 1 prawo, -1 lewo
    state: 'idle',
    animFrame: 0,
    animCounter: 0
};

// --- PLATFORMS ---
const platforms = [
    {x: 0, y: HEIGHT - 30, w: WIDTH, h: 30},
    {x: 100, y: HEIGHT - 80, w: 80, h: 10},
    {x: 220, y: HEIGHT - 120, w: 70, h: 10}
];

// --- INPUT ---
const keys = {};
window.addEventListener('keydown', e => { keys[e.key] = true; });
window.addEventListener('keyup',   e => { keys[e.key] = false; });

// --- DRAW ---
function drawKnight(ctx, x, y, state, facing, animFrame) {
    const anim = ANIM[state] || ANIM.idle;
    ctx.save();
    if (facing === -1) {
        ctx.translate(x + FRAME_W, y);
        ctx.scale(-1, 1);
        x = 0;
        y = 0;
    }
    ctx.drawImage(
        knightImg,
        animFrame * FRAME_W, anim.row * FRAME_H,
        FRAME_W, FRAME_H,
        facing === 1 ? x : 0, y, FRAME_W, FRAME_H
    );
    ctx.restore();
}

function drawPlatforms() {
    ctx.fillStyle = "#49724a";
    for (const p of platforms) ctx.fillRect(p.x, p.y, p.w, p.h);
}

// --- UPDATE ---
function updatePlayer() {
    let moving = false;
    if (keys['ArrowRight'] || keys['d']) {
        player.dx = player.speed;
        player.facing = 1;
        moving = true;
    } else if (keys['ArrowLeft'] || keys['a']) {
        player.dx = -player.speed;
        player.facing = -1;
        moving = true;
    } else {
        player.dx = 0;
    }

    // Skok
    if ((keys['ArrowUp'] || keys['w'] || keys[' ']) && player.onGround) {
        player.dy = -player.jump;
        player.onGround = false;
    }

    // Stan animacji
    player.state = moving ? 'run' : 'idle';

    // Animacja
    const anim = ANIM[player.state];
    player.animCounter += anim.speed;
    if (player.animCounter >= 1) {
        player.animFrame = (player.animFrame + 1) % anim.frames;
        player.animCounter = 0;
    }

    // Grawitacja
    player.dy += player.gravity;

    // Ruch
    player.x += player.dx;
    player.y += player.dy;

    // Kolizje z platformami
    player.onGround = false;
    for (const p of platforms) {
        if (player.x + player.w > p.x && player.x < p.x + p.w &&
            player.y + player.h > p.y && player.y + player.h - player.dy <= p.y) {
            player.y = p.y - player.h;
            player.dy = 0;
            player.onGround = true;
        }
    }

    // Ograniczenia ekranu
    if (player.x < 0) player.x = 0;
    if (player.x + player.w > WIDTH) player.x = WIDTH - player.w;
    if (player.y > HEIGHT) resetPlayer();
}

function resetPlayer() {
    player.x = 60;
    player.y = HEIGHT - 62;
    player.dy = 0;
}

// --- MAIN LOOP ---
function gameLoop() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    drawPlatforms();
    if (loaded) drawKnight(ctx, Math.round(player.x), Math.round(player.y), player.state, player.facing, player.animFrame);

    updatePlayer();
    requestAnimationFrame(gameLoop);
}

gameLoop();