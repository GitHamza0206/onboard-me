from langgraph.graph import END, START, StateGraph
from src.features.creator_agent.service.state import State
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from shared.llm import llm

# Prompt to generate the course structure as a JSON object
structure_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
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
""",
        ),
        ("human", "{query}"),
    ]
)


# Chain for creating the structure
chain = structure_prompt | llm | JsonOutputParser()

def create_structure(state: State) -> State:
    """
    Génère la structure JSON, l'envoie à l'API pour la créer en base de données,
    et retourne le nouvel ID de formation.
    """
    messages = state.messages
    query = "\n".join([f"{msg.type}: {msg.content}" for msg in messages])
    
    # 1. Générer la structure JSON
    response_json = chain.invoke({"query": query})
    
    # 2. Envoyer la structure à l'API pour la création en DB
    try:
        # Note: Vous devrez gérer l'authentification si nécessaire.
        # Pour l'instant, on suppose un accès direct pour la simplicité.
        api_response = requests.post(f"{API_URL}/formations/", json=response_json)
        api_response.raise_for_status() # Lève une exception si le statut est une erreur (4xx ou 5xx)
        
        created_formation = api_response.json()
        new_formation_id = created_formation['id']
        
        # 3. Mettre à jour l'état avec le nouvel ID
        return {
            "new_formation_id": new_formation_id,
            "messages": [AIMessage(content=f"Structure de formation créée avec l'ID {new_formation_id}.")]
        }
        
    except requests.exceptions.RequestException as e:
        # Gérer les erreurs de l'appel API
        error_message = f"Erreur API lors de la création de la formation : {e}"
        # On peut renvoyer une erreur ou un message spécifique au front
        return {"messages": [AIMessage(content=error_message)]}
