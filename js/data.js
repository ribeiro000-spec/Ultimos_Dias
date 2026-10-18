export const RES={water:'Água',food:'Comida',medicine:'Medicamentos',materials:'Materiais',tools:'Ferramentas',ammunition:'Munição',fuel:'Combustível',components:'Componentes'};
export const BASES={
police:{name:'Delegacia abandonada',sec:45,pop:6,up:[],res:{water:6,food:5,medicine:2,materials:4,tools:2,ammunition:8,fuel:1,components:1},tease:'Concreto, grades e um armário de armas esquecido. As entradas são frágeis.'},
bunker:{name:'Bunker subterrâneo',sec:80,pop:5,up:['generator'],res:{water:8,food:8,medicine:3,materials:2,tools:1,ammunition:2,fuel:3,components:3},tease:'Um túnel selado no mato. Seguro e apertado, mas quase sem munição.'},
farm:{name:'Fazenda isolada',sec:35,pop:8,up:['garden'],res:{water:10,food:9,medicine:1,materials:5,tools:3,ammunition:1,fuel:2,components:0},tease:'Celeiro, poço e horta. Muito espaço, pouca proteção e quase nenhuma arma.'}};
export const LOCS=[
{id:'market',name:'Mercado',y:{food:7,materials:2},cost:3,risk:.2,note:'recursos disputados',arr:'O átrio do antigo shopping está silencioso. A claraboia deixa cair uma luz fria sobre as escadas rolantes paradas.'},
{id:'pharmacy',name:'Farmácia e hospital',y:{medicine:4,materials:1},cost:3,risk:.3,note:'infectados',arr:'Macas vazias, cortinas rasgadas e persianas entreabertas. Lá dentro, algo ainda faz barulho.'},
{id:'reservoir',name:'Represa',y:{water:8},cost:3,risk:.15,note:'contaminação',arr:'A represa ruge ao fundo. A água parece limpa demais para ser verdade.'},
{id:'workshop',name:'Oficina',y:{tools:2,components:2,materials:3},cost:4,risk:.4,note:'grupo hostil',arr:'Ferramentas penduradas, um portão entreaberto e marcas de bota recentes no óleo do chão.'},
{id:'radio',name:'Estação de rádio',y:{components:2,fuel:2},cost:4,risk:.45,note:'exposição',arr:'Mapas colados na parede, mesas viradas e um rádio velho. Alguém esteve aqui há pouco.'},
{id:'gas',name:'Posto de gasolina',y:{fuel:3,components:1,materials:2},cost:3,risk:.3,note:'ponto de passagem',arr:'As bombas enferrujadas ainda guardam cheiro de combustível. A placa de preços balança com o vento.'}];
export const UPG={
barricade:{name:'Barricadas (+15 segurança)',cost:{materials:6},rep:1},
workshop:{name:'Oficina (libera fabricação)',cost:{materials:5,tools:1}},
infirmary:{name:'Enfermaria (tratamento melhor)',cost:{materials:4,medicine:2}},
depot:{name:'Depósito (+20 capacidade)',cost:{materials:5},rep:1},
generator:{name:'Gerador',cost:{materials:4,components:2}},
alarm:{name:'Alarme (requer gerador)',cost:{materials:2,components:2}},
garden:{name:'Horta (+2 comida/noite)',cost:{materials:4,water:2}}};
// índice = arquivo assets/portraits/NN.jpg
export const CHARS=[
['Marcos','Líder','Melhora a moral do grupo e a organização da base.','combat'],
['Lívia','Médica','Reduz o custo de tratamentos e melhora a recuperação.','medicine'],
['Jonas','Mecânico','Diminui o consumo de materiais em reparos e construções.','technique'],
['Rafael','Batedor','Melhora a qualidade das informações em expedições.','exploration'],
['Camila','Vigilante','Aumenta a defesa da base e reduz o risco de ataques.','combat'],
['Daniel','Negociador','Aumenta as chances de trocas vantajosas e acordos.',''],
['Antonio','Eletricista','Facilita minigames elétricos e manutenção de energia.','technique'],
['Bia','Cultivadora','Aumenta a produção de comida: +1 comida por noite.',''],
['Leandro','Atirador','Melhora o combate e reduz o consumo de munição.','combat'],
['Soraia','Psicóloga','Aumenta a moral do grupo a cada noite.',''],
['Pedro','Coletor','Aumenta a quantidade de recursos encontrados.','exploration'],
['Júlia','Rádio operadora','Melhora a recepção de sinais e eventos especiais.',''],
['Vitor','Guarda','Aumenta a segurança da base e a eficiência em defesa.','combat'],
['Thais','Fabricante','Reduz o custo de fabricação e melhora os itens.','technique'],
['Gabriel','Explorador','Aumenta a velocidade e o alcance das expedições.','exploration'],
['Renato','Guarda-costas','Protege outros sobreviventes e reduz o risco de traição.','combat'],
['Carla','Cozinheira','Reduz o consumo de comida: +1 comida por noite.',''],
['Fernando','Pesquisador','Aumenta a chance de encontrar informações e pistas.','exploration']].map(([n,s,d,k],i)=>({i,n,s,d,k}));
export const IMG={police:'police',bunker:'tunnel',farm:'farm',market:'mall',pharmacy:'hospital',reservoir:'dam',workshop:'workshop',radio:'office',gas:'gas',street:'city',road:'forestroad',shelter:'shelter',ruins:'ruins',build:'workbench',attack:'attack',help:'help',snow:'snow',forest:'forest',lake:'lake',bridge:'bridge',mountain:'mountain',collapsed:'collapsed',campbase:'campbase',city:'city'};
export const PLACE={police:'Delegacia abandonada',bunker:'Bunker subterrâneo',farm:'Fazenda isolada',market:'Mercado',pharmacy:'Farmácia e hospital',reservoir:'Represa',workshop:'Oficina',radio:'Estação de rádio',gas:'Posto de gasolina',street:'Rua deserta',road:'Estrada',shelter:'Abrigo',ruins:'Cidade em ruínas',build:'Bancada da base',attack:'Ataque à base',help:'Estrada',snow:'Montanhas',forest:'Floresta',lake:'Lago',bridge:'Ponte quebrada',city:'Cidade'};
export const STARTS={
road:'Vocês dormem encolhidos num carro parado no acostamento. O tanque está seco, o rádio só chia, e a estrada está vazia até onde a vista alcança.',
market:'Vocês se escondem entre as prateleiras tombadas de um shopping saqueado. Lá fora, algo arrasta os pés pelo estacionamento.',
street:'Uma sirene distante morre devagar. Vocês estão no meio de uma rua cheia de carros abandonados, com as mãos sujas e a cabeça zunindo.',
gas:'Vocês passaram a noite num posto de gasolina saqueado, ouvindo a placa de preços ranger ao vento. As bombas estão secas.',
bridge:'O rio corre sob uma ponte quebrada. Vocês atravessaram a pé a madrugada inteira e a outra margem ainda parece longe.'};
export const SIL='data:audio/wav;base64,UklGRkQDAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSADAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==';
