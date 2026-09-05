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

const PANELS = { breath: 'panelBreath', sugar: 'panelSugar', time: 'panelTime', age: 'panelAge' };

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

// ===== 탭 2: 추정 신체 나이 =====

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

// ===== 탭 2: 설탕 계산기 =====
// 당류(g)는 대표 제품 기준의 대략값. 각설탕 하나를 3g 으로 잡는다.

const DRINKS = [
  { name: '콜라 250ml 캔', g: 27 },
  { name: '콜라 500ml 페트', g: 54 },
  { name: '사이다 250ml 캔', g: 26 },
  { name: '에너지음료 250ml', g: 27 },
  { name: '스포츠음료 500ml', g: 30 },
  { name: '오렌지주스 200ml', g: 20 },
  { name: '초코우유 200ml', g: 22 },
  { name: '캔커피 200ml', g: 15 },
  { name: '바닐라라떼 (톨)', g: 30 },
  { name: '버블티 (레귤러)', g: 40 },
  { name: '직접 입력', g: null },
];
const CUBE_G = 3;
const WHO_DAY_G = 25;

function initSugar() {
  const sel = $('sugarDrink');
  if (!sel) return;
  DRINKS.forEach((d, i) => {
    const o = document.createElement('option');
    o.value = String(i);
    o.textContent = d.g === null ? d.name : `${d.name} — 약 ${d.g}g`;
    sel.appendChild(o);
  });
  sel.addEventListener('change', renderSugar);
  $('sugarCount').addEventListener('input', renderSugar);
  $('sugarCustom').addEventListener('input', renderSugar);
  renderSugar();
}

function renderSugar() {
  const d = DRINKS[Number($('sugarDrink').value) || 0];
  const custom = d.g === null;
  $('sugarCustomWrap').classList.toggle('hidden', !custom);
  const perOne = custom ? (Number($('sugarCustom').value) || 0) : d.g;
  const count = Number($('sugarCount').value) || 0;
  const dayG = perOne * count;
  const yearG = dayG * 365;

  $('sugarDayG').textContent = comma(Math.round(dayG));
  $('sugarDayCubes').textContent = comma(Math.round(dayG / CUBE_G));
  $('sugarYearKg').textContent = (Math.round(yearG / 100) / 10).toString();
  $('sugarYearCubes').textContent = comma(Math.round(yearG / CUBE_G));

  const v = $('sugarVsWho');
  if (dayG <= 0) { v.textContent = ''; return; }
  const ratio = dayG / WHO_DAY_G;
  v.innerHTML = ratio >= 1
    ? `이 음료만으로 WHO 하루 권장 상한(약 ${WHO_DAY_G}g)의 <strong>${Math.round(ratio * 100)}%</strong>입니다. 다른 음식의 당은 세기도 전에요.`
    : `이 음료는 WHO 하루 권장 상한(약 ${WHO_DAY_G}g)의 <strong>${Math.round(ratio * 100)}%</strong>입니다.`;
}

// ===== 탭 3: 시간 계산기 =====

const TIME_ITEMS = [
  { label: '영화', unit: '편', hours: 2, note: '한 편 2시간' },
  { label: '책', unit: '권', hours: 6, note: '한 권 6시간' },
  { label: '5km 달리기', unit: '번', hours: 0.5, note: '30분' },
  { label: '외국어 기초 과정', unit: '번 완주', hours: 100, note: '약 100시간' },
  { label: '서울–부산 왕복 운전', unit: '번', hours: 10, note: '약 10시간' },
];

function initTime() {
  const el = $('timeMin');
  if (!el) return;
  el.addEventListener('input', renderTime);
  renderTime();
}

function renderTime() {
  const min = Number($('timeMin').value) || 0;
  const yearHours = (min * 365) / 60;
  $('timeYearHours').textContent = comma(Math.round(yearHours));
  $('timeYearDays').textContent = comma(Math.round(yearHours / 24));
  $('timeYearWakeDays').textContent = comma(Math.round(yearHours / 16));

  const box = $('timeList');
  box.textContent = '';
  for (const it of TIME_ITEMS) {
    const n = yearHours / it.hours;
    const row = document.createElement('div');
    row.className = 'dday-row';
    row.innerHTML =
      `<span class="dday-when">${it.label}</span>` +
      `<span class="dday-date">${it.note}</span>` +
      `<span class="dday-text"><strong>${n >= 10 ? comma(Math.round(n)) : (Math.round(n * 10) / 10)}</strong>${it.unit}</span>`;
    box.appendChild(row);
  }
}

initSugar();
initTime();