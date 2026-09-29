(()=>{'use strict';
const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const coarse=window.matchMedia?.('(pointer: coarse)').matches;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];

const progress=document.createElement('div');progress.className='nova-progress';document.body.appendChild(progress);
addEventListener('scroll',()=>{const max=document.documentElement.scrollHeight-innerHeight;progress.style.transform='scaleX('+Math.min(1,Math.max(0,scrollY/(max||1)))+')'},{passive:true});

if(!coarse&&!reduced){
 const cursor=document.createElement('div'),trail=document.createElement('div');cursor.className='nova-cursor';trail.className='nova-cursor-trail';document.body.append(cursor,trail);
 let mx=innerWidth/2,my=innerHeight/2,cx=mx,cy=my,tx=mx,ty=my;
 addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY},{passive:true});
 const loop=()=>{cx+=(mx-cx)*.2;cy+=(my-cy)*.2;tx+=(mx-tx)*.08;ty+=(my-ty)*.08;cursor.style.left=cx+'px';cursor.style.top=cy+'px';trail.style.left=tx+'px';trail.style.top=ty+'px';requestAnimationFrame(loop)};loop();
 $$('a,button,.release-cover,.artist-frame').forEach(el=>{el.addEventListener('mouseenter',()=>cursor.classList.add('active'));el.addEventListener('mouseleave',()=>cursor.classList.remove('active'))});
}
const field=document.createElement('div');field.className='nova-field';field.setAttribute('aria-hidden','true');document.body.appendChild(field);
const core=document.createElement('span');core.className='field-core';field.appendChild(core);
const dots=[];for(let i=0;i<22;i++){const d=document.createElement('i');field.appendChild(d);dots.push({el:d,x:Math.random()*innerWidth,y:Math.random()*innerHeight,vx:(Math.random()-.5)*.14,vy:(Math.random()-.5)*.14})}
let mx=innerWidth/2,my=innerHeight/2,fx=mx,fy=my;
addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY},{passive:true});
const animate=()=>{if(!coarse&&!reduced){fx+=(mx-fx)*.045;fy+=(my-fy)*.045;core.style.left=fx+'px';core.style.top=fy+'px';dots.forEach(d=>{const dx=mx-d.x,dy=my-d.y,dist=Math.hypot(dx,dy),pull=Math.max(0,1-dist/320);d.vx+=(dx/(dist||1))*.0015*pull;d.vy+=(dy/(dist||1))*.0015*pull;d.vx*=.996;d.vy*=.996;d.x+=d.vx*16;d.y+=d.vy*16;if(d.x<0||d.x>innerWidth)d.vx*=-1;if(d.y<0||d.y>innerHeight)d.vy*=-1;d.el.style.left=d.x+'px';d.el.style.top=d.y+'px';d.el.style.opacity=.06+pull*.45})}requestAnimationFrame(animate)};animate();

if(!reduced&&'IntersectionObserver'in window){const ob=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');ob.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -5% 0px'});$$('.music,.about,.contact,.release,.track,.socials a').forEach(e=>{e.classList.add('reveal');ob.observe(e)})}

if(!coarse&&!reduced){$$('.release').forEach(card=>{card.addEventListener('mousemove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform='perspective(1400px) rotateX('+(-y*1.4).toFixed(2)+'deg) rotateY('+(x*1.4).toFixed(2)+'deg) translateY(-3px)' });card.addEventListener('mouseleave',()=>card.style.transform='')});
 const frame=$('.artist-frame');frame?.addEventListener('mousemove',e=>{const r=frame.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;frame.style.transform='perspective(1000px) rotateX('+(-y*2).toFixed(2)+'deg) rotateY('+(x*2).toFixed(2)+'deg)' });frame?.addEventListener('mouseleave',()=>frame.style.transform='');
 $$('a.button').forEach(b=>{b.addEventListener('mousemove',e=>{const r=b.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;b.style.transform='translate('+(x*.12)+'px,'+(y*.16)+'px)'});b.addEventListener('mouseleave',()=>b.style.transform='')})
}

$$('.track').forEach(track=>{track.addEventListener('click',()=>{const release=track.closest('.release'),cover=$('[data-artwork]',release),img=$('img',cover),label=$('.artwork-label',cover),name=track.dataset.track,art=track.dataset.art;if(!cover||!img)return;$$('.track',release).forEach(t=>t.classList.remove('selected'));track.classList.add('selected');cover.classList.add('artwork-changing');setTimeout(()=>{img.src=art;img.alt=name+' artwork by Young Nova';if(label)label.textContent=name+' / TRACK ARTWORK';cover.classList.remove('artwork-changing')},160);cover.scrollIntoView({behavior:reduced?'auto':'smooth',block:'center'})})});
$$('.release-cover img').forEach(img=>img.addEventListener('load',()=>img.parentElement.classList.remove('artwork-changing')));
})();
// Refined release tilt and track micro-interactions
if(!coarse&&!reduced){
$$('.release').forEach(card=>{card.addEventListener('mousemove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform='perspective(1600px) rotateX('+(-y*2.2).toFixed(2)+'deg) rotateY('+(x*2.2).toFixed(2)+'deg) translateY(-4px)';card.style.setProperty('--tilt-x',(x*100).toFixed(1)+'%');card.style.setProperty('--tilt-y',(y*100).toFixed(1)+'%')});card.addEventListener('mouseleave',()=>{card.style.transform='';card.style.removeProperty('--tilt-x');card.style.removeProperty('--tilt-y')})});
$$('.track').forEach(track=>{track.addEventListener('mousemove',e=>{const r=track.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;track.style.transform='translateX(4px) perspective(700px) rotateY('+(x*1.5).toFixed(2)+'deg) rotateX('+(-y*1).toFixed(2)+'deg)'});track.addEventListener('mouseleave',()=>track.style.transform='')});
}
