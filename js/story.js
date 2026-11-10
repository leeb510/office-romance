/* =========================================================
   story.js — 게임의 모든 대사와 분기
   ---------------------------------------------------------
   이 파일만 고치면 스토리를 바꿀 수 있어요. 문법은 README 참고.

   자주 쓰는 명령
   { bg:'office' }                     배경 바꾸기
   { fx:'snow' } / { fx:'none' }       눈 / 꽃잎(petal) 효과
   { show:'yujin', e:'smile' }         캐릭터만 띄우기
   { hide:1 }                          캐릭터 내리기
   { title:'1화', sub:'첫 출근' }       챕터 카드 (자동 저장 지점)
   { t:'...' }                         지문(나레이션)
   { me:'...' }                        주인공 대사
   { s:'yujin', e:'smile', t:'...' }   캐릭터 대사 (+표정)
   { s:'박 부장', t:'...' }             그림 없는 인물 대사
   { msg:'junho', t:'...' }            메신저 메시지
   { sfx:'두근' }                      효과음 글자 띄우기
   { outfit:{ yujin:'pt' } }           옷 갈아입기 (all: 모두). work·casual·coat·pt
   { add:{ yujin:1, work:1 } }         수치 올리기
   { set:{ seenSketch:true } }         플래그 켜기
   { if: v => v.seenSketch, then:[...], else:[...] }
   { choice:[ { t:'선택지', add:{}, set:{}, then:[...], go:'장면' } ] }
   { go:'장면' }  또는  { go: v => 조건 ? 'a' : 'b' }
   { ending:'yujin_happy' }

   표정(e): normal · serious · surprised · sad · teary · angry
            smile · grin · blush · shy
            img/<id>_<표정>.webp 파일이 있으면 그 얼굴, 없으면
            업무 모드(_work) / 로맨스 모드(_love) 얼굴 + 표정 기호

   텍스트 안에서
   {name}             플레이어 이름
   {name|이라고|라고}   이름 받침에 따라 조사 선택
   ========================================================= */

window.CAST = {
  seoa:  { look: 'smile', name: '윤서아', short: '서아', age: 28, role: '마케팅팀 사원 · 사수', color: '#6f86b8', tint: '#dfe5f2',
           desc: '늘 "괜찮아요!"라고 웃는 다정한 사수. 노트에 할 일이 빼곡하다.' },
  doyun: { look: 'calm', name: '강도윤', short: '도윤', age: 33, role: '기획팀 팀장', color: '#4a4e6c', tint: '#dddde9',
           desc: '말수 적고 차가워 보이는 팀장. 옥상에서 버려진 화분을 키운다.' },
  junho: { look: 'smile', name: '이준호', short: '준호', age: 29, role: '디자인팀 디자이너', color: '#6d9468', tint: '#e1e8dc',
           desc: '늘 웃는 분위기 메이커. 책상 위 고무 오리에게 말을 건다.' },
  yujin: { look: 'calm', name: '차유진', short: '유진', age: 32, role: '브랜드전략팀 매니저', color: '#8a3149', tint: '#ece0e8',
           desc: '이번 PT 총괄. 완벽주의자인데, 회의 노트 귀퉁이에 고양이를 그린다.' },
  harin: { look: 'smile', name: '정하린', short: '하린', age: 27, role: '마케팅팀 사원', color: '#d98a74', tint: '#f6e3df',
           desc: '커피 세 잔은 기본인 1년 차 선배. 거의 동기 같은 사이.' },
};
// look: 전신 그림의 얼굴 (smile=활짝 웃는 얼굴, calm=차분한 얼굴).
//       전신 얼굴과 안 맞는 표정이 나오면 얼굴 클로즈업 컷으로 바뀝니다.
// 각 캐릭터 그림 파일: img/<id>.webp(전신), img/<id>_work.webp, img/<id>_love.webp
// 다른 그림으로 바꾸려면 같은 이름으로 파일만 교체하세요.

// 장면 일러스트 (컷신). 스토리에서 { cg:'doyun_elevator' }로 띄우고 { cg:0 }으로 내림.
// 배경이 바뀌거나 캐릭터를 내리거나({ hide:1 }) 다음 화로 넘어가면 자동으로 내려가요.
// 파일: img/cg/<id>.webp   본 일러스트는 엔딩 앨범의 "장면" 칸에 모여요.
window.CGS = {
  seoa_wave:      { who: 'seoa', title: '첫 출근, 사수의 인사' },
  harin_coffee:   { who: 'harin', title: '환영 커피' },
  doyun_elevator: { who: 'doyun', title: '닫히던 문 사이로' },
  junho_desk:     { who: 'junho', title: '꽥이를 소개합니다' },
  lunch_alone:    { who: null, title: '김밥과 지난 PT 자료' },
  yujin_meeting:  { who: 'yujin', title: '빨간 펜의 수요일' },
  night_office:   { who: null, title: '밤 10시, 커피 한 잔' },
  yujin_sketch:   { who: 'yujin', title: '들켜 버린 스케치북' },
  junho_night:    { who: 'junho', title: '밤 10시의 행운의 오리' },
  harin_secret:   { who: 'harin', title: '쉿, 비밀 계정' },
  doyun_coffee:   { who: 'doyun', title: '남는 거라면서 따뜻하네' },
  morning_after:  { who: null, title: '아무도 화내지 않은 아침' },
  midnight_desk:  { who: null, title: '자정의 시안' },
  dinner:         { who: null, title: '신입 환영 회식' },
  karaoke:        { who: null, title: '탬버린과 마이크' },
  yujin_taxi:     { who: 'yujin', title: '창밖으로 흐르는 불빛' },
  doyun_milk:     { who: 'doyun', title: '바나나우유 두 개' },
  seoa_phone:     { who: 'seoa', title: '휴대폰은 가방 깊숙이' },
  my_room:        { who: null, title: '생각보다 괜찮은 한 주' },
  messages:       { who: null, title: '토요일 오후 2시의 알림' },
  junho_bike:     { who: 'junho', title: '새끼손가락 약속' },
  yujin_home:     { who: 'yujin', title: '단골 카페는 비밀' },
  harin_cinema:   { who: 'harin', title: '나답지 않은 눈물' },
  doyun_sprout:   { who: 'doyun', title: '봄이의 새잎' },
  junho_elevator: { who: 'junho', title: '괜찮다는 말' },
  study:          { who: null, title: '빼곡해진 노트 한 권' },
  folder_lost:    { who: null, title: '사라진 폴더' },
  yujin_3am:      { who: 'yujin', title: '새벽 3시의 80%' },
  junho_restore:  { who: 'junho', title: '다 찾았다!' },
  doyun_backup:   { who: 'doyun', title: '2년 동안의 백업' },
  seoa_schedule:  { who: 'seoa', title: '우리 둘 이름으로' },
  harin_video:    { who: 'harin', title: '30초짜리 이야기' },
  leave_early:    { who: null, title: '아무도 말을 걸지 않았다' },
  dawn_work:      { who: null, title: '동이 틀 무렵' },
  team_9f:        { who: null, title: '9층의 오후' },
  seoa_stairs:    { who: 'seoa', title: '계단참의 노트' },
  seoa_no:        { who: 'seoa', title: '처음 듣는 아니요' },
  seoa_river:     { who: 'seoa', title: '나를 위한 할 일 목록' },
  seoa_wait:      { who: 'seoa', title: '연필로 적어 둘게요' },
  seoa_happy:     { who: 'seoa', title: '첫 번째 칸에 체크' },
  seoa_postit:    { who: 'seoa', title: '반만 부탁해요' },
  doyun_alone:    { who: 'doyun', title: '너무 많은 물' },
  doyun_pt:       { who: 'doyun', title: '죽어 가던 화분에도' },
  doyun_snow:     { who: 'doyun', title: '3월의 늦은 눈' },
  doyun_wait:     { who: 'doyun', title: '봄이 꽃이 피면' },
  doyun_scarf:    { who: 'doyun', title: '목도리' },
  doyun_bloom:    { who: 'doyun', title: '꽃이 피던 날' },
  junho_plan:     { who: 'junho', title: '스튜디오 사업계획서' },
  junho_fix:      { who: 'junho', title: '숨김 레이어' },
  junho_river:    { who: 'junho', title: '해 질 녘의 손' },
  junho_wait:     { who: 'junho', title: '자리 잡으면, 꼭' },
  junho_studio:   { who: 'junho', title: '스튜디오 꽥' },
  junho_farewell: { who: 'junho', title: '두고 간 꽥이' },
  yujin_gift:     { who: 'yujin', title: '고양이 두 마리' },
  yujin_pt:       { who: 'yujin', title: '초록이어야 하는 이유' },
  yujin_river:    { who: 'yujin', title: '그냥 차유진으로' },
  yujin_wait:     { who: 'yujin', title: '조금만 기다려 줄래요' },
  yujin_hand:     { who: 'yujin', title: '손잡고 퇴근하는 고양이' },
  yujin_doc:      { who: 'yujin', title: '서류 귀퉁이의 고양이' },
  harin_rooftop:  { who: 'harin', title: '들켜 버린 계정' },
  harin_pt:       { who: 'harin', title: '농담 없는 목소리' },
  harin_night:    { who: 'harin', title: '네 번째 커피' },
  harin_wait:     { who: 'harin', title: '조금만 아껴 둘게' },
  harin_happy:    { who: 'harin', title: '웃기지 않은 웃음' },
  harin_daily:    { who: 'harin', title: '오늘도 커피 두 잔' },
  award:          { who: null, title: '올해의 신입' },
  empty_hall:     { who: null, title: '엇갈린 퇴근길' },
  closing_door:   { who: null, title: '닫히는 엘리베이터' },
  six_pm:         { who: null, title: '오후 6시 정각' },
};

// 배경을 그림 파일로 바꾸고 싶을 때 (없으면 코드로 그린 배경 사용)
// 예: window.BG_IMAGES = { office: 'img/bg_office.jpg', pt: 'img/bg_pt.jpg' };
window.BG_IMAGES = {};

window.ENDINGS = [
  { id: 'seoa_happy',   who: 'seoa',  title: '노트의 첫 번째 칸',      desc: '사수의 할 일 목록 맨 위에 내 이름이 적혔다.', hint: '늘 괜찮다는 사람에게, 괜찮지 않아도 된다고.' },
  { id: 'seoa_normal',  who: 'seoa',  title: '든든한 사수와 부사수',    desc: '서로의 일을 나눠 드는 최고의 짝꿍.', hint: '서아 루트에서 대신 짊어져 버리면.' },
  { id: 'doyun_happy',  who: 'doyun', title: '봄보다 먼저 핀',          desc: '옥상 정원에 꽃이 피었다.', hint: '팀장님이 멈췄을 때, 무대 끝에서 기다려 주자.' },
  { id: 'doyun_normal', who: 'doyun', title: '옥상 화분 당번',          desc: '말없이 물을 주는 사이.', hint: '도윤 루트에서 대신 나서 버리면.' },
  { id: 'junho_happy',  who: 'junho', title: '행운의 오리에게',         desc: '동료에서 둘만의 스튜디오로.', hint: '준호의 꿈을 끝까지 응원하자.' },
  { id: 'junho_normal', who: 'junho', title: '영원한 9층 메이트',       desc: '평생 가는 최고의 동료.', hint: '준호 루트에서 현실적인 선택을 하면.' },
  { id: 'yujin_happy',  who: 'yujin', title: '고양이 두 마리의 퇴근길', desc: '매니저님의 빈칸을 채운 사람이 되었다.', hint: '유진이 흔들릴 때, 사람으로 대해 주자.' },
  { id: 'yujin_normal', who: 'yujin', title: '존경하는 나의 매니저님',   desc: '최고의 상사와 팀원으로 남았다.', hint: '유진 루트에서 마음을 조금 덜 전하면.' },
  { id: 'harin_happy',  who: 'harin', title: '커피 두 잔의 고백',        desc: '웃기지 않아도 좋은 사람.', hint: '하린의 진짜 목소리를 믿어 주자.' },
  { id: 'harin_normal', who: 'harin', title: '단짝 선배',               desc: '점심도 퇴근도 함께하는 사이.', hint: '하린 루트에서 무대를 대신 정리하면.' },
  { id: 'career',       who: null,    title: '올해의 신입',              desc: '연애보다 일이 더 재밌었다.', hint: '누구와도 깊어지지 않고, 일에 몰두하면.' },
  { id: 'missed',       who: null,    title: '엇갈린 퇴근길',            desc: '가까워질 수 있었던 사람과 멀어졌다.', hint: '누군가의 루트에서 상처 주는 말을 하면…' },
  { id: 'bad',          who: null,    title: '닫히는 엘리베이터',        desc: '수습 연장. 아무도 문을 잡아 주지 않았다.', hint: '일도 사람도 가볍게 대하면…' },
  { id: 'solo',         who: null,    title: '6시 정각 퇴근',            desc: '조용하지만 나쁘지 않은 한 달.', hint: '아무에게도, 일에도 마음을 주지 않으면.' },
];

// 호감도가 이 값 이상인 캐릭터 중 가장 높은 사람의 루트로 들어갑니다.
window.ROUTE_THRESHOLD = 7;
// 루트에서 해피엔딩에 필요한 '마음 점수(rs)'
window.HAPPY_RS = 2;

// 사고(bad)가 이만큼 쌓이면 6화 뒤 나쁜 엔딩으로
window.BAD_LIMIT = 3;

window.START_VARS = { seoa: 0, doyun: 0, junho: 0, yujin: 0, harin: 0, work: 0, rs: 0, bad: 0 };

