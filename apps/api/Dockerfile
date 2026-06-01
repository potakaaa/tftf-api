FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=10000

WORKDIR /opt/render/project/src/apps/api

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential cmake \
    && rm -rf /var/lib/apt/lists/*

COPY apps/api/pyproject.toml apps/api/README.md ./
COPY apps/api/app ./app
COPY apps/api/native ./native

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir .

RUN cmake -S native -B native/build \
    && cmake --build native/build --config Release --target tftf_runner

EXPOSE 10000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}"]
