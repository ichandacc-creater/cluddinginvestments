from pathlib import Path
import sys

try:
    import fitz
except Exception as e:
    print('FITZ_IMPORT_ERR', e)
    sys.exit(1)

PDF_PATH = Path(r'images/cladding Investments Company profile.pdf')
MODE = 'blocks'


def extract_layout(page):
    blocks = sorted(page.get_text(MODE), key=lambda block: (block[1], block[0]))
    lines = []
    for block in blocks:
        x0, y0, x1, y1, text = block[:5]
        text = text.strip()
        if not text:
            continue
        lines.append(f'BLOCK {x0:.0f},{y0:.0f} -> {x1:.0f},{y1:.0f}')
        lines.append(text)
        lines.append('')
    return '\n'.join(lines)


if __name__ == '__main__':
    pdf_path = Path(sys.argv[1]) if len(sys.argv) > 1 else PDF_PATH
    if not pdf_path.exists():
        print('PDF file not found:', pdf_path)
        sys.exit(1)

    print('exists', pdf_path.exists())
    doc = fitz.open(str(pdf_path))
    print('pages', doc.page_count)

    for i in range(min(8, doc.page_count)):
        page = doc[i]
        print(f'--- PAGE {i+1} ---')
        print(extract_layout(page))
        print()
