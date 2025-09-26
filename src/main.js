import "./styles.css";
import Phaser, { Physics } from "phaser";

// Set the current year in the footer
const yearSpan = document.getElementById("currentYear");
yearSpan.textContent = new Date().getFullYear();

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    this.load.image("room", "/assets/tiles/room_base.png");
    this.load.spritesheet("dude_idle", "/assets/spritesheets/1 idle.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet("dude_walk", "/assets/spritesheets/1 walk.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet("dude_punch", "/assets/spritesheets/1 punch.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
  }
  create() {
    const room = this.add.image(
      this.sys.canvas.width / 2,
      this.sys.canvas.height / 2,
      "room"
    );

    room.setOrigin(0.5, 0.5);

    this.dude = this.add.sprite(100, 100, "dude_idle");
    this.dude.direction = "front";
    this.dude.lastMoved = this.time.now;

    this.anims.create({
      key: "idle_front",
      frames: [
        { key: "dude_idle", frame: 0 },
        { key: "dude_idle", frame: 3 },
      ],
      frameRate: 2,
      repeat: -1,
    });
    this.anims.create({
      key: "idle_back",
      frames: [
        { key: "dude_idle", frame: 1 },
        { key: "dude_idle", frame: 4 },
      ],
      frameRate: 2,
      repeat: -1,
    });
    this.anims.create({
      key: "idle_right",
      frames: [
        { key: "dude_idle", frame: 2 },
        { key: "dude_idle", frame: 5 },
      ],
      frameRate: 2,
      repeat: -1,
    });
    this.anims.create({
      key: "walk_front",
      frames: this.anims.generateFrameNumbers("dude_walk", {
        frames: [0, 3, 6, 9],
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: "walk_back",
      frames: this.anims.generateFrameNumbers("dude_walk", {
        frames: [1, 4, 7, 10],
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: "walk_right",
      frames: this.anims.generateFrameNumbers("dude_walk", {
        frames: [2, 5, 8, 11],
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.dude.play("idle_front");
    this.dude.setScale(2);
    this.cursors = this.input.keyboard.createCursorKeys();
  }
  update() {
    let speed = 2;
    let moving = true;

    if (this.cursors.left.isDown) {
      this.dude.setFlipX(true);
      this.dude.x -= speed;
      this.dude.direction = "left";
      this.dude.play("walk_right", true);
    } else if (this.cursors.right.isDown) {
      this.dude.setFlipX(false);
      this.dude.x += speed;
      this.dude.direction = "right";
      this.dude.play("walk_right", true);
    } else if (this.cursors.up.isDown) {
      this.dude.y -= speed;
      this.dude.direction = "back";
      this.dude.play("walk_back", true);
    } else if (this.cursors.down.isDown) {
      this.dude.y += speed;
      this.dude.direction = "front";
      this.dude.play("walk_front", true);
    } else {
      moving = false;
    }

    if (moving) {
      this.dude.lastMoved = this.time.now;
    } else {
      if (this.time.now - this.dude.lastMoved > 3000) {
        this.dude.play(`idle_${this.dude.direction}`, true);
      } else {
        this.dude.play(`idle_${this.dude.direction}`, true);
        this.dude.stop();
      }
    }
  }
}

const config = {
  type: Phaser.WEBGL,
  width: 600,
  height: 600,
  canvas: gameCanvas,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: true,
    },
  },
  scene: [GameScene],
  pixelArt: true,
};

const game = new Phaser.Game(config);

console.log("Game initialized:", game);
