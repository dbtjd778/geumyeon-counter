'use strict';

// ===== 모드 (금연 / 금주) =====
// 두 탭은 계산 방식과 화면 문구만 다르고 나머지 구조는 같다.

const MODES = {
  smoke: {
    id: 'smoke',
    verb: '금연',
    startLabel: '금연 시작일',
    countLabel: '안 피운 담배',
    failLabel: '금연 실패',
    guideHref: 'guide.html',
    guideLabel: '금연 정보',
    // 하루에 아끼는 돈
    moneyPerDay: () => (getNum('cigsPerDay', CONFIG.cigsPerDay) / 20) * getNum('pricePerPack', CONFIG.pricePerPack),
    // 하루에 줄어드는 개수와 그 단위
    countPerDay: () => getNum('cigsPerDay', CONFIG.cigsPerDay),
    countUnit: '개비',
    countText: (total) => comma(total) + '개비',
    celebrateText: (total) => `담배 ${comma(total)}개비를 피우지 않았어요.`,
  },
  drink: {
    id: 'drink',
    verb: '금주',
    startLabel: '금주 시작일',
    countLabel: '안 마신 술자리',
    failLabel: '금주 실패',
    guideHref: 'guide-drink.html',
    guideLabel: '금주 정보',
    moneyPerDay: () => (getNum('drinksPerWeek', CONFIG.drinksPerWeek) / 7) * getNum('costPerDrink', CONFIG.costPerDrink),
    countPerDay: () => getNum('drinksPerWeek', CONFIG.drinksPerWeek) / 7,
    countUnit: '번',
    countText: (total) => comma(Math.round(total)) + '번',
    celebrateText: (total) => `술자리 ${comma(Math.round(total))}번을 넘겼어요.`,
  },
};

let mode = 'smoke';

function M() { return MODES[mode]; }

// ===== 저장소 (localStorage를 못 쓰는 환경에서도 죽지 않게) =====

const KEY_MODE = 'qs.mode';

function readStore(key) {
  try { return window.localStorage.getItem(key); } catch (e) { return null; }
}

function writeStore(key, value) {
  try { window.localStorage.setItem(key, value); return true; } catch (e) { return false; }
}

// 모드별로 키를 나눠 쓴다. 예: qs.smoke.startDate / qs.drink.startDate
function k(name) { return `qs.${mode}.${name}`; }

function get(name) { return readStore(k(name)); }
function set(name, value) { return writeStore(k(name), value); }

function getNum(name, fallback) {
  const v = Number(get(name));
  return v > 0 ? v : fallback;
}

// 모드 구분이 없던 시절(qs.startDate 등)의 값을 금연 쪽으로 옮긴다
function migrateOldKeys() {
  if (readStore('qs.smoke.startDate') || !readStore('qs.startDate')) return;
  const pairs = [
    ['qs.startDate', 'qs.smoke.startDate'],
    ['qs.pricePerPack', 'qs.smoke.pricePerPack'],
    ['qs.cigsPerDay', 'qs.smoke.cigsPerDay'],
    ['qs.gender', 'qs.smoke.gender'],
    ['qs.age', 'qs.smoke.age'],
    ['qs.celebrated', 'qs.smoke.celebrated'],
  ];
  for (const [from, to] of pairs) {
    const v = readStore(from);
    if (v !== null) writeStore(to, v);
  }
}

// ===== 날짜 계산 =====

