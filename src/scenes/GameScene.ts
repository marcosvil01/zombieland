import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Zombie, ZombieType } from '../entities/Zombie';
import { Bullet } from '../entities/Bullet';
import { RemotePlayer } from '../entities/RemotePlayer';
import { buildCityMap, MAP_PX_W, MAP_PX_H, TILE, type BuildingInfo, type PropInfo } from '../world/CityMap';
import { ITEMS, LOOT_TABLES } from '../utils/Definitions';
import { createAnimations } from '../utils/AssetLoader';
import { socketManager } from '../network/SocketManager';

export class GameScene extends Phaser.Scene {
  public player!: Player;
  public killCount: number = 0;
  private zombies!: Phaser.GameObjects.Group;
  private bullets!: Phaser.Physics.Arcade.Group;
  private keys!: any;
  private buildings: BuildingInfo[] = [];
  private props: PropInfo[] = [];
  private cars: any[] = [];
  private currentVehicle: any = null;
  private interactText!: Phaser.GameObjects.Text;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private gameTime: number = 0;
  public timeSurvived: number = 0;
  private spawnTimer: number = 0;
  private difficultyTimer: number = 0;
  private targetZombieCount: number = 40;
  public pvpEnabled: boolean = true;

  // Multiplayer
  public remotePlayers = new Map<string, RemotePlayer>();
  private netSendTimer: number = 0;
  private chatMessages: Phaser.GameObjects.Text[] = [];
  private chatInput: string = '';
  private chatActive: boolean = false;
  private chatInputText!: Phaser.GameObjects.Text;
  private killFeedMessages: Phaser.GameObjects.Text[] = [];

  // Bunker system — entrance inside military base, exit in underground
  private inBunker: boolean = false;
  private bunkerEntrance = { x: 36 * 16, y: 26 * 16 };  // Inside military compound (BÚNKER building)
  private bunkerExit = { x: 100 * 16, y: 220 * 16 };

  // Ambient
  private ambientTimer: number = 0;
  private bloodDecals: Phaser.GameObjects.Arc[] = [];
  public leaderboardData: { name: string; kills: number }[] = [];
  private leaderboardTimer: number = 0;

  constructor() { super('GameScene'); }

