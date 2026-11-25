const KEY_STORAGE='workspace-deepseek-api-key';
const API_ROOT='https://api.deepseek.com';
export const getDeepSeekKey=()=>localStorage.getItem(KEY_STORAGE)||'';
export function setDeepSeekKey(value){const key=String(value||'').trim();if(key)localStorage.setItem(KEY_STORAGE,key);else localStorage.removeItem(KEY_STORAGE);}

async function apiError(response){let detail='';try{const data=await response.json();detail=data?.error?.message||data?.message||'';}catch{}if(response.status===401)throw Error('DeepSeek отклонил API-ключ. Проверьте его в настройках.');if(response.status===402)throw Error('На балансе DeepSeek недостаточно средств.');if(response.status===429)throw Error('Слишком много запросов к DeepSeek. Повторите немного позже.');throw Error(detail||`DeepSeek вернул ошибку ${response.status}.`);}

export async function transcribeAudio(blob,key=getDeepSeekKey()){
 if(!key)throw Error('Сначала добавьте API-ключ DeepSeek в настройках WorkSpace.');
 if(!blob) return '';
 if(blob.size>8*1024*1024)throw Error('Голосовая запись превышает лимит DeepSeek 8 МБ.');
 const body=new FormData();body.append('file',blob,'voice.wav');
 const response=await fetch(`${API_ROOT}/v1/tools/asr`,{method:'POST',headers:{Authorization:`Bearer ${key}`},body});
 if(!response.ok)await apiError(response);const data=await response.json();return String(data.text||'').trim();
}

const allowedStatus=new Set(['Запланировано','В работе','Готово']);
const allowedPriority=new Set(['Низкий','Средний','Высокий']);
export function normalizeTasks(input){
 const rows=Array.isArray(input)?input:Array.isArray(input?.tasks)?input.tasks:[];
 return rows.slice(0,20).map((raw,index)=>({
  id:`ai-${Date.now()}-${index}`,include:true,title:String(raw?.title||raw?.name||'').trim().slice(0,180),assignee:String(raw?.assignee||'').trim().slice(0,100),deadline:/^\d{4}-\d{2}-\d{2}$/.test(raw?.deadline||'')?raw.deadline:'',priority:allowedPriority.has(raw?.priority)?raw.priority:'Средний',description:String(raw?.description||'').trim().slice(0,1000),status:allowedStatus.has(raw?.status)?raw.status:'Запланировано'
 })).filter(task=>task.title);
}

export async function recognizeTasks({image,transcript='',key=getDeepSeekKey(),today}){
 if(!key)throw Error('Сначала добавьте API-ключ DeepSeek в настройках WorkSpace.');
 const prompt=`Проанализируй выделенную область рабочей доски и расшифровку голоса. Найди только реальные поручения или задачи. Рукописный текст тоже нужно прочитать. Не выдумывай отсутствующие сведения. Сегодня ${today}; относительные сроки переводи в YYYY-MM-DD. Верни JSON строго вида {"tasks":[{"title":"","assignee":"","deadline":"","priority":"Низкий|Средний|Высокий","description":"","status":"Запланировано|В работе|Готово"}]}. Если задач нет, верни {"tasks":[]}. Расшифровка голоса: ${transcript||'не добавлена'}`;
 const content=[{type:'text',text:prompt}];if(image)content.push({type:'image_url',image_url:{url:image}});
 const response=await fetch(`${API_ROOT}/chat/completions`,{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:'deepseek-flash',thinking:{type:'disabled'},messages:[{role:'user',content}],response_format:{type:'json_object'},temperature:0.1,max_tokens:3000})});
 if(!response.ok)await apiError(response);const data=await response.json();const text=data?.choices?.[0]?.message?.content;if(!text?.trim())throw Error('DeepSeek вернул пустой результат. Повторите распознавание.');
 try{return normalizeTasks(JSON.parse(text));}catch{throw Error('DeepSeek вернул результат в неожиданном формате. Повторите распознавание.');}
}

function writeString(view,offset,text){for(let i=0;i<text.length;i++)view.setUint8(offset+i,text.charCodeAt(i));}
export async function recordingToWav(blob){
 const context=new (window.AudioContext||window.webkitAudioContext)();try{const decoded=await context.decodeAudioData(await blob.arrayBuffer());const rate=decoded.sampleRate,length=decoded.length,channels=Math.min(2,decoded.numberOfChannels),buffer=new ArrayBuffer(44+length*channels*2),view=new DataView(buffer);writeString(view,0,'RIFF');view.setUint32(4,36+length*channels*2,true);writeString(view,8,'WAVE');writeString(view,12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,channels,true);view.setUint32(24,rate,true);view.setUint32(28,rate*channels*2,true);view.setUint16(32,channels*2,true);view.setUint16(34,16,true);writeString(view,36,'data');view.setUint32(40,length*channels*2,true);let offset=44;for(let i=0;i<length;i++)for(let c=0;c<channels;c++){const sample=Math.max(-1,Math.min(1,decoded.getChannelData(c)[i]));view.setInt16(offset,sample<0?sample*0x8000:sample*0x7fff,true);offset+=2;}return new Blob([buffer],{type:'audio/wav'});}finally{await context.close();}
}
