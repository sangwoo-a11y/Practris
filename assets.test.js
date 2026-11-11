import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';

// GitHub Pages project sites serve assets below /Practris/, not the domain root.
test('HTML, CSS and module assets resolve under a deployment subpath',async()=>{
  const root=new URL('./',import.meta.url);
  const files={
    'index.html':/(?:src|href)="([^"#][^"]*)"/g,
    'style.css':/url\(['"]?([^'"\)]+)['"]?\)/g,
    'app.js':/from\s+['"]([^'"]+)['"]/g,
  };
  let checked=0;
  for(const [file,pattern] of Object.entries(files)){
    const text=await readFile(new URL(file,root),'utf8');
    for(const [,asset] of text.matchAll(pattern)){
      const resolved=new URL(asset,`https://example.com/Practris/${file}`);
      assert.equal(resolved.origin,'https://example.com');
      assert.ok(resolved.pathname.startsWith('/Practris/'),`${file}: ${asset} escapes deployment path`);
      await access(new URL(resolved.pathname.slice('/Practris/'.length),root));
      checked++;
    }
  }
  assert.ok(checked>=6,'Expected stylesheet, script, images, font and module assets');
});
