'''graph_endpoint.py

FastAPI router that exposes a simple Neo4j query endpoint.
It accepts a JSON payload with a ``cypher`` string and optional ``parameters`` dict.
The endpoint executes the query using the shared ``neo4j_client`` singleton and returns the
list of records as JSON.
'''"\n
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, List

from services.ai.graph.neo4j_client import client as graph_client

router = APIRouter(tags=["Graph"])  # Added OpenAPI tag for better docs

class GraphQueryRequest(BaseModel):
    cypher: str = Field(..., description="Cypher query to execute")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Optional query parameters")

@router.post("/api/v1/ai/graph/query")
async def execute_graph_query(request: GraphQueryRequest) -> List[Dict[str, Any]]:
    """Execute a Cypher query against the Neo4j knowledge graph.

    Returns a list of dictionaries, each representing a record's fields.
    Errors are reported as HTTP 400 with the exception message.
    """
    try:
        results = graph_client.run_query(request.cypher, request.parameters)
        return results
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))
