/* Exact, fixed-weight teaching operators. No training or pretrained weights. */
(function(scope){
 'use strict';
 const nodes=[
  {id:'question',name:'Question',p:[-205,-100,40],h:[.85,.15,.25,.6]},
  {id:'retrieval',name:'Retrieval',p:[-100,-35,-100],h:[.65,.5,.2,.35]},
  {id:'documents',name:'Documents',p:[-155,120,45],h:[.3,.8,.75,.1]},
  {id:'evidence',name:'Evidence',p:[15,25,25],h:[.55,.65,.9,.4]},
  {id:'relations',name:'Relations',p:[15,-135,15],h:[.2,.85,.45,.5]},
  {id:'ranker',name:'Ranker',p:[105,-55,-100],h:[.75,.4,.35,.65]},
  {id:'reader',name:'LLM reader',p:[180,80,35],h:[.8,.2,.4,.8]},
  {id:'answer',name:'Answer',p:[235,-90,75],h:[.6,.35,.65,.7]},
  {id:'checks',name:'Checks',p:[25,155,-90],h:[.2,.5,.95,.25]}
 ];
 const edges=[[0,1],[1,2],[1,3],[2,3],[3,4],[4,5],[3,5],[5,6],[3,8],[6,7],[7,8],[2,8]];
 const W=[[.7,.1,-.15,.2],[.15,.6,.25,-.1],[-.1,.25,.75,.1],[.25,-.15,.1,.65]];
 const S=[[.4,.1,0,.2],[0,.5,.15,0],[.1,0,.45,.1],[.2,.1,0,.35]];
 const Q=[[.6,-1.2,.1,.3],[.1,.5,-1.2,.1],[-1.2,.1,.6,.2],[.3,.1,.1,-.8]];
 const K=[[.4,.2,-.8,.1],[.2,-.7,.4,-.2],[.1,-.8,.5,.2],[-.8,.2,.2,.4]];
 const A=[.9,-.7,.8,-.5];
 const linear=(x,w)=>w.map(row=>row.reduce((s,v,j)=>s+v*x[j],0));
 const add=(a,b)=>a.map((v,i)=>v+b[i]);
 const scale=(a,w)=>a.map(v=>v*w);
 const sum=xs=>xs.reduce(add,[0,0,0,0]);
 const relu=x=>x.map(v=>Math.max(0,v));
 const softmax=xs=>{const m=Math.max(...xs),e=xs.map(x=>Math.exp(x-m)),s=e.reduce((a,b)=>a+b,0);return e.map(x=>x/s);};
 function step(input,links,method){
  const neighbors=input.map((_,i)=>links.flatMap(([a,b])=>a===i?[b]:b===i?[a]:[]));
  const degree=neighbors.map(n=>n.length+1),details=[];
  const output=input.map((h,i)=>{
   const ids=method==='sage'?neighbors[i]:[i,...neighbors[i]];
   let weights,raw=[];
   if(method==='gcn')weights=ids.map(j=>1/Math.sqrt(degree[i]*degree[j]));
   else if(method==='sage')weights=ids.map(()=>1/Math.max(1,ids.length));
   else {
    raw=ids.map(j=>add(linear(h,Q),linear(input[j],K)).reduce((s,v,k)=>s+A[k]*(v>=0?v:.2*v),0));
    weights=softmax(raw);
   }
   const messages=ids.map((j,k)=>scale(linear(input[j],W),weights[k]));
   const aggregate=sum(messages),self=method==='sage'?linear(h,S):[0,0,0,0];
   const pre=add(aggregate,self),updated=relu(pre);
   details.push({ids,weights,raw,messages,aggregate,self,pre,updated,degree:degree[i]});return updated;
  });return {output,details};
 }
 function run(method='gcn',cut=false,depth=3){
  const links=edges.filter(([a,b])=>!cut||!(a===1&&b===3));
  const states=[nodes.map(n=>n.h.slice())],layers=[];
  for(let k=0;k<depth;k++){const r=step(states[k],links,method);states.push(r.output);layers.push(r.details);}
  return {states,layers,links};
 }
 function reach(index,links,hops){const seen=new Set([index]);for(let k=0;k<hops;k++){const before=[...seen];for(const [a,b] of links){if(before.includes(a))seen.add(b);if(before.includes(b))seen.add(a);}}return [...seen];}
 const api={nodes,edges,W,S,Q,K,A,linear,step,run,reach,softmax};scope.GraphTeachingMath=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window==='undefined'?globalThis:window);
