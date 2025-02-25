import SpriteAnimation from "./animation.js";

class Bullet {
  /**
   * @param {number} x - Starting x-coordinate.
   * @param {number} y - Starting y-coordinate.
   * @param {number} direction - 1 (right) or -1 (left).
   * @param {string} source - "player" or "enemy".
   */
  constructor(x, y, direction, source) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.source = source;
    this.speed = 10;
    this.active = true;
    // Use the charge bullet sprite sheet.
    // For the player, the sprite sheet is 768x64 with 12 frames (each frame 64x64).
    if (this.source === "player") {
      const img = new Image();
      img.src = "public/assets/Sprites/Firevizard/Charge.png";
      this.animation = new SpriteAnimation(img, 768 / 12, 64, 12, 5, true);
    } else {
      const img = new Image();
      img.src = "public/assets/Sprites/LightningMage/Charge.png";
      this.animation = new SpriteAnimation(img, 768 / 12, 64, 12, 5, true);
    }
    this.width = 768 / 12; // 64
    this.height = 64;
  }
  
  update() {
    this.x += this.speed * this.direction;
    this.animation.update();
    if (this.x < 0 || this.x > window.innerWidth) {
      this.active = false;
    }
  }
  
  draw(ctx) {
    ctx.save();
    if (this.direction === -1) {
      ctx.translate(this.x + this.width, this.y);
      ctx.scale(-1, 1);
      this.animation.draw(ctx, 0, 0, 1);
    } else {
      this.animation.draw(ctx, this.x, this.y, 1);
    }
    ctx.restore();
  }
}

export default Bullet;
