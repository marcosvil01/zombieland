import Phaser from 'phaser';

/**
 * High-performance sprite generation using canvas.
 * All textures are created programmatically — no external files needed.
 */
export function generateTextures(scene: Phaser.Scene) {
  generateCharacter(scene, 'player', getRandomPlayerColors());
  generateCharacter(scene, 'zombie_slow', { skin: '#7a9e7e', shirt: '#4a5e3a', pants: '#3a3a2a', shoes: '#2a2a1a' });
  generateCharacter(scene, 'zombie_fast', { skin: '#8b5e5e', shirt: '#6e2c2c', pants: '#3a2020', shoes: '#1a0a0a' });
  generateBoss(scene);
  generateTiles(scene);
  generateProps(scene);
  generateProjectile(scene);
  generateVehicle(scene);
}

interface CharColors { skin: string; shirt: string; pants: string; shoes: string; }

function getRandomPlayerColors(): CharColors {
  const skins = ['#e0ac69', '#c68642', '#f1c27d', '#ffdbac'];
  const shirts = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c', '#0891b2'];
  const pants = ['#1e3a5f', '#374151', '#292524', '#1e293b'];
  return {
    skin: skins[Math.floor(Math.random() * skins.length)],
    shirt: shirts[Math.floor(Math.random() * shirts.length)],
    pants: pants[Math.floor(Math.random() * pants.length)],
    shoes: '#222'
  };
}

/**
 * Character spritesheet: 5 rows x 4 cols = 20 frames
 * Rows: down, left, right, up, attack
 * Cols: 4 walk cycle frames (frame 0 = idle)
 */
function generateCharacter(scene: Phaser.Scene, key: string, c: CharColors) {
  const W = 32, H = 48;
  const COLS = 4, ROWS = 5;
  const canvas = document.createElement('canvas');
  canvas.width = W * COLS;
  canvas.height = H * ROWS;
  const ctx = canvas.getContext('2d')!;

  // Rows 0-3: walk directions
  for (let dir = 0; dir < 4; dir++) {
    for (let f = 0; f < 4; f++) {
      drawChar(ctx, f * W, dir * H, W, H, c, dir, f, false);
    }
  }
  // Row 4: attack frames (facing down, but will be rotated in code)
  for (let f = 0; f < 4; f++) {
    drawChar(ctx, f * W, 4 * H, W, H, c, 0, f, true);
  }

  scene.textures.addSpriteSheet(key, canvas as any, { frameWidth: W, frameHeight: H });
}

function generateBoss(scene: Phaser.Scene) {
  const W = 64, H = 96, COLS = 4, ROWS = 5;
  const c: CharColors = { skin: '#5a3e5e', shirt: '#3e1a3e', pants: '#2a0a2a', shoes: '#1a001a' };
  const canvas = document.createElement('canvas');
  canvas.width = W * COLS;
  canvas.height = H * ROWS;
  const ctx = canvas.getContext('2d')!;
  for (let dir = 0; dir < 4; dir++) {
    for (let f = 0; f < 4; f++) {
      drawChar(ctx, f * W, dir * H, W, H, c, dir, f, false);
    }
  }
  for (let f = 0; f < 4; f++) {
    drawChar(ctx, f * W, 4 * H, W, H, c, 0, f, true);
  }
  scene.textures.addSpriteSheet('zombie_boss', canvas as any, { frameWidth: W, frameHeight: H });
}

