import * as G from './engine.js';
import {RES,LOCS,UPG,BASES,STARTS} from './data.js';
const {A,rnd,pick,log,alive,add}=G;
const Lc=id=>LOCS.find(l=>l.id==id),comp=s=>alive(s).filter(v=>v.id!=s.player),pl=s=>s.survivors.find(v=>v.id==s.player);
const PTS=s=>s.time.remaining;
export const go=(s,id,ctx={})=>{s.sc={id,ctx}};
const base=(s,x={})=>({kind:s.base.id,seed:s.seed,rain:s.weather=='rain',fog:s.weather=='fog',...x});
const at=(s,kind,x={})=>({kind,seed:s.seed+kind.length,rain:s.weather=='rain',fog:s.weather=='fog',...x});
const out=(s,t,next='hub',nctx={},bg=null)=>go(s,'out',{t,next,nctx,bg});
const hurt=(s,v,d,c)=>{v.health-=d;v.cause=c;G.reap(s)};
const party=(s,c)=>alive(s).filter(v=>c.party.includes(v.id));
const hurtOne=(s,c,d,why)=>{const g=party(s,c),v=pick(s,g.length?g:[pl(s)]);hurt(s,v,d,why);return v.id==s.player?'Você':v.name};
export function pay(s,c){if(c.pt&&PTS(s)<c.pt)return'Tempo insuficiente hoje.';if(c.res){const e=G.spend(s,c.res);if(e)return e}if(c.pt)s.time.remaining-=c.pt;s.stats.decisions++;return null}
export function choose(s,i){const d=SC[s.sc.id](s,s.sc.ctx),c=d.choices&&d.choices[i];if(!c||c.off)return'Indisponível.';const e=pay(s,c);if(e)return e;c.fn(s,s.sc.ctx);return null}
const OPEN=[['Os primeiros dias são os mais barulhentos: sirenes, vidro quebrando, gente gritando nomes. Você aprende a dormir com um olho aberto.','O abrigo ainda cheira a poeira e medo. Cada ruído no corredor parece um passo.','Você risca o primeiro dia na parede. Prometeu a si mesmo que contaria todos.'],
['A cidade já não faz barulho. É pior: o silêncio agora tem peso, e algo dentro dele observa.','Os lugares próximos estão esvaziando. Cada saída custa mais do que a anterior.','Você reconhece o som de longe: passos arrastados. Eles aprenderam o caminho até aqui.'],
['Faz tanto tempo que você não lembra do som de uma cidade viva. Só restam o vento e o que ele carrega.','Cada amanhecer é uma pequena vitória e uma pequena dívida.','O mundo lá fora virou uma conta que ninguém consegue pagar. Mesmo assim, você acorda.']];
export function startDay(s){G.startDay(s);const d=s.day,n=alive(s).length;
 let t=({rain:'A chuva bate no telhado como dedos impacientes. ',fog:'Uma névoa densa engoliu a rua. ',clear:''})[s.weather];
 t+=d==1?'Você tranca a porta e encosta a testa na madeira fria. Sozinho, o silêncio pesa. Primeiro passo: descobrir o que o abrigo guarda e quem ainda respira lá fora.':pick(s,OPEN[d<=5?0:d<=12?1:2]);
 if(s.resources.food<n*2)t+=' O estômago aperta: a comida está acabando.';if(s.resources.water<n*2)t+=' Os lábios rachados lembram que a água também.';
 const c=comp(s);if(c.length)t+=' '+pick(s,c).name+' já está de pé, vigiando a janela.';
 if(s.base.damage>20)t+=' As paredes rangem; o abrigo carrega as cicatrizes dos ataques.';if(G.threat(s)>45)t+=' Há mais gente, e mais coisas, rondando do que ontem.';
 s.dayText=t}
