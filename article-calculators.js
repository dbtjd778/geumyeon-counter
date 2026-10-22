(function () {
  'use strict';
  function number(value, min, max) {
    if (value === '' || value === null || value === undefined || typeof value === 'boolean') throw new Error('값을 모두 입력해 주세요.');
    const n = Number(value);
    if (!Number.isFinite(n) || n < min || n > max) throw new Error('각 항목의 입력 범위를 확인해 주세요.');
    return n;
  }
  function caffeine(dose, hours, half) {
    return number(dose, 0, 2000) * Math.pow(0.5, number(hours, 0, 168) / number(half, 1, 24));
  }
  function sugar(amount, serving, volume, cube) {
    const grams = number(amount, 0, 500) * number(volume, 0, 10000) / number(serving, 1, 10000);
    return { grams, cubes: grams / number(cube, 0.1, 50) };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { caffeine, sugar };
  if (typeof document === 'undefined') return;
  const format = n => n.toLocaleString('ko-KR', { maximumFractionDigits: 1 });
  function connect(id, resultId, compute) {
    const form = document.getElementById(id);
    if (!form) return;
    const result = document.getElementById(resultId);
    form.addEventListener('input', () => { result.textContent = '입력값을 바꿨어요. 계산 버튼을 눌러 확인하세요.'; });
    form.addEventListener('submit', event => {
      event.preventDefault();
      try {
        if (!form.reportValidity()) return;
        result.textContent = compute(name => form.elements.namedItem(name).value);
      } catch (error) { result.textContent = error.message; }
    });
  }
  connect('caffeineForm', 'caffeineResult', get => {
    const left = caffeine(get('dose'), get('hours'), get('half'));
    return `${get('hours')}시간 뒤 계산상 약 ${format(left)}mg이 남아요. 반감기 ${get('half')}시간 가정이며, 수면 가능 여부나 실제 혈중 농도는 알 수 없어요.`;
  });
  connect('sugarLabelForm', 'sugarLabelResult', get => {
    const value = sugar(get('sugar'), get('serving'), get('volume'), get('cube'));
    return `${get('volume')}mL의 당류는 ${format(value.grams)}g, 각설탕 ${get('cube')}g 기준 약 ${format(value.cubes)}개 분량이에요. 자유당 권고 충족 여부를 판정하는 값은 아니에요.`;
  });
})();
