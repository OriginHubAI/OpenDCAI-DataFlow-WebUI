#!/bin/bash

# Load environment variables if .env exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Set default port if not already set
PORT=${PORT:-8000}

# Verify if frontend/dist exists, and build if missing
if [ ! -d "frontend/dist" ]; then
    echo "Warning: frontend/dist not found."
    echo "Building frontend..."
    (cd frontend && npm install && npm run build)
fi

# Start Backend (Uvicorn)
echo "Starting DataFlow-WebUI on port $PORT..."
cd backend && uvicorn app.main:app --host 0.0.0.0 --port "$PORT" --reload-dir app --reload
