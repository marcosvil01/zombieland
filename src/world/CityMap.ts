import Phaser from 'phaser';

const TILE = 16;
const MAP_W = 200;
const MAP_H = 260; // Extended for underground bunker area (rows 200-260)
export const MAP_PX_W = MAP_W * TILE;
export const MAP_PX_H = MAP_H * TILE;

export interface BuildingInfo {
  x: number; y: number; w: number; h: number;
  label: string;
  roofTiles: Phaser.GameObjects.Image[];
  zone: Phaser.Geom.Rectangle;
}

export interface PropInfo {
  sprite: Phaser.GameObjects.Image;
  type: string;
  searched: boolean;
  x: number; y: number;
}

export interface CarInfo {
  sprite: Phaser.GameObjects.Image;
  body: Phaser.Physics.Arcade.Sprite;
  x: number; y: number;
}

export interface MapData {
  walls: Phaser.Physics.Arcade.StaticGroup;
  buildings: BuildingInfo[];
  props: PropInfo[];
  cars: CarInfo[];
}

/* ────────────────────────────────────────────
   BUILDING DEFINITIONS (organic placement)
   ──────────────────────────────────────────── */
interface BDef {
  tx: number; ty: number; tw: number; th: number;
  label: string;
  style?: 'gray' | 'beige' | 'dark' | 'white';
  ruined?: boolean;
}

const BUILDINGS: BDef[] = [
  // ── NW: Military compound (fenced, bunker entrance inside) ──
  { tx: 14, ty: 13, tw: 44, th: 28, label: 'BASE MILITAR', style: 'dark' },
  { tx: 30, ty: 20, tw: 12, th: 8, label: 'BÚNKER', style: 'dark' },

  // ── NE: Hospital + Labs ──
  { tx: 130, ty: 14, tw: 30, th: 20, label: 'HOSPITAL', style: 'white' },
  { tx: 168, ty: 14, tw: 14, th: 10, label: 'LABORATORIO', style: 'white' },
  { tx: 110, ty: 16, tw: 12, th: 10, label: 'APARTAMENTOS', style: 'beige' },

  // ── Middle-West: Residential (between roads) — varied styles & sizes ──
  { tx: 14, ty: 56, tw: 8, th: 6, label: 'CASA', style: 'beige' },
  { tx: 26, ty: 55, tw: 12, th: 8, label: 'CASA', style: 'white' },
  { tx: 14, ty: 69, tw: 12, th: 10, label: 'IGLESIA', style: 'white' },
  { tx: 30, ty: 70, tw: 8, th: 10, label: 'TALLER', style: 'gray' },

  // ── Center-North: Police & Supermarket (along main ave) ──
  { tx: 62, ty: 54, tw: 22, th: 16, label: 'COMISARÍA', style: 'gray' },
  { tx: 106, ty: 54, tw: 26, th: 18, label: 'SUPERMERCADO', style: 'gray' },

  // ── East-Middle: Commercial / Industrial ──
  { tx: 148, ty: 56, tw: 14, th: 10, label: 'FÁBRICA', style: 'dark' },
  { tx: 170, ty: 58, tw: 14, th: 12, label: 'ALMACÉN ESTE', style: 'dark' },
  { tx: 148, ty: 72, tw: 10, th: 8, label: 'CAFETERÍA', style: 'beige' },
  { tx: 164, ty: 73, tw: 8, th: 6, label: 'PELUQUERÍA', style: 'white' },

  // ── Center row: Shops ──
  { tx: 14, ty: 100, tw: 12, th: 8, label: 'FARMACIA', style: 'white' },
  { tx: 30, ty: 101, tw: 10, th: 8, label: 'TIENDA', style: 'beige' },
  // Gas station is special - not in this list
  { tx: 120, ty: 100, tw: 10, th: 8, label: 'PANADERÍA', style: 'beige' },
  { tx: 136, ty: 100, tw: 10, th: 10, label: 'BIBLIOTECA', style: 'white' },
  { tx: 170, ty: 100, tw: 10, th: 8, label: 'CABAÑA', style: 'gray', ruined: true },

  // ── Residential rows — each CASA has unique size/style ──
  { tx: 50, ty: 130, tw: 12, th: 8, label: 'CASA', style: 'white' },
  { tx: 66, ty: 132, tw: 8, th: 6, label: 'CASA', style: 'gray' },
  { tx: 78, ty: 131, tw: 10, th: 10, label: 'LAVANDERÍA', style: 'beige' },
  { tx: 110, ty: 130, tw: 12, th: 10, label: 'CASA', style: 'beige' },
  { tx: 134, ty: 130, tw: 14, th: 10, label: 'ALMACÉN', style: 'gray' },
  { tx: 154, ty: 131, tw: 8, th: 8, label: 'CASA', style: 'dark' },
  { tx: 170, ty: 130, tw: 10, th: 6, label: 'CASA', style: 'white', ruined: true },

  // ── South ──
  { tx: 14, ty: 147, tw: 16, th: 12, label: 'ESCUELA', style: 'white' },
  { tx: 50, ty: 148, tw: 10, th: 10, label: 'CASA', style: 'gray' },
  { tx: 64, ty: 149, tw: 8, th: 6, label: 'CASA', style: 'beige', ruined: true },
  { tx: 100, ty: 147, tw: 14, th: 10, label: 'BAR', style: 'dark' },
  { tx: 118, ty: 148, tw: 12, th: 8, label: 'CASA', style: 'white' },
  { tx: 170, ty: 147, tw: 14, th: 10, label: 'CEMENTERIO', style: 'gray', ruined: true },

  // ── Deep south ──
  { tx: 14, ty: 168, tw: 18, th: 14, label: 'ALMACÉN GRANDE', style: 'dark' },
  { tx: 50, ty: 170, tw: 8, th: 6, label: 'CASA', style: 'beige' },
  { tx: 62, ty: 169, tw: 10, th: 8, label: 'BOMBEROS', style: 'dark' },
  { tx: 100, ty: 169, tw: 12, th: 10, label: 'RUINAS', style: 'gray', ruined: true },
  { tx: 140, ty: 168, tw: 14, th: 10, label: 'GARAJE', style: 'dark' },
  { tx: 170, ty: 170, tw: 12, th: 8, label: 'CABAÑA', style: 'dark', ruined: true },

  // ── Extra police south ──
  { tx: 14, ty: 118, tw: 14, th: 10, label: 'COMISARÍA SUR', style: 'gray' },
];

/* ────────────────────────────────────────────
   ROAD NETWORK
   ──────────────────────────────────────────── */
interface RoadSegment { x: number; y: number; w: number; h: number; }

// ── Main roads: 2 highways + side streets (NOT a grid) ──
const H_ROADS: RoadSegment[] = [
  // Main east-west highway (jogs around center to avoid buildings)
  { x: 8, y: 88, w: 52, h: 5 },     // Highway west segment
  { x: 60, y: 86, w: 78, h: 5 },    // Highway center (jogged 2 tiles north)
  { x: 138, y: 88, w: 54, h: 5 },   // Highway east segment
  // Side streets (shorter, don't span full map)
  { x: 12, y: 48, w: 30, h: 4 },    // NW residential street
  { x: 125, y: 40, w: 55, h: 4 },   // NE hospital access road
  { x: 12, y: 125, w: 50, h: 4 },   // SW residential
  { x: 100, y: 125, w: 55, h: 4 },  // SE connector
  { x: 35, y: 162, w: 120, h: 4 },  // Southern ring road
];

// Vertical roads (asymmetric, not all full-length)
const V_ROADS: RoadSegment[] = [
  // Main north-south avenue
  { x: 88, y: 8, w: 5, h: 78 },     // Avenue north (to highway)
  { x: 88, y: 93, w: 5, h: 99 },    // Avenue south (from highway down)
  // Short connectors (NOT full-length columns)
  { x: 40, y: 48, w: 4, h: 40 },    // West connector: NW street → highway
  { x: 148, y: 40, w: 4, h: 48 },   // East connector: NE access → highway
  { x: 60, y: 86, w: 4, h: 6 },     // Highway west jog connector (vertical fill)
  { x: 138, y: 86, w: 4, h: 6 },    // Highway east jog connector (vertical fill)
  { x: 50, y: 125, w: 4, h: 37 },   // SW street down to southern road
  { x: 148, y: 125, w: 4, h: 37 },  // SE street down to southern road
];

/* ────────────────────────────────────────────
   MAIN BUILDER
   ──────────────────────────────────────────── */
