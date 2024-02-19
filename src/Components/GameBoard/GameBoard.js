import React, { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import "./gameboard.css";
import Tank from "../../GameLogic/Tank/Tank";
import audioFile1 from "./orc1.mp3";
import audioFile2 from "./DECISIVE.mp3";
import PlayerTankBody from "../../SVG/TankBody.svg";
import PlayerTankBarrel from "../../SVG/TankBarrel.svg";
import PlayerTankWheels from "../../SVG/TankWheels.svg";
import mapData from "../../MapData/mapData.json";
import Shell from "../../GameLogic/Shell/Shell";
import ShellSVG from "../../SVG/shell.svg";
import { useNavigate } from "react-router-dom";

const GameBoard = () => {
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);
  const [power, setPower] = useState(1);
  const powerRef = useRef(1);
  const [effectiveAngle, setEffectiveAngle] = useState(0);
  const angleRef = useRef(0);
  const [playerTankHealth, setPlayerTankHealth] = useState(3);
  const [enemyTankHealth, setEnemyTankHealth] = useState(3);
  const [hitCounter, setHitCounter] = useState(3); 
  const [audioFile, setAudioFile] = useState('');


  const navigate = useNavigate();
  

  const playerTankRef = useRef(new Tank(/*...*/));
  const enemyTankRef = useRef(new Tank(/*...*/));

  useEffect(() => {
    if (playerTankRef.current && enemyTankRef.current) {
      setPlayerTankHealth(playerTankRef.current.getHealth());
      setEnemyTankHealth(enemyTankRef.current.getHealth());
    }
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  let gamePaused = false;

  let shell;
  let game;
  let cursors;
  let playerTank;
  let enemyTank;
  let shellIsActive = true;
  let count  = 0;


  const barrelLength = 41.988;
  const initialX = 1000;
  const initialY = 550;

  const hillData = [
    { x: 100, y: 550, width: 150, height: 60, flat: 50 },
    { x: 350, y: 550, width: 200, height: 80, flat: 50 },
    { x: 600, y: 550, width: 150, height: 60, flat: 50 },
    { x: 850, y: 550, width: 200, height: 80, flat: 50 },
    { x: 1100, y: 550, width: 150, height: 60, flat: 50 },
  ];

  const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 600,
    parent: "game-container",
    scene: {
      preload: preload,
      create: create,
      update: update,
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 300 },
        debug: false,
      },
    },
  };

  useEffect(() => {
    if (hitCounter === 2) {
      if (audioRef.current) {
        audioRef.current.src = audioFile2; 
        audioRef.current.load();
        audioRef.current.play();
      }
    }
  }, [hitCounter]);

  useEffect(() => {
    powerRef.current = power;
    console.log(`Current power value: ${power}`);
  }, [power]);

  useEffect(() => {
    game = new Phaser.Game(config);
    return () => {
      game.destroy(true);
    };
  }, []);

  function preload() {
    this.load.svg("body", PlayerTankBody, { width: 200, height: 200 });
    this.load.svg("barrel", PlayerTankBarrel, { width: 200, height: 200 });
    this.load.svg("wheels", PlayerTankWheels, { width: 200, height: 200 });
    this.load.svg("shell", ShellSVG, { width: 20, height: 20 });
  }

  function create() {
    this.cameras.main.setBackgroundColor(0xaeeeee);
    const graphics = this.add.graphics();
    graphics.fillStyle(0x8b4513);
    graphics.fillRect(0, 550, 1200, 50);

    hillData.forEach((hill) => {
      graphics.fillStyle(0x8b4513);
      graphics.fillRect(
        hill.x - hill.width / 2 - hill.flat,
        hill.y,
        hill.flat,
        50
      );
      graphics.fillRect(hill.x + hill.width / 2, hill.y, hill.flat, 50);

      graphics.beginPath();
      graphics.moveTo(hill.x - hill.width / 2, hill.y);
      graphics.lineTo(hill.x, hill.y - hill.height);
      graphics.lineTo(hill.x + hill.width / 2, hill.y);
      graphics.closePath();
      graphics.fillStyle(0x8b4513);
      graphics.fillPath();
    });

    playerTank = new Tank(
      this,
      initialX,
      initialY,
      0.5,
      10,
      0,
      0,
      true,
      power,
      5
    );

    playerTank.body = this.add.image(0, 0, "body");
    playerTank.barrel = this.add.image(0, 0, "barrel").setOrigin(0.5, 0.48);
    playerTank.wheels = this.add.image(0, 0, "wheels");

    const tankContainer = this.add.container(initialX, initialY, [
      playerTank.wheels,
      playerTank.body,
      playerTank.barrel,
    ]);

    playerTank.container = tankContainer;

    const enemyInitialX = 250;
    const enemyInitialY = 550;
    enemyTank = new Tank(
      this,
      enemyInitialX,
      enemyInitialY,
      0.5,
      5,
      0,
      0,
      false,
      power,
      5
    );

    enemyTank.body = this.add.image(0, 0, "body");
    enemyTank.barrel = this.add.image(0, 0, "barrel").setOrigin(0.34, 0.48);
    enemyTank.wheels = this.add.image(0, 0, "wheels");

    const enemyTankContainer = this.add.container(
      enemyInitialX,
      enemyInitialY,
      [enemyTank.wheels, enemyTank.body, enemyTank.barrel]
    );

    enemyTank.container = enemyTankContainer;

    cursors = {
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    };
  }

  function gameOver(message) {
    setTimeout(() => {
      const userChoice = window.confirm("Game Over: " + message + "\nWould you like to go back to the main menu?");
      if (userChoice) {
        navigate('/igame');
      }
    }, 100);
  }
  const PLAYER = "player";
  const ENEMY = "enemy";
  const WORLD_WIDTH = 1200;

  function update() {
    if (!playerTank || !cursors) {
      return;
    }

    if (this.shell) {
      this.shell.update();
    }

    const xPosition = Math.round(playerTank.container.x);
    const terrainData = mapData[xPosition.toString()] || null;

    if (this.shell && shellIsActive) {
      const hitEnemy = this.shell.checkCollision(enemyTank);
      if (hitEnemy) {
        setHitCounter(prevCounter => prevCounter - 1);
        count ++;
        if (count >= 3) {
          gameOver('You Win');
          return;
        }
      }
    }

    const playerTankX = playerTank.position.x;
    const playerTankY = playerTank.position.y;
    const enemyTankX = enemyTank.position.x;
    const enemyTankY = enemyTank.position.y;
    const collisionBoxSize = 20;

    if (
      enemyTankX >= playerTankX - collisionBoxSize &&
      enemyTankX <= playerTankX + collisionBoxSize &&
      enemyTankY >= playerTankY - collisionBoxSize &&
      enemyTankY <= playerTankY + collisionBoxSize
    ) {
      gameOver('You Lose');
      return;
    }

    if (terrainData && (cursors.left.isDown || cursors.right.isDown)) {
      angleRef.current = playerTank.getEffectiveAngle();
      setEffectiveAngle(angleRef.current);
      if (cursors.left.isDown) {
        playerTank.move("left", WORLD_WIDTH);
      } else if (cursors.right.isDown) {
        playerTank.move("right", WORLD_WIDTH);
      }
    }

    if (cursors.up.isDown) {
      playerTank.adjustBarrelAngle(1);
      angleRef.current = playerTank.getEffectiveAngle();
      setEffectiveAngle(angleRef.current);
    } else if (cursors.down.isDown) {
      playerTank.adjustBarrelAngle(-1);
      angleRef.current = playerTank.getEffectiveAngle();
      setEffectiveAngle(angleRef.current);
    }
    if (!gamePaused) {
      if (Phaser.Input.Keyboard.JustUp(cursors.space)) {
        if (playerTank && playerTank.isTurn) {
          gamePaused = true;

          playerTank.shoot(this, powerRef.current);

          playerTank.isTurn = false;
          enemyTank.isTurn = true;
          enemyTank.moveCount = 10;

          setTimeout(() => {
            enemyTank.aiAction(WORLD_WIDTH, playerTank);
            gamePaused = false;
            playerTank.moveCount = 10;
            playerTank.shellCount = 1;
            playerTank.isTurn = true;
            enemyTank.isTurn = false;
          }, 3000);
        }
      }
    }
  }

  const handlePowerClick = (newPower) => {
    setPower(newPower);
  };


  return (
    <div>
      <div id="game-container"></div>
      <div className="health-bar left">
        {hitCounter >= 3 && <div className="health-bar-cell green"></div>}
        {hitCounter >= 2 && <div className="health-bar-cell green"></div>}
        {hitCounter >= 1 && <div className="health-bar-cell green"></div>}
      </div>
      <div className="health-bar right">
        <div
          className={`health-bar-cell ${enemyTankHealth > 2
            ? "green"
            : enemyTankHealth > 1
              ? "yellow"
              : "red"
            }`}
        ></div>
        <div
          className={`health-bar-cell ${enemyTankHealth > 1
            ? "green"
            : enemyTankHealth > 0
              ? "yellow"
              : "red"
            }`}
        ></div>
        <div
          className={`health-bar-cell ${enemyTankHealth > 0 ? "green" : "red"}`}
        ></div>
      </div>

      <div id="controls">
        <div id="power-buttons">
          <div
            className={`power-button ${power === 12.5 ? "selected" : ""}`}
            onClick={() => handlePowerClick(12.5)}
          >
            <span className="power-text">1x</span>
          </div>
          <div
            className={`power-button ${power === 25 ? "selected" : ""}`}
            onClick={() => handlePowerClick(25)}
          >
            <span className="power-text">2x</span>
          </div>
          <div
            className={`power-button ${power === 37.5 ? "selected" : ""}`}
            onClick={() => handlePowerClick(37.5)}
          >
            <span className="power-text">3x</span>
          </div>
          <div
            className={`power-button ${power === 50 ? "selected" : ""}`}
            onClick={() => handlePowerClick(50)}
          >
            <span className="power-text">4x</span>
          </div>

          <div class="instructions">
            <span>Movement: &#8592;/&#8594;</span>
            <span>
              Angle Adjust: &#8593;/&#8595;
              <br />
            </span>
            <span>Shot: Space</span>
            <span>Thrust: 1x 2x 3x 4x</span>
          </div>

          <div id="angle-display">
            <span id="angle-span">{effectiveAngle}</span>
            <span id="degree-span" >degrees</span>
          </div>
        </div>
      </div>
      <button className="speaker-button" onClick={toggleMute}>
        {isMuted ? (
          <i className="fas fa-volume-mute fa-2x"></i>
        ) : (
          <i className="fas fa-volume-up fa-2x"></i>
        )}
      </button>

      <audio id="background-music" ref={audioRef} loop autoPlay>
        <source src={audioFile1} type="audio/mp3" />
      </audio>
    </div>
  );
};
export default GameBoard;
