from app.core.config import settings
# import logging
from loguru import logger as logging
from app.api.v1.endpoints.datasets import register_dataset
from app.schemas.dataset import DatasetIn
def setup_dataflow_core():
    import os
    import shutil

    core_dir = settings.DATAFLOW_CORE_DIR
    if not os.path.exists(core_dir):
        os.makedirs(core_dir, exist_ok=True)
    
    if not os.listdir(core_dir):
        # 假设有一些初始文件需要复制到 core 目录
        logging.info(f"Setting up DataFlow core directory at {core_dir}")
        import subprocess
        result = subprocess.run(["dataflow", "init"], cwd=core_dir, capture_output=True, text=True)
        if result.returncode != 0:
            logging.warning(f"dataflow init exited with code {result.returncode}: {result.stderr}")
        logging.info("DataFlow core setup completed.")
    else:
        logging.info(f"DataFlow core directory at {core_dir} already set up.")