export function buildCityMap(scene: Phaser.Scene): MapData {
  scene.physics.world.setBounds(0, 0, MAP_PX_W, MAP_PX_H);

  // Ground
  scene.add.tileSprite(MAP_PX_W / 2, MAP_PX_H / 2, MAP_PX_W, MAP_PX_H, 'bg_tileset_sh', 0).setDepth(-2);

  const walls = scene.physics.add.staticGroup();
  const buildings: BuildingInfo[] = [];
  const props: PropInfo[] = [];
  const cars: CarInfo[] = [];

  // 1. Roads
  drawRoads(scene);

  // 2. Buildings
  for (const b of BUILDINGS) {
    buildings.push(createBuilding(scene, walls, b));
  }

  // 3. Gas station (special compound) — placed between NW street and highway
  buildings.push(...createGasStation(scene, walls, 62, 95));

  // 4. Park / plaza
  createPark(scene, walls, props, 110, 72, 20, 16);

  // 5. Forest (border + interior patches)
  spawnForest(scene, walls);

  // 6. Props along roads & near buildings
  spawnRoadProps(scene, walls);
  spawnBuildingProps(scene, walls, props, buildings);
  spawnScatteredProps(scene, walls);

  // 7. Ground items
  spawnGroundItems(scene, props);

  // 8. Vehicles
  spawnVehicles(scene, walls, cars);

  // 9. Underground bunker
  buildBunkerUnderground(scene, walls, props);

  // 10. Ambient decorations (barrel fires, blood stains)
  spawnAmbientDecor(scene);

  return { walls, buildings, props, cars };
}

/* ────────────────────────────────────────────
   ROADS
   ──────────────────────────────────────────── */
function drawRoads(scene: Phaser.Scene) {
  // Sidewalks (wider, lighter)
  for (const r of H_ROADS) {
    scene.add.tileSprite(
      (r.x + r.w / 2) * TILE, (r.y + r.h / 2) * TILE,
      (r.w + 2) * TILE, (r.h + 2) * TILE,
      'bld_gray_sh', 10
    ).setDepth(-1.5);
  }
  for (const r of V_ROADS) {
    scene.add.tileSprite(
      (r.x + r.w / 2) * TILE, (r.y + r.h / 2) * TILE,
      (r.w + 2) * TILE, (r.h + 2) * TILE,
      'bld_gray_sh', 10
    ).setDepth(-1.5);
  }

  // Asphalt
  for (const r of H_ROADS) {
    const cx = (r.x + r.w / 2) * TILE;
    const cy = (r.y + r.h / 2) * TILE;
    scene.add.rectangle(cx, cy, r.w * TILE, r.h * TILE, 0x222222).setDepth(-1);
    // Dashed center line
    for (let ix = r.x * TILE; ix < (r.x + r.w) * TILE; ix += 36) {
      scene.add.rectangle(ix + 9, cy, 14, 2, 0xcccc44, 0.4).setDepth(-0.9);
    }
  }
  for (const r of V_ROADS) {
    const cx = (r.x + r.w / 2) * TILE;
    const cy = (r.y + r.h / 2) * TILE;
    scene.add.rectangle(cx, cy, r.w * TILE, r.h * TILE, 0x222222).setDepth(-1);
    for (let iy = r.y * TILE; iy < (r.y + r.h) * TILE; iy += 36) {
      scene.add.rectangle(cx, iy + 9, 2, 14, 0xcccc44, 0.4).setDepth(-0.9);
    }
  }

  // Manholes at intersections (only where roads actually overlap)
  const allRoads = [...H_ROADS, ...V_ROADS];
  for (const hr of H_ROADS) {
    for (const vr of V_ROADS) {
      // Check if they actually overlap
      const hLeft = hr.x, hRight = hr.x + hr.w, hTop = hr.y, hBottom = hr.y + hr.h;
      const vLeft = vr.x, vRight = vr.x + vr.w, vTop = vr.y, vBottom = vr.y + vr.h;
      if (hRight <= vLeft || vRight <= hLeft || hBottom <= vTop || vBottom <= hTop) continue;
      const mx = (vr.x + vr.w / 2) * TILE;
      const my = (hr.y + hr.h / 2) * TILE;
      scene.add.image(mx, my, 'manhole').setDepth(-0.8).setScale(1.2);
    }
  }

  // ── Post-apocalyptic road damage ──
  // Cracks & potholes scattered on road surfaces
  for (const r of allRoads) {
    const roadPxX = r.x * TILE;
    const roadPxY = r.y * TILE;
    const roadPxW = r.w * TILE;
    const roadPxH = r.h * TILE;
    // Potholes (dark circles)
    const potholeCount = Math.floor(r.w * r.h / 60);
    for (let i = 0; i < potholeCount; i++) {
      const px = roadPxX + Phaser.Math.Between(8, roadPxW - 8);
      const py = roadPxY + Phaser.Math.Between(4, roadPxH - 4);
      const radius = Phaser.Math.Between(2, 5);
      scene.add.circle(px, py, radius, 0x111111, 0.6).setDepth(-0.95);
    }
    // Crack lines (thin dark rectangles at angles)
    const crackCount = Math.floor(r.w * r.h / 100);
    for (let i = 0; i < crackCount; i++) {
      const px = roadPxX + Phaser.Math.Between(4, roadPxW - 4);
      const py = roadPxY + Phaser.Math.Between(2, roadPxH - 2);
      const len = Phaser.Math.Between(6, 20);
      const angle = Phaser.Math.Between(-40, 40);
      scene.add.rectangle(px, py, len, 1, 0x0a0a0a, 0.5).setDepth(-0.95).setAngle(angle);
    }
    // Road debris patches (CP tileset frames as damaged asphalt texture)
    const debrisCount = Math.floor(r.w * r.h / 150);
    for (let i = 0; i < debrisCount; i++) {
      const px = roadPxX + Phaser.Math.Between(8, roadPxW - 8);
      const py = roadPxY + Phaser.Math.Between(4, roadPxH - 4);
      // Use CP city tileset frames with dark tint for damaged asphalt patches
      const frame = Phaser.Math.Between(0, 15); // First row of tileset (ground tiles)
      scene.add.image(px, py, 'cp_city_sh', frame)
        .setDepth(-0.93).setAlpha(0.25).setTint(0x222222).setScale(Phaser.Math.FloatBetween(0.8, 1.2));
    }
  }

  // Faded road edge markings (white dashes for lane edges, worn out)
  for (const r of H_ROADS) {
    const topEdge = r.y * TILE + 4;
    const bottomEdge = (r.y + r.h) * TILE - 4;
    for (let ix = r.x * TILE; ix < (r.x + r.w) * TILE; ix += Phaser.Math.Between(24, 48)) {
      if (Math.random() > 0.6) continue; // Some markings worn away
      scene.add.rectangle(ix, topEdge, 10, 1, 0x999999, 0.2).setDepth(-0.92);
      scene.add.rectangle(ix, bottomEdge, 10, 1, 0x999999, 0.2).setDepth(-0.92);
    }
  }
}

/* ────────────────────────────────────────────
   BUILDINGS
   ──────────────────────────────────────────── */
