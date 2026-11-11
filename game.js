export const shapes={T:[[0,1,0],[1,1,1],[0,0,0]],I:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],O:[[1,1],[1,1]],S:[[0,1,1],[1,1,0],[0,0,0]],Z:[[1,1,0],[0,1,1],[0,0,0]],J:[[1,0,0],[1,1,1],[0,0,0]],L:[[0,0,1],[1,1,1],[0,0,0]]};
export const colors={T:'#b78cff',I:'#65d9ec',O:'#f4d771',S:'#c4ed78',Z:'#f17f93',J:'#7c9bef',L:'#eba96b'};
export const emptyBoard=()=>Array.from({length:20},()=>Array(10).fill(null));
export function shuffledBag(){const a=Object.keys(shapes);for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
export function collides(board,p){return p.m.some((r,y)=>r.some((v,x)=>v&&(p.x+x<0||p.x+x>=10||p.y+y>=20||(p.y+y>=0&&board[p.y+y][p.x+x]))))}
export function clearRows(board){const remaining=board.filter(r=>!r.every(Boolean));const cleared=20-remaining.length;while(remaining.length<20)remaining.unshift(Array(10).fill(null));return {board:remaining,cleared}}
export function validBoard(b){return Array.isArray(b)&&b.length===20&&b.every(r=>Array.isArray(r)&&r.length===10&&r.every(t=>t===null||Object.hasOwn(shapes,t)))}

export function rotateMatrix(matrix,turns=1){
  let result=matrix.map(row=>[...row]);
  for(let i=0;i<((turns%4)+4)%4;i++)result=result[0].map((_,x)=>result.map(row=>row[x]).reverse());
  return result;
}
export function trimMatrix(matrix){
  const cells=matrix.flatMap((row,y)=>row.flatMap((v,x)=>v?[[x,y]]:[]));
  const minX=Math.min(...cells.map(c=>c[0])),minY=Math.min(...cells.map(c=>c[1]));
  const maxX=Math.max(...cells.map(c=>c[0])),maxY=Math.max(...cells.map(c=>c[1]));
  return Array.from({length:maxY-minY+1},(_,y)=>Array.from({length:maxX-minX+1},(_,x)=>matrix[y+minY][x+minX]));
}
export function occupiedCells(piece){return piece.m.flatMap((row,y)=>row.flatMap((v,x)=>v?[[piece.x+x,piece.y+y]]:[]));}
export function samePlacement(a,b){return JSON.stringify(occupiedCells(a).sort())===JSON.stringify(occupiedCells(b).sort());}
export function stampShape(board,piece){
  if(collides(board,piece)||occupiedCells(piece).some(([,y])=>y<0))return null;
  const next=board.map(row=>[...row]);
  for(const [x,y] of occupiedCells(piece))next[y][x]=piece.type;
  return next;
}
