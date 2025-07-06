from langgraph.prebuilt import ToolNode
from langchain_core.tools import tool
# from composio_langgraph import ComposioToolSet, App

# composio_toolset = ComposioToolSet()

# tools = composio_toolset.get_tools(
#     apps=[App.NOTION]
# )

# tool_node = ToolNode(tools)

@tool
def notion_tool(url: str) -> str:
    """Use this tool to get the content of a Notion page."""
    return "Notion page content"

tool_node = ToolNode([notion_tool])

