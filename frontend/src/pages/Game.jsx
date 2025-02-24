import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Game.css";
import Player from "../game/player.js";
import Enemy from "../game/enemy.js";
import UI from "../game/ui.js";
import moveToward from "../game/moveToward.js";
import Bullet from "../game/bullet.js";
import { supabase } from "../supabaseClient.js";
import { preloadSounds, playSound } from "../game/soundManager.js";

// Guard for process.env
const SERVER_BASE_URL =
  (typeof process !== "undefined" && process.env.REACT_APP_SERVER_URL) ||
  "http://localhost:5000";

const Game = () => {
  const canvasRef = useRef(null);
  const gameTimerRef = useRef(null);
  const dialogContainerRef = useRef(null);
  const dialogOutputRef = useRef(null);
  const dialogInputRef = useRef(null);
  const gameOverOverlayRef = useRef(null);
  const winnerTextRef = useRef(null);

  // State for analysis and menu
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisAvailable, setAnalysisAvailable] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const gameOverRef = useRef(false);
  const navigate = useNavigate();

  // Ensure the user has an analysis row
  const ensureAnalysisRow = async (dn) => {
    if (!dn) return;
    try {
      const response = await fetch(
        `${SERVER_BASE_URL}/api/performance?display_name=${encodeURIComponent(dn)}`
      );
      if (response.status === 404) {
        const dummyTranscript = "Initial dummy transcript.";
        const createRes = await fetch(`${SERVER_BASE_URL}/api/analysis`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: dummyTranscript, displayName: dn }),
        });
        const createData = await createRes.json();
        console.log("Created analysis row:", createData);
      } else if (!response.ok) {
        throw new Error("Failed to get performance row");
      } else {
        const data = await response.json();
        console.log("Analysis row exists:", data);
      }
    } catch (err) {
      console.error("Error ensuring analysis row:", err);
    }
  };

  useEffect(() => {
    // Preload all sounds on startup
    preloadSounds();

    async function getCurrentUser() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        console.error("No user found in supabase auth", error);
        return;
      }
      const dn = user.user_metadata.display_name;
      setDisplayName(dn);
      ensureAnalysisRow(dn);
    }
    getCurrentUser();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const gameTimer = gameTimerRef.current;
    const dialogContainer = dialogContainerRef.current;
    const dialogOutput = dialogOutputRef.current;
    const dialogInput = dialogInputRef.current;
    const gameOverOverlay = gameOverOverlayRef.current;
    const winnerText = winnerTextRef.current;

    // Helper functions
    const preloadImage = (img) =>
      new Promise((resolve, reject) => {
        if (img.complete && img.naturalWidth) resolve();
        else {
          img.onload = () => resolve();
          img.onerror = () =>
            reject(new Error("Failed to load image: " + img.src));
        }
      });

    const preloadCharacterImages = (character) => {
      const promises = [];
      for (const state in character.animations) {
        promises.push(preloadImage(character.animations[state].image));
      }
      return Promise.all(promises);
    };

    const preloadBackground = (bgImg) => preloadImage(bgImg);
    const updateTimer = (timerElem, startTime) => {
      const currentTime = Date.now();
      const elapsed = Math.floor((currentTime - startTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      timerElem.innerText =
        (minutes < 10 ? "0" + minutes : minutes) +
        ":" +
        (seconds < 10 ? "0" + seconds : seconds);
    };

    const pointInRect = (point, rect) => {
      return (
        point.x >= rect.x &&
        point.x <= rect.x + rect.width &&
        point.y >= rect.y &&
        point.y <= rect.y + rect.height
      );
    };

    const getCentralHitbox = (box, factor = 0.5) => {
      const newWidth = box.width * factor;
      const newHeight = box.height * factor;
      const newX = box.x + (box.width - newWidth) / 2;
      const newY = box.y + (box.height - newHeight) / 2;
      return { x: newX, y: newY, width: newWidth, height: newHeight };
    };

    let enemyTextTimeout = null;
    const animateEnemyText = (text, container) => {
      if (enemyTextTimeout) {
        clearTimeout(enemyTextTimeout);
        enemyTextTimeout = null;
      }
      container.innerHTML = "";
      let i = 0;
      function typeLetter() {
        if (i < text.length) {
          container.innerHTML += text.charAt(i);
          i++;
          enemyTextTimeout = setTimeout(typeLetter, 50);
        }
      }
      typeLetter();
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - dialogContainer.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    const observer = new MutationObserver(() => {
      resizeCanvas();
    });
    observer.observe(dialogContainer, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    // Random Background: choose one of nine images (bg1.png to bg9.png)
    const bgImage = new Image();
    const randomIndex = Math.floor(Math.random() * 9) + 1;
    bgImage.src = `assets/Sprites/bg${randomIndex}.png`;

    const player = new Player(ctx);
    const enemy = new Enemy(ctx);
    player.role = "player";
    enemy.role = "enemy";
    const ui = new UI(ctx, canvas, player, enemy);
    let bullets = [];
    Promise.all([
      preloadBackground(bgImage),
      preloadCharacterImages(player),
      preloadCharacterImages(enemy),
    ]).catch((err) => console.error("Error preloading images:", err));

    if (player.animations["Idle"] && player.animations["Idle"].frameHeight) {
      player.y =
        canvas.height - player.animations["Idle"].frameHeight * player.scale;
    }
    if (enemy.animations["Idle"] && enemy.animations["Idle"].frameHeight) {
      enemy.y =
        canvas.height - enemy.animations["Idle"].frameHeight * enemy.scale;
    }
    let startTime = Date.now();
    let conversationTranscript = "";
    let playerShouldMove = false;
    let enemyShouldMove = false;

    // endGame: store final analysis and mark analysis available.
    const endGame = async (winMessage) => {
      gameOverRef.current = true;
      if (winnerText) winnerText.innerText = winMessage;
      if (gameOverOverlay) gameOverOverlay.classList.remove("hidden");
      setAnalysisLoading(true);
      let dn = displayName;
      if (!dn) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          dn = user.user_metadata.display_name;
          setDisplayName(dn);
        }
      }
      if (!dn) {
        console.error("No displayName available in endGame");
        setAnalysisLoading(false);
        return;
      }
      try {
        const finalAnalysisResponse = await fetch(
          `${SERVER_BASE_URL}/api/analysis`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transcript: conversationTranscript, displayName: dn }),
          }
        );
        const finalAnalysis = await finalAnalysisResponse.json();
        console.log("Final Analysis:", finalAnalysis);
        setAnalysisAvailable(true);
      } catch (err) {
        console.error("Error storing final analysis:", err);
      } finally {
        setAnalysisLoading(false);
      }
    };

    // Game loop
    const gameLoop = () => {
      if (gameOverRef.current) return;
      updateTimer(gameTimer, startTime);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (bgImage.complete) {
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
      }

      // --- Player Attack Logic ---
      if (player.pendingAttack) {
        if (player.pendingAttack.move === "Charge") {
          // For charge, do not change the player's animation.
          if (!player.pendingAttack.soundPlayed) {
            playSound(player, "charge");
            player.pendingAttack.soundPlayed = true;
          }
          // Immediately fire a bullet from the player's position.
          bullets.push(
            new Bullet(
              player.x + (player.animations["Idle"].frameWidth * player.scale) / 2,
              player.y + (player.animations["Idle"].frameHeight * player.scale) / 2,
              player.direction,
              "player"
            )
          );
          enemy.health = Math.max(enemy.health - player.pendingAttack.attackPower, 5);
          player.health = Math.min(player.health + (player.pendingAttack.hpPoints || 0), 100);
          delete player.pendingAttack;
          player.setState("Idle");
        } else {
          // Other attacks (e.g. Attack_1, Attack_2)
          if (Math.abs(player.x - enemy.x) >= 50) {
            player.setState("Run");
            moveToward(player, enemy);
          } else {
            if (player.state !== player.pendingAttack.move) {
              player.setState(player.pendingAttack.move);
            }
            const currentAnim = player.animations[player.pendingAttack.move];
            if (currentAnim && currentAnim.currentFrame >= currentAnim.frameCount - 1) {
              if (!player.pendingAttack.soundPlayed) {
                playSound(player, player.pendingAttack.move);
                player.pendingAttack.soundPlayed = true;
              }
              enemy.health = Math.max(enemy.health - player.pendingAttack.attackPower, 5);
              player.health = Math.min(player.health + (player.pendingAttack.hpPoints || 0), 100);
              delete player.pendingAttack;
              player.setState("Idle");
            }
          }
        }
      } else {
        player.setState("Idle");
      }

      // --- Enemy Attack Logic ---
      if (enemy.pendingAttack) {
        if (enemy.pendingAttack.move === "Charge") {
          // For enemy charge, fire a bullet immediately without changing its animation.
          if (!enemy.pendingAttack.soundPlayed) {
            playSound(enemy, "charge");
            enemy.pendingAttack.soundPlayed = true;
          }
          bullets.push(
            new Bullet(
              enemy.x + (enemy.animations["Idle"].frameWidth * enemy.scale) / 2,
              enemy.y + (enemy.animations["Idle"].frameHeight * enemy.scale) / 2,
              enemy.direction,
              "enemy"
            )
          );
          player.health = Math.max(player.health - enemy.pendingAttack.attackPower, 1);
          enemy.health = Math.min(enemy.health + (enemy.pendingAttack.hpPoints || 0), 100);
          delete enemy.pendingAttack;
          enemy.setState("Idle");
        } else if (enemy.pendingAttack.move === "bought") {
          endGame("Product Sold! You win!");
          return;
        } else if (enemy.pendingAttack.move === "stop") {
          endGame("Customer Refused! You lose!");
          return;
        } else {
          if (Math.abs(enemy.x - player.x) >= 50) {
            enemy.setState("Run");
            moveToward(enemy, player);
          } else {
            if (enemy.state !== enemy.pendingAttack.move) {
              enemy.setState(enemy.pendingAttack.move);
            }
            const currentAnim = enemy.animations[enemy.pendingAttack.move];
            if (currentAnim && currentAnim.currentFrame >= currentAnim.frameCount - 1) {
              if (!enemy.pendingAttack.soundPlayed) {
                playSound(enemy, enemy.pendingAttack.move);
                enemy.pendingAttack.soundPlayed = true;
              }
              player.health = Math.max(player.health - enemy.pendingAttack.attackPower, 1);
              enemy.health = Math.min(enemy.health + (enemy.pendingAttack.hpPoints || 0), 100);
              delete enemy.pendingAttack;
              enemy.setState("Idle");
            }
          }
        }
      } else {
        enemy.setState("Idle");
      }

      // --- Bullet Handling ---
      bullets.forEach((bullet) => {
        bullet.update();
        bullet.draw(ctx);
      });
      bullets = bullets.filter((bullet) => bullet.active);

      const playerBox = {
        x: player.x,
        y: player.y,
        width: player.animations["Idle"]
          ? player.animations["Idle"].frameWidth * player.scale
          : 50,
        height: player.animations["Idle"]
          ? player.animations["Idle"].frameHeight * player.scale
          : 50,
      };
      const enemyBox = {
        x: enemy.x,
        y: enemy.y,
        width: enemy.animations["Idle"]
          ? enemy.animations["Idle"].frameWidth * enemy.scale
          : 50,
        height: enemy.animations["Idle"]
          ? enemy.animations["Idle"].frameHeight * enemy.scale
          : 50,
      };

      bullets.forEach((bullet) => {
        const bulletCenter = {
          x: bullet.x + bullet.width / 2,
          y: bullet.y + bullet.height / 2,
        };
        const enemyCentralBox = getCentralHitbox(enemyBox, 0.5);
        const playerCentralBox = getCentralHitbox(playerBox, 0.5);
        if (
          bullet.source === "player" &&
          pointInRect(bulletCenter, enemyCentralBox)
        ) {
          enemy.health = Math.max(enemy.health - 10, 5);
          bullet.active = false;
        }
        if (
          bullet.source === "enemy" &&
          pointInRect(bulletCenter, playerCentralBox)
        ) {
          player.health = Math.max(player.health - 10, 1);
          bullet.active = false;
        }
      });
      player.health = Math.max(player.health, 1);
      enemy.health = Math.max(enemy.health, 5);

      player.update();
      player.draw();
      enemy.update();
      enemy.draw();
      ui.draw();
      requestAnimationFrame(gameLoop);
    };

    gameLoop();

    const handleDialogInput = async (e) => {
      if (e.key === "Enter") {
        const message = dialogInput.value.trim();
        if (message !== "") {
          conversationTranscript += `Vendor: ${message}\n`;
          const playerMessage = message;
          try {
            const resCustomer = await fetch(`${SERVER_BASE_URL}/api/customer-response`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ message })
            });
            let customerData = {};
            try {
              customerData = await resCustomer.json();
            } catch (err) {
              console.error("Failed to parse customer response JSON", err);
            }
            const customerReply = customerData.response || "";
            conversationTranscript += `Customer: ${customerReply}\n`;
            animateEnemyText(customerReply, dialogOutput);
            const resEnemy = await fetch(`${SERVER_BASE_URL}/api/analyze-game-performance`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                role: "enemy",
                currentText: customerReply,
                previousText: playerMessage,
                currentHealth: enemy.health,
              }),
            });
            let enemyAnalysis = {};
            try {
              enemyAnalysis = await resEnemy.json();
            } catch (err) {
              console.error("Failed to parse enemy analysis JSON", err);
            }
            if (enemyAnalysis) {
              enemy.pendingAttack = {
                move: enemyAnalysis.Weapon,
                attackPower: enemyAnalysis.attackPower,
                hpPoints: enemyAnalysis.hpPoints,
                weapon: enemyAnalysis.Weapon,
              };
            }
            const resPlayer = await fetch(`${SERVER_BASE_URL}/api/analyze-game-performance`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                role: "player",
                currentText: playerMessage,
                previousText: customerReply,
                currentHealth: player.health,
              }),
            });
            let playerAnalysis = {};
            try {
              playerAnalysis = await resPlayer.json();
            } catch (err) {
              console.error("Failed to parse player analysis JSON", err);
            }
            if (playerAnalysis) {
              player.pendingAttack = {
                move: playerAnalysis.Weapon,
                attackPower: playerAnalysis.attackPower,
                hpPoints: playerAnalysis.hpPoints,
                weapon: playerAnalysis.Weapon,
              };
            }
          } catch (error) {
            console.error("Error processing dialogue:", error);
            animateEnemyText("Silence...", dialogOutput);
          }
        }
        dialogInput.value = "";
      }
    };

    dialogInput.addEventListener("keydown", handleDialogInput);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      observer.disconnect();
      dialogInput.removeEventListener("keydown", handleDialogInput);
    };
  }, [displayName]);

  const handleAnalysis = () => {
    navigate("/analysis");
  };

  return (
    <div id="gameContainer">
      <canvas id="gameCanvas" ref={canvasRef}></canvas>
      <div id="gameTimer" ref={gameTimerRef}>00:00</div>
      <div id="dialogContainer" ref={dialogContainerRef}>
        <div id="dialogOutput" ref={dialogOutputRef}></div>
        <input
          id="dialogInput"
          ref={dialogInputRef}
          type="text"
          placeholder="Type your dialogue..."
        />
      </div>
      {/* Menu Button */}
      <button id="menuButton" onClick={() => setMenuVisible(!menuVisible)}>
        Menu
      </button>
      {menuVisible && (
        <div id="menuPopup" className="donation-bg">
          <button onClick={() => setMenuVisible(false)}>Resume</button>
          
          <button
            onClick={() => {
              if (analysisAvailable) {
                setMenuVisible(false);
                handleAnalysis();
              }
            }}
            disabled={!analysisAvailable}
          >
            Analyse
          </button>
          <button
            onClick={() => {
              setMenuVisible(false);
              navigate("/home");
            }}
          >
            Home
          </button>
        </div>
      )}
      <div id="gameOverOverlay" ref={gameOverOverlayRef} className="hidden">
        <div id="gameOverContent">
          <h1 id="winnerText" ref={winnerTextRef}></h1>
          <button onClick={handleAnalysis} disabled={!analysisAvailable}>
            Analysis
          </button>
          {analysisLoading && (
            <p className="loading">
              Analyzing conversation... please wait
            </p>
          )}
        </div>
      </div>
      <div id="orientationWarning" className="hidden">
        Please rotate your device.
      </div>
    </div>
  );
};

export default Game;
