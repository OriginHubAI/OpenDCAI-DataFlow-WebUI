import multiprocessing
import uvicorn
import copy
from app.core.config import settings

def get_log_config(prefix=""):
    log_config = copy.deepcopy(uvicorn.config.LOGGING_CONFIG)
    log_config["formatters"]["default"]["fmt"] = f"{prefix} %(levelprefix)s %(message)s"
    log_config["formatters"]["access"]["fmt"] = f"{prefix} %(levelprefix)s %(client_addr)s - \"%(request_line)s\" %(status_code)s"
    return log_config

import os
def run_hf_server():
    os.environ["DATAFLOW_HF_API_MODE"] = "1"
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.HF_API_PORT,
                reload=True, reload_dirs=["app"],
                log_config=get_log_config("[HF API]"))

if __name__ == "__main__":
    processes = []
    try:
        if settings.HF_API_PORT != settings.PORT and settings.ENABLE_HF_API:
            print(f"Starting HF API on separate port {settings.HF_API_PORT}...")
            p = multiprocessing.Process(target=run_hf_server)
            p.start()
            processes.append(p)
            
        print(f"Starting Main API on port {settings.PORT}...")
        uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT,
                    reload=True, reload_dirs=["app"], 
                    log_config=get_log_config("[Main API]"))
    except KeyboardInterrupt:
        pass
    finally:
        for p in processes:
            p.terminate()
            p.join()
