#!/usr/bin/env bash

# ---- GCP project & region ----
export GOOGLE_CLOUD_PROJECT="se390-polychain"
export GOOGLE_CLOUD_REGION="us-east1"

# ---- Chunking ----
export CHUNKING_MAX_CHARS="6400"
export CHUNKING_STRIDE="4800"

# ---- Embedding model ----
export EMBEDDING_MODEL="gemini-embedding-001"
export EMBEDDING_BATCH="64"

# ---- HNSW knobs ----
export HNSW_M="32"          # per-node degree
export HNSW_EFCON="200"     # efConstruction: how many entry points explored when building the index
export HNSW_EFSEARCH="128"   # efSearch: how many entry points explored during the search

export RETRIEVE_TOP_K="100"

# ---- Reranker ----
export RERANKER_MODEL="cross-encoder/ms-marco-MiniLM-L-6-v2"
export RERANKER_MAX_TOKENS="512"
export RERANKER_BATCH="32"

export RERANKER_TOP_M="30"