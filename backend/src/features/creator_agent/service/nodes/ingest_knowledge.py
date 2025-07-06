import re
from typing import List, Dict
from urllib.parse import urlparse

from src.composio_client import composio, COMPOSIO_NOTION_AUTH_CONFIG_ID
from ..state import State
from src.features.documents.service import DocumentService


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

def ingest_knowledge(state: State) -> Dict[str, str]:
    """
    Ingests knowledge from sources specified in the user's message.
    Supports Notion pages (via URL) and internal documents (via @mention).
    """
    print("---INGESTING KNOWLEDGE---")
    if not state.get("messages"):
        print("No messages in state, skipping knowledge ingestion.")
        return {}

    last_message = state["messages"][-1]
    
    # Check if content is a list of dicts with 'text' key, or just a string
    if isinstance(last_message.content, list):
        content = " ".join([item['text'] for item in last_message.content if 'text' in item])
    else:
        content = last_message.content

    ingested_content = []
    user_id = state.get("user_id")

    # 1. Ingest from URLs
    urls = _get_urls_from_message(content)
    if urls:
        print(f"Found URLs: {urls}")
        if not user_id:
            print("User ID not found in state, skipping Notion URL ingestion.")
            ingested_content.append("Could not process URLs: user not identified.")
        else:
            for url in urls:
                page_id = _extract_notion_page_id(url)
                if page_id:
                    print(f"Extracted Notion page ID: {page_id}")
                    try:
                        # Based on user's prompt, we guess the tool name and parameters.
                        result = composio.tools.execute(
                            "NOTION_FETCH_NOTION_BLOCK",
                            user_id=user_id,
                            arguments={"block_id": page_id},
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

    # 2. Ingest from @-mentioned documents by looking for exact title matches
    if "@" in content:
        if not user_id:
            print("User ID not found in state, skipping document mention ingestion.")
            ingested_content.append("Could not process document mentions: user not identified.")
        else:
            doc_service = DocumentService()
            try:
                user_documents = doc_service.get_user_documents(user_id=user_id)
                
                # Sort documents by title length (descending) to match longer, more specific titles first.
                # This prevents a doc named "report" from matching inside "@final-report".
                sorted_docs = sorted(user_documents, key=lambda d: len(d.title), reverse=True)
                
                content_to_scan = content
                for doc in sorted_docs:
                    mention = f"@{doc.title}"
                    if mention in content_to_scan:
                        print(f"Ingesting content from document: '{doc.title}'")
                        ingested_content.append(doc.contents)
                        # Remove the mention so it's not matched again by a shorter title
                        content_to_scan = content_to_scan.replace(mention, "", 1)
                        
            except Exception as e:
                print(f"Error fetching user documents for @-mentions: {e}")
                ingested_content.append("Error processing document mentions.")


    
    current_knowledge = state.get("knowledge", "") or ""
    
    new_knowledge = "\n".join(ingested_content)
    
    updated_knowledge = f"{current_knowledge}\n\n{new_knowledge}".strip()

    print(f"Updated knowledge: {updated_knowledge[:500]}...")
    
    print("---FINISHED INGESTING KNOWLEDGE---")
    
    output = {"knowledge": updated_knowledge, **state}
        
    return output