from openai import OpenAI
from app.core.config import settings

client = OpenAI(api_key=settings.openai_api_key)
SYSTEM_PROMPT = """
Your task is to decompose a user query into a set of sub-queries that can be used to retrieve relevant information from a knowledge base for a Retrieval-Augmented Generation (RAG) system. Each sub-query should focus on a specific aspect or entity mentioned in the original query.

Identify the key entities, concepts, and relationships expressed in the user's query. Generate multiple concise and focused sub-queries, each targeting a specific piece of information needed to answer the original query. Ensure each sub-query is self-contained and can be used independently for information retrieval.

Output the decomposed sub-queries as a numbered list.
create at max 5sub-queries

For example:
User Query: What are the symptoms and treatment options for the common cold?
Decomposed Sub-queries:
1. What are the symptoms of the common cold?
2. What are the treatment options for the common cold?

User Query: Explain the theory of relativity in simple terms.
Decomposed Sub-queries:
1. What is the basic concept of the theory of relativity?
2. What are the key principles of the theory of relativity?

User Query: Compare and contrast the performance of Python and Java.
Decomposed Sub-queries:
1. What are the performance characteristics of Python?
2. What are the performance characteristics of Java?
3. How does the performance of Python compare to Java?
"""

def decompose_query(query: str ) -> list[str]:
    """
    Decompose a query into a list of subqueries.
    
    Args:
        query: The user's query string
        
    Returns:
        A list of subqueries or the original query if it's too short
    """
    # Validate input - handle very short queries
    if not query or len(query.strip()) <= 3:
        # For very short queries, just return the query itself without decomposition
        return [query]
    
    # Proceed with decomposition for meaningful queries
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": query}
            ]
        )
        
        # Parse the response into a list of queries
        subqueries_text = response.choices[0].message.content
        
        # Split by numbered items and filter out empty lines
        subqueries = []
        for line in subqueries_text.split('\n'):
            # Check if line starts with a number followed by a period
            if line.strip() and any(line.strip().startswith(f"{i}.") for i in range(1, 10)):
                # Remove the numbering from the line
                query_text = line.strip().split('.', 1)[1].strip()
                if query_text:
                    subqueries.append(query_text)
        
        # If parsing failed, just return the original query
        if not subqueries:
            return [query]
            
        return subqueries
    except Exception as e:
        # In case of any error, fall back to the original query
        print(f"Error in decompose_query: {str(e)}")
        return [query]



