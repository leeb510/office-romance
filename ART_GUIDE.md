# 상황별 옷·표정 그림 만들기

게임은 상황마다 **옷**과 **표정**을 바꿔 부르도록 짜여 있어요.
아래 파일을 `img/` 폴더에 넣으면 그 장면부터 바로 바뀌고, 없는 파일은 기본 그림이 대신 나옵니다.

지금 들어 있는 것
- **PT 정장·주말 사복**: 캐릭터 시트 그림의 옷 색만 바꿔 만든 임시 버전 (`<id>_pt.webp`, `<id>_casual.webp`). 모양은 업무복과 같고, 사원증도 그대로예요. 새 그림을 같은 이름으로 덮어쓰면 됩니다.
- **코트**: 아직 없음 → 업무복으로 나와요.
- **표정**: 표정 전용 얼굴은 아직 없음. 대신 전신 그림의 얼굴과 안 맞는 표정(슬픔·놀람·설렘 등)이 나오면 업무/로맨스 모드 얼굴을 **클로즈업 컷**으로 크게 띄우고, 표정마다 땀방울·반짝임·눈물·집중선·색감을 달리해요. 표정 얼굴을 넣으면 그 클로즈업과 대사창 얼굴이 바로 바뀝니다.

## 1. 어떤 장면에서 어떤 옷인가

| 옷 | 파일 이름 | 나오는 장면 |
|---|---|---|
| 업무복 (기본) | `<id>.webp` | 1~3화, 6화, 7화 사무실, 에필로그 |
| 코트 | `<id>_coat.webp` | 4화 회식 후 밤거리, 도윤 7화 옥상 |
| 주말 사복 | `<id>_casual.webp` | 5화 주말(한강·영화·옥상), 9화 서아 연차·준호 한강 |
| PT 정장 | `<id>_pt.webp` | 8화 PT 당일 (모든 루트), 이어지는 9화 밤 장면(도윤·유진·하린) |

`<id>`: `seoa`(윤서아) · `doyun`(강도윤) · `junho`(이준호) · `yujin`(차유진) · `harin`(정하린)

## 2. 표정 얼굴

| 표정 | 파일 이름 | 없을 때 대신 쓰는 얼굴 |
|---|---|---|
| 평소 | `<id>_normal.webp` | 업무 모드 |
| 미소 | `<id>_smile.webp` | 로맨스 모드 |
| 활짝 웃음 | `<id>_grin.webp` | 로맨스 모드 |
| 설렘·홍조 | `<id>_blush.webp` | 로맨스 모드 |
| 수줍음 | `<id>_shy.webp` | 로맨스 모드 |
| 놀람 | `<id>_surprised.webp` | 업무 모드 |
| 진지함 | `<id>_serious.webp` | 업무 모드 |
| 슬픔 | `<id>_sad.webp` | 업무 모드 |
| 울먹임 | `<id>_teary.webp` | 업무 모드 |
| 화남·답답 | `<id>_angry.webp` | 업무 모드 |

### 먼저 만들면 좋은 순서 (스토리에 많이 나오는 순)

1. **놀람·설렘 얼굴 10장** — 다섯 명 모두 6~9번씩 나오고, 지금은 같은 얼굴이 반복됨
2. **슬픔·울먹임 얼굴** — 각 루트 7화의 핵심 장면
3. **코트 5장, 주말 사복 5장** — 사복은 지금 색만 바꾼 버전
4. **PT 정장 5장** — 색만 바꾼 버전이 있어서 급하지 않음
5. 캐릭터별 자주 쓰는 표정
   - 서아: 미소 · 놀람 · 설렘 · 울먹임
   - 도윤: 평소 · 미소 · 놀람 · 진지함
   - 준호: 활짝 웃음 · 설렘 · 놀람
   - 유진: 미소 · 평소 · 놀람 · 설렘 · 진지함
   - 하린: 미소 · 설렘 · 활짝 웃음 · 놀람 · 슬픔

## 3. 그림 만드는 법

캐릭터 시트 이미지를 **참고 이미지로 함께 넣고** 만들면 얼굴이 잘 유지돼요.

