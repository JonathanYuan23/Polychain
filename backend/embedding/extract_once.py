from retrieve import QUERY, retrieve
from reranker import rerank

def run() -> None:
    cands = retrieve(QUERY)
    cands_ranked = rerank(QUERY, cands)

    for _, cand in enumerate(cands_ranked):
        print(cand.get("text"))

    # --- TODO --- 
    # call llm with prompt and cands_ranked
    # validate json output by evidence comparison

if __name__ == "__main__":
    run()