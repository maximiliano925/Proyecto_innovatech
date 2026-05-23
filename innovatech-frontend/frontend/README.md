# 🖥️ Innovatech Chile — Frontend

> **ISY1101 – Introducción a Herramientas DevOps | EP2**  
> React 18 + Nginx contenedorizado con Docker, CI/CD via GitHub Actions.

---

## 📋 Descripción

Interfaz de usuario para la gestión de productos de **Innovatech Chile**, construida con **React 18** y servida en producción mediante **Nginx**. Se comunica con el Backend FastAPI desplegado en EC2.

---

## 🗂️ Estructura del Proyecto

```
frontend/
├── src/
│   ├── index.js         # Punto de entrada React
│   └── App.js           # Componente principal + CRUD
├── public/
│   └── index.html       # HTML base
├── .github/
│   └── workflows/
│       └── deploy.yml   # Pipeline CI/CD GitHub Actions
├── Dockerfile           # Multi-stage (Node builder + Nginx runtime)
├── docker-compose.yml   # Servicio frontend
├── nginx.conf           # Configuración Nginx personalizada
├── package.json         # Dependencias Node
├── .env.example         # Variables de referencia
└── README.md
```

---

## 🐳 Contenedorización

### Dockerfile — Multi-stage Build

| Stage | Imagen base | Propósito |
|-------|-------------|-----------|
| `builder` | `node:20-alpine` | Instala deps y compila la app React (`npm run build`) |
| `runtime` | `nginx:1.25-alpine` | Sirve archivos estáticos compilados |

**Buenas prácticas aplicadas:**
- ✅ Usuario no root (`nginxuser` con UID 1001)
- ✅ Solo los archivos del build llegan a la imagen final (no `node_modules`)
- ✅ `HEALTHCHECK` con wget
- ✅ Headers de seguridad en Nginx (`X-Frame-Options`, `X-Content-Type-Options`)
- ✅ Cache de assets estáticos (1 año para JS/CSS/imágenes)
- ✅ Soporte para React Router (`try_files` en Nginx)

### ¿Por qué multi-stage?

La imagen final **no contiene Node.js** ni `node_modules` (que pueden pesar >500MB). Solo incluye los archivos HTML/CSS/JS compilados (~10MB), lo que resulta en imágenes más seguras, pequeñas y rápidas de desplegar.

---

## 🚀 Uso Local

### 1. Clonar y configurar

```bash
git clone https://github.com/TU_USUARIO/innovatech-frontend.git
cd innovatech-frontend
cp .env.example .env
# Editar REACT_APP_API_URL con la IP de tu backend
```

### 2. Levantar con Docker Compose

```bash
docker compose up --build -d
```

### 3. Verificar

```bash
# Acceder en navegador
open http://localhost:80

# Ver logs de Nginx
docker compose logs -f frontend

# Estado del contenedor
docker compose ps
```

### 4. Desarrollo local (sin Docker)

```bash
npm install
npm start   # → http://localhost:3000
```

---

## ⚙️ Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `REACT_APP_API_URL` | URL pública del backend | `http://IP_EC2_BACKEND:8000` |

> ⚠️ Las variables `REACT_APP_*` se inyectan en **tiempo de build**. Si cambias la URL del backend, debes reconstruir la imagen.

---

## 🔄 Pipeline CI/CD — GitHub Actions

**Archivo:** `.github/workflows/deploy.yml`  
**Trigger:** Push a la rama `deploy`

### Flujo del Pipeline

```
push → rama deploy
    │
    ├── JOB 1: build-and-push
    │   ├── Checkout código
    │   ├── Setup Docker Buildx
    │   ├── Login Docker Hub
    │   └── Build con --build-arg REACT_APP_API_URL + Push
    │
    └── JOB 2: deploy
        ├── SSH a EC2 Frontend
        ├── Pull nueva imagen
        ├── docker compose up --force-recreate
        └── docker image prune
```

### GitHub Secrets requeridos

| Secret | Descripción |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Tu usuario de Docker Hub |
| `DOCKERHUB_TOKEN` | Access Token de Docker Hub |
| `EC2_FRONTEND_HOST` | IP pública de la instancia EC2 frontend |
| `EC2_USER` | Usuario SSH de EC2 |
| `EC2_SSH_KEY` | Llave privada `.pem` |
| `REACT_APP_API_URL` | URL del backend para inyectar en build |

---

## 🖥️ Despliegue en AWS EC2

### Preparar la instancia EC2 (Frontend)

```bash
# Conectarse a EC2
ssh -i tu-key.pem ec2-user@IP_EC2_FRONTEND

# Instalar Docker
sudo yum update -y && sudo yum install -y docker
sudo service docker start
sudo usermod -aG docker ec2-user

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Crear directorio y configurar
mkdir -p ~/app && cd ~/app
# Subir docker-compose.yml y .env
```

### Security Groups recomendados

| Puerto | Protocolo | Origen | Propósito |
|--------|-----------|--------|-----------|
| 80 | TCP | 0.0.0.0/0 | HTTP público (Frontend) |
| 443 | TCP | 0.0.0.0/0 | HTTPS (opcional) |
| 22 | TCP | Tu IP | SSH administración |

> 🔒 El **Backend NO debe ser accesible desde Internet**. Solo el Frontend EC2 debe poder comunicarse con él (subred privada o Security Group restrictivo).

---

## 🏗️ Arquitectura en AWS

```
Internet
    │
    ▼
[EC2 Frontend - pública]
  Nginx:80
  Container: innovatech_frontend
    │
    │ HTTP → puerto 8000
    ▼
[EC2 Backend - privada/restringida]
  FastAPI:8000
  Container: innovatech_backend
    │
    ▼
  PostgreSQL:5432
  Container: innovatech_db
  Volume: postgres_data
```

---

## 📝 Historial de Commits

```
feat: implementa tabla de productos con paginación
fix: corrige URL de API en variable de entorno
chore: optimiza Dockerfile con multi-stage build
docs: agrega instrucciones de despliegue en EC2
style: mejora diseño del formulario de productos
```

---

*Desarrollado para ISY1101 – Introducción a Herramientas DevOps – DuocUC 2025*
