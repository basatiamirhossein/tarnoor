/* ================= device drawings ================= */
/* Front-view vector devices in the panel's own palette: pale aluminium bodies with a white top edge,
   graphite ports and red LEDs. Each call gets its own gradient id so many can share a page. */
let _gid=0;
function dev(p,size){
 const k=p.k,v=p.v||{},g="d"+(++_gid);
 const dark=k==="nic"&&!v.wifi&&!v.rj?0:0;
 const defs=`<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F1F2F6"/><stop offset="1" stop-color="#D2D4DC"/></linearGradient><linearGradient id="${g}k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3B3E4A"/><stop offset="1" stop-color="#262832"/></linearGradient></defs>`;
 const F=`url(#${g})`,K=`url(#${g}k)`;
 const body=(x,y,w,h,r=6,fill=F)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="#fff" stroke-width="1.2"/><rect x="${x+r}" y="${y+h-4}" width="${w-2*r}" height="3" rx="1.5" fill="rgba(110,114,135,.16)"/>`;
 const port=(x,y,w=11,h=9,lit)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.6" fill="#2B2D36"/>${lit?`<rect x="${x+1.4}" y="${y+1.2}" width="${Math.max(2,w/4)}" height="2" rx=".6" fill="#E01E2D"/>`:""}`;
 const cage=(x,y,w=14,h=10)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" fill="#F7F7FA" stroke="#2B2D36" stroke-width="1.6"/><rect x="${x+3}" y="${y+3}" width="${w-6}" height="${h-6}" rx=".8" fill="#2B2D36" opacity=".18"/>`;
 const led=(x,y,on=1)=>`<circle cx="${x}" cy="${y}" r="2.2" fill="${on?"#E01E2D":"#B9BCC7"}"${on?' opacity=".92"':""}/>`;
 const shadow=(cx,cy,rx)=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="6" fill="rgba(110,114,135,.17)"/>`;
 const ant=(x,y,h,rot)=>`<rect x="${x}" y="${y}" width="5" height="${h}" rx="2.5" fill="#D3D5DD" stroke="#fff" stroke-width=".8" transform="rotate(${rot} ${x+2.5} ${y+h})"/>`;
 const label=(x,y,w)=>`<rect x="${x}" y="${y}" width="${w}" height="3" rx="1.5" fill="rgba(120,124,140,.38)"/>`;
 let s="";
 if(k==="router"||k==="switch"||(k==="firewall"&&!v.white)){
  const n=v.ports||(k==="firewall"?10:8),sf=v.sfp||0,rows=n>12?2:1,per=Math.ceil(n/rows);
  const W=v.small?150:212,H=v.rack?(rows===2?58:46):(rows===2?62:50),x=(240-W)/2,y=(150-H)/2+(v.ant?10:0);
  if(k==="router"&&!v.rack&&!v.small&&n<=5){ // desktop wifi router: rounded slab + antennas
   s+=shadow(120,128,84)+ant(64,20,48,-14)+ant(171,20,48,14)+body(40,64,160,54,18)+led(66,84)+led(78,84)+led(90,84,0);
   for(let i=0;i<n;i++)s+=port(108+i*16,86,11,9,i!==2);
   s+=label(66,100,40);
  }else{
   s+=shadow(120,y+H+12,W/2-8)+body(x,y,W,H,v.rack?5:10);
   if(v.rack)s+=`<rect x="${x-9}" y="${y+4}" width="10" height="${H-8}" rx="3" fill="${F}" stroke="#fff"/><rect x="${x+W-1}" y="${y+4}" width="10" height="${H-8}" rx="3" fill="${F}" stroke="#fff"/><circle cx="${x-4}" cy="${y+H/2}" r="2" fill="rgba(110,114,135,.4)"/><circle cx="${x+W+4}" cy="${y+H/2}" r="2" fill="rgba(110,114,135,.4)"/>`;
   const left=x+(v.small?26:40),avail=W-(left-x)-14-sf*17;
   const pw=Math.max(5,Math.min(11,avail/per-3));
   for(let r=0;r<rows;r++)for(let i=0;i<per&&r*per+i<n;i++)s+=port(left+i*(pw+3),rows===1?y+H/2-5:y+11+r*(H-31),pw,9,(i*7+r*3)%5!==1);
   for(let i=0;i<sf;i++)s+=cage(x+W-12-(i+1)*17,y+H/2-6);
   s+=led(x+11,y+12)+led(x+19,y+12,0)+label(x+9,y+H-14,v.small?12:20);
   if(k==="firewall")s+=`<rect x="${x+W-46}" y="${y+9}" width="30" height="6" rx="3" fill="#E01E2D" opacity=".85"/>`;
  }
 }else if(k==="firewall"){ // white desktop gateway
  s+=shadow(120,124,76)+body(52,52,136,62,16)+`<rect x="64" y="64" width="44" height="30" rx="6" fill="#2B2D36"/><rect x="69" y="70" width="22" height="3" rx="1.5" fill="#E01E2D"/><rect x="69" y="77" width="30" height="2.4" rx="1.2" fill="rgba(255,255,255,.35)"/><rect x="69" y="83" width="18" height="2.4" rx="1.2" fill="rgba(255,255,255,.35)"/>`;
  for(let i=0;i<5;i++)s+=port(116+i*13,74,10,9,i!==3);
  s+=label(64,102,40);
 }else if(k==="sfp"){
  s+=shadow(120,118,92)+`<path d="M40 64h120l14 8v20l-14 8H40z" fill="${F}" stroke="#fff" stroke-width="1.2"/><rect x="174" y="70" width="26" height="24" rx="3" fill="${v.blue?"#3E6FD8":"#2B2D36"}"/><rect x="180" y="75" width="6" height="6" rx="1" fill="#F7F7FA"/><rect x="189" y="75" width="6" height="6" rx="1" fill="#F7F7FA"/>`+label(56,78,60)+`<rect x="56" y="86" width="34" height="3" rx="1.5" fill="#E01E2D" opacity=".75"/><path d="M40 70h-8v24h8" fill="none" stroke="#C9A85A" stroke-width="3"/>`;
 }else if(k==="converter"){
  s+=shadow(120,122,70)+body(56,50,128,62,12)+port(76,74,16,13,1)+cage(104,75,22,13)+led(148,68)+led(158,68,0)+led(168,68)+label(76,98,46);
 }else if(k==="ap"){
  const r=v.small?44:56;
  s+=shadow(120,130,r+12)+`<circle cx="120" cy="72" r="${r}" fill="${F}" stroke="#fff" stroke-width="1.5"/><circle cx="120" cy="72" r="${r-16}" fill="none" stroke="rgba(120,124,140,.18)" stroke-width="1.2"/><circle cx="120" cy="72" r="${v.small?12:17}" fill="none" stroke="#E01E2D" stroke-width="3" style="filter:drop-shadow(0 0 4px rgba(224,30,45,.35))"/>`;
 }else if(k==="dish"){
  s+=shadow(120,134,60)+`<rect x="114" y="92" width="12" height="38" rx="3" fill="#C5C8D1"/><ellipse cx="120" cy="66" rx="58" ry="52" fill="${F}" stroke="#fff" stroke-width="1.5"/><ellipse cx="120" cy="66" rx="42" ry="37" fill="none" stroke="rgba(120,124,140,.2)" stroke-width="1.2"/><circle cx="120" cy="66" r="9" fill="#2B2D36"/><circle cx="120" cy="66" r="3" fill="#E01E2D"/>`;
 }else if(k==="phone"){
  s+=shadow(120,134,84)+body(40,46,160,80,16)+`<rect x="48" y="26" width="34" height="96" rx="14" fill="${F}" stroke="#fff" stroke-width="1.4"/><rect x="96" y="58" width="88" height="26" rx="4" fill="#2B2D36"/><rect x="100" y="62" width="40" height="3" rx="1.5" fill="#E01E2D"/><rect x="100" y="69" width="56" height="2.4" rx="1.2" fill="rgba(255,255,255,.3)"/>`;
  for(let r=0;r<3;r++)for(let c=0;c<4;c++)s+=`<rect x="${100+c*21}" y="${92+r*10}" width="15" height="6" rx="3" fill="rgba(120,124,140,.32)"/>`;
 }else if(k==="ata"){
  s+=shadow(120,120,62)+body(62,56,116,54,12)+port(80,76,14,11,1)+port(100,76,14,11)+port(130,77,12,9,1)+led(80,66)+led(90,66)+led(100,66,0)+label(140,66,22);
 }else if(k==="pbx"){
  s+=shadow(120,116,96)+body(22,52,196,52,5)+`<rect x="34" y="62" width="40" height="22" rx="4" fill="#2B2D36"/><rect x="38" y="67" width="20" height="3" rx="1.5" fill="#E01E2D"/><rect x="38" y="74" width="28" height="2.4" rx="1.2" fill="rgba(255,255,255,.35)"/>`;
  for(let i=0;i<4;i++)s+=port(88+i*15,69,11,9,i<2);
  s+=port(156,69,11,9,1)+port(171,69,11,9)+led(196,64)+led(204,64,0)+label(88,90,40);
 }else if(k==="modem"){
  if(v.tower){
   s+=shadow(120,134,52)+body(84,22,72,106,22)+`<circle cx="120" cy="58" r="14" fill="none" stroke="rgba(120,124,140,.3)" stroke-width="2"/><circle cx="120" cy="58" r="4" fill="#E01E2D"/>`+led(108,96)+led(120,96)+led(132,96,0)+label(104,110,32);
  }else{
   const a=v.ant||2,xs=a===4?[70,96,144,170]:[80,160];
   s+=shadow(120,132,74);
   xs.forEach((x,i)=>s+=ant(x-2.5,14,50,(x<120?-1:1)*(a===4&&(i===1||i===2)?4:12)));
   s+=body(56,58,128,64,14)+led(86,78)+led(98,78)+led(110,78,0)+led(122,78)+label(86,100,64);
  }
 }else if(k==="nic"){
  s+=shadow(112,130,88)+`<rect x="28" y="38" width="160" height="74" rx="6" fill="#2F333F" stroke="#fff" stroke-width="1"/><path d="M36 46h144v58H36z" fill="none" stroke="rgba(255,255,255,.08)"/><rect x="188" y="28" width="12" height="104" rx="2" fill="${F}" stroke="#fff"/>`;
  s+=`<rect x="64" y="56" width="46" height="34" rx="4" fill="${F}"/><rect x="72" y="64" width="30" height="18" rx="2" fill="rgba(110,114,135,.25)"/>`;
  for(let i=0;i<14;i++)s+=`<rect x="${42+i*9}" y="112" width="5" height="10" fill="#C9A85A"/>`;
  if(v.sfp)for(let i=0;i<v.sfp;i++)s+=cage(186,46+i*30,16,12);
  else if(v.rj)for(let i=0;i<v.rj;i++)s+=port(187,38+i*22,13,12,1);
  else if(v.wifi)s+=ant(196,6,40,8)+ant(196,98,40,172)+`<circle cx="150" cy="73" r="10" fill="none" stroke="#E01E2D" stroke-width="2.5"/>`;
 }else if(k==="usbnic"){
  s+=shadow(120,124,70)+`<rect x="40" y="70" width="34" height="12" rx="2" fill="#C5C8D1"/><path d="M74 76h22" stroke="#2B2D36" stroke-width="5" stroke-linecap="round"/>`+body(96,52,96,50,14)+port(150,70,18,14,1)+led(112,68)+label(112,82,24);
 }else if(k==="powerline"){
  const pair=[[54,0],[130,1]];
  for(const [x] of pair){
   s+=shadow(x+28,134,32)+body(x,26,56,98,14)+led(x+28,46)+`<circle cx="${x+28}" cy="${v.wifi?72:78}" r="9" fill="none" stroke="rgba(120,124,140,.4)" stroke-width="2"/>`+label(x+16,102,24);
   if(v.wifi)s+=`<path d="M${x+18} 92a14 14 0 0120 0M${x+22} 96a8 8 0 0112 0" fill="none" stroke="#E01E2D" stroke-width="1.8" stroke-linecap="round"/>`;
  }
 }else if(k==="printserver"){
  s+=shadow(120,124,66)+body(62,58,116,54,12);
  if(v.mf)s+=`<rect x="74" y="46" width="92" height="14" rx="5" fill="${F}" stroke="#fff"/>`;
  s+=port(80,78,16,13,1)+`<rect x="106" y="80" width="18" height="9" rx="2" fill="#F7F7FA" stroke="#2B2D36" stroke-width="1.6"/>`+led(144,72)+led(154,72,0)+label(140,94,26);
 }else{
  s+=shadow(120,124,64)+body(60,46,120,64,10)+port(80,72,16,13,1)+led(150,66);
 }
 return `<svg viewBox="0 0 240 150" aria-hidden="true"${size?` width="${size}"`:""}>${defs}${s}</svg>`;
}

