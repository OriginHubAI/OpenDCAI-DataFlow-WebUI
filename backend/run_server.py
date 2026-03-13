import multiprocessing
import uvicorn
import copy
import argparse
import os

def get_log_config(prefix=""):
    log_config = copy.deepcopy(uvicorn.config.LOGGING_CONFIG)
    log_config["formatters"]["default"]["fmt"] = f"{prefix} %(levelprefix)s %(message)s"
    log_config["formatters"]["access"]["fmt"] = f"{prefix} %(levelprefix)s %(client_addr)s - \"%(request_line)s\" %(status_code)s"
    return log_config

def run_hf_server(env_file=None):
    from app.core.config import settings
    os.environ["DATAFLOW_HF_API_MODE"] = "1"
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.HF_API_PORT,
                reload=True, reload_dirs=["app"],
                env_file=env_file,
                log_config=get_log_config("[HF API]"))

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Start DataFlow WebUI Backend")
    parser.add_argument("--env-file", type=str, default=None, help="Path to a custom .env file")
    args = parser.parse_args()

    # Load environment variables early if specified so settings gets them before import
    if args.env_file and os.path.exists(args.env_file):
        from dotenv import load_dotenv
        load_dotenv(args.env_file)
        print(f"Loaded environment variables from {args.env_file}")

    from app.core.config import settings

    processes = []
    try:
        if settings.HF_API_PORT != settings.PORT and settings.ENABLE_HF_API:
            print(f"Starting HF API on separate port {settings.HF_API_PORT}...")
            p = multiprocessing.Process(target=run_hf_server, args=(args.env_file,))
            p.start()
            processes.append(p)
            
        print(f"Starting Main API on port {settings.PORT}...")
        uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT,
                    reload=True, reload_dirs=["app"], 
                    env_file=args.env_file,
                    log_config=get_log_config("[Main API]"))
    except KeyboardInterrupt:
        pass
    finally:
        for p in processes:
            p.terminate()
            p.join()
