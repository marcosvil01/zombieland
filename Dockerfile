# ============================================================
# Zombieland — Multi-stage Dockerfile
# Stage 1: Build con Node.js
# Stage 2: Serve con nginx:alpine (mínimo footprint)
# ============================================================

# ── Stage 1: Build ──────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY tsconfig.json vite.config.ts index.html ./
COPY src/ src/

RUN npm run build

# Copiar solo las carpetas de assets que usa el juego
COPY assets/Character/ dist/assets/Character/
COPY assets/Enemies/   dist/assets/Enemies/
COPY assets/Tiles/     dist/assets/Tiles/
COPY assets/Objects/   dist/assets/Objects/
COPY assets/UI/        dist/assets/UI/

# Weapon sprites from external packs
COPY ["assets/Guns_V1.01 - Commission - Copy/01 - Individual sprites/Guns/", "dist/assets/Guns_V1.01 - Commission - Copy/01 - Individual sprites/Guns/"]
COPY assets/FreePixelMeleeWeaponPack/Weapons/ dist/assets/FreePixelMeleeWeaponPack/Weapons/

# ── Stage 2: nginx production ──────────────────────────
FROM nginx:1.27-alpine-slim AS runner

# Quitar config default
RUN rm /etc/nginx/conf.d/default.conf

# Config custom hardened
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Non-root user + pre-create writable dirs
RUN addgroup -g 1001 -S app && \
    adduser -u 1001 -S app -G app && \
    chown -R app:app /usr/share/nginx/html && \
    mkdir -p /var/cache/nginx/client_temp /var/cache/nginx/proxy_temp \
             /var/cache/nginx/fastcgi_temp /var/cache/nginx/uwsgi_temp \
             /var/cache/nginx/scgi_temp && \
    chown -R app:app /var/cache/nginx && \
    touch /tmp/nginx.pid && chown app:app /tmp/nginx.pid

USER app

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/index.html || exit 1

CMD ["nginx", "-g", "daemon off;"]
