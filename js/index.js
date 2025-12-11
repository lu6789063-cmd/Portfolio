$(function () {
  // =====================
  // AOS 초기화
  // =====================
  AOS.init({
    duration: 600,
    easing: 'ease-out',
    once: true
  });

  // =====================
  // 공통 변수
  // =====================
  const $window = $(window);
  const $header = $('header');

  let lastScrollY = $window.scrollTop();
  let isClickScrolling = false;      // 클릭으로 스크롤 중인지 체크
  let skillAnimated = false;         // 스킬 섹션 차트 1번만 실행
  let mobilePercentAnimated = false; // 모바일 퍼센트 숫자 애니메이션 1번만 실행

  // =====================
  // 모바일 스킬 퍼센트 숫자 애니메이션
  // =====================
  function animateNumber($el, target, totalDuration) {
    if (target <= 10) {
      const startTime = performance.now();

      function tickSmall(now) {
        const progress = Math.min((now - startTime) / totalDuration, 1);
        const value = Math.floor(target * (1 - Math.pow(1 - progress, 2)));
        $el.text(value + '%');

        if (progress < 1) {
          requestAnimationFrame(tickSmall);
        } else {
          $el.text(target + '%');
        }
      }

      requestAnimationFrame(tickSmall);
      return;
    }

    const slowRange = 10;
    const fastTarget = target - slowRange;
    const fastDuration = totalDuration * 0.4;
    const slowDuration = totalDuration * 0.6;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      let value = 0;

      if (elapsed < fastDuration) {
        const p = elapsed / fastDuration;
        value = Math.floor(fastTarget * p);
      } else {
        const p = Math.min((elapsed - fastDuration) / slowDuration, 1);
        value = fastTarget + Math.floor(slowRange * p);
      }

      if (value > target) value = target;
      $el.text(value + '%');

      if (elapsed < totalDuration) {
        requestAnimationFrame(tick);
      } else {
        $el.text(target + '%');
      }
    }

    requestAnimationFrame(tick);
  }

  function startMobilePercentAnimation() {
    $('.gaugeWrap').each(function () {
      const $wrap = $(this);
      const $gauge = $wrap.find('.skillGauge');
      const $mobileNum = $wrap.find('.mobilePercent .num'); // 숫자 span

      const percent = parseInt($gauge.data('percent'), 10) || 0;
      if (!$mobileNum.length) return;

      animateNumber($mobileNum, percent, 1500);
    });
  }

  // =====================
  // 헤더 스크롤 숨김/보임
  // =====================
  $window.on('scroll', function () {
    const currentScroll = $window.scrollTop();

    if (!$header.length) return;

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

  // =====================
  // 스킬 게이지 차트 (스크롤 시 진입하면 1번만 실행)
  // =====================
  const runSkillChart = function () {
    if (skillAnimated) return;

    const $skillSection = $('#skillSection');
    if (!$skillSection.length) return;

    const winTop = $window.scrollTop();
    const winH = $window.height();
    const secTop = $skillSection.offset().top;

    // 화면 아래쪽 10% 지점이 섹션 상단을 지나면 실행
    if (winTop + winH * 0.1 < secTop) return;

    skillAnimated = true;

    $('.skillGauge').each(function () {
      const $gauge = $(this);
      const percent = Number($gauge.data('percent')) || 0;
      const outerColor = $gauge.data('outer') || '#ffffff';
      const innerColor = $gauge.data('inner') || '#cccccc';

      const outerCanvas = $gauge.find('.outerPie')[0];
      const innerCanvas = $gauge.find('.innerPie')[0];

      if (outerCanvas) {
        const outerCtx = outerCanvas.getContext('2d');
        new Chart(outerCtx, {
          type: 'pie',
          data: {
            datasets: [{
              data: [percent, 100 - percent],
              backgroundColor: [
                outerColor,
                'rgba(255, 255, 255, 0)'
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
            },
            animation: {
              duration: 600
            }
          }
        });
      }

      if (innerCanvas) {
        const innerCtx = innerCanvas.getContext('2d');
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
            },
            animation: {
              duration: 600
            }
          }
        });
      }
    });

    // 모바일일 때 숫자 애니메이션 같이 실행
    if (!mobilePercentAnimated && $window.width() <= 768) {
      mobilePercentAnimated = true;
      startMobilePercentAnimation();
    }
  };

  $window.on('scroll', runSkillChart);
  runSkillChart();

  // =====================
  // 공통 스크롤 함수
  // =====================
  const scrollToSection = function (targetId) {
    const $target = $(targetId);
    if (!$target.length) return;

    const headerH = $header.outerHeight() || 0;
    let offsetTop = $target.offset().top;

    if (targetId === '#about') {
      if ($('.mobile_nav').is(':visible')) {
        offsetTop = offsetTop - headerH - 16;
      } else {
        const $leftLine = $('#about .leftLine');
        if ($leftLine.length) {
          offsetTop = $leftLine.offset().top - headerH - 24;
        } else {
          offsetTop = offsetTop - headerH - 24;
        }
      }
    } else {
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

  // 데스크탑 헤더 nav 클릭 스크롤
  $('.header_inner nav a').on('click', function (e) {
    e.preventDefault();
    const text = $.trim($(this).text());

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

  // top 버튼
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

  // =====================
  // 모바일 네비 스크롤 스파이 & 클릭 이동
  // =====================
  const $mobileNavLinks = $('.mobile_nav a');

  const sections = [
    { id: '#heroSection', key: 'Home' },
    { id: '#about', key: 'About' },
    { id: '#projectSection', key: 'Project' },
    { id: 'footer', key: 'Contact' }
  ];

  const setActiveByKey = function (key) {
    $mobileNavLinks.removeClass('active');
    $mobileNavLinks.each(function () {
      const $link = $(this);
      const text = $.trim($link.text());
      if (text === key) {
        $link.addClass('active');
      }
    });
  };

  const onScrollSpy = function () {
    if (isClickScrolling) return;

    const scrollMid = $window.scrollTop() + ($window.height() * 0.4);
    let currentKey = null;

    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      const $secEl = $(sec.id);
      if (!$secEl.length) continue;

      const top = $secEl.offset().top;
      const bottom = top + $secEl.outerHeight();

      if (scrollMid >= top && scrollMid < bottom) {
        currentKey = sec.key;
        break;
      }
    }

    if (currentKey) setActiveByKey(currentKey);
  };

  $window.on('scroll', onScrollSpy);
  onScrollSpy();

  // 모바일 nav 클릭 → 섹션 이동
  $mobileNavLinks.on('click', function (e) {
    e.preventDefault();

    const $this = $(this);
    const key = $.trim($this.text());

    let targetSection = null;
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].key === key) {
        targetSection = sections[i];
        break;
      }
    }
    if (!targetSection) return;

    const $target = $(targetSection.id);
    if (!$target.length) return;

    const headerH = $header.outerHeight() || 0;
    let offsetTop = $target.offset().top;

    if (targetSection.id === '#about') {
      offsetTop = offsetTop - headerH - 16;
    } else {
      offsetTop = offsetTop - headerH - 24;
    }

    isClickScrolling = true;
    setActiveByKey(key);

    $('html, body').stop().animate(
      { scrollTop: offsetTop },
      600,
      function () {
        isClickScrolling = false;
        onScrollSpy();
      }
    );
  });

  // =====================
  // 스킬 호버 시 툴팁 (PC)
  // =====================
  $('.skillGauge').each(function () {
    const $gauge = $(this);
    const $tooltip = $gauge.find('.skillTooltip');

    if (!$tooltip.length) return;

    $gauge.on('mouseenter', function () {
      $tooltip.addClass('is-active');
    });

    $gauge.on('mouseleave', function () {
      $tooltip.removeClass('is-active');
    });
  });

  // =====================
  // 프로젝트 데이터
  // =====================
  const projectData = {
    "JIWON's Portfolio": {
      imagePc: "./img/webProject1.png",
      imageMobile: "./img/mobile_webProject1.png",
      alt: "JIWON's Portfolio",
      title: "JIWON's Portfolio",
      subtext: ["반응형 웹 페이지", "1인 프로젝트", "제작페이지 : 메인페이지"]
    },
    "대구아쿠아리움 Redesign": {
      imagePc: "./img/webProject2.png",
      imageMobile: "./img/mobile_webProject2.png",
      alt: "Daegu Aquarium Redesign",
      title: "대구아쿠아리움 Redesign",
      subtext: ["반응형 웹 페이지", "1인 프로젝트", "메인 페이지 리디자인"],
      buttons: [
        { label: "기획서", href: "./pdf/aquarium.pdf" },
        {
          label: "와이어프레임",
          href: "https://www.figma.com/design/KNpp0C6ZcT3I6EKJ5PpSaK/%EB%8C%80%EA%B5%AC%EC%95%84%EC%BF%A0%EC%95%84%EB%A6%AC%EC%9B%80?node-id=158-3&t=FNfumzpjp90ckMgL-1"
        },
        { label: "최종 프로젝트", href: "http://dwc50381.dothome.co.kr/" }
      ]
    },
    "라이크벨 Clone Coding": {
      imagePc: "./img/webProject3.png",
      imageMobile: "./img/mobile_webProject3.png",
      alt: "LikeBel Clone Coding",
      title: "라이크벨 Clone Coding",
      subtext: ["반응형 웹 페이지", "클론코딩", "메인 페이지 구현"],
      buttons: [
        { label: "최종 프로젝트", href: "https://lu6789063-cmd.github.io/LikeBe/" }
      ]
    },
    "젠틀몬스터 App Design": {
      imagePc: "./img/AppProject1.png",
      imageMobile: "./img/AppProject1.png",
      alt: "Gentle Monster App Design",
      title: "젠틀몬스터 App Design",
      subtext: [
        "UX/UI App Design",
        "1인 프로젝트",
        "Flow : 회원가입 · 구매과정 · 매장재고조회 · 내프로필편집"
      ],
      buttons: [
        { label: "기획서", href: "./pdf/gentlemonster.pdf" },
        {
          label: "와이어프레임",
          href: "https://www.figma.com/design/sF6FEz1S4Vcdts2Ajoo2jK/%EC%A0%A0%ED%8B%80%EB%AA%AC%EC%8A%A4%ED%84%B0-App?node-id=0-1&t=KnG3XOPtasiXg7uR-1"
        },
        {
          label: "최종 프로젝트",
          href: "https://www.figma.com/design/sF6FEz1S4Vcdts2Ajoo2jK/%EC%A0%A0%ED%8B%80%EB%AA%AC%EC%8A%A4%ED%84%B0-App?node-id=80-8871&t=KnG3XOPtasiXg7uR-1"
        }
      ]
    },
    "교보문구 룸 스프레이 Detail Page": {
      imagePc: "./img/designProject1.png",
      imageMobile: "./img/designProject1.png",
      alt: "Kyobo Room Spray Detail Page",
      title: "교보문구 룸 스프레이 Detail Page",
      subtext: ["상세페이지 디자인", "1인 프로젝트", "Photoshop · Figma"],
      buttons: [
        { label: "최종 프로젝트", href: "./pdf/detailPage1.pdf" }
      ]
    }
  };

  // =====================
  // 프로젝트 섹션: PC용
  // =====================
  const $projectPcInner = $('#projectSection .project_inner');

  if ($projectPcInner.length) {
    const $projectObject = $projectPcInner.find('.projectObject');
    const $workImg = $projectObject.find('.work img');
    const $projTitle = $projectObject.find('.odjectText .textTop h4');
    const $subtext = $projectObject.find('.odjectText .textTop .subtext');
    const $btns = $projectObject.find('.odjectText .btns');
    const $types = $projectPcInner.find('.project_nav .type');

    // 아코디언 타이틀 클릭
    $types.find('.title').on('click', function () {
      const $thisTitle = $(this);
      const $thisType = $thisTitle.closest('.type');
      const $thisUl = $thisType.children('ul');

      $types.not($thisType).children('ul').slideUp(200);
      $types.not($thisType).find('.title img').removeClass('open');
      $types.find('.title').removeClass('active');

      if ($thisUl.is(':visible')) {
        $thisUl.slideUp(200);
        $thisTitle.find('img').removeClass('open');
      } else {
        $thisUl.slideDown(200);
        $thisTitle.find('img').addClass('open');
        $thisTitle.addClass('active');
      }
    });

    // li 클릭 시 오른쪽 내용 변경
    $types.find('ul li').on('click', function () {
      const $li = $(this);
      const name = $.trim($li.text());

      $types.find('ul li').removeClass('active');
      $li.addClass('active');

      const $parentType = $li.closest('.type');
      $types.find('.title').removeClass('active');
      $parentType.find('.title').addClass('active');

      const data = projectData[name];
      if (!data) {
        console.warn('projectData에 없는 이름(PC):', name);
        return;
      }

      const buttons = data.buttons || [];

      $workImg.attr('src', data.imagePc);
      $workImg.attr('alt', data.alt);

      $projTitle.text(data.title);

      $subtext.empty();
      data.subtext.forEach(txt => {
        $('<li>').text(txt).appendTo($subtext);
      });

      // PC에서는 새 탭으로 열리게
      $btns.empty();
      buttons.forEach(btn => {
        $('<a>')
          .attr('href', btn.href)
          .attr('target', '_blank')
          .attr('rel', 'noopener noreferrer')
          .text(btn.label)
          .appendTo($btns);
      });
    });

    // 초기 세팅
    const $firstType = $types.first();
    const $firstUl = $firstType.children('ul');
    const $firstLi = $firstUl.find('li').first();

    $types.not($firstType).children('ul').hide();
    $firstUl.show();
    $firstType.find('.title img').addClass('open');
    $firstLi.trigger('click');
  }

  // =====================
  // 프로젝트 섹션: Mobile / Tablet
  // =====================
  const $mobileInner = $('#projectSection .mobile_inner');

  if ($mobileInner.length) {
    const $mobileContents = $mobileInner.find('.mobileContents .contents');

    $mobileContents.each(function () {
      const $wrap = $(this);
      const $tab = $wrap.find('.tabSelect');
      const $phone = $wrap.find('.phoneSelect');
      const $img = $wrap.find('.mobileObject img');
      const $textTitle = $wrap.find('.objectText h4');
      const $textList = $wrap.find('.objectText ul');
      const $btnWrap = $wrap.find('.objectText .btns');

      // 공통 업데이트 함수
      const updateMobileProject = function (name) {
        const data = projectData[name];
        if (!data) {
          console.warn('projectData에 없는 이름(Mobile/Tablet):', name);
          return;
        }
        const buttons = data.buttons || [];

        if ($img.length) {
          const imgPath = data.imageMobile || data.imagePc;
          $img.attr('src', imgPath);
          $img.attr('alt', data.alt);
        }

        $textTitle.text(data.title);

        $textList.empty();
        data.subtext.forEach(txt => {
          $('<li>').text(txt).appendTo($textList);
        });

        // 모바일/태블릿은 같은 탭에서 이동
        $btnWrap.empty();
        buttons.forEach(btn => {
          $('<a>')
            .attr('href', btn.href)
            .text(btn.label)
            .appendTo($btnWrap);
        });
      };

      // tab도 phone도 없는 카드 → h4 텍스트로 한 번만 매핑 (UXUI App, Design Detail)
      if (!$tab.length && !$phone.length) {
        const rawTitleText = $wrap.find('.objectText h4').text();
        const name = $.trim(rawTitleText.replace(/\s+/g, ' ')); // 공백 정리
        updateMobileProject(name);
        return;
      }

      // tab에서 phoneSelect 라벨 바꾸기 위한 콜백
      let setPhoneCurrentName = null;

      // ---------- Mobile용 phoneSelect ----------
      if ($phone.length) {
        const $origLis = $phone.find('li');

        const optionNames = $origLis.map(function () {
          const $clone = $(this).clone();
          $clone.children('img').remove();
          return $.trim($clone.text());
        }).get();

        let currentName = optionNames[0] || '';

        // 화살표 아이콘 복사
        let $arrowIcon = null;
        const $firstImg = $origLis.first().find('img');
        if ($firstImg.length) {
          $arrowIcon = $firstImg.clone();
        }

        // 구조 재빌드
        $phone.empty();

        // (1) 현재 선택 영역
        const $current = $('<li class="phone-current"></li>');
        const $labelSpan = $('<span class="label"></span>').text(currentName);
        $current.append($labelSpan);
        if ($arrowIcon) $current.append($arrowIcon);
        $phone.append($current);

        // (2) 옵션 목록
        const $dropdown = $('<div class="phone-options"></div>');
        optionNames.forEach(function (name, idx) {
          const $li = $('<li>').text(name);
          if (idx === 0) $li.addClass('active');
          $dropdown.append($li);
        });
        $phone.append($dropdown);

        const $options = $dropdown.find('li');

        const setActiveOption = function (name) {
          $options.removeClass('active');
          $options.each(function () {
            const $opt = $(this);
            if ($.trim($opt.text()) === name) {
              $opt.addClass('active');
            }
          });
          $labelSpan.text(name).addClass('label-active');
        };

        setPhoneCurrentName = function (name) {
          setActiveOption(name);
        };

        const openDropdown = function () {
          $phone.addClass('open');
          $dropdown.stop().slideDown(160);
          if ($arrowIcon) $arrowIcon.addClass('open');
        };

        const closeDropdown = function () {
          $phone.removeClass('open');
          $dropdown.stop().slideUp(160);
          if ($arrowIcon) $arrowIcon.removeClass('open');
        };

        $current.on('click', function (e) {
          e.stopPropagation();
          if ($phone.hasClass('open')) {
            closeDropdown();
          } else {
            openDropdown();
          }
        });

        $options.on('click', function (e) {
          e.stopPropagation();
          const name = $.trim($(this).text());
          setActiveOption(name);
          updateMobileProject(name);
          closeDropdown();
        });

        $(document).on('click.phoneSelect', function () {
          if ($phone.hasClass('open')) {
            closeDropdown();
          }
        });

        // 초기 세팅
        setActiveOption(currentName);
        updateMobileProject(currentName);
      }

      // ---------- Tablet용 tabSelect ----------
      if ($tab.length) {
        const $tabLis = $tab.find('li');

        $tabLis.on('click', function () {
          const $li = $(this);
          const name = $.trim($li.text());

          $tabLis.removeClass('active');
          $li.addClass('active');

          updateMobileProject(name);

          if (typeof setPhoneCurrentName === 'function') {
            setPhoneCurrentName(name);
          }
        });

        const firstName = $.trim($tabLis.first().text());
        $tabLis.first().addClass('active');
        updateMobileProject(firstName);

        if (typeof setPhoneCurrentName === 'function') {
          setPhoneCurrentName(firstName);
        }
      }
    });
  }

const scrollEl = document.querySelector('#heroSection .scroll');

  window.addEventListener('scroll', () => {
  if (window.scrollY > 200) {
    scrollEl.classList.add('hide');
  } else {
    scrollEl.classList.remove('hide');
  }
});

});
