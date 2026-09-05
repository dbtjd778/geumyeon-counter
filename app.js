'use strict';

// ===== 카운터 엔진 =====
// 어떤 습관을 세는지는 habits.js 의 HABITS 에서 읽는다. 여기서는 그 데이터를
// 바탕으로 저장하고, 계산하고, 화면을 그린다.

let mode = 'smoke';

function H() { return HABITS[mode]; }

// ===== 저장소 (localStorage를 못 쓰는 환경에서도 죽지 않게) =====

const KEY_MODE = 'qs.mode';

function readStore(key) {
  try { return window.localStorage.getItem(key); } catch (e) { return null; }
}

function writeStore(key, value) {
  try { window.localStorage.setItem(key, value); return true; } catch (e) { return false; }
}

// 습관별로 키를 나눠 쓴다. 예: qs.smoke.startDate / qs.coffee.startDate
function k(name, id) { return `qs.${id || mode}.${name}`; }

function get(name) { return readStore(k(name)); }
function set(name, value) { return writeStore(k(name), value); }

function getNum(name, fallback) {
  const v = Number(get(name));
  return v > 0 ? v : fallback;
}

// 습관 구분이 없던 시절(qs.startDate 등)의 값을 금연 쪽으로 옮긴다.
// 지우면 초기 사용자의 기록이 사라진다.
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

function getStartDate(id) { return parseDate(readStore(k('startDate', id))); }
function setStartDate(d) { set('startDate', toInputValue(d)); }

// 시작일이 1일차. 시작일이 아직 안 왔으면 0 이하가 나온다.
function dayFor(start) {
  if (!start) return 0;
  return Math.floor((dayStamp(new Date()) - dayStamp(start)) / 86400000) + 1;
}

function currentDay() { return dayFor(getStartDate()); }

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

// 분 → "3일 4시간" / "12시간 30분" / "45분"
function fmtMinutes(min) {
  const m = Math.max(Math.round(min), 0);
  const d = Math.floor(m / 1440);
  const h = Math.floor((m % 1440) / 60);
  const mm = m % 60;
  if (d >= 1) return `${comma(d)}일 ${h}시간`;
  if (h >= 1) return `${h}시간 ${mm}분`;
  return `${mm}분`;
}

// 400x600 앱 창의 작은 칸에 넣는 짧은 표기
function shortWon(value) {
  const v = Math.round(value);
  if (v >= 100000000) {
    const eok = v / 100000000;
    return (eok >= 10 ? Math.round(eok) : Math.round(eok * 10) / 10) + '억';
  }
  if (v >= 10000) return comma(Math.round(v / 10000)) + '만';
  return comma(v) + '원';
}

function shortMinutes(min) {
  const h = min / 60;
  if (h >= 48) return comma(Math.round(h / 24)) + '일';
  return comma(Math.round(h)) + '시간';
}

// ===== 지표 =====
// 습관마다 하루에 쌓이는 값. money 습관은 원, time 습관은 분.

function perDay() {
  return H().perDay(getNum, get);
}

function isTime() { return H().metric === 'time'; }

// 하루 단위의 본체 값 (원 또는 분)
function unitPerDay() {
  const p = perDay();
  return isTime() ? (p.minutes || 0) : (p.money || 0);
}

function fmtMain(total) {
  return isTime() ? fmtMinutes(total) : comma(total) + '원';
}

function fmtMainShort(total) {
  return isTime() ? shortMinutes(total) : shortWon(total);
}

function mainLabel() {
  const h = H();
  if (isTime()) return h.timeLabel || '되찾은 시간';
  return h.moneyLabel || '아낀 돈';
}

// ===== 금연 전용: 성별·나이 =====

function getGender() {
  const v = get('gender');
  return (v === 'male' || v === 'female') ? v : '';
}

function getAge() {
  const v = Number(get('age'));
  return (v > 0 && v < 130) ? Math.floor(v) : null;
}

function averageCigsFor(gender) {
  const table = CONFIG.averageCigs || {};
  return table[gender] > 0 ? table[gender] : null;
}

function lifeGainedFor(age) {
  if (age === null) return null;
  const hit = (CONFIG.lifeGained || []).find((r) => age >= r.min && age <= r.max);
  return hit ? hit.years : null;
}