function createBuilding(scene: Phaser.Scene, walls: Phaser.Physics.Arcade.StaticGroup, b: BDef): BuildingInfo {
  const px = b.tx * TILE;
  const py = b.ty * TILE;
  const pw = b.tw * TILE;
  const ph = b.th * TILE;

  // Multiple floor frames per style for variety (edge vs center vs accent)
  const floorStyles: Record<string, { set: string; center: number[]; edge: number[]; accent: number[] }> = {
    gray:  { set: 'bld_gray_sh',  center: [24, 25], edge: [16, 17], accent: [8, 10] },
    beige: { set: 'bld_beige_sh', center: [14, 15], edge: [6, 7],  accent: [22, 23] },
    dark:  { set: 'bld_dark_sh',  center: [8, 9],   edge: [0, 1],  accent: [16, 17] },
    white: { set: 'bld_white_sh', center: [14, 15], edge: [6, 7],  accent: [22, 23] },
  };
  const fs = floorStyles[b.style || 'gray'];

  // Floor tiles with edge/center/accent variation
  for (let fx = 0; fx < b.tw; fx++) {
    for (let fy = 0; fy < b.th; fy++) {
      const isEdge = fx <= 1 || fx >= b.tw - 2 || fy <= 1 || fy >= b.th - 2;
      const isCorner = (fx <= 1 && fy <= 1) || (fx >= b.tw - 2 && fy <= 1) ||
                       (fx <= 1 && fy >= b.th - 2) || (fx >= b.tw - 2 && fy >= b.th - 2);
      let frame: number;
      if (isCorner) {
        frame = fs.accent[Math.floor(Math.random() * fs.accent.length)];
      } else if (isEdge) {
        frame = fs.edge[Math.floor(Math.random() * fs.edge.length)];
      } else {
        // Center with occasional accent tile for visual variety
        frame = Math.random() < 0.12
          ? fs.accent[Math.floor(Math.random() * fs.accent.length)]
          : fs.center[Math.floor(Math.random() * fs.center.length)];
      }
      scene.add.image(px + fx * TILE + TILE / 2, py + fy * TILE + TILE / 2, fs.set, frame).setDepth(0);
    }
  }

  // Interior props (sparse, context-aware by building type)
  const interiorDensity = b.label === 'SUPERMERCADO' ? 0.07 :
    (b.label.includes('FÁBRICA') || b.label.includes('ALMACÉN') ? 0.06 :
    (b.ruined ? 0.08 : 0.04));
  for (let fx = 2; fx < b.tw - 2; fx++) {
    for (let fy = 2; fy < b.th - 2; fy++) {
      if (Math.random() > interiorDensity) continue;
      const ix = px + fx * TILE + TILE / 2;
      const iy = py + fy * TILE + TILE / 2;
      let pKey: string;
      if (b.label === 'SUPERMERCADO' || b.label === 'TIENDA' || b.label === 'PANADERÍA') {
        pKey = Phaser.Utils.Array.GetRandom(['shopping_cart', 'refrigerator', 'barrel_blue', 'garbage_bin_1']);
      } else if (b.label.includes('FÁBRICA') || b.label.includes('ALMACÉN') || b.label === 'GARAJE') {
        pKey = Phaser.Utils.Array.GetRandom(['barrel_blue', 'barrel_red', 'pallet', 'iron_beam', 'metal_plates']);
      } else if (b.label.includes('MILITAR') || b.label === 'COMISARÍA' || b.label === 'COMISARÍA SUR') {
        pKey = Phaser.Utils.Array.GetRandom(['barrel_blue', 'metal_plates', 'pallet']);
      } else if (b.label === 'HOSPITAL' || b.label === 'FARMACIA') {
        pKey = Phaser.Utils.Array.GetRandom(['refrigerator', 'washing_machine', 'garbage_bin_1']);
      } else if (b.label === 'TALLER' || b.label === 'BOMBEROS') {
        pKey = Phaser.Utils.Array.GetRandom(['barrel_red', 'tire', 'tire_grass', 'iron_beam', 'metal_plates', 'pallet']);
      } else if (b.label === 'LAVANDERÍA') {
        pKey = Phaser.Utils.Array.GetRandom(['washing_machine', 'washing_machine', 'barrel_blue', 'garbage_bin_1']);
      } else if (b.label === 'BIBLIOTECA') {
        pKey = Phaser.Utils.Array.GetRandom(['bench_down', 'cardboard_1', 'garbage_bin_1']);
      } else if (b.label === 'PELUQUERÍA' || b.label === 'CAFETERÍA') {
        pKey = Phaser.Utils.Array.GetRandom(['bench_down', 'trashcan_1', 'garbage_bin_1']);
      } else if (b.ruined) {
        pKey = Phaser.Utils.Array.GetRandom(['gray_brick_debris', 'destroyed_wall', 'cardboard_1', 'trash_bag_1']);
      } else {
        // Generic residential: more furniture-like items
        pKey = Phaser.Utils.Array.GetRandom(['bench_down', 'trashcan_1', 'cardboard_1', 'garbage_bin_1', 'washing_machine']);
      }
      scene.add.image(ix, iy, pKey).setDepth(1).setScale(1.1);
    }
  }

  // Walls with corner/side variation
  const doorStart = Math.floor(b.tw / 2) - 2;
  const doorEnd = doorStart + 4;
  const wallFrames = { corner: 0, hSide: 5, vSide: 5 }; // Different frames for corners vs sides

  for (let tx = 0; tx < b.tw; tx++) {
    for (let ty = 0; ty < b.th; ty++) {
      const isEdge = tx === 0 || tx === b.tw - 1 || ty === 0 || ty === b.th - 1;
      if (!isEdge) continue;
      if (ty === b.th - 1 && tx >= doorStart && tx < doorEnd) continue;

      const wx = px + tx * TILE + TILE / 2;
      const wy = py + ty * TILE + TILE / 2;

      // Ruined buildings have gaps & debris
      if (b.ruined && Math.random() < 0.15) {
        scene.add.image(wx, wy, 'gray_brick_debris').setDepth(1).setScale(0.9);
        continue;
      }

      // Corner vs edge wall frames
      const isCorner = (tx === 0 || tx === b.tw - 1) && (ty === 0 || ty === b.th - 1);
      const wFrame = isCorner ? wallFrames.corner : wallFrames.hSide;
      scene.add.image(wx, wy, 'walls_tileset_sh', wFrame).setDepth(1);

      // Random cracks/stains on walls (subtle variation)
      if (!isCorner && Math.random() < 0.08) {
        scene.add.image(wx, wy, 'walls_tileset_sh', wFrame === 5 ? 3 : 1)
          .setDepth(1.1).setAlpha(0.4).setTint(0x888888);
      }

      // Windows on horizontal walls
      if ((ty === 0 || ty === b.th - 1) && tx > 1 && tx < b.tw - 2 && tx % 3 === 1) {
        const winKey = b.ruined
          ? (Math.random() > 0.3 ? 'window_broken' : 'window_boarded')
          : (Math.random() > 0.3 ? 'window_normal' : 'window_broken');
        scene.add.image(wx, wy, winKey).setDepth(1.5);
      }
      // Windows on vertical walls
      if ((tx === 0 || tx === b.tw - 1) && ty > 1 && ty < b.th - 2 && ty % 3 === 1) {
        const winKey = b.ruined
          ? (Math.random() > 0.3 ? 'window_broken' : 'window_boarded')
          : (Math.random() > 0.3 ? 'window_normal' : 'window_broken');
        scene.add.image(wx, wy, winKey).setDepth(1.5);
      }

      const w = walls.create(wx, wy) as Phaser.Physics.Arcade.Sprite;
      w.setVisible(false);
      w.body!.setSize(TILE, TILE);
      w.refreshBody();
    }
  }

  // Door
  const doorX = px + (doorStart + 2) * TILE;
  const doorY = py + b.th * TILE - TILE / 2;
  const doorKey = b.ruined ? 'door_ajar'
    : (b.style === 'dark' ? 'door_metal' : 'door_beige');
  scene.add.image(doorX, doorY, doorKey).setDepth(1.5);

  // Label
  scene.add.text(px + pw / 2, py + ph + 6, b.label, {
    fontSize: '8px', color: '#fff', fontFamily: 'monospace', fontStyle: 'bold',
    backgroundColor: 'rgba(0,0,0,0.7)', padding: { x: 3, y: 1 }
  }).setOrigin(0.5).setDepth(12);

  // Roof with edge/center variation + per-building tint
  const roofTiles: Phaser.GameObjects.Image[] = [];
  const roofBase = b.style === 'white' ? 4 : (b.style === 'dark' ? 8 : (b.style === 'beige' ? 2 : 0));
  const roofEdge = roofBase + 1; // Slightly different frame for edges

  // Unique roof tint per building (seeded from position for consistency)
  const roofTints = [0xffffff, 0xddccbb, 0xbbccdd, 0xccbbaa, 0xaabbcc, 0xddddbb, 0xbbbbdd, 0xccddcc];
  const roofTint = roofTints[(b.tx + b.ty * 3) % roofTints.length];

  for (let ty = 0; ty < b.th; ty++) {
    for (let tx = 0; tx < b.tw; tx++) {
      if (b.ruined && Math.random() < 0.12) continue;
      const isRoofEdge = tx === 0 || tx === b.tw - 1 || ty === 0 || ty === b.th - 1;
      const rf = isRoofEdge ? roofEdge : roofBase;
      const img = scene.add.image(px + tx * TILE + TILE / 2, py + ty * TILE + TILE / 2, 'roof_tileset_sh', rf).setDepth(10).setTint(roofTint);
      roofTiles.push(img);
    }
  }

  const zone = new Phaser.Geom.Rectangle(px - TILE * 2, py - TILE * 2, pw + TILE * 4, ph + TILE * 4);

  // Exterior decorations for residential buildings (gardens, fences)
  const isResidential = b.label === 'CASA' || b.label === 'CABAÑA';
  if (isResidential && !b.ruined) {
    // Garden patch behind or to the side of the house
    const gardenSide = (b.tx + b.ty) % 2 === 0; // half left, half behind
    if (gardenSide) {
      // Side garden (right of building)
      for (let gx = 0; gx < 3; gx++) {
        for (let gy = 0; gy < Math.min(b.th, 6); gy++) {
          const x = px + pw + gx * TILE + TILE / 2 + 4;
          const y = py + gy * TILE + TILE / 2;
          if (Math.random() < 0.5) {
            scene.add.image(x, y, Math.random() > 0.5 ? 'grass_patch' : 'grass_2').setDepth(-1.5).setScale(1.1).setAlpha(0.8);
          }
          if (Math.random() < 0.15) {
            scene.add.image(x, y, Phaser.Utils.Array.GetRandom(['bush_1', 'bush_2'])).setDepth(2).setScale(0.9);
          }
        }
      }
    } else {
      // Back garden (behind building)
      for (let gx = 0; gx < Math.min(b.tw, 8); gx++) {
        for (let gy = 0; gy < 2; gy++) {
          const x = px + gx * TILE + TILE / 2;
          const y = py - (gy + 1) * TILE - TILE / 2;
          if (Math.random() < 0.5) {
            scene.add.image(x, y, Math.random() > 0.5 ? 'grass_patch' : 'grass_2').setDepth(-1.5).setScale(1.1).setAlpha(0.8);
          }
          if (Math.random() < 0.2) {
            scene.add.image(x, y, Phaser.Utils.Array.GetRandom(['bush_1', 'bush_2'])).setDepth(2).setScale(0.9);
          }
        }
      }
    }
    // Small tree next to house (50% chance)
    if (Math.random() < 0.5) {
      const treeX = px + (gardenSide ? pw + 20 : Phaser.Math.Between(10, pw - 10));
      const treeY = gardenSide ? py + Phaser.Math.Between(0, ph) : py - TILE * 2;
      const treeKey = Phaser.Utils.Array.GetRandom(['tree_3', 'tree_smalloak2', 'tree_birch']);
      scene.add.image(treeX, treeY, treeKey).setDepth(3).setScale(1.2);
    }
  }

  return { x: px, y: py, w: pw, h: ph, label: b.label, roofTiles, zone };
}