**전신 (옷)** — 세로 3:8 정도, 정면에 가까운 서 있는 자세, 단색 밝은 배경

```
Korean webtoon style, same character as the reference sheet: [캐릭터 설명],
wearing [옷 설명], full body, standing, facing slightly toward viewer,
plain light grey background, soft cel shading, clean line art, high resolution
```

**얼굴 (표정)** — 세로 3:4, 어깨 위 클로즈업, 시트의 얼굴 칸과 같은 구도

```
Korean webtoon style, same character as the reference sheet: [캐릭터 설명],
bust close-up portrait, [표정 설명], [옷 설명 — 장면 옷과 맞추면 더 자연스러움],
soft pastel background, clean line art, high resolution
```

### 캐릭터 설명 (시트 기준)

| id | 캐릭터 설명 |
|---|---|
| seoa | 28-year-old woman, shoulder-length wavy brown hair with bangs, warm brown eyes, friendly |
| doyun | 33-year-old tall man, swept-back black hair, sharp calm eyes, reserved |
| junho | 29-year-old man, fluffy wavy brown hair, bright cheerful smile |
| yujin | 32-year-old woman, sleek black chin-length bob, gold hoop earrings, elegant |
| harin | 27-year-old woman, short black pixie cut, round glasses, playful |

### 옷 설명 예시

| id | 주말 사복 (casual) | 코트 (coat) | PT 정장 (pt) |
|---|---|---|---|
| seoa | soft cream knit sweater, long pleated skirt | camel wool coat over work outfit, knit scarf | navy tailored blazer and slacks |
| doyun | navy knit sweater, dark jeans | long charcoal overcoat, grey scarf | navy three-piece suit, tie |
| junho | oversized hoodie, light jeans, sneakers | khaki trench coat over hoodie | beige blazer over white tee |
| yujin | white shirt, wide denim, loafers | long black coat over burgundy suit | black tailored suit, silk blouse |
| harin | oversized sweatshirt, wide pants, cap | puffy short padding jacket, glasses | grey blazer, pencil skirt |

### 표정 설명 예시

| 표정 | 프롬프트 |
|---|---|
| smile | gentle smile |
| grin | big open-mouthed laugh, eyes closed |
| blush | blushing deeply, flustered, looking away |
| shy | shy small smile, cheeks pink, eyes lowered |
| surprised | wide eyes, mouth slightly open, surprised |
| serious | serious focused expression |
| sad | sad expression, eyebrows lowered |
| teary | eyes filled with tears, trying not to cry |
| angry | frustrated pout, furrowed brows |

## 4. 게임에 넣기

배경 지우기와 크기 맞추기는 포함된 도구로 한 번에 할 수 있어요. (Python 필요)

```bash
pip install pillow numpy opencv-python
python tools/cutout.py 내려받은_PT정장.png img/yujin_pt.webp          # 전신: 배경 지우기
python tools/cutout.py --face 내려받은_놀람.png img/yujin_surprised.webp  # 얼굴: 크기 맞추기
```

배경이 이미 투명한 PNG도 같은 명령으로 넣으면 여백만 잘라 `.webp`로 바꿔 줘요. 게임은 `.webp` 이름만 찾으니 꼭 이름 규칙대로 저장하세요.

파일을 추가했다면 `sw.js`의 `VERSION` 숫자를 하나 올리고 GitHub에 올리세요.

## 5. 클로즈업 규칙 바꾸기

`story.js`의 CAST에서 `look`이 전신 그림의 얼굴을 알려 줘요.
- `look: 'smile'` (서아·준호·하린): 활짝 웃는 전신이라 진지함·슬픔·놀람·설렘에서 클로즈업
- `look: 'calm'` (도윤·유진): 차분한 전신이라 슬픔·놀람·설렘·활짝 웃음에서 클로즈업

표정 얼굴을 다 넣고 전신도 여러 표정으로 만들었다면, `engine.js`의 `CLOSE` 목록을 줄여 클로즈업을 덜 쓰게 할 수 있어요.
