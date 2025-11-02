import os, json, numpy as np, faiss
from google.cloud import aiplatform
from vertexai.language_models import TextEmbeddingModel

# default embedding model = gemini-embedding-001
EMBED_MODEL = os.getenv("EMBEDDING_MODEL", "gemini-embedding-001")
EMBED_BATCH = int(os.environ["EMBEDDING_BATCH"])

# HNSW knobs
HNSW_M = int(os.environ["HNSW_M"])
HNSW_EFCON = int(os.environ["HNSW_EFCON"])
HNSW_EFSEARCH = int(os.environ["HNSW_EFSEARCH"])

# initialize vertex ai
aiplatform.init(project=os.environ["GOOGLE_CLOUD_PROJECT"], location=os.environ["GOOGLE_CLOUD_REGION"])

def embed_texts(texts, batch_size=EMBED_BATCH):
    model = TextEmbeddingModel.from_pretrained(EMBED_MODEL)
    vecs = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        embs = model.get_embeddings(batch)
        vecs.extend([e.values for e in embs])

    X = np.array(vecs, dtype="float32")

    faiss.normalize_L2(X)   # L2 norm, make cosine compatible
    return X

def build_hnsw(dim):

    # metric: use IP for cosine (vectors are L2-normalized)
    index = faiss.IndexHNSWFlat(dim, HNSW_M, faiss.METRIC_INNER_PRODUCT)
    index.hnsw.efConstruction = HNSW_EFCON
    index.hnsw.efSearch = HNSW_EFSEARCH

    return index

if __name__ == "__main__":
    # load chunks
    chunks = [json.loads(l) for l in open("data/chunks/chunks.jsonl", encoding="utf-8")]

    texts = [c["text"] for c in chunks]

    # build FAISS index
    X = embed_texts(texts)
    nvec, dim = X.shape[0], X.shape[1]

    index = build_hnsw(dim)
    index.add(X)

    os.makedirs("index", exist_ok = True)
    faiss.write_index(index, "index/faiss.index")

    with open("index/meta.jsonl", "w", encoding="utf-8") as w:
        for i, c in enumerate(chunks):

            # _row is position in faiss index
            c["_row"] = i
            w.write(json.dumps(c, ensure_ascii = False) + "\n")

    print(f"Index built with {EMBED_MODEL} (dim={dim}), vectors={nvec}: index/faiss.index")