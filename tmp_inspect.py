from pathlib import Path
p = Path('projects.html')
s = p.read_text(encoding='utf-8')
start = s.find('<div class="brochure-layout">')
end = s.find('</section>\r\n\r\n    <a href="https://wa.me/260966011997"')
print('start', start)
print('end', end)
print('segment', repr(s[start:end+len('</section>\r\n\r\n    <a href="https://wa.me/260966011997"')]))
