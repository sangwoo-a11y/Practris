import {mkdir,copyFile,cp} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const file of ['index.html','style.css','app.js','game.js','handling.js','lessons.js','lesson-data.js','guides.js','placements.js','placement-worker.js','builds.js'])await copyFile(file,`dist/${file}`);

await cp('assets','dist/assets',{recursive:true});
console.log('Built static homepage and practice room → dist/');
