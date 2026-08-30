(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia?.('(pointer: coarse)').matches;

  const boot = $('#boot'), percent = $('#bootPercent'), nav = $('#nav'), title = $('#novaTitle');
  let bootReleased = false;
  function showSite() {
    if (bootReleased) return;
    bootReleased = true;
    if (percent) percent.innerHTML = '100<span>%</span>';
    boot?.classList.add('hide'); nav?.classList.add('show'); title?.classList.add('ready');
    window.setTimeout(() => { if (boot) { boot.style.display = 'none'; boot.setAttribute('aria-hidden','true'); } }, reduced ? 0 : 1150);
  }
  ['#boot1','#boot2','#boot3','#boot4'].forEach((s,i) => { const el=$(s); if(el) setTimeout(()=>el.classList.add('show'),120+i*220); });
  if (reduced) showSite();
  else {
    const duration = 1250, start = performance.now();
    const tick = now => { const v=Math.min(1,(now-start)/duration); if(percent) percent.innerHTML=`${Math.round(v*100)}<span>%</span>`; if(v<1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick); setTimeout(showSite,1500);
  }
  setTimeout(showSite,2800);

  const cursor=$('#cursor'), trail=$('#cursorTrail'), label=$('#cursorLabel');
  if(cursor && !coarse) {
    let x=innerWidth/2,y=innerHeight/2,cx=x,cy=y,tx=x,ty=y;
    addEventListener('mousemove',e=>{x=e.clientX;y=e.clientY;},{passive:true});
    const loop=()=>{cx+=(x-cx)*.2;cy+=(y-cy)*.2;tx+=(x-tx)*.08;ty+=(y-ty)*.08;cursor.style.left=`${cx}px`;cursor.style.top=`${cy}px`;if(trail){trail.style.left=`${tx}px`;trail.style.top=`${ty}px`;}requestAnimationFrame(loop)};loop();
    $$('[data-cursor],a,button').forEach(el=>{el.addEventListener('mouseenter',()=>{cursor.classList.add('active');if(label)label.textContent=el.dataset.cursor||'VIEW'});el.addEventListener('mouseleave',()=>{cursor.classList.remove('active');if(label)label.textContent=''})});
  }

  const revealItems=$$('.reveal');
  if(!reduced && 'IntersectionObserver' in window){const ob=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');ob.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -4% 0px'});revealItems.forEach(el=>ob.observe(el));}else revealItems.forEach(el=>el.classList.add('in'));

  const hud=$$('#hud button');
  hud.forEach(b=>b.addEventListener('click',()=>{const t=$(b.dataset.target);t?.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'})}));
  const targets=hud.map(b=>$(b.dataset.target)).filter(Boolean);
  if('IntersectionObserver' in window){const ob=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const i=targets.indexOf(e.target);hud.forEach(b=>b.classList.remove('active'));hud[i]?.classList.add('active')}}),{threshold:.25,rootMargin:'-15% 0px -15% 0px'});targets.forEach(t=>ob.observe(t));}

  if('IntersectionObserver' in window){
    const themes=[['#work-blvnd','blvnd'],['#work-nyx','nyx']];
    const ob=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const m=themes.find(a=>$(a[0])===e.target);if(m)document.body.dataset.theme=m[1]}}),{threshold:.3});
    themes.forEach(a=>$(a[0])&&ob.observe($(a[0])));
    ['hero','about','contact'].forEach(id=>{const el=$('#'+id);if(!el)return;const reset=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting))delete document.body.dataset.theme},{threshold:.5});reset.observe(el)});
  }

  if(!coarse&&!reduced){
    $$('.button').forEach(b=>{b.addEventListener('mousemove',e=>{const r=b.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2;b.style.transform=`translate(${dx*.16}px,${dy*.2}px)`});b.addEventListener('mouseleave',()=>b.style.transform='')});
    const frame=$('#heroFrame');frame?.addEventListener('mousemove',e=>{const r=frame.getBoundingClientRect(),px=((e.clientX-r.left)/r.width-.5)*10,py=((e.clientY-r.top)/r.height-.5)*10;frame.style.transform=`translate(${px}px,${py}px)`});frame?.addEventListener('mouseleave',()=>frame.style.transform='');
  }

  /* NOVA's signature interaction: the visitor teaches the digital NYX how to react. */
  const pet=$('#nyxPet');
  if(pet){
    const eyes=$$('.eye i',pet), state=$('#nyxState'), attention=$('#nyxAttention'), interaction=$('#nyxInteraction'), prompt=$('#petPrompt'), sparks=$('#petSparks'), ring=$('#petTouchRing');
    let count=0,holdTimer=null,held=false,idleTimer=null,lastMove=0;
    const moods={curious:['CURIOUS','NYX IS WATCHING YOU'],happy:['HAPPY','GOOD HUMAN'],disturbed:['DISTURBED','HEY. STOP THAT.'],sleepy:['SLEEPY','NYX WENT QUIET']};
    const mood=name=>{Object.keys(moods).forEach(k=>pet.classList.toggle(k,k===name));if(state)state.textContent=moods[name][0];if(prompt)prompt.textContent=moods[name][1]};
    const idle=()=>{clearTimeout(idleTimer);idleTimer=setTimeout(()=>mood('sleepy'),4200)};
    const track=(x,y)=>{const r=pet.getBoundingClientRect(),dx=Math.max(-1,Math.min(1,((x-r.left)/r.width-.5)*2)),dy=Math.max(-1,Math.min(1,((y-r.top)/r.height-.5)*2));eyes.forEach(eye=>eye.style.transform=`translate(calc(-50% + ${dx*12}px),calc(-50% + ${dy*15}px))`);if(attention)attention.textContent='TRACKING';idle()};
    const spark=(x,y)=>{if(!sparks)return;const r=pet.getBoundingClientRect(),el=document.createElement('i');el.className='spark';el.style.left=`${x-r.left}px`;el.style.top=`${y-r.top}px`;el.style.setProperty('--dx',`${(Math.random()-.5)*90}px`);el.style.setProperty('--dy',`${(Math.random()-.5)*70}px`);sparks.appendChild(el);setTimeout(()=>el.remove(),750)};
    const pulse=(x,y)=>{if(!ring)return;const r=pet.getBoundingClientRect();ring.style.left=`${x-r.left}px`;ring.style.top=`${y-r.top}px`;ring.classList.remove('pulse');void ring.offsetWidth;ring.classList.add('pulse')};
    const interact=(name,x,y)=>{count++;if(interaction)interaction.textContent=String(count).padStart(2,'0');mood(name);spark(x,y);pulse(x,y);idle()};
    pet.addEventListener('pointermove',e=>{const now=performance.now();if(now-lastMove<28)return;lastMove=now;track(e.clientX,e.clientY);if(!held)mood('curious')});
    pet.addEventListener('pointerenter',()=>{mood('curious');if(attention)attention.textContent='LOCKED';idle()});
    pet.addEventListener('pointerleave',()=>{eyes.forEach(e=>e.style.transform='translate(-50%,-50%)');if(attention)attention.textContent='IDLE';if(!held)mood('sleepy');clearTimeout(idleTimer)});
    pet.addEventListener('pointerdown',e=>{held=false;interact('happy',e.clientX,e.clientY);clearTimeout(holdTimer);holdTimer=setTimeout(()=>{held=true;interact('disturbed',e.clientX,e.clientY)},650)});
    const release=()=>{clearTimeout(holdTimer);if(held)setTimeout(()=>mood('curious'),850);held=false};pet.addEventListener('pointerup',release);pet.addEventListener('pointercancel',release);
    pet.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;e.preventDefault();const r=pet.getBoundingClientRect();interact('happy',r.left+r.width/2,r.top+r.height/2)});
    mood('curious');
  }

  const liveFrame=$('.live-preview iframe'), fallback=$('.preview-fallback');
  if(liveFrame&&fallback) liveFrame.addEventListener('error',()=>fallback.style.display='flex');

  /* Session identity and live clock. */
  const sid=$('#sessionId'), clock=$('#systemTime');
  if(sid){const key='NOVA_SESSION';let value=sessionStorage.getItem(key);if(!value){value='NOVA-'+Math.floor(1000+Math.random()*9000);sessionStorage.setItem(key,value)}sid.textContent=value}
  const updateClock=()=>{if(clock)clock.textContent=new Date().toLocaleTimeString('en-GB',{hour12:false})};updateClock();setInterval(updateClock,1000);

  /* Subtle scroll velocity changes the system status. */
  const sys=$('#systemState');let lastY=scrollY,lastT=performance.now();addEventListener('scroll',()=>{const now=performance.now(),speed=Math.abs(scrollY-lastY)/(now-lastT);if(sys)sys.textContent=speed>.7?'MOVING':'ONLINE';lastY=scrollY;lastT=now},{passive:true});
  addEventListener('keydown',e=>{if(e.key==='Escape')document.activeElement?.blur()});
})();