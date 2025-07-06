import re
from typing import List
from urllib.parse import urlparse

from src.composio_client import composio, COMPOSIO_NOTION_AUTH_CONFIG_ID
from .state import State


def _extract_notion_page_id(url: str) -> str | None:
    """Extract Notion page ID from a URL."""
    parsed_url = urlparse(url)
    if "notion.so" not in parsed_url.netloc:
        return None

    path = parsed_url.path
    # Path format is /title-and-uuid
    # The uuid is the last part, 32 hex characters.
    match = re.search(r"([a-f0-9]{32})$", path)
    if match:
        return match.group(1)

    # Path format is /<username>/title-and-uuid
    match = re.search(r"/([a-f0-9]{32})$", path)
    if match:
        return match.group(1)
        
    # URL might just have the ID in the path directly
    # e.g. /b1b5d3a52b2b4d8a9e4e5b6a7a8d9c1e
    parts = [part for part in path.split("/") if part]
    if parts:
        potential_id = parts[-1].split("-")[-1]
        if len(potential_id) == 32 and all(c in "0123456789abcdef" for c in potential_id):
            return potential_id

    return None

def _get_urls_from_message(message_content: str) -> List[str]:
    """Extracts URLs from a message content string."""
    # Simple regex to find URLs
    return re.findall(r"http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+", message_content)


def ingest_knowledge(state: State) -> State:
    """
    Ingests knowledge from sources specified in the user's message.
    Currently supports Notion pages.
    """
    print("---INGESTING KNOWLEDGE---")
    if not state.messages:
        print("No messages in state, skipping knowledge ingestion.")
        return state

    last_message = state.messages[-1]
    
    # Check if content is a list of dicts with 'text' key, or just a string
    if isinstance(last_message.content, list):
        content = " ".join([item['text'] for item in last_message.content if 'text' in item])
    else:
        content = last_message.content

    urls = _get_urls_from_message(content)
    if not urls:
        print("No URLs found in the last message.")
        return state

    print(f"Found URLs: {urls}")
    ingested_content = []

    for url in urls:
        page_id = _extract_notion_page_id(url)
        if page_id:
            print(f"Extracted Notion page ID: {page_id}")
            try:
                # Based on user's prompt, we guess the tool name and parameters.
                # This might need adjustment.
                # The user_id is set to the auth_config_id for Notion.
                # This is a guess based on how Composio might identify the integration.
                result = composio.tools.execute(
                    "NOTION_GET_PAGE_CONTENT",
                    user_id=COMPOSIO_NOTION_AUTH_CONFIG_ID,
                    arguments={"page_id": page_id},
                )
                print(f"Composio result: {result}")
                ingested_content.append(str(result)) # Make sure it's a string
            except Exception as e:
                print(f"Error executing Composio tool for Notion page {page_id}: {e}")
                ingested_content.append(f"Error fetching content for {url}.")
        else:
            print(f"URL is not a recognizable Notion page URL: {url}")
            # For now, we only handle Notion. We could add other handlers here.
            ingested_content.append(f"Unsupported URL: {url}")

    if ingested_content:
        if state.knowledge:
            state.knowledge += "\n\n" + "\n".join(ingested_content)
        else:
            state.knowledge = "\n".join(ingested_content)
        print(f"Updated knowledge: {state.knowledge[:200]}...")
    else:
        print("No content was ingested.")
    
    print("---FINISHED INGESTING KNOWLEDGE---")
    return state