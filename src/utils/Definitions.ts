/** Weapon and item type definitions */

export interface WeaponDef {
  id: string;
  name: string;
  damage: number;
  range: number;       // pixels
  fireRate: number;     // ms between attacks
  type: 'melee' | 'ranged';
  ammoPerShot: number;
  spread: number;       // degrees of inaccuracy
  projectileSpeed: number;
  color: number;        // display tint
  explosive?: boolean;
  explosionRadius?: number;
  pelletsPerShot?: number;  // shotgun pellets
}

export const WEAPONS: Record<string, WeaponDef> = {
  fists: {
    id: 'fists', name: 'Puños', damage: 5, range: 40,
    fireRate: 400, type: 'melee', ammoPerShot: 0,
    spread: 0, projectileSpeed: 0, color: 0xdddddd
  },
  knife: {
    id: 'knife', name: 'Cuchillo', damage: 12, range: 45,
    fireRate: 300, type: 'melee', ammoPerShot: 0,
    spread: 0, projectileSpeed: 0, color: 0xcccccc
  },
  bat: {
    id: 'bat', name: 'Bate', damage: 18, range: 55,
    fireRate: 500, type: 'melee', ammoPerShot: 0,
    spread: 0, projectileSpeed: 0, color: 0x8B4513
  },
  axe: {
    id: 'axe', name: 'Hacha', damage: 25, range: 50,
    fireRate: 700, type: 'melee', ammoPerShot: 0,
    spread: 0, projectileSpeed: 0, color: 0x888888
  },
  pistol: {
    id: 'pistol', name: 'Pistola', damage: 20, range: 400,
    fireRate: 350, type: 'ranged', ammoPerShot: 1,
    spread: 3, projectileSpeed: 600, color: 0x333333
  },
  revolver: {
    id: 'revolver', name: 'Revólver', damage: 45, range: 500,
    fireRate: 700, type: 'ranged', ammoPerShot: 1,
    spread: 2, projectileSpeed: 700, color: 0x554433
  },
  smg: {
    id: 'smg', name: 'SMG', damage: 12, range: 300,
    fireRate: 80, type: 'ranged', ammoPerShot: 1,
    spread: 7, projectileSpeed: 600, color: 0x444444
  },
  shotgun: {
    id: 'shotgun', name: 'Escopeta', damage: 9, range: 200,
    fireRate: 850, type: 'ranged', ammoPerShot: 1,
    spread: 10, projectileSpeed: 500, color: 0x654321,
    pelletsPerShot: 5
  },
  rifle: {
    id: 'rifle', name: 'Rifle', damage: 30, range: 600,
    fireRate: 200, type: 'ranged', ammoPerShot: 1,
    spread: 1, projectileSpeed: 800, color: 0x2a2a2a
  },
  ak47: {
    id: 'ak47', name: 'AK-47', damage: 22, range: 500,
    fireRate: 110, type: 'ranged', ammoPerShot: 1,
    spread: 5, projectileSpeed: 750, color: 0x5a4a2a
  },
  rpg: {
    id: 'rpg', name: 'RPG', damage: 120, range: 800,
    fireRate: 2500, type: 'ranged', ammoPerShot: 1,
    spread: 0, projectileSpeed: 350, color: 0x556633,
    explosive: true, explosionRadius: 100
  },
};

export interface ItemDef {
  id: string;
  name: string;
  type: 'weapon' | 'consumable' | 'ammo' | 'key';
  weaponId?: string;    // if type=weapon
  healAmount?: number;
  hungerAmount?: number;
  curesInfection?: boolean;
  ammoAmount?: number;
  color: number;
  icon: string;         // single char for display (fallback)
  iconTexture?: string; // texture key for HUD icon sprite
}

