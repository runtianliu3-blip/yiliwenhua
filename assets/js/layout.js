/* ============ 海南以礼文化传媒有限公司 · 公共头尾注入 ============ */
(function () {
  'use strict';

  /* 素材未上传时隐藏破图/坏视频，露出占位底纹。
     必须在 layout.js（body 顶部）注册，晚于此处的监听会漏掉首屏图片的 error。 */
  document.addEventListener('error', function (e) {
    var el = e.target;
    if (el && (el.tagName === 'IMG' || el.tagName === 'VIDEO')) { el.style.display = 'none'; }
  }, true);

  var NAV = [
    { t: '首页', h: 'index.html', k: 'home' },
    { t: '服务', h: 'services.html', k: 'services' },
    { t: '案例', h: 'cases.html', k: 'cases' },
    /* 团队页暂不对外，先从导航移除；team.html 文件保留，需要时把这行放回来
    { t: '团队', h: 'team.html', k: 'team' }, */
    { t: '关于我们', h: 'about.html', k: 'about' },
    { t: '流程', h: 'process.html', k: 'process' },
    { t: '评价', h: 'testimonials.html', k: 'testimonials' },
    { t: '联系', h: 'contact.html', k: 'contact' }
  ];

  var page = document.body.getAttribute('data-page') || '';
  var onLight = document.body.getAttribute('data-nav') === 'light';

  function logo(cls) {
    return '<a class="logo" href="index.html" aria-label="海南以礼文化传媒有限公司 首页">' +
      '<span class="logo-mk">' +
        '<img class="lg-l" src="assets/images/logo-light.png" alt="海南以礼文化传媒有限公司">' +
        '<img class="lg-d" src="assets/images/logo-dark.png" alt="海南以礼文化传媒有限公司">' +
      '</span></a>';
  }

  function navLinks(cls) {
    return NAV.map(function (n) {
      return '<a href="' + n.h + '"' + (n.k === page ? ' aria-current="page"' : '') + '>' + n.t + '</a>';
    }).join('');
  }

  /* ---------- 页头 ---------- */
  var headerHost = document.getElementById('site-header');
  if (headerHost) {
    headerHost.outerHTML =
      '<header class="hdr' + (onLight ? ' on-light solid' : '') + '" id="hdr">' +
        '<div class="wrap hdr-in">' +
          logo() +
          '<nav class="nav" aria-label="主导航">' + navLinks() + '</nav>' +
          '<div class="hdr-cta">' +
            '<a class="btn btn-ghost" href="contact.html">获取 IP 方案</a>' +
            '<button class="burger" id="burger" aria-label="打开菜单" aria-expanded="false" aria-controls="drawer">' +
              '<span></span><span></span><span></span>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</header>' +
      '<nav class="drawer" id="drawer" aria-label="移动端导航" aria-hidden="true">' +
        navLinks() +
        '<a class="btn btn-gold" href="contact.html">获取 IP 方案</a>' +
      '</nav>';
  }

  /* ---------- 页脚 ---------- */
  function renderFooter() {
    var host = document.getElementById('site-footer');
    if (!host) return;
    var year = new Date().getFullYear();
    host.outerHTML =
      '<footer class="ftr">' +
        '<div class="wrap">' +
          '<div class="ftr-top">' +
            '<div>' + logo() +
              '<p class="ftr-name">海南以礼文化传媒有限公司</p>' +
              '<p class="ftr-desc">专注IP策划、短视频教学、账号陪跑于一体的新媒体服务机构，' +
              '赋能个体与实体企业放大自身影响力，实现流量长效增长与可持续商业变现。</p>' +
            '</div>' +
            '<div><h5>快速链接</h5><div class="ftr-links">' +
              '<a href="about.html">关于我们</a><a href="services.html">服务项目</a>' +
              '<a href="process.html">服务流程</a>' +
            '</div></div>' +
            '<div><h5>服务与案例</h5><div class="ftr-links">' +
              '<a href="cases.html">案例中心</a>' +
              '<a href="testimonials.html">客户评价</a><a href="contact.html">联系我们</a>' +
            '</div></div>' +
            '<div><h5>预约咨询</h5><div class="ftr-ct">' +
              '<b>13136026602</b>' +
              '<span>微信号：WangTX112</span>' +
              '<span>海口市龙华区林安国际商贸城<br>A1 栋 13 楼 1319 房</span>' +
              '<span>周一至周日 10:00 – 18:00</span>' +
            '</div></div>' +
          '</div>' +
          '<div class="ftr-bot">' +
            '<span>© ' + year + ' 海南以礼文化传媒有限公司. All rights reserved.</span>' +
          '</div>' +
        '</div>' +
      '</footer>' +
      '<button class="top" id="toTop" aria-label="返回顶部">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">' +
        '<path d="M12 19V5M5 12l7-7 7 7"/></svg>' +
      '</button>';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderFooter);
  } else {
    renderFooter();
  }
})();