window.STORY = {

  /* ======================= 프롤로그 ======================= */
  prologue: [
    { title: '프롤로그', sub: '월요일 오전 8시 58분' },
    { bg: 'lobby' },
    { t: '월요일 아침. 오늘은 (주)루멘 마케팅팀으로 첫 출근하는 날이다.' },
    { t: '출근은 9시. 엘리베이터 문이 막 닫히려 한다.' },
    { me: '잠, 잠깐만요!' },
    { sfx: '턱!' },
    { cg: 'doyun_elevator' },
    { t: '닫히던 문 사이로 긴 팔 하나가 쑥 들어와 문을 붙잡았다.' },
    { s: 'doyun', e: 'normal', t: '…타요.' },
    { t: '말끔한 수트에 무표정한 얼굴. 다른 손엔 어울리지 않게 작은 화분을 들고 있다.' },
    { choice: [
      { t: '"감사합니다! 덕분에 살았어요."', add: { doyun: 1 }, then: [
        { s: 'doyun', e: 'normal', t: '…별말을.' },
        { t: '짧은 대답. 그래도 9층 버튼은 그가 먼저 눌러 주었다.' },
      ] },
      { t: '"그 화분, 회사에서 키우시는 거예요?"', add: { doyun: 2 }, then: [
        { s: 'doyun', e: 'surprised', t: '…아. 옥상에 두려고요. 사무실은 해가 안 들어서.' },
        { s: 'doyun', e: 'smile', t: '얘 이름은 봄이에요.' },
        { t: '화분에 이름이 있다니. 차가워 보이는 인상과는 딴판이다.' },
      ] },
      { t: '(꾸벅 인사만 하고 층수 표시만 바라본다)', then: [
        { t: '어색한 침묵 속에 엘리베이터가 9층에 도착했다.' },
      ] },
      { t: '(휴대폰을 보며 닫힘 버튼만 연타한다)', add: { doyun: -1 }, then: [
        { s: 'doyun', e: 'serious', t: '…닫힘 버튼은 그만 눌러요. 화분 놀라니까.' },
        { t: '엘리베이터 안 공기가 싸늘해졌다.' },
      ] },
    ] },
    { hide: 1 },
    { bg: 'office' },
    { cg: 'seoa_wave' },
    { t: '마케팅팀 자리에 도착하자, 노트를 품에 안은 사람이 환하게 손을 흔들었다.' },
    { s: 'seoa', e: 'grin', t: '{name} 씨 맞죠? 반가워요! 오늘부터 사수를 맡은 윤서아예요.' },
    { s: 'seoa', e: 'smile', t: '모르는 건 뭐든 물어봐요. 회사 생활 꿀팁은 이 노트에 다 있어요!' },
    { choice: [
      { t: '"잘 부탁드립니다, 선배! 노트 보고 싶어요."', add: { seoa: 2 }, then: [
        { s: 'seoa', e: 'shy', t: '앗, 진짜요? 이거 아무도 관심 없던데… 기뻐라.' },
      ] },
      { t: '"잘 부탁드립니다. 빨리 배워서 짐 안 될게요."', add: { seoa: 1, work: 1 }, then: [
        { s: 'seoa', e: 'smile', t: '짐이라뇨. 천천히 해도 괜찮아요. 그러려고 사수가 있는 거니까.' },
      ] },
      { t: '"노트요? 요즘 누가 손으로 써요. 앱 쓰세요."', add: { seoa: -2 }, then: [
        { s: 'seoa', e: 'sad', t: '아… 그렇죠. 하하. 제가 좀 옛날 사람이라.' },
        { t: '선배가 노트를 슬며시 가방에 넣었다.' },
      ] },
    ] },
    { hide: 1 },
    { cg: 'harin_coffee' },
    { t: '그때 옆자리 칸막이 너머로 커피잔을 든 손이 쑥 올라왔다.' },
    { s: 'harin', e: 'grin', t: '신입이다! 마케팅팀 정하린이에요. 1년 차라서 거의 동기나 다름없어요.' },
    { s: 'harin', e: 'smile', t: '이건 환영 커피. 제가 오늘 마시는 세 번째 잔이랑 같은 거예요.' },
    { choice: [
      { t: '"하린 선배, 커피 감사해요! 말 편하게 하세요."', add: { harin: 2 }, then: [
        { s: 'harin', e: 'grin', t: '오, 센스 좋다. 그럼 오늘부터 우린 9층 커피 동맹이야.' },
      ] },
      { t: '"세 번째 잔이요…? 아직 9시인데요."', add: { harin: 1 }, then: [
        { s: 'harin', e: 'smile', t: '마케터는 카페인으로 굴러가요. 곧 알게 될 거예요.' },
      ] },
      { t: '"저 커피 안 마셔요. 그리고 동기는 아니잖아요."', add: { harin: -2 }, set: { harinCold: true }, then: [
        { s: 'harin', e: 'surprised', t: '아… 그렇죠. 미안해요, 신입 씨.' },
        { t: '하린 선배는 커피를 도로 가져갔다. 칸막이 너머가 조용해졌다.' },
      ] },
    ] },
    { hide: 1 },
    { t: '오전 회의실. 와인색 수트의 여자가 들어서자 공기가 달라졌다.' },
    { s: 'yujin', e: 'serious', t: '브랜드전략팀 차유진입니다. 이번 봄빛음료 리브랜딩 경쟁 PT 총괄이에요.' },
    { s: 'yujin', e: 'normal', t: '3주 남았습니다. 신입이라고 봐주진 않을 거예요. 대신 잘하면, 확실히 기억하죠.' },
    { choice: [
      { t: '"3주 안에 꼭 제 몫을 하겠습니다."', add: { work: 1 }, then: [
        { s: 'yujin', e: 'normal', t: '좋은 대답이에요. 메모해 둘게요.' },
      ] },
      { t: '"솔직히 떨리지만… 열심히 배우겠습니다."', add: { yujin: 1 }, then: [
        { s: 'yujin', e: 'smile', t: '떨리는 게 정상이에요. 안 떨린다고 하면 그게 더 걱정이죠.' },
      ] },
      { t: '"3주면 넉넉하네요. 저 이런 거 금방 해요."', add: { yujin: -1 }, set: { cocky: true }, then: [
        { s: 'yujin', e: 'serious', t: '자신감은 좋아요. 결과로 보여 주세요.' },
        { t: '회의실 몇몇이 서로 눈짓을 주고받았다.' },
      ] },
    ] },
    { hide: 1 },
    { t: '회의가 끝나고 나오는데, 디자인팀 쪽에서 누군가 손을 번쩍 들었다.' },
    { s: 'junho', e: 'grin', t: '마케팅팀 신입이죠? 디자인팀 이준호예요! PT 시안은 우리 팀이랑 같이 해요.' },
    { cg: 'junho_desk' },
    { s: 'junho', e: 'smile', t: '아, 얘는 꽥이. 막힐 때 말 거는 고무 오리예요. 같이 인사해요.' },
    { t: '책상 위 노란 고무 오리가 이쪽을 보고 있었다. …인사를 해야 하나?' },
    { choice: [
      { t: '"안녕, 꽥이. 잘 부탁해."', add: { junho: 2 }, then: [
        { sfx: '꽥!' },
        { s: 'junho', e: 'grin', t: '와, 진짜 해 줬어! 꽥이가 좋아해요. 우리 잘 맞겠다.' },
      ] },
      { t: '"…오리 말고 준호 씨한테 인사할게요."', add: { junho: 1 }, then: [
        { s: 'junho', e: 'smile', t: '하하, 그것도 좋아요. 잘 부탁해요, {name} 씨!' },
      ] },
      { t: '"…회사에서 오리랑 대화하세요?" 피식 웃는다', add: { junho: -2 }, set: { duckHidden: true }, then: [
        { s: 'junho', e: 'sad', t: '아, 하하… 좀 이상하죠. 신경 쓰지 마요.' },
        { t: '준호 씨가 오리를 서랍 속에 넣었다.' },
      ] },
    ] },
    { go: 'ch1' },
  ],

  /* ======================= 1화 ======================= */
  ch1: [
    { title: '1화', sub: '점심은 누구와?' },
    { bg: 'office' }, { hide: 1 },
    { t: '12시. 오전 내내 회사 위키를 읽었더니 머리가 핑 돈다.' },
    { t: '하린 선배는 사원증을 흔들며 손짓하고, 서아 선배는 노트를 펼친 채 자리에서 일어날 줄을 모른다.' },
    { t: '엘리베이터의 그 사람, 기획팀 강도윤 팀장은… 화분을 들고 비상계단 쪽으로 사라졌다.' },
    { t: '점심을 어떻게 할까?' },
    { choice: [
      { t: '하린 선배랑 구내식당에 간다', go: 'ch1_harin' },
      { t: '서아 선배에게 같이 먹자고 한다', go: 'ch1_seoa' },
      { t: '비상계단을 따라 올라가 본다', go: 'ch1_doyun' },
      { t: '혼자 김밥을 먹으며 지난 PT 자료를 본다', add: { work: 1 }, go: 'ch1_alone' },
      { t: '점심 대신 책상에 엎드려 잔다', add: { bad: 1 }, go: 'ch1_sleep' },
    ] },
  ],
  ch1_harin: [
    { bg: 'cafeteria' },
    { if: v => v.harinCold, then: [
      { s: 'harin', e: 'normal', t: '…아, 신입 씨도 가요? 그래요, 같이 가요.' },
      { t: '아침 일 때문인지 하린 선배의 말투가 조금 딱딱했다.' },
    ] },
    { s: 'harin', e: 'grin', t: '오늘 메뉴 돈가스래! 신입 첫날부터 운이 좋네.' },
    { t: '식판 가득 밥을 담은 하린 선배가 신나게 회사 소문을 풀어놓는다.' },
    { s: 'harin', e: 'normal', t: '근데 있잖아. 다들 나보고 웃기대. 회의 분위기 메이커래.' },
    { s: 'harin', e: 'sad', t: '…가끔은 웃긴 거 말고, 그냥 일 잘한다는 말 듣고 싶더라.' },
    { choice: [
      { t: '"오전에 보니까 선배 기획서 진짜 깔끔하던데요."', add: { harin: 2 }, set: { harinPraise: true }, then: [
        { s: 'harin', e: 'blush', t: '…뭐야, 갑자기 그렇게 진지하게. 돈가스 한 조각 줄게.' },
      ] },
      { t: '"분위기 메이커도 엄청난 재능이에요!"', add: { harin: 1 }, then: [
        { s: 'harin', e: 'smile', t: '헤헤, 그치? 그럼 재능 기부 계속할게.' },
      ] },
      { t: '"웃긴 게 선배 매력이죠. 일은 서아 선배가 잘하잖아요."', add: { harin: -2, seoa: -1 }, then: [
        { s: 'harin', e: 'sad', t: '…그치. 하하. 돈가스나 먹자.' },
        { t: '그 뒤로 하린 선배는 회사 소문 이야기만 했다.' },
      ] },
    ] },
    { go: 'ch2' },
  ],
  ch1_seoa: [
    { bg: 'meeting' },
    { me: '선배, 점심 안 드세요?' },
    { s: 'seoa', e: 'surprised', t: '앗, 벌써 12시예요? 부장님이 오후까지 달라던 자료가 있어서…' },
    { t: '노트에는 오늘 할 일이 열 개도 넘게 적혀 있었다. 그중 절반은 다른 사람 이름이었다.' },
    { s: 'seoa', e: 'smile', t: '괜찮아요! 원래 다들 바빠서, 제가 하는 게 빨라요.' },
    { choice: [
      { t: '"그럼 같이 해요. 그리고 같이 먹어요."', add: { seoa: 2 }, set: { seoaHelped: true }, then: [
        { s: 'seoa', e: 'blush', t: '…신입한테 일 시키는 사수라니. 그래도, 고마워요.' },
        { t: '회의실에서 샌드위치를 나눠 먹으며 표를 반씩 채웠다. 생각보다 즐거웠다.' },
      ] },
      { t: '"선배 몫까지 샌드위치 사 올게요."', add: { seoa: 1 }, then: [
        { s: 'seoa', e: 'smile', t: '천사가 입사했네. 계란 샌드위치로 부탁해요!' },
      ] },
      { t: '"선배가 거절을 못 해서 그래요. 그건 선배 문제죠."', add: { seoa: -2 }, then: [
        { s: 'seoa', e: 'sad', t: '…맞아요. 내 문제죠.' },
        { s: 'seoa', e: 'normal', t: '먼저 가서 먹어요. 저는 이거 마저 할게요.' },
        { t: '회의실 문이 조용히 닫혔다.' },
      ] },
    ] },
    { go: 'ch2' },
  ],
  ch1_doyun: [
    { bg: 'rooftop_day' }, { set: { metRoof: true } },
    { t: '계단 끝 철문을 열자, 바람과 함께 햇빛이 쏟아졌다.' },
    { t: '옥상 구석에 화분 열댓 개가 나란히 놓여 있다. 강 팀장이 수트 소매를 걷고 물을 주고 있었다.' },
    { s: 'doyun', e: 'surprised', t: '…여긴 어떻게 알고.' },
    { me: '화분 들고 가시는 걸 봤어요. 와, 여기 정원이에요?' },
    { s: 'doyun', e: 'normal', t: '정원은 무슨. 버려진 화분 주워다 놓은 거예요.' },
    { s: 'doyun', e: 'normal', t: '점심은 늘 여기서 먹어요. 사람 없고, 조용하고.' },
    { choice: [
      { t: '"저도 가끔 와도 돼요? 물 주는 거 도울게요."', add: { doyun: 2 }, then: [
        { s: 'doyun', e: 'smile', t: '…마음대로 해요. 시끄러우면 쫓아낼 거예요.' },
        { t: '말과 달리, 그는 벤치 한쪽을 비켜 주었다.' },
      ] },
      { t: '"조용한 데 방해해서 죄송해요. 내려갈게요."', add: { doyun: 1 }, then: [
        { s: 'doyun', e: 'normal', t: '…샌드위치 반 남았는데. 먹고 가요.' },
      ] },
      { t: '"사진 찍어서 사내 게시판에 올려도 돼요? \'옥상의 비밀 정원\'!"', add: { doyun: -2 }, then: [
        { s: 'doyun', e: 'serious', t: '…안 돼요. 여긴 조용해야 하는 곳이에요.' },
        { t: '그는 화분 쪽으로 몸을 돌려 버렸다. 바람 소리만 남았다.' },
      ] },
    ] },
    { go: 'ch2' },
  ],
  ch1_sleep: [
    { t: '눈을 떠 보니 1시 12분. 오후 회의는 1시였다.' },
    { bg: 'meeting' },
    { s: 'yujin', e: 'serious', t: '{name} 씨, 회의 시작한 지 12분 지났어요.' },
    { t: '얼굴에 책상 자국을 단 채 자리에 앉았다. 서아 선배가 조용히 회의 자료를 밀어 주었다.' },
    { go: 'ch2' },
  ],
  ch1_alone: [
    { cg: 'lunch_alone' },
    { t: '편의점 김밥을 한 손에 들고 작년 PT 자료를 열었다.' },
    { t: '꼼꼼히 읽다 보니 회사가 일하는 방식이 조금씩 보이기 시작한다.' },
    { t: '…점심시간 내내 한마디도 안 했다는 게 조금 쓸쓸할 뿐.' },
    { go: 'ch2' },
  ],

  /* ======================= 2화 ======================= */
  ch2: [
    { title: '2화', sub: '빨간 펜의 수요일' },
    { bg: 'meeting' },
    { t: '수요일 오후. 첫 과제였던 캠페인 시안을 차 매니저님께 드렸다.' },
    { cg: 'yujin_meeting' },
    { s: 'yujin', e: 'serious', t: '{name} 씨. 솔직하게 말할게요.' },
    { if: v => v.cocky, then: [
      { s: 'yujin', e: 'serious', t: '"금방 한다"고 했던 것치고는, 많이 아쉬워요.' },
    ] },
    { s: 'yujin', e: 'serious', t: '예쁘긴 한데, 왜 이 색인지 설명이 없어요. 봄빛음료가 왜 초록이어야 하죠?' },
    { t: '회의실이 조용해졌다. 다들 노트북을 보는 척 귀를 기울이고 있다.' },
    { choice: [
      { t: '"새싹의 첫 색이라서요. 경쟁사가 다 노란색이라 차별화도 돼요."', add: { work: 1, yujin: 1 }, then: [
        { s: 'yujin', e: 'surprised', t: '…경쟁사까지 봤어요?' },
        { s: 'yujin', e: 'smile', t: '좋아요. 그 설명을 시안 옆에 꼭 써 넣어요. 그게 전략이에요.' },
      ] },
      { t: '"…다시 해 오겠습니다."', then: [
        { s: 'yujin', e: 'normal', t: '다시 하는 것도 좋지만, 다음엔 이유부터 가져와요.' },
        { t: '자리로 돌아오는 발걸음이 무겁다.' },
      ] },
      { t: '"매니저님은 어떤 색이 좋으세요?"', add: { yujin: 1 }, then: [
        { s: 'yujin', e: 'serious', t: '그걸 정하는 게 {name} 씨 일이에요.' },
        { s: 'yujin', e: 'normal', t: '…그래도 묻는 건 좋아요. 막히면 언제든 물어봐요.' },
      ] },
      { t: '"그냥 제 감이에요. 예쁘면 되는 거 아닌가요?"', add: { yujin: -2, work: -1, bad: 1 }, then: [
        { s: 'yujin', e: 'serious', t: '…그 말, 대표님 앞에서도 할 수 있어요?' },
        { t: '회의실 공기가 얼어붙었다. 박 부장이 헛기침을 했다.' },
      ] },
    ] },
    { hide: 1 },
    { bg: 'office' },
    { t: '그날 오후, 탕비실. 한숨을 쉬고 있는데 발소리가 들렸다.' },
    { choice: [
      { t: '디자인팀 준호 씨가 초코바를 흔들며 들어온다', add: { junho: 2 }, then: [
        { s: 'junho', e: 'smile', t: '아까 회의 들었어요. 차 매니저님, 저한테도 첫 주에 그랬어요.' },
        { s: 'junho', e: 'grin', t: '그럴 땐 당 충전. 하나는 {name} 씨 거, 나머지 하나도 {name} 씨 거.' },
      ] },
      { t: '서아 선배가 노트를 들고 따라 들어온다', add: { seoa: 1 }, then: [
        { s: 'seoa', e: 'smile', t: '괜찮아요? 저도 첫 PT 때 똑같은 말 들었어요.' },
        { s: 'seoa', e: 'normal', t: '이유 적는 칸, 제 노트 양식 빌려줄게요. 다음엔 무조건 통과예요.' },
      ] },
      { t: '하린 선배에게 강 팀장 이야기를 묻는다', add: { doyun: 1 }, then: [
        { s: 'harin', e: 'normal', t: '강도윤 팀장? 2년 전 큰 PT 때 무슨 일이 있었대. 그 뒤로 발표는 절대 안 한다더라.' },
        { t: '무슨 일이었을까. 괜히 궁금해진다.' },
      ] },
      { t: '"괜찮아. 오히려 배운 게 많아." 혼자 다짐한다', add: { work: 1 }, then: [
        { t: '이유를 적는 칸을 노트에 그려 넣었다. 다음엔 이것부터 채울 거다.' },
      ] },
      { t: '"차 매니저님 원래 저렇게 까칠해요?" 크게 투덜댄다', add: { yujin: -2, bad: 1 }, set: { gossip: true }, then: [
        { t: '그때 등 뒤에서 컵 내려놓는 소리가 났다.' },
        { s: 'yujin', e: 'serious', t: '탕비실은 방음이 안 돼요, {name} 씨.' },
        { t: '매니저님은 그대로 나갔다. 손에 든 머그컵이 유난히 차가워 보였다.' },
      ] },
    ] },
    { go: 'ch3' },
  ],

  /* ======================= 3화 ======================= */
  ch3: [
    { title: '3화', sub: '밤 10시의 9층' },
    { bg: 'office_night' }, { hide: 1 },
    { t: '목요일 밤 10시. 수정 시안을 끝내고 보니 사무실 불이 거의 꺼져 있었다.' },
    { t: '매니저실 유리문 너머엔 차유진. 디자인팀 쪽엔 머리를 쥐어뜯는 준호 씨.' },
    { t: '탕비실 불도 켜져 있다. 그리고 옥상으로 가는 문이 살짝 열려 있다.' },
    { cg: 'night_office' },
    { t: '커피를 한 잔 더 뽑았다. 이걸 누구에게 가져다줄까?' },
    { choice: [
      { t: '차 매니저님께 가져다드린다', go: 'ch3_yujin' },
      { t: '준호 씨에게 가져다준다', go: 'ch3_junho' },
      { t: '탕비실을 들여다본다', go: 'ch3_harin' },
      { t: '옥상으로 올라가 본다', go: 'ch3_doyun' },
      { t: '내가 마시고 시안을 한 번 더 다듬는다', add: { work: 1 }, go: 'ch3_alone' },
      { t: '수정본은 내일 올리기로 하고 몰래 먼저 퇴근한다', add: { work: -1, bad: 1 }, go: 'ch3_skip' },
    ] },
  ],
  ch3_yujin: [
    { t: '노크하려는데, 매니저님이 황급히 무언가를 덮었다.' },
    { s: 'yujin', e: 'surprised', t: '{name} 씨? 아직 안 갔어요?' },
    { cg: 'yujin_sketch' },
    { me: '커피 드시라고요. …방금 덮으신 거, 스케치북이에요?' },
    { sfx: '화끈' },
    { s: 'yujin', e: 'blush', t: '…들켰으니 어쩔 수 없네요.' },
    { s: 'yujin', e: 'normal', t: '퇴근하고 웹툰을 그려요. 아무도 몰라요. 회사에선 빈틈없는 매니저여야 하니까.' },
    { t: '스케치북 속엔 야근하는 고양이 직장인이 있었다. 와인색 넥타이를 맨 고양이였다.' },
    { choice: [
      { t: '"이거 연재하세요. 저 1화부터 결제할게요."', add: { yujin: 2 }, set: { fan: true }, then: [
        { s: 'yujin', e: 'smile', t: '…결제는 무슨. 그래도 고마워요. 진짜로.' },
      ] },
      { t: '"빈틈없는 매니저님보다 이런 매니저님이 더 좋아요."', add: { yujin: 2 }, then: [
        { s: 'yujin', e: 'blush', t: '…그런 말 함부로 하는 거 아니에요. 커피는 잘 마실게요.' },
      ] },
      { t: '"이거 회사 사람들한테 보여 줘도 돼요? 완전 반전인데!"', add: { yujin: -3 }, then: [
        { s: 'yujin', e: 'serious', t: '…아니요. 절대.' },
        { t: '매니저님이 스케치북을 서랍에 넣고 잠갔다. 커피는 손도 대지 않았다.' },
      ] },
    ] },
    { go: 'ch4' },
  ],
  ch3_junho: [
    { if: v => v.duckHidden, then: [
      { t: '준호 씨 책상 위는 비어 있었다. 꽥이는 그날 이후로 서랍 속이다.' },
    ] },
    { s: 'junho', e: 'angry', t: '아… 왜 안 열리지. 내일 아침 리뷰인데 시안 파일이 깨졌어…' },
    { me: '커피 배달 왔습니다.' },
    { s: 'junho', e: 'surprised', t: '헉, 천사인가? 고마워요!' },
    { choice: [
      { t: '"옆에 있을게요. 꽥이한테 하듯 저한테 설명해 봐요."', add: { junho: 2 }, set: { duck: true }, then: [
        { t: '준호 씨가 레이어를 하나씩 짚으며 설명을 시작했다. 나는 진지하게 고개를 끄덕였다.' },
        { s: 'junho', e: 'surprised', t: '…어? 잠깐. 자동 저장 폴더가 따로 있었지!' },
        { sfx: '짠!' },
        { cg: 'junho_night' },
        { s: 'junho', e: 'grin', t: '찾았다! {name} 씨 진짜 행운의 오리다!' },
      ] },
      { t: '"강 팀장님한테 물어볼까요? 아직 계시던데."', add: { junho: 1, doyun: 1 }, then: [
        { t: '옥상에서 내려온 강 팀장이 화면을 3초 보더니 한 곳을 가리켰다.' },
        { s: 'doyun', e: 'normal', t: '여기. 자동 저장 폴더.' },
        { s: 'junho', e: 'surprised', t: '…팀장님 대체 정체가 뭐예요?' },
      ] },
      { t: '"내일 아침에 다시 하면 되죠. 저 먼저 갈게요."', add: { junho: -2 }, then: [
        { s: 'junho', e: 'sad', t: '…아, 응. 조심히 가요.' },
        { t: '돌아보니 준호 씨는 깨진 파일 앞에 혼자 앉아 있었다.' },
      ], go: 'ch4' },
    ] },
    { t: '컵라면을 나눠 먹으며, 준호 씨가 작게 말했다.' },
    { s: 'junho', e: 'blush', t: '있잖아요. 나 언젠가 내 스튜디오 차릴 거예요. 아무한테도 말 안 한 건데.' },
    { go: 'ch4' },
  ],
  ch3_harin: [
    { t: '탕비실 구석. 하린 선배가 휴대폰에 코를 박고 무언가를 편집하고 있었다.' },
    { s: 'harin', e: 'surprised', t: '헉! …{name}{name|이었어|였어}? 깜짝이야.' },
    { cg: 'harin_secret' },
    { t: '화면엔 "9층 오피스툰"이라는 짧은 영상이 떠 있었다. 회사 사람들이 다 아는 그 인기 계정이다.' },
    { s: 'harin', e: 'blush', t: '…이거, 내 거야. 아무도 몰라. 알면 다들 나를 더 웃긴 사람으로만 볼 테니까.' },
    { choice: [
      { t: '"이거 기획 진짜 잘했다. 선배 아이디어예요?"', add: { harin: 2 }, set: { harinSecret: true }, then: [
        { s: 'harin', e: 'surprised', t: '…웃기다는 말 대신 잘했다는 말은 처음 들어 봐.' },
        { s: 'harin', e: 'smile', t: '비밀 지켜 줘. 대신 커피는 평생 내가 살게.' },
      ] },
      { t: '"와, 팬이에요! 다음 편은 언제 올라와요?"', add: { harin: 1 }, then: [
        { s: 'harin', e: 'grin', t: '쉿! 다음 편 주인공은 너로 해 줄게. 비밀이다?' },
      ] },
      { t: '"대박. 이거 단톡방에 말해도 돼요?"', add: { harin: -3 }, then: [
        { s: 'harin', e: 'sad', t: '…부탁이야. 그러지 마.' },
        { t: '선배는 휴대폰을 뒤집어 놓고 탕비실을 나갔다.' },
      ] },
    ] },
    { go: 'ch4' },
  ],
  ch3_doyun: [
    { bg: 'rooftop_night' },
    { t: '옥상에선 강 팀장이 난간에 기대어 야경을 보고 있었다.' },
    { if: v => v.metRoof, then: [
      { s: 'doyun', e: 'normal', t: '…또 왔네요.' },
    ], else: [
      { s: 'doyun', e: 'surprised', t: '…신입? 여긴 어떻게 알고.' },
    ] },
    { me: '커피 드실래요? 남는 거라서요.' },
    { cg: 'doyun_coffee' },
    { s: 'doyun', e: 'smile', t: '남는 거라면서 따뜻하네.' },
    { t: '둘이 나란히 서서 도시 불빛을 내려다봤다. 바람이 차다.' },
    { s: 'doyun', e: 'normal', t: '저 불 켜진 창문들, 다 야근이에요. 다들 뭘 위해서 저렇게 사는지.' },
    { choice: [
      { t: '"좋아하는 걸 지키려고요. 팀장님 화분처럼요."', add: { doyun: 2 }, then: [
        { s: 'doyun', e: 'surprised', t: '…' },
        { s: 'doyun', e: 'smile', t: '신입치고 말 잘하네. 봄이가 좋아하겠어요.' },
      ] },
      { t: '"팀장님은요? 뭘 위해 야근해요?"', add: { doyun: 1 }, then: [
        { s: 'doyun', e: 'serious', t: '…예전엔 이기고 싶어서. 지금은 그냥, 집에 가기 싫어서.' },
        { t: '농담처럼 들리지 않는 목소리였다.' },
      ] },
      { t: '"버려진 화분이면 그냥 버리지, 왜 주워 와요?"', add: { doyun: -2 }, then: [
        { s: 'doyun', e: 'serious', t: '…그러게요. 왜 그랬을까.' },
        { t: '그는 커피를 받지 않았다. 나는 혼자 계단을 내려왔다.' },
      ], go: 'ch4' },
    ] },
    { go: 'ch4' },
  ],
  ch3_skip: [
    { bg: 'office' },
    { t: '다음 날 아침 9시. 메신저 알림이 쌓여 있었다.' },
    { cg: 'morning_after' },
    { s: 'yujin', e: 'serious', t: '어젯밤 올리기로 한 수정본, 어디 있어요? 아침 리뷰가 미뤄졌어요.' },
    { s: 'junho', e: 'sad', t: '…저 그거 기다리느라 새벽 2시까지 있었어요.' },
    { t: '아무도 화를 내진 않았다. 그게 더 무서웠다.' },
    { go: 'ch4' },
  ],
  ch3_alone: [
    { cg: 'midnight_desk' },
    { t: '커피를 마시며 시안을 다시 들여다봤다. 색마다 이유를 하나씩 적어 넣는다.' },
    { t: '자정 무렵 완성된 시안은 처음보다 훨씬 단단해 보였다.' },
    { go: 'ch4' },
  ],

  /* ======================= 4화 ======================= */
  ch4: [
    { title: '4화', sub: '금요일, 신입 환영 회식' },
    { bg: 'pub' }, { hide: 1 },
    { cg: 'dinner' },
    { s: '박 부장', t: '자, 신입 환영 회식! 막내가 건배사 한번 해 봐야지?' },
    { t: '모든 시선이 나에게 쏠렸다.' },
    { choice: [
      { t: '"봄빛음료 PT를 위하여! 우리는! 이긴다!"', add: { work: 1, yujin: 1 }, then: [
        { sfx: '와아—!' },
        { t: '우렁찬 함성. 부장님이 흡족하게 웃었다.' },
        { s: 'yujin', e: 'smile', t: '…패기 좋네요.' },
      ] },
      { t: '"오래오래 같이 먹자는 뜻으로… 오래오래!"', add: { junho: 1, harin: 1 }, then: [
        { s: 'harin', e: 'grin', t: '오래오래!!' },
        { t: '하린 선배와 준호 씨의 목소리가 제일 컸다.' },
      ] },
      { t: '"건배사는… 제 사수님께 양보하겠습니다!"', add: { seoa: 1 }, then: [
        { s: 'seoa', e: 'surprised', t: '저, 저요?' },
        { s: 'seoa', e: 'smile', t: '그럼… 다치지 말고, 아프지 말고, 다음 주도 잘 버텨요!' },
        { t: '의외로 다정한 건배사에 다들 웃었다.' },
      ] },
      { t: '"신입한테 건배사 시키는 거, 요즘 그거 갑질이에요."', add: { seoa: -1, yujin: -1, bad: 1 }, then: [
        { t: '순간 테이블이 조용해졌다. 박 부장의 얼굴이 붉어졌다.' },
        { s: 'seoa', e: 'surprised', t: '아, 하하! 그럼 건배는 제가 할게요! 위하여!' },
        { t: '서아 선배가 급히 수습했지만, 그날 술자리는 일찍 끝났다.' },
      ] },
    ] },
    { hide: 1 },
    { bg: 'street_night' }, { outfit: { all: 'coat' } },
    { t: '1차가 끝난 가게 앞. 다들 2차 이야기로 시끌시끌하다.' },
    { t: '준호 씨와 하린 선배는 노래방으로 향하고, 차 매니저님은 택시를 잡는다.' },
    { t: '강 팀장은 말없이 편의점 쪽으로 걸어가고, 서아 선배는 혼자 지하철역 쪽으로 걷는다.' },
    { choice: [
      { t: '노래방에 따라간다', go: 'ch4_karaoke' },
      { t: '차 매니저님과 같은 방향 택시를 탄다', go: 'ch4_yujin' },
      { t: '강 팀장을 따라 편의점에 간다', go: 'ch4_doyun' },
      { t: '서아 선배와 역까지 같이 걷는다', go: 'ch4_seoa' },
      { t: '1차만 하고 조용히 집에 간다', go: 'ch4_home' },
    ] },
  ],
  ch4_karaoke: [
    { bg: 'karaoke' }, { outfit: { junho: 'work', harin: 'work' } },
    { cg: 'karaoke' },
    { t: '노래방. 준호 씨는 탬버린을, 하린 선배는 마이크 두 개를 동시에 쥐고 있었다.' },
    { s: 'harin', e: 'grin', t: '자, 신입! 듀엣 상대 골라. 거절은 없다?' },
    { choice: [
      { t: '준호 씨와 듀엣을 부른다', add: { junho: 2 }, then: [
        { t: '엉망진창인 화음에 둘 다 배를 잡고 웃었다.' },
        { s: 'junho', e: 'blush', t: '…와, {name} 씨랑 있으면 진짜 재밌다.' },
      ] },
      { t: '하린 선배와 듀엣을 부른다', add: { harin: 2 }, then: [
        { t: '하린 선배는 의외로 진지하게 화음을 넣었다. 노래가 끝나자 조용해졌다.' },
        { s: 'harin', e: 'blush', t: '…뭐야, 왜 다들 박수 안 쳐. 웃기려고 한 거 아닌데.' },
      ] },
      { t: '듀엣 대신 휴대폰만 보다가 말없이 먼저 나간다', add: { junho: -1, harin: -1 }, then: [
        { t: '문을 닫고 나오는데, 안에서 노래가 끊기는 소리가 들렸다.' },
      ] },
    ] },
    { go: 'ch5' },
  ],
  ch4_yujin: [
    { if: v => v.gossip, then: [
      { t: '탕비실 일이 떠올라 등줄기가 서늘했다. 매니저님은 창밖만 보고 있었다.' },
    ] },
    { cg: 'yujin_taxi' },
    { t: '택시 뒷좌석. 창밖으로 불빛이 흘러간다. 한동안 아무 말이 없었다.' },
    { s: 'yujin', e: 'normal', t: '{name} 씨. 이번 주 고생 많았어요.' },
    { s: 'yujin', e: 'sad', t: '수요일에 내가 너무 몰아붙였죠. 계속 마음에 걸렸어요.' },
    { choice: [
      { t: '"덕분에 배웠어요. 매니저님 피드백, 좋아요."', add: { yujin: 2 }, then: [
        { s: 'yujin', e: 'smile', t: '…그래요? 다행이다.' },
        { t: '매니저님이 창문에 머리를 기대며 작게 웃었다.' },
      ] },
      { t: '"조금 무서웠지만 괜찮았어요."', add: { yujin: 1 }, then: [
        { s: 'yujin', e: 'smile', t: '솔직해서 좋네요. 다음엔 조금 덜 무섭게 해 볼게요.' },
      ] },
      { t: '"솔직히 좀 심하셨어요. 다들 매니저님 무서워해요."', add: { yujin: -2 }, then: [
        { s: 'yujin', e: 'sad', t: '…알아요.' },
        { t: '그 뒤로 택시 안은 끝까지 조용했다.' },
      ] },
    ] },
    { go: 'ch5' },
  ],
  ch4_doyun: [
    { cg: 'doyun_milk' },
    { t: '편의점 앞 파라솔 의자. 강 팀장이 바나나우유 두 개를 내밀었다.' },
    { s: 'doyun', e: 'normal', t: '시끄러운 데 싫어서요. …같이 마실래요?' },
    { s: 'doyun', e: 'normal', t: '이번 PT, 막히면 말해요. 기획 쪽은 도와줄 수 있으니까.' },
    { me: '팀장님은 발표는 절대 안 하신다면서요.' },
    { s: 'doyun', e: 'serious', t: '…누가 그래요.' },
    { choice: [
      { t: '"말하기 싫으면 안 하셔도 돼요. 우유 잘 마실게요."', add: { doyun: 2 }, then: [
        { s: 'doyun', e: 'surprised', t: '…' },
        { s: 'doyun', e: 'smile', t: '이상한 신입이네. 고마워요.' },
      ] },
      { t: '"왜 발표를 안 하세요?"', add: { doyun: 1 }, then: [
        { s: 'doyun', e: 'serious', t: '큰 PT를 망쳤어요. 내가 이끌던 팀이었는데.' },
        { s: 'doyun', e: 'normal', t: '…다음에 얘기해요. 오늘은 여기까지.' },
      ] },
      { t: '"팀장님 그 PT 망쳤다는 거, 소문 다 났던데요."', add: { doyun: -3 }, then: [
        { s: 'doyun', e: 'serious', t: '…알아요. 그러니까 굳이 말 안 해도 돼요.' },
        { t: '그는 남은 우유를 두고 먼저 일어났다.' },
      ] },
    ] },
    { go: 'ch5' },
  ],
  ch4_seoa: [
    { t: '역으로 가는 길. 서아 선배는 걸으면서도 휴대폰으로 메일을 확인하고 있었다.' },
    { s: 'seoa', e: 'smile', t: '아, 부장님이 주말까지 하나만 더 해 달래요. 괜찮아요, 금방 해요!' },
    { t: '선배의 웃음이 오늘따라 조금 지쳐 보였다.' },
    { choice: [
      { t: '"선배, 오늘은 휴대폰 넣어요. 주말엔 쉬어야죠."', add: { seoa: 2 }, then: [
        { s: 'seoa', e: 'surprised', t: '…' },
        { s: 'seoa', e: 'blush', t: '사수한테 잔소리하는 부사수라니. …근데 듣기 좋네요.' },
        { cg: 'seoa_phone' },
        { t: '선배는 휴대폰을 가방 깊숙이 넣었다.' },
      ] },
      { t: '"제가 반 나눠서 할게요."', add: { seoa: 1, work: 1 }, then: [
        { s: 'seoa', e: 'smile', t: '…고마워요. 그럼 표 정리만 부탁할게요.' },
      ] },
      { t: '"선배는 왜 맨날 다 받아 줘요? 보는 사람이 답답해요."', add: { seoa: -2 }, then: [
        { s: 'seoa', e: 'sad', t: '…그러게요. 나도 내가 답답해요.' },
        { t: '선배는 개찰구 앞에서 짧게 인사하고 반대편 승강장으로 내려갔다.' },
      ] },
    ] },
    { go: 'ch5' },
  ],
  ch4_home: [
    { bg: 'room' },
    { t: '조용히 인사하고 지하철에 올랐다.' },
    { cg: 'my_room' },
    { t: '씻고 누우니, 그래도 생각보다 괜찮은 한 주였다는 생각이 든다.' },
    { t: '잠들기 전, 다음 주에 할 일을 메모장에 차근차근 정리했다.' },
    { add: { work: 1 } },
    { go: 'ch5' },
  ],

  /* ======================= 5화 ======================= */
  ch5: [
    { title: '5화', sub: '토요일 오후 2시' },
    { bg: 'room' }, { hide: 1 }, { outfit: { all: 'casual' } },
    { cg: 'messages' },
    { t: '토요일. 늦잠을 자고 일어나니 메시지가 잔뜩 와 있었다.' },
    { msg: 'junho', t: '내일 한강에서 자전거 탈래요? 날씨 미쳤대요!' },
    { msg: 'yujin', t: '{name} 씨, 주말에 미안해요. 월요일 회의 자료 하나만 확인 가능할까요?' },
    { msg: 'harin', t: '신입아, 내일 영화 볼 사람 구함. 팝콘은 내가 쏨' },
    { msg: 'doyun', t: '(사진) 봄이 새잎 났어요.' },
    { t: '마지막 메시지엔 손톱만 한 새잎 사진이 붙어 있었다.' },
    { t: '누구에게 먼저 답장할까?' },
    { choice: [
      { t: '준호: "좋아요! 내일 2시 어때요?"', go: 'ch5_junho' },
      { t: '차 매니저님: "네, 지금 바로 볼게요!"', go: 'ch5_yujin' },
      { t: '하린: "팝콘 큰 걸로 부탁해요!"', go: 'ch5_harin' },
      { t: '강 팀장님: "축하해요 봄이! 보러 가도 돼요?"', go: 'ch5_doyun' },
      { t: '모두 짧게 답하고 주말엔 공부를 한다', add: { work: 1 }, go: 'ch5_study' },
      { t: '아무에게도 답하지 않고 주말 내내 잠수 탄다', add: { junho: -1, yujin: -1, harin: -1, doyun: -1 }, go: 'ch5_ghost' },
    ] },
  ],
  ch5_junho: [
    { bg: 'hanriver' },
    { cg: 'junho_bike' },
    { t: '일요일 한강. 준호 씨는 자전거 바구니에 김밥과 꽥이까지 챙겨 왔다.' },
    { s: 'junho', e: 'grin', t: '평일엔 회사, 주말엔 한강. 이게 직장인의 낭만 아니겠어요?' },
    { s: 'junho', e: 'blush', t: '근데 있잖아요… 이런 거 같이 할 사람, 사실 {name} 씨밖에 없어요.' },
    { choice: [
      { t: '"저도요. 다음 주말에도 와요."', add: { junho: 2 }, then: [
        { sfx: '두근' },
        { s: 'junho', e: 'grin', t: '…약속한 거다? 새끼손가락!' },
      ] },
      { t: '"다음엔 팀 사람들도 다 불러 볼까요?"', add: { junho: 1 }, then: [
        { s: 'junho', e: 'normal', t: '아, 응! 그것도 좋죠. …좋죠.' },
        { t: '준호 씨의 대답이 조금 늦게 들린 것 같았다.' },
      ] },
      { t: '"꽥이까지 데려왔어요? 좀 유치하다…"', add: { junho: -2 }, then: [
        { s: 'junho', e: 'sad', t: '…아, 그쵸. 가방에 넣을게요.' },
        { t: '그 뒤로 준호 씨는 자전거 페달만 밟았다.' },
      ] },
    ] },
    { go: 'ch6' },
  ],
  ch5_yujin: [
    { cg: 'yujin_home' },
    { t: '자료를 확인해 보니 숫자 하나가 잘못 들어가 있었다. 바로 고쳐서 보냈다.' },
    { msg: 'yujin', t: '…찾았네요. 내가 놓친 거였어요. 고마워요.' },
    { msg: 'yujin', t: '주말에 일 시켜서 미안하니까, 다음 주에 커피 살게요.' },
    { choice: [
      { t: '"그럼 매니저님 단골 카페로 데려가 주세요."', add: { yujin: 2 }, then: [
        { msg: 'yujin', t: '…좋아요. 조용한 데 하나 알아요. 다른 사람한텐 비밀.' },
      ] },
      { t: '"아니에요, 할 일 한 건데요!"', add: { yujin: 1, work: 1 }, then: [
        { msg: 'yujin', t: '그런 태도 좋아요. 그래도 커피는 살 거예요.' },
      ] },
      { t: '"주말엔 업무 연락 안 받아요." 짧게 답한다', add: { yujin: -1 }, then: [
        { msg: 'yujin', t: '…맞아요. 미안해요. 월요일에 볼게요.' },
        { t: '틀린 말은 아닌데, 이상하게 마음이 불편했다.' },
      ] },
    ] },
    { go: 'ch6' },
  ],
  ch5_harin: [
    { bg: 'street_night' },
    { t: '일요일 저녁 영화관. 하린 선배는 팝콘을 두 통이나 들고 나타났다.' },
    { cg: 'harin_cinema' },
    { t: '로맨스 영화였다. 마지막 장면에서 옆자리를 보니, 선배가 안경을 벗고 눈가를 닦고 있었다.' },
    { s: 'harin', e: 'teary', t: '…보지 마. 이런 거 보고 우는 거, 나답지 않잖아.' },
    { choice: [
      { t: '"선배다운 게 뭔데요. 지금 모습도 선배예요."', add: { harin: 2 }, then: [
        { s: 'harin', e: 'surprised', t: '…' },
        { s: 'harin', e: 'smile', t: '너 가끔 진짜 반칙이다. 팝콘 다 먹어.' },
      ] },
      { t: '(모르는 척 팝콘을 건넨다)', add: { harin: 1 }, then: [
        { s: 'harin', e: 'smile', t: '…고마워. 이건 우리 둘만 아는 거다?' },
      ] },
      { t: '"선배 울어요? 와, 사진 찍어도 돼요?"', add: { harin: -2 }, then: [
        { s: 'harin', e: 'serious', t: '…하지 마. 진짜로.' },
        { t: '선배는 엔딩 크레딧이 끝나기도 전에 먼저 일어났다.' },
      ] },
    ] },
    { go: 'ch6' },
  ],
  ch5_doyun: [
    { bg: 'rooftop_day' },
    { t: '일요일 오후. 정말로 회사 옥상에 와 버렸다. 강 팀장은 먼저 와 있었다.' },
    { s: 'doyun', e: 'surprised', t: '…진짜 왔네.' },
    { cg: 'doyun_sprout' },
    { t: '봄이의 새잎은 사진보다 더 작고, 더 연한 초록이었다.' },
    { s: 'doyun', e: 'normal', t: '이거, 2년 전에 다 죽어 가던 걸 주워 온 거예요. 나랑 비슷해서.' },
    { choice: [
      { t: '"이제 새잎 났잖아요. 팀장님도 그럴 거예요."', add: { doyun: 2 }, then: [
        { s: 'doyun', e: 'surprised', t: '…' },
        { s: 'doyun', e: 'smile', t: '그 말, 꽤 오래 기억할 것 같네요.' },
      ] },
      { t: '"물은 제가 줄게요. 팀장님은 쉬세요."', add: { doyun: 1 }, then: [
        { s: 'doyun', e: 'smile', t: '…맡길게요. 너무 많이 주면 안 돼요.' },
      ] },
      { t: '"새잎 하나 났다고 주말에 부르신 거예요?"', add: { doyun: -2 }, then: [
        { s: 'doyun', e: 'normal', t: '…부른 적은 없어요. 온다고 한 건 {name} 씨지.' },
        { t: '맞는 말이었다. 돌아오는 길이 유난히 길었다.' },
      ] },
    ] },
    { go: 'ch6' },
  ],
  ch5_ghost: [
    { t: '휴대폰을 무음으로 돌려놓고 주말 내내 누워 있었다.' },
    { bg: 'office' },
    { cg: 'junho_elevator' },
    { t: '월요일 아침. 엘리베이터에서 만난 준호 씨가 어색하게 웃었다.' },
    { s: 'junho', e: 'normal', t: '아, 주말에… 바빴나 봐요. 괜찮아요!' },
    { t: '괜찮다는 말이 별로 괜찮게 들리지 않았다.' },
    { go: 'ch6' },
  ],
  ch5_study: [
    { cg: 'study' },
    { t: '답장은 짧게. 주말 내내 브랜딩 사례집을 읽고 봄빛음료 경쟁사 패키지를 정리했다.' },
    { t: '노트 한 권이 빼곡해졌다. 월요일이 조금은 기다려진다.' },
    { go: 'ch6' },
  ],

  /* ======================= 6화 ======================= */
  ch6: [
    { title: '6화', sub: '사라진 폴더' },
    { bg: 'office_night' }, { hide: 1 }, { outfit: { all: 'work' } },
    { t: 'PT를 일주일 앞둔 목요일 밤. 공유 드라이브에서 PT 폴더가 통째로 사라졌다.' },
    { s: 'yujin', e: 'serious', t: '백업은요? …마지막 백업이 2주 전이라고요?' },
    { hide: 1 },
    { cg: 'folder_lost' },
    { t: '사무실이 술렁인다. 이대로면 PT를 포기해야 할지도 모른다.' },
    { t: '지금 내가 할 수 있는 일은…' },
    { choice: [
      { t: '차 매니저님 옆에서 흩어진 파일을 모은다', add: { yujin: 2 }, set: { last: 'yujin' }, go: 'ch6_yujin' },
      { t: '준호 씨와 시안 원본을 복구한다', add: { junho: 2 }, set: { last: 'junho' }, go: 'ch6_junho' },
      { t: '옥상의 강 팀장에게 도움을 청한다', add: { doyun: 2 }, set: { last: 'doyun' }, go: 'ch6_doyun' },
      { t: '서아 선배와 일정표를 다시 짠다', add: { seoa: 2 }, set: { last: 'seoa' }, go: 'ch6_seoa' },
      { t: '하린 선배의 영상 아이디어를 돕는다', add: { harin: 2 }, set: { last: 'harin' }, go: 'ch6_harin' },
      { t: '내 컴퓨터에 남은 작업물로 혼자 다시 짠다', add: { work: 2 }, go: 'ch6_work' },
      { t: '"제 잘못도 아닌데요." 먼저 퇴근한다', add: { bad: 2, work: -1, seoa: -1, junho: -1, yujin: -1, harin: -1, doyun: -1 }, go: 'ch6_leave' },
    ] },
  ],
  ch6_yujin: [
    { t: '메일 첨부, 메신저, 출력물… 흩어진 조각을 매니저님과 둘이서 모았다.' },
    { s: 'yujin', e: 'sad', t: '…미안해요. 총괄인 내가 백업을 챙겼어야 했는데.' },
    { me: '매니저님 혼자 다 할 수는 없잖아요. 그러려고 팀이 있는 거고요.' },
    { s: 'yujin', e: 'surprised', t: '…' },
    { s: 'yujin', e: 'smile', t: '{name} 씨는 가끔, 내가 해야 할 말을 먼저 하네요.' },
    { cg: 'yujin_3am' },
    { t: '새벽 3시. PT 자료의 80%가 돌아왔다.' },
    { go: 'route_check' },
  ],
  ch6_junho: [
    { s: 'junho', e: 'serious', t: '맡겨요. 디자인 원본은 제 클라우드에 버전별로 남아 있어요.' },
    { t: '준호 씨는 밤새 레이어를 하나하나 맞춰 나갔다. 나는 옆에서 커피와 간식을 날랐다.' },
    { cg: 'junho_restore' },
    { s: 'junho', e: 'grin', t: '…다 찾았다! 거의 다 살릴 수 있어요!' },
    { s: 'junho', e: 'blush', t: '{name} 씨 없었으면 중간에 포기했을 거예요. 진짜로.' },
    { go: 'route_check' },
  ],
  ch6_doyun: [
    { t: '사정을 들은 강 팀장은 말없이 옥상에서 내려왔다.' },
    { s: 'doyun', e: 'serious', t: '2년 전에도 똑같은 일이 있었어요. 그때 난 아무것도 못 했고.' },
    { s: 'doyun', e: 'normal', t: '그 뒤로 매일 밤 개인 백업을 해 둬요. 다른 팀 것까지.' },
    { cg: 'doyun_backup' },
    { t: '팀장의 외장하드에 어제 날짜 폴더가 고스란히 남아 있었다.' },
    { s: 'yujin', e: 'surprised', t: '…강도윤 팀장님. 이걸 계속 하고 있었어요?' },
    { s: 'doyun', e: 'normal', t: '…신입이 부탁해서 꺼낸 거예요. 아니었으면 그냥 뒀겠죠.' },
    { go: 'route_check' },
  ],
  ch6_seoa: [
    { cg: 'seoa_schedule' },
    { t: '서아 선배는 노트를 펼치고, 남은 7일을 시간 단위로 다시 쪼개기 시작했다.' },
    { s: 'seoa', e: 'serious', t: '복구 담당, 재작업 담당, 클라이언트 연락 담당. 이렇게 나누면 돼요.' },
    { s: 'seoa', e: 'normal', t: '…그리고 재작업 담당엔 제 이름만 잔뜩 쓰면 되고요.' },
    { me: '선배, 그건 안 돼요. 제 이름도 같이 써요.' },
    { s: 'seoa', e: 'surprised', t: '…' },
    { s: 'seoa', e: 'blush', t: '…네. 우리 둘 이름으로 쓸게요.' },
    { go: 'route_check' },
  ],
  ch6_harin: [
    { s: 'harin', e: 'serious', t: '자료가 다 없으면, 이야기로 가자. 30초짜리 영상으로 봄빛음료를 보여 주는 거야.' },
    { cg: 'harin_video' },
    { t: '하린 선배의 휴대폰 속 편집 실력은 역시 "9층 오피스툰" 그 자체였다.' },
    { t: '나는 밤새 촬영 소품을 나르고, 대사를 맞춰 주고, 커피를 탔다.' },
    { s: 'harin', e: 'blush', t: '…이거 내가 만든 거 중에 제일 좋다. 너랑 같이 해서 그런가.' },
    { go: 'route_check' },
  ],
  ch6_leave: [
    { cg: 'leave_early' },
    { t: '가방을 챙겨 나오는 등 뒤로, 아무도 말을 걸지 않았다.' },
    { bg: 'office' },
    { t: '다음 날 아침. 다들 충혈된 눈으로 자리를 지키고 있었다.' },
    { s: 'yujin', e: 'serious', t: '어젯밤엔 다들 남았어요, {name} 씨. 신입까지 포함해서… 아니, 신입만 빼고.' },
    { go: 'route_check' },
  ],
  ch6_work: [
    { t: '내 PC에 남은 시안 조각을 모아 밤새 처음부터 다시 그렸다.' },
    { cg: 'dawn_work' },
    { t: '동이 틀 무렵, 차 매니저님이 내 화면을 보고 한참 말이 없었다.' },
    { s: 'yujin', e: 'surprised', t: '…이걸 혼자 다 했어요?' },
    { s: 'yujin', e: 'smile', t: '이번 PT, {name} 씨가 메인 시안 맡아요.' },
    { go: 'route_check' },
  ],

  /* ===== 루트 결정: 가장 친해진 사람 → 그 사람 루트 ===== */
  route_check: [
    { hide: 1 },
    { go: v => {
      const ids = ['seoa', 'doyun', 'junho', 'yujin', 'harin'];
      let best = null;
      for (const id of ids) {
        if (v[id] < window.ROUTE_THRESHOLD) continue;
        if (!best || v[id] > v[best] || (v[id] === v[best] && v.last === id)) best = id;
      }
      if (v.bad >= window.BAD_LIMIT) return 'end_bad';   // 사고를 너무 많이 치면
      if (best) return 'route_' + best;
      return v.work >= 4 ? 'end_career' : 'end_solo';
    } },
  ],

  /* ======================= 서아 루트 ======================= */
  route_seoa: [
    { title: '7화', sub: '계단참의 노트' },
    { bg: 'office_night' }, { set: { route: 'seoa' } },
    { t: 'PT를 사흘 앞둔 밤. 비상계단에서 작은 울음소리가 들렸다.' },
    { cg: 'seoa_stairs' },
    { t: '계단참에 서아 선배가 노트를 끌어안고 앉아 있었다.' },
    { s: 'seoa', e: 'teary', t: '…{name} 씨? 아, 아니에요. 괜찮아요. 눈에 뭐가 들어가서.' },
    { s: 'seoa', e: 'sad', t: '부장님이 PT 질의응답까지 맡으래요. 다들 바쁘니까, 제가 해야죠. 괜찮아요.' },
    { choice: [
      { t: '"선배, 괜찮지 않아도 돼요."', add: { seoa: 1, rs: 1 }, then: [
        { s: 'seoa', e: 'surprised', t: '…' },
        { s: 'seoa', e: 'teary', t: '…그 말, 아무도 안 해 줬어요. 나도 나한테 안 해 줬고.' },
        { t: '선배는 한참을 울었다. 나는 옆에 앉아 노트를 대신 들고 있었다.' },
      ] },
      { t: '"질의응답 자료, 제가 밤새 만들어 둘게요!"', add: { work: 1 }, then: [
        { s: 'seoa', e: 'smile', t: '…고마워요. 역시 든든하네요.' },
        { t: '선배는 웃었지만, 눈가는 여전히 젖어 있었다.' },
      ] },
      { t: '"울 시간에 자료나 만들어요. PT 사흘 남았어요."', add: { seoa: -2, rs: -1 }, then: [
        { s: 'seoa', e: 'sad', t: '…맞아요. 미안해요.' },
        { t: '선배는 눈물을 닦고 사무실로 돌아갔다. 그날 밤 선배 자리의 불은 끝까지 꺼지지 않았다.' },
      ] },
    ] },
    { go: 'seoa_2' },
  ],
  seoa_2: [
    { title: '8화', sub: 'PT 당일' },
    { bg: 'pt' }, { hide: 1 }, { outfit: { all: 'pt' } },
    { t: 'PT 당일 아침. 발표 직전에 부장님이 서아 선배를 불렀다.' },
    { s: '박 부장', t: '윤 대리, 끝나고 다음 주 경쟁사 분석도 좀 맡아. 할 수 있지?' },
    { s: 'seoa', e: 'normal', t: '…네, 괜찮…' },
    { t: '선배의 손끝이 노트를 꽉 쥐고 있었다.' },
    { choice: [
      { t: '"부장님, 그 건은 저랑 나눠서 하겠습니다."', add: { seoa: 1, rs: 1 }, then: [
        { t: '부장님이 눈을 끔뻑였다. 서아 선배가 숨을 한 번 고르고 말했다.' },
        { cg: 'seoa_no' },
        { s: 'seoa', e: 'serious', t: '…아니요. 이번 주는 PT에만 집중하고 싶어요. 다음 주에 다시 말씀드릴게요.' },
        { t: '처음으로 듣는 선배의 "아니요"였다. 그날 질의응답은 완벽했다.' },
      ] },
      { t: '"그건 제가 할게요, 부장님!"', add: { work: 2 }, then: [
        { t: '부장님이 흡족하게 고개를 끄덕였다. 선배의 짐이 내 쪽으로 옮겨 왔다.' },
        { s: 'seoa', e: 'smile', t: '…고마워요. 또 신세를 졌네요.' },
      ] },
      { t: '(못 본 척 내 자료만 정리한다)', add: { seoa: -1, rs: -1 }, then: [
        { t: '선배는 결국 "네"라고 대답했다. 그날 질의응답에서 선배의 목소리는 조금 떨렸다.' },
      ] },
    ] },
    { go: 'seoa_3' },
  ],
  seoa_3: [
    { title: '9화', sub: '첫 연차' },
    { if: v => v.rs < 0, then: [{ go: 'end_missed' }] },   // 루트 안에서 상처 준 말이 더 많으면
    { bg: 'hanriver' }, { hide: 1 }, { outfit: { seoa: 'casual' } },
    { t: '발표가 끝난 다음 날. 서아 선배는 입사 후 처음으로 연차를 냈다.' },
    { cg: 'seoa_river' },
    { t: '그리고 한강 벤치에서, 나에게 노트 한 페이지를 보여 주었다.' },
    { s: 'seoa', e: 'smile', t: '새로 만든 할 일 목록이에요. 이번엔 회사 일 말고, 나를 위한 거.' },
    { s: 'seoa', e: 'blush', t: '첫 번째 칸에 뭘 쓸지 오래 고민했는데요. …{name} 씨랑 퇴근하기.' },
    { sfx: '두근' },
    { s: 'seoa', e: 'blush', t: '이거, 체크해도 돼요?' },
    { choice: [
      { t: '"네. 저도 선배 좋아해요."', go: v => v.rs >= window.HAPPY_RS ? 'end_seoa_happy' : 'seoa_miss' },
      { t: '"선배는 제 최고의 사수예요."', then: [
        { s: 'seoa', e: 'smile', t: '…사수라. 그 칸도 소중하죠.' },
      ], go: 'end_seoa_normal' },
    ] },
  ],
  seoa_miss: [
    { s: 'seoa', e: 'surprised', t: '…' },
    { cg: 'seoa_wait' },
    { s: 'seoa', e: 'sad', t: '고마워요. 그런데 난 아직, 내가 괜찮지 않을 때 기대는 법을 잘 몰라서.' },
    { s: 'seoa', e: 'normal', t: '그 칸은 연필로 적어 둘게요. 언젠가 펜으로 덧쓸 수 있게.' },
    { go: 'end_seoa_normal' },
  ],
  end_seoa_happy: [
    { fx: 'petal' },
    { sfx: '두근두근' },
    { s: 'seoa', e: 'blush', t: '…그럼, 체크할게요.' },
    { cg: 'seoa_happy' },
    { t: '선배가 펜으로 첫 번째 칸에 또박또박 브이 표시를 했다. 그리고 내 손을 잡았다.' },
    { hide: 1 },
    { t: '3개월 후. 봄빛음료 PT는 우리 팀이 따냈고, 서아 선배의 노트엔 새 목록이 생겼다.' },
    { t: '"주말엔 휴대폰 끄기." "{name}{name|이랑|랑} 바다 가기." 이번엔 하나도 빠짐없이 체크됐다.' },
    { ending: 'seoa_happy' },
  ],
  end_seoa_normal: [
    { hide: 1 },
    { t: '그날 우리는 강을 따라 오래 걸었다. 많은 말을 하진 않았다.' },
    { t: '그 뒤로 우리는 9층에서 손꼽히는 사수와 부사수가 되었다.' },
    { cg: 'seoa_postit' },
    { t: '선배는 이제 일이 넘치면 내 책상에 포스트잇을 붙인다. "반만 부탁해요." 그거면 충분했다.' },
    { ending: 'seoa_normal' },
  ],

  /* ======================= 도윤 루트 ======================= */
  route_doyun: [
    { title: '7화', sub: '2년 전의 PT' },
    { bg: 'rooftop_night' }, { set: { route: 'doyun' } }, { outfit: { doyun: 'coat' } },
    { t: 'PT를 사흘 앞둔 밤. 옥상에서 강 팀장이 처음으로 먼저 말을 꺼냈다.' },
    { cg: 'doyun_alone' },
    { s: 'doyun', e: 'normal', t: '2년 전 큰 PT에서 내가 발표를 맡았어요. 그런데 첫 문장에서 머리가 하얘졌어요.' },
    { s: 'doyun', e: 'sad', t: '팀이 1년 동안 준비한 게 그날 다 날아갔죠. 그 뒤로 사람들 앞에 못 서요.' },
    { s: 'doyun', e: 'normal', t: '이번 PT 기획 파트, 원래 내가 발표해야 해요. 차 매니저가 부탁했거든요.' },
    { s: 'doyun', e: 'sad', t: '…못 할 것 같아요.' },
    { choice: [
      { t: '"제가 무대 끝에 서 있을게요. 팀장님만 보고 있을게요."', add: { doyun: 1, rs: 1 }, then: [
        { s: 'doyun', e: 'surprised', t: '…' },
        { s: 'doyun', e: 'smile', t: '신입이 무대 끝에 서서 뭐 하게요.' },
        { s: 'doyun', e: 'shy', t: '…그래도, 그거면 될 것 같아요.' },
      ] },
      { t: '"그럼 거절하셔도 돼요. 억지로 하지 마세요."', then: [
        { s: 'doyun', e: 'normal', t: '…그렇죠. 그게 편하겠죠.' },
        { t: '그는 대답 대신 봄이에게 물을 주었다. 너무 많이.' },
      ] },
      { t: '"2년이나 지났잖아요. 그냥 하시면 되죠."', add: { doyun: -2, rs: -1 }, then: [
        { s: 'doyun', e: 'serious', t: '…그렇게 쉬웠으면 좋겠네요.' },
        { t: '그는 그 뒤로 한마디도 하지 않았다.' },
      ] },
    ] },
    { go: 'doyun_2' },
  ],
  doyun_2: [
    { title: '8화', sub: 'PT 당일' },
    { bg: 'pt' }, { hide: 1 }, { outfit: { all: 'pt' } },
    { if: v => v.rs >= 1, then: [
      { t: 'PT 당일. 기획 파트 차례가 되자, 강 팀장이 천천히 단상에 올랐다.' },
      { t: '나는 약속대로 무대 끝에 섰다.' },
    ], else: [
      { t: 'PT 당일. 기획 파트는 차 매니저님이 대신 맡기로 했었다.' },
      { t: '그런데 순서 직전, 강 팀장이 말없이 단상으로 걸어 나왔다.' },
    ] },
    { s: 'doyun', e: 'serious', t: '봄빛음료 기획을 맡은 강도윤입니다. 저희는…' },
    { t: '첫 문장에서 그의 목소리가 멈췄다. 3초. 5초. 회의실이 조용해졌다.' },
    { choice: [
      { t: '팀장님과 눈을 맞추고 천천히 고개를 끄덕인다', add: { doyun: 1, rs: 1 }, then: [
        { t: '그가 나를 봤다. 숨을 한 번 깊게 들이쉬었다.' },
        { cg: 'doyun_pt' },
        { s: 'doyun', e: 'normal', t: '…죽어 가던 화분에도, 새잎은 납니다.' },
        { t: '그렇게 시작된 발표는 그날 가장 긴 박수를 받았다.' },
      ] },
      { t: '대신 발표를 이어받으려고 손을 든다', add: { work: 1 }, then: [
        { t: '손을 들려는 순간, 그가 다시 입을 열었다.' },
        { s: 'doyun', e: 'serious', t: '…괜찮습니다. 계속하겠습니다.' },
        { t: '발표는 무사히 끝났다. 하지만 그는 끝내 나를 보지 않았다.' },
      ] },
      { t: '눈이 마주칠까 봐 고개를 숙인다', add: { doyun: -1, rs: -1 }, then: [
        { t: '그가 무대 끝을 봤을 때, 나는 바닥만 보고 있었다.' },
        { t: '긴 침묵 끝에 차 매니저님이 대신 마이크를 잡았다.' },
      ] },
    ] },
    { go: 'doyun_3' },
  ],
  doyun_3: [
    { title: '9화', sub: '3월의 늦은 눈' },
    { if: v => v.rs < 0, then: [{ go: 'end_missed' }] },   // 루트 안에서 상처 준 말이 더 많으면
    { bg: 'rooftop_night' }, { fx: 'snow' }, { hide: 1 },
    { t: 'PT가 끝난 밤. 3월인데 늦은 눈이 내리기 시작했다.' },
    { cg: 'doyun_snow' },
    { t: '옥상에선 강 팀장이 봄이 화분을 품에 안고 서 있었다.' },
    { s: 'doyun', e: 'smile', t: '봐요. 봄이, 꽃봉오리 생겼어요.' },
    { s: 'doyun', e: 'normal', t: '2년 동안 아무 일도 없었는데. {name} 씨가 오고 나서 자꾸 뭔가 피네요.' },
    { sfx: '두근' },
    { s: 'doyun', e: 'blush', t: '…이 말 하려고 기다렸어요. 같이 봄을 기다려 줄래요?' },
    { choice: [
      { t: '"네. 팀장님 옆에서 기다릴게요. 좋아해요."', go: v => v.rs >= window.HAPPY_RS ? 'end_doyun_happy' : 'doyun_miss' },
      { t: '"봄이 꽃 필 때까지, 제가 물 줄게요."', then: [
        { s: 'doyun', e: 'smile', t: '…그래요. 당번은 {name} 씨한테 맡길게요.' },
      ], go: 'end_doyun_normal' },
    ] },
  ],
  doyun_miss: [
    { s: 'doyun', e: 'surprised', t: '…' },
    { cg: 'doyun_wait' },
    { s: 'doyun', e: 'sad', t: '고마워요. 근데 오늘의 난, 그 말을 받을 자격이 아직 없는 것 같아요.' },
    { s: 'doyun', e: 'normal', t: '봄이 꽃이 피면, 그때 내가 다시 물을게요.' },
    { go: 'end_doyun_normal' },
  ],
  end_doyun_happy: [
    { sfx: '두근두근' },
    { s: 'doyun', e: 'blush', t: '…큰일이네. 봄이보다 내가 먼저 필 것 같아.' },
    { cg: 'doyun_scarf' },
    { t: '그가 목도리를 풀어 내 목에 감아 주었다. 눈송이가 봄이의 꽃봉오리 위에 내려앉았다.' },
    { hide: 1 }, { fx: 'petal' }, { bg: 'rooftop_day' },
    { t: '4월. 옥상 정원에 처음으로 꽃이 피었다.' },
    { t: '강 팀장의 책상 위엔 작은 화분이 하나 늘었다. 이름표엔 "{name}"{name|이라고|라고} 적혀 있었다.' },
    { ending: 'doyun_happy' },
  ],
  end_doyun_normal: [
    { hide: 1 }, { fx: 'none' }, { bg: 'rooftop_day' },
    { t: '그 뒤로 나는 옥상 화분 당번이 되었다.' },
    { t: '점심마다 팀장님과 말없이 물을 주고, 가끔 바나나우유를 나눠 마신다.' },
    { cg: 'doyun_bloom' },
    { t: '봄이에게 꽃이 피던 날, 그가 처음으로 소리 내어 웃었다. 그거면 충분했다.' },
    { ending: 'doyun_normal' },
  ],

  /* ======================= 준호 루트 ======================= */
  route_junho: [
    { title: '7화', sub: '꽥이의 비밀' },
    { bg: 'office_night' }, { set: { route: 'junho' } },
    { t: 'PT를 사흘 앞둔 밤. 준호 씨가 할 말이 있다며 나를 탕비실로 불렀다.' },
    { cg: 'junho_plan' },
    { s: 'junho', e: 'normal', t: '나… 회사 그만둘까 생각 중이에요. 친구랑 작은 디자인 스튜디오를 차리재요.' },
    { s: 'junho', e: 'sad', t: '근데 무서워요. 망하면 어떡하지. 다들 안정적인 회사 왜 나가냐고 할 텐데.' },
    { choice: [
      { t: '"준호 씨가 진짜 하고 싶은 거면, 저는 응원해요."', add: { junho: 1, rs: 1 }, then: [
        { s: 'junho', e: 'surprised', t: '…' },
        { s: 'junho', e: 'smile', t: '역시. {name} 씨한테 제일 먼저 말하길 잘했다.' },
      ] },
      { t: '"PT 끝나고 천천히 생각해도 되잖아요."', add: { work: 1 }, then: [
        { s: 'junho', e: 'normal', t: '…그쵸. 맞는 말이에요. 일단 PT부터.' },
        { t: '웃었지만, 어딘가 아쉬워 보이는 얼굴이었다.' },
      ] },
      { t: '"그건 좀 무모한데요. 현실을 봐요."', add: { junho: -2, rs: -1 }, then: [
        { s: 'junho', e: 'sad', t: '…그쵸. 다들 그렇게 말할 줄 알았어요.' },
        { t: '준호 씨는 휴대폰 속 사업계획서를 조용히 닫았다.' },
      ] },
    ] },
    { go: 'junho_2' },
  ],
  junho_2: [
    { title: '8화', sub: 'PT 당일' },
    { bg: 'pt' }, { hide: 1 }, { outfit: { all: 'pt' } },
    { t: 'PT 당일. 우리 발표의 마지막은 준호 씨가 만든 움직이는 패키지 시안이었다.' },
    { t: '그런데 리허설 10분 전, 태블릿 화면이 하얗게 멈췄다.' },
    { s: 'junho', e: 'surprised', t: '왜, 왜 지금…! 어제까진 됐는데!' },
    { choice: [
      { t: '"침착해요. 꽥이한테 하듯 하나씩 말해 봐요."', add: { junho: 1, rs: 1 }, then: [
        { cg: 'junho_fix' },
        { t: '준호 씨가 레이어를 소리 내어 짚기 시작했다. 세 번째에서 목소리가 멈췄다.' },
        { if: v => v.duck, then: [
          { s: 'junho', e: 'grin', t: '…숨김 레이어! 또 {name} 씨 덕분이야. 두 번째로 행운의 오리!' },
        ], else: [
          { s: 'junho', e: 'grin', t: '…숨김 레이어였어! {name} 씨 진짜 행운의 오리야!' },
        ] },
        { t: '시안은 발표 마지막에 완벽하게 움직였다. 임원들이 감탄했다.' },
      ] },
      { t: '"시안은 출력물로 대체해요. 매니저님께는 제가 말할게요."', add: { work: 2 }, then: [
        { t: '빠른 대처 덕분에 발표는 무사히 끝났다.' },
        { s: 'junho', e: 'normal', t: '…고마워요. 그쵸, 그게 맞죠.' },
        { t: '준호 씨는 꺼진 태블릿을 오래 바라봤다.' },
      ] },
      { t: '"그러게 어제 백업해 뒀어야죠!" 짜증을 낸다', add: { junho: -2, rs: -1 }, then: [
        { t: '준호 씨의 손이 멈췄다. 결국 시안은 발표에서 빠졌다.' },
        { s: 'junho', e: 'sad', t: '…미안해요. 내가 다 망쳤네.' },
      ] },
    ] },
    { go: 'junho_3' },
  ],
  junho_3: [
    { title: '9화', sub: '해 질 녘 한강' },
    { if: v => v.rs < 0, then: [{ go: 'end_missed' }] },   // 루트 안에서 상처 준 말이 더 많으면
    { bg: 'hanriver' }, { hide: 1 }, { outfit: { junho: 'casual' } },
    { t: '발표가 끝난 주말. 준호 씨와 다시 한강에 왔다. 이번엔 해 질 녘이었다.' },
    { s: 'junho', e: 'normal', t: '나 결정했어요. 다음 달에 퇴사하고 스튜디오 차려요.' },
    { s: 'junho', e: 'grin', t: '첫 작업은 우리 스튜디오 로고예요. 고무 오리 모양으로 할 거예요.' },
    { s: 'junho', e: 'blush', t: '…근데 그 오리, {name} 씨 생각하면서 그렸어요. 그러니까 말인데.' },
    { sfx: '두근' },
    { cg: 'junho_river' },
    { s: 'junho', e: 'blush', t: '회사 동료 말고, 다른 이름으로 계속 옆에 있어 줄래요?' },
    { choice: [
      { t: '"네. 좋아해요, 준호 씨."', go: v => v.rs >= window.HAPPY_RS ? 'end_junho_happy' : 'junho_miss' },
      { t: '"준호 씨는 평생 제 최고의 동료예요."', then: [
        { s: 'junho', e: 'smile', t: '…하하. 그쵸, 최고의 동료. 그것도 엄청 좋은 거예요.' },
      ], go: 'end_junho_normal' },
    ] },
  ],
  junho_miss: [
    { s: 'junho', e: 'blush', t: '…진짜요? 나도.' },
    { cg: 'junho_wait' },
    { s: 'junho', e: 'sad', t: '근데 나, 아직 내 앞가림도 못 하는 것 같아요. 지금 옆에 서도 될지 모르겠어요.' },
    { s: 'junho', e: 'normal', t: '스튜디오가 자리 잡으면, 그때 다시 말할게요. 꼭.' },
    { go: 'end_junho_normal' },
  ],
  end_junho_happy: [
    { fx: 'petal' },
    { sfx: '두근두근' },
    { s: 'junho', e: 'surprised', t: '…진짜요? 진짜죠? 무르기 없어요!' },
    { s: 'junho', e: 'grin', t: '아, 어떡해. 나 지금 엄청 웃기게 웃고 있죠?' },
    { t: '준호 씨가 자전거를 세워 두고 나를 꽉 끌어안았다. 해가 강물 위로 천천히 내려앉았다.' },
    { hide: 1 },
    { cg: 'junho_studio' },
    { t: '1년 후. 작은 디자인 스튜디오 "꽥"의 문 앞엔 고무 오리 두 마리가 나란히 놓여 있다.' },
    { t: '첫 번째 포트폴리오의 마지막 장엔 이렇게 적혀 있었다. "행운의 오리, {name}에게."' },
    { ending: 'junho_happy' },
  ],
  end_junho_normal: [
    { hide: 1 },
    { cg: 'junho_farewell' },
    { t: '준호 씨는 다음 달 회사를 떠났다. 송별회 날, 우리는 노래방에서 목이 쉬도록 듀엣을 불렀다.' },
    { t: '지금도 주말이면 가끔 한강에서 만난다. 내 책상 위엔 그가 두고 간 꽥이가 있다.' },
    { ending: 'junho_normal' },
  ],

  /* ======================= 유진 루트 ======================= */
  route_yujin: [
    { title: '7화', sub: '매니저님의 빈칸' },
    { bg: 'office_night' }, { set: { route: 'yujin' } },
    { t: 'PT 전날 밤. 모두 퇴근한 사무실에 차 매니저님과 둘만 남았다.' },
    { s: 'yujin', e: 'normal', t: '내일 발표는 내가 해요. 대표님도 오신대요.' },
    { s: 'yujin', e: 'sad', t: '…솔직히 무서워요. 총괄이 흔들리면 다 흔들리니까. 그래서 아무한테도 말 못 했어요.' },
    { choice: [
      { t: '"매니저님도 사람이에요. 무서우면 무섭다고 해도 돼요."', add: { yujin: 1, rs: 1 }, then: [
        { s: 'yujin', e: 'surprised', t: '…' },
        { s: 'yujin', e: 'blush', t: '그 말이 듣고 싶었나 봐요. 이상하게 손이 덜 떨리네.' },
      ] },
      { t: '"걱정 마세요. 자료는 제가 완벽하게 준비할게요!"', add: { work: 1 }, then: [
        { s: 'yujin', e: 'smile', t: '든든하네요. …고마워요.' },
      ] },
      { t: '"그런 말은 총괄답지 않아요. 약한 소리 하지 마세요."', add: { yujin: -2, rs: -1 }, then: [
        { s: 'yujin', e: 'serious', t: '…그래요. 잊어요. 방금 한 말.' },
        { t: '매니저님은 다시 빈틈없는 얼굴로 돌아갔다.' },
      ] },
    ] },
    { if: v => v.rs >= 0, then: [
      { cg: 'yujin_gift' },
      { t: '늦은 밤, 매니저님이 스케치북 한 장을 찢어 건넸다. 고양이 두 마리가 나란히 야근하는 그림이었다.' },
      { s: 'yujin', e: 'blush', t: '…답례예요. 버리면 혼나요.' },
    ], else: [
      { t: '그날 밤 매니저님은 말없이 자료만 넘겨주었다. 스케치북은 보이지 않았다.' },
    ] },
    { go: 'yujin_2' },
  ],
  yujin_2: [
    { title: '8화', sub: 'PT 당일' },
    { bg: 'pt' }, { hide: 1 }, { outfit: { all: 'pt' } },
    { t: 'PT 당일. 봄빛음료 임원들 앞에서 차 매니저님이 발표를 시작했다.' },
    { sfx: '딸깍… 딸깍' },
    { t: '그런데 세 번째 장에서 리모컨이 먹통이 됐다. 화면이 멈췄다.' },
    { s: 'yujin', e: 'surprised', t: '…' },
    { t: '매니저님의 손끝이 하얗게 질리는 게 보였다.' },
    { choice: [
      { t: '조용히 앞으로 나가 노트북으로 화면을 넘긴다', add: { yujin: 1, rs: 1 }, then: [
        { t: '슬라이드를 넘기자, 매니저님이 나를 한 번 보고 고개를 끄덕였다.' },
        { cg: 'yujin_pt' },
        { s: 'yujin', e: 'normal', t: '…이어서, 초록이 왜 봄빛음료의 색이어야 하는지 말씀드리겠습니다.' },
        { t: '첫 주에 내가 했던 대답이었다.' },
      ] },
      { t: '매니저님 대신 마이크를 잡고 설명을 이어 간다', add: { work: 2 }, then: [
        { t: '떨리는 목소리로 시안을 설명했다. 임원들이 고개를 끄덕였다.' },
        { s: 'yujin', e: 'surprised', t: '…' },
        { t: '발표가 끝난 뒤, 매니저님은 수고했다는 말만 짧게 남겼다.' },
      ] },
      { t: '당황해서 아무것도 못 한다', add: { yujin: -1, rs: -1 }, then: [
        { t: '침묵이 길어졌다. 매니저님은 손짓으로 화면을 가리키며 혼자 버텼다.' },
        { t: '발표는 끝났지만, 내려오는 매니저님의 손끝은 여전히 하얬다.' },
      ] },
    ] },
    { go: 'yujin_3' },
  ],
  yujin_3: [
    { title: '9화', sub: '퇴근 후, 한강' },
    { if: v => v.rs < 0, then: [{ go: 'end_missed' }] },   // 루트 안에서 상처 준 말이 더 많으면
    { bg: 'hanriver_night' }, { hide: 1 },
    { t: '결과는 다음 주. 다른 사람들과 헤어진 뒤, 매니저님이 한강에 가자고 했다.' },
    { s: 'yujin', e: 'normal', t: '오늘 고마웠어요. {name} 씨 덕분에 끝까지 했어요.' },
    { s: 'yujin', e: 'smile', t: '그리고… 나, 웹툰 공모전에 내 보려고요. 야근하는 고양이 이야기.' },
    { if: v => v.fan, then: [
      { s: 'yujin', e: 'smile', t: '1화부터 결제한다고 했죠? 약속 지켜요.' },
    ] },
    { cg: 'yujin_river' },
    { s: 'yujin', e: 'blush', t: '{name} 씨. 회사 밖이니까, 그냥 차유진으로 물어볼게요.' },
    { sfx: '두근' },
    { s: 'yujin', e: 'blush', t: '…퇴근 후에도, 나랑 자주 만날래요?' },
    { choice: [
      { t: '"네. 사실 저, 매니저님 좋아해요."', go: v => v.rs >= window.HAPPY_RS ? 'end_yujin_happy' : 'yujin_miss' },
      { t: '"매니저님은 제가 제일 존경하는 사람이에요."', then: [
        { s: 'yujin', e: 'smile', t: '…존경이라. 그것도 나쁘지 않네요.' },
      ], go: 'end_yujin_normal' },
    ] },
  ],
  yujin_miss: [
    { s: 'yujin', e: 'surprised', t: '…' },
    { cg: 'yujin_wait' },
    { s: 'yujin', e: 'sad', t: '고마워요. 그런데 난 아직, 누군가에게 기대는 법을 잘 몰라서.' },
    { s: 'yujin', e: 'normal', t: '조금만 기다려 줄래요? 언젠가 내가 먼저 말할게요.' },
    { go: 'end_yujin_normal' },
  ],
  end_yujin_happy: [
    { fx: 'petal' },
    { sfx: '두근두근' },
    { s: 'yujin', e: 'blush', t: '…그럼 됐어요. 나도예요.' },
    { cg: 'yujin_hand' },
    { t: '매니저님이 조심스럽게 내 손을 잡았다. 차가운 강바람 속에서 손만 따뜻했다.' },
    { hide: 1 },
    { t: '3개월 후. 봄빛음료 PT는 우리 팀이 따냈고, 한 웹툰 플랫폼에서 신인 작가의 연재가 시작됐다.' },
    { t: '작가 이름은 비밀. 다만 첫 화 마지막 칸에선 고양이 두 마리가 손을 잡고 퇴근하고 있었다.' },
    { ending: 'yujin_happy' },
  ],
  end_yujin_normal: [
    { hide: 1 },
    { t: '그날 밤 우리는 강을 따라 오래 걸었다. 많은 말을 하진 않았다.' },
    { t: '그 뒤로 우리는 사내에서 손꼽히는 상사와 팀원이 되었다.' },
    { cg: 'yujin_doc' },
    { t: '가끔 매니저님이 건네는 서류 귀퉁이에 작은 고양이가 그려져 있다. 나만 아는 인사다.' },
    { ending: 'yujin_normal' },
  ],

  /* ======================= 하린 루트 ======================= */
  route_harin: [
    { title: '7화', sub: '들켜 버린 계정' },
    { bg: 'office' }, { set: { route: 'harin' } },
    { t: 'PT를 사흘 앞둔 아침. 사내 메신저가 시끄러웠다. "9층 오피스툰 주인, 정하린이래!"' },
    { t: '하린 선배는 하루 종일 웃는 얼굴로 농담을 받아쳤다. 그리고 점심시간에 사라졌다.' },
    { bg: 'rooftop_day' },
    { cg: 'harin_rooftop' },
    { s: 'harin', e: 'sad', t: '…역시 여기 있을 줄 알았지? 다들 "역시 하린이 웃기다"래.' },
    { s: 'harin', e: 'sad', t: 'PT 영상도 이제 다들 개그 영상인 줄 알 거야. 그냥 빼자고 할까 봐.' },
    { choice: [
      { t: '"웃기지 않아도 선배는 좋은 사람이에요. 영상도 진심이었잖아요."', add: { harin: 1, rs: 1 }, then: [
        { s: 'harin', e: 'surprised', t: '…' },
        { s: 'harin', e: 'blush', t: '…너 진짜 매번 반칙이다. 그 말 들으려고 여기 숨어 있었나 봐.' },
      ] },
      { t: '"그럼 영상은 빼고, 자료만으로 가요. 제가 정리할게요."', add: { work: 1 }, then: [
        { s: 'harin', e: 'smile', t: '…응, 그게 안전하겠다. 고마워.' },
        { t: '선배는 웃었지만, 휴대폰 속 영상 파일을 한참 내려다봤다.' },
      ] },
      { t: '"솔직히 선배 영상은 개그로 보는 게 맞긴 하죠."', add: { harin: -3, rs: -1 }, then: [
        { s: 'harin', e: 'sad', t: '…그치. 너까지 그렇게 말하면, 진짜 그런 거겠지.' },
        { t: '선배는 웃었다. 처음 보는, 하나도 안 웃긴 웃음이었다.' },
      ] },
    ] },
    { go: 'harin_2' },
  ],
  harin_2: [
    { title: '8화', sub: 'PT 당일' },
    { bg: 'pt' }, { hide: 1 }, { outfit: { all: 'pt' } },
    { if: v => v.rs >= 1, then: [
      { t: 'PT 마지막 순서. 하린 선배가 만든 30초 영상이 화면에 떴다.' },
    ], else: [
      { t: 'PT 마지막 순서. 빠질 뻔했던 하린 선배의 영상이, 결국 차 매니저님 결정으로 화면에 떴다.' },
    ] },
    { t: '그런데 첫 장면에서 소리가 나오지 않았다. 음향 장비가 말썽이었다.' },
    { s: 'harin', e: 'surprised', t: '…어, 어떡해.' },
    { choice: [
      { t: '"선배 목소리로 직접 설명해요. 선배가 만든 이야기잖아요."', add: { harin: 1, rs: 1 }, then: [
        { t: '하린 선배가 안경을 고쳐 쓰고 마이크를 잡았다. 농담은 하나도 없었다.' },
        { cg: 'harin_pt' },
        { s: 'harin', e: 'serious', t: '봄빛음료는, 하루 중 가장 지친 순간에 마시는 첫 모금이었으면 합니다.' },
        { t: '소리 없는 영상 위로 선배의 목소리가 흘렀다. 그날 가장 조용하고, 가장 큰 박수였다.' },
      ] },
      { t: '"영상은 넘기고 다음 장으로 가요." 내가 정리한다', add: { work: 2 }, then: [
        { t: '재빠르게 다음 장으로 넘겼다. 발표는 무사히 끝났다.' },
        { s: 'harin', e: 'smile', t: '…고마워. 덕분에 살았다.' },
        { t: '선배의 목소리는 여느 때처럼 밝았다. 조금 지나치게.' },
      ] },
      { t: '"선배, 빨리 아무 농담이나 해서 넘겨요!"', add: { harin: -2, rs: -1 }, then: [
        { t: '하린 선배가 억지로 농담을 했다. 객석에서 웃음이 나왔다.' },
        { t: '하지만 선배는 웃지 않았다.' },
      ] },
    ] },
    { go: 'harin_3' },
  ],
  harin_3: [
    { title: '9화', sub: '네 번째 커피' },
    { if: v => v.rs < 0, then: [{ go: 'end_missed' }] },   // 루트 안에서 상처 준 말이 더 많으면
    { bg: 'rooftop_night' }, { hide: 1 },
    { cg: 'harin_night' },
    { t: 'PT가 끝난 밤. 하린 선배가 커피 두 잔을 들고 옥상에 올라왔다.' },
    { s: 'harin', e: 'smile', t: '오늘의 네 번째 잔. 이건 원래 안 마시는 잔인데, 너랑 마시려고.' },
    { s: 'harin', e: 'normal', t: '있잖아. 나 다음 편 오피스툰은 안 웃긴 걸로 만들 거야. 주인공이 고백하는 이야기.' },
    { sfx: '두근' },
    { s: 'harin', e: 'blush', t: '…주인공 상대역, 너 해 줄래? 진짜로.' },
    { choice: [
      { t: '"네. 선배 좋아해요. 농담 아니고요."', go: v => v.rs >= window.HAPPY_RS ? 'end_harin_happy' : 'harin_miss' },
      { t: '"선배는 제 최고의 단짝이에요."', then: [
        { s: 'harin', e: 'smile', t: '…단짝이라. 그치, 그것도 엄청 좋은 거야.' },
      ], go: 'end_harin_normal' },
    ] },
  ],
  harin_miss: [
    { s: 'harin', e: 'surprised', t: '…' },
    { cg: 'harin_wait' },
    { s: 'harin', e: 'sad', t: '…고마워. 근데 나, 아직 웃지 않는 내 모습을 나도 잘 모르겠어.' },
    { s: 'harin', e: 'normal', t: '그 편은 조금만 아껴 둘게. 언젠가 꼭 올릴 거야.' },
    { go: 'end_harin_normal' },
  ],
  end_harin_happy: [
    { fx: 'petal' },
    { sfx: '두근두근' },
    { s: 'harin', e: 'blush', t: '…진짜지? 편집으로 자르기 없다?' },
    { cg: 'harin_happy' },
    { t: '선배가 안경을 벗고 웃었다. 처음 보는, 웃기려고 하지 않는 웃음이었다.' },
    { hide: 1 },
    { t: '한 달 후. "9층 오피스툰"에 처음으로 웃기지 않은 편이 올라왔다.' },
    { t: '조회수는 역대 최고였다. 마지막 장면엔 커피 두 잔이 나란히 놓여 있었다.' },
    { ending: 'harin_happy' },
  ],
  end_harin_normal: [
    { hide: 1 },
    { cg: 'harin_daily' },
    { t: '그 뒤로도 우리는 점심도, 커피도, 퇴근도 함께했다.' },
    { t: '선배는 여전히 9층에서 제일 웃긴 사람이다. 그리고 나는 그 웃음 뒤를 아는 유일한 사람이다.' },
    { ending: 'harin_normal' },
  ],

  /* ======================= 그 밖의 엔딩 ======================= */
  end_career: [
    { title: '에필로그', sub: '연말 사내 게시판' },
    { bg: 'office' }, { hide: 1 }, { outfit: { all: 'work' } },
    { cg: 'team_9f' },
    { t: 'PT 결과 발표 날. 봄빛음료는 우리 팀을 선택했다.' },
    { s: 'yujin', e: 'smile', t: '메인 시안은 {name} 씨 거였어요. 다들 박수!' },
    { hide: 1 },
    { t: '연애는… 글쎄. 지금은 일이 더 재밌다.' },
    { cg: 'award' },
    { t: '연말, 사내 게시판에 공지가 올라왔다. "올해의 신입상: 마케팅팀 {name}"' },
    { ending: 'career' },
  ],
  end_missed: [
    { title: '에필로그', sub: '엇갈린 퇴근길' },
    { bg: 'dusk' }, { hide: 1 }, { fx: 'none' },
    { cg: 'empty_hall' },
    { t: 'PT는 끝났다. 그런데 무언가 더 크게 끝나 버린 것 같았다.' },
    { if: v => v.route === 'seoa', then: [{ t: '서아 선배는 그 뒤로 내 책상에 포스트잇을 붙이지 않았다. 일은 늘 혼자 다 해냈다.' }] },
    { if: v => v.route === 'doyun', then: [{ t: '옥상 문은 그 뒤로 늘 잠겨 있었다. 봄이가 꽃을 피웠는지는 모른다.' }] },
    { if: v => v.route === 'junho', then: [{ t: '준호 씨는 조용히 회사를 떠났다. 송별회 단톡방에 내 이름은 없었다.' }] },
    { if: v => v.route === 'yujin', then: [{ t: '매니저님은 여전히 완벽했다. 다만 서류 귀퉁이에 고양이는 더 이상 없었다.' }] },
    { if: v => v.route === 'harin', then: [{ t: '"9층 오피스툰"은 그 뒤로도 웃겼다. 웃기지 않은 편은 끝내 올라오지 않았다.' }] },
    { t: '오후 6시. 엘리베이터 거울 속 내 얼굴이 조금 낯설었다.' },
    { ending: 'missed' },
  ],
  end_bad: [
    { title: '에필로그', sub: '수습 평가 면담' },
    { bg: 'meeting' }, { hide: 1 },
    { s: '박 부장', t: '{name} 씨, 수습 평가 얘기 좀 하지.' },
    { t: '지각, 뒷말, 혼자 먼저 퇴근한 밤. 하나하나는 작았지만 전부 기록돼 있었다.' },
    { s: '박 부장', t: '정식 발령은 3개월 보류야. 다시 해 보자고.' },
    { bg: 'lobby' },
    { cg: 'closing_door' },
    { t: '9층 엘리베이터 앞. 닫히는 문 사이로 손을 뻗었지만, 이번엔 아무도 문을 잡아 주지 않았다.' },
    { ending: 'bad' },
  ],
  end_solo: [
    { title: '에필로그', sub: '오후 6시 정각' },
    { bg: 'dusk' }, { hide: 1 },
    { t: 'PT는 아쉽게 2등으로 끝났다.' },
    { cg: 'six_pm' },
    { t: '누구와도 특별히 가까워지지 못한 채, 매일 6시 정각에 퇴근했다.' },
    { t: '그래도 괜찮다. 내일은 또 오고, 9층 엘리베이터 문은 내일도 열릴 테니까.' },
    { t: '…다음엔 조금 더 용기를 내 볼까?' },
    { ending: 'solo' },
  ],
};
