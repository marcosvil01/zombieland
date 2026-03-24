import Phaser from 'phaser';
import { WEAPONS, type ItemDef } from '../utils/Definitions';

export class Player extends Phaser.Physics.Arcade.Sprite {
  public health: number = 100;
  public stamina: number = 100;
  public hunger: number = 100;
  public isInfected: boolean = false;
  public isAttacking: boolean = false;
  public aimAngle: number = 0;
  public ammo: number = 30;
  public inventory: (ItemDef | null)[] = Array(9).fill(null);
  public selectedSlot: number = 0;
  public stunTimer: number = 0;

  private attackTimer: number = 0;
  private facing: string = 'down';
  private weaponOverlay!: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'p_idle_down', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setDepth(6);
    this.setScale(1); // restored original size

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(8, 8);
    body.setOffset(3, 8);

    // Weapon overlay sprite (renders the weapon on top of character)
    this.weaponOverlay = scene.add.sprite(x, y, 'p_pistol_move_down', 0);
    this.weaponOverlay.setVisible(false);
    this.weaponOverlay.setDepth(7);
  }

  private getSpriteDir(): string {
    switch (this.facing) {
      case 'left': return 'side-left';
      case 'right': return 'side';
      default: return this.facing;
    }
  }

  update(keys: any, pointer: Phaser.Input.Pointer) {
    if (!keys) return;
    this.attackTimer = Math.max(0, this.attackTimer - 16);
    
    if (this.stunTimer > 0) {
      this.stunTimer -= this.scene.game.loop.delta;
      return; 
    }

    // Mouse aim
    this.aimAngle = Phaser.Math.Angle.Between(this.x, this.y, pointer.worldX, pointer.worldY);

    // Movement
    let speed = 120;
    const isRunning = keys.SHIFT?.isDown && this.stamina > 0;
    if (isRunning) {
      speed = 210;
      this.stamina = Math.max(0, this.stamina - 0.2);
    } else {
      this.stamina = Math.min(100, this.stamina + 0.08);
    }

    this.hunger -= 0.002;
    if (this.hunger <= 0) { this.hunger = 0; this.health -= 0.006; }
    if (this.isInfected) this.health -= 0.02;

    const body = this.body as Phaser.Physics.Arcade.Body;
    let mx = 0, my = 0;
    if (keys.W?.isDown) my = -1;
    if (keys.S?.isDown) my = 1;
    if (keys.A?.isDown) mx = -1;
    if (keys.D?.isDown) mx = 1;

    if (mx !== 0 || my !== 0) {
      const len = Math.sqrt(mx * mx + my * my);
      body.setVelocity((mx / len) * speed, (my / len) * speed);

      // Determine facing direction
      if (Math.abs(my) > Math.abs(mx)) {
        this.facing = my < 0 ? 'up' : 'down';
      } else {
        this.facing = mx < 0 ? 'left' : 'right';
      }

      if (!this.isAttacking) {
        const dir = this.getSpriteDir();
        // Always play base character animation
        const runKey = `p_run_${dir}`;
        if (this.scene.anims.exists(runKey)) {
          this.anims.play(runKey, true);
        }
        this.syncWeaponOverlay(dir, 'run');
      }
    } else {
      body.setVelocity(0, 0);
      if (!this.isAttacking) {
        const dir = this.getSpriteDir();
        // Always play base character animation
        const idleKey = `p_idle_${dir}`;
        if (this.scene.anims.exists(idleKey)) {
          this.anims.play(idleKey, true);
        }
        this.syncWeaponOverlay(dir, 'idle');
      }
    }

    // Sync weapon overlay position
    this.weaponOverlay.setPosition(this.x, this.y);

    // Click to attack
    if (pointer.isDown && this.attackTimer <= 0) {
      this.doAttack();
    }

    // Number keys for inventory
    for (let i = 0; i < 9; i++) {
      const numKey = keys[`NUM${i + 1}`];
      if (numKey && Phaser.Input.Keyboard.JustDown(numKey)) {
        this.selectedSlot = i;
      }
    }
  }

  private doAttack() {
    const equipped = this.inventory[this.selectedSlot];
    const weaponId = equipped?.weaponId || 'fists';
    const weapon = WEAPONS[weaponId];

    if (weapon.type === 'ranged') {
      // Use a custom larger crosshair
      this.scene.input.setDefaultCursor('url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PHBhdGggZD0iTTE2IDJMMTYgMzBNMiAxNkwzMCAxNiIgc3Ryb2tlPSJyZWQiIHN0cm9rZS13aWR0aD0iNCIvPjwvc3ZnPg==) 16 16, crosshair');
    } else {
      this.scene.input.setDefaultCursor('default');
    }

    if (this.isInfected && weaponId !== 'fists') return; // Cannot use weapons if infected
    if (weapon.type === 'ranged' && this.ammo <= 0) return;

    this.attackTimer = weapon.fireRate;
    this.isAttacking = true;

    const dir = this.getSpriteDir();
    // Player body always plays punch animation
    const punchKey = `p_punch_${dir}`;
    if (this.scene.anims.exists(punchKey)) {
      this.anims.play(punchKey, true);
    }
    // Weapon overlay plays its attack/shoot animation
    this.syncWeaponOverlay(dir, 'attack');

    this.once('animationcomplete', () => {
      this.isAttacking = false;
    });

    // delayed so the animation plays slightly before hit
    this.scene.time.delayedCall(120, () => {
      this.scene.events.emit('playerAttack', {
        weapon,
        angle: this.aimAngle,
        x: this.x,
        y: this.y
      });
    });
  }

  getCurrentWeapon() {
    const equipped = this.inventory[this.selectedSlot];
    return WEAPONS[equipped?.weaponId || 'fists'];
  }

  addItem(item: ItemDef): boolean {
    const emptyIdx = this.inventory.indexOf(null);
    if (emptyIdx === -1) return false;
    this.inventory[emptyIdx] = item;
    return true;
  }

  useItem(slot: number) {
    const item = this.inventory[slot];
    if (!item) return;

    if (item.type === 'ammo') {
      this.ammo += item.ammoAmount || 0;
      this.inventory[slot] = null;
      return;
    }

    if (item.type !== 'consumable') return;
    if (item.healAmount) this.health = Math.min(100, this.health + item.healAmount);
    if (item.hungerAmount) this.hunger = Math.min(100, this.hunger + item.hungerAmount);
    if (item.curesInfection) { this.isInfected = false; this.clearTint(); }
    this.inventory[slot] = null;
  }

  getFacing(): string { return this.facing; }

  private syncWeaponOverlay(dir: string, state: 'idle' | 'run' | 'attack') {
    const equipped = this.inventory[this.selectedSlot];
    const weaponId = equipped?.weaponId || 'fists';

    // Map new weapons to existing overlays
    let overlayWeapon: string | null = null;
    if (weaponId === 'pistol' || weaponId === 'revolver' || weaponId === 'smg') overlayWeapon = 'pistol';
    else if (weaponId === 'rifle' || weaponId === 'ak47' || weaponId === 'rpg') overlayWeapon = 'rifle';
    else if (weaponId === 'shotgun') overlayWeapon = 'shotgun';
    else if (weaponId === 'bat' || weaponId === 'axe') overlayWeapon = 'bat';

    if (!overlayWeapon) {
      this.weaponOverlay.setVisible(false);
      return;
    }

    let animKey: string;
    if (state === 'attack') {
      if (overlayWeapon === 'bat') {
        animKey = `p_bat_attack_${dir}`;
      } else {
        animKey = `p_${overlayWeapon}_shoot_${dir}`;
      }
    } else {
      animKey = `p_${overlayWeapon}_${state}_${dir}`;
    }

    if (this.scene.anims.exists(animKey)) {
      this.weaponOverlay.setVisible(true);
      this.weaponOverlay.anims.play(animKey, true);
    } else {
      this.weaponOverlay.setVisible(false);
    }

    // Depth: behind player when facing up, in front otherwise
    this.weaponOverlay.setDepth(this.facing === 'up' ? 5 : 7);
  }

  setVisible(value: boolean): this {
    super.setVisible(value);
    if (this.weaponOverlay) this.weaponOverlay.setVisible(false);
    return this;
  }
}
