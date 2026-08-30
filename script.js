(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const boot = $('#boot');
  const nav = $('#nav');
  const title = $('#novaTitle');
  const percent = $('#bootPercent');

  function finishBoot() {
    if (!boot) return;
    boot.classList.add('hide');
    nav?.classList.add('show');
    title?.classList.add('ready');
    window.setTimeout(() => { boot.style.display = 'none'; }, reduced ? 0 : 1150);
  }

  if (reduced || !boot) {
    if (percent) percent.innerHTML = '100<span>%</span>';
    title?.classList.add('ready');
    nav?.classList.add('show');
    if (boot) boot.style.display = 'none';
  } else {
    const lines = ['#boot1', '#boot2', '#boot3', '#boot4'].map($);
    let delay = 180;
    lines.forEach(line => {
      window.setTimeout(() => line?.classList.add('show'), delay);
      delay += 330;
    });
    const duration = 1500;
    const start = performance.now();
    function progress(now) {
      const value = Math.min(1, (now - start) / duration);
      if (percent) percent.innerHTML = `${Math.round(value * 100)}<span>%</span>`;
      if (value < 1) requestAnimationFrame(progress);
    }
    requestAnimationFrame(progress);
    window.setTimeout(finishBoot, duration + 300);
  }

  const cursor = $('#cursor');
  const cursorLabel = $('#cursorLabel');
  if (cursor && !coarse) {
    let x = innerWidth / 2;
    let y = innerHeight / 2;
    let cx = x;
    let cy = y;
    addEventListener('mousemove', event => {
      x = event.clientX;
      y = event.clientY;
    }, { passive: true });
    function cursorLoop() {
      cx += (x - cx) * 0.2;
      cy += (y - cy) * 0.2;
      cursor.style.left = `${cx}px`;
      cursor.style.top = `${cy}px`;
      requestAnimationFrame(cursorLoop);
    }
    cursorLoop();

    $$('[data-cursor], a, button').forEach(element => {
      element.addEventListener('mouseenter', () => {
        cursor.classList.add('active');
        if (cursorLabel) cursorLabel.textContent = element.dataset.cursor || (element.target === '_blank' ? 'OPEN' : 'VIEW');
      });
      element.addEventListener('mouseleave', () => {
        cursor.classList.remove('active');
        if (cursorLabel) cursorLabel.textContent = '';
      });
    });
  }

  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('in'));
  }

  const hud = $$('#hud button');
  hud.forEach(button => button.addEventListener('click', () => {
    const target = $(button.dataset.target);
    target?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }));
  const hudTargets = hud.map(button => $(button.dataset.target)).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const hudObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const index = hudTargets.indexOf(entry.target);
        hud.forEach(item => item.classList.remove('active'));
        hud[index]?.classList.add('active');
      });
    }, { threshold: 0.3, rootMargin: '-15% 0px -15% 0px' });
    hudTargets.forEach(target => hudObserver.observe(target));
  }

  const themePairs = [
    ['#work-blvnd', 'blvnd'],
    ['#work-nyx', 'nyx']
  ];
  if ('IntersectionObserver' in window) {
    const themeObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const pair = themePairs.find(([selector]) => $(selector) === entry.target);
        if (pair) document.body.dataset.theme = pair[1];
      });
    }, { threshold: 0.28 });
    themePairs.forEach(([selector]) => {
      const element = $(selector);
      if (element) themeObserver.observe(element);
    });
    ['hero', 'recognition', 'about', 'contact'].forEach(id => {
      const element = document.getElementById(id);
      if (!element) return;
      const reset = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) delete document.body.dataset.theme;
      }, { threshold: 0.5 });
      reset.observe(element);
    });
  }

  if (!coarse && !reduced) {
    $$('.button').forEach(button => {
      button.addEventListener('mousemove', event => {
        const rect = button.getBoundingClientRect();
        const dx = event.clientX - rect.left - rect.width / 2;
        const dy = event.clientY - rect.top - rect.height / 2;
        button.style.transform = `translate(${dx * 0.18}px, ${dy * 0.24}px)`;
      });
      button.addEventListener('mouseleave', () => { button.style.transform = ''; });
    });

    const portrait = $('[data-parallax]');
    portrait?.addEventListener('mousemove', event => {
      const rect = portrait.getBoundingClientRect();
      const px = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
      const py = ((event.clientY - rect.top) / rect.height - 0.5) * 10;
      portrait.style.transform = `translate(${px}px, ${py}px)`;
    });
    portrait?.addEventListener('mouseleave', () => { portrait.style.transform = ''; });
  }

  // NYX WEB PET. The same interaction language will later map to the physical NYX robot.
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
    let holdStarted = false;
    let lastMove = 0;

    const moods = {
      curious: { label: 'CURIOUS', prompt: 'NYX IS WATCHING YOU' },
      happy: { label: 'HAPPY', prompt: 'GOOD HUMAN' },
      disturbed: { label: 'DISTURBED', prompt: 'HEY. STOP THAT.' },
      sleepy: { label: 'SLEEPY', prompt: 'NYX IS GETTING TIRED' }
    };

    function setMood(name) {
      Object.keys(moods).forEach(key => pet.classList.toggle(key, key === name));
      if (state) state.textContent = moods[name].label;
      if (prompt) prompt.textContent = moods[name].prompt;
    }

    function setEyes(clientX, clientY) {
      const rect = pet.getBoundingClientRect();
      const nx = (clientX - rect.left) / rect.width;
      const ny = (clientY - rect.top) / rect.height;
      const dx = Math.max(-1, Math.min(1, (nx - 0.5) * 2));
      const dy = Math.max(-1, Math.min(1, (ny - 0.5) * 2));
      eyes.forEach(eye => {
        eye.style.transform = `translate(calc(-50% + ${dx * 12}px), calc(-50% + ${dy * 15}px))`;
      });
      if (attention) attention.textContent = 'TRACKING';
    }

    function spawnSpark(clientX, clientY) {
      if (!sparks) return;
      const rect = pet.getBoundingClientRect();
      const spark = document.createElement('i');
      spark.className = 'spark';
      spark.style.left = `${clientX - rect.left}px`;
      spark.style.top = `${clientY - rect.top}px`;
      spark.style.setProperty('--dx', `${(Math.random() - 0.5) * 90}px`);
      spark.style.setProperty('--dy', `${(Math.random() - 0.5) * 70}px`);
      sparks.appendChild(spark);
      window.setTimeout(() => spark.remove(), 750);
    }

    function interact(mood, event) {
      count += 1;
      if (interaction) interaction.textContent = String(count).padStart(2, '0');
      setMood(mood);
      spawnSpark(event.clientX, event.clientY);
      if (pet.animate && mood === 'disturbed') pet.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.025)' }, { transform: 'scale(1)' }], { duration: 280, iterations: 2 });
    }

    pet.addEventListener('pointermove', event => {
      const now = performance.now();
      if (now - lastMove < 28) return;
      lastMove = now;
      setEyes(event.clientX, event.clientY);
      if (!holdStarted) setMood('curious');
    });

    pet.addEventListener('pointerenter', () => {
      if (attention) attention.textContent = 'LOCKED';
      setMood('curious');
    });

    pet.addEventListener('pointerleave', () => {
      eyes.forEach(eye => { eye.style.transform = 'translate(-50%,-50%)'; });
      if (attention) attention.textContent = 'IDLE';
      if (!holdStarted) setMood('sleepy');
    });

    pet.addEventListener('pointerdown', event => {
      holdStarted = false;
      interact('happy', event);
      holdTimer = window.setTimeout(() => {
        holdStarted = true;
        interact('disturbed', event);
      }, 650);
    });

    pet.addEventListener('pointerup', () => {
      if (holdTimer) window.clearTimeout(holdTimer);
      if (holdStarted) window.setTimeout(() => setMood('curious'), 900);
    });

    pet.addEventListener('pointercancel', () => {
      if (holdTimer) window.clearTimeout(holdTimer);
    });

    pet.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        const rect = pet.getBoundingClientRect();
        interact('happy', { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 });
      }
    });

    setMood('curious');
  }

  const frame = $('.live-preview iframe');
  const fallback = $('.preview-fallback');
  if (frame && fallback) {
    frame.addEventListener('error', () => { fallback.style.display = 'flex'; });
    window.setTimeout(() => {
      try {
        if (!frame.contentDocument || frame.contentDocument.body?.children.length === 0) fallback.style.display = 'flex';
      } catch (_) {
        // Cross-origin content is expected. Leave the live frame visible.
      }
    }, 5000);
  }

  addEventListener('keydown', event => {
    if (event.key === 'Escape') document.activeElement?.blur();
  });
})();