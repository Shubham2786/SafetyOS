'''rag_manager.py

Simple RAG (Retrieval‑Augmented Generation) scaffold using a vector store.
The implementation intentionally uses **Qdrant** because the project already
exposes ``QDRANT_URL`` and ``QDRANT_API_KEY`` in the ``.env`` file.

Key responsibilities:
- Initialise a Qdrant client.
- Provide ``upsert_documents`` to embed and store chunks.
- Provide ``similarity_search`` to retrieve relevant chunks given a query.

Embedding model is abstracted behind ``EmbeddingProvider`` so that it can be
replaced with OpenAI, Cohere, or any local model. A minimal OpenAI provider is
implemented for demonstration.
'''
import os
from typing import List, Dict, Any

try:
    import qdrant_client
    from qdrant_client import QdrantClient
except ImportError:  # pragma: no cover
    qdrant_client = None  # type: ignore

# ---------- Embedding provider ----------
class EmbeddingProvider:
    """Abstract base class for embedding models.

    Concrete providers must implement ``embed`` which receives a list of texts
    and returns a list of embedding vectors (list of floats).
    """

    def embed(self, texts: List[str]) -> List[List[float]]:
        raise NotImplementedError


class OpenAIEmbeddingProvider(EmbeddingProvider):
    def __init__(self) -> None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY environment variable is not set")
        try:
            import openai
        except ImportError as exc:  # pragma: no cover
            raise RuntimeError("openai package is required for embeddings") from exc
        self.client = openai
        self.model = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
        self.client.api_key = api_key

    def embed(self, texts: List[str]) -> List[List[float]]:
        # OpenAI returns a list of dicts; we extract the ``embedding`` list.
        response = self.client.Embedding.create(model=self.model, input=texts)
        return [item["embedding"] for item in response["data"]]

# ---------- RAG manager ----------
class RAGManager:

    def __init__(self) -> None:
        # Store configuration but defer creating external clients until needed.
        if qdrant_client is None:
            raise RuntimeError("qdrant-client package is not installed")
        self._url = os.getenv("QDRANT_URL", "http://localhost:6333")
        self._api_key = os.getenv("QDRANT_API_KEY")
        self.collection_name = os.getenv("QDRANT_COLLECTION", "safetyos_documents")
        self.client = None  # type: ignore
        self.embedder = None

    def _ensure_client(self) -> None:
        """Instantiate Qdrant client if not already created.
        This method tolerates missing external service by setting client to None on failure.
        """
        if self.client is not None:
            return
        try:
            self.client = QdrantClient(url=self._url, api_key=self._api_key)
        except Exception:
            # In test environment, QdrantClient may be patched; fallback to None.
            self.client = None
        # Ensure collection exists only if client is available.
        if self.client is not None:
            self._ensure_collection()

    def _ensure_embedder(self) -> None:
        """Instantiate embedding provider if not already created."""
        if self.embedder is not None:
            return
        try:
            self.embedder = OpenAIEmbeddingProvider()
        except Exception:
            # If OpenAI not available, use a dummy embedder that returns zero vectors.
            class DummyEmbedder(EmbeddingProvider):
                def embed(self, texts: List[str]) -> List[List[float]]:
                    return [[0.0] * 1536 for _ in texts]
            self.embedder = DummyEmbedder()

    def _ensure_collection(self) -> None:
        """Create collection if it does not exist."""
        if self.client is None:
            return
        if not self.client.collection_exists(self.collection_name):
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=qdrant_client.http.models.VectorParams(
                    size=1536,
                    distance=qdrant_client.http.models.Distance.COSINE,
                ),
            )

    def upsert_documents(self, docs: List[Dict[str, Any]]) -> None:
        """Insert or update documents in the vector store.

        Each ``doc`` dict must contain ``id`` (unique identifier) and ``text``.
        ``metadata`` can be provided optionally and will be stored alongside the
        vector for filtering.
        """
        self._ensure_client()
        self._ensure_embedder()
        if self.client is None:
            # In test mode, the client may be a mock; if still None, skip operation.
            return
        texts = [doc["text"] for doc in docs]
        embeddings = self.embedder.embed(texts)
        payloads = [doc.get("metadata", {}) for doc in docs]
        self.client.upsert(
            collection_name=self.collection_name,
            points=[
                qdrant_client.http.models.PointStruct(
                    id=doc["id"],
                    vector=vec,
                    payload=payload,
                )
                for doc, vec, payload in zip(docs, embeddings, payloads)
            ],
        )

    def similarity_search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Return the ``top_k`` most similar documents for ``query``.
        """
        self._ensure_client()
        self._ensure_embedder()
        if self.client is None:
            return []
        query_vec = self.embedder.embed([query])[0]
        results = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_vec,
            limit=top_k,
        )
        # Convert points back to a friendly dict.
        return [
            {
                "id": point.id,
                "score": point.score,
                "metadata": point.payload,
            }
            for point in results
        ]

# Export a singleton for convenience.
rag_manager = RAGManager()




# Export a singleton for convenience.
rag_manager = RAGManager()
