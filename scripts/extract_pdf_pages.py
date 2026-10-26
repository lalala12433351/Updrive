import fitz
import os

pdf_files = [
    r"C:\Users\cleme\.gemini\antigravity-ide\brain\a6d9ffb0-c67c-4e91-a606-f3638d3106f5\.user_uploaded\media_1793004432888.pdf",
    r"C:\Users\cleme\.gemini\antigravity-ide\brain\a6d9ffb0-c67c-4e91-a606-f3638d3106f5\.user_uploaded\media_1793004508743.pdf",
    r"C:\Users\cleme\.gemini\antigravity-ide\brain\a6d9ffb0-c67c-4e91-a606-f3638d3106f5\.user_uploaded\media_1793004541336.pdf",
    r"C:\Users\cleme\.gemini\antigravity-ide\brain\a6d9ffb0-c67c-4e91-a606-f3638d3106f5\.user_uploaded\media_1793004557458.pdf"
]

out_dir_public = r"c:\Users\cleme\OneDrive\Desktop\Updrive\public\instructor_docs"
out_dir_assets = r"c:\Users\cleme\OneDrive\Desktop\Updrive\assets\instructor_docs"

os.makedirs(out_dir_public, exist_ok=True)
os.makedirs(out_dir_assets, exist_ok=True)

# Also copy the original PDFs so they can be downloaded or linked if needed
pdf_names = [
    "01_trainer_terms_english.pdf",
    "02_trainer_terms_malayalam.pdf",
    "03_instructor_training_checklist_english.pdf",
    "04_instructor_training_checklist_malayalam.pdf"
]

all_generated_images = []

for idx, pdf_path in enumerate(pdf_files):
    pdf_base = pdf_names[idx].replace(".pdf", "")
    doc = fitz.open(pdf_path)
    print(f"Processing PDF {idx+1}: {pdf_names[idx]} ({len(doc)} pages)")
    
    # Copy PDF to public
    with open(pdf_path, "rb") as f_in:
        content = f_in.read()
        with open(os.path.join(out_dir_public, pdf_names[idx]), "wb") as f_out:
            f_out.write(content)
        with open(os.path.join(out_dir_assets, pdf_names[idx]), "wb") as f_out:
            f_out.write(content)

    # Render each page at 2x resolution (144 DPI) for crisp, clean mobile and retina reading
    zoom = 2.0  # 2x zoom
    mat = fitz.Matrix(zoom, zoom)

    for page_idx in range(len(doc)):
        page = doc[page_idx]
        pix = page.get_pixmap(matrix=mat, alpha=False)
        img_name = f"{pdf_base}_page_{page_idx+1:02d}.jpg"
        
        path_pub = os.path.join(out_dir_public, img_name)
        path_ast = os.path.join(out_dir_assets, img_name)
        
        pix.save(path_pub)
        pix.save(path_ast)
        all_generated_images.append(f"/instructor_docs/{img_name}")
        print(f"  Saved page {page_idx+1} -> {img_name}")

print("\nTotal pages generated:", len(all_generated_images))
