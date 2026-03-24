import Phaser from 'phaser';
import type { Player } from '../entities/Player';
import { MAP_PX_W, MAP_PX_H } from '../world/CityMap';

export class HUDScene extends Phaser.Scene {
  private healthBar!: Phaser.GameObjects.Graphics;
  private staminaBar!: Phaser.GameObjects.Graphics;
  private hungerBar!: Phaser.GameObjects.Graphics;
  private statusText!: Phaser.GameObjects.Text;
  private ammoText!: Phaser.GameObjects.Text;
  private weaponText!: Phaser.GameObjects.Text;
  private killText!: Phaser.GameObjects.Text;
  private slotGraphics!: Phaser.GameObjects.Graphics;
  private slotItemIcons: Phaser.GameObjects.Image[] = [];
  private slotNumTexts: Phaser.GameObjects.Text[] = [];
  private equippedNameText!: Phaser.GameObjects.Text;
  private minimapG!: Phaser.GameObjects.Graphics;
  private gameScene: any;
  private timeText!: Phaser.GameObjects.Text;
  private leaderboardTexts: Phaser.GameObjects.Text[] = [];

  // Scaled dimensions
  private sf = 1;
  private barW = 200;
  private barH = 14;
  private slotSize = 42;
  private slotGap = 4;
  private x0 = 16;
  private y0 = 16;
  private barX = 0;
  private barY = 0;
  private hudReady = false;

  constructor() { super('HUDScene'); }

  create() {
    this.gameScene = this.scene.get('GameScene');
    this.buildHUD();
    this.scale.on('resize', this.onResize, this);
  }

  private onResize() {
    this.hudReady = false;
    this.children.removeAll(true);
    this.slotItemIcons = [];
    this.slotNumTexts = [];
    this.buildHUD();
  }

  private buildHUD() {
    const { width, height } = this.scale;
    this.sf = Math.max(0.7, Math.min(height / 700, width / 1200));

    const sf = this.sf;
    this.barW = Math.round(220 * sf);
    this.barH = Math.round(16 * sf);
    this.slotSize = Math.round(46 * sf);
    this.slotGap = Math.round(4 * sf);
    this.x0 = Math.round(18 * sf);
    this.y0 = Math.round(18 * sf);

    const fontSize = `${Math.max(12, Math.round(14 * sf))}px`;
    const smallFont = `${Math.max(11, Math.round(12 * sf))}px`;
    const nameFont = `${Math.max(13, Math.round(16 * sf))}px`;
    const slotNumFont = `${Math.max(10, Math.round(11 * sf))}px`;
    const equippedFont = `${Math.max(13, Math.round(16 * sf))}px`;

    const x0 = this.x0;
    const y0 = this.y0;

    // Stats panel background
    const panelW = this.barW + x0 * 3;
    const panelH = Math.round(140 * sf);
    this.add.rectangle(panelW / 2 + x0 / 2, panelH / 2 + y0 / 2, panelW, panelH, 0x0a0a1a, 0.8)
      .setStrokeStyle(Math.max(1, Math.round(2 * sf)), 0x223344, 0.6);

    const ls: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize, fontFamily: 'monospace', fontStyle: 'bold'
    };

    // HP
    this.add.text(x0, y0, 'HP', { ...ls, color: '#ff4444' });
    this.healthBar = this.add.graphics();

    // STAMINA
    const row2 = y0 + Math.round(26 * sf);
    this.add.text(x0, row2, 'STAMINA', { ...ls, color: '#4488ff' });
    this.staminaBar = this.add.graphics();

    // HAMBRE
    const row3 = y0 + Math.round(52 * sf);
    this.add.text(x0, row3, 'HAMBRE', { ...ls, color: '#ffaa33' });
    this.hungerBar = this.add.graphics();

    // Name
    const name = localStorage.getItem('zombieland_name') || 'Superviviente';
    this.add.text(x0, y0 + Math.round(82 * sf), name, {
      fontSize: nameFont, color: '#fff', fontFamily: 'monospace', fontStyle: 'bold'
    });

    // Status
    this.statusText = this.add.text(x0, y0 + Math.round(102 * sf), 'SANO', {
      fontSize: smallFont, color: '#44ff44', fontFamily: 'monospace', fontStyle: 'bold'
    });

    // Ammo
    this.ammoText = this.add.text(x0 + Math.round(130 * sf), y0 + Math.round(82 * sf), 'MUNICIÓN: 30', {
      fontSize: smallFont, color: '#cccc44', fontFamily: 'monospace', fontStyle: 'bold'
    });

