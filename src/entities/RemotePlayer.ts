import Phaser from 'phaser';

/**
 * Visual representation of another player in the same room.
 * Renders the base character sprite + name tag + health bar.
 * Animations are driven by network updates (facing + anim state).
 */
export class RemotePlayer {
  public id: string;
  public name: string;
  public targetX: number;
  public targetY: number;
  public sprite: Phaser.Physics.Arcade.Sprite;
  public weaponOverlay: Phaser.GameObjects.Sprite;
  public kills: number = 0;
  public health: number = 100;
  public isInfected: boolean = false;

  private nameTag: Phaser.GameObjects.Text;
  private hpBar: Phaser.GameObjects.Graphics;
  private scene: Phaser.Scene;
  private facing = 'down';
  private anim = 'idle';
  private weaponId = 'fists';

  constructor(scene: Phaser.Scene, id: string, name: string, x: number, y: number) {
    this.scene = scene;
    this.id = id;
    this.name = name;
    this.targetX = x;
    this.targetY = y;

    // Main sprite
    this.sprite = scene.physics.add.sprite(x, y, 'p_idle_down', 0);
    this.sprite.setDepth(6);
    this.sprite.setCollideWorldBounds(true);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(8, 8);
    body.setOffset(3, 8);
    body.setImmovable(true);

    // Weapon overlay
    this.weaponOverlay = scene.add.sprite(x, y, 'p_pistol_move_down', 0);
    this.weaponOverlay.setVisible(false);
    this.weaponOverlay.setDepth(7);

    // Name tag
    this.nameTag = scene.add.text(x, y - 16, name, {
      fontSize: '7px', color: '#88ccff', fontFamily: 'monospace', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(15);

    // HP bar
    this.hpBar = scene.add.graphics().setDepth(15);
  }

  /** Called every frame to interpolate position and sync visuals */
  update() {
    // Smooth interpolation toward target position
    const lerp = 0.2;
    this.sprite.x += (this.targetX - this.sprite.x) * lerp;
    this.sprite.y += (this.targetY - this.sprite.y) * lerp;

    // Sync overlays
    this.weaponOverlay.setPosition(this.sprite.x, this.sprite.y);
    this.nameTag.setPosition(this.sprite.x, this.sprite.y - 16);

    // HP bar
    this.drawHpBar();

    // Animation
    this.playAnim();
  }

  /** Network state update */
  setState(x: number, y: number, facing: string, anim: string, weaponId: string, health: number) {
    this.targetX = x;
    this.targetY = y;
    this.facing = facing;
    this.anim = anim;
    this.weaponId = weaponId;
    this.health = health;
  }

  private getSpriteDir(): string {
    switch (this.facing) {
      case 'left': return 'side-left';
      case 'right': return 'side';
      default: return this.facing;
    }
  }

  private playAnim() {
    const dir = this.getSpriteDir();
    const isMoving = this.anim === 'run';
    const isAttacking = this.anim === 'attack';

    // Base character
    let baseKey: string;
    if (isAttacking) {
      baseKey = `p_punch_${dir}`;
    } else if (isMoving) {
      baseKey = `p_run_${dir}`;
    } else {
      baseKey = `p_idle_${dir}`;
    }
    if (this.scene.anims.exists(baseKey)) {
      this.sprite.anims.play(baseKey, true);
    }

    // Weapon overlay — map all weapons to available overlay sprites
    let overlayWeapon: string | null = null;
    if (this.weaponId === 'pistol' || this.weaponId === 'revolver' || this.weaponId === 'smg') overlayWeapon = 'pistol';
    else if (this.weaponId === 'rifle' || this.weaponId === 'ak47' || this.weaponId === 'rpg') overlayWeapon = 'rifle';
    else if (this.weaponId === 'shotgun') overlayWeapon = 'shotgun';
    else if (this.weaponId === 'bat' || this.weaponId === 'axe') overlayWeapon = 'bat';

    if (!overlayWeapon) {
      this.weaponOverlay.setVisible(false);
      return;
    }

    let animKey: string;
    if (isAttacking) {
      animKey = overlayWeapon === 'bat'
        ? `p_bat_attack_${dir}`
        : `p_${overlayWeapon}_shoot_${dir}`;
    } else {
      const state = isMoving ? 'run' : 'idle';
      animKey = `p_${overlayWeapon}_${state}_${dir}`;
    }

    if (this.scene.anims.exists(animKey)) {
      this.weaponOverlay.setVisible(true);
      this.weaponOverlay.anims.play(animKey, true);
    } else {
      this.weaponOverlay.setVisible(false);
    }

    this.weaponOverlay.setDepth(this.facing === 'up' ? 5 : 7);
  }

  private drawHpBar() {
    this.hpBar.clear();
    if (this.health >= 100) return;
    const bx = this.sprite.x - 10;
    const by = this.sprite.y - 12;
    this.hpBar.fillStyle(0x000000, 0.7);
    this.hpBar.fillRect(bx, by, 20, 3);
    this.hpBar.fillStyle(this.health > 30 ? 0x22cc22 : 0xcc2222, 1);
    this.hpBar.fillRect(bx, by, 20 * (this.health / 100), 3);
  }

  destroy() {
    this.sprite.destroy();
    this.weaponOverlay.destroy();
    this.nameTag.destroy();
    this.hpBar.destroy();
  }
}
