(function () {
  'use strict';

  const header = document.getElementById('header');
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  const navClose = document.getElementById('navClose');
  const navLinks = document.querySelectorAll('.mn-nav-link');
  const revealEls = document.querySelectorAll('.reveal');
  const stepLine = document.querySelector('.step-line');
  const track = document.getElementById('testimonialTrack');
  const dotsContainer = document.getElementById('sliderDots');
  const prevBtn = document.querySelector('.slider-arrow.prev');
  const nextBtn = document.querySelector('.slider-arrow.next');
  const faqItems = document.querySelectorAll('.faq-item');
  const newsletterForm = document.getElementById('newsletterForm');
  const parallaxEls = document.querySelectorAll('.hero-image-wrap, .ai-visual, .mobile-visual');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== Header scroll state =====
  function updateHeader() {
    if (!header) return;
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  if (header) {
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }

  // ===== Mobile menu =====
  const mobileOverlay = document.getElementById('mobileNavOverlay');

  function openMenu() {
    if (!mainNav || !menuToggle) return;
    mainNav.classList.add('open');
    menuToggle.classList.add('active');
    menuToggle.setAttribute('aria-expanded', 'true');
    if (mobileOverlay) mobileOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (!mainNav || !menuToggle) return;
    mainNav.classList.remove('open');
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    if (mobileOverlay) mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      mainNav.classList.contains('open') ? closeMenu() : openMenu();
    });
  }

  if (navClose) navClose.addEventListener('click', closeMenu);

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMenu);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainNav.classList.contains('open')) closeMenu();
  });

  document.querySelectorAll('.mn-nav-link, .mn-quick-pill, .mn-cta-btns .btn').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) closeMenu();
  });

  // ===== Scroll spy =====
  const sections = ['hero', 'plans', 'how-it-works', 'hospitals', 'footer'];
  function updateActiveNav() {
    if (!header) return;
    const scrollPos = window.scrollY + header.offsetHeight + 80;
    let activeId = 'hero';
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= scrollPos) activeId = id;
    });
    navLinks.forEach((link) => {
      const href = link.getAttribute('href') || '';
      if (href.indexOf('#') === 0) {
        link.classList.toggle('active', href === '#' + activeId);
      }
    });
  }
  window.addEventListener('scroll', updateActiveNav, { passive: true });

  // ===== Reveal on scroll =====
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  // ===== Hero rotating word =====
  const heroWordEl = document.getElementById('heroWord');
  if (heroWordEl) {
    const heroWords = ['tomorrow', 'confidence', 'security', 'safety', 'freedom'];
    let heroWordIndex = 0;
    const HERO_WORD_DURATION = 400;
    setInterval(() => {
      heroWordEl.classList.add('word-out');
      setTimeout(() => {
        heroWordIndex = (heroWordIndex + 1) % heroWords.length;
        heroWordEl.textContent = heroWords[heroWordIndex];
        heroWordEl.classList.remove('word-out');
        heroWordEl.classList.add('word-in');
        setTimeout(() => heroWordEl.classList.remove('word-in'), HERO_WORD_DURATION);
      }, HERO_WORD_DURATION);
    }, 2000);
  }

  // ===== Partners marquee =====
  const partnersMarquee = document.querySelector('.partners-marquee');
  if (partnersMarquee && !partnersMarquee.querySelector('.partners-track')) {
    const partnerNames = [
      { mark: 'A', name: 'Apollo' },
      { mark: 'M', name: 'Max Healthcare' },
      { mark: 'F', name: 'Fortis' },
      { mark: 'M', name: 'Manipal' },
      { mark: 'N', name: 'Narayana' }
    ];
    const perHalf = Math.max(8, Math.ceil(window.innerWidth / 165) + 1);
    function buildPartnerGroup() {
      const group = document.createElement('div');
      group.className = 'partners-group';
      for (let i = 0; i < perHalf; i++) {
        const p = partnerNames[i % partnerNames.length];
        const el = document.createElement('div');
        el.className = 'partner-logo';
        el.innerHTML = '<span class="partner-mark">' + p.mark + '</span><span>' + p.name + '</span>';
        group.appendChild(el);
      }
      return group;
    }
    const track = document.createElement('div');
    track.className = 'partners-track';
    track.appendChild(buildPartnerGroup());
    track.appendChild(buildPartnerGroup());
    partnersMarquee.appendChild(track);
  }

  // ===== Steps line animation =====
  if (stepLine) {
    const stepObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            stepLine.classList.add('active');
            stepObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    const stepTarget = stepLine.closest('.steps');
    if (stepTarget) stepObserver.observe(stepTarget);
  }

  // ===== Testimonials slider =====
  let currentIndex = 0;
  let visibleCount = 1;
  let autoPlayTimer = null;
  let slideWidth = 0;

  function getVisibleCount() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  }

  function buildDots() {
    if (!dotsContainer || !track) return;
    dotsContainer.innerHTML = '';
    const total = track.children.length;
    const maxIndex = Math.max(0, total - visibleCount);
    for (let i = 0; i <= maxIndex; i++) {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
    updateDots();
  }

  function updateSlider() {
    if (!track) return;
    const firstCard = track.children[0];
    slideWidth = firstCard ? firstCard.getBoundingClientRect().width : track.clientWidth / visibleCount;
    const maxIndex = Math.max(0, track.children.length - visibleCount);
    currentIndex = Math.min(currentIndex, maxIndex);
    track.style.transform = `translateX(${-currentIndex * slideWidth}px)`;
    updateDots();
  }

  function updateDots() {
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll('button');
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
  }

  function goTo(index) {
    if (!track) return;
    const maxIndex = Math.max(0, track.children.length - visibleCount);
    currentIndex = Math.max(0, Math.min(index, maxIndex));
    track.style.transform = `translateX(${-currentIndex * slideWidth}px)`;
    updateDots();
    resetAutoPlay();
  }

  function next() {
    const maxIndex = Math.max(0, track.children.length - visibleCount);
    goTo(currentIndex >= maxIndex ? 0 : currentIndex + 1);
  }

  function prev() {
    const maxIndex = Math.max(0, track.children.length - visibleCount);
    goTo(currentIndex <= 0 ? maxIndex : currentIndex - 1);
  }

  function startAutoPlay() {
    if (prefersReducedMotion) return;
    stopAutoPlay();
    autoPlayTimer = setInterval(next, 5000);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) clearInterval(autoPlayTimer);
  }

  function resetAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  if (track) {
    visibleCount = getVisibleCount();
    buildDots();
    updateSlider();
    startAutoPlay();

    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);

    const slider = document.querySelector('.slider');
    if (slider) {
      slider.addEventListener('mouseenter', stopAutoPlay);
      slider.addEventListener('mouseleave', startAutoPlay);
    }

    window.addEventListener('resize', () => {
      const newCount = getVisibleCount();
      if (newCount !== visibleCount) {
        visibleCount = newCount;
        buildDots();
      }
      updateSlider();
    });
  }

  // ===== FAQ accordion =====
  faqItems.forEach((item) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // close all
      faqItems.forEach((other) => {
        other.classList.remove('active');
        const otherAnswer = other.querySelector('.faq-answer');
        const otherQ = other.querySelector('.faq-question');
        if (otherAnswer) otherAnswer.style.maxHeight = null;
        if (otherQ) otherQ.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ===== Newsletter =====
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input[type="email"]');
      const success = document.getElementById('newsletterSuccess');
      if (!input) return;
      const val = input.value.trim();
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (!isValid) {
        newsletterForm.classList.add('error');
        if (success) { success.className = 'newsletter-success error'; success.textContent = 'Please enter a valid email address.'; }
        return;
      }
      newsletterForm.classList.remove('error');
      if (success) { success.className = 'newsletter-success show'; success.innerHTML = '<i class="fa-solid fa-circle-check"></i> Thank you for subscribing! Check your inbox.'; }
      input.value = '';
      setTimeout(() => { if (success) success.className = 'newsletter-success'; }, 3000);
    });
    const nlInput = newsletterForm.querySelector('input[type="email"]');
    if (nlInput) {
      nlInput.addEventListener('input', () => {
        newsletterForm.classList.remove('error');
        const success = document.getElementById('newsletterSuccess');
        if (success) success.className = 'newsletter-success';
      });
    }
  }

  // ===== Parallax =====
  if (!prefersReducedMotion) {
    let ticking = false;
    function parallax() {
      const scrollY = window.scrollY;
      parallaxEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const centerOffset = rect.top + rect.height / 2 - window.innerHeight / 2;
        const speed = el.classList.contains('hero-image-wrap') ? 0.04 : 0.06;
        const y = centerOffset * speed;
        el.style.transform = `translateY(${y}px)`;
      });
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(parallax);
        ticking = true;
      }
    }, { passive: true });
  }

  // ===== Plans Page: Filter & Toggle =====
  const filterBtns = document.querySelectorAll('.toggle-btn');
  const billingSwitch = document.getElementById('billing-switch');
  const priceEls = document.querySelectorAll('.price-val');
  const periodEls = document.querySelectorAll('.period');
  let isYearly = false;
  let currentFilter = 'individual';

  const prices = {
    individual: { monthly: [499, 1299, 2499], yearly: [399, 999, 1999] },
    family: { monthly: [1299, 2499, 4499], yearly: [999, 1999, 3499] },
    senior: { monthly: [899, 1899, 3299], yearly: [699, 1499, 2499] }
  };

  function updatePrices() {
    const set = prices[currentFilter][isYearly ? 'yearly' : 'monthly'];
    priceEls.forEach((el, i) => {
      if (set[i] !== undefined) {
        el.textContent = set[i].toLocaleString('en-IN');
      }
    });
    periodEls.forEach(el => {
      el.textContent = isYearly ? '/yr' : '/mo';
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      updatePrices();
    });
  });

  if (billingSwitch) {
    billingSwitch.addEventListener('change', () => {
      isYearly = billingSwitch.checked;
      updatePrices();
    });
  }

  // ===== Custom Plan Builder =====
  const coverageSlider = document.getElementById('coverage-slider');
  const ageSlider = document.getElementById('age-slider');
  const coverageVal = document.getElementById('coverage-val');
  const ageVal = document.getElementById('age-val');
  const summaryPrice = document.getElementById('summary-price');
  const addonBtns = document.querySelectorAll('.addon-btn');
  let selectedAddon = 'none';

  function calculatePremium() {
    if (!coverageSlider || !ageSlider) return;
    const coverage = parseInt(coverageSlider.value);
    const age = parseInt(ageSlider.value);
    let base = coverage * 100;
    if (age > 45) base *= 1.4;
    else if (age > 30) base *= 1.2;
    if (selectedAddon === 'dental') base += 200;
    else if (selectedAddon === 'maternity') base += 500;
    const monthly = Math.round(base);
    if (summaryPrice) summaryPrice.textContent = monthly.toLocaleString('en-IN');
  }

  if (coverageSlider) {
    coverageSlider.addEventListener('input', () => {
      coverageVal.textContent = coverageSlider.value;
      calculatePremium();
    });
  }
  if (ageSlider) {
    ageSlider.addEventListener('input', () => {
      ageVal.textContent = ageSlider.value;
      calculatePremium();
    });
  }

  addonBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      addonBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedAddon = btn.dataset.addon;
      calculatePremium();
    });
  });

  if (coverageSlider && ageSlider) calculatePremium();

  // ===== Claims Page: Timeline Animation =====
  const timelineTrack = document.querySelector('.timeline-track');
  if (timelineTrack) {
    const timelineObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            timelineTrack.classList.add('active');
            timelineObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    const timelineTarget = timelineTrack.closest('.process-timeline') || timelineTrack.closest('.claim-process');
    if (timelineTarget) timelineObserver.observe(timelineTarget);
  }

  // ===== Claims Page: File Upload =====
  const uploadZone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('fileInput');
  const uploadPreview = document.getElementById('uploadPreview');
  const formProgress = document.getElementById('formProgress');
  const submitClaim = document.getElementById('submitClaim');

  if (uploadZone && fileInput) {
    uploadZone.addEventListener('click', () => fileInput.click());
    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.classList.add('dragover');
    });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
      handleFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', () => handleFiles(fileInput.files));

    function handleFiles(files) {
      if (!uploadPreview) return;
      Array.from(files).forEach((file) => {
        const el = document.createElement('div');
        el.className = 'preview-file';
        el.innerHTML = '<i class="fa-solid fa-file"></i> ' + file.name + ' <span class="remove-file"><i class="fa-solid fa-xmark"></i></span>';
        el.querySelector('.remove-file').addEventListener('click', () => el.remove());
        uploadPreview.appendChild(el);
      });
      updateFormProgress();
    }

    function updateFormProgress() {
      if (!formProgress) return;
      const policy = document.getElementById('policy-number');
      const type = document.getElementById('claim-type');
      let filled = 0;
      let total = 3;
      if (policy && policy.value.trim()) filled++;
      if (type && type.value) filled++;
      if (uploadPreview && uploadPreview.children.length > 0) filled++;
      const pct = Math.round((filled / total) * 100);
      const bar = formProgress.querySelector('.progress-bar span');
      const text = formProgress.querySelector('.progress-text');
      if (bar) bar.style.width = pct + '%';
      if (text) text.textContent = pct + '% complete';
    }

    const policyInput = document.getElementById('policy-number');
    const claimType = document.getElementById('claim-type');
    if (policyInput) policyInput.addEventListener('input', updateFormProgress);
    if (claimType) claimType.addEventListener('change', updateFormProgress);
  }

  if (submitClaim) {
    submitClaim.addEventListener('click', () => {
      const policy = document.getElementById('policy-number');
      const type = document.getElementById('claim-type');
      if (!policy || !policy.value.trim()) {
        policy.focus();
        policy.closest('.input-wrap').style.borderColor = '#EF4444';
        setTimeout(() => { policy.closest('.input-wrap').style.borderColor = ''; }, 2000);
        return;
      }
      if (!type || !type.value) {
        type.focus();
        type.closest('.input-wrap').style.borderColor = '#EF4444';
        setTimeout(() => { type.closest('.input-wrap').style.borderColor = ''; }, 2000);
        return;
      }
      submitClaim.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
      submitClaim.disabled = true;
      setTimeout(() => {
        submitClaim.innerHTML = '<i class="fa-solid fa-circle-check"></i> Claim Submitted!';
        submitClaim.style.background = 'linear-gradient(135deg, var(--accent), #10B981)';
        if (formProgress) {
          const bar = formProgress.querySelector('.progress-bar span');
          const text = formProgress.querySelector('.progress-text');
          if (bar) bar.style.width = '100%';
          if (text) text.textContent = '100% complete';
        }
      }, 1800);
    });
  }

  // ===== Claims Page: Status Tracker =====
  const trackClaimBtn = document.getElementById('trackClaimBtn');
  const trackerResult = document.getElementById('trackerResult');
  const claimSearchInput = document.getElementById('claimSearchInput');

  if (trackClaimBtn && trackerResult) {
    trackClaimBtn.addEventListener('click', () => {
      if (!claimSearchInput || !claimSearchInput.value.trim()) {
        claimSearchInput.focus();
        claimSearchInput.closest('.input-wrap').style.borderColor = '#EF4444';
        setTimeout(() => { claimSearchInput.closest('.input-wrap').style.borderColor = ''; }, 2000);
        return;
      }
      trackClaimBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
      trackClaimBtn.disabled = true;
      setTimeout(() => {
        trackClaimBtn.innerHTML = '<i class="fa-solid fa-arrow-right"></i> Track';
        trackClaimBtn.disabled = false;
        trackerResult.classList.add('visible');

        const stages = trackerResult.querySelectorAll('.stage');
        const connectors = trackerResult.querySelectorAll('.stage-connector');

        // Reset
        stages.forEach(s => { s.classList.remove('active', 'current'); });
        connectors.forEach(c => c.classList.remove('active'));

        // Animate through stages
        let delay = 0;
        [0, 1, 2, 3].forEach((i) => {
          setTimeout(() => {
            if (stages[i]) stages[i].classList.add('active');
            if (i < connectors.length) connectors[i].classList.add('active');
          }, delay);
          delay += 400;
        });

        // Mark stage 3 as current (in progress)
        setTimeout(() => {
          stages.forEach(s => s.classList.remove('current'));
          if (stages[2]) stages[2].classList.add('current');
        }, delay);
      }, 1200);
    });
  }

  // ===== Claims Page: Stories Slider =====
  const storiesTrack = document.getElementById('storiesTrack');
  const storiesDots = document.getElementById('storiesDots');
  const storiesPrev = document.querySelector('.stories-slider .slider-arrow.prev');
  const storiesNext = document.querySelector('.stories-slider .slider-arrow.next');
  let storiesIndex = 0;
  let storiesVisible = 1;
  let storiesAutoTimer = null;
  let storiesSlideWidth = 0;

  function getStoriesVisible() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  }

  function buildStoriesDots() {
    if (!storiesDots || !storiesTrack) return;
    storiesDots.innerHTML = '';
    const total = storiesTrack.children.length;
    const max = Math.max(0, total - storiesVisible);
    for (let i = 0; i <= max; i++) {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', 'Go to story ' + (i + 1));
      dot.addEventListener('click', () => storiesGoTo(i));
      storiesDots.appendChild(dot);
    }
    updateStoriesDots();
  }

  function updateStoriesSlider() {
    if (!storiesTrack) return;
    const first = storiesTrack.children[0];
    storiesSlideWidth = first ? first.getBoundingClientRect().width : storiesTrack.clientWidth / storiesVisible;
    const max = Math.max(0, storiesTrack.children.length - storiesVisible);
    storiesIndex = Math.min(storiesIndex, max);
    storiesTrack.style.transform = 'translateX(' + (-storiesIndex * storiesSlideWidth) + 'px)';
    updateStoriesDots();
  }

  function updateStoriesDots() {
    if (!storiesDots) return;
    storiesDots.querySelectorAll('button').forEach((d, i) => d.classList.toggle('active', i === storiesIndex));
  }

  function storiesGoTo(i) {
    const max = Math.max(0, storiesTrack.children.length - storiesVisible);
    storiesIndex = Math.max(0, Math.min(i, max));
    storiesTrack.style.transform = 'translateX(' + (-storiesIndex * storiesSlideWidth) + 'px)';
    updateStoriesDots();
    resetStoriesAuto();
  }

  function storiesNextSlide() {
    const max = Math.max(0, storiesTrack.children.length - storiesVisible);
    storiesGoTo(storiesIndex >= max ? 0 : storiesIndex + 1);
  }

  function startStoriesAuto() {
    if (prefersReducedMotion) return;
    stopStoriesAuto();
    storiesAutoTimer = setInterval(storiesNextSlide, 5000);
  }

  function stopStoriesAuto() {
    if (storiesAutoTimer) clearInterval(storiesAutoTimer);
  }

  function resetStoriesAuto() {
    stopStoriesAuto();
    startStoriesAuto();
  }

  if (storiesTrack) {
    storiesVisible = getStoriesVisible();
    buildStoriesDots();
    updateStoriesSlider();
    startStoriesAuto();
    if (storiesPrev) storiesPrev.addEventListener('click', () => storiesGoTo(storiesIndex <= 0 ? Math.max(0, storiesTrack.children.length - storiesVisible) : storiesIndex - 1));
    if (storiesNext) storiesNext.addEventListener('click', storiesNextSlide);

    const storiesSlider = document.querySelector('.stories-slider');
    if (storiesSlider) {
      storiesSlider.addEventListener('mouseenter', stopStoriesAuto);
      storiesSlider.addEventListener('mouseleave', startStoriesAuto);
    }

    window.addEventListener('resize', () => {
      const nc = getStoriesVisible();
      if (nc !== storiesVisible) {
        storiesVisible = nc;
        buildStoriesDots();
      }
      updateStoriesSlider();
    });
  }

  // ===== Claims Page: Scroll Spy =====
  const claimsSections = ['claims-hero', 'claim-process', 'file-claim', 'claim-status', 'cashless-support', 'smart-claims', 'claim-stories', 'footer'];
  function updateClaimsNav() {
    if (!header) return;
    const scrollPos = window.scrollY + header.offsetHeight + 80;
    let activeId = 'claims-hero';
    claimsSections.forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= scrollPos) activeId = id;
    });
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === 'claims.html' || href === '#claims-hero') {
        link.classList.toggle('active', true);
      } else {
        link.classList.remove('active');
      }
    });
  }
  if (document.querySelector('.claims-hero')) {
    window.addEventListener('scroll', updateClaimsNav, { passive: true });
  }

  // ===== Network Page: Hospital Data =====
  const hospitals = [
    { name: 'Apollo Hospital', city: 'Chennai, Tamil Nadu', rating: 4.8, specialties: ['Cardiology', 'Orthopedics', '24/7 ER'], cashless: true, topRated: true, is247: true, img: 'assets/images/network-featured-1.webp' },
    { name: 'Max Super Speciality', city: 'New Delhi, India', rating: 4.7, specialties: ['Neurology', 'Oncology', 'ICU'], cashless: true, topRated: true, is247: true, img: 'assets/images/network-featured-2.webp' },
    { name: 'Fortis Healthcare', city: 'Mumbai, Maharashtra', rating: 4.6, specialties: ['Maternity', 'General Surgery', '24/7 ER'], cashless: true, topRated: false, is247: true, img: 'assets/images/network-featured-3.webp' },
    { name: 'Manipal Hospital', city: 'Bengaluru, Karnataka', rating: 4.9, specialties: ['Cardiology', 'Transplants', '24/7 ER'], cashless: true, topRated: true, is247: true, img: 'assets/images/network-featured-4.webp' },
    { name: 'Narayana Health', city: 'Bengaluru, Karnataka', rating: 4.8, specialties: ['Cardiac Surgery', 'Neurology', '24/7 ER'], cashless: true, topRated: true, is247: true, img: 'assets/images/network-featured-1.webp' },
    { name: 'Medanta Hospital', city: 'Gurugram, Haryana', rating: 4.5, specialties: ['Oncology', 'Orthopedics', 'ICU'], cashless: true, topRated: false, is247: false, img: 'assets/images/network-featured-2.webp' },
    { name: 'Kokilaben Hospital', city: 'Mumbai, Maharashtra', rating: 4.7, specialties: ['Neurology', 'Cardiology', '24/7 ER'], cashless: true, topRated: true, is247: true, img: 'assets/images/network-featured-3.webp' },
    { name: 'Sir Ganga Ram Hospital', city: 'New Delhi, India', rating: 4.6, specialties: ['General Surgery', 'Maternity', 'ICU'], cashless: true, topRated: false, is247: true, img: 'assets/images/network-featured-4.webp' }
  ];

  // ===== Network Page: Hospital List =====
  const hospitalList = document.getElementById('netHospitalList');
  const mapArea = document.getElementById('netMapArea');
  const mapTooltip = document.getElementById('netMapTooltip');
  let activeHospital = -1;

  function renderHospitalList(filtered) {
    if (!hospitalList) return;
    hospitalList.innerHTML = '';
    filtered.forEach((h, i) => {
      const card = document.createElement('div');
      card.className = 'net-hospital-card' + (i === activeHospital ? ' active' : '');
      card.setAttribute('data-index', i);
      card.innerHTML =
        '<div class="net-hospital-thumb"><img src="' + h.img + '" alt="' + h.name + '" width="80" height="80" /></div>' +
        '<div class="net-hospital-info">' +
          '<h3>' + h.name + '</h3>' +
          '<div class="net-hospital-city"><i class="fa-solid fa-location-dot"></i> ' + h.city + '</div>' +
          '<div class="net-hospital-meta">' +
            '<span class="net-hospital-rating"><i class="fa-solid fa-star"></i> ' + h.rating + '</span>' +
            (h.cashless ? '<span class="net-hospital-badge"><i class="fa-solid fa-check"></i> Cashless</span>' : '') +
          '</div>' +
        '</div>';
      card.addEventListener('click', () => highlightHospital(i));
      hospitalList.appendChild(card);
    });
  }

  function highlightHospital(index) {
    activeHospital = index;
    // Update list
    document.querySelectorAll('.net-hospital-card').forEach((c, i) => {
      c.classList.toggle('active', i === index);
    });
    // Update map dots
    document.querySelectorAll('.net-map-dot').forEach((d, i) => {
      d.classList.toggle('active', i === index);
    });
    // Show tooltip
    const h = hospitals[index];
    if (mapTooltip && h) {
      mapTooltip.innerHTML = '<h4>' + h.name + '</h4><p>' + h.city + '</p><span class="net-hospital-rating" style="color:#F59E0B"><i class="fa-solid fa-star"></i> ' + h.rating + '</span>';
      mapTooltip.classList.add('visible');
      setTimeout(() => { mapTooltip.classList.remove('visible'); }, 3000);
    }
    // Scroll list item into view
    const card = hospitalList.querySelector('[data-index="' + index + '"]');
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  if (hospitalList) renderHospitalList(hospitals);

  // Map dots click
  document.querySelectorAll('.net-map-dot').forEach((dot) => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.hospital);
      if (!isNaN(idx)) highlightHospital(idx);
    });
  });

  // ===== Network Page: Filters =====
  const filterPills = document.querySelectorAll('.net-filter-pill');
  const specialtyFilter = document.getElementById('netSpecialtyFilter');
  const ratingFilter = document.getElementById('netRatingFilter');
  const searchTags = document.getElementById('netSearchTags');
  let activeFilter = 'all';

  function filterHospitals() {
    let filtered = [...hospitals];
    if (activeFilter === 'cashless') filtered = filtered.filter(h => h.cashless);
    else if (activeFilter === 'top-rated') filtered = filtered.filter(h => h.topRated);
    else     if (activeFilter === '24-7') filtered = filtered.filter(h => h.is247);
    if (specialtyFilter && specialtyFilter.value) {
      filtered = filtered.filter(h => h.specialties.some(s => s.toLowerCase().includes(specialtyFilter.value.toLowerCase())));
    }
    if (ratingFilter && ratingFilter.value) {
      const min = parseFloat(ratingFilter.value);
      filtered = filtered.filter(h => h.rating >= min);
    }
    activeHospital = -1;
    renderHospitalList(filtered);
    updateSearchTags();
  }

  function updateSearchTags() {
    if (!searchTags) return;
    searchTags.innerHTML = '';
    const tags = [];
    if (activeFilter !== 'all') tags.push(activeFilter.replace('-', ' '));
    if (specialtyFilter && specialtyFilter.value) tags.push(specialtyFilter.value);
    if (ratingFilter && ratingFilter.value) tags.push(ratingFilter.value + '+ Stars');
    tags.forEach(t => {
      const el = document.createElement('span');
      el.className = 'net-search-tag';
      el.innerHTML = t + ' <span class="remove-tag"><i class="fa-solid fa-xmark"></i></span>';
      el.querySelector('.remove-tag').addEventListener('click', () => {
        if (tags.includes(activeFilter.replace('-', ' '))) { activeFilter = 'all'; filterPills.forEach(p => p.classList.toggle('active', p.dataset.filter === 'all')); }
        if (specialtyFilter && specialtyFilter.value === t) specialtyFilter.value = '';
        if (ratingFilter && ratingFilter.value + '+ Stars' === t) ratingFilter.value = '';
        filterHospitals();
      });
      searchTags.appendChild(el);
    });
  }

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeFilter = pill.dataset.filter;
      filterHospitals();
    });
  });
  if (specialtyFilter) specialtyFilter.addEventListener('change', filterHospitals);
  if (ratingFilter) ratingFilter.addEventListener('change', filterHospitals);

  // Search button
  const netSearchBtn = document.getElementById('netSearchBtn');
  if (netSearchBtn) {
    netSearchBtn.addEventListener('click', () => {
      const nameInput = document.getElementById('netNameInput');
      const locInput = document.getElementById('netLocationInput');
      let filtered = [...hospitals];
      if (nameInput && nameInput.value.trim()) {
        const q = nameInput.value.trim().toLowerCase();
        filtered = filtered.filter(h => h.name.toLowerCase().includes(q));
      }
      if (locInput && locInput.value.trim()) {
        const q = locInput.value.trim().toLowerCase();
        filtered = filtered.filter(h => h.city.toLowerCase().includes(q));
      }
      activeHospital = -1;
      renderHospitalList(filtered);
    });
  }

  // ===== Network Page: Specialty Scroll =====
  const specScroll = document.getElementById('netSpecScroll');
  const specPrev = document.getElementById('netSpecPrev');
  const specNext = document.getElementById('netSpecNext');
  if (specScroll && specPrev && specNext) {
    specPrev.addEventListener('click', () => { specScroll.scrollBy({ left: -280, behavior: 'smooth' }); });
    specNext.addEventListener('click', () => { specScroll.scrollBy({ left: 280, behavior: 'smooth' }); });
  }

  // ===== Network Page: Stats Count-Up =====
  const statNumbers = document.querySelectorAll('.net-stat-number');
  if (statNumbers.length) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target);
          let current = 0;
          const duration = 2000;
          const step = target / (duration / 16);
          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            el.textContent = Math.floor(current).toLocaleString('en-IN');
          }, 16);
          statsObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    statNumbers.forEach(el => statsObserver.observe(el));
  }

  // ===== Network Page: Reviews Slider =====
  const reviewsTrack = document.getElementById('netReviewsTrack');
  const reviewsDots = document.getElementById('netReviewsDots');
  const reviewsPrev = document.querySelector('.net-reviews .slider-arrow.prev');
  const reviewsNext = document.querySelector('.net-reviews .slider-arrow.next');
  let reviewsIndex = 0;
  let reviewsVisible = 1;
  let reviewsAutoTimer = null;
  let reviewsSlideWidth = 0;

  function getReviewsVisible() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  }

  function buildReviewsDots() {
    if (!reviewsDots || !reviewsTrack) return;
    reviewsDots.innerHTML = '';
    const total = reviewsTrack.children.length;
    const max = Math.max(0, total - reviewsVisible);
    for (let i = 0; i <= max; i++) {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', 'Go to review ' + (i + 1));
      dot.addEventListener('click', () => reviewsGoTo(i));
      reviewsDots.appendChild(dot);
    }
    updateReviewsDots();
  }

  function updateReviewsSlider() {
    if (!reviewsTrack) return;
    const first = reviewsTrack.children[0];
    reviewsSlideWidth = first ? first.getBoundingClientRect().width : reviewsTrack.clientWidth / reviewsVisible;
    const max = Math.max(0, reviewsTrack.children.length - reviewsVisible);
    reviewsIndex = Math.min(reviewsIndex, max);
    reviewsTrack.style.transform = 'translateX(' + (-reviewsIndex * reviewsSlideWidth) + 'px)';
    updateReviewsDots();
  }

  function updateReviewsDots() {
    if (!reviewsDots) return;
    reviewsDots.querySelectorAll('button').forEach((d, i) => d.classList.toggle('active', i === reviewsIndex));
  }

  function reviewsGoTo(i) {
    const max = Math.max(0, reviewsTrack.children.length - reviewsVisible);
    reviewsIndex = Math.max(0, Math.min(i, max));
    reviewsTrack.style.transform = 'translateX(' + (-reviewsIndex * reviewsSlideWidth) + 'px)';
    updateReviewsDots();
    resetReviewsAuto();
  }

  function reviewsNextSlide() {
    const max = Math.max(0, reviewsTrack.children.length - reviewsVisible);
    reviewsGoTo(reviewsIndex >= max ? 0 : reviewsIndex + 1);
  }

  function startReviewsAuto() {
    if (prefersReducedMotion) return;
    stopReviewsAuto();
    reviewsAutoTimer = setInterval(reviewsNextSlide, 5000);
  }

  function stopReviewsAuto() {
    if (reviewsAutoTimer) clearInterval(reviewsAutoTimer);
  }

  function resetReviewsAuto() {
    stopReviewsAuto();
    startReviewsAuto();
  }

  if (reviewsTrack) {
    reviewsVisible = getReviewsVisible();
    buildReviewsDots();
    updateReviewsSlider();
    startReviewsAuto();
    if (reviewsPrev) reviewsPrev.addEventListener('click', () => reviewsGoTo(reviewsIndex <= 0 ? Math.max(0, reviewsTrack.children.length - reviewsVisible) : reviewsIndex - 1));
    if (reviewsNext) reviewsNext.addEventListener('click', reviewsNextSlide);

    const reviewsSlider = document.querySelector('.net-reviews .slider');
    if (reviewsSlider) {
      reviewsSlider.addEventListener('mouseenter', stopReviewsAuto);
      reviewsSlider.addEventListener('mouseleave', startReviewsAuto);
    }

    window.addEventListener('resize', () => {
      const nc = getReviewsVisible();
      if (nc !== reviewsVisible) { reviewsVisible = nc; buildReviewsDots(); }
      updateReviewsSlider();
    });
  }

  // ===== Network Page: View Toggle =====
  const viewBtns = document.querySelectorAll('.net-view-btn');
  const splitEl = document.querySelector('.net-split');
  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const view = btn.dataset.view;
      if (splitEl) {
        if (view === 'map') {
          splitEl.style.gridTemplateColumns = '1fr';
          hospitalList.style.display = 'none';
          mapArea.style.minHeight = '500px';
        } else {
          splitEl.style.gridTemplateColumns = '';
          hospitalList.style.display = '';
          mapArea.style.minHeight = '';
        }
      }
    });
  });

  // ===== Network Page: Scroll Spy =====
  const netSections = ['net-hero', 'net-search', 'net-map', 'net-featured', 'net-stats', 'net-specialties', 'net-reviews', 'net-mobile', 'net-cta'];
  function updateNetNav() {
    if (!header) return;
    const scrollPos = window.scrollY + header.offsetHeight + 80;
    let activeId = 'net-hero';
    netSections.forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= scrollPos) activeId = id;
    });
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === 'network.html' || href === '#net-hero') {
        link.classList.toggle('active', true);
      } else {
        link.classList.remove('active');
      }
    });
  }
  if (document.querySelector('.net-hero')) {
    window.addEventListener('scroll', updateNetNav, { passive: true });
  }

  // ===== Contact Page: Form Validation =====
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const phoneInput = document.getElementById('contact-phone');
    const subjectInput = document.getElementById('contact-subject');
    const messageInput = document.getElementById('contact-message');
    const submitBtn = document.getElementById('submitBtn');
    const formSuccess = document.getElementById('formSuccess');

    function showError(input, errorId, message) {
      const group = input.closest('.form-group');
      const errorEl = document.getElementById(errorId);
      group.classList.add('error');
      group.classList.remove('valid');
      if (errorEl) errorEl.textContent = message;
    }

    function clearError(input, errorId) {
      const group = input.closest('.form-group');
      const errorEl = document.getElementById(errorId);
      group.classList.remove('error');
      if (errorEl) errorEl.textContent = '';
    }

    function markValid(input) {
      const group = input.closest('.form-group');
      group.classList.remove('error');
      group.classList.add('valid');
    }

    function validateName() {
      const val = nameInput.value.trim();
      if (!val) { showError(nameInput, 'name-error', 'Please enter your name'); return false; }
      if (!/^[A-Za-z\s]+$/.test(val)) { showError(nameInput, 'name-error', 'Name should only contain letters'); return false; }
      clearError(nameInput, 'name-error');
      markValid(nameInput);
      return true;
    }

    function validateEmail() {
      const val = emailInput.value.trim();
      if (!val) { showError(emailInput, 'email-error', 'Please enter your email'); return false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) { showError(emailInput, 'email-error', 'Please enter a valid email address'); return false; }
      clearError(emailInput, 'email-error');
      markValid(emailInput);
      return true;
    }

    function validatePhone() {
      const val = phoneInput.value.trim();
      if (!val) { showError(phoneInput, 'phone-error', 'Please enter your phone number'); return false; }
      if (!/^\d{10,15}$/.test(val)) { showError(phoneInput, 'phone-error', 'Phone number should only contain numbers'); return false; }
      clearError(phoneInput, 'phone-error');
      markValid(phoneInput);
      return true;
    }

    function validateSubject() {
      if (!subjectInput.value) { showError(subjectInput, 'subject-error', 'Please select a subject'); return false; }
      clearError(subjectInput, 'subject-error');
      markValid(subjectInput);
      return true;
    }

    function validateMessage() {
      const val = messageInput.value.trim();
      if (!val) { showError(messageInput, 'message-error', 'Please enter your message'); return false; }
      if (val.length < 10) { showError(messageInput, 'message-error', 'Message must be at least 10 characters'); return false; }
      clearError(messageInput, 'message-error');
      markValid(messageInput);
      return true;
    }

    nameInput.addEventListener('blur', validateName);
    emailInput.addEventListener('blur', validateEmail);
    phoneInput.addEventListener('blur', validatePhone);
    subjectInput.addEventListener('change', validateSubject);
    messageInput.addEventListener('blur', validateMessage);

    // Live validation on input
    nameInput.addEventListener('input', () => {
      nameInput.value = nameInput.value.replace(/[^A-Za-z\s]/g, '');
      if (nameInput.closest('.form-group').classList.contains('error')) validateName();
    });
    emailInput.addEventListener('input', () => { if (emailInput.closest('.form-group').classList.contains('error')) validateEmail(); });
    phoneInput.addEventListener('input', () => {
      phoneInput.value = phoneInput.value.replace(/[^0-9]/g, '');
      if (phoneInput.closest('.form-group').classList.contains('error')) validatePhone();
    });
    messageInput.addEventListener('input', () => { if (messageInput.closest('.form-group').classList.contains('error')) validateMessage(); });

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const isValid = validateName() & validateEmail() & validatePhone() & validateSubject() & validateMessage();
      if (!isValid) return;

      // Show loading state
      const btnText = submitBtn.querySelector('.btn-text');
      const btnLoading = submitBtn.querySelector('.btn-loading');
      btnText.style.display = 'none';
      btnLoading.style.display = 'inline-flex';
      submitBtn.disabled = true;

      // Simulate form submission
      setTimeout(() => {
        btnText.style.display = '';
        btnLoading.style.display = 'none';
        submitBtn.disabled = false;
        formSuccess.classList.add('show');
        contactForm.reset();
        // Clear valid states
        contactForm.querySelectorAll('.form-group').forEach(g => g.classList.remove('valid'));
        // Auto-hide success after 3 seconds
        setTimeout(() => { formSuccess.classList.remove('show'); }, 3000);
      }, 1500);
    });
  }

  // ===== Contact Page: Live Chat Button =====
  const liveChatBtn = document.getElementById('liveChatBtn');
  if (liveChatBtn) {
    liveChatBtn.addEventListener('click', () => {
      liveChatBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Connecting...';
      liveChatBtn.disabled = true;
      setTimeout(() => {
        liveChatBtn.innerHTML = '<i class="fa-solid fa-check"></i> Chat Open!';
        liveChatBtn.style.background = 'var(--accent)';
        setTimeout(() => {
          liveChatBtn.innerHTML = '<i class="fa-solid fa-comments"></i> Start Live Chat';
          liveChatBtn.style.background = '';
          liveChatBtn.disabled = false;
        }, 2000);
      }, 1500);
    });
  }

  // ===== Contact Page: Scroll Spy =====
  const contactSections = ['contact-hero', 'contact-channels', 'contact-form-section', 'contact-map', 'contact-cta'];
  function updateContactNav() {
    if (!header) return;
    const scrollPos = window.scrollY + header.offsetHeight + 80;
    let activeId = 'contact-hero';
    contactSections.forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= scrollPos) activeId = id;
    });
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === 'contact.html') {
        link.classList.toggle('active', true);
      } else if (!href.startsWith('#') || !contactSections.includes(href.substring(1))) {
        link.classList.remove('active');
      }
    });
  }
  if (document.querySelector('.contact-hero')) {
    window.addEventListener('scroll', updateContactNav, { passive: true });
  }

  // ===== Auth Pages: Role Selector =====
  document.querySelectorAll('.auth-role-selector').forEach(function (selector) {
    var buttons = selector.querySelectorAll('.auth-role-btn');
    var container = selector.closest('.auth-card') || selector.closest('form');
    var hiddenInput = container ? container.querySelector('input[name="role"]') : null;

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        selector.setAttribute('data-active', btn.getAttribute('data-role'));
        if (hiddenInput) hiddenInput.value = btn.getAttribute('data-role');
      });
    });
  });

  // ===== Auth Pages: Password Toggle =====
  document.querySelectorAll('.password-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetId = this.getAttribute('data-target');
      var input = document.getElementById(targetId);
      if (!input) return;
      var icon = this.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
      }
    });
  });

  // ===== Auth Pages: Validation Helpers =====
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function setFieldError(form, field, message) {
    var group = form.querySelector('[data-validate="' + field + '"]');
    if (!group) return;
    group.classList.remove('valid');
    group.classList.add('error');
    var errEl = group.querySelector('.form-error');
    if (errEl) errEl.textContent = message;
  }

  function setFieldValid(form, field) {
    var group = form.querySelector('[data-validate="' + field + '"]');
    if (!group) return;
    group.classList.remove('error');
    group.classList.add('valid');
    var errEl = group.querySelector('.form-error');
    if (errEl) errEl.textContent = '';
  }

  function clearFieldState(form, field) {
    var group = form.querySelector('[data-validate="' + field + '"]');
    if (!group) return;
    group.classList.remove('error', 'valid');
    var errEl = group.querySelector('.form-error');
    if (errEl) errEl.textContent = '';
  }

  // ===== Auth Pages: Login Form =====
  var loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = document.getElementById('loginEmail');
      var password = document.getElementById('loginPassword');
      var valid = true;

      if (!email.value.trim() || !validateEmail(email.value.trim())) {
        setFieldError(loginForm, 'email', 'Please enter a valid email address');
        valid = false;
      } else {
        setFieldValid(loginForm, 'email');
      }

      if (!password.value || password.value.length < 6) {
        setFieldError(loginForm, 'password', 'Password must be at least 6 characters');
        valid = false;
      } else {
        setFieldValid(loginForm, 'password');
      }

      if (valid) {
        var submitBtn = loginForm.querySelector('.auth-submit');
        var role = document.getElementById('loginRole') ? document.getElementById('loginRole').value : 'member';
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in...';
        submitBtn.disabled = true;
        setTimeout(function () {
          var userData = { name: email.value.split('@')[0].replace(/\./g,' ').replace(/\b\w/g,function(c){return c.toUpperCase();}), email: email.value.trim(), role: role };
          localStorage.setItem('stacklyUser', JSON.stringify(userData));
          loginForm.style.display = 'none';
          var successEl = document.getElementById('loginSuccess');
          if (successEl) successEl.classList.add('show');
          var redirectUrl = role === 'provider' ? 'dashboard-provider.html' : 'dashboard-member.html';
          setTimeout(function () { window.location.href = redirectUrl; }, 1200);
          submitBtn.innerHTML = '<span class="auth-submit-text">Login</span><i class="fa-solid fa-arrow-right auth-submit-icon"></i>';
          submitBtn.disabled = false;
        }, 1500);
      }
    });

    // Live validation on blur
    var loginEmail = document.getElementById('loginEmail');
    var loginPassword = document.getElementById('loginPassword');
    loginEmail.addEventListener('blur', function () {
      if (this.value.trim() && !validateEmail(this.value.trim())) {
        setFieldError(loginForm, 'email', 'Please enter a valid email address');
      } else if (this.value.trim()) {
        setFieldValid(loginForm, 'email');
      }
    });
    loginEmail.addEventListener('input', function () {
      if (this.closest('.form-group').classList.contains('error') && validateEmail(this.value.trim())) {
        setFieldValid(loginForm, 'email');
      }
    });
    loginPassword.addEventListener('blur', function () {
      if (this.value && this.value.length < 6) {
        setFieldError(loginForm, 'password', 'Password must be at least 6 characters');
      } else if (this.value) {
        setFieldValid(loginForm, 'password');
      }
    });
    loginPassword.addEventListener('input', function () {
      if (this.closest('.form-group').classList.contains('error') && this.value.length >= 6) {
        setFieldValid(loginForm, 'password');
      }
    });
  }

  // ===== Auth Pages: Signup Form =====
  var signupForm = document.getElementById('signupForm');
  if (signupForm) {
    var signupPassword = document.getElementById('signupPassword');
    var signupConfirm = document.getElementById('signupConfirm');
    var strengthEl = document.getElementById('passwordStrength');

    function checkPasswordStrength(pw) {
      var score = 0;
      if (pw.length >= 8) score++;
      if (/[A-Z]/.test(pw)) score++;
      if (/[a-z]/.test(pw)) score++;
      if (/[0-9]/.test(pw)) score++;
      if (/[^A-Za-z0-9]/.test(pw)) score++;
      return score;
    }

    function updateStrengthUI(pw) {
      if (!strengthEl) return;
      if (!pw) {
        strengthEl.className = 'password-strength';
        strengthEl.querySelector('.password-strength-text').textContent = '';
        return;
      }
      var score = checkPasswordStrength(pw);
      var level, text;
      if (score <= 2) { level = 'weak'; text = 'Weak'; }
      else if (score <= 3) { level = 'medium'; text = 'Medium'; }
      else { level = 'strong'; text = 'Strong'; }
      strengthEl.className = 'password-strength active ' + level;
      strengthEl.querySelector('.password-strength-text').textContent = text;
    }

    if (signupPassword) {
      signupPassword.addEventListener('input', function () {
        updateStrengthUI(this.value);
        if (signupConfirm.value) {
          if (this.value !== signupConfirm.value) {
            setFieldError(signupForm, 'confirm-password', 'Passwords do not match');
          } else {
            setFieldValid(signupForm, 'confirm-password');
          }
        }
      });
    }

    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('signupName');
      var email = document.getElementById('signupEmail');
      var phone = document.getElementById('signupPhone');
      var password = document.getElementById('signupPassword');
      var confirm = document.getElementById('signupConfirm');
      var valid = true;

      // Name validation
      var nameVal = name.value.trim();
      if (!nameVal || nameVal.length < 3 || !/^[A-Za-z\s]+$/.test(nameVal)) {
        setFieldError(signupForm, 'name', 'Name must be at least 3 letters (letters and spaces only)');
        valid = false;
      } else {
        setFieldValid(signupForm, 'name');
      }

      // Email validation
      if (!email.value.trim() || !validateEmail(email.value.trim())) {
        setFieldError(signupForm, 'signup-email', 'Please enter a valid email address');
        valid = false;
      } else {
        setFieldValid(signupForm, 'signup-email');
      }

      // Phone validation
      var phoneVal = phone.value.trim();
      if (!phoneVal || !/^\d{10}$/.test(phoneVal)) {
        setFieldError(signupForm, 'phone', 'Phone must be exactly 10 digits');
        valid = false;
      } else {
        setFieldValid(signupForm, 'phone');
      }

      // Password validation
      var pwVal = password.value;
      if (!pwVal || pwVal.length < 8 || !/[A-Z]/.test(pwVal) || !/[a-z]/.test(pwVal) || !/[0-9]/.test(pwVal) || !/[^A-Za-z0-9]/.test(pwVal)) {
        setFieldError(signupForm, 'signup-password', 'Min 8 chars with uppercase, lowercase, number & special character');
        valid = false;
      } else {
        setFieldValid(signupForm, 'signup-password');
      }

      // Confirm password
      if (!confirm.value || confirm.value !== password.value) {
        setFieldError(signupForm, 'confirm-password', 'Passwords do not match');
        valid = false;
      } else {
        setFieldValid(signupForm, 'confirm-password');
      }

      if (valid) {
        var submitBtn = signupForm.querySelector('.auth-submit');
        var role = document.getElementById('signupRole') ? document.getElementById('signupRole').value : 'member';
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating account...';
        submitBtn.disabled = true;
        setTimeout(function () {
          var userData = { name: name.value.trim(), email: email.value.trim(), phone: phone.value.trim(), role: role };
          localStorage.setItem('stacklyUser', JSON.stringify(userData));
          signupForm.style.display = 'none';
          var successEl = document.getElementById('signupSuccess');
          if (successEl) successEl.classList.add('show');
          var redirectUrl = role === 'provider' ? 'dashboard-provider.html' : 'dashboard-member.html';
          setTimeout(function () { window.location.href = redirectUrl; }, 1200);
          submitBtn.innerHTML = '<span class="auth-submit-text">Create Account</span><i class="fa-solid fa-arrow-right auth-submit-icon"></i>';
          submitBtn.disabled = false;
        }, 1500);
      }
    });

    // Live validation on blur for signup
    var signupName = document.getElementById('signupName');
    var signupEmail = document.getElementById('signupEmail');
    var signupPhone = document.getElementById('signupPhone');

    signupName.addEventListener('blur', function () {
      var v = this.value.trim();
      if (v && (v.length < 3 || !/^[A-Za-z\s]+$/.test(v))) {
        setFieldError(signupForm, 'name', 'Name must be at least 3 letters (letters and spaces only)');
      } else if (v) {
        setFieldValid(signupForm, 'name');
      }
    });
    signupName.addEventListener('input', function () {
      if (this.closest('.form-group').classList.contains('error')) {
        var v = this.value.trim();
        if (v.length >= 3 && /^[A-Za-z\s]+$/.test(v)) setFieldValid(signupForm, 'name');
      }
    });

    signupEmail.addEventListener('blur', function () {
      if (this.value.trim() && !validateEmail(this.value.trim())) {
        setFieldError(signupForm, 'signup-email', 'Please enter a valid email address');
      } else if (this.value.trim()) {
        setFieldValid(signupForm, 'signup-email');
      }
    });
    signupEmail.addEventListener('input', function () {
      if (this.closest('.form-group').classList.contains('error') && validateEmail(this.value.trim())) {
        setFieldValid(signupForm, 'signup-email');
      }
    });

    signupPhone.addEventListener('blur', function () {
      if (this.value.trim() && !/^\d{10}$/.test(this.value.trim())) {
        setFieldError(signupForm, 'phone', 'Phone must be exactly 10 digits');
      } else if (this.value.trim()) {
        setFieldValid(signupForm, 'phone');
      }
    });
    signupPhone.addEventListener('input', function () {
      this.value = this.value.replace(/\D/g, '').substring(0, 10);
      if (this.closest('.form-group').classList.contains('error') && /^\d{10}$/.test(this.value)) {
        setFieldValid(signupForm, 'phone');
      }
    });

    if (signupPassword) {
      signupPassword.addEventListener('blur', function () {
        var v = this.value;
        if (v && (v.length < 8 || !/[A-Z]/.test(v) || !/[a-z]/.test(v) || !/[0-9]/.test(v) || !/[^A-Za-z0-9]/.test(v))) {
          setFieldError(signupForm, 'signup-password', 'Min 8 chars with uppercase, lowercase, number & special character');
        } else if (v) {
          setFieldValid(signupForm, 'signup-password');
        }
      });
    }

    if (signupConfirm) {
      signupConfirm.addEventListener('blur', function () {
        if (this.value && this.value !== signupPassword.value) {
          setFieldError(signupForm, 'confirm-password', 'Passwords do not match');
        } else if (this.value) {
          setFieldValid(signupForm, 'confirm-password');
        }
      });
      signupConfirm.addEventListener('input', function () {
        if (this.closest('.form-group').classList.contains('error') && this.value === signupPassword.value) {
          setFieldValid(signupForm, 'confirm-password');
        }
      });
    }
  }

  // ===== Scroll Reveal Animations =====
  var revealObserver2 = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver2.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-stagger]').forEach(function(el) {
    revealObserver2.observe(el);
  });

  // ===== Dashboard (Member only) =====
  if (document.querySelector('.dash-body') && !document.querySelector('.prov-sidebar')) {
    // Auth check
    var dashUser = JSON.parse(localStorage.getItem('stacklyUser') || 'null');
    if (!dashUser) { window.location.href = 'login.html'; return; }

    // Set user info
    var uName = dashUser.name || 'Member';
    var uEmail = dashUser.email || 'member@email.com';
    var uRole = dashUser.role || 'member';
    var initials = uName.split(' ').map(function(w){ return w[0]; }).join('').substring(0,2).toUpperCase();
    var userNameEl = document.getElementById('userName');
    var userRoleEl = document.getElementById('userRole');
    var userAvatarEl = document.getElementById('userAvatar');
    if (userNameEl) userNameEl.textContent = uName.split(' ')[0];
    if (userRoleEl) userRoleEl.textContent = uRole.charAt(0).toUpperCase() + uRole.slice(1);
    if (userAvatarEl) userAvatarEl.textContent = initials;

    // Sidebar toggle
    var sidebar = document.getElementById('dashSidebar');
    var sidebarOverlay = document.getElementById('sidebarOverlay');
    var sidebarToggle = document.getElementById('sidebarToggle');
    var sidebarClose = document.getElementById('sidebarClose');

    function openSidebar() { sidebar.classList.add('open'); sidebarOverlay.classList.add('active'); document.body.style.overflow = 'hidden'; }
    function closeSidebar() { sidebar.classList.remove('open'); sidebarOverlay.classList.remove('active'); document.body.style.overflow = ''; }
    if (sidebarToggle) sidebarToggle.addEventListener('click', openSidebar);
    if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

    // Dummy data
    var policies = [
      { name: 'Gold Health Plan', desc: 'Comprehensive individual coverage', premium: '$299/mo', coverage: '$500,000', valid: 'Jan 2025 – Dec 2025', img: 'assets/images/dashboard-policy.webp', usage: 32, status: 'Active', benefits: ['Cashless', '10k+ Hospitals', 'Add-ons'] },
      { name: 'Family Shield Plus', desc: 'All-round protection for the whole family', premium: '$449/mo', coverage: '$1,000,000', valid: 'Mar 2025 – Feb 2026', img: 'assets/images/dashboard-hospital-1.webp', usage: 48, status: 'Active', benefits: ['Family Floater', 'Maternity', '24/7 Care'] },
      { name: 'Critical Care Elite', desc: 'Lump-sum cover for critical illness', premium: '$199/mo', coverage: '$250,000', valid: 'Jun 2025 – May 2026', img: 'assets/images/dashboard-hospital-2.webp', usage: 12, status: 'Active', benefits: ['32 Illnesses', 'Instant Payout', 'No Claim Bonus'] }
    ];
    var claims = [
      { id: 'CLM-2025-001', type: 'Hospitalization', amount: '$4,200', status: 'approved', date: '12 Jul 2025' },
      { id: 'CLM-2025-002', type: 'Prescription', amount: '$180', status: 'approved', date: '28 Jun 2025' },
      { id: 'CLM-2025-003', type: 'Dental', amount: '$650', status: 'pending', date: '05 Jul 2025' },
      { id: 'CLM-2025-004', type: 'Eye Care', amount: '$320', status: 'rejected', date: '15 Jun 2025' },
      { id: 'CLM-2025-005', type: 'Lab Tests', amount: '$420', status: 'approved', date: '01 Jul 2025' },
      { id: 'CLM-2025-006', type: 'Surgery', amount: '$12,500', status: 'pending', date: '18 Jul 2025' }
    ];
    var memberHospitals = [
      { name: 'Metro General Hospital', location: 'Downtown, NY', img: 'assets/images/dashboard-hospital-1.webp', rating: 4.8, distance: '1.2 mi', cashless: true, specs: ['Cardiology', '24/7 ER', 'ICU'] },
      { name: 'St. Mary\'s Medical Center', location: 'Midtown, NY', img: 'assets/images/dashboard-hospital-2.webp', rating: 4.7, distance: '2.5 mi', cashless: true, specs: ['Maternity', 'Orthopedics', 'ICU'] },
      { name: 'City Health Clinic', location: 'Uptown, NY', img: 'assets/images/dashboard-hospital-3.webp', rating: 4.5, distance: '3.1 mi', cashless: true, specs: ['OPD', 'Dental', 'Labs'] },
      { name: 'Wellness Care Hospital', location: 'Brooklyn, NY', img: 'assets/images/dashboard-hospital-4.webp', rating: 4.9, distance: '0.8 mi', cashless: true, specs: ['Oncology', 'Neurology', '24/7 ER'] }
    ];
    var documents = [
      { name: 'Insurance Policy Document', type: 'PDF • 2.4 MB', icon: 'fa-file-pdf' },
      { name: 'Claims Report Q2 2025', type: 'PDF • 1.1 MB', icon: 'fa-file-lines' },
      { name: 'Hospital Visit Receipt', type: 'JPG • 340 KB', icon: 'fa-file-image' },
      { name: 'Membership Card', type: 'PDF • 890 KB', icon: 'fa-id-card' }
    ];
    var activities = [
      { text: 'Claim CLM-2025-001 approved', sub: 'Hospitalization • $4,200', icon: 'fa-check-circle', color: 'green', date: '12 Jul' },
      { text: 'New policy activated', sub: 'Gold Health Plan', icon: 'fa-shield-halved', color: 'blue', date: '10 Jul' },
      { text: 'Claim CLM-2025-003 under review', sub: 'Dental • $650', icon: 'fa-clock', color: 'amber', date: '05 Jul' },
      { text: 'Document uploaded', sub: 'Claims Report Q2', icon: 'fa-upload', color: 'blue', date: '01 Jul' }
    ];

    // View templates
    function renderOverview() {
      return '<div class="dv-header"><h1>Welcome back, ' + uName.split(' ')[0] + ' 👋</h1><p>Here\'s an overview of your health coverage.</p></div>' +
        '<div class="kpi-grid">' +
          '<div class="kpi-card"><div class="kpi-icon blue"><i class="fa-solid fa-shield-halved"></i></div><div class="kpi-value" data-count="3">0</div><div class="kpi-label">Active Policies</div></div>' +
          '<div class="kpi-card"><div class="kpi-icon green"><i class="fa-solid fa-file-lines"></i></div><div class="kpi-value" data-count="6">0</div><div class="kpi-label">Claims Submitted</div></div>' +
          '<div class="kpi-card"><div class="kpi-icon amber"><i class="fa-solid fa-chart-line"></i></div><div class="kpi-value" data-count="83" data-suffix="%">0</div><div class="kpi-label">Approval Rate</div></div>' +
          '<div class="kpi-card"><div class="kpi-icon red"><i class="fa-solid fa-wallet"></i></div><div class="kpi-value" data-count="750" data-prefix="$" data-suffix="K">0</div><div class="kpi-label">Total Coverage</div></div>' +
        '</div>' +
        '<div class="charts-grid">' +
          '<div class="chart-card"><h3>Claims Over Time</h3><div class="chart-wrap"><canvas id="chartLine"></canvas></div></div>' +
          '<div class="chart-card"><h3>Claim Status</h3><div class="chart-wrap"><canvas id="chartDoughnut"></canvas></div></div>' +
          '<div class="chart-card"><h3>Coverage Usage</h3><div class="chart-wrap"><canvas id="chartBar"></canvas></div></div>' +
          '<div class="chart-card"><h3>Recent Activity</h3><div class="activity-list">' +
            activities.map(function(a) {
              return '<div class="activity-item"><div class="activity-icon ' + a.color + '"><i class="fa-solid ' + a.icon + '"></i></div><div class="activity-text"><strong>' + a.text + '</strong><span>' + a.sub + '</span></div><span class="activity-date">' + a.date + '</span></div>';
            }).join('') +
          '</div></div>' +
        '</div>';
    }
    function renderPolicies() {
      return '<div class="dv-header"><span class="dv-eyebrow">Your Coverage</span><h1>My Policies</h1><p>Manage your active health insurance plans.</p></div>' +
        '<div class="policy-summary">' +
          '<div class="ps-stat"><span class="ps-icon blue"><i class="fa-solid fa-layer-group"></i></span><div><strong>' + policies.length + '</strong><span>Active Policies</span></div></div>' +
          '<div class="ps-stat"><span class="ps-icon green"><i class="fa-solid fa-shield-heart"></i></span><div><strong>$1.75M</strong><span>Total Coverage</span></div></div>' +
          '<div class="ps-stat"><span class="ps-icon amber"><i class="fa-solid fa-calendar-check"></i></span><div><strong>$449</strong><span>Next Premium Due</span></div></div>' +
          '<div class="ps-stat"><span class="ps-icon red"><i class="fa-solid fa-circle-check"></i></span><div><strong>98%</strong><span>Renewal Success</span></div></div>' +
        '</div>' +
        '<div class="premium-policies-grid">' +
          policies.map(function(p) {
            return '<div class="premium-policy-card">' +
              '<div class="pp-hero"><img src="' + p.img + '" alt="' + p.name + '" /><div class="pp-hero-overlay"></div><span class="pp-badge"><i class="fa-solid fa-circle-check"></i> ' + p.status + '</span>' +
                '<div class="pp-hero-body"><span class="pp-plan-label">Plan</span><h3>' + p.name + '</h3><p>' + p.desc + '</p></div>' +
              '</div>' +
              '<div class="pp-body">' +
                '<div class="pp-metrics">' +
                  '<div class="pp-metric"><span>Sum Insured</span><strong>' + p.coverage + '</strong></div>' +
                  '<div class="pp-metric"><span>Premium</span><strong>' + p.premium + '</strong></div>' +
                  '<div class="pp-metric"><span>Valid Till</span><strong>' + p.valid.split(' – ')[1] + '</strong></div>' +
                '</div>' +
                '<div class="pp-usage"><div class="pp-usage-head"><span>Coverage Used</span><strong>' + p.usage + '%</strong></div><div class="pp-usage-bar"><span style="width:' + p.usage + '%"></span></div></div>' +
                '<div class="pp-benefits">' + p.benefits.map(function(b){ return '<span><i class="fa-solid fa-circle-check"></i> ' + b + '</span>'; }).join('') + '</div>' +
                '<div class="pp-actions"><a href="404.html" class="btn btn-primary btn-sm"><i class="fa-solid fa-eye"></i> View Details</a><a href="404.html" class="btn btn-ghost btn-sm"><i class="fa-solid fa-id-card"></i> Digital Card</a></div>' +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>';
    }
    function renderClaims() {
      var approvedCount = claims.filter(function(c){ return c.status === 'approved'; }).length;
      var pendingCount = claims.filter(function(c){ return c.status === 'pending'; }).length;
      var rejectedCount = claims.filter(function(c){ return c.status === 'rejected'; }).length;
      function claimIcon(type) {
        var t = (type || '').toLowerCase();
        if (t.indexOf('hospital') > -1) return 'fa-hospital';
        if (t.indexOf('prescript') > -1) return 'fa-prescription-bottle-medical';
        if (t.indexOf('dental') > -1) return 'fa-tooth';
        if (t.indexOf('eye') > -1) return 'fa-eye';
        if (t.indexOf('lab') > -1) return 'fa-flask';
        if (t.indexOf('surg') > -1) return 'fa-syringe';
        return 'fa-file-lines';
      }
      return '<div class="dv-header"><span class="dv-eyebrow">Claims Center</span><h1>Claims</h1><p>Track, manage and file your insurance claims.</p></div>' +
        '<div class="claim-summary">' +
          '<div class="cs-stat"><span class="cs-icon blue"><i class="fa-solid fa-file-invoice"></i></span><div><strong>' + claims.length + '</strong><span>Total Claims</span></div></div>' +
          '<div class="cs-stat"><span class="cs-icon green"><i class="fa-solid fa-check-double"></i></span><div><strong>' + approvedCount + '</strong><span>Approved</span></div></div>' +
          '<div class="cs-stat"><span class="cs-icon amber"><i class="fa-solid fa-clock"></i></span><div><strong>' + pendingCount + '</strong><span>Pending</span></div></div>' +
          '<div class="cs-stat"><span class="cs-icon red"><i class="fa-solid fa-wallet"></i></span><div><strong>$18.3K</strong><span>Recovered</span></div></div>' +
        '</div>' +
        '<div class="file-claim-banner">' +
          '<div class="fcb-icon"><i class="fa-solid fa-file-circle-plus"></i></div>' +
          '<div class="fcb-text"><h3>Need to file a new claim?</h3><p>Submit your documents and get a decision in minutes.</p></div>' +
          '<a href="404.html" class="btn btn-primary btn-sm"><i class="fa-solid fa-plus"></i> File a Claim</a>' +
        '</div>' +
        '<div class="premium-claims-list">' +
          claims.map(function(c) {
            return '<div class="premium-claim-card ' + c.status + '">' +
              '<div class="pc-icon ' + c.status + '"><i class="fa-solid ' + claimIcon(c.type) + '"></i></div>' +
              '<div class="pc-info">' +
                '<div class="pc-top"><strong>' + c.id + '</strong><span class="status-badge ' + c.status + '">' + c.status.charAt(0).toUpperCase() + c.status.slice(1) + '</span></div>' +
                '<p>' + c.type + '</p>' +
                '<span class="pc-date"><i class="fa-solid fa-calendar"></i> ' + c.date + '</span>' +
              '</div>' +
              '<div class="pc-amount">' + c.amount + '</div>' +
            '</div>';
          }).join('') +
        '</div>';
    }
    function renderHospitals() {
      return '<div class="dv-header"><span class="dv-eyebrow">Hospital Network</span><h1>Hospitals</h1><p>Find cashless hospitals in your network.</p></div>' +
        '<div class="hs-summary">' +
          '<div class="hs-stat"><span class="hs-icon blue"><i class="fa-solid fa-hospital"></i></span><div><strong>10,000+</strong><span>Network Hospitals</span></div></div>' +
          '<div class="hs-stat"><span class="hs-icon green"><i class="fa-solid fa-building"></i></span><div><strong>500+</strong><span>Cities Covered</span></div></div>' +
          '<div class="hs-stat"><span class="hs-icon amber"><i class="fa-solid fa-hand-holding-dollar"></i></span><div><strong>100%</strong><span>Cashless</span></div></div>' +
          '<div class="hs-stat"><span class="hs-icon red"><i class="fa-solid fa-star"></i></span><div><strong>4.8</strong><span>Avg. Rating</span></div></div>' +
        '</div>' +
        '<div class="premium-hospitals-grid">' +
          memberHospitals.map(function(h) {
            return '<div class="premium-hospital-card">' +
              '<div class="ph-hero"><img src="' + h.img + '" alt="' + h.name + '" /><div class="ph-hero-overlay"></div>' +
                (h.cashless ? '<span class="ph-cashless"><i class="fa-solid fa-circle-check"></i> Cashless</span>' : '') +
                '<span class="ph-rating"><i class="fa-solid fa-star"></i> ' + h.rating + '</span>' +
              '</div>' +
              '<div class="ph-body">' +
                '<h3>' + h.name + '</h3>' +
                '<p class="ph-loc"><i class="fa-solid fa-location-dot"></i> ' + h.location + ' <span class="ph-dist"><i class="fa-solid fa-road"></i> ' + h.distance + '</span></p>' +
                '<div class="ph-specs">' + h.specs.map(function(s){ return '<span>' + s + '</span>'; }).join('') + '</div>' +
                '<div class="ph-actions"><a href="404.html" class="btn btn-primary btn-sm"><i class="fa-solid fa-eye"></i> View</a><a href="404.html" class="btn btn-ghost btn-sm"><i class="fa-solid fa-location-arrow"></i> Directions</a></div>' +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>';
    }
    function renderDocuments() {
      return '<div class="dv-header"><h1>Documents</h1><p>Access your insurance documents and files.</p></div>' +
        '<div class="docs-list">' +
          documents.map(function(d) {
            return '<div class="doc-item"><div class="doc-icon"><i class="fa-solid ' + d.icon + '"></i></div><div class="doc-info"><strong>' + d.name + '</strong><span>' + d.type + '</span></div><a href="404.html" class="doc-download"><i class="fa-solid fa-download"></i> Download</a></div>';
          }).join('') +
        '</div>';
    }
    function renderSettings() {
      var initials = uName.split(' ').map(function(w){ return w[0]; }).join('').substring(0,2).toUpperCase();
      return '<div class="dv-header"><span class="dv-eyebrow">Account Settings</span><h1>Settings</h1><p>Manage your account preferences and security.</p></div>' +
        '<div class="settings-profile-card">' +
          '<div class="sp-avatar">' + initials + '</div>' +
          '<div class="sp-info"><strong>' + uName + '</strong><span>' + uEmail + '</span><em><i class="fa-solid fa-circle-check"></i> ' + uRole.charAt(0).toUpperCase() + uRole.slice(1) + ' Account</em></div>' +
          '<div class="sp-stats"><div><strong>3</strong><span>Policies</span></div><div><strong>6</strong><span>Claims</span></div><div><strong>2025</strong><span>Member Since</span></div></div>' +
        '</div>' +
        '<div class="settings-grid">' +
          '<div class="settings-card premium-settings-card"><h3><i class="fa-solid fa-user"></i> Profile Information</h3>' +
            '<div class="settings-group"><label>Full Name</label><div class="setting-input"><i class="fa-solid fa-user"></i><input type="text" id="settingsName" value="' + uName + '" /></div></div>' +
            '<div class="settings-group"><label>Email Address</label><div class="setting-input"><i class="fa-solid fa-envelope"></i><input type="email" id="settingsEmail" value="' + uEmail + '" /></div></div>' +
            '<div class="settings-group"><label>Phone Number</label><div class="setting-input"><i class="fa-solid fa-phone"></i><input type="tel" value="+1 555 000 1234" /></div></div>' +
            '<button class="btn btn-primary btn-sm" id="settingsSave"><i class="fa-solid fa-floppy-disk"></i> Save Changes</button>' +
          '</div>' +
          '<div class="settings-card premium-settings-card"><h3><i class="fa-solid fa-shield-halved"></i> Security & Preferences</h3>' +
            '<div class="settings-group"><label>New Password</label><div class="setting-input"><i class="fa-solid fa-lock"></i><input type="password" placeholder="Enter new password" /></div></div>' +
            '<div class="settings-toggle-row"><div><strong>Email Notifications</strong><span>Receive policy updates and reminders</span></div><label class="st-switch"><input type="checkbox" checked /><span></span></label></div>' +
            '<div class="settings-toggle-row"><div><strong>Two-Factor Auth</strong><span>Add an extra layer of security</span></div><label class="st-switch"><input type="checkbox" checked /><span></span></label></div>' +
            '<a href="404.html" class="btn btn-secondary btn-sm"><i class="fa-solid fa-key"></i> Update Password</a>' +
          '</div>' +
        '</div>';
    }

    // SPA routing
    var contentEl = document.getElementById('dashContent');
    var memberNavLinks = document.querySelectorAll('.ds-nav-link[data-view]');
    var charts = [];

    function destroyCharts() { charts.forEach(function(c){ c.destroy(); }); charts = []; }

    function animateCounters() {
      document.querySelectorAll('.kpi-value[data-count]').forEach(function(el) {
        var target = parseInt(el.getAttribute('data-count'));
        var prefix = el.getAttribute('data-prefix') || '';
        var suffix = el.getAttribute('data-suffix') || '';
        var current = 0;
        var step = Math.max(1, Math.ceil(target / 40));
        var interval = setInterval(function() {
          current += step;
          if (current >= target) { current = target; clearInterval(interval); }
          el.textContent = prefix + current + suffix;
        }, 30);
      });
    }

    function initCharts() {
      if (typeof Chart === 'undefined') return;
      Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
      Chart.defaults.font.size = 12;

      var lineCtx = document.getElementById('chartLine');
      if (lineCtx) {
        charts.push(new Chart(lineCtx, {
          type: 'line',
          data: {
            labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul'],
            datasets: [{
              label: 'Claims',
              data: [2, 4, 3, 5, 4, 6, 3],
              borderColor: '#2563EB',
              backgroundColor: 'rgba(37,99,235,0.08)',
              fill: true,
              tension: 0.4,
              pointRadius: 4,
              pointBackgroundColor: '#2563EB'
            }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } }, x: { grid: { display: false } } } }
        }));
      }

      var doughnutCtx = document.getElementById('chartDoughnut');
      if (doughnutCtx) {
        charts.push(new Chart(doughnutCtx, {
          type: 'doughnut',
          data: {
            labels: ['Approved', 'Pending', 'Rejected'],
            datasets: [{ data: [4, 1, 1], backgroundColor: ['#22C55E', '#F59E0B', '#EF4444'], borderWidth: 0, borderRadius: 4 }]
          },
          options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, pointStyleWidth: 10 } } } }
        }));
      }

      var barCtx = document.getElementById('chartBar');
      if (barCtx) {
        charts.push(new Chart(barCtx, {
          type: 'bar',
          data: {
            labels: ['Hospitalization', 'Dental', 'Eye Care', 'Lab Tests', 'Prescription'],
            datasets: [{
              label: 'Usage',
              data: [4200, 650, 320, 420, 180],
              backgroundColor: ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'],
              borderRadius: 8,
              borderSkipped: false
            }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } }, x: { grid: { display: false } } } }
        }));
      }
    }

    function navigateTo(view) {
      destroyCharts();
      document.querySelectorAll('.ds-nav-link[data-view]').forEach(function(l) { l.classList.toggle('active', l.getAttribute('data-view') === view); });
      contentEl.style.animation = 'none';
      contentEl.offsetHeight;
      contentEl.style.animation = 'dashFadeIn 0.4s ease both';

      switch (view) {
        case 'overview': contentEl.innerHTML = renderOverview(); animateCounters(); setTimeout(initCharts, 100); break;
        case 'policies': contentEl.innerHTML = renderPolicies(); break;
        case 'claims': contentEl.innerHTML = renderClaims(); break;
        case 'hospitals': contentEl.innerHTML = renderHospitals(); break;
        case 'documents': contentEl.innerHTML = renderDocuments(); break;
        case 'settings':
          contentEl.innerHTML = renderSettings();
          var saveBtn = document.getElementById('settingsSave');
          if (saveBtn) saveBtn.addEventListener('click', function() {
            var n = document.getElementById('settingsName').value;
            var e = document.getElementById('settingsEmail').value;
            dashUser.name = n; dashUser.email = e;
            localStorage.setItem('stacklyUser', JSON.stringify(dashUser));
            if (userNameEl) userNameEl.textContent = n.split(' ')[0];
            if (userAvatarEl) userAvatarEl.textContent = n.split(' ').map(function(w){ return w[0]; }).join('').substring(0,2).toUpperCase();
            saveBtn.textContent = 'Saved!';
            setTimeout(function(){ saveBtn.textContent = 'Save Changes'; }, 2000);
          });
          break;
        case 'logout':
          localStorage.removeItem('stacklyUser');
          window.location.href = 'login.html';
          break;
      }
      closeSidebar();
    }

    var dashNavLinks = document.querySelectorAll('.ds-nav-link[data-view]');
    dashNavLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        navigateTo(this.getAttribute('data-view'));
      });
    });

    var logoutBtn = document.getElementById('sidebarLogout');
    if (logoutBtn) logoutBtn.addEventListener('click', function(e) { e.preventDefault(); navigateTo('logout'); });

    // Initial load
    navigateTo('overview');
  }

  // ===== Provider Dashboard =====
  if (document.querySelector('.prov-sidebar')) {
    var provUser = JSON.parse(localStorage.getItem('stacklyUser') || 'null');
    if (!provUser || provUser.role !== 'provider') { window.location.href = 'login.html'; return; }

    var pName = provUser.name || 'Doctor';
    var pEmail = provUser.email || 'doctor@hospital.com';
    var pInitials = pName.split(' ').map(function(w){ return w[0]; }).join('').substring(0,2).toUpperCase();
    var pNameEl = document.getElementById('userName');
    var pRoleEl = document.getElementById('userRole');
    var pAvatarEl = document.getElementById('userAvatar');
    if (pNameEl) pNameEl.textContent = 'Dr. ' + pName.split(' ')[0];
    if (pRoleEl) pRoleEl.textContent = 'Provider';
    if (pAvatarEl) pAvatarEl.textContent = pInitials;

    // Sidebar
    var pSidebar = document.getElementById('dashSidebar');
    var pOverlay = document.getElementById('sidebarOverlay');
    var pToggle = document.getElementById('sidebarToggle');
    var pClose = document.getElementById('sidebarClose');
    function pOpenSidebar() { pSidebar.classList.add('open'); pOverlay.classList.add('active'); document.body.style.overflow = 'hidden'; }
    function pCloseSidebar() { pSidebar.classList.remove('open'); pOverlay.classList.remove('active'); document.body.style.overflow = ''; }
    if (pToggle) pToggle.addEventListener('click', pOpenSidebar);
    if (pClose) pClose.addEventListener('click', pCloseSidebar);
    if (pOverlay) pOverlay.addEventListener('click', pCloseSidebar);

    // Data
    var provClaims = [
      { id: 'CLM-2025-001', patient: 'Sarah Johnson', hospital: 'Metro General', amount: 4200, status: 'approved', date: '12 Jul 2025', type: 'Hospitalization' },
      { id: 'CLM-2025-002', patient: 'Michael Chen', hospital: 'St. Mary\'s', amount: 180, status: 'approved', date: '28 Jun 2025', type: 'Prescription' },
      { id: 'CLM-2025-003', patient: 'Emily Davis', hospital: 'City Health', amount: 650, status: 'pending', date: '05 Jul 2025', type: 'Dental' },
      { id: 'CLM-2025-004', patient: 'James Wilson', hospital: 'Wellness Care', amount: 320, status: 'rejected', date: '15 Jun 2025', type: 'Eye Care' },
      { id: 'CLM-2025-005', patient: 'Lisa Anderson', hospital: 'Metro General', amount: 420, status: 'approved', date: '01 Jul 2025', type: 'Lab Tests' },
      { id: 'CLM-2025-006', patient: 'Robert Taylor', hospital: 'St. Mary\'s', amount: 12500, status: 'pending', date: '18 Jul 2025', type: 'Surgery' },
      { id: 'CLM-2025-007', patient: 'Anna Martinez', hospital: 'City Health', amount: 890, status: 'pending', date: '20 Jul 2025', type: 'Prescription' },
      { id: 'CLM-2025-008', patient: 'David Brown', hospital: 'Wellness Care', amount: 3200, status: 'pending', date: '22 Jul 2025', type: 'Hospitalization' }
    ];
    var provPatients = [
      { name: 'Sarah Johnson', policy: 'POL-1001', claims: 3, avatar: 'SJ', status: 'active', coverage: '$500K', lastVisit: '12 Jul', condition: 'Cardiology' },
      { name: 'Michael Chen', policy: 'POL-1002', claims: 1, avatar: 'MC', status: 'active', coverage: '$250K', lastVisit: '28 Jun', condition: 'General' },
      { name: 'Emily Davis', policy: 'POL-1003', claims: 2, avatar: 'ED', status: 'active', coverage: '$1M', lastVisit: '05 Jul', condition: 'Maternity' },
      { name: 'James Wilson', policy: 'POL-1004', claims: 1, avatar: 'JW', status: 'inactive', coverage: '$500K', lastVisit: '15 Jun', condition: 'Orthopedics' },
      { name: 'Lisa Anderson', policy: 'POL-1005', claims: 4, avatar: 'LA', status: 'active', coverage: '$750K', lastVisit: '01 Jul', condition: 'Oncology' },
      { name: 'Robert Taylor', policy: 'POL-1006', claims: 2, avatar: 'RT', status: 'active', coverage: '$300K', lastVisit: '18 Jul', condition: 'Neurology' }
    ];
    var provHospitals = [
      { name: 'Metro General Hospital', city: 'Downtown, NY', status: 'active', img: 'assets/images/dashboard-hospital-1.webp', beds: 320, rating: 4.8, depts: ['Cardiology', 'ICU', '24/7 ER'], partner: '2019' },
      { name: 'St. Mary\'s Medical Center', city: 'Midtown, NY', status: 'active', img: 'assets/images/dashboard-hospital-2.webp', beds: 450, rating: 4.7, depts: ['Maternity', 'Orthopedics', 'ICU'], partner: '2018' },
      { name: 'City Health Clinic', city: 'Uptown, NY', status: 'active', img: 'assets/images/dashboard-hospital-3.webp', beds: 120, rating: 4.5, depts: ['OPD', 'Dental', 'Labs'], partner: '2021' },
      { name: 'Wellness Care Hospital', city: 'Brooklyn, NY', status: 'inactive', img: 'assets/images/dashboard-hospital-4.webp', beds: 260, rating: 4.9, depts: ['Oncology', 'Neurology', '24/7 ER'], partner: '2020' }
    ];
    var provNotifs = [
      { text: 'New claim submitted by Sarah Johnson', sub: 'Hospitalization • $4,200', icon: 'fa-file-circle-plus', color: 'blue', time: '2 min ago', unread: true },
      { text: 'Claim CLM-2025-006 pending approval', sub: 'Surgery • $12,500', icon: 'fa-clock', color: 'amber', time: '15 min ago', unread: true },
      { text: 'Claim CLM-2025-001 approved', sub: 'Hospitalization • $4,200', icon: 'fa-check-circle', color: 'green', time: '1 hour ago', unread: false },
      { text: 'New patient registered: Anna Martinez', sub: 'Policy POL-1007', icon: 'fa-user-plus', color: 'blue', time: '3 hours ago', unread: false },
      { text: 'Monthly analytics report ready', sub: 'June 2025 Summary', icon: 'fa-chart-bar', color: 'green', time: '1 day ago', unread: false }
    ];
    var provActivities = [
      { text: 'Approved claim CLM-2025-001', sub: 'Sarah Johnson • $4,200', icon: 'fa-check-circle', color: 'green', date: '12 Jul' },
      { text: 'Rejected claim CLM-2025-004', sub: 'James Wilson • $320', icon: 'fa-times-circle', color: 'red', date: '15 Jun' },
      { text: 'New patient registered', sub: 'Lisa Anderson', icon: 'fa-user-plus', color: 'blue', date: '10 Jul' },
      { text: 'Claim CLM-2025-003 under review', sub: 'Emily Davis • $650', icon: 'fa-clock', color: 'amber', date: '05 Jul' }
    ];

    var pContent = document.getElementById('dashContent');
    var pNavLinks = document.querySelectorAll('.ds-nav-link[data-view]');
    var pCharts = [];

    function pDestroyCharts() { pCharts.forEach(function(c){ c.destroy(); }); pCharts = []; }
    function pAnimateCounters() {
      document.querySelectorAll('.kpi-value[data-count]').forEach(function(el) {
        var target = parseInt(el.getAttribute('data-count'));
        var prefix = el.getAttribute('data-prefix') || '';
        var suffix = el.getAttribute('data-suffix') || '';
        var current = 0;
        var step = Math.max(1, Math.ceil(target / 40));
        var interval = setInterval(function() {
          current += step;
          if (current >= target) { current = target; clearInterval(interval); }
          el.textContent = prefix + current.toLocaleString() + suffix;
        }, 30);
      });
    }

    function renderProvOverview() {
      var pending = provClaims.filter(function(c){ return c.status === 'pending'; }).length;
      var approved = provClaims.filter(function(c){ return c.status === 'approved'; }).length;
      var totalRev = provClaims.filter(function(c){ return c.status === 'approved'; }).reduce(function(s,c){ return s + c.amount; }, 0);
      return '<div class="dv-header"><h1>Welcome back, Dr. ' + pName.split(' ')[0] + ' 👋</h1><p>Here\'s your practice overview.</p></div>' +
        '<div class="kpi-grid">' +
          '<div class="kpi-card"><div class="kpi-icon blue"><i class="fa-solid fa-file-invoice"></i></div><div class="kpi-value" data-count="' + provClaims.length + '">0</div><div class="kpi-label">Total Claims</div></div>' +
          '<div class="kpi-card"><div class="kpi-icon amber"><i class="fa-solid fa-clock"></i></div><div class="kpi-value" data-count="' + pending + '">0</div><div class="kpi-label">Pending Approvals</div></div>' +
          '<div class="kpi-card"><div class="kpi-icon green"><i class="fa-solid fa-check-double"></i></div><div class="kpi-value" data-count="' + approved + '">0</div><div class="kpi-label">Approved Claims</div></div>' +
          '<div class="kpi-card"><div class="kpi-icon red"><i class="fa-solid fa-dollar-sign"></i></div><div class="kpi-value" data-count="' + Math.round(totalRev/1000) + '" data-prefix="$" data-suffix="K">0</div><div class="kpi-label">Revenue Processed</div></div>' +
        '</div>' +
        '<div class="charts-grid">' +
          '<div class="chart-card"><h3>Claims Trend</h3><div class="chart-wrap"><canvas id="provChartLine"></canvas></div></div>' +
          '<div class="chart-card"><h3>Approvals vs Rejections</h3><div class="chart-wrap"><canvas id="provChartBar"></canvas></div></div>' +
          '<div class="chart-card"><h3>Claim Distribution</h3><div class="chart-wrap"><canvas id="provChartDoughnut"></canvas></div></div>' +
          '<div class="chart-card"><h3>Recent Activity</h3><div class="activity-list">' +
            provActivities.map(function(a) {
              return '<div class="activity-item"><div class="activity-icon ' + a.color + '"><i class="fa-solid ' + a.icon + '"></i></div><div class="activity-text"><strong>' + a.text + '</strong><span>' + a.sub + '</span></div><span class="activity-date">' + a.date + '</span></div>';
            }).join('') +
          '</div></div></div>';
    }

    function renderProvClaims() {
      var pPending = provClaims.filter(function(c){ return c.status === 'pending'; }).length;
      var pApproved = provClaims.filter(function(c){ return c.status === 'approved'; }).length;
      var pRejected = provClaims.filter(function(c){ return c.status === 'rejected'; }).length;
      function pInit(name) { return name.split(' ').map(function(w){ return w[0]; }).join('').substring(0,2).toUpperCase(); }
      return '<div class="dv-header"><span class="dv-eyebrow">Claims Management</span><h1>Claims Management</h1><p>Review and manage patient insurance claims.</p></div>' +
        '<div class="pc-summary">' +
          '<div class="pcs-stat"><span class="pcs-icon blue"><i class="fa-solid fa-file-invoice"></i></span><div><strong>' + provClaims.length + '</strong><span>Total Claims</span></div></div>' +
          '<div class="pcs-stat"><span class="pcs-icon amber"><i class="fa-solid fa-clock"></i></span><div><strong>' + pPending + '</strong><span>Pending</span></div></div>' +
          '<div class="pcs-stat"><span class="pcs-icon green"><i class="fa-solid fa-check-double"></i></span><div><strong>' + pApproved + '</strong><span>Approved</span></div></div>' +
          '<div class="pcs-stat"><span class="pcs-icon red"><i class="fa-solid fa-circle-xmark"></i></span><div><strong>' + pRejected + '</strong><span>Rejected</span></div></div>' +
        '</div>' +
        '<div class="pc-filter"><div class="claims-controls"><select class="claims-filter" id="provClaimFilter"><option value="all">All Status</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select></div></div>' +
        '<div class="premium-prov-claims">' +
          provClaims.map(function(c, i) {
            return '<div class="premium-prov-claim-card" data-idx="' + i + '">' +
              '<div class="ppc-avatar ' + c.status + '">' + pInit(c.patient) + '</div>' +
              '<div class="ppc-info">' +
                '<div class="ppc-top"><strong>' + c.id + '</strong><span class="status-badge ' + c.status + '">' + c.status.charAt(0).toUpperCase() + c.status.slice(1) + '</span></div>' +
                '<p class="ppc-name">' + c.patient + '</p>' +
                '<span class="ppc-meta"><i class="fa-solid fa-hospital"></i> ' + c.hospital + ' <span class="ppc-sep"></span> <i class="fa-solid fa-list-check"></i> ' + c.type + ' <span class="ppc-sep"></span> <i class="fa-solid fa-calendar"></i> ' + c.date + '</span>' +
              '</div>' +
              '<div class="ppc-amount">$' + c.amount.toLocaleString() + '</div>' +
              '<div class="ppc-actions">' +
                (c.status === 'pending'
                  ? '<button class="pc-approve" data-idx="' + i + '" aria-label="Approve"><i class="fa-solid fa-check"></i></button><button class="pc-reject" data-idx="' + i + '" aria-label="Reject"><i class="fa-solid fa-xmark"></i></button>'
                  : '<span class="ppc-done">—</span>') +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>';
    }

    function renderProvPatients() {
      var totalClaims = provPatients.reduce(function(s, p){ return s + p.claims; }, 0);
      var activeCount = provPatients.filter(function(p){ return p.status === 'active'; }).length;
      return '<div class="dv-header"><span class="dv-eyebrow">Patient Records</span><h1>Patients</h1><p>Manage patient records and claim history.</p></div>' +
        '<div class="patient-summary">' +
          '<div class="pt-sum-stat"><span class="pts-icon blue"><i class="fa-solid fa-users"></i></span><div><strong>' + provPatients.length + '</strong><span>Total Patients</span></div></div>' +
          '<div class="pt-sum-stat"><span class="pts-icon green"><i class="fa-solid fa-user-check"></i></span><div><strong>' + activeCount + '</strong><span>Active</span></div></div>' +
          '<div class="pt-sum-stat"><span class="pts-icon amber"><i class="fa-solid fa-file-invoice"></i></span><div><strong>' + totalClaims + '</strong><span>Total Claims</span></div></div>' +
          '<div class="pt-sum-stat"><span class="pts-icon red"><i class="fa-solid fa-hand-holding-heart"></i></span><div><strong>$3.3M</strong><span>Coverage Handled</span></div></div>' +
        '</div>' +
        '<div class="claims-controls"><div class="dt-search" style="max-width:300px"><i class="fa-solid fa-magnifying-glass"></i><input type="text" id="patientSearch" placeholder="Search patients..." /></div></div>' +
        '<div class="premium-patients-grid" id="patientsGrid">' +
          provPatients.map(function(p) {
            return '<div class="premium-patient-card">' +
              '<div class="pt-avatar">' + p.avatar + '</div>' +
              '<div class="pt-info">' +
                '<div class="pt-top"><strong>' + p.name + '</strong><span class="pt-status ' + p.status + '">' + p.status.charAt(0).toUpperCase() + p.status.slice(1) + '</span></div>' +
                '<span class="pt-meta"><i class="fa-solid fa-id-card"></i> ' + p.policy + ' <span class="pt-sep"></span> <i class="fa-solid fa-stethoscope"></i> ' + p.condition + '</span>' +
              '</div>' +
              '<div class="pt-stats"><div><strong>' + p.claims + '</strong><span>Claims</span></div><div><strong>' + p.coverage + '</strong><span>Coverage</span></div><div><strong>' + p.lastVisit + '</strong><span>Last Visit</span></div></div>' +
              '<a href="404.html" class="btn btn-primary btn-sm"><i class="fa-solid fa-eye"></i> View</a>' +
            '</div>';
          }).join('') +
        '</div>';
    }
    function renderProvHospitals() {
      var hActive = provHospitals.filter(function(h){ return h.status === 'active'; }).length;
      var totalBeds = provHospitals.reduce(function(s, h){ return s + h.beds; }, 0);
      return '<div class="dv-header"><span class="dv-eyebrow">Partner Network</span><h1>Hospitals Network</h1><p>Manage hospital partner status.</p></div>' +
        '<div class="hospital-summary">' +
          '<div class="hosp-sum-stat"><span class="hss-icon blue"><i class="fa-solid fa-hospital"></i></span><div><strong>' + provHospitals.length + '</strong><span>Partner Hospitals</span></div></div>' +
          '<div class="hosp-sum-stat"><span class="hss-icon green"><i class="fa-solid fa-circle-check"></i></span><div><strong>' + hActive + '</strong><span>Active</span></div></div>' +
          '<div class="hosp-sum-stat"><span class="hss-icon amber"><i class="fa-solid fa-bed"></i></span><div><strong>' + totalBeds + '</strong><span>Total Beds</span></div></div>' +
          '<div class="hosp-sum-stat"><span class="hss-icon red"><i class="fa-solid fa-star"></i></span><div><strong>4.7</strong><span>Avg. Rating</span></div></div>' +
        '</div>' +
        '<div class="premium-hospitals-grid">' +
          provHospitals.map(function(h, i) {
            return '<div class="premium-hospital-card">' +
              '<div class="ph-hero"><img src="' + h.img + '" alt="' + h.name + '" /><div class="ph-hero-overlay"></div>' +
                '<span class="ph-rating"><i class="fa-solid fa-star"></i> ' + h.rating + '</span>' +
                '<span class="ph-partner"><i class="fa-solid fa-handshake"></i> Since ' + h.partner + '</span>' +
              '</div>' +
              '<div class="ph-body">' +
                '<h3>' + h.name + '</h3>' +
                '<p class="ph-loc"><i class="fa-solid fa-location-dot"></i> ' + h.city + '</p>' +
                '<div class="ph-stats"><div><strong>' + h.beds + '</strong><span>Beds</span></div><div><strong>' + h.depts.length + '</strong><span>Departments</span></div></div>' +
                '<div class="ph-specs">' + h.depts.map(function(d){ return '<span>' + d + '</span>'; }).join('') + '</div>' +
                '<div class="ph-actions"><button class="status-toggle ' + h.status + '" data-idx="' + i + '"><i class="fa-solid ' + (h.status === 'active' ? 'fa-toggle-on' : 'fa-toggle-off') + '"></i> ' + h.status.charAt(0).toUpperCase() + h.status.slice(1) + '</button><a href="404.html" class="btn btn-ghost btn-sm"><i class="fa-solid fa-eye"></i> View</a></div>' +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>';
    }

    function renderProvApprovals() {
      var pending = provClaims.filter(function(c){ return c.status === 'pending'; });
      return '<div class="dv-header"><h1>Approvals</h1><p>Pending claims requiring your review.</p></div>' +
        '<div class="approval-grid" id="approvalGrid">' +
          (pending.length === 0 ? '<p style="color:var(--text-muted);padding:2rem;text-align:center">No pending approvals</p>' :
          pending.map(function(c, i) {
            return '<div class="approval-card" data-claim-id="' + c.id + '"><div class="ac-header"><h4>' + c.id + '</h4><span class="ac-amount">$' + c.amount.toLocaleString() + '</span></div><div class="ac-body"><div class="ac-field"><span>Patient</span><strong>' + c.patient + '</strong></div><div class="ac-field"><span>Hospital</span><strong>' + c.hospital + '</strong></div><div class="ac-field"><span>Type</span><strong>' + c.type + '</strong></div><div class="ac-field"><span>Date</span><strong>' + c.date + '</strong></div></div><div class="ac-actions"><button class="btn-approve" data-claim-id="' + c.id + '"><i class="fa-solid fa-check"></i> Approve</button><button class="btn-reject" data-claim-id="' + c.id + '"><i class="fa-solid fa-xmark"></i> Reject</button></div></div>';
          }).join('')) +
        '</div>';
    }

    function renderProvAnalytics() {
      return '<div class="dv-header"><h1>Analytics</h1><p>Performance insights and trends.</p></div>' +
        '<div class="analytics-controls"><button class="analytics-btn active" data-period="monthly">Monthly</button><button class="analytics-btn" data-period="yearly">Yearly</button></div>' +
        '<div class="charts-grid">' +
          '<div class="chart-card"><h3>Revenue Overview</h3><div class="chart-wrap"><canvas id="provAnalyticsRevenue"></canvas></div></div>' +
          '<div class="chart-card"><h3>Claim Success Rate</h3><div class="chart-wrap"><canvas id="provAnalyticsSuccess"></canvas></div></div>' +
          '<div class="chart-card" style="grid-column:span 1"><h3>Hospital Performance</h3><div class="chart-wrap"><canvas id="provAnalyticsHospital"></canvas></div></div>' +
          '<div class="chart-card"><h3>Claims by Type</h3><div class="chart-wrap"><canvas id="provAnalyticsType"></canvas></div></div>' +
        '</div>';
    }

    function renderProvNotifications() {
      return '<div class="dv-header"><h1>Notifications</h1><p>Stay updated on claims and activities.</p></div>' +
        '<div class="notif-list">' +
          provNotifs.map(function(n) {
            return '<div class="notif-item' + (n.unread ? ' unread' : '') + '"><div class="notif-icon ' + n.color + '"><i class="fa-solid ' + n.icon + '"></i></div><div class="notif-body"><strong>' + n.text + '</strong><p>' + n.sub + '</p></div><span class="notif-time">' + n.time + '</span></div>';
          }).join('') +
        '</div>';
    }

    function renderProvSettings() {
      var initials = pName.split(' ').filter(function(w){ return w.length > 1; }).map(function(w){ return w[0]; }).join('').substring(0,2).toUpperCase() || pName.charAt(0).toUpperCase();
      return '<div class="dv-header"><span class="dv-eyebrow">Account Settings</span><h1>Settings</h1><p>Manage your provider profile and practice preferences.</p></div>' +
        '<div class="settings-profile-card">' +
          '<div class="sp-avatar prov">' + initials + '</div>' +
          '<div class="sp-info"><strong>Dr. ' + pName + '</strong><span>' + pEmail + '</span><em><i class="fa-solid fa-user-doctor"></i> Provider Account</em></div>' +
          '<div class="sp-stats"><div><strong>8</strong><span>Claims Handled</span></div><div><strong>6</strong><span>Patients</span></div><div><strong>4</strong><span>Hospitals</span></div></div>' +
        '</div>' +
        '<div class="settings-grid">' +
          '<div class="settings-card premium-settings-card"><h3><i class="fa-solid fa-user-doctor"></i> Profile Information</h3>' +
            '<div class="settings-group"><label>Full Name</label><div class="setting-input"><i class="fa-solid fa-user"></i><input type="text" id="provSettingsName" value="Dr. ' + pName + '" /></div></div>' +
            '<div class="settings-group"><label>Email Address</label><div class="setting-input"><i class="fa-solid fa-envelope"></i><input type="email" id="provSettingsEmail" value="' + pEmail + '" /></div></div>' +
            '<div class="settings-group"><label>Phone Number</label><div class="setting-input"><i class="fa-solid fa-phone"></i><input type="tel" value="+1 555 000 1234" /></div></div>' +
            '<button class="btn btn-primary btn-sm" id="provSettingsSave"><i class="fa-solid fa-floppy-disk"></i> Save Changes</button>' +
          '</div>' +
          '<div class="settings-card premium-settings-card"><h3><i class="fa-solid fa-briefcase-medical"></i> Practice & Security</h3>' +
            '<div class="settings-group"><label>Clinic Name</label><div class="setting-input"><i class="fa-solid fa-building"></i><input type="text" value="City Health Clinic" /></div></div>' +
            '<div class="settings-group"><label>Specialty</label><div class="setting-input"><i class="fa-solid fa-stethoscope"></i><input type="text" value="Cardiology" /></div></div>' +
            '<div class="settings-toggle-row"><div><strong>Availability Status</strong><span>Show as accepting new patients</span></div><label class="st-switch"><input type="checkbox" checked /><span></span></label></div>' +
            '<div class="settings-toggle-row"><div><strong>Two-Factor Auth</strong><span>Add an extra layer of security</span></div><label class="st-switch"><input type="checkbox" checked /><span></span></label></div>' +
            '<a href="404.html" class="btn btn-secondary btn-sm"><i class="fa-solid fa-key"></i> Update Password</a>' +
          '</div>' +
        '</div>';
    }

    function initProvCharts() {
      if (typeof Chart === 'undefined') return;
      Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
      Chart.defaults.font.size = 12;

      var lineEl = document.getElementById('provChartLine');
      if (lineEl) pCharts.push(new Chart(lineEl, { type: 'line', data: { labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul'], datasets: [{ label: 'Claims', data: [12,18,15,22,19,28,24], borderColor: '#2563EB', backgroundColor: 'rgba(37,99,235,0.08)', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#2563EB' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } }, x: { grid: { display: false } } } } }));

      var barEl = document.getElementById('provChartBar');
      if (barEl) pCharts.push(new Chart(barEl, { type: 'bar', data: { labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul'], datasets: [{ label: 'Approved', data: [8,12,10,16,14,20,18], backgroundColor: '#22C55E', borderRadius: 6 }, { label: 'Rejected', data: [4,6,5,6,5,8,6], backgroundColor: '#EF4444', borderRadius: 6 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } }, x: { grid: { display: false } } } } }));

      var doughEl = document.getElementById('provChartDoughnut');
      if (doughEl) pCharts.push(new Chart(doughEl, { type: 'doughnut', data: { labels: ['Hospitalization','Prescription','Dental','Eye Care','Lab Tests','Surgery'], datasets: [{ data: [25,20,15,10,18,12], backgroundColor: ['#2563EB','#3B82F6','#22C55E','#F59E0B','#06B6D4','#8B5CF6'], borderWidth: 0, borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true, pointStyleWidth: 8, font: { size: 11 } } } } } }));
    }

    function initAnalyticsCharts() {
      if (typeof Chart === 'undefined') return;
      var revEl = document.getElementById('provAnalyticsRevenue');
      if (revEl) pCharts.push(new Chart(revEl, { type: 'line', data: { labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul'], datasets: [{ label: 'Revenue ($K)', data: [45,52,48,61,58,72,68], borderColor: '#22C55E', backgroundColor: 'rgba(34,197,94,0.08)', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#22C55E' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } }, x: { grid: { display: false } } } } }));

      var succEl = document.getElementById('provAnalyticsSuccess');
      if (succEl) pCharts.push(new Chart(succEl, { type: 'doughnut', data: { labels: ['Approved','Pending','Rejected'], datasets: [{ data: [68,22,10], backgroundColor: ['#22C55E','#F59E0B','#EF4444'], borderWidth: 0, borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } } } } }));

      var hospEl = document.getElementById('provAnalyticsHospital');
      if (hospEl) pCharts.push(new Chart(hospEl, { type: 'bar', data: { labels: ['Metro General','St. Mary\'s','City Health','Wellness Care'], datasets: [{ label: 'Claims', data: [32,28,24,18], backgroundColor: ['#2563EB','#3B82F6','#60A5FA','#93C5FD'], borderRadius: 8 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } }, x: { grid: { display: false } } } } }));

      var typeEl = document.getElementById('provAnalyticsType');
      if (typeEl) pCharts.push(new Chart(typeEl, { type: 'bar', data: { labels: ['Hospitalization','Surgery','Lab Tests','Prescription','Dental','Eye Care'], datasets: [{ label: 'Amount ($K)', data: [42,25,18,12,8,5], backgroundColor: ['#2563EB','#8B5CF6','#06B6D4','#3B82F6','#22C55E','#F59E0B'], borderRadius: 8 }] }, options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } }, y: { grid: { display: false } } } } }));
    }

    function updatePendingBadge() {
      var count = provClaims.filter(function(c){ return c.status === 'pending'; }).length;
      var badge = document.getElementById('pendingBadge');
      if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'grid' : 'none'; }
    }

    function handleClaimAction(claimId, action) {
      var claim = provClaims.find(function(c){ return c.id === claimId; });
      if (claim) { claim.status = action; updatePendingBadge(); }
    }

    function pNavigateTo(view) {
      pDestroyCharts();
      pNavLinks.forEach(function(l) { l.classList.toggle('active', l.getAttribute('data-view') === view); });
      pContent.style.animation = 'none'; pContent.offsetHeight; pContent.style.animation = 'dashFadeIn 0.4s ease both';

      switch (view) {
        case 'overview': pContent.innerHTML = renderProvOverview(); pAnimateCounters(); setTimeout(initProvCharts, 100); break;
        case 'claims':
          pContent.innerHTML = renderProvClaims();
          pContent.querySelectorAll('.pc-approve').forEach(function(b){ b.addEventListener('click', function(){ handleClaimAction(this.getAttribute('data-idx'), 'approved'); pNavigateTo('claims'); }); });
          pContent.querySelectorAll('.pc-reject').forEach(function(b){ b.addEventListener('click', function(){ handleClaimAction(this.getAttribute('data-idx'), 'rejected'); pNavigateTo('claims'); }); });
          var filter = document.getElementById('provClaimFilter');
          if (filter) filter.addEventListener('change', function() {
            var val = this.value;
            pContent.querySelectorAll('.premium-prov-claim-card').forEach(function(card) {
              var idx = card.getAttribute('data-idx');
              card.style.display = (val === 'all' || provClaims[idx].status === val) ? '' : 'none';
            });
          });
          break;
        case 'patients':
          pContent.innerHTML = renderProvPatients();
          var pSearch = document.getElementById('patientSearch');
          if (pSearch) pSearch.addEventListener('input', function() {
            var q = this.value.toLowerCase();
            pContent.querySelectorAll('.premium-patient-card').forEach(function(card) {
              card.style.display = card.textContent.toLowerCase().includes(q) ? '' : 'none';
            });
          });
          break;
        case 'hospitals':
          pContent.innerHTML = renderProvHospitals();
          pContent.querySelectorAll('.status-toggle').forEach(function(btn) {
            btn.addEventListener('click', function() {
              var idx = parseInt(this.getAttribute('data-idx'));
              provHospitals[idx].status = provHospitals[idx].status === 'active' ? 'inactive' : 'active';
              pNavigateTo('hospitals');
            });
          });
          break;
        case 'approvals':
          pContent.innerHTML = renderProvApprovals();
          pContent.querySelectorAll('.btn-approve').forEach(function(b){ b.addEventListener('click', function(){ var card = this.closest('.approval-card'); card.classList.add('removing'); setTimeout(function(){ handleClaimAction(card.getAttribute('data-claim-id'), 'approved'); pNavigateTo('approvals'); }, 400); }); });
          pContent.querySelectorAll('.btn-reject').forEach(function(b){ b.addEventListener('click', function(){ var card = this.closest('.approval-card'); card.classList.add('removing'); setTimeout(function(){ handleClaimAction(card.getAttribute('data-claim-id'), 'rejected'); pNavigateTo('approvals'); }, 400); }); });
          break;
        case 'analytics': pContent.innerHTML = renderProvAnalytics(); setTimeout(initAnalyticsCharts, 100); pContent.querySelectorAll('.analytics-btn').forEach(function(b){ b.addEventListener('click', function(){ pContent.querySelectorAll('.analytics-btn').forEach(function(x){ x.classList.remove('active'); }); this.classList.add('active'); }); }); break;
        case 'notifications': pContent.innerHTML = renderProvNotifications(); break;
        case 'settings':
          pContent.innerHTML = renderProvSettings();
          var saveBtn = document.getElementById('provSettingsSave');
          if (saveBtn) saveBtn.addEventListener('click', function() {
            var n = document.getElementById('provSettingsName').value;
            var e = document.getElementById('provSettingsEmail').value;
            provUser.name = n.replace(/^Dr\.\s*/, ''); provUser.email = e;
            localStorage.setItem('stacklyUser', JSON.stringify(provUser));
            if (pNameEl) pNameEl.textContent = n;
            if (pAvatarEl) pAvatarEl.textContent = n.split(' ').filter(function(w){return w.length>1;}).map(function(w){return w[0];}).join('').substring(0,2).toUpperCase();
            saveBtn.textContent = 'Saved!'; setTimeout(function(){ saveBtn.textContent = 'Save Changes'; }, 2000);
          });
          break;
        case 'logout': localStorage.removeItem('stacklyUser'); window.location.href = 'login.html'; break;
      }
      pCloseSidebar();
    }

    pNavLinks.forEach(function(link) {
      link.addEventListener('click', function(e) { e.preventDefault(); pNavigateTo(this.getAttribute('data-view')); });
    });
    var pLogoutBtn = document.getElementById('sidebarLogout');
    if (pLogoutBtn) pLogoutBtn.addEventListener('click', function(e) { e.preventDefault(); pNavigateTo('logout'); });

    updatePendingBadge();
    pNavigateTo('overview');
  }
})();
