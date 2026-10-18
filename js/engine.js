import {RES,LOCS,UPG,POOL} from './data.js';
import {EVENTS} from './events.js';
export const SAVE_KEY='ultimos_dias_save_v1',REC_KEY='ultimos_dias_rec_v1';
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function rnd(s){let t=(s.rng=(s.rng+0x6D2B79F5)|0);t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}
export const pick=(s,a)=>a[Math.floor(rnd(s)*a.length)];
export const log=(s,t)=>{s.history.unshift({d:s.day,t});s.history.length=Math.min(s.history.length,80)};
export const alive=s=>s.survivors.filter(x=>x.health>0&&!x.left);
export const total=s=>Object.values(s.resources).reduce((a,b)=>a+b,0);
export const count=(s,u)=>s.base.upgrades.filter(x=>x==u).length;
export const cap=s=>60+20*count(s,'depot');
export function add(s,k,n){if(n>0)n=Math.max(0,Math.min(n,cap(s)-total(s)));s.resources[k]=Math.max(0,s.resources[k]+n);if(n>0)s.stats.collected+=n;return n}
export const security=s=>clamp(45+15*count(s,'barricade')-s.base.damage,0,100);
export const threat=s=>clamp(Math.round(10+1.5*(s.day-1)+s.noise+s.hostile+s.evMod),0,100);
export function makeSurvivor(s,secret='honest'){
 const used=s.survivors.map(x=>x.name),p=POOL.filter(x=>!used.includes(x.n)),b=pick(s,p.length?p:POOL);
 const st=()=>2+Math.floor(rnd(s)*4);
 const v={id:s.nextId++,name:p.length?b.n:b.n+' II',skill:b.s,health:100,morale:70,loyalty:55+Math.floor(rnd(s)*30),combat:st(),exploration:st(),technique:st(),medicine:st(),secret,checked:null};
 const k={Médico:'medicine',Mecânico:'technique',Batedor:'exploration',Vigilante:'combat',Negociador:'combat',Eletricista:'technique'}[b.s];
 v[k]=Math.min(10,v[k]+3);return v}
export function newGame(seed=Date.now()%1e9){
 const s={schemaVersion:1,seed,rng:seed|0,day:1,gameOver:false,time:{total:12,remaining:12},
 resources:{water:12,food:12,medicine:4,materials:8,tools:3,ammunition:6,fuel:4,components:2},
 base:{id:'police_station',upgrades:[],damage:0},survivors:[],nextId:1,visits:{},noise:0,leak:0,hostile:0,evMod:0,hunger:0,thirst:0,
 out:[],schedule:[],event:null,history:[],stats:{recruited:0,lost:0,collected:0,repelled:0,expeditions:0,decisions:0},flags:{},cause:null,recorded:false};
 for(let i=0;i<3;i++)s.survivors.push(makeSurvivor(s,i==2&&rnd(s)<.5?'thief':'honest'));
 log(s,'A delegacia é o último abrigo. Três vivos e pouco estoque. Sobreviva.');return s}
export function spend(s,c){for(const k in c)if(s.resources[k]<c[k])return'Faltam '+RES[k].toLowerCase()+'.';for(const k in c)s.resources[k]-=c[k];return null}
const noPT=(s,n)=>s.time.remaining<n?'Tempo insuficiente hoje.':null;
export function search(s,id,ids){
 const L=LOCS.find(l=>l.id==id),g=alive(s).filter(x=>ids.includes(x.id));
 if(!g.length)return'Toque em um sobrevivente para incluí-lo na expedição.';
 if(noPT(s,L.cost))return noPT(s,L.cost);
 s.time.remaining-=L.cost;s.stats.expeditions++;g.forEach(x=>s.out.includes(x.id)||s.out.push(x.id));
 const E=g.reduce((a,x)=>a+x.exploration,0)/g.length,C=g.reduce((a,x)=>a+x.combat,0)/g.length;
 const v=s.visits[id]||0,cond=Math.max(.25,1-.18*v),M=.75+.05*E;s.visits[id]=v+1;
 const got=[];for(const k in L.y){const n=Math.max(0,Math.floor(L.y[k]*M*cond*(.7+.6*rnd(s))));const a=add(s,k,n);if(a)got.push(a+' '+RES[k].toLowerCase())}
 s.noise=clamp(s.noise+4,0,20);
 let m=g.map(x=>x.name).join(', ')+' vasculhou '+L.name+': '+(got.join(', ')||'nada útil')+'.';
 if(rnd(s)<L.risk+threat(s)/250-.03*C){const h=pick(s,g),d=15+Math.floor(rnd(s)*20);h.health-=d;m+=' '+h.name+' foi ferido (−'+d+' saúde).';h.cause='ferimentos em expedição';
  if(s.resources.ammunition>0){s.resources.ammunition--;m+=' Munição gasta.'}s.noise=clamp(s.noise+4,0,20)}
 log(s,m);return null}
