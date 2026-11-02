'use strict';
// Serve only the local verified PWA on a temporary loopback port, then close the server.
const fs=require('fs'),path=require('path'),http=require('http'),{spawn}=require('child_process');
const out=path.join(__dirname,'local'),site=path.join(out,'site');
const verified=JSON.parse(fs.readFileSync(path.join(out,'live-verification.json'),'utf8'));
if(!verified.passed)throw Error('Local deployment verification must pass first');
const server=http.createServer((req,res)=>{
  let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).slice(1)||'index.html';}catch{res.writeHead(400);res.end();return;}
  const target=path.resolve(site,name);
  if(!target.startsWith(site+path.sep)||!fs.existsSync(target)||!fs.statSync(target).isFile()){res.writeHead(404);res.end();return;}
  const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.webmanifest':'application/manifest+json','.png':'image/png'};
  res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(target).pipe(res);
});
function run(file,args,url){return new Promise((resolve,reject)=>{
  const child=spawn(process.execPath,[path.join(__dirname,file),...args],{env:{...process.env,L5R_SMOKE_URL:url},stdio:'inherit'});
  child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error(file+' exited '+code)));
});}
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url='http://127.0.0.1:'+server.address().port+'/';
  try{await run('live-browser-smoke.cjs',[out],url);await run('checklist-walk.cjs',[path.join(out,'walk'),url],url);}
  finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
