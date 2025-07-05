from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth
from dotenv import load_dotenv

# Load environment variables from a .env file at the project root.
# This line is crucial for loading your SIMBA_API_URL and SIMBA_API_KEY
# so the application can connect to the Simba service.
load_dotenv()

# This is the main entry point for our backend application.
# We are using FastAPI, a modern, fast (high-performance) web framework
# for building APIs with Python.
app = FastAPI(
    title="Onboard-me API",
    description="This is the backend service for the Onboard-me application.",
    version="0.1.0",
)

# We need to enable Cross-Origin Resource Sharing (CORS).
# Our frontend (running on localhost:5173) and backend (running on localhost:8000)
# are on different "origins". By default, for security reasons, browsers block
# requests from one origin to another. CORS middleware tells the browser that it is
# safe for our frontend to make requests to our backend.
# Ref: [[memory:134264]]
app.add_middleware(
    CORSMiddleware,
    # This is the origin where our React frontend is running.
    allow_origins=["http://localhost:5173"],
    # This allows the browser to send cookies, which is essential for session management.
    allow_credentials=True,
    # We allow all standard HTTP methods (GET, POST, etc.).
    allow_methods=["*"],
    # We allow all headers.
    allow_headers=["*"],
)

# Here, we include the authentication routes we defined in `backend/routes/auth.py`.
# The `prefix="/auth"` means that all routes defined in the `auth.router`
# will be available under the "/auth" path. For example, the "signin" route
# will be at "/auth/signin".
# The `tags` parameter helps to group the routes in the auto-generated API docs.
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])

@app.get("/")
def read_root():
    """
    A simple root endpoint to confirm that the server is running.
    """
    return {"message": "Welcome to the Onboard-me API!"} 