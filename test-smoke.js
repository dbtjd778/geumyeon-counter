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
    persona: '구속받는 것을 싫어하고 현재의 즐거움에 충실한 자유영혼입니다. 어디서나 적응이 빠르고 에너지가 넘치며, 사람들과 어울려 노는 것을 사랑하는 활동적인 성격입니다.',
    style: '담배 맛보다 "다 같이 담타를 갖는 분위기" 자체를 사랑합니다. 즉흥적으로 금연을 시작하지만 술자리 유혹에 가장 약합니다.',
  },
  idea: {
    emoji: '💡',
    name: '아이디어 폭발 스모커',
    tags: ['#사색의연기', '#아이디어뱅크', '#만약에금연', '#작심삼일천재'],
    persona: '호기심 천국에 아이디어가 샘솟는 창의적인 성격입니다. 쳇바퀴 도는 일상을 싫어하며 새로운 것에 도전할 때 가장 눈빛이 반짝이는 열정적인 사람입니다.',
    style: '흡연 시간을 "사색과 아이디어 구상의 시간"으로 여깁니다. 기발한 금연법을 찾아내 시도하지만 지루해지면 금방 담배를 찾습니다.',
  },
  commander: {
    emoji: '🎖️',
    name: '철혈의 금연 지휘관',
    tags: ['#디데이칼각', '#보조제풀세팅', '#금연성공률1위', '#계산기두드림'],
    persona: '체계적이고 목표 지향적인 리더 타입입니다. 감정에 휘둘리기보다는 효율성을 중시하며, 한 번 결심한 일은 끝을 보는 강력한 추진력을 가졌습니다.',
    style: '금연조차 완벽한 프로젝트로 봅니다. 디데이를 정하고 보조제 풀세팅 후 잃게 될 기회비용(건강, 돈)을 철저히 계산하여 무서운 의지력으로 끊어냅니다.',
  },
  hub: {
    emoji: '🤝',
    name: '담타 네트워크 허브',
    tags: ['#담타소통왕', '#모두의금연메이트', '#위로와수다', '#같이끊자'],
    persona: '공감 능력이 높고 인류애가 넘칩니다. 갈등을 싫어하며 주변 사람들이 편안하고 행복해하는 모습에서 큰 에너지를 얻는 다정다감한 성격입니다.',
    style: '흡연구역이 곧 정보 교류와 소통의 장입니다. 나 혼자 금연하면 무리에서 소외될까 걱정하므로, 주변을 설득해 다 같이 끊는 챌린지를 선호합니다.',
  },
  stealth: {
    emoji: '🥷',
    name: '골목길 스텔스 스모커',
    tags: ['#조용한흡연', '#내페이스대로', '#혼자피는게낙', '#귀찮아서금연'],
    persona: '남의 눈치를 보지 않고 내 갈 길을 가는 독립적인 마이웨이 성향입니다. 개인적인 영역을 침범당하는 것을 싫어하며, 상황에 유연하게 대처하는 능력이 뛰어납니다.',
    style: '한적한 곳에서 조용히 담배를 피우며 쉬는 것을 좋아합니다. 남이 끊으라고 잔소리하면 오히려 안 끊고, 담배 사러 가기 귀찮아지면 문득 스스로 끊어버립니다.',
  },
  philosopher: {
    emoji: '🌙',
    name: '고민하는 철학자 스모커',
    tags: ['#새벽감성', '#생각정리용', '#스트레스취약', '#고민많은연기'],
    persona: '깊은 내면세계를 지닌 철학자 스타일입니다. 타인의 말에 상처를 잘 받고 생각과 고민이 많아 겉보기와 달리 속이 복잡할 때가 많은 섬세한 성격입니다.',
    style: '새벽 감성이나 심한 스트레스가 올 때 담배를 마음의 도피처로 삼습니다. 금연 중 멘탈이 흔들리면 쉽게 무너지므로 심리적 안정이 필수입니다.',
  },
  data: {
    emoji: '📊',
    name: '칼같은 데이터 금연가',
    tags: ['#앱기록필수', '#통계적접근', '#원칙주의자', '#철벽의인내'],
    persona: '돌다리도 두들겨 보고 건너는 신중하고 논리적인 원칙주의자입니다. 감정에 치우치지 않는 냉철한 판단력과 주어진 일을 묵묵히 해내는 강한 책임감을 가졌습니다.',
    style: '정해진 루틴에 따라 흡연하다가 금연을 결심하면 금연 일수, 아낀 돈, 폐 회복 수치 등 데이터를 확인하며 이성적인 방어벽을 칩니다.',
  },
  healer: {
    emoji: '🫂',
    name: '멘탈케어 힐링 스모커',
    tags: ['#속마음정리', '#휴식의수단', '#상처치유용', '#조용한결단'],
    persona: '타인의 감정에 민감하고 배려심이 깊습니다. 나서지 않으면서도 뒤에서 묵묵히 남을 챙기는 따뜻한 마음씨를 가졌으며, 남에게 피해 주는 것을 극도로 경계합니다.',
    style: '혼자 스트레스를 삭이거나 상처를 치유하기 위해 조용히 담배를 태웁니다. 나 자신보다 사랑하는 사람들의 건강을 위해 끊어야겠다는 이타적인 동기가 가장 크게 작용합니다.',
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

function renderResult(type) {
  const key = TYPE_MAP[type];
  if (!key) return false;
  const c = CHARACTERS[key];

  $('resultEmoji').textContent = c.emoji;
  $('resultName').textContent = c.name;
  $('resultPersona').textContent = c.persona;
  $('resultStyle').textContent = c.style;

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

function finish() {
  const type = scoreType();
  renderResult(type);
  // 공유하거나 새로고침해도 같은 결과가 유지되도록 주소에 남긴다
  try {
    history.replaceState(null, '', `${location.pathname}?r=${type}`);
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
  if (location.protocol === 'file:') return `${SITE_URL}test-smoke.html?r=${type}`;
  return `${location.origin}${location.pathname}?r=${type}`;
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
  const m = location.search.match(/[?&]r=([A-Za-z]{4})/);
  if (m && renderResult(m[1].toUpperCase())) {
    $('sharedNote').classList.remove('hidden');
  } else {
    show('screenStart');
  }
})();
