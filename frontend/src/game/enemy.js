// src/game/enemy.js
import SpriteAnimation from "./animation.js";

class Enemy {
  constructor(ctx) {
    this.ctx = ctx;
    this.x = ctx.canvas.width - 200;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.gravity = 0.8;
    this.friction = 0.8;
    this.onGround = false;
    this.scale = 3.0;
    this.direction = -1;
    this.health = 100;
    this.state = "Idle";
    this.animations = {};
    this.attackPower = { Attack_1: 10, Attack_2: 10 };
    this.selectedWeapon = "Sword";
    this.pendingAttack = null;
    this.loadAnimations();
  }

  loadAnimations() {
    const statesConfig = {
      Idle: { sheetWidth: 896, sheetHeight: 128, frameCount: 7, loop: true },
      Jump: { sheetWidth: 1152, sheetHeight: 128, frameCount: 9, loop: false },
      Run: { sheetWidth: 1024, sheetHeight: 128, frameCount: 8, loop: true },
      Walk: { sheetWidth: 768, sheetHeight: 128, frameCount: 6, loop: true },
      Hurt: { sheetWidth: 384, sheetHeight: 128, frameCount: 3, loop: true },
      Dead: { sheetWidth: 768, sheetHeight: 128, frameCount: 6, loop: true },
      Attack_1: { sheetWidth: 1280, sheetHeight: 128, frameCount: 10, loop: false },
      Attack_2: { sheetWidth: 512, sheetHeight: 128, frameCount: 4, loop: false },
      Charge: { sheetWidth: 576, sheetHeight: 64, frameCount: 9, loop: false }
    };

    Object.keys(statesConfig).forEach((state) => {
      const config = statesConfig[state];
      const img = new Image();
      // Assets in public are served from the root, so use a leading slash.
      img.src = `/assets/Sprites/Lightning Mage/${state}.png`;
      let frameSpeed = state === "Jump" ? 5 : 10;
      if (state === "Attack_1" || state === "Attack_2") frameSpeed = 5;
      this.animations[state] = new SpriteAnimation(
        img,
        config.sheetWidth / config.frameCount,
        config.sheetHeight,
        config.frameCount,
        frameSpeed,
        config.loop
      );
    });
  }

  update() {
    this.x += this.vx;
    if (this.state === "Idle") {
      this.vx = 0;
    } else if (this.onGround) {
      this.vx *= this.friction;
      if (Math.abs(this.vx) < 0.1) this.vx = 0;
    }
    this.y += this.vy;
    if (!this.onGround) this.vy += this.gravity;
    const baseHeight = this.animations["Idle"]
      ? this.animations["Idle"].frameHeight * this.scale
      : 128;
    const groundY = this.ctx.canvas.height - baseHeight;
    if (this.y > groundY) {
      this.y = groundY;
      this.vy = 0;
      this.onGround = true;
      if (this.state === "Jump") this.setState("Idle");
    } else {
      this.onGround = false;
    }
    if (this.y < 0) {
      this.y = 0;
      this.vy = 0;
    }
    const enemyWidth = this.animations["Idle"]
      ? this.animations["Idle"].frameWidth * this.scale
      : 50;
    if (this.x < 0) this.x = 0;
    if (this.x > this.ctx.canvas.width - enemyWidth)
      this.x = this.ctx.canvas.width - enemyWidth;
    if (this.animations[this.state] && this.state !== "Idle") {
      this.animations[this.state].update();
    }
  }

  draw() {
    if (this.animations[this.state]) {
      const ctx = this.ctx;
      ctx.save();
      if (this.direction === -1) {
        const frameWidth = this.animations[this.state].frameWidth * this.scale;
        ctx.translate(this.x + frameWidth, this.y);
        ctx.scale(-1, 1);
        this.animations[this.state].draw(ctx, 0, 0, this.scale);
      } else {
        ctx.translate(this.x, this.y);
        this.animations[this.state].draw(ctx, 0, 0, this.scale);
      }
      ctx.restore();
    }
  }

  setState(newState) {
    if (this.animations[newState] && this.state !== newState) {
      this.state = newState;
      this.animations[newState].currentFrame = 0;
      this.animations[newState].counter = 0;
    }
  }
}

export default Enemy;
