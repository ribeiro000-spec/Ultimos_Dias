import * as G from './engine.js';
import * as ST from './story.js';
import {scene,portrait} from './gfx.js';
import * as au from './audio.js';
import {runMini} from './mini.js';
import {RES,UPG} from './data.js';
const $=q=>document.querySelector(q);
let S=null,view='menu',artKey='',typer=null,stop=null,cardT=null,rec=false,toastT=null;
const esc=t=>String(t).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const cost=c=>[c.pt?c.pt+' PT':'',...Object.entries(c.res||{}).map(([k,v])=>v+' '+RES[k].toLowerCase())].filter(Boolean).join(' · ');
const bar=v=>`<div class="bar ${v<30?'low':''}"><i style="width:${Math.max(0,Math.min(100,v))}%"></i></div>`;
function toast(t){const e=$('#toast');e.textContent=t;e.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>e.hidden=true,2400)}
function setArt(bg){const k=JSON.stringify(bg);if(k!=artKey){artKey=k;$('#art').innerHTML=scene(bg.kind,bg)}
 $('#fx').className=(bg.rain?'rain ':'')+(bg.fog||bg.night&&!bg.rain?'fog':'');au.mode(bg.kind=='bunker'?'bunker':bg.night?'night':'day')}
function typeText(text,cb){clearInterval(typer);const el=$('#txt');if(matchMedia('(prefers-reduced-motion:reduce)').matches){el.textContent=text;return cb()}
 let i=0;const fin=()=>{clearInterval(typer);el.textContent=text;el.onclick=null;cb()};el.onclick=fin;typer=setInterval(()=>{el.textContent=text.slice(0,++i);if(i>=text.length)fin()},14)}
function menu(){
 setArt({kind:'street',night:1,seed:7,fig:'l'});const r=G.records(),sv=G.hasSave();
 $('#menu').innerHTML=`<h1>ÚLTIMOS DIAS</h1><p class="mut">Sobreviva ao maior número possível de dias.</p><button data-a="cont" ${sv?'':'disabled'}>Continuar campanha</button><button data-a="new">Nova campanha</button><button data-a="rec">Recordes</button><button data-a="imp">Importar campanha (JSON)</button><button data-a="snd">Som: ${au.isMuted()?'desligado':'ligado'}</button><input type="file" id="file" accept="application/json" hidden>${rec?`<div class="rec">Melhor: ${r.best} dias · Campanhas: ${r.games}<br>Dias totais: ${r.days} · Perdas: ${r.lost} · Repelidos: ${r.repelled}<br>Última derrota: ${esc(r.last)}</div>`:''}<p class="mut">Use fones de ouvido. Progresso salvo automaticamente.</p>`}
function panelHtml(){
 const res=Object.entries(S.resources).map(([k,v])=>`<div>${RES[k]}<b>${v}</b></div>`).join('');
 const svs=S.survivors.map(v=>`<div class="sv ${v.dead||v.left?'dead':''}">${portrait(v.look)}<div><b>${esc(v.name)}</b> · ${v.skill}${v.dead?' · morto':v.left?' · partiu':''}${v.dead||v.left?'':`<br>Saúde ${Math.round(v.health)}${bar(v.health)}Moral ${Math.round(v.morale)}${bar(v.morale)}<small>Lealdade ${Math.round(v.loyalty)} · Cmb ${v.combat} Exp ${v.exploration} Téc ${v.technique} Med ${v.medicine}${v.checked?'<br>Investigação: '+esc(v.checked):''}</small>`}</div></div>`).join('');
 return`<h2>Estoque ${G.total(S)}/${G.cap(S)}</h2><div class="res">${res}</div><h2>Base</h2><p>Segurança ${G.security(S)} · Ameaça ${G.threat(S)}/100 · Dano ${S.base.damage}<br>${S.base.upgrades.length?S.base.upgrades.map(u=>UPG[u].name.split(' (')[0]).join(', '):'Sem melhorias'}</p><h2>Grupo (${G.alive(S).length}/${S.base.pop})</h2>${svs}<h2>Registro</h2><div class="lg">${S.history.slice(0,16).map(h=>`<p><span>Dia ${h.d}</span> ${esc(h.t)}</p>`).join('')}</div><h2>Sistema</h2><button data-a="exp">Exportar campanha (JSON)</button> <button data-a="menu">Menu</button>`}
