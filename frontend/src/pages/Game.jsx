import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; // Ensure Supabase is configured
import "../styles/game.css";
import Player from "../game/player.js";
import Enemy from "../game/enemy.js";
import UI from "../game/ui.js";
import moveToward from "../game/moveToward.js";
import Bullet from "../game/bullet.js";
import { preloadSounds, playSound } from "../game/soundManager.js";

const SERVER_BASE_URL =
  (typeof process !== "undefined" && process.env.VITE_SERVER_URL) ||
  "https://shadow-system.vercel.app"; // Remove trailing slash

const Game = () => {
  const canvasRef = useRef(null);
  const gameTimerRef = useRef(null);
  const dialogContainerRef = useRef(null);
  const dialogOutputRef = useRef(null);
  const dialogInputRef = useRef(null);
  const gameOverOverlayRef = useRef(null);
  const winnerTextRef = useRef(null);

  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisAvailable, setAnalysisAvailable] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [displayName, setDisplayName] = useState("Guest");

  const gameOverRef = useRef(false);
  const navigate = useNavigate();

  // Check for a signed-in user on mount using supabase.auth.getSession()
  useEffect(() => {
    const checkUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        const name =
          session.user.user_metadata?.display_name ||
          session.user.email ||
          "Unknown User";
        console.log("User is signed in:", name);
        setDisplayName(name);
      } else {
        console.log("User is not signed in.");
        setDisplayName("Guest");
      }
    };
    checkUserSession();
  }, []);

  useEffect(() => {
    preloadSounds();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const gameTimer = gameTimerRef.current;
    const dialogContainer = dialogContainerRef.current;
    const dialogOutput = dialogOutputRef.current;
    const dialogInput = dialogInputRef.current;
    const gameOverOverlay = gameOverOverlayRef.current;
    const winnerText = winnerTextRef.current;

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
    bgImage.src = `/assets/Sprites/bg${randomIndex}.png`;

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
      player.y = canvas.height - player.animations["Idle"].frameHeight * player.scale;
    }
    if (enemy.animations["Idle"] && enemy.animations["Idle"].frameHeight) {
      enemy.y = canvas.height - enemy.animations["Idle"].frameHeight * enemy.scale;
    }
    let startTime = Date.now();
    let conversationTranscript = "";
    let playerShouldMove = false;
    let enemyShouldMove = false;

    // endGame: Re-check session and send transcript to API.
    // This function ends the game and shows the winner overlay.
    const endGame = async (winMessage) => {
      console.log("Ending game with message:", winMessage);
      gameOverRef.current = true;
      if (winnerText) winnerText.innerText = winMessage;
      if (gameOverOverlay) gameOverOverlay.classList.remove("hidden");
      setAnalysisLoading(true);

      try {
        console.log("Transcript sent to analysis API:", conversationTranscript);
        const { data: { session } } = await supabase.auth.getSession();
        let currentDisplayName = "Guest";
        if (session && session.user) {
          currentDisplayName =
            session.user.user_metadata?.display_name ||
            session.user.email ||
            "Unknown User";
          console.log("User is signed in (rechecked):", currentDisplayName);
        } else {
          console.log("User is not signed in (rechecked).");
        }

        const response = await fetch(`${SERVER_BASE_URL}/api/analysis`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript: conversationTranscript,
            displayName: currentDisplayName
          })
        });
        const finalAnalysis = await response.json();
        console.log("Final analysis from API:", finalAnalysis);
        localStorage.setItem("finalAnalysis", JSON.stringify(finalAnalysis));
        setAnalysisAvailable(true);
      } catch (err) {
        console.error("Error fetching final analysis:", err);
      } finally {
        setAnalysisLoading(false);
      }
    };

    // Removed Analyse button handler as it's no longer in the menu.

    // In player attack logic, if the returned weapon is "none" or "end", do nothing.
    const processPlayerAttack = () => {
      if (player.pendingAttack) {
        const weaponLower = player.pendingAttack.weapon?.toLowerCase();
        if (weaponLower === "none" || weaponLower === "end") {
          player.setState("Idle");
          delete player.pendingAttack;
          return;
        }
        if (player.pendingAttack.move === "Charge") {
          if (!player.pendingAttack.soundPlayed) {
            playSound(player, "charge");
            player.pendingAttack.soundPlayed = true;
          }
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
      }
    };

    // In enemy attack logic, if the returned weapon is "none" or "end", do nothing.
    const processEnemyAttack = () => {
      if (enemy.pendingAttack) {
        const weaponLower = enemy.pendingAttack.weapon?.toLowerCase();
        if (weaponLower === "none" || weaponLower === "end") {
          enemy.setState("Idle");
          delete enemy.pendingAttack;
          return;
        }
        if (enemy.pendingAttack.move === "Charge") {
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
      }
    };

    const gameLoop = () => {
      if (gameOverRef.current) return;
      updateTimer(gameTimer, startTime);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (bgImage.complete) {
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
      }

      processPlayerAttack();
      processEnemyAttack();

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
              body: JSON.stringify({ message: playerMessage })
            });
            let customerData = {};
            try {
              customerData = await resCustomer.json();
            } catch (err) {
              console.error("Failed to parse customer response JSON", err);
            }
            const customerReplyRaw = customerData.response || "";
            const customerReply = customerReplyRaw.trim() === "" ? "No response" : customerReplyRaw;
            conversationTranscript += `Customer: ${customerReply}\n`;
            animateEnemyText(customerReply, dialogOutput);

            // Analyze enemy performance
            const enemyHealth = enemy.health ?? 100;
            const resEnemy = await fetch(`${SERVER_BASE_URL}/api/analyze-game-performance`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                role: "enemy",
                currentText: customerReply,
                previousText: playerMessage,
                currentHealth: enemyHealth,
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
                move: enemyAnalysis.Weapon || "Idle",
                attackPower: enemyAnalysis.attackPower || 0,
                hpPoints: enemyAnalysis.hpPoints || 0,
                weapon: enemyAnalysis.Weapon || "Idle",
              };
            }

            // Analyze player performance
            const playerHealth = player.health ?? 100;
            const resPlayer = await fetch(`${SERVER_BASE_URL}/api/analyze-game-performance`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                role: "player",
                currentText: playerMessage,
                previousText: customerReply,
                currentHealth: playerHealth,
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
                move: playerAnalysis.Weapon || "Idle",
                attackPower: playerAnalysis.attackPower || 0,
                hpPoints: playerAnalysis.hpPoints || 0,
                weapon: playerAnalysis.Weapon || "Idle",
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
  }, []);

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
      <button id="menuButton" onClick={() => setMenuVisible(!menuVisible)}>
        Menu
      </button>
      {menuVisible && (
        <div id="menuPopup" className="donation-bg">
          <button onClick={() => setMenuVisible(false)}>Resume</button>
          <button
            onClick={() => {
              setMenuVisible(false);
              navigate("/home");
            }}
          >
            Home
          </button>
          {/* Removed Analyse button */}
        </div>
      )}
      <div id="gameOverOverlay" ref={gameOverOverlayRef} className="hidden">
        <div id="gameOverContent">
          <h1 id="winnerText" ref={winnerTextRef}></h1>
          {analysisLoading && (
            <p className="loading">Analysing convo wait...</p>
          )}
          {analysisAvailable && (
            <>
              <p className="analysis-done">Final analysis is complete!</p>
              <button onClick={() => navigate("/analysis")}>View Analysis</button>
            </>
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
