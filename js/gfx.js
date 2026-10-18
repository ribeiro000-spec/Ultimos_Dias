const R=seed=>{let t=seed|0;return()=>{t=(t+0x6D2B79F5)|0;let x=Math.imul(t^t>>>15,1|t);x^=x+Math.imul(x^x>>>7,61|x);return((x^x>>>14)>>>0)/4294967296}};
const rc=(x,y,w,h,f,e='')=>`<rect x="${x|0}" y="${y|0}" width="${w|0}" height="${h|0}" fill="${f}" ${e}/>`;
const ln=(d,w=1.5,c='#ddd')=>`<path d="${d}" stroke="${c}" stroke-width="${w}" fill="none"/>`;
const man=(x,y,k,t)=>{const m=t=='m';
 return`<g transform="translate(${x} ${y}) scale(${k})${m?' rotate(10)':''}" fill="#030303" stroke="${m?'#fff':'#ccc'}" stroke-width="1.4"><circle cy="-62" r="8"/>`+(m?'<circle cx="-3" cy="-63" r="1.5" fill="#fff" stroke="none"/><circle cx="3" cy="-63" r="1.5" fill="#fff" stroke="none"/>':'')+
 '<path d="M-9-52L9-52L11-18L-11-18Z"/>'+ln(m?'M-9-50L-30-60M9-50L30-60':t=='l'?'M-9-50L-20-30M9-50L24-74':'M-9-50L-20-30M9-50L20-30',3)+ln('M-6-18L-9 8M6-18L9 8',3.5)+(t=='g'?ln('M18-34L42-54',3):'')+
 (m?'<animate attributeName="opacity" values="1;.55;1" dur="2.6s" repeatCount="indefinite"/>':'')+'</g>'};
