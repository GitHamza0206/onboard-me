from typing import Annotated, Any, Optional, Dict, List, TypedDict
from pydantic import BaseModel
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

from src.features.formations.schema import FormationStructureCreate
import operator


class State(TypedDict):

    messages: Annotated[list[BaseMessage], add_messages]

    
    
    