/* ────────────────────────────────────────────
   GAS STATION (canopy + shop)
   ──────────────────────────────────────────── */
function createGasStation(scene: Phaser.Scene, walls: Phaser.Physics.Arcade.StaticGroup, tx: number, ty: number): BuildingInfo[] {
  const results: BuildingInfo[] = [];

  // ── SHOP (enclosed building, 8×6) ──
  const shopDef: BDef = { tx, ty: ty + 1, tw: 8, th: 6, label: 'TIENDA GAS', style: 'beige' };
  results.push(createBuilding(scene, walls, shopDef));

  // ── CANOPY (open structure, 14×7) ──
  const canopyTx = tx + 10;
  const canopyTy = ty;
  const canopyW = 14;
  const canopyH = 7;
  const cpx = canopyTx * TILE;
  const cpy = canopyTy * TILE;

  // Canopy floor (dark concrete)
  for (let fx = 0; fx < canopyW; fx++) {
    for (let fy = 0; fy < canopyH; fy++) {
      scene.add.image(cpx + fx * TILE + TILE / 2, cpy + fy * TILE + TILE / 2, 'bld_dark_sh', 8).setDepth(0);
    }
  }

  // 6 Pillars (2 rows of 3) with collision
  const pillarCols = [0, Math.floor(canopyW / 2), canopyW - 1];
  const pillarRows = [0, canopyH - 1];
  for (const pc of pillarCols) {
    for (const pr of pillarRows) {
      const wx = cpx + pc * TILE + TILE / 2;
      const wy = cpy + pr * TILE + TILE / 2;
      scene.add.image(wx, wy, 'walls_tileset_sh', 5).setDepth(1);
      const w = walls.create(wx, wy) as Phaser.Physics.Arcade.Sprite;
      w.setVisible(false);
      w.body!.setSize(TILE, TILE);
      w.refreshBody();
    }
  }

  // Fuel pumps (3, in a row) with collision
  for (let i = 0; i < 3; i++) {
    const fpx = cpx + (3 + i * 4) * TILE + TILE / 2;
    const fpy = cpy + Math.floor(canopyH / 2) * TILE + TILE / 2;
    scene.add.image(fpx, fpy, 'barrel_red').setDepth(2).setScale(1.3);
    scene.add.image(fpx, fpy - 10, 'barrel_red').setDepth(2).setScale(0.8).setTint(0xffcc00);
    const w = walls.create(fpx, fpy) as Phaser.Physics.Arcade.Sprite;
    w.setVisible(false);
    w.body!.setSize(10, 10);
    w.refreshBody();
  }

  // Canopy roof tiles
  const roofTiles: Phaser.GameObjects.Image[] = [];
  for (let ry = 0; ry < canopyH; ry++) {
    for (let rx = 0; rx < canopyW; rx++) {
      const img = scene.add.image(cpx + rx * TILE + TILE / 2, cpy + ry * TILE + TILE / 2, 'roof_tileset_sh', 2).setDepth(10).setAlpha(0.85);
      roofTiles.push(img);
    }
  }

  // Label
  scene.add.text(cpx + canopyW * TILE / 2, cpy + canopyH * TILE + 6, 'GASOLINERA', {
    fontSize: '8px', color: '#ffcc00', fontFamily: 'monospace', fontStyle: 'bold',
    backgroundColor: 'rgba(0,0,0,0.7)', padding: { x: 3, y: 1 }
  }).setOrigin(0.5).setDepth(12);

  const zone = new Phaser.Geom.Rectangle(cpx - TILE * 2, cpy - TILE * 2, canopyW * TILE + TILE * 4, canopyH * TILE + TILE * 4);
  results.push({ x: cpx, y: cpy, w: canopyW * TILE, h: canopyH * TILE, label: 'GASOLINERA', roofTiles, zone });

  return results;
}

/* ────────────────────────────────────────────
   PARK / PLAZA
   ──────────────────────────────────────────── */
function createPark(scene: Phaser.Scene, walls: Phaser.Physics.Arcade.StaticGroup, props: PropInfo[], tx: number, ty: number, tw: number, th: number) {
  const px = tx * TILE;
  const py = ty * TILE;

  // Dirt / light-green ground for park
  for (let fx = 0; fx < tw; fx++) {
    for (let fy = 0; fy < th; fy++) {
      if (Math.random() < 0.3) {
        scene.add.image(px + fx * TILE + TILE / 2, py + fy * TILE + TILE / 2, 'grass_patch').setDepth(-1.5).setScale(1.1).setAlpha(0.7);
      }
      if (Math.random() < 0.15) {
        scene.add.image(px + fx * TILE + TILE / 2, py + fy * TILE + TILE / 2, 'grass_2').setDepth(-1.5).setScale(1.1).setAlpha(0.6);
      }
    }
  }

  // Park trees (with collision)
  const treeKeys = ['tree_3', 'tree_birch', 'tree_birch2', 'tree_smalloak2'];
  for (let i = 0; i < 12; i++) {
    const x = px + Phaser.Math.Between(2, tw - 2) * TILE;
    const y = py + Phaser.Math.Between(2, th - 2) * TILE;
    const key = Phaser.Utils.Array.GetRandom(treeKeys);
    scene.add.image(x, y, key).setDepth(3).setScale(1.4);
    addCollision(walls, x, y + 8, 8, 6);
  }

  // Benches along edges (with collision)
  for (let i = 0; i < 6; i++) {
    const bx = px + Phaser.Math.Between(1, tw - 1) * TILE;
    const by = i < 3 ? py + TILE : py + (th - 1) * TILE;
    scene.add.image(bx, by, Math.random() > 0.3 ? 'bench_down' : 'bench_overgrown').setDepth(2).setScale(1.3);
    addCollision(walls, bx, by, 14, 6);
  }

  // Trash cans in park (searchable, with collision)
  for (let i = 0; i < 3; i++) {
    const x = px + Phaser.Math.Between(3, tw - 3) * TILE;
    const y = py + Phaser.Math.Between(3, th - 3) * TILE;
    const spr = scene.add.image(x, y, 'trashcan_1').setDepth(2).setScale(1.3);
    addCollision(walls, x, y, 8, 8);
    props.push({ sprite: spr, type: 'trashcan', searched: false, x, y });
  }

  // A few rocks
  for (let i = 0; i < 4; i++) {
    const x = px + Phaser.Math.Between(1, tw - 1) * TILE;
    const y = py + Phaser.Math.Between(1, th - 1) * TILE;
    scene.add.image(x, y, 'rock_grass').setDepth(2).setScale(1.2);
    addCollision(walls, x, y, 10, 8);
  }

  // Street light at park entrance
  scene.add.image(px + tw * TILE / 2, py - TILE, 'streetlight_down').setDepth(3).setScale(1.4);
  addCollision(walls, px + tw * TILE / 2, py - TILE + 8, 6, 6);
}

/* ────────────────────────────────────────────
   FOREST
   ──────────────────────────────────────────── */
