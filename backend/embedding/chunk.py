import os, json, hashlib, math
from typing import Generator

PARSED = "data/parsed_pdfs"
CHUNKS = "data/chunks/chunks.jsonl"

CHUNK_MAX_CHARS = int(os.environ["CHUNKING_MAX_CHARS"])
CHUNK_STRIDE = int(os.environ["CHUNKING_STRIDE"])

# gemini-embedding-001 has a max context window of 2048 tokens
def sliding_window(text: str, max_chars: int = CHUNK_MAX_CHARS, stride: int = CHUNK_STRIDE) -> Generator[str, None, None]:
    for i in range(0, max(1, len(text) - max_chars + 1), stride):
        yield text[i : i + max_chars]

if __name__ == "__main__":
    with open(CHUNKS, "w", encoding="utf-8") as out:
        for fname in os.listdir(PARSED):
            if not fname.endswith(".jsonl"): continue

            with open(os.path.join(PARSED, fname), encoding="utf-8") as f:
                pages = [json.loads(l) for l in f]

            if len(pages) == 0: continue

            doc_id = pages[0]["doc_id"]

            full_text = "\n".join(p["text"] for p in pages)

            # compute chunks
            for i, chunk in enumerate(sliding_window(full_text)): 
                chunk_id = hashlib.md5(f"{doc_id}:{i}".encode()).hexdigest()
                rec = {
                    "chunk_id": chunk_id,
                    "doc_id": doc_id,
                    "text": chunk,
                }
                out.write(json.dumps(rec, ensure_ascii=False) + "\n")

    print("Wrote chunks: ", CHUNKS)