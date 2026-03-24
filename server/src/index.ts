import { createServer } from 'node:http';
import { Server, Socket } from 'socket.io';

// ── Types ──────────────────────────────────────────────────────────
interface PlayerState {
  id: string;
  name: string;
  room: string;
  x: number;
  y: number;
  facing: string;
  anim: string;
  weaponId: string;
  health: number;
  kills: number;
  isInfected: boolean;
  joinedAt: number;
  lastUpdate: number;
}

interface RoomInfo {
  players: Map<string, PlayerState>;
  createdAt: number;
}

// ── Config ─────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 3001;
const MAX_PLAYERS_PER_ROOM = 8;
const MAX_ROOMS = 20;
const TICK_RATE = 15; // broadcasts per second
const MAX_NAME_LEN = 16;
const RATE_LIMIT_MS = 30; // min ms between move packets

// ── State ──────────────────────────────────────────────────────────
const rooms = new Map<string, RoomInfo>();

// ── HTTP + Socket.io ───────────────────────────────────────────────
const httpServer = createServer((_req, res) => {
  // Health check endpoint
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'ok',
    rooms: rooms.size,
    players: Array.from(rooms.values()).reduce((n, r) => n + r.players.size, 0),
  }));
});

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
  pingInterval: 10000,
  pingTimeout: 5000,
  maxHttpBufferSize: 1e4, // 10KB max packet
  connectionStateRecovery: { maxDisconnectionDuration: 5000 },
});

