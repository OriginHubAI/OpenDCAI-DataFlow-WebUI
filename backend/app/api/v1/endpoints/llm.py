from typing import List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.container import container
from app.core.config import settings
from app.api.v1.resp import ok
from app.api.v1.envelope import ApiResponse

router = APIRouter(tags=["llm"])

class LLMModel(BaseModel):
    id: str
    name: str

class ChatRequest(BaseModel):
    model: str
    message: str
    serving_id: str

class ChatResponse(BaseModel):
    response: str
    model: str

@router.get("/models", response_model=ApiResponse[List[LLMModel]])
def list_llm_models():
    """Get available LLM models from .env configuration"""
    try:
        models_str = settings.LLM_AVAILABLE_MODELS
        models = [m.strip() for m in models_str.split(',') if m.strip()]
        result = [{"id": m, "name": m} for m in models]
        return ok(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat", response_model=ApiResponse[ChatResponse])
def chat_with_llm(req: ChatRequest):
    """Chat with LLM using selected serving instance"""
    try:
        from app.services.serving_registry import SERVING_CLS_REGISTRY
        import os

        serving_info = container.serving_registry._get(req.serving_id)
        if not serving_info:
            raise HTTPException(status_code=404, detail="Serving not found")

        params_dict = {}
        if serving_info['cls_name'] == 'APILLMServing_request':
            api_key_val = None
            key_name_var = "DF_API_KEY"

            for params in serving_info['params']:
                current_val = params.get('value') if params.get('value') is not None else params.get('default_value')
                if params['name'] == 'api_key':
                    api_key_val = current_val
                elif params['name'] == 'key_name_of_api_key':
                    key_name_var = current_val

            if api_key_val:
                os.environ[key_name_var] = api_key_val

            for params in serving_info['params']:
                if params['name'] != 'api_key':
                    val = params.get('value') if params.get('value') is not None else params.get('default_value')
                    if params['name'] == 'model':
                        val = req.model
                    params_dict[params['name']] = val

        serving_instance = SERVING_CLS_REGISTRY[serving_info['cls_name']](**params_dict)
        responses = serving_instance.generate_from_input([req.message])

        return ok({"response": responses[0], "model": req.model})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
