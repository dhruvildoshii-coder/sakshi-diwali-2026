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

// Tiny original sound effects made in-browser; no extra sound files required.
let audioCtx=null;
function initSound(){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;if(!audioCtx)audioCtx=new AC();if(audioCtx.state==='suspended')audioCtx.resume();}
function tone(freq,duration,type='sine',volume=.04,delay=0){if(!audioCtx)return;const t=audioCtx.currentTime+delay,o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(volume,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(audioCtx.destination);o.start(t);o.stop(t+duration+.03);}
function sfx(kind){initSound();if(kind==='rangoli'){tone(660,.12);tone(880,.18,'sine',.035,.1);}if(kind==='diya'){tone(880,.24);tone(1320,.35,'sine',.035,.12);}if(kind==='sparkle'){tone(1450,.12,'sine',.025);tone(1900,.2,'sine',.02,.07);}if(kind==='gift'){tone(740,.14);tone(990,.2,'sine',.035,.12);}if(kind==='firework'&&audioCtx){const t=audioCtx.currentTime,o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sawtooth';o.frequency.setValueAtTime(180,t);o.frequency.exponentialRampToValueAtTime(42,t+.24);g.gain.setValueAtTime(.09,t);g.gain.exponentialRampToValueAtTime(.0001,t+.28);o.connect(g);g.connect(audioCtx.destination);o.start(t);o.stop(t+.3);tone(520,.24,'triangle',.035,.2);tone(760,.3,'sine',.025,.25);}}

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

// Phooljhadi: create a trail of sparks.
const pad=document.getElementById('sparkle-pad');let lastSpark=0,sparkCount=0;
pad.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'&&e.buttons===0)return;const now=Date.now();if(now-lastSpark<24)return;lastSpark=now;const r=pad.getBoundingClientRect(),s=document.createElement('i');s.className='spark';s.style.left=(e.clientX-r.left)+'px';s.style.top=(e.clientY-r.top)+'px';s.style.setProperty('--spark',['#ffdf7e','#ff77b7','#8ce9db','#b9a1ff'][Math.floor(Math.random()*4)]);pad.append(s);setTimeout(()=>s.remove(),850);sparkCount++;if(sparkCount%8===0)sfx('sparkle');if(sparkCount>=28)unlock('sparklers','Stardust made! Continue →');});
pad.addEventListener('pointerdown',e=>{initSound();pad.setPointerCapture(e.pointerId);});

// Fireworks: three bursts, with a little crackle effect.
const sky=document.getElementById('firework-sky');let bursts=0;
sky.addEventListener('pointerdown',e=>{initSound();const r=sky.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,f=document.createElement('div');f.className='firework';f.style.left=x+'px';f.style.top=y+'px';sky.append(f);const colors=['#ffcf68','#ff6fae','#7de7d7','#c5a3ff','#fff0a4'];for(let i=0;i<34;i++){const p=document.createElement('i'),a=Math.PI*2*i/34,dist=35+Math.random()*75;p.className='particle';p.style.left=x+'px';p.style.top=y+'px';p.style.setProperty('--x',Math.cos(a)*dist+'px');p.style.setProperty('--y',Math.sin(a)*dist+'px');p.style.setProperty('--p',colors[Math.floor(Math.random()*colors.length)]);f.append(p);}setTimeout(()=>f.remove(),1200);bursts++;sfx('firework');if(bursts>=3)unlock('fireworks','The sky is yours! Continue →');});

// Open every little gift.
const gifts=[...document.querySelectorAll('.gift-box')],opened=new Set();
gifts.forEach((b,i)=>b.addEventListener('click',()=>{if(opened.has(i))return;opened.add(i);document.getElementById('gift-reveal').textContent=b.dataset.message;b.style.transform='scale(.92) rotate(-4deg)';setTimeout(()=>b.style.transform='',180);confetti();sfx('gift');if(opened.size===gifts.length)unlock('gifts','All gifts opened! Continue →');}));

// Memories: all ten photos must be viewed; image paths match files in repository root.
const captions=['My favourite smile. Obviously yours.','This one makes me smile every single time.','Festive us = my favourite us.','You + me + a little bit of madness.','I could look at this one forever.','My favourite person to get dressed up with.','A tiny memory, a very big feeling.','The way you look at me. Ufff.','More moments like these, please.','And many, many more to come. ❤️'];
let mem=0;const seen=new Set(),img=document.getElementById('memory-image');
function renderMem(){img.src='memory-'+String(mem+1).padStart(2,'0')+'.jpeg';img.alt='A favourite memory of us, photo '+(mem+1);document.getElementById('memory-caption').textContent=captions[mem];document.getElementById('memory-counter').textContent=String(mem+1).padStart(2,'0')+' / 10';document.getElementById('memory-dots').innerHTML=captions.map((_,i)=>'<span class="'+(i===mem?'active':'')+'"></span>').join('');seen.add(mem);if(seen.size===10)unlock('memories','Every memory seen! Meet me at the finale 💌');}
function stepMem(d){mem=(mem+d+10)%10;renderMem();}
document.getElementById('prev-memory').addEventListener('click',()=>stepMem(-1));document.getElementById('next-memory').addEventListener('click',()=>stepMem(1));
let touchX=0;document.querySelector('.polaroid').addEventListener('touchstart',e=>touchX=e.changedTouches[0].screenX,{passive:true});document.querySelector('.polaroid').addEventListener('touchend',e=>{const dx=e.changedTouches[0].screenX-touchX;if(Math.abs(dx)>35)stepMem(dx<0?1:-1);},{passive:true});renderMem();

// Final page song starts on the user's Next tap and loops continuously, with no player controls.
const song=document.getElementById('song'),disc=document.querySelector('.music-disc');let songStarted=false;
function startFinalSong(){if(songStarted)return;song.loop=true;const p=song.play();if(p&&p.then)p.then(()=>{songStarted=true;disc.classList.add('playing');}).catch(()=>toast('If the song does not start, check your browser sound permissions.'));}
const envelope=document.getElementById('envelope'),letter=document.getElementById('letter'),openLetter=document.getElementById('open-letter');
openLetter.addEventListener('click',()=>{envelope.classList.add('open');openLetter.classList.add('hidden');document.getElementById('envelope-title').classList.add('hidden');setTimeout(()=>{letter.classList.remove('hidden');confetti();letter.scrollIntoView({behavior:'smooth',block:'start'});},850);});