export function scene(kind,o={}){
 const n=!!o.night,r=R((o.seed||1)*31+kind.length*7),hz=290,B=340,lit=()=>n&&r()<.3?'#f2f2f2':'#070707';
 let s=`<svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${n?'#010101':'#222'}"/><stop offset="1" stop-color="${n?'#202020':'#b8b8b8'}"/></linearGradient><linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${n?'#1b1b1b':'#4a4a4a'}"/><stop offset="1" stop-color="#030303"/></linearGradient><radialGradient id="mg"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><filter id="gn"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2"/><feColorMatrix type="saturate" values="0"/></filter></defs><rect width="800" height="450" fill="url(#sk)"/>`;
 const mx=90+r()*620;s+=`<circle cx="${mx|0}" cy="75" r="95" fill="url(#mg)"/><circle cx="${mx|0}" cy="75" r="21" fill="#f4f4f4"/>`;
 if(n)for(let i=0;i<45;i++)s+=`<circle cx="${r()*800|0}" cy="${r()*200|0}" r="${.4+r()*.9}" fill="#fff" opacity="${.3+r()*.6}"/>`;
 const sky=(y,a,b,f,l)=>{let x=-20,q='';while(x<800){const w=30+r()*60,h=a+r()*(b-a);q+=rc(x,y-h,w,h+90,f);if(l)for(let i=0;i<5;i++)if(r()<.3)q+=rc(x+6+r()*(w-14),y-h+8+r()*(h-16),5,7,'#eee','opacity=".85"');x+=w+r()*5}return q};
 const wood=kind=='road'||kind=='farm'||kind=='bunker';
 if(!wood)s+=sky(hz-8,40,130,n?'#0a0a0a':'#575757')+sky(hz+6,30,90,n?'#050505':'#2e2e2e',n);
 else{for(let k=0;k<2;k++){let q='';for(let i=0;i<26;i++){const x=r()*820-10,h=50+r()*70+k*30;q+=`<path d="M${x-14|0} ${hz+8} L${x|0} ${hz+8-h|0} L${x+14|0} ${hz+8}Z" fill="${k?(n?'#030303':'#1e1e1e'):(n?'#0b0b0b':'#454545')}"/>`}s+=q}}
 s+=rc(0,hz,800,160,'url(#gr)');
 const F={
 police:()=>rc(230,B-170,340,170,'#181818','stroke="#ddd" stroke-width="2"')+rc(215,B-186,370,18,'#ddd')+`<text x="400" y="${B-172}" font-family="Georgia" font-size="13" font-weight="bold" text-anchor="middle" fill="#111">POLÍCIA</text>`+[0,1,2,3].map(i=>rc(255+i*75,B-135,46,52,lit(),'stroke="#ddd"')+ln(`M${278+i*75} ${B-135}v52M${255+i*75} ${B-109}h46`,1)).join('')+rc(368,B-72,64,72,'#020202','stroke="#ddd"')+rc(210,B-12,380,12,'#333')+rc(190,B-40,36,40,'#222','stroke="#999"')+rc(574,B-40,36,40,'#222','stroke="#999"'),
 bunker:()=>`<path d="M120 ${B} Q400 ${B-190} 680 ${B}Z" fill="#101010" stroke="#999" stroke-width="2"/>`+rc(345,B-86,110,86,'#242424','stroke="#ddd" stroke-width="3"')+`<circle cx="400" cy="${B-42}" r="16" fill="none" stroke="#ddd" stroke-width="3"/>`+ln(`M400 ${B-58}v32M384 ${B-42}h32`,3)+rc(520,B-140,12,70,'#333','stroke="#aaa"')+rc(514,B-146,24,8,'#444')+[0,1,2,3,4].map(i=>`<ellipse cx="${300+i*40}" cy="${B+6}" rx="22" ry="8" fill="#2a2a2a" stroke="#777"/>`).join(''),
 farm:()=>`<path d="M230 ${B}V${B-100}L335 ${B-165}L440 ${B-100}V${B}Z" fill="#161616" stroke="#ddd" stroke-width="2"/>`+rc(295,B-62,80,62,'#050505','stroke="#ddd"')+ln(`M295 ${B-62}L375 ${B}M375 ${B-62}L295 ${B}`,1.5)+rc(470,B-150,48,150,'#1d1d1d','stroke="#ddd"')+`<path d="M470 ${B-150}Q494 ${B-185} 518 ${B-150}Z" fill="#ddd"/><g transform="translate(600 ${B-150})">${ln('M0 0V150',3)}<g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="${n?14:9}s" repeatCount="indefinite"/>${ln('M0-46V46M-46 0H46',4)}</g></g>`+Array.from({length:14},(_,i)=>rc(60+i*14,B+8,3,24,'#bbb')).join('')+ln(`M60 ${B+16}H246`,2,'#bbb'),
 street:()=>{const car=(x,y,k)=>`<g transform="translate(${x} ${y}) scale(${k})"><path d="M0 0v-24h22l14-20h40l16 20h18v24Z" fill="#101010" stroke="#ccc" stroke-width="2"/><circle cx="24" cy="2" r="9" fill="#000" stroke="#ccc" stroke-width="2"/><circle cx="92" cy="2" r="9" fill="#000" stroke="#ccc" stroke-width="2"/></g>`;
  return rc(40,B-190,170,190,'#0b0b0b','stroke="#666"')+rc(590,B-210,170,210,'#0b0b0b','stroke="#666"')+[0,1,2].map(i=>[0,1,2,3].map(j=>rc(58+j*38,B-170+i*55,22,30,lit())+rc(608+j*38,B-190+i*55,22,30,lit())).join('')).join('')+car(250,B+40,1.5)+car(470,B+55,1.3)+[160,640].map(x=>ln(`M${x} ${B+20}V${B-120}h22`,4)).join('')},
 road:()=>`<path d="M300 450L385 ${hz}H415L500 450Z" fill="#161616" stroke="#555"/>`+ln(`M400 450V${hz}`,3,'#aaa').replace('fill="none"','fill="none" stroke-dasharray="12 14"')+`<g transform="translate(250 ${B+60})"><path d="M0 0v-24h22l14-20h40l16 20h18v24Z" fill="#0b0b0b" stroke="#ccc" stroke-width="2"/><circle cx="24" cy="2" r="9" fill="#000" stroke="#ccc" stroke-width="2"/><circle cx="92" cy="2" r="9" fill="#000" stroke="#ccc" stroke-width="2"/></g>`,
 market:()=>rc(180,B-130,440,130,'#161616','stroke="#ddd" stroke-width="2"')+rc(250,B-170,300,38,'#e6e6e6')+`<text x="400" y="${B-143}" font-family="Georgia" font-size="22" font-weight="bold" letter-spacing="6" text-anchor="middle" fill="#111">MERCADO</text>`+rc(300,B-80,100,80,'#030303','stroke="#ddd"')+rc(410,B-80,100,80,'#030303','stroke="#ddd"')+ln(`M310 ${B-70}l30 40l20-30M450 ${B-70}l-20 50`,1)+[0,1,2].map(i=>rc(540+i*20,B-26,16,26,'none','stroke="#aaa"')).join(''),
 pharmacy:()=>rc(250,B-140,300,140,'#171717','stroke="#ddd" stroke-width="2"')+rc(388,B-215,24,90,'#f0f0f0')+rc(355,B-182,90,24,'#f0f0f0')+rc(290,B-90,90,90,lit(),'stroke="#ddd"')+rc(420,B-90,90,90,'#030303','stroke="#ddd"')+ln(`M300 ${B-120}H540`,1),
 workshop:()=>rc(190,B-120,420,120,'#161616','stroke="#ddd" stroke-width="2"')+[0,1].map(i=>rc(220+i*190,B-90,160,90,'#0a0a0a','stroke="#ddd"')+[1,2,3,4,5].map(k=>ln(`M${220+i*190} ${B-90+k*15}h160`,1,'#777')).join('')).join('')+ln(`M640 ${B}V${B-190}L520 ${B-190}L430 ${B-130}`,5,'#999')+[0,1,2].map(i=>`<circle cx="${130+i*14}" cy="${B+10-i*22}" r="20" fill="#000" stroke="#aaa" stroke-width="5"/>`).join(''),
 reservoir:()=>rc(330,B-215,140,64,'#1c1c1c','stroke="#ddd" stroke-width="2"')+ln(`M345 ${B-151}L320 ${B}M455 ${B-151}L480 ${B}M400 ${B-151}V${B}`,4,'#999')+`<ellipse cx="400" cy="${B+40}" rx="300" ry="38" fill="#080808" stroke="#ccc"/>`+[0,1,2,3].map(i=>ln(`M${160+i*40} ${B+30+i*4}q30-8 60 0t60 0`,1.2,'#888')).join(''),
 radio:()=>ln(`M330 ${B}L400 ${hz-170}L470 ${B}`,4,'#ddd')+[0,1,2,3,4,5].map(i=>ln(`M${340+i*8} ${B-i*28}L${460-i*8} ${B-i*28-14}M${460-i*8} ${B-i*28}L${340+i*8} ${B-i*28-14}`,1.2,'#aaa')).join('')+`<circle cx="400" cy="${hz-172}" r="5" fill="#fff"><animate attributeName="opacity" values="1;0;1" dur="1.8s" repeatCount="indefinite"/></circle>`+rc(480,B-60,110,60,'#151515','stroke="#ddd"')+rc(500,B-42,26,24,lit())};
 s+=(F[kind]||F.street)();
 const f=o.fig;
 if(f=='m')for(let i=0;i<(o.n||2);i++)s+=man(250+i*150+r()*80,B+55+i*10,1.2-i*.12,'m');
 if(f=='g')for(let i=0;i<4;i++)s+=man(270+i*70+r()*20,B+60+(i%2)*12,1.2,i==1?'g':'p');
 if(f=='l')s+=man(400,B+78,1.45,'l');
 s+=`<rect width="800" height="450" filter="url(#gn)" opacity=".16"/></svg>`;return s}
