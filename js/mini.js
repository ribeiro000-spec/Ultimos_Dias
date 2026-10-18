import {sfx} from './audio.js';
export const R=seed=>{let t=seed|0;return()=>{t=(t+0x6D2B79F5)|0;let x=Math.imul(t^t>>>15,1|t);x^=x+Math.imul(x^x>>>7,61|x);return((x^x>>>14)>>>0)/4294967296}};
const LAB=['Gaveta','Armário','Caixa','Mochila','Prateleira','Carro','Lixeira','Balcão','Cofre','Barril','Estante','Maleta'];
const WN=['A ▬▬▬','B ┅┅┅','C ····','D ═══'];
const PERMS=(()=>{const o=[];(function g(p){if(p.length==4)return o.push(p);for(let i=0;i<4;i++)if(!p.includes(i))g([...p,i])})([]);return o})();
export function genWires(seed){
 const r=R(seed),perm=[0,1,2,3].sort(()=>r()-.5),pool=[];
 for(let a=0;a<4;a++){for(let t=0;t<4;t++)if(perm[a]!=t)pool.push({f:p=>p[a]!=t,tx:`${WN[a]} NÃO vai no terminal ${t+1}.`});
  for(let b=0;b<4;b++)if(a!=b){if(perm[a]<perm[b])pool.push({f:p=>p[a]<p[b],tx:`${WN[a]} fica à esquerda de ${WN[b]}.`});if(a<b&&Math.abs(perm[a]-perm[b])==1)pool.push({f:p=>Math.abs(p[a]-p[b])==1,tx:`${WN[a]} e ${WN[b]} ficam lado a lado.`})}}
 pool.sort(()=>r()-.5);const cl=[],left=()=>PERMS.filter(p=>cl.every(c=>c.f(p))).length;
 for(const c of pool){if(left()==1)break;const b=left();cl.push(c);if(left()>=b)cl.pop()}
 for(let a=0;a<4&&left()>1;a++)cl.push({f:p=>p[a]==perm[a],tx:`${WN[a]} está no terminal ${perm[a]+1}.`});
 return{perm,clues:cl.map(c=>c.tx),unique:left()==1}}
const EVI={thief:['Itens somem do estoque justamente nos turnos dele.','Uma mochila escondida com suprimentos foi achada atrás do depósito.','Ele mente sobre onde esteve na noite passada.'],
 spy:['Foi visto anotando rotas e horários da base.','Um rádio escondido sob o colchão dele.','Ele conhece detalhes de fora que nunca contou.'],
 inn:['Dois sobreviventes confirmam que ele vigiou a noite toda.','Ele devolveu um item achado, sem que ninguém pedisse.','Os registros de estoque batem nos dias em que ele cuidou do depósito.'],
 weakG:['Uma pegada parecida com a dele perto do depósito.','Alguém ouviu a voz dele de madrugada, mas estava escuro.'],weakI:['Ele jura inocência com lágrimas nos olhos.','Um amigo diz que "ele nunca faria isso".']};
