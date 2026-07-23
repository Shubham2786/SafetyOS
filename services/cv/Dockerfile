FROM python:3.11-slim AS builder
WORKDIR /app
COPY services/cv/cv_service.py ./
RUN pip install --no-cache-dir fastapi uvicorn

FROM python:3.11-slim AS runtime
WORKDIR /app
COPY --from=builder /app /app
EXPOSE 8002
CMD ["uvicorn", "cv_service:app", "--host", "0.0.0.0", "--port", "8002"]
