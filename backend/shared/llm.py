import os
from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

load_dotenv()


def get_llm(model_provider_and_name, disable_streaming=False):
    model_provider, model_name = model_provider_and_name.split("/")

    if model_provider == "anthropic":
        return ChatAnthropic(model=model_name, temperature=0.6, max_tokens=4096, disable_streaming=disable_streaming,streaming=not disable_streaming)
    elif model_provider == "openai":
        return ChatOpenAI(model=model_name, temperature=0.6, max_tokens=4096, disable_streaming=disable_streaming,streaming=not disable_streaming)
    else:
        raise ValueError(f"Model {model_name} not supported")
    
llm_model = "openai/gpt-4o"
llm = get_llm(llm_model, disable_streaming=False)
llm_not_streaming = get_llm(llm_model, disable_streaming=True)