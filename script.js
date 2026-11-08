const screens=[...document.querySelectorAll('.screen')];
let current='welcome';
const flow=['rangoli','diyas','sparklers','fireworks','gifts','memories','finale'];
const completed=new Set();
function show(id){screens.forEach(s=>s.classList.toggle('active',s.id===id));current=id;window.scrollTo({top:0,behavior:'smooth'});if(id==='rangoli')resizeCanvas();if(id==='finale')startFinalSong();}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2300);}
function confetti(){const layer=document.getElementById('confetti-layer');for(let i=0;i<55;i++){const e=document.createElement('i');e.className='confetti';e.style.left=Math.random()*100+'%';e.style.animationDelay=Math.random()*.8+'s';e.style.setProperty('--c',['#ffca65','#ff6fae','#8ce6d4','#b49aff'][i%4]);layer.append(e);setTimeout(()=>e.remove(),3500);}}
function unlock(id,label){if(completed.has(id))return;completed.add(id);const b=document.getElementById('next-'+id);if(b){b.disabled=false;b.textContent=label;}confetti();toast('Beautiful! You completed this little surprise 💛');}
function next(id){if(!completed.has(id))return;show(flow[flow.indexOf(id)+1]);}
document.getElementById('enter-btn').addEventListener('click',()=>{initSound();show('rangoli');confetti();});
document.querySelectorAll('.next-btn').forEach(b=>b.addEventListener('click',()=>next(b.id.replace('next-',''))));

// Original in-browser festival sound effects. No extra audio files are needed.
let audioCtx=null,noiseBuffer=null;
function initSound(){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;if(!audioCtx){audioCtx=new AC();noiseBuffer=audioCtx.createBuffer(1,audioCtx.sampleRate, audioCtx.sampleRate);const data=noiseBuffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;}if(audioCtx.state==='suspended')audioCtx.resume();}
function tone(freq,duration,type='sine',volume=.04,delay=0,endFreq=null){if(!audioCtx)return;const t=audioCtx.currentTime+delay,o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);if(endFreq)o.frequency.exponentialRampToValueAtTime(endFreq,t+duration);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(volume,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(audioCtx.destination);o.start(t);o.stop(t+duration+.03);}
function noise(duration=.18,volume=.035,filter=4500,delay=0){if(!audioCtx||!noiseBuffer)return;const t=audioCtx.currentTime+delay,src=audioCtx.createBufferSource(),f=audioCtx.createBiquadFilter(),g=audioCtx.createGain();src.buffer=noiseBuffer;f.type='highpass';f.frequency.value=filter;g.gain.setValueAtTime(volume,t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);src.connect(f);f.connect(g);g.connect(audioCtx.destination);src.start(t);src.stop(t+duration);}
function sfx(kind){initSound();if(!audioCtx)return;
 if(kind==='rangoli'){tone(660,.12);tone(880,.18,'sine',.035,.1);}
 if(kind==='diya'){tone(540,.18,'sine',.025);tone(880,.28,'sine',.045,.08);tone(1320,.38,'sine',.025,.18);noise(.12,.012,6500,.03);}
 if(kind==='sparkle'){noise(.11,.045,3600);tone(1650,.09,'triangle',.018);tone(2200,.13,'sine',.015,.04);}
 if(kind==='gift'){tone(740,.14);tone(990,.2,'sine',.035,.12);}
 if(kind==='rocket'){noise(.38,.055,700,.0);tone(190,.42,'sawtooth',.035,0,900);}
 if(kind==='firework'){noise(.42,.11,900);tone(95,.32,'sine',.07,0,42);for(let i=0;i<5;i++){noise(.12,.035,2500,.08+i*.055);tone(700+Math.random()*900,.18,'triangle',.018,.08+i*.045);}}
}

