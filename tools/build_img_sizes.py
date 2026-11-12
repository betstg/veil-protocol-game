#!/usr/bin/env python3
"""Write book/img-sizes.js, the pixel size of every image in book/img.

The book reader needs each picture's shape before it loads, so it can lay out
pages without waiting for hundreds of images. Run again after adding images.
No third-party modules needed.
"""
import json, os, struct

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, 'book', 'img')
OUT = os.path.join(ROOT, 'book', 'img-sizes.js')


def jpeg_size(path):
    with open(path, 'rb') as f:
        if f.read(2) != b'\xff\xd8':
            return None
        while True:
            b = f.read(1)
            while b and b != b'\xff':
                b = f.read(1)
            while b == b'\xff':
                b = f.read(1)
            if not b:
                return None
            marker = b[0]
            if marker in (0xD8, 0xD9) or 0xD0 <= marker <= 0xD7:
                continue
            seg = struct.unpack('>H', f.read(2))[0]
            if marker in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
                f.read(1)
                h, w = struct.unpack('>HH', f.read(4))
                return [w, h]
            f.seek(seg - 2, 1)


def png_size(path):
    with open(path, 'rb') as f:
        head = f.read(24)
    if head[:8] != b'\x89PNG\r\n\x1a\n':
        return None
    w, h = struct.unpack('>II', head[16:24])
    return [w, h]


sizes = {}
for name in sorted(os.listdir(IMG)):
    p = os.path.join(IMG, name)
    low = name.lower()
    s = jpeg_size(p) if low.endswith(('.jpg', '.jpeg')) else png_size(p) if low.endswith('.png') else None
    if s:
        sizes[name] = s

with open(OUT, 'w') as f:
    f.write('// Built by tools/build_img_sizes.py. Do not edit by hand.\n')
    f.write('window.IMG_SIZES = ' + json.dumps(sizes, separators=(',', ':')) + ';\n')
print('wrote', OUT, len(sizes), 'images')
