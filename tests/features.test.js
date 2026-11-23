import test from 'node:test';
import assert from 'node:assert/strict';
import {createConceptBoard,splitBoard,archiveNodes,restoreArchive,usage,unreadEvents,diffEvents,overdue,localDay,canAccess} from '../src/lib/features.js';
import {initialState,validateBackup} from '../src/lib/model.js';

test('splitting preserves every object exactly once and both ends of cross-board links',()=>{
 const b=createConceptBoard(),ids=[b.nodes[1].id,b.nodes[3].id];const original=JSON.stringify(b);
 const {source,child}=splitBoard(b,ids,'Часть 2');
 assert.equal(JSON.stringify(b),original);assert.equal(source.nodes.length+child.nodes.length,b.nodes.length);
 const all=[...source.nodes,...child.nodes];assert.equal(new Set(all.map(n=>n.id)).size,b.nodes.length);
 for(const link of source.links){assert(all.some(n=>n.id===link.from));assert(all.some(n=>n.id===link.to));}
 assert.deepEqual(child.links,b.links);assert.equal(source.relatedBoards[0].id,child.id);assert.equal(child.relatedBoards[0].id,b.id);
});
test('archive and restoration keep identifiers and relations while reducing active usage',()=>{
 const b=createConceptBoard(),ids=b.nodes.slice(1,4).map(n=>n.id),archived=archiveNodes(b,ids);
 assert.equal(usage(archived).count,b.nodes.length-3);assert.equal(archived.archivedNodes.length,3);assert.deepEqual(archived.links,b.links);
 const restored=restoreArchive(archived);assert.equal(restored.archivedNodes.length,0);assert.deepEqual(restored.nodes.map(n=>n.id).sort(),b.nodes.map(n=>n.id).sort());
});
test('closed sections cannot be moved, archived or considered accessible',()=>{
 const b=createConceptBoard();b.nodes[0].sectionId='design';const id=b.nodes[0].id;
 assert.equal(canAccess('design'),false);assert.equal(canAccess('general'),true);
 assert.equal(archiveNodes(b,[id]).nodes.length,b.nodes.length);assert.throws(()=>splitBoard(b,[id],'Закрыто'));
});
test('absence digest is personal, excludes own events and private sections',()=>{
 const b=createConceptBoard();b.activity.push({...b.activity[0],id:'own',author:'Я'},{...b.activity[0],id:'private',sectionId:'design'});
 assert.equal(unreadEvents(b,'Я').length,3);b.seenBy={'Я':Date.now()};assert.equal(unreadEvents(b,'Я').length,0);assert(unreadEvents(b,'Другой').length>0);
});
test('task status changes generate an event and finished tasks are not overdue',()=>{
 const b=createConceptBoard(),before=b.nodes,task=before.find(n=>n.type==='task'),after=before.map(n=>n.id===task.id?{...n,status:'Готово'}:n);
 const events=diffEvents(before,after,'Я');assert.equal(events.length,1);assert.equal(events[0].nodeId,task.id);assert.match(events[0].detail,/Готово/);
 assert.equal(overdue({...task,deadline:'2020-01-01',status:'Готово'},'2026-11-23'),false);assert.equal(overdue({...task,deadline:'2026-11-23'},'2026-11-23'),false);
});
test('usage derives percentage from actual object count, and deadlines use Moscow day',()=>{
 const b=createConceptBoard();assert.deepEqual(usage(b),{count:10,limit:12,percent:83});assert.equal(localDay(new Date('2026-11-22T22:30:00Z')),'2026-11-23');
});

test('backup roundtrip remaps cross-board links and keeps archive, sections and digest',()=>{
 const b=createConceptBoard();b.nodes[2].sectionId='design';b.sections=[{id:'qa',name:'QA',locked:true}];
 const {source,child}=splitBoard(b,[b.nodes[3].id],'Часть 2');const archived=archiveNodes(source,[b.nodes[1].id]);
 const state={...initialState(),boards:[archived,child]},restored=validateBackup(JSON.parse(JSON.stringify(state)));
 const [a,c]=restored.boards,all=[...a.nodes,...a.archivedNodes,...c.nodes];
 assert.equal(a.relatedBoards[0].id,c.id);assert.equal(a.archivedNodes.length,1);assert.equal(a.objectLimit,12);assert.equal(a.sections[0].name,'QA');assert.equal(a.nodes.find(n=>n.text.startsWith('Обсудить')).sectionId,'design');
 for(const link of a.links){assert(all.some(n=>n.id===link.from));assert(all.some(n=>n.id===link.to));}
 assert.equal(a.activity[0].nodeId,a.archivedNodes[0].id);
});
