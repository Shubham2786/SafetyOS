# syntax=docker/dockerfile:1
FROM python:3.11-slim AS builder
WORKDIR /app
COPY services/ai/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY services/ai ./
# Runtime stage
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /app /app
ENV PYTHONUNBUFFERED=1
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
