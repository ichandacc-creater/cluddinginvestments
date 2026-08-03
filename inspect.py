from pathlib import Path
p = Path('projects.html')
s = p.read_text(encoding='utf-8')
start = s.find('<div class="brochure-layout">')
print('start', start)
print('segment:', repr(s[start:start+120]))
