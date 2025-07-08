from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from uuid import uuid4

from .services.graph import graph

router = APIRouter()

class InvokeRequest(BaseModel):
    formation_id: int
    prompt: str
    thread_id: str | None = None

@router.post("/cursor/invoke")
async def invoke_agent(request: InvokeRequest):
    """
    Invokes the cursor agent to process a user prompt for a given formation.
    """
    try:
        thread_id = request.thread_id or str(uuid4())
        thread = {"configurable": {"thread_id": thread_id}}
        
        # We now prime the agent with a more specific prompt to guide it
        # towards using our tool.
        prompt = (
            "You are a course editing assistant. "
            f"A user wants to modify the course with ID '{request.formation_id}'. "
            "First, call the `get_course_structure` tool to understand the course. "
            "Here is the user's request: "
            f"'{request.prompt}'"
        )
        
        graph_input = {
            "messages": [("user", prompt)],
        }

        # For now, we'll just stream and print. Later, we'll handle the response properly.
        async for event in graph.astream(graph_input, thread):
            print(event) # For debugging on the server side

        # We will return the final state or the diff once the graph is implemented
        final_state = await graph.aget_state(thread)

        return {"thread_id": thread_id, "final_state": final_state.values}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