// ===== 마일스톤 =====

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

// 배포 직후 새 HTML 과 캐시에 남은 옛 스크립트가 섞이는 순간이 있다. 없는
// 요소를 만지다 멈추면 그 뒤의 render() 까지 죽어 일수가 0으로 보이므로
// 장식용 요소는 이걸 거쳐 쓴다.
function setIfPresent(id, apply) {
  const el = $(id);
  if (el) apply(el);
}

let renderedDay = null;

function applyModeLabels() {
  const h = H();

  setIfPresent('habitEmoji', (el) => { el.textContent = h.emoji; });
  setIfPresent('habitName', (el) => { el.textContent = h.name; });
  $('countLabel').textContent = h.countLabel;
  $('mainLabel').textContent = mainLabel();
  $('failBtn').textContent = h.failLabel;
  $('obStartLabel').textContent = h.startLabel;
  $('startInputLabel').textContent = h.startLabel;
  $('settingsTitle').textContent = h.verb + ' 설정';
  $('obTitle').textContent = h.emoji + ' ' + h.verb;
  $('obLead').textContent = h.obLead || '딱 한 번만 설정하면, 이후로는 알아서 세어드려요.';

  // 성별·나이는 담배에서만 (평균 흡연량 비교용)
  for (const el of document.querySelectorAll('.only-profile')) {
    el.classList.toggle('hidden', !h.profile);
  }

  // 정보 페이지가 있는 습관만 링크를 건다
  setIfPresent('guideLink', (el) => {
    if (h.guideHref) { el.href = h.guideHref; el.textContent = h.guideLabel; el.classList.remove('hidden'); }
    else el.classList.add('hidden');
  });

  // 심리테스트가 있는 습관만 배너를 보여준다
  setIfPresent('testPromo', (el) => {
    if (h.testHref) {
      el.href = h.testHref;
      setIfPresent('testPromoEmoji', (e) => { e.textContent = h.testEmoji; });
      setIfPresent('testPromoTitle', (e) => { e.textContent = h.testTitle; });
      setIfPresent('testPromoSub', (e) => { e.textContent = h.testSub; });
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });

  document.body.dataset.mode = mode;
  document.body.dataset.metric = h.metric;

  // 선택 메뉴에서 지금 습관을 표시
  for (const b of document.querySelectorAll('#habitMenu button[data-habit]')) {
    b.classList.toggle('active', b.dataset.habit === mode);
  }
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

  const p = perDay();
  $('saved').textContent = fmtMain(shown * unitPerDay());
  $('notSmoked').textContent = H().countText(shown * (p.count || 0));

  const start = getStartDate();
  $('startInfo').textContent = start
    ? `시작 ${start.getFullYear()}.${start.getMonth() + 1}.${start.getDate()}`
    : '시작일 미설정';

  renderSnowball();
  renderInsight();
  renderHero();
  renderHub();
}

// ===== 이대로 가면 얼마가 모이는지 =====
// 시작일로부터 1개월/6개월/1년/5년이 되는 날짜를 달력 기준으로 잡고,
// 그날까지 쌓이는 값과 아직 남은 시간을 같이 보여준다.

const HORIZONS = [
  { label: '1개월', months: 1 },
  { label: '6개월', months: 6 },
  { label: '1년', months: 12 },
  { label: '5년', months: 60 },
];

// 시작일 + n개월. 8월 31일처럼 다음 달에 같은 날이 없으면 그 달의 마지막 날로 맞춘다.
function addMonths(date, months) {
  const d = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(date.getDate(), lastDay));
  return d;
}

function dayNumberOf(start, date) {
  return Math.floor((dayStamp(date) - dayStamp(start)) / 86400000) + 1;
}

