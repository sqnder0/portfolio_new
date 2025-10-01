import "./styles.css";
import Phaser from "phaser";
import { createDudeAnimations } from "./animations.js";

const yearSpan = document.getElementById("currentYear");
yearSpan.textContent = new Date().getFullYear();

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    this.load.tilemapTiledJSON("room_map", "/assets/tiles/room_base.json");
    this.load.spritesheet("room_tiles", "/assets/tiles/room_base.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
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
    this.cameras.main.setZoom(2, 2);
    const map = this.make.tilemap({ key: "room_map" });
    const tileset = map.addTilesetImage("room_tileset", "room_tiles");

    const mapX = (this.sys.canvas.width - map.widthInPixels) / 2;
    const mapY = (this.sys.canvas.height - map.heightInPixels) / 2;

    const backgroundLayer = map.createLayer("background", tileset, mapX, mapY);

    this.matter.world.setBounds(
      mapX,
      mapY,
      map.widthInPixels,
      map.heightInPixels
    );

    this.dude = this.matter.add.sprite(100 + mapY, 100 + mapX, "dude_idle");
    this.dude.setIgnoreGravity(true);
    this.dude.setFixedRotation();

    this.dude.direction = "front";
    this.dude.lastMoved = this.time.now;

    createDudeAnimations(this);

    this.dude.play("idle_front");
    this.dude.setScale(1.5);

    const furnitureObjects = map.getObjectLayer("furniture").objects;

    furnitureObjects.forEach((obj) => {
      const frameIndex = obj.gid - tileset.firstgid;

      // Access the full tile data, not just properties
      const tileData = tileset.tileData[frameIndex];
      console.log("Tiledata for frame", frameIndex, ":", tileData);

      if (tileData && tileData.objectgroup && tileData.objectgroup.objects) {
        // Create visual sprite first
        const sprite = this.add.sprite(
          obj.x + obj.width / 2 + mapX,
          obj.y - obj.height / 2 + mapY,
          "room_tiles",
          frameIndex
        );
        sprite.setOrigin(0.5, 0.5);

        // Create Matter.js bodies from collision objects
        const collisionObjects = tileData.objectgroup.objects;

        collisionObjects.forEach((collisionObj) => {
          // Create a Matter.js rectangle body for each collision object
          const body = this.matter.add.rectangle(
            obj.x + collisionObj.x + collisionObj.width / 2 + mapX,
            obj.y -
              obj.height +
              collisionObj.y +
              collisionObj.height / 2 +
              mapY,
            collisionObj.width,
            collisionObj.height,
            { isStatic: true }
          );
        });
      } else {
        // Fallback: create simple rectangle collision for tiles without custom collision
        const sprite = this.matter.add.sprite(
          obj.x + obj.width / 2 + mapX,
          obj.y - obj.height / 2 + mapY,
          "room_tiles",
          frameIndex
        );
        sprite.setStatic(true);
        sprite.setOrigin(0.5, 0.5);
      }
    });

    this.cursors = this.input.keyboard.createCursorKeys();
  }
  update() {
    let horizontal_speed = 1;
    let vertical_speed = 1;
    let moving = true;

    this.dude.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.dude.setVelocityY(0);
      this.dude.setVelocityX(-horizontal_speed);
      this.dude.direction = "left";
      this.dude.flipX = true;
      this.dude.play("walk_right", true);
    } else if (this.cursors.right.isDown) {
      this.dude.setVelocityY(0);
      this.dude.setVelocityX(horizontal_speed);
      this.dude.direction = "right";
      this.dude.flipX = false;
      this.dude.play("walk_right", true);
    } else if (this.cursors.up.isDown) {
      this.dude.setVelocityX(0);
      this.dude.setVelocityY(-vertical_speed);
      this.dude.direction = "back";
      this.dude.play("walk_back", true);
    } else if (this.cursors.down.isDown) {
      this.dude.setVelocityX(0);
      this.dude.setVelocityY(vertical_speed);
      this.dude.direction = "front";
      this.dude.play("walk_front", true);
    } else {
      moving = false;
    }

    if (moving) {
      this.dude.lastMoved = this.time.now;
    } else {
      let idleAnim = "";

      if (this.dude.direction === "left") {
        idleAnim = "idle_right";
        this.dude.flipX = true;
      } else {
        idleAnim = `idle_${this.dude.direction}`;
      }

      if (this.time.now - this.dude.lastMoved > 3000) {
        this.dude.play(idleAnim, true);
      } else {
        this.dude.play(idleAnim, true);
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
    default: "matter",
    matter: {
      debug: true,
    },
  },
  scene: [GameScene],
  pixelArt: true,
};

const game = new Phaser.Game(config);

console.log("Game initialized:", game);