const W=(s,k,g)=>s.flags[k]&&s.day-s.flags[k]<g?0:1;
const EV=[
{id:'lone',min:2,w:s=>alive(s).length<s.base.pop?4*W(s,'lone',5):0,make:s=>({truth:pick(s,['true','partial','bad']),where:'gate',next:'hub',party:[s.player]})},
{id:'e_rain',min:1,w:s=>s.weather=='rain'?6:1,make:()=>({})},{id:'e_noise',min:3,w:s=>2+s.noise/5,make:()=>({})},
{id:'e_sick',min:2,w:s=>comp(s).length?3:0,make:s=>({t:pick(s,comp(s)).id})},{id:'e_raiders',min:4,w:s=>2+s.hostile/4,make:()=>({})},
{id:'e_share',min:2,w:s=>comp(s).length?2*W(s,'share',5):0,make:()=>({})},{id:'e_radio',min:3,w:s=>2*W(s,'radio',8),make:()=>({})},{id:'e_fire',min:4,w:()=>2,make:()=>({})}];
function morning(s){
 if(s.day==1)return go(s,'lone',{truth:pick(s,['true','partial']),where:'gate',first:1,next:'hub',party:[s.player]});
 if(rnd(s)>.85)return go(s,'hub');
 const el=EV.filter(e=>e.min<=s.day&&e.id!=s.lastEv&&e.w(s)>0),sum=el.reduce((a,e)=>a+e.w(s),0);if(!sum)return go(s,'hub');
 let r=rnd(s)*sum,E=el[0];for(const e of el){r-=e.w(s);if(r<=0){E=e;break}}s.lastEv=E.id;go(s,E.id,E.make(s))}
function trip(s,c){
 const L=Lc(c.loc);s.time.remaining-=L.cost;s.stats.expeditions++;c.party.forEach(i=>s.out.includes(i)||s.out.push(i));s.noise=G.clamp(s.noise+4,0,20);
 const T=G.threat(s),r=rnd(s),pm=.25+T/200;c.ms=Math.floor(rnd(s)*1e9);
 if(r<pm)go(s,'monster',{...c,n:1+Math.floor(rnd(s)*2+T/60)});
 else if(r<pm+.12)go(s,'group',{...c,g:pick(s,['friendly','hostile','deceptive'])});
 else if(r<pm+.24&&alive(s).length<s.base.pop)go(s,'lone',{...c,where:'trip',truth:pick(s,['true','partial','bad']),next:'arrive'});
 else go(s,'arrive',c)}
