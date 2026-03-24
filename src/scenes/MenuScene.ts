import Phaser from 'phaser';
import { preloadAssets } from '../utils/AssetLoader';
import { socketManager, type RoomInfo } from '../network/SocketManager';

export class MenuScene extends Phaser.Scene {
  private nameInput: string = '';
  private nameText!: Phaser.GameObjects.Text;
  private cursor!: Phaser.GameObjects.Text;
  private cursorBlink: boolean = true;
  private canType: boolean = true;

  // Room UI elements
  private phase: 'name' | 'rooms' = 'name';
  private roomContainer!: Phaser.GameObjects.Container;
  private roomEntries: Phaser.GameObjects.Text[] = [];
  private statusText!: Phaser.GameObjects.Text;
  private nameElements: Phaser.GameObjects.GameObject[] = [];

  constructor() { super('MenuScene'); }

  preload() {
    preloadAssets(this);
  }

  create() {
    this.phase = 'name';
    const { width, height } = this.scale;
    const cx = width / 2, cy = height / 2;

    this.cameras.main.setBackgroundColor('#060612');

    // Background particles
    for (let i = 0; i < 50; i++) {
      const dot = this.add.circle(
        Phaser.Math.Between(0, width), Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 2), 0x223344, 0.35
      );
      this.tweens.add({
        targets: dot, y: dot.y + Phaser.Math.Between(30, 80), alpha: 0,
        duration: Phaser.Math.Between(4000, 8000), repeat: -1, yoyo: true
      });
    }

    // Red glow
    const glow = this.add.circle(cx, cy - 110, 100, 0xcc0000, 0.06);
    this.tweens.add({ targets: glow, scaleX: 1.3, scaleY: 1.3, alpha: 0.03, duration: 2500, yoyo: true, repeat: -1 });

