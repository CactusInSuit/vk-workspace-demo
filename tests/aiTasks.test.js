import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeTasks} from '../src/lib/aiTasks.js';
import {createBoard,validateBoard,node} from '../src/lib/model.js';

test('AI task normalization keeps supported fields and rejects unsafe values',()=>{
 const [task]=normalizeTasks({tasks:[{title:'  Подготовить отчёт  ',assignee:'Анна',deadline:'2026-12-01',priority:'Высокий',description:'Собрать метрики',status:'В работе'}]});
 assert.deepEqual({title:task.title,assignee:task.assignee,deadline:task.deadline,priority:task.priority,description:task.description,status:task.status},{title:'Подготовить отчёт',assignee:'Анна',deadline:'2026-12-01',priority:'Высокий',description:'Собрать метрики',status:'В работе'});
 const [fallback]=normalizeTasks([{name:'Задача',deadline:'завтра',priority:'Критичный',status:'Начато'}]);
 assert.equal(fallback.deadline,'');assert.equal(fallback.priority,'Средний');assert.equal(fallback.status,'Запланировано');
});

test('AI task normalization drops empty rows and limits batch size',()=>{
 const tasks=normalizeTasks({tasks:[{title:' '},...Array.from({length:25},(_,i)=>({title:`Задача ${i}`}))]});
 assert.equal(tasks.length,19);assert.equal(tasks[0].title,'Задача 0');
});

test('recognized task fields survive board export and import',()=>{
 const board=createBoard('ИИ-задачи');board.nodes=[node('task',10,20,{text:'Отчёт',priority:'Высокий',description:'Собрать метрики',aiRecognized:true})];
 const [task]=validateBoard(JSON.parse(JSON.stringify(board))).nodes;
 assert.equal(task.priority,'Высокий');assert.equal(task.description,'Собрать метрики');assert.equal(task.aiRecognized,true);
});
