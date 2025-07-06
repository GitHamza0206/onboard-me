from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse, JSONResponse
from src.features.auth.dependencies import get_current_user
from src.composio_client import composio, TOOLKIT_AUTH_CONFIGS
import os
import httpx

router = APIRouter(
    prefix="/composio",
    tags=["composio"],
)

@router.get("/authorize/{toolkit}")
def authorize_app(
    toolkit: str,
    request: Request,
    current_user: dict = Depends(get_current_user),
):
    # Retrieve the auth_config_id for the requested toolkit from our mapping.
    auth_config_id = TOOLKIT_AUTH_CONFIGS.get(toolkit.lower())
    print(f"auth_config_id: {auth_config_id}")

    if not auth_config_id:   # rudimentary UUID check
        raise HTTPException(
            status_code=400,
            detail=f"Invalid or missing auth_config_id for '{toolkit}'. "
                   "Double-check your environment variables.",
        )

    # The user_id should be the unique identifier of the user in your system.
    user_id = str(current_user.get("sub") or current_user.get("id"))

    # Ensure we end up with e.g. http://localhost:8000/composio/callback (single slash)
    base = str(request.base_url).rstrip("/")
    app_callback_url = f"{base}/composio/callback"

    # Initiate the connection request
    connection_request = composio.connected_accounts.initiate(
        user_id,
        auth_config_id,
        #callback_url=app_callback_url,
    )
    print(f"connection_request: {connection_request.redirect_url}")
    return JSONResponse(content={"redirect_url": connection_request.redirect_url})


@router.get("/validate", response_class=JSONResponse)
def validate_composio_setup():
    """
    A temporary endpoint to validate the Composio API Key and Auth Config ID.
    """
    auth_config_id = TOOLKIT_AUTH_CONFIGS.get("notion")
    

    if not auth_config_id:
        return JSONResponse(
            status_code=500,
            content={"error": "`COMPOSIO_NOTION_AUTH_CONFIG_ID` not found."}
        )

    try:
        # This call will fail if the API key is bad OR the auth_config_id is wrong
        auth_config_details = composio.auth_configs.get(nanoid=auth_config_id)

        return JSONResponse(
            status_code=200,
            content={
                "status": "🎉 SUCCESS! Your setup is valid.",
                "api_key_status": "Correct",
                "auth_config_id_status": "Correct",
                "toolkit": str(auth_config_details.toolkit),
            }
        )
    except AttributeError:
        return JSONResponse(
           status_code=500,
           content={
               "status": "❌ VALIDATION FAILED: Incompatible `composio` library version.",
               "error": "The `composio` client object is missing the `.auth_configs` attribute.",
               "fix": "Try running `uv pip install --upgrade composio`."
           }
       )
    except HTTPError as e:
        status = e.response.status_code
        error_detail = e.response.json().get("error", "No details provided.")
        
        return JSONResponse(
            status_code=status,
            content={
                "status": "❌ VALIDATION FAILED",
                "detail": error_detail
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "status": "❌ VALIDATION FAILED: An unexpected error occurred.",
                "error": str(e)
            }
        ) 