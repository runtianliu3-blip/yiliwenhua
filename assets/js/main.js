/* ============ 海南以礼文化传媒有限公司 · 交互脚本 ============ */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    var body = document.body;
    var softMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;

    /* --- 首屏标题：把每行包进 .ln，配合 overflow 做遮罩上滑 --- */
    var heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
      heroTitle.querySelectorAll('em').forEach(function (em, i) {
        var txt = em.textContent;
        em.textContent = '';
        var ln = document.createElement('span');
        ln.className = 'ln';
        ln.textContent = txt;
        ln.style.setProperty('--i', i);
        em.appendChild(ln);
      });
      /* 首屏标题不依赖 IntersectionObserver：它一定在初始视口内。
         rAF 负责让过渡正常播放；setTimeout 兜底——后台标签页或被节流的
         环境里 rAF 可能不推进，若只靠它，标题会一直停在遮罩里不可见。 */
      var showTitle = function () { heroTitle.classList.add('in'); };
      requestAnimationFrame(showTitle);
      setTimeout(showTitle, 400);
    }

    /* --- 首屏全屏照片轮播（悬停出现左右箭头） --- */
    var heroEl = document.querySelector('.hero');
    if (heroEl) {
      var slides = heroEl.querySelectorAll('.hero-slide');
      var prevBtn = heroEl.querySelector('.hero-prev');
      var nextBtn = heroEl.querySelector('.hero-next');
      var cur = 0, timer = null, DUR = 6000;

      function paintSlide(n) {
        cur = (n + slides.length) % slides.length;
        slides.forEach(function (s, i) { s.classList.toggle('is-on', i === cur); });
      }
      function autoplay() {
        clearInterval(timer);
        if (!softMotion && slides.length > 1) {
          timer = setInterval(function () { paintSlide(cur + 1); }, DUR);
        }
      }
      function step(d) { paintSlide(cur + d); autoplay(); }

      if (slides.length) {
        if (prevBtn) prevBtn.addEventListener('click', function () { step(-1); });
        if (nextBtn) nextBtn.addEventListener('click', function () { step(1); });
        /* 键盘左右键也能切 */
        heroEl.addEventListener('keydown', function (e) {
          if (e.key === 'ArrowLeft') step(-1);
          else if (e.key === 'ArrowRight') step(1);
        });
        paintSlide(0);
        autoplay();
        /* 切到后台就停，回来再续，省电也避免回来时连跳几张 */
        document.addEventListener('visibilitychange', function () {
          if (document.hidden) clearInterval(timer); else autoplay();
        });
      }
    }

    /* --- 案例卡：悬停播放预览，右上角按钮可开声音 --- */
    var caseCards = document.querySelectorAll('.case-v');
    caseCards.forEach(function (card) {
      var v = card.querySelector('video');
      if (!v) return;
      var btn = card.querySelector('.case-sound');
      var media = card.querySelector('.media');

      function syncBtn() {
        if (!btn) return;
        var on = !v.muted;
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        btn.setAttribute('aria-label', on ? '关闭声音' : '开启声音并播放');
      }
      function play() {
        var p = v.play();
        /* 带声音播放可能被自动播放策略拒绝，退回静音再播 */
        if (p && p.catch) p.catch(function () {
          if (v.muted) return;
          v.muted = true;
          syncBtn();
          var q = v.play();
          if (q && q.catch) q.catch(function () {});
        });
      }
      function stop(reset) {
        v.pause();
        if (reset) {
          try { v.currentTime = 0; } catch (e) {}
        }
        if (!v.muted) {
          v.muted = true;
          syncBtn();
        }
      }

      v.addEventListener('playing', function () { card.classList.add('is-playing'); });
      v.addEventListener('pause', function () { card.classList.remove('is-playing'); });
      v.addEventListener('ended', function () { card.classList.remove('is-playing'); });

      card.addEventListener('mouseenter', function () {
        if (softMotion || (window.matchMedia && window.matchMedia('(hover:none)').matches)) return;
        play();
      });
      card.addEventListener('mouseleave', function () {
        if (window.matchMedia && window.matchMedia('(hover:none)').matches) return;
        stop(true);
      });

      /* 手机上点封面即可播放/暂停，不会误跳到咨询页。 */
      if (media) {
        media.addEventListener('click', function (e) {
          if (!window.matchMedia || !window.matchMedia('(hover:none)').matches) return;
          e.preventDefault();
          e.stopPropagation();
          if (v.paused) play(); else v.pause();
        });
      }

      if (btn) {
        btn.addEventListener('click', function (e) {
          /* 按钮在整块链接旁边，别让点击冒泡去跳转 */
          e.preventDefault();
          e.stopPropagation();
          v.muted = !v.muted;
          syncBtn();
          if (v.muted) return;
          /* 同一时间只留一路声音 */
          caseCards.forEach(function (other) {
            if (other === card) return;
            var ov = other.querySelector('video');
            if (!ov || ov.muted) return;
            ov.muted = true;
            var ob = other.querySelector('.case-sound');
            if (ob) {
              ob.setAttribute('aria-pressed', 'false');
              ob.setAttribute('aria-label', '开启声音并播放');
            }
          });
          play();
        });
      }

      /* 视频缺失就隐藏，留封面图 */
      v.addEventListener('error', function () {
        card.classList.remove('is-playing');
        v.style.display = 'none';
        if (btn) btn.style.display = 'none';
      });

      /* 离开视口、切到后台或离开页面时停止，避免手机继续播放声音。 */
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) stop(true);
          });
        }, { threshold: 0.08 }).observe(card);
      }
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) stop(true);
      });
      window.addEventListener('pagehide', function () { stop(true); });
    });

    /* --- 关于我们：视频卡点击播放（带声音） --- */
    var aboutBox = document.querySelector('.about-media');
    if (aboutBox) {
      var av = aboutBox.querySelector('video');
      var avBtn = aboutBox.querySelector('.av-play');
      if (av && avBtn) {
        avBtn.addEventListener('click', function () {
          aboutBox.classList.add('on');
          var p = av.play();
          if (p && p.catch) p.catch(function () { aboutBox.classList.remove('on'); });
        });
        av.addEventListener('ended', function () { aboutBox.classList.remove('on'); });
        /* 视频缺失就别露出播放按钮，只留封面与说明 */
        av.addEventListener('error', function () {
          av.style.display = 'none';
          avBtn.style.display = 'none';
        });
      }
    }

    /* --- 导语区视频：由用户通过原生控件播放，离屏或切后台自动暂停 --- */
    var introVid = document.querySelector('.intro-video video');
    if (introVid) {
      var introBox = introVid.closest('.intro-video');
      var introPlay = introBox && introBox.querySelector('.intro-play');
      function stopIntro(reset) {
        introVid.pause();
        if (reset) {
          try { introVid.currentTime = 0; } catch (e) {}
        }
      }
      if (introPlay) {
        introPlay.addEventListener('click', function () {
          introVid.controls = true;
          var p = introVid.play();
          if (p && p.catch) p.catch(function () {
            introVid.controls = false;
            if (introBox) introBox.classList.remove('is-playing');
          });
        });
        introVid.addEventListener('playing', function () {
          if (introBox) introBox.classList.add('is-playing');
        });
        introVid.addEventListener('ended', function () {
          introVid.controls = false;
          if (introBox) introBox.classList.remove('is-playing');
        });
      }
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (!e.isIntersecting) stopIntro(false); });
        }, { threshold: 0.25 }).observe(introVid);
      }
      /* 视频缺失时隐藏元素，露出占位底纹与文件名提示 */
      introVid.addEventListener('error', function () {
        introVid.style.display = 'none';
        if (introPlay) introPlay.style.display = 'none';
      });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) stopIntro(false);
      });
      window.addEventListener('pagehide', function () { stopIntro(true); });
    }

    /* --- 滚动：页头变实 + 返回顶部 --- */
    var hdr = document.getElementById('hdr');
    var toTop = document.getElementById('toTop');
    var lightNav = body.getAttribute('data-nav') === 'light';

    var heroBg = document.querySelector('.phero .media>img');
    var heroBox = heroBg && heroBg.closest('.phero');
    var ticking = false;

    function paint() {
      ticking = false;
      var y = window.pageYOffset || document.documentElement.scrollTop;
      if (hdr && !lightNav) hdr.classList.toggle('solid', y > 40);
      if (toTop) toTop.classList.toggle('show', y > 520);

      /* 内页 Banner 视差：图片比容器高，位移上限控制在不露边范围内 */
      if (heroBg && heroBox && !softMotion) {
        var h = heroBox.offsetHeight;
        if (y < h) heroBg.style.transform = 'translate3d(0,' + (y * 0.1).toFixed(1) + 'px,0)';
      }
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(paint);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    paint();

    if (toTop) {
      toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    /* --- 移动端抽屉 --- */
    var burger = document.getElementById('burger');
    var drawer = document.getElementById('drawer');
    var menuReturnFocus = null;
    function closeMenu(restoreFocus) {
      body.classList.remove('menu-open');
      if (burger) {
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', '打开菜单');
      }
      if (drawer) drawer.setAttribute('aria-hidden', 'true');
      if (restoreFocus && menuReturnFocus && menuReturnFocus.focus) menuReturnFocus.focus();
    }
    if (burger && drawer) {
      burger.addEventListener('click', function () {
        var open = body.classList.toggle('menu-open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        burger.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
        drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
        if (open) {
          menuReturnFocus = document.activeElement;
          var firstLink = drawer.querySelector('a');
          if (firstLink) requestAnimationFrame(function () { firstLink.focus(); });
        }
      });
      drawer.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') closeMenu(false);
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && body.classList.contains('menu-open')) closeMenu(true);
      if (e.key !== 'Tab' || !drawer || !body.classList.contains('menu-open')) return;
      var focusable = drawer.querySelectorAll('a[href],button:not([disabled])');
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });
    if (window.matchMedia) {
      var desktopMenu = window.matchMedia('(min-width:1081px)');
      var closeOnDesktop = function (e) { if (e.matches) closeMenu(false); };
      if (desktopMenu.addEventListener) desktopMenu.addEventListener('change', closeOnDesktop);
      else if (desktopMenu.addListener) desktopMenu.addListener(closeOnDesktop);
    }

    /* --- 滚动入场动画 --- */
    var items = document.querySelectorAll('.rv');
    if ('IntersectionObserver' in window && items.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var el = en.target;
          var d = parseInt(el.getAttribute('data-d') || '0', 10);
          setTimeout(function () { el.classList.add('in'); }, d);
          io.unobserve(el);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      items.forEach(function (el) { io.observe(el); });
    } else {
      items.forEach(function (el) { el.classList.add('in'); });
    }

    /* --- 数字滚动（静态文本已是真实数值，动画结束后原样还原） --- */
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      var finalText = el.textContent;
      var done = false;
      function run() {
        if (done) return; done = true;
        var t0 = null, dur = 1500;
        /* 兜底：若 rAF 因任何原因未推进，到时也把真实数值写回 */
        setTimeout(function () { el.textContent = finalText; }, dur + 250);
        function tick(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1);
          if (p >= 1) { el.textContent = finalText; return; }
          var v = target * (1 - Math.pow(1 - p, 3));
          el.textContent = (target % 1 ? v.toFixed(1) : Math.round(v)) + suffix;
          requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }
      if ('IntersectionObserver' in window) {
        var o = new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.isIntersecting) { run(); o.disconnect(); } });
        }, { threshold: 0.4 });
        o.observe(el);
      } else { run(); }
    });

    /* --- 案例筛选 --- */
    var filters = document.querySelectorAll('.filter');
    if (filters.length) {
      filters.forEach(function (btn) {
        btn.addEventListener('click', function () {
          filters.forEach(function (b) { b.classList.remove('on'); });
          btn.classList.add('on');
          body.classList.add('filtered');   /* 启用切换补间动画 */
          var cat = btn.getAttribute('data-cat');
          document.querySelectorAll('.case-item').forEach(function (item) {
            var match = cat === 'all' || item.getAttribute('data-cat') === cat;
            item.classList.toggle('hide', !match);
            item.classList.add('in');       /* 已筛选出来的确保可见 */
          });
        });
      });
    }

    /* --- 咨询表单：校验后发送到邮件转发服务，失败时保留用户输入 --- */
    var form = document.getElementById('leadForm');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var ok = true;
        form.querySelectorAll('[data-required]').forEach(function (input) {
          var field = input.closest('.field');
          var val = input.value.trim();
          var bad = !val;
          if (!bad && input.type === 'tel') bad = !/^[\d\-+\s()]{7,20}$/.test(val);
          if (!bad && input.type === 'email') bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
          field.classList.toggle('err', bad);
          if (bad) ok = false;
        });
        if (!ok) return;

        var status = document.getElementById('formStatus');
        var submitBtn = form.querySelector('[type="submit"]');
        var endpoint = form.getAttribute('data-ajax-action');
        var originalLabel = submitBtn ? submitBtn.textContent : '';
        var trap = form.querySelector('[name="_honey"]');

        function showStatus(type, message) {
          if (!status) return;
          status.className = 'form-status show ' + type;
          status.setAttribute('role', type === 'err' ? 'alert' : 'status');
          status.textContent = message;
        }

        /* 蜜罐被填写时静默处理，避免机器人继续尝试。 */
        if (trap && trap.value) {
          form.reset();
          showStatus('ok', '已收到你的信息，我们会在 24 小时内联系你。');
          return;
        }

        if (!window.fetch || !endpoint) {
          form.submit();
          return;
        }

        if (status) status.className = 'form-status';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = '正在提交…';
        }

        var controller = window.AbortController ? new AbortController() : null;
        var timeout = setTimeout(function () {
          if (controller) controller.abort();
        }, 15000);

        fetch(endpoint, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form),
          signal: controller ? controller.signal : undefined
        }).then(function (response) {
          return response.json().catch(function () { return {}; }).then(function (data) {
            var accepted = data.success === true || data.success === 'true';
            if (!response.ok || !accepted) throw new Error(data.message || 'submit_failed');
            return data;
          });
        }).then(function () {
          form.reset();
          showStatus('ok', '提交成功，我们会在 24 小时内联系你。');
        }).catch(function () {
          showStatus('err', '提交未成功，请稍后重试，或拨打 13136026602 / 添加微信 WangTX112 联系我们。');
        }).then(function () {
          clearTimeout(timeout);
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalLabel;
          }
        });
      });
      form.addEventListener('input', function (e) {
        var f = e.target.closest('.field');
        if (f) f.classList.remove('err');
      });
    }
  });
})();