export function build(s,id){
 const U=UPG[id];if(!U.rep&&s.base.upgrades.includes(id))return'Já construído.';
 if(id=='barricade'&&count(s,id)>=3)return'Limite de barricadas atingido.';
 if(noPT(s,3))return noPT(s,3);const e=spend(s,U.cost);if(e)return e;
 s.time.remaining-=3;s.base.upgrades.push(id);log(s,'Construído: '+U.name.split(' (')[0]+'.');return null}
export function craft(s){
 if(!s.base.upgrades.includes('workshop'))return'Construa a oficina primeiro.';
 if(noPT(s,2))return noPT(s,2);const e=spend(s,{materials:3});if(e)return e;
 s.time.remaining-=2;const a=add(s,'ammunition',4);log(s,'Fabricadas '+a+' munições.');return null}
export function repair(s){
 if(!s.base.damage)return'Nada a reparar.';if(noPT(s,2))return noPT(s,2);
 const e=spend(s,{materials:2});if(e)return e;s.time.remaining-=2;s.base.damage=Math.max(0,s.base.damage-12);log(s,'Estrutura reparada.');return null}
export function treat(s,id){
 const v=s.survivors.find(x=>x.id==id);if(v.health>=100)return v.name+' está bem.';
 if(noPT(s,1))return noPT(s,1);const e=spend(s,{medicine:1});if(e)return e;
 s.time.remaining-=1;const h=20+(s.base.upgrades.includes('infirmary')?10:0)+alive(s).reduce((a,x)=>Math.max(a,x.medicine),0);
 v.health=Math.min(100,v.health+h);log(s,v.name+' tratado (+'+h+' saúde).');return null}
export function investigate(s,id){
 const v=s.survivors.find(x=>x.id==id);if(noPT(s,2))return noPT(s,2);s.time.remaining-=2;
 v.checked={honest:'Nada incomum.',thief:'Itens somem do estoque nos turnos dele (evidência de confiabilidade média).',spy:'Anota rotas e horários da base (evidência de confiabilidade média).'}[v.secret];
 log(s,'Investigação sobre '+v.name+': '+v.checked);return null}
export const A={add,log,rnd,pick,alive,makeSurvivor,threat};
export function resolve(s,i){
 const E=EVENTS.find(e=>e.id==s.event.id),o=E.opts(s,s.event.d,A)[i];
 if(o.off)return'Indisponível.';if(o.pt&&noPT(s,o.pt))return noPT(s,o.pt);
 if(o.res){const e=spend(s,o.res);if(e)return e}
 if(o.pt)s.time.remaining-=o.pt;s.stats.decisions++;
 if(!o.fn())s.event=null;return null}
export function reap(s){
 for(const v of s.survivors)if(v.health<=0&&!v.dead&&!v.left){v.health=0;v.dead=true;s.stats.lost++;log(s,v.name+' morreu ('+(v.cause||'causas desconhecidas')+').');s.cause=v.name+' morreu: '+(v.cause||'causas desconhecidas')+'.'}
 if(!alive(s).length&&!s.gameOver){s.gameOver=true;s.event=null;record(s)}}
export const records=()=>{const d={best:0,games:0,days:0,lost:0,repelled:0,last:'—'};try{return{...d,...JSON.parse(localStorage.getItem(REC_KEY)||'{}')}}catch(e){return d}};
function record(s){if(s.recorded)return;s.recorded=true;const r=records();r.best=Math.max(r.best,s.day);r.games++;r.days+=s.day;r.lost+=s.stats.lost;r.repelled+=s.stats.repelled;r.last=s.cause;
 try{localStorage.setItem(REC_KEY,JSON.stringify(r))}catch(e){}}
function drawEvent(s){
 if(s.day<2||rnd(s)>.85)return;
 const el=EVENTS.filter(e=>e.min<=s.day&&e.id!=s.lastEvent&&e.w(s)>0),sum=el.reduce((a,e)=>a+e.w(s),0);
 if(!sum)return;let r=rnd(s)*sum,E=el[0];for(const e of el){r-=e.w(s);if(r<=0){E=e;break}}
 s.lastEvent=E.id;s.event={id:E.id,d:E.make(s,A)};log(s,'Evento: '+E.title+'.')}
