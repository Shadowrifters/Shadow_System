// src/game/animation.js
class SpriteAnimation {
    /**
     * @param {HTMLImageElement} image - The sprite sheet image.
     * @param {number} frameWidth - The width of one frame.
     * @param {number} frameHeight - The height of one frame.
     * @param {number} frameCount - Total number of frames.
     * @param {number} frameSpeed - Ticks per frame change.
     * @param {boolean} loop - Whether the animation should loop.
     */
    constructor(image, frameWidth, frameHeight, frameCount, frameSpeed, loop = true) {
      this.image = image;
      this.frameWidth = frameWidth;
      this.frameHeight = frameHeight;
      this.frameCount = frameCount;
      this.frameSpeed = frameSpeed;
      this.loop = loop;
      this.currentFrame = 0;
      this.counter = 0;
    }
  
    update() {
      if (!this.image.complete || this.image.naturalWidth === 0) return;
      this.counter++;
      if (this.counter >= this.frameSpeed) {
        this.counter = 0;
        if (this.currentFrame < this.frameCount - 1) {
          this.currentFrame++;
        } else if (this.loop) {
          this.currentFrame = 0;
        }
      }
    }
  
    /**
     * Draws the current frame.
     * @param {CanvasRenderingContext2D} ctx - The drawing context.
     * @param {number} x - Destination x.
     * @param {number} y - Destination y.
     * @param {number} [scale=1] - Scale factor.
     */
    draw(ctx, x, y, scale = 3) {
      if (!this.image.complete || this.image.naturalWidth === 0) return;
      ctx.drawImage(
        this.image,
        this.currentFrame * this.frameWidth,
        0,
        this.frameWidth,
        this.frameHeight,
        x,
        y,
        this.frameWidth * scale,
        this.frameHeight * scale
      );
    }
  }
  
  export default SpriteAnimation;
  