function spawnForest(scene: Phaser.Scene, walls: Phaser.Physics.Arcade.StaticGroup) {
  const allTreeKeys = ['tree_1', 'tree_2', 'tree_3', 'tree_big', 'tree_pine', 'tree_birch', 'tree_birch2', 'tree_sparse', 'tree_smalloak2'];
  const bushKeys = ['bush_1', 'bush_2'];

  // Dense forest border (8 tiles thick)
  for (let tx = 0; tx < MAP_W; tx++) {
    for (let ty = 0; ty < MAP_H; ty++) {
      const distFromEdge = Math.min(tx, ty, MAP_W - 1 - tx, MAP_H - 1 - ty);
      if (distFromEdge >= 8) continue;

      // Density increases near the edge
      const density = distFromEdge < 3 ? 0.35 : (distFromEdge < 5 ? 0.2 : 0.12);
      if (Math.random() > density) continue;

      const x = tx * TILE + Phaser.Math.Between(-4, 4);
      const y = ty * TILE + Phaser.Math.Between(-4, 4);
      const key = Phaser.Utils.Array.GetRandom(allTreeKeys);
      const sc = (key === 'tree_big' || key === 'tree_pine') ? Phaser.Math.FloatBetween(1.6, 2.0) : Phaser.Math.FloatBetween(1.2, 1.6);

      scene.add.image(x, y, key).setDepth(3).setScale(sc);
      addCollision(walls, x, y + 8, 8, 6);

      // Occasional bush under trees
      if (Math.random() < 0.2) {
        scene.add.image(x + Phaser.Math.Between(-8, 8), y + Phaser.Math.Between(4, 12),
          Phaser.Utils.Array.GetRandom(bushKeys)).setDepth(2).setScale(1.3);
      }
    }
  }

  // Interior forest patches (clusters of trees scattered in open areas)
  // Avoid overlapping buildings, military base (12-60, 11-42), roads, and key areas
  const patches = [
    { cx: 75, cy: 30, r: 5 },     // Between military base and hospital
    { cx: 160, cy: 30, r: 5 },    // NE corner near hospital
    { cx: 100, cy: 50, r: 4 },    // North of main avenue
    { cx: 30, cy: 82, r: 5 },     // West, above highway
    { cx: 165, cy: 82, r: 4 },    // East, above highway
    { cx: 65, cy: 115, r: 4 },    // Between SW buildings
    { cx: 135, cy: 115, r: 5 },   // Between SE buildings
    { cx: 100, cy: 155, r: 4 },   // South central
    { cx: 40, cy: 155, r: 3 },    // SW
    { cx: 165, cy: 155, r: 4 },   // SE
  ];

  for (const patch of patches) {
    const count = Phaser.Math.Between(8, 16);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * patch.r * TILE;
      const x = patch.cx * TILE + Math.cos(angle) * dist;
      const y = patch.cy * TILE + Math.sin(angle) * dist;

      if (x < TILE * 10 || x > MAP_PX_W - TILE * 10 || y < TILE * 10 || y > MAP_PX_H - TILE * 10) continue;

      const key = Phaser.Utils.Array.GetRandom(allTreeKeys);
      const sc = (key === 'tree_big' || key === 'tree_pine') ? 1.7 : 1.4;
      scene.add.image(x, y, key).setDepth(3).setScale(sc);
      addCollision(walls, x, y + 8, 8, 6);
    }

    // Bushes around patches
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * (patch.r + 2) * TILE;
      const x = patch.cx * TILE + Math.cos(angle) * dist;
      const y = patch.cy * TILE + Math.sin(angle) * dist;
      scene.add.image(x, y, Phaser.Utils.Array.GetRandom(bushKeys)).setDepth(2).setScale(1.4);
    }
  }

  // Scattered grass patches for visual variety
  for (let i = 0; i < 200; i++) {
    const x = Phaser.Math.Between(100, MAP_PX_W - 100);
    const y = Phaser.Math.Between(100, MAP_PX_H - 100);
    const key = Math.random() > 0.5 ? 'grass_patch' : 'grass_2';
    scene.add.image(x, y, key).setDepth(-0.5).setScale(1.2).setAlpha(0.7);
  }
}

/* ────────────────────────────────────────────
   ROAD PROPS (street lights, signs, hydrants)
   ──────────────────────────────────────────── */
function spawnRoadProps(scene: Phaser.Scene, walls: Phaser.Physics.Arcade.StaticGroup) {
  // Street lights along horizontal roads
  for (const r of H_ROADS) {
    const roadY = r.y * TILE;
    for (let ix = r.x + 5; ix < r.x + r.w; ix += Phaser.Math.Between(8, 14)) {
      const x = ix * TILE + Phaser.Math.Between(-4, 4);
      // Alternate sides of road
      const side = (ix % 2 === 0) ? -1 : 1;
      const y = roadY + side * (r.h / 2 + 2) * TILE;
      scene.add.image(x, y, 'streetlight_down').setDepth(3).setScale(1.4);
      addCollision(walls, x, y + 8, 6, 6);
    }
  }

  // Street lights along vertical roads
  for (const r of V_ROADS) {
    const roadX = r.x * TILE;
    for (let iy = r.y + 5; iy < r.y + r.h; iy += Phaser.Math.Between(8, 14)) {
      const y = iy * TILE + Phaser.Math.Between(-4, 4);
      const side = (iy % 2 === 0) ? -1 : 1;
      const x = roadX + side * (r.w / 2 + 2) * TILE;
      const key = side < 0 ? 'streetlight_side' : 'streetlight_side';
      scene.add.image(x, y, key).setDepth(3).setScale(1.4);
      addCollision(walls, x, y + 8, 6, 6);
    }
  }

  // Stop signs at key road junctions
  const intersections = [
    { x: 40, y: 48 },     // NW street meets west connector  
    { x: 88, y: 48 },     // Avenue meets NW street area
    { x: 148, y: 40 },    // East connector top 
    { x: 88, y: 125 },    // Avenue meets south streets
    { x: 50, y: 125 },    // SW street meets south connector
  ];
  for (const inter of intersections) {
    const x = (inter.x - 1) * TILE;
    const y = (inter.y - 1) * TILE;
    const key = Math.random() > 0.3 ? 'stop_sign' : 'stop_sign_overgrown';
    scene.add.image(x, y, key).setDepth(3).setScale(1.4);
    addCollision(walls, x, y + 6, 6, 6);
  }

  // Hydrants along roads (every few blocks)
  for (const r of H_ROADS) {
    for (let ix = r.x + 8; ix < r.x + r.w; ix += Phaser.Math.Between(15, 25)) {
      const x = ix * TILE;
      const y = (r.y - 2) * TILE;
      scene.add.image(x, y, 'hydrant').setDepth(2).setScale(1.3);
      addCollision(walls, x, y, 6, 6);
    }
  }

  // Traffic cones in clusters (roadwork)
  const coneClusters = [
    { cx: 55 * TILE, cy: 88 * TILE },   // Highway west segment
    { cx: 140 * TILE, cy: 42 * TILE },  // NE access road
    { cx: 88 * TILE, cy: 162 * TILE },  // Southern road
  ];
  for (const cluster of coneClusters) {
    for (let i = 0; i < Phaser.Math.Between(3, 6); i++) {
      const x = cluster.cx + Phaser.Math.Between(-20, 20);
      const y = cluster.cy + Phaser.Math.Between(-8, 8);
      scene.add.image(x, y, 'traffic_cone').setDepth(2).setScale(1.3);
      addCollision(walls, x, y, 5, 5);
    }
  }
}

/* ────────────────────────────────────────────
   BUILDING-ADJACENT PROPS (context-aware)
   ──────────────────────────────────────────── */
function spawnBuildingProps(scene: Phaser.Scene, walls: Phaser.Physics.Arcade.StaticGroup, props: PropInfo[], buildings: BuildingInfo[]) {
  for (const bld of buildings) {
    const bx = bld.x;
    const by = bld.y;
    const bw = bld.w;
    const bh = bld.h;

    // Trash cans near entrance (searchable) — offset from door center to avoid blocking
    const doorCenterX = bx + bw / 2;
    for (let i = 0; i < Phaser.Math.Between(1, 3); i++) {
      // Push to the sides, never in front of the door
      const offset = Phaser.Math.Between(40, 70) * (Math.random() > 0.5 ? 1 : -1);
      const x = Phaser.Math.Clamp(doorCenterX + offset, bx - 20, bx + bw + 20);
      const y = by + bh + Phaser.Math.Between(20, 40);
      const spr = scene.add.image(x, y, Math.random() > 0.5 ? 'trashcan_1' : 'trashcan_2').setDepth(2).setScale(1.3);
      addCollision(walls, x, y, 8, 8);
      props.push({ sprite: spr, type: 'trashcan', searched: false, x, y });
    }

    // Garbage bins near commercial/industrial buildings (searchable)
    if (bld.label.includes('SUPERMERCADO') || bld.label.includes('FÁBRICA') || bld.label.includes('ALMACÉN') || bld.label.includes('BAR') || bld.label === 'LAVANDERÍA' || bld.label === 'BOMBEROS') {
      for (let i = 0; i < Phaser.Math.Between(1, 2); i++) {
        const side = Math.random() > 0.5 ? -1 : 1;
        const x = bx + (side > 0 ? bw + 12 : -12);
        const y = by + Phaser.Math.Between(0, bh);
        const spr = scene.add.image(x, y, Math.random() > 0.5 ? 'garbage_bin_1' : 'garbage_bin_2').setDepth(2).setScale(1.3);
        addCollision(walls, x, y, 10, 10);
        props.push({ sprite: spr, type: 'garbage_bin', searched: false, x, y });
      }
    }

    // Vending machines near shops / hospital (searchable)
    if (bld.label.includes('SUPERMERCADO') || bld.label === 'HOSPITAL' || bld.label.includes('TIENDA') || bld.label === 'BAR' || bld.label === 'ESCUELA' || bld.label === 'BIBLIOTECA') {
      const x = bx + bw + 12;
      const y = by + TILE * 2;
      const spr = scene.add.image(x, y, Math.random() > 0.5 ? 'vending_blue' : 'vending_red').setDepth(2).setScale(1.3);
      addCollision(walls, x, y, 10, 14);
      props.push({ sprite: spr, type: 'shelf', searched: false, x, y });
    }

    // Barrels near industrial/military (searchable)
    if (bld.label.includes('FÁBRICA') || bld.label.includes('ALMACÉN') || bld.label.includes('MILITAR') || bld.label === 'GARAJE' || bld.label === 'TALLER' || bld.label === 'BOMBEROS') {
      for (let i = 0; i < Phaser.Math.Between(2, 4); i++) {
        const x = bx + Phaser.Math.Between(-20, bw + 20);
        const y = by + bh + Phaser.Math.Between(16, 40);
        const key = Math.random() > 0.5 ? 'barrel_blue' : (Math.random() > 0.5 ? 'barrel_red' : 'barrel_rust_blue');
        const spr = scene.add.image(x, y, key).setDepth(2).setScale(1.3);
        addCollision(walls, x, y, 8, 8);
        props.push({ sprite: spr, type: 'barrel', searched: false, x, y });
      }
    }

    // Tires near garages/gas station/taller/bomberos
    if (bld.label === 'GARAJE' || bld.label === 'GASOLINERA' || bld.label === 'TALLER' || bld.label === 'BOMBEROS') {
      for (let i = 0; i < 4; i++) {
        const x = bx + Phaser.Math.Between(-10, bw + 10);
        const y = by + bh + Phaser.Math.Between(5, 25);
        const key = Math.random() > 0.5 ? 'tire' : 'tire_grass';
        scene.add.image(x, y, key).setDepth(2).setScale(1.3);
        addCollision(walls, x, y, 7, 7);
      }
    }
  }
}

