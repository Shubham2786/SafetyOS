'''kafka_producer.py

Simple Kafka producer utility used by the AI service to emit events (e.g.,
observable alerts, telemetry, or async task triggers). It reads the bootstrap
servers from the ``KAFKA_BOOTSTRAP_SERVERS`` environment variable.

The design is deliberately lightweight – the producer is instantiated once and
re‑used throughout the process. Errors are logged but do not raise, to avoid
crashing the main service on transient broker issues.
'''"\n
import os
import json
import logging
from typing import Any

try:
    from kafka import KafkaProducer
except ImportError:  # pragma: no cover
    KafkaProducer = None  # type: ignore

logger = logging.getLogger(__name__)


class KafkaEventProducer:
    def __init__(self) -> None:
        if KafkaProducer is None:
            raise RuntimeError("kafka-python package is not installed")
        bootstrap = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
        self.producer = KafkaProducer(
            bootstrap_servers=bootstrap,
            value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            key_serializer=lambda k: str(k).encode("utf-8"),
        )
        logger.info("Kafka producer initialized with %s", bootstrap)

    def send(self, topic: str, key: Any, value: Any) -> None:
        """Send a message to ``topic``.

        Parameters
        ----------
        topic: str
            Kafka topic name.
        key: Any
            Message key – will be string‑ified.
        value: Any
            Message payload – JSON‑serialisable.
        """
        try:
            future = self.producer.send(topic, key=key, value=value)
            # Optionally block until acked for critical events.
            future.get(timeout=10)
            logger.debug("Sent event to %s with key %s", topic, key)
        except Exception as exc:
            logger.error("Failed to send Kafka event: %s", exc)

    def close(self) -> None:
        self.producer.flush()
        self.producer.close()
        logger.info("Kafka producer closed")

# Export a singleton for convenience.
producer = KafkaEventProducer()
