export const COLS=20,ROWS=16;
export const DIRECTIONS={up:{x:0,y:-1},right:{x:1,y:0},down:{x:0,y:1},left:{x:-1,y:0}};
const same=(a,b)=>a.x===b.x&&a.y===b.y;
const wrap=(n,m)=>(n+m)%m;
export function createGame({gentle=true,level=1,rng=Math.random}={}){
 const g={gentle,level,rng,snake:[{x:6,y:8},{x:5,y:8},{x:4,y:8},{x:3,y:8}],dir:'right',queue:[],food:[],score:0,eaten:0,goal:12+Math.min(12,(level-1)*3),hearts:3,shield:0,magnet:0,rainbow:0,slow:0,cooldown:0,ticks:0,playing:true,result:null,events:[]};
 g.food.push({x:10,y:8,type:'cake'},{x:13,y:8,type:'gold'},{x:13,y:5,type:'berry'});fill(g);return g;
}
export function turn(g,dir){
 if(!g.playing||!DIRECTIONS[dir]||g.queue.length>=2)return false;
 const prev=DIRECTIONS[g.queue.at(-1)||g.dir],next=DIRECTIONS[dir];
 if(prev.x+next.x===0&&prev.y+next.y===0)return false;
 if(g.queue.at(-1)===dir||(!g.queue.length&&g.dir===dir))return false;
 g.queue.push(dir);return true;
}
export function emptyCell(g){
 const free=[];for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++){const p={x,y};if(!g.snake.some(s=>same(s,p))&&!g.food.some(f=>same(f,p)))free.push(p)}
 return free.length?free[Math.floor(g.rng()*free.length)]:null;
}
function fill(g){while(g.food.length<6){const p=emptyCell(g);if(!p)break;const r=g.rng();g.food.push({...p,type:r<.15?'gold':r<.5?'berry':'cake'})}}
function special(g){const p=emptyCell(g);if(p){const types=['magnet','shield','rainbow'];g.food.push({...p,type:types[(Math.floor(g.eaten/4)-1)%3]})}}
export function tickMilliseconds(g){return Math.max(g.gentle?175:105,(g.gentle?265:170)-(g.level-1)*12)*(g.slow>0?1.7:1)}
export function bubble(g){if(!g.playing||g.cooldown>0)return false;g.shield=20;g.slow=20;g.cooldown=40;g.events.push({type:'shield'});return true}
export function step(g){
 if(!g.playing)return [];g.events=[];g.ticks++;
 for(const k of ['shield','magnet','rainbow','slow','cooldown'])g[k]=Math.max(0,g[k]-1);
 if(g.queue.length)g.dir=g.queue.shift();const d=DIRECTIONS[g.dir],head=g.snake[0];
 let next={x:head.x+d.x,y:head.y+d.y};
 const wall=next.x<0||next.y<0||next.x>=COLS||next.y>=ROWS;
 if(wall){if(g.gentle||g.shield>0){next={x:wrap(next.x,COLS),y:wrap(next.y,ROWS)};g.events.push({type:'wrap'})}else return hurt(g)}
 const items=g.food.filter(f=>same(f,next)||(g.magnet>0&&Math.abs(f.x-next.x)+Math.abs(f.y-next.y)<=2));
 const grows=items.some(f=>['cake','gold','berry'].includes(f.type));
 const body=g.snake.slice(0,g.snake.length-(grows?0:1));const hit=body.findIndex(s=>same(s,next));
 if(hit!==-1){if(g.shield>0){g.snake=g.snake.slice(0,Math.max(1,hit));g.events.push({type:'shield'})}else return hurt(g)}
 g.snake.unshift(next);if(!grows)g.snake.pop();
 for(const item of items){
  g.food.splice(g.food.indexOf(item),1);
  if(['cake','gold','berry'].includes(item.type)){
   const points=(item.type==='gold'?30:10)*(g.rainbow>0?2:1);g.score+=points;g.eaten++;g.events.push({type:'eat',...next,points});
   if(g.eaten%4===0){special(g);g.events.push({type:'friend',friend:Math.floor(g.eaten/4)-1});}
   if(g.eaten%6===0)g.hearts=Math.min(3,g.hearts+1);
  }else{g[item.type]=item.type==='shield'?35:45;g.events.push({type:item.type});}
 }
 if(g.eaten>=g.goal){g.playing=false;g.result='win';g.events.push({type:'win'});}else fill(g);
 return g.events;
}
function hurt(g){g.hearts--;g.events.push({type:'hurt'});if(g.hearts<=0){g.playing=false;g.result='retry';return g.events;}
 // Reset the body after a bump; score and collected friends are retained.
 g.snake=[{x:6,y:8},{x:5,y:8},{x:4,y:8},{x:3,y:8}];g.dir='right';g.queue=[];g.shield=15;g.slow=12;
 g.food=g.food.filter(f=>!g.snake.some(s=>same(s,f)));fill(g);return g.events;
}