/* ────────────────────────────────────────────
   SCATTERED PROPS (urban debris with collision)
   ──────────────────────────────────────────── */
function spawnScatteredProps(scene: Phaser.Scene, walls: Phaser.Physics.Arcade.StaticGroup) {
  // Abandoned vehicles (rusted) scattered across the map
  const rustCarKeys = ['car_rust_blue', 'car_rust_red', 'car_scrap_green', 'car_4_gray'];
  for (let i = 0; i < 14; i++) {
    const x = Phaser.Math.Between(300, MAP_PX_W - 300);
    const y = Phaser.Math.Between(300, MAP_PX_H - 300);
    const key = Phaser.Utils.Array.GetRandom(rustCarKeys);
    const angle = Phaser.Utils.Array.GetRandom([0, 15, 45, 90, 135, 180, 270]);
    scene.add.image(x, y, key).setDepth(2).setScale(1.8).setAngle(angle).setTint(0xaaaaaa);
    addCollision(walls, x, y, 28, 18);
  }

  // Shipping containers (near industrial areas)
  const containerSpots = [
    { x: 155, y: 62 }, { x: 158, y: 65 },
    { x: 175, y: 64 }, { x: 178, y: 67 },
    { x: 18, y: 168 }, { x: 22, y: 170 },
    { x: 145, y: 168 }, { x: 148, y: 171 },
    { x: 172, y: 104 }, { x: 175, y: 107 },
  ];
  const containerKeys = ['container_gray', 'container_red', 'container_green'];
  for (const spot of containerSpots) {
    const x = spot.x * TILE;
    const y = spot.y * TILE;
    const key = Phaser.Utils.Array.GetRandom(containerKeys);
    scene.add.image(x, y, key).setDepth(2).setScale(1.5);
    addCollision(walls, x, y, 30, 14);
  }

  // Benches along sidewalks (not random - near roads)
  for (const r of H_ROADS) {
    for (let ix = r.x + 10; ix < r.x + r.w; ix += Phaser.Math.Between(18, 30)) {
      const x = ix * TILE;
      const y = (r.y + r.h + 2) * TILE;
      const key = Math.random() > 0.3 ? 'bench_down' : 'bench_overgrown';
      scene.add.image(x, y, key).setDepth(2).setScale(1.3);
      addCollision(walls, x, y, 14, 6);
    }
  }

  // Shopping carts near supermarket (SUPERMERCADO at tx:106, ty:54, tw:26, th:18)
  for (let i = 0; i < 6; i++) {
    const x = (115 + Phaser.Math.Between(-8, 8)) * TILE;
    const y = (74 + Phaser.Math.Between(-3, 3)) * TILE;
    scene.add.image(x, y, 'shopping_cart').setDepth(2).setScale(1.3);
    addCollision(walls, x, y, 10, 8);
  }

  // Iron fences (around military base and cemetery)
  // Military base fence with GATE on south side
  const GATE_CENTER = 36; // tile-x where gate is (center of south fence)
  const GATE_HALF = 3;    // 6-tile wide gate opening
  const fenceRuns: { sx: number; sy: number; len: number; dir: string; gateAt?: number; gateHalf?: number }[] = [
    { sx: 12, sy: 11, len: 48, dir: 'h' },  // Military N
    { sx: 12, sy: 42, len: 48, dir: 'h', gateAt: GATE_CENTER, gateHalf: GATE_HALF }, // Military S — has gate
    { sx: 12, sy: 11, len: 32, dir: 'v' },  // Military W
    { sx: 60, sy: 11, len: 32, dir: 'v' },  // Military E
    { sx: 168, sy: 145, len: 18, dir: 'h' }, // Cemetery N
    { sx: 168, sy: 158, len: 18, dir: 'h' }, // Cemetery S
    { sx: 168, sy: 145, len: 14, dir: 'v' }, // Cemetery W
    { sx: 186, sy: 145, len: 14, dir: 'v' }, // Cemetery E
  ];
  for (const run of fenceRuns) {
    const count = run.len;
    for (let f = 0; f < count; f++) {
      // Skip gate opening
      if (run.gateAt !== undefined && run.dir === 'h') {
        const tileX = run.sx + f;
        if (tileX >= run.gateAt - run.gateHalf! && tileX <= run.gateAt + run.gateHalf!) continue;
      }
      const fx = run.dir === 'h' ? (run.sx + f) * TILE : run.sx * TILE;
      const fy = run.dir === 'v' ? (run.sy + f) * TILE : run.sy * TILE;
      scene.add.image(fx, fy, 'iron_fence_ts', 0).setDepth(3);
      const w = walls.create(fx, fy) as Phaser.Physics.Arcade.Sprite;
      w.setVisible(false);
      w.body!.setSize(TILE, 4);
      w.refreshBody();
    }
  }
  // Gate entrance marker for military base
  const gateX = GATE_CENTER * TILE;
  const gateY = 42 * TILE;
  scene.add.text(gateX, gateY + 10, 'ENTRADA', {
    fontSize: '6px', color: '#ffcc00', fontFamily: 'monospace', fontStyle: 'bold',
    backgroundColor: 'rgba(0,0,0,0.7)', padding: { x: 2, y: 1 }
  }).setOrigin(0.5).setDepth(12);

  // Trash bags in alleys between buildings
  const trashSpots = [
    { x: 26, y: 64 }, { x: 27, y: 65 },
    { x: 42, y: 108 }, { x: 43, y: 109 },
    { x: 95, y: 110 },
    { x: 65, y: 138 },
    { x: 108, y: 148 },
  ];
  for (const spot of trashSpots) {
    for (let i = 0; i < Phaser.Math.Between(2, 4); i++) {
      const x = spot.x * TILE + Phaser.Math.Between(-10, 10);
      const y = spot.y * TILE + Phaser.Math.Between(-10, 10);
      scene.add.image(x, y, Math.random() > 0.5 ? 'trash_bag_1' : 'trash_bag_2').setDepth(2).setScale(1.3);
      addCollision(walls, x, y, 6, 6);
    }
  }

  // Cardboard piles near trash spots
  for (const spot of trashSpots) {
    if (Math.random() < 0.6) {
      const x = spot.x * TILE + Phaser.Math.Between(-16, 16);
      const y = spot.y * TILE + Phaser.Math.Between(-16, 16);
      scene.add.image(x, y, Math.random() > 0.5 ? 'cardboard_1' : 'cardboard_2').setDepth(2).setScale(1.2);
      addCollision(walls, x, y, 10, 8);
    }
  }

  // Pallets near industrial buildings
  const palletSpots = [
    { x: 155, y: 68 }, { x: 175, y: 72 },
    { x: 20, y: 175 }, { x: 25, y: 173 },
    { x: 145, y: 175 },
  ];
  for (const spot of palletSpots) {
    for (let i = 0; i < Phaser.Math.Between(1, 3); i++) {
      const x = spot.x * TILE + Phaser.Math.Between(-12, 12);
      const y = spot.y * TILE + Phaser.Math.Between(-12, 12);
      scene.add.image(x, y, 'pallet').setDepth(2).setScale(1.2);
      addCollision(walls, x, y, 12, 10);
    }
  }

  // A bus roadblock on the main highway
  const busX = 75 * TILE;
  const busY = 87 * TILE;
  scene.add.image(busX, busY, 'car_bus_red').setDepth(3).setScale(2).setAngle(12);
  addCollision(walls, busX, busY, 80, 20);

  // Rocks scattered (wilderness feel)
  for (let i = 0; i < 30; i++) {
    const x = Phaser.Math.Between(200, MAP_PX_W - 200);
    const y = Phaser.Math.Between(200, MAP_PX_H - 200);
    scene.add.image(x, y, 'rock_grass').setDepth(2).setScale(Phaser.Math.FloatBetween(0.9, 1.4));
    addCollision(walls, x, y, 8, 6);
  }
}

/* ────────────────────────────────────────────
   GROUND ITEMS
   ──────────────────────────────────────────── */
