import Phaser from "phaser";
import mapData from "../../MapData/mapData.json";
import Shell from "../Shell/Shell";

class Tank {
  constructor(
    scene,
    startX,
    startY,
    health,
    moveCount,
    angleTerrain,
    angleSelf,
    isTurn,
    power,
    shellCount,
    type = "player"
  ) {
    this.type = type !== undefined ? type : "player";

    if (isNaN(startX) || isNaN(startY)) {
      startX = 0;
      startY = 0;
    }

    this.position = { x: startX, y: startY };
    this.health = health !== undefined ? health : 3;
    this.moveCount = 10;
    this.angleTerrain = angleTerrain !== undefined ? angleTerrain : 0;
    this.angleSelf = angleSelf !== undefined ? angleSelf : 0;
    this.isTurn = isTurn !== undefined ? isTurn : false;
    this.power = power !== undefined ? power : 0;
    this.shellCount = shellCount !== undefined ? shellCount : 1;
    this.type = type;

    this.phaserBody = null;
    this.phaserBarrel = null;
    this.phaserWheels = null;
    this.phaserContainer = null;
    console.log("New Tank object created");
  }

  isOfType(type) {
    return this.type === type;
  }

  getHealth() {
    return this.health || 3;
  }

  get body() {
    return this.phaserBody;
  }

  set body(newImage) {
    this.phaserBody = newImage;
  }

  get barrel() {
    return this.phaserBarrel;
  }

  set barrel(newImage) {
    this.phaserBarrel = newImage;
  }

  get wheels() {
    return this.phaserWheels;
  }

  set wheels(newImage) {
    this.phaserWheels = newImage;
  }

  get container() {
    return this.phaserContainer;
  }

  set container(newContainer) {
    this.phaserContainer = newContainer;
  }

  getEffectiveAngle() {
    if (this.angleTerrain < -180 || this.angleTerrain > 180) {
      console.log("Invalid angleTerrain value");
      return null;
    }
    const angleTerrainRad = Phaser.Math.DegToRad(this.angleTerrain);
    const angleSelfRad = Phaser.Math.DegToRad(this.angleSelf);
    const effectiveAngleRad = Math.PI + (-angleTerrainRad + angleSelfRad);
    const effectiveAngle = parseFloat(
      Phaser.Math.RadToDeg(effectiveAngleRad).toFixed(2)
    );

    return effectiveAngle;
  }

  move(direction, worldWidth) {
    if (this.moveCount <= 0) {
      return;
    }
    const moveAmount = 10;
    if (direction === "left" && this.container.x > 10) {
      this.container.x -= moveAmount;
      this.moveCount--;
    } else if (direction === "right" && this.container.x < worldWidth - 10) {
      this.container.x += moveAmount;
      this.moveCount--;
    }

    this.position = { x: this.container.x, y: this.container.y };
    const roundedX = Math.round(this.container.x);
    const data = mapData[roundedX.toString()];
    if (data) {
      this.container.y = data.y;
      this.angleTerrain = data.angle;
      this.container.angle = -this.angleTerrain;

      this.position.y = data.y;
    }
  }

  rotateWheels(direction) {}

  adjustBarrelAngle(delta) {
    const newAngle = this.angleSelf + delta;
    if (newAngle >= 0 && newAngle <= 25) {
      this.angleSelf = newAngle;
      this.barrel.angle = this.angleSelf;
    }
  }

  setTurn(turn) {
    this.isTurn = turn;
  }

  setPower(power) {
    this.power = power;
  }

  setShellCount(count) {
    this.shellCount = count;
  }

  shoot(scene, power) {
    const effectivePower = power;
    const effectiveAngle = 180 + (-this.angleTerrain + this.angleSelf);
    const adjustedAngle = -effectiveAngle;
    const effectiveAngleInRadians = Phaser.Math.DegToRad(effectiveAngle);
    const baseX = this.position.x;
    const baseY = this.position.y;
    const yOffset = 50;
    const xOffset = 60 * Math.cos(effectiveAngleInRadians);
    const newOffsetY = 60 * Math.sin(-effectiveAngleInRadians);
    const finalX = baseX + xOffset;
    const finalY = baseY - yOffset - newOffsetY;
    const newShell = new Shell(
      scene,
      finalX,
      finalY,
      adjustedAngle,
      effectivePower
    );
    scene.shell = newShell;
  }

  aiAction(worldWidth) {
    let i = 0;
    const interval = setInterval(() => {
      if (i < 15) {
        this.move("right", worldWidth);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 250);
  }
}
export default Tank;
