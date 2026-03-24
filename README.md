# 🧟 Zombieland

Juego multijugador de supervivencia zombie en 2D pixel art. Explora una ciudad post-apocalíptica, saquea edificios, encuentra armas, conduce vehículos y sobrevive a oleadas interminables de zombies — solo o con amigos.

**[▶ Jugar online](https://zombieland.mvasl.net)**

---

## Características

- **Multiplayer en tiempo real** — Salas de hasta 8 jugadores con chat, leaderboard y kill feed
- **+7 armas** — Desde puños y cuchillos hasta AK-47, escopeta y RPG con explosiones
- **Mapa completo** — Ciudad con base militar, hospital, comisaría, gasolinera, búnker subterráneo y más
- **Vehículos** — Conduce coches para atropellar zombies o escapar
- **3 tipos de zombies** — Pequeños rápidos, grandes tanques y zombies con hacha
- **Sistema de infección** — Los zombies pueden infectarte, necesitarás pastillas para curarte
- **HUD completo** — Vida, stamina, hambre, inventario de 9 slots, minimapa y leaderboard

---

## Controles

| Tecla | Acción |
|-------|--------|
| `W` `A` `S` `D` | Moverse |
| `SHIFT` | Sprint (gasta stamina) |
| `Click izq.` | Atacar / Disparar |
| `E` | Interactuar (entrar/salir vehículos, puertas, loot) |
| `R` | Usar item del slot seleccionado |
| `1` - `9` | Cambiar slot de inventario |
| `T` | Abrir chat (multijugador) |

---

## Armas

### Cuerpo a cuerpo

| Arma | Daño | Cadencia |
|------|------|----------|
| Puños | 5 | 400ms |
| Cuchillo | 12 | 300ms |
| Bate | 18 | 500ms |
| Hacha | 25 | 700ms |

### A distancia

| Arma | Daño | Cadencia | Munición |
|------|------|----------|----------|
| Pistola | 20 | 350ms | 9mm |
| Revólver | 45 | 700ms | 9mm |
| SMG | 12 | 80ms | 9mm |
| Escopeta | 9×5 | 850ms | Cartuchos |
| Rifle | 30 | 200ms | Rifle |
| AK-47 | 22 | 110ms | Rifle |
| RPG | 120 | 2500ms | Cohetes |

---

## Mapa

La ciudad incluye:

- **Base Militar** (noroeste) — Zona vallada con armería y entrada al búnker
- **Búnker subterráneo** — Armería, laboratorio, enfermería, comedor, barracones y sala de mando. El mejor loot del juego
- **Hospital y Laboratorio** (noreste) — Botiquines y pastillas
- **Comisaría** — Armas
- **Farmacia** — Suministros médicos
- **Supermercado** — Comida variada
- **Gasolinera** — Tienda con loot
- **Zona industrial** — Fábrica, almacenes, contenedores
- **Zona residencial** — Casas, iglesia, taller
- **Cementerio, bomberos, ruinas, escuela** y más

---

## Cómo jugar en tu PC

### Requisitos previos

- [Node.js](https://nodejs.org/) v18+
- [pnpm](https://pnpm.io/) (o npm/yarn)

### 1. Clonar el repositorio

```bash
git clone https://github.com/marcosvil01/zombieland.git
cd zombieland
```

### 2. Instalar dependencias

```bash
# Cliente (raíz del proyecto)
pnpm install

# Servidor WebSocket
cd server
pnpm install
cd ..
```

### 3. Iniciar el servidor WebSocket

```bash
cd server
pnpm dev
```

El servidor arranca en `http://localhost:3001`.

### 4. Iniciar el cliente (en otra terminal)

```bash
pnpm dev
```

Vite abre el juego en `http://localhost:5173`. Abre esa URL en tu navegador y listo.

### Jugar con amigos en LAN

Si quieres que amigos en tu red local se conecten:

1. Busca tu IP local (ejecuta `ipconfig` en Windows o `ip a` en Linux)
2. Inicia Vite con `--host`:
   ```bash
   pnpm dev -- --host
   ```
3. Tus amigos abren `http://TU_IP:5173` en su navegador
4. Asegúrate de que el puerto `3001` (WebSocket) también sea accesible

> **Nota:** El cliente se conecta al servidor WebSocket en la misma URL base. Si estás en LAN, puede que necesites ajustar la URL del socket en el código fuente (`src/network/SocketManager.ts`).

---

### Docker (producción)

```bash
docker compose up --build
```

Levanta nginx (puerto 8080) sirviendo el juego y el servidor WebSocket (puerto 3001).

---

## Tech Stack

| Componente | Tecnología |
|------------|------------|
| Motor de juego | [Phaser 3](https://phaser.io/) |
| Lenguaje | TypeScript |
| Bundler | [Vite](https://vite.dev/) |
| Multiplayer | [Socket.io](https://socket.io/) |
| Servidor | Node.js |
| Deploy | Docker + Nginx + Traefik |

---

## Estructura del proyecto

```
zombieland/
├── src/                  # Cliente del juego
│   ├── main.ts           # Entry point (config de Phaser)
│   ├── scenes/           # GameScene, MenuScene, HUDScene
│   ├── entities/         # Player, Zombie, Bullet, RemotePlayer
│   ├── network/          # SocketManager (conexión WebSocket)
│   ├── utils/            # AssetLoader, Definitions (armas, items)
│   └── world/            # CityMap (generación del mapa)
├── server/               # Servidor WebSocket
│   └── src/index.ts      # Relay multiplayer con salas
├── assets/               # Sprites pixel art
├── docker-compose.yml    # Stack de producción
├── Dockerfile            # Build del cliente (nginx)
└── vite.config.ts        # Config de Vite
```

---

## Licencia

Los sprites pixel art incluidos en `assets/` tienen licencias individuales de sus autores (CraftPix y otros). Consultá los archivos de licencia dentro de cada carpeta de assets.

El código fuente del juego es de uso libre para fines educativos y personales.