const LV=['','baixa ▮▯▯','média ▮▮▯','alta ▮▮▮'];
export function runMini(el,m,done){
 let dead=false,raf=0;const cl=[],stop=()=>{dead=true;cancelAnimationFrame(raf);cl.forEach(f=>f())};
 const later=(f,ms)=>{const t=setTimeout(()=>!dead&&f(),ms);cl.push(()=>clearTimeout(t));return t};
 const T={
 search(){
  const r=R(m.seed),idx=[...Array(12).keys()].sort(()=>r()-.5),nl=3+Math.floor(r()*3),nd=m.risk>=.4?2:1,kind=i=>idx.indexOf(i)<nl?'L':idx.indexOf(i)<nl+nd?'D':'E',rev={};let tries=m.tries,found=0,fin=false;
  const draw=()=>{el.innerHTML=`<p class="mut">Busca: ${tries} tentativas. Algo perigoso pode estar escondido.</p><div class="sgrid">${LAB.map((l,i)=>`<button data-i="${i}" ${rev[i]?'disabled':''}>${rev[i]||l}</button>`).join('')}</div><button class="ghost" data-end="1">Encerrar busca</button>`};draw();
  const end=d=>{if(fin)return;fin=true;later(()=>done({found,total:nl,danger:d}),d?900:300)};
  el.onclick=e=>{const b=e.target.closest('button');if(!b||fin)return;if(b.dataset.end)return end(false);const i=+b.dataset.i,k=kind(i);tries--;
   if(k=='L'){found++;rev[i]='▣ Achado!';sfx.find()}else if(k=='D'){rev[i]='☠ Algo se move!';sfx.danger()}else{rev[i]='· vazio';sfx.step()}
   draw();if(k=='D')return end(true);if(!tries||found>=nl)end(false)}},
 timing(){
  const zw=m.zone,spd=m.speed||.9;let round=0,hits=0,pos=0,dir=1,zl=0,last=performance.now(),lock=false;
  const draw=(msg='')=>{el.innerHTML=`<p class="mut">${m.label} · Rodada ${Math.min(round+1,m.rounds)}/${m.rounds} · acertos ${hits}</p><div class="tbar"><i class="zone" style="left:${zl*100}%;width:${zw*100}%"></i><i class="mk" id="mk"></i></div><button data-go="1" class="big">AGORA! (Espaço)</button><p>${msg}</p>`};
  const nz=()=>{zl=.1+Math.random()*(.8-zw);draw()};nz();
  const tick=t=>{if(dead)return;pos+=dir*spd*(t-last)/1000;last=t;if(pos>1){pos=1;dir=-1}if(pos<0){pos=0;dir=1}const mk=el.querySelector('#mk');if(mk)mk.style.left=pos*100+'%';raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick);
  const hit=()=>{if(lock||dead)return;lock=true;const ok=pos>=zl&&pos<=zl+zw;if(ok){hits++;(m.gun?sfx.shot:sfx.hit)()}else sfx.miss();round++;
   if(round>=m.rounds){cancelAnimationFrame(raf);draw(ok?'Acerto!':'Errou...');later(()=>done(hits),600)}else{draw(ok?'Acerto!':'Errou...');later(()=>{lock=false;nz()},450)}};
  el.onclick=e=>{if(e.target.closest('[data-go]'))hit()};const key=e=>{if(e.code=='Space'){e.preventDefault();hit()}};addEventListener('keydown',key);cl.push(()=>removeEventListener('keydown',key))},
 wires(){
  const g=genWires(m.seed);let tries=m.tries,as=[-1,-1,-1,-1],msg='';
  const draw=()=>{el.innerHTML=`<img class="mimg" src="assets/scenes/fusebox.jpg" alt="Caixa de fusíveis com fios soltos"><p class="mut">Pistas gravadas na caixa:</p><ul class="clues">${g.clues.map(c=>`<li>${c}</li>`).join('')}</ul>${WN.map((n,w)=>`<div class="wrow"><b>${n}</b>${[0,1,2,3].map(t=>`<button data-w="${w}" data-t="${t}" class="${as[w]==t?'on':''}" aria-pressed="${as[w]==t}">${as[w]==t?'✔ ':''}${t+1}</button>`).join('')}</div>`).join('')}<p>${msg||'Tentativas: '+tries}</p><div class="row2"><button data-test="1" ${as.includes(-1)?'disabled':''}>Testar ligação</button><button data-quit="1" class="ghost">Desistir</button></div>`};draw();
  el.onclick=e=>{const b=e.target.closest('button');if(!b)return;sfx.click();
   if(b.dataset.quit)return done({ok:0});
   if(b.dataset.w){const w=+b.dataset.w,t=+b.dataset.t;as=as.map(x=>x==t?-1:x);as[w]=t;return draw()}
   if(b.dataset.test){const n=as.filter((t,i)=>t==g.perm[i]).length;if(n==4){sfx.ok();el.innerHTML='<p>Clique! A porta destrava.</p>';return later(()=>done({ok:1}),700)}
    tries--;sfx.miss();if(tries<=0){el.innerHTML='<p>Faíscas! O painel entra em curto.</p>';return later(()=>done({ok:0}),800)}msg=`Faísca! ${n} fio(s) no lugar certo. Tentativas: ${tries}`;draw()}}},
 probe(){
  const r=R(m.seed),g=m.truth!='honest',pk=a=>a[Math.floor(r()*a.length)],sh=a=>[...a].sort(()=>r()-.5);
  const ev=g?[{t:EVI[m.truth][0],lv:3},{t:EVI[m.truth][1],lv:2},{t:EVI[m.truth][2],lv:r()<.5?2:1},{t:pk(EVI.weakI),lv:1}]:[{t:EVI.inn[0],lv:3},{t:EVI.inn[1],lv:2},{t:EVI.inn[2],lv:r()<.5?2:1},{t:pk(EVI.weakG),lv:1}];
  el.innerHTML=`<p class="mut">Provas sobre ${m.name} (confiabilidade entre parênteses):</p><ul class="clues">${sh(ev).map(e=>`<li>${e.t} <small>(${LV[e.lv]})</small></li>`).join('')}</ul><div class="row2"><button data-v="innocent">Confiar nele</button><button data-v="guilty">Acusar</button></div>`;
  el.onclick=e=>{const b=e.target.closest('[data-v]');if(!b)return;sfx.click();done({verdict:b.dataset.v})}},
 defense(){
  const P=['Porta da frente','Janela dos fundos','Entrada do porão'];let round=0,hits=0,cur=-1,lock=true,to=0;
  const draw=(msg='')=>{el.innerHTML=`<p class="mut">Defesa · onda ${Math.min(round+1,m.rounds)}/${m.rounds} · barrados ${hits}</p><div class="sgrid dgrid">${P.map((p,i)=>`<button data-i="${i}" class="${cur==i?'alert':''}">${cur==i?'⚠ ':''}${p}</button>`).join('')}</div><p>${msg}</p>`};
  const nx=()=>{if(round>=m.rounds){draw('A noite se decide.');return later(()=>done(hits),700)}cur=Math.floor(Math.random()*3);lock=false;sfx.knock();draw();to=later(()=>{if(lock)return;lock=true;sfx.miss();round++;cur=-1;draw('Tarde demais! Algo entrou.');later(nx,700)},m.time)};
  draw('Prepare-se...');later(nx,900);
  el.onclick=e=>{const b=e.target.closest('button');if(!b||lock||cur<0)return;lock=true;clearTimeout(to);const ok=+b.dataset.i==cur;ok?(hits++,(m.gun?sfx.shot:sfx.hit)()):sfx.miss();round++;cur=-1;draw(ok?'Barrado!':'Lugar errado!');later(nx,700)}}};
 T[m.type]();return stop}
