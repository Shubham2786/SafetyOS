"""
SafetyOS AI Platform Configuration Settings
Enterprise Settings for multi-agent platform, RAG, and microservice connections.
"""

import os


class Settings:
    # Core Application Settings
    APP_NAME: str = os.getenv("APP_NAME", "SafetyOS AI Agent Service")
    ENVIRONMENT: str = os.getenv("ENV", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() in ("true", "1", "yes")
    PORT: int = int(os.getenv("PORT", "8000"))

    # LLM Settings
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "sk-mock-key-safety-os")
    DEFAULT_LLM_MODEL: str = os.getenv("DEFAULT_LLM_MODEL", "gpt-4o")
    FAST_LLM_MODEL: str = os.getenv("FAST_LLM_MODEL", "gpt-4o-mini")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")

    # Vector Database Settings (Qdrant)
    QDRANT_URL: str = os.getenv("QDRANT_URL", "http://localhost:6333")
    QDRANT_API_KEY: str = os.getenv("QDRANT_API_KEY", "")
    QDRANT_COLLECTION: str = os.getenv("QDRANT_COLLECTION", "safetyos_knowledge")

    # Graph Database Settings (Neo4j)
    NEO4J_URI: str = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    NEO4J_USER: str = os.getenv("NEO4J_USER", "neo4j")
    NEO4J_PASSWORD: str = os.getenv("NEO4J_PASSWORD", "safetyos123")

    # Relational & Time-Series DB (TimescaleDB / PostgreSQL)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/safetyos"
    )

    # In-Memory Cache & State (Redis)
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # Event Mesh Broker (Kafka)
    KAFKA_BOOTSTRAP_SERVERS: str = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
    KAFKA_TOPIC_SAFETY_EVENTS: str = "safetyos.telemetry.events"
    KAFKA_TOPIC_AGENT_TRACES: str = "safetyos.ai.traces"

    # Guardrail Thresholds
    MIN_CONFIDENCE_THRESHOLD: float = 0.85
    HUMAN_APPROVAL_THRESHOLD: float = 0.90


settings = Settings()
