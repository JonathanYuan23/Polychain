import os, json, pathlib
from pypdf import PdfReader

RAW = "data/raw_pdfs"
OUT = "data/parsed_pdfs"

def parse_pdf(path):
    reader = PdfReader(path)
    records = []
    for i, page in enumerate(reader.pages, start=1):    # pdf page numbers start at 1
        text = page.extract_text() or ""
        records.append({
            "doc_id": pathlib.Path(path).stem,
            "title": pathlib.Path(path).name,
            "page": i,
            "text": text
        })

    return records

if __name__ == "__main__":
    for f in os.listdir(RAW):
        if not f.lower().endswith(".pdf"): continue

        out = os.path.join(OUT, f"{pathlib.Path(f).stem}.jsonl")
        
        # skip if already parsed
        if os.path.exists(out):
            print(f"Skipping {f} (already parsed)")
            continue

        recs = parse_pdf(os.path.join(RAW, f))

        with open(out, "w", encoding="utf-8") as w:
            for r in recs:
                w.write(json.dumps(r, ensure_ascii=False) + "\n")
        
        print(f"Parsed {f}")

    print("Done. Output in:", OUT)