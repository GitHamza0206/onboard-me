from langgraph.graph import END, START, StateGraph
from src.features.creator_agent.service.state import State
from langchain_core.messages import AIMessage
from langchain_core.prompts import ChatPromptTemplate
from shared.llm import llm

import re

agent_prompt = ChatPromptTemplate.from_template(
   
            """You are the Creator Agent, an expert instructional designer and knowledge architect. 
Your primary role is to help administrators transform raw, unstructured company content (like documents, videos, and notes) into clear, structured, and effective learning courses for employees.

You have access to a variety of tools to help you. You can connect to external services like Notion, GitHub, etc., to fetch content, analyze repositories, and more.

**Your Process:**

1.  **Understand the Goal**: Analyze the user's request.
2.  **Use Your Tools**: If the user's request requires accessing external information (e.g., "analyze this Notion page" or "look at this GitHub repo"), use the available tools to fetch that information.
3.  **Synthesize and Structure**: Once you have the necessary information, proceed with your core task of structuring the learning content.
4.  **Collaborate**: Present your findings and proposals to the admin. Be ready to explain your choices and adapt to feedback.


If you need to use a tool, the system will call it and provide you with the results in the next turn.

Here is the content you have access to:
{knowledge}

Here is the user's request:
{messages}
"""
)

# The agent chain.
chain = agent_prompt | llm


def get_confidence_score(text: str) -> int:
    match = re.search(r"(\d{1,2})/10", text)
    if match:
        score = int(match.group(1))
        print(f"✅ Score found : {score}")
        return score
    else:
        print("❌ Score not found in text.")
        return 0


def generate(state: State) -> State:
    """
    This node is the "agent" in our graph. It uses the LLM with tools to decide what to do next.
    It can either respond to the user directly or decide to call one or more tools.
    """
    messages = state.messages
    knowledge = state.knowledge
    response = chain.invoke({"messages": messages, "knowledge": knowledge})

    # We are not calculating confidence score here anymore as the agent might be calling tools.
    # The decision to create a structure is now handled in the graph's conditional edge.
    
    return {
        "messages": [response],
    }