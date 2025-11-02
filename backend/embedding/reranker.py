import os
from typing import List, Dict, Any
from sentence_transformers import CrossEncoder

# default reranker model = cross-encoder/ms-marco-MiniLM-L-6-v2
RERANK_MODEL = os.getenv("RERANKER_MODEL", "cross-encoder/ms-marco-MiniLM-L-6-v2")
RERANK_MAX_LEN = int(os.environ["RERANKER_MAX_TOKENS"])
RERANK_BATCH = int(os.environ["RERANKER_BATCH"])
RERANK_TOP_M = int(os.environ["RERANKER_TOP_M"])

CE = CrossEncoder(RERANK_MODEL, max_length=RERANK_MAX_LEN)

def rerank(
    query: str,
    candidates: List[Dict[str, Any]],
    text_key: str = "text",
    top_m: int = RERANK_TOP_M,
) -> List[Dict[str, Any]]:
    if not candidates:
        return []
    
    # build (query, passage) pairs.
    pairs = [(query, (c.get(text_key) or "")) for c in candidates]

    # predict relevance scores
    scores = CE.predict(pairs, batch_size=RERANK_BATCH, convert_to_numpy=True, show_progress_bar=False)

    # attach scores and sort
    for c, s in zip(candidates, scores):
        c["rerank_score"] = float(s)

    candidates.sort(key = lambda x: x["rerank_score"], reverse=True)
    return candidates[:top_m]