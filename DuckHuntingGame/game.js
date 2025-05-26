// Duck Hunt Game using Phaser.js
// Main game logic with comments

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const DUCK_SPRITE = 'duck';
const SHOT_SOUND = 'shot';
const QUACK_SOUND = 'quack';
const FALL_SOUND = 'fall';

let game = new Phaser.Game(config);

let ducks;
let score = 0;
let level = 1;
let timeLeft = 60;
let ducksToShoot = 5;
let ducksShot = 0;
let timerEvent;
let hud;
let gameOver = false;
let crosshair;

function preload() {
  // Load duck sprite sheet (replace with your own sprite sheet if available)
  this.load.spritesheet(DUCK_SPRITE, 'assets/duck.png', { frameWidth: 64, frameHeight: 64 });
  // Load sounds (replace with your own sound files if available)
  this.load.audio(SHOT_SOUND, 'assets/shot.wav');
  this.load.audio(QUACK_SOUND, 'assets/quack.wav');
  this.load.audio(FALL_SOUND, 'assets/fall.wav');
  // Load your crosshair image
  this.load.image('crosshair', 'assets/crosshair.png');
}

function create() {
  // Add background (change to white)
  this.add.rectangle(400, 300, 800, 600, 0xffffff);
  // Add HUD
  hud = document.getElementById('hud');
  updateHUD();

  // Create duck animation
  this.anims.create({
    key: 'fly',
    frames: this.anims.generateFrameNumbers(DUCK_SPRITE, { start: 0, end: 2 }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'fall',
    frames: [ { key: DUCK_SPRITE, frame: 3 } ],
    frameRate: 1,
    repeat: -1
  });

  // Sound effects
  this.shotSound = this.sound.add(SHOT_SOUND);
  this.quackSound = this.sound.add(QUACK_SOUND);
  this.fallSound = this.sound.add(FALL_SOUND);

  // Group for ducks
  ducks = this.physics.add.group();
  spawnDucks.call(this);

  // Add crosshair sprite and set its depth above other objects
  crosshair = this.add.sprite(this.input.activePointer.x, this.input.activePointer.y, 'crosshair');
  crosshair.setDepth(10);
  crosshair.setScale(0.5); // Adjust size as needed
  crosshair.setOrigin(0.5, 0.5);

  // Hide the default cursor
  this.input.setDefaultCursor('none');

  // Mouse click to shoot
  this.input.on('pointerdown', (pointer) => {
    if (gameOver) return restartGame.call(this);
    this.shotSound.play();
    // Check if a duck is hit
    ducks.children.iterate((duck) => {
      if (duck.active && duck.getBounds().contains(pointer.x, pointer.y)) {
        hitDuck.call(this, duck);
      }
    });
  });

  // Timer
  timerEvent = this.time.addEvent({
    delay: 1000,
    callback: onSecond,
    callbackScope: this,
    loop: true
  });
}

function update() {
  if (gameOver) return;
  // Move ducks in random directions
  ducks.children.iterate((duck) => {
    if (!duck.active) return;
    duck.x += duck.speed * duck.directionX;
    duck.y += duck.speed * duck.directionY;
    // Bounce off edges
    if (duck.x < 32 || duck.x > 768) {
      duck.directionX *= -1;
      duck.flipX = duck.directionX < 0;
    }
    if (duck.y < 32 || duck.y > 568) {
      duck.directionY *= -1;
    }
  });

  // Update crosshair position to follow mouse
  crosshair.x = this.input.activePointer.x;
  crosshair.y = this.input.activePointer.y;
}

function spawnDucks() {
  ducks.clear(true, false);
  for (let i = 0; i < ducksToShoot + level; i++) {
    let y = Phaser.Math.Between(100, 500);
    let duck = ducks.create(Phaser.Math.Between(100, 700), y, DUCK_SPRITE);
    duck.play('fly');
    duck.setInteractive();
    duck.speed = Phaser.Math.Between(2, 3) + level;
    // Give each duck a random angle and velocity for random direction
    let angle = Phaser.Math.FloatBetween(0, 2 * Math.PI);
    duck.directionX = Math.cos(angle);
    duck.directionY = Math.sin(angle);
    duck.flipX = duck.directionX < 0;
    duck.alive = true;
  }
  ducksShot = 0;
}

function hitDuck(duck) {
  if (!duck.alive) return;
  duck.alive = false;
  duck.play('fall');
  duck.body.setVelocity(0, 200);
  this.quackSound.play();
  this.fallSound.play();
  score += 10;
  ducksShot++;
  updateHUD();
  // Remove duck after falling
  this.time.delayedCall(1000, () => {
    duck.disableBody(true, true);
  });
  // Check for level complete
  if (ducksShot >= ducksToShoot + level) {
    nextLevel.call(this);
  }
}

function onSecond() {
  if (gameOver) return;
  timeLeft--;
  updateHUD();
  if (timeLeft <= 0) {
    endGame.call(this);
  }
}

function updateHUD() {
  hud.innerHTML = `Level: ${level} | Score: ${score} | Ducks: ${ducksShot}/${ducksToShoot + level} | Time: ${timeLeft}s`;
}

function nextLevel() {
  level++;
  timeLeft = 60;
  ducksToShoot += 2;
  spawnDucks.call(this);
  updateHUD();
}

function endGame() {
  gameOver = true;
  hud.innerHTML += '<br><b>Game Over! Click to restart.</b>';
}

function restartGame() {
  score = 0;
  level = 1;
  timeLeft = 60;
  ducksToShoot = 5;
  gameOver = false;
  spawnDucks.call(this);
  updateHUD();
}
