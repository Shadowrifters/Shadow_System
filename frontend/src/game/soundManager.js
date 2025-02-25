// src/game/soundManager.js

const soundPaths = {
  player: {
    Attack_1: "/assets/Sprites/Firevizard/Attack_1.mp3",
    Attack_2: "/assets/Sprites/Firevizard/Attack_2.mp3",
    charge: "/assets/Sprites/Firevizard/Charge.mp3"
  },
  enemy: {
    Attack_1: "/assets/Sprites/LightningMage/Attack_1.mp3", // Ensure folder is named exactly "LightningMage"
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
    audio.addEventListener("error", (e) => {
      console.error("Error loading sound from:", url, e);
      reject(e);
    });
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
  const role = character.role; // should be "player" or "enemy"
  if (!soundCache[role] || !soundCache[role][attackName]) {
    console.error(`Sound for ${role} ${attackName} not loaded.`);
    return;
  }
  const soundClone = soundCache[role][attackName].cloneNode();
  soundClone.play().catch(err => console.error("Error playing sound:", err));
}

export { preloadSounds, playSound };
