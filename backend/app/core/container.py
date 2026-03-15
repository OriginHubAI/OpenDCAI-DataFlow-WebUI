# Registry Container

class AppContainer:
    """
    这里主要是为了解决之前直接在module里面全局初始化对象时，各个Registry被实例化的顺序不可控的问题。
    """
    def __init__(self):
        self.dataset_registry = None
        self.operator_registry = None
        self.prompt_registry = None
        self.serving_registry = None
        self.task_registry = None
        self.pipeline_registry = None
        self.text2sql_database_registry = None
        self.text2sql_database_manager_registry = None
        self.dataset_visualize_service = None

    def init(self):
        from app.services.dataset_registry import DatasetRegistry, VisualizeDatasetService
        from app.services.pipeline_registry import PipelineRegistry
        from app.services.operator_registry import OperatorRegistry
        from app.services.prompt_registry import PromptRegistry
        from app.services.serving_registry import ServingRegistry
        from app.services.task_registry import TaskRegistry
        from app.services.text2sql_database_registry import Text2SQLDatabaseRegistry, Text2SQLDatabaseManagerRegistry
        
        from .config import settings
        import importlib
        # 动态加载DataFlow扩展模块
        for ext in settings._DATAFLOW_EXTENSIONS:
            try:
                importlib.import_module(ext)
                print(f"Successfully loaded DataFlow extension: {ext}")
            except ImportError as e:
                print(f"Failed to load DataFlow extension '{ext}': {e}")
        # 检查是否在 Ray worker 中运行
        import ray
        import os
        is_ray_worker = ray.is_initialized() and ray.get_runtime_context().worker.mode != 0
        is_hf_api = os.environ.get("DATAFLOW_HF_API_MODE") == "1"

        # 初始化顺序在这里完全由你控制
        self.dataset_registry = DatasetRegistry(scan=not is_ray_worker and not is_hf_api) if settings.ENABLE_DATASETS_API else None
        self.dataset_visualize_service = VisualizeDatasetService() if settings.ENABLE_DATASETS_API else None
        self.operator_registry = OperatorRegistry()
        self.prompt_registry = PromptRegistry()
        self.serving_registry = ServingRegistry()
        self.task_registry = TaskRegistry()
        self.pipeline_registry = PipelineRegistry()
        self.text2sql_database_registry = Text2SQLDatabaseRegistry()
        self.text2sql_database_manager_registry = Text2SQLDatabaseManagerRegistry()

        # Initialize Builtin_LLM serving
        from app.services.builtin_llm import init_builtin_llm_serving
        init_builtin_llm_serving(self.serving_registry)



# 创建一个全局 container（模块级单例）
container = AppContainer()