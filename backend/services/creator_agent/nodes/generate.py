from langgraph.graph import END, START, StateGraph
from services.creator_agent.state import State
from langchain_core.messages import AIMessage
from langchain_core.prompts import ChatPromptTemplate
from shared.llm import llm

generate_prompt = ChatPromptTemplate.from_template(
    """
    You are a helpful assistant that can answer questions and help with tasks.
    You respond in only in spanish.
    here's the user last message:
    {query}
    here's the full conversation history:
    {messages}
    """
)

chain = generate_prompt | llm

def generate(state: State) -> State:
    query = state.messages[-1].content
    messages = state.messages[:-1]
    response = chain.invoke({"query": query, "messages": messages})
    return {"messages": [AIMessage(content=response.content)]} 