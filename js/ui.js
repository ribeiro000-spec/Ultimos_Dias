import * as G from './engine.js';
import * as ST from './story.js';
import {scene,figLayer} from './gfx.js';
import * as au from './audio.js';
import {runMini} from './mini.js';
import {RES,UPG,IMG,PLACE} from './data.js';
const $=q=>document.querySelector(q);
let S=null,view='menu',artKey='',typer=null,stop=null,cardT=null,rec=false,toastT=null;
const esc=t=>String(t).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const IC={water:'<path d="M12 3C8 9 6 12 6 15a6 6 0 0012 0c0-3-2-6-6-12z"/>',food:'<path d="M4 11h16a8 8 0 01-16 0zM8 7c0-2 2-2 2-4M13 7c0-2 2-2 2-4"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',skull:'<path d="M12 3a8 8 0 00-5 14v3h10v-3a8 8 0 00-5-14z"/><circle cx="9" cy="11" r="1.4"/><circle cx="15" cy="11" r="1.4"/>',vol:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11"/>',mute:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/>'};
const svg=k=>`<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k]}</svg>`;
const ico=l=>/Lutar|Defender|Resistir|arma|Mostrar/.test(l)?'⚔':/Fugir|Evitar|Recusar|Expulsar|Ignorar|Voltar|Desistir/.test(l)?'↩':/Tratar|medic|Interrogar|Investigar/.test(l)?'✚':/Esconder|silêncio/i.test(l)?'◐':/Encerrar|Dormir/.test(l)?'☾':/Melhorar|Reparar|Fabricar|Construir|Reforçar/.test(l)?'⚙':/Nova|Menu/.test(l)?'◆':'➤';
const chips=c=>[c.pt?c.pt+' PT':'',...Object.entries(c.res||{}).map(([k,v])=>v+' '+RES[k].toLowerCase())].filter(Boolean).map(x=>`<i>${x}</i>`).join('');
const bar=v=>`<div class="bar ${v<30?'low':''}"><i style="width:${Math.max(0,Math.min(100,v))}%"></i></div>`;
function toast(t){const e=$('#toast');e.textContent=t;e.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>e.hidden=true,2400)}
function soundBtn(){$('#bSound').innerHTML=svg(au.isMuted()?'mute':'vol');$('#bSound').title=au.isMuted()?'Som desligado':'Som ligado'}
function setArt(bg){const k=JSON.stringify(bg);if(k!=artKey){artKey=k;const art=$('#art'),src=IMG[bg.kind],el=document.createElement('div');el.className='layer';
  el.innerHTML=(src?`<img src="assets/scenes/${src}.jpg" alt="" class="${bg.night?'night':''}">`:scene(bg.kind,bg))+(bg.fig?figLayer(bg):'');art.appendChild(el);requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('in')));
  setTimeout(()=>[...art.children].filter(c=>c!==el).forEach(c=>c.remove()),1000)}
 $('#fx').className=(bg.rain?'rain ':'')+(bg.fog||(bg.night&&!bg.rain)?'fog ':'');au.mode(bg.kind=='bunker'?'bunker':bg.night?'night':'day')}
function typeText(text,cb){clearInterval(typer);const el=$('#txt');if(matchMedia('(prefers-reduced-motion:reduce)').matches){el.textContent=text;return cb()}
 let i=0;const fin=()=>{clearInterval(typer);el.textContent=text;el.onclick=null;cb()};el.onclick=fin;typer=setInterval(()=>{el.textContent=text.slice(0,++i);if(i>=text.length)fin()},16)}
