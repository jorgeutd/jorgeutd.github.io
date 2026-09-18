/* Original deterministic teaching models. No measured hardware or real services. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SystemsTeaching=api;})(typeof window!=='undefined'?window:globalThis,()=>{
 'use strict';
 const defaults={count:32,gpus:4,encoders:1,media:50,images:6,tokens:128,gap:80,transfer:16,acceleration:1,slo:1000};
 const percentile=(xs,p)=>[...xs].sort((a,b)=>a-b)[Math.max(0,Math.ceil(xs.length*p)-1)];
 function inference(options={}){
  const c={...defaults,...options};
  for(const k of ['count','gpus','encoders','images','tokens'])if(!Number.isInteger(c[k])||c[k]<1)throw Error('Invalid '+k);
  if(c.encoders>=c.gpus||c.count>256||c.gpus>16)throw Error('Invalid capacity');
  for(const k of ['media','gap','transfer','acceleration','slo'])if(!Number.isFinite(c[k])||c[k]<0)throw Error('Invalid '+k);
  if(c.media>100||c.acceleration===0||c.slo===0)throw Error('Invalid workload');
  const requests=Array.from({length:c.count},(_,i)=>{
   // Evenly distribute a deterministic media fraction; the fixture never changes randomly.
   const media=Math.floor((i+1)*c.media/100)>Math.floor(i*c.media/100);
   return {id:i,arrival:i*c.gap,media,encode:media?c.images*25:0,prefill:(12+(media?c.images*5:0))/c.acceleration,decode:c.tokens*1.6/c.acceleration};
  });
  const reserve=(pool,ready,duration)=>{const worker=pool.indexOf(Math.min(...pool)),start=Math.max(ready,pool[worker]);pool[worker]=start+duration;return {worker,start,end:start+duration};};
  const span=(name,start,end,worker)=>({name,start,end,worker});
  const finish=(r,spans,first,end)=>({...r,spans,first,end,ttft:first-r.arrival,latency:end-r.arrival});
  const combined=new Array(c.gpus).fill(0);
  const aggregated=requests.map(r=>{
   const s=reserve(combined,r.arrival,r.encode+r.prefill+r.decode),p=s.start+r.encode;
   return finish(r,[span('Queue',r.arrival,s.start,'Gateway'),span('Encode',s.start,p,'GPU '+s.worker),span('Prefill',p,p+r.prefill,'GPU '+s.worker),span('Decode',p+r.prefill,s.end,'GPU '+s.worker)],p+r.prefill+1.6/c.acceleration,s.end);
  });
  const enc=new Array(c.encoders).fill(0),pd=new Array(c.gpus-c.encoders).fill(0);
  const ready=requests.map(r=>{
   if(!r.media)return {...r,ready:r.arrival,spans:[]};
   const e=reserve(enc,r.arrival,r.encode);
   return {...r,ready:e.end+c.transfer,spans:[span('Encoder queue',r.arrival,e.start,'Encoder pool'),span('Encode',e.start,e.end,'Encoder '+e.worker),span('Transfer',e.end,e.end+c.transfer,'Network')]};
  }).sort((a,b)=>a.ready-b.ready||a.id-b.id);
  const separated=ready.map(r=>{
   const s=reserve(pd,r.ready,r.prefill+r.decode);
   return finish(r,[...r.spans,span('LLM queue',r.ready,s.start,'LLM pool'),span('Prefill',s.start,s.start+r.prefill,'LLM '+s.worker),span('Decode',s.start+r.prefill,s.end,'LLM '+s.worker)],s.start+r.prefill+1.6/c.acceleration,s.end);
  }).sort((a,b)=>a.id-b.id);
  function summary(rows){const horizon=Math.max(...rows.map(r=>r.end)),passed=rows.filter(r=>r.latency<=c.slo).length;return {rows,p95First:percentile(rows.map(r=>r.ttft),.95),p95End:percentile(rows.map(r=>r.latency),.95),passed,goodput:passed/(horizon/1000),horizon};}
  return {config:c,requests,aggregated:summary(aggregated),separated:summary(separated)};
 }
 function recovery(idempotent=true){
  return {idempotent,phase:0,alive:true,worker:1,clock:0,events:[],traces:[],ledger:[],attempts:0,pending:null,key:'case-042:save:v1'};
 }
 const steps=['Accept request','Plan response','Persist tool intent','Execute tool','Record tool result','Validate result','Complete session'];
 function advance(s,action){
  // Copy input so replay/tests cannot accidentally mutate an earlier checkpoint.
  s=JSON.parse(JSON.stringify(s));
  const trace=(name,duration,status,detail)=>{const start=s.clock;s.clock+=duration;s.traces.push({id:'span-'+(s.traces.length+1),worker:s.worker,name,start,end:s.clock,status,detail});};
  const event=(kind,detail)=>s.events.push({sequence:s.events.length+1,kind,detail,time:s.clock});
  if(action==='crash'){
   if(!s.alive||s.phase===0||s.phase===7)return s;
   trace('Worker lost',0,'error',s.pending?'Tool committed; its result has not reached the session log.':'Only the durable session events will survive.');
   s.alive=false;s.pending=null;return s;
  }
  if(action==='resume'){
   if(s.alive)return s;
   s.worker++;s.alive=true;
   const kinds=s.events.map(e=>e.kind);
   s.phase=kinds.includes('completed')?7:kinds.includes('validated')?6:kinds.includes('tool-result')?5:kinds.includes('tool-intent')?3:kinds.includes('planned')?2:kinds.includes('accepted')?1:0;
   trace('Restore session',40,'ok','New worker reconstructs progress from '+s.events.length+' durable events.');return s;
  }
  if(action!=='step'||!s.alive||s.phase===7)return s;
  if(s.phase===0){trace(steps[0],10,'ok','Assign session-042 and trace-042.');event('accepted','session-042');}
  if(s.phase===1){trace(steps[1],50,'ok','Synthetic model plan; no model is called.');event('planned','Save one fictional report.');}
  if(s.phase===2){trace(steps[2],10,'ok','Persist the logical action identity before delivery.');event('tool-intent',s.key+' / payload: report-v1');}
  if(s.phase===3){
   s.attempts++;
   const existing=s.idempotent?s.ledger.find(r=>r.key===s.key):null;
   s.pending=existing||{key:s.key,receipt:'receipt-'+(s.ledger.length+1),payload:'report-v1'};
   if(!existing)s.ledger.push(s.pending);
   trace('Tool delivery '+s.attempts,30,'ok',existing?'Existing receipt returned; no second write.':'External store commits '+s.pending.receipt+'. Acknowledgment is still volatile.');
  }
  if(s.phase===4){trace(steps[4],10,'ok','Persist the returned receipt.');event('tool-result',s.pending.receipt);s.pending=null;}
  if(s.phase===5){trace(steps[5],20,'ok','Verify the recorded receipt and payload. This does not detect unrecorded duplicate writes.');event('validated','Returned receipt is valid.');}
  if(s.phase===6){trace(steps[6],5,'ok','Return the recorded outcome to the client.');event('completed','Report saved.');}
  s.phase++;return s;
 }
 return {defaults,percentile,inference,recovery,advance,steps};
});
