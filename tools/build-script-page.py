"""대본 페이지 만들기: python3 tools/build-script-page.py → dist/script.html
story.js를 읽어 장면·대사·선택지·조건을 한눈에 보는 페이지를 만듭니다. (Node.js 필요)"""
import pathlib, subprocess
root = pathlib.Path(__file__).resolve().parent.parent
import base64, json
data = json.loads(subprocess.run(['node', 'tools/export-script.js'], cwd=root, capture_output=True, text=True, check=True).stdout)
# 일러스트를 작은 미리보기로 내장
from io import BytesIO
try:
    from PIL import Image
    cg = {}
    for f in sorted((root / 'img' / 'cg').glob('*.webp')):
        im = Image.open(f); im.thumbnail((360, 480)); buf = BytesIO(); im.save(buf, 'WEBP', quality=72)
        cg[f.stem] = 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()
    data['cg'] = cg
except ImportError:
    pass
data = json.dumps(data, ensure_ascii=False)
tpl = (root / 'tools/script-template.html').read_text(encoding='utf-8')
out = root / 'dist' / 'script.html'
out.parent.mkdir(exist_ok=True)
out.write_text(tpl.replace('__DATA__', data.replace('</', '<\\/')), encoding='utf-8')
print(out, out.stat().st_size // 1024, 'KB')
