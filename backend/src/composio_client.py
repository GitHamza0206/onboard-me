import os
from dotenv import load_dotenv
from composio import Composio

# Load environment variables from a .env file
load_dotenv()

# --- API Key ---
COMPOSIO_API_KEY = os.getenv("COMPOSIO_API_KEY")
if not COMPOSIO_API_KEY:
    raise ValueError("COMPOSIO_API_KEY is not set in your environment.")

# --- Client Instance ---
# A single, shared instance of the Composio client, initialized with the key.
composio = Composio(api_key=COMPOSIO_API_KEY)


# --- Auth Configs ---
# Load Auth Config IDs for various toolkits from the environment.
COMPOSIO_NOTION_AUTH_CONFIG_ID = os.getenv("COMPOSIO_NOTION_AUTH_CONFIG_ID")

# Mapping of toolkit names to their respective Auth Config IDs.
# The router will use this to find the correct ID for an authorization request.
TOOLKIT_AUTH_CONFIGS = {
    "notion": COMPOSIO_NOTION_AUTH_CONFIG_ID,
    # Add other toolkits here as needed, e.g.:
    # "google_drive": os.getenv("COMPOSIO_GDRIVE_AUTH_CONFIG_ID"),
} 