'use strict';

// ===== 질문 =====
// axis: 어느 지표를 재는지, a/b: 각 선택지가 가리키는 글자

const QUESTIONS = [
  {
    axis: 'EI',
    q: '내가 선호하는 담타 분위기는',
    a: { text: '동료들과 시끌벅적 수다 떨며 피우기', v: 'E' },
    b: { text: '사람 없는 한적한 곳에서 혼자 피우기', v: 'I' },
  },
  {
    axis: 'EI',
    q: '금연을 시작한다면 그 사실을',
    a: { text: '주변과 SNS에 대대적으로 공표한다', v: 'E' },
    b: { text: '굳이 말 안 하고 조용히 혼자 시작한다', v: 'I' },
  },
  {
    axis: 'EI',
    q: '담배가 가장 피우고 싶어지는 순간',
    a: { text: '모임이나 술자리에서 다 같이 나갈 때', v: 'E' },
    b: { text: '혼자 방에 있거나 새벽에 멍때릴 때', v: 'I' },
  },
  {
    axis: 'SN',
    q: '금연할 때 입과 손이 허전하면',
    a: { text: '껌, 사탕, 은단 같은 즉각적인 대체재', v: 'S' },
    b: { text: '금연 책 읽기, 맑은 폐 상상, 마인드 컨트롤', v: 'N' },
  },
  {
    axis: 'SN',
    q: '내가 담배를 피우는 진짜 이유는',
    a: { text: '식후의 개운함, 타격감 같은 실제 감각', v: 'S' },
    b: { text: '아이디어를 떠올리고 머리를 식히는 시간', v: 'N' },
  },
  {
    axis: 'TF',
    q: '스트레스로 딱 한 대가 당길 때 드는 생각',
    a: { text: '"지금 피우면 참은 날짜랑 돈이 날아가서 손해다"', v: 'T' },
    b: { text: '"오늘 너무 힘들었는데 딱 한 대로 위로받자..."', v: 'F' },
  },
  {
    axis: 'TF',
    q: '같이 금연하던 친구가 담배를 입에 물었다',
    a: { text: '"지금 피우면 또 실패야. 독약이니까 집어넣어"', v: 'T' },
    b: { text: '"진짜 힘들었구나ㅠㅠ 얼마나 버티기 힘들었으면"', v: 'F' },
  },
  {
    axis: 'JP',
    q: '금연을 시작하는 타이밍은',
    a: { text: '새해나 월요일처럼 명확한 D-Day를 지정', v: 'J' },
    b: { text: '갑자기 맛없어져서 지금 이 순간부터 바로', v: 'P' },
  },
  {
    axis: 'JP',
    q: '남은 담배와 라이터를 어떻게 할까',
    a: { text: '미련 없이 쓰레기통에 폐기한다', v: 'J' },
    b: { text: '불안해서 서랍 깊숙이 비상용으로 보관', v: 'P' },
  },
  {
    axis: 'JP',
    q: '금연에 실패했을 때 나의 반응',
    a: { text: '원인을 분석하고 다음 시작일을 캘린더에 적는다', v: 'J' },
    b: { text: '에라 모르겠다, 다음 달에 다시 하지 뭐', v: 'P' },
  },
];

// ===== 결과 캐릭터 =====

