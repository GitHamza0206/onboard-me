import os
from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from langchain_mistralai import ChatMistralAI 
from dotenv import load_dotenv

load_dotenv()


def get_llm(model_provider_and_name, disable_streaming=False):
    model_provider, model_name = model_provider_and_name.split("/")

    if model_provider == "anthropic":
        return ChatAnthropic(model=model_name, temperature=0.6, max_tokens=4096, disable_streaming=disable_streaming,streaming=not disable_streaming)
    elif model_provider == "openai":
        return ChatOpenAI(model=model_name, temperature=0.6, max_tokens=4096, disable_streaming=disable_streaming,streaming=not disable_streaming)
    elif model_provider == "mistral":
        return ChatMistralAI(model=model_name, temperature=0.6, max_tokens=4096, disable_streaming=disable_streaming,streaming=not disable_streaming)
    else:
        raise ValueError(f"Model {model_name} not supported")
    

MODEL_PROVIDER = os.getenv("MODEL_PROVIDER", "mistral")
MODEL_NAME = os.getenv("MODEL_NAME", "mistral-small-latest")

llm_model = f"{MODEL_PROVIDER}/{MODEL_NAME}"
print(f"Using model: {llm_model}")
llm = get_llm(llm_model, disable_streaming=False)
llm_not_streaming = get_llm(llm_model, disable_streaming=True)