function spawnGroundItems(scene: Phaser.Scene, props: PropInfo[]) {
  // Scale lookup: normalize all items to ~14-18px world size
  // Pickable/* sprites are small pixel art (~16px) → scale ~1.0
  // Guns_V1.01 sprites are high-res (64-192px) → need tiny scales
  // MeleeWeaponPack sprites are ~32px → scale ~0.5
  const ITEM_SCALE: Record<string, number> = {
    item_food: 1.0, item_soup: 1.0, item_chips_red: 1.0, item_chips_yellow: 1.0,
    item_bandage: 1.0, item_bat: 1.0, item_pistol: 1.0, item_shotgun: 1.0, item_rifle: 1.0,
    item_ammo_blue: 1.0, item_ammo_red: 1.0, item_ammo_green: 1.0,
    item_knife: 0.5, item_axe: 0.7,
    item_smg: 0.22, item_revolver: 0.28, item_ak47: 0.18, item_rpg: 0.1,
  };
  const getScale = (key: string) => ITEM_SCALE[key] ?? 1.0;

  const addItem = (x: number, y: number, key: string) => {
    const spr = scene.add.image(x, y, key).setDepth(3).setScale(getScale(key));
    props.push({ sprite: spr, type: 'ground_item', searched: false, x, y });
  };

  // Food & consumables (more scattered)
  const foodKeys = ['item_food', 'item_soup', 'item_chips_red', 'item_chips_yellow', 'item_bandage'];
  for (let i = 0; i < 45; i++) {
    const x = Phaser.Math.Between(200, MAP_PX_W - 200);
    const y = Phaser.Math.Between(200, MAP_PX_H - 200);
    addItem(x, y, Phaser.Utils.Array.GetRandom(foodKeys));
  }

  // Melee weapons (common — scattered everywhere)
  const meleeKeys = ['item_bat', 'item_knife', 'item_axe'];
  for (let i = 0; i < 15; i++) {
    const x = Phaser.Math.Between(250, MAP_PX_W - 250);
    const y = Phaser.Math.Between(250, 200 * TILE - 250);
    addItem(x, y, Phaser.Utils.Array.GetRandom(meleeKeys));
  }

  // Ranged weapons (rarer — scattered across map)
  const rangedKeys = ['item_pistol', 'item_shotgun', 'item_rifle', 'item_smg', 'item_revolver', 'item_ak47'];
  for (let i = 0; i < 25; i++) {
    const x = Phaser.Math.Between(300, MAP_PX_W - 300);
    const y = Phaser.Math.Between(300, 200 * TILE - 300);
    addItem(x, y, Phaser.Utils.Array.GetRandom(rangedKeys));
  }

  // RPG (rare — only 3 on surface)
  for (let i = 0; i < 3; i++) {
    const x = Phaser.Math.Between(400, MAP_PX_W - 400);
    const y = Phaser.Math.Between(400, 200 * TILE - 400);
    addItem(x, y, 'item_rpg');
  }

  // Strategic weapon placements near key buildings
  const policeWeapons = ['item_pistol', 'item_pistol', 'item_shotgun', 'item_revolver'];
  for (const key of policeWeapons) {
    const x = (62 + Phaser.Math.Between(2, 20)) * TILE;
    const y = (54 + Phaser.Math.Between(2, 14)) * TILE;
    addItem(x, y, key);
  }

  // Hospital — medical supplies
  for (let i = 0; i < 4; i++) {
    const x = (130 + Phaser.Math.Between(2, 28)) * TILE;
    const y = (14 + Phaser.Math.Between(2, 18)) * TILE;
    addItem(x, y, 'item_bandage');
  }

  // Bar — melee weapons
  for (let i = 0; i < 3; i++) {
    const x = (100 + Phaser.Math.Between(2, 12)) * TILE;
    const y = (147 + Phaser.Math.Between(2, 8)) * TILE;
    addItem(x, y, Phaser.Utils.Array.GetRandom(['item_bat', 'item_knife']));
  }

  // Bomberos — axes
  for (let i = 0; i < 2; i++) {
    const x = (62 + Phaser.Math.Between(2, 8)) * TILE;
    const y = (169 + Phaser.Math.Between(2, 6)) * TILE;
    addItem(x, y, 'item_axe');
  }

  // Ammo (more generous)
  const ammoKeys = ['item_ammo_blue', 'item_ammo_red', 'item_ammo_green'];
  for (let i = 0; i < 35; i++) {
    const x = Phaser.Math.Between(250, MAP_PX_W - 250);
    const y = Phaser.Math.Between(250, MAP_PX_H - 250);
    addItem(x, y, Phaser.Utils.Array.GetRandom(ammoKeys));
  }
}

/* ────────────────────────────────────────────
   VEHICLES (driveable)
   ──────────────────────────────────────────── */
function spawnVehicles(scene: Phaser.Scene, walls: Phaser.Physics.Arcade.StaticGroup, cars: CarInfo[]) {
  // Cars parked along roads (not on grid intersections)
  const carSpots = [
    { x: 42, y: 52, key: 'car_1_blue', angle: 90 },   // NW street west connector
    { x: 92, y: 50, key: 'car_1_red', angle: 0 },     // Near avenue, north
    { x: 150, y: 44, key: 'car_van', angle: 0 },      // NE access road
    { x: 92, y: 130, key: 'car_1_blue', angle: 0 },   // Avenue south section
    { x: 52, y: 130, key: 'car_truck', angle: 90 },   // SW street
    { x: 150, y: 130, key: 'car_1_red', angle: 270 }, // SE connector
    { x: 55, y: 90, key: 'car_van', angle: 0 },       // Highway west
    { x: 130, y: 88, key: 'car_1_blue', angle: 0 },   // Highway center
  ];

  carSpots.forEach(c => {
    const x = c.x * TILE;
    const y = c.y * TILE;
    const sprite = scene.add.image(x, y, c.key).setDepth(3).setAngle(c.angle).setScale(2);

    const body = scene.physics.add.sprite(x, y, 'bullet_pistol').setVisible(false);
    body.body!.setSize(25, 35);
    body.setImmovable(true);

    walls.add(body);
    cars.push({ sprite, body, x, y });
  });
}

/* ────────────────────────────────────────────
   UNDERGROUND BUNKER (rows 200-260, much larger than surface building)
   ──────────────────────────────────────────── */
