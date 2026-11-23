export const MAX_POLL_OPTIONS=12;
const id=()=>globalThis.crypto?.randomUUID?.()||`poll-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const short=(value,max=100)=>String(value??'').slice(0,max);
export function pollVoterId(){
 const key='workspace-poll-voter';
 try{let value=localStorage.getItem(key);if(!value){value=id();localStorage.setItem(key,value);}return value;}catch{return 'local-participant';}
}
export function blankPoll(creatorId){return {anonymous:true,multiple:false,quiz:false,allowRevote:true,hideResults:false,correctOptionId:null,explanation:'',creatorId,closed:false,closesAt:null,options:[{id:id(),text:''},{id:id(),text:''}],ballots:[]};}
export function pollClosed(poll,now=Date.now()){return !!poll.closed||!!poll.closesAt&&poll.closesAt<=now;}
export function cleanPoll(raw){
 if(!raw||!Array.isArray(raw.options)||raw.options.length<2||raw.options.length>MAX_POLL_OPTIONS)throw Error('В опросе должно быть от 2 до 12 вариантов.');
 const options=raw.options.map(o=>({id:short(o?.id,80),text:short(o?.text,100).trim()}));
 if(options.some(o=>!o.id||!o.text)||new Set(options.map(o=>o.id)).size!==options.length)throw Error('Заполните варианты ответа. Идентификаторы должны быть уникальными.');
 const quiz=!!raw.quiz,multiple=!quiz&&!!raw.multiple,anonymous=raw.anonymous!==false;
 if(quiz&&!options.some(o=>o.id===raw.correctOptionId))throw Error('Выберите правильный ответ для викторины.');
 const seen=new Set(),ballots=[];
 for(const ballot of (Array.isArray(raw.ballots)?raw.ballots:[]).slice(0,10000)){
  const voterId=short(ballot?.voterId,100),choices=[...new Set((Array.isArray(ballot?.choices)?ballot.choices:[]).filter(c=>options.some(o=>o.id===c)))];
  if(!voterId||seen.has(voterId)||!choices.length||!multiple&&choices.length!==1)continue;
  seen.add(voterId);ballots.push({voterId,choices,...(!anonymous?{name:short(ballot.name||'Участник',100)}:{})});
 }
 return {options,anonymous,multiple,quiz,allowRevote:!quiz&&raw.allowRevote!==false,hideResults:!!raw.hideResults,correctOptionId:quiz?raw.correctOptionId:null,explanation:short(raw.explanation,200),creatorId:short(raw.creatorId,100),closed:!!raw.closed,closesAt:Number.isFinite(raw.closesAt)&&raw.closesAt>0?raw.closesAt:null,ballots};
}
export function votePoll(raw,voterId,choices,name='',now=Date.now()){
 const poll=cleanPoll(raw);
 if(pollClosed(poll,now))throw Error('Опрос завершён.');
 if(!voterId)throw Error('Не удалось определить участника.');
 const previous=poll.ballots.find(b=>b.voterId===voterId);
 if(previous&&!poll.allowRevote)throw Error('В этом опросе нельзя изменить ответ.');
 if(!Array.isArray(choices)||new Set(choices).size!==choices.length||choices.some(c=>!poll.options.some(o=>o.id===c))||!poll.multiple&&choices.length>1)throw Error('Выберите допустимые варианты ответа.');
 const ballots=poll.ballots.filter(b=>b.voterId!==voterId);
 if(choices.length)ballots.push({voterId,choices:[...choices],...(!poll.anonymous?{name:short(name||'Участник',100)}:{})});
 return {...poll,ballots};
}
export function pollResults(poll){const total=poll.ballots.length;return {total,options:poll.options.map(o=>{const count=poll.ballots.filter(b=>b.choices.includes(o.id)).length;return {...o,count,percent:total?Math.round(count/total*100):0};})};}
export function freshPollCopy(poll){return {...JSON.parse(JSON.stringify(poll)),ballots:[],closed:false,closesAt:null};}
