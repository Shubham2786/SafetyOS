'''llm_client.py

Utility module that provides a thin wrapper around a Large Language Model (LLM) service.
Currently it supports OpenAI's ChatCompletion API and is designed to be easily extensible
to other providers (e.g., Anthropic, Azure OpenAI) by adding a new ``_provider`` class.

The wrapper reads configuration from environment variables so that secrets are never
checked into source control:

- ``LLM_PROVIDER`` – Identifier of the provider (default: ``openai``).
- ``OPENAI_API_KEY`` – API key for OpenAI.
- ``OPENAI_BASE_URL`` – Optional custom base URL (useful for Azure OpenAI or proxy).
- ``OPENAI_MODEL`` – Model name to use (default: ``gpt-4o-mini``).

Usage example::

    from services.ai.llm_client import LLMClient

    client = LLMClient()
    response = client.chat([{"role": "user", "content": "Explain safety in AI"}])
    print(response)

The ``chat`` method returns the generated text (the ``content`` field of the first
choice) and raises a ``RuntimeError`` with the original exception if the request fails.
'''
import os
from typing import List, Dict

# Lazy import to avoid import errors if the dependency is missing during static analysis.
# The actual OpenAI library will be required at runtime.
try:
    import openai
except ImportError:  # pragma: no cover
    openai = None  # type: ignore


class _BaseProvider:
    """Abstract base class for LLM providers.

    Concrete providers must implement the ``chat`` method which receives a list of
    messages (in the OpenAI chat format) and returns the assistant's reply as a string.
    """

    def chat(self, messages: List[Dict[str, str]]) -> str:
        raise NotImplementedError


class OpenAIProvider(_BaseProvider):
    def __init__(self) -> None:
        api_key = os.getenv("OPENAI_API_KEY") or "dummy-key"
        # If a real key is not provided, we use a placeholder. The OpenAI client will raise only when an actual request is made.
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY environment variable is not set")
        # Allow optional custom endpoint (e.g., Azure OpenAI)
        base_url = os.getenv("OPENAI_BASE_URL")
        if base_url:
            openai.api_base = base_url
        openai.api_key = api_key
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    def chat(self, messages: List[Dict[str, str]]) -> str:
        if openai is None:
            raise RuntimeError("openai package is not installed")
        try:
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=messages,
                temperature=0.0,
            )
            return response.choices[0].message.content  # type: ignore[attr-defined]
        except Exception as exc:
            raise RuntimeError(f"OpenAI chat request failed: {exc}") from exc


# Mapping from provider identifier to concrete class.
_PROVIDER_MAP = {
    "openai": OpenAIProvider,
    # Future providers can be added here, e.g., "anthropic": AnthropicProvider,
}


class LLMClient:
    """Facade class used by the rest of the codebase.

    Instantiates the appropriate provider based on ``LLM_PROVIDER`` environment
    variable (defaults to ``openai``). The public ``chat`` method forwards the call
    to the underlying provider.
    """

    def __init__(self) -> None:
        provider_name = os.getenv("LLM_PROVIDER", "openai").lower()
        provider_cls = _PROVIDER_MAP.get(provider_name)
        if provider_cls is None:
            raise RuntimeError(f"Unsupported LLM provider: {provider_name}")
        self._provider = provider_cls()

    def chat(self, messages: List[Dict[str, str]]) -> str:
        """Send a list of chat messages to the LLM and return the assistant reply.

        Parameters
        ----------
        messages: List[Dict[str, str]]
            Each dict must contain ``role`` (one of ``system``, ``user``, ``assistant``)
            and ``content`` (the textual payload).
        """
        return self._provider.chat(messages)

# Export a singleton for convenience – most services only need one client.
client = LLMClient()
