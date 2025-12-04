$(function () {
  // AOS 초기화
  AOS.init({
    duration: 600,
    easing: 'ease-out',
    once: true
  });

  // 공통 변수
  const $window = $(window);
  const $header = $('header');

  let lastScrollY = $window.scrollTop();
  let isClickScrolling = false; // 클릭으로 스크롤 중인지 체크
  let skillAnimated = false;    // 스킬 섹션 차트 1번만 실행

  // 헤더 스크롤 숨김/보임
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

  // 스킬 게이지 차트 (스크롤 시 진입하면 1번만 실행)
  const runSkillChart = function () {
    if (skillAnimated) return;

    const $skillSection = $('#skillSection');
    if (!$skillSection.length) return;

    const winTop = $window.scrollTop();
    const winH = $window.height();
    const secTop = $skillSection.offset().top;

    // 화면 아래쪽 60% 지점이 섹션 상단을 지나면 실행
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
            }
          }
        });
      }
    });
  };

  $window.on('scroll', runSkillChart);
  runSkillChart();

  // 공통 스크롤 함수
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

  // topBtn
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

  // 모바일 네비 스크롤 스파이 & 클릭 이동
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

  // 스크롤 스파이
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

    if (currentKey) {
      setActiveByKey(currentKey);
    }
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

  // 스킬 호버 시 툴팁 창 (PC용)
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

  // 프로젝트 섹션: 데이터 매핑
  const projectData = {
    "JIWON's Portfolio": {
      imagePc: "./img/webProject1.png",
      imageMobile: "./img/mobile_webProject1.png",
      alt: "JIWON's Portfolio",
      title: "JIWON's Portfolio",
      subtext: ["반응형 웹 페이지", "1인 프로젝트", "제작페이지 : 메인페이지"],
      buttons: [
        { label: "기획서", href: "#" },
        { label: "와이어프레임", href: "#" },
        { label: "최종 프로젝트", href: "#" }
      ]
    },
    "대구아쿠아리움 Redesign": {
      imagePc: "./img/webProject2.png",
      imageMobile: "./img/mobile_webProject2.png",
      alt: "Daegu Aquarium Redesign",
      title: "대구아쿠아리움 Redesign",
      subtext: ["반응형 웹 페이지", "1인 프로젝트", "메인 페이지 리디자인"],
      buttons: [
        { label: "기획서", href: "#" },
        { label: "와이어프레임", href: "#" },
        { label: "최종 프로젝트", href: "#" }
      ]
    },
    "라이크벨 Clone Coding": {
      imagePc: "./img/webProject3.png",
      imageMobile: "./img/mobile_webProject3.png",
      alt: "LikeBel Clone Coding",
      title: "라이크벨 Clone Coding",
      subtext: ["반응형 웹 페이지", "클론코딩", "메인 페이지 구현"],
      buttons: [
        { label: "기획서", href: "#" },
        { label: "와이어프레임", href: "#" },
        { label: "최종 프로젝트", href: "#" }
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
        { label: "기획서", href: "#" },
        { label: "와이어프레임", href: "#" },
        { label: "최종 프로젝트", href: "#" }
      ]
    },
    "교보문구 룸 스프레이 Detail Page": {
      imagePc: "./img/designProject1.png",
      imageMobile: "./img/designProject1.png",
      alt: "Kyobo Room Spray Detail Page",
      title: "교보문구 룸 스프레이 Detail Page",
      subtext: ["상세페이지 디자인", "1인 프로젝트", "Photoshop · Figma"],
      buttons: [
        { label: "최종 프로젝트", href: "#" }
      ]
    }
  };

  // 프로젝트 섹션: PC용
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

    // li 클릭 시 오른쪽 프로젝트 내용 변경
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

      // PC용 이미지
      $workImg.attr('src', data.imagePc);
      $workImg.attr('alt', data.alt);

      $projTitle.text(data.title);

      $subtext.empty();
      data.subtext.forEach(txt => {
        $('<li>').text(txt).appendTo($subtext);
      });

      $btns.empty();
      data.buttons.forEach(btn => {
        $('<a>')
          .attr('href', btn.href)
          .text(btn.label)
          .appendTo($btns);
      });
    });

    const $firstType = $types.first();
    const $firstUl = $firstType.children('ul');
    const $firstLi = $firstUl.find('li').first();

    $types.not($firstType).children('ul').hide();
    $firstUl.show();
    $firstType.find('.title img').addClass('open');
    $firstLi.trigger('click');
  }

  // 프로젝트 섹션: Mobile/Tablet (mobile_inner)
  const $mobileInner = $('#projectSection .mobile_inner');

  if ($mobileInner.length) {
    const $mobileContents = $mobileInner.find('.mobileContents .contents');

    $mobileContents.each(function () {
      const $wrap = $(this);
      const $tab = $wrap.find('.tabSelect');     // Tablet용
      const $phone = $wrap.find('.phoneSelect'); // Mobile용
      const $img = $wrap.find('.mobileObject img');
      const $textTitle = $wrap.find('.objectText h4');
      const $textList = $wrap.find('.objectText ul');
      const $btnWrap = $wrap.find('.objectText .btns');

 
      if (!$tab.length && !$phone.length) return;

      // 공통 업데이트 함수
      const updateMobileProject = function (name) {
        const data = projectData[name];
        if (!data) {
          console.warn('projectData에 없는 이름(Mobile/Tablet):', name);
          return;
        }

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

        $btnWrap.empty();
        data.buttons.forEach(btn => {
          $('<a>')
            .attr('href', btn.href)
            .text(btn.label)
            .appendTo($btnWrap);
        });
      };

      if ($tab.length) {
        const $tabLis = $tab.find('li');

        $tabLis.on('click', function () {
          const $li = $(this);
          const name = $.trim($li.text());

          $tabLis.removeClass('active');
          $li.addClass('active');

         
          if ($phone.length) {
            const $labelSpan = $phone.find('.phone-current .label');
            if ($labelSpan.length) {
              $labelSpan.text(name);
            }
          }

          updateMobileProject(name);
        });

        const firstName = $.trim($tabLis.first().text());
        $tabLis.first().addClass('active');
        updateMobileProject(firstName);
      }

      //Mobile용 phoneSelect
      if ($phone.length) {
        const $phoneLis = $phone.find('li');
        const $current = $phoneLis.first();
        const $restLis = $phoneLis.slice(1); 

        let currentLabelText = $.trim(
          $current
            .clone()
            .children('img').remove().end()
            .text()
        );

        const $icon = $current.find('img');

        $current
          .empty()
          .addClass('phone-current');

        const $labelSpan = $('<span class="label">').text(currentLabelText);
        $current.append($labelSpan);
        if ($icon.length) $current.append($icon);

        const $dropdown = $('<div class="phone-options"></div>');

        const $firstOpt = $('<li>').text(currentLabelText);
        $dropdown.append($firstOpt);

        $dropdown.append($restLis);

        $phone.append($dropdown);

        const $options = $dropdown.find('li');


        const setActiveOption = function (name) {
          $options.removeClass('active');
          let found = false;

          $options.each(function () {
            const $opt = $(this);
            if ($.trim($opt.text()) === name) {
              $opt.addClass('active');
              found = true;
            }
          });

          $labelSpan
            .text(name)
            .addClass('label-active');

          if (!found) {
            $options.removeClass('active');
          }
        };

        const openDropdown = function () {
          $phone.addClass('open');
          $dropdown.stop().slideDown(160);
          if ($icon.length) $icon.addClass('open');
        };

        const closeDropdown = function () {
          $phone.removeClass('open');
          $dropdown.stop().slideUp(160);
          if ($icon.length) $icon.removeClass('open');
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

        let initialName = null;

        if ($tab.length) {
          initialName = $.trim($tab.find('li').first().text());
        } else if ($options.length) {
          initialName = $.trim($options.first().text());
        } else {
          initialName = currentLabelText;
        }

        setActiveOption(initialName);
        updateMobileProject(initialName);
      }
    });
  }
});
