import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
const port=Number(process.env.WORKSPACE_PORT||4173);
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
const server=http.createServer(async(req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 try{
  const url=new URL(req.url,'http://127.0.0.1');if(url.pathname==='/__workspace_health'){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({app:'workspace-local-prototype',version:'1.0.0'}));return;}
  const decoded=decodeURIComponent(url.pathname);const file=path.resolve(root,'.'+(decoded==='/'?'/index.html':decoded));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
  if(!(await stat(file)).isFile())throw Error('Not a file');const content=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:content);
 }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Файл не найден');}
});
server.on('error',e=>{console.error('Cannot start local WorkSpace:',e.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log('Local WorkSpace: http://127.0.0.1:'+port+'/'));