const CHARACTERS = {
  speed: {
    emoji: '🎉',
    name: '파티형 스피드 스모커',
    tags: ['#담타인싸', '#즉흥금연', '#식후땡필수', '#놀면서피움'],
    persona: '구속받는 것을 싫어하고 현재의 즐거움에 충실한 자유영혼입니다. 어디서나 적응이 빠르고 에너지가 넘치며, 사람들과 어울려 노는 것을 진심으로 사랑하는 활동적인 성격입니다. 딱딱한 분위기보다는 즉흥적이고 유연한 상황을 선호하며, 특유의 재치와 순발력으로 주변 사람들을 즐겁게 만드는 매력이 있습니다.',
    style: '담배 맛 그 자체보다는 "다 같이 모여 수다를 떠는 흡연구역의 분위기"를 사랑합니다. 남들이 담배를 피우러 갈 때 혼자 남겨지는 것을 아쉬워하는 경향이 있습니다. "나 오늘부터 금연!"이라며 즉흥적으로 호기롭게 시작하지만, 술자리나 모임에서 친구들의 유혹을 받으면 "오늘까지만 피운다"며 가장 쉽게 무너지는 타입입니다.',
  },
  idea: {
    emoji: '💡',
    name: '아이디어 폭발 스모커',
    tags: ['#사색의연기', '#아이디어뱅크', '#만약에금연', '#작심삼일천재'],
    persona: '호기심 천국에 아이디어가 샘솟는 창의적인 성격입니다. 매일 똑같이 쳇바퀴 도는 지루한 일상을 견디기 힘들어하며, 새로운 것에 도전할 때 가장 눈빛이 반짝이는 열정적인 사람입니다. 다방면에 관심이 많아 대화를 주도하며, 번뜩이는 영감과 재치 있는 언변으로 주변을 놀라게 하는 매력적인 몽상가입니다.',
    style: '혼자만의 흡연 시간을 "사색하고 아이디어를 구상하는 브레인스토밍 시간"으로 여깁니다. 머리가 복잡하거나 작업이 막힐 때 습관적으로 담배를 찾으며 환기구를 뚫으려 합니다. 기발하고 독특한 금연법을 찾아내 열정적으로 시도하지만, 금연 과정 자체가 지루해지거나 창작의 고통이 찾아오면 다시 담배의 유혹에 빠지기 쉽습니다.',
  },
  commander: {
    emoji: '🎖️',
    name: '철혈의 금연 지휘관',
    tags: ['#디데이칼각', '#보조제풀세팅', '#금연성공률1위', '#계산기두드림'],
    persona: '체계적이고 목표 지향적인 타고난 리더 타입입니다. 감정에 휘둘리기보다는 효율성과 논리를 중시하며, 한 번 결심한 일은 끝을 보고야 마는 강력한 추진력을 가졌습니다. 자기 관리가 철저하고 계획이 틀어지는 것을 싫어하며, 주변 상황을 통제하고 이끄는 데에서 큰 성취감을 느끼는 원칙주의자입니다.',
    style: '금연조차 하나의 완벽한 비즈니스 프로젝트처럼 다루는 스타일입니다. 금연 디데이를 정확히 설정하고, 껌이나 패치 같은 보조제를 풀세팅한 뒤 잃게 될 기회비용(건강 수치, 담뱃값)을 철저히 계산합니다. "흡연은 비효율적이고 백해무익하다"는 논리가 머리에 박히면 무서운 의지력과 실행력으로 단숨에 끊어내는 금연 성공률 1위 유형입니다.',
  },
  hub: {
    emoji: '🤝',
    name: '담타 네트워크 허브',
    tags: ['#담타소통왕', '#모두의금연메이트', '#위로와수다', '#같이끊자'],
    persona: '공감 능력이 뛰어나고 인류애가 넘치는 따뜻한 성격의 소유자입니다. 갈등을 피하고 조화를 중시하며, 주변 사람들이 편안하고 행복해하는 모습에서 큰 에너지를 얻습니다. 타인의 감정을 잘 읽고 배려심이 깊어, 어느 모임에 가든 사람들을 챙기고 다독이는 다정다감한 조력자 역할을 도맡아 합니다.',
    style: '이들에게 흡연구역은 단순한 장소가 아니라 중요한 정보 교류와 소통의 장소입니다. 나 혼자 금연을 선언하면 무리에서 소외되거나 대화에 끼지 못할까 봐 내심 두려워하는 경향이 있습니다. 따라서 혼자 참기보다는 주변 직장 동료나 친구들을 적극적으로 설득해 "우리 다 같이 끊어보자!"며 단체 금연 챌린지를 주도할 때 성공 확률이 급격히 올라갑니다.',
  },
  stealth: {
    emoji: '🥷',
    name: '골목길 스텔스 스모커',
    tags: ['#조용한흡연', '#내페이스대로', '#혼자피는게낙', '#귀찮아서금연'],
    persona: '남의 눈치를 보지 않고 묵묵히 내 갈 길을 가는 독립적인 마이웨이 성향입니다. 타인이 내 개인적인 영역이나 시간을 침범하는 것을 매우 싫어하며, 복잡한 규칙에 얽매이기보다 상황에 유연하게 대처하는 능력이 뛰어납니다. 평소에는 조용하고 무심해 보이지만, 본인이 좋아하는 관심사에는 엄청난 집중력을 발휘합니다.',
    style: '복잡한 곳을 피해 한적한 골목이나 구석에서 조용히 담배를 피우며 온전한 혼자만의 휴식을 즐깁니다. 남이 건강을 핑계로 끊으라고 잔소리하면 반발심에 오히려 더 안 끊는 청개구리 기질이 있습니다. 하지만 어느 날 냄새가 유독 싫어지거나 담배 사러 나가는 것조차 귀찮아지면, 누구에게도 말하지 않고 문득 스스로 가위로 담배를 잘라버리고 쿨하게 끊어냅니다.',
  },
  philosopher: {
    emoji: '🌙',
    name: '고민하는 철학자 스모커',
    tags: ['#새벽감성', '#생각정리용', '#스트레스취약', '#고민많은연기'],
    persona: '깊은 내면세계를 지니고 있으며 끊임없이 생각에 잠기는 철학자 스타일입니다. 타인의 무심한 말에도 쉽게 상처를 받고 감정의 파도를 겪을 만큼 섬세하고 예민한 멘탈을 가졌습니다. 겉보기에는 차분해 보여도 머릿속은 수만 가지 생각과 고뇌로 복잡하며, 진정성 있는 가치와 이상을 좇는 낭만주의자입니다.',
    style: '모두가 잠든 새벽 감성이나 인간관계에서 심한 스트레스를 받을 때, 피어오르는 담배 연기를 마음의 도피처로 삼는 감성파 흡연자입니다. 멘탈이 흔들리거나 극심한 우울감이 찾아올 때 금연 결심이 가장 쉽게 무너집니다. 성공적인 금연을 위해서는 단순히 담배를 참는 것을 넘어, 스트레스를 건강하게 해소할 심리적 안정과 힐링 수단이 반드시 동반되어야 합니다.',
  },
  data: {
    emoji: '📊',
    name: '칼같은 데이터 금연가',
    tags: ['#앱기록필수', '#통계적접근', '#원칙주의자', '#철벽의인내'],
    persona: '돌다리도 여러 번 두들겨 보고 건너는 매우 신중하고 논리적인 원칙주의자입니다. 감정에 쉽게 흔들리지 않는 냉철한 판단력을 갖추고 있으며, 한 번 정해진 일은 묵묵하고 성실하게 해내는 강한 책임감을 가졌습니다. 뜬구름 잡는 소리보다는 확실한 사실, 통계, 데이터에 기반하여 의사결정을 내리는 것을 선호합니다.',
    style: '평소에도 정해진 시간이나 특정 루틴(식후, 기상 직후 등)에 맞춰 매우 규칙적으로 흡연하는 타입입니다. 한 번 금연을 결심하면 금연 앱을 설치해 카운팅되는 금연 일수, 아낀 금액의 누적 액수, 폐 기능 회복 수치 등의 정확한 데이터를 매일 꼼꼼하게 확인합니다. 이러한 시각적 통계 수치들이 이성적인 방어벽을 쳐주기 때문에 충동적인 흡연 욕구를 훌륭하게 통제해 냅니다.',
  },
  healer: {
    emoji: '🫂',
    name: '멘탈케어 힐링 스모커',
    tags: ['#속마음정리', '#휴식의수단', '#상처치유용', '#조용한결단'],
    persona: '타인의 감정에 매우 민감하게 반응하며 남을 먼저 생각하는 이타적이고 배려심 깊은 성격입니다. 자신이 눈에 띄게 나서기보다는 뒤에서 묵묵히 사람들을 챙기고 헌신하는 따뜻한 마음씨를 지녔습니다. 타인에게 폐를 끼치는 것을 극도로 경계하며, 겉으로는 한없이 부드러워 보이지만 내면에는 자신만의 굳건한 신념을 간직한 외유내강형입니다.',
    style: '비흡연자에게 담배 냄새로 불쾌감을 주지 않기 위해 가글이나 향수, 손 세정제를 철저히 챙기는 매너형 흡연자입니다. 주로 과중한 책임감이나 혼자 감당해야 할 스트레스를 삭이기 위해 조용히 담배를 태웁니다. 자신을 위한 금연보다 "내가 건강해야 사랑하는 가족과 연인을 지킬 수 있다"는 이타적이고 헌신적인 동기가 부여될 때 가장 강력하고 끈질긴 인내력을 발휘합니다.',
  },
};

