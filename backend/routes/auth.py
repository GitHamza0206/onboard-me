from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from pydantic import BaseModel
from simba_sdk import SimbaClient
import os

# According to the project-based learning preference, this file will establish
# the authentication routes for our application. We're using FastAPI's APIRouter
# to keep our authentication logic modular and organized.
# Ref: [[memory:134231]]

# The user is interested in web development, and this is a fundamental part of a
# modern web app's backend.
# Ref: [[memory:134264]]

def get_simba_client(request: Request) -> SimbaClient:
    """
    Provides a SimbaClient instance for dependency injection in route handlers.

    This function is designed as a FastAPI dependency. Instead of creating a single, global
    SimbaClient instance, which could lead to session conflicts between different users,
    we create a new client for each incoming request. This ensures that each user's
    session is handled independently and securely.

    The client's session cookies are populated from the incoming browser request. This is
    crucial for maintaining a persistent login state across different API calls. For example,
    once a user signs in, their browser stores a session cookie. On subsequent requests
    (e.g., to fetch their profile), the browser sends this cookie back. This function
    takes that cookie and adds it to the SimbaClient's session, so that the client can
    make authenticated requests to the Simba API on the user's behalf.

    Args:
        request: The incoming FastAPI request object, which contains headers, cookies, etc.

    Returns:
        An instance of SimbaClient, configured and ready to handle an authenticated session.
    """
    api_url = os.environ.get("SIMBA_API_URL", "http://localhost:5005")
    api_key = os.environ.get("SIMBA_API_KEY")
    client = SimbaClient(api_url=api_url, api_key=api_key)

    return client

router = APIRouter()

class UserCredentials(BaseModel):
    """
    A Pydantic model to validate the request body for signin and signup.
    Pydantic models are used by FastAPI to automatically validate incoming data,
    ensuring that we receive the expected 'email' and 'password' fields.
    This provides data validation and generates API documentation automatically.
    """
    email: str
    password: str

@router.post("/signup")
async def signup(credentials: UserCredentials, client: SimbaClient = Depends(get_simba_client)):
    """
    Signs up a new user.
    This endpoint takes an email and password, and uses the simba_sdk to create a
    new user account.
    """
    try:
        # The signup method from the Simba SDK handles the call to the authentication service.
        response = client.auth.signup(email=credentials.email, password=credentials.password)
        return response
    except Exception as e:
        # If anything goes wrong (e.g., user already exists), we catch the exception
        # and return an HTTP 400 error with the details.
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Signup failed: {e}")

@router.post("/signin")
async def signin(credentials: UserCredentials, response: Response, client: SimbaClient = Depends(get_simba_client)):
    """
    Signs in a user and sets the session cookie.
    
    When the user successfully signs in, the Simba SDK receives a session cookie from
    the Simba API. This cookie needs to be passed back to the user's browser to
    authenticate subsequent requests. This function extracts the cookie from the
    Simba client's session and attaches it to the HTTP response sent to the browser.
    """
    try:
        response = client.auth.signin(email=credentials.email, password=credentials.password)
        return response
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Sign-in failed: {e}")

@router.get("/me")
async def get_current_user(client: SimbaClient = Depends(get_simba_client)):
    """
    Retrieves the profile of the currently authenticated user.
    
    This endpoint relies on the session cookie being sent by the browser. The `get_simba_client`
    dependency ensures that the incoming cookie is passed to the Simba client, allowing it
    to make an authenticated request for the user's profile.
    """
    try:
        profile = client.auth.me()
        return profile
    except Exception:
        # If the 'me' call fails, it's typically because the session is invalid or expired.
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

@router.post("/signout")
async def signout(client: SimbaClient = Depends(get_simba_client)):
    """
    Signs out the current user.
    This calls the Simba API to invalidate the session.
    """
    try:
        client.auth.signout()
        return {"message": "Signout successful"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Signout failed: {e}") 