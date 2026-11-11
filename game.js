export const shapes={T:[[0,1,0],[1,1,1],[0,0,0]],I:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],O:[[1,1],[1,1]],S:[[0,1,1],[1,1,0],[0,0,0]],Z:[[1,1,0],[0,1,1],[0,0,0]],J:[[1,0,0],[1,1,1],[0,0,0]],L:[[0,0,1],[1,1,1],[0,0,0]]};
export const colors={T:'#ac9bce',I:'#93c6c6',O:'#e1c77b',S:'#b6c892',Z:'#d29483',J:'#95a8cb',L:'#d9aa79'};
export const emptyBoard=()=>Array.from({length:20},()=>Array(10).fill(null));
export function shuffledBag(){const a=Object.keys(shapes);for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
export function collides(board,p){return p.m.some((r,y)=>r.some((v,x)=>v&&(p.x+x<0||p.x+x>=10||p.y+y>=20||(p.y+y>=0&&board[p.y+y][p.x+x]))))}
export function clearRows(board){const remaining=board.filter(r=>!r.every(Boolean));const cleared=20-remaining.length;while(remaining.length<20)remaining.unshift(Array(10).fill(null));return {board:remaining,cleared}}
export function validBoard(b){return Array.isArray(b)&&b.length===20&&b.every(r=>Array.isArray(r)&&r.length===10&&r.every(t=>t===null||Object.hasOwn(shapes,t)))}
