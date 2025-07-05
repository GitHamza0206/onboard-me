from typing import Annotated, Any
from pydantic import BaseModel
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

import operator


class State(BaseModel):

    messages: Annotated[list[BaseMessage], add_messages] 
    