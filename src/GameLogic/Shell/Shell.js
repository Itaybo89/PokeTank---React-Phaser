import Phaser from "phaser";
import mapData from '../../MapData/mapData.json';  

class Shell extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, angle, power, wind = { angle: 0, force: 0 }) {
    super(scene, x, y, 'shell');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.isActive = true;
    this.wind = wind;
    this.gravity = 9.8;
    this.powerScale = 10;
    const angleInRadians = Phaser.Math.DegToRad(angle);

    const velocityX = power * Math.cos(angleInRadians) * this.powerScale;
    const velocityY = -power * Math.sin(angleInRadians) * this.powerScale;

    this.setVelocity(velocityX, velocityY);
    this.setBounce(0.5);
    this.setCollideWorldBounds(false);
  }

  update() {
    if (!this.isActive) {
      return;
    }

    this.angle = Phaser.Math.RadToDeg(
      Math.atan2(-this.body.velocity.y, this.body.velocity.x)
    );
    this.setAccelerationY(this.gravity);
    const windAngleInRadians = Phaser.Math.DegToRad(this.wind.angle);
    this.setAccelerationX(this.wind.force * Math.cos(windAngleInRadians));
    this.setAccelerationY(-this.wind.force * Math.sin(windAngleInRadians));
  }

  checkCollision(enemyTank) {
    if (!this.isActive) {
      return false;
    }

    const terrainInfo = mapData[Math.floor(this.x).toString()];
    if (terrainInfo && this.y >= terrainInfo.y) {
      this.destroy();
      return false;
    }

    const enemyTankX = enemyTank.position.x;
    const enemyTankY = enemyTank.position.y;
    const collisionBoxSize = 50;

    if (
      this.x >= enemyTankX - collisionBoxSize &&
      this.x <= enemyTankX + collisionBoxSize &&
      this.y >= enemyTankY - collisionBoxSize &&
      this.y <= enemyTankY + collisionBoxSize
    ) {
      this.destroy();
      return true;
    }

    return false;
  }

  destroy() {
    super.destroy();
    this.isActive = false;
  }
}

export default Shell;
