FROM python:3.12-slim

WORKDIR /app

# Dépendances système minimales
RUN apt-get update && apt-get install -y --no-install-recommends \
        curl unzip gnupg build-essential \
    && rm -rf /var/lib/apt/lists/*

# uv (+ pip récent pour être tranquille)
RUN pip install --upgrade pip && pip install uv

# Copie seulement les fichiers de dépendances pour bénéficier du cache
COPY pyproject.toml uv.lock ./

# Installe les deps (uv lit le lock tout seul)
RUN uv pip install --system .

# Copie le reste du code
COPY . .

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
