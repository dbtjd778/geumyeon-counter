const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require.resolve('../app.js'), 'utf8');
const context = vm.createContext({ H: () => ({}), isKcal: () => false, isTime: () => false });
// Exercise production formatting without loading browser UI/event handlers.
for (const name of ['comma', 'fmtMain']) {
  const body = source.match(new RegExp(`function ${name}\\([^]*?\\n\\}`))[0];
  vm.runInContext(body, context);
}
assert.equal(context.fmtMain((2 / 7 * 30000) * 7), '60,000원');
assert.equal(context.fmtMain((2 / 7 * 30000) * 30), '257,143원');
assert.equal(context.fmtMain((10 / 20 * 4500) * 7), '15,750원');
assert.equal(context.fmtMain(0), '0원');
assert.equal(context.fmtMain(1.49), '1원');
assert.equal(context.fmtMain(1.5), '2원');
console.log('PASS: fractional weekly costs, whole won rounding, smoke savings and zero');