    // Title
    this.add.text(cx, cy - 130, 'ZOMBIELAND', {
      fontSize: '56px', color: '#bb0000', fontFamily: 'Georgia, serif',
      fontStyle: 'bold', stroke: '#000', strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(cx, cy - 80, 'S U R V I V A L', {
      fontSize: '14px', color: '#556', fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.add.rectangle(cx, cy - 55, 250, 1, 0x334455, 0.5);

    // Status text (reused across phases)
    this.statusText = this.add.text(cx, cy + 100, '', {
      fontSize: '10px', color: '#cc4444', fontFamily: 'monospace'
    }).setOrigin(0.5);

    // ── Name Phase ──────────────────────────────────────────────────
    const namePrompt = this.add.text(cx, cy - 30, '¿Cómo te llamas, superviviente?', {
      fontSize: '13px', color: '#889', fontFamily: 'monospace'
    }).setOrigin(0.5);

    const nameBox = this.add.rectangle(cx, cy + 10, 280, 32, 0x0a0a1a).setStrokeStyle(1, 0x2a4a6a);

    const savedName = localStorage.getItem('zombieland_name') || '';
    this.nameInput = savedName;

    this.nameText = this.add.text(cx - 130, cy + 2, this.nameInput, {
      fontSize: '16px', color: '#eee', fontFamily: 'monospace'
    });

    this.cursor = this.add.text(cx - 130 + this.nameInput.length * 10, cy + 2, '|', {
      fontSize: '16px', color: '#5588cc', fontFamily: 'monospace'
    });

    this.time.addEvent({ delay: 500, loop: true, callback: () => {
      this.cursorBlink = !this.cursorBlink;
      this.cursor.setAlpha(this.cursorBlink ? 1 : 0);
    }});

    if (this.input.keyboard) {
      this.input.keyboard.on('keydown', (e: KeyboardEvent) => {
        if (!this.canType) return;
        if (this.phase !== 'name') return;
        if (e.key === 'Enter' && this.nameInput.length > 0) { this.showRoomBrowser(); return; }
        if (e.key === 'Backspace') { this.nameInput = this.nameInput.slice(0, -1); }
        else if (e.key.length === 1 && this.nameInput.length < 16) { this.nameInput += e.key; }
        this.nameText.setText(this.nameInput);
        this.cursor.setX(this.nameText.x + this.nameInput.length * 10);
      });
    }

    // Start button
    const btn = this.add.text(cx, cy + 60, '[ ENTRAR ]', {
      fontSize: '24px', color: '#3a8a3a', fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setColor('#55cc55'));
    btn.on('pointerout', () => btn.setColor('#3a8a3a'));
    btn.on('pointerdown', () => { if (this.nameInput.length > 0) this.showRoomBrowser(); });

    // Controls help
    const help1 = this.add.text(cx, height - 50, 'WASD: Moverse | SHIFT: Sprint | CLICK: Atacar | E: Interactuar', {
      fontSize: '9px', color: '#445', fontFamily: 'monospace'
    }).setOrigin(0.5);
    const help2 = this.add.text(cx, height - 35, '1-9: Seleccionar slot | R: Usar item | T: Chat', {
      fontSize: '9px', color: '#445', fontFamily: 'monospace'
    }).setOrigin(0.5);

    // Track name phase elements for hiding later
    this.nameElements = [namePrompt, nameBox, this.nameText, this.cursor, btn, help1, help2];

    // ── Room Browser (hidden initially) ─────────────────────────────
    this.roomContainer = this.add.container(0, 0).setVisible(false);
  }

  // ── Room Browser ────────────────────────────────────────────────────
  private showRoomBrowser() {
    localStorage.setItem('zombieland_name', this.nameInput);
    this.phase = 'rooms';

    // Hide name elements
    for (const el of this.nameElements) (el as any).setVisible(false);

    this.statusText.setText('Conectando...').setColor('#aaa');

    // Connect to server
    socketManager.connect();

    socketManager.on('_connected', () => {
      this.statusText.setText('');
      socketManager.listRooms();
    });

    socketManager.on('_disconnected', () => {
      this.statusText.setText('Desconectado del servidor').setColor('#cc4444');
    });

    socketManager.on('room_list', (rooms: RoomInfo[]) => {
      this.renderRooms(rooms);
    });

    socketManager.on('joined', (data: any) => {
      // Store joined data so GameScene can read existing players
      this.registry.set('joinedData', data);
      this.startGame();
    });

    socketManager.on('error_msg', (data: { message: string }) => {
      this.statusText.setText(data.message).setColor('#cc4444');
    });

    // If already connected (reconnect)
    if (socketManager.connected) {
      this.statusText.setText('');
      socketManager.listRooms();
    }
  }

  private renderRooms(rooms: RoomInfo[]) {
    // Clear old entries
    this.roomContainer.removeAll(true);
    this.roomEntries = [];
    this.roomContainer.setVisible(true);

    const { width } = this.scale;
    const cx = width / 2;
    let startY = this.scale.height / 2 - 30;

    const title = this.add.text(cx, startY - 35, 'ELEGIR SALA', {
      fontSize: '16px', color: '#88aacc', fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.roomContainer.add(title);

    // Render existing rooms
    for (const room of rooms) {
      const full = room.players >= room.max;
      const label = `${room.name}  [${room.players}/${room.max}]`;
      const entry = this.add.text(cx, startY, label, {
        fontSize: '13px',
        color: full ? '#555' : '#aaccaa',
        fontFamily: 'monospace',
      }).setOrigin(0.5);

      if (!full) {
        entry.setInteractive({ useHandCursor: true });
        entry.on('pointerover', () => entry.setColor('#66ff66'));
        entry.on('pointerout', () => entry.setColor('#aaccaa'));
        entry.on('pointerdown', () => this.joinRoom(room.name));
      }

      this.roomContainer.add(entry);
      this.roomEntries.push(entry);
      startY += 22;
    }

    // "New Room" button
    const newBtn = this.add.text(cx, startY + 10, '[ + CREAR SALA ]', {
      fontSize: '13px', color: '#3a8a3a', fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    newBtn.on('pointerover', () => newBtn.setColor('#55cc55'));
    newBtn.on('pointerout', () => newBtn.setColor('#3a8a3a'));
    newBtn.on('pointerdown', () => this.joinRoom(`Sala ${rooms.length + 1}`));
    this.roomContainer.add(newBtn);

    // Solo mode button
    const soloBtn = this.add.text(cx, startY + 40, '[ JUGAR SOLO ]', {
      fontSize: '13px', color: '#889', fontFamily: 'monospace',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    soloBtn.on('pointerover', () => soloBtn.setColor('#bbb'));
    soloBtn.on('pointerout', () => soloBtn.setColor('#889'));
    soloBtn.on('pointerdown', () => {
      socketManager.disconnect();
      this.startGame();
    });
    this.roomContainer.add(soloBtn);

    // Refresh
    const refreshBtn = this.add.text(cx, startY + 65, '↻ Actualizar', {
      fontSize: '10px', color: '#557', fontFamily: 'monospace',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    refreshBtn.on('pointerover', () => refreshBtn.setColor('#88aacc'));
    refreshBtn.on('pointerout', () => refreshBtn.setColor('#557'));
    refreshBtn.on('pointerdown', () => socketManager.listRooms());
    this.roomContainer.add(refreshBtn);
  }

  private joinRoom(roomName: string) {
    this.statusText.setText('Uniéndose...').setColor('#aaa');
    socketManager.joinRoom(this.nameInput, roomName);
  }

  private startGame() {
    this.canType = false;
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.time.delayedCall(400, () => this.scene.start('GameScene'));
  }
}