/* line icons per category */
const ICO={
 router:'<rect x="3" y="12" width="18" height="7" rx="2.5"/><path d="M7 12L5.5 5M17 12l1.5-7"/><circle cx="7.5" cy="15.5" r=".9" fill="currentColor"/><circle cx="10.5" cy="15.5" r=".9" fill="currentColor"/>',
 active:'<path d="M12 3l8 3.5v5.5c0 4.4-3.4 8-8 9-4.6-1-8-4.6-8-9V6.5z"/><path d="M9 12h6M12 9v6"/>',
 wireless:'<path d="M3.5 9.5a12 12 0 0117 0M6.5 12.8a7.5 7.5 0 0111 0M9.4 16a3.4 3.4 0 015.2 0"/><circle cx="12" cy="19" r="1.1" fill="currentColor"/>',
 voip:'<rect x="4" y="4" width="16" height="16" rx="3.5"/><path d="M8 4v16"/><rect x="11" y="7" width="6" height="4" rx="1"/><path d="M11.5 14h1M14.5 14h1M11.5 17h1M14.5 17h1"/>',
 modem:'<rect x="5" y="9" width="14" height="11" rx="2.5"/><path d="M8 9V4M16 9V4"/><path d="M9 15h.01M12 15h.01M15 15h.01" stroke-width="2.4"/>',
 nic:'<path d="M3 6h15v10H3z"/><path d="M18 6h2.5v14M6 16v3h9v-3"/><rect x="7" y="9" width="5" height="4" rx=".8"/>',
 switch:'<rect x="2.5" y="8" width="19" height="8" rx="2"/><path d="M5.5 11h2v2h-2zM9 11h2v2H9zM12.5 11h2v2h-2zM16 11h2v2h-2z"/>',
 powerline:'<rect x="6" y="3" width="12" height="15" rx="3"/><path d="M10 18v3M14 18v3M10 8h.01M14 8h.01"/><path d="M9.5 12.5h5"/>',
 printserver:'<path d="M7 9V3.5h10V9"/><rect x="3.5" y="9" width="17" height="8" rx="2"/><path d="M7 14h10v6.5H7z"/>'};
