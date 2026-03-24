import Phaser from 'phaser';


export function preloadAssets(scene: Phaser.Scene) {
  const C = 'assets/Character/';
  const E = 'assets/Enemies/';
  const T = 'assets/Tiles/';
  const O = 'assets/Objects/';

  // --- PLAYER ---
  // Idle (Sheet6)
  scene.load.spritesheet('p_idle_down', C + 'Main/Idle/Character_down_idle-Sheet6.png', { frameWidth: 13, frameHeight: 16 });
  scene.load.spritesheet('p_idle_side', C + 'Main/Idle/Character_side_idle-Sheet6.png', { frameWidth: 12, frameHeight: 16 });
  scene.load.spritesheet('p_idle_up', C + 'Main/Idle/Character_up_idle-Sheet6.png', { frameWidth: 11, frameHeight: 16 });
  scene.load.spritesheet('p_idle_side-left', C + 'Main/Idle/Character_side-left_idle-Sheet6.png', { frameWidth: 12, frameHeight: 16 });

  // Run (Sheet6)
  scene.load.spritesheet('p_run_down', C + 'Main/Run/Character_down_run-Sheet6.png', { frameWidth: 13, frameHeight: 17 });
  scene.load.spritesheet('p_run_side', C + 'Main/Run/Character_side_run-Sheet6.png', { frameWidth: 14, frameHeight: 17 });
  scene.load.spritesheet('p_run_up', C + 'Main/Run/Character_up_run-Sheet6.png', { frameWidth: 13, frameHeight: 17 });
  scene.load.spritesheet('p_run_side-left', C + 'Main/Run/Character_side-left_run-Sheet6.png', { frameWidth: 14, frameHeight: 17 });

  // Punch (Sheet4)
  scene.load.spritesheet('p_punch_down', C + 'Main/Punch/Character_down_punch-Sheet4.png', { frameWidth: 12, frameHeight: 18 });
  scene.load.spritesheet('p_punch_side', C + 'Main/Punch/Character_side_punch-Sheet4.png', { frameWidth: 20, frameHeight: 18 });
  scene.load.spritesheet('p_punch_up', C + 'Main/Punch/Character_up_punch-Sheet4.png', { frameWidth: 12, frameHeight: 17 });
  scene.load.spritesheet('p_punch_side-left', C + 'Main/Punch/Character_side-left_punch-Sheet4.png', { frameWidth: 20, frameHeight: 18 });

  // Bat (Melee)
  scene.load.spritesheet('p_bat_move_down', C + 'Bat/Bat_down_idle-and-run-Sheet6.png', { frameWidth: 17, frameHeight: 11 });
  scene.load.spritesheet('p_bat_move_side', C + 'Bat/Bat_side_idle-and-run-Sheet6.png', { frameWidth: 16, frameHeight: 13 });
  scene.load.spritesheet('p_bat_move_up', C + 'Bat/Bat_up_idle-and-run-Sheet6.png', { frameWidth: 16, frameHeight: 14 });
  scene.load.spritesheet('p_bat_move_side-left', C + 'Bat/Bat_side-left_idle-and-run-Sheet6.png', { frameWidth: 16, frameHeight: 13 });
  
  scene.load.spritesheet('p_bat_attack_down', C + 'Bat/Bat_down_attack-Sheet4.png', { frameWidth: 20, frameHeight: 25 });
  scene.load.spritesheet('p_bat_attack_side', C + 'Bat/Bat_side_attack-Sheet4.png', { frameWidth: 28, frameHeight: 16 });
  scene.load.spritesheet('p_bat_attack_up', C + 'Bat/Bat_up_attack-Sheet4.png', { frameWidth: 20, frameHeight: 25 });
  scene.load.spritesheet('p_bat_attack_side-left', C + 'Bat/Bat_side-left_attack-Sheet4.png', { frameWidth: 28, frameHeight: 16 });

  // Pistol
  scene.load.spritesheet('p_pistol_move_down', C + 'Guns/Pistol/Pistol_down_idle-and-run-Sheet6.png', { frameWidth: 5, frameHeight: 11 });
  scene.load.spritesheet('p_pistol_move_side', C + 'Guns/Pistol/Pistol_side_idle-and-run-Sheet6.png', { frameWidth: 8, frameHeight: 9 });
  scene.load.spritesheet('p_pistol_move_up', C + 'Guns/Pistol/Pistol_up_idle-and-run-Sheet6.png', { frameWidth: 5, frameHeight: 11 });
  scene.load.spritesheet('p_pistol_move_side-left', C + 'Guns/Pistol/Pistol_side-left_idle-and-run-Sheet6.png', { frameWidth: 8, frameHeight: 9 });

  scene.load.spritesheet('p_pistol_shoot_down', C + 'Guns/Pistol/Pistol_down_shoot-Sheet3.png', { frameWidth: 5, frameHeight: 11 });
  scene.load.spritesheet('p_pistol_shoot_side', C + 'Guns/Pistol/Pistol_side_shoot-Sheet3.png', { frameWidth: 10, frameHeight: 8 });
  scene.load.spritesheet('p_pistol_shoot_up', C + 'Guns/Pistol/Pistol_up_shoot-Sheet3.png', { frameWidth: 5, frameHeight: 11 });
  scene.load.spritesheet('p_pistol_shoot_side-left', C + 'Guns/Pistol/Pistol_side-left_shoot-Sheet3.png', { frameWidth: 10, frameHeight: 8 });

  // Shotgun
  scene.load.spritesheet('p_shotgun_move_down', C + 'Guns/Shotgun/Shotgun_down_idle-and-run-Sheet6.png', { frameWidth: 6, frameHeight: 14 });
  scene.load.spritesheet('p_shotgun_move_side', C + 'Guns/Shotgun/Shotgun_side_idle-and-run-Sheet6.png', { frameWidth: 15, frameHeight: 8 });
  scene.load.spritesheet('p_shotgun_move_up', C + 'Guns/Shotgun/Shotgun_up_idle-and-run-Sheet6.png', { frameWidth: 6, frameHeight: 16 });
  scene.load.spritesheet('p_shotgun_move_side-left', C + 'Guns/Shotgun/Shotgun_side-left_idle-and-run-Sheet6.png', { frameWidth: 15, frameHeight: 8 });

  scene.load.spritesheet('p_shotgun_shoot_down', C + 'Guns/Shotgun/Shotgun_down_shoot-Sheet3.png', { frameWidth: 6, frameHeight: 15 });
  scene.load.spritesheet('p_shotgun_shoot_side', C + 'Guns/Shotgun/Shotgun_side_shoot-Sheet3.png', { frameWidth: 18, frameHeight: 8 });
  scene.load.spritesheet('p_shotgun_shoot_up', C + 'Guns/Shotgun/Shotgun_up_shoot-Sheet3.png', { frameWidth: 6, frameHeight: 17 });
  scene.load.spritesheet('p_shotgun_shoot_side-left', C + 'Guns/Shotgun/Shotgun_side-left_shoot-Sheet3.png', { frameWidth: 18, frameHeight: 8 });

  // Gun (Rifle)
  scene.load.spritesheet('p_rifle_move_down', C + 'Guns/Gun/Gun_down_idle-and-run-Sheet6.png', { frameWidth: 5, frameHeight: 16 });
  scene.load.spritesheet('p_rifle_move_side', C + 'Guns/Gun/Gun_side_idle-and-run-Sheet6.png', { frameWidth: 16, frameHeight: 10 });
  scene.load.spritesheet('p_rifle_move_up', C + 'Guns/Gun/Gun_up_idle-and-run-Sheet6.png', { frameWidth: 5, frameHeight: 16 });
  scene.load.spritesheet('p_rifle_move_side-left', C + 'Guns/Gun/Gun_side-left_idle-and-run-Sheet6.png', { frameWidth: 16, frameHeight: 10 });

  scene.load.spritesheet('p_rifle_shoot_down', C + 'Guns/Gun/Gun_down_shoot-Sheet3.png', { frameWidth: 5, frameHeight: 17 });
  scene.load.spritesheet('p_rifle_shoot_side', C + 'Guns/Gun/Gun_side_shoot-Sheet3.png', { frameWidth: 18, frameHeight: 10 });
  scene.load.spritesheet('p_rifle_shoot_up', C + 'Guns/Gun/Gun_up_shoot-Sheet3.png', { frameWidth: 5, frameHeight: 17 });
  scene.load.spritesheet('p_rifle_shoot_side-left', C + 'Guns/Gun/Gun_side-left_shoot-Sheet3.png', { frameWidth: 18, frameHeight: 10 });

  // --- ENEMIES ---
  // Zombie Small (zs)
  scene.load.spritesheet('zs_idle_Down', E + 'Zombie_Small/Zombie_Small_Down_Idle-Sheet6.png', { frameWidth: 13, frameHeight: 16 });
  scene.load.spritesheet('zs_idle_Side', E + 'Zombie_Small/Zombie_Small_Side_Idle-Sheet6.png', { frameWidth: 11, frameHeight: 15 });
  scene.load.spritesheet('zs_idle_Up', E + 'Zombie_Small/Zombie_Small_Up_Idle-Sheet6.png', { frameWidth: 13, frameHeight: 15 });
  scene.load.spritesheet('zs_idle_Side-left', E + 'Zombie_Small/Zombie_Small_Side-left_Idle-Sheet6.png', { frameWidth: 11, frameHeight: 15 });

  scene.load.spritesheet('zs_walk_Down', E + 'Zombie_Small/Zombie_Small_Down_walk-Sheet6.png', { frameWidth: 12, frameHeight: 16 });
  scene.load.spritesheet('zs_walk_Side', E + 'Zombie_Small/Zombie_Small_Side_Walk-Sheet6.png', { frameWidth: 13, frameHeight: 15 });
  scene.load.spritesheet('zs_walk_Up', E + 'Zombie_Small/Zombie_Small_Up_Walk-Sheet6.png', { frameWidth: 13, frameHeight: 16 });
  scene.load.spritesheet('zs_walk_Side-left', E + 'Zombie_Small/Zombie_Small_Side-left_Walk-Sheet6.png', { frameWidth: 13, frameHeight: 15 });

  scene.load.spritesheet('zs_attack_Down', E + 'Zombie_Small/Zombie_Small_Down_First-Attack-Sheet4.png', { frameWidth: 13, frameHeight: 16 });
  scene.load.spritesheet('zs_attack_Side', E + 'Zombie_Small/Zombie_Small_Side_First-Attack-Sheet4.png', { frameWidth: 11, frameHeight: 14 });
  scene.load.spritesheet('zs_attack_Up', E + 'Zombie_Small/Zombie_Small_Up_First-Attack-Sheet4.png', { frameWidth: 14, frameHeight: 15 });
  scene.load.spritesheet('zs_attack_Side-left', E + 'Zombie_Small/Zombie_Small_Side-left_First-Attack-Sheet4.png', { frameWidth: 11, frameHeight: 14 });

  // Zombie Small death
  scene.load.spritesheet('zs_death_Side', E + 'Zombie_Small/Zombie_Small_Side_First-Death-Sheet6.png', { frameWidth: 16, frameHeight: 14 });
  scene.load.spritesheet('zs_death_Side-left', E + 'Zombie_Small/Zombie_Small_Side-left_First-Death-Sheet6.png', { frameWidth: 16, frameHeight: 14 });

  // Zombie Big (zb)
  scene.load.spritesheet('zb_idle_Down', E + 'Zombie_Big/Zombie_Big_Down_Idle-Sheet6.png', { frameWidth: 16, frameHeight: 23 });
  scene.load.spritesheet('zb_idle_Side', E + 'Zombie_Big/Zombie_Big_Side_Idle-Sheet6.png', { frameWidth: 16, frameHeight: 22 });
  scene.load.spritesheet('zb_idle_Up', E + 'Zombie_Big/Zombie_Big_Up_Idle-Sheet6.png', { frameWidth: 16, frameHeight: 22 });
  scene.load.spritesheet('zb_idle_Side-left', E + 'Zombie_Big/Zombie_Big_Side-left_Idle-Sheet6.png', { frameWidth: 16, frameHeight: 22 });

  scene.load.spritesheet('zb_walk_Down', E + 'Zombie_Big/Zombie_Big_Down_Walk-Sheet8.png', { frameWidth: 16, frameHeight: 24 });
  scene.load.spritesheet('zb_walk_Side', E + 'Zombie_Big/Zombie_Big_Side_Walk-Sheet8.png', { frameWidth: 16, frameHeight: 24 });
  scene.load.spritesheet('zb_walk_Up', E + 'Zombie_Big/Zombie_Big_Up_Walk-Sheet8.png', { frameWidth: 16, frameHeight: 24 });
  scene.load.spritesheet('zb_walk_Side-left', E + 'Zombie_Big/Zombie_Big_Side-left_Walk-Sheet8.png', { frameWidth: 16, frameHeight: 24 });

  scene.load.spritesheet('zb_attack_Down', E + 'Zombie_Big/Zombie_Big_Down_First-Attack-Sheet8.png', { frameWidth: 20, frameHeight: 25 });
  scene.load.spritesheet('zb_attack_Side', E + 'Zombie_Big/Zombie_Big_Side_First-Attack-Sheet8.png', { frameWidth: 23, frameHeight: 23 });
  scene.load.spritesheet('zb_attack_Up', E + 'Zombie_Big/Zombie_Big_Up_First-Attack-Sheet8.png', { frameWidth: 18, frameHeight: 24 });
  scene.load.spritesheet('zb_attack_Side-left', E + 'Zombie_Big/Zombie_Big_Side-left_First-Attack-Sheet8.png', { frameWidth: 23, frameHeight: 23 });

  // Zombie Big death
  scene.load.spritesheet('zb_death_Side', E + 'Zombie_Big/Zombie_Big_Side_First-Death-Sheet7.png', { frameWidth: 29, frameHeight: 23 });
  scene.load.spritesheet('zb_death_Side-left', E + 'Zombie_Big/Zombie_Big_Side-left_First-Death-Sheet7.png', { frameWidth: 29, frameHeight: 23 });

  // Zombie Axe (za)
  scene.load.spritesheet('za_idle_Down', E + 'Zombie_Axe/Zombie_Axe_Down_Idle-Sheet6.png', { frameWidth: 13, frameHeight: 18 });
  scene.load.spritesheet('za_idle_Side', E + 'Zombie_Axe/Zombie_Axe_Side_Idle-Sheet6.png', { frameWidth: 22, frameHeight: 18 });
  scene.load.spritesheet('za_idle_Up', E + 'Zombie_Axe/Zombie_Axe_Up_Idle-Sheet6.png', { frameWidth: 12, frameHeight: 23 });
  scene.load.spritesheet('za_idle_Side-left', E + 'Zombie_Axe/Zombie_Axe_Side-left_Idle-Sheet6.png', { frameWidth: 22, frameHeight: 18 });

  scene.load.spritesheet('za_walk_Down', E + 'Zombie_Axe/Zombie_Axe_Down_Walk-Sheet8.png', { frameWidth: 12, frameHeight: 20 });
  scene.load.spritesheet('za_walk_Side', E + 'Zombie_Axe/Zombie_Axe_Side_Walk-Sheet8.png', { frameWidth: 21, frameHeight: 19 });
  scene.load.spritesheet('za_walk_Up', E + 'Zombie_Axe/Zombie_Axe_Up_Walk-Sheet8.png', { frameWidth: 12, frameHeight: 23 });
  scene.load.spritesheet('za_walk_Side-left', E + 'Zombie_Axe/Zombie_Axe_Side-left_Walk-Sheet8.png', { frameWidth: 21, frameHeight: 19 });

  scene.load.spritesheet('za_attack_Down', E + 'Zombie_Axe/Zombie_Axe_Down_First-Attack-Sheet7.png', { frameWidth: 15, frameHeight: 21 });
  scene.load.spritesheet('za_attack_Side', E + 'Zombie_Axe/Zombie_Axe_Side_First-Attack-Sheet7.png', { frameWidth: 25, frameHeight: 19 });
  scene.load.spritesheet('za_attack_Up', E + 'Zombie_Axe/Zombie_Axe_Up_First-Attack-Sheet7.png', { frameWidth: 13, frameHeight: 25 });
  scene.load.spritesheet('za_attack_Side-left', E + 'Zombie_Axe/Zombie_Axe_Side-left_First-Attack-Sheet7.png', { frameWidth: 25, frameHeight: 19 });

  scene.load.spritesheet('za_death_Side', E + 'Zombie_Axe/Zombie_Axe_Side_First-Death-Sheet6.png', { frameWidth: 27, frameHeight: 18 });
  scene.load.spritesheet('za_death_Side-left', E + 'Zombie_Axe/Zombie_Axe_Side-left_First-Death-Sheet6.png', { frameWidth: 27, frameHeight: 18 });

  // --- MAP & TILESETS ---
  scene.load.spritesheet('bg_tileset_sh', T + 'Background_Green_TileSet.png', { frameWidth: 16, frameHeight: 16 });
  scene.load.spritesheet('roof_tileset_sh', T + 'Roof_TileSet.png', { frameWidth: 16, frameHeight: 16 });
  scene.load.spritesheet('walls_tileset_sh', T + 'Brick-Wall_TileSet.png', { frameWidth: 16, frameHeight: 16 });

  // Buildings
  scene.load.spritesheet('bld_gray_sh', T + 'Buildings/Buildings_gray_TileSet.png', { frameWidth: 16, frameHeight: 16 });
  scene.load.spritesheet('bld_beige_sh', T + 'Buildings/Buildings_beige_TileSet.png', { frameWidth: 16, frameHeight: 16 });

  // --- OBJECTS ---
  scene.load.image('tree_1', O + 'Nature/Green/Tree_1_Spruce_Green.png');
  scene.load.image('tree_2', O + 'Nature/Green/Tree_3_Normal_Green.png');
  scene.load.image('tree_3', O + 'Nature/Green/Tree_10_Small-oak_Green.png');
  scene.load.image('bush_1', O + 'Nature/Green/Bush_1_Green.png');
  scene.load.image('bush_2', O + 'Nature/Green/Bush_2_Green.png');

  // Props
  scene.load.image('trashcan_1', O + 'Trash-can_1.png');
  scene.load.image('trashcan_2', O + 'Trash-can_2.png');
  scene.load.image('barrel_blue', O + 'Barrel_blue_1.png');
  scene.load.image('barrel_red', O + 'Barrel_red_1.png');
  scene.load.image('bench_down', O + 'Bench_1_down.png');
  scene.load.image('streetlight_down', O + 'Street-Light_3_Down.png');
  scene.load.image('hydrant', O + 'Hydrant_1_red.png');
  scene.load.image('traffic_cone', O + 'Traffic-cone.png');
  scene.load.image('manhole', O + 'Manhole.png');
  scene.load.image('garbage_bin_1', O + 'Garbage-Bin_1.png');
  scene.load.image('garbage_bin_2', O + 'Garbage-Bin_2.png');

  // Vehicles (Fixed Paths)
  scene.load.image('car_1_blue', O + 'Vehicles/Normal/Car_1/Car_1_Blue.png');
  scene.load.image('car_1_red', O + 'Vehicles/Normal/Car_1/Car_1_Red.png');
  scene.load.image('car_van', O + 'Vehicles/Normal/Car_3_Van/Car_3_Blue_Van.png');
  scene.load.image('car_truck', O + 'Vehicles/Normal/Car_7_Truck/Car_7_Gray_Truck.png');

  // --- ITEMS ---
  scene.load.image('item_food', O + 'Pickable/Canned-food.png');
  scene.load.image('item_soup', O + 'Pickable/Canned-soup.png');
  scene.load.image('item_chips_red', O + 'Chips-pack_Red.png');
  scene.load.image('item_chips_yellow', O + 'Chips-pack_Yellow.png');
  scene.load.image('item_bandage', O + 'Pickable/Bandage.png');
  scene.load.image('item_bat', O + 'Pickable/Bat.png');
  scene.load.image('item_pistol', O + 'Pickable/Pistol.png');
  scene.load.image('item_shotgun', O + 'Pickable/Shotgun.png');
  scene.load.image('item_rifle', O + 'Pickable/Gun.png');
  scene.load.image('item_ammo_blue', O + 'Pickable/Bullet-box_1_Blue.png');
  scene.load.image('item_ammo_red', O + 'Pickable/Bullet-box_1_Red.png');
  scene.load.image('item_ammo_green', O + 'Pickable/Bullet-box_1_Green.png');

  // --- UI ---
  scene.load.image('ui_cell', 'assets/UI/Inventory/Inventory-Cell.png');
  scene.load.image('ui_cell_selected', 'assets/UI/Inventory/Inventory-Chosen.png');
  scene.load.image('ui_inv_bar', 'assets/UI/Inventory/Quick-Access-Inventory.png');

  // UI Inventory Icons (pixel art — for HUD slots)
  const UI_OBJ = 'assets/UI/Inventory/Objects/';
  scene.load.image('icon_bandage', UI_OBJ + 'Icon_Bandage.png');
  scene.load.image('icon_bat', UI_OBJ + 'Icon_Bat.png');
  scene.load.image('icon_ammo_blue', UI_OBJ + 'Icon_Bullet-box_Blue.png');
  scene.load.image('icon_ammo_green', UI_OBJ + 'Icon_Bullet-box_Green.png');
  scene.load.image('icon_ammo_red', UI_OBJ + 'Icon_Bullet-box_Red.png');
  scene.load.image('icon_food', UI_OBJ + 'Icon_Canned-food.png');
  scene.load.image('icon_soup', UI_OBJ + 'Icon_Canned-soup.png');
  scene.load.image('icon_medkit', UI_OBJ + 'Icon_First-Aid-Kit_Red.png');
  scene.load.image('icon_rifle', UI_OBJ + 'Icon_Gun.png');
  scene.load.image('icon_pistol', UI_OBJ + 'Icon_Pistol.png');
  scene.load.image('icon_shotgun', UI_OBJ + 'Icon_Shotgun.png');

  // --- EFFECTS ---
  scene.load.image('bullet_pistol', C + 'Guns/Bullets/Pistol-bullet_Bullet.png');
  scene.load.image('bullet_gun', C + 'Guns/Bullets/Gun-bullet_Bullet.png');
  scene.load.image('bullet_shotgun', C + 'Guns/Bullets/Shotgun-bullet.png');

  // --- ENVIRONMENT ---
  scene.load.image('vending_blue', O + 'Vending-machine_Blue.png');
  scene.load.image('vending_red', O + 'Vending-machine_Red.png');
  scene.load.image('shopping_cart', O + 'Shopping-cart.png');
  scene.load.image('refrigerator', O + 'Refrigerator.png');
  scene.load.image('stop_sign', O + 'Stop-sign_Down_1.png');
  scene.load.image('tire', O + 'Tire_1.png');
  scene.load.image('trash_bag_1', O + 'Trash-bag_1.png');
  scene.load.image('trash_bag_2', O + 'Trash-bag_2.png');
  scene.load.image('cardboard_1', O + 'Cardboard_1.png');
  scene.load.image('cardboard_2', O + 'Cardboard_2.png');
  scene.load.image('pallet', O + 'Pallet_1.png');
  scene.load.image('iron_beam', O + 'Iron-beam.png');
  scene.load.image('metal_plates', O + 'Metal-Plates.png');
  scene.load.image('car_rust_blue', O + 'Vehicles/Rust/Car_1_Rust/Car_1_Rust_Blue.png');
  scene.load.image('car_rust_red', O + 'Vehicles/Rust/Car_1_Rust/Car_1_Rust_Red.png');
  scene.load.image('car_scrap_green', O + 'Vehicles/Overgrown/Car_6_Overgrown_Scrap/Green/Car_6_Overgrown_Green_Red_Scrap.png');
  scene.load.image('car_4_gray', O + 'Vehicles/Normal/Car_4/Car_4_Gray.png');
  scene.load.image('car_bus_red', O + 'Vehicles/Normal/Car_8_Bus/Car_8_Red_Bus.png');
  scene.load.image('container_gray', O + 'Container/Container_3_Gray_Horizontal.png');
  scene.load.image('container_red', O + 'Container/Container_7_Red_Horizontal.png');
  scene.load.image('container_green', O + 'Container/Container_11_Green_Horizontal.png');
  scene.load.spritesheet('wire_fence_ts', T + 'Wire-Fence/Wire-Fence_TileSet.png', { frameWidth: 16, frameHeight: 16 });
  scene.load.spritesheet('iron_fence_ts', T + 'Iron-Fence_TileSet.png', { frameWidth: 16, frameHeight: 16 });
  scene.load.image('door_beige', O + 'Buildings/Door_1_Beige.png');
  scene.load.image('door_boarded', O + 'Buildings/Door_3_Boarded-up_Beige.png');
  scene.load.image('door_metal', O + 'Buildings/Door_4_Metal.png');
  scene.load.image('window_broken', O + 'Windows/Window_1_broken_wood.png');
  scene.load.image('window_normal', O + 'Windows/Window_9_gray.png');
  scene.load.image('window_boarded', O + 'Windows/Window_5_Boarded-up_wood.png');
  scene.load.image('tree_big', O + 'Nature/Green/Tree_5_Big_Green.png');
  scene.load.image('tree_pine', O + 'Nature/Green/Tree_6_Pine_Big_Green.png');
  scene.load.image('tree_birch', O + 'Nature/Green/Tree_7_Birch_Green.png');
  scene.load.image('tree_birch2', O + 'Nature/Green/Tree_8_Birch_Green.png');
  scene.load.image('tree_sparse', O + 'Nature/Green/Tree_2_Spruce-Sparse_Green.png');
  scene.load.image('tree_smalloak2', O + 'Nature/Green/Tree_9_Small-oak_Green.png');
  scene.load.image('grass_patch', O + 'Nature/Green/Grass_1_Green.png');
  scene.load.image('grass_2', O + 'Nature/Green/Grass_2_Green.png');
  scene.load.image('rock_grass', O + 'Nature/Green/Rocks/Rock-grass.png');
  scene.load.spritesheet('bld_dark_sh', T + 'Buildings/Buildings_dark_TileSet.png', { frameWidth: 16, frameHeight: 16 });
  scene.load.spritesheet('bld_white_sh', T + 'Buildings/Buildings_white_TileSet.png', { frameWidth: 16, frameHeight: 16 });

  // Extra props for organic map
  scene.load.image('bench_side', O + 'Bench_3_side.png');
  scene.load.image('bench_up', O + 'Bench_5_up.png');
  scene.load.image('streetlight_side', O + 'Street-Light_1_Side.png');
  scene.load.image('streetlight_up', O + 'Street-Light_2_Up.png');
  scene.load.image('stop_sign_side', O + 'Stop-sign_Side_3.png');
  scene.load.image('tire_grass', O + 'Tire_2_Grass_Green.png');
  scene.load.image('bench_overgrown', O + 'Bench_2_down_Overgrown_Green.png');
  scene.load.image('stop_sign_overgrown', O + 'Stop-sign_Down_2_Overgrown_Green.png');
  scene.load.image('gray_brick', O + 'Gray-brick.png');
  scene.load.image('gray_brick_debris', O + 'Gray-brick_Debris.png');
  scene.load.image('destroyed_wall', O + 'Buildings/Destroyed-wall_not-corner.png');
  scene.load.image('door_ajar', O + 'Buildings/Door_2_Ajar_Beige.png');
  scene.load.image('door_rusty', O + 'Buildings/Door_5_Rusty_Metal.png');
  scene.load.image('barrel_rust_blue', O + 'Barrel_rust_blue_1.png');
  scene.load.image('barrel_rust_red', O + 'Barrel_rust_red_1.png');
  scene.load.image('garbage_bin_3', O + 'Garbage-Bin_3.png');
  scene.load.image('washing_machine', O + 'Washing-machine.png');

  // --- NEW WEAPON ITEM SPRITES ---
  const G = 'assets/Guns_V1.01 - Commission - Copy/01 - Individual sprites/Guns/';
  scene.load.image('item_smg', G + 'Submachine - MP5A3 [80x48].png');
  scene.load.image('item_revolver', G + 'Revolver - Colt 45 [64x32].png');
  scene.load.image('item_ak47', G + 'AK 47 [96x48].png');
  scene.load.image('item_rpg', G + 'Bazooka - M20 [192x32].png');

  // Melee weapon pickable sprites
  scene.load.image('item_knife', 'assets/FreePixelMeleeWeaponPack/Weapons/9.png');
  scene.load.image('item_axe', 'assets/Enemies/Zombie_Axe/Axe/Axe_Down_Landed.png');

  // --- CITY PROPS TILESET (CP V1.0.4) - 1024x1024 @16x16 = 4096 frames ---
  scene.load.spritesheet('cp_city_sh', 'assets/Tiles/cp_city.png', { frameWidth: 16, frameHeight: 16 });
}

