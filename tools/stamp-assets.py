"""Append a content hash to CSS/JS URLs so a deploy is never served stale.

Runs on the checked-out copy in CI only; the files in the repo stay clean.
"""
import hashlib
import pathlib

ASSETS = ['assets/css/site.css', 'assets/css/fonts.css', 'assets/js/site.js']

stamps = {}
for asset in ASSETS:
    path = pathlib.Path(asset)
    if not path.exists():
        raise SystemExit('missing asset: ' + asset)
    stamps[asset] = hashlib.sha256(path.read_bytes()).hexdigest()[:8]

for page in sorted(pathlib.Path('.').glob('*.html')):
    text = original = page.read_text(encoding='utf-8')
    for asset, digest in stamps.items():
        text = text.replace('"%s"' % asset, '"%s?v=%s"' % (asset, digest))
    if text != original:
        page.write_text(text, encoding='utf-8')
        print('stamped', page)

for asset, digest in stamps.items():
    print('  %-24s %s' % (asset, digest))
