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

// ===== 잠깐 쉬기: 숨을 참거나 건강 상태를 평가하지 않는다 =====
const RING_LEN = 2 * Math.PI * 86;
let breathTimer = null;
let breathStartAt = 0;
function setRing(ratio) {
  $('breathRingFg').style.strokeDasharray = String(RING_LEN);
  $('breathRingFg').style.strokeDashoffset = String(RING_LEN * (1 - Math.min(Math.max(ratio, 0), 1)));
}
function resetBreathView() {
  $('breathTime').textContent = '60';
  $('breathUnit').textContent = '초';
  $('breathHint').textContent = '숨을 참지 말고 평소처럼 편하게 쉬세요.';
  $('breathStart').classList.remove('hidden');
  $('breathStop').classList.add('hidden');
  $('breathResult').classList.add('hidden');
  setRing(0);
}
function stopBreath(showResult) {
  if (breathTimer) clearInterval(breathTimer);
  breathTimer = null;
  if (!showResult) { resetBreathView(); return; }
  const seconds = Math.min(60, Math.floor((Date.now() - breathStartAt) / 1000));
  $('breathResultEmoji').textContent = '🌿';
  $('breathResultTitle').textContent = seconds >= 60 ? '잠깐 쉬었어요' : '여기까지 쉬었어요';
  $('breathResultTime').textContent = seconds + '초';
  $('breathResultMsg').textContent = '이제 다음 행동 하나를 골라보세요. 자리에서 일어나기, 물 한 잔 마시기, 하던 일로 돌아가기 중 무엇이 좋을까요?';
  $('breathResult').classList.remove('hidden');
  $('breathStart').classList.add('hidden');
  $('breathStop').classList.add('hidden');
  $('breathHint').textContent = '쉬어간 시간만 기록하며 건강 상태를 판정하지 않아요.';
}
$('breathStart').addEventListener('click', () => {
  stopBreath(false);
  breathStartAt = Date.now();
  $('breathStart').classList.add('hidden');
  $('breathStop').classList.remove('hidden');
  breathTimer = setInterval(() => {
    const elapsed = Math.min(60, (Date.now() - breathStartAt) / 1000);
    $('breathTime').textContent = String(Math.ceil(60 - elapsed));
    setRing(elapsed / 60);
    if (elapsed >= 60) stopBreath(true);
  }, 250);
});
$('breathStop').addEventListener('click', () => stopBreath(true));
$('breathRetry').addEventListener('click', () => stopBreath(false));
resetBreathView();

// ===== 오늘의 한 문장 계획 =====
$('planMake').addEventListener('click', () => {
  const when = $('planWhen').value.trim();
  const action = $('planAction').value.trim();
  if (!when || !action) {
    $('planResult').textContent = '상황과 대신 할 행동을 모두 적어주세요.';
    (!when ? $('planWhen') : $('planAction')).focus();
    return;
  }
  $('planResult').textContent = `${when}, ${action}. 오늘은 이 한 번부터 해볼게요.`;
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
  const inputs = [$('sugarCount'), ...(custom ? [$('sugarCustom')] : [])];
  const valid = inputs.every((el) => el.value !== '' && el.checkValidity());
  $('sugarError').textContent = valid ? '' : '개수와 당류를 입력 범위에 맞게 적어주세요.';
  if (!valid) {
    ['sugarDayG','sugarDayCubes','sugarYearKg','sugarYearCubes'].forEach((id) => $(id).textContent = '—');
    $('sugarVsWho').textContent = '';
    return;
  }
  const perOne = custom ? (Number($('sugarCustom').value) || 0) : d.g;
  const count = Number($('sugarCount').value) || 0;
  const dayG = perOne * count;
  const yearG = dayG * 365;

  $('sugarDayG').textContent = comma(Math.round(dayG));
  $('sugarDayCubes').textContent = comma(Math.round(dayG / CUBE_G));
  $('sugarYearKg').textContent = (Math.round(yearG / 100) / 10).toString();
  $('sugarYearCubes').textContent = comma(Math.round(yearG / CUBE_G));

  $('sugarVsWho').textContent = '영양성분표의 총 당류를 환산한 값이에요. 자유당만의 양이나 하루 권장량 충족 여부를 판정하지 않아요.';
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
  const input = $('timeMin');
  const valid = input.value !== '' && input.checkValidity();
  $('timeError').textContent = valid ? '' : '하루 시간은 0~1,440분 사이의 정수로 입력해 주세요.';
  if (!valid) {
    ['timeYearHours','timeYearDays','timeYearWakeDays'].forEach((id) => $(id).textContent = '—');
    $('timeList').textContent = '';
    return;
  }
  const min = Number(input.value);
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