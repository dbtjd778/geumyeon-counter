"""Generate focused counter pages from the shared, working index widget.

Run after changing the widget/dialogs in index.html. --check detects stale output.
No user data is stored here; all pages use the same app.js and storage keys.
"""
import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
index = (ROOT / 'index.html').read_text()
pages = [
    dict(habit='smoke', slug='quit-smoking-counter', name='금연 카운터',
         title='금연 카운터 · 금연 일수와 절약한 담배값 계산 | 투데이큇',
         description='금연 시작일을 넣으면 금연 며칠째인지, 안 피운 담배와 절약한 담배값을 계산해요. 금연 일지와 주간 흡연량도 기록할 수 있는 무료 웹 카운터예요.',
         lead='담배를 안 피운 하루를, 눈에 보이게.',
         sub='금연 시작일과 평소 흡연량을 입력하세요. 며칠째인지 세고, 담배값을 얼마나 덜 썼을지 계산해요. 오늘 참기 어려웠던 순간도 일지에 남길 수 있어요.',
         guide='guide.html', guide_label='금연하기 · 처음 시작하는 방법',
         placeholder='점심 뒤 담배가 생각나서 건물 밖 대신 계단을 걸었어요.'),
    dict(habit='drink', slug='sobriety-counter', name='금주 카운터',
         title='금주 카운터 · 술 안 마신 일수와 절약액 계산 | 투데이큇',
         description='금주 시작일로 술 안 마신 일수를 세고, 평소 음주 횟수와 지출로 절약액을 계산하세요. 금주 일지와 주간 음주 횟수를 기록하는 무료 웹 카운터예요.',
         lead='술 안 마신 날, 오늘은 며칠째인가요?',
         sub='금주 시작일, 평소 일주일 음주 횟수와 한 번에 쓰던 돈을 입력하세요. 금주 일수와 예상 절약액을 확인하고, 술을 권유받은 날의 선택도 기록해요.',
         guide='guide-drink.html', guide_label='금주 시작 전 알아둘 정보',
         placeholder='저녁에 술이 생각나서 친구에게 전화했어요. 오늘은 안 마셨어요.'),
]

def build(p):
    text = index
    name, slug = p['name'], p['slug']
    url = f'https://todayquit.com/{slug}.html'
    text = re.sub(r'<title>.*?</title>', f'<title>{p["title"]}</title>', text)
    for attr in ['name="description"', 'property="og:description"']:
        text = re.sub(fr'<meta {attr} content="[^"]*">', f'<meta {attr} content="{p["description"]}">', text)
    text = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{p["title"]}">', text)
    text = text.replace('href="https://todayquit.com/"', f'href="{url}"').replace('content="https://todayquit.com/"', f'content="{url}"')
    schema = {'@context': 'https://schema.org', '@type': 'WebApplication', 'name': f'투데이큇 {name}', 'url': url, 'inLanguage': 'ko', 'description': p['description'], 'applicationCategory': 'LifestyleApplication', 'operatingSystem': 'Any', 'browserRequirements': 'Requires JavaScript and local storage', 'offers': {'@type': 'Offer', 'price': '0', 'priceCurrency': 'KRW'}}
    text = re.sub(r'<script type="application/ld\+json">.*?</script>', '<script type="application/ld+json">\n' + json.dumps(schema, ensure_ascii=False, indent=2) + '\n</script>', text, flags=re.S)
    text = text.replace('<body class="app">', f'<body class="app web counter-page" data-counter-habit="{p["habit"]}">')
    text = text.replace('<a href="index.html" aria-current="page">카운터</a>', '<a href="index.html">전체 습관</a>')
    start = text.index('  <div class="hero-copy">')
    end = text.index('  <!-- 카운터 본체.', start)
    notice = ''
    if p['habit'] == 'drink':
        notice = '<p class="counter-caution">술을 줄이거나 끊을 때 손떨림·식은땀 같은 금단 증상이 있다면 혼자 갑자기 끊기보다 먼저 진료를 받으세요. <a href="#safe-start">안전하게 시작하기</a></p>'
    text = text[:start] + f'''  <div class="hero-copy">
    <p class="counter-kicker">가입 없이 쓰는 무료 웹 도구</p>
    <h1 class="hero-title">{name}</h1>
    <p class="hero-lead">{p['lead']}</p>
    <p class="hero-sub">{p['sub']}</p>
    <div class="hero-actions"><a class="btn btn-primary" href="#widget">{name} 시작하기</a><a class="btn btn-ghost" href="{p['guide']}">{p['guide_label']}</a></div>
    <p class="hero-note">가입 없이 이 브라우저에 저장해요. 기존 기록이 있다면 그대로 이어져요.</p>
    {notice}
    <nav class="counter-shortcuts" aria-label="카운터 바로가기"><a href="#calculation">계산 기준</a><a href="#records">일지 쓰기</a><a href="#counter-questions">자주 묻는 질문</a></nav>
  </div>

''' + text[end:]
    start = text.index('<!-- ===== 세는 중인 습관')
    end = text.index('<footer class="site-foot">', start)
    content = (ROOT / 'counter-content' / f'{slug}.html').read_text()
    text = text[:start] + '<article class="page counter-explainer">\n' + content + '\n</article>\n\n' + text[end:]
    # Keep the shared records logic, with a single subject on each focused page.
    text = text.replace('<label class="record-field">기록할 습관<select id="recordHabit"></select></label>', '<label class="record-field" hidden>기록할 습관<select id="recordHabit"></select></label>')
    text = text.replace('배달 앱을 켜려다가 냉장고에 있던 밥을 먹었어요. 생각보다 괜찮았어요.', p['placeholder'])
    text = text.replace('<button id="startCounter" class="btn btn-primary start-counter" type="button">이 습관 시작하기</button>', f'<button id="startCounter" class="btn btn-primary start-counter" type="button">{name} 설정하기</button>')
    # Entertainment promos distract from a focused tool; app.js tolerates their absence.
    text = re.sub(r'    <div class="promo-stack">.*?</div>\s*(?=<footer)', '', text, flags=re.S)
    text = text.replace('<main id="widget"', '<main aria-label="' + name + ' 계산 및 기록" id="widget"')
    text = text.replace('<canvas id="confetti"></canvas>', '<canvas id="confetti" aria-hidden="true"></canvas>\n<noscript><p class="notice">카운터 계산과 일지 저장에는 자바스크립트가 필요해요. 아래에서 계산 기준과 이용 방법을 읽을 수 있어요.</p></noscript>')
    text = re.sub(r'<div id="installBanner".*?<!-- ===== 첫 화면:', '<!-- ===== 첫 화면:', text, flags=re.S)
    if p['habit'] == 'drink':
        text = text.replace('>🚬</span>', '>🍺</span>').replace('class="habit-name">담배<', 'class="habit-name">술<').replace('>안 피운 담배<', '>안 마신 술자리<').replace('>0개비<', '>0번<')
    return text

stale = []
for page in pages:
    path = ROOT / f'{page["slug"]}.html'
    result = build(page)
    if '--check' in sys.argv:
        if not path.exists() or path.read_text() != result:
            stale.append(path.name)
    else:
        path.write_text(result)
if stale:
    sys.exit('Regenerate counter pages: ' + ', '.join(stale))
print('Counter pages ' + ('verified' if '--check' in sys.argv else 'generated'))