    // Weapon name
    this.weaponText = this.add.text(x0 + Math.round(130 * sf), y0 + Math.round(102 * sf), 'Puños', {
      fontSize: smallFont, color: '#aaa', fontFamily: 'monospace'
    });

    // Kill count
    this.killText = this.add.text(x0, y0 + Math.round(122 * sf), 'Kills: 0', {
      fontSize: smallFont, color: '#cc4444', fontFamily: 'monospace', fontStyle: 'bold'
    });

    // Time survived
    this.timeText = this.add.text(x0 + Math.round(130 * sf), y0 + Math.round(122 * sf), '⏱ 00:00', {
      fontSize: smallFont, color: '#88aacc', fontFamily: 'monospace', fontStyle: 'bold'
    });

    // --- INVENTORY BAR ---
    const totalW = 9 * this.slotSize + 8 * this.slotGap;
    this.barX = width / 2 - totalW / 2;
    this.barY = height - this.slotSize - Math.round(22 * sf);

    this.add.rectangle(width / 2, this.barY + this.slotSize / 2, totalW + Math.round(14 * sf),
      this.slotSize + Math.round(14 * sf), 0x0a0a1a, 0.8)
      .setStrokeStyle(Math.max(1, Math.round(2 * sf)), 0x223344, 0.5);

    this.equippedNameText = this.add.text(width / 2, this.barY - Math.round(18 * sf), '', {
      fontSize: equippedFont, color: '#ffcc00', fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5).setStroke('#000', Math.max(2, Math.round(3 * sf)));

    this.slotGraphics = this.add.graphics();

    for (let i = 0; i < 9; i++) {
      const sx = this.barX + i * (this.slotSize + this.slotGap) + this.slotSize / 2;

      // Slot numbers
      const numTxt = this.add.text(sx, this.barY + Math.round(3 * sf), `${i + 1}`, {
        fontSize: slotNumFont, color: '#556677', fontFamily: 'monospace'
      }).setOrigin(0.5, 0);
      this.slotNumTexts.push(numTxt);

      // Item icons (sprite images, hidden by default)
      const iconImg = this.add.image(sx, this.barY + this.slotSize / 2 + Math.round(3 * sf), 'ui_cell')
        .setVisible(false);
      this.slotItemIcons.push(iconImg);
    }

    // Minimap
    this.minimapG = this.add.graphics();

    // Leaderboard panel (below minimap)
    const mmSize = Math.round(130 * sf);
    const mmX = width - mmSize - Math.round(16 * sf);
    const lbY = Math.round(16 * sf) + mmSize + Math.round(12 * sf);
    this.add.text(mmX, lbY, '🏆 LEADERBOARD', {
      fontSize: smallFont, color: '#ffcc44', fontFamily: 'monospace', fontStyle: 'bold'
    });
    this.leaderboardTexts = [];
    for (let i = 0; i < 5; i++) {
      const t = this.add.text(mmX, lbY + Math.round((14 + i * 14) * sf), '', {
        fontSize: `${Math.max(9, Math.round(10 * sf))}px`, color: '#99aabb', fontFamily: 'monospace'
      });
      this.leaderboardTexts.push(t);
    }

    // Delay 1 frame so WebGL textures are committed before setText calls
    this.time.delayedCall(0, () => { this.hudReady = true; });
  }

