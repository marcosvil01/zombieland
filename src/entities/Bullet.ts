import Phaser from 'phaser';

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  public damage: number = 10;
  public isExplosive: boolean = false;
  public explosionRadius: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string = 'bullet_pistol') {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(6);
    this.setScale(2.5);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(6, 6);
  }

  fire(x: number, y: number, angle: number, speed: number, damage: number, spread: number, explosive: boolean = false, explosionRadius: number = 0) {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.damage = damage;
    this.isExplosive = explosive;
    this.explosionRadius = explosionRadius;

    if (explosive) {
      this.setScale(4);
      this.setTint(0xff4400);
    } else {
      this.setScale(2.5);
      this.clearTint();
    }

    const finalAngle = angle + Phaser.Math.DegToRad(Phaser.Math.Between(-spread, spread));
    this.setRotation(finalAngle);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.reset(x, y);
    body.enable = true;
    const vx = Math.cos(finalAngle) * speed;
    const vy = Math.sin(finalAngle) * speed;
    body.setVelocity(vx, vy);

    // Auto-destroy after range (RPG travels further)
    const lifetime = explosive ? 2500 : 1500;
    this.scene.time.delayedCall(lifetime, () => {
      if (this.active) {
        if (this.isExplosive) this.explode();
        else this.deactivate();
      }
    });
  }

  explode() {
    const x = this.x, y = this.y;
    this.deactivate();

    // Visual explosion
    const blast = this.scene.add.circle(x, y, 8, 0xff6600, 0.9).setDepth(15);
    this.scene.tweens.add({
      targets: blast, scaleX: this.explosionRadius / 8, scaleY: this.explosionRadius / 8,
      alpha: 0, duration: 400, onComplete: () => blast.destroy()
    });

    // Shockwave ring
    const ring = this.scene.add.circle(x, y, 8, 0xffaa00, 0).setDepth(14);
    ring.setStrokeStyle(3, 0xff4400, 0.8);
    this.scene.tweens.add({
      targets: ring, scaleX: this.explosionRadius / 6, scaleY: this.explosionRadius / 6,
      alpha: 0, duration: 500, onComplete: () => ring.destroy()
    });

    // Debris particles
    for (let i = 0; i < 12; i++) {
      const px = x + Phaser.Math.Between(-20, 20);
      const py = y + Phaser.Math.Between(-20, 20);
      const p = this.scene.add.circle(px, py, Phaser.Math.Between(2, 4), 0xff8800, 1).setDepth(14);
      const angle = Math.random() * Math.PI * 2;
      const dist = Phaser.Math.Between(30, 80);
      this.scene.tweens.add({
        targets: p, x: px + Math.cos(angle) * dist, y: py + Math.sin(angle) * dist,
        alpha: 0, scaleX: 0, scaleY: 0, duration: 500, onComplete: () => p.destroy()
      });
    }

    // Camera shake
    this.scene.cameras.main.shake(200, 0.008);

    // Emit explosion event for AoE damage
    this.scene.events.emit('explosion', { x, y, radius: this.explosionRadius, damage: Math.floor(this.damage * 0.5) });
  }

  deactivate() {
    this.setActive(false);
    this.setVisible(false);
    if (this.body) this.body.enable = false;
  }
}

