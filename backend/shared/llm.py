import os
from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from langchain_mistralai import ChatMistralAI
from langchain_groq import ChatGroq  # <-- Import de Groq
from dotenv import load_dotenv

load_dotenv()


def get_llm(model_identifier, streaming=True):
    """
    Initialise et retourne un client de modèle de langage basé sur le fournisseur.

    Args:
        model_identifier (str): Une chaîne au format "fournisseur/nom_du_modèle",
                                ex: "openai/gpt-4o" ou
                                "groq/meta-llama/llama-4-scout-17b-16e-instruct".
        streaming (bool): Indique si les réponses en streaming sont activées.
    """
    try:
        provider, model_name = model_identifier.split("/", 1)
    except ValueError:
        raise ValueError(
            "L'identifiant du modèle doit être au format 'fournisseur/nom_du_modèle'"
        )

    # Paramètres communs pour tous les modèles
    params = {
        "temperature": 0,
        "streaming": streaming,
    }

    if provider == "anthropic":
        return ChatAnthropic(model=model_name, max_tokens=4096, **params)

    elif provider == "openai":
        return ChatOpenAI(model=model_name, max_tokens=4096, **params)

    elif provider == "mistral":
        return ChatMistralAI(model=model_name, max_tokens=4096, **params)

    elif provider == "groq":
        return ChatGroq(model_name=model_name, **params)

    else:
        raise ValueError(f"Le fournisseur de modèle '{provider}' n'est pas supporté")


# --- Configuration des variables d'environnement ---
# Pour utiliser Groq, définissez ces variables dans votre .env ou exportez-les :
# export MODEL_PROVIDER="groq"
# export MODEL_NAME="meta-llama/llama-4-scout-17b-16e-instruct"

MODEL_PROVIDER = os.getenv("MODEL_PROVIDER", "groq")
MODEL_NAME = os.getenv("MODEL_NAME", "llama3-70b-8192")
# MODEL_PROVIDER = os.getenv("MODEL_PROVIDER", "mistral")
# MODEL_NAME = os.getenv("MODEL_NAME", "mistral-small-latest")

# Construit l'identifiant complet du modèle
llm_model_identifier = f"{MODEL_PROVIDER}/{MODEL_NAME}"

print(f"Utilisation du modèle : {llm_model_identifier}")

# Obtient les instances avec et sans streaming du LLM
llm = get_llm(llm_model_identifier, streaming=True)
llm_not_streaming = get_llm(llm_model_identifier, streaming=False)
