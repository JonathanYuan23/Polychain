import os
import json
import re
from typing import List, Dict, Any
from google.cloud import aiplatform
from vertexai.generative_models import GenerativeModel

from retrieve import retrieve
from reranker import rerank
from extract import ENUM as RELATIONSHIP_TYPES

# Initialize Vertex AI
aiplatform.init(
    project=os.environ["GOOGLE_CLOUD_PROJECT"],
    location=os.environ["GOOGLE_CLOUD_REGION"]
)

# Use Gemini model for formatting
LLM_MODEL = os.getenv("LLM_MODEL", "gemini-2.5-flash")


def format_with_llm(
    query: str,
    retrieved_chunks: List[Dict[str, Any]],
    model_name: str = LLM_MODEL
) -> List[Dict[str, Any]]:
    """
    Extract structured relationship data from retrieved chunks using an LLM.
    
    Args:
        query: The original query that was used for retrieval
        retrieved_chunks: List of retrieved chunk dictionaries with 'chunk_id', 'doc_id', 'text'
        model_name: Name of the Gemini model to use
    
    Returns:
        List of relationship dictionaries in the specified format
    """
    # Prepare context from retrieved chunks with document references
    context_parts = []
    for i, chunk in enumerate(retrieved_chunks, 1):
        doc_id = chunk.get('doc_id', 'unknown')
        chunk_id = chunk.get('chunk_id', f'chunk_{i}')
        context_parts.append(
            f"[Chunk {i} - Document: {doc_id} - ChunkID: {chunk_id}]\n"
            f"{chunk.get('text', '')}\n"
        )
    
    context = "\n".join(context_parts)
    
    # Create prompt for structured relationship extraction
    relationship_types_str = ", ".join([f'"{rt}"' for rt in RELATIONSHIP_TYPES])
    prompt = f"""Extract explicit buyer-supplier, contract manufacturing, distributors, logistics, and cloud/software provider relationships from the following document chunks.

Return ONLY valid JSON array of relationship objects. Each relationship object must have exactly these fields:
- buyer: string (canonical ID/name of the buyer company, e.g., "NVIDIA")
- supplier: string (canonical ID/name of the supplier company, e.g., "TSMC")
- relation_type: string (must be one of: {relationship_types_str})
- role: string (one of: "foundry", "HBM", "OSAT", "logistics", "distributor", "cloud", "software", "contract_manufacturer", or other appropriate role)
- evidence_span: string (exact quoted text from the document that supports this relationship)
- doc_url: string (format as "doc_id.pdf" where doc_id comes from the chunk metadata, e.g., "nvidia-10k.pdf")
- effective_start: string or null (date in YYYY-MM-DD format if mentioned, otherwise null)
- effective_end: string or null (date in YYYY-MM-DD format if mentioned, otherwise null)
- confidence: float (0.0 to 1.0, based on how explicit and clear the relationship is)

Only extract relationships that are explicitly stated in the text. Do not infer relationships that are not clearly mentioned. Only extract relationships where the buyer is an actual explicit company name and the supplier is also an explicit company name.
If no relationships are found, return an empty array [].

Document Chunks:
{context}

Return ONLY the JSON array, no other text:"""
    
    # Initialize and call the Gemini model
    model = GenerativeModel(model_name)
    response = model.generate_content(prompt)
    
    # Extract JSON from response (handle cases where LLM adds markdown formatting)
    response_text = response.text.strip()
    
    # Try to extract JSON array from the response
    # Remove markdown code blocks if present
    json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
    if json_match:
        json_str = json_match.group(0)
    else:
        # Try to find JSON starting from the first [
        start_idx = response_text.find('[')
        if start_idx != -1:
            json_str = response_text[start_idx:]
        else:
            json_str = response_text
    
    try:
        relationships = json.loads(json_str)
        # Validate and normalize the relationships
        normalized = []
        for rel in relationships:
            if isinstance(rel, dict):
                # Ensure all required fields are present
                normalized_rel = {
                    "buyer": rel.get("buyer", ""),
                    "supplier": rel.get("supplier", ""),
                    "relation_type": rel.get("relation_type", ""),
                    "role": rel.get("role", ""),
                    "evidence_span": rel.get("evidence_span", ""),
                    "doc_url": rel.get("doc_url", ""),
                    "effective_start": rel.get("effective_start"),
                    "effective_end": rel.get("effective_end"),
                    "confidence": float(rel.get("confidence", 0.5))
                }
                # Only add if it has essential fields
                if normalized_rel["buyer"] and normalized_rel["supplier"]:
                    normalized.append(normalized_rel)
        return normalized
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON response: {e}")
        print(f"Response text: {response_text[:500]}")
        return []


def format_retrieve_and_format(
    query: str,
    top_k: int = None,
    model_name: str = LLM_MODEL
) -> List[Dict[str, Any]]:
    """
    Retrieve relevant chunks and extract structured relationships using an LLM.
    
    Args:
        query: The query to retrieve and format information for
        top_k: Number of top chunks to retrieve (uses default from retrieve.py if None)
        model_name: Name of the Gemini model to use
    
    Returns:
        List of relationship dictionaries in the specified format
    """
    # Retrieve relevant chunks
    if top_k is None:
        retrieved_chunks = retrieve(query)
    else:
        retrieved_chunks = retrieve(query, top_k=top_k)
    
    # Rerank the retrieved chunks for better relevance
    reranked_chunks = rerank(query, retrieved_chunks)
    
    # Extract relationships using LLM
    relationships = format_with_llm(query, reranked_chunks, model_name)
    
    return relationships


if __name__ == "__main__":
    # Example usage
    query = "Extract explicit buyer-supplier, contract manufacturing, distributors, logistics, cloud/software provider relationships."
    
    print("Query:", query)
    print("\n" + "="*80 + "\n")
    
    relationships = format_retrieve_and_format(query)
    print(f"Found {len(relationships)} relationships:\n")
    print(json.dumps(relationships, indent=2, ensure_ascii=False))