function menu(){
 setArt({kind:'city',night:1,seed:7});$('#fx').className='fog';const r=G.records(),sv=G.hasSave();
 $('#menu').innerHTML=`<div class="mtitle"><small>sobreviva ao fim do mundo</small><h1>ÚLTIMOS<br>DIAS</h1></div><div class="mbtns"><button class="mb" data-a="cont" ${sv?'':'disabled'}><span>➤</span>Continuar campanha</button><button class="mb" data-a="new"><span>◆</span>Nova campanha</button><button class="mb" data-a="rec"><span>☰</span>Recordes</button><button class="mb" data-a="imp"><span>⇪</span>Importar campanha</button><button class="mb" data-a="snd"><span>${au.isMuted()?'✕':'♪'}</span>Som: ${au.isMuted()?'desligado':'ligado'}</button></div><input type="file" id="file" accept="application/json" hidden>${rec?`<div class="rec">Melhor: <b>${r.best}</b> dias · Campanhas: ${r.games} · Dias totais: ${r.days}<br>Perdas: ${r.lost} · Ataques repelidos: ${r.repelled}<br>Última derrota: ${esc(r.last)}</div>`:''}<p class="mut foot">Use fones de ouvido · progresso salvo automaticamente</p>`}
function panelHtml(){
 const res=Object.entries(S.resources).map(([k,v])=>`<div>${RES[k]}<b>${v}</b></div>`).join('');
 const svs=S.survivors.map(v=>{const off=v.dead||v.left;return`<div class="sv ${off?'dead':''}"><img src="assets/portraits/${String(v.img).padStart(2,'0')}.jpg" alt="Retrato de ${esc(v.name)}"><div><b>${esc(v.name)}</b> <em>${v.skill}${v.wife?' · esposa':''}${v.dead?' · morto':v.left?' · partiu':''}</em>${off?'':`<div class="bars"><span>Saúde ${Math.round(v.health)}</span>${bar(v.health)}<span>Moral ${Math.round(v.morale)}</span>${bar(v.morale)}</div><small>Lealdade ${Math.round(v.loyalty)} · Cmb ${v.combat} · Exp ${v.exploration} · Téc ${v.technique} · Med ${v.medicine}</small><small class="d">${v.desc}</small>${v.checked?`<small>Investigação: ${esc(v.checked)}</small>`:''}`}</div></div>`}).join('');
 return`<h2>Estoque <span>${G.total(S)}/${G.cap(S)}</span></h2><div class="res">${res}</div><h2>Base</h2><p>${PLACE[S.base.id]||''}<br>Segurança ${G.security(S)} · Ameaça ${G.threat(S)}/100 · Dano ${S.base.damage}<br>${S.base.upgrades.length?S.base.upgrades.map(u=>UPG[u].name.split(' (')[0]).join(', '):'Sem melhorias'}</p><h2>Grupo <span>${G.alive(S).length}/${S.base.pop}</span></h2>${svs}<h2>Registro</h2><div class="lg">${S.history.slice(0,16).map(h=>`<p><span>Dia ${h.d}</span> ${esc(h.t)}</p>`).join('')}</div><h2>Sistema</h2><div class="row2"><button class="mb sm" data-a="exp">Exportar JSON</button><button class="mb sm" data-a="menu">Menu</button></div>`}
function fillPanel(){$('#panel').innerHTML=`<div class="phead"><b>STATUS</b><button class="icon" data-a="pclose" aria-label="Fechar">✕</button></div>`+panelHtml()}
function panel(open){$('#panel').hidden=!open;$('#shade').hidden=!open;if(open)fillPanel();$('#bPanel').textContent=open?'✕':'☰'}
function hud(){const n=G.alive(S).length,T=G.threat(S),r=S.resources;
 const chip=(k,v,l,w)=>`<span class="chip ${w?'warn':''}" title="${l}">${svg(k)}<b>${v}</b>${w?'<i>!</i>':''}</span>`;
 $('#stats').innerHTML=`<span class="day"><small>DIA</small><b>${S.day||'—'}</b></span>`+chip('clock',S.time.remaining+'/'+S.time.total,'Tempo',S.time.remaining<3)+chip('water',r.water,'Água',r.water<n*2)+chip('food',r.food,'Comida',r.food<n*2)+chip('skull',T,'Ameaça',T>45);
 soundBtn();if(!$('#panel').hidden)fillPanel()}
