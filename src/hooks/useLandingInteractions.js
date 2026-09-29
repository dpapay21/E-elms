import { useEffect } from 'react';

export default function useLandingInteractions() {
  useEffect(() => {
    const listeners = new AbortController();
    const { signal } = listeners;
    document.documentElement.classList.add('js');
    
    const b=document.getElementById('burger'),m=document.getElementById('menu');
    const hd=document.querySelector('.header');
    const setMenu=o=>{m.classList.toggle('open',o);hd.classList.toggle('menu-open',o);b.setAttribute('aria-expanded',o);b.setAttribute('aria-label',o?'Close menu':'Open menu')};
    b.addEventListener('click',e=>{e.stopPropagation();setMenu(!m.classList.contains('open'))},{signal});
    m.addEventListener('click',e=>{e.stopPropagation();if(e.target.closest('a'))setMenu(false)},{signal});
    document.addEventListener('click',()=>setMenu(false),{signal});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){setMenu(false);closePops()}},{signal});
    
    const pops=document.querySelectorAll('.fc-btn');
    function closePops(except){pops.forEach(x=>{if(x!==except){x.classList.remove('is-open');x.setAttribute('aria-expanded','false')}})}
    pops.forEach(btn=>btn.addEventListener('click',e=>{
      e.stopPropagation();
      const open=!btn.classList.contains('is-open');
      closePops(btn);
      if(open)btn.style.setProperty('--pop',Math.min(1.12,(document.documentElement.clientWidth-10)/btn.offsetWidth).toFixed(3));
      btn.classList.toggle('is-open',open);btn.setAttribute('aria-expanded',open);
    },{signal}));
    document.addEventListener('click',()=>closePops(),{signal});
    
    const reveals=document.querySelectorAll('.reveal');
    if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches){
      reveals.forEach(el=>el.classList.add('in'));
    }else{
      const io=new IntersectionObserver(entries=>entries.forEach(e=>{
        if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}
      }),{threshold:.2,rootMargin:'0px 0px -6% 0px'});
      reveals.forEach(el=>io.observe(el));
    }
    
    const ssEl=document.getElementById('ssCarousel');
    if(ssEl){
      const track=ssEl.querySelector('.ss-track'),slides=[...ssEl.querySelectorAll('.ss-slide')],dots=[...ssEl.querySelectorAll('.ss-dot')];
      let cur=0;
      const go=n=>{
        cur=(n+slides.length)%slides.length;
        track.style.transform='translateX('+(-cur*100)+'%)';
        slides.forEach((sl,k)=>sl.setAttribute('aria-hidden',k!==cur));
        dots.forEach((d,k)=>d.setAttribute('aria-current',k===cur));
      };
      ssEl.querySelector('.ss-prev').addEventListener('click',()=>go(cur-1),{signal});
      ssEl.querySelector('.ss-next').addEventListener('click',()=>go(cur+1),{signal});
      dots.forEach((d,k)=>d.addEventListener('click',()=>go(k),{signal}));
      ssEl.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')go(cur-1);else if(e.key==='ArrowRight')go(cur+1)},{signal});
      let tx=null,ty=null;
      track.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY},{passive:true,signal});
      track.addEventListener('touchend',e=>{
        if(tx===null)return;
        const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;tx=null;
        if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))go(dx<0?cur+1:cur-1);
      },{signal});
      go(0);
    }
    
    return () => listeners.abort();
  }, []);
}