  create() {
    this.cameras.main.fadeIn(400);

    // Create all animations
    createAnimations(this);

    // Player (spawn center-ish)
    this.player = new Player(this, 100 * TILE, 100 * TILE);
    this.player.setName('player');

    // Build map
    const map = buildCityMap(this);
    this.walls = map.walls;
    this.buildings = map.buildings;
    this.props = map.props;
    this.cars = map.cars;

    // Zombies
    this.zombies = this.add.group();
    this.spawnZombies(40);

    // Bullets (more pool for SMG/shotgun)
    this.bullets = this.physics.add.group({ classType: Bullet, maxSize: 100, runChildUpdate: false });

    // Input
    if (this.input.keyboard) {
      this.keys = this.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D,
        E: Phaser.Input.Keyboard.KeyCodes.E,
        R: Phaser.Input.Keyboard.KeyCodes.R,
        SHIFT: Phaser.Input.Keyboard.KeyCodes.SHIFT,
        NUM1: Phaser.Input.Keyboard.KeyCodes.ONE,
        NUM2: Phaser.Input.Keyboard.KeyCodes.TWO,
        NUM3: Phaser.Input.Keyboard.KeyCodes.THREE,
        NUM4: Phaser.Input.Keyboard.KeyCodes.FOUR,
        NUM5: Phaser.Input.Keyboard.KeyCodes.FIVE,
        NUM6: Phaser.Input.Keyboard.KeyCodes.SIX,
        NUM7: Phaser.Input.Keyboard.KeyCodes.SEVEN,
        NUM8: Phaser.Input.Keyboard.KeyCodes.EIGHT,
        NUM9: Phaser.Input.Keyboard.KeyCodes.NINE,
      });
    }

    // Collisions
    this.physics.add.collider(this.player, this.walls);
    this.player.setPushable(false);

    // Car collisions
    this.cars.forEach(car => {
      this.physics.add.collider(car.body, this.walls);
    });

    // Bullet <-> zombie overlap
    this.physics.add.overlap(this.bullets, this.zombies, this.onBulletHit as any, undefined, this);

    // Player attack event
    this.events.on('playerAttack', (data: any) => {
      socketManager.sendAttack(data.angle, data.weapon.id);
      if (data.weapon.type === 'ranged') {
        this.fireBullet(data);
      } else {
        this.meleeHit(data);
      }
    });

    // Zombie attack event
    this.events.on('zombieAttack', (data: any) => {
      if (!this.player.active) return;
      
      const { zombie, damage } = data;
      if (!zombie.active) return;
      const dist = Phaser.Math.Distance.Between(zombie.x, zombie.y, this.player.x, this.player.y);
      if (dist < 45) {
        this.player.health -= damage;
        this.floatText(this.player.x, this.player.y, `-${damage}`, '#ff2222');
        this.spawnBlood(this.player.x, this.player.y);
        
        // Player knockback
        const angle = Phaser.Math.Angle.Between(zombie.x, zombie.y, this.player.x, this.player.y);
        (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(Math.cos(angle) * 300, Math.sin(angle) * 300);

        if (!this.player.isInfected && Math.random() < 0.08) {
          this.player.isInfected = true;
          this.player.setTint(0x88ff88);
        }
      }
    });

    // Chain aggro: when a zombie is hurt, alert nearby zombies
    this.events.on('zombieHurt', (data: { x: number; y: number; range: number }) => {
      this.zombies.children.iterate((z: any) => {
        if (!z?.active || (z as Zombie).isDying) return true;
        const dist = Phaser.Math.Distance.Between(data.x, data.y, z.x, z.y);
        if (dist < data.range && dist > 0) {
          (z as Zombie).alertFromNearby(data.x, data.y);
        }
        return true;
      });
    });

    // Interact text
    this.interactText = this.add.text(0, 0, '', {
      fontSize: '8px', color: '#ffcc00', fontFamily: 'monospace',
      backgroundColor: 'rgba(0,0,0,0.7)', padding: { x: 3, y: 1 }
    }).setDepth(20).setVisible(false);

    // RPG explosion AoE damage
    this.events.on('explosion', (data: { x: number; y: number; radius: number; damage: number }) => {
      this.zombies.children.iterate((z: any) => {
        if (!z?.active || (z as Zombie).isDying) return true;
        const dist = Phaser.Math.Distance.Between(data.x, data.y, z.x, z.y);
        if (dist < data.radius) {
          const wasAlive = (z as Zombie).hp > 0;
          const dmg = Math.floor(data.damage * (1 - dist / data.radius));
          const angle = Phaser.Math.Angle.Between(data.x, data.y, z.x, z.y);
          (z as Zombie).takeDamage(Math.max(1, dmg), angle, 300);
          this.spawnBlood(z.x, z.y);
          if (wasAlive && (z as Zombie).hp <= 0) { this.killCount++; socketManager.sendKill((z as Zombie).zombieType); }
        }
        return true;
      });
    });

    // Camera
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(2);
    this.cameras.main.setBounds(0, 0, MAP_PX_W, MAP_PX_H);

    // Chat input (fixed to camera)
    this.chatInputText = this.add.text(10, this.scale.height - 25, '', {
      fontSize: '8px', color: '#fff', fontFamily: 'monospace',
      backgroundColor: 'rgba(0, 0, 0, 0.7)', padding: { x: 4, y: 2 }
    }).setDepth(25).setScrollFactor(0).setVisible(false);

    // Chat key (T)
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown', (e: KeyboardEvent) => {
        if (!socketManager.connected) return;
        if (e.key === 't' && !this.chatActive) {
          this.chatActive = true;
          this.chatInput = '';
          this.chatInputText.setVisible(true).setText('> _');
          return;
        }
        if (!this.chatActive) return;
        if (e.key === 'Escape') { this.chatActive = false; this.chatInputText.setVisible(false); return; }
        if (e.key === 'Enter') {
          if (this.chatInput.length > 0) socketManager.sendChat(this.chatInput);
          this.chatActive = false; this.chatInputText.setVisible(false); return;
        }
        if (e.key === 'Backspace') { this.chatInput = this.chatInput.slice(0, -1); }
        else if (e.key.length === 1 && this.chatInput.length < 80) { this.chatInput += e.key; }
        this.chatInputText.setText('> ' + this.chatInput + '_');
      });
    }

    // Multiplayer events
    this.setupNetworkEvents();

    // Launch HUD
    this.scene.launch('HUDScene');
  }

  update(_time: number, _delta: number) {
    if (!this.player?.active) return;
    
    if (this.chatActive) {
      // Block gameplay input while chatting
    } else if (this.currentVehicle) {
      this.handleCarDriving();
    } else {
      this.player.update(this.keys, this.input.activePointer);
    }
    
    this.gameTime += _delta;
    this.timeSurvived += _delta;

    // Request leaderboard from server every 10 seconds
    this.leaderboardTimer += _delta;
    if (this.leaderboardTimer > 10000) {
      this.leaderboardTimer = 0;
      if (socketManager.connected) {
        socketManager.requestLeaderboard();
      } else {
        // Solo mode: local leaderboard
        const name = localStorage.getItem('zombieland_name') || 'Superviviente';
        this.leaderboardData = [{ name, kills: this.killCount }];
      }
    }

    // Network: broadcast position ~15fps
    this.netSendTimer += _delta;
    if (this.netSendTimer > 66) {
      this.netSendTimer = 0;
      this.broadcastPosition();
    }

    // Update remote players interpolation
    this.remotePlayers.forEach(rp => rp.update());

    // Continuous zombie spawning (replaces wave system)
    this.spawnTimer += _delta;
    this.difficultyTimer += _delta;
    
    // Increase target count every 30 seconds
    if (this.difficultyTimer > 30000) {
      this.difficultyTimer = 0;
      this.targetZombieCount = Math.min(this.targetZombieCount + 3, 120);
    }
    
    // Spawn zombies every 3 seconds if below target
    if (this.spawnTimer > 3000) {
      this.spawnTimer = 0;
      let aliveCount = 0;
      this.zombies.children.iterate((z: any) => { if (z?.active) aliveCount++; return true; });
      if (aliveCount < this.targetZombieCount) {
        this.spawnZombies(Math.min(3, this.targetZombieCount - aliveCount));
      }
    }

    // Ambient effects
    this.ambientTimer += _delta;
    if (this.ambientTimer > 5000) {
      this.ambientTimer = 0;
      this.spawnAmbientParticle();
    }

    // Building roof toggling
    for (const bld of this.buildings) {
      const inside = bld.zone.contains(this.player.x, this.player.y);
      for (const rt of bld.roofTiles) {
        rt.setVisible(!inside);
      }
    }

    // Zombie AI
    this.zombies.children.iterate((z: any) => {
      if (z?.active && !(z as Zombie).isDying) (z as Zombie).updateAI(this.player, this.player.isInfected);
      return true;
    });

    // Interaction check
    this.checkInteraction();

    // Use item (R)
    if (this.keys?.R && Phaser.Input.Keyboard.JustDown(this.keys.R)) {
      if (!this.currentVehicle) this.player.useItem(this.player.selectedSlot);
    }

    // Death
    if (this.player.health <= 0) this.handleDeath();
  }

  private handleCarDriving() {
    const car = this.currentVehicle;
    const body = car.body.body as Phaser.Physics.Arcade.Body;
    
    let accel = 0;
    if (this.keys.W.isDown) accel = 200; // Heavier car
    if (this.keys.S.isDown) accel = -100;
    
    let turn = 0;
    if (this.keys.A.isDown) turn = -0.02; // Slower turn
    if (this.keys.D.isDown) turn = 0.02;

    if (accel !== 0 || turn !== 0) {
      car.sprite.rotation += turn;
      car.body.rotation += turn;
      const vx = Math.cos(car.sprite.rotation - Math.PI/2) * accel;
      const vy = Math.sin(car.sprite.rotation - Math.PI/2) * accel;
      body.setVelocity(vx, vy);
    } else {
      body.setVelocity(body.velocity.x * 0.90, body.velocity.y * 0.90);
    }

    // Update player position to car
    this.player.setPosition(car.body.x, car.body.y);
    car.sprite.setPosition(car.body.x, car.body.y);

    // Hit zombies with car
    this.zombies.children.iterate((z: any) => {
      if (!z?.active || (z as Zombie).isDying) return true;
      const dist = Phaser.Math.Distance.Between(car.body.x, car.body.y, z.x, z.y);
      if (dist < 40 && body.velocity.length() > 50) {
        const wasAlive = (z as Zombie).hp > 0;
        (z as Zombie).takeDamage(Math.floor(body.velocity.length() / 5));
        this.spawnBlood(z.x, z.y);
        if (wasAlive && (z as Zombie).hp <= 0) { this.killCount++; socketManager.sendKill((z as Zombie).zombieType); }
      }
      return true;
    });
  }

  private fireBullet(data: any) {
    if (this.player.ammo <= 0) return;
    this.player.ammo--;

    const weapon = data.weapon;
    let bKey = 'bullet_pistol';
    if (weapon.id === 'shotgun') bKey = 'bullet_shotgun';
    else if (weapon.id === 'rifle' || weapon.id === 'ak47') bKey = 'bullet_gun';
    else if (weapon.id === 'rpg') bKey = 'bullet_gun';
    else if (weapon.id === 'smg') bKey = 'bullet_pistol';
    else if (weapon.id === 'revolver') bKey = 'bullet_pistol';

    const pellets = weapon.pelletsPerShot || 1;
    const isExplosive = weapon.explosive || false;
    const explosionRadius = weapon.explosionRadius || 0;

    for (let p = 0; p < pellets; p++) {
      let bullet = this.bullets.getFirstDead(false) as Bullet;
      if (!bullet) {
        bullet = new Bullet(this, data.x, data.y, bKey);
        this.bullets.add(bullet);
      }
      bullet.setTexture(bKey);
      bullet.fire(data.x, data.y, data.angle, weapon.projectileSpeed, weapon.damage, weapon.spread, isExplosive, explosionRadius);
    }
  }

  private meleeHit(data: any) {
    const range = data.weapon.range + 10;
    const dmg = this.player.isInfected ? Math.floor(data.weapon.damage * 0.4) : data.weapon.damage;

    this.zombies.children.iterate((z: any) => {
      if (!z?.active || (z as Zombie).isDying) return true;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, z.x, z.y);
      const angleToZ = Phaser.Math.Angle.Between(this.player.x, this.player.y, z.x, z.y);
      const angleDiff = Math.abs(Phaser.Math.Angle.Wrap(angleToZ - data.angle));
      
      if (dist < range && angleDiff < 1.5) {
        const wasAlive = (z as Zombie).hp > 0;
        (z as Zombie).takeDamage(dmg, angleToZ, 250);
        this.floatText(z.x, z.y, `-${dmg}`, '#ffffff');
        this.spawnBlood(z.x, z.y);
        if (wasAlive && (z as Zombie).hp <= 0) { this.killCount++; socketManager.sendKill((z as Zombie).zombieType); }
      }
      return true;
    });
  }

  private onBulletHit(obj1: any, obj2: any) {
    if (!obj1.active || !obj2.active) return;
    
    const bullet = obj1.damage !== undefined ? obj1 : obj2;
    const zombie = obj1.takeDamage !== undefined ? obj1 : obj2;

    if (!bullet || !zombie || typeof zombie.takeDamage !== 'function') return;
    if ((zombie as Zombie).isDying) return;

    // RPG explodes on contact
    if (bullet.isExplosive) {
      (bullet as Bullet).explode();
      return;
    }

    const wasAlive = (zombie as Zombie).hp > 0;
    const bulletAngle = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x);
    (zombie as Zombie).takeDamage(bullet.damage, bulletAngle, 150);
    this.floatText(zombie.x, zombie.y, `-${bullet.damage}`, '#ffffff');
    
    this.spawnBlood(zombie.x, zombie.y);
    this.addBloodDecal(zombie.x, zombie.y);
    if (wasAlive && (zombie as Zombie).hp <= 0) { this.killCount++; socketManager.sendKill((zombie as Zombie).zombieType); }
    bullet.deactivate();
  }

  private spawnBlood(x: number, y: number) {
    for (let i = 0; i < 4; i++) {
      const p = this.add.circle(x + Phaser.Math.Between(-6, 6), y + Phaser.Math.Between(-6, 6), Phaser.Math.Between(1, 2), 0xcc0000, 0.9).setDepth(3);
      this.tweens.add({ targets: p, alpha: 0, scaleX: 0, scaleY: 0, duration: 600, onComplete: () => p.destroy() });
    }
  }

  private checkInteraction() {
    this.interactText.setVisible(false);

    // Bunker entrance/exit
    if (!this.inBunker) {
      const distToBunker = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.bunkerEntrance.x, this.bunkerEntrance.y);
      if (distToBunker < 50) {
        this.interactText.setPosition(this.bunkerEntrance.x - 20, this.bunkerEntrance.y - 30);
        this.interactText.setText('[E] Entrar al búnker');
        this.interactText.setVisible(true);
        if (this.keys?.E && Phaser.Input.Keyboard.JustDown(this.keys.E)) {
          this.enterBunker();
          return;
        }
      }
    } else {
      const distToExit = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.bunkerExit.x, this.bunkerExit.y);
      if (distToExit < 50) {
        this.interactText.setPosition(this.bunkerExit.x - 20, this.bunkerExit.y - 30);
        this.interactText.setText('[E] Salir del búnker');
        this.interactText.setVisible(true);
        if (this.keys?.E && Phaser.Input.Keyboard.JustDown(this.keys.E)) {
          this.exitBunker();
          return;
        }
      }
    }

    // Check cars
    if (!this.currentVehicle) {
      for (const car of this.cars) {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, car.body.x, car.body.y);
        if (dist < 60) {
          this.interactText.setPosition(car.body.x - 20, car.body.y - 30);
          this.interactText.setText('[E] Conducir');
          this.interactText.setVisible(true);
          if (this.keys?.E && Phaser.Input.Keyboard.JustDown(this.keys.E)) {
            this.enterVehicle(car);
          }
          return;
        }
      }
    } else {
    // Exit vehicle prompt
      this.interactText.setPosition(this.currentVehicle.body.x - 20, this.currentVehicle.body.y - 30);
      this.interactText.setText('[E] Salir');
      this.interactText.setVisible(true);
      if (this.keys?.E && Phaser.Input.Keyboard.JustDown(this.keys.E)) {
        this.exitVehicle();
      }
      return;
    }

    for (const prop of this.props) {
      if (prop.searched) continue;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, prop.x, prop.y);
      if (dist < 35) {
        if (prop.type === 'tree') continue; // Don't allow searching trees
        
        const label = prop.type === 'ground_item' ? '[E] Recoger' : '[E] Buscar';
        this.interactText.setPosition(prop.x - 20, prop.y - 20);
        this.interactText.setText(label);
        this.interactText.setVisible(true);

        if (this.keys?.E && Phaser.Input.Keyboard.JustDown(this.keys.E)) {
          this.interactWith(prop);
        }
        break;
      }
    }
  }

  private interactWith(prop: PropInfo) {
    prop.searched = true;

    if (prop.type === 'ground_item') {
      // Determine item from texture key
      const texKey = prop.sprite.texture.key;
      let itemId = 'food';
      if (texKey === 'item_knife') itemId = 'knife';
      else if (texKey === 'item_axe') itemId = 'axe';
      else if (texKey.includes('bat')) itemId = 'bat';
      else if (texKey.includes('rpg') || texKey.includes('bazooka')) itemId = 'rpg';
      else if (texKey.includes('ak47')) itemId = 'ak47';
      else if (texKey.includes('smg') || texKey.includes('submachine')) itemId = 'smg';
      else if (texKey.includes('revolver')) itemId = 'revolver';
      else if (texKey.includes('pistol')) itemId = 'pistol';
      else if (texKey.includes('shotgun')) itemId = 'shotgun';
      else if (texKey.includes('rifle') || texKey.includes('gun')) itemId = 'rifle';
      else if (texKey.includes('bandage')) itemId = 'medkit';
      else if (texKey.includes('soup') || texKey.includes('chips')) itemId = 'food';
      else if (texKey.includes('ammo_blue') || texKey.includes('ammo_green')) itemId = 'ammo9';
      else if (texKey.includes('ammo_red')) itemId = 'ammoShell';

      const item = ITEMS[itemId];
      if (item && this.player.addItem(item)) {
        this.floatText(prop.x, prop.y, `+${item.name}`, '#44ff44');
        prop.sprite.destroy();
      }
    } else {
      prop.sprite.setTint(0x555555);
      const table = LOOT_TABLES[prop.type] || LOOT_TABLES['trashcan'];
      if (Math.random() < table.chance) {
        const itemId = Phaser.Utils.Array.GetRandom(table.items);
        const item = ITEMS[itemId];
        if (item && this.player.addItem(item)) {
          this.floatText(prop.x, prop.y, `+${item.name}`, '#44ff44');
        }
      } else {
        this.floatText(prop.x, prop.y, 'Vacío...', '#888');
      }
    }
  }

  private enterVehicle(car: any) {
    this.currentVehicle = car;
    this.player.setVisible(false);
    this.player.body!.enable = false;
    
    const body = car.body.body as Phaser.Physics.Arcade.Body;
    // Car body was static (wall), make it dynamic
    (car.body as any).isStatic = false;
    body.setImmovable(false);
    body.setMass(10);
    
    // Convert to dynamic if it was static
    if (car.body.body.type === Phaser.Physics.Arcade.STATIC_BODY) {
      // Phaser doesn't easily convert static to dynamic on the fly, 
      // but we can just use the sprite's physics if we set it up in CityMap.
      // For now, let's assume we can just toggle velocity control.
    }

    this.cameras.main.startFollow(car.body, true, 0.08, 0.08);
  }

  private exitVehicle() {
    const car = this.currentVehicle;
    this.currentVehicle = null;
    this.player.setVisible(true);
    this.player.body!.enable = true;
    this.player.setPosition(car.body.x + 40, car.body.y);
    
    const body = car.body.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
  }

  public floatText(x: number, y: number, text: string, color: string) {
    const t = this.add.text(x, y - 10, text, { fontSize: '10px', color, fontFamily: 'monospace', fontStyle: 'bold' }).setDepth(20).setOrigin(0.5);
    this.tweens.add({ targets: t, y: t.y - 25, alpha: 0, duration: 1000, onComplete: () => t.destroy() });
  }

  private spawnZombies(count: number) {
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(300, MAP_PX_W - 300);
      const y = Phaser.Math.Between(300, MAP_PX_H - 300);
      if (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < 400) continue;
      const roll = Math.random();
      let type: ZombieType;
      if (roll > 0.9) type = ZombieType.BIG;
      else if (roll > 0.75) type = ZombieType.AXE;
      else type = ZombieType.SMALL;
      const z = new Zombie(this, x, y, type);
      this.zombies.add(z);
      this.physics.add.collider(this.player, z);
      this.physics.add.collider(z, this.walls);
      z.setPushable(false);
    }
  }

  private handleDeath() {
    this.player.health = 0;
    this.player.setActive(false);
    this.player.setVisible(false);

    const cam = this.cameras.main;
    const cx = cam.scrollX + cam.width / (cam.zoom * 2);
    const cy = cam.scrollY + cam.height / (cam.zoom * 2);

    this.add.rectangle(cx, cy, cam.width, cam.height, 0x000000, 0.85).setDepth(100).setScrollFactor(0);

    this.add.text(cam.width / 2, cam.height / 2 - 30, 'HAS MUERTO', {
      fontSize: '32px', color: '#cc0000', fontFamily: 'Georgia, serif', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(101).setScrollFactor(0);

    this.add.text(cam.width / 2, cam.height / 2 + 5, `Zombies eliminados: ${this.killCount}`, {
      fontSize: '12px', color: '#aaa', fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(101).setScrollFactor(0);

    const btn = this.add.text(cam.width / 2, cam.height / 2 + 40, '[ REINICIAR ]', {
      fontSize: '18px', color: '#44aa44', fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(101).setScrollFactor(0).setInteractive({ useHandCursor: true });
    btn.on('pointerdown', () => {
      this.remotePlayers.forEach(rp => rp.destroy());
      this.remotePlayers.clear();
      this.scene.stop('HUDScene');
      this.scene.restart();
    });
  }

  // ── Multiplayer ──────────────────────────────────────────────────
  private setupNetworkEvents() {
    if (!socketManager.connected) return;

    // Spawn existing players from join data (passed via registry from MenuScene)
    const joinedData = this.registry.get('joinedData') as { players?: Array<{ id: string; name: string; x: number; y: number; facing: string; anim: string; weaponId: string; health: number; kills: number }> } | undefined;
    if (joinedData?.players) {
      for (const p of joinedData.players) {
        if (this.remotePlayers.has(p.id)) continue;
        const rp = new RemotePlayer(this, p.id, p.name, p.x, p.y);
        rp.setState(p.x, p.y, p.facing, p.anim, p.weaponId, p.health);
        rp.kills = p.kills;
        this.remotePlayers.set(p.id, rp);
      }
      this.registry.remove('joinedData');
    }

    socketManager.on('player_join', (data: { id: string; name: string; x: number; y: number }) => {
      if (this.remotePlayers.has(data.id)) return;
      const rp = new RemotePlayer(this, data.id, data.name, data.x, data.y);
      this.remotePlayers.set(data.id, rp);
      this.floatText(data.x, data.y, `${data.name} se unió`, '#88ccff');
    });

    socketManager.on('player_leave', (data: { id: string }) => {
      const rp = this.remotePlayers.get(data.id);
      if (rp) {
        this.floatText(rp.sprite.x, rp.sprite.y, `${rp.name} se fue`, '#888');
        rp.destroy();
        this.remotePlayers.delete(data.id);
      }
    });

    socketManager.on('player_move', (data: { id: string; x: number; y: number; facing: string; anim: string; weaponId: string; health: number }) => {
      const rp = this.remotePlayers.get(data.id);
      if (rp) rp.setState(data.x, data.y, data.facing, data.anim, data.weaponId, data.health);
    });

    socketManager.on('player_attack', (data: { id: string; angle: number; weaponId: string }) => {
      const rp = this.remotePlayers.get(data.id);
      if (rp) rp.setState(rp.targetX, rp.targetY, rp.sprite.x < this.player.x ? 'right' : 'left', 'attack', data.weaponId, rp.health);
    });

    socketManager.on('player_kill', (data: { id: string; name: string; kills: number; zombieType: string }) => {
      const rp = this.remotePlayers.get(data.id);
      if (rp) rp.kills = data.kills;
      // Show kill feed for all players (including self)
      const zombieLabel = data.zombieType === 'big' ? 'Zombie Grande' : (data.zombieType === 'axe' ? 'Zombie Hacha' : 'Zombie');
      const killerName = data.id === socketManager.myId
        ? (localStorage.getItem('zombieland_name') || 'Tú')
        : (data.name || 'Jugador');
      this.showKillFeed(killerName, zombieLabel);
    });

    socketManager.on('chat', (data: { name: string; message: string }) => {
      this.showChatMessage(data.name, data.message);
    });

    // Spawn existing players that were already in the room
    socketManager.on('joined', (data: { players: Array<{ id: string; name: string; x: number; y: number; facing: string; anim: string; weaponId: string; health: number; kills: number }> }) => {
      for (const p of data.players) {
        if (this.remotePlayers.has(p.id)) continue;
        const rp = new RemotePlayer(this, p.id, p.name, p.x, p.y);
        rp.setState(p.x, p.y, p.facing, p.anim, p.weaponId, p.health);
        rp.kills = p.kills;
        this.remotePlayers.set(p.id, rp);
      }
    });

    // Leaderboard updates
    socketManager.on('leaderboard', (data: { name: string; kills: number }[]) => {
      this.leaderboardData = data;
    });

    // PVP incoming hit
    socketManager.on('pvp_hit', (data: { attackerName: string; damage: number }) => {
      if (!this.player?.active) return;
      this.player.health -= data.damage * 0.5; // 50% PVP reduction
      this.floatText(this.player.x, this.player.y - 20, `-${Math.round(data.damage * 0.5)} PVP`, '#ff4444');
      this.cameras.main.shake(120, 0.005);
    });

    // Infected sync from other players
    socketManager.on('player_infected', (data: { id: string; infected: boolean }) => {
      const rp = this.remotePlayers.get(data.id);
      if (rp) {
        rp.isInfected = data.infected;
        rp.sprite.setTint(data.infected ? 0x88ff88 : 0xffffff);
      }
    });
  }

  private broadcastPosition() {
    if (!socketManager.connected) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const isMoving = body.velocity.length() > 5;
    const equipped = this.player.inventory[this.player.selectedSlot];
    const weaponId = equipped?.weaponId || 'fists';
    const anim = this.player.isAttacking ? 'attack' : (isMoving ? 'run' : 'idle');

    socketManager.sendMove(
      Math.round(this.player.x),
      Math.round(this.player.y),
      this.player.getFacing(),
      anim,
      weaponId,
      Math.round(this.player.health),
    );
  }

  private showChatMessage(name: string, message: string) {
    const cam = this.cameras.main;
    const y = cam.height - 50 - this.chatMessages.length * 14;
    const t = this.add.text(10, y, `${name}: ${message}`, {
      fontSize: '8px', color: '#ddd', fontFamily: 'monospace',
      backgroundColor: 'rgba(0,0,0,0.5)', padding: { x: 3, y: 1 },
    }).setDepth(25).setScrollFactor(0);
    this.chatMessages.push(t);
    // Fade out after 8 seconds
    this.tweens.add({
      targets: t, alpha: 0, delay: 8000, duration: 1000,
      onComplete: () => {
        t.destroy();
        this.chatMessages = this.chatMessages.filter(m => m !== t);
      }
    });
    // Max 6 visible messages
    if (this.chatMessages.length > 6) {
      const old = this.chatMessages.shift();
      old?.destroy();
    }
  }

  private showKillFeed(killerName: string, victimName: string) {
    const cam = this.cameras.main;
    // Position at top-right
    const x = cam.width - 10;
    // Shift existing kill feed messages down
    this.killFeedMessages.forEach(m => m.y += 14);
    const t = this.add.text(x, 10, `${killerName} ☠ ${victimName}`, {
      fontSize: '7px', color: '#ff8844', fontFamily: 'monospace', fontStyle: 'bold',
      backgroundColor: 'rgba(0,0,0,0.6)', padding: { x: 3, y: 1 },
    }).setOrigin(1, 0).setDepth(25).setScrollFactor(0);
    this.killFeedMessages.push(t);
    // Fade out after 5 seconds
    this.tweens.add({
      targets: t, alpha: 0, delay: 5000, duration: 800,
      onComplete: () => {
        t.destroy();
        this.killFeedMessages = this.killFeedMessages.filter(m => m !== t);
      }
    });
    // Max 5 visible
    if (this.killFeedMessages.length > 5) {
      const old = this.killFeedMessages.shift();
      old?.destroy();
    }
  }

  // ── Bunker System ───────────────────────────────────────────────
  private enterBunker() {
    this.inBunker = true;
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      this.player.setPosition(this.bunkerExit.x, this.bunkerExit.y - 50);
      this.cameras.main.fadeIn(300, 0, 0, 0);
      this.floatText(this.player.x, this.player.y - 20, 'Búnker subterráneo', '#88ccff');
    });
  }

  private exitBunker() {
    this.inBunker = false;
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      this.player.setPosition(this.bunkerEntrance.x, this.bunkerEntrance.y + 30);
      this.cameras.main.fadeIn(300, 0, 0, 0);
      this.floatText(this.player.x, this.player.y - 20, 'Superficie', '#aaffaa');
    });
  }

  // ── Ambient ─────────────────────────────────────────────────────
  private spawnAmbientParticle() {
    const cam = this.cameras.main;
    const x = cam.scrollX + Phaser.Math.Between(0, cam.width);
    const y = cam.scrollY + Phaser.Math.Between(0, cam.height);
    
    // Fog wisps
    const fog = this.add.circle(x, y, Phaser.Math.Between(20, 50), 0x334455, 0.04).setDepth(11);
    this.tweens.add({
      targets: fog, x: x + Phaser.Math.Between(-50, 50), y: y + Phaser.Math.Between(-20, -50),
      alpha: 0, scaleX: 2, scaleY: 1.5, duration: 4000, onComplete: () => fog.destroy()
    });
  }

  private addBloodDecal(x: number, y: number) {
    const decal = this.add.circle(x + Phaser.Math.Between(-4, 4), y + Phaser.Math.Between(-4, 4),
      Phaser.Math.Between(2, 5), 0x660000, 0.5).setDepth(0.5);
    this.bloodDecals.push(decal);
    // Remove old decals to prevent memory bloat
    if (this.bloodDecals.length > 200) {
      const old = this.bloodDecals.shift();
      old?.destroy();
    }
  }
}
