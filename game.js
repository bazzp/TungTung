// game.js

import { SAHUR_SPRITES, drawSahurSprite } from './assets/sahur_sprites.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Postać
const player = {
    x: 100,
    y: HEIGHT - 80,
    w: 16,
    h: 11,
    dx: 0,
    dy: 0,
    speed: 2.5,
    jump: 7,
    gravity: 0.5,
    onGround: false,
    facing: 1, // 1 prawo, -1 lewo
    state: 'idle', // idle, run, attack
    anim: 0,
    animTime: 0,
    attackTime: 0
};

// Platformy
const platforms = [
    { x: 0, y: HEIGHT - 30, w: WIDTH, h: 30 },
    { x: 200, y: HEIGHT - 100, w: 120, h: 16 },
    { x: 400, y: HEIGHT - 160, w: 120, h: 16 }
];

// Sterowanie
const keys = {};
window.addEventListener('keydown', e => { keys[e.key] = true; });
window.addEventListener('keyup', e => { keys[e.key] = false; });

function getFrame() {
    // Atak
    if (player.state === 'attack') {
        if (player.facing === 1) return 4;
        return 5;
    }
    // Bieg
    if (player.state === 'run') {
        if (player.facing === 1) return 2;
        return 3;
    }
    // Idle
    if (player.facing === 1) return 0;
    return 1;
}

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

    // Atak
    if ((keys['k'] || keys['K']) && player.attackTime <= 0) {
        player.state = 'attack';
        player.attackTime = 0.20; // sekundy
        player.animTime = 0;
    }

    // Zarządzanie stanem
    if (player.attackTime > 0) {
        player.attackTime -= 1/60;
        if (player.attackTime <= 0) {
            player.state = moving ? 'run' : 'idle';
        }
    } else {
        player.state = moving ? 'run' : 'idle';
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
    player.x = 100;
    player.y = HEIGHT - 80;
    player.dy = 0;
}

// Platformy
function drawPlatforms() {
    ctx.fillStyle = '#484';
    for (const p of platforms) ctx.fillRect(p.x, p.y, p.w, p.h);
}

// Główna pętla gry
function gameLoop() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    drawPlatforms();
    drawSahurSprite(ctx, Math.round(player.x), Math.round(player.y), getFrame());

    updatePlayer();
    requestAnimationFrame(gameLoop);
}

gameLoop();