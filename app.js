'use strict';

// ===== 저장소 (localStorage를 못 쓰는 환경에서도 죽지 않게) =====

const KEY_START = 'qs.startDate';
const KEY_PRICE = 'qs.pricePerPack';
const KEY_CIGS = 'qs.cigsPerDay';
const KEY_CELEBRATED = 'qs.celebrated';

function readStore(key) {
  try { return window.localStorage.getItem(key); } catch (e) { return null; }
}

function writeStore(key, value) {
  try { window.localStorage.setItem(key, value); return true; } catch (e) { return false; }
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

// ===== 설정값 =====

function getStartDate() {
  return parseDate(readStore(KEY_START));
}

function setStartDate(d) {
  writeStore(KEY_START, toInputValue(d));
}

function getPricePerPack() {
  const v = Number(readStore(KEY_PRICE));
  return v > 0 ? v : CONFIG.pricePerPack;
}

function getCigsPerDay() {
  const v = Number(readStore(KEY_CIGS));
  return v > 0 ? v : CONFIG.cigsPerDay;
}

function moneyPerDay() {
  return (getCigsPerDay() / 20) * getPricePerPack();
}

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

// ===== 마일스톤 =====

function sortedMilestones() {
  return (CONFIG.milestones || []).slice().sort((a, b) => a - b);
}

function nextMilestone(day) {
  return sortedMilestones().find((m) => m > day) || null;
}

function prevMilestone(day) {
  const passed = sortedMilestones().filter((m) => m <= day);
  return passed.length ? passed[passed.length - 1] : 0;
}

// ===== 화면 그리기 =====

const $ = (id) => document.getElementById(id);

let renderedDay = null;

function render() {
  const day = currentDay();
  renderedDay = day;

  const nick = (CONFIG.nickname || '').trim();
  $('greeting').textContent = nick ? `${nick}님, 금연 중` : '금연 중';
  $('today').textContent = formatDate(new Date());

  if (day <= 0) {
    $('dayNum').textContent = '0';
    $('nextGoal').innerHTML = getStartDate()
      ? `<strong>${1 - day}일</strong> 뒤에 시작해요`
      : '시작일을 설정해 주세요';
  } else {
    $('dayNum').textContent = comma(day);
    const next = nextMilestone(day);
    $('nextGoal').innerHTML = next
      ? `다음 목표 <strong>${next}일</strong>까지 <strong>${next - day}일</strong> 남았어요`
      : '모든 목표를 다 넘었어요. 계속 가요!';
  }

  // 진행 링: 직전 마일스톤 → 다음 마일스톤 구간의 진행률
  const shown = Math.max(day, 0);
  const from = prevMilestone(shown);
  const to = nextMilestone(shown);
  const ratio = to ? Math.min(Math.max((shown - from) / (to - from), 0), 1) : 1;
  const circumference = 2 * Math.PI * 88;
  const ring = $('ringFg');
  ring.style.strokeDasharray = String(circumference);
  ring.style.strokeDashoffset = String(circumference * (1 - ratio));

  // 절약 금액 / 안 피운 담배
  $('saved').textContent = comma(shown * moneyPerDay()) + '원';
  $('notSmoked').textContent = comma(shown * getCigsPerDay()) + '개비';

  const start = getStartDate();
  $('startInfo').textContent = start
    ? `시작 ${start.getFullYear()}.${start.getMonth() + 1}.${start.getDate()}`
    : '시작일 미설정';
}

// ===== 축하 =====

function showCelebration(day) {
  const msg = (CONFIG.milestoneMessages || {})[day] || `${day}일 달성`;

  $('celeBadge').textContent = `${comma(day)}일`;
  $('celeMsg').textContent = msg;
  $('celeSub').textContent =
    `지금까지 ${comma(day * moneyPerDay())}원을 아꼈고, ` +
    `담배 ${comma(day * getCigsPerDay())}개비를 피우지 않았어요.`;

  $('celebration').classList.remove('hidden');
  particles.confetti(160);
  setTimeout(() => particles.confetti(120), 700);
  setTimeout(() => particles.confetti(120), 1500);
}

// 오늘이 마일스톤이고 아직 축하를 안 봤다면 띄운다
function checkMilestone() {
  const day = currentDay();
  if (day <= 0) return;
  if (!sortedMilestones().includes(day)) return;
  if (readStore(KEY_CELEBRATED) === String(day)) return;
  writeStore(KEY_CELEBRATED, String(day));
  showCelebration(day);
}

// 시작일을 바꾼 직후에 축하가 튀어나오지 않도록 눌러둔다
function suppressTodayCelebration() {
  writeStore(KEY_CELEBRATED, String(currentDay()));
}

// ===== 파티클 (축하 색종이 / 실패 잿가루) =====

const particles = (function () {
  const canvas = $('confetti');
  const ctx = canvas.getContext('2d');
  const colors = ['#4ade80', '#facc15', '#60a5fa', '#f472b6', '#fb923c', '#ffffff'];
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

  function confetti(count) {
    for (let i = 0; i < count; i++) {
      items.push({
        kind: 'confetti',
        x: canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.6,
        y: canvas.height * 0.45 + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 9,
        vy: Math.random() * -11 - 3,
        size: Math.random() * 6 + 4,
        color: colors[(Math.random() * colors.length) | 0],
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

// ===== 오버레이 제어 =====

function openOverlay(id) { $(id).classList.remove('hidden'); }
function closeOverlay(id) { $(id).classList.add('hidden'); }

// 첫 실행 설정
$('obSave').addEventListener('click', () => {
  const d = parseDate($('obStart').value);
  if (!d) { $('obStart').focus(); return; }
  const price = Number($('obPrice').value);
  const cigs = Number($('obCigs').value);
  if (!(price >= 0)) { $('obPrice').focus(); return; }
  if (!(cigs > 0)) { $('obCigs').focus(); return; }

  setStartDate(d);
  writeStore(KEY_PRICE, String(price));
  writeStore(KEY_CIGS, String(cigs));
  closeOverlay('onboarding');
  render();
  checkMilestone();
});

// 축하
$('celeClose').addEventListener('click', () => closeOverlay('celebration'));

$('previewBtn').addEventListener('click', () => {
  const day = currentDay();
  showCelebration(day > 0 ? (nextMilestone(day - 1) || day) : 1);
});

// 설정
$('settingsBtn').addEventListener('click', () => {
  $('startInput').value = toInputValue(getStartDate() || new Date());
  $('priceInput').value = String(getPricePerPack());
  $('cigsInput').value = String(getCigsPerDay());
  openOverlay('settings');
});

$('settingsCancel').addEventListener('click', () => closeOverlay('settings'));

$('settingsSave').addEventListener('click', () => {
  const d = parseDate($('startInput').value);
  if (!d) { $('startInput').focus(); return; }
  const price = Number($('priceInput').value);
  const cigs = Number($('cigsInput').value);
  if (!(price >= 0)) { $('priceInput').focus(); return; }
  if (!(cigs > 0)) { $('cigsInput').focus(); return; }

  setStartDate(d);
  writeStore(KEY_PRICE, String(price));
  writeStore(KEY_CIGS, String(cigs));
  suppressTodayCelebration();
  closeOverlay('settings');
  render();
});

// 실패 → 확인
$('failBtn').addEventListener('click', () => {
  const day = Math.max(currentDay(), 0);
  $('failConfirmMsg').textContent =
    day > 0
      ? `지금까지 쌓은 ${comma(day)}일과 ${comma(day * moneyPerDay())}원 기록이 사라지고 처음부터 다시 시작해요.`
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

// 재시작
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

// ===== 시작 =====

render();

if (getStartDate()) {
  setTimeout(checkMilestone, 600);
} else {
  // 처음 여는 사람에게는 설정부터 묻는다
  $('obStart').value = toInputValue(new Date());
  $('obPrice').value = String(CONFIG.pricePerPack);
  $('obCigs').value = String(CONFIG.cigsPerDay);
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
