import os
import pytest
from unittest.mock import patch, MagicMock

# Ensure import path includes services/ai
import sys
from pathlib import Path
AI_SERVICE_DIR = Path(__file__).resolve().parent.parent
if str(AI_SERVICE_DIR) not in sys.path:
    sys.path.insert(0, str(AI_SERVICE_DIR))

# Import the client singleton (instantiated on import)
from services.ai.graph.neo4j_client import Neo4jClient, client

@patch('services.ai.graph.neo4j_client.GraphDatabase')
def test_neo4j_client_initialization(mock_graphdb):
    # Mock driver returned by GraphDatabase.driver
    mock_driver = MagicMock()
    mock_graphdb.driver.return_value = mock_driver
    # Set env vars
    os.environ['NEO4J_URI'] = 'bolt://localhost:7687'
    os.environ['NEO4J_USERNAME'] = 'neo4j'
    os.environ['NEO4J_PASSWORD'] = 'testpass'
    # Re‑instantiate to trigger init
    client_instance = Neo4jClient()
    assert client_instance.driver == mock_driver
    mock_graphdb.driver.assert_called_once_with('bolt://localhost:7687', auth=('neo4j', 'testpass'))

@patch('services.ai.graph.neo4j_client.GraphDatabase')
def test_run_query_returns_records(mock_graphdb):
    # Mock session and result
    mock_session = MagicMock()
    mock_result = [MagicMock(data=lambda: {'a': 1}), MagicMock(data=lambda: {'b': 2})]
    mock_session.run.return_value = mock_result
    mock_driver = MagicMock()
    mock_driver.session.return_value.__enter__.return_value = mock_session
    mock_graphdb.driver.return_value = mock_driver
    # Env vars
    os.environ['NEO4J_URI'] = 'bolt://localhost:7687'
    os.environ['NEO4J_USERNAME'] = 'neo4j'
    os.environ['NEO4J_PASSWORD'] = 'testpass'
    client_instance = Neo4jClient()
    records = client_instance.run_query('MATCH (n) RETURN n')
    assert records == [{'a': 1}, {'b': 2}]
    mock_session.run.assert_called_once_with('MATCH (n) RETURN n')