function drawChar(
  ctx: CanvasRenderingContext2D, ox: number, oy: number,
  w: number, h: number, c: CharColors,
  dir: number, frame: number, attacking: boolean
) {
  const headW = Math.floor(w * 0.5);
  const headH = Math.floor(h * 0.25);
  const bodyW = Math.floor(w * 0.55);
  const bodyH = Math.floor(h * 0.3);
  const legW = Math.floor(w * 0.2);
  const legH = Math.floor(h * 0.25);
  const cx = ox + Math.floor(w / 2);
  const wobble = (frame % 2 === 0) ? 0 : (frame === 1 ? -1 : 1);
  const legMove = (frame % 2 === 0) ? 0 : (frame === 1 ? 3 : -3);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.ellipse(cx, oy + h - 2, w * 0.3, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs
  const legY = oy + headH + bodyH + 2;
  ctx.fillStyle = c.pants;
  ctx.fillRect(cx - legW - 2, legY + legMove, legW, legH);
  ctx.fillRect(cx + 2, legY - legMove, legW, legH);

  ctx.fillStyle = c.shoes;
  ctx.fillRect(cx - legW - 2, legY + legH - 3 + legMove, legW, 3);
  ctx.fillRect(cx + 2, legY + legH - 3 - legMove, legW, 3);

  // Body
  ctx.fillStyle = c.shirt;
  const bodyX = cx - Math.floor(bodyW / 2) + wobble;
  ctx.fillRect(bodyX, oy + headH, bodyW, bodyH);

  // Arms
  const armW = Math.max(4, Math.floor(w * 0.15));
  const armH = bodyH - 4;
  const armOff = (frame % 2 === 0) ? 0 : (frame === 1 ? 3 : -3);

  if (attacking) {
    // Attack pose: arm extended forward
    ctx.fillStyle = c.skin;
    const extLen = Math.floor(w * 0.4);
    if (dir === 0 || dir === 3) {
      ctx.fillRect(bodyX - armW, oy + headH + 4, armW, armH);
      ctx.fillRect(bodyX + bodyW, oy + headH - extLen + armH, armW, extLen);
    } else {
      ctx.fillRect(bodyX - armW - extLen, oy + headH + 4, armW + extLen, armW);
      ctx.fillRect(bodyX + bodyW, oy + headH + 4, armW, armH);
    }
  } else {
    ctx.fillStyle = c.skin;
    ctx.fillRect(bodyX - armW, oy + headH + 4 + armOff, armW, armH);
    ctx.fillRect(bodyX + bodyW, oy + headH + 4 - armOff, armW, armH);
  }

  // Head
  ctx.fillStyle = c.skin;
  const headX = cx - Math.floor(headW / 2) + wobble;
  ctx.fillRect(headX, oy + 2, headW, headH);

  // Hair
  ctx.fillStyle = '#2a1a0a';
  if (dir === 3) {
    ctx.fillRect(headX, oy, headW, headH);
  } else {
    ctx.fillRect(headX - 1, oy, headW + 2, 5);
  }

  // Eyes
  if (dir !== 3) {
    const eyeY = oy + 7;
    ctx.fillStyle = '#fff';
    if (dir === 0) {
      ctx.fillRect(headX + 3, eyeY, 3, 3);
      ctx.fillRect(headX + headW - 6, eyeY, 3, 3);
      ctx.fillStyle = '#111';
      ctx.fillRect(headX + 4, eyeY + 1, 2, 2);
      ctx.fillRect(headX + headW - 5, eyeY + 1, 2, 2);
    } else if (dir === 1) {
      ctx.fillRect(headX + 2, eyeY, 3, 3);
      ctx.fillStyle = '#111';
      ctx.fillRect(headX + 2, eyeY + 1, 2, 2);
    } else {
      ctx.fillRect(headX + headW - 5, eyeY, 3, 3);
      ctx.fillStyle = '#111';
      ctx.fillRect(headX + headW - 4, eyeY + 1, 2, 2);
    }
  }
}

function generateTiles(scene: Phaser.Scene) {
  const tiles: [string, string, string][] = [
    ['tile_grass', '#3a6b2e', '#4a7b3e'],
    ['tile_road', '#3a3a3a', '#333333'],
    ['tile_sidewalk', '#777', '#6a6a6a'],
    ['tile_floor', '#6b5b4b', '#7a6a5a'],
    ['tile_floor_hospital', '#88aabb', '#7799aa'],
    ['tile_floor_military', '#556655', '#4a5a4a'],
    ['tile_forest', '#2a4a1e', '#1e3a12'],
    ['tile_field', '#8a7a3a', '#9a8a4a'],
    ['tile_wall', '#555', '#4a4a4a'],
    ['tile_wall_military', '#4a5a4a', '#3a4a3a'],
    ['tile_roof', '#3a3a3a', '#2a2a2a'],
    ['tile_roof_hospital', '#4a6a8a', '#3a5a7a'],
    ['tile_roof_military', '#3a4a3a', '#2a3a2a'],
  ];
  tiles.forEach(([key, c1, c2]) => makeTile(scene, key, 32, c1, c2));
}

function makeTile(scene: Phaser.Scene, key: string, size: number, c1: string, c2: string) {
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = c1;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = c2;
  for (let i = 0; i < 15; i++) {
    ctx.fillRect(Math.random() * size | 0, Math.random() * size | 0, 2, 2);
  }
  scene.textures.addCanvas(key, canvas);
}

function generateProps(scene: Phaser.Scene) {
  // Tree
  const tc = document.createElement('canvas');
  tc.width = 32; tc.height = 48;
  const tctx = tc.getContext('2d')!;
  tctx.fillStyle = '#5a3a1a';
  tctx.fillRect(12, 28, 8, 20);
  tctx.fillStyle = '#2d5a1e';
  tctx.beginPath(); tctx.arc(16, 20, 14, 0, Math.PI * 2); tctx.fill();
  tctx.fillStyle = '#3a7a2e';
  tctx.beginPath(); tctx.arc(16, 16, 10, 0, Math.PI * 2); tctx.fill();
  scene.textures.addCanvas('prop_tree', tc);

  // Trash can
  const gc = document.createElement('canvas');
  gc.width = 16; gc.height = 20;
  const gctx = gc.getContext('2d')!;
  gctx.fillStyle = '#555';
  gctx.fillRect(2, 4, 12, 14); gctx.fillStyle = '#666'; gctx.fillRect(1, 2, 14, 4);
  scene.textures.addCanvas('prop_trashcan', gc);

  // Traffic light
  const tlc = document.createElement('canvas');
  tlc.width = 10; tlc.height = 40;
  const tlctx = tlc.getContext('2d')!;
  tlctx.fillStyle = '#333'; tlctx.fillRect(3, 0, 4, 40);
  tlctx.fillStyle = '#222'; tlctx.fillRect(0, 0, 10, 18);
  tlctx.fillStyle = '#cc0000'; tlctx.beginPath(); tlctx.arc(5, 5, 3, 0, Math.PI * 2); tlctx.fill();
  tlctx.fillStyle = '#cccc00'; tlctx.beginPath(); tlctx.arc(5, 11, 3, 0, Math.PI * 2); tlctx.fill();
  scene.textures.addCanvas('prop_trafficlight', tlc);

  // Bench
  const bc = document.createElement('canvas');
  bc.width = 28; bc.height = 12;
  const bctx = bc.getContext('2d')!;
  bctx.fillStyle = '#8B4513'; bctx.fillRect(0, 2, 28, 6);
  bctx.fillStyle = '#5a3010'; bctx.fillRect(2, 8, 4, 4); bctx.fillRect(22, 8, 4, 4);
  scene.textures.addCanvas('prop_bench', bc);
}

function generateProjectile(scene: Phaser.Scene) {
  const c = document.createElement('canvas');
  c.width = 6; c.height = 6;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#ffcc00';
  ctx.beginPath(); ctx.arc(3, 3, 3, 0, Math.PI * 2); ctx.fill();
  scene.textures.addCanvas('bullet', c);
}

function generateVehicle(scene: Phaser.Scene) {
  const c = document.createElement('canvas');
  c.width = 48; c.height = 32;
  const ctx = c.getContext('2d')!;
  // Car body
  ctx.fillStyle = '#3355aa';
  ctx.fillRect(4, 4, 40, 24);
  // Windows
  ctx.fillStyle = '#88bbee';
  ctx.fillRect(8, 6, 14, 10);
  ctx.fillRect(26, 6, 14, 10);
  // Wheels
  ctx.fillStyle = '#222';
  ctx.fillRect(6, 0, 10, 5); ctx.fillRect(6, 27, 10, 5);
  ctx.fillRect(32, 0, 10, 5); ctx.fillRect(32, 27, 10, 5);
  // Headlights
  ctx.fillStyle = '#ffee55';
  ctx.fillRect(42, 8, 4, 4); ctx.fillRect(42, 20, 4, 4);
  scene.textures.addCanvas('vehicle_car', c);
}
