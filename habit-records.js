'use strict';
(function () {
  const $ = id => document.getElementById(id);
  const { RecordStore, dateKey, weekDays } = window.HabitRecordsStore;
  // Lazy access lets the UI report denied storage without interrupting the counter.
  const storage = {
    getItem: key => window.localStorage.getItem(key),
    setItem: (key, value) => window.localStorage.setItem(key, value),
    key: n => window.localStorage.key(n),
    get length() { return window.localStorage.length; },
  };
  const store = new RecordStore(storage, Object.keys(HABITS));
  const units = { smoke: ['개비', 1000], drink: ['회', 1000], coffee: ['잔', 1000], soda: ['잔', 1000], reels: ['분', 1440], game: ['분', 1440], wake: ['일', 1] };
  let habit = 'smoke', noteDay = dateKey(new Date()), week = weekDays(noteDay)[0], usageDay = noteDay, limit = 10;
  const drafts = new Map();
  let goalToken = null, usageToken = null, goalDirty = false, usageDirty = false;
  const weeklyDrafts = new Map();
  let noteReady = false, goalReady = false, usageReady = false;
  function today() { return dateKey(new Date()); }
  function say(id, text, error = false) { $(id).textContent = text; $(id).classList.toggle('is-error', error); }
  function noteID() { return `${habit}.${noteDay}`; }
  function unit() { return units[habit] || ['회', 1000]; }
  function keepWeekDraft() {
    if (goalDirty) weeklyDrafts.set(`${habit}.goal.${week}`, { baseline: $('reduceBaseline').value, target: $('reduceTarget').value, token: goalToken });
    if (usageDirty) weeklyDrafts.set(`${habit}.usage.${usageDay}`, { amount: $('reduceAmount').value, token: usageToken });
  }
  function renderNote() {
    $('noteDate').max = today(); $('noteDate').value = noteDay;
    noteReady = false;
    try {
      if (!drafts.has(noteID())) {
        const saved = store.read(habit, 'note', noteDay);
        drafts.set(noteID(), { text: saved.value || '', token: saved.token, saved: saved.value || '' });
      }
      const draft = drafts.get(noteID());
      $('noteText').value = draft.text;
      $('noteSave').textContent = draft.token === null ? '일지 저장' : '수정 저장';
      say('noteStatus', draft.text !== draft.saved ? '아직 저장하지 않은 메모예요.' : draft.token === null ? '한 줄이면 충분해요. 잘 안 된 날도 편하게 남겨요.' : '저장된 일지예요. 내용을 고쳐 다시 저장할 수 있어요.');
      noteReady = true;
    } catch (error) { $('noteText').value = ''; say('noteStatus', error.message, true); }
    $('noteText').disabled = !noteReady; $('noteSave').disabled = !noteReady;
    $('noteLength').textContent = `${$('noteText').value.length} / 1,000자`;
  }
  function history() {
    const list = $('noteHistory'); list.replaceChildren();
    try {
      const notes = store.notes(habit);
      $('noteHistoryCount').textContent = `${notes.length}일의 기록`;
      $('noteMore').hidden = notes.length <= limit;
      if (!notes.length) { const p = document.createElement('p'); p.className = 'record-help'; p.textContent = '첫 일지를 남겨보세요. 저장한 기록이 여기에 모여요.'; list.append(p); }
      for (const note of notes.slice(0, limit)) {
        const item = document.createElement('article'); item.className = 'note-entry';
        const header = document.createElement('div'); header.className = 'record-row';
        const time = document.createElement('time'); time.dateTime = note.day; time.textContent = note.day;
        const edit = document.createElement('button'); edit.type = 'button'; edit.textContent = '보기·수정'; edit.setAttribute('aria-label', `${note.day} 일지 보기·수정`);
        edit.addEventListener('click', () => { noteDay = note.day; renderNote(); $('noteText').focus(); });
        const text = document.createElement('p'); text.textContent = note.text;
        header.append(time, edit); item.append(header, text); list.append(item);
      }
    } catch (error) { say('noteHistoryCount', error.message, true); $('noteMore').hidden = true; }
  }
  function renderUsage() {
    usageReady = false; usageDirty = false;
    try {
      const saved = store.read(habit, 'usage', usageDay);
      const draft = weeklyDrafts.get(`${habit}.usage.${usageDay}`);
      usageToken = draft ? draft.token : saved.token;
      $('reduceAmount').value = draft ? draft.amount : saved.value === null ? '' : saved.value;
      usageDirty = !!draft; usageReady = true;
      say('usageStatus', draft ? '아직 저장하지 않은 이용량이에요.' : saved.value === null ? '이용하지 않은 날도 0으로 저장하면 기록한 날로 표시돼요.' : '저장된 이용량이에요. 고쳐서 다시 저장할 수 있어요.');
    } catch (error) { say('usageStatus', error.message, true); }
    $('usageSave').disabled = !usageReady;
  }
  function renderWeek() {
    const days = weekDays(week), [label, max] = unit();
    goalReady = false; goalDirty = false;
    $('weekLabel').textContent = `${days[0].slice(5).replace('-', '/')} ~ ${days[6].slice(5).replace('-', '/')} (${days[0].slice(0, 4)})`;
    $('weekNext').disabled = week >= weekDays(today())[0];
    $('reduceBaselineLabel').textContent = `평소 주간량 (${label})`;
    $('reduceTargetLabel').textContent = `이번 주 목표 (${label})`;
    $('reduceAmountLabel').textContent = `${habit === 'wake' ? '늦게 일어난 날이면 1, 아니면 0' : '이날 실제 이용량'} (${label})`;
    $('reduceUnitHelp').textContent = habit === 'wake' ? '정해둔 기상 시간보다 늦게 일어난 날 수를 줄여봐요.' : `월요일부터 일요일까지 ${label} 단위로 기록해요. 목표를 넘어도 기록은 계속 남아요.`;
    $('reduceBaseline').max = $('reduceTarget').max = max * 7; $('reduceAmount').max = max;
    $('usageDate').replaceChildren();
    for (const day of days.filter(d => d <= today())) {
      const option = document.createElement('option'); option.value = day; option.textContent = `${day} (${['월','화','수','목','금','토','일'][days.indexOf(day)]})`; $('usageDate').append(option);
    }
    if (!days.includes(usageDay) || usageDay > today()) usageDay = week === weekDays(today())[0] ? today() : days[0];
    $('usageDate').value = usageDay;
    try {
      const saved = store.read(habit, 'goal', week), draft = weeklyDrafts.get(`${habit}.goal.${week}`);
      goalToken = draft ? draft.token : saved.token;
      $('reduceBaseline').value = draft ? draft.baseline : saved.value ? saved.value.baseline : '';
      $('reduceTarget').value = draft ? draft.target : saved.value ? saved.value.target : '';
      goalDirty = !!draft; goalReady = true;
      say('goalStatus', draft ? '아직 저장하지 않은 목표예요.' : saved.value ? '이 주의 목표가 저장되어 있어요.' : '이 주의 목표를 정해 주세요. 지난 주 목표는 바뀌지 않아요.');
    } catch (error) { say('goalStatus', error.message, true); }
    $('goalSave').disabled = !goalReady;
    renderUsage(); summary();
  }
  function summary() {
    try {
      const days = weekDays(week), entries = days.map(day => ({ day, amount: store.read(habit, 'usage', day).value }));
      const recorded = entries.filter(entry => entry.amount !== null), total = recorded.reduce((sum, entry) => sum + entry.amount, 0);
      const goal = store.read(habit, 'goal', week).value, label = unit()[0];
      $('reduceSummary').textContent = `기록한 ${recorded.length}/7일 · 총 ${total.toLocaleString('ko-KR')}${label}`;
      const progress = $('reduceProgress'); progress.hidden = !goal;
      if (goal) {
        progress.max = Math.max(1, goal.target); progress.value = Math.min(total, progress.max);
        progress.setAttribute('aria-label', `주간 목표 ${goal.target}${label} 중 기록한 이용량 ${total}${label}`);
        let text = `평소 ${goal.baseline}${label} → 목표 ${goal.target}${label}. `;
        text += total <= goal.target ? `목표까지 ${goal.target - total}${label} 남았어요.` : `목표보다 ${total - goal.target}${label} 많아요. 기록을 이어가며 다음 행동을 골라봐요.`;
        if (recorded.length === 7 && days[6] < today()) {
          text += total <= goal.target ? ' 이 주의 목표를 지켰어요.' : '';
          text += total < goal.baseline ? ` 평소보다 ${goal.baseline - total}${label} 적게 이용했어요.` : '';
        }
        $('reduceResult').textContent = text;
      } else $('reduceResult').textContent = '목표를 저장하면 남은 목표량을 함께 볼 수 있어요.';
      $('reduceCoverage').textContent = '빈 날짜는 0이 아닌 미기록이에요. 입력한 이용량만 합산하며, 카운터의 일수·추정 절약액은 바꾸지 않아요.';
      const list = $('usageHistory'); list.replaceChildren();
      for (const entry of entries) {
        const row = document.createElement('li');
        row.textContent = `${entry.day.slice(5).replace('-', '/')} · ${entry.day > today() ? '아직 오지 않은 날' : entry.amount === null ? '미기록' : entry.amount + label}`;
        list.append(row);
      }
    } catch (error) { $('reduceSummary').textContent = '기록 확인 필요'; $('reduceResult').textContent = error.message; $('reduceProgress').hidden = true; $('usageHistory').replaceChildren(); }
  }
  for (const h of Object.values(HABITS)) {
    const option = document.createElement('option'); option.value = h.id; option.textContent = `${h.emoji} ${h.name}`; $('recordHabit').append(option);
  }
  function setHabit(next) {
    if (!HABITS[next]) return;
    keepWeekDraft(); habit = next; $('recordHabit').value = habit; limit = 10;
    $('recordHeading').textContent = `${HABITS[habit].name} · 매일의 기록`;
    renderNote(); history(); renderWeek();
  }
  $('recordHabit').addEventListener('change', () => setHabit($('recordHabit').value));
  $('noteDate').addEventListener('change', () => {
    const next = $('noteDate').value;
    try { store.key(habit, 'note', next); if (next > today()) throw new Error('오늘이나 지난 날짜를 골라주세요.'); noteDay = next; renderNote(); }
    catch (error) { $('noteDate').value = noteDay; say('noteStatus', error.message, true); }
  });
  $('noteToday').addEventListener('click', () => { noteDay = today(); renderNote(); });
  $('noteText').addEventListener('input', () => {
    if (!noteReady) return;
    drafts.get(noteID()).text = $('noteText').value;
    $('noteLength').textContent = `${$('noteText').value.length} / 1,000자`;
    say('noteStatus', '아직 저장하지 않은 메모예요.');
  });
  $('noteSave').addEventListener('click', () => {
    if (!noteReady) return;
    const draft = drafts.get(noteID());
    try {
      const saved = store.save(habit, 'note', noteDay, draft.text, draft.token);
      drafts.set(noteID(), { text: saved.value, saved: saved.value, token: saved.token });
      renderNote(); history(); say('noteStatus', `${noteDay} 일지를 저장했어요.`);
    } catch (error) { say('noteStatus', error.message, true); }
  });
  $('noteMore').addEventListener('click', () => { limit += 10; history(); });
  for (const id of ['reduceBaseline', 'reduceTarget']) $(id).addEventListener('input', () => { goalDirty = true; say('goalStatus', '아직 저장하지 않은 목표예요.'); });
  $('reduceAmount').addEventListener('input', () => { usageDirty = true; say('usageStatus', '아직 저장하지 않은 이용량이에요.'); });
  $('goalSave').addEventListener('click', () => {
    if (!goalReady) return;
    if (!['reduceBaseline','reduceTarget'].every(id => $(id).reportValidity())) return;
    try {
      store.save(habit, 'goal', week, { baseline: Number($('reduceBaseline').value), target: Number($('reduceTarget').value) }, goalToken);
      goalDirty = false; weeklyDrafts.delete(`${habit}.goal.${week}`); keepWeekDraft(); renderWeek(); say('goalStatus', '이 주의 목표를 저장했어요.');
    } catch (error) { say('goalStatus', error.message, true); }
  });
  $('usageSave').addEventListener('click', () => {
    if (!usageReady || !$('reduceAmount').reportValidity()) return;
    try {
      store.save(habit, 'usage', usageDay, Number($('reduceAmount').value), usageToken);
      usageDirty = false; weeklyDrafts.delete(`${habit}.usage.${usageDay}`); renderUsage(); summary(); say('usageStatus', `${usageDay} 이용량을 저장했어요.`);
    } catch (error) { say('usageStatus', error.message, true); }
  });
  $('usageDate').addEventListener('change', () => { keepWeekDraft(); usageDay = $('usageDate').value; renderUsage(); });
  function moveWeek(offset) {
    keepWeekDraft(); const date = new Date(week + 'T12:00:00'); date.setDate(date.getDate() + offset * 7); week = dateKey(date); renderWeek();
  }
  $('weekPrev').addEventListener('click', () => moveWeek(-1));
  $('weekNext').addEventListener('click', () => { if (week < weekDays(today())[0]) moveWeek(1); });
  $('weekToday').addEventListener('click', () => { keepWeekDraft(); week = weekDays(today())[0]; usageDay = today(); renderWeek(); });
  window.addEventListener('beforeunload', event => {
    if ([...drafts.values()].some(draft => draft.text !== draft.saved) || goalDirty || usageDirty || weeklyDrafts.size) { event.preventDefault(); event.returnValue = ''; }
  });
  window.addEventListener('storage', event => {
    if (event.key === null || event.key.startsWith('qs.records.v1.')) {
      for (const [key, draft] of drafts) if (draft.text === draft.saved) drafts.delete(key);
      keepWeekDraft(); renderNote(); history(); renderWeek();
    }
  });
  window.HabitRecords = { setHabit };
})();