function buildBunkerUnderground(scene: Phaser.Scene, walls: Phaser.Physics.Arcade.StaticGroup, props: PropInfo[]) {
  const startY = 205 * TILE;
  const startX = 30 * TILE;
  const bunkerW = 140;
  const bunkerH = 45;

  // Dark ground floor
  for (let tx = 0; tx < bunkerW; tx++) {
    for (let ty = 0; ty < bunkerH; ty++) {
      const frame = Math.random() < 0.08 ? 17 : (Math.random() < 0.5 ? 8 : 9);
      scene.add.image(startX + tx * TILE + TILE / 2, startY + ty * TILE + TILE / 2, 'bld_dark_sh', frame).setDepth(0);
    }
  }

  // Outer walls
  for (let tx = 0; tx < bunkerW; tx++) {
    for (let ty = 0; ty < bunkerH; ty++) {
      const isEdge = tx === 0 || tx === bunkerW - 1 || ty === 0 || ty === bunkerH - 1;
      if (!isEdge) continue;
      const wx = startX + tx * TILE + TILE / 2;
      const wy = startY + ty * TILE + TILE / 2;
      scene.add.image(wx, wy, 'walls_tileset_sh', 0).setDepth(1);
      const w = walls.create(wx, wy) as Phaser.Physics.Arcade.Sprite;
      w.setVisible(false);
      w.body!.setSize(TILE, TILE);
      w.refreshBody();
    }
  }

  // Internal rooms (corridors and chambers)
  const rooms = [
    { x: 10, y: 5, w: 20, h: 15, label: 'ARMERÍA' },
    { x: 35, y: 5, w: 25, h: 15, label: 'LABORATORIO' },
    { x: 65, y: 5, w: 20, h: 15, label: 'ENFERMERÍA' },
    { x: 10, y: 25, w: 30, h: 15, label: 'ALMACÉN' },
    { x: 50, y: 25, w: 25, h: 15, label: 'COMEDOR' },
    { x: 80, y: 25, w: 20, h: 15, label: 'BARRACONES' },
    { x: 90, y: 5, w: 30, h: 15, label: 'SALA DE MANDO' },
    { x: 105, y: 25, w: 25, h: 15, label: 'GENERADOR' },
  ];

  for (const room of rooms) {
    const rx = startX + room.x * TILE;
    const ry = startY + room.y * TILE;

    // Room walls (partial - leave doorways)
    for (let tx = 0; tx < room.w; tx++) {
      for (let ty = 0; ty < room.h; ty++) {
        const isEdge = tx === 0 || tx === room.w - 1 || ty === 0 || ty === room.h - 1;
        if (!isEdge) continue;
        // Leave door gaps
        if (ty === room.h - 1 && tx >= Math.floor(room.w / 2) - 1 && tx <= Math.floor(room.w / 2) + 1) continue;
        if (ty === 0 && tx >= Math.floor(room.w / 2) - 1 && tx <= Math.floor(room.w / 2) + 1) continue;

        const wx = rx + tx * TILE + TILE / 2;
        const wy = ry + ty * TILE + TILE / 2;
        scene.add.image(wx, wy, 'walls_tileset_sh', 3).setDepth(1).setTint(0x667788);
        const w = walls.create(wx, wy) as Phaser.Physics.Arcade.Sprite;
        w.setVisible(false);
        w.body!.setSize(TILE, TILE);
        w.refreshBody();
      }
    }

    // Floor accent for each room
    const floorTint = room.label === 'ARMERÍA' ? 0xcc6644 : (room.label === 'ENFERMERÍA' ? 0x66aa88 : 0x888899);
    for (let tx = 1; tx < room.w - 1; tx++) {
      for (let ty = 1; ty < room.h - 1; ty++) {
        if (Math.random() < 0.05) {
          scene.add.image(rx + tx * TILE + TILE / 2, ry + ty * TILE + TILE / 2, 'bld_dark_sh', 16)
            .setDepth(0.1).setTint(floorTint).setAlpha(0.3);
        }
      }
    }

    // Label
    scene.add.text(rx + room.w * TILE / 2, ry + room.h * TILE + 4, room.label, {
      fontSize: '7px', color: '#88ccff', fontFamily: 'monospace', fontStyle: 'bold',
      backgroundColor: 'rgba(0,0,30,0.8)', padding: { x: 2, y: 1 }
    }).setOrigin(0.5).setDepth(12);

    // Room-specific props
    if (room.label === 'ARMERÍA') {
      const BUNKER_SCALE: Record<string, number> = {
        item_ak47: 0.18, item_rpg: 0.1, item_smg: 0.22, item_rifle: 1.0, item_shotgun: 1.0,
      };
      for (let i = 0; i < 8; i++) {
        const ix = rx + Phaser.Math.Between(2, room.w - 3) * TILE;
        const iy = ry + Phaser.Math.Between(2, room.h - 3) * TILE;
        const weaponKey = Phaser.Utils.Array.GetRandom(['item_ak47', 'item_rpg', 'item_smg', 'item_rifle', 'item_shotgun']);
        const spr = scene.add.image(ix, iy, weaponKey).setDepth(3).setScale(BUNKER_SCALE[weaponKey] ?? 1.0);
        props.push({ sprite: spr, type: 'ground_item', searched: false, x: ix, y: iy });
      }
      // Ammo crates
      for (let i = 0; i < 5; i++) {
        const ix = rx + Phaser.Math.Between(2, room.w - 3) * TILE;
        const iy = ry + Phaser.Math.Between(2, room.h - 3) * TILE;
        const ammoKey = Phaser.Utils.Array.GetRandom(['item_ammo_blue', 'item_ammo_red', 'item_ammo_green']);
        const spr = scene.add.image(ix, iy, ammoKey).setDepth(3).setScale(1.0);
        props.push({ sprite: spr, type: 'ground_item', searched: false, x: ix, y: iy });
      }
    } else if (room.label === 'ENFERMERÍA') {
      for (let i = 0; i < 5; i++) {
        const ix = rx + Phaser.Math.Between(2, room.w - 3) * TILE;
        const iy = ry + Phaser.Math.Between(2, room.h - 3) * TILE;
        const spr = scene.add.image(ix, iy, 'item_bandage').setDepth(3).setScale(1.0);
        props.push({ sprite: spr, type: 'ground_item', searched: false, x: ix, y: iy });
      }
    } else if (room.label === 'COMEDOR' || room.label === 'ALMACÉN') {
      for (let i = 0; i < 6; i++) {
        const ix = rx + Phaser.Math.Between(2, room.w - 3) * TILE;
        const iy = ry + Phaser.Math.Between(2, room.h - 3) * TILE;
        const foodKey = Phaser.Utils.Array.GetRandom(['item_food', 'item_soup', 'item_chips_red', 'item_chips_yellow']);
        const spr = scene.add.image(ix, iy, foodKey).setDepth(3).setScale(1.0);
        props.push({ sprite: spr, type: 'ground_item', searched: false, x: ix, y: iy });
      }
    }

    // Generic interior props for all rooms
    for (let i = 0; i < 3; i++) {
      const ix = rx + Phaser.Math.Between(2, room.w - 3) * TILE;
      const iy = ry + Phaser.Math.Between(2, room.h - 3) * TILE;
      const propKey = Phaser.Utils.Array.GetRandom(['barrel_blue', 'metal_plates', 'pallet', 'iron_beam']);
      scene.add.image(ix, iy, propKey).setDepth(1).setScale(1.1).setTint(0x99aabb);
    }
  }

  // Exit marker (manhole/stairs back to surface) — must match GameScene.bunkerExit
  const exitX = startX + 70 * TILE;   // = 100 * TILE
  const exitY = startY + 15 * TILE;   // = 220 * TILE
  scene.add.image(exitX, exitY, 'manhole').setDepth(2).setScale(1.5);
  scene.add.text(exitX, exitY - 14, '↑ SALIDA', {
    fontSize: '7px', color: '#ffcc00', fontFamily: 'monospace', fontStyle: 'bold',
    backgroundColor: 'rgba(0,0,0,0.8)', padding: { x: 2, y: 1 }
  }).setOrigin(0.5).setDepth(12);

  // Ambient lighting (dim glow spots)
  for (let i = 0; i < 20; i++) {
    const lx = startX + Phaser.Math.Between(5, bunkerW - 5) * TILE;
    const ly = startY + Phaser.Math.Between(3, bunkerH - 3) * TILE;
    const light = scene.add.circle(lx, ly, 40, 0x334466, 0.06).setDepth(0.2);
    scene.tweens.add({
      targets: light, alpha: 0.02, duration: Phaser.Math.Between(2000, 4000),
      yoyo: true, repeat: -1
    });
  }
}

/* ────────────────────────────────────────────
   AMBIENT DECORATIONS (barrel fires, debris, atmosphere)
   ──────────────────────────────────────────── */
function spawnAmbientDecor(scene: Phaser.Scene) {
  // Barrel fires (warm spots scattered in the city)
  const fireSpots = [
    { x: 25 * TILE, y: 58 * TILE },
    { x: 55 * TILE, y: 140 * TILE },
    { x: 98 * TILE, y: 105 * TILE },
    { x: 155 * TILE, y: 70 * TILE },
    { x: 32 * TILE, y: 170 * TILE },
  ];
  for (const spot of fireSpots) {
    scene.add.image(spot.x, spot.y, 'barrel_red').setDepth(2).setScale(1.3);
    // Fire glow
    const glow = scene.add.circle(spot.x, spot.y - 6, 12, 0xff6600, 0.15).setDepth(2.5);
    scene.tweens.add({
      targets: glow, scaleX: 1.3, scaleY: 1.5, alpha: 0.08,
      duration: 800, yoyo: true, repeat: -1
    });
    // Fire flicker particles
    for (let i = 0; i < 3; i++) {
      const p = scene.add.circle(spot.x + Phaser.Math.Between(-4, 4), spot.y - 8,
        Phaser.Math.Between(1, 2), 0xff8833, 0.6).setDepth(3);
      scene.tweens.add({
        targets: p, y: p.y - Phaser.Math.Between(8, 16), alpha: 0,
        duration: Phaser.Math.Between(600, 1200), repeat: -1, yoyo: false,
        delay: i * 200, onRepeat: () => {
          p.setPosition(spot.x + Phaser.Math.Between(-4, 4), spot.y - 8);
          p.setAlpha(0.6);
        }
      });
    }
  }

  // Flickering street lights (visual atmosphere)
  // Some street lights flicker erratically
  for (let i = 0; i < 8; i++) {
    const x = Phaser.Math.Between(200, 200 * TILE - 200);
    const y = Phaser.Math.Between(200, 200 * TILE - 200);
    const glow = scene.add.circle(x, y, 20, 0xffffaa, 0.05).setDepth(0.3);
    scene.tweens.add({
      targets: glow,
      alpha: { from: 0.05, to: 0 },
      duration: Phaser.Math.Between(100, 300),
      repeat: -1,
      yoyo: true,
      delay: Phaser.Math.Between(0, 3000),
      repeatDelay: Phaser.Math.Between(500, 2000),
    });
  }

  // Atmospheric ground stains
  for (let i = 0; i < 30; i++) {
    const x = Phaser.Math.Between(200, 200 * TILE - 200);
    const y = Phaser.Math.Between(200, 200 * TILE - 200);
    scene.add.circle(x, y, Phaser.Math.Between(4, 10), 0x331111, 0.15).setDepth(-0.3);
  }
}

/* ────────────────────────────────────────────
   UTILITY
   ──────────────────────────────────────────── */
function addCollision(walls: Phaser.Physics.Arcade.StaticGroup, x: number, y: number, w: number, h: number) {
  const body = walls.create(x, y) as Phaser.Physics.Arcade.Sprite;
  body.setVisible(false);
  body.body!.setSize(w, h);
  body.refreshBody();
}

export { TILE };
