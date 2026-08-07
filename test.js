'use strict';

// ===== 질문 =====
// axis: 어느 지표를 재는지, a/b: 각 선택지가 가리키는 글자

const QUESTIONS = [
  {
    axis: 'EI',
    q: '금요일 밤, 술자리 약속 제안이 들어왔다',
    a: { text: '무조건 가지! 오늘 끝까지 달린다', v: 'E' },
    b: { text: '"누구 오는데...?" 소수 모임 아니면 고민', v: 'I' },
  },
  {
    axis: 'EI',
    q: '술자리가 2차, 3차로 이어지며 달아오를 때',
    a: { text: '분위기 주도하며 계속 달린다', v: 'E' },
    b: { text: '에너지가 떨어져 조용히 잔만 비운다', v: 'I' },
  },
  {
    axis: 'EI',
    q: '옆 테이블이 엄청 재미있게 놀고 있다',
    a: { text: '자연스럽게 건배하거나 말을 튼다', v: 'E' },
    b: { text: '어색하게 웃고 우리 테이블에 집중', v: 'I' },
  },
  {
    axis: 'SN',
    q: '메뉴판을 볼 때',
    a: { text: '대표 메뉴와 인스타 후기부터 검색', v: 'S' },
    b: { text: '특이하고 신기한 메뉴에 도전', v: 'N' },
  },
  {
    axis: 'SN',
    q: '술자리에서 주로 하는 대화 주제',
    a: { text: '최근 있었던 일, 연예인 이슈, 현실 이야기', v: 'S' },
    b: { text: '"만약에~" 로또 1등이나 엉뚱한 상상', v: 'N' },
  },
  {
    axis: 'TF',
    q: '친구가 힘들다며 울기 시작했다',
    a: { text: '무슨 일인지 원인을 파악하고 해결책을 묻는다', v: 'T' },
    b: { text: '일단 안아주고 같이 울어주며 공감한다', v: 'F' },
  },
  {
    axis: 'TF',
    q: '취한 친구가 같은 말을 5번째 반복한다',
    a: { text: '"그거 벌써 다섯 번째야"라고 지적한다', v: 'T' },
    b: { text: '영혼 없어도 계속 맞장구쳐 준다', v: 'F' },
  },
  {
    axis: 'JP',
    q: '술자리에 나가기 전',
    a: { text: '차편, 내일 일정, 숙취해소제까지 준비 완료', v: 'J' },
    b: { text: '일단 생각 없이 나간다', v: 'P' },
  },
  {
    axis: 'JP',
    q: '막차 15분 전, "한 잔만 더 하자"',
    a: { text: '칼같이 거절하고 막차 타러 뛴다', v: 'J' },
    b: { text: '"첫차 타지 뭐!" 자리에 다시 앉는다', v: 'P' },
  },
  {
    axis: 'JP',
    q: '다음 날 숙취 상황',
    a: { text: '미리 준비해둔 해장 루틴을 실행한다', v: 'J' },
    b: { text: '침대에 누워 하루 종일 배달 앱만 뒤적인다', v: 'P' },
  },
];

// ===== 결과 캐릭터 =====

