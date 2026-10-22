/* Habit notes and reduction records stay in this browser, separate from counters. */
(function (root) {
  'use strict';
  const PREFIX = 'qs.records.v1.';
  function dateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  function parseDay(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('날짜를 다시 확인해 주세요.');
    const [y, m, d] = value.split('-').map(Number);
    const date = new Date(y, m - 1, d, 12);
    if (dateKey(date) !== value) throw new Error('날짜를 다시 확인해 주세요.');
    return date;
  }
  function weekDays(value) {
    const start = parseDay(value);
    start.setDate(start.getDate() - (start.getDay() + 6) % 7);
    return Array.from({ length: 7 }, (_, n) => {
      const date = new Date(start); date.setDate(date.getDate() + n); return dateKey(date);
    });
  }
  class RecordStore {
    constructor(storage, habits, today = () => dateKey(new Date())) {
      this.storage = storage; this.habits = habits; this.today = today;
    }
    key(habit, type, day) {
      if (!this.habits.includes(habit) || !['note', 'goal', 'usage'].includes(type)) throw new Error('습관을 다시 선택해 주세요.');
      parseDay(day);
      return `${PREFIX}${habit}.${type}.${day}`;
    }
    read(habit, type, day) {
      const key = this.key(habit, type, day);
      let token;
      try { token = this.storage.getItem(key); } catch (_) { throw new Error('이 브라우저의 기록 저장소를 열 수 없어요. 사이트 데이터 허용 설정을 확인해 주세요.'); }
      if (token === null) return { value: null, token };
      let value;
      try { value = JSON.parse(token); } catch (_) { throw new Error('저장된 기록을 읽을 수 없어요. 기존 기록을 덮어쓰지 않았어요.'); }
      const valid = type === 'note' ? typeof value === 'string' && value.length <= 1000
        : type === 'usage' ? Number.isInteger(value) && value >= 0 && value <= 10000
        : value && Number.isInteger(value.baseline) && Number.isInteger(value.target) && value.baseline > 0 && value.baseline <= 70000 && value.target >= 0 && value.target <= value.baseline;
      if (!valid) throw new Error('저장된 기록 형식을 확인할 수 없어요. 기존 기록을 덮어쓰지 않았어요.');
      return { value, token };
    }
    save(habit, type, day, value, expected) {
      if (day > this.today()) throw new Error('오늘이나 지난 날짜에 기록해 주세요.');
      if (type === 'note') {
        if (typeof value !== 'string' || !value.trim() || value.length > 1000) throw new Error('메모를 1~1,000자 안으로 적어주세요.');
        value = value.trim();
      } else if (type === 'usage') {
        if (!Number.isInteger(value) || value < 0 || value > 10000) throw new Error('이용량을 0 이상의 정수로 적어주세요.');
      } else if (type === 'goal') {
        if (weekDays(day)[0] !== day || !value || !Number.isInteger(value.baseline) || !Number.isInteger(value.target) || value.baseline <= 0 || value.baseline > 70000 || value.target < 0 || value.target > value.baseline) throw new Error('평소 주간량보다 같거나 적은 목표를 정해 주세요.');
      }
      const current = this.read(habit, type, day);
      if (current.token !== expected) throw new Error('다른 창에서 이 기록이 바뀌었어요. 새로고침 후 확인해 주세요. 작성 중인 내용은 먼저 복사해 주세요.');
      const token = JSON.stringify(value);
      try { this.storage.setItem(this.key(habit, type, day), token); }
      catch (_) { throw new Error('저장하지 못했어요. 작성 내용은 그대로 있으니 복사해 두고 저장 공간을 확인해 주세요.'); }
      return { value, token };
    }
    notes(habit) {
      const prefix = this.key(habit, 'note', this.today()).slice(0, -10);
      const dates = [];
      try {
        for (let n = 0; n < this.storage.length; n++) {
          const key = this.storage.key(n);
          if (key && key.startsWith(prefix)) dates.push(key.slice(prefix.length));
        }
      } catch (_) { throw new Error('지난 기록을 불러오지 못했어요.'); }
      return dates.sort().reverse().map(day => ({ day, text: this.read(habit, 'note', day).value }));
    }
  }
  const api = { RecordStore, dateKey, weekDays, parseDay };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HabitRecordsStore = api;
})(typeof window !== 'undefined' ? window : globalThis);
