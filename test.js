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
    persona: '얽매이는 것을 싫어하고 자유롭고 즉흥적인 삶을 추구합니다. 에너지가 넘치고 눈치가 빨라 어디서든 적응력이 뛰어나며, 복잡한 생각보다는 지금 이 순간의 즐거움을 가장 중요하게 생각하는 긍정적인 현실주의자입니다.',
    style: '조명이 꺼질 때까지 텐션이 안 떨어집니다. 처음 본 사람과도 10분 만에 절친이 되며, 끝까지 자리를 지키는 의리파이자 분위기 메이커입니다.',
  },
  train: {
    emoji: '🚂',
    name: '헛소리 폭주 기관차',
    tags: ['#만약에놀이', '#창의적알코올', '#상상력폭발', '#새벽토론'],
    persona: '호기심이 많고 상상력이 풍부하며 쳇바퀴 같은 일상을 지루해합니다. 새로운 아이디어가 끊임없이 떠오르고 열정적이라 주변에 재미있는 에너지를 전파하는 매력적인 몽상가입니다.',
    style: '술만 들어가면 "만약에 좀비 사태가 터지면..." 같은 엉뚱한 상상 배틀을 엽니다. 남들이 진지할 때 기발한 드립으로 분위기를 터뜨리는 토론의 달인입니다.',
  },
  chairman: {
    emoji: '📋',
    name: '술자리 총지배인 (체어맨)',
    tags: ['#엔빵의신', '#3차장소선점', '#숙취해소제배분', '#칼같은총무'],
    persona: '체계적이고 계획적인 것을 선호하며 리더십이 강합니다. 흐지부지되는 것을 못 참고, 목표를 세우면 빠르고 효율적으로 달성해내는 추진력과 책임감의 아이콘입니다.',
    style: '안주 주문부터 2차 동선, 더치페이 원단위 계산, 귀가 택시 호출까지 모든 판을 짜는 실세입니다. 당신이 없는 술자리는 엉망진창이 되기 십상입니다.',
  },
  fairy: {
    emoji: '✨',
    name: '리액션 만렙 알코올 요정',
    tags: ['#모두의수호천사', '#리액션부자', '#건배사마스터', '#취한사람케어'],
    persona: '타인의 감정에 공감을 잘하고 정이 많아 주변 사람을 살뜰히 챙깁니다. 갈등보다는 조화로운 관계를 중시하며, 특유의 다정함과 눈치로 어딜 가나 사랑받는 인싸 성향입니다.',
    style: '오디오가 비는 꼴을 못 봅니다. 폭풍 리액션으로 분위기를 띄우고, 어색해하는 사람이나 취한 친구를 제일 먼저 케어하는 따뜻한 분위기 메이커입니다.',
  },
  ninja: {
    emoji: '🥷',
    name: '소리 없이 사라지는 귀가 요정',
    tags: ['#닌자퇴근', '#스텔스술꾼', '#구석지키미', '#에너지방전'],
    persona: '독립적이고 간섭받는 것을 싫어합니다. 융통성이 있어 두루두루 잘 지내지만, 나만의 개인 시간과 에너지가 충전되어야만 사회생활이 가능한 효율성 중시형 마이웨이입니다.',
    style: '구석에서 조용히 술을 음미합니다. 에너지가 방전되면 2차 쯤 아무도 모르게 조용히 택시를 타고 사라지는 "닌자 퇴근"의 달인입니다.',
  },
  whale: {
    emoji: '🐋',
    name: '조용한 술고래',
    tags: ['#알코올스펀지', '#은근한술꾼', '#관조형마니아', '#깊은대화선호'],
    persona: '겉으로는 조용하지만 속으로는 수만 가지 생각을 하는 사색가입니다. 자신만의 확고한 철학과 가치관이 있으며, 표면적인 얕은 관계보다는 소수의 사람과 깊이 교감하는 것을 좋아합니다.',
    style: '시끄러운 게임보다는 묵묵히 잔을 비우며 깊은 인생 이야기를 나누길 즐깁니다. 얼굴색 하나 안 변하고 끝까지 살아남는 은근한 무림의 고수입니다.',
  },
  guard: {
    emoji: '🚇',
    name: '철벽의 막차 사수대',
    tags: ['#막차알람설정', '#생존왕', '#내일일정우선', '#절제미학'],
    persona: '논리적이고 원칙을 중시하며 한 번 세운 계획은 무슨 일이 있어도 지켜냅니다. 감정에 치우치지 않는 객관적인 판단력이 뛰어나며, 빈틈없는 철두철미한 성격의 소유자입니다.',
    style: '아무리 신나도 정해둔 막차 시간이 되면 가방을 메고 일어납니다. 주량 조절을 완벽하게 해내어 다음 날 일정에 절대 지장을 주지 않는 절제의 미학을 보여줍니다.',
  },
  healer: {
    emoji: '🫂',
    name: '알코올 힐링 상담사',
    tags: ['#경청의달인', '#휴지챙겨주는사람', '#속마음진행자', '#공감지수100%'],
    persona: '섬세하고 타인의 감정을 귀신같이 읽어내는 통찰력이 있습니다. 남에게 민폐 끼치는 것을 극도로 싫어하며, 겉으로는 따뜻하고 부드럽지만 내면에는 굳건한 신념을 가진 외유내강형입니다.',
    style: '어느새 술자리를 "고민 상담소"로 만듭니다. 취해서 우는 친구에게 휴지를 건네주고 속마음을 들어주는 든든한 정신적 지주 역할을 합니다.',
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
// 도메인이 바뀌면 여기를 고칠 것.
const SITE_URL = 'https://todayquit.com/';

function shareUrlFor(type) {
  if (location.protocol === 'file:') return `${SITE_URL}test.html?r=${type}`;
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
