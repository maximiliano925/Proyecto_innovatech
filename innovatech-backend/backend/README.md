# 🔧 Innovatech Chile — Backend API

> **ISY1101 – Introducción a Herramientas DevOps | EP2**  
> FastAPI + PostgreSQL contenedorizado con Docker, CI/CD via GitHub Actions.

---

## 📋 Descripción

API REST construida con **FastAPI** y **PostgreSQL** para gestión de productos de Innovatech Chile. Expone endpoints CRUD consumidos por el frontend en React.

---

## 🗂️ Estructura del Proyecto

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py          # Punto de entrada FastAPI, rutas, CORS
│   ├── database.py      # Conexión SQLAlchemy a PostgreSQL
│   ├── models.py        # Modelos ORM (tablas)
│   ├── schemas.py       # Esquemas Pydantic (validación)
│   └── crud.py          # Operaciones de base de datos
├── .github/
│   └── workflows/
│       └── deploy.yml   # Pipeline CI/CD GitHub Actions
├── Dockerfile           # Multi-stage build (builder + runtime)
├── docker-compose.yml   # Stack completo (API + PostgreSQL)
├── requirements.txt     # Dependencias Python
├── init.sql             # Datos de ejemplo (seed)
├── .env.example         # Variables de entorno de referencia
└── README.md
```

---

## 🐳 Contenedorización

### Dockerfile — Multi-stage Build

El `Dockerfile` utiliza **dos etapas**:

| Stage | Imagen base | Propósito |
|-------|-------------|-----------|
| `builder` | `python:3.11-slim` | Instala dependencias en directorio aislado |
| `runtime` | `python:3.11-slim` | Imagen final mínima, solo lo necesario |

**Buenas prácticas aplicadas:**
- ✅ Usuario no root (`appuser` con UID 1001)
- ✅ Variables de entorno `PYTHONDONTWRITEBYTECODE` y `PYTHONUNBUFFERED`
- ✅ `HEALTHCHECK` incorporado
- ✅ `.dockerignore` para excluir archivos innecesarios
- ✅ Capas optimizadas (COPY requirements → pip install → COPY código)

### Docker Compose — Stack Completo

```yaml
Servicios:
  db       → PostgreSQL 15 (con named volume para persistencia)
  backend  → FastAPI (depende de db con health check)
```

**Volúmenes:**
- `postgres_data` → **Named volume**: gestionado por Docker, portátil, ideal para datos críticos de BD. La información persiste aunque el contenedor se elimine y recree.
- `./logs` → **Bind mount**: acceso directo a logs desde el host para debugging.

---

## 🚀 Uso Local

### 1. Clonar y configurar variables

```bash
git clone https://github.com/TU_USUARIO/innovatech-backend.git
cd innovatech-backend
cp .env.example .env
# Editar .env con tus credenciales
```

### 2. Levantar el stack completo

```bash
docker compose up --build -d
```

### 3. Verificar que todo funciona

```bash
# Estado de los contenedores
docker compose ps

# Logs en tiempo real
docker compose logs -f backend

# Health check
curl http://localhost:8000/health
# → {"status":"ok","service":"Innovatech Backend"}

# Listar productos
curl http://localhost:8000/api/products
```

### 4. Documentación interactiva

Accede a **http://localhost:8000/docs** (Swagger UI automático de FastAPI).

### 5. Detener servicios

```bash
docker compose down          # Detiene contenedores (datos persisten)
docker compose down -v       # Detiene Y elimina volúmenes (⚠️ borra BD)
```

---

## 🔌 Endpoints de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Estado del servicio |
| GET | `/api/products` | Listar todos los productos |
| GET | `/api/products/{id}` | Obtener un producto |
| POST | `/api/products` | Crear producto |
| PUT | `/api/products/{id}` | Actualizar producto |
| DELETE | `/api/products/{id}` | Eliminar producto |

---

## ⚙️ Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | Conexión PostgreSQL | `postgresql://user:pass@db:5432/innovatech` |
| `POSTGRES_USER` | Usuario PostgreSQL | `postgres` |
| `POSTGRES_PASSWORD` | Contraseña PostgreSQL | `s3cur3pass` |
| `POSTGRES_DB` | Nombre de la base de datos | `innovatech` |
| `ALLOWED_ORIGINS` | CORS origins permitidos | `http://IP_FRONTEND` |

> ⚠️ **Nunca subas el archivo `.env` al repositorio.** Está incluido en `.gitignore`.

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
    │   ├── Login Docker Hub (secrets)
    │   └── Build multi-stage + Push (latest + SHA tag)
    │
    └── JOB 2: deploy (depende de JOB 1)
        ├── SSH a EC2 Backend
        ├── Pull nueva imagen
        ├── docker compose up --force-recreate
        └── docker image prune
```

### GitHub Secrets requeridos

| Secret | Descripción |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Tu usuario de Docker Hub |
| `DOCKERHUB_TOKEN` | Access Token de Docker Hub (no la contraseña) |
| `EC2_BACKEND_HOST` | IP pública de la instancia EC2 backend |
| `EC2_USER` | Usuario SSH de EC2 (ej: `ec2-user` o `ubuntu`) |
| `EC2_SSH_KEY` | Contenido de la llave privada `.pem` |

### Cómo agregar los secrets

1. Ve a tu repo → **Settings → Secrets and variables → Actions**
2. Click en **New repository secret**
3. Agrega cada secret de la tabla anterior

---

## 🖥️ Despliegue en AWS EC2

### Preparar la instancia EC2 (Backend)

```bash
# Conectarse a EC2
ssh -i tu-key.pem ec2-user@IP_EC2_BACKEND

# Instalar Docker
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -aG docker ec2-user

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Crear directorio de la app
mkdir -p ~/app && cd ~/app
# Copiar docker-compose.yml y .env
```

### Verificar en EC2

```bash
docker ps                          # Contenedores activos
docker logs innovatech_backend     # Logs de la API
docker volume ls                   # Verificar volumen postgres_data
```

---

## 🏗️ Principios DevOps aplicados

| Práctica | Implementación |
|----------|----------------|
| **Contenedorización** | Docker multi-stage, imagen mínima |
| **Mínimo privilegio** | Usuario no root en contenedor |
| **IaC** | docker-compose.yml declarativo |
| **CI/CD** | GitHub Actions automático por rama |
| **Secrets management** | GitHub Secrets (nunca en código) |
| **Persistencia** | Named volumes para PostgreSQL |
| **Trazabilidad** | Tags por SHA de commit |
| **Health checks** | Dockerfile + docker-compose |

---

## 📝 Historial de Commits

Los commits siguen la convención:

```
feat: agrega endpoint DELETE para productos
fix: corrige conexión a base de datos en healthcheck
docs: actualiza README con instrucciones de despliegue
chore: agrega .dockerignore para optimizar build
```

---

*Desarrollado para ISY1101 – Introducción a Herramientas DevOps – DuocUC 2025*
