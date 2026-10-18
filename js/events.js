const W=(s,id,gap)=>s.flags[id]&&s.day-s.flags[id]<gap?0:1;
export const EVENTS=[
{id:'gate',min:2,w:s=>4*W(s,'gate',6),make:(s,A)=>({truth:A.pick(s,['true','partial','bad'])}),
title:'O homem no portão',text:()=>'Um homem ferido pede abrigo e promete informações sobre um depósito de medicamentos. A história pode ser verdadeira, parcial ou uma infiltração.',
opts:(s,e,A)=>[
{l:'Investigar',pt:2,off:e.inv,fn(){e.inv=1;A.log(s,{true:'Os ferimentos e a história conferem.',partial:'Os detalhes não batem: ele omite algo.',bad:'Marcas de bota recentes e um rádio escondido: ele observa a base.'}[e.truth]);return 1}},
{l:'Manter sob vigilância',pt:1,off:e.watch,fn(){e.watch=1;A.log(s,'Dois olhos ficam no portão. Ele sente a pressão.');return 1}},
{l:'Acolher',fn(){s.flags.gate=s.day;const bad=e.truth=='bad';
 if(bad&&e.watch){A.log(s,'Sob vigilância, o homem desiste e some na rua.');return}
 const v=A.makeSurvivor(s,bad?'spy':'honest');s.survivors.push(v);s.stats.recruited++;A.log(s,v.name+' entra na base. Mais uma boca para alimentar.');
 if(e.truth=='true'){A.add(s,'medicine',4);A.log(s,'Ele revela o depósito: +4 medicamentos.')}
 if(e.truth=='partial'){A.add(s,'medicine',2);A.log(s,'O depósito existe, mas está quase vazio: +2 medicamentos.')}
 if(bad)s.schedule.push({day:s.day+2,type:'theft',who:v.id})}},
{l:'Negociar (2 comida)',res:{food:2},fn(){s.flags.gate=s.day;if(e.truth=='bad')A.log(s,'A informação era falsa. Ele some com a comida.');else{A.add(s,'medicine',3);A.log(s,'Ele indica um esconderijo: +3 medicamentos.')}}},
{l:'Expulsar',fn(){s.flags.gate=s.day;A.log(s,'O portão permanece fechado. A oportunidade vai embora com ele.')}}]},
{id:'rain',min:1,w:()=>3,make:()=>({}),title:'Chuva forte',text:()=>'A chuva cai pesada sobre o telhado. Dá para captar água, mas há goteiras.',
opts:(s,e,A)=>[{l:'Captar água',pt:1,fn(){A.add(s,'water',4);A.log(s,'Baldes cheios: +4 água.')}},
{l:'Vedar goteiras (1 material)',res:{materials:1},fn(){A.log(s,'As goteiras foram vedadas.')}},
{l:'Ignorar',fn(){if(A.rnd(s)<.4){A.add(s,'materials',-2);A.log(s,'A água estraga 2 materiais.')}else A.log(s,'A chuva passa sem estrago.')}}]},
{id:'noise',min:3,w:s=>2+s.noise/5,make:()=>({}),title:'Ruídos próximos',text:()=>'Arrastar de pés na rua ao lado. Algo foi atraído pelo barulho da base.',
opts:(s,e,A)=>[{l:'Ficar em silêncio',pt:2,fn(){s.noise=Math.max(0,s.noise-6);A.log(s,'Silêncio total. Os passos se afastam.')}},
{l:'Reforçar entradas (2 materiais)',res:{materials:2},fn(){s.evMod-=3;A.log(s,'Entradas reforçadas. Ameaça reduzida.')}},
{l:'Ignorar',fn(){s.noise=Math.min(20,s.noise+6);s.evMod+=5;A.log(s,'O barulho atrai mais atenção.')}}]},
{id:'sick',min:2,w:()=>3,make:(s,A)=>{const v=A.pick(s,A.alive(s));return{t:v.id,n:v.name}},title:'Doença',text:(s,e)=>e.n+' amanheceu com febre alta e tremores.',
opts:(s,e,A)=>{const v=s.survivors.find(x=>x.id==e.t);return[
{l:'Tratar (1 medicamento)',res:{medicine:1},fn(){v.health=Math.min(100,v.health+20);A.log(s,v.name+' reage ao tratamento.')}},
{l:'Isolar e esperar',pt:1,fn(){v.health-=10;v.cause='doença';A.log(s,v.name+' passa o dia isolado (−10 saúde).')}},
{l:'Ignorar',fn(){v.health-=25;v.cause='doença sem tratamento';v.morale-=15;A.alive(s).forEach(x=>x.morale-=3);A.log(s,v.name+' piora sem cuidado (−25 saúde). O grupo desaprova.')}}]}},
{id:'raiders',min:4,w:s=>2+s.hostile/4,make:()=>({}),title:'Extorsão',text:()=>'Um grupo armado bloqueia a rua: querem comida em troca de "passagem segura".',
opts:(s,e,A)=>[{l:'Pagar (3 comida)',res:{food:3},fn(){s.hostile=Math.max(0,s.hostile-1);A.log(s,'Pagamento feito. Por ora, eles recuam.')}},
{l:'Negociar',pt:2,fn(){if(A.rnd(s)<.55){A.add(s,'food',-1);A.log(s,'Acordo: só 1 comida.')}else{A.add(s,'food',-3);A.log(s,'Negociação falha: 3 comida levadas.')}}},
{l:'Resistir (2 munição)',res:{ammunition:2},fn(){const L=A.alive(s),C=L.reduce((a,x)=>a+x.combat,0)/L.length;
 if(A.rnd(s)<.45+.05*C){s.stats.repelled++;A.add(s,'materials',2);A.log(s,'Eles fogem, deixando 2 materiais.')}else{const v=A.pick(s,L);v.health-=25;v.cause='confronto com saqueadores';A.add(s,'food',-3);A.log(s,'O tiroteio falha: '+v.name+' ferido e 3 comida perdidas.')}}}]},
{id:'share',min:2,w:s=>2*W(s,'share',5),make:()=>({}),title:'Dividir a comida',text:()=>'Há reclamações de que as porções estão desiguais. A tensão cresce na cozinha.',
opts:(s,e,A)=>[{l:'Dividir mais (2 comida)',res:{food:2},fn(){s.flags.share=s.day;A.alive(s).forEach(x=>{x.morale+=8;x.loyalty+=4});A.log(s,'Todos comem melhor. A confiança cresce.')}},
{l:'Manter as regras',fn(){s.flags.share=s.day;A.alive(s).forEach(x=>{x.morale-=6;x.loyalty-=3});A.log(s,'A ordem se mantém, mas o clima piora.')}}]},
{id:'radio',min:3,w:s=>2*W(s,'radio',8),make:()=>({}),title:'Sinal de rádio',text:()=>'Um rádio chia e revela uma frase entrecortada sobre um local ainda intocado.',
opts:(s,e,A)=>[{l:'Anotar e investigar',pt:1,fn(){s.flags.radio=s.day;const L=A.pick(s,['market','pharmacy','reservoir','workshop','radio']);s.visits[L]=0;A.log(s,'O local "'+L+'" volta a ter recursos.')}},
{l:'Desligar o rádio',fn(){s.flags.radio=s.day;A.log(s,'Silêncio. Nada de novo.')}}]},
{id:'fire',min:4,w:()=>2,make:()=>({}),title:'Curto-circuito',text:()=>'Faíscas no corredor. Um incêndio começa a se espalhar.',
opts:(s,e,A)=>[{l:'Combater com água (2)',res:{water:2},fn(){A.log(s,'Fogo apagado a tempo.')}},
{l:'Ignorar',fn(){s.base.damage=Math.min(60,s.base.damage+10);A.add(s,'materials',-2);A.log(s,'O fogo consome materiais e fere a estrutura (−10 segurança).')}}]}];
