import {createGame,turn,step,bubble,tickMilliseconds,COLS,ROWS} from './engine.mjs';
const $=id=>document.getElementById(id),canvas=$('canvas'),ctx=canvas.getContext('2d'),CELL=45;
const names=['Luna Bat','Sunny Fox','Poppy Dash','CatNap','DogDay','Bobby BearHug','Hoppy','CraftyCorn','Bubba','KickinChicken','PickyPiggy','Baba Chops','Mikey','JJ'];
const files=['critter_01_lunabat','critter_02_sunnyfox','critter_03_poppydash','critter_04_catnap','critter_05_dogday','critter_06_bobby','critter_07_hoppy','critter_08_craftycorn','critter_09_bubba','critter_10_kickin','critter_11_picky','critter_12_babachops','mikey','jj'];
const portraits=files.map(f=>{const im=new Image();im.src=`assets/guests/${f}.webp`;return im});
const scenes=['moon','garden','stars'].map(f=>{const im=new Image();im.src=`assets/scenes/${f}.svg`;return im});
const palettes=[['#244957','#a9ead8','#f5d696'],['#28493e','#a8e3a8','#f6bbd1'],['#313754','#beb4f5','#ffc993']];
const foods={cake:'🥮',gold:'⭐',berry:'🍓',magnet:'🧲',shield:'🫧',rainbow:'🌈'};
let selected=4,world=0,gentle=true,level=1,game=createGame(),phase='menu',last=0,acc=0,previous=[],particles=[],flash=0,popTimer,muted=false,track=0;
const music=$('music');
const tracks=['https://kunruiw1991.github.io/lumipop-kids-tv/videos/dh_02_golden_lyrics.mp4','https://kunruiw1991.github.io/lumipop-kids-tv/videos/dh_01_soda_pop.mp4'];
music.src=tracks[0];music.volume=.5;
function playMusic(){if(!muted)music.play().then(()=>{$('sound').textContent='🔊';$('sound').setAttribute('aria-label','关闭音乐')}).catch(()=>{$('sound').textContent='🔈';$('sound').setAttribute('aria-label','点按播放音乐')})}
function nextSong(){track=(track+1)%tracks.length;music.src=tracks[track];if(phase==='playing')playMusic()}
$('nextSong').addEventListener('click',nextSong);music.addEventListener('ended',nextSong);
$('sound').addEventListener('click',()=>{if(music.paused&&!muted&&phase==='playing'){playMusic();return}muted=!muted;music.muted=muted;$('sound').textContent=muted?'🔇':'🔊';$('sound').setAttribute('aria-label',muted?'开启音乐':'关闭音乐');if(!muted&&phase==='playing')playMusic()});
music.addEventListener('error',()=>{$('sound').textContent='🔈';$('sound').setAttribute('aria-label','重试音乐')});
for(let i=0;i<files.length;i++){const b=document.createElement('button');b.setAttribute('aria-label',names[i]);b.setAttribute('aria-pressed',String(i===selected));b.classList.toggle('selected',i===selected);const im=document.createElement('img');im.src=portraits[i].src;im.alt='';b.append(im);b.addEventListener('click',()=>{selected=i;for(const el of $('characters').children){el.classList.toggle('selected',el===b);el.setAttribute('aria-pressed',String(el===b))}});$('characters').append(b)}
for(const b of document.querySelectorAll('[data-world]'))b.addEventListener('click',()=>{world=Number(b.dataset.world);for(const el of $('worlds').children){el.classList.toggle('selected',el===b);el.setAttribute('aria-pressed',String(el===b))}});
for(const b of document.querySelectorAll('[data-gentle]'))b.addEventListener('click',()=>{gentle=b.dataset.gentle==='true';for(const el of $('modes').children){el.classList.toggle('selected',el===b);el.setAttribute('aria-pressed',String(el===b))}});
function friendIds(){return files.map((_,i)=>(selected+i+1)%files.length).slice(0,Math.floor(game.eaten/4))}
function makePortrait(id){const im=document.createElement('img');im.src=portraits[id].src;im.alt=names[id];return im}
function updateHud(){
 $('score').textContent=game.score.toLocaleString();$('hearts').textContent='❤️'.repeat(game.hearts)+'🤍'.repeat(3-game.hearts);
 const stars=Math.min(3,Math.floor(game.eaten/game.goal*3));$('stars').textContent='★'.repeat(stars)+'☆'.repeat(3-stars);$('progress').style.width=`${Math.min(100,game.eaten/game.goal*100)}%`;
 $('buffs').textContent=(game.magnet?'🧲':'')+(game.shield?'🫧':'')+(game.rainbow?'🌈':'');$('bubble').disabled=phase!=='playing'||game.cooldown>0;
 const friends=friendIds();if($('friends').children.length!==friends.length)$('friends').replaceChildren(...friends.map(makePortrait));
}
function start(){playMusic();game=createGame({gentle,level});phase='playing';previous=game.snake.map(p=>({...p}));particles=[];acc=0;last=performance.now();$('overlay').hidden=true;$('pause').disabled=false;$('pause').textContent='⏸';$('pause').setAttribute('aria-label','暂停');$('friends').replaceChildren();updateHud()}
function showPause(){if(phase==='playing'){phase='paused';music.pause();$('hero').textContent='⏸';$('pickers').hidden=true;$('result').hidden=true;$('hint').hidden=true;$('home').hidden=false;$('play').textContent='▶';$('play').setAttribute('aria-label','继续游戏');$('overlay').hidden=false;$('pause').textContent='▶';$('pause').setAttribute('aria-label','继续游戏');}else if(phase==='paused'){phase='playing';$('overlay').hidden=true;$('pause').textContent='⏸';$('pause').setAttribute('aria-label','暂停');last=performance.now();acc=0;playMusic()}updateHud()}
function finish(){phase=game.result;music.pause();$('pause').disabled=true;$('overlay').hidden=false;$('pickers').hidden=true;$('hint').hidden=true;$('result').hidden=false;$('home').hidden=false;$('hero').replaceChildren();const winner=makePortrait(selected);$('hero').append(winner);if(phase==='win'){$('hero').append(document.createTextNode(' 👑'));$('play').textContent='▶';$('play').setAttribute('aria-label','下一关')}else{$('play').textContent='↻';$('play').setAttribute('aria-label','再玩一次')}
 $('resultStars').textContent=phase==='win'?'⭐ ⭐ ⭐':'💛';$('resultScore').textContent=game.score.toLocaleString();$('resultFriends').replaceChildren(...friendIds().map(makePortrait));
 try{const key=`snake-best-${gentle?'gentle':'classic'}`;localStorage.setItem(key,String(Math.max(Number(localStorage.getItem(key))||0,game.score)))}catch{}updateHud();
}
$('play').addEventListener('click',()=>{if(phase==='paused')showPause();else{if(phase==='win'){level++;world=(world+1)%3}start()}});
$('pause').addEventListener('click',showPause);
$('home').addEventListener('click',()=>{phase='menu';level=1;music.pause();game=createGame({gentle});$('hero').textContent='🐍✨';$('pickers').hidden=false;$('result').hidden=true;$('hint').hidden=false;$('home').hidden=true;$('play').textContent='▶';$('play').setAttribute('aria-label','开始游戏');$('pause').disabled=true;$('friends').replaceChildren();updateHud()});
function input(dir){if(phase==='playing')turn(game,dir)}
for(const b of document.querySelectorAll('[data-dir]'))b.addEventListener('pointerdown',e=>{e.preventDefault();input(b.dataset.dir)});
$('bubble').addEventListener('click',()=>{if(phase==='playing'&&bubble(game)){pop('🫧');updateHud()}});
let touch=null;
canvas.addEventListener('pointerdown',e=>{if(phase!=='playing')return;touch={x:e.clientX,y:e.clientY,moved:false};canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(!touch)return;const dx=e.clientX-touch.x,dy=e.clientY-touch.y;if(Math.hypot(dx,dy)<22)return;input(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up');touch={x:e.clientX,y:e.clientY,moved:true}});
canvas.addEventListener('pointerup',e=>{if(!touch)return;if(!touch.moved){const r=canvas.getBoundingClientRect(),head=game.snake[0],dx=(e.clientX-r.left)/r.width*COLS-head.x-.5,dy=(e.clientY-r.top)/r.height*ROWS-head.y-.5;input(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up')}touch=null});
canvas.addEventListener('pointercancel',()=>touch=null);
window.addEventListener('keydown',e=>{const dirs={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'};if(dirs[e.key]){e.preventDefault();input(dirs[e.key])}if(e.key===' '){e.preventDefault();if(phase==='playing'&&bubble(game)){pop('🫧');updateHud()}}if(e.key==='p'&&!e.repeat)showPause()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&phase==='playing')showPause()});window.addEventListener('blur',()=>{if(phase==='playing')showPause();touch=null});
function pop(icon){$('pop').textContent=icon;$('pop').classList.add('show');clearTimeout(popTimer);popTimer=setTimeout(()=>$('pop').classList.remove('show'),1300)}
function burst(x,y){for(let i=0;i<18;i++)particles.push({x,y,vx:(Math.random()-.5)*220,vy:(Math.random()-.5)*220,life:.8,color:['#ffe9a6','#b7f6cf','#ffb4ca'][i%3]})}
function circle(x,y,r,color){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill()}
function portrait(id,x,y,r){const im=portraits[id];ctx.save();circle(x,y,r+3,'#fff3c8');ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.clip();if(im.complete&&im.naturalWidth)ctx.drawImage(im,x-r,y-r,r*2,r*2);else{ctx.fillStyle='#9dddbe';ctx.fillRect(x-r,y-r,r*2,r*2);ctx.font=`${r}px sans-serif`;ctx.fillStyle='#243d50';ctx.textAlign='center';ctx.fillText('☺',x,y+r/3)}ctx.restore()}
function draw(now){const t=now/1000,pal=palettes[world];ctx.clearRect(0,0,900,720);ctx.fillStyle=pal[0];ctx.fillRect(0,0,900,720);const scene=scenes[world];if(scene.complete&&scene.naturalWidth){ctx.globalAlpha=.20;ctx.drawImage(scene,0,0,900,720);ctx.globalAlpha=1}ctx.fillStyle='#071b2b55';ctx.fillRect(0,0,900,720);
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){if((x+y)%2===0){ctx.fillStyle='#ffffff04';ctx.fillRect(x*CELL,y*CELL,CELL,CELL)}}
 ctx.strokeStyle=pal[1]+'50';ctx.lineWidth=3;ctx.strokeRect(3,3,894,714);
 for(const f of game.food){const x=(f.x+.5)*CELL,y=(f.y+.5)*CELL,bob=Math.sin(t*3+f.x)*2;ctx.shadowColor=f.type==='gold'?'#ffe19a':pal[1];ctx.shadowBlur=['gold','shield','rainbow','magnet'].includes(f.type)?18:4;circle(x,y,17,'#ffffff10');ctx.font='29px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(foods[f.type],x,y+bob);ctx.shadowBlur=0}
 const ratio=phase==='playing'?Math.min(1,acc/tickMilliseconds(game)):1;
 const positions=game.snake.map((p,i)=>{const old=previous[i]||p;const near=Math.abs(old.x-p.x)+Math.abs(old.y-p.y)<=1;return{x:((near?old.x+(p.x-old.x)*ratio:p.x)+.5)*CELL,y:((near?old.y+(p.y-old.y)*ratio:p.y)+.5)*CELL}});
 ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=32;ctx.strokeStyle=pal[1];for(let i=positions.length-1;i>0;i--){const a=positions[i],b=positions[i-1];if(Math.hypot(a.x-b.x,a.y-b.y)<CELL*1.8){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}}
 for(let i=positions.length-1;i>0;i--){const p=positions[i];circle(p.x,p.y,16,i%2?pal[1]:pal[2]);circle(p.x-4,p.y-5,4,'#ffffff44');if(i%4===0&&i/4<=friendIds().length)portrait(friendIds()[i/4-1],p.x,p.y,15)}
 const h=positions[0];if(h){if(game.shield>0){circle(h.x,h.y,31,'#b3f4f033');ctx.beginPath();ctx.arc(h.x,h.y,31,0,Math.PI*2);ctx.strokeStyle='#c4ffef';ctx.lineWidth=2;ctx.stroke()}if(game.magnet>0){ctx.beginPath();ctx.arc(h.x,h.y,CELL*2,0,Math.PI*2);ctx.strokeStyle='#f2c5ee66';ctx.lineWidth=2;ctx.stroke()}portrait(selected,h.x,h.y,21);ctx.font='18px sans-serif';ctx.fillStyle='#fff1af';ctx.fillText({up:'▲',down:'▼',left:'◀',right:'▶'}[game.dir],h.x+({left:-1,right:1}[game.dir]||0)*34,h.y+({up:-1,down:1}[game.dir]||0)*34)}
 for(const p of particles){ctx.globalAlpha=Math.max(0,p.life/.8);circle(p.x,p.y,4,p.color)}ctx.globalAlpha=1;if(flash>0){ctx.fillStyle=`rgba(255,185,167,${flash*.4})`;ctx.fillRect(0,0,900,720)}
}
function frame(now){const dt=Math.min(.1,(now-last)/1000||0);last=now;if(phase==='playing'){acc+=dt*1000;let count=0;while(acc>=tickMilliseconds(game)&&phase==='playing'&&count++<4){acc-=tickMilliseconds(game);previous=game.snake.map(p=>({...p}));const events=step(game);for(const e of events){if(e.type==='eat')burst((e.x+.5)*CELL,(e.y+.5)*CELL);else if(e.type==='friend')pop('🎉');else if(e.type==='hurt'){flash=.7;pop('🫧')}else if(foods[e.type])pop(foods[e.type]);}updateHud();if(!game.playing)finish()}}
 for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt}particles=particles.filter(p=>p.life>0);flash=Math.max(0,flash-dt);draw(now);requestAnimationFrame(frame)}
previous=game.snake.map(p=>({...p}));updateHud();requestAnimationFrame(frame);
