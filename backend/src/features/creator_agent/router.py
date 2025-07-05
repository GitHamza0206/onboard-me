from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import AsyncGenerator, Dict, Any, List
import json
import asyncio
from langchain_core.messages import HumanMessage

from src.features.creator_agent.service.graph import graph

router = APIRouter()


class ChatRequest(BaseModel):
    message: str

class LangGraphRunRequest(BaseModel):
    assistant_id: str = "user-agent"
    thread_id: str = None
    input: Dict[str, Any]
    stream_mode: List[str] = ["values", "messages", "updates", "debug"]
    config: Dict[str, Any] = {}

class ThreadRunRequest(BaseModel):
    assistant_id: str = "creator-agent"
    input: Dict[str, Any]
    stream_mode: List[str] = ["values", "messages", "updates", "debug"]
    config: Dict[str, Any] = {}

class AssistantInfo(BaseModel):
    assistant_id: str
    graph_id: str 
    created_at: str
    updated_at: str
    config: Dict[str, Any]


class StreamEventProcessor:
    """Handles processing and formatting of stream events from the graph."""
    
    def __init__(self, thread_id: str = "1"):
        self.thread_id = thread_id
        self.config = {"configurable": {"thread_id": thread_id}}
    
    def _format_sse_data(self, event_type: str, payload: Any) -> str:
        """Format data as Server-Sent Event."""
        return f"data: {json.dumps([event_type, payload])}\n\n"
    
    def _process_messages_mode(self, chunk) -> str:
        """Process messages mode events - streaming text tokens."""
        token, _ = chunk
        if hasattr(token, 'type') and token.type == 'tool':
            return ""
        
        token_text = token.content if hasattr(token, "content") else str(token)
        return self._format_sse_data('messages', token_text)
    
    def _process_debug_mode(self, chunk) -> str:
        """Process debug mode events - tool calls and internal state."""
        serializable_chunk = self._make_serializable(chunk)
        debug_info = {
            "type": "debug",
            "data": serializable_chunk,
            "thread_id": self.thread_id
        }
        return self._format_sse_data('debug', debug_info)
    
    def _process_updates_mode(self, chunk) -> str:
        """Process updates mode events - node state changes and tool calls."""
        result = ""
        for node_name, state_update in chunk.items():
            if "messages" in state_update:
                serializable_messages = self._serialize_messages(state_update["messages"])
                update_info = {
                    "node": node_name,
                    "messages": serializable_messages,
                    "thread_id": self.thread_id
                }
                result += self._format_sse_data('updates', update_info)
        return result
    
    def _process_values_mode(self, chunk) -> str:
        """Process values mode events - state values and special outputs."""
        other_values = {k: v for k, v in chunk.items() 
                       if k != "messages" and v is not None}
        other_values["thread_id"] = self.thread_id
        
        result = ""
        
        # Handle special code generation output
        if "code_gen_output" in other_values and other_values["code_gen_output"]:
            result += self._format_sse_data('code_gen_output', other_values['code_gen_output'])
        
        if other_values:
            result += self._format_sse_data('values', other_values)
        
        return result
    
    def _make_serializable(self, obj) -> Any:
        """Convert objects to JSON-serializable format."""
        if hasattr(obj, '__dict__'):
            return {k: str(v) for k, v in obj.__dict__.items()}
        return str(obj)
    
    def _serialize_messages(self, messages: List) -> List[Dict[str, Any]]:
        """Convert message objects to serializable dictionaries."""
        serializable_messages = []
        for msg in messages:
            if hasattr(msg, 'content'):
                msg_dict = {
                    "role": getattr(msg, 'type', 'unknown'),
                    "content": msg.content
                }
                if hasattr(msg, 'tool_calls') and msg.tool_calls:
                    msg_dict["tool_calls"] = self._serialize_tool_calls(msg.tool_calls)
                serializable_messages.append(msg_dict)
        return serializable_messages
    
    def _serialize_tool_calls(self, tool_calls: List) -> List[Dict[str, Any]]:
        """Serialize tool calls to dictionary format."""
        return [
            {
                "id": tc.get("id", ""),
                "name": tc.get("name", ""),
                "args": tc.get("args", {})
            } for tc in tool_calls
        ]


class ChatStreamService:
    """Service for handling chat streaming operations."""
    
    def __init__(self):
        self.processor = StreamEventProcessor()
    
    async def stream_graph_state(self, message: str) -> AsyncGenerator[str, None]:
        """Stream events as the graph processes the message."""
        try:
            new_input = {"messages": [HumanMessage(content=message)]}
            
            async for mode, chunk in graph.astream(
                new_input,
                self.processor.config,
                stream_mode=["values", "messages", "updates"]
            ):
                event_data = self._process_stream_event(mode, chunk)
                if event_data:
                    yield event_data
                    
        except Exception as e:
            error_data = {"type": "error", "data": str(e)}
            yield self.processor._format_sse_data('error', error_data)
    
    def _process_stream_event(self, mode: str, chunk) -> str:
        """Route stream events to appropriate processors."""
        processors = {
            "messages": self.processor._process_messages_mode,
            "debug": self.processor._process_debug_mode,
            "updates": self.processor._process_updates_mode,
            "values": self.processor._process_values_mode
        }
        
        processor = processors.get(mode)
        return processor(chunk) if processor else ""


