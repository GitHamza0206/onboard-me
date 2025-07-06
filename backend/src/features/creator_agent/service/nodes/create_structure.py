from langgraph.graph import END, START, StateGraph
from src.features.creator_agent.service.state import State
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from shared.llm import llm, llm_not_streaming

from pydantic import BaseModel, Field


class Lesson(BaseModel):
    id: str = Field(description="The unique identifier of the lesson")  
    title: str = Field(description="The title of the lesson")
    description: str = Field(description="The description of the lesson")

class Module(BaseModel):
    id: str = Field(description="The unique identifier of the module")
    title: str = Field(description="The title of the module")
    lessons: list[Lesson] = Field(description="The lessons of the module")

class CourseStructure(BaseModel):
    title: str = Field(description="The title of the course")
    modules: list[Module] = Field(description="The modules of the course")
# Prompt to generate the course structure as a JSON object
structure_prompt = ChatPromptTemplate.from_template(

            """You are a world-class instructional designer. Based on the entire conversation provided, your task is to generate a comprehensive, structured course outline.

The user has confirmed that you have enough information to proceed. Now, create the course structure.

**Output Format Requirements:**
- The output must be a single JSON object.
- The root of the object should have a "title" key for the overall course title.
- It should also have a "modules" key, which is an array of module objects.
- Each module object must have:
  - "id": A unique identifier (e.g., "module_1").
  - "title": A descriptive title for the module.
  - "lessons": An array of lesson objects.
- Each lesson object must have:
  - "id": A unique identifier (e.g., "lesson_101").
  - "title": A clear, action-oriented title for the lesson.
  - "description": A brief, one-sentence summary of what the learner will be able to do after this lesson.

**Example JSON Output:**
{{
  "title": "Mastering Advanced Sales Techniques",
  "modules": [
    {{
      "id": "module_1",
      "title": "Module 1: Prospecting and Lead Generation",
      "lessons": [
        {{
          "id": "lesson_101",
          "title": "Identifying Ideal Customer Profiles",
          "description": "Learn to define and target your ideal customers for maximum efficiency."
        }},
        {{
          "id": "lesson_102",
          "title": "Advanced Cold-Emailing Strategies",
          "description": "Craft compelling emails that get opened and generate responses."
        }}
      ]
    }},
    {{
      "id": "module_2",
      "title": "Module 2: Closing and Negotiation",
      "lessons": [
        {{
          "id": "lesson_201",
          "title": "Handling Objections with Confidence",
          "description": "Master techniques to overcome common sales objections."
        }}
      ]
    }}
  ]
}}

Do not add any explanations or introductory text before or after the JSON object.

given the following conversation:
{messages}

and the context : {knowledge}

generate the course structure.
"""
)



# Chain for creating the structure
chain = structure_prompt | llm_not_streaming.with_structured_output(CourseStructure)

def create_structure(state: State) -> State:
    messages = state.get("messages", [])
    knowledge = state.get("knowledge")
    structure_json = chain.invoke({"messages": messages, "knowledge": knowledge})           # ← génère la structure
    
    return {
        "messages": [
            AIMessage(                                    # s’affiche dans le chat
                content="✅ Structure générée, envoi au front…"
            )
        ],
        "course_structure": structure_json.model_dump()                # ← nouveau champ dans l’état
    }