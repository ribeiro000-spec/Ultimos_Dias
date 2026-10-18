import * as G from './engine.js';
import {RES,LOCS,UPG} from './data.js';
import {EVENTS} from './events.js';
const app=document.getElementById('app');
let S=null,squad=new Set(),toast='',view='menu';
const esc=t=>String(t).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const costTxt=c=>Object.entries(c).map(([k,v])=>v+' '+RES[k].toLowerCase()).join(' + ');
const bar=(v,m=100)=>`<div class="bar ${v/m<.3?'low':''}"><i style="width:${Math.max(0,Math.min(100,v/m*100))}%"></i></div>`;
const riskTxt=r=>r>=.4?'risco alto ▲▲▲':r>=.25?'risco médio ▲▲':'risco baixo ▲';
const logHtml=n=>S.history.slice(0,n).map(h=>`<p><span>Dia ${h.d}</span> ${esc(h.t)}</p>`).join('');

function menu(){
 const r=G.records(),sv=G.hasSave();
 app.innerHTML=`<div class="menu"><h1>ÚLTIMOS DIAS</h1><p class="mut">Sobreviva ao maior número possível de dias.</p>
 <img src="assets/base.svg" alt="" style="width:100%;max-width:520px;border:1px solid #3a3a3a">
 <button data-a="cont" ${sv?'':'disabled'}>Continuar campanha</button><button data-a="new">Nova campanha</button>
 <button data-a="rec">Recordes e estatísticas</button><button data-a="imp">Importar campanha (JSON)</button>
 <input type="file" id="file" accept="application/json" hidden>
 ${view=='rec'?`<div class="card" style="text-align:left"><h2>Recordes</h2><p>Melhor: ${r.best} dias · Campanhas: ${r.games} · Dias totais: ${r.days}<br>Perdas: ${r.lost} · Ataques repelidos: ${r.repelled}<br>Última derrota: ${esc(r.last)}</p></div>`:''}
 <p class="mut">Progresso salvo automaticamente neste navegador.</p></div>`}

function sv(v){
 const dead=v.dead||v.left,sel=squad.has(v.id)&&!dead;
 return`<div class="sv ${sel?'sel':''} ${dead?'dead':''}"><img src="assets/portrait.svg" alt="">
 <div><b>${esc(v.name)}</b> <small>${v.skill}${v.dead?' · morto':v.left?' · partiu':''}</small>
 ${dead?'':`<div>Saúde ${Math.round(v.health)}${bar(v.health)}Moral ${Math.round(v.morale)}${bar(v.morale)}<small>Lealdade ${Math.round(v.loyalty)} · Cmb ${v.combat} Exp ${v.exploration} Téc ${v.technique} Med ${v.medicine}</small>
 ${v.checked?`<br><small>Investigação: ${esc(v.checked)}</small>`:''}
 <div class="row"><button data-a="sq" data-i="${v.id}" aria-pressed="${sel}">${sel?'✔ Na expedição':'Enviar'}</button><button data-a="tr" data-i="${v.id}">Tratar (1 PT)</button><button data-a="inv" data-i="${v.id}">Investigar (2 PT)</button></div></div>`}</div></div>`}

function over(){const st=S.stats;
 app.innerHTML=`<div class="menu"><h1>FIM</h1><section style="text-align:left"><h2>Você sobreviveu ${S.day} dias</h2><p><b>Causa:</b> ${esc(S.cause||'—')}</p>
 <p>Recrutados: ${st.recruited} · Perdidos: ${st.lost}<br>Recursos coletados: ${st.collected}<br>Ataques repelidos: ${st.repelled}<br>Expedições: ${st.expeditions} · Decisões: ${st.decisions}</p>
 <p class="mut">Semente: ${S.seed}</p></section>
 <section class="log" style="text-align:left"><h2>Últimos registros</h2>${logHtml(8)}</section>
 <button data-a="new">Nova campanha</button><button data-a="menu">Menu</button></div>`}

