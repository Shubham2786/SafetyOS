'''neo4j_client.py

Thin wrapper around the Neo4j Bolt driver. It reads connection details from the
environment, opens a session, and provides a ``run_query`` helper that returns the
list of records as dictionaries.

Environment variables expected:
- ``NEO4J_URI`` – Bolt URI, e.g. ``bolt://localhost:7687``
- ``NEO4J_USERNAME``
- ``NEO4J_PASSWORD``

The client is deliberately minimal – it can be extended with transaction
management, async support, or schema helpers as the project evolves.
'''
import os
from typing import List, Dict, Any

try:
    from neo4j import GraphDatabase, BoltDriver
except ImportError:  # pragma: no cover
    GraphDatabase = None  # type: ignore


class Neo4jClient:
    def __init__(self) -> None:
        if GraphDatabase is None:
            raise RuntimeError("neo4j driver package is not installed")
        uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        user = os.getenv("NEO4J_USERNAME", "neo4j")
        password = os.getenv("NEO4J_PASSWORD", "password")
        if not (uri and user and password):
            # Create a dummy driver placeholder when env vars are not set.
            self.driver = None
            return
        self.driver: BoltDriver = GraphDatabase.driver(uri, auth=(user, password))

    def run_query(self, cypher: str, parameters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Execute a Cypher query and return results as a list of dictionaries.

        Parameters
        ----------
        cypher: str
            The Cypher statement to run.
        parameters: dict, optional
            Named parameters for the query.
        """
        parameters = parameters or {}
        with self.driver.session() as session:
            result = session.run(cypher, **parameters)
            return [record.data() for record in result]

    def close(self) -> None:
        self.driver.close()

# Export a singleton for convenience.
client = Neo4jClient()