const CHARACTERS = {
  party: {
    emoji: '🔥',
    name: '광란의 3차 지배자',
    tags: ['#텐션폭발', '#오늘만사는자', '#분위기치트키', '#막차포기'],
    desc: '당신은 술자리의 조명이 꺼질 때까지 텐션이 떨어지지 않는 인간 에너자이저입니다. 시끌벅적하고 활기찬 분위기에서 진가를 발휘하며, 처음 본 사람과도 10분 만에 베스트 프렌드가 되는 인싸력을 가졌습니다. 특유의 순발력과 흥으로 분위기를 반전시키는 능력이 탁월하며, "딱 한 잔만 더 하자"는 유혹의 주동자이자 끝까지 자리를 지키는 의리파입니다. 복잡한 생각보다는 지금 이 순간의 즐거움을 가장 중요하게 생각합니다.',
  },
  train: {
    emoji: '🚂',
    name: '헛소리 폭주 기관차',
    tags: ['#만약에놀이', '#창의적알코올', '#상상력폭발', '#새벽토론'],
    desc: '술만 들어갔다 하면 평소에 숨겨둔 창의력과 엉뚱함이 폭발하는 타입입니다. 보통 사람들은 생각지도 못한 "만약에 말이야..." 질문을 던지며 술자리를 순식간에 SF 토론장이나 상상력 배틀장으로 만들어버립니다. 남들이 진지한 이야기로 분위기가 다운될 때도 어디선가 기발한 드립을 던져 분위기를 빵 터뜨리며, 한 번 입이 터지면 우주, 로또, 미래 도시, 연애관을 넘나드는 무한 수다를 이어갑니다.',
  },
  chairman: {
    emoji: '📋',
    name: '술자리 총지배인 (체어맨)',
    tags: ['#엔빵의신', '#3차장소선점', '#숙취해소제배분', '#칼같은총무'],
    desc: '술자리에서도 리더십과 계획성을 숨기지 못하는 완벽주의 조율자입니다. 모임이 시작되기 전부터 안주 주문, 2차 장소 예약, 인원수 대비 합리적인 메뉴 구성까지 머릿속으로 구상을 마칩니다. 누군가 술을 너무 많이 마시면 칼같이 물과 숙취해소제를 챙겨주고, 이동할 때도 택시를 빠르게 호출하는 등 전체적인 판을 짜는 실세 역할을 합니다. 더치페이 계산도 원단위까지 정확하게 계산하는 철두철미함을 자랑합니다.',
  },
  fairy: {
    emoji: '✨',
    name: '리액션 만렙 알코올 요정',
    tags: ['#모두의수호천사', '#리액션부자', '#건배사마스터', '#취한사람케어'],
    desc: '술자리에 있는 모든 이들이 소외당하지 않고 즐거운지 살피는 다정다감한 분위기 메이커입니다. 누구 한 명이 말을 시작하면 영혼을 담은 맞장구와 미소로 상대방의 기분을 최상으로 만들어줍니다. 취해서 비틀거리는 친구가 있으면 제일 먼저 챙기고, 어색해하는 사람이 있으면 슬쩍 말을 걸어 분위기에 적응하도록 돕습니다. 술자리의 조화와 유대감을 중요시합니다.',
  },
  ninja: {
    emoji: '🥷',
    name: '소리 없이 사라지는 귀가 요정',
    tags: ['#닌자퇴근', '#스텔스술꾼', '#구석지키미', '#에너지방전'],
    desc: '술자리의 구석진 자리에서 조용히 자신의 페이스대로 술을 즐기는 마이웨이 스타일입니다. 남들이 게임을 하거나 소리를 지르며 신나게 놀 때도 은은한 미소를 지으며 잔을 비우는 내공을 가졌습니다. 사회적 에너지 배터리가 일정 수준 이하로 떨어지면 2차나 3차가 시작될 즈음 아무도 모르게 살짝 조용히 택시를 타고 사라지는 "스텔스 퇴근"의 달인입니다.',
  },
  whale: {
    emoji: '🐋',
    name: '조용한 술고래',
    tags: ['#알코올스펀지', '#은근한술꾼', '#관조형마니아', '#깊은대화선호'],
    desc: '표정 변화 없이 묵묵히 잔을 비우는데 이상하게 전혀 취하지 않고 끝까지 살아남는 알코올의 숨은 고수입니다. 소란스러운 분위기보다는 조용한 바나 마음 맞는 사람 몇몇과 나누는 깊은 대화를 선호합니다. 남들이 분위기에 취해 고성을 지를 때도 한 걸음 떨어져 상황을 재미있게 관찰하며, 술이 들어갈수록 평소에는 하지 않던 진솔하고 깊이 있는 인생관이나 철학적인 이야기를 풀어놓습니다.',
  },
  guard: {
    emoji: '🚇',
    name: '철벽의 막차 사수대',
    tags: ['#막차알람설정', '#생존왕', '#내일일정우선', '#절제미학'],
    desc: '어떤 흥겨운 분위기 속에서도 자신의 이성과 현실 감각을 놓지 않는 철두철미한 자기관리의 아이콘입니다. 술자리에 참석하기 전부터 이미 막차 시간, 택시 비용, 내일의 오전 일정까지 완벽히 계산되어 있습니다. 아무리 주변에서 "오늘 한 잔만 더 하자!"라며 애원해도, 본인이 정해둔 시간이 되면 흔들림 없이 가방을 싸서 일어납니다. 다음 날 숙취 없이 개운하게 일상을 시작하는 이성적인 인물입니다.',
  },
  healer: {
    emoji: '🫂',
    name: '알코올 힐링 상담사',
    tags: ['#경청의달인', '#휴지챙겨주는사람', '#속마음진행자', '#공감지수100%'],
    desc: '술자리가 어느새 "고민 상담소"로 변하게 만드는 마성의 감성 소유자입니다. 특유의 진중하고 따뜻한 태도로 상대방의 속마음을 자극하여, 평소에 하지 못했던 고민이나 슬픔을 털어놓게 만드는 진실된 매력이 있습니다. 술에 취해 눈물을 글썽이는 친구가 있으면 말없이 휴지를 건네주고 손을 잡아주며 깊은 공감을 보내주는 든든한 정신적 지주입니다.',
  },
};

// MBTI 16유형 → 캐릭터 8종
const TYPE_MAP = {
  ESTP: 'party',    ESFP: 'party',
  ENTP: 'train',    ENFP: 'train',
  ESTJ: 'chairman', ENTJ: 'chairman',
  ESFJ: 'fairy',    ENFJ: 'fairy',
  ISTP: 'ninja',    ISFP: 'ninja',
  INTP: 'whale',    INFP: 'whale',
  ISTJ: 'guard',    INTJ: 'guard',
  INFJ: 'healer',   ISFJ: 'healer',
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
  $('resultMbti').textContent = type;
  $('resultDesc').textContent = c.desc;

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

function shareUrlFor(type) {
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
  const text = `술자리에서 나는 "${name}"! 너는 어떤 타입이야?`;

  // 모바일에서는 시스템 공유창(카톡·문자·인스타 등)이 뜬다
  if (navigator.share) {
    try {
      await navigator.share({ title: '술자리 성격 테스트', text, url });
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