function game(){
 if(S.gameOver)return over();
 const T=G.threat(S),E=S.event&&EVENTS.find(e=>e.id==S.event.id);
 const res=Object.entries(S.resources).map(([k,v])=>`<div>${RES[k]}<b>${v}</b></div>`).join('');
 const ev=E?(()=>{const o=E.opts(S,S.event.d,G.A);return`<section class="event"><h2>${E.title}</h2><p>${E.text(S,S.event.d)}</p><div class="acts">${o.map((x,i)=>`<button data-a="ev" data-i="${i}" ${x.off?'disabled':''}>${x.l}${x.pt?` · ${x.pt} PT`:''}</button>`).join('')}</div></section>`})():'';
 app.innerHTML=`<div class="top"><div class="stats"><b>Dia ${S.day}</b><span>Tempo ${S.time.remaining}/${S.time.total} PT</span><span>Ameaça ${T}/100</span><span>Segurança ${G.security(S)}</span><span>Estoque ${G.total(S)}/${G.cap(S)}</span></div><div class="res">${res}</div></div>
 ${toast?`<div class="toast" role="alert">${esc(toast)}</div>`:''}
 ${ev}
 <div class="grid"><div>
 <section class="scene"><img src="assets/base.svg" alt="Delegacia abandonada"><p class="mut">Delegacia abandonada${S.base.damage?` · dano ${S.base.damage}`:''}</p></section>
 <section><h2>Sobreviventes (${G.alive(S).length})</h2>${S.survivors.map(sv).join('')}</section></div>
 <div><section><h2>Explorar</h2><p class="mut">Toque em "Enviar" nos sobreviventes para formar a expedição. Quem sai não defende a base.</p><div class="acts">
 ${LOCS.map(l=>`<button data-a="loc" data-i="${l.id}">${l.name} · ${l.cost} PT<br><small>${riskTxt(l.risk)} · ${l.note}${S.visits[l.id]?` · visitas ${S.visits[l.id]}`:''}</small></button>`).join('')}</div></section>
 <section><h2>Base</h2><div class="acts">
 ${Object.entries(UPG).map(([id,u])=>{const own=!u.rep&&S.base.upgrades.includes(id);return`<button data-a="bld" data-i="${id}" ${own?'disabled':''}>${own?'✔ ':''}${u.name} · 3 PT<br><small>${costTxt(u.cost)}</small></button>`}).join('')}
 <button data-a="craft">Fabricar munição · 2 PT<br><small>3 materiais → 4 munições (exige oficina)</small></button>
 <button data-a="rep">Reparar estrutura · 2 PT<br><small>2 materiais, −12 de dano</small></button></div></section>
 <section><button data-a="end" style="width:100%;text-align:center">Encerrar dia ${S.day}</button></section></div></div>
 <section class="log"><h2>Registro</h2>${logHtml(14)}</section>
 <div class="row"><button data-a="menu">Menu</button><button data-a="exp">Exportar campanha (JSON)</button></div>`}

const render=()=>view=='game'?game():menu();
function act(fn){toast=fn()||'';G.reap(S);G.save(S);render()}
function start(s){S=s;squad=new Set();toast='';view='game';G.save(S);render();scrollTo(0,0)}

app.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b||b.disabled)return;const a=b.dataset.a,i=b.dataset.i;
 if(a=='cont'){const s=G.load();if(s)start(s)}
 else if(a=='new'){if((S&&S.gameOver)||!G.hasSave()||confirm('Iniciar nova campanha? O salvamento atual será substituído.'))start(G.newGame())}
 else if(a=='rec'){view=view=='rec'?'menu':'rec';menu()}
 else if(a=='imp')document.getElementById('file').click();
 else if(a=='menu'){view='menu';render()}
 else if(a=='exp'){const u=URL.createObjectURL(new Blob([JSON.stringify(S,null,1)],{type:'application/json'})),l=document.createElement('a');l.href=u;l.download='ultimos-dias-dia'+S.day+'.json';l.click();URL.revokeObjectURL(u)}
 else if(a=='sq'){squad.has(+i)?squad.delete(+i):squad.add(+i);render()}
 else if(a=='tr')act(()=>G.treat(S,+i));
 else if(a=='inv')act(()=>G.investigate(S,+i));
 else if(a=='loc')act(()=>G.search(S,i,[...squad]));
 else if(a=='bld')act(()=>G.build(S,i));
 else if(a=='craft')act(()=>G.craft(S));
 else if(a=='rep')act(()=>G.repair(S));
 else if(a=='ev')act(()=>G.resolve(S,+i));
 else if(a=='end'){if(S.time.remaining>6&&!confirm('Ainda restam '+S.time.remaining+' PT. Encerrar o dia mesmo assim?'))return;act(()=>G.endDay(S))}
});
app.addEventListener('change',e=>{if(e.target.id!='file')return;const f=e.target.files[0];if(!f)return;
 f.text().then(t=>{const s=JSON.parse(t);G.validate(s)?start(s):alert('Arquivo de campanha inválido.')}).catch(()=>alert('Não foi possível ler o arquivo.'))});
menu();
