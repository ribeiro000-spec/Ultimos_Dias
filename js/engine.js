import {RES,LOCS,BASES,NAMES} from './data.js';
export const SAVE_KEY='ultimos_dias_save_v2',REC_KEY='ultimos_dias_rec_v1';
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function rnd(s){let t=(s.rng=(s.rng+0x6D2B79F5)|0);t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}
export const pick=(s,a)=>a[Math.floor(rnd(s)*a.length)];
export const log=(s,t)=>{s.history.unshift({d:s.day,t});s.logN++;s.history.length=Math.min(s.history.length,80)};
export const alive=s=>s.survivors.filter(x=>x.health>0&&!x.left);
export const total=s=>Object.values(s.resources).reduce((a,b)=>a+b,0);
export const count=(s,u)=>s.base.upgrades.filter(x=>x==u).length;
export const cap=s=>60+20*count(s,'depot');
export function add(s,k,n){if(n>0)n=Math.max(0,Math.min(n,cap(s)-total(s)));s.resources[k]=Math.max(0,s.resources[k]+n);if(n>0)s.stats.collected+=n;return n}
export const security=s=>clamp(s.base.sec+15*count(s,'barricade')-s.base.damage,0,100);
export const threat=s=>clamp(Math.round(10+1.5*(s.day-1)+s.noise+s.hostile+s.evMod),0,100);
export function makeSurvivor(s,secret='honest',name){
 const used=s.survivors.map(x=>x.name),p=NAMES.filter(x=>!used.includes(x.n)),b=pick(s,p.length?p:NAMES),st=()=>2+Math.floor(rnd(s)*4);
 const v={id:s.nextId++,name:name||(p.length?b.n:b.n+' II'),skill:name?'Sobrevivente':b.s,look:Math.floor(rnd(s)*1e6),health:100,morale:70,loyalty:55+Math.floor(rnd(s)*30),combat:st(),exploration:st(),technique:st(),medicine:st(),secret,checked:null};
 const k={Médico:'medicine',Mecânico:'technique',Batedor:'exploration',Vigilante:'combat',Negociador:'combat',Eletricista:'technique'}[b.s];if(k&&!name)v[k]=Math.min(10,v[k]+3);return v}
export function newGame(seed=Date.now()%1e9){
 const s={schemaVersion:2,seed,rng:seed|0,day:0,gameOver:false,time:{total:12,remaining:12},resources:{water:0,food:0,medicine:0,materials:0,tools:0,ammunition:0,fuel:0,components:0},
 base:{id:'police',sec:0,pop:0,upgrades:[],damage:0},survivors:[],nextId:1,player:1,visits:{},noise:0,leak:0,hostile:0,evMod:0,hunger:0,thirst:0,weather:'clear',out:[],schedule:[],sc:{id:'prologue',ctx:{}},
 history:[],logN:0,dayText:'',stats:{recruited:0,lost:0,collected:0,repelled:0,expeditions:0,decisions:0},flags:{},cause:null,recorded:false};
 s.start=['road','market','street'][Math.floor(rnd(s)*3)];
 const p=makeSurvivor(s,'honest','Você');p.combat=Math.max(p.combat,4);p.exploration=Math.max(p.exploration,4);s.survivors.push(p);return s}
export function chooseBase(s,id){const B=BASES[id];s.base={id,sec:B.sec,pop:B.pop,upgrades:[...B.up],damage:0};s.resources={...B.res}}
export function startDay(s){s.day++;s.time.remaining=s.time.total;s.out=[];const r=rnd(s);s.weather=r<.25?'rain':r<.4?'fog':'clear'}
export function spend(s,c){for(const k in c)if(s.resources[k]<c[k])return'Faltam '+RES[k].toLowerCase()+'.';for(const k in c)s.resources[k]-=c[k];return null}
export const A={add,log,rnd,pick,alive};
export function loot(s,id,party,frac){
 const L=LOCS.find(l=>l.id==id),g=alive(s).filter(x=>party.includes(x.id)),E=g.reduce((a,x)=>a+x.exploration,0)/Math.max(1,g.length);
 const v=s.visits[id]||0,cond=Math.max(.25,1-.18*v),M=.75+.05*E;s.visits[id]=v+1;const got=[];
 for(const k in L.y){const n=Math.max(0,Math.floor(L.y[k]*M*cond*(.7+.6*rnd(s))*frac));const a=add(s,k,n);if(a)got.push(a+' '+RES[k].toLowerCase())}
 return got.length?'Você encontra: '+got.join(', ')+'.':'Você não encontra nada que valha a pena carregar.'}
export function reap(s){
 for(const v of s.survivors)if(v.health<=0&&!v.dead&&!v.left){v.health=0;v.dead=true;s.stats.lost++;s.cause=(v.id==s.player?'Você morreu':v.name+' morreu')+': '+(v.cause||'causas desconhecidas')+'.';log(s,s.cause)}
 const p=s.survivors.find(x=>x.id==s.player);
 if(p&&p.dead&&!s.gameOver){s.gameOver=true;record(s)}}
