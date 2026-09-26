(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const scene=$('scene'),invite=$('invitation'),accepted=$('accepted'),challenge=$('challenge'),bear=$('bear');
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 if(reduced.matches)$('celebration-bear').src='assets/bear-celebration-still.png';
  let timers=[],view='intro',selectedHour=16,event=SaliditaCalendar.eventFor(),icsURL='',run=0,birthdayUnlocked=false;
 const timer=(fn,ms)=>{const id=setTimeout(fn,ms);timers.push(id);return id;};
 const stopTimers=()=>{timers.forEach(clearTimeout);timers=[];};
 function setView(next){view=next;document.body.dataset.view=next;}
 function syncCalendar(){
   const d=event.start;
   $('invite-date').textContent=new Intl.DateTimeFormat('es-MX',{day:'numeric',month:'long'}).format(d);
   $('ticket-month').textContent=new Intl.DateTimeFormat('es-MX',{month:'short'}).format(d).replace('.','');
   $('ticket-day').textContent=d.getDate();
   $('event-date').textContent=new Intl.DateTimeFormat('es-MX',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(d);
   $('event-time').textContent=d.getHours()+':00–'+'medianoche · hora de tu dispositivo';
   $('google-calendar').href=event.google;
   if(icsURL)URL.revokeObjectURL(icsURL);
   icsURL=URL.createObjectURL(new Blob([event.ics],{type:'text/calendar;charset=utf-8'}));
   $('apple-calendar').href=icsURL;
 }
 const DANCE_MS=3600;

 function resetBear(){bear.onload=null;bear.onerror=null;bear.src='assets/bear-poster.png';}
 function reveal(focus=false){
   stopTimers();run++;resetBear();scene.hidden=true;scene.classList.remove('playing','fading','offering');
   invite.hidden=false;accepted.hidden=true;challenge.hidden=true;$('replay').hidden=false;
   setView('invitation');if(focus)$('question').focus({preventScroll:true});
 }
 function offerFlower(thisRun){
   if(view!=='intro'||run!==thisRun)return;
   stopTimers();
   scene.classList.add('offering');timer(()=>scene.classList.add('fading'),2700);timer(()=>reveal(),3850);
 }
 function queueFlower(thisRun,delay=DANCE_MS){
   if(view==='intro'&&run===thisRun)timer(()=>offerFlower(thisRun),delay);
 }
 function playDance(thisRun){
   // Start the animation directly; never depend on image load/decode events for
   // the flower/fade sequence, since those events vary across mobile browsers.
   queueFlower(thisRun);
   bear.onerror=()=>{bear.onerror=null;};
   bear.src='assets/bear-intro-smooth.webp';
 }
 function start(){
   stopTimers();run++;const thisRun=run;resetBear();$('confetti').replaceChildren();
   invite.hidden=true;accepted.hidden=true;challenge.hidden=true;scene.hidden=false;scene.classList.remove('playing','fading','offering');
   $('replay').hidden=true;setView('intro');
   if(reduced.matches){reveal();return;}
   void scene.offsetWidth;scene.classList.add('playing');playDance(thisRun);
 }
 function celebrate(){
   if(reduced.matches)return;
   $('confetti').replaceChildren();
   for(let i=0;i<24;i++){
     const bit=document.createElement('i');bit.textContent='✦';
     bit.style.left=(Math.random()*100)+'%';bit.style.animationDelay=(Math.random()*.65)+'s';
     bit.style.setProperty('--drift',(Math.random()*140-70)+'px');bit.style.setProperty('--turn',(Math.random()*200-100)+'deg');
     $('confetti').append(bit);
   }
   timer(()=>$('confetti').replaceChildren(),4500);
 }
 function accept(openCalendar=true){
   if(view!=='invitation')return;
   stopTimers();if(event.start<=new Date()){event=SaliditaCalendar.eventFor(new Date(),selectedHour);syncCalendar();}
   scene.hidden=true;invite.hidden=true;challenge.hidden=true;accepted.hidden=false;$('replay').hidden=false;
   setView('accepted');
   const celebrationBear=$('celebration-bear');
   if(celebrationBear){celebrationBear.src='assets/bear-celebration.png?play='+Date.now();}
   $('accepted-title').focus({preventScroll:true});celebrate();
   if(openCalendar){
     const apple=/iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent);
     if(apple)$('apple-calendar').click();else $('google-calendar').click();
   }
 }
 function reject(){
   if(view!=='invitation')return;
   stopTimers();run++;birthdayUnlocked=false;
   invite.hidden=true;accepted.hidden=true;scene.hidden=true;challenge.hidden=false;$('replay').hidden=true;
   $('birthday').value='';$('birthday').removeAttribute('aria-invalid');$('birthday-feedback').textContent='';
   setView('challenge');$('challenge-title').focus({preventScroll:true});
 }
 $('birthday-form').addEventListener('submit',e=>{
   e.preventDefault();if(view!=='challenge')return;
   const answer=$('birthday').value.trim().toLocaleLowerCase('es').replace(/\s+/g,' ');
   if(answer==='20 de diciembre'){
     birthdayUnlocked=true;$('birthday').blur();reveal(true);
   }else{
     $('birthday').setAttribute('aria-invalid','true');$('birthday-feedback').textContent='nop, intenta otra vez';
   }
 });
 $('time').addEventListener('change',()=>{selectedHour=Number($('time').value);event=SaliditaCalendar.eventFor(new Date(),selectedHour);syncCalendar();});
 $('replay').addEventListener('click',start);
 $('yes').addEventListener('click',()=>accept());
 $('no').addEventListener('click',reject);
 $('back').addEventListener('click',()=>reveal(true));
 syncCalendar();
 // Images may load slowly or fail; the invitation always remains reachable.
 let started=false;const begin=()=>{if(!started){started=true;if(view==='intro')start();}};
 begin();
 window.addEventListener('pagehide',()=>{if(icsURL)URL.revokeObjectURL(icsURL);});
 window.addEventListener('pageshow',e=>{if(e.persisted){syncCalendar();if(view==='intro')start();}});
 if(document.modelContext?.registerTool){
   const lifetime=new AbortController();
   const tool={name:'show_date_invitation',title:'Ver la invitación',description:'Muestra la pregunta y los datos de la cita. No responde ni guarda un evento.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length)throw new Error('Esta acción no acepta parámetros.');if(view!=='challenge'||birthdayUnlocked)reveal();return{view,title:'Salidita🌷',start:event.start.toISOString(),calendarSaved:false};}};
   try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifetime.signal})).catch(()=>{});}catch{}
   window.addEventListener('pagehide',()=>lifetime.abort(),{once:true});
 }
})();
