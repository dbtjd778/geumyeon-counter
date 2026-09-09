'use strict';

// ===== 끊을 수 있는 습관 목록 =====
// 카운터는 하나의 엔진이고, 여기 등록된 습관을 데이터로 읽어 화면을 그린다.
// 새 습관을 추가하려면 이 목록에 항목을 하나 더 넣으면 된다.
//
// 저장 키는 qs.<id>.<field> 다. 담배(smoke)와 술(drink)은 예전부터 쓰던
// 키 이름(cigsPerDay, pricePerPack, drinksPerWeek, costPerDrink)을 그대로
// 유지해야 기존 사용자의 기록이 살아 있다.
//
// metric
//   money : 아낀 돈이 본체. perDay() 가 { money, count } 를 돌려준다.
//   time  : 되찾은 시간이 본체. perDay() 가 { minutes, count } 를 돌려준다.
//
// fields 는 첫 설정·설정 화면에 그대로 그려지는 입력칸이다.
// get(key) 는 저장된 값을, num(key, fallback) 은 양수 숫자를 돌려준다.

const HABIT_CATEGORIES = [
  { id: 'health', label: '건강', lead: '몸에 직접 남는 것부터' },
  { id: 'food', label: '식습관', lead: '매일 입에 들어가는 것' },
  { id: 'life', label: '생활습관', lead: '시간과 돈이 새는 곳' },
];

// ===== 칼로리로 세는 습관(밀가루·간식)에서 쓰는 값 =====
// 1회 섭취 기준의 어림값이다. 제품마다 차이가 크므로 정확한 수치가 아니라
// "대충 이 정도"를 보여주는 용도로만 쓴다.
//
// 환산 기준
//   러닝머신 걷기 1시간 ≈ 330kcal
//   1만 걸음 ≈ 350kcal
//   체지방 1kg ≈ 7,700kcal

const KCAL_PER_TREADMILL_HOUR = 330;
const KCAL_PER_10K_STEPS = 350;
const KCAL_PER_FAT_KG = 7700;

const FLOUR_KINDS = {
  bread: { kcal: 400, cubes: 12, won: 6000 },
  noodle: { kcal: 500, cubes: 15, won: 2000 },
  delivery: { kcal: 750, cubes: 20, won: 15000 },
};

const SNACK_KINDS = {
  store: { kcal: 350, won: 4000 },
  drink: { kcal: 450, won: 6000 },
  dessert: { kcal: 650, won: 12000 },
};

// 칼로리 → "3시간 20분" (러닝머신 걷기 기준)
function treadmillText(kcal) {
  const mins = Math.round((kcal / KCAL_PER_TREADMILL_HOUR) * 60);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return comma(h) + '시간 ' + m + '분';
  if (h > 0) return comma(h) + '시간';
  return m + '분';
}

// 칼로리 → 체지방 kg (소수점 한 자리)
function fatKg(kcal) {
  return (Math.round((kcal / KCAL_PER_FAT_KG) * 10) / 10).toFixed(1);
}

// 아낀 돈이 넘어선 가장 큰 선. 넘은 게 없으면 null.
const SNACK_REWARDS = [
  { won: 1000000, text: '노트북 한 대 값' },
  { won: 500000, text: '해외여행 항공권 값' },
  { won: 300000, text: '무선 이어폰 하나' },
  { won: 150000, text: '오마카세 예약 가능' },
  { won: 50000, text: '치킨 세트 획득' },
  { won: 20000, text: '영화 두 편' },
];

function snackReward(won) {
  for (const r of SNACK_REWARDS) {
    if (won >= r.won) return r.text;
  }
  return null;
}

