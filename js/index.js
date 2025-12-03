$(function () {
  // ===== AOS 초기화 =====
  AOS.init({
    duration: 600,
    easing: 'ease-out',
    once: true
  });

  // 공통 변수
  let $window = $(window);
  let $header = $('header');
  let lastScrollY = $window.scrollTop();
  let isClickScrolling = false; // 클릭으로 스크롤 중인지 체크
  let skillAnimated = false;    // 스킬 섹션 차트 1번만 실행

  // ===== 헤더 스크롤 숨김/보임 =====
  $window.on('scroll', function () {
    let currentScroll = $(this).scrollTop();

    if ($header.length === 0) return;

    if (currentScroll < 50) {
      $header.removeClass('hide');
      lastScrollY = currentScroll;
      return;
    }

    if (currentScroll > lastScrollY) {
      $header.addClass('hide');
    } else {
      $header.removeClass('hide');
    }

    lastScrollY = currentScroll;
  });

  // ===== 스킬 게이지 차트 (스크롤 시 진입하면 실행) =====
  let runSkillChart = function () {
    if (skillAnimated) return;

    let $skillSection = $('#skillSection');
    if ($skillSection.length === 0) return;

    let winTop = $window.scrollTop();
    let winH = $window.height();
    let secTop = $skillSection.offset().top;

    // 화면 아래쪽 60% 지점이 섹션 상단을 지나면 실행
    if (winTop + winH * 0.6 < secTop) return;

    skillAnimated = true;

    $('.skillGauge').each(function () {
      let $gauge = $(this);
      let percent = Number($gauge.data('percent')) || 0;
      let outerColor = $gauge.data('outer') || '#ffffff';
      let innerColor = $gauge.data('inner') || '#cccccc';

      let outerCanvas = $gauge.find('.outerPie')[0];
      let innerCanvas = $gauge.find('.innerPie')[0];

      if (outerCanvas) {
        let outerCtx = outerCanvas.getContext('2d');
        new Chart(outerCtx, {
          type: 'pie',
          data: {
            datasets: [{
              data: [percent, 100 - percent],
              backgroundColor: [
                outerColor,
                'rgba(255, 255, 255, 0.06)'
              ],
              borderWidth: 0
            }]
          },
          options: {
            responsive: false,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { enabled: false }
            }
          }
        });
      }

      if (innerCanvas) {
        let innerCtx = innerCanvas.getContext('2d');
        new Chart(innerCtx, {
          type: 'pie',
          data: {
            datasets: [{
              data: [percent, 100 - percent],
              backgroundColor: [
                innerColor,
                'rgba(0, 0, 0, 0)'
              ],
              borderWidth: 0
            }]
          },
          options: {
            responsive: false,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { enabled: false }
            }
          }
        });
      }
    });
  };

  $window.on('scroll', runSkillChart);
  runSkillChart(); // 처음 로딩 시 위치가 이미 아래일 수도 있으니 한 번 체크

  // ===== 공통 스크롤 함수 =====
  let scrollToSection = function (targetId) {
    let $target = $(targetId);
    if ($target.length === 0) return;

    let headerH = $header.outerHeight() || 0;
    let offsetTop = $target.offset().top;

    if (targetId === '#about') {
      // 모바일 nav 보이는 상황 → 섹션 시작 지점에 맞추기
      if ($('.mobile_nav').is(':visible')) {
        offsetTop = offsetTop - headerH - 16;
      } else {
        // 데스크탑 → leftLine 위치 기준으로 맞추기
        let $leftLine = $('#about .leftLine');
        if ($leftLine.length) {
          offsetTop = $leftLine.offset().top - headerH - 24;
        } else {
          offsetTop = offsetTop - headerH - 24;
        }
      }
    } else {
      // 나머지 섹션은 공통 오프셋
      offsetTop = offsetTop - headerH - 24;
    }

    isClickScrolling = true;

    $('html, body').stop().animate(
      { scrollTop: offsetTop },
      600,
      function () {
        isClickScrolling = false;
      }
    );
  };

  // ===== 데스크탑 헤더 nav 클릭 스크롤 =====
  $('.header_inner nav a').on('click', function (e) {
    e.preventDefault();
    let text = $.trim($(this).text());

    if (text === 'Home') {
      scrollToSection('#heroSection');
    } else if (text === 'About') {
      scrollToSection('#about');
    } else if (text === 'Project') {
      scrollToSection('#projectSection');
    } else if (text === 'Contact') {
      scrollToSection('footer');
    }
  });

  // ===== topBtn: 맨 위로 스크롤 =====
  $('.topbtn').on('click', function () {
    isClickScrolling = true;
    $('html, body').stop().animate(
      { scrollTop: 0 },
      600,
      function () {
        isClickScrolling = false;
      }
    );
  });

  // ===== 모바일 네비 토글 & 스크롤 스파이 =====
  let $mobileNavLinks = $('.mobile_nav a');

  // 섹션 → 버튼 매핑
  let sections = [
    { id: '#heroSection', key: 'Home' },
    { id: '#about', key: 'About' },
    { id: '#projectSection', key: 'Project' },
    { id: 'footer', key: 'Contact' }
  ];

  // key(Home / About / Project / Contact)로 active 주기
  let setActiveByKey = function (key) {
    $mobileNavLinks.removeClass('active');
    $mobileNavLinks.each(function () {
      let $link = $(this);
      let text = $.trim($link.text());
      if (text === key) {
        $link.addClass('active');
      }
    });
  };

  // 스크롤 스파이
  let onScrollSpy = function () {
    // 클릭으로 스크롤 중일 땐 버튼 안 바꿈
    if (isClickScrolling) return;

    let scrollMid = $window.scrollTop() + ($window.height() * 0.4);
    let currentKey = null;

    for (let i = 0; i < sections.length; i++) {
      let sec = sections[i];
      let $secEl = $(sec.id);
      if ($secEl.length === 0) continue;

      let top = $secEl.offset().top;
      let bottom = top + $secEl.outerHeight();

      if (scrollMid >= top && scrollMid < bottom) {
        currentKey = sec.key;
        break;
      }
    }

    if (currentKey) {
      setActiveByKey(currentKey);
    }
  };

  // 스크롤 시 실행
  $window.on('scroll', onScrollSpy);
  onScrollSpy(); // 처음 로딩 때 한 번

  // 모바일 nav 클릭 → 섹션 이동
  $mobileNavLinks.on('click', function (e) {
    e.preventDefault();

    let $this = $(this);
    let key = $.trim($this.text());

    // key에 해당하는 섹션 찾기
    let targetSection = null;
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].key === key) {
        targetSection = sections[i];
        break;
      }
    }
    if (!targetSection) return;

    let $target = $(targetSection.id);
    if ($target.length === 0) return;

    let headerH = $header.outerHeight() || 0;
    let offsetTop = $target.offset().top;

    if (targetSection.id === '#about') {
      // 모바일 nav 보이는 상황
      offsetTop = offsetTop - headerH - 16;
    } else {
      offsetTop = offsetTop - headerH - 24;
    }

    // 클릭 스크롤 시작
    isClickScrolling = true;

    // 클릭한 버튼만 활성화
    setActiveByKey(key);

    $('html, body').stop().animate(
      { scrollTop: offsetTop },
      600,
      function () {
        // 스크롤 애니메이션 끝난 후 다시 스파이 켬
        isClickScrolling = false;
        onScrollSpy(); // 실제 위치 기준으로 한 번 더 정리
      }
    );
  });
});