class ChatAPIHandler:
    """Handles FastAPI chat endpoint operations."""
    
    def __init__(self):
        self.chat_service = ChatStreamService()
    
    def create_sync_generator(self, message: str):
        """Create synchronous generator for FastAPI StreamingResponse."""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        async def async_generator():
            async for chunk in self.chat_service.stream_graph_state(message):
                yield chunk
        
        gen = async_generator()
        try:
            while True:
                yield loop.run_until_complete(gen.__anext__())
        except StopAsyncIteration:
            pass
        finally:
            loop.close()
    
    def get_streaming_response(self, message: str) -> StreamingResponse:
        """Create StreamingResponse with proper headers."""
        return StreamingResponse(
            self.create_sync_generator(message),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Content-Type": "text/event-stream"
            }
        )


# Initialize handler
chat_handler = ChatAPIHandler()


@router.post("/chat")
async def chat_stream(request: ChatRequest):
    """Streaming chat endpoint that processes messages through the graph."""
    return chat_handler.get_streaming_response(request.message)

@router.post("/runs/stream")
async def langgraph_stream(request: LangGraphRunRequest):
    """LangGraph SDK compatible streaming endpoint."""
    
    async def generate_langgraph_stream():
        # Extract thread_id from config or use provided thread_id
        thread_id = (request.config.get("configurable", {}).get("thread_id") 
                    or request.thread_id 
                    or f"thread_{asyncio.current_task().get_name()}")
        
        config = {"configurable": {"thread_id": thread_id}}
        
        # Convert input messages to LangChain format
        messages = []
        if "messages" in request.input:
            for msg in request.input["messages"]:
                if msg.get("type") == "human":
                    messages.append(HumanMessage(content=msg["content"]))
                # Add other message types as needed
        
        try:
            # Stream the graph execution
            async for mode, chunk in graph.astream(
                {"messages": messages},
                config,
                stream_mode=request.stream_mode
            ):
                # Handle UI events from push_ui_message
                if mode == "custom" and isinstance(chunk, dict) and chunk.get("type") == "ui":
                    yield f"data: {json.dumps(['ui', chunk])}\n\n"
                    
                elif mode == "messages":
                    token, _ = chunk
                    if hasattr(token, 'type') and token.type == 'tool':
                        continue
                    token_text = token.content if hasattr(token, "content") else str(token)
                    yield f"data: {json.dumps(['messages', token_text])}\n\n"
                    
                elif mode == "values":
                    # Include thread_id in values
                    other_values = {k: v for k, v in chunk.items() 
                                  if k != "messages" and v is not None}
                    other_values["thread_id"] = thread_id
                    
                    if other_values:
                        yield f"data: {json.dumps(['values', other_values])}\n\n"
                        
                elif mode == "updates":
                    # Process node updates
                    for node_name, state_update in chunk.items():
                        if "messages" in state_update:
                            serializable_messages = []
                            for msg in state_update["messages"]:
                                if hasattr(msg, 'content'):
                                    msg_dict = {
                                        "role": getattr(msg, 'type', 'unknown'),
                                        "type": getattr(msg, 'type', 'unknown'),
                                        "content": msg.content,
                                        "id": getattr(msg, 'id', None)
                                    }
                                    # Include tool calls if present
                                    if hasattr(msg, 'tool_calls') and msg.tool_calls:
                                        msg_dict["tool_calls"] = [
                                            {
                                                "id": tc.get("id", ""),
                                                "name": tc.get("name", ""),
                                                "args": tc.get("args", {})
                                            } for tc in msg.tool_calls
                                        ]
                                    # Include tool call id for tool messages
                                    if hasattr(msg, 'tool_call_id') and msg.tool_call_id:
                                        msg_dict["tool_call_id"] = msg.tool_call_id
                                    # Include name for tool messages
                                    if hasattr(msg, 'name') and msg.name:
                                        msg_dict["name"] = msg.name
                                        
                                    serializable_messages.append(msg_dict)
                            
                            update_info = {
                                "node": node_name,
                                "messages": serializable_messages,
                                "thread_id": thread_id
                            }
                            yield f"data: {json.dumps(['updates', update_info])}\n\n"
                            
                elif mode == "debug":
                    # Convert debug info to serializable format
                    serializable_chunk = {}
                    if hasattr(chunk, '__dict__'):
                        serializable_chunk = {k: str(v) for k, v in chunk.__dict__.items()}
                    else:
                        serializable_chunk = str(chunk)
                    
                    debug_info = {
                        "type": "debug",
                        "data": serializable_chunk,
                        "thread_id": thread_id
                    }
                    yield f"data: {json.dumps(['debug', debug_info])}\n\n"
            
            # Send completion signal
            yield f"data: [DONE]\n\n"
            
        except Exception as e:
            error_data = {"type": "error", "message": str(e)}
            yield f"data: {json.dumps(['error', error_data])}\n\n"
    
    return StreamingResponse(
        generate_langgraph_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    )

