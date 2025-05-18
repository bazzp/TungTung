// TungTung - szkielet gry platformowej JS/Canvas

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Podstawowe dane gracza
const player = {
    x: 100, y: HEIGHT - 90,
    w: 32, h: 48,
    dx: 0, dy: 0,
    speed: 3,
    jumpPower: 12,
    gravity: 0.7,
    onGround: false,
    color: '#5ad',
    facing: 1, // 1 = prawo, -1 = lewo
};

// Platformy przykładowe (do generowania proceduralnego później)
let platforms = [
    { x: 0, y: HEIGHT - 40, w: WIDTH, h: 40 },
    { x: 200, y: HEIGHT - 120, w: 100, h: 20 },
    { x: 400, y: HEIGHT - 180, w: 100, h: 20 },
];

// Klawisze sterowania
const keys = {};
window.addEventListener('keydown', e => { keys[e.key] = true; });
window.addEventListener('keyup', e => { keys[e.key] = false; });

// Prosta funkcja rysująca gracza (do zamiany na pixelart)
function drawPlayer() {
    ctx.save();
    ctx.translate(player.x + player.w/2, player.y + player.h/2);
    ctx.scale(player.facing, 1);
    ctx.fillStyle = player.color;
    ctx.fillRect(-player.w/2, -player.h/2, player.w, player.h);
    // Pała (prosty prostokąt na prawo/lewo)
    ctx.fillStyle = '#c96';
    ctx.fillRect(player.facing*10, 10, 18, 4);
    ctx.restore();
}

// Platformy
function drawPlatforms() {
    ctx.fillStyle = '#484';
    for (const p of platforms) ctx.fillRect(p.x, p.y, p.w, p.h);
}

// Fizyka ruchu i kolizje
function updatePlayer() {
    // Ruch poziomy
    if (keys['ArrowRight'] || keys['d']) {
        player.dx = player.speed;
        player.facing = 1;
    } else if (keys['ArrowLeft'] || keys['a']) {
        player.dx = -player.speed;
        player.facing = -1;
    } else {
        player.dx = 0;
    }

    // Skok
    if ((keys['ArrowUp'] || keys['w'] || keys[' ']) && player.onGround) {
        player.dy = -player.jumpPower;
        player.onGround = false;
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
    drawPlayer();

    // Fizyka
    updatePlayer();

    requestAnimationFrame(gameLoop);
}

gameLoop();