// Rangoli: draw enough strokes to finish.
const canvas=document.getElementById('rangoli-canvas'),ctx=canvas.getContext('2d');let drawing=false,colour='#ff477e',moves=0;
function resizeCanvas(){const r=canvas.getBoundingClientRect(),d=window.devicePixelRatio||1;const old=document.createElement('canvas');old.width=canvas.width;old.height=canvas.height;if(old.width&&old.height)old.getContext('2d').drawImage(canvas,0,0);canvas.width=r.width*d;canvas.height=r.height*d;ctx.setTransform(d,0,0,d,0,0);ctx.lineCap='round';ctx.lineJoin='round';if(old.width&&old.height)ctx.drawImage(old,0,0,old.width,old.height,0,0,r.width,r.height);}
window.addEventListener('resize',()=>{if(current==='rangoli')resizeCanvas();});
document.querySelectorAll('#palette button').forEach(b=>b.addEventListener('click',()=>{document.querySelector('#palette .selected')?.classList.remove('selected');b.classList.add('selected');colour=getComputedStyle(b).getPropertyValue('--c').trim();}));
function point(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
canvas.addEventListener('pointerdown',e=>{initSound();drawing=true;canvas.setPointerCapture(e.pointerId);const p=point(e);ctx.beginPath();ctx.moveTo(p.x,p.y);});
canvas.addEventListener('pointermove',e=>{if(!drawing)return;const p=point(e);ctx.strokeStyle=colour;ctx.lineWidth=5;ctx.lineTo(p.x,p.y);ctx.stroke();ctx.beginPath();ctx.arc(p.x,p.y,3,0,Math.PI*2);ctx.fillStyle=colour;ctx.fill();ctx.beginPath();ctx.moveTo(p.x,p.y);moves++;if(moves%12===0)sfx('rangoli');if(moves>=30)unlock('rangoli','Your rangoli is complete! Continue →');});
['pointerup','pointercancel','lostpointercapture'].forEach(ev=>canvas.addEventListener(ev,()=>drawing=false));
document.getElementById('clear-rangoli').addEventListener('click',()=>{ctx.clearRect(0,0,canvas.width,canvas.height);moves=0;completed.delete('rangoli');const b=document.getElementById('next-rangoli');b.disabled=true;b.textContent='Complete your rangoli to continue ✨';});

// Diyas: every diya must be lit.
const diyas=[...document.querySelectorAll('.diya-tile')];
diyas.forEach(b=>b.addEventListener('click',()=>{if(b.classList.contains('lit'))return;b.classList.add('lit');b.querySelector('small').textContent='lit ✨';document.getElementById('wish-pop').textContent=b.dataset.wish;sfx('diya');if(diyas.every(x=>x.classList.contains('lit')))unlock('diyas','All your diyas are glowing! Continue →');}));

// Phuljadi: press and drag the glowing sparkler. It crackles continuously and counts real movement.
const pad=document.getElementById('sparkle-pad');let lastSpark=0,sparkCount=0,sparkDragging=false,lastCrackle=0;
function makeSpark(x,y){const s=document.createElement('i');s.className='spark';s.style.left=x+'px';s.style.top=y+'px';s.style.setProperty('--spark',['#ffdf7e','#ffb64b','#fff1b2','#ff8b45'][Math.floor(Math.random()*4)]);pad.append(s);setTimeout(()=>s.remove(),950);}
function moveSparkler(e){if(!sparkDragging)return;const now=Date.now();if(now-lastSpark<13)return;lastSpark=now;const r=pad.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;makeSpark(x,y);const stick=pad.querySelector('.sparkler-stick');stick.style.left=Math.max(12,Math.min(r.width-12,x))+'px';stick.style.top=Math.max(12,Math.min(r.height-12,y))+'px';stick.classList.add('active');sparkCount++;document.getElementById('sparkle-score').textContent=Math.min(sparkCount,35);if(now-lastCrackle>95){sfx('sparkle');lastCrackle=now;}if(sparkCount>=35){sparkDragging=false;stick.classList.remove('active');unlock('sparklers','Phuljadi complete! Continue →');}}
pad.addEventListener('pointerdown',e=>{initSound();sparkDragging=true;pad.setPointerCapture(e.pointerId);moveSparkler(e);});
pad.addEventListener('pointermove',moveSparkler);
['pointerup','pointercancel','lostpointercapture'].forEach(ev=>pad.addEventListener(ev,()=>{sparkDragging=false;pad.querySelector('.sparkler-stick').classList.remove('active');}));

// Fireworks: the rocket launches from the bottom, travels to the chosen point, then bursts.
const sky=document.getElementById('firework-sky');let bursts=0;
sky.addEventListener('pointerdown',e=>{if(bursts>=3)return;initSound();const r=sky.getBoundingClientRect(),x=Math.max(20,Math.min(r.width-20,e.clientX-r.left)),y=Math.max(45,Math.min(r.height-70,e.clientY-r.top));const rocket=document.createElement('div');rocket.className='rocket';rocket.style.left=x+'px';rocket.style.setProperty('--rise',(-(r.height-y))+'px');sky.append(rocket);sfx('rocket');setTimeout(()=>{rocket.remove();const f=document.createElement('div');f.className='firework';f.style.left=x+'px';f.style.top=y+'px';sky.append(f);const colors=['#ffcf68','#ff6fae','#7de7d7','#c5a3ff','#fff0a4','#ffffff'];for(let i=0;i<52;i++){const p=document.createElement('i'),a=Math.PI*2*i/52,dist=45+Math.random()*105;p.className='particle';p.style.setProperty('--x',Math.cos(a)*dist+'px');p.style.setProperty('--y',Math.sin(a)*dist+'px');p.style.setProperty('--p',colors[Math.floor(Math.random()*colors.length)]);p.style.setProperty('--delay',(Math.random()*.12)+'s');f.append(p);}setTimeout(()=>f.remove(),1450);sfx('firework');bursts++;document.getElementById('firework-count').textContent=bursts+' / 3 BURSTS';if(bursts>=3)unlock('fireworks','The sky is yours! Continue →');},520);});

// Open every little gift.
const gifts=[...document.querySelectorAll('.gift-box')],opened=new Set();
gifts.forEach((b,i)=>b.addEventListener('click',()=>{if(opened.has(i))return;opened.add(i);document.getElementById('gift-reveal').textContent=b.dataset.message;b.style.transform='scale(.92) rotate(-4deg)';setTimeout(()=>b.style.transform='',180);confetti();sfx('gift');if(opened.size===gifts.length)unlock('gifts','All gifts opened! Continue →');}));

// Memories: all ten photos must be viewed; image paths match files in repository root.
const captions=['My favourite smile. Obviously yours.','This one makes me smile every single time.','Festive us = my favourite us.','You + me + a little bit of madness.','I could look at this one forever.','My favourite person to get dressed up with.','A tiny memory, a very big feeling.','The way you look at me. Ufff.','More moments like these, please.','And many, many more to come. ❤️'];
let mem=0;const seen=new Set(),img=document.getElementById('memory-image');
function renderMem(){img.src='memory-'+String(mem+1).padStart(2,'0')+'.jpeg';img.alt='A favourite memory of us, photo '+(mem+1);document.getElementById('memory-caption').textContent=captions[mem];document.getElementById('memory-counter').textContent=String(mem+1).padStart(2,'0')+' / 10';document.getElementById('memory-dots').innerHTML=captions.map((_,i)=>'<span class="'+(i===mem?'active':'')+'"></span>').join('');seen.add(mem);if(seen.size===10)unlock('memories','Every memory seen! Meet me at the finale 💌');}
function stepMem(d){mem=(mem+d+10)%10;renderMem();sfx('sparkle');}
document.getElementById('prev-memory').addEventListener('click',()=>stepMem(-1));document.getElementById('next-memory').addEventListener('click',()=>stepMem(1));
let touchX=0;document.querySelector('.polaroid').addEventListener('touchstart',e=>touchX=e.changedTouches[0].screenX,{passive:true});document.querySelector('.polaroid').addEventListener('touchend',e=>{const dx=e.changedTouches[0].screenX-touchX;if(Math.abs(dx)>35)stepMem(dx<0?1:-1);},{passive:true});renderMem();

// Final page song starts on the user's Next tap and loops continuously, with no player controls.
const song=document.getElementById('song'),disc=document.querySelector('.music-disc');let songStarted=false;
function startFinalSong(){if(songStarted)return;song.loop=true;song.volume=1;const p=song.play();if(p&&p.then)p.then(()=>{songStarted=true;disc?.classList.add('playing');}).catch(()=>{songStarted=false;toast('Tap once anywhere if your browser blocks autoplay.');});}
const envelope=document.getElementById('envelope'),letter=document.getElementById('letter'),openLetter=document.getElementById('open-letter');
openLetter.addEventListener('click',()=>{envelope.classList.add('open');openLetter.classList.add('hidden');document.getElementById('envelope-title').classList.add('hidden');setTimeout(()=>{letter.classList.remove('hidden');confetti();letter.scrollIntoView({behavior:'smooth',block:'start'});},850);});
