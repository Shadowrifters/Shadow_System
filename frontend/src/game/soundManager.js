// src/game/soundManager.js
const soundPaths = {
  player: {
    Attack_1: "/assets/Sprites/Firevizard/Attack_1.mp3",
    Attack_2: "/assets/Sprites/Firevizard/Attack_2.mp3",
    charge: "/assets/Sprites/Firevizard/Charge.mp3"
  },
  enemy: {
    Attack_1: "/assets/Sprites/LightningMage/Attack_1.mp3",
    Attack_2: "/assets/Sprites/LightningMage/Attack_2.mp3",
    charge: "/assets/Sprites/LightningMage/Charge.mp3"
  }
};

const soundCache = {
  player: {},
  enemy: {}
};

function loadSound(url) {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.src = url;
    audio.addEventListener("canplaythrough", () => resolve(audio));
    audio.addEventListener("error", (e) => reject(e));
  });
}

async function preloadSounds() {
  for (const role in soundPaths) {
    for (const attack in soundPaths[role]) {
      try {
        const audio = await loadSound(soundPaths[role][attack]);
        soundCache[role][attack] = audio;
        console.log(`Loaded sound for ${role} ${attack}`);
      } catch (error) {
        console.error(
          `Failed to load sound for ${role} ${attack} from ${soundPaths[role][attack]}`,
          error
        );
      }
    }
  }
}

function playSound(character, attackName) {
  const role =
    typeof character.role === "string" ? character.role : String(character.role);
  if (!soundCache[role] || !soundCache[role][attackName]) {
    console.error(`Sound for ${role} ${attackName} not loaded.`);
    return;
  }
  const soundClone = soundCache[role][attackName].cloneNode();
  if (role === "enemy" && attackName === "Attack_1") {
    soundClone.addEventListener(
      "canplaythrough",
      () => {
        try {
          soundClone.currentTime = 5;
          soundClone.play().catch((err) =>
            console.error("Error playing sound:", err)
          );
        } catch (err) {
          console.error("Error setting currentTime or playing sound:", err);
        }
      },
      { once: true }
    );
  } else {
    soundClone.play().catch((err) =>
      console.error("Error playing sound:", err)
    );
  }
}

export { preloadSounds, playSound };