export function portrait(look){
 const r=R(look*97+13),p=a=>a[Math.floor(r()*a.length)],sk=p(['#ededed','#d6d6d6','#bcbcbc','#a0a0a0','#848484']),hc=p(['#0b0b0b','#2b2b2b','#5a5a5a','#e6e6e6','#8a8a8a']);
 const fw=21+r()*7|0,fh=27+r()*6|0,hs=r()*6|0,ex=r()*5|0,cx=48,cy=46;
 let o=`<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="p${look}" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line y2="5" stroke="#333" stroke-width="1.5"/></pattern></defs><rect width="96" height="96" fill="#151515"/><rect width="96" height="96" fill="url(#p${look})"/>`;
 o+=`<path d="M6 96Q10 70 48 68Q86 70 90 96Z" fill="${p(['#3a3a3a','#6a6a6a','#1f1f1f','#8f8f8f'])}" stroke="#000"/>`+rc(42,60,12,14,sk,'stroke="#000"');
 if(hs==1)o+=`<path d="M${cx-fw-5} 44Q48 4 ${cx+fw+5} 44L${cx+fw+7} 86L${cx-fw-7} 86Z" fill="${hc}" stroke="#000"/>`;
 o+=`<ellipse cx="${cx}" cy="${cy}" rx="${fw}" ry="${fh}" fill="${sk}" stroke="#000" stroke-width="1.5"/>`;
 if(hs==0)o+=`<path d="M${cx-fw} ${cy-8}Q${cx} ${cy-fh-14} ${cx+fw} ${cy-8}Q${cx} ${cy-20} ${cx-fw} ${cy-8}Z" fill="${hc}" stroke="#000"/>`;
 if(hs==1)o+=`<path d="M${cx-fw} ${cy-6}Q${cx-4} ${cy-fh-10} ${cx+fw} ${cy-4}Q${cx+6} ${cy-22} ${cx-fw} ${cy-6}Z" fill="${hc}" stroke="#000"/>`;
 if(hs==3)o+=`<path d="M${cx-6} ${cy-fh+2}L${cx} ${cy-fh-16}L${cx+6} ${cy-fh+2}Z" fill="${hc}" stroke="#000"/>`;
 if(hs==4)o+=`<path d="M${cx-fw-2} ${cy-10}Q${cx} ${cy-fh-20} ${cx+fw+2} ${cy-10}Z" fill="${hc}" stroke="#000"/>`+rc(cx-fw-3,cy-13,fw*2+6,7,'#bbb','stroke="#000"');
 if(hs==5)o+=`<path d="M${cx-fw} ${cy-12}Q${cx} ${cy-fh-14} ${cx+fw} ${cy-12}Z" fill="${hc}" stroke="#000"/>`+rc(cx-4,cy-14,fw+14,5,hc,'stroke="#000"');
 const ey=cy-4,bw=1+r()*2;
 o+=`<circle cx="${cx-9}" cy="${ey}" r="2.4" fill="#000"/><circle cx="${cx+9}" cy="${ey}" r="2.4" fill="#000"/>`+ln(`M${cx-14} ${ey-6}L${cx-5} ${ey-6-r()*2}M${cx+14} ${ey-6}L${cx+5} ${ey-6-r()*2}`,bw,'#000');
 o+=ln(`M${cx} ${ey+2}L${cx-2} ${ey+12}L${cx+2} ${ey+12}`,1,'#000')+ln(`M${cx-7} ${cy+17}Q${cx} ${cy+17+(r()*8-3)|0} ${cx+7} ${cy+17}`,1.6,'#000');
 if(ex==1)o+=`<circle cx="${cx-9}" cy="${ey}" r="7" fill="none" stroke="#000" stroke-width="1.5"/><circle cx="${cx+9}" cy="${ey}" r="7" fill="none" stroke="#000" stroke-width="1.5"/>`+ln(`M${cx-2} ${ey}h4`,1.5,'#000');
 if(ex==2)o+=ln(`M${cx+8} ${cy-18}L${cx+16} ${cy+8}`,2,'#000');
 if(ex==3)o+=`<path d="M${cx-fw+2} ${cy+4}Q${cx} ${cy+fh+8} ${cx+fw-2} ${cy+4}Q${cx} ${cy+16} ${cx-fw+2} ${cy+4}Z" fill="${hc}" stroke="#000"/>`;
 if(ex==4)o+=rc(cx-16,cy-22,18,8,'#eee','stroke="#000" transform="rotate(-12 48 28)"');
 return o+'</svg>'}
