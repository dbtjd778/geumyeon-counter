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
    desc: '사람들과 어울리는 자리나 술자리에서 담배를 가장 맛있게 태우는 본능적인 타입입니다. 담배 맛 자체보다 사람들과 수다 떠는 분위기를 즐깁니다. 혼자 참기보다는 친구들과 금연 내기를 하거나 SNS에 인증하는 방식이 가장 효과적입니다.',
    tip: '술자리 담타 시간에 따라나가지 말고 물 마시며 자리 지키기.',
  },
  idea: {
    emoji: '💡',
    name: '아이디어 폭발 스모커',
    tags: ['#사색의연기', '#아이디어뱅크', '#만약에금연', '#작심삼일천재'],
    desc: '담배를 피우며 기발한 상상을 하거나 엉뚱한 아이디어를 정리하는 사색형 흡연자입니다. 금연을 결심할 때도 온갖 독특한 방법을 시도하지만 지루해지면 다시 손을 대곤 합니다.',
    tip: '담배 대신 손가락 퍼즐, 타자 연습기, 드로잉 등 뇌와 손을 자극하는 취미 찾기.',
  },
  commander: {
    emoji: '🎖️',
    name: '철혈의 금연 지휘관',
    tags: ['#디데이칼각', '#보조제풀세팅', '#금연성공률1위', '#계산기두드림'],
    desc: '금연을 하나의 완벽한 프로젝트로 바라보는 냉철한 전략가입니다. 시작일을 정하면 금연 껌, 패치, 아낀 돈 계산기 앱까지 풀세팅합니다. 논리적 이득을 계산해 무서운 의지력으로 밀어붙입니다.',
    tip: '아낀 담뱃값으로 주식이나 적금을 매달 자동이체하여 시각적 성과 확인하기.',
  },
  hub: {
    emoji: '🤝',
    name: '담타 네트워크 허브',
    tags: ['#담타소통왕', '#모두의금연메이트', '#위로와수다', '#같이끊자'],
    desc: '흡연구역에서 동료들의 고민을 들어주고 친목을 다지는 마당발입니다. 소외감을 줄이기 위해 주변 사람들을 포섭해 "함께하는 금연 챌린지"를 주도할 때 가장 성공률이 높습니다.',
    tip: '마음 맞는 친구나 직장 동료와 함께 1일 1인증 금연 스터디 만들기.',
  },
  stealth: {
    emoji: '🥷',
    name: '골목길 스텔스 스모커',
    tags: ['#조용한흡연', '#내페이스대로', '#혼자피는게낙', '#귀찮아서금연'],
    desc: '구석진 곳에서 조용히 자기만의 시간을 즐기는 마이웨이 스타일입니다. 잔소리에는 반발하지만 담배 사러 가기 귀찮아지거나 냄새가 싫어지면 문득 쿨하게 끊어버립니다.',
    tip: '집안에 있는 라이터와 재떨이를 전부 버리고 게임이나 영화에 몰입하기.',
  },
  philosopher: {
    emoji: '🌙',
    name: '고민하는 철학자 스모커',
    tags: ['#새벽감성', '#생각정리용', '#스트레스취약', '#고민많은연기'],
    desc: '감정 기복이나 고뇌가 찾아올 때 담배로 속마음을 달래는 감성파입니다. 새벽에 혼자 피우는 담배를 위로로 여깁니다. 멘탈 관리가 핵심이며 따뜻한 차나 일기 쓰기가 도움이 됩니다.',
    tip: '담배 생각이 날 때마다 감정 일기 쓰기나 아로마 오일 향 맡기.',
  },
  data: {
    emoji: '📊',
    name: '칼같은 데이터 금연가',
    tags: ['#앱기록필수', '#통계적접근', '#원칙주의자', '#철벽의인내'],
    desc: '자신만의 루틴에 따라 정해진 시간에 정확히 피우는 원칙주의자입니다. 금연 일수 카운터와 아낀 금액 등 데이터를 확인할 때 강한 동기부여를 받으며 높은 인내심을 발휘합니다.',
    tip: '금연 타이머 앱과 폐 기능 회복 수치 그래프를 매일 확인하기.',
  },
  healer: {
    emoji: '🫂',
    name: '멘탈케어 힐링 스모커',
    tags: ['#속마음정리', '#휴식의수단', '#상처치유용', '#조용한결단'],
    desc: '냄새 제거제나 가글을 철저히 챙기는 배려형 흡연자입니다. 과중한 스트레스를 삭이기 위해 혼자 피우며, 주변 소중한 사람을 위해서 건강해져야겠다는 동기가 생기면 끝까지 버텨냅니다.',
    tip: '금연으로 가족이나 연인에게 줄 수 있는 선물 리스트를 작성해 보기.',
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
  $('resultDesc').textContent = c.desc;
  $('resultTip').textContent = c.tip;

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