export function createAnimations(scene: Phaser.Scene) {
  const dirs = ['down', 'side', 'up', 'side-left'];

  // Player animations
  dirs.forEach(dir => {
    if (!scene.anims.exists(`p_idle_${dir}`)) {
      scene.anims.create({
        key: `p_idle_${dir}`,
        frames: scene.anims.generateFrameNumbers(`p_idle_${dir}`, { start: 0, end: 5 }),
        frameRate: 8, repeat: -1
      });
    }
    if (!scene.anims.exists(`p_run_${dir}`)) {
      scene.anims.create({
        key: `p_run_${dir}`,
        frames: scene.anims.generateFrameNumbers(`p_run_${dir}`, { start: 0, end: 5 }),
        frameRate: 12, repeat: -1
      });
    }
    if (!scene.anims.exists(`p_punch_${dir}`)) {
      scene.anims.create({
        key: `p_punch_${dir}`,
        frames: scene.anims.generateFrameNumbers(`p_punch_${dir}`, { start: 0, end: 3 }),
        frameRate: 15, repeat: 0
      });
    }
  });

  // Pre-create animations for all weapon states
  dirs.forEach(dir => {
    const weapons = ['pistol', 'shotgun', 'rifle', 'bat'];
    weapons.forEach(w => {
      if (!scene.anims.exists(`p_${w}_idle_${dir}`) && scene.textures.exists(`p_${w}_move_${dir}`)) {
        scene.anims.create({
          key: `p_${w}_idle_${dir}`,
          frames: scene.anims.generateFrameNumbers(`p_${w}_move_${dir}`, { start: 0, end: 5 }),
          frameRate: 8, repeat: -1
        });
      }
      if (!scene.anims.exists(`p_${w}_run_${dir}`) && scene.textures.exists(`p_${w}_move_${dir}`)) {
        scene.anims.create({
          key: `p_${w}_run_${dir}`,
          frames: scene.anims.generateFrameNumbers(`p_${w}_move_${dir}`, { start: 0, end: 5 }),
          frameRate: 12, repeat: -1
        });
      }

      // Attacks
      const sheet = w === 'bat' ? `p_bat_attack_${dir}` : `p_${w}_shoot_${dir}`;
      const frames = w === 'bat' ? 3 : 2;
      
      if (!scene.anims.exists(`p_${w}_attack_${dir}`) && scene.textures.exists(sheet)) {
        scene.anims.create({
          key: `p_${w}_attack_${dir}`,
          frames: scene.anims.generateFrameNumbers(sheet, { start: 0, end: frames }),
          frameRate: w === 'bat' ? 12 : 15, repeat: 0
        });
      }
    });
  });



  // Zombie Small - all directions
  ['Down', 'Side', 'Up', 'Side-left'].forEach(dir => {
    if (!scene.anims.exists(`zs_idle_${dir}`) && scene.textures.exists(`zs_idle_${dir}`)) {
      scene.anims.create({
        key: `zs_idle_${dir}`,
        frames: scene.anims.generateFrameNumbers(`zs_idle_${dir}`, { start: 0, end: 5 }),
        frameRate: 6, repeat: -1
      });
    }
    if (!scene.anims.exists(`zs_walk_${dir}`) && scene.textures.exists(`zs_walk_${dir}`)) {
      scene.anims.create({
        key: `zs_walk_${dir}`,
        frames: scene.anims.generateFrameNumbers(`zs_walk_${dir}`, { start: 0, end: 5 }),
        frameRate: 8, repeat: -1
      });
    }
    if (!scene.anims.exists(`zs_attack_${dir}`) && scene.textures.exists(`zs_attack_${dir}`)) {
      scene.anims.create({
        key: `zs_attack_${dir}`,
        frames: scene.anims.generateFrameNumbers(`zs_attack_${dir}`, { start: 0, end: 3 }),
        frameRate: 10, repeat: 0
      });
    }
  });

  // Zombie Small death (only Side and Side-left available)
  ['Side', 'Side-left'].forEach(dir => {
    if (!scene.anims.exists(`zs_death_${dir}`) && scene.textures.exists(`zs_death_${dir}`)) {
      scene.anims.create({
        key: `zs_death_${dir}`,
        frames: scene.anims.generateFrameNumbers(`zs_death_${dir}`, { start: 0, end: 5 }),
        frameRate: 10, repeat: 0
      });
    }
  });

  // Zombie Big - all directions
  ['Down', 'Side', 'Up', 'Side-left'].forEach(dir => {
    if (!scene.anims.exists(`zb_idle_${dir}`) && scene.textures.exists(`zb_idle_${dir}`)) {
      scene.anims.create({
        key: `zb_idle_${dir}`,
        frames: scene.anims.generateFrameNumbers(`zb_idle_${dir}`, { start: 0, end: 5 }),
        frameRate: 6, repeat: -1
      });
    }
    if (!scene.anims.exists(`zb_walk_${dir}`) && scene.textures.exists(`zb_walk_${dir}`)) {
      scene.anims.create({
        key: `zb_walk_${dir}`,
        frames: scene.anims.generateFrameNumbers(`zb_walk_${dir}`, { start: 0, end: 7 }),
        frameRate: 6, repeat: -1
      });
    }
    if (!scene.anims.exists(`zb_attack_${dir}`) && scene.textures.exists(`zb_attack_${dir}`)) {
      scene.anims.create({
        key: `zb_attack_${dir}`,
        frames: scene.anims.generateFrameNumbers(`zb_attack_${dir}`, { start: 0, end: 7 }),
        frameRate: 10, repeat: 0
      });
    }
  });

  // Zombie Big death
  ['Side', 'Side-left'].forEach(dir => {
    if (!scene.anims.exists(`zb_death_${dir}`) && scene.textures.exists(`zb_death_${dir}`)) {
      scene.anims.create({
        key: `zb_death_${dir}`,
        frames: scene.anims.generateFrameNumbers(`zb_death_${dir}`, { start: 0, end: 6 }),
        frameRate: 10, repeat: 0
      });
    }
  });

  // Zombie Axe - all directions
  ['Down', 'Side', 'Up', 'Side-left'].forEach(dir => {
    if (!scene.anims.exists(`za_idle_${dir}`) && scene.textures.exists(`za_idle_${dir}`)) {
      scene.anims.create({
        key: `za_idle_${dir}`,
        frames: scene.anims.generateFrameNumbers(`za_idle_${dir}`, { start: 0, end: 5 }),
        frameRate: 6, repeat: -1
      });
    }
    if (!scene.anims.exists(`za_walk_${dir}`) && scene.textures.exists(`za_walk_${dir}`)) {
      scene.anims.create({
        key: `za_walk_${dir}`,
        frames: scene.anims.generateFrameNumbers(`za_walk_${dir}`, { start: 0, end: 7 }),
        frameRate: 8, repeat: -1
      });
    }
    if (!scene.anims.exists(`za_attack_${dir}`) && scene.textures.exists(`za_attack_${dir}`)) {
      scene.anims.create({
        key: `za_attack_${dir}`,
        frames: scene.anims.generateFrameNumbers(`za_attack_${dir}`, { start: 0, end: 6 }),
        frameRate: 10, repeat: 0
      });
    }
  });

  // Zombie Axe death
  ['Side', 'Side-left'].forEach(dir => {
    if (!scene.anims.exists(`za_death_${dir}`) && scene.textures.exists(`za_death_${dir}`)) {
      scene.anims.create({
        key: `za_death_${dir}`,
        frames: scene.anims.generateFrameNumbers(`za_death_${dir}`, { start: 0, end: 5 }),
        frameRate: 10, repeat: 0
      });
    }
  });
}
