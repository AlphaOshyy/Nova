(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const boot = document.getElementById('boot');
  const nav = document.getElementById('nav');
  const title = document.getElementById('novaTitle');
  const pct = document.getElementById('pct');

  function finishBoot() {
    if (!boot) return;
    boot.classList.add('hide');
    nav?.classList.add('show');
    title?.classList.add('reveal-letters');
    window.setTimeout(() => { boot.style.display = 'none'; }, 1150);
  }

  if (reduced) {
    document.querySelectorAll('.line').forEach(el => el.classList.add('show'));
    if (pct) pct.innerHTML = '100<span>%</span>';
    finishBoot();
  } else if (boot) {
    const lines = ['l1', 'l2', 'l3', 'l4'].map(id => document.getElementById(id));
    const oks = [null, document.getElementById('o2'), document.getElementById('o3'), null];
    let delay = 220;
    lines.forEach((line, i) => {
      window.setTimeout(() => {
        line?.classList.add('show');
        if (oks[i]) window.setTimeout(() => { oks[i].style.display = 'inline'; }, 260);
      }, delay);
      delay += 340;
    });
    const duration = 1650;
    const start = performance.now();
    function progress(now) {
      const p = Math.min(1, (now - start) / duration);
      if (pct) pct.innerHTML = `${Math.round(p * 100)}<span>%</span>`;
      if (p < 1) requestAnimationFrame(progress);
    }
    requestAnimationFrame(progress);
    window.setTimeout(finishBoot, duration + 300);
  }

  const cursor = document.getElementById('cur');
  const cursorLabel = document.getElementById('curLabel');
  if (cursor && !window.matchMedia('(pointer: coarse)').matches) {
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; }, { passive: true });
    function cursorLoop() {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      cursor.style.left = `${cx}px`;
      cursor.style.top = `${cy}px`;
      requestAnimationFrame(cursorLoop);
    }
    cursorLoop();
    document.querySelectorAll('[data-hover], a, .btn').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('ring');
        if (cursorLabel) cursorLabel.textContent = el.target === '_blank' ? 'OPEN' : 'VIEW';
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('ring');
        if (cursorLabel) cursorLabel.textContent = '';
      });
    });
  }

  const reveals = document.querySelectorAll('.reveal, .reveal-stagger');
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  reveals.forEach(el => revealObserver.observe(el));

  const hudRows = [...document.querySelectorAll('#hud .dot-row')];
  hudRows.forEach(row => row.addEventListener('click', () => {
    document.querySelector(row.dataset.target)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }));
  const hudTargets = hudRows.map(row => document.querySelector(row.dataset.target)).filter(Boolean);
  const hudObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const index = hudTargets.indexOf(entry.target);
      hudRows.forEach(row => row.classList.remove('active'));
      if (hudRows[index]) hudRows[index].classList.add('active');
    });
  }, { threshold: 0.35, rootMargin: '-12% 0px -12% 0px' });
  hudTargets.forEach(target => hudObserver.observe(target));

  const blvnd = document.getElementById('work-blvnd');
  const nyx = document.getElementById('work-nyx');
  const themeObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      document.body.setAttribute('data-theme', entry.target === blvnd ? 'blvnd' : 'nyx');
    });
  }, { threshold: 0.3 });
  if (blvnd) themeObserver.observe(blvnd);
  if (nyx) themeObserver.observe(nyx);

  const resetObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) document.body.removeAttribute('data-theme');
    });
  }, { threshold: 0.5 });
  ['hero', 'about', 'resume', 'contact'].forEach(id => {
    const el = document.getElementById(id);
    if (el) resetObserver.observe(el);
  });

  if (!reduced && !window.matchMedia('(pointer: coarse)').matches) {
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - r.left - r.width / 2;
        const dy = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${dx * 0.2}px, ${dy * 0.25}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });

    const portrait = document.querySelector('[data-parallax]');
    portrait?.addEventListener('mousemove', e => {
      const r = portrait.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width - 0.5) * 10;
      const py = ((e.clientY - r.top) / r.height - 0.5) * 10;
      portrait.style.transform = `translate(${px}px, ${py}px)`;
    });
    portrait?.addEventListener('mouseleave', () => { portrait.style.transform = ''; });
  }

  const liveFrame = document.querySelector('.site-frame iframe');
  const fallback = document.querySelector('.frame-fallback');
  liveFrame?.addEventListener('error', () => { if (fallback) fallback.style.display = 'flex'; });

  addEventListener('keydown', e => {
    if (e.key === 'Escape') document.activeElement?.blur();
  });
})();