function renderSnowball() {
  const box = $('snowball');
  if (!box) return;

  const start = getStartDate();
  const unit = unitPerDay();

  if (!start || !(unit > 0)) {
    box.classList.add('hidden');
    return;
  }
  box.classList.remove('hidden');

  const now = new Date();
  const row = $('snowRow');
  row.textContent = '';
  let next = null;

  for (const h of HORIZONS) {
    const target = addMonths(start, h.months);
    const amount = unit * dayNumberOf(start, target);
    const leftMs = target.getTime() - now.getTime();
    const done = leftMs <= 0;
    if (!done && !next) next = { label: h.label, amount, target };

    const cell = document.createElement('div');
    cell.className = 'snow-cell' + (done ? ' done' : '');
    cell.title = `${h.label} 뒤 ${fmtMain(amount)}`;

    const label = document.createElement('span');
    label.className = 'snow-label';
    label.textContent = h.label;

    const money = document.createElement('span');
    money.className = 'snow-amount';
    money.textContent = fmtMainShort(amount);

    const left = document.createElement('span');
    left.className = 'snow-left';
    left.textContent = done ? '달성' : 'D-' + Math.max(1, Math.ceil(leftMs / 86400000));

    cell.append(label, money, left);
    row.appendChild(cell);
  }

  renderSnowNext(next);
}

function renderSnowNext(next) {
  const el = $('snowNext');
  if (!el) return;

  renderSnowNext.next = next;

  if (!next) {
    el.textContent = '5년까지 전부 지났어요. 대단합니다.';
    return;
  }

  const left = Math.max(next.target.getTime() - Date.now(), 0);
  const days = Math.floor(left / 86400000);
  const hours = Math.floor((left % 86400000) / 3600000);
  const minutes = Math.floor((left % 3600000) / 60000);

  const parts = [];
  if (days) parts.push(`${comma(days)}일`);
  if (days || hours) parts.push(`${hours}시간`);
  parts.push(`${minutes}분`);

  el.innerHTML = `<strong>${next.label}</strong>까지 ${parts.join(' ')} 남았어요 · 그때 <strong>${fmtMain(next.amount)}</strong>`;
}

// 담배에서 성별·나이를 넣은 사람에게만 보여주는 추가 정보
function renderInsight() {
  const box = $('insight');
  if (!box) return;
  const avgEl = $('insightAvg');
  const lifeEl = $('insightLife');
  const srcEl = $('insightSource');

  if (mode !== 'smoke') {
    box.classList.add('hidden');
    return;
  }

  const sources = [];

  const avg = averageCigsFor(getGender());
  if (avg !== null) {
    const mine = getNum('cigsPerDay', 20);
    const diff = mine - avg;
    const avgText = `같은 성별 평균 <strong>하루 ${trim1(avg)}개비</strong>`;
    if (diff > 0.05) avgEl.innerHTML = `${avgText}보다 ${trim1(diff)}개비 더 피우고 있었어요.`;
    else if (diff < -0.05) avgEl.innerHTML = `${avgText}보다 ${trim1(-diff)}개비 적게 피우고 있었어요.`;
    else avgEl.innerHTML = `${avgText}과 거의 같았어요.`;
    avgEl.classList.remove('hidden');
    sources.push('평균 흡연량: 국가암정보센터');
  } else {
    avgEl.classList.add('hidden');
  }

  const age = getAge();
  if (age !== null) {
    const years = lifeGainedFor(age);
    if (years !== null) {
      lifeEl.innerHTML = `이 나이에 끊으면 계속 피우는 경우보다 <strong>약 ${years}년</strong>을 더 사는 것으로 나타났어요.`;
      sources.push('기대수명: NEJM 2013');
    } else if (age < 25) {
      lifeEl.innerHTML = `40세 이전에 끊으면 흡연으로 늘어나는 사망 위험의 <strong>약 90%</strong>를 피할 수 있어요.`;
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

  box.classList.toggle('hidden', avgEl.classList.contains('hidden') && lifeEl.classList.contains('hidden'));
}

// ===== 홈 화면 (브라우저로 열었을 때만 보이는 부분) =====

// 첫 화면 문장 아래의 숫자. 세는 중인 습관이 있으면 그 일수를 보여준다.
function renderHero() {
  const el = $('heroCount');
  if (!el) return;
  const day = currentDay();
  if (day > 0) {
    el.innerHTML = `<strong>${comma(day)}일째</strong> ${H().name} 없이 지내는 중`;
    el.classList.remove('hidden');
  } else {
    el.classList.add('hidden');
  }
}

// 습관 목록 격자. 세는 중인 습관에는 며칠째인지 붙는다.
function renderHub() {
  const grid = $('habitGrid');
  if (!grid) return;
  grid.textContent = '';

  const active = [];

  for (const cat of HABIT_CATEGORIES) {
    const section = document.createElement('section');
    section.className = 'hub-cat';

    const head = document.createElement('div');
    head.className = 'hub-cat-head';
    head.innerHTML = `<h3>${cat.label}</h3><span>${cat.lead}</span>`;
    section.appendChild(head);

    const list = document.createElement('div');
    list.className = 'hub-list';

    for (const h of habitsInCategory(cat.id)) {
      const day = dayFor(getStartDate(h.id));
      if (day > 0) active.push({ h, day });

      const tile = document.createElement('a');
      tile.className = 'hub-tile' + (h.id === mode ? ' current' : '') + (day > 0 ? ' active' : '');
      tile.href = `index.html?h=${h.id}`;
      tile.dataset.habit = h.id;
      tile.innerHTML =
        `<span class="hub-emoji">${h.emoji}</span>` +
        `<span class="hub-name">${h.name}</span>` +
        `<span class="hub-tag">${day > 0 ? `<b>${comma(day)}일째</b>` : h.tagline}</span>`;
      list.appendChild(tile);
    }

    section.appendChild(list);
    grid.appendChild(section);
  }

  // 세는 중인 습관 요약
  const strip = $('activeStrip');
  if (strip) {
    if (active.length) {
      strip.innerHTML = '<span class="active-label">세는 중</span>' + active.map(({ h, day }) =>
        `<a class="active-chip" href="index.html?h=${h.id}" data-habit="${h.id}">${h.emoji} ${h.name} <b>${comma(day)}일째</b></a>`
      ).join('');
      strip.classList.remove('hidden');
    } else {
      strip.classList.add('hidden');
    }
  }
}

// 홈의 습관 타일과 칩은 새 페이지로 가지 않고 위의 카운터를 바꾼다
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-habit]');
  if (!a || !HABITS[a.dataset.habit]) return;
  e.preventDefault();
  switchMode(a.dataset.habit);
  const w = $('widget');
  if (w && document.body.classList.contains('web')) {
    w.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});