export const ITEMS: Record<string, ItemDef> = {
  knife:   { id: 'knife',   name: 'Cuchillo',   type: 'weapon', weaponId: 'knife',   color: 0xcccccc, icon: '🔪', iconTexture: 'item_knife' },
  bat:     { id: 'bat',     name: 'Bate',       type: 'weapon', weaponId: 'bat',     color: 0x8B4513, icon: '🏏', iconTexture: 'icon_bat' },
  axe:     { id: 'axe',     name: 'Hacha',      type: 'weapon', weaponId: 'axe',     color: 0x888888, icon: '🪓', iconTexture: 'item_axe' },
  pistol:  { id: 'pistol',  name: 'Pistola',    type: 'weapon', weaponId: 'pistol',  color: 0x333333, icon: '🔫', iconTexture: 'icon_pistol' },
  revolver:{ id: 'revolver', name: 'Revólver',  type: 'weapon', weaponId: 'revolver', color: 0x554433, icon: '🔫', iconTexture: 'item_revolver' },
  smg:     { id: 'smg',     name: 'SMG',        type: 'weapon', weaponId: 'smg',     color: 0x444444, icon: '🔫', iconTexture: 'item_smg' },
  shotgun: { id: 'shotgun', name: 'Escopeta',   type: 'weapon', weaponId: 'shotgun', color: 0x654321, icon: '🔫', iconTexture: 'icon_shotgun' },
  rifle:   { id: 'rifle',   name: 'Rifle',      type: 'weapon', weaponId: 'rifle',   color: 0x2a2a2a, icon: '🔫', iconTexture: 'icon_rifle' },
  ak47:    { id: 'ak47',    name: 'AK-47',      type: 'weapon', weaponId: 'ak47',    color: 0x5a4a2a, icon: '🔫', iconTexture: 'item_ak47' },
  rpg:     { id: 'rpg',     name: 'RPG',        type: 'weapon', weaponId: 'rpg',     color: 0x556633, icon: '💥', iconTexture: 'item_rpg' },
  food:    { id: 'food',    name: 'Comida',     type: 'consumable', hungerAmount: 30,   color: 0xe6a832, icon: '🍖', iconTexture: 'icon_food' },
  medkit:  { id: 'medkit',  name: 'Botiquín',   type: 'consumable', healAmount: 40,     color: 0xe63232, icon: '💊', iconTexture: 'icon_medkit' },
  pills:   { id: 'pills',   name: 'Pastillas',  type: 'consumable', healAmount: 10, curesInfection: true, color: 0x44ff44, icon: '💚', iconTexture: 'icon_bandage' },
  ammo9:   { id: 'ammo9',   name: 'Munición 9mm', type: 'ammo', ammoAmount: 15,       color: 0xddaa33, icon: '🔶', iconTexture: 'icon_ammo_blue' },
  ammoShell: { id: 'ammoShell', name: 'Cartuchos',  type: 'ammo', ammoAmount: 8,       color: 0xcc4444, icon: '🔴', iconTexture: 'icon_ammo_red' },
  ammoRifle: { id: 'ammoRifle', name: 'Balas Rifle', type: 'ammo', ammoAmount: 20,     color: 0x44aacc, icon: '🔵', iconTexture: 'icon_ammo_green' },
  ammoRocket: { id: 'ammoRocket', name: 'Cohetes', type: 'ammo', ammoAmount: 3,       color: 0x884422, icon: '🚀', iconTexture: 'icon_ammo_red' },
};

/** Loot tables for searchable objects */
export const LOOT_TABLES: Record<string, { items: string[]; chance: number }> = {
  trashcan:  { items: ['food', 'ammo9'], chance: 0.35 },
  shelf:     { items: ['food', 'medkit', 'ammo9', 'ammoShell'], chance: 0.55 },
  cabinet:   { items: ['pistol', 'ammo9', 'knife', 'revolver'], chance: 0.45 },
  armory:    { items: ['rifle', 'shotgun', 'ammoRifle', 'ammoShell', 'pistol', 'ak47', 'smg'], chance: 0.75 },
  pharmacy:  { items: ['medkit', 'pills', 'pills', 'food'], chance: 0.65 },
  kitchen:   { items: ['food', 'food', 'knife'], chance: 0.55 },
  bunker_armory: { items: ['rpg', 'ak47', 'ammoRocket', 'ammoRifle', 'smg', 'rifle'], chance: 0.9 },
  barrel:    { items: ['ammo9', 'ammoShell', 'food'], chance: 0.3 },
  garbage_bin: { items: ['food', 'ammo9', 'pills'], chance: 0.25 },
};