  update() {
    if (!this.hudReady || !this.gameScene?.player?.active) return;
    const p: Player = this.gameScene.player;
    const { width } = this.scale;
    const sf = this.sf;

    const x0 = this.x0;
    const y0 = this.y0;

    this.drawBar(this.healthBar, x0, y0 + Math.round(14 * sf), p.health / 100, 0xcc2222, 0x330808);
    this.drawBar(this.staminaBar, x0, y0 + Math.round(40 * sf), p.stamina / 100, 0x2244cc, 0x080833);
    this.drawBar(this.hungerBar, x0, y0 + Math.round(66 * sf), p.hunger / 100, 0xcc8822, 0x332208);

    if (this.statusText?.active) {
      this.statusText.setText(p.isInfected ? 'INFECTADO' : 'SANO');
      this.statusText.setColor(p.isInfected ? '#ff4444' : '#44ff44');
    }
    if (this.ammoText?.active) this.ammoText.setText(`MUNICIÓN: ${p.ammo}`);
    if (this.weaponText?.active) this.weaponText.setText(p.getCurrentWeapon().name);
    if (this.killText?.active) this.killText.setText(`Kills: ${this.gameScene.killCount || 0}`);

    // Time survived
    if (this.timeText?.active) {
      const t = Math.floor((this.gameScene.timeSurvived || 0) / 1000);
      const m = String(Math.floor(t / 60)).padStart(2, '0');
      const s = String(t % 60).padStart(2, '0');
      this.timeText.setText(`⏱ ${m}:${s}`);
    }

    // Leaderboard
    if (this.gameScene.leaderboardData && this.leaderboardTexts.length) {
      const lb = this.gameScene.leaderboardData as { name: string; kills: number }[];
      for (let i = 0; i < 5; i++) {
        if (this.leaderboardTexts[i]?.active) {
          this.leaderboardTexts[i].setText(lb[i] ? `${i + 1}. ${lb[i].name} - ${lb[i].kills}K` : '');
        }
      }
    }

    const equipped = p.inventory[p.selectedSlot];
    const itemName = equipped ? equipped.name : 'Puños';
    if (this.equippedNameText?.active && this.equippedNameText.text !== itemName) {
      this.equippedNameText.setText(itemName);
    }

    // Inventory slots
    this.slotGraphics.clear();
    for (let i = 0; i < 9; i++) {
      const sx = this.barX + i * (this.slotSize + this.slotGap);
      const selected = i === p.selectedSlot;

      this.slotGraphics.fillStyle(selected ? 0x1a2a3a : 0x0a0a15, 0.9);
      this.slotGraphics.fillRect(sx, this.barY, this.slotSize, this.slotSize);
      this.slotGraphics.lineStyle(
        selected ? Math.max(2, Math.round(2 * sf)) : Math.max(1, Math.round(1 * sf)),
        selected ? 0xffcc00 : 0x334466,
        selected ? 1 : 0.5
      );
      this.slotGraphics.strokeRect(sx, this.barY, this.slotSize, this.slotSize);

      const item = p.inventory[i];
      const icon = this.slotItemIcons[i];
      if (icon?.active) {
        if (item && item.iconTexture && this.textures.exists(item.iconTexture)) {
          const tex = this.textures.get(item.iconTexture);
          const frame = tex.get();
          // Scale icon to fit inside slot with padding
          const maxDim = this.slotSize - Math.round(12 * sf);
          const iconScale = Math.min(maxDim / frame.width, maxDim / frame.height);
          icon.setTexture(item.iconTexture);
          icon.setScale(iconScale);
          icon.setVisible(true);
        } else {
          icon.setVisible(false);
        }
      }
    }

    // Minimap
    const mmSize = Math.round(130 * sf);
    const mmX = width - mmSize - Math.round(16 * sf);
    const mmY = Math.round(16 * sf);
    this.minimapG.clear();

    this.minimapG.fillStyle(0x0a0a1a, 0.7);
    this.minimapG.fillRect(mmX, mmY, mmSize, mmSize);
    this.minimapG.lineStyle(Math.max(1, Math.round(2 * sf)), 0x334466, 0.6);
    this.minimapG.strokeRect(mmX, mmY, mmSize, mmSize);

    const px = mmX + (p.x / MAP_PX_W) * mmSize;
    const py = mmY + (p.y / MAP_PX_H) * mmSize;
    this.minimapG.fillStyle(0x44ff44, 1);
    this.minimapG.fillCircle(px, py, Math.max(2, Math.round(3 * sf)));

    // Remote players on minimap
    if (this.gameScene.remotePlayers) {
      const remotes = this.gameScene.remotePlayers as Map<string, any>;
      remotes.forEach((rp: any) => {
        if (!rp?.active) return;
        const rpx = mmX + (rp.x / MAP_PX_W) * mmSize;
        const rpy = mmY + (rp.y / MAP_PX_H) * mmSize;
        this.minimapG.fillStyle(rp.isInfected ? 0xff4444 : 0x4488ff, 0.8);
        this.minimapG.fillCircle(rpx, rpy, Math.max(2, Math.round(2 * sf)));
      });
    }
  }

  private drawBar(g: Phaser.GameObjects.Graphics, x: number, y: number, pct: number, fg: number, bg: number) {
    g.clear();
    const w = this.barW;
    const h = this.barH;
    g.fillStyle(bg, 1);
    g.fillRect(x, y, w, h);
    g.fillStyle(fg, 1);
    g.fillRect(x, y, w * Math.max(0, Math.min(1, pct)), h);
    g.lineStyle(Math.max(1, Math.round(1 * this.sf)), 0x446688, 0.3);
    g.strokeRect(x, y, w, h);
  }
}
