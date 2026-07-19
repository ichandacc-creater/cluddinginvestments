from pathlib import Path
import sys

try:
    import fitz
except Exception as e:
    print('FITZ_IMPORT_ERR', e)
    sys.exit(1)

pdf_path = Path(r'images/cladding Investments Company profile.pdf')
print('exists', pdf_path.exists())
doc = fitz.open(str(pdf_path))
print('pages', doc.page_count)
for i in range(min(8, doc.page_count)):
    page = doc[i]
    text = page.get_text('text')
    print(f'--- PAGE {i+1} ---')
    print(text[:7000])
    print()
