from app.core.config import settings
from app.services.serving_registry import ServingRegistry
from app.core.logger_setup import logger

def init_builtin_llm_serving(registry: ServingRegistry):
    """Initialize built-in LLM serving from .env configuration"""
    if not settings.LLM_PROVIDER_BASE_URL or not settings.LLM_PROVIDER_API_KEY:
        logger.info("Builtin LLM not configured (missing LLM_PROVIDER_BASE_URL or LLM_PROVIDER_API_KEY)")
        return None

    # Check if builtin LLM already exists
    all_servings = registry._get_all() or {}
    for sid, sdata in all_servings.items():
        if sdata.get('name') == 'Builtin LLM':
            logger.info(f"Builtin LLM already exists with ID: {sid}")
            return sid

    # Create builtin LLM serving
    params = [
        {"name": "base_url", "type": "str", "value": settings.LLM_PROVIDER_BASE_URL, "required": True},
        {"name": "model", "type": "str", "value": settings.LLM_DEFAULT_MODEL, "required": True},
        {"name": "timeout", "type": "int", "value": settings.LLM_REQUEST_TIMEOUT, "required": False},
        {"name": "key_name_of_api_key", "type": "str", "value": "DF_BUILTIN_API_KEY", "required": False},
        {"name": "api_key", "type": "str", "value": settings.LLM_PROVIDER_API_KEY, "required": True}
    ]

    serving_id = registry._set("Builtin LLM", "APILLMServing_request", params)
    logger.info(f"Created Builtin LLM serving with ID: {serving_id}")
    return serving_id
