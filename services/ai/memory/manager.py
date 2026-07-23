"""
SafetyOS Multi-Tier Enterprise Agent Memory System
Manages 7 memory stores: Conversation, Long-Term, Working, Semantic, Vector, Graph, and Workflow.
"""

from typing import Dict, Any, List, Optional
import json
import logging
from datetime import datetime

logger = logging.getLogger("safetyos.memory")


class MultiTierAgentMemoryManager:
    """
    Enterprise Unified Memory Controller managing seven distinct memory scopes.
    """

    def __init__(self):
        # In-memory storage structures with simulated persistence adapters
        self._conversation_memory: Dict[str, List[Dict[str, Any]]] = {}
        self._longterm_memory: Dict[str, List[Dict[str, Any]]] = {}
        self._working_memory: Dict[str, Dict[str, Any]] = {}
        self._semantic_memory: Dict[str, Dict[str, Any]] = {
            "ISO_45001": {"domain": "Occupational Health & Safety", "strictness": "Mandatory"},
            "NFPA_70E": {"domain": "Electrical Safety in Workplace", "arc_flash": "Boundary enforcement required"},
            "OSHA_1910_147": {"domain": "Control of Hazardous Energy (LOTO)", "zero_energy": "Mandatory verification"}
        }
        self._vector_memory: List[Dict[str, Any]] = []
        self._graph_memory: Dict[str, List[Dict[str, str]]] = {
            "VALVE_V102": [{"connected_to": "PIPELINE_P04", "type": "HYDRAULIC_ISOLATION"}],
            "BREAKER_B42": [{"connected_to": "MOTOR_M01", "type": "ELECTRICAL_ISOLATION"}]
        }
        self._workflow_memory: Dict[str, Dict[str, Any]] = {}

    # 1. Conversation Memory (Short-Term Chat History)
    async def add_conversation_turn(self, conversation_id: str, role: str, content: str):
        if conversation_id not in self._conversation_memory:
            self._conversation_memory[conversation_id] = []
        self._conversation_memory[conversation_id].append({
            "timestamp": datetime.utcnow().isoformat(),
            "role": role,
            "content": content
        })

    async def get_conversation_history(self, conversation_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        turns = self._conversation_memory.get(conversation_id, [])
        return turns[-limit:]

    # 2. Long-Term Memory (Persistent Lessons & Incident Experiences)
    async def store_experience(self, site_id: str, lesson_data: Dict[str, Any]):
        if site_id not in self._longterm_memory:
            self._longterm_memory[site_id] = []
        self._longterm_memory[site_id].append({
            "stored_at": datetime.utcnow().isoformat(),
            **lesson_data
        })

    async def query_longterm_memory(self, site_id: str, key_term: str) -> List[Dict[str, Any]]:
        experiences = self._longterm_memory.get(site_id, [])
        return [exp for exp in experiences if key_term.lower() in json.dumps(exp).lower()]

    # 3. Working Memory (LangGraph Scratchpad)
    async def update_working_memory(self, execution_id: str, key: str, value: Any):
        if execution_id not in self._working_memory:
            self._working_memory[execution_id] = {}
        self._working_memory[execution_id][key] = value

    async def get_working_memory(self, execution_id: str) -> Dict[str, Any]:
        return self._working_memory.get(execution_id, {})

    # 4. Semantic Memory (Domain Ontologies & Standards)
    async def get_semantic_concept(self, concept_key: str) -> Optional[Dict[str, Any]]:
        return self._semantic_memory.get(concept_key)

    # 5. Vector Memory (Dense Document Embeddings index reference)
    async def index_vector_document(self, doc_id: str, text: str, metadata: Dict[str, Any]):
        self._vector_memory.append({
            "doc_id": doc_id,
            "text": text,
            "metadata": metadata,
            "indexed_at": datetime.utcnow().isoformat()
        })

    # 6. Graph Memory (Neo4j Topology Cache)
    async def get_entity_graph_topology(self, entity_id: str) -> List[Dict[str, str]]:
        return self._graph_memory.get(entity_id, [])

    # 7. Workflow Memory (Active LOTO & PTW State Tracking)
    async def set_workflow_state(self, workflow_id: str, state: Dict[str, Any]):
        self._workflow_memory[workflow_id] = {
            "updated_at": datetime.utcnow().isoformat(),
            "state": state
        }

    async def get_workflow_state(self, workflow_id: str) -> Optional[Dict[str, Any]]:
        return self._workflow_memory.get(workflow_id)
