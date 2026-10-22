const assert = require('node:assert/strict');
const { RecordStore, weekDays, parseDay } = require('../habit-records-store.js');
class MemoryStorage {
  data = new Map(); fail = false;
  get length() { return this.data.size; }
  key(n) { return [...this.data.keys()][n]; }
  getItem(k) { return this.data.get(k) ?? null; }
  setItem(k, v) { if (this.fail) throw Error('quota'); this.data.set(k, v); }
}
const storage = new MemoryStorage();
const store = new RecordStore(storage, ['smoke', 'delivery', 'coffee'], () => '2026-10-22');
store.save('smoke', 'note', '2026-10-21', '산책으로 넘겼어요.', null);
store.save('delivery', 'note', '2026-10-21', '<script>메모는 텍스트</script>', null);
store.save('delivery', 'note', '2026-10-22', '집에서 먹었어요.\n괜찮았어요.', null);
assert.deepEqual(store.notes('delivery').map(n => n.day), ['2026-10-22', '2026-10-21']);
assert.equal(store.notes('smoke').length, 1);
assert.equal(new RecordStore(storage, ['smoke','delivery']).read('delivery','note','2026-10-22').value, '집에서 먹었어요.\n괜찮았어요.');
const saved = store.read('smoke','note','2026-10-21');
store.save('smoke','note','2026-10-21','수정한 기록',saved.token);
assert.throws(() => store.save('smoke','note','2026-10-21','오래된 창의 수정',saved.token), /다른 창/);
assert.throws(() => store.save('smoke','note','2026-10-23','미래',null), /오늘이나/);
assert.throws(() => store.save('smoke','note','2026-10-22','   ',null), /메모/);
assert.throws(() => store.save('smoke','note','2026-10-22','a'.repeat(1001),null), /메모/);
assert.throws(() => parseDay('2026-02-30'));
assert.equal(weekDays('2026-10-25')[0], '2026-10-19');
assert.equal(weekDays('2026-10-26')[0], '2026-10-26');
assert.deepEqual(weekDays('2027-01-01'), ['2026-12-28','2026-12-29','2026-12-30','2026-12-31','2027-01-01','2027-01-02','2027-01-03']);
store.save('delivery','goal','2026-10-19',{baseline:5,target:2},null);
store.save('delivery','goal','2026-10-12',{baseline:5,target:3},null);
store.save('delivery','usage','2026-10-19',0,null);
store.save('delivery','usage','2026-10-20',3,null);
assert.equal(store.read('delivery','usage','2026-10-21').value, null);
assert.equal(store.read('delivery','usage','2026-10-19').value, 0);
assert.equal(store.read('delivery','goal','2026-10-19').value.target, 2);
assert.equal(store.read('delivery','goal','2026-10-12').value.target, 3);
assert.throws(() => store.save('coffee','goal','2026-10-19',{baseline:5,target:6},null));
store.save('coffee','goal','2026-10-19',{baseline:5,target:0},null);
assert.throws(() => store.save('coffee','usage','2026-10-22',-1,null));
const before = storage.getItem(store.key('smoke','note','2026-10-21'));
storage.fail = true;
assert.throws(() => store.save('smoke','note','2026-10-21','저장 실패',before), /저장하지 못/);
assert.equal(storage.getItem(store.key('smoke','note','2026-10-21')), before);
storage.fail = false;
storage.setItem(store.key('coffee','note','2026-10-21'), '{broken');
assert.throws(() => store.save('coffee','note','2026-10-21','덮어쓰기',null), /읽을 수 없/);
assert.equal(storage.getItem(store.key('coffee','note','2026-10-21')), '{broken');
console.log('PASS: habit isolation, history order, reload/edit, stale-write protection, date/length validation, weekly boundaries, zero vs missing, goal isolation, quota and corrupt-data protection');