// ===== 축하 =====

function showCelebration(day) {
  const h = H();
  const special = isSpecial(day);
  const p = perDay();

  $('celeBadge').textContent = special && CONFIG.specialMessage
    ? CONFIG.specialMessage(day)
    : `${comma(day)}일`;
  $('celeTitle').textContent = special ? `${comma(day)}일 달성!` : '축하합니다!';
  $('celeMsg').textContent = milestoneMessage(day);

  const main = isTime()
    ? `지금까지 ${fmtMinutes(day * unitPerDay())}을 되찾았고, `
    : `지금까지 ${comma(day * unitPerDay())}원을 아꼈고, `;
  $('celeSub').textContent = main + h.celebrateText(day * (p.count || 0));

  $('celebration').classList.toggle('special', special);
  $('celebration').classList.remove('hidden');

  if (special) {
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

function checkMilestone() {
  const day = currentDay();
  if (!isMilestone(day)) return;
  if (get('celebrated') === String(day)) return;
  set('celebrated', String(day));
  showCelebration(day);
}

function suppressTodayCelebration() {
  set('celebrated', String(currentDay()));
}

// ===== 파티클 (축하 색종이 / 실패 잿가루) =====

const particles = (function () {
  const canvas = $('confetti');
  const ctx = canvas.getContext('2d');
  const colors = ['#1e6b4b', '#e4632d', '#f2b544', '#3b82f6', '#ec4899', '#15211b'];
  const goldColors = ['#f2b544', '#fbbf24', '#fde68a', '#e4632d', '#ffffff', '#1e6b4b'];
  const ashColors = ['#8a949c', '#a3adb4', '#6b7681', '#b9c1c7'];
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
        p.vy += 0.28;
        p.vx *= 0.995;
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

// ===== 습관별 입력칸 =====
// 첫 설정과 설정 화면은 같은 입력칸을 쓴다. prefix 로 id 만 구분한다.

function fieldId(prefix, key) { return `${prefix}_${key}`; }

function buildFields(container, prefix) {
  container.textContent = '';
  const fields = H().fields || [];

  // 숫자 칸 두 개는 한 줄에 나란히
  let row = null;
  for (const f of fields) {
    const label = document.createElement('label');
    label.className = 'field';
    label.innerHTML = `<span>${f.label}</span>`;

    const input = document.createElement('input');
    input.id = fieldId(prefix, f.key);
    input.type = f.type === 'time' ? 'time' : 'number';
    if (f.type !== 'time') {
      if (f.min !== undefined) input.min = String(f.min);
      if (f.max !== undefined) input.max = String(f.max);
      if (f.step !== undefined) input.step = String(f.step);
      if (f.inputmode) input.inputMode = f.inputmode;
    }
    label.appendChild(input);

    if (fields.length === 2 && !f.note) {
      if (!row) { row = document.createElement('div'); row.className = 'field-row'; container.appendChild(row); }
      row.appendChild(label);
    } else {
      container.appendChild(label);
    }

    if (f.note) {
      const note = document.createElement('p');
      note.className = 'field-note';
      note.textContent = f.note;
      container.appendChild(note);
    }
  }
}

function fillFields(prefix, useSaved) {
  for (const f of H().fields || []) {
    const el = $(fieldId(prefix, f.key));
    if (!el) continue;
    const saved = useSaved ? get(f.key) : null;
    el.value = (saved !== null && saved !== '') ? saved : String(f.def);
  }
}

// 입력값 검사 후 저장. 문제가 있으면 그 칸에 포커스를 주고 false 를 돌려준다.
function saveFields(prefix) {
  for (const f of H().fields || []) {
    const el = $(fieldId(prefix, f.key));
    if (!el) continue;
    if (f.type === 'time') {
      if (!/^\d{1,2}:\d{2}$/.test(el.value)) { el.focus(); return false; }
      set(f.key, el.value);
    } else {
      const v = Number(el.value);
      const minOk = f.min === undefined ? v >= 0 : v >= f.min;
      if (!(el.value !== '' && !isNaN(v) && minOk)) { el.focus(); return false; }
      set(f.key, String(v));
    }
  }
  return true;
}

// ===== 첫 설정 / 설정 =====

initSeg('obGender', (v) => {
  const avg = averageCigsFor(v);
  const el = $(fieldId('ob', 'cigsPerDay'));
  if (avg !== null && el) el.value = String(avg);
}, true);

initSeg('genderInput', null, true);

function saveProfile(gender, ageText) {
  set('gender', gender);
  const age = Number(ageText);
  set('age', (age > 0 && age < 130) ? String(Math.floor(age)) : '');
}

function fillOnboarding() {
  buildFields($('obFields'), 'ob');
  fillFields('ob', false);
  $('obStart').value = toInputValue(new Date());
  $('obAge').value = '';
  setSeg('obGender', '');
}

$('obSave').addEventListener('click', () => {
  const d = parseDate($('obStart').value);
  if (!d) { $('obStart').focus(); return; }
  if (!saveFields('ob')) return;
  if (H().profile) saveProfile(getSeg('obGender'), $('obAge').value);

  setStartDate(d);
  closeOverlay('onboarding');
  render();
  checkMilestone();
});

$('settingsBtn').addEventListener('click', () => {
  buildFields($('setFields'), 'set');
  fillFields('set', true);
  $('startInput').value = toInputValue(getStartDate() || new Date());
  if (H().profile) {
    setSeg('genderInput', getGender());
    $('ageInput').value = getAge() === null ? '' : String(getAge());
  }
  openOverlay('settings');
});

$('settingsCancel').addEventListener('click', () => closeOverlay('settings'));

$('settingsSave').addEventListener('click', () => {
  const d = parseDate($('startInput').value);
  if (!d) { $('startInput').focus(); return; }
  if (!saveFields('set')) return;
  if (H().profile) saveProfile(getSeg('genderInput'), $('ageInput').value);

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
      ? `지금까지 쌓은 ${comma(day)}일과 ${fmtMain(day * unitPerDay())} 기록이 사라지고 처음부터 다시 시작해요.`
      : '기록을 처음부터 다시 설정해요.';
  openOverlay('failConfirm');
});

$('failCancel').addEventListener('click', () => closeOverlay('failConfirm'));

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

// ===== 습관 바꾸기 =====

function switchMode(next) {
  if (!HABITS[next]) return;
  closeHabitMenu();
  if (next === mode) return;
  mode = next;
  writeStore(KEY_MODE, mode);

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

// 습관 선택 메뉴
function buildHabitMenu() {
  const menu = $('habitMenu');
  if (!menu) return;
  menu.textContent = '';
  for (const cat of HABIT_CATEGORIES) {
    const group = document.createElement('div');
    group.className = 'habit-group';
    group.innerHTML = `<div class="habit-group-label">${cat.label}</div>`;
    for (const h of habitsInCategory(cat.id)) {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.habit = h.id;
      b.setAttribute('role', 'menuitem');
      if (h.id === mode) b.classList.add('active');
      const day = dayFor(getStartDate(h.id));
      b.innerHTML = `<span>${h.emoji}</span><span class="habit-item-name">${h.name}</span>` +
        (day > 0 ? `<span class="habit-item-day">${comma(day)}일째</span>` : '');
      b.addEventListener('click', () => switchMode(h.id));
      group.appendChild(b);
    }
    menu.appendChild(group);
  }
}

function openHabitMenu() {
  buildHabitMenu();
  $('habitMenu').classList.remove('hidden');
  $('habitBtn').setAttribute('aria-expanded', 'true');
}

function closeHabitMenu() {
  const m = $('habitMenu');
  if (!m) return;
  m.classList.add('hidden');
  $('habitBtn').setAttribute('aria-expanded', 'false');
}

$('habitBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  if ($('habitMenu').classList.contains('hidden')) openHabitMenu();
  else closeHabitMenu();
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('#habitMenu') && !e.target.closest('#habitBtn')) closeHabitMenu();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeHabitMenu();
});

// ===== 자동 실행 안내 배너 =====

const KEY_BANNER = 'qs.bannerDismissed';

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.matchMedia('(display-mode: window-controls-overlay)').matches
    || window.navigator.standalone === true;
}

function initInstallBanner() {
  const standalone = isStandalone();

  // 브라우저로 열었을 때만 카운터 주변에 사이트 홈이 펼쳐진다
  document.body.classList.toggle('web', !standalone);

  $('ghostBtn').textContent = standalone ? '자동 실행 설정' : '데스크탑에 설치';
  $('ghostBtn').href = standalone ? 'install.html#autostart' : 'install.html';

  const show = !standalone && readStore(KEY_BANNER) !== '1';
  setIfPresent('installBanner', (el) => el.classList.toggle('hidden', !show));
  document.body.classList.toggle('has-banner', show);
}

setIfPresent('bannerClose', (el) => el.addEventListener('click', () => {
  writeStore(KEY_BANNER, '1');
  $('installBanner').classList.add('hidden');
  document.body.classList.remove('has-banner');
}));

// ===== 시작 =====

migrateOldKeys();
initInstallBanner();

// 주소에 ?h=coffee 처럼 습관이 적혀 있으면 그걸 먼저 연다
const urlHabit = (location.search.match(/[?&]h=([a-z]+)/) || [])[1];
const savedMode = readStore(KEY_MODE);
if (HABITS[urlHabit]) mode = urlHabit;
else if (HABITS[savedMode]) mode = savedMode;
if (urlHabit && HABITS[urlHabit]) writeStore(KEY_MODE, mode);

applyModeLabels();
render();

if (getStartDate()) {
  setTimeout(checkMilestone, 600);
} else {
  fillOnboarding();
  openOverlay('onboarding');
}

// 남은 시간은 분 단위로 보여주므로 30초마다 다시 그린다.
setInterval(() => {
  const next = renderSnowNext.next;
  if (!next) return;
  if (next.target.getTime() - Date.now() <= 0) renderSnowball();
  else renderSnowNext(next);
}, 30000);

// 켜둔 채로 자정이 지나면 자동으로 갱신
setInterval(() => {
  if (currentDay() !== renderedDay) {
    render();
    checkMilestone();
  }
}, 60000);

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => { /* 무시 */ });
  });
}
