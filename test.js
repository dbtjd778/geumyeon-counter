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
    persona: '얽매이는 것을 극도로 싫어하고 매 순간의 자유로움과 즉흥적인 삶을 사랑하는 자유영혼입니다. 넘치는 에너지와 타고난 눈치로 어딜 가든 빠르게 적응하며, 복잡하고 골치 아픈 생각보다는 지금 이 순간의 즐거움을 가장 중요하게 여기는 긍정적인 현실주의자입니다. 특유의 친화력으로 사람들을 끌어당기며 지루할 틈을 주지 않는 매력을 가졌습니다.',
    style: '술자리의 조명이 꺼질 때까지 절대 텐션이 떨어지지 않는 인간 에너자이저입니다. 처음 본 사람과도 10분 만에 베스트 프렌드가 되며, 분위기가 살짝 루즈해질 때쯤 기가 막힌 타이밍에 새로운 건배사나 게임을 제안합니다. "딱 한 잔만 더 하자"는 유혹의 주동자이자 막차 시간 따위는 가볍게 무시하고 끝까지 자리를 지키는 진정한 파티의 지배자입니다.',
  },
  train: {
    emoji: '🚂',
    name: '헛소리 폭주 기관차',
    tags: ['#만약에놀이', '#창의적알코올', '#상상력폭발', '#새벽토론'],
    persona: '끝없는 호기심과 풍부한 상상력으로 무장하여 쳇바퀴 같은 일상을 누구보다 지루해하는 창의적인 성격입니다. 머릿속에 새로운 아이디어와 호기심이 끊임없이 샘솟으며, 특유의 열정과 재치 있는 입담으로 주변 사람들에게 긍정적이고 유쾌한 에너지를 전파하는 매력적인 몽상가이자 타고난 분위기 메이커입니다.',
    style: '알코올이 조금만 들어가도 평소에 숨겨두었던 엉뚱함과 상상력이 폭발하기 시작합니다. 남들이 진지한 현실 이야기를 할 때 "만약에 지금 좀비 사태가 터지면 어떻게 할 거야?" 같은 기발한 주제를 던져 술자리를 순식간에 SF 토론장으로 만들어버립니다. 한 번 입이 터지면 우주, 심리, 미래를 넘나드는 무한 수다로 시간 가는 줄 모르게 만드는 재주가 있습니다.',
  },
  chairman: {
    emoji: '📋',
    name: '술자리 총지배인 (체어맨)',
    tags: ['#엔빵의신', '#3차장소선점', '#숙취해소제배분', '#칼같은총무'],
    persona: '체계적이고 계획적인 환경을 선호하며 타고난 리더십으로 상황을 주도하는 것을 즐기는 성격입니다. 모호하고 흐지부지되는 상황을 견디지 못하며, 어떤 목표가 주어지면 가장 빠르고 효율적인 방법을 찾아내어 완벽하게 달성해 내는 엄청난 추진력과 강한 책임감의 아이콘입니다.',
    style: '술자리에서조차 넘치는 리더십과 계획성을 숨기지 못하는 완벽주의 조율자입니다. 모임 전부터 최적의 안주 조합과 2차 장소 동선을 구상해두며, 누군가 취하면 재빠르게 숙취해소제와 물을 챙기는 실세 역할을 톡톡히 합니다. 모임이 끝나면 더치페이 금액을 1원 단위까지 정확히 계산해 계좌번호와 함께 단톡방에 올리는 철두철미함의 끝판왕입니다.',
  },
  fairy: {
    emoji: '✨',
    name: '리액션 만렙 알코올 요정',
    tags: ['#모두의수호천사', '#리액션부자', '#건배사마스터', '#취한사람케어'],
    persona: '타인의 감정에 깊이 공감하고 정이 넘쳐 주변 사람들을 살뜰히 챙기는 따뜻한 성격의 소유자입니다. 사람들 사이의 갈등을 싫어하고 조화로운 관계를 유지하는 데 탁월한 재능이 있으며, 특유의 다정다감함과 센스 있는 눈치 덕분에 어딜 가나 누구에게나 진심으로 사랑받는 호감형 인물입니다.',
    style: '술자리에 있는 모든 사람이 소외당하지 않고 즐거운지 쉴 새 없이 살피는 헌신적인 분위기 메이커입니다. 누군가 이야기를 시작하면 영혼을 듬뿍 담은 폭풍 리액션과 미소로 화자의 기분을 최고조로 끌어올려 줍니다. 취해서 비틀거리는 친구를 부축하고 어색해하는 사람에게 슬쩍 말을 걸어주는 등 당신이 있는 술자리는 늘 훈훈함이 가득합니다.',
  },
  ninja: {
    emoji: '🥷',
    name: '소리 없이 사라지는 귀가 요정',
    tags: ['#닌자퇴근', '#스텔스술꾼', '#구석지키미', '#에너지방전'],
    persona: '타인의 간섭을 싫어하고 나만의 페이스를 유지하며 살아가는 독립적인 마이웨이 성향입니다. 융통성이 있어 웬만한 상황에는 두루두루 잘 맞춰주지만, 온전한 나만의 개인 시간과 에너지가 충분히 충전되어야만 원활한 사회생활이 가능한 효율성 중시형이자 평화주의자입니다.',
    style: '시끌벅적한 술자리의 구석진 자리에서 조용히 사람들을 관찰하며 자신만의 페이스대로 술을 음미하는 것을 즐깁니다. 사람들과 어울리는 것도 좋지만 사회적 에너지 배터리가 일정 수준 이하로 떨어지면 급격히 말수가 줄어듭니다. 그리고 2차나 3차가 시작되어 분위기가 혼란스러워질 때쯤, 아무도 모르게 살짝 택시를 타고 사라지는 완벽한 "스텔스 퇴근"을 선보입니다.',
  },
  whale: {
    emoji: '🐋',
    name: '조용한 술고래',
    tags: ['#알코올스펀지', '#은근한술꾼', '#관조형마니아', '#깊은대화선호'],
    persona: '겉으로는 얌전하고 조용해 보이지만 내면에는 수만 가지 생각과 깊은 철학을 품고 있는 사색가입니다. 자신만의 확고한 가치관과 취향이 있으며, 가벼운 스몰토크나 표면적인 인간관계보다는 소수의 사람과 진솔하고 깊이 있는 교감을 나누는 것을 훨씬 더 가치 있게 여기는 진중한 성격입니다.',
    style: '남들이 술게임에 열중하고 고성을 지를 때도 표정 변화 하나 없이 묵묵히 잔을 비우는데, 이상하게 전혀 취하지 않고 끝까지 살아남는 알코올 무림의 숨은 고수입니다. 시끄러운 분위기보다는 조용한 바나 마음 맞는 소수와의 술자리를 선호하며, 알코올이 들어갈수록 평소에는 하지 않던 진지하고 깊이 있는 인생관 이야기를 흥미롭게 풀어놓습니다.',
  },
  guard: {
    emoji: '🚇',
    name: '철벽의 막차 사수대',
    tags: ['#막차알람설정', '#생존왕', '#내일일정우선', '#절제미학'],
    persona: '매사에 논리적이고 원칙을 중시하며, 돌다리도 여러 번 두들겨보고 건너는 신중하고 철두철미한 성격입니다. 감정에 쉽게 치우치지 않는 객관적인 판단력을 갖추고 있으며, 한 번 세운 계획이나 자신과의 약속은 무슨 일이 있어도 반드시 지켜내는 놀라운 자기 관리 능력을 지녔습니다.',
    style: '아무리 흥겹고 광란의 술자리 분위기 속에서도 자신의 이성과 현실 감각의 끈을 절대 놓지 않는 생존왕입니다. 모임에 참석하기 전부터 이미 막차 시간과 내일의 오전 일정이 완벽하게 계산되어 있습니다. 주변에서 "제발 오늘 한 잔만 더 하자"고 아무리 애원하고 부추겨도, 본인이 정해둔 귀가 시간이 되면 한 치의 흔들림 없이 가방을 챙겨 일어나는 절제력의 끝판왕입니다.',
  },
  healer: {
    emoji: '🫂',
    name: '알코올 힐링 상담사',
    tags: ['#경청의달인', '#휴지챙겨주는사람', '#속마음진행자', '#공감지수100%'],
    persona: '타인의 미세한 감정 변화를 귀신같이 알아채고 상대방의 입장에서 깊이 공감해 주는 섬세한 통찰력의 소유자입니다. 남에게 민폐를 끼치거나 상처를 주는 것을 극도로 조심하며, 겉으로는 부드럽고 한없이 다정해 보이지만 내면에는 자신만의 단단한 신념과 원칙을 품고 있는 외유내강형입니다.',
    style: '신기하게도 당신이 있는 테이블은 어느새 진지하고 훈훈한 "심야 고민 상담소"로 변해버립니다. 특유의 진중하고 따뜻한 경청 태도로 상대방의 무장해제를 유도하여 평소에 하지 못했던 속마음과 슬픔을 털어놓게 만듭니다. 술에 취해 눈물을 쏟는 친구에게 조용히 휴지를 건네주고 손을 꽉 잡아주는, 술자리의 가장 든든하고 따뜻한 정신적 지주입니다.',
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
