export function createDudeAnimations(scene) {
  scene.anims.create({
    key: "idle_front",
    frames: [
      { key: "dude_idle", frame: 0 },
      { key: "dude_idle", frame: 3 },
    ],
    frameRate: 2,
    repeat: -1,
  });
  scene.anims.create({
    key: "idle_back",
    frames: [
      { key: "dude_idle", frame: 1 },
      { key: "dude_idle", frame: 4 },
    ],
    frameRate: 2,
    repeat: -1,
  });
  scene.anims.create({
    key: "idle_right",
    frames: [
      { key: "dude_idle", frame: 2 },
      { key: "dude_idle", frame: 5 },
    ],
    frameRate: 2,
    repeat: -1,
  });
  scene.anims.create({
    key: "walk_front",
    frames: scene.anims.generateFrameNumbers("dude_walk", {
      frames: [0, 3, 6, 9],
    }),
    frameRate: 8,
    repeat: -1,
  });

  scene.anims.create({
    key: "walk_back",
    frames: scene.anims.generateFrameNumbers("dude_walk", {
      frames: [1, 4, 7, 10],
    }),
    frameRate: 8,
    repeat: -1,
  });

  scene.anims.create({
    key: "walk_right",
    frames: scene.anims.generateFrameNumbers("dude_walk", {
      frames: [2, 5, 8, 11],
    }),
    frameRate: 8,
    repeat: -1,
  });
}
