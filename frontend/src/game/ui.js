// src/game/ui.js
class UI {
    constructor(ctx, canvas, player, enemy) {
      this.ctx = ctx;
      this.canvas = canvas;
      this.player = player;
      this.enemy = enemy;
    }
  
    draw() {
      const ctx = this.ctx;
      ctx.save();
      const barWidth = this.canvas.width * 0.3;
      const barHeight = this.canvas.height * 0.05;
      const margin = 20;
  
      // Draw Player Health Bar.
      const playerHealthPercent = Math.max(this.player.health, 0) / 100;
      ctx.fillStyle = this.player.health < 30 ? "red" : "green";
      ctx.fillRect(margin, margin, barWidth * playerHealthPercent, barHeight);
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.strokeRect(margin, margin, barWidth, barHeight);
      ctx.fillStyle = "white";
      ctx.font = "20px 'Press Start 2P', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        `${this.player.health}`,
        margin + barWidth / 2,
        margin + barHeight / 2
      );
  
      // Draw Enemy Health Bar.
      const enemyHealthPercent = Math.max(this.enemy.health, 0) / 100;
      ctx.fillStyle = this.enemy.health < 30 ? "red" : "green";
      ctx.fillRect(
        this.canvas.width - barWidth - margin,
        margin,
        barWidth * enemyHealthPercent,
        barHeight
      );
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        this.canvas.width - barWidth - margin,
        margin,
        barWidth,
        barHeight
      );
      ctx.fillStyle = "white";
      ctx.font = "20px 'Press Start 2P', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        `${this.enemy.health}`,
        this.canvas.width - margin - barWidth / 2,
        margin + barHeight / 2
      );
  
      ctx.restore();
    }
  }
  
  export default UI;
  