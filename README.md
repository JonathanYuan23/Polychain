# Polychain

## TODO
- llm prompt + json schema in `backend/embedding/extract.py`
- validation of llm output by evidence
- move data sources/output to a gcp bucket

## Setup
```bash
python -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -r requirements.txt

...

source setup.sh

...

# If you don't have it:
# https://cloud.google.com/sdk/docs/install
gcloud --version
gcloud auth application-default login
gcloud auth application-default set-quota-project "$GOOGLE_CLOUD_PROJECT"
```

## Extracting Relationships

Data sources are in `backend/embedding/data/raw_pdfs`

To extract relationships, run in order:
```bash
python parse_pdfs.py
python chunk.py
python embed_and_index.py
python format.llm.py
```

The pdf parser will ignore documents that have already been parsed.