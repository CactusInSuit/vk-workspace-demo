import {bounds} from './model.js';
export function download(content,name,type='text/plain'){const blob=content instanceof Blob?content:new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export async function readJSON(file){if(!file)throw Error('Выберите файл');if(file.size>25*1024*1024)throw Error('Размер файла превышает 25 МБ');return JSON.parse(await file.text());}
const esc=v=>String(v??'').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
function svgText(text,x,y,w,font=18,weight=false,align='left',color='#20252b'){
 const max=Math.max(4,Math.floor(w/(font*.58)));const lines=[];String(text||'').split('\n').forEach(line=>{const words=line.split(' ');let current='';for(const word of words){if(current&&current.length+word.length+1>max){lines.push(current);current=word;}else current+=(current?' ':'')+word;}lines.push(current);});
 return `<text font-family="Arial, sans-serif" font-size="${font}" font-weight="${weight?700:400}" fill="${esc(color)}" text-anchor="${align==='center'?'middle':align==='right'?'end':'start'}">${lines.map((l,i)=>`<tspan x="${x+(align==='center'?w/2:align==='right'?w:0)}" y="${y+font+i*font*1.35}">${esc(l)}</tspan>`).join('')}</text>`;
}
export function boardSVG(board){
 const box=bounds(board.nodes),pad=60,w=Math.max(300,box.w+pad*2),h=Math.max(200,box.h+pad*2);
 const render=n=>{const {x,y,w:width,h:height}=n;const fill=esc(n.fill||'white'),stroke=esc(n.stroke||'#6e7a89'),textColor=n.fill==='#262b33'?'white':'#20252b';let shape='';
  if(n.type==='frame')return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="#ffffff" stroke="#cbd2dc" rx="3"/>${svgText(n.text,x,y-28,width,16,true)}`;
  if(n.type==='arrow'){const x1=n.flipX?width:0,x2=n.flipX?0:width,y1=n.flipY?height:0,y2=n.flipY?0:height;return `<line x1="${x+x1}" y1="${y+y1}" x2="${x+x2}" y2="${y+y2}" stroke="${stroke}" stroke-width="2.5" marker-end="url(#arrow)"/>`;}
  if(n.type==='pen'||n.type==='highlight'){return `<g transform="translate(${x} ${y}) scale(${width/(n.iw||width)} ${height/(n.ih||height)})"><polyline points="${(n.points||[]).map(p=>p.join(',')).join(' ')}" fill="none" stroke="${n.type==='highlight'?fill:stroke}" stroke-width="${n.type==='highlight'?22:3}" opacity="${n.type==='highlight'?.4:1}" stroke-linecap="round" stroke-linejoin="round"/></g>`;}
  if(n.type==='image')return `<image href="${esc(n.src)}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="none"/>`;
  if(n.type==='reaction')return svgText(n.emoji||'👍',x,y,width,Math.min(width,height)*.8);
  if(n.type==='comment')return `<circle cx="${x+16}" cy="${y+16}" r="16" fill="#0077ff"/>${svgText('…',x+6,y-3,25,20,true,'left','white')}`;
  if(n.type==='table'){const rows=n.rows||3,cols=n.cols||3,rh=height/rows,cw=width/cols;for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){shape+=`<rect x="${x+c*cw}" y="${y+r*rh}" width="${cw}" height="${rh}" fill="${r===0?'#eef3fa':fill}" stroke="#c2cbd8"/>${svgText(n.cells?.[r]?.[c]||'',x+c*cw+9,y+r*rh+7,cw-18,14,r===0)}`;}return shape;}
  if(n.type==='ellipse')shape=`<ellipse cx="${x+width/2}" cy="${y+height/2}" rx="${width/2}" ry="${height/2}" fill="${fill}" stroke="${stroke}"/>`;
  else if(n.type==='diamond')shape=`<polygon points="${x+width/2},${y} ${x+width},${y+height/2} ${x+width/2},${y+height} ${x},${y+height/2}" fill="${fill}" stroke="${stroke}"/>`;
  else if(n.type!=='text')shape=`<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${n.type==='task'?10:2}" fill="${fill}" stroke="${n.type==='sticky'?'none':stroke}"/>`;
  if(n.type==='task')return shape+svgText(n.status||'Запланировано',x+16,y+8,width-32,12,true)+svgText(n.text,x+16,y+40,width-32,n.fontSize,true)+svgText([n.assignee,n.deadline].filter(Boolean).join(' · '),x+16,y+height-35,width-32,13);
  if(n.type==='file')return shape+svgText('PDF · '+(n.filename||'Документ'),x+16,y+18,width-32,16);
  return shape+svgText(n.text,x+(n.type==='text'?0:18),y+(n.type==='text'?0:18),width-(n.type==='text'?0:36),n.fontSize,n.bold,n.align,textColor);
 };
 return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="${box.x-pad} ${box.y-pad} ${w} ${h}"><defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#6e7a89"/></marker></defs><rect x="${box.x-pad}" y="${box.y-pad}" width="${w}" height="${h}" fill="#f8f9fb"/>${[...board.nodes.filter(n=>n.type==='frame'),...board.nodes.filter(n=>n.type!=='frame')].map(render).join('')}</svg>`;
}
export async function exportPNG(board){const svg=boardSVG(board);const img=new Image();const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));try{await new Promise((ok,bad)=>{img.onload=ok;img.onerror=bad;img.src=url;});const canvas=document.createElement('canvas');const scale=Math.min(2,8192/Math.max(img.width,img.height));canvas.width=img.width*scale;canvas.height=img.height*scale;canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('Не удалось создать PNG');download(blob,board.name+'.png');}finally{URL.revokeObjectURL(url);}}
export function printBoard(board){document.querySelector('.print-export')?.remove();const el=document.createElement('div');el.className='print-export';el.innerHTML=boardSVG(board);document.body.append(el);window.addEventListener('afterprint',()=>el.remove(),{once:true});window.print();}