const talk=['Os ferimentos e a história conferem: ele fala a verdade.','Alguns detalhes não batem. Ele omite algo.','Marcas de bota recentes e um rádio escondido: ele observa a base.'];
export const SC={
prologue:s=>({bg:{kind:s.start,night:1,seed:s.seed},text:STARTS[s.start]+' O mundo que você conhecia durou pouco. Agora você precisa de um teto antes do anoitecer.',choices:[{l:'Levantar-se',fn:s=>go(s,'map')}]}),
map:s=>({bg:{kind:s.start,night:1,seed:s.seed},text:'No bolso, um mapa dobrado marca três lugares. Há força para chegar a apenas um deles antes que escureça.',
 choices:['police','bunker','farm'].map((id,i,a)=>a[(i+s.seed)%3]).map(id=>({l:BASES[id].name+' — '+BASES[id].tease,fn:s=>{G.chooseBase(s,id);go(s,'travel',{b:id})}}))}),
travel:(s,c)=>({bg:{kind:'road',night:0,seed:s.seed,fig:'l'},text:'Você caminha até as pernas tremerem. Ao fim da tarde, '+BASES[c.b].name.toLowerCase()+' surge no horizonte. Você tranca a porta atrás de si e confere o que sobrou: '+Object.entries(s.resources).filter(([k,v])=>v).map(([k,v])=>v+' '+RES[k].toLowerCase()).join(', ')+'.',
 choices:[{l:'Entrar e esperar a noite',fn:s=>{startDay(s);go(s,'daycard')}}]}),
daycard:s=>({bg:base(s,{night:1}),card:'Dia '+s.day+' após o apocalipse',next:s=>go(s,'dayIntro')}),
dayIntro:s=>({bg:base(s),text:s.dayText,choices:[{l:s.day==1?'Esperar':'Começar o dia',fn:morning}]}),
out:(s,c)=>({bg:c.bg||base(s),text:c.t,choices:[{l:'Continuar',fn:s=>go(s,c.next,c.nctx)}]}),
hub:s=>({bg:base(s),text:PTS(s)>=3?'O dia ainda permite decisões. Tempo restante: '+PTS(s)+' PT. O que fazer agora?':'A luz está acabando. Resta pouco a fazer além de se preparar para a noite.',
 choices:[{l:'Sair para explorar',off:PTS(s)<3,fn:s=>go(s,'locPick')},{l:'Melhorar a base',fn:s=>go(s,'build')},{l:'Cuidar do abrigo e do grupo',fn:s=>go(s,'camp')},
 {l:'Encerrar o dia',fn:s=>{if(rnd(s)<G.attackChance(s))go(s,'dusk');else go(s,'night',{L:G.endDay(s,{attack:false})})}}]}),
night:(s,c)=>({bg:base(s,{night:1}),text:'A noite cai sobre o abrigo. '+(c.L.length?c.L.join(' '):'Nada acontece além do vento.'),
 choices:[s.gameOver?{l:'Ver o fim',fn:s=>go(s,'over')}:{l:'Amanhecer',fn:s=>{startDay(s);go(s,'daycard')}}]}),
over:s=>({bg:base(s,{night:1}),text:'FIM. Você sobreviveu '+s.day+' dias. '+(s.cause||'')+' Recrutados: '+s.stats.recruited+'. Perdidos: '+s.stats.lost+'. Coletados: '+s.stats.collected+'. Ataques repelidos: '+s.stats.repelled+'. Expedições: '+s.stats.expeditions+'.',
 choices:[{l:'Nova campanha',act:'new',fn(){}},{l:'Menu',act:'menu',fn(){}}]}),
locPick:s=>({bg:base(s),text:'Para onde ir? Quanto mais longe, mais tempo e mais risco.',
 choices:[...LOCS.map(l=>({l:l.name+' · '+l.cost+' PT · '+(l.risk>=.4?'risco alto ▲▲▲':l.risk>=.25?'risco médio ▲▲':'risco baixo ▲')+' · '+l.note+(s.visits[l.id]?' · visitas '+s.visits[l.id]:''),off:PTS(s)<l.cost,fn:s=>{comp(s).length?go(s,'party',{loc:l.id}):(trip(s,{loc:l.id,party:[s.player]}))}})),{l:'Voltar',fn:s=>go(s,'hub')}]}),
party:(s,c)=>({bg:base(s),text:'Alguém vai com você? Quem sai não defende a base durante a noite.',
 choices:[{l:'Ir sozinho',fn:s=>trip(s,{loc:c.loc,party:[s.player]})},...comp(s).map(v=>({l:'Levar '+v.name+' ('+v.skill+')',fn:s=>trip(s,{loc:c.loc,party:[s.player,v.id]})}))]}),
arrive:(s,c)=>({bg:at(s,c.loc),text:Lc(c.loc).arr,choices:[{l:'Revistar o local',fn:s=>go(s,'search',{...c})},...(['workshop','radio'].includes(c.loc)?[{l:'Abrir a porta lacrada (painel elétrico)',off:c.wired,fn:s=>go(s,'wires',{...c,wired:1,ms:Math.floor(rnd(s)*1e9)})}]:[]),{l:'Voltar à base sem arriscar',fn:s=>out(s,'Você decide não tentar a sorte e volta antes de escurecer.')}]}),
search:(s,c)=>({bg:at(s,c.loc,{night:s.time.remaining<4}),text:'Você vasculha o local com cuidado, ouvidos atentos.',mini:{type:'search',seed:c.ms,risk:Lc(c.loc).risk,tries:7+(party(s,c).some(v=>v.skill=='Batedor')?1:0)},
 done:(s,c,r)=>{const t=G.loot(s,c.loc,c.party,r.found/r.total);if(r.danger)out(s,t+' Um som úmido atrás de você: algo estava escondido ali!','monster',{...c,n:1,after:'hub'},at(s,c.loc,{fig:'m',n:1}));else out(s,t+' Você volta à base antes de escurecer.')}}),
monster:(s,c)=>({bg:at(s,c.loc,{fig:'m',n:c.n,night:s.time.remaining<5}),text:(c.n>1?c.n+' infectados surgem':'Um infectado surge')+' da escuridão, atraído'+(c.n>1?'s':'')+' pelo ruído. O ar fica pesado.',
 choices:[{l:'Lutar com arma (2 munição)',res:{ammunition:2},fn:s=>go(s,'fight',{...c,gun:1})},{l:'Lutar corpo a corpo',fn:s=>go(s,'fight',{...c,gun:0})},{l:'Fugir',fn:s=>go(s,'flee',c)},
 {l:'Esconder-se e prender a respiração',fn:s=>{const E=party(s,c).reduce((a,v)=>a+v.exploration,0)/c.party.length;
  if(rnd(s)<.45+.03*E-G.threat(s)/300)out(s,'Você prende a respiração enquanto as sombras passam arrastando os pés. Quando o som some, tudo continua em silêncio.',c.after?'hub':'arrive',c);
  else{const n=hurtOne(s,c,18,'ataque de infectados');out(s,'Eles farejam seu esconderijo. '+n+' leva uma mordida antes de escapar.','hub')}}}]}),
fight:(s,c)=>({bg:at(s,c.loc,{fig:'m',n:c.n}),text:c.gun?'Você mira com as mãos trêmulas. Acerte no momento certo.':'Sem arma, só resta a barra de ferro. Acerte na hora certa.',
 mini:{type:'timing',label:'Combate',rounds:3,zone:G.clamp(.17+.02*Math.max(...party(s,c).map(v=>v.combat))+(c.gun?.14:0)-.02*(c.n-1),.12,.5),speed:.9+.1*c.n,gun:c.gun},
 done:(s,c,h)=>{if(h>=2){s.stats.repelled++;s.noise=G.clamp(s.noise+(c.gun?4:1),0,20);out(s,c.after?'A ameaça cai. Você recolhe o fôlego e volta à base.':'A ameaça cai. Você recolhe o fôlego e segue em frente.',c.after?'hub':'arrive',c)}
  else{const n=hurtOne(s,c,35-8*h,'ferimentos em combate');out(s,n+' é derrubado e ferido. Você recua para a base, sangrando.','hub')}}}),
flee:(s,c)=>({bg:at(s,c.loc,{fig:'m',n:c.n}),text:'Você corre. O som de passos arrastados fica cada vez mais perto.',mini:{type:'timing',label:'Fuga',rounds:2,zone:.3,speed:1.1},
 done:(s,c,h)=>{if(h>=1)out(s,'Você despista a criatura num beco e volta, ofegante, para a base.');else{const n=hurtOne(s,c,18,'fuga mal sucedida');out(s,n+' tropeça e é arranhado, mas consegue chegar à base.')}}}),
group:(s,c)=>({bg:at(s,c.loc,{fig:'g'}),text:'Um grupo de sobreviventes armados bloqueia o caminho. Ninguém abaixa a arma ainda.',choices:[
 {l:'Observar de longe',pt:1,off:c.obs,fn:s=>{c.obs=1;out(s,{friendly:'Parecem cansados e dividem uma lata entre si.',hostile:'Olhares frios, dedos nos gatilhos; vigiam suas mochilas.',deceptive:'Sorrisos demais. Um deles faz sinais para alguém fora de vista.'}[c.g],'group',c)}},
 {l:'Negociar (2 comida)',res:{food:2},fn:s=>{if(c.g=='friendly'){add(s,'medicine',1);const k=pick(s,LOCS).id;s.visits[k]=0;out(s,'Eles trocam informações por comida e indicam um local ainda intocado: '+Lc(k).name+'. Ainda dão 1 medicamento.','arrive',c)}
  else if(c.g=='hostile'){add(s,'food',-3);out(s,'Pegam a comida e ainda levam mais 3. Você recua de mãos vazias.')}else out(s,'Aceitam a comida e dão uma dica falsa. Você perde tempo e volta de mãos vazias.')}},
 {l:'Oferecer ajuda (1 medicamento)',res:{medicine:1},fn:s=>{if(c.g=='friendly'){add(s,'ammunition',3);out(s,'Em gratidão, dão 3 munições e deixam você passar.','arrive',c)}else if(c.g=='hostile')out(s,'Riem e levam o remédio. Você é escoltado para fora do território.');else{const n=hurtOne(s,c,15,'emboscada');out(s,'Era uma armadilha: '+n+' é golpeado e levam o remédio.')}}},
 {l:'Mostrar a arma (1 munição)',res:{ammunition:1},fn:s=>{if(c.g=='hostile'){add(s,'materials',2);out(s,'Ao ver sua determinação, o grupo recua e abandona 2 materiais.','arrive',c)}else out(s,'O grupo fica tenso. Você recua devagar, mas a chance de aliança acabou.')}},
 {l:'Evitar o grupo',fn:s=>out(s,'Você dá meia-volta e contorna o quarteirão em silêncio.','arrive',c)}]}),
lone:(s,c)=>{const g=c.where=='gate',full=alive(s).length>=s.base.pop;return{bg:g?base(s,{fig:'l',night:c.first?1:0}):at(s,c.loc,{fig:'l'}),
 text:c.first?'Ao fim da tarde, batidas fracas na porta. Pela fresta, um desconhecido ferido de mãos erguidas jura ter visto um depósito de remédios. Sua primeira decisão como sobrevivente.':g?'Batidas fracas no portão. Um homem ferido pede abrigo e promete informações sobre um depósito de medicamentos.':'Entre os escombros, alguém sozinho levanta as mãos. Pede ajuda e jura não ter armas.',
 choices:[{l:'Investigar',pt:2,off:c.inv,fn:s=>{c.inv=1;out(s,talk[{true:0,partial:1,bad:2}[c.truth]],'lone',c)}},
 {l:'Manter sob vigilância',pt:1,off:c.watch,fn:s=>{c.watch=1;out(s,'Dois olhos ficam fixos nele. Ele sente a pressão.','lone',c)}},
 {l:full?'Acolher (sem espaço)':'Acolher',off:full,fn:s=>{const bad=c.truth=='bad';s.flags.lone=s.day;
  if(bad&&c.watch)return out(s,'Sob vigilância, o homem desiste e some na rua.',c.next,c);
  const v=G.makeSurvivor(s,bad?'spy':'honest');s.survivors.push(v);s.stats.recruited++;let t=v.name+' passa a viver na base. Uma boca a mais para alimentar, uma mão a mais para trabalhar.';
  if(c.truth=='true'){add(s,'medicine',4);t+=' Ele revela o depósito: +4 medicamentos.'}if(c.truth=='partial'){add(s,'medicine',2);t+=' O depósito existe, mas está quase vazio: +2 medicamentos.'}
  if(bad)s.schedule.push({day:s.day+2,type:'theft',who:v.id});out(s,t,c.next,c)}},
 {l:'Negociar (2 comida)',res:{food:2},fn:s=>{s.flags.lone=s.day;if(c.truth=='bad')out(s,'A informação era falsa. Ele some com a comida.',c.next,c);else{add(s,'medicine',3);out(s,'Ele indica um esconderijo: +3 medicamentos.',c.next,c)}}},
 {l:'Recusar e seguir',fn:s=>{s.flags.lone=s.day;out(s,'Você nega ajuda. O olhar dele fica gravado na sua cabeça.',c.next,c)}}]}},
e_rain:s=>({bg:base(s,{rain:1}),text:'A chuva cai pesada sobre o telhado. Dá para captar água, mas há goteiras sobre os suprimentos.',choices:[
 {l:'Captar água',pt:1,fn:s=>{add(s,'water',4);out(s,'Baldes cheios: +4 água.')}},{l:'Vedar goteiras (1 material)',res:{materials:1},fn:s=>out(s,'As goteiras foram vedadas.')},
 {l:'Ignorar',fn:s=>{if(rnd(s)<.4){add(s,'materials',-2);out(s,'A água estraga 2 materiais.')}else out(s,'A chuva passa sem estrago.')}}]}),
e_noise:s=>({bg:base(s,{night:1}),text:'Arrastar de pés na rua ao lado. Algo foi atraído pelo barulho da base. Os pelos do seu braço se arrepiam.',choices:[
 {l:'Ficar em silêncio',pt:2,fn:s=>{s.noise=Math.max(0,s.noise-6);out(s,'Silêncio total. Os passos se afastam.')}},{l:'Reforçar entradas (2 materiais)',res:{materials:2},fn:s=>{s.evMod-=3;out(s,'Entradas reforçadas. Ameaça reduzida.')}},
 {l:'Ignorar',fn:s=>{s.noise=Math.min(20,s.noise+6);s.evMod+=5;out(s,'O barulho atrai ainda mais atenção.')}}]}),
e_sick:(s,c)=>{const v=s.survivors.find(x=>x.id==c.t);return{bg:base(s),text:v.name+' amanheceu com febre alta e tremores.',choices:[
 {l:'Tratar (1 medicamento)',res:{medicine:1},fn:s=>{v.health=Math.min(100,v.health+20);out(s,v.name+' reage ao tratamento.')}},{l:'Isolar e esperar',pt:1,fn:s=>{hurt(s,v,10,'doença');out(s,v.name+' passa o dia isolado (−10 saúde).')}},
 {l:'Ignorar',fn:s=>{hurt(s,v,25,'doença sem tratamento');v.morale-=15;out(s,v.name+' piora sem cuidado (−25 saúde). O grupo desaprova.')}}]}},
e_raiders:s=>({bg:base(s,{fig:'g'}),text:'Um grupo armado bloqueia a rua diante do abrigo: querem comida em troca de "passagem segura".',choices:[
 {l:'Pagar (3 comida)',res:{food:3},fn:s=>{s.hostile=Math.max(0,s.hostile-1);out(s,'Pagamento feito. Por ora, eles recuam.')}},
 {l:'Negociar',pt:2,fn:s=>{if(rnd(s)<.55){add(s,'food',-1);out(s,'Acordo: só 1 comida.')}else{add(s,'food',-3);out(s,'A negociação falha: 3 comida levadas.')}}},
 {l:'Resistir (2 munição)',res:{ammunition:2},fn:s=>{const L=alive(s),C=L.reduce((a,x)=>a+x.combat,0)/L.length;if(rnd(s)<.45+.05*C){s.stats.repelled++;add(s,'materials',2);out(s,'Eles fogem, deixando 2 materiais para trás.')}else{const v=pick(s,L);hurt(s,v,25,'confronto com saqueadores');add(s,'food',-3);out(s,'O tiroteio falha: '+v.name+' ferido e 3 comida perdidas.')}}}]}),
e_share:s=>({bg:base(s),text:'Há reclamações de que as porções estão desiguais. A tensão cresce na cozinha.',choices:[
 {l:'Dividir mais (2 comida)',res:{food:2},fn:s=>{s.flags.share=s.day;alive(s).forEach(x=>{x.morale+=8;x.loyalty+=4});out(s,'Todos comem melhor. A confiança cresce.')}},
 {l:'Manter as regras',fn:s=>{s.flags.share=s.day;alive(s).forEach(x=>{x.morale-=6;x.loyalty-=3});out(s,'A ordem se mantém, mas o clima piora.')}}]}),
e_radio:s=>({bg:base(s,{night:1}),text:'O rádio chia e revela uma frase entrecortada sobre um local ainda intocado.',choices:[
 {l:'Anotar e investigar',pt:1,fn:s=>{s.flags.radio=s.day;const L=pick(s,LOCS);s.visits[L.id]=0;out(s,'Você anota as coordenadas: '+L.name+' voltou a ter recursos.')}},{l:'Desligar o rádio',fn:s=>{s.flags.radio=s.day;out(s,'Silêncio. Nada de novo.')}}]}),
e_fire:s=>({bg:base(s,{night:1}),text:'Faíscas no corredor. Um incêndio começa a se espalhar pelas paredes.',choices:[
 {l:'Combater com água (2)',res:{water:2},fn:s=>out(s,'Fogo apagado a tempo.')},{l:'Ignorar',fn:s=>{s.base.damage=Math.min(60,s.base.damage+10);add(s,'materials',-2);out(s,'O fogo consome materiais e fere a estrutura (−10 segurança).')}}]}),
build:s=>({bg:base(s),text:'O que reforçar? Cada obra leva 3 PT.',choices:[...Object.entries(UPG).map(([id,u])=>{const own=!u.rep&&s.base.upgrades.includes(id)||(id=='barricade'&&G.count(s,id)>=3);
 return{l:(own?'✔ ':'')+u.name+' · '+Object.entries(u.cost).map(([k,v])=>v+' '+RES[k].toLowerCase()).join(' + '),pt:3,res:u.cost,off:own,fn:s=>{s.base.upgrades.push(id);log(s,'Construído: '+u.name.split(' (')[0]+'.');out(s,'Você trabalha até as mãos sangrarem. '+u.name.split(' (')[0]+' pronto.','build')}}}),{l:'Voltar',fn:s=>go(s,'hub')}]}),
camp:s=>({bg:base(s),text:'O abrigo precisa de cuidados. Estrutura: dano '+s.base.damage+', segurança '+G.security(s)+'.',choices:[
 {l:'Reparar estrutura · 2 PT · 2 materiais',pt:2,res:{materials:2},off:!s.base.damage,fn:s=>{s.base.damage=Math.max(0,s.base.damage-12);out(s,'Tábuas, pregos e paciência: a estrutura está mais firme.','camp')}},
 {l:'Fabricar munição · 2 PT · 3 materiais',pt:2,res:{materials:3},off:!s.base.upgrades.includes('workshop'),fn:s=>{const a=add(s,'ammunition',4);out(s,'Você improvisa '+a+' munições na bancada.','camp')}},
 ...alive(s).filter(v=>v.health<100).map(v=>({l:'Tratar '+v.name+' · 1 PT · 1 medicamento',pt:1,res:{medicine:1},fn:s=>{const h=20+(s.base.upgrades.includes('infirmary')?10:0)+Math.max(...alive(s).map(x=>x.medicine));v.health=Math.min(100,v.health+h);out(s,v.name+' recupera '+h+' de saúde.','camp')}})),
 ...comp(s).filter(v=>!v.checked||v.checked=='Inconclusivo').map(v=>({l:'Interrogar '+v.name+' · 2 PT',pt:2,fn:s=>go(s,'probe',{id:v.id,ms:Math.floor(rnd(s)*1e9)})})),
 {l:'Voltar',fn:s=>go(s,'hub')}]}),
wires:(s,c)=>({bg:at(s,c.loc),text:'Uma porta de aço lacrada e um painel exposto com quatro fios soltos. Ligue cada fio ao terminal certo usando as pistas gravadas na caixa.',
 mini:{type:'wires',seed:c.ms,tries:3+(party(s,c).some(v=>v.skill=='Eletricista')?1:0)},
 done:(s,c,r)=>{if(r.ok){const k=c.loc=='radio'?{fuel:2,components:2}:{tools:1,components:2},g=Object.entries(k).map(([x,n])=>add(s,x,n)+' '+RES[x].toLowerCase());out(s,'A porta desliza e revela um depósito intacto: '+g.join(', ')+'.','arrive',c)}
  else{s.noise=G.clamp(s.noise+4,0,20);out(s,'O curto dispara um alarme que ecoa pela rua. Algo responde ao som...','monster',{...c,n:1},at(s,c.loc,{fig:'m',n:1}))}}}),
probe:(s,c)=>{const v=s.survivors.find(x=>x.id==c.id);return{bg:base(s),text:'Você reúne o que sabe sobre '+v.name+' e coloca tudo sobre a mesa: relatos, objetos, lembranças. Nem tudo é confiável. Pese as provas e decida.',mini:{type:'probe',seed:c.ms,truth:v.secret,name:v.name},
 done:(s,c,r)=>{const bad=v.secret!='honest';
  if(r.verdict=='guilty'&&bad){v.left=true;v.checked='Culpado';add(s,'food',2);add(s,'ammunition',1);out(s,'Pressionado pelas provas, '+v.name+' confessa e é expulso. Parte dos suprimentos desviados volta ao estoque (+2 comida, +1 munição).','camp')}
  else if(r.verdict=='guilty'){v.loyalty=Math.max(0,v.loyalty-25);v.morale-=10;v.checked='Acusado injustamente';out(s,'Você acusou um inocente. '+v.name+' perde a confiança em você (−25 lealdade).','camp')}
  else if(!bad){v.loyalty=Math.min(100,v.loyalty+8);v.checked='Sem indícios';out(s,'Você confia em '+v.name+', e a confiança é devolvida (+8 lealdade).','camp')}
  else{v.checked='Inconclusivo';out(s,'Você libera '+v.name+', mas algo continua não fechando.','camp')}}}},
dusk:s=>({bg:base(s,{night:1,fig:'m'}),text:'O alarme improvisado dispara: latas batendo no arame. Vultos se aproximam do abrigo por mais de uma entrada. É agora.',choices:[
 {l:'Defender com arma (2 munição)',res:{ammunition:2},fn:s=>go(s,'defense',{gun:1})},{l:'Defender com o que houver',fn:s=>go(s,'defense',{gun:0})}]}),
defense:(s,c)=>{const C=alive(s).filter(v=>v.health>25&&!s.out.includes(v.id)).length;return{bg:base(s,{night:1,fig:'m'}),text:'Cada entrada é um ponto fraco. Barre quem chegar primeiro, antes que passe da porta.',
 mini:{type:'defense',rounds:6,time:1300+120*C+(c.gun?350:0),gun:c.gun},done:(s,c,h)=>go(s,'night',{L:G.endDay(s,{attack:true,A:+(h/6*2.5).toFixed(1)})})}}};
