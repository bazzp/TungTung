// TungTung - szkielet gry platformowej JS/Canvas z Sahurem (pixelart + animacje)

import { SAHUR_SPRITES, SAHUR_COLORS, drawSahurSprite } from './assets/sahur_sprites.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Podstawowe dane gracza
const player = {
    x: 100, y: HEIGHT - 90,
    w: 16, h: 24,
    dx: 0, dy: 0,
    speed: 2.1,
    jumpPower: 8,
    gravity: 0.5,
    onGround: false,
    facing: 1, // 1 = prawo, -1 = lewo
    state: 'idle', // idle, run, attack
    anim: 0,
    animTime: 0,
    attackTime: 0,
};

// Platformy przykładowe
let platforms = [
    { x: 0, y: HEIGHT - 40, w: WIDTH, h: 40 },
    { x: 200, y: HEIGHT - 120, w: 100, h: 20 },
    { x: 400, y: HEIGHT - 180, w: 100, h: 20 },
];

// Klawisze sterowania
const keys = {};
window.addEventListener('keydown', e => { keys[e.key] = true; });
window.addEventListener('keyup', e => { keys[e.key] = false; });

// Animacja gracza - wybiera klatkę sprite'a na podstawie stanu
function getSahurFrame() {
    if (player.state === 'attack') {
        if (player.facing === 1) return 6;
        return 7;
    }
    if (player.state === 'run') {
        if (player.facing === 1) return 2 + (player.anim % 2);
        return 4 + (player.anim % 2);
    }
    // idle
    if (player.facing === 1) return 0;
    return 1;
}

// Platformy
function drawPlatforms() {
    ctx.fillStyle = '#484';
    for (const p of platforms) ctx.fillRect(p.x, p.y, p.w, p.h);
}

// Fizyka ruchu i kolizje
function updatePlayer() {
    // Ruch poziomy
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
        player.dy = -player.jumpPower;
        player.onGround = false;
    }
    // Atak
    if ((keys['k'] || keys['K']) && player.attackTime <= 0) {
        player.state = 'attack';
        player.attackTime = 0.22; // sekundy
        player.animTime = 0;
    }

    // Zarządzanie stanami animacji
    if (player.attackTime > 0) {
        player.attackTime -= 1/60;
        if (player.attackTime <= 0) {
            player.state = moving ? 'run' : 'idle';
        }
    } else {
        player.state = moving ? 'run' : 'idle';
    }

    // Animacja biegu
    if (player.state === 'run') {
        player.animTime += 1/60;
        if (player.animTime > 0.12) {
            player.anim = (player.anim + 1) % 2;
            player.animTime = 0;
        }
    } else {
        player.anim = 0;
        player.animTime = 0;
    }

    // Grawitacja
    player.dy += player.gravity;

    // Przesuń gracza
    player.x += player.dx;
    player.y += player.dy;

    // Kolizje z platformami
    player.onGround = false;
    for (const p of platforms) {
        if (player.x + player.w > p.x && player.x < p.x + p.w &&
            player.y + player.h > p.y && player.y + player.h - player.dy <= p.y) {
            // Stoi na platformie
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
    player.y = HEIGHT - 90;
    player.dy = 0;
}

// Główna pętla gry
function gameLoop() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Rysuj świat
    drawPlatforms();

    // Rysuj Sahura (pixelart)
    const frame = getSahurFrame();
    // left-facing klatki są lustrzanym odbiciem right-facing
    let flip = false;
    if (frame === 1 || frame === 4 || frame === 5 || frame === 7) flip = true;
    drawSahurSprite(ctx, Math.round(player.x), Math.round(player.y), frame, flip);

    // Fizyka
    updatePlayer();

    requestAnimationFrame(gameLoop);
}

gameLoop();