import {SIL} from './data.js';
let C,M,wG,hG,nb,muted=false,ready=false,keep;try{muted=localStorage.getItem('ud_mute')=='1'}catch(e){}
export const isMuted=()=>muted;
export const running=()=>!!C&&C.state=='running';
function build(){
 M=C.createGain();M.gain.value=muted?0:1;M.connect(C.destination);
 const len=C.sampleRate*3;nb=C.createBuffer(1,len,C.sampleRate);const d=nb.getChannelData(0);let l=0;for(let i=0;i<len;i++){l=l*.985+(Math.random()*2-1)*.03;d[i]=Math.max(-1,Math.min(1,l*7))}
 const w=C.createBufferSource();w.buffer=nb;w.loop=true;const f=C.createBiquadFilter();f.type='bandpass';f.frequency.value=520;f.Q.value=.7;wG=C.createGain();wG.gain.value=1.1;w.connect(f);f.connect(wG);wG.connect(M);w.start();
 const lfo=C.createOscillator(),lg=C.createGain();lfo.frequency.value=.11;lg.gain.value=260;lfo.connect(lg);lg.connect(f.frequency);lfo.start();
 hG=C.createGain();hG.gain.value=.07;hG.connect(M);[49,73.4,98].forEach((fr,i)=>{const o=C.createOscillator();o.type='triangle';o.frequency.value=fr;const g=C.createGain();g.gain.value=i==2?.4:1;o.connect(g);g.connect(hG);o.start()});
 (function far(){setTimeout(()=>{[sfx.growl,sfx.shot,sfx.clang][Math.random()*3|0](.3);far()},10000+Math.random()*22000)})()}
export function init(){
 try{
  if(!C){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;C=new AC();build();
   try{if(navigator.audioSession)navigator.audioSession.type='playback'}catch(e){}
   try{keep=new Audio(SIL);keep.loop=true;keep.play().catch(()=>{})}catch(e){}}
  if(C.state!='running')C.resume();
  if(!ready&&C.state=='running'){const s=C.createBufferSource();s.buffer=C.createBuffer(1,1,22050);s.connect(C.destination);s.start(0);ready=true}
 }catch(e){console.error('áudio',e)}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&C&&C.state!='running')C.resume()});
export function mode(m){if(!C)return;const t=C.currentTime;wG.gain.setTargetAtTime(m=='bunker'?.25:m=='night'?.7:1.1,t,1.2);hG.gain.setTargetAtTime(m=='bunker'?.14:.07,t,1.2)}
export function toggle(){muted=!muted;try{localStorage.setItem('ud_mute',muted?'1':'0')}catch(e){}if(M)M.gain.value=muted?0:1;if(!muted)setTimeout(()=>sfx.ok(),50);return muted}
function tone(f,d,type='sine',v=.2,to=0,at=0){if(!C||muted)return;const t=C.currentTime+at,o=C.createOscillator(),g=C.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(to)o.frequency.exponentialRampToValueAtTime(to,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(M);o.start(t);o.stop(t+d+.05)}
function burst(d,v,fq,type='lowpass',at=0){if(!C||muted)return;const t=C.currentTime+at,s=C.createBufferSource(),f=C.createBiquadFilter(),g=C.createGain();s.buffer=nb;f.type=type;f.frequency.value=fq;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(f);f.connect(g);g.connect(M);s.start(t,Math.random()*2);s.stop(t+d+.05)}
export const sfx={
 click:()=>{tone(520,.06,'square',.12);burst(.04,.3,2500,'highpass')},
 knock:()=>[0,.28,.5].forEach(a=>{tone(95,.14,'sine',.9,50,a);burst(.09,.8,700,'lowpass',a)}),
 growl:(v=.7)=>{tone(70,.9,'sawtooth',.3*v,38);tone(92,.9,'sawtooth',.18*v,50);burst(.8,.5*v,300)},
 shot:(v=1)=>{burst(.35,1.2*v,2400);tone(120,.25,'sine',.8*v,40)},
 hit:()=>{burst(.12,1,900);tone(140,.15,'square',.3,60)},
 ok:()=>{tone(660,.14,'triangle',.3);tone(880,.2,'triangle',.3,0,.1)},
 miss:()=>tone(180,.28,'sawtooth',.3,90),
 find:()=>{tone(1200,.09,'triangle',.25);tone(1600,.14,'triangle',.2,0,.07)},
 danger:()=>{tone(110,.7,'sawtooth',.4,55);tone(116,.7,'sawtooth',.3,58)},
 sting:()=>{tone(55,2.2,'sine',.9,40);tone(220,1.5,'triangle',.15,160);burst(1.6,.4,200)},
 heart:()=>[0,.22,.9,1.12].forEach((a,i)=>tone(60,.14,'sine',i%2?.6:.9,40,a)),
 clang:(v=.7)=>{tone(420,.9,'square',.1*v);tone(633,.7,'square',.07*v)},
 static:()=>burst(1.4,.5,3000,'bandpass'),
 alert:()=>{[0,.5,1].forEach(a=>{tone(853,.4,'square',.12,0,a);tone(960,.4,'square',.12,0,a)});burst(.4,.3,3000,'bandpass')},
 step:()=>burst(.07,.3,500)};
