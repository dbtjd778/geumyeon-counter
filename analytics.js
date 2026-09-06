// 방문자 통계 (Google Analytics 4)
//
// 측정 ID를 넣으면 켜지고, 비워두면 아무것도 하지 않는다.
// 끄고 싶으면 아래 GA_ID를 다시 빈 문자열로 두면 된다. 페이지는 안 고쳐도 된다.
//
// 중요: 카운터에 입력한 값(시작일·금액·시간·성별·나이)은 여기로 전송되지 않는다.
// 그 값들은 localStorage 안에만 있고 이 파일은 읽지 않는다.
// 심리테스트 결과 코드도 보내지 않는다(주소의 ?r= 파라미터는 제거하고 보낸다).
const GA_ID = 'G-2Q68SBLPF5';   // GA4 속성 'todayquit.com'

// 내 방문은 세지 않기.
// 주소 끝에 ?noga=1 을 붙여 한 번 열면 그 브라우저는 계속 제외된다(?noga=0 이면 해제).
// IP가 아니라 브라우저에 표시를 남기는 방식이라, 회선 IP가 바뀌거나 휴대폰 데이터를 써도 그대로 유지된다.
// 기기·브라우저마다 한 번씩 해줘야 한다.
const OPT_OUT_KEY = 'qs.noAnalytics';

(function handleOptOut() {
  const m = location.search.match(/[?&]noga=([01])/);
  if (!m) return;
  try {
    if (m[1] === '1') {
      localStorage.setItem(OPT_OUT_KEY, '1');
      alert('이 브라우저의 방문은 이제 통계에서 제외됩니다.\n\n해제하려면 주소 끝에 ?noga=0 을 붙여 여세요.');
    } else {
      localStorage.removeItem(OPT_OUT_KEY);
      alert('이 브라우저의 통계 제외를 해제했습니다.\n\n이제 이 브라우저의 방문도 통계에 들어갑니다.');
    }
  } catch (e) { /* 저장소를 못 쓰는 환경이면 그냥 넘어간다 */ }
})();

(function () {
  if (!GA_ID) return;

  // 제외 표시가 있는 브라우저면 아예 보내지 않는다
  try {
    if (localStorage.getItem(OPT_OUT_KEY) === '1') return;
  } catch (e) { /* 저장소를 못 읽으면 평소대로 진행 */ }

  // 설치된 앱을 파일로 여는 경우(file://)와 개발용 주소에서는 보내지 않는다
  if (location.protocol !== 'http:' && location.protocol !== 'https:') return;
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return;

  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('js', new Date());

  // 테스트 결과 코드(?r=)와 습관 지정(?h=)은 통계에 남길 이유가 없어 주소에서 뺀다
  gtag('config', GA_ID, {
    page_location: location.origin + location.pathname,
  });
})();
