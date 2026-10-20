/* ==========================================================================
   القدس للمجوهرات – سامح القدس
   interactions
   ========================================================================== */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- ترقيم السنة في الفوتر ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- الهيدر: تغيّر الحالة عند التمرير ---------- */
  var header = document.getElementById('siteHeader');
  var lastY = 0;
  function onScrollHeader() {
    var y = window.scrollY || window.pageYOffset;
    if (y > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
    lastY = y;
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- قائمة الموبايل ---------- */
  var menuToggle = document.getElementById('menuToggle');
  var mobileMenu = document.getElementById('mobileMenu');
  var mobileClose = document.getElementById('mobileClose');

  function openMenu() {
    mobileMenu.hidden = false;
    // فتح ناعم مع بديل في حال تباطؤ الإطارات
    requestAnimationFrame(function () { mobileMenu.classList.add('open'); });
    setTimeout(function () { mobileMenu.classList.add('open'); }, 30);
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    mobileMenu.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    setTimeout(function () { mobileMenu.hidden = true; }, 380);
  }
  if (menuToggle) menuToggle.addEventListener('click', function () {
    if (menuToggle.getAttribute('aria-expanded') === 'true') closeMenu();
    else openMenu();
  });
  if (mobileClose) mobileClose.addEventListener('click', closeMenu);
  mobileMenu.querySelectorAll('.mobile-nav-link, .mobile-menu-footer a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });

  /* ---------- تمرير سلس مع مراعاة الهيدر الثابت ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var offset = header.offsetHeight + 10;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: top, behavior: prefersReduced ? 'auto' : 'smooth' });
      // تحديث الرابط في العنوان دون قفزة
      if (history.pushState) history.pushState(null, '', id);
    });
  });

  /* ---------- Scroll Reveal (يمين → يسار) ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !prefersReduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
          setTimeout(function () { el.classList.add('in'); }, delay);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- الخط الذهبي المتحرك تحت العناوين ---------- */
  var lines = document.querySelectorAll('.gold-line');
  if ('IntersectionObserver' in window) {
    var lineIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('grown'); lineIo.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    lines.forEach(function (l) { lineIo.observe(l); });
  } else {
    lines.forEach(function (l) { l.classList.add('grown'); });
  }

  /* ---------- Parallax خفيف للصور ---------- */
  var heroImg = document.getElementById('heroImg');
  var parallaxImgs = document.querySelectorAll('.parallax-img');
  var ticking = false;

  function parallax() {
    var y = window.scrollY || window.pageYOffset;
    if (heroImg && !prefersReduced) {
      var shift = Math.min(y * 0.04, 30);
      heroImg.style.transform = 'translate3d(0,' + shift + 'px,0)';
    }
    parallaxImgs.forEach(function (img) {
      if (prefersReduced) return;
      var rect = img.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      var progress = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
      img.style.transform = 'scale(1.1) translate3d(0,' + (progress * -22) + 'px,0)';
    });
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(parallax); ticking = true; }
  }, { passive: true });
  parallax();

  /* ---------- عرض صور الهيرو (كاروسيل) ---------- */
  var slidesWrap = document.querySelector('.hero-slides');
  if (slidesWrap) {
    var heroSlides = Array.prototype.slice.call(slidesWrap.querySelectorAll('.hero-slide'));
    var heroDotsWrap = document.getElementById('heroDots');
    var heroFrame = document.getElementById('heroFrame');
    var heroIndex = 0;
    var heroTimer = null;
    var HERO_DELAY = 5200;

    /* بناء نقاط المؤشر */
    heroSlides.forEach(function (s, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'hero-dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', 'عرض الصورة ' + (i + 1));
      dot.addEventListener('click', function () { showHero(i, true); });
      heroDotsWrap.appendChild(dot);
    });
    var heroDots = Array.prototype.slice.call(heroDotsWrap.children);

    function showHero(i, userAction) {
      heroIndex = (i + heroSlides.length) % heroSlides.length;
      heroSlides.forEach(function (s, k) {
        var on = k === heroIndex;
        s.classList.toggle('is-active', on);
        if (on) s.removeAttribute('aria-hidden');
        else s.setAttribute('aria-hidden', 'true');
      });
      heroDots.forEach(function (d, k) { d.classList.toggle('is-active', k === heroIndex); });
      if (userAction) restartHeroTimer();
    }

    function restartHeroTimer() {
      clearInterval(heroTimer);
      if (prefersReduced || document.hidden) return; /* احترام تقليل الحركة */
      heroTimer = setInterval(function () { showHero(heroIndex + 1); }, HERO_DELAY);
    }

    var hbPrev = document.getElementById('heroPrev');
    var hbNext = document.getElementById('heroNext');
    if (hbPrev) hbPrev.addEventListener('click', function () { showHero(heroIndex - 1, true); });
    if (hbNext) hbNext.addEventListener('click', function () { showHero(heroIndex + 1, true); });

    if (heroFrame) {
      /* إيقاف التشغيل التلقائي عند المرور أو التركيز */
      heroFrame.addEventListener('mouseenter', function () { clearInterval(heroTimer); });
      heroFrame.addEventListener('mouseleave', restartHeroTimer);
      heroFrame.addEventListener('focusin', function () { clearInterval(heroTimer); });
      heroFrame.addEventListener('focusout', restartHeroTimer);
      /* السحب باللمس */
      var heroTouchX = null;
      heroFrame.addEventListener('touchstart', function (e) { heroTouchX = e.touches[0].clientX; }, { passive: true });
      heroFrame.addEventListener('touchend', function (e) {
        if (heroTouchX === null) return;
        var dx = e.changedTouches[0].clientX - heroTouchX;
        if (Math.abs(dx) > 44) showHero(heroIndex + (dx < 0 ? 1 : -1), true);
        heroTouchX = null;
      }, { passive: true });
    }

    /* إيقاف التشغيل عند إخفاء الصفحة أو خروج الهيرو من الشاشة */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) clearInterval(heroTimer); else restartHeroTimer();
    });
    if ('IntersectionObserver' in window && !prefersReduced) {
      var heroIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) restartHeroTimer(); else clearInterval(heroTimer);
        });
      }, { threshold: 0.2 });
      heroIo.observe(heroFrame || slidesWrap);
    }
    restartHeroTimer();
  }

  /* ---------- إبراز الرابط النشط في القائمة ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));

  function updateActiveLink() {
    var headerH = header ? header.offsetHeight : 80;
    var probe = window.scrollY + headerH + 4;
    var currentId = sections.length ? sections[0].id : '';

    for (var i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= probe) currentId = sections[i].id;
    }
    // عند التمرير لأقصى الأسفل،فعّل آخر قسم حتى لو لم يبلغ موضعه الخط
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4 && sections.length) {
      currentId = sections[sections.length - 1].id;
    }

    navLinks.forEach(function (l) {
      l.classList.toggle('active', l.getAttribute('href') === '#' + currentId);
    });
    navRafPending = false;
  }

  var navRafPending = false;
  var navSettleTimer = null;

  function scheduleActiveLink() {
    // إطار للتحديث أثناء التمرير بسلاسة
    if (!navRafPending) { requestAnimationFrame(updateActiveLink); navRafPending = true; }
    // حفظة زمنية تضمن تحديث الحالة النهائية حتى لو أُخّر تنفيذ الإطارات
    clearTimeout(navSettleTimer);
    navSettleTimer = setTimeout(updateActiveLink, 120);
  }

  window.addEventListener('scroll', scheduleActiveLink, { passive: true });
  window.addEventListener('resize', updateActiveLink);
  updateActiveLink();

  /* ---------- أزرار مغناطيسية (كمبيوتر فقط) ---------- */
  var isFine = window.matchMedia('(pointer:fine)').matches;
  if (isFine && !prefersReduced) {
    document.querySelectorAll('.magnetic').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        btn.style.transform = 'translate(' + (x * 0.14) + 'px,' + (y * 0.2 - 2) + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }

  /* ---------- صور بديلة عند الفشل ----------
     نلتقط أخطاء الصور على مستوى المستند (capture) حتى نغطي الصور
     التي قد يفشل تحميلها قبل تسجيل المعالج، أو التي تظهر لاحقًا (lazy).
     1) إن فشل WebP نجرّب نسخة JPG المطابقة (توافق أوسع مع الاستضافات)
     2) إن فشل الاثنان نظهر بديلًا أنيقًا بدل أيقونة الكسر */
  function fallbackSvg() {
    return "<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'>" +
      "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>" +
      "<stop offset='0' stop-color='#1a140d'/><stop offset='.5' stop-color='#30251B'/>" +
      "<stop offset='1' stop-color='#0B0B0B'/></linearGradient></defs>" +
      "<rect width='800' height='600' fill='url(#g)'/>" +
      "<path d='M400 250l30 50 55 10-40 40 10 55-55-28-55 28 10-55-40-40 55-10z' fill='none' stroke='#C9A45C' stroke-width='4'/></svg>";
  }

  function handleImageFailure(img) {
    var src = img.getAttribute('src') || '';
    var stage = img.dataset.fallbackStage || '';

    // المرحلة الأولى: التحويل من webp إلى jpg
    if (!stage && /\.webp(\?.*)?$/i.test(src)) {
      img.dataset.fallbackStage = 'jpg';
      img.src = src.replace(/\.webp(\?.*)?$/i, '.jpg');
      return true;
    }

    if (stage === 'svg') return false;

    // المرحلة الأخيرة: بديل أنيق بتدرج ذهبي
    img.dataset.fallbackStage = 'svg';
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(fallbackSvg());
    img.style.objectFit = 'cover';
    return true;
  }

  // التقاط شامل: يلتقط أخطاء التحميل في مرحلة الالتقاط (capture) لكل الصور،
  // بما فيها التي فشلت قبل تسجيل المعالج.
  document.addEventListener('error', function (e) {
    var el = e.target;
    if (el && el.tagName === 'IMG') handleImageFailure(el);
  }, true);

  // بعض الاستضافات تُرجِع 200 مع محتوى HTML بدل الصورة، فلا يُطلق حدث error.
  // لذلك نفحص فعليًا قدرة المتصفح على فك ترميز WebP من السيرفر نفسه.
  function probeServerWebp(callback) {
    var test = new Image();
    var done = false;
    var finish = function (ok) {
      if (done) return;
      done = true;
      callback(ok);
    };
    // مهلة احتياطية إن لم يحدث أي شيء
    setTimeout(function () { finish(test.naturalWidth > 0); }, 2500);
    test.onload = function () { finish(test.naturalWidth > 0 && test.width > 1); };
    test.onerror = function () { finish(false); };
    // نستخدم أصغر ملف متاح لسرعة الفحص
    test.src = 'images/gallery-1.webp?probe=' + Date.now();
  }

  function switchAllWebpToJpg() {
    document.querySelectorAll('img').forEach(function (img) {
      var src = img.getAttribute('src') || '';
      if (img.dataset.fallbackStage === 'svg') return;
      if (/\.webp(\?.*)?$/i.test(src)) {
        img.dataset.fallbackStage = 'jpg';
        img.src = src.replace(/\.webp(\?.*)?$/i, '.jpg');
      }
    });
  }

  probeServerWebp(function (webpWorks) {
    if (!webpWorks) {
      // الاستضافة لا تُخدم WebP بشكل صحيح => ننتقل إلى JPG لكل الصور
      switchAllWebpToJpg();
      document.documentElement.classList.add('no-webp');
    }
    // فحص إضافي للصور التي فشلت فعليًا
    sweepFailedImages();
    setTimeout(sweepFailedImages, 600);
    setTimeout(sweepFailedImages, 1600);
  });

  // فحص الصور التي فشلت بالفعل (complete && naturalWidth === 0) عند الإقلاع وعند اكتمال التحميل.
  function sweepFailedImages() {
    document.querySelectorAll('img').forEach(function (img) {
      if (img.dataset.fallbackStage) return;
      // نتجاهل الصور التي لم يبدأ تحميلها بعد (lazy) أو التي لم تُقرَّر بعد
      if (!img.getAttribute('src')) return;
      if (img.complete && img.naturalWidth === 0) handleImageFailure(img);
    });
  }
  sweepFailedImages();
  document.addEventListener('DOMContentLoaded', sweepFailedImages);
  window.addEventListener('load', function () { setTimeout(sweepFailedImages, 300); });

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCap = document.getElementById('lbCap');
  var lbClose = document.getElementById('lbClose');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll('.m-item'));
  var currentIndex = 0;
  var lastFocused = null;

  function openLightbox(i) {
    currentIndex = (i + galleryItems.length) % galleryItems.length;
    var fig = galleryItems[currentIndex];
    var img = fig.querySelector('img');
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = fig.querySelector('figcaption').textContent;
    lastFocused = document.activeElement;
    lightbox.hidden = false;
    requestAnimationFrame(function () { lightbox.classList.add('open'); });
    setTimeout(function () { lightbox.classList.add('open'); }, 30);
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(function () { lightbox.hidden = true; lbImg.src = ''; }, 340);
    if (lastFocused) lastFocused.focus();
  }
  galleryItems.forEach(function (fig, i) {
    fig.addEventListener('click', function () { openLightbox(i); });
    fig.setAttribute('tabindex', '0');
    fig.setAttribute('role', 'button');
    fig.setAttribute('aria-label', 'عرض الصورة: ' + fig.querySelector('figcaption').textContent);
    fig.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
    });
  });
  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbPrev) lbPrev.addEventListener('click', function () { openLightbox(currentIndex - 1); });
  if (lbNext) lbNext.addEventListener('click', function () { openLightbox(currentIndex + 1); });
  if (lightbox) lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowRight') openLightbox(currentIndex + 1);
    else if (e.key === 'ArrowLeft') openLightbox(currentIndex - 1);
  });

  /* ---------- تجربة اختيار المجوهرات ---------- */
  var finderCards = document.querySelectorAll('.finder-card');
  var messages = {
    gift: 'السلام عليكم، أبحث عن هدية من القدس للمجوهرات.',
    occasion: 'السلام عليكم، أبحث عن قطعة لمناسبة خاصة.',
    rings: 'السلام عليكم، أريد استكشاف الخواتم المتاحة.',
    sets: 'السلام عليكم، أريد استكشاف الأطقم المتاحة.',
    inquiry: 'السلام عليكم، أريد الاستفسار عن المتاح لديكم.'
  };
  var categoryMap = { rings: '#collections', sets: '#collections', gift: '#collections', occasion: '#collections' };
  finderCards.forEach(function (card) {
    card.addEventListener('click', function () {
      var action = card.getAttribute('data-action');
      var text = encodeURIComponent(messages[action] || 'السلام عليكم، أريد الاستفسار.');
      var waUrl = 'https://wa.me/201018899955?text=' + text;
      window.open(waUrl, '_blank', 'noopener');
    });
  });

  /* ---------- شريط الموبايل: إخفاء عند الوصول للتواصل ---------- */
  var mobileBar = document.getElementById('mobileBar');
  var contactSection = document.getElementById('contact');
  if (mobileBar && contactSection && 'IntersectionObserver' in window) {
    var barIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        mobileBar.style.opacity = en.isIntersecting ? '0' : '1';
        mobileBar.style.pointerEvents = en.isIntersecting ? 'none' : 'auto';
      });
    }, { threshold: 0.25 });
    barIo.observe(contactSection);
    mobileBar.style.transition = 'opacity .35s ease';
  }
})();
