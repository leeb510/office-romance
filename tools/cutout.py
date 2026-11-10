"""AI로 만든 캐릭터 그림을 게임용 파일로 바꾸기

  전신 (배경 제거):  python tools/cutout.py 원본.png img/yujin_pt.webp
  얼굴 (크기만 맞춤): python tools/cutout.py --face 원본.png img/yujin_sad.webp

전신 그림은 단색 또는 옅은 그라디언트 배경에서 만든 그림일 때 가장 잘 지워집니다.
필요한 것: pip install pillow numpy opencv-python
"""
import sys
import numpy as np
import cv2
from PIL import Image, ImageFilter

FULL_H = 1240   # 전신 그림 높이 (px)
FACE_H = 390    # 얼굴 그림 높이 (px)


def remove_bg(bgr):
    img = bgr.astype(np.float32)
    h, w = img.shape[:2]
    # 1) 테두리에서 비슷한 색을 따라 채워 배경 영역 찾기
    c8 = bgr.copy()
    mask = np.zeros((h + 2, w + 2), np.uint8)
    flags = 4 | cv2.FLOODFILL_MASK_ONLY | (255 << 8)
    step = max(4, min(h, w) // 120)
    seeds = [(x, 0) for x in range(0, w, step)] + [(x, h - 1) for x in range(0, w, step)] \
        + [(0, y) for y in range(0, h, step)] + [(w - 1, y) for y in range(0, h, step)]
    for sx, sy in seeds:
        if not mask[sy + 1, sx + 1]:
            cv2.floodFill(c8, mask, (sx, sy), 0, (5,) * 3, (5,) * 3, flags)
    fg = (mask[1:-1, 1:-1] == 0).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(fg, 8)
    keep = np.zeros_like(fg)
    big = max(1500, int(h * w * 0.002))
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] > big:
            keep[lab == i] = 1
    # 2) 배경 색 모델 (행마다 왼쪽~오른쪽 테두리 색을 이어 줌)
    L = img[:, 1:5].mean(axis=1)
    R = img[:, w - 5:w - 1].mean(axis=1)
    t = np.linspace(0, 1, w)[None, :, None]
    B = cv2.GaussianBlur(L[:, None, :] * (1 - t) + R[:, None, :] * t, (1, 31), 8)
    dist = np.sqrt(((img - B) ** 2).sum(axis=2))
    soft = np.clip((dist - 6) / 28, 0, 1)
    near = cv2.dilate(keep, np.ones((5, 5), np.uint8))
    core = cv2.erode(keep, np.ones((3, 3), np.uint8), iterations=3)
    alpha = np.where(core > 0, 1.0, soft) * near
    # 팔과 몸 사이처럼 둘러싸인 좁은 배경 틈
    cand = ((dist < 9) & (keep > 0)).astype(np.uint8)
    n2, lab2, st2, _ = cv2.connectedComponentsWithStats(cand, 4)
    for i in range(1, n2):
        if st2[i, cv2.CC_STAT_AREA] > 60 and st2[i, cv2.CC_STAT_HEIGHT] > 2.5 * st2[i, cv2.CC_STAT_WIDTH]:
            alpha[lab2 == i] = 0
    alpha = cv2.GaussianBlur(alpha.astype(np.float32), (3, 3), 0.6)
    # 3) 가장자리에 남은 배경색 빼기
    a = np.clip(alpha, 1e-3, 1)[:, :, None]
    F = np.clip(np.where(a > 0.05, (img - (1 - a) * B) / a, img), 0, 255)
    rgba = np.dstack([F, alpha * 255]).astype(np.uint8)
    ys, xs = np.where(alpha > 0.05)
    return rgba[max(0, ys.min() - 3):ys.max() + 4, max(0, xs.min() - 3):xs.max() + 4]


def fit_height(im, target):
    if im.height == target:
        return im
    out = im.resize((round(im.width * target / im.height), target), Image.LANCZOS)
    if target > im.height:  # 키운 경우 살짝 선명하게
        rgb = out.convert('RGB').filter(ImageFilter.UnsharpMask(radius=1.6, percent=60, threshold=2))
        if 'A' in out.getbands():
            rgb.putalpha(out.getchannel('A'))
        out = rgb
    return out


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if len(args) != 2:
        print(__doc__)
        sys.exit(1)
    src, dst = args
    if '--face' in sys.argv:
        im = fit_height(Image.open(src).convert('RGB'), FACE_H)
    else:
        pim = Image.open(src)
        if pim.mode in ('RGBA', 'LA') and pim.getchannel('A').getextrema()[0] < 250:
            # 이미 배경이 투명한 그림: 여백만 자르고 크기 맞춤
            pim = pim.convert('RGBA')
            im = fit_height(pim.crop(pim.getchannel('A').point(lambda v: 255 if v > 12 else 0).getbbox()), FULL_H)
            im.save(dst, quality=90, method=6)
            print('저장:', dst, im.size)
            return
        bgr = cv2.imread(src, cv2.IMREAD_COLOR)
        if bgr is None:
            sys.exit(f'그림을 열 수 없어요: {src}')
        rgba = remove_bg(bgr)
        im = fit_height(Image.fromarray(cv2.cvtColor(rgba, cv2.COLOR_BGRA2RGBA)), FULL_H)
    im.save(dst, quality=90, method=6)
    print('저장:', dst, im.size)


if __name__ == '__main__':
    main()
