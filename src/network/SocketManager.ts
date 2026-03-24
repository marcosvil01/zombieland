import { io, Socket } from 'socket.io-client';

export interface RemotePlayerData {
  id: string;
  name: string;
  x: number;
  y: number;
  facing: string;
  anim: string;
  weaponId: string;
  health: number;
  kills: number;
}

export interface RoomInfo {
  name: string;
  players: number;
  max: number;
}

type EventCb = (...args: any[]) => void;

export class SocketManager {
  private socket: Socket | null = null;
  public myId: string = '';
  public connected = false;
  private handlers = new Map<string, EventCb[]>();

  connect() {
    if (this.socket) return;

    // Connect to same origin — Traefik routes /socket.io/ to the WS server
    const url = window.location.origin;
    this.socket = io(url, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
    });

    this.socket.on('connect', () => {
      this.connected = true;
      this.myId = this.socket!.id || '';
      this.emit('_connected');
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      this.emit('_disconnected');
    });

    // Forward server events
    const events = ['joined', 'room_list', 'player_join', 'player_leave',
      'player_move', 'player_attack', 'player_kill', 'chat', 'error_msg',
      'pvp_hit', 'leaderboard', 'player_infected'];

    for (const ev of events) {
      this.socket.on(ev, (data: any) => this.emit(ev, data));
    }
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.connected = false;
  }

  // ── Send to server ────────────────────────────────────────────────
  listRooms() { this.socket?.emit('list_rooms'); }

  joinRoom(name: string, room: string) {
    this.socket?.emit('join', { name, room });
  }

  sendMove(x: number, y: number, facing: string, anim: string, weaponId: string, health: number) {
    this.socket?.volatile.emit('move', { x, y, facing, anim, weaponId, health });
  }

  sendAttack(angle: number, weaponId: string) {
    this.socket?.emit('attack', { angle, weaponId });
  }

  sendKill(zombieType?: string) { this.socket?.emit('kill', { zombieType: zombieType || 'zombie' }); }

  sendChat(message: string) { this.socket?.emit('chat', { message }); }

  sendPvpHit(targetId: string, damage: number) {
    this.socket?.emit('pvp_hit', { targetId, damage });
  }

  sendInfected(infected: boolean) {
    this.socket?.emit('player_infected', { infected });
  }

  requestLeaderboard() { this.socket?.emit('leaderboard'); }

  // ── Local event bus ───────────────────────────────────────────────
  on(event: string, cb: EventCb) {
    if (!this.handlers.has(event)) this.handlers.set(event, []);
    this.handlers.get(event)!.push(cb);
  }

  off(event: string, cb: EventCb) {
    const list = this.handlers.get(event);
    if (list) this.handlers.set(event, list.filter(h => h !== cb));
  }

  private emit(event: string, ...args: any[]) {
    this.handlers.get(event)?.forEach(cb => cb(...args));
  }
}

// Singleton
export const socketManager = new SocketManager();
