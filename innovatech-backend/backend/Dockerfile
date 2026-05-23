# ============================================================
# STAGE 1: Builder - instala dependencias
# ============================================================
FROM python:3.11-slim AS builder

# Evitar archivos .pyc y forzar salida no bufferizada
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /build

# Copiar solo requirements primero (cache de capas)
COPY requirements.txt .

# Instalar dependencias en directorio aislado
RUN pip install --upgrade pip && \
    pip install --prefix=/install --no-cache-dir -r requirements.txt

# ============================================================
# STAGE 2: Runtime - imagen final mínima
# ============================================================
FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Crear usuario no root para seguridad (mínimo privilegio)
RUN groupadd --gid 1001 appgroup && \
    useradd --uid 1001 --gid appgroup --no-create-home appuser

WORKDIR /app

# Copiar dependencias instaladas desde el builder
COPY --from=builder /install /usr/local

# Copiar el código de la aplicación
COPY --chown=appuser:appgroup ./app ./app

# Cambiar al usuario no root
USER appuser

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
