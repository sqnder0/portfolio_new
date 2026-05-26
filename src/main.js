import "./styles.css";
import Phaser from "phaser";
import { createDudeAnimations } from "./animations.js";

const yearSpan = document.getElementById("currentYear");
const gameRoot = document.getElementById("gameRoot");
const GAME_SIZE = 600;

if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

if (!gameRoot) {
  throw new Error("Expected #gameRoot to exist before booting the game.");
}

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    this.load.tilemapTiledJSON("room_map", "/assets/tiles/room_base.json");
    this.load.spritesheet("room_tiles_32", "/assets/tiles/room_base.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("room_tiles_16", "/assets/tiles/room_base.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet("interior_1", "/assets/tiles/interior_1.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
        this.load.spritesheet("cars", "/assets/tiles/cars.png", {
      frameWidth: 32,
      frameHeight: 48,
    });

    this.load.spritesheet("garden bg", "/assets/tiles/garden/Tileset Spring.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.spritesheet("garden", "/assets/tiles/garden/Spring Crops.png", {
      frameWidth: 16,
      frameHeight: 16,
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
    this.map = this.make.tilemap({ key: "room_map" });
    const tileset32 = this.map.addTilesetImage("room_tileset_32", "room_tiles_32");
    const tileset16 = this.map.addTilesetImage("room_tileset_16", "room_tiles_16");
    const tileset1 = this.map.addTilesetImage("interior_1", "interior_1");
    const cars = this.map.addTilesetImage("cars", "cars");
    const gardenbg = this.map.addTilesetImage("garden bg", "garden bg");
    const garden = this.map.addTilesetImage("garden", "garden");
    this.tilesetTextureKeys = new Map([
      [tileset32?.name, "room_tiles_32"],
      [tileset16?.name, "room_tiles_16"],
      [tileset1?.name, "interior_1"],
      [cars?.name, "cars"],
      [gardenbg?.name, "garden bg"],
      [garden?.name, "garden"],
    ]);


    this.mapX = (this.sys.canvas.width - this.map.widthInPixels) / 2;
    this.mapY = (this.sys.canvas.height - this.map.heightInPixels) / 2;

    const backgroundLayer = this.map.createLayer("background", [tileset32, tileset16], this.mapX, this.mapY);
    const backgroundLayer2 = this.map.createLayer("garden bg", [gardenbg], this.mapX, this.mapY);
    backgroundLayer.setDepth(-1); // Put background behind everything
    backgroundLayer2.setDepth(-1);


    // Load walls layer first (behind dude)
    this.loadObjectLayer("walls", tileset32, 0);

    this.matter.world.setBounds(
      this.mapX,
      this.mapY,
      this.map.widthInPixels,
      this.map.heightInPixels
    );

    this.cameras.main.setBounds(
      this.mapX,
      this.mapY,
      this.map.widthInPixels,
      this.map.heightInPixels
    );


    this.dude = this.matter.add.sprite(300 + this.mapX, 300 + this.mapY, "dude_idle");
    
    // Create custom hitbox first (smaller height for the feet)
    this.dude.setBody({
      type: 'rectangle',
      width: 12,
      height: 14
    });

    // Shift the sprite texture up so the hitbox sits at the bottom (feet)
    this.dude.setOrigin(0.5, 0.55);

    // Then apply physics properties to the new body
    this.dude.setIgnoreGravity(true);
    this.dude.setFixedRotation();

    this.dude.direction = "front";
    this.dude.lastMoved = this.time.now;

    // Running mechanic variables
    this.dude.currentDirection = null;
    this.dude.directionStartTime = 0;
    this.dude.isRunning = false;

    createDudeAnimations(this);

    this.dude.play("idle_front");
    this.dude.setScale(1.5);
    this.dude.setDepth(1);


    // Load furniture layer (in front of dude)
    this.loadObjectLayer("furniture", tileset32, 2);
    this.loadObjectLayer("props", tileset16, 2);
    this.loadObjectLayer("interior 1", tileset1, 3);
    this.loadObjectLayer("cars", cars, 4);
    this.loadObjectLayer("garden", garden, 2);

    // Door collision detection (Matter.js equivalent of overlap)
    this.matter.world.on('collisionstart', (event) => {
      event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
        if ((bodyA === this.dude.body && bodyB.label === 'door') ||
            (bodyB === this.dude.body && bodyA.label === 'door')) {
          const doorBody = bodyA.label === 'door' ? bodyA : bodyB;

          const targetX = doorBody.doorProps.targetX == null ? this.dude.x : doorBody.doorProps.targetX;
          const targetY = doorBody.doorProps.targetY == null ? this.dude.y : doorBody.doorProps.targetY;

          this.teleport(this.dude, targetX, targetY);
        }
      });
    });

    // Make the camera follow dude
    this.cameras.main.startFollow(this.dude);

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  loadObjectLayer(layerName, tileset, depth) {
    const objectLayer = this.map.getObjectLayer(layerName);
    
    if (!objectLayer) {
      console.warn(`Object layer '${layerName}' not found in tilemap`);
      return;
    }

    const objects = objectLayer.objects;
    
    const textureKey = this.tilesetTextureKeys.get(tileset?.name);

    if (!textureKey) {
      console.warn(`No texture key mapped for tileset '${tileset?.name}'`);
      return;
    }

    const texture = this.textures.get(textureKey);

    if (!texture || texture.key === '__MISSING') {
      console.warn(`Texture '${textureKey}' not found for layer '${layerName}'`);
      return;
    }

    objects.forEach((obj) => {
      if (!obj.gid) {
        return;
      }
      
      if (!tileset) {
        console.warn(`Tileset is null for layer '${layerName}'`);
        return;
      }

      const frameIndex = obj.gid - tileset.firstgid;

      if (frameIndex < 0 || frameIndex >= (tileset.total ?? tileset.tileCount ?? 0)) {
        console.warn(
          `Layer '${layerName}' uses gid ${obj.gid} outside tileset '${tileset.name}'`
        );
        return;
      }

      const textureFrame = texture.get(frameIndex);

      if (!textureFrame) {
        console.warn(
          `Texture '${textureKey}' has no frame ${frameIndex} for layer '${layerName}'`
        );
        return;
      }

      // Calculate scale based on Tiled object dimensions vs original texture frame dimensions
      const scaleX = obj.width / textureFrame.width;
      const scaleY = obj.height / textureFrame.height;

      // Access the full tile data, not just properties
      const tileData = tileset.tileData ? tileset.tileData[frameIndex] : null;

      // Check if this tile is a door
      const isDoor = tileset.tileProperties && tileset.tileProperties[frameIndex] && tileset.tileProperties[frameIndex].isDoor === true;
      
      // Helper function to get property value from object properties array
      const getObjectProperty = (propName, defaultValue = null) => {
        if (!obj.properties) return defaultValue;
        const prop = obj.properties.find(p => p.name === propName);
        return prop ? prop.value : defaultValue;
      };
      
      const doorProps = isDoor ? {
        isDoor: true,
        doorType: tileset.tileProperties && tileset.tileProperties[frameIndex] ? tileset.tileProperties[frameIndex].doorType || 'normal' : 'normal',
        targetX: getObjectProperty('targetX', null),
        targetY: getObjectProperty('targetY', null),
        requiredKey: getObjectProperty('requiredKey', null),
        doorMessage: getObjectProperty('doorMessage', null)
      } : null;

      const isCollidable = getObjectProperty('collide', true) !== false;

      if (tileData && tileData.objectgroup && tileData.objectgroup.objects) {
        // Create visual sprite first
        const sprite = this.add.sprite(
          obj.x + obj.width / 2 + this.mapX,
          obj.y - obj.height / 2 + this.mapY,
          textureKey,
          frameIndex
        );
        sprite.setOrigin(0.5, 0.5);
        sprite.setDepth(depth);
        sprite.setScale(scaleX, scaleY);

        this.applyTileAnimation(sprite, tileData, tileset, textureKey, frameIndex);

        // Create Matter.js bodies from collision objects
        if (isCollidable) {
          const collisionObjects = tileData.objectgroup.objects;

          collisionObjects.forEach((collisionObj) => {
            // Create a Matter.js rectangle body for each collision object
            const body = this.matter.add.rectangle(
              obj.x + (collisionObj.x * scaleX) + (collisionObj.width * scaleX) / 2 + this.mapX,
              obj.y -
                obj.height +
                (collisionObj.y * scaleY) +
                (collisionObj.height * scaleY) / 2 +
                this.mapY,
              collisionObj.width * scaleX,
              collisionObj.height * scaleY,
              { 
                isStatic: true,
                isSensor: isDoor, // Make it a sensor if it's a door
                label: isDoor ? 'door' : undefined
              }
            );
            
            // Add door properties if it's a door
            if (isDoor) {
              body.doorProps = doorProps;
            }
          });
        }
      } else {
        // Fallback: create simple rectangle collision for tiles without custom collision
        const sprite = isCollidable
          ? this.matter.add.sprite(
              obj.x + obj.width / 2 + this.mapX,
              obj.y - obj.height / 2 + this.mapY,
              textureKey,
              frameIndex
            )
          : this.add.sprite(
              obj.x + obj.width / 2 + this.mapX,
              obj.y - obj.height / 2 + this.mapY,
              textureKey,
              frameIndex
            );

        sprite.setOrigin(0.5, 0.5);
        sprite.setScale(scaleX, scaleY);

        if (isCollidable) {
          sprite.setStatic(true);
          sprite.setDepth(depth);
        } else {
          sprite.setDepth(-1);
        }

        this.applyTileAnimation(sprite, tileData, tileset, textureKey, frameIndex);
        
        // Add door properties to the sprite body if it's a door
        if (isDoor && isCollidable) {
          sprite.body.isSensor = true; // Make it a sensor
          sprite.body.label = 'door';
          sprite.body.doorProps = doorProps;
        }
      }
    });
  }

  applyTileAnimation(sprite, tileData, tileset, textureKey, frameIndex) {
    if (!tileData || !tileData.animation || tileData.animation.length === 0) {
      return;
    }

    // Use frameIndex (gid-relative) to ensure unique animation keys per animated tile
    const animationKey = `${tileset.name}_tile_${frameIndex}`;

    if (!this.anims.exists(animationKey)) {
      this.anims.create({
        key: animationKey,
        frames: tileData.animation.map((frame) => ({
          key: textureKey,
          frame: frame.tileid,
          duration: frame.duration,
        })),
        repeat: -1,
      });
    }

    sprite.play(animationKey);
  }

  update() {
    const baseSpeed = 1;
    const runSpeedMultiplier = 2000; // 1.5x faster when running
    const runThreshold = 1000; // 2 seconds
    
    let horizontal_speed = baseSpeed;
    let vertical_speed = baseSpeed;
    let moving = true;
    let currentDirection = null;

    this.dude.setVelocity(0);

    if (this.cursors.left.isDown) {
      currentDirection = "left";
      this.dude.setVelocityY(0);
      this.dude.setVelocityX(-horizontal_speed);
      this.dude.direction = "left";
      this.dude.flipX = true;
      this.dude.play("walk_right", true);
    } else if (this.cursors.right.isDown) {
      currentDirection = "right";
      this.dude.setVelocityY(0);
      this.dude.setVelocityX(horizontal_speed);
      this.dude.direction = "right";
      this.dude.flipX = false;
      this.dude.play("walk_right", true);
    } else if (this.cursors.up.isDown) {
      currentDirection = "up";
      this.dude.setVelocityX(0);
      this.dude.setVelocityY(-vertical_speed);
      this.dude.direction = "back";
      this.dude.play("walk_back", true);
    } else if (this.cursors.down.isDown) {
      currentDirection = "down";
      this.dude.setVelocityX(0);
      this.dude.setVelocityY(vertical_speed);
      this.dude.direction = "front";
      this.dude.play("walk_front", true);
    } else {
      moving = false;
      currentDirection = null;
    }

    // Running mechanic logic
    if (moving && currentDirection) {
      // Check if direction changed
      if (this.dude.currentDirection !== currentDirection) {
        this.dude.currentDirection = currentDirection;
        this.dude.directionStartTime = this.time.now;
        this.dude.isRunning = false;
      }
      
      // Check if we should start running (same direction for 5 seconds)
      const timeInDirection = this.time.now - this.dude.directionStartTime;
      if (timeInDirection > runThreshold && !this.dude.isRunning) {
        this.dude.isRunning = true;
      }
      
      // Apply speed boost if running
      if (this.dude.isRunning) {
        const currentVelocity = this.dude.body.velocity;
        this.dude.setVelocity(
          currentVelocity.x * Math.min(runSpeedMultiplier, (timeInDirection - runThreshold)/4000 + 1),
          currentVelocity.y * Math.min(runSpeedMultiplier, (timeInDirection - runThreshold)/4000 + 1),
        );
      }
    } else {
      // Reset running when not moving
      this.dude.currentDirection = null;
      this.dude.isRunning = false;
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
  teleport(entity, x, y) {
    entity.setX(x);
    entity.setY(y);
  }
}

const config = {
  type: Phaser.AUTO,
  parent: gameRoot,
  backgroundColor: "#181818",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_SIZE,
    height: GAME_SIZE,
  },
  physics: {
    default: "matter",
    matter: {
      debug: false,
    },
  },
  scene: [GameScene],
  pixelArt: true,
};
const game = new Phaser.Game(config);

// Expose helpers only in dev for debugging.
if (import.meta.env.DEV) {
  window.game = game;
  window.scene = config.scene[0];
  console.log("Game initialized:", game);
}
