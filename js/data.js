export const RES={water:'Água',food:'Comida',medicine:'Medicamentos',materials:'Materiais',tools:'Ferramentas',ammunition:'Munição',fuel:'Combustível',components:'Componentes'};
export const LOCS=[
{id:'market',name:'Mercado',y:{food:7,materials:2},cost:3,risk:.2,note:'recursos disputados'},
{id:'pharmacy',name:'Farmácia',y:{medicine:4,materials:1},cost:3,risk:.3,note:'infectados'},
{id:'reservoir',name:'Reservatório',y:{water:8},cost:3,risk:.15,note:'contaminação'},
{id:'workshop',name:'Oficina',y:{tools:2,components:2,materials:3},cost:4,risk:.4,note:'grupo hostil'},
{id:'radio',name:'Estação de rádio',y:{components:2,fuel:2},cost:4,risk:.45,note:'exposição'}];
export const UPG={
barricade:{name:'Barricadas (+15 segurança)',cost:{materials:6},rep:1},
workshop:{name:'Oficina (libera fabricação)',cost:{materials:5,tools:1}},
infirmary:{name:'Enfermaria (tratamento melhor)',cost:{materials:4,medicine:2}},
depot:{name:'Depósito (+20 capacidade)',cost:{materials:5},rep:1},
generator:{name:'Gerador',cost:{materials:4,components:2}},
alarm:{name:'Alarme (requer gerador)',cost:{materials:2,components:2}},
garden:{name:'Horta (+2 comida/noite)',cost:{materials:4,water:2}}};
export const POOL=[['Marta','Médico'],['Rui','Mecânico'],['Ione','Batedor'],['Caio','Vigilante'],['Léo','Negociador'],['Nina','Eletricista'],['Davi','Batedor'],['Sara','Médico'],['Otto','Mecânico'],['Bia','Vigilante'],['Hugo','Negociador'],['Vera','Eletricista']].map(([n,s])=>({n,s}));