// 16유형 → 캐릭터 8종 (유형 글자 자체는 화면에 보여주지 않는다)
const TYPE_MAP = {
  ESTP: 'speed',       ESFP: 'speed',
  ENTP: 'idea',        ENFP: 'idea',
  ESTJ: 'commander',   ENTJ: 'commander',
  ESFJ: 'hub',         ENFJ: 'hub',
  ISTP: 'stealth',     ISFP: 'stealth',
  INTP: 'philosopher', INFP: 'philosopher',
  ISTJ: 'data',        INTJ: 'data',
  INFJ: 'healer',      ISFJ: 'healer',
};

// ===== 상태 =====

const $ = (id) => document.getElementById(id);

let step = 0;              // 지금 몇 번째 질문인지
let answers = [];          // 각 문항에서 고른 글자

// ===== 채점 =====

function scoreType() {
  const count = {};
  for (const v of answers) count[v] = (count[v] || 0) + 1;

  const pick = (x, y, tieIndex) => {
    const a = count[x] || 0;
    const b = count[y] || 0;
    if (a > b) return x;
    if (b > a) return y;
    // 문항이 2개인 지표는 1:1로 갈릴 수 있다. 그때는 그 지표의
    // 첫 번째 질문에서 고른 쪽을 따른다.
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

  // 카드가 매번 새로 등장하도록 애니메이션을 다시 태운다
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

// 설명이 길어서 한 덩어리로 두면 벽처럼 보인다. 문장 두 개씩 묶어
// 문단으로 나눠 넣는다. (마침표 뒤 공백만 자르므로 "...할 거야?" 같은
// 인용부호 안의 물음표에서는 끊기지 않는다.)
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
  ISTJ: 'c8v3n', ISFJ: 'f2j7q', INFJ: 'h5m9b', INTJ: 'k9p4w',
  ISTP: 'n3s8d', ISFP: 'q7z2g', INFP: 't4b6r', INTP: 'w8h3k',
  ESTP: 'z2n5m', ESFP: 'd6q9v', ENFP: 'g3t7p', ENTP: 'j7w2c',
  ESTJ: 'm4d8s', ESFJ: 'p9g5z', ENFJ: 's2k3h', ENTJ: 'v5r9t',
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
  // 공유하거나 새로고침해도 같은 결과가 유지되도록 주소에 남긴다
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

// 앱(file://)에서 공유하면 로컬 경로가 나가버리므로 그때는 이 주소를 쓴다.
const SITE_URL = 'https://todayquit.com/';

function shareUrlFor(type) {
  const code = codeFor(type);
  if (location.protocol === 'file:') return `${SITE_URL}test-smoke.html?r=${code}`;
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
  const text = `내 금연 성향은 "${name}"! 너는 어떤 타입이야?`;

  // 모바일에서는 시스템 공유창(카톡·문자·인스타 등)이 뜬다
  if (navigator.share) {
    try {
      await navigator.share({ title: '흡연 & 금연 성향 테스트', text, url });
      return;
    } catch (e) {
      if (e && e.name === 'AbortError') return;  // 사용자가 닫은 경우
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

// 공유받은 링크로 들어온 경우 결과부터 보여준다
(function initFromUrl() {
  const m = location.search.match(/[?&]r=([A-Za-z0-9]{4,8})/);
  if (m && renderResult(typeForCode(m[1]))) {
    $('sharedNote').classList.remove('hidden');
  } else {
    show('screenStart');
  }
})();
