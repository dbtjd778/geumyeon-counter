// 방문자 통계 (Google Analytics 4)
//
// 측정 ID를 넣으면 켜지고, 비워두면 아무것도 하지 않는다.
// 끄고 싶으면 아래 GA_ID를 다시 빈 문자열로 두면 된다. 페이지는 안 고쳐도 된다.
//
// 중요: 카운터에 입력한 값(시작일·금액·시간·성별·나이)은 여기로 전송되지 않는다.
// 그 값들은 localStorage 안에만 있고 이 파일은 읽지 않는다.
// 심리테스트 결과 코드도 보내지 않는다(주소의 ?r= 파라미터는 제거하고 보낸다).
const GA_ID = 'G-2Q68SBLPF5';   // GA4 속성 'todayquit.com'

(function () {
  if (!GA_ID) return;

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