export const records=()=>{const d={best:0,games:0,days:0,lost:0,repelled:0,last:'—'};try{return{...d,...JSON.parse(localStorage.getItem(REC_KEY)||'{}')}}catch(e){return d}};
function record(s){if(s.recorded)return;s.recorded=true;const r=records();r.best=Math.max(r.best,s.day);r.games++;r.days+=s.day;r.lost+=s.stats.lost;r.repelled+=s.stats.repelled;r.last=s.cause;try{localStorage.setItem(REC_KEY,JSON.stringify(r))}catch(e){}}
export function attackChance(s){const T=threat(s),S=security(s);let Pa=clamp(.05+.004*T-.002*S,.02,.7);if(count(s,'alarm')&&count(s,'generator'))Pa=Math.max(.02,Pa-.05);return Pa}
export function endDay(s,o={}){
 const n0=s.logN,L=alive(s),n=L.length;
 for(const [k,c] of [['food','hunger'],['water','thirst']]){
  if(s.resources[k]>=n){s.resources[k]-=n;s[c]=0}else{s.resources[k]=0;s[c]++;L.forEach(v=>{v.health-=(k=='water'?10:8)*s[c];v.morale-=8;v.cause=k=='water'?'sede':'fome'});
   log(s,'Falta de '+RES[k].toLowerCase()+' ('+s[c]+'º dia seguido): o corpo cobra o preço.')}}
 if(s.base.upgrades.includes('garden')){const a=add(s,'food',2);if(a)log(s,'A horta rende '+a+' comida.')}
 if(!s.hunger&&!s.thirst)L.forEach(v=>{v.health=Math.min(100,v.health+5+(s.base.upgrades.includes('infirmary')?5:0));v.morale=Math.min(100,v.morale+2)});
 for(const v of L){if(v.id==s.player)continue;
  if(s.hunger)v.loyalty-=4;if(v.morale<35)v.loyalty-=2;v.morale=clamp(v.morale,0,100);v.loyalty=clamp(v.loyalty,0,100);
  const P=clamp(.02+.35*(100-v.loyalty)/100+.2*(100-v.morale)/100+(s.hunger?.1:0),0,.65);
  if(v.secret=='thief'&&rnd(s)<P*.6){const k=pick(s,['food','ammunition','medicine']),q=Math.min(s.resources[k],1+Math.floor(rnd(s)*3));s.resources[k]-=q;v.loyalty=Math.max(0,v.loyalty-5);log(s,'Faltam '+q+' '+RES[k].toLowerCase()+' no estoque. Alguém anda mexendo nos suprimentos.')}
  if(v.secret=='spy')s.leak=Math.min(10,s.leak+1);
  if(v.loyalty<12&&v.morale<25){v.left=true;s.resources.food=Math.max(0,s.resources.food-2);log(s,v.name+' abandona a base levando comida.')}}
 s.schedule=s.schedule.filter(c=>{if(c.day>s.day)return true;const v=s.survivors.find(x=>x.id==c.who);
  if(v&&!v.left&&!v.dead){v.left=true;s.resources.food=Math.max(0,s.resources.food-3);s.resources.ammunition=Math.max(0,s.resources.ammunition-2);s.leak=Math.min(10,s.leak+4);log(s,v.name+' era um infiltrado: sumiu de madrugada com comida e munição, e passou a localização aos saqueadores.')}return false});
 s.hostile=clamp(Math.floor(s.day/3)+s.leak,0,20);
 const T=threat(s),S=security(s);
 if(alive(s).length&&(o.attack!==undefined?o.attack:rnd(s)<attackChance(s))){
  const C=alive(s).filter(v=>v.health>25&&!s.out.includes(v.id)).length,B=count(s,'barricade');let Am;if(o.A!==undefined)Am=o.A;else{Am=Math.min(2,s.resources.ammunition);s.resources.ammunition-=Am}
  const D=.5*S+3*C+2*B+5*Am,O=12+.9*T+rnd(s)*12;
  if(D>=O){s.stats.repelled++;log(s,'Durante a noite, vultos tentam forçar a entrada. Você os repele (defesa '+Math.round(D)+' × ataque '+Math.round(O)+').')}
  else{s.base.damage=Math.min(60,s.base.damage+10);const f=Math.min(4,s.resources.food);s.resources.food-=f;const v=pick(s,alive(s));v.health-=20;v.cause='ataque à base';
   log(s,'A base é invadida (defesa '+Math.round(D)+' × ataque '+Math.round(O)+'). '+f+' comida roubada, '+(v.id==s.player?'você':v.name)+' ferido, segurança −10.')}}
 s.noise=Math.round(s.noise*.6);s.evMod=Math.round(s.evMod*.5);reap(s);
 return s.history.slice(0,s.logN-n0).reverse().map(h=>h.t)}
export function save(s){try{const old=localStorage.getItem(SAVE_KEY);if(old)localStorage.setItem(SAVE_KEY+'_bak',old);localStorage.setItem(SAVE_KEY,JSON.stringify({...s,savedAt:new Date().toISOString()}));return true}catch(e){return false}}
export const validate=s=>!!(s&&s.schemaVersion==2&&s.resources&&Array.isArray(s.survivors)&&s.sc);
export function load(){for(const k of[SAVE_KEY,SAVE_KEY+'_bak']){try{const s=JSON.parse(localStorage.getItem(k));if(validate(s))return s}catch(e){}}return null}
export const hasSave=()=>!!load();
