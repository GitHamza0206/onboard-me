import logging.config
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from settings import P_LOGGER

from src.features.auth.router import router as auth_router
from src.features.formations.router import router as formations_router 
from src.features.formations.router import router_modules, router_sb
from src.features.admin.router import router as admin_router
from src.features.formations.router import router as formations_router
from src.features.documents.router import router as documents_router 
from src.features.creator_agent.router import router as creator_agent_router
from src.features.composio.router import router as composio_router
from src.features.quiz.router import router as quiz_router
import os
from dotenv import load_dotenv

# Load environment variables from a .env file at the project root.
# This line is crucial for loading your SIMBA_API_URL and SIMBA_API_KEY
# so the application can connect to the Simba service.
load_dotenv()

# Constante centralisée pour CORS Origins
ALLOWED_ORIGINS = [
    "http://localhost:5173",  # React app
    "http://localhost:5174",  # React app
    "http://127.0.0.1:5173",  # React app
    "http://127.0.0.1:5174",  # React app
    "http://front:5174",  # React app
    "http://front:5173",  # React app
    "http://localhost:8000",  # FastAPI server
    "http://127.0.0.1:8000",  # FastAPI server backend
    "http://back:8000",  # FastAPI server
]


# Configuration logging extraite
def setup_logging():
    logging.config.fileConfig('src/logging.conf', disable_existing_loggers=True)
    return logging.getLogger(P_LOGGER)



# Configuration de l'application FastAPI extraite
def create_app() -> FastAPI:
    app = FastAPI(title="server_chat", openapi_url="/openapi.json")

    app.include_router(auth_router)
    app.include_router(formations_router) 
    app.include_router(admin_router) 
    app.include_router(formations_router)
    app.include_router(documents_router) 
    app.include_router(creator_agent_router)
    app.include_router(router_sb)
    app.include_router(router_modules)
    app.include_router(composio_router)
    app.include_router(quiz_router)


    # Ajout du middleware CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    return app


# Création d'une instance globalement accessible pour ASGI
app = create_app()

logger = setup_logging()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)