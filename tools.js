'use strict';

const $ = (id) => document.getElementById(id);

function comma(n) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 버튼 그룹 (탭, 라디오 대용) — 항상 하나가 선택되어 있다
function initSeg(id, onChange) {
  const box = $(id);
  box.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-v]');
    if (!btn) return;
    setSeg(id, btn.dataset.v);
    if (onChange) onChange(btn.dataset.v);
  });
  setSeg(id, box.dataset.value);
}

function setSeg(id, value) {
  const box = $(id);
  box.dataset.value = value;
  for (const b of box.querySelectorAll('button')) {
    b.classList.toggle('active', b.dataset.v === value);
  }
}

function getSeg(id) { return $(id).dataset.value; }

// ===== 탭 전환 =====

const PANELS = { breath: 'panelBreath', money: 'panelMoney', age: 'panelAge' };

initSeg('toolTabs', (v) => {
  for (const key of Object.keys(PANELS)) {
    $(PANELS[key]).classList.toggle('hidden', key !== v);
  }
  // 탭을 옮기면 진행 중이던 숨참기는 정리한다
  if (v !== 'breath') stopBreath(false);
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== 탭 1: 숨참기 챌린지 =====

const BREATH_TIERS = [
  { max: 15,       emoji: '🚨', name: '헤비 스모커',        short: '헤비 스모커 구간',        msg: '폐가 살려달라고 부르짖는 중입니다. 지금 끊으면 8시간 만에 혈중 일산화탄소가 정상으로 돌아옵니다.' },
  { max: 30,       emoji: '🚬', name: '라이트 스모커·운동부족', short: '라이트 스모커 구간',  msg: '계단만 올라가도 헐떡이는 상태입니다. 2~3주만 버티면 폐 기능이 30% 이상 올라옵니다.' },
  { max: 45,       emoji: '🫁', name: '일반 비흡연자',      short: '일반 비흡연자 구간',      msg: '지극히 정상적인 현대인의 폐입니다. 지금 상태를 지키는 것만으로도 충분히 잘하고 있습니다.' },
  { max: 60,       emoji: '🏃', name: '체력왕',            short: '체력왕 구간',            msg: '마라톤도 가능한 탄탄한 폐활량입니다. 이 상태를 유지해 주세요.' },
  { max: 90,       emoji: '🏊', name: '프로 수영선수급',    short: '프로 수영선수 구간',      msg: '산소 탱크를 하나 더 달고 계신 것 같습니다. 대단합니다.' },
  { max: Infinity, emoji: '🦪', name: '전설의 해녀',        short: '전설의 해녀 구간',        msg: '바다의 지배자입니다. 다만 기록 경신을 위해 무리하지는 마세요.' },
];

function tierFor(sec) {
  return BREATH_TIERS.find((t) => sec <= t.max);
}

const BREATH_MAX = 90;                 // 게이지가 가득 차는 기준 시간
const RING_LEN = 2 * Math.PI * 86;

let breathTimer = null;
let countdownTimer = null;
let breathStartAt = 0;

function setRing(ratio) {
  const r = Math.min(Math.max(ratio, 0), 1);
  const ring = $('breathRingFg');
  ring.style.strokeDasharray = String(RING_LEN);
  ring.style.strokeDashoffset = String(RING_LEN * (1 - r));
}

function resetBreathView() {
  $('breathTime').textContent = '0.0';
  $('breathUnit').textContent = '초';
  $('breathHint').textContent = '준비되면 시작을 누르세요';
  setRing(0);
  $('breathStart').classList.remove('hidden');
  $('breathStop').classList.add('hidden');
  $('breathResult').classList.add('hidden');
}

function startCountdown() {
  $('breathResult').classList.add('hidden');
  $('breathStart').classList.add('hidden');
  $('breathStop').classList.add('hidden');
  setRing(0);

  let n = 3;
  $('breathUnit').textContent = '';
  $('breathTime').textContent = String(n);
  $('breathHint').textContent = '숨을 크게 들이쉬세요!';

  countdownTimer = setInterval(() => {
    n -= 1;
    if (n > 0) {
      $('breathTime').textContent = String(n);
    } else {
      clearInterval(countdownTimer);
      countdownTimer = null;
      runBreath();
    }
  }, 1000);
}

function runBreath() {
  breathStartAt = Date.now();
  $('breathUnit').textContent = '초';
  $('breathStop').classList.remove('hidden');

  breathTimer = setInterval(() => {
    const sec = (Date.now() - breathStartAt) / 1000;
    $('breathTime').textContent = sec.toFixed(1);
    setRing(sec / BREATH_MAX);
    $('breathHint').innerHTML = `현재 <strong>${tierFor(sec).short}</strong> — 힘들면 바로 멈추세요`;
  }, 100);
}

// showResult 가 false 면 결과 없이 정리만 한다 (탭 이동 등)
function stopBreath(showResult) {
  if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
  if (breathTimer) { clearInterval(breathTimer); breathTimer = null; }

  if (!showResult) { resetBreathView(); return; }

  const sec = (Date.now() - breathStartAt) / 1000;
  const tier = tierFor(sec);

  $('breathResultEmoji').textContent = tier.emoji;
  $('breathResultTitle').textContent = tier.name;
  $('breathResultTime').textContent = `${sec.toFixed(1)}초`;
  $('breathResultMsg').textContent = tier.msg;

  $('breathResult').classList.remove('hidden');
  $('breathStop').classList.add('hidden');
  $('breathStart').classList.add('hidden');
  $('breathHint').textContent = '편하게 호흡하세요';
}

$('breathStart').addEventListener('click', startCountdown);
$('breathStop').addEventListener('click', () => stopBreath(true));
$('breathRetry').addEventListener('click', resetBreathView);

// ===== 탭 2: 스노우볼 계산기 =====

const PERIODS = [
  { years: 1,  reward: '에어팟 프로 획득 🎧' },
  { years: 5,  reward: '중형 중고차 한 대 🚗' },
  { years: 10, reward: '수도권 아파트 전세 보증금 🏠' },
  { years: 20, reward: '조기 은퇴 자금 확보 ✈️' },
];

function monthlySaving() {
  if (getSeg('moneyKind') === 'smoke') {
    const packs = Number($('mPacks').value) || 0;
    const price = Number($('mPackPrice').value) || 0;
    return packs * price * (365 / 12);
  }
  const times = Number($('mTimes').value) || 0;
  const cost = Number($('mCost').value) || 0;
  return times * cost * (52 / 12);
}

// 매달 같은 금액을 넣는 적립식 복리
function futureValue(monthly, annualRatePct, years) {
  const i = (annualRatePct / 100) / 12;
  const n = years * 12;
  if (i === 0) return monthly * n;
  return monthly * ((Math.pow(1 + i, n) - 1) / i);
}

function renderMoney() {
  const monthly = monthlySaving();
  const rate = Number($('mRate').value) || 0;

  $('mMonthly').textContent = comma(monthly) + '원';
  $('mYearly').textContent = comma(monthly * 12) + '원';

  const box = $('moneyCards');
  box.textContent = '';

  // 막대 길이 기준은 가장 긴 기간의 투자 결과
  const maxValue = futureValue(monthly, rate, PERIODS[PERIODS.length - 1].years) || 1;

  for (const p of PERIODS) {
    const principal = monthly * 12 * p.years;
    const total = futureValue(monthly, rate, p.years);
    const gain = total - principal;

    const card = document.createElement('div');
    card.className = 'money-card';
    card.innerHTML = `
      <div class="money-card-head">
        <span class="money-years">${p.years}년 뒤</span>
        <span class="money-reward">${p.reward}</span>
      </div>
      <div class="money-bars">
        <div class="money-bar-row">
          <span class="money-bar-label">모으기만 하면</span>
          <div class="money-bar"><div class="money-bar-fill plain" style="width:${(principal / maxValue) * 100}%"></div></div>
          <span class="money-bar-value">${comma(principal)}원</span>
        </div>
        <div class="money-bar-row">
          <span class="money-bar-label">투자했다면</span>
          <div class="money-bar"><div class="money-bar-fill grow" style="width:${(total / maxValue) * 100}%"></div></div>
          <span class="money-bar-value strong">${comma(total)}원</span>
        </div>
      </div>
      <p class="money-gain">불어난 금액 <strong>+${comma(gain)}원</strong></p>
    `;
    box.appendChild(card);
  }
}

initSeg('moneyKind', (v) => {
  document.body.dataset.moneyKind = v;
  renderMoney();
});
document.body.dataset.moneyKind = getSeg('moneyKind');

for (const id of ['mPacks', 'mPackPrice', 'mTimes', 'mCost', 'mRate']) {
  $(id).addEventListener('input', renderMoney);
}
renderMoney();

// ===== 탭 3: 추정 신체 나이 =====

// [폐에 더할 값, 간에 더할 값] — 답변 순서대로
const AGE_WEIGHTS = {
  q1: [[0, 0], [3, 1], [6, 2], [10, 3]],   // 흡연량
  q2: [[0, 0], [1, 2], [2, 5], [3, 9]],    // 음주 횟수
  q3: [[0, 0], [0, 1], [1, 4], [2, 7]],    // 숙취 회복
  q4: [[0, 0], [2, 0], [5, 1], [8, 2]],    // 계단
  q5: [[-3, -3], [-1, -1], [1, 1], [3, 3]], // 운동
  q6: [[-1, -1], [0, 0], [2, 2], [5, 1]],  // 아침 컨디션
};

for (const q of Object.keys(AGE_WEIGHTS)) initSeg(q);

const RECOVERY_STEPS = [
  { days: 1,   label: '8시간 뒤',   text: '혈중 일산화탄소가 정상으로 돌아오고 산소량이 올라갑니다.' },
  { days: 2,   label: '2일째',      text: '말초신경이 되살아나면서 후각과 미각이 좋아집니다.' },
  { days: 3,   label: '3일째',      text: '니코틴 금단이 정점을 지납니다. 여기가 바닥입니다.' },
  { days: 14,  label: '14일째',     text: '금단 증상이 서서히 줄기 시작합니다.' },
  { days: 21,  label: '21일째',     text: '혈액순환이 좋아지고 폐 기능이 30% 이상 올라옵니다.' },
  { days: 90,  label: '90일째',     text: '기침과 호흡곤란이 눈에 띄게 줄어듭니다.' },
  { days: 365, label: '365일째',    text: '심장마비 위험이 흡연자의 절반으로 떨어집니다.' },
];

function addDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n - 1);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

$('ageCalc').addEventListener('click', () => {
  const real = Number($('ageReal').value);
  if (!(real >= 15 && real <= 100)) { $('ageReal').focus(); return; }

  let lung = 0;
  let liver = 0;
  for (const q of Object.keys(AGE_WEIGHTS)) {
    const w = AGE_WEIGHTS[q][Number(getSeg(q))];
    lung += w[0];
    liver += w[1];
  }

  const lungAge = Math.max(real + lung, 15);
  const liverAge = Math.max(real + liver, 15);

  $('ageResultReal').textContent = String(real);
  $('ageLung').textContent = String(lungAge);
  $('ageLiver').textContent = String(liverAge);

  const worst = Math.max(lungAge - real, liverAge - real);
  let msg;
  if (worst <= 0) {
    msg = '실제 나이보다 좋게 나왔습니다. 지금 습관을 그대로 유지하는 것이 최선입니다.';
  } else if (worst <= 4) {
    msg = `실제 나이보다 ${worst}살 많게 나왔습니다. 아직 크게 벌어지지 않았으니 지금이 되돌리기 가장 쉬운 시점입니다.`;
  } else if (worst <= 9) {
    msg = `실제 나이보다 ${worst}살 많게 나왔습니다. 오늘 끊으면 아래 일정표대로 되돌아가기 시작합니다.`;
  } else {
    msg = `실제 나이보다 ${worst}살 많게 나왔습니다. 숫자에 겁먹을 필요는 없습니다. 하루만 넘겨도 몸은 바로 반응합니다.`;
  }
  $('ageMsg').textContent = msg;

  const list = $('ageDday');
  list.textContent = '';
  for (const step of RECOVERY_STEPS) {
    const row = document.createElement('div');
    row.className = 'dday-row';
    row.innerHTML = `
      <span class="dday-when">${step.label}</span>
      <span class="dday-date">${addDays(step.days)}</span>
      <span class="dday-text">${step.text}</span>
    `;
    list.appendChild(row);
  }

  $('ageResult').classList.remove('hidden');
  $('ageResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
