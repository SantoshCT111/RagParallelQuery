import json
from openai import OpenAI
from app.core.config import settings

client = OpenAI(api_key=settings.openai_api_key)

SYSTEM_PROMPT = """
You are a helpful assistant whose sole job is:
- Given a user’s query, generate exactly {num_queries} paraphrased search queries.
- Output must be a valid JSON array of strings, nothing else (no numbering, no bullets, no commentary).
- Each string should be a single query closely related to the user’s original query.

Example output format:
[
  "What are alternatives to aspirin for pain relief?",
  "List adverse reactions of aspirin use",
  "How does aspirin affect the stomach?",
  "Possible side effects when taking aspirin",
  "Negative health impacts of aspirin consumption"
]
"""

def generate_similar_queries(query: str, num_queries: int = 5) -> list:
    """
    Generate similar queries to a given user query using OpenAI's GPT model.

    Args:
        query (str): The user query to generate similar queries for.
        num_queries (int): The number of similar queries to generate.

    Returns:
        list: A list of similar queries.
    """
    # 1) Fill in the system prompt
    system_content = SYSTEM_PROMPT.format(num_queries=num_queries)

    # 2) Send a minimal user payload
    user_content = json.dumps({"query": query})

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system",  "content": system_content},
            {"role": "user",    "content": user_content},
        ],
        max_tokens=200,
        temperature=0.5,
    )

    # 3) Parse the assistant's JSON-only reply
    try:
        similar_queries = json.loads(response.choices[0].message.content)
    except json.JSONDecodeError as e:
        raise ValueError(f"API returned invalid JSON: {e}\n\nFull response:\n{response.choices[0].message.content}")

    return similar_queries




