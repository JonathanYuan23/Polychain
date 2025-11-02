import os, json, faiss, numpy as np
from google.cloud import aiplatform
from vertexai.language_models import TextEmbeddingModel

EMBED_MODEL = os.getenv("EMBEDDING_MODEL", "gemini-embedding-001")

TOP_K = int(os.environ["RETRIEVE_TOP_K"])

index = faiss.read_index("index/faiss.index")
meta = [json.loads(l) for l in open("index/meta.jsonl", encoding="utf-8")]

# initialize vertex ai
aiplatform.init(project=os.environ["GOOGLE_CLOUD_PROJECT"], location=os.environ["GOOGLE_CLOUD_REGION"])

# embed query
def embed(q):
    model = TextEmbeddingModel.from_pretrained(EMBED_MODEL)
    v = model.get_embeddings([q])[0].values
    v = np.array([v], dtype="float32")
    faiss.normalize_L2(v)
    return v

# retrieve top k relevant chunks
def retrieve(q: str, top_k: int = TOP_K):
    qv = embed(q)
    _, I = index.search(qv, top_k)
    cands = [meta[i] for i in I[0] if i != -1]
    return cands

QUERY = "Extract explicit buyer-supplier, contract manufacturing, distributors, logistics, cloud/software provider relationships."