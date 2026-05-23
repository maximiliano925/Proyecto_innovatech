# ============================================================
# STAGE 1: Builder - compila la app React
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias primero (cache de capas)
COPY package*.json ./
RUN npm ci --only=production=false

# Copiar código fuente y compilar
COPY . .

# Variable de entorno en tiempo de build
ARG REACT_APP_API_URL=http://localhost:8000
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# ============================================================
# STAGE 2: Runtime - Nginx sirve los archivos estáticos
# ============================================================
FROM nginx:1.25-alpine AS runtime

# Crear usuario no root para Nginx
RUN addgroup -g 1001 nginxgroup && \
    adduser -u 1001 -G nginxgroup -S nginxuser

# Copiar build generado en Stage 1
COPY --from=builder /app/build /usr/share/nginx/html

# Configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Permisos correctos para usuario no root
RUN chown -R nginxuser:nginxgroup /usr/share/nginx/html && \
    chown -R nginxuser:nginxgroup /var/cache/nginx && \
    chown -R nginxuser:nginxgroup /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown nginxuser:nginxgroup /var/run/nginx.pid

USER nginxuser

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -q --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
