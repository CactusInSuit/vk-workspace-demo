import {cleanPoll,freshPollCopy} from './polls.js';
export const VERSION = 1;
export const STORAGE_KEY = 'vk-workspace-local-v1';
export const PROJECT_SPACES = [{id:'private',name:'Никита Купряков',private:true},{id:'demo',name:'ДЕМО'},{id:'team',name:'Команда 1 · VK WorkSpace'}];
export const uid = () => globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const clone = value => JSON.parse(JSON.stringify(value));
export const COLORS = ['#fff2aa', '#ffd8e6', '#d6edff', '#d9f3db', '#e8ddff', '#ffffff', '#262b33'];
export const TYPES = ['sticky','text','rect','ellipse','diamond','arrow','pen','highlight','table','frame','task','image','comment','reaction','file','poll'];
export function node(type, x = 0, y = 0, extra = {}) {
  const sizes = {poll:[360,440],text:[280,90],sticky:[190,170],rect:[220,110],ellipse:[180,120],diamond:[160,160],arrow:[180,60],table:[420,210],frame:[740,510],task:[260,175],comment:[32,32],reaction:[56,56],image:[320,240],file:[260,95]};
  const [w,h] = sizes[type] || [200,100];
  return {id:uid(),type,x,y,w,h,text:type==='sticky'?'Новая идея':type==='text'?'Введите текст':type==='frame'?'Новый фрейм':type==='task'?'Новая задача':type==='comment'?'Комментарий':'',fill:type==='sticky'?COLORS[0]:type==='text'?'transparent':'#ffffff',stroke:'#6e7a89',fontSize:18,align:'left',...extra};
}
function demoNodes(template) {
 if(template==='blank')return [];
 if(template==='mindmap')return [node('rect',450,260,{text:'Главная идея',fill:'#d6edff'}),node('rect',100,120,{text:'Исследование',fill:'#e8ddff'}),node('rect',100,410,{text:'Пользователи',fill:'#ffd8e6'}),node('rect',820,120,{text:'Решение',fill:'#d9f3db'}),node('rect',820,410,{text:'Следующие шаги',fill:'#fff2aa'}),node('arrow',320,180,{w:130,h:130}),node('arrow',320,320,{w:130,h:150,flipY:true}),node('arrow',670,180,{w:150,h:130,flipY:true}),node('arrow',670,320,{w:150,h:150})];
 if(template==='kanban')return [node('frame',20,20,{w:1050,h:640,text:'План команды'}),...['Запланировано','В работе','Готово'].map((t,i)=>node('rect',60+i*330,65,{w:290,h:45,text:t,fill:['#eff3fa','#e6f0ff','#e5f5e9'][i],fontSize:17})),node('task',75,140,{text:'Провести интервью',assignee:'Анна',deadline:'2026-11-20',status:'Запланировано'}),node('task',405,140,{text:'Собрать прототип',assignee:'Никита',status:'В работе',fill:'#f6faff'}),node('task',735,140,{text:'Определить проблему',assignee:'Мария',status:'Готово',fill:'#f1faf3'})];
 if(template==='workflow')return [node('text',50,30,{text:'Путь от идеи до результата',w:850,h:60,fontSize:32}),...['Идея','Обсуждение','Решение','Запуск'].map((t,i)=>node('rect',50+i*270,180,{w:210,h:110,text:t,fill:['#fff2aa','#d6edff','#e8ddff','#d9f3db'][i]})),...[0,1,2].map(i=>node('arrow',265+i*270,230,{w:45,h:1}))];
 if(template==='retro')return [node('frame',10,10,{w:1100,h:650,text:'Ретроспектива команды'}),...['Что получилось 💚','Что можно улучшить 💭','Что попробуем дальше 🚀'].map((t,i)=>node('text',55+i*355,60,{w:320,h:60,text:t,fontSize:21})),...['Поддерживали друг друга','Не хватало контекста','Фиксировать решения на доске'].map((t,i)=>node('sticky',65+i*355,160,{text:t,fill:COLORS[[3,1,0][i]],w:250,h:210}))];
 return [node('frame',20,20,{w:1120,h:740,text:'Командная сессия · План на неделю'}),node('text',70,65,{text:'От идеи — к общему плану',fontSize:32,w:900,h:60}),node('text',70,135,{text:'Собираем контекст, выбираем главное и договариваемся о следующих шагах.',fontSize:17,w:950,h:60}),...['💡 Идеи','🎯 Приоритеты','🚀 Следующие шаги'].map((t,i)=>node('text',80+i*350,240,{text:t,fontSize:22,w:300,h:45})),node('sticky',80,310,{text:'Что поможет команде возвращаться на доску каждый день?',fill:'#fff2aa',w:250,h:210,fontSize:21}),node('sticky',430,310,{text:'Связать обсуждение в чате с решениями на доске',fill:'#d6edff',w:250,h:210,fontSize:21}),node('sticky',780,310,{text:'Собрать идеи → обсудить → зафиксировать решение',fill:'#d9f3db',w:250,h:210,fontSize:21}),node('text',80,600,{text:'Дважды нажмите на объект, чтобы изменить текст. Перетащите его, чтобы поменять расположение.',fontSize:16,w:960,h:70})];
}
export const TEMPLATES = [{id:'blank',name:'Пустая доска',desc:'Свободное пространство',color:'#f3f6fa'},{id:'mindmap',name:'Интеллект-карта',desc:'Связи между идеями',color:'#eaf2ff'},{id:'kanban',name:'Канбан',desc:'Работа команды',color:'#e9f6ee'},{id:'retro',name:'Ретроспектива',desc:'Обсуждение результатов',color:'#fff1e5'},{id:'workflow',name:'Блок-схема',desc:'Процессы по шагам',color:'#f1ebff'}];
export function createBoard(name='Новая доска',template='blank',team='personal'){return {id:uid(),name,team,template,nodes:demoNodes(template),favorite:false,shared:false,deleted:false,background:'dots',updatedAt:Date.now(),createdAt:Date.now(),comments:[],share:{enabled:false,role:'view'},versions:[]};}
export function initialState(){
 const boards=[createBoard('Командная сессия','session','product'),createBoard('План проекта','kanban','product'),createBoard('Идеи и гипотезы','mindmap','personal'),createBoard('Ретроспектива ноября','retro','product'),createBoard('Путь пользователя','workflow','design'),createBoard('Новая доска','blank','personal')];boards[0].favorite=true;boards[1].shared=true;boards[3].favorite=true;
 return {version:VERSION,boards,projectSpaces:clone(PROJECT_SPACES),teams:[{id:'product',name:'Продуктовая команда'},{id:'design',name:'Дизайн-команда'}],settings:{theme:'dark',boardTheme:'light',accent:'#0077ff',organization:'Рабочее пространство',profile:'Никита',profileInitials:'НК',enabledModules:['home','board','mail','calendar','messenger','calls','disk','docs','tasks','notes','projects'],compact:false}};
}
const finite=(v,d=0)=>typeof v==='number'&&Number.isFinite(v)?Math.min(100000,Math.max(-100000,v)):d;
export function validateBoard(input){
 if(!input||typeof input.name!=='string'||!Array.isArray(input.nodes)||input.nodes.length>5000)throw Error('В файле должна быть доска с названием и массивом объектов (до 5000).');
 const b=createBoard(input.name.slice(0,180));
 b.nodes=input.nodes.map(n=>{
   if(!n||!TYPES.includes(n.type))throw Error('В файле есть неподдерживаемый тип объекта.');
   if(n.type==='image'&&!/^data:image\/(png|jpeg|webp|gif);base64,/i.test(n.src||''))throw Error('Изображения должны быть встроены в файл доски.');
   const clean=node(n.type,finite(n.x),finite(n.y));
   for(const key of ['text','assignee','deadline','status','priority','description','emoji','filename','author','groupId','sectionId'])if(n[key]!==undefined)clean[key]=String(n[key]).slice(0,12000);
   for(const key of ['flipX','flipY','bold','locked','aiRecognized'])if(n[key]!==undefined)clean[key]=!!n[key];
   for(const key of ['fill','stroke'])if(typeof n[key]==='string'&&(/^[#][a-f0-9]{3,8}$/i.test(n[key])||n[key]==='transparent'))clean[key]=n[key];
   clean.align=['left','center','right'].includes(n.align)?n.align:'left';
   if(n.type==='image')clean.src=n.src;
   if(n.type==='poll'){if(!clean.text.trim())throw Error('У опроса должен быть вопрос.');clean.text=clean.text.trim().slice(0,300);clean.poll=cleanPoll(n.poll);}
   if(n.type==='table'){clean.rows=Math.max(1,Math.min(12,Math.round(finite(n.rows,3))));clean.cols=Math.max(1,Math.min(12,Math.round(finite(n.cols,3))));}
   clean.id=uid();clean.w=Math.max(12,finite(n.w,200));clean.h=Math.max(12,finite(n.h,100));clean.fontSize=Math.max(8,Math.min(120,finite(n.fontSize,18)));
   if(Array.isArray(n.points))clean.points=n.points.slice(0,30000).filter(p=>Array.isArray(p)&&p.length>=2).map(p=>[finite(p[0]),finite(p[1])]);
   if(n.iw)clean.iw=Math.max(1,finite(n.iw));if(n.ih)clean.ih=Math.max(1,finite(n.ih));
   if(Array.isArray(n.cells))clean.cells=n.cells.slice(0,20).map(r=>Array.isArray(r)?r.slice(0,12).map(v=>String(v).slice(0,1000)):[]);
   return clean;
 });
 b.archivedNodes=Array.isArray(input.archivedNodes)&&input.archivedNodes.length?validateBoard({name:'Архив',nodes:input.archivedNodes}).nodes:[];
 const originalNodes=[...input.nodes,...(input.archivedNodes||[])],cleanNodes=[...b.nodes,...b.archivedNodes],idMap=new Map(originalNodes.map((n,i)=>[n.id,cleanNodes[i]?.id]));
 b.links=Array.isArray(input.links)?input.links.slice(0,10000).filter(l=>typeof l?.from==='string'&&typeof l?.to==='string').map(l=>({id:uid(),from:idMap.get(l.from)||l.from,to:idMap.get(l.to)||l.to,label:String(l.label||'Связь').slice(0,180)})):[];
 b.sections=Array.isArray(input.sections)?input.sections.slice(0,100).filter(s=>typeof s?.id==='string'&&typeof s?.name==='string'&&s.id!=='general').map(s=>({id:s.id.slice(0,80),name:s.name.slice(0,60),locked:true})):[];
 b.relatedBoards=Array.isArray(input.relatedBoards)?input.relatedBoards.slice(0,100).filter(r=>typeof r?.id==='string'&&typeof r?.name==='string').map(r=>({id:r.id,name:r.name.slice(0,180)})):[];
 if(Number.isInteger(input.objectLimit)&&input.objectLimit>0&&input.objectLimit<=100000)b.objectLimit=input.objectLimit;
 b.featureDemo=!!input.featureDemo;
 b.activity=Array.isArray(input.activity)?input.activity.slice(0,500).filter(e=>typeof e?.nodeId==='string'&&Number.isFinite(e.at)).map(e=>({id:uid(),nodeId:idMap.get(e.nodeId)||e.nodeId,title:String(e.title||'').slice(0,180),author:String(e.author||'').slice(0,100),at:e.at,sectionId:String(e.sectionId||'general').slice(0,80),kind:['added','changed','removed'].includes(e.kind)?e.kind:'changed',detail:String(e.detail||'').slice(0,180)})):[];
 b.seenBy=Object.fromEntries(Object.entries(input.seenBy||{}).slice(0,50).filter(([k,v])=>typeof k==='string'&&Number.isFinite(v)));
 b.background=['dots','grid','lines','plain'].includes(input.background)?input.background:'dots';return b;
}
export function validateBackup(input){
 if(input?.version!==VERSION||!Array.isArray(input.boards)||!Array.isArray(input.teams)||!input.settings||input.boards.length>500)throw Error('Неверный формат резервной копии');
 const s=input.settings,settings={...initialState().settings};
 for(const key of ['theme','boardTheme'])if(['light','dark','system'].includes(s[key]))settings[key]=s[key];
 for(const key of ['organization','profile','profileInitials'])if(typeof s[key]==='string')settings[key]=s[key].slice(0,key==='profileInitials'?2:120);
 if(/^#[a-f0-9]{6}$/i.test(s.accent))settings.accent=s.accent;
 if(Array.isArray(s.enabledModules))settings.enabledModules=[...new Set(['board',...s.enabledModules.filter(id=>typeof id==='string'&&/^[a-z0-9-]{1,50}$/.test(id))])];
 settings.compact=!!s.compact;
 const teams=input.teams.slice(0,100).filter(t=>typeof t?.id==='string'&&typeof t?.name==='string').map(t=>({id:t.id.slice(0,80),name:t.name.slice(0,80)}));
 const boards=input.boards.map(raw=>{const b=validateBoard(raw);b.team=typeof raw.team==='string'?raw.team:'personal';b.favorite=!!raw.favorite;b.shared=!!raw.shared;b.deleted=!!raw.deleted;
  b.share={enabled:!!raw.share?.enabled,role:['view','comment','edit'].includes(raw.share?.role)?raw.share.role:'view'};
  b.versions=Array.isArray(raw.versions)?raw.versions.slice(0,20).map(v=>({id:uid(),name:String(v.name||'Версия').slice(0,100),date:String(v.date||''),nodes:validateBoard({name:'Версия',nodes:v.nodes}).nodes})):[];
  return b;
 });
 const boardIds=new Map(input.boards.map((b,i)=>[b.id,boards[i].id]));
 const nodeIds=new Map(input.boards.flatMap((raw,i)=>[...(raw.nodes||[]),...(raw.archivedNodes||[])].map((n,j)=>[n.id,[...boards[i].nodes,...boards[i].archivedNodes][j]?.id])));
 boards.forEach((b,i)=>{b.relatedBoards=b.relatedBoards.map(r=>({...r,id:boardIds.get(r.id)||r.id}));b.links=b.links.map((l,j)=>({...l,from:nodeIds.get(input.boards[i].links?.[j]?.from)||l.from,to:nodeIds.get(input.boards[i].links?.[j]?.to)||l.to}));});
 const projectSpaces=Array.isArray(input.projectSpaces)?input.projectSpaces.slice(0,100).filter(p=>typeof p?.id==='string'&&typeof p?.name==='string').map(p=>({id:p.id.slice(0,80),name:p.name.slice(0,100),private:!!p.private})):clone(PROJECT_SPACES);return {version:VERSION,boards,teams,settings,projectSpaces};
}
export function bounds(nodes){if(!nodes.length)return {x:0,y:0,w:1000,h:650};const x=Math.min(...nodes.map(n=>n.x)),y=Math.min(...nodes.map(n=>n.y));return {x,y,w:Math.max(...nodes.map(n=>n.x+n.w))-x,h:Math.max(...nodes.map(n=>n.y+n.h))-y};}
export function moveNodes(nodes,ids,dx,dy){return nodes.map(n=>ids.includes(n.id)&&!n.locked?{...n,x:n.x+dx,y:n.y+dy}:n);}
export function duplicateNodes(nodes,ids,offset=30){return nodes.filter(n=>ids.includes(n.id)).map(n=>({...clone(n),id:uid(),x:n.x+offset,y:n.y+offset,...(n.type==='poll'?{poll:freshPollCopy(n.poll)}:{})}));}
export function filterBoards(state,filter,query=''){return state.boards.filter(b=>filter==='trash'?b.deleted:!b.deleted&&(filter==='favorites'?b.favorite:filter==='shared'?b.shared:filter==='mine'?b.team==='personal':filter.startsWith('team:')?b.team===filter.slice(5):true)).filter(b=>b.name.toLocaleLowerCase('ru').includes(query.toLocaleLowerCase('ru')));}
export function loadState(){try{const d=JSON.parse(localStorage.getItem(STORAGE_KEY));if(d?.version===VERSION&&Array.isArray(d.boards)&&Array.isArray(d.teams))return {...initialState(),...d,settings:{...initialState().settings,...d.settings}};}catch{}return initialState();}
export function saveState(state){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