# Additional LangGraph Platform-compatible endpoints

@router.get("/assistants/{assistant_id}")
async def get_assistant(assistant_id: str):
    """Get assistant information - LangGraph Platform compatible."""
    return AssistantInfo(
        assistant_id=assistant_id,
        graph_id="vibelearn-agent",
        created_at="2024-01-01T00:00:00Z",
        updated_at="2024-01-01T00:00:00Z",
        config={"graph": "vibelearn.graph:graph"}
    )

@router.post("/threads/{thread_id}/runs/stream")
async def thread_run_stream(thread_id: str, request: ThreadRunRequest):
    """Thread-specific streaming run endpoint - LangGraph Platform compatible."""
    
    async def generate_thread_stream():
        config = {"configurable": {"thread_id": thread_id}}
        
        # Convert input messages to LangChain format
        messages = []
        if "messages" in request.input:
            for msg in request.input["messages"]:
                if msg.get("type") == "human":
                    messages.append(HumanMessage(content=msg["content"]))
        
        try:
            # Stream the graph execution
            async for mode, chunk in graph.astream(
                {"messages": messages},
                config,
                stream_mode=request.stream_mode
            ):
                # Handle UI events from push_ui_message
                if mode == "custom" and isinstance(chunk, dict) and chunk.get("type") == "ui":
                    yield f"data: {json.dumps(['ui', chunk])}\n\n"
                    
                elif mode == "messages":
                    token, _ = chunk
                    if hasattr(token, 'type') and token.type == 'tool':
                        continue
                    token_text = token.content if hasattr(token, "content") else str(token)
                    yield f"data: {json.dumps(['messages', token_text])}\n\n"
                    
                elif mode == "values":
                    other_values = {k: v for k, v in chunk.items() 
                                  if k != "messages" and v is not None}
                    other_values["thread_id"] = thread_id
                    
                    if other_values:
                        yield f"data: {json.dumps(['values', other_values])}\n\n"
                        
                elif mode == "updates":
                    for node_name, state_update in chunk.items():
                        if "messages" in state_update:
                            serializable_messages = []
                            for msg in state_update["messages"]:
                                if hasattr(msg, 'content'):
                                    msg_dict = {
                                        "role": getattr(msg, 'type', 'unknown'),
                                        "type": getattr(msg, 'type', 'unknown'),
                                        "content": msg.content,
                                        "id": getattr(msg, 'id', None)
                                    }
                                    if hasattr(msg, 'tool_calls') and msg.tool_calls:
                                        msg_dict["tool_calls"] = [
                                            {
                                                "id": tc.get("id", ""),
                                                "name": tc.get("name", ""),
                                                "args": tc.get("args", {})
                                            } for tc in msg.tool_calls
                                        ]
                                    if hasattr(msg, 'tool_call_id') and msg.tool_call_id:
                                        msg_dict["tool_call_id"] = msg.tool_call_id
                                    if hasattr(msg, 'name') and msg.name:
                                        msg_dict["name"] = msg.name
                                        
                                    serializable_messages.append(msg_dict)
                            
                            update_info = {
                                "node": node_name,
                                "messages": serializable_messages,
                                "thread_id": thread_id
                            }
                            yield f"data: {json.dumps(['updates', update_info])}\n\n"
                            
                elif mode == "debug":
                    serializable_chunk = {}
                    if hasattr(chunk, '__dict__'):
                        serializable_chunk = {k: str(v) for k, v in chunk.__dict__.items()}
                    else:
                        serializable_chunk = str(chunk)
                    
                    debug_info = {
                        "type": "debug",
                        "data": serializable_chunk,
                        "thread_id": thread_id
                    }
                    yield f"data: {json.dumps(['debug', debug_info])}\n\n"
            
            yield f"data: [DONE]\n\n"
            
        except Exception as e:
            error_data = {"type": "error", "message": str(e)}
            yield f"data: {json.dumps(['error', error_data])}\n\n"
    
    return StreamingResponse(
        generate_thread_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    )

@router.get("/threads/{thread_id}")
async def get_thread(thread_id: str):
    """Get thread information - LangGraph Platform compatible."""
    return {
        "thread_id": thread_id,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "metadata": {},
        "status": "idle"
    }

@router.post("/threads")
async def create_thread():
    """Create new thread - LangGraph Platform compatible."""
    import uuid
    thread_id = str(uuid.uuid4())
    return {
        "thread_id": thread_id,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "metadata": {},
        "status": "idle"
    }