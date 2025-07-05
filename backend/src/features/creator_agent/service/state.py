from typing import Annotated, Any, Optional, Dict
from pydantic import BaseModel
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

import operator


class State(BaseModel):

    messages: Annotated[list[BaseMessage], add_messages]
    confidence_score: int = 0
    course_structure: Optional[Dict[str, Any]] = None
    