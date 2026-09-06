'use strict';

// ===== 질문 =====
// axis: 어느 지표를 재는지, a/b: 각 선택지가 가리키는 글자
// E/I 는 '같이 먹나 혼자 먹나', S/N 은 '맛·포만감이냐 기분·상상이냐',
// T/F 는 '계산이냐 위로냐', J/P 는 '계획이냐 즉흥이냐'로 읽는다.

const QUESTIONS = [
  {
    axis: 'EI',
    q: '눈앞에 햄버거가 있는데 친한 친구가 같이 먹자고 한다',
    a: { text: '같이 먹지! 혼자 먹는 것보다 같이 먹는 게 맛있으니까', v: 'E' },
    b: { text: '"난 됐어, 너 먹어" 하고 조용히 커피만 든다', v: 'I' },
  },
  {
    axis: 'EI',
    q: '배달 음식을 시킬 때 나는',
    a: { text: '여럿이 모여서 여러 개 시켜 나눠 먹는 게 좋다', v: 'E' },
    b: { text: '혼자 조용히 내 취향대로 하나 시켜 먹는 게 편하다', v: 'I' },
  },
  {
    axis: 'EI',
    q: '야식이 가장 당기는 순간은',
    a: { text: '모임이나 술자리가 끝나고 다 같이 "2차 갈까?" 할 때', v: 'E' },
    b: { text: '혼자 방에서 영상 보다가 문득 냉장고가 생각날 때', v: 'I' },
  },
  {
    axis: 'SN',
    q: '메뉴를 고를 때 나는',
    a: { text: '늘 먹던 것, 실패 없는 검증된 맛', v: 'S' },
    b: { text: '신메뉴, 처음 보는 것, 일단 먹어봐야 직성이 풀림', v: 'N' },
  },
  {
    axis: 'SN',
    q: '내가 그 음식을 먹는 진짜 이유는',
    a: { text: '맛있고 배부른 실제 감각 그 자체', v: 'S' },
    b: { text: '먹고 나서의 기분, 분위기, 사진 찍는 상상까지', v: 'N' },
  },
  {
    axis: 'TF',
    q: '다이어트 중인데 눈앞에 케이크가 있다',
    a: { text: '"이거 500kcal, 러닝 1시간이네" 계산부터 한다', v: 'T' },
    b: { text: '"오늘 너무 힘들었으니까 이 정도는 위로지" 하고 든다', v: 'F' },
  },
  {
    axis: 'TF',
    q: '같이 식단하던 친구가 치킨을 시켰다',
    a: { text: '"지금 먹으면 3일 날아가. 냉정하게 생각해" 팩트 폭격', v: 'T' },
    b: { text: '"얼마나 힘들었으면…" 같이 한 조각 든다', v: 'F' },
  },
  {
    axis: 'JP',
    q: '식단을 관리한다면 나는',
    a: { text: '주간 식단표를 짜고 도시락까지 미리 준비한다', v: 'J' },
    b: { text: '그날 기분과 상황 따라 대충 조절한다', v: 'P' },
  },
  {
    axis: 'JP',
    q: '집에 있는 과자와 간식은',
    a: { text: '아예 안 사거나, 있으면 버린다', v: 'J' },
    b: { text: '"있어도 참을 수 있어"라며 서랍에 그대로 둔다', v: 'P' },
  },
  {
    axis: 'JP',
    q: '어제 폭식했다. 오늘 나는',
    a: { text: '왜 그랬는지 분석하고 다음 계획을 다시 짠다', v: 'J' },
    b: { text: '에라 모르겠다, 내일부터 다시 하지 뭐', v: 'P' },
  },
];

// ===== 결과 캐릭터 =====

const CHARACTERS = {
  party: {
    emoji: '🍗',
    name: '회식 먹방 인싸',
    tags: ['#같이먹어야맛', '#치팅데이전문', '#분위기파', '#2차는국룰'],
    persona: '사람들과 어울리는 자리에서 에너지를 얻는 활동적인 성격입니다. 즉흥적이고 유연하며, 지금 이 순간의 즐거움을 가장 중요하게 여깁니다. 분위기를 읽는 눈치가 빨라 어느 자리에서든 금방 중심이 되고, 혼자 있는 시간보다 함께 있는 시간이 훨씬 편한 사람입니다.',
    style: '음식 자체보다 "같이 먹는 분위기"를 사랑합니다. 혼자서는 잘 참다가도 모임에서는 가장 먼저 메뉴판을 펼치고 2차를 제안합니다. 식습관을 바꾸려면 혼자 결심하는 것보다 같이 먹는 사람들에게 미리 선언해두는 방식이 훨씬 잘 통합니다. 술자리 뒤의 야식이 가장 큰 고비입니다.',
  },
  explorer: {
    emoji: '🌮',
    name: '신메뉴 탐험가',
    tags: ['#신상은못참지', '#먹어봐야알지', '#작심삼일식단', '#맛집리스트'],
    persona: '호기심이 많고 새로운 것에 끌리는 창의적인 성격입니다. 같은 것을 반복하면 금방 지루해하고, 처음 보는 것에 눈이 반짝입니다. 계획보다 영감으로 움직이며, 아이디어는 많지만 끝까지 밀고 가는 것은 어려워하는 편입니다.',
    style: '한정판, 신메뉴, 처음 가는 가게는 그냥 지나치지 못합니다. 식단도 온갖 새로운 방법을 찾아 시작하지만 지루해지는 순간 다음 방법으로 갈아탑니다. 식습관을 바꾸려면 "먹지 마"보다 "새로운 건강식을 탐험한다"는 프레임이 잘 맞습니다. 호기심을 막지 말고 방향만 바꾸세요.',
  },
  commander: {
    emoji: '📋',
    name: '식단표 총사령관',
    tags: ['#주간식단표', '#도시락러', '#칼로리계산기', '#원칙대로'],
    persona: '체계적이고 목표 지향적인 리더 타입입니다. 계획이 틀어지는 것을 싫어하고, 한 번 정한 일은 효율적으로 끝까지 밀어붙입니다. 감정보다 논리를 우선하며, 자기 관리가 철저해 주변 사람들에게 "독하다"는 말을 자주 듣습니다.',
    style: '식단을 프로젝트처럼 다룹니다. 주간 식단표, 도시락, 칼로리 앱까지 풀세팅하고 나면 무서운 실행력으로 지켜냅니다. 다만 계획이 한 번 깨지면(회식, 여행) 전체를 망쳤다고 느끼며 한꺼번에 무너지는 것이 약점입니다. 예외 상황용 규칙을 미리 만들어두면 완주율이 크게 올라갑니다.',
  },
  caregiver: {
    emoji: '🥗',
    name: '다 같이 건강 챙김이',
    tags: ['#같이하자', '#식단메이트', '#챙겨주는사람', '#혼자는못해'],
    persona: '공감 능력이 높고 정이 많아 주변 사람을 살뜰히 챙기는 따뜻한 성격입니다. 갈등보다 조화를 중시하고, 다른 사람이 편안해하는 모습에서 에너지를 얻습니다. 남을 챙기느라 정작 자기 것은 뒤로 미루는 일이 많고, 부탁을 거절하는 데 유독 약합니다.',
    style: '가족과 동료의 끼니까지 챙기다 보니 정작 본인 식단은 흐지부지되기 쉽습니다. "다 같이 하자"고 주도할 때 성공률이 가장 높고, 혼자 참는 것은 오래 못 갑니다. 식단 메이트를 만들고 서로 인증하는 방식이 잘 맞습니다. 남이 권하는 음식을 거절하지 못하는 것이 가장 큰 고비입니다.',
  },
  solo: {
    emoji: '🍜',
    name: '혼밥 마이웨이',
    tags: ['#혼밥이편함', '#내입맛대로', '#귀찮으면안먹음', '#간섭사절'],
    persona: '독립적이고 간섭받는 것을 싫어하는 마이웨이 성향입니다. 융통성이 있어 상황에 맞춰 잘 움직이지만, 나만의 페이스가 깨지는 것은 못 견딥니다. 남의 시선에 크게 신경 쓰지 않고 조용히 자기 방식대로 살며, 설명을 요구받는 것을 귀찮아합니다.',
    style: '혼밥이 가장 편하고, 메뉴도 남 눈치 안 보고 고릅니다. 누가 "그거 몸에 안 좋아"라고 잔소리하면 오히려 더 먹는 청개구리 기질이 있습니다. 하지만 어느 날 귀찮아지거나 스스로 필요를 느끼면 아무에게도 말하지 않고 쿨하게 바꿔버립니다. 잔소리 대신 스스로 정한 기준 하나가 필요한 타입입니다.',
  },
  philosopher: {
    emoji: '🌙',
    name: '새벽 냉장고 철학자',
    tags: ['#야식감성', '#위로음식', '#감정먹기', '#새벽라면'],
    persona: '깊은 내면세계를 지닌 사색가입니다. 감정의 폭이 넓고 타인의 말에 쉽게 상처받는 섬세한 사람이며, 겉으로는 차분해 보여도 머릿속은 늘 생각으로 가득합니다. 진정성과 의미를 중요하게 여기고, 마음이 맞는 소수와 깊게 지내는 쪽을 택합니다.',
    style: '배고파서가 아니라 마음이 허해서 먹는 날이 많습니다. 스트레스, 외로움, 새벽 감성이 냉장고 앞으로 데려갑니다. 식단을 바꾸려면 "무엇을 먹느냐"보다 "왜 먹고 싶은가"를 먼저 봐야 합니다. 감정 일기, 따뜻한 차, 잠자리 시간을 앞당기는 것이 어떤 식단표보다 효과가 큽니다.',
  },
  routine: {
    emoji: '⏰',
    name: '칼같은 루틴 식사러',
    tags: ['#같은시간같은메뉴', '#앱기록필수', '#원칙주의', '#흔들리지않음'],
    persona: '신중하고 논리적인 원칙주의자입니다. 돌다리도 두드려보고 건너며, 감정에 휘둘리지 않는 냉철한 판단력을 가졌고 즉흥적인 변경을 싫어합니다. 정해진 일을 묵묵히 해내는 책임감이 강하고, 사람 말보다 데이터와 기록을 믿는 편입니다.',
    style: '매일 같은 시간에 비슷한 것을 먹습니다. 한 번 식단을 정하면 기록 앱에 매일 입력하며 흔들리지 않고 지켜냅니다. 다만 융통성이 부족해 여행이나 외식처럼 루틴이 깨지는 상황에서 스트레스를 받습니다. 예외를 미리 계획에 넣어두면 그 스트레스가 사라집니다.',
  },
  quiet: {
    emoji: '🍵',
    name: '조용한 챙김이',
    tags: ['#남먼저', '#속마음간식', '#조용한결심', '#배려형'],
    persona: '타인의 감정에 민감하고 배려심이 깊은 사람입니다. 나서지 않으면서 뒤에서 묵묵히 챙기고, 남에게 폐 끼치는 것을 극도로 싫어합니다. 겉으로는 부드럽지만 속에는 자기만의 단단한 신념이 있는 외유내강형이라, 한 번 정한 것은 조용히 지킵니다.',
    style: '남이 권하면 거절을 못 해 먹고, 혼자 있을 때는 참아온 것을 조용히 풀어놓듯 먹습니다. 식습관을 바꿀 때는 "나를 위해서"보다 "소중한 사람을 위해서"라는 동기가 훨씬 강하게 작동합니다. 가족, 연인, 아이와 함께하는 건강한 식탁을 목표로 삼으면 누구보다 끈질기게 지켜냅니다.',
  },
};

