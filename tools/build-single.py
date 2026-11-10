"""한 파일짜리 미리보기(HTML) 만들기: python3 tools/build-single.py
index.html 안의 css/js를 모두 인라인해서 dist/office-romance-single.html로 저장합니다.
(GitHub Pages 배포에는 필요 없음. 파일 하나로 공유하고 싶을 때만 사용)
"""
import base64, json, pathlib, re, sys

root = pathlib.Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text(encoding='utf-8')
css = (root / 'css/style.css').read_text(encoding='utf-8')
js = ''.join((root / f'js/{n}.js').read_text(encoding='utf-8') + '\n' for n in ('art', 'story', 'engine'))
# 그림 파일을 data URI로 내장
imgs = {}
for f in sorted((root / 'img').rglob('*')):
    mime = {'.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg'}.get(f.suffix.lower())
    if mime:
        imgs[f.relative_to(root).as_posix()] = f'data:{mime};base64,' + base64.b64encode(f.read_bytes()).decode()
js = 'window.IMG = ' + json.dumps(imgs) + ';\n' + js
body = html.split('<!--BODY-->')[1].split('<!--/BODY-->')[0]
fonts = re.search(r'<link rel="stylesheet" href="(https://fonts[^"]+)">', html).group(1)

fragment = '--fragment' in sys.argv  # 문서 뼈대 없이 (아티팩트용)
head = f'''<title>오후 6시, 9층</title>
<link rel="stylesheet" href="{fonts}">
<style>
{css}
</style>'''
scripts = f'<script>\n{js}</script>'
if fragment:
    out = f'{head}\n{body}\n{scripts}\n'
    dest = root / 'dist' / 'preview-fragment.html'
else:
    out = f'''<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
<meta name="theme-color" content="#15172b">
{head}
</head><body>
{body}
{scripts}
</body></html>
'''
    dest = root / 'dist' / 'office-romance-single.html'
dest.parent.mkdir(exist_ok=True)
dest.write_text(out, encoding='utf-8')
print(dest, len(out.encode()) // 1024, 'KB')
