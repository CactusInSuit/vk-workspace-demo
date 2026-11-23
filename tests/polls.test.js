import test from 'node:test';
import assert from 'node:assert/strict';
import {blankPoll,cleanPoll,votePoll,pollResults,pollClosed} from '../src/lib/polls.js';
import {node,createBoard,validateBoard,validateBackup,initialState,duplicateNodes} from '../src/lib/model.js';
import {boardSVG} from '../src/lib/export.js';
function poll(extra={}){const p=blankPoll('owner');p.options.forEach((o,i)=>o.text='Ответ '+(i+1));return {...p,...extra};}
test('one participant gets one ballot, revoting replaces it, and retraction removes it',()=>{
 let p=poll();const [a,b]=p.options.map(o=>o.id);p=votePoll(p,'user',[a],'Имя');p=votePoll(p,'user',[b],'Имя');assert.equal(p.ballots.length,1);assert.deepEqual(p.ballots[0].choices,[b]);assert.equal(p.ballots[0].name,undefined);assert.equal(pollResults(p).options[1].percent,100);assert.equal(votePoll(p,'user',[]).ballots.length,0);
});
test('multiple answer results use participants as denominator and public votes retain names',()=>{
 let p=poll({multiple:true,anonymous:false});const [a,b]=p.options.map(o=>o.id);p=votePoll(p,'u1',[a,b],'Анна');p=votePoll(p,'u2',[b],'Иван');assert.deepEqual(pollResults(p).options.map(o=>o.percent),[50,100]);assert.equal(p.ballots[0].name,'Анна');assert.throws(()=>votePoll(p,'u3',['unknown']));
});
test('quizzes require a correct option and prevent second attempts or withdrawal',()=>{
 let p=poll({quiz:true,multiple:true,allowRevote:true});assert.throws(()=>cleanPoll(p));p.correctOptionId=p.options[0].id;p=cleanPoll(p);assert.equal(p.multiple,false);assert.equal(p.allowRevote,false);assert.throws(()=>votePoll(p,'u',p.options.map(o=>o.id)));p=votePoll(p,'u',[p.options[1].id]);assert.throws(()=>votePoll(p,'u',[p.options[0].id]));assert.throws(()=>votePoll(p,'u',[]));
});
test('closed and expired polls reject votes, including revocations',()=>{
 const p=poll();assert.equal(pollClosed({...p,closesAt:100},100),true);assert.throws(()=>votePoll({...p,closed:true},'u',[p.options[0].id]));assert.throws(()=>votePoll({...p,closesAt:100},'u',[p.options[0].id],'',101));
});
test('polls survive import and backup, and copies start without inherited votes',()=>{
 const p=poll({anonymous:false});p.ballots=[{voterId:'u',choices:[p.options[0].id],name:'Анна'}];const b=createBoard('Опросы');b.nodes=[node('poll',50,100,{text:'Какой вариант?',poll:p})];const imported=validateBoard(b);assert.deepEqual(imported.nodes[0].poll,p);const state=initialState();state.boards=[b];assert.deepEqual(validateBackup(state).boards[0].nodes[0].poll,p);const copy=duplicateNodes(b.nodes,[b.nodes[0].id])[0];assert.equal(copy.poll.ballots.length,0);assert.notEqual(copy.poll,p);assert.equal(p.ballots.length,1);
});
test('malformed polls reject invalid options and discard duplicate or invalid ballots',()=>{
 assert.throws(()=>cleanPoll({options:[]}));const p=poll();p.options[1].id=p.options[0].id;assert.throws(()=>cleanPoll(p));const q=poll();q.ballots=[{voterId:'u',choices:[q.options[0].id],name:'Private'},{voterId:'u',choices:[q.options[1].id]},{voterId:'v',choices:['bad']}];const clean=cleanPoll(q);assert.equal(clean.ballots.length,1);assert.equal('name' in clean.ballots[0],false);
});
test('poll SVG exports answers safely and hides counts when results are hidden',()=>{
 const p=poll({hideResults:true});p.options[0].text='<script>bad</script>';const b=createBoard();b.nodes=[node('poll',0,0,{text:'Вопрос?',poll:p})];const svg=boardSVG(b);assert.ok(svg.includes('&lt;script&gt;'));assert.ok(!svg.includes('<script>'));assert.ok(!svg.includes('0%'));
});
