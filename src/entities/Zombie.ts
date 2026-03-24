import Phaser from 'phaser';

export enum ZombieType {
  SMALL = 'small',
  BIG = 'big',
  AXE = 'axe'
}

export class Zombie extends Phaser.Physics.Arcade.Sprite {
  public hp: number = 30;
  public speed: number = 40;
  public zombieType: ZombieType;
  public isAttacking: boolean = false;
  public isDying: boolean = false;
  public aimAngle: number = 0;
  private facing: string = 'Down';
  private wanderTimer: number = 0;
  private wanderDX: number = 0;
  private wanderDY: number = 0;
  private stunTimer: number = 0;
  private attackCooldown: number = 0;
  private detectionRange: number = 280;
  private aggroRange: number = 0; // extended range when alerted by chain aggro
  private aggroTimer: number = 0;
  private prefix: string;
  private maxHp: number;
  private attackDamage: number;
  private hpBarG!: Phaser.GameObjects.Graphics;
  private lastHitTime: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, type: ZombieType = ZombieType.SMALL) {
    let prefix: string;
    switch (type) {
      case ZombieType.BIG: prefix = 'zb'; break;
      case ZombieType.AXE: prefix = 'za'; break;
      default: prefix = 'zs'; break;
    }
    super(scene, x, y, `${prefix}_idle_Down`, 0);
    this.prefix = prefix;
    this.zombieType = type;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(4);
    this.setCollideWorldBounds(true);
    this.setScale(2);

    const body = this.body as Phaser.Physics.Arcade.Body;
    switch (type) {
      case ZombieType.BIG:
        body.setSize(10, 10);
        body.setOffset(3, 13);
        this.speed = 22;
        this.hp = 100;
        this.attackDamage = 18;
        this.detectionRange = 280;
        break;
      case ZombieType.AXE:
        body.setSize(10, 10);
        body.setOffset(3, 8);
        this.speed = 28 + Math.random() * 15;
        this.hp = 40 + Math.floor(Math.random() * 15);
        this.attackDamage = 12;
        this.detectionRange = 240;
        break;
      default: // SMALL
        body.setSize(8, 8);
        body.setOffset(3, 8);
        this.speed = 30 + Math.random() * 20;
        this.hp = 18 + Math.floor(Math.random() * 12);
        this.attackDamage = 7;
        this.detectionRange = 200 + Math.floor(Math.random() * 80);
        break;
    }
    this.maxHp = this.hp;

    this.hpBarG = scene.add.graphics().setDepth(10);
  }

  updateAI(target: Phaser.Physics.Arcade.Sprite, playerInfected: boolean) {
    if (!this.active || !this.body || this.isDying) return;
    this.attackCooldown = Math.max(0, this.attackCooldown - 16);
    this.aggroTimer = Math.max(0, this.aggroTimer - 16);

    if (this.stunTimer > 0) {
      this.stunTimer -= this.scene.game.loop.delta;
      return; 
    }

    if (playerInfected) { this.doWander(); return; }

    const dist = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
    const effectiveRange = this.aggroTimer > 0 ? Math.max(this.detectionRange, this.aggroRange) : this.detectionRange;

    if (dist < effectiveRange) {
      const attackRange = this.zombieType === ZombieType.AXE ? 35 : 30;
      if (dist < attackRange && this.attackCooldown <= 0) {
        this.doAttack();
        return;
      }

      // Chase
      this.scene.physics.moveToObject(this, target, this.speed);
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      this.facing = Math.abs(dy) >= Math.abs(dx) ? (dy < 0 ? 'Up' : 'Down') : (dx < 0 ? 'Side-left' : 'Side');

      if (!this.isAttacking) {
        const key = `${this.prefix}_walk_${this.facing}`;
        if (this.scene.anims.exists(key)) {
          this.setTexture(key);
          this.anims.play(key, true);
        }
      }
    } else {
      this.doWander();
    }
  }

  private doAttack() {
    this.isAttacking = true;
    const cooldown = this.zombieType === ZombieType.BIG ? 1500 : (this.zombieType === ZombieType.AXE ? 1200 : 800);
    const damage = this.attackDamage;
    
    this.attackCooldown = cooldown;
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);

    const key = `${this.prefix}_attack_${this.facing}`;
    if (this.scene.anims.exists(key)) {
      this.setTexture(key);
      this.anims.play(key, true);
    }

    // Emit damage on a timer (halfway through animation) instead of relying on animationcomplete
    const hitDelay = this.zombieType === ZombieType.BIG ? 400 : (this.zombieType === ZombieType.AXE ? 350 : 200);
    this.scene.time.delayedCall(hitDelay, () => {
      if (this.active && !this.isDying) {
        this.scene.events.emit('zombieAttack', { zombie: this, damage });
      }
    });

    // Reset attacking state after animation duration
    const animDuration = this.zombieType === ZombieType.BIG ? 800 : (this.zombieType === ZombieType.AXE ? 700 : 400);
    this.scene.time.delayedCall(animDuration, () => {
      if (this.active) {
        this.isAttacking = false;
      }
    });
  }

  private doWander() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.wanderTimer--;

    if (this.wanderTimer <= 0) {
      this.wanderTimer = Phaser.Math.Between(100, 300);
      if (Math.random() < 0.35) {
        this.wanderDX = 0; this.wanderDY = 0;
      } else {
        this.wanderDX = Phaser.Math.Between(-1, 1);
        this.wanderDY = Phaser.Math.Between(-1, 1);
      }
    }

    if (this.wanderDX === 0 && this.wanderDY === 0) {
      body.setVelocity(0, 0);
      const key = `${this.prefix}_idle_${this.facing}`;
      if (this.scene.anims.exists(key)) {
        this.setTexture(key);
        this.anims.play(key, true);
      }
    } else {
      body.setVelocity(this.wanderDX * this.speed * 0.2, this.wanderDY * this.speed * 0.2);
      this.facing = Math.abs(this.wanderDY) >= Math.abs(this.wanderDX) ?
        (this.wanderDY < 0 ? 'Up' : 'Down') :
        (this.wanderDX < 0 ? 'Side-left' : 'Side');
      const key = `${this.prefix}_walk_${this.facing}`;
      if (this.scene.anims.exists(key)) {
        this.setTexture(key);
        this.anims.play(key, true);
      }
    }
  }

  /** Alert this zombie via chain aggro from a nearby zombie being hit */
  alertFromNearby(_targetX: number, _targetY: number) {
    this.aggroRange = 600;
    this.aggroTimer = 5000; // 5 seconds of heightened awareness
  }

  takeDamage(amount: number, pushAngle?: number, pushForce: number = 200) {
    if (this.isDying) return;
    this.hp -= amount;
    this.lastHitTime = this.scene.time.now;
    
    // Interrupt attack and apply knockback
    if (pushAngle !== undefined) {
      this.isAttacking = false;
      this.stunTimer = 150;
      (this.body as Phaser.Physics.Arcade.Body).setVelocity(Math.cos(pushAngle) * pushForce, Math.sin(pushAngle) * pushForce);
    }
    
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(80, () => { if (this.active) this.clearTint(); });

    // Chain aggro: alert nearby zombies
    this.scene.events.emit('zombieHurt', { x: this.x, y: this.y, range: 200 });
    
    if (this.hp <= 0) {
      this.die();
    } else {
      this.drawObjHp();
    }
  }

  private die() {
    this.isDying = true;
    this.isAttacking = false;
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    (this.body as Phaser.Physics.Arcade.Body).enable = false;

    // Try to play death animation
    const deathDir = (this.facing === 'Side' || this.facing === 'Side-left') ? this.facing : 
      (Math.random() > 0.5 ? 'Side' : 'Side-left');
    const deathKey = `${this.prefix}_death_${deathDir}`;
    
    if (this.scene.anims.exists(deathKey)) {
      this.setTexture(deathKey);
      this.anims.play(deathKey, true);
      this.once('animationcomplete', () => {
        this.fadeAndDestroy();
      });
    } else {
      this.fadeAndDestroy();
    }
  }

  private fadeAndDestroy() {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 600,
      delay: 300,
      onComplete: () => {
        this.hpBarG.destroy();
        this.destroy();
      }
    });
  }

  private drawObjHp() {
    if (!this.hpBarG) return;
    this.hpBarG.clear();
    if (this.scene.time.now - this.lastHitTime > 3000) return;
    if (this.hp <= 0 || this.hp >= this.maxHp) return;

    const bx = this.x - 12;
    const by = this.y - 18;
    this.hpBarG.fillStyle(0x000000, 0.8);
    this.hpBarG.fillRect(bx, by, 24, 4);
    this.hpBarG.fillStyle(0xcc2222, 1);
    this.hpBarG.fillRect(bx, by, 24 * Math.max(0, this.hp / this.maxHp), 4);
    this.hpBarG.lineStyle(1, 0x000000, 1);
    this.hpBarG.strokeRect(bx, by, 24, 4);
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (this.active && this.hpBarG) {
      if (time - this.lastHitTime > 3000) {
        this.hpBarG.clear();
      } else {
        this.drawObjHp();
      }
    }
  }
}
