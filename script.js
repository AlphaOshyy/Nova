(() => {
  'use strict';

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  /* BOOT LOADER, deliberately self contained so the page never remains blocked. */
  const boot = $('#boot');
  const percent = $('#bootPercent');
  const nav = $('#nav');
  const title = $('#novaTitle');

  function showSite() {
    if (percent) percent.innerHTML = '100<span>%</span>';
    if (boot) {
      boot.classList.add('hide');
      window.setTimeout(() => {
        boot.style.display = 'none';
        boot.setAttribute('aria-hidden', 'true');
      }, reduced ? 0 : 1150);
    }
    if (nav) nav.classList.add('show');
    if (title) title.classList.add('ready');
  }

  if (boot) {
    ['#boot1', '#boot2', '#boot3', '#boot4'].forEach((selector, index) => {
      const line = $(selector);
      if (line) window.setTimeout(() => line.classList.add('show'), 120 + index * 260);
    });

    if (reduced) {
      showSite();
    } else {
      const duration = 1400;
      const started = performance.now();
      const progress = now => {
        const value = Math.min(1, (now - started) / duration);
        if (percent) percent.innerHTML = `${Math.round(value * 100)}<span>%</span>`;
        if (value < 1) window.requestAnimationFrame(progress);
      };
      window.requestAnimationFrame(progress);
      window.setTimeout(showSite, duration + 250);
    }
  } else {
    nav?.classList.add('show');
    title?.classList.add('ready');
  }

  /* Safety watchdog. Even if another interaction throws later, boot is never permanent. */
  window.setTimeout(showSite, 2800);

  /* CUSTOM CURSOR */
  const cursor = $('#cursor');
  const cursorLabel = $('#cursorLabel');
  if (cursor && !coarse) {
    let x = innerWidth / 2;
    let y = innerHeight / 2;
    let cx = x;
    let cy = y;
    window.addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; }, { passive: true });
    const loop = () => {
      cx += (x - cx) * 0.2;
      cy += (y - cy) * 0.2;
      cursor.style.left = `${cx}px`;
      cursor.style.top = `${cy}px`;
      window.requestAnimationFrame(loop);
    };
    loop();
    $$('[data-cursor], a, button').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('active');
        if (cursorLabel) cursorLabel.textContent = el.dataset.cursor || (el.target === '_blank' ? 'OPEN' : 'VIEW');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('active');
        if (cursorLabel) cursorLabel.textContent = '';
      });
    });
  }

  /* SCROLL REVEALS */
  const revealItems = $$('.reveal');
  if (!reduced && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
    revealItems.forEach(el => observer.observe(el));
  } else {
    revealItems.forEach(el => el.classList.add('in'));
  }

  /* HUD */
  const hud = $$('#hud button');
  hud.forEach(button => button.addEventListener('click', () => {
    const target = $(button.dataset.target);
    if (target) target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }));
  const hudTargets = hud.map(button => $(button.dataset.target)).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const hudObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const index = hudTargets.indexOf(entry.target);
        hud.forEach(item => item.classList.remove('active'));
        if (hud[index]) hud[index].classList.add('active');
      });
    }, { threshold: 0.25, rootMargin: '-15% 0px -15% 0px' });
    hudTargets.forEach(el => hudObserver.observe(el));
  }

  /* PROJECT BACKDROP */
  if ('IntersectionObserver' in window) {
    const themes = [
      ['#work-blvnd', 'blvnd'],
      ['#work-nyx', 'nyx']
    ];
    const themeObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const match = themes.find(item => $(item[0]) === entry.target);
        if (match) document.body.dataset.theme = match[1];
      });
    }, { threshold: 0.3 });
    themes.forEach(item => {
      const el = $(item[0]);
      if (el) themeObserver.observe(el);
    });
    ['hero', 'recognition', 'about', 'contact'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const resetObserver = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) delete document.body.dataset.theme;
      }, { threshold: 0.5 });
      resetObserver.observe(el);
    });
  }

  /* MAGNETIC BUTTONS AND HERO FRAME */
  if (!coarse && !reduced) {
    $$('.button').forEach(button => {
      button.addEventListener('mousemove', e => {
        const r = button.getBoundingClientRect();
        const dx = e.clientX - r.left - r.width / 2;
        const dy = e.clientY - r.top - r.height / 2;
        button.style.transform = `translate(${dx * 0.16}px, ${dy * 0.2}px)`;
      });
      button.addEventListener('mouseleave', () => { button.style.transform = ''; });
    });

    const frame = $('.hero-frame');
    frame?.addEventListener('mousemove', e => {
      const r = frame.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width - 0.5) * 10;
      const py = ((e.clientY - r.top) / r.height - 0.5) * 10;
      frame.style.transform = `translate(${px}px, ${py}px)`;
    });
    frame?.addEventListener('mouseleave', () => { frame.style.transform = ''; });
  }

  /* NYX INTERACTIVE WEB PET */
  const pet = $('#nyxPet');
  if (pet) {
    const eyes = $$('.eye i', pet);
    const state = $('#nyxState');
    const attention = $('#nyxAttention');
    const interaction = $('#nyxInteraction');
    const prompt = $('#petPrompt');
    const sparks = $('#petSparks');
    let count = 0;
    let holdTimer = null;
    let held = false;
    let lastMove = 0;

    const moods = {
      curious: ['CURIOUS', 'NYX IS WATCHING YOU'],
      happy: ['HAPPY', 'GOOD HUMAN'],
      disturbed: ['DISTURBED', 'HEY. STOP THAT.'],
      sleepy: ['SLEEPY', 'NYX IS GETTING TIRED']
    };

    function mood(name) {
      Object.keys(moods).forEach(key => pet.classList.toggle(key, key === name));
      if (state) state.textContent = moods[name][0];
      if (prompt) prompt.textContent = moods[name][1];
    }

    function track(x, y) {
      const r = pet.getBoundingClientRect();
      const dx = Math.max(-1, Math.min(1, ((x - r.left) / r.width - 0.5) * 2));
      const dy = Math.max(-1, Math.min(1, ((y - r.top) / r.height - 0.5) * 2));
      eyes.forEach(eye => {
        eye.style.transform = `translate(calc(-50% + ${dx * 12}px), calc(-50% + ${dy * 15}px))`;
      });
      if (attention) attention.textContent = 'TRACKING';
    }

    function spark(x, y) {
      if (!sparks) return;
      const r = pet.getBoundingClientRect();
      const el = document.createElement('i');
      el.className = 'spark';
      el.style.left = `${x - r.left}px`;
      el.style.top = `${y - r.top}px`;
      el.style.setProperty('--dx', `${(Math.random() - 0.5) * 90}px`);
      el.style.setProperty('--dy', `${(Math.random() - 0.5) * 70}px`);
      sparks.appendChild(el);
      window.setTimeout(() => el.remove(), 750);
    }

    function interact(name, x, y) {
      count += 1;
      if (interaction) interaction.textContent = String(count).padStart(2, '0');
      mood(name);
      spark(x, y);
    }

    pet.addEventListener('pointermove', e => {
      const now = performance.now();
      if (now - lastMove < 30) return;
      lastMove = now;
      track(e.clientX, e.clientY);
      if (!held) mood('curious');
    });

    pet.addEventListener('pointerenter', () => mood('curious'));
    pet.addEventListener('pointerleave', () => {
      eyes.forEach(eye => { eye.style.transform = 'translate(-50%, -50%)'; });
      if (attention) attention.textContent = 'IDLE';
      if (!held) mood('sleepy');
    });

    pet.addEventListener('pointerdown', e => {
      held = false;
      interact('happy', e.clientX, e.clientY);
      holdTimer = window.setTimeout(() => {
        held = true;
        interact('disturbed', e.clientX, e.clientY);
      }, 650);
    });

    const release = () => {
      if (holdTimer) window.clearTimeout(holdTimer);
      if (held) window.setTimeout(() => mood('curious'), 850);
    };
    pet.addEventListener('pointerup', release);
    pet.addEventListener('pointercancel', release);

    pet.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      const r = pet.getBoundingClientRect();
      interact('happy', r.left + r.width / 2, r.top + r.height / 2);
    });

    mood('curious');
  }

  /* LIVE BLVND PREVIEW. Cross origin is expected, so do not inspect contentDocument. */
  const liveFrame = $('.live-preview iframe');
  const liveFallback = $('.preview-fallback');
  if (liveFrame && liveFallback) {
    liveFrame.addEventListener('error', () => { liveFallback.style.display = 'flex'; });
  }

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') document.activeElement?.blur();
  });
})();