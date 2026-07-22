import os
import pytest
from unittest.mock import patch, MagicMock

# Ensure import path includes services/ai
import sys
from pathlib import Path
AI_SERVICE_DIR = Path(__file__).resolve().parent.parent
if str(AI_SERVICE_DIR) not in sys.path:
    sys.path.insert(0, str(AI_SERVICE_DIR))

# Import the manager singleton (will be instantiated on import)
from services.ai.rag.rag_manager import RAGManager, rag_manager

@patch('services.ai.rag.rag_manager.QdrantClient')
@patch('services.ai.rag.rag_manager.OpenAIEmbeddingProvider')
def test_similarity_search(mock_embedder_cls, mock_qdrant_cls):
    # Setup mocks
    mock_client = MagicMock()
    mock_qdrant_cls.return_value = mock_client
    mock_embedder = MagicMock()
    mock_embedder.embed.return_value = [[0.1, 0.2, 0.3]]
    mock_embedder_cls.return_value = mock_embedder

    manager = RAGManager()
    # Mock search results
    mock_point = MagicMock()
    mock_point.id = "doc-1"
    mock_point.score = 0.95
    mock_point.payload = {"title": "Test"}
    mock_client.search.return_value = [mock_point]

    results = manager.similarity_search(query="test query", top_k=1)
    assert len(results) == 1
    assert results[0]["id"] == "doc-1"
    assert results[0]["score"] == 0.95
    assert results[0]["metadata"]["title"] == "Test"
    mock_embedder.embed.assert_called_once_with(["test query"])
    mock_client.search.assert_called_once()