export function endDay(s){
 if(s.event)return'Resolva o evento pendente antes de encerrar o dia.';
 const L=alive(s),n=L.length;
 for(const [k,c] of [['food','hunger'],['water','thirst']]){
  if(s.resources[k]>=n){s.resources[k]-=n;s[c]=0}else{s.resources[k]=0;s[c]++;
   L.forEach(v=>{v.health-=(k=='water'?10:8)*s[c];v.morale-=8;v.cause=k=='water'?'sede':'fome'});
   log(s,'Falta de '+RES[k].toLowerCase()+' ('+s[c]+'º dia seguido): saúde e moral caem.')}}
 if(s.base.upgrades.includes('garden')){const a=add(s,'food',2);if(a)log(s,'Horta rende '+a+' comida.')}
 if(!s.hunger&&!s.thirst)L.forEach(v=>{v.health=Math.min(100,v.health+5+(s.base.upgrades.includes('infirmary')?5:0));v.morale=Math.min(100,v.morale+2)});
 for(const v of L){
  if(s.hunger)v.loyalty-=4;if(v.morale<35)v.loyalty-=2;v.morale=clamp(v.morale,0,100);v.loyalty=clamp(v.loyalty,0,100);
  const P=clamp(.02+.35*(100-v.loyalty)/100+.2*(100-v.morale)/100+(s.hunger?.1:0),0,.65);
  if(v.secret=='thief'&&rnd(s)<P*.6){const k=pick(s,['food','ammunition','medicine']),q=Math.min(s.resources[k],1+Math.floor(rnd(s)*3));s.resources[k]-=q;v.loyalty=Math.max(0,v.loyalty-5);
   log(s,'Faltam '+q+' '+RES[k].toLowerCase()+' no estoque. Alguém anda mexendo nos suprimentos.')}
  if(v.secret=='spy')s.leak=Math.min(10,s.leak+1);
  if(v.loyalty<12&&v.morale<25){v.left=true;s.resources.food=Math.max(0,s.resources.food-2);log(s,v.name+' abandona a base levando comida.')}}
 s.schedule=s.schedule.filter(c=>{if(c.day>s.day)return true;const v=s.survivors.find(x=>x.id==c.who);
  if(v&&!v.left&&!v.dead){v.left=true;s.resources.food=Math.max(0,s.resources.food-3);s.resources.ammunition=Math.max(0,s.resources.ammunition-2);s.leak=Math.min(10,s.leak+4);
   log(s,v.name+' era um infiltrado: some de madrugada levando comida e munição, e passa a localização aos saqueadores.')}return false});
 s.hostile=clamp(Math.floor(s.day/3)+s.leak,0,20);
 const T=threat(s),S=security(s);let Pa=clamp(.05+.004*T-.002*S,.02,.7);
 if(count(s,'alarm')&&count(s,'generator'))Pa=Math.max(.02,Pa-.05);
 if(alive(s).length&&rnd(s)<Pa){
  const C=alive(s).filter(v=>v.health>25&&!s.out.includes(v.id)).length,B=count(s,'barricade'),Am=Math.min(2,s.resources.ammunition);s.resources.ammunition-=Am;
  const D=.5*S+3*C+2*B+5*Am,O=12+.9*T+rnd(s)*12;
  if(D>=O){s.stats.repelled++;log(s,'Ataque repelido (defesa '+Math.round(D)+' × ataque '+Math.round(O)+').')}
  else{s.base.damage=Math.min(60,s.base.damage+10);const f=Math.min(4,s.resources.food);s.resources.food-=f;const v=pick(s,alive(s));v.health-=20;v.cause='ataque à base';
   log(s,'A base foi invadida (defesa '+Math.round(D)+' × ataque '+Math.round(O)+'). '+f+' comida roubada, '+v.name+' ferido, segurança −10.')}}
 s.noise=Math.round(s.noise*.6);s.evMod=Math.round(s.evMod*.5);
 reap(s);
 if(!s.gameOver){s.day++;s.time.remaining=s.time.total;s.out=[];drawEvent(s);log(s,'Amanhece o dia '+s.day+'.')}
 return null}
export function save(s){try{const old=localStorage.getItem(SAVE_KEY);if(old)localStorage.setItem(SAVE_KEY+'_bak',old);localStorage.setItem(SAVE_KEY,JSON.stringify({...s,savedAt:new Date().toISOString()}));return true}catch(e){console.error('Falha ao salvar',e);return false}}
export const validate=s=>!!(s&&s.schemaVersion==1&&s.resources&&Array.isArray(s.survivors)&&Number.isFinite(s.day));
export function load(){for(const k of[SAVE_KEY,SAVE_KEY+'_bak']){try{const s=JSON.parse(localStorage.getItem(k));if(validate(s))return s}catch(e){}}return null}
export const hasSave=()=>!!load();
