import os
import sys
from dotenv import load_dotenv
from composio.client import Composio
from composio.client.exceptions import HTTPError

# Ensure this script is run from the `backend` directory,
# where your .env file is located.
load_dotenv()

API_KEY = os.getenv("COMPOSIO_API_KEY")
NOTION_AUTH_CONFIG_ID = os.getenv("COMPOSIO_NOTION_AUTH_CONFIG_ID")

def validate_setup():
    """Checks Composio API Key and Auth Config ID."""
    print("--- Composio Auth Validator ---")

    if not API_KEY:
        print("❌ ERROR: `COMPOSIO_API_KEY` not found in your environment.")
        sys.exit(1)
    
    if not NOTION_AUTH_CONFIG_ID:
        print("❌ ERROR: `COMPOSIO_NOTION_AUTH_CONFIG_ID` not found.")
        sys.exit(1)

    print(f"✅ API Key and Auth Config ID found in environment.")
    print("   - Auth Config ID to check:", NOTION_AUTH_CONFIG_ID)
    print("\nConnecting to Composio...")

    try:
        client = Composio(api_key=API_KEY)
        print("🔍 Fetching auth config details from Composio...")
        
        # This call will fail if the API key is bad OR the auth_config_id is wrong
        auth_config = client.auth_configs.get(id=NOTION_AUTH_CONFIG_ID)

        print("\n🎉 SUCCESS! Your setup is valid. 🎉")
        print(f"   - Your API Key is correct.")
        print(f"   - The Auth Config ID is valid for the '{auth_config.toolkit}' toolkit.")

    except HTTPError as e:
        status = e.response.status_code
        error_detail = e.response.json().get("error", "No details provided.")
        
        print(f"\n❌ VALIDATION FAILED (HTTP {status}): {error_detail}")

        if status == 401:
            print("\n   👉 FIX: Your `COMPOSIO_API_KEY` is invalid or expired.")
            print("      Go to https://app.composio.dev/settings/api-keys to create a new one.")
        elif status == 404:
            print("\n   👉 FIX: Your `COMPOSIO_NOTION_AUTH_CONFIG_ID` is incorrect.")
            print("      Go to https://app.composio.dev/auth-configs, find your Notion config, and copy the full ID.")
        else:
            print("\n   An unexpected API error occurred.")

    except Exception as e:
        print(f"\n❌ VALIDATION FAILED: An unexpected script error occurred.")
        print(f"   Error: {e}")

if __name__ == "__main__":
    validate_setup() 