const HABITS = {
  smoke: {
    id: 'smoke',
    cat: 'health',
    emoji: '🚬',
    name: '담배',
    verb: '금연',
    startLabel: '금연 시작일',
    failLabel: '금연 실패',
    countLabel: '안 피운 담배',
    metric: 'money',
    tagline: '하루 반 갑이면 1년에 약 82만 원',
    obLead: '딱 한 번만 설정하면, 이후로는 알아서 세어드려요.',
    guideHref: 'guide.html',
    guideLabel: '금연 정보',
    testHref: 'test-smoke.html',
    testEmoji: '🚬',
    testTitle: '흡연 & 금연 성향 테스트',
    testSub: '나에게 맞는 금연 전략은?',
    profile: true,   // 성별·나이 입력 (평균 비교용)
    fields: [
      { key: 'pricePerPack', label: '한 갑 가격 (원)', type: 'number', min: 0, step: 100, def: 4500, inputmode: 'numeric' },
      { key: 'cigsPerDay', label: '하루 흡연량 (개비)', type: 'number', min: 1, step: 0.1, def: 20, inputmode: 'decimal',
        note: '실제로 피우던 양을 알면 그걸 넣는 쪽이 정확해요.' },
    ],
    perDay: (num) => ({
      money: (num('cigsPerDay', 20) / 20) * num('pricePerPack', 4500),
      count: num('cigsPerDay', 20),
    }),
    countText: (n) => comma(n) + '개비',
    celebrateText: (n) => `담배 ${comma(n)}개비를 피우지 않았어요.`,
  },

  drink: {
    id: 'drink',
    cat: 'health',
    emoji: '🍺',
    name: '술',
    verb: '금주',
    startLabel: '금주 시작일',
    failLabel: '금주 실패',
    countLabel: '안 마신 술자리',
    metric: 'money',
    tagline: '주 3회 3만 원이면 1년에 약 470만 원',
    obLead: '끊기 전에 보통 어땠는지를 넣어주세요.',
    guideHref: 'guide-drink.html',
    guideLabel: '금주 정보',
    testHref: 'test.html',
    testEmoji: '🍻',
    testTitle: '술자리 성격 테스트',
    testSub: '나는 어떤 타입이었을까?',
    fields: [
      { key: 'drinksPerWeek', label: '일주일에 몇 번', type: 'number', min: 0.5, max: 21, step: 0.5, def: 3, inputmode: 'decimal' },
      { key: 'costPerDrink', label: '한 번에 쓰던 돈 (원)', type: 'number', min: 0, step: 1000, def: 30000, inputmode: 'numeric',
        note: '술값에 안주와 택시비까지 넣으면 실제 절약액에 가까워져요.' },
    ],
    perDay: (num) => ({
      money: (num('drinksPerWeek', 3) / 7) * num('costPerDrink', 30000),
      count: num('drinksPerWeek', 3) / 7,
    }),
    countText: (n) => comma(Math.round(n)) + '번',
    celebrateText: (n) => `술자리 ${comma(Math.round(n))}번을 넘겼어요.`,
  },

  coffee: {
    id: 'coffee',
    cat: 'food',
    emoji: '☕',
    name: '커피',
    verb: '커피 끊기',
    startLabel: '커피 끊은 날',
    failLabel: '마셨어요',
    countLabel: '안 마신 커피',
    metric: 'money',
    tagline: '하루 두 잔이면 1년에 약 330만 원',
    obLead: '카페인을 줄이려는 것이든 커피값을 아끼려는 것이든, 세는 방법은 같아요.',
    guideHref: 'quit-coffee.html',
    guideLabel: '커피 끊기 안내',
    testHref: 'test-food.html',
    testEmoji: '🍔',
    testTitle: '식습관 성향 테스트',
    testSub: '눈앞의 햄버거, 나는 어떻게 하나',
    fields: [
      { key: 'cupsPerDay', label: '하루 몇 잔', type: 'number', min: 0.5, max: 20, step: 0.5, def: 2, inputmode: 'decimal' },
      { key: 'pricePerCup', label: '한 잔 가격 (원)', type: 'number', min: 0, step: 100, def: 4500, inputmode: 'numeric',
        note: '집에서 내려 마시던 커피라면 0원으로 두고 잔 수만 세어도 돼요.' },
    ],
    perDay: (num) => ({
      money: num('cupsPerDay', 2) * num('pricePerCup', 4500),
      count: num('cupsPerDay', 2),
    }),
    countText: (n) => comma(Math.round(n)) + '잔',
    celebrateText: (n) => `커피 ${comma(Math.round(n))}잔을 안 마셨어요.`,
  },

  soda: {
    id: 'soda',
    cat: 'food',
    emoji: '🥤',
    name: '탄산음료',
    verb: '탄산 끊기',
    startLabel: '탄산 끊은 날',
    failLabel: '마셨어요',
    countLabel: '안 마신 탄산',
    metric: 'money',
    tagline: '하루 한 캔이면 1년에 각설탕 약 3,300개',
    obLead: '콜라 한 캔(250ml)에는 각설탕 9개 분량의 당이 들어 있어요.',
    guideHref: 'quit-soda.html',
    guideLabel: '탄산 끊기 안내',
    testHref: 'test-food.html',
    testEmoji: '🍔',
    testTitle: '식습관 성향 테스트',
    testSub: '눈앞의 햄버거, 나는 어떻게 하나',
    fields: [
      { key: 'cansPerDay', label: '하루 몇 캔', type: 'number', min: 0.5, max: 20, step: 0.5, def: 1, inputmode: 'decimal' },
      { key: 'pricePerCan', label: '한 캔 가격 (원)', type: 'number', min: 0, step: 100, def: 1800, inputmode: 'numeric' },
    ],
    perDay: (num) => ({
      money: num('cansPerDay', 1) * num('pricePerCan', 1800),
      count: num('cansPerDay', 1),
    }),
    countText: (n) => comma(Math.round(n)) + '캔',
    // 캔당 당류 약 27g, 각설탕 하나를 3g 으로 잡는다
    celebrateText: (n) => `탄산 ${comma(Math.round(n))}캔, 각설탕으로 약 ${comma(Math.round(n * 9))}개를 안 먹었어요.`,
  },

  flour: {
    id: 'flour',
    cat: 'food',
    emoji: '🍞',
    name: '밀가루',
    verb: '밀가루 끊기',
    startLabel: '밀가루 끊은 날',
    failLabel: '먹었어요',
    countLabel: '굳은 운동 시간',
    metric: 'kcal',
    kcalLabel: '방어한 칼로리',
    showMilestone: true,
    tagline: '빵 한 번이 러닝머신 약 1시간 13분',
    obLead: '주로 먹던 밀가루 음식과 하루에 몇 번쯤 먹었는지 골라주세요.',
    guideHref: 'quit-flour.html',
    guideLabel: '밀가루 끊기 안내',
    testHref: 'test-food.html',
    testEmoji: '🍔',
    testTitle: '식습관 성향 테스트',
    testSub: '눈앞의 햄버거, 나는 어떻게 하나',
    fields: [
      { key: 'kind', label: '주로 먹던 것', type: 'select', def: 'bread', options: [
        { v: 'bread', label: '빵·디저트류 — 약 400kcal / 6,000원' },
        { v: 'noodle', label: '라면·면류 — 약 500kcal / 2,000원' },
        { v: 'delivery', label: '피자·중식 등 배달 — 약 750kcal / 15,000원' },
      ] },
      { key: 'timesPerDay', label: '하루 평균 몇 번', type: 'number', min: 0.5, max: 10, step: 0.5, def: 1, inputmode: 'decimal',
        note: '매일은 아니었다면 일주일 횟수를 7로 나눠 넣으세요. 주 3~4번이면 0.5입니다.' },
    ],
    perDay: (num, get) => {
      const t = FLOUR_KINDS[get('kind')] || FLOUR_KINDS.bread;
      const c = num('timesPerDay', 1);
      return { kcal: t.kcal * c, money: t.won * c, cubes: t.cubes * c, count: t.kcal * c };
    },
    countText: (n) => treadmillText(n),
    subText: (day, p) => '아낀 돈 ' + comma(day * p.money) + '원',
    extraText: (day, p) => '몸에 들어오지 않은 각설탕 <strong>' + comma(day * p.cubes) + '개</strong>',
    celebrateText: (n) => `러닝머신 ${treadmillText(n)} 분량을 안 먹었어요.`,
  },

  snack: {
    id: 'snack',
    cat: 'food',
    emoji: '🍪',
    name: '간식',
    verb: '간식 끊기',
    startLabel: '간식 끊은 날',
    failLabel: '먹었어요',
    countLabel: '굳은 걸음 수',
    metric: 'kcal',
    kcalLabel: '방어한 체지방',
    showMilestone: true,
    tagline: '편의점 과자 하루 한 번이면 1년에 약 12만 kcal',
    obLead: '주로 먹던 간식과 하루에 몇 번쯤 먹었는지 골라주세요.',
    guideHref: 'quit-snack.html',
    guideLabel: '간식 끊기 안내',
    testHref: 'test-food.html',
    testEmoji: '🍔',
    testTitle: '식습관 성향 테스트',
    testSub: '눈앞의 햄버거, 나는 어떻게 하나',
    fields: [
      { key: 'kind', label: '주로 먹던 간식', type: 'select', def: 'store', options: [
        { v: 'store', label: '편의점 과자·음료 — 약 350kcal / 4,000원' },
        { v: 'drink', label: '달달한 카페 음료 — 약 450kcal / 6,000원' },
        { v: 'dessert', label: '카페 음료 + 디저트 — 약 650kcal / 12,000원' },
      ], note: '체지방은 7,700kcal를 1kg으로 본 환산값이에요. 실제 체중 변화는 전체 식사량과 활동량에 따라 달라집니다.' },
      { key: 'timesPerDay', label: '하루 평균 몇 번', type: 'number', min: 0.5, max: 10, step: 0.5, def: 1, inputmode: 'decimal',
        note: '매일은 아니었다면 일주일 횟수를 7로 나눠 넣으세요. 주 3~4번이면 0.5입니다.' },
    ],
    perDay: (num, get) => {
      const t = SNACK_KINDS[get('kind')] || SNACK_KINDS.store;
      const c = num('timesPerDay', 1);
      return { kcal: t.kcal * c, money: t.won * c, count: t.kcal * c };
    },
    mainText: (kcal) => fatKg(kcal) + ' kg',
    mainShort: (kcal) => fatKg(kcal) + 'kg',
    countText: (n) => comma(Math.round((n / KCAL_PER_10K_STEPS) * 10000)) + '보',
    subText: (day, p) => '누적 ' + comma(day * p.kcal) + ' kcal',
    extraText: (day, p) => {
      const won = day * p.money;
      const reward = snackReward(won);
      return '아낀 돈 <strong>' + comma(won) + '원</strong>' + (reward ? ' · ' + reward : '');
    },
    celebrateText: (n) => `체지방으로 치면 약 ${fatKg(n)}kg 분량을 막았어요.`,
  },

  reels: {
    id: 'reels',
    cat: 'life',
    emoji: '📱',
    name: '릴스·쇼츠',
    verb: '릴스·쇼츠 끊기',
    startLabel: '끊은 날',
    failLabel: '봤어요',
    countLabel: '영화로 치면',
    timeLabel: '되찾은 시간',
    metric: 'time',
    tagline: '하루 90분이면 1년에 23일',
    obLead: '하루에 얼마나 보는지 대략만 넣어주세요. 휴대폰의 스크린타임을 보면 정확해요.',
    guideHref: 'quit-reels.html',
    guideLabel: '릴스·쇼츠 끊기 안내',
    fields: [
      { key: 'minutesPerDay', label: '하루 평균 (분)', type: 'number', min: 5, max: 1440, step: 5, def: 90, inputmode: 'numeric',
        note: '설정 → 스크린타임(아이폰) 또는 디지털 웰빙(안드로이드)에서 앱별 사용 시간을 볼 수 있어요.' },
    ],
    perDay: (num) => ({
      minutes: num('minutesPerDay', 90),
      count: num('minutesPerDay', 90) / 120,   // 영화 한 편을 2시간으로
    }),
    countText: (n) => comma(Math.round(n)) + '편',
    celebrateText: (n) => `영화 ${comma(Math.round(n))}편 볼 시간을 되찾았어요.`,
  },

  game: {
    id: 'game',
    cat: 'life',
    emoji: '🎮',
    name: '게임',
    verb: '게임 끊기',
    startLabel: '끊은 날',
    failLabel: '했어요',
    countLabel: '영화로 치면',
    timeLabel: '되찾은 시간',
    metric: 'time',
    tagline: '하루 2시간이면 1년에 한 달',
    obLead: '평일과 주말이 다르면 평균으로 넣어주세요.',
    guideHref: 'quit-game.html',
    guideLabel: '게임 끊기 안내',
    fields: [
      { key: 'minutesPerDay', label: '하루 평균 (분)', type: 'number', min: 5, max: 1440, step: 5, def: 120, inputmode: 'numeric' },
    ],
    perDay: (num) => ({
      minutes: num('minutesPerDay', 120),
      count: num('minutesPerDay', 120) / 120,
    }),
    countText: (n) => comma(Math.round(n)) + '편',
    celebrateText: (n) => `영화 ${comma(Math.round(n))}편 볼 시간을 되찾았어요.`,
  },

  taxi: {
    id: 'taxi',
    cat: 'life',
    emoji: '🚕',
    name: '택시',
    verb: '택시 끊기',
    startLabel: '끊은 날',
    failLabel: '탔어요',
    countLabel: '안 탄 택시',
    metric: 'money',
    tagline: '주 3회 12,000원이면 1년에 약 190만 원',
    obLead: '늦잠, 야근, 귀찮음. 이유가 뭐든 요금은 같아요.',
    guideHref: 'quit-taxi.html',
    guideLabel: '택시 끊기 안내',
    fields: [
      { key: 'ridesPerWeek', label: '일주일에 몇 번', type: 'number', min: 0.5, max: 50, step: 0.5, def: 3, inputmode: 'decimal' },
      { key: 'farePerRide', label: '한 번 요금 (원)', type: 'number', min: 0, step: 500, def: 12000, inputmode: 'numeric',
        note: '대중교통으로 바꿨다면 그 차액을 넣는 쪽이 정확해요.' },
    ],
    perDay: (num) => ({
      money: (num('ridesPerWeek', 3) / 7) * num('farePerRide', 12000),
      count: num('ridesPerWeek', 3) / 7,
    }),
    countText: (n) => comma(Math.round(n)) + '번',
    celebrateText: (n) => `택시 ${comma(Math.round(n))}번을 안 탔어요.`,
  },

  swear: {
    id: 'swear',
    cat: 'life',
    emoji: '🤬',
    name: '욕',
    verb: '욕 끊기',
    startLabel: '끊은 날',
    failLabel: '했어요',
    countLabel: '참은 욕',
    moneyLabel: '아낀 벌금',
    metric: 'money',
    tagline: '욕 저금통. 한 번에 500원씩 하루 열 번이면 1년에 약 180만 원',
    obLead: '욕 저금통이에요. 한 번 할 때마다 넣기로 한 벌금을 정하면, 참은 만큼 쌓여요.',
    guideHref: 'quit-swear.html',
    guideLabel: '욕 끊기 안내',
    fields: [
      { key: 'timesPerDay', label: '하루 몇 번쯤', type: 'number', min: 1, max: 500, step: 1, def: 10, inputmode: 'numeric',
        note: '정확할 필요 없어요. 본인이 생각하는 대략의 횟수면 돼요.' },
      { key: 'finePerTime', label: '한 번당 벌금 (원)', type: 'number', min: 0, step: 100, def: 500, inputmode: 'numeric' },
    ],
    perDay: (num) => ({
      money: num('timesPerDay', 10) * num('finePerTime', 500),
      count: num('timesPerDay', 10),
    }),
    countText: (n) => comma(Math.round(n)) + '번',
    celebrateText: (n) => `욕 ${comma(Math.round(n))}번을 삼켰어요.`,
  },

  wake: {
    id: 'wake',
    cat: 'life',
    emoji: '🌅',
    name: '일찍 일어나기',
    verb: '일찍 일어나기',
    startLabel: '시작한 날',
    failLabel: '늦잠 잤어요',
    countLabel: '성공한 아침',
    timeLabel: '되찾은 아침',
    metric: 'time',
    tagline: '8시 반에서 6시 반으로 옮기면 1년에 30일',
    obLead: '원래 일어나던 시간과 앞으로 일어날 시간을 넣으면, 그 차이만큼 아침이 쌓여요.',
    guideHref: 'quit-wake.html',
    guideLabel: '일찍 일어나기 안내',
    fields: [
      { key: 'prevWake', label: '원래 일어나던 시간', type: 'time', def: '08:30' },
      { key: 'targetWake', label: '목표 기상 시간', type: 'time', def: '06:30',
        note: '두 시간의 차이가 하루에 되찾는 아침 시간이에요.' },
    ],
    perDay: (num, get) => {
      const diff = minutesBetween(get('prevWake') || '08:30', get('targetWake') || '06:30');
      return { minutes: Math.max(diff, 0), count: 1 };
    },
    countText: (n) => comma(Math.round(n)) + '번',
    celebrateText: (n) => `일찍 일어난 아침이 ${comma(Math.round(n))}번이에요.`,
  },
};

// 'HH:MM' 두 개의 차이 (앞 - 뒤) 를 분으로. 08:30 - 06:30 = 120
function minutesBetween(a, b) {
  const toMin = (t) => {
    const m = String(t).match(/^(\d{1,2}):(\d{2})$/);
    return m ? Number(m[1]) * 60 + Number(m[2]) : NaN;
  };
  const x = toMin(a), y = toMin(b);
  if (isNaN(x) || isNaN(y)) return 0;
  return x - y;
}

// 카테고리 순서대로 습관 id 목록
function habitsInCategory(catId) {
  return Object.values(HABITS).filter((h) => h.cat === catId);
}