function render(){
 clearTimeout(cardT);stop&&stop();stop=null;clearInterval(typer);
 const inGame=view=='game';$('#menu').hidden=inGame;$('#hud').hidden=!inGame;
 if(!inGame){$('#box').hidden=true;panel(false);$('#card').hidden=true;return menu()}
 const d=ST.SC[S.sc.id](S,S.sc.ctx);setArt(d.bg);hud();
 if(d.card){$('#box').hidden=true;const c=$('#card');c.hidden=false;c.innerHTML=`<div><em>DIA</em><strong>${d.card.n}</strong><span>após o apocalipse</span></div>`;au.sfx.sting();
  const go=()=>{clearTimeout(cardT);c.hidden=true;d.next(S);G.save(S);render()};c.onclick=go;cardT=setTimeout(go,3000);return}
 $('#card').hidden=true;$('#box').hidden=false;$('#ch').innerHTML='';$('#mini').innerHTML='';
 $('#tag').textContent=(PLACE[d.bg.kind]||'')+(S.day?' · Dia '+S.day:'');
 const nw=$('#news');nw.hidden=!d.news;if(d.news){nw.innerHTML=`<b>● AO VIVO</b><div class="tick"><span>${esc(d.news)}</span></div>`;$('#fx').classList.add('tv');if(d.sfx)au.sfx[d.sfx]()}
 if(d.mini){typeText(d.text,()=>{stop=runMini($('#mini'),d.mini,res=>{const c=S.sc.ctx;d.done(S,c,res);after()})});return}
 typeText(d.text,()=>{$('#ch').innerHTML=d.choices.map((c,i)=>`<button class="ch" data-c="${i}" ${c.off?'disabled':''}><span class="n">${i+1}</span><span class="ic2">${ico(c.l)}</span><span class="lb">${esc(c.l)}</span><span class="cost">${chips(c)}</span></button>`).join('')})}
function after(){G.reap(S);if(S.gameOver&&!['night','over'].includes(S.sc.id))ST.go(S,'over');G.save(S);render()}
function choose(i){const d=ST.SC[S.sc.id](S,S.sc.ctx),c=d.choices&&d.choices[i];if(!c||c.off)return;au.sfx.click();
 if(c.act)return c.act=='new'?newGame():(view='menu',render());
 const e=ST.choose(S,i);if(e)return toast(e);
 const n=S.sc.id;if(n=='monster')au.sfx.growl();if(n=='lone'&&S.sc.ctx.where=='gate'&&!S.sc.ctx.inv)au.sfx.knock();if(n=='night')au.sfx.heart();if(n=='dusk')au.sfx.danger();after()}
function newGame(){S=G.newGame();view='game';G.save(S);render()}
['pointerdown','touchend','click','keydown'].forEach(ev=>addEventListener(ev,()=>au.init(),{passive:true}));
document.addEventListener('keydown',e=>{if(e.key=='Escape')panel(false);if(view=='game'&&/^[1-9]$/.test(e.key))choose(+e.key-1)});
$('#ch').addEventListener('click',e=>{const b=e.target.closest('button');if(b)choose(+b.dataset.c)});
$('#bPanel').onclick=()=>panel($('#panel').hidden);
$('#shade').onclick=()=>panel(false);
$('#bSound').onclick=()=>{au.init();au.toggle();soundBtn();toast(au.isMuted()?'Som desligado':'Som ligado')};
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b||b.disabled)return;const a=b.dataset.a;au.init();
 if(a=='pclose')panel(false);
 else if(a=='cont'){const s=G.load();if(s){S=s;view='game';render()}}
 else if(a=='new'){if(!G.hasSave()||confirm('Iniciar nova campanha? O salvamento atual será substituído.'))newGame()}
 else if(a=='rec'){rec=!rec;menu()}else if(a=='snd'){au.toggle();menu()}else if(a=='imp')$('#file').click();
 else if(a=='menu'){view='menu';render()}
 else if(a=='exp'){const u=URL.createObjectURL(new Blob([JSON.stringify(S,null,1)],{type:'application/json'})),l=document.createElement('a');l.href=u;l.download='ultimos-dias-dia'+S.day+'.json';l.click();URL.revokeObjectURL(u)}});
document.addEventListener('change',e=>{if(e.target.id!='file')return;const f=e.target.files[0];if(f)f.text().then(t=>{const s=JSON.parse(t);if(G.validate(s)){S=s;view='game';render()}else alert('Arquivo inválido.')}).catch(()=>alert('Não foi possível ler o arquivo.'))});
render();
