import {createBoard,node,uid,clone} from './model.js';

export const STATUSES=['Запланировано','В работе','Готово'];
export const SECTIONS=[{id:'general',name:'Общая область',icon:'Home'},{id:'design',name:'Дизайн',locked:true},{id:'development',name:'Разработка',locked:true},{id:'marketing',name:'Маркетинг',locked:true}];
export const sectionOf=n=>n.sectionId||'general';
export const canAccess=id=>id==='general';
export function localDay(now=new Date()){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Moscow'}).format(now);}
export function overdue(task,day=localDay()){return task.status!=='Готово'&&!!task.deadline&&task.deadline<day;}
export function unreadEvents(board,profile){const seen=board.seenBy?.[profile]||0;return (board.activity||[]).filter(e=>e.at>seen&&e.author!==profile&&canAccess(e.sectionId||'general'));}
export function diffEvents(before,after,author){
 const old=new Map(before.map(n=>[n.id,n])),next=new Map(after.map(n=>[n.id,n]));const events=[];
 for(const n of after){const prev=old.get(n.id);if(!prev||JSON.stringify(prev)!==JSON.stringify(n))events.push({id:uid(),nodeId:n.id,title:n.text||'Объект',sectionId:sectionOf(n),author,at:Date.now(),kind:!prev?'added':'changed',detail:!prev?'добавил(а) объект':prev.status!==n.status?`изменил(а) статус: ${n.status}`:'изменил(а) объект'});}
 for(const n of before)if(!next.has(n.id))events.push({id:uid(),nodeId:n.id,title:n.text||'Объект',sectionId:sectionOf(n),author,at:Date.now(),kind:'removed',detail:'удалил(а) объект'});
 return events;
}
export function usage(board){const limit=board.objectLimit||40000,count=board.nodes.length;return {count,limit,percent:Math.round(count/limit*100)};}
export function archiveNodes(board,ids){const selected=new Set(ids),moving=board.nodes.filter(n=>selected.has(n.id)&&canAccess(sectionOf(n)));return {...board,nodes:board.nodes.filter(n=>!moving.includes(n)),archivedNodes:[...(board.archivedNodes||[]),...moving]};}
export function restoreArchive(board){return {...board,nodes:[...board.nodes,...(board.archivedNodes||[])],archivedNodes:[]};}
export function splitBoard(board,ids,name){
 const selected=new Set(ids);const moving=board.nodes.filter(n=>selected.has(n.id)&&canAccess(sectionOf(n)));
 if(!moving.length)throw Error('Выберите хотя бы один объект');
 const child={...createBoard(name||`${board.name} · Часть 2`),nodes:clone(moving),objectLimit:board.objectLimit,relatedBoards:[{id:board.id,name:board.name}],links:clone(board.links||[])};
 const source={...board,nodes:board.nodes.filter(n=>!moving.includes(n)),relatedBoards:[...(board.relatedBoards||[]),{id:child.id,name:child.name}]};
 return {source,child};
}
export function createConceptBoard(){
 const b=createBoard('Рабочая доска · Команда продукта');b.featureDemo=true;b.objectLimit=12;
 const tasks=[['Подготовить презентацию','Анна Смирнова','Запланировано',localDay(),100,300],['Проверить макеты','Иван Петров','Запланировано','2026-11-22',100,510],['Согласовать бюджет','Мария Кузнецова','Запланировано','',100,720],['Доработать лендинг','Иван Петров','В работе',localDay(),440,300],['Подготовить материалы','Анна Смирнова','В работе','2026-11-24',440,510],['Провести тесты','Мария Кузнецова','В работе','',440,720],['Проверить гипотезы','Анна Смирнова','Готово','',780,300]];
 b.nodes=[node('text',100,55,{text:'От идеи к общему результату',w:950,h:60,fontSize:32}),node('sticky',100,145,{text:'Идея: собрать всё важное\nв одном месте',fill:'#efceff',w:260,h:120}),node('sticky',440,145,{text:'Обсудить с командой\nна ближайшей встрече',fill:'#d6e6ff',w:260,h:120}),...tasks.map(([text,assignee,status,deadline,x,y])=>node('task',x,y,{text,assignee,status,deadline,w:280,h:170,fill:'#ffffff'}))];
 b.links=[{id:uid(),from:b.nodes[1].id,to:b.nodes[3].id,label:'Из идеи в задачу'},{id:uid(),from:b.nodes[3].id,to:b.nodes[6].id,label:'Следующий шаг'}];
 b.activity=[{id:uid(),nodeId:b.nodes[1].id,title:'Идея: собрать всё важное в одном месте',sectionId:'general',author:'Анна Смирнова',at:Date.now()-60000,kind:'added',detail:'добавила стикер «Идея»'},{id:uid(),nodeId:b.nodes[6].id,title:'Доработать лендинг',sectionId:'general',author:'Иван Петров',at:Date.now()-180000,kind:'changed',detail:'изменил статус на «В работе»'},{id:uid(),nodeId:b.nodes[2].id,title:'Обсудить с командой',sectionId:'general',author:'Мария Кузнецова',at:Date.now()-300000,kind:'changed',detail:'изменила цвет'}];return b;
}