// 16유형 → 캐릭터 8종 (유형 글자 자체는 화면에 보여주지 않는다)
const TYPE_MAP = {
  ESTP: 'party',       ESFP: 'party',
  ENTP: 'explorer',    ENFP: 'explorer',
  ESTJ: 'commander',   ENTJ: 'commander',
  ESFJ: 'caregiver',   ENFJ: 'caregiver',
  ISTP: 'solo',        ISFP: 'solo',
  INTP: 'philosopher', INFP: 'philosopher',
  ISTJ: 'routine',     INTJ: 'routine',
  INFJ: 'quiet',       ISFJ: 'quiet',
};

// ===== 상태 =====

const $ = (id) => document.getElementById(id);

let step = 0;
let answers = [];

// ===== 채점 =====

function scoreType() {
  const count = {};
  for (const v of answers) count[v] = (count[v] || 0) + 1;

  const pick = (x, y, tieIndex) => {
    const a = count[x] || 0;
    const b = count[y] || 0;
    if (a > b) return x;
    if (b > a) return y;
    return answers[tieIndex];
  };

  return pick('E', 'I', 0) + pick('S', 'N', 3) + pick('T', 'F', 5) + pick('J', 'P', 7);
}

// ===== 화면 전환 =====

function show(name) {
  for (const id of ['screenStart', 'screenQuiz', 'screenResult']) {
    $(id).classList.toggle('hidden', id !== name);
  }
}

function renderQuestion() {
  const item = QUESTIONS[step];
  const card = $('qCard');

  $('qProgressText').textContent = `${step + 1} / ${QUESTIONS.length}`;
  $('qProgressFill').style.width = `${((step + 1) / QUESTIONS.length) * 100}%`;
  $('qNumber').textContent = `Q${step + 1}`;
  $('qText').textContent = item.q;
  $('answerA').textContent = item.a.text;
  $('answerB').textContent = item.b.text;
  $('backBtn').classList.toggle('hidden', step === 0);

  card.classList.remove('card-in');
  void card.offsetWidth;
  card.classList.add('card-in');
}

function choose(which) {
  const item = QUESTIONS[step];
  answers[step] = which === 'a' ? item.a.v : item.b.v;

  if (step < QUESTIONS.length - 1) {
    step += 1;
    renderQuestion();
  } else {
    finish();
  }
}

