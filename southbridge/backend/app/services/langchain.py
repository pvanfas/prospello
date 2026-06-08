from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from app.core.config import settings

# -------------------------------
# Step 1: Initialize LLM
# -------------------------------
llm = ChatOpenAI(openai_api_key=settings.OPENAI_API_KEY, model_name="gpt-3.5-turbo")

# -------------------------------
# Step 2: Translation Prompt & Chain
# -------------------------------
translation_prompt = ChatPromptTemplate.from_template("""
You are a translator.
Translate the following text to English. 
Keep proper nouns, cities, and numbers unchanged.

Text: "{text}"

Translated text:
""")

# -------------------------------
# Step 3: Extraction Prompt & Chain
# -------------------------------
extraction_prompt = ChatPromptTemplate.from_template("""
You are an AI that extracts logistics shipment details from natural language.
From the following text, identify:

- goods_type (e.g., rice, wheat, cement, steel, electronics, etc.)
- weight (in kg/tons if mentioned)
- origin city/state/location
- destination city/state/location
- special_instructions (any special handling requirements)
- dimensions (if mentioned)
- category (choose one: perishable, fragile, hazardous, general, or other; always include this field)

Text: "{text}"

Respond strictly in JSON format:
{{
  "goods_type": "...",
  "weight": number_or_null,
  "origin": "...",
  "destination": "...",
  "special_instructions": "...",
  "dimensions": "...",
  "category": "perishable|fragile|hazardous|general|other"
}}
""")
# -------------------------------
# Step 4: Create the full chain
# -------------------------------
def create_full_chain():
    # Translation step
    translation_chain = translation_prompt | llm
    
    # Function to extract content and prepare for next step
    def extract_content(ai_message):
        return {"text": ai_message.content}
    
    # Extraction step
    extraction_chain = extraction_prompt | llm
    
    # Full chain: translate then extract
    full_chain = translation_chain | RunnableLambda(extract_content) | extraction_chain
    
    return full_chain

# Create the chain
full_chain = create_full_chain()