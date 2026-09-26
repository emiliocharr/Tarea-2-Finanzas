(function(root){
 'use strict';
 const pad=n=>String(n).padStart(2,'0');
 function nextSunday(now=new Date(),hour=16){
   if(![16,17,18,19].includes(hour))throw new RangeError('Elige las 4, 5, 6 o 7 de la tarde.');
   const start=new Date(now);start.setHours(hour,0,0,0);
   start.setDate(start.getDate()+(7-start.getDay())%7);
   if(start<=now)start.setDate(start.getDate()+7);
   return start;
 }
 function localStamp(d){return d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+'T'+pad(d.getHours())+pad(d.getMinutes())+pad(d.getSeconds());}
 function utcStamp(d){return d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');}
 function eventFor(now=new Date(),hour=16){
   const start=nextSunday(now,hour),end=new Date(start);end.setDate(end.getDate()+1);end.setHours(0,0,0,0);
   const uid='salidita-'+localStamp(start)+'@salidita.local';
   const google=new URL('https://calendar.google.com/calendar/render');
   google.search=new URLSearchParams({action:'TEMPLATE',text:'Salidita🌷',dates:utcStamp(start)+'/'+utcStamp(end),details:'Una salidita para pasar tiempo juntos. 🌷 Hasta terminar el domingo.'}).toString();
   // UTC timestamps preserve the selected device-local time across calendar providers.
   const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Salidita//Invitacion ES//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT','UID:'+uid,'DTSTAMP:'+utcStamp(now),'DTSTART:'+utcStamp(start),'DTEND:'+utcStamp(end),'SUMMARY:Salidita🌷','DESCRIPTION:Una salidita para pasar tiempo juntos. 🌷','STATUS:CONFIRMED','TRANSP:OPAQUE','END:VEVENT','END:VCALENDAR',''].join('\r\n');
   return {start,end,uid,google:google.toString(),ics};
 }
 root.SaliditaCalendar={nextSunday,eventFor};
})(globalThis);
