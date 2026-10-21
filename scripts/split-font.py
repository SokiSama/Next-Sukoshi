"""安装 fonttools[woff] 和 uharfbuzz 后运行，参数为 Adobe 原始可变 TTF 的路径。"""
from pathlib import Path
from concurrent.futures import ProcessPoolExecutor
import json
import re
import sys
from io import BytesIO
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools import subset

ROOT = Path(__file__).resolve().parents[1]
FONT_DIR = ROOT / 'public/fonts/source-han-sans'
SOURCE = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else FONT_DIR / 'SourceHanSansSC-VF.ttf'
RANGES = [(0x2E80, 0x2FFF), (0x3000, 0x303F), (0x3100, 0x312F),
          (0x31A0, 0x31BF), (0x31C0, 0x31EF), (0x3400, 0x4DBF),
          (0x4E00, 0x9FFF), (0xF900, 0xFAFF), (0xFE10, 0xFE19),
          (0xFE30, 0xFE4F), (0xFF01, 0xFF60), (0xFFE0, 0xFFE6), (0x20000, 0x2FA1F)]

def unicode_ranges(points):
    spans = []
    start = end = None
    for point in sorted(points):
        if end is not None and point == end + 1:
            end = point
        else:
            if start is not None:
                spans.append(f'U+{start:X}' + (f'-{end:X}' if end != start else ''))
            start = end = point
    if start is not None:
        spans.append(f'U+{start:X}' + (f'-{end:X}' if end != start else ''))
    return ','.join(spans)

def build(job):
    name, points = job
    face = hb.Face(SOURCE.read_bytes())
    selection = hb.SubsetInput()
    for point in points:
        selection.unicode_set.add(point)
    result = hb.subset(face, selection)
    font = TTFont(BytesIO(result.blob.data), recalcBBoxes=False, recalcTimestamp=False)
    font.flavor = 'woff2'
    target = FONT_DIR / name
    font.save(target)
    font.close()
    # Rare subsets have sorted, non-overlapping bounding ranges. The exact
    # template face is declared last, so its characters always use that face.
    ranges = unicode_ranges(points) if name == 'template.woff2' else f'U+{min(points):X}-{max(points):X}'
    return name, ranges, target.stat().st_size

if __name__ == '__main__':
    font = TTFont(SOURCE)
    available = {p for p in font.getBestCmap() if any(a <= p <= b for a, b in RANGES)}
    font.close()
    text = (ROOT / 'site.config.ts').read_text(encoding='utf-8-sig')
    for directory in ['app', 'data', 'public/posts']:
        for file in (ROOT / directory).rglob('*'):
            if file.suffix in {'.tsx', '.ts', '.json', '.md'}:
                text += file.read_text(encoding='utf-8-sig')
    critical = available & {ord(c) for c in text}
    remaining = sorted(available - critical)
    jobs = [('template.woff2', sorted(critical))]
    jobs += [(f'cjk-{i // 512:03d}.woff2', remaining[i:i+512]) for i in range(0, len(remaining), 512)]
    with ProcessPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(build, jobs))
    assert sum(len(points) for _, points in jobs) == len(available)
    css = '/* Source Han Sans SC: disjoint CJK subsets; Latin and digits retain the system font. */\n'
    for name, ranges, size in sorted(results, key=lambda item: item[0] == 'template.woff2'):
        css += f'@font-face {{ font-family: "Source Han Sans SC"; src: url("/fonts/source-han-sans/{name}") format("woff2"); font-weight: 250 900; font-style: normal; font-display: swap; unicode-range: {ranges}; }}\n'
        print(f'{name}: {size:,} bytes', flush=True)
    css += '\n:root { --font-site-sans: "Source Han Sans SC", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif; --font-display-sans: var(--font-site-sans); }\n'
    (ROOT / 'app/fonts.css').write_text(css, encoding='utf-8')
    (FONT_DIR / 'subsets.json').write_text(json.dumps({'glyphs':len(available), 'templateGlyphs':len(critical), 'files':[{'name':n, 'bytes':s} for n, _, s in results]}, indent=2), encoding='utf-8')
