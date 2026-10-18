let C,M,wG,hG,nb,muted=false;try{muted=localStorage.getItem('ud_mute')=='1'}catch(e){}
export const isMuted=()=>muted;
export function init(){
 if(C){C.state=='suspended'&&C.resume();return}
 try{C=new(window.AudioContext||window.webkitAudioContext)()}catch(e){return}
 M=C.createGain();M.gain.value=muted?0:.9;M.connect(C.destination);
 const len=C.sampleRate*3;nb=C.createBuffer(1,len,C.sampleRate);const d=nb.getChannelData(0);let l=0;for(let i=0;i<len;i++){l=l*.985+(Math.random()*2-1)*.03;d[i]=Math.max(-1,Math.min(1,l*7))}
 const w=C.createBufferSource();w.buffer=nb;w.loop=true;const f=C.createBiquadFilter();f.type='bandpass';f.frequency.value=480;f.Q.value=.7;wG=C.createGain();wG.gain.value=.5;w.connect(f);f.connect(wG);wG.connect(M);w.start();
 const lfo=C.createOscillator(),lg=C.createGain();lfo.frequency.value=.11;lg.gain.value=260;lfo.connect(lg);lg.connect(f.frequency);lfo.start();
 hG=C.createGain();hG.gain.value=.035;hG.connect(M);[49,73.4].forEach(fr=>{const o=C.createOscillator();o.type='triangle';o.frequency.value=fr;o.connect(hG);o.start()});
 (function far(){setTimeout(()=>{[sfx.growl,sfx.shot,sfx.clang][Math.random()*3|0](.18);far()},12000+Math.random()*25000)})()}
export function mode(m){if(!C)return;const t=C.currentTime;wG.gain.linearRampToValueAtTime(m=='bunker'?.12:m=='night'?.35:.5,t+1.5);hG.gain.linearRampToValueAtTime(m=='bunker'?.09:.035,t+1.5)}
export function toggle(){muted=!muted;try{localStorage.setItem('ud_mute',muted?'1':'0')}catch(e){}if(M)M.gain.value=muted?0:.9;return muted}
function tone(f,d,type='sine',v=.2,to=0,at=0){if(!C||muted)return;const t=C.currentTime+at,o=C.createOscillator(),g=C.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(to)o.frequency.exponentialRampToValueAtTime(to,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(M);o.start(t);o.stop(t+d+.05)}
function burst(d,v,fq,type='lowpass',at=0){if(!C||muted)return;const t=C.currentTime+at,s=C.createBufferSource(),f=C.createBiquadFilter(),g=C.createGain();s.buffer=nb;f.type=type;f.frequency.value=fq;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(f);f.connect(g);g.connect(M);s.start(t,Math.random()*2);s.stop(t+d+.05)}
export const sfx={
 click:()=>tone(520,.05,'square',.05),
 knock:()=>[0,.28,.5].forEach(a=>{tone(95,.12,'sine',.5,50,a);burst(.08,.4,700,'lowpass',a)}),
 growl:(v=.5)=>{tone(70,.9,'sawtooth',.18*v/.5,38);tone(92,.9,'sawtooth',.1*v/.5,50);burst(.8,.25*v,300)},
 shot:(v=1)=>{burst(.35,.9*v,2400);tone(120,.25,'sine',.5*v,40)},
 hit:()=>{burst(.12,.7,900);tone(140,.15,'square',.2,60)},
 ok:()=>{tone(660,.12,'triangle',.15);tone(880,.18,'triangle',.15,0,.1)},
 miss:()=>tone(180,.25,'sawtooth',.15,90),
 find:()=>{tone(1200,.08,'triangle',.12);tone(1600,.12,'triangle',.1,0,.07)},
 danger:()=>{tone(110,.7,'sawtooth',.25,55);tone(116,.7,'sawtooth',.2,58)},
 sting:()=>{tone(55,2.2,'sine',.5,40);tone(220,1.5,'triangle',.08,160);burst(1.6,.2,200)},
 heart:()=>[0,.22,.9,1.12].forEach((a,i)=>tone(60,.14,'sine',i%2?.35:.5,40,a)),
 clang:(v=.5)=>{tone(420,.9,'square',.06*v,0);tone(633,.7,'square',.04*v)},
 step:()=>burst(.07,.15,500)};