function goBack() {
  if (step === 0) return;
  step -= 1;
  answers.length = step;
  renderQuestion();
}

// ===== 결과 =====

// 문장 두 개씩 문단으로 나눠 넣는다
function fillParagraphs(el, text) {
  const parts = text.split('. ');
  const sentences = parts.map((s, i) => (i < parts.length - 1 ? s + '.' : s));

  el.textContent = '';
  for (let i = 0; i < sentences.length; i += 2) {
    const p = document.createElement('p');
    p.textContent = sentences.slice(i, i + 2).join(' ');
    el.appendChild(p);
  }
}

function renderResult(type) {
  const key = TYPE_MAP[type];
  if (!key) return false;
  const c = CHARACTERS[key];

  $('resultEmoji').textContent = c.emoji;
  $('resultName').textContent = c.name;
  fillParagraphs($('resultPersona'), c.persona);
  fillParagraphs($('resultStyle'), c.style);

  const tagBox = $('resultTags');
  tagBox.textContent = '';
  for (const t of c.tags) {
    const span = document.createElement('span');
    span.className = 'test-tag';
    span.textContent = t;
    tagBox.appendChild(span);
  }

  $('shareBtn').dataset.type = type;
  $('shareBtn').dataset.name = c.name;
  show('screenResult');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  return true;
}

// 주소에 유형 글자가 그대로 드러나지 않도록 짧은 코드로 바꿔서 주고받는다.
// 값은 한 번 정하면 바꾸지 말 것 — 이미 공유된 링크가 안 열리게 된다.
const RESULT_CODES = {
  ISTJ: 'b3q8k', ISFJ: 'e7t2m', INFJ: 'g2w5c', INTJ: 'j8z3n',
  ISTP: 'm6h9p', ISFP: 'p3k4v', INFP: 'r9n7b', INTP: 'u5c2g',
  ESTP: 'w2p6j', ESFP: 'z8s3q', ENFP: 'c4m9t', ENTP: 'f6b2z',
  ESTJ: 'h9v4d', ESFJ: 'k2g7r', ENFJ: 'n5j8w', ENTJ: 'q7d3m',
};

function codeFor(type) {
  return RESULT_CODES[type] || type;
}

function typeForCode(code) {
  const lower = String(code).toLowerCase();
  for (const t in RESULT_CODES) {
    if (RESULT_CODES[t] === lower) return t;
  }
  return String(code).toUpperCase();  // 코드를 쓰기 전에 공유된 링크도 계속 열리게
}

function finish() {
  const type = scoreType();
  renderResult(type);
  try {
    history.replaceState(null, '', `${location.pathname}?r=${codeFor(type)}`);
  } catch (e) { /* 무시 */ }
}

function restart() {
  step = 0;
  answers = [];
  try { history.replaceState(null, '', location.pathname); } catch (e) { /* 무시 */ }
  show('screenStart');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== 공유 =====

const SITE_URL = 'https://todayquit.com/';

function shareUrlFor(type) {
  const code = codeFor(type);
  if (location.protocol === 'file:') return `${SITE_URL}test-food.html?r=${code}`;
  return `${location.origin}${location.pathname}?r=${code}`;
}

function toast(message) {
  const el = $('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => el.classList.remove('show'), 2200);
}

async function shareResult() {
  const btn = $('shareBtn');
  const type = btn.dataset.type;
  const name = btn.dataset.name;
  const url = shareUrlFor(type);
  const text = `내 식습관 유형은 "${name}"! 너는 어떤 타입이야?`;

  if (navigator.share) {
    try {
      await navigator.share({ title: '식습관 성향 테스트', text, url });
      return;
    } catch (e) {
      if (e && e.name === 'AbortError') return;
    }
  }

  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    toast('결과 링크를 복사했어요');
  } catch (e) {
    toast('복사에 실패했어요. 주소창의 링크를 복사해 주세요');
  }
}

// ===== 시작 =====

$('startBtn').addEventListener('click', () => {
  step = 0;
  answers = [];
  show('screenQuiz');
  renderQuestion();
});

$('answerA').addEventListener('click', () => choose('a'));
$('answerB').addEventListener('click', () => choose('b'));
$('backBtn').addEventListener('click', goBack);
$('retryBtn').addEventListener('click', restart);
$('shareBtn').addEventListener('click', shareResult);

(function initFromUrl() {
  const m = location.search.match(/[?&]r=([A-Za-z0-9]{4,8})/);
  if (m && renderResult(typeForCode(m[1]))) {
    $('sharedNote').classList.remove('hidden');
  } else {
    show('screenStart');
  }
})();
