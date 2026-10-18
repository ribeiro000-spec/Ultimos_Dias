export const RES={water:'Água',food:'Comida',medicine:'Medicamentos',materials:'Materiais',tools:'Ferramentas',ammunition:'Munição',fuel:'Combustível',components:'Componentes'};
export const BASES={
police:{name:'Delegacia abandonada',sec:45,pop:6,up:[],res:{water:6,food:5,medicine:2,materials:4,tools:2,ammunition:8,fuel:1,components:1},tease:'Concreto, grades e um armário de armas esquecido. As entradas são frágeis.'},
bunker:{name:'Bunker subterrâneo',sec:80,pop:5,up:['generator'],res:{water:8,food:8,medicine:3,materials:2,tools:1,ammunition:2,fuel:3,components:3},tease:'Uma escotilha de aço no mato. Segura e apertada, mas quase sem munição.'},
farm:{name:'Fazenda isolada',sec:35,pop:8,up:['garden'],res:{water:10,food:9,medicine:1,materials:5,tools:3,ammunition:1,fuel:2,components:0},tease:'Celeiro, poço e horta. Muito espaço, pouca proteção e quase nenhuma arma.'}};
export const LOCS=[
{id:'market',name:'Mercado',y:{food:7,materials:2},cost:3,risk:.2,note:'recursos disputados',arr:'O letreiro do mercado pende de um parafuso. Lá dentro, carrinhos tombados e vidro por toda parte.'},
{id:'pharmacy',name:'Farmácia',y:{medicine:4,materials:1},cost:3,risk:.3,note:'infectados',arr:'A cruz da farmácia ainda se destaca no escuro. A porta está entreaberta, e isso nunca é bom sinal.'},
{id:'reservoir',name:'Reservatório',y:{water:8},cost:3,risk:.15,note:'contaminação',arr:'O reservatório respira vapor frio. A água parece limpa demais para ser verdade.'},
{id:'workshop',name:'Oficina',y:{tools:2,components:2,materials:3},cost:4,risk:.4,note:'grupo hostil',arr:'Pneus empilhados, um guindaste enferrujado e marcas de bota recentes no óleo do chão.'},
{id:'radio',name:'Estação de rádio',y:{components:2,fuel:2},cost:4,risk:.45,note:'exposição',arr:'A torre de rádio rasga o céu. Uma luz vermelha ainda pisca lá no alto, teimosa.'}];
export const UPG={
barricade:{name:'Barricadas (+15 segurança)',cost:{materials:6},rep:1},
workshop:{name:'Oficina (libera fabricação)',cost:{materials:5,tools:1}},
infirmary:{name:'Enfermaria (tratamento melhor)',cost:{materials:4,medicine:2}},
depot:{name:'Depósito (+20 capacidade)',cost:{materials:5},rep:1},
generator:{name:'Gerador',cost:{materials:4,components:2}},
alarm:{name:'Alarme (requer gerador)',cost:{materials:2,components:2}},
garden:{name:'Horta (+2 comida/noite)',cost:{materials:4,water:2}}};
export const NAMES=[['Marta','Médico'],['Rui','Mecânico'],['Ione','Batedor'],['Caio','Vigilante'],['Léo','Negociador'],['Nina','Eletricista'],['Davi','Batedor'],['Sara','Médico'],['Otto','Mecânico'],['Bia','Vigilante'],['Hugo','Negociador'],['Vera','Eletricista'],['Tomás','Vigilante'],['Lia','Batedor']].map(([n,s])=>({n,s}));
export const STARTS={
road:'Você acorda no banco de um carro parado no acostamento. O tanque está seco, o rádio só chia, e a estrada está vazia até onde a vista alcança.',
market:'Você está agachado entre prateleiras tombadas num mercado saqueado. Lá fora, algo arrasta os pés pelo estacionamento. Você não sabe há quanto tempo está aqui.',
street:'Uma sirene distante morre devagar. Você está sentado no meio de uma rua cheia de carros abandonados, com as mãos sujas e a cabeça zunindo.'};