function hud(){const T=G.threat(S);$('#stats').innerHTML=`<b>DIA ${S.day||'—'}</b><span>Tempo ${S.time.remaining}/${S.time.total}</span><span>Água ${S.resources.water}</span><span>Comida ${S.resources.food}</span><span>Ameaça ${T}</span>`;if(!$('#panel').hidden)$('#panel').innerHTML=panelHtml()}
function render(){
 clearTimeout(cardT);stop&&stop();stop=null;clearInterval(typer);
 const inGame=view=='game';$('#menu').hidden=inGame;$('#hud').hidden=!inGame;
 if(!inGame){$('#box').hidden=true;$('#panel').hidden=true;$('#card').hidden=true;return menu()}
 const d=ST.SC[S.sc.id](S,S.sc.ctx);setArt(d.bg);hud();
 if(d.card){$('#box').hidden=true;const c=$('#card');c.hidden=false;c.innerHTML=`<span>${d.card}</span>`;au.sfx.sting();
  const go=()=>{clearTimeout(cardT);c.hidden=true;d.next(S);G.save(S);render()};c.onclick=go;cardT=setTimeout(go,2700);return}
 $('#card').hidden=true;$('#box').hidden=false;$('#ch').innerHTML='';$('#mini').innerHTML='';
 if(d.mini){typeText(d.text,()=>{stop=runMini($('#mini'),d.mini,res=>{const c=S.sc.ctx;d.done(S,c,res);after()})});return}
 typeText(d.text,()=>{$('#ch').innerHTML=d.choices.map((c,i)=>`<button data-c="${i}" ${c.off?'disabled':''}>${i+1}. ${esc(c.l)}${c.pt||c.res?` <small class="mut">[${cost(c)}]</small>`:''}</button>`).join('')})}
function after(){G.reap(S);if(S.gameOver&&!['night','over'].includes(S.sc.id))ST.go(S,'over');G.save(S);render()}
function choose(i){const d=ST.SC[S.sc.id](S,S.sc.ctx),c=d.choices&&d.choices[i];if(!c||c.off)return;au.sfx.click();
 if(c.act)return c.act=='new'?newGame():(view='menu',render());
 const e=ST.choose(S,i);if(e)return toast(e);
 const n=S.sc.id;if(n=='monster')au.sfx.growl();if(n=='lone'&&S.sc.ctx.where=='gate'&&!S.sc.ctx.inv)au.sfx.knock();if(n=='night')au.sfx.heart();if(n=='dusk')au.sfx.danger();after()}
function newGame(){S=G.newGame();view='game';G.save(S);render()}
document.addEventListener('pointerdown',()=>au.init(),{once:true});
document.addEventListener('keydown',e=>{if(view=='game'&&/^[1-9]$/.test(e.key)&&!$('#ch').hidden)choose(+e.key-1)});
$('#ch').addEventListener('click',e=>{const b=e.target.closest('button');if(b)choose(+b.dataset.c)});
$('#bPanel').onclick=()=>{const p=$('#panel');p.hidden=!p.hidden;if(!p.hidden)p.innerHTML=panelHtml()};
$('#bSound').onclick=()=>{au.init();au.toggle()};
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b||b.disabled)return;const a=b.dataset.a;au.init();
 if(a=='cont'){const s=G.load();if(s){S=s;view='game';render()}}
 else if(a=='new'){if(!G.hasSave()||confirm('Iniciar nova campanha? O salvamento atual será substituído.'))newGame()}
 else if(a=='rec'){rec=!rec;menu()}else if(a=='snd'){au.toggle();menu()}else if(a=='imp')$('#file').click();
 else if(a=='menu'){view='menu';render()}
 else if(a=='exp'){const u=URL.createObjectURL(new Blob([JSON.stringify(S,null,1)],{type:'application/json'})),l=document.createElement('a');l.href=u;l.download='ultimos-dias-dia'+S.day+'.json';l.click();URL.revokeObjectURL(u)}});
document.addEventListener('change',e=>{if(e.target.id!='file')return;const f=e.target.files[0];if(f)f.text().then(t=>{const s=JSON.parse(t);if(G.validate(s)){S=s;view='game';render()}else alert('Arquivo inválido.')}).catch(()=>alert('Não foi possível ler o arquivo.'))});
render();
