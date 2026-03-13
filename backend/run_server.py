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

_ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def _resolve_env_file(name):
    """Return the path if it exists, falling back to the project root."""
    if os.path.exists(name):
        return name
    root_path = os.path.join(_ROOT_DIR, name)
    return root_path if os.path.exists(root_path) else None

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Start DataFlow WebUI Backend")
    parser.add_argument("--env-file", type=str, default=None, help="Path to a custom .env file")
    args = parser.parse_args()

    if args.env_file is None:
        for name in (".env", ".env.embedded"):
            resolved = _resolve_env_file(name)
            if resolved:
                args.env_file = resolved
                break
    else:
        args.env_file = _resolve_env_file(args.env_file) or args.env_file

    # Load environment variables early so settings gets them before import
    if args.env_file and os.path.exists(args.env_file):
        from dotenv import load_dotenv
        load_dotenv(args.env_file, override=True)
        print(f"Loaded environment variables from {args.env_file}")
    elif args.env_file:
        print(f"Warning: Environment file not found: {args.env_file}")

    from app.core.config import settings

    processes = []
    try:
        # Start HF API server if enabled and on a separate port
        if settings.ENABLE_HF_API and settings.HF_API_PORT != settings.PORT:
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