// ── Helpers ────────────────────────────────────────────────────────
function sanitize(s: unknown, max: number): string {
  if (typeof s !== 'string') return '';
  return s.replace(/[<>"'&]/g, '').trim().slice(0, max);
}

function getRoomList(): { name: string; players: number; max: number }[] {
  return Array.from(rooms.entries()).map(([name, room]) => ({
    name,
    players: room.players.size,
    max: MAX_PLAYERS_PER_ROOM,
  }));
}

function getOrCreateRoom(name: string): RoomInfo | null {
  let room = rooms.get(name);
  if (room) return room.players.size < MAX_PLAYERS_PER_ROOM ? room : null;
  if (rooms.size >= MAX_ROOMS) return null;
  room = { players: new Map(), createdAt: Date.now() };
  rooms.set(name, room);
  return room;
}

// ── Connection ─────────────────────────────────────────────────────
io.on('connection', (socket: Socket) => {
  let player: PlayerState | null = null;

  // ── List rooms ───────────────────────────────────────────────────
  socket.on('list_rooms', () => {
    socket.emit('room_list', getRoomList());
  });

  // ── Join ─────────────────────────────────────────────────────────
  socket.on('join', (data: { name: string; room: string }) => {
    if (player) return; // already in a room

    const name = sanitize(data.name, MAX_NAME_LEN) || 'Survivor';
    const roomName = sanitize(data.room, 20) || 'Sala 1';
    const room = getOrCreateRoom(roomName);

    if (!room) {
      socket.emit('error_msg', { message: 'Sala llena o máximo de salas alcanzado' });
      return;
    }

    player = {
      id: socket.id,
      name,
      room: roomName,
      x: 1600, y: 1600, // spawn center
      facing: 'down',
      anim: 'idle',
      weaponId: 'fists',
      health: 100,
      kills: 0,
      isInfected: false,
      joinedAt: Date.now(),
      lastUpdate: Date.now(),
    };
    room.players.set(socket.id, player);
    socket.join(roomName);

    // Send current players to joiner
    const existingPlayers = Array.from(room.players.values())
      .filter(p => p.id !== socket.id)
      .map(p => ({ id: p.id, name: p.name, x: p.x, y: p.y, facing: p.facing, anim: p.anim, weaponId: p.weaponId, health: p.health, kills: p.kills }));

    socket.emit('joined', { id: socket.id, room: roomName, players: existingPlayers });

    // Notify others
    socket.to(roomName).emit('player_join', { id: socket.id, name, x: player.x, y: player.y });

    // Update room list for lobby watchers
    io.emit('room_list', getRoomList());
  });

  // ── Move ─────────────────────────────────────────────────────────
  socket.on('move', (data: { x: number; y: number; facing: string; anim: string; weaponId: string; health: number }) => {
    if (!player) return;

    // Rate limit
    const now = Date.now();
    if (now - player.lastUpdate < RATE_LIMIT_MS) return;
    player.lastUpdate = now;

    // Basic validation
    if (typeof data.x !== 'number' || typeof data.y !== 'number') return;
    if (data.x < 0 || data.y < 0 || data.x > 3200 || data.y > 4160) return;

    player.x = data.x;
    player.y = data.y;
    player.facing = sanitize(data.facing, 12) || player.facing;
    player.anim = sanitize(data.anim, 20) || player.anim;
    player.weaponId = sanitize(data.weaponId, 12) || player.weaponId;
    player.health = Math.max(0, Math.min(100, Number(data.health) || 0));

    socket.to(player.room).volatile.emit('player_move', {
      id: socket.id,
      x: player.x,
      y: player.y,
      facing: player.facing,
      anim: player.anim,
      weaponId: player.weaponId,
      health: player.health,
    });
  });

  // ── Attack ───────────────────────────────────────────────────────
  socket.on('attack', (data: { angle: number; weaponId: string }) => {
    if (!player) return;
    socket.to(player.room).emit('player_attack', {
      id: socket.id,
      angle: Number(data.angle) || 0,
      weaponId: sanitize(data.weaponId, 12),
    });
  });

  // ── Kill count ───────────────────────────────────────────────────
  socket.on('kill', (data?: { zombieType?: string }) => {
    if (!player) return;
    player.kills++;
    const zombieType = typeof data?.zombieType === 'string' ? sanitize(data.zombieType, 20) : 'zombie';
    io.to(player.room).emit('player_kill', { id: socket.id, name: player.name, kills: player.kills, zombieType });
  });

  // ── Chat ─────────────────────────────────────────────────────────
  socket.on('chat', (data: { message: string }) => {
    if (!player) return;
    const msg = sanitize(data.message, 120);
    if (!msg) return;
    io.to(player.room).emit('chat', { id: socket.id, name: player.name, message: msg });
  });

  // ── PVP Hit ──────────────────────────────────────────────────────
  socket.on('pvp_hit', (data: { targetId: string; damage: number }) => {
    if (!player) return;
    const room = rooms.get(player.room);
    if (!room) return;
    const target = room.players.get(data.targetId);
    if (!target) return;
    const dmg = Math.max(0, Math.min(50, Number(data.damage) || 0));
    io.to(data.targetId).emit('pvp_hit', { attackerId: socket.id, attackerName: player.name, damage: dmg });
  });

  // ── Infected status ──────────────────────────────────────────────
  socket.on('player_infected', (data: { infected: boolean }) => {
    if (!player) return;
    player.isInfected = !!data.infected;
    socket.to(player.room).emit('player_infected', { id: socket.id, infected: player.isInfected });
  });

  // ── Leaderboard request ──────────────────────────────────────────
  socket.on('leaderboard', () => {
    if (!player) return;
    const room = rooms.get(player.room);
    if (!room) return;
    const now = Date.now();
    const entries = Array.from(room.players.values())
      .map(p => ({ name: p.name, kills: p.kills, time: Math.floor((now - p.joinedAt) / 1000) }))
      .sort((a, b) => b.kills - a.kills)
      .slice(0, 10);
    socket.emit('leaderboard', entries);
  });

  // ── Disconnect ───────────────────────────────────────────────────
  socket.on('disconnect', () => {
    if (!player) return;
    const room = rooms.get(player.room);
    if (room) {
      room.players.delete(socket.id);
      socket.to(player.room).emit('player_leave', { id: socket.id });
      if (room.players.size === 0) rooms.delete(player.room);
    }
    io.emit('room_list', getRoomList());
    player = null;
  });
});

// ── Cleanup stale rooms every 5 min ───────────────────────────────
setInterval(() => {
  const now = Date.now();
  for (const [name, room] of rooms) {
    if (room.players.size === 0 && now - room.createdAt > 60_000) {
      rooms.delete(name);
    }
  }
}, 300_000);

// ── Start ──────────────────────────────────────────────────────────
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`[Zombieland WS] Listening on :${PORT} (tick=${TICK_RATE}hz, maxRooms=${MAX_ROOMS}, maxPlayers=${MAX_PLAYERS_PER_ROOM})`);
});
