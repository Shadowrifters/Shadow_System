// src/game/moveToward.js
function moveToward(chara, target) {
    const speed = 2;
    if (Math.abs(chara.x - target.x) > 5) {
      if (chara.x < target.x) {
        chara.x += speed;
      } else {
        chara.x -= speed;
      }
    }
  }
  
  export default moveToward;
  