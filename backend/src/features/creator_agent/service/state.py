from typing import Annotated, Any, Optional, Dict, List, TypedDict
from pydantic import BaseModel
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

import operator


class State(TypedDict):

    messages: Annotated[list[BaseMessage], add_messages]

    user_id: Optional[str] = None
    knowledge: Optional[str] = None
    confidence_score: Optional[int] = None
    course_structure: Optional[Dict[str, Any]] = None
    
    submodules: Optional[List[Dict[str, Any]]] = None
    current_index: int = 0                       
    outputs: Dict[str, str] = {}   
    