const icon=(k,s=26)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICO[k]||ICO.switch}</svg>`;

/* UI glyphs */
const G=(d,s=18,w=2)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const IC={
 cart:G('<path d="M3 4h2l2.2 10.2a2 2 0 002 1.6h7.6a2 2 0 002-1.5L20.5 8H6"/><circle cx="9.5" cy="20" r="1.2" fill="currentColor"/><circle cx="17" cy="20" r="1.2" fill="currentColor"/>',19),
 cmp:G('<path d="M8 4v16M16 4v16M4 9h8M12 15h8"/>'),
 heart:G('<path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/>'),
 user:G('<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>'),
 search:G('<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L20 20"/>'),
 menu:G('<path d="M4 7h16M4 12h16M4 17h10"/>'),
 home:G('<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>'),
 grid:G('<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>'),
 list:G('<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1" fill="currentColor"/><circle cx="4.5" cy="12" r="1" fill="currentColor"/><circle cx="4.5" cy="18" r="1" fill="currentColor"/>'),
 plus:G('<path d="M12 5v14M5 12h14"/>',18,2.2),
 minus:G('<path d="M5 12h14"/>',18,2.2),
 x:G('<path d="M6 6l12 12M18 6L6 18"/>'),
 check:G('<path d="M5 12.5l4.5 4.5L19 7.5"/>',18,2.4),
 arrow:G('<path d="M15 6l-6 6 6 6"/>',16,2.2),
 chev:G('<path d="M9 6l6 6-6 6"/>',14,2.2),
 down:G('<path d="M6 9l6 6 6-6"/>',14,2.2),
 phone:G('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>'),
 wa:G('<path d="M4 20l1.3-4A8 8 0 1112 20a8 8 0 01-4-1.1z"/><path d="M9 9c.3 2.6 2.4 4.7 5 5l1-1.4-1.8-.9-.9.9c-.9-.4-1.6-1.1-2-2l.9-.9-.9-1.8z" fill="currentColor" stroke-width="1"/>'),
 tg:G('<path d="M21 4L3 11l6 2 2 6 3-4 5 4 2-15z"/><path d="M9 13l8-6"/>'),
 mail:G('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/>'),
 pin:G('<path d="M12 21s-6-5.3-6-11a6 6 0 1112 0c0 5.7-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>'),
 clock:G('<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>'),
 shield:G('<path d="M12 3l8 4v5c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V7z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>'),
 truck:G('<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/>'),
 box:G('<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5"/>'),
 doc:G('<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>'),
 print:G('<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z"/>'),
 copy:G('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3"/>',16),
 trash:G('<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>',16),
 filter:G('<path d="M4 6h16M7 12h10M10 18h4"/>'),
 globe:G('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z"/>',18,1.8),
 star:'<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" fill="currentColor"/></svg>',
 logout:G('<path d="M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10"/>'),
 tag:G('<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.4" fill="currentColor"/>'),
 cpu:G('<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>'),
};