// 시분초를 버린 '날짜만'의 밀리초 값
function dayStamp(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function parseDate(text) {
  const m = String(text || '').trim().match(/^(\d{4})\D+(\d{1,2})\D+(\d{1,2})$/);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return isNaN(d.getTime()) ? null : d;
}

function toInputValue(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function getStartDate() { return parseDate(get('startDate')); }
function setStartDate(d) { set('startDate', toInputValue(d)); }

// 시작일이 1일차. 시작일이 아직 안 왔으면 0 이하가 나온다.
function currentDay() {
  const start = getStartDate();
  if (!start) return 0;
  return Math.floor((dayStamp(new Date()) - dayStamp(start)) / 86400000) + 1;
}

function formatDate(d) {
  const week = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${week})`;
}

function comma(n) {
  return Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 소수점이 있을 때만 한 자리까지 보여준다 (13.4 → "13.4", 20 → "20")
function trim1(n) {
  return (Math.round(n * 10) / 10).toString();
}

// ===== 금연 전용: 성별·나이 =====

// 'male' | 'female' | '' (안 고름)
function getGender() {
  const v = get('gender');
  return (v === 'male' || v === 'female') ? v : '';
}

// 나이는 선택 항목이라 없으면 null
function getAge() {
  const v = Number(get('age'));
  return (v > 0 && v < 130) ? Math.floor(v) : null;
}

// 성별에 해당하는 하루 평균 흡연량 (개비). 안 골랐으면 null
function averageCigsFor(gender) {
  const table = CONFIG.averageCigs || {};
  return table[gender] > 0 ? table[gender] : null;
}

// 금연으로 되찾는 기대수명. 근거 수치가 있는 연령대만 숫자를 돌려준다.
function lifeGainedFor(age) {
  if (age === null) return null;
  const hit = (CONFIG.lifeGained || []).find((r) => age >= r.min && age <= r.max);
  return hit ? hit.years : null;
}

// ===== 마일스톤 =====
// 10일마다 축하하고, 100일 단위는 더 특별하게 축하한다.

function everyN() { return CONFIG.milestoneEvery > 0 ? CONFIG.milestoneEvery : 10; }
function specialN() { return CONFIG.specialEvery > 0 ? CONFIG.specialEvery : 100; }

function isMilestone(day) { return day > 0 && day % everyN() === 0; }
function isSpecial(day) { return day > 0 && day % specialN() === 0; }

function nextMilestone(day) {
  const n = everyN();
  return (Math.floor(Math.max(day, 0) / n) + 1) * n;
}

function prevMilestone(day) {
  const n = everyN();
  return Math.floor(Math.max(day, 0) / n) * n;
}

function milestoneMessage(day) {
  const table = CONFIG.milestoneMessages || {};
  if (table[day]) return table[day];
  return CONFIG.defaultMessage ? CONFIG.defaultMessage(day) : `${day}일 달성`;
}

// ===== 화면 그리기 =====

const $ = (id) => document.getElementById(id);

let renderedDay = null;

// 모드에 따라 달라지는 문구를 한 번에 갈아끼운다
function applyModeLabels() {
  const m = M();
  $('countLabel').textContent = m.countLabel;
  $('failBtn').textContent = m.failLabel;
  $('obStartLabel').textContent = m.startLabel;
  $('startInputLabel').textContent = m.startLabel;
  $('settingsTitle').textContent = m.verb + ' 설정';
  // 아래 메뉴의 정보 링크도 탭에 맞춰 바뀐다
  $('guideLink').href = m.guideHref;
  $('guideLink').textContent = m.guideLabel;
  document.body.dataset.mode = mode;
  setSeg('modeTabs', mode);
}

function render() {
  const day = currentDay();
  renderedDay = day;

  $('today').textContent = formatDate(new Date());

  if (day <= 0) {
    $('dayNum').textContent = '0';
    $('nextGoal').innerHTML = getStartDate()
      ? `<strong>${1 - day}일</strong> 뒤에 시작해요`
      : '시작일을 설정해 주세요';
  } else {
    $('dayNum').textContent = comma(day);
    const next = nextMilestone(day);
    $('nextGoal').innerHTML = `다음 목표 <strong>${next}일</strong>까지 <strong>${next - day}일</strong> 남았어요`;
  }

  // 진행 링: 직전 마일스톤 → 다음 마일스톤 구간의 진행률
  const shown = Math.max(day, 0);
  const from = prevMilestone(shown);
  const to = nextMilestone(shown);
  const ratio = Math.min(Math.max((shown - from) / (to - from), 0), 1);
  const circumference = 2 * Math.PI * 88;
  const ring = $('ringFg');
  ring.style.strokeDasharray = String(circumference);
  ring.style.strokeDashoffset = String(circumference * (1 - ratio));

  $('saved').textContent = comma(shown * M().moneyPerDay()) + '원';
  $('notSmoked').textContent = M().countText(shown * M().countPerDay());

  const start = getStartDate();
  $('startInfo').textContent = start
    ? `시작 ${start.getFullYear()}.${start.getMonth() + 1}.${start.getDate()}`
    : '시작일 미설정';

  renderInsight();
}

// 금연 탭에서 성별·나이를 넣은 사람에게만 보여주는 추가 정보
function renderInsight() {
  const avgEl = $('insightAvg');
  const lifeEl = $('insightLife');
  const srcEl = $('insightSource');

  if (mode !== 'smoke') {
    $('insight').classList.add('hidden');
    return;
  }

  const sources = [];

  // 같은 성별 평균과 비교
  const avg = averageCigsFor(getGender());
  if (avg !== null) {
    const mine = getNum('cigsPerDay', CONFIG.cigsPerDay);
    const diff = mine - avg;
    const avgText = `같은 성별 평균 <strong>하루 ${trim1(avg)}개비</strong>`;
    if (diff > 0.05) {
      avgEl.innerHTML = `${avgText}보다 ${trim1(diff)}개비 더 피우고 있었어요.`;
    } else if (diff < -0.05) {
      avgEl.innerHTML = `${avgText}보다 ${trim1(-diff)}개비 적게 피우고 있었어요.`;
    } else {
      avgEl.innerHTML = `${avgText}과 거의 같았어요.`;
    }
    avgEl.classList.remove('hidden');
    sources.push('평균 흡연량: 국가암정보센터');
  } else {
    avgEl.classList.add('hidden');
  }

  // 나이에 따른 기대수명
  const age = getAge();
  if (age !== null) {
    const years = lifeGainedFor(age);
    if (years !== null) {
      lifeEl.innerHTML =
        `이 나이에 끊으면 계속 피우는 경우보다 <strong>약 ${years}년</strong>을 더 사는 것으로 나타났어요.`;
      sources.push('기대수명: NEJM 2013');
    } else if (age < 25) {
      lifeEl.innerHTML =
        `40세 이전에 끊으면 흡연으로 늘어나는 사망 위험의 <strong>약 90%</strong>를 피할 수 있어요.`;
      sources.push('기대수명: NEJM 2013');
    } else {
      lifeEl.innerHTML = '금연의 이득은 시작하는 나이와 상관없이 남아요.';
    }
    lifeEl.classList.remove('hidden');
  } else {
    lifeEl.classList.add('hidden');
  }

  if (sources.length) {
    srcEl.textContent = '출처 — ' + sources.join(' / ');
    srcEl.classList.remove('hidden');
  } else {
    srcEl.classList.add('hidden');
  }

  $('insight').classList.toggle('hidden', avgEl.classList.contains('hidden') && lifeEl.classList.contains('hidden'));
}

// ===== 축하 =====

function showCelebration(day) {
  const m = M();
  const special = isSpecial(day);

  $('celeBadge').textContent = special && CONFIG.specialMessage
    ? CONFIG.specialMessage(day)
    : `${comma(day)}일`;
  $('celeTitle').textContent = special ? `${comma(day)}일 달성!` : '축하합니다!';
  $('celeMsg').textContent = milestoneMessage(day);
  $('celeSub').textContent =
    `지금까지 ${comma(day * m.moneyPerDay())}원을 아꼈고, ` + m.celebrateText(day * m.countPerDay());

  $('celebration').classList.toggle('special', special);
  $('celebration').classList.remove('hidden');

  if (special) {
    // 100일 단위는 더 오래, 더 많이 터뜨린다
    particles.confetti(240, true);
    for (const delay of [500, 1000, 1600, 2300, 3100]) {
      setTimeout(() => particles.confetti(180, true), delay);
    }
  } else {
    particles.confetti(160);
    setTimeout(() => particles.confetti(120), 700);
    setTimeout(() => particles.confetti(120), 1500);
  }
}

// 오늘이 마일스톤이고 아직 축하를 안 봤다면 띄운다
function checkMilestone() {
  const day = currentDay();
  if (!isMilestone(day)) return;
  if (get('celebrated') === String(day)) return;
  set('celebrated', String(day));
  showCelebration(day);
}

// 시작일을 바꾼 직후에 축하가 튀어나오지 않도록 눌러둔다
function suppressTodayCelebration() {
  set('celebrated', String(currentDay()));
}

// ===== 파티클 (축하 색종이 / 실패 잿가루) =====

const particles = (function () {
  const canvas = $('confetti');
  const ctx = canvas.getContext('2d');
  const colors = ['#4ade80', '#facc15', '#60a5fa', '#f472b6', '#fb923c', '#ffffff'];
  // 100일 단위 축하는 금색 위주로 터진다
  const goldColors = ['#facc15', '#fbbf24', '#fde68a', '#f59e0b', '#ffffff', '#4ade80'];
  const ashColors = ['#6b7681', '#8a949c', '#4d565e', '#9aa4ab'];
  let items = [];
  let running = false;
  let ashTimer = null;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function start() {
    if (!running) { running = true; requestAnimationFrame(tick); }
  }

  function confetti(count, gold) {
    const palette = gold ? goldColors : colors;
    for (let i = 0; i < count; i++) {
      items.push({
        kind: 'confetti',
        x: canvas.width / 2 + (Math.random() - 0.5) * canvas.width * (gold ? 0.9 : 0.6),
        y: canvas.height * 0.45 + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * (gold ? 12 : 9),
        vy: Math.random() * (gold ? -14 : -11) - 3,
        size: Math.random() * (gold ? 8 : 6) + 4,
        color: palette[(Math.random() * palette.length) | 0],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.25,
        life: 1,
      });
    }
    start();
  }

  function spawnAsh(count) {
    for (let i = 0; i < count; i++) {
      items.push({
        kind: 'ash',
        x: Math.random() * canvas.width,
        y: -12 - Math.random() * 40,
        vx: (Math.random() - 0.5) * 0.5,
        vy: Math.random() * 0.7 + 0.35,
        size: Math.random() * 3 + 1.5,
        color: ashColors[(Math.random() * ashColors.length) | 0],
        sway: Math.random() * Math.PI * 2,
        life: 1,
      });
    }
    start();
  }

  function ashOn() {
    if (ashTimer) return;
    spawnAsh(40);
    ashTimer = setInterval(() => spawnAsh(6), 260);
  }

  function ashOff() {
    if (ashTimer) { clearInterval(ashTimer); ashTimer = null; }
    // 남아 있는 잿가루는 빠르게 사라지게 한다
    for (const p of items) { if (p.kind === 'ash') p.fading = true; }
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    items = items.filter((p) => p.life > 0 && p.y < canvas.height + 40);

    for (const p of items) {
      if (p.kind === 'ash') {
        p.sway += 0.02;
        p.x += p.vx + Math.sin(p.sway) * 0.4;
        p.y += p.vy;
        if (p.fading) p.life -= 0.03;
        else if (p.y > canvas.height * 0.85) p.life -= 0.02;

        ctx.save();
        ctx.globalAlpha = Math.max(p.life, 0) * 0.75;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        p.vy += 0.28;    // 중력
        p.vx *= 0.995;   // 공기 저항
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.y > canvas.height * 0.75) p.life -= 0.012;

        ctx.save();
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
    }

    if (items.length || ashTimer) {
      requestAnimationFrame(tick);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      running = false;
    }
  }

  return { confetti, ashOn, ashOff };
})();

// ===== 오버레이 / 버튼 그룹 =====

function openOverlay(id) { $(id).classList.remove('hidden'); }
function closeOverlay(id) { $(id).classList.add('hidden'); }

function setSeg(id, value) {
  const box = $(id);
  box.dataset.value = value;
  for (const b of box.querySelectorAll('button')) {
    b.classList.toggle('active', b.dataset.v === value);
  }
}

function getSeg(id) { return $(id).dataset.value || ''; }

// 선택 항목이라 이미 고른 버튼을 다시 누르면 해제된다
function initSeg(id, onChange, allowToggleOff) {
  $(id).addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-v]');
    if (!btn) return;
    const same = getSeg(id) === btn.dataset.v;
    if (same && !allowToggleOff) return;
    const value = same ? '' : btn.dataset.v;
    setSeg(id, value);
    if (onChange) onChange(value);
  });
}

// ===== 첫 설정 / 설정 =====

// 첫 설정에서는 성별을 고르면 평균 흡연량을 미리 채워준다
initSeg('obGender', (v) => {
  const avg = averageCigsFor(v);
  if (avg !== null) $('obCigs').value = String(avg);
}, true);

// 설정 화면에서는 이미 넣어둔 값을 함부로 덮어쓰지 않는다
initSeg('genderInput', null, true);

// 탭은 항상 하나가 선택되어 있어야 하므로 해제를 막는다
initSeg('modeTabs', (v) => { if (v) switchMode(v); }, false);

// 성별·나이를 저장한다 (빈 값이면 지운다)
function saveProfile(gender, ageText) {
  set('gender', gender);
  const age = Number(ageText);
  set('age', (age > 0 && age < 130) ? String(Math.floor(age)) : '');
}

function fillOnboarding() {
  $('obStart').value = toInputValue(new Date());
  $('obPrice').value = String(CONFIG.pricePerPack);
  $('obCigs').value = String(CONFIG.cigsPerDay);
  $('obAge').value = '';
  setSeg('obGender', '');
  $('obFreq').value = String(CONFIG.drinksPerWeek);
  $('obCost').value = String(CONFIG.costPerDrink);
}

$('obSave').addEventListener('click', () => {
  const d = parseDate($('obStart').value);
  if (!d) { $('obStart').focus(); return; }

  if (mode === 'smoke') {
    const price = Number($('obPrice').value);
    const cigs = Number($('obCigs').value);
    if (!(price >= 0)) { $('obPrice').focus(); return; }
    if (!(cigs > 0)) { $('obCigs').focus(); return; }
    set('pricePerPack', String(price));
    set('cigsPerDay', String(cigs));
    saveProfile(getSeg('obGender'), $('obAge').value);
  } else {
    const freq = Number($('obFreq').value);
    const cost = Number($('obCost').value);
    if (!(freq > 0)) { $('obFreq').focus(); return; }
    if (!(cost >= 0)) { $('obCost').focus(); return; }
    set('drinksPerWeek', String(freq));
    set('costPerDrink', String(cost));
  }

  setStartDate(d);
  closeOverlay('onboarding');
  render();
  checkMilestone();
});

$('settingsBtn').addEventListener('click', () => {
  $('startInput').value = toInputValue(getStartDate() || new Date());
  if (mode === 'smoke') {
    $('priceInput').value = String(getNum('pricePerPack', CONFIG.pricePerPack));
    $('cigsInput').value = String(getNum('cigsPerDay', CONFIG.cigsPerDay));
    setSeg('genderInput', getGender());
    $('ageInput').value = getAge() === null ? '' : String(getAge());
  } else {
    $('freqInput').value = String(getNum('drinksPerWeek', CONFIG.drinksPerWeek));
    $('costInput').value = String(getNum('costPerDrink', CONFIG.costPerDrink));
  }
  openOverlay('settings');
});

$('settingsCancel').addEventListener('click', () => closeOverlay('settings'));

$('settingsSave').addEventListener('click', () => {
  const d = parseDate($('startInput').value);
  if (!d) { $('startInput').focus(); return; }

  if (mode === 'smoke') {
    const price = Number($('priceInput').value);
    const cigs = Number($('cigsInput').value);
    if (!(price >= 0)) { $('priceInput').focus(); return; }
    if (!(cigs > 0)) { $('cigsInput').focus(); return; }
    set('pricePerPack', String(price));
    set('cigsPerDay', String(cigs));
    saveProfile(getSeg('genderInput'), $('ageInput').value);
  } else {
    const freq = Number($('freqInput').value);
    const cost = Number($('costInput').value);
    if (!(freq > 0)) { $('freqInput').focus(); return; }
    if (!(cost >= 0)) { $('costInput').focus(); return; }
    set('drinksPerWeek', String(freq));
    set('costPerDrink', String(cost));
  }

  setStartDate(d);
  suppressTodayCelebration();
  closeOverlay('settings');
  render();
});

// ===== 축하 / 실패 =====

$('celeClose').addEventListener('click', () => closeOverlay('celebration'));

$('failBtn').addEventListener('click', () => {
  const day = Math.max(currentDay(), 0);
  $('failConfirmMsg').textContent =
    day > 0
      ? `지금까지 쌓은 ${comma(day)}일과 ${comma(day * M().moneyPerDay())}원 기록이 사라지고 처음부터 다시 시작해요.`
      : '기록을 처음부터 다시 설정해요.';
  openOverlay('failConfirm');
});

$('failCancel').addEventListener('click', () => closeOverlay('failConfirm'));

// 실패 확정 → 슬픈 연출 + 재시작 날짜 묻기
$('failOk').addEventListener('click', () => {
  closeOverlay('failConfirm');
  $('widget').classList.add('grieving');
  $('restartInput').value = toInputValue(new Date());
  openOverlay('failRestart');
  particles.ashOn();
});

$('restartSave').addEventListener('click', () => {
  const d = parseDate($('restartInput').value);
  if (!d) { $('restartInput').focus(); return; }
  setStartDate(d);
  suppressTodayCelebration();
  particles.ashOff();
  closeOverlay('failRestart');
  $('widget').classList.remove('grieving');
  render();
});

// ===== 탭 전환 =====

function switchMode(next) {
  if (!MODES[next] || next === mode) return;
  mode = next;
  writeStore(KEY_MODE, mode);

  // 열려 있던 화면은 모두 닫고 새 모드 기준으로 다시 그린다
  for (const id of ['celebration', 'settings', 'failConfirm', 'failRestart', 'onboarding']) {
    closeOverlay(id);
  }
  particles.ashOff();
  $('widget').classList.remove('grieving');

  applyModeLabels();
  render();

  if (getStartDate()) {
    checkMilestone();
  } else {
    fillOnboarding();
    openOverlay('onboarding');
  }
}

// ===== 자동 실행 안내 배너 =====
// 앱으로 설치해서 열었다면 이미 목적을 달성한 상태이므로 배너를 띄우지 않는다.

const KEY_BANNER = 'qs.bannerDismissed';

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.matchMedia('(display-mode: window-controls-overlay)').matches
    || window.navigator.standalone === true;
}

function initInstallBanner() {
  const standalone = isStandalone();

  // 설치한 사람에게는 남은 할 일이 '자동 실행 켜기'뿐이다
  $('ghostBtn').textContent = standalone ? '자동 실행 설정' : '데스크탑에 설치';
  $('ghostBtn').href = standalone ? 'install.html#autostart' : 'install.html';

  const show = !standalone && readStore(KEY_BANNER) !== '1';
  $('installBanner').classList.toggle('hidden', !show);
  document.body.classList.toggle('has-banner', show);
}

$('bannerClose').addEventListener('click', () => {
  writeStore(KEY_BANNER, '1');
  $('installBanner').classList.add('hidden');
  document.body.classList.remove('has-banner');
});

// ===== 시작 =====

migrateOldKeys();
initInstallBanner();

const savedMode = readStore(KEY_MODE);
if (MODES[savedMode]) mode = savedMode;

applyModeLabels();
render();

if (getStartDate()) {
  setTimeout(checkMilestone, 600);
} else {
  // 처음 여는 사람에게는 설정부터 묻는다
  fillOnboarding();
  openOverlay('onboarding');
}

// 켜둔 채로 자정이 지나면 자동으로 갱신
setInterval(() => {
  if (currentDay() !== renderedDay) {
    render();
    checkMilestone();
  }
}, 60000);

// 오프라인에서도 열리도록 서비스 워커 등록 (file://에서는 건너뜀)
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => { /* 무시 */ });
  });
}
