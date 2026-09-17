/* A deterministic teaching decoder. All displayed tensors are computed here;
   the fixed weights are untrained and do not encode language knowledge. */
(() => {
 'use strict';
 const VOCAB=['the','model','reads','a','token','and','predicts','next','word','.','learns','context','builds','meaning','from','data'];
 const EXAMPLES=[[0,1,2,3,4,9],[0,1,10,14,15,9],[3,4,12,0,11,9]];
 const D=8,H=2,DH=4;
 let seed=73;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const weights=(rows,cols)=>Array.from({length:rows},()=>Array.from({length:cols},()=>(random()*2-1)*Math.sqrt(3/rows)));
 const E=weights(VOCAB.length,D),WQ=weights(D,D),WK=weights(D,D),WV=weights(D,D),WO=weights(D,D),W1=weights(D,16),W2=weights(16,D),WU=weights(D,VOCAB.length);
 const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
 const add=(a,b)=>a.map((x,i)=>x+b[i]);
 const linear=(x,w)=>w[0].map((_,j)=>x.reduce((sum,v,i)=>sum+v*w[i][j],0));
 const norm=x=>{const mean=x.reduce((s,v)=>s+v,0)/x.length,variance=x.reduce((s,v)=>s+(v-mean)**2,0)/x.length;return x.map(v=>(v-mean)/Math.sqrt(variance+1e-5));};
 const gelu=x=>.5*x*(1+Math.tanh(Math.sqrt(2/Math.PI)*(x+.044715*x**3)));
 const softmax=x=>{const max=Math.max(...x),e=x.map(v=>Math.exp(v-max)),sum=e.reduce((s,v)=>s+v,0);return e.map(v=>v/sum);};
 const position=p=>Array.from({length:D},(_,i)=>i%2?Math.cos(p/10000**((i-1)/D)):Math.sin(p/10000**(i/D)));
 function forward(ids){
  if(!ids.length||ids.length>10||ids.some(id=>!Number.isInteger(id)||id<0||id>=VOCAB.length))throw Error('Expected 1–10 IDs from the teaching vocabulary.');
  const embedding=ids.map(id=>E[id].slice()),pos=ids.map((_,i)=>position(i)),x=embedding.map((v,i)=>add(v,pos[i])),n1=x.map(norm);
  const q=n1.map(v=>linear(v,WQ)),k=n1.map(v=>linear(v,WK)),v=n1.map(v=>linear(v,WV));
  const heads=Array.from({length:H},(_,h)=>{
   const Q=q.map(row=>row.slice(h*DH,(h+1)*DH)),K=k.map(row=>row.slice(h*DH,(h+1)*DH)),V=v.map(row=>row.slice(h*DH,(h+1)*DH));
   const scores=Q.map(row=>K.map(key=>dot(row,key)/Math.sqrt(DH)));
   const attention=scores.map((row,i)=>softmax(row.map((val,j)=>j<=i?val:-Infinity)));
   const mixed=attention.map(row=>Array.from({length:DH},(_,j)=>row.reduce((s,a,i)=>s+a*V[i][j],0)));
   return {Q,K,V,scores,attention,mixed};
  });
  const concat=ids.map((_,i)=>heads.flatMap(h=>h.mixed[i])),projected=concat.map(row=>linear(row,WO)),residual=x.map((row,i)=>add(row,projected[i])),n2=residual.map(norm),expanded=n2.map(row=>linear(row,W1)),activated=expanded.map(row=>row.map(gelu)),mlp=activated.map(row=>linear(row,W2)),output=residual.map((row,i)=>add(row,mlp[i])),final=output.map(norm),logits=final.map(row=>linear(row,WU));
  return {ids:ids.slice(),embedding,pos,x,n1,heads,concat,projected,residual,n2,expanded,activated,mlp,output,final,logits};
 }
 function distribution(logits,temperature=1,k=VOCAB.length){
  if(!(temperature>0)||!Number.isInteger(k)||k<1||k>logits.length)throw Error('Invalid sampling controls.');
  const ranked=logits.map((v,id)=>({id,logit:v})).sort((a,b)=>b.logit-a.logit||a.id-b.id),retained=ranked.slice(0,k),p=softmax(retained.map(r=>r.logit/temperature));
  return ranked.map((row,i)=>({...row,p:i<k?p[i]:0}));
 }
 const fmt=n=>Math.abs(n)<.0005?'0.000':n.toFixed(3),pct=n=>(n*100).toFixed(1)+'%';
 const color=n=>n>=0?`rgba(43,119,111,${.12+Math.min(Math.abs(n)/2,1)*.78})`:`rgba(164,97,72,${.12+Math.min(Math.abs(n)/2,1)*.78})`;
 const STAGES=[
  ['Embeddings','Give every position a vector.','Each preset is a sequence from a 16-token teaching vocabulary. Look up its 8-dimensional embedding and add a sinusoidal position vector. Production tokenizers usually split text into subword pieces.'],
  ['Attention','See which tokens can communicate.','Select a cell to inspect one query–key pair. Each head computes its own scores; the causal mask gives future positions exactly zero weight. Select a token above to follow its entire row.'],
  ['Residual & MLP','Carry the signal. Transform each position.','Concatenate the two head outputs, project back to 8 dimensions, and add the input. A second normalization and an 8 → 16 → 8 feed-forward network update each position independently.'],
  ['Next token','Turn scores into a decision.','The final position passes through layer normalization and an untied 16-token output head. Temperature rescales logits; top-k filters candidates and renormalizes their probability mass.']
 ];
 function vector(label,values,desc=''){
  return `<div class="tf-vector"><div><strong>${label}</strong>${desc?`<small>${desc}</small>`:''}</div><div class="tf-vector-values">${values.map((v,i)=>`<span title="Dimension ${i}: ${fmt(v)}" style="--cell:${color(v)}"><i></i>${fmt(v)}</span>`).join('')}</div></div>`;
 }
 function miniMatrix(values,x,y,size=8){return values.map((row,i)=>row.map((v,j)=>`<rect x="${x+j*(size+2)}" y="${y+i*(size+2)}" width="${size}" height="${size}" rx="1.5" fill="${color(v)}"/>`).join('')).join('');}
 function miniAttention(values,x,y){const size=Math.min(9,55/values.length);return values.map((row,i)=>row.map((v,j)=>`<rect x="${x+j*(size+1)}" y="${y+i*(size+1)}" width="${size}" height="${size}" rx="1" fill="${j>i?'var(--line)':`rgba(43,119,111,${.12+v*.88})`}"/>`).join('')).join('');}
 function diagram(m,stage,ranked){
  const arrow=(x1,x2,y)=>`<path d="M${x1} ${y}H${x2}" class="tf-wire" marker-end="url(#tf-arrow)"/>`;
  const block=(x,y,w,h,label,sub,active)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" class="tf-node ${active?'is-active':''}"/><text x="${x+w/2}" y="${y+26}" text-anchor="middle" class="tf-svg-title">${label}</text><text x="${x+w/2}" y="${y+h-15}" text-anchor="middle" class="tf-svg-meta">${sub}</text>`;
  return `<svg viewBox="0 0 1100 320" role="img" aria-label="Computed decoder path: token IDs, embeddings and positions, pre-normalized two-head causal attention, two residual additions, MLP, final normalization, output logits."><defs><marker id="tf-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L8 4L0 8" fill="none" stroke="currentColor"/></marker></defs>
   <text x="18" y="24" class="tf-svg-kicker">01 / REPRESENT</text><text x="365" y="24" class="tf-svg-kicker">02 / MIX &amp; TRANSFORM</text><text x="893" y="24" class="tf-svg-kicker">03 / PREDICT</text>
   ${block(18,63,125,198,'Token IDs',m.ids.length+' positions',stage===0)}${m.ids.slice(0,6).map((id,i)=>`<text x="32" y="113+i*21" class="tf-svg-token">${VOCAB[id]}</text><text x="126" y="113+i*21" text-anchor="end" class="tf-svg-meta">${id}</text>`).join('')}${arrow(146,172,155)}
   ${block(181,63,149,198,'Embeddings',m.ids.length+' × 8 · E + position',stage===0)}${miniMatrix(m.x.slice(0,6),200,108,12)}${arrow(333,360,155)}
   <rect x="366" y="46" width="480" height="237" rx="12" class="tf-block-boundary"/><text x="386" y="70" class="tf-svg-meta">ONE PRE-NORM DECODER BLOCK</text>
   <path d="M377 155V94H611V140 M625 155V249H828V171" class="tf-residual"/><text x="560" y="88" class="tf-svg-meta">skip</text><text x="775" y="269" class="tf-svg-meta">skip</text>
   ${block(382,127,47,60,'LN','norm',false)}${arrow(431,443,155)}
   ${block(451,106,140,112,'Causal attention','QKᵀ / √4 → softmax → V',stage===1)}${miniAttention(m.heads[0].attention,467,141)}${miniAttention(m.heads[1].attention,530,141)}
   <text x="469" y="235" class="tf-svg-meta">2 heads · concat · Wₒ</text>${arrow(593,602,155)}
   <circle cx="613" cy="155" r="13" class="tf-sum"/><text x="613" y="161" text-anchor="middle" class="tf-svg-title">+</text>${arrow(628,640,155)}
   ${block(647,127,47,60,'LN','norm',stage===2)}${arrow(696,708,155)}${block(716,106,92,112,'MLP','8 → 16 → 8',stage===2)}
   <path d="M732 180L745 180L755 178L762 164L775 150L792 136" class="tf-gelu"/><text x="760" y="245" text-anchor="middle" class="tf-svg-meta">GELU</text>${arrow(810,815,155)}
   <circle cx="828" cy="155" r="13" class="tf-sum"/><text x="828" y="161" text-anchor="middle" class="tf-svg-title">+</text>${arrow(849,878,155)}
   ${block(890,63,191,198,'Output distribution','final LN · 8 → 16 · sample',stage===3)}${ranked.slice(0,4).map((r,i)=>`<text x="905" y="115+i*30" class="tf-svg-token">${VOCAB[r.id]}</text><rect x="968" y="104+i*30" width="${Math.max(1,r.p/ranked[0].p*64)}" height="9" rx="2" fill="var(--accent)" opacity="${1-i*.17}"/><text x="1067" y="115+i*30" text-anchor="end" class="tf-svg-meta">${Math.round(r.p*100)}%</text>`).join('')}
   <text x="18" y="305" class="tf-svg-meta">Live tensor schematic · all values recompute when the input changes</text><text x="1080" y="305" text-anchor="end" class="tf-svg-meta">Residual stream: T × 8 throughout</text>
  </svg>`;
 }
 function mount(root){
  if(root.dataset.mounted)return;root.dataset.mounted='true';root.className='transformer-workbench';
  let ids=EXAMPLES[0].slice(),m=forward(ids),stage=1,query=4,key=1,head=0,temp=1,topk=16,sampleSeed=117;
  root.innerHTML=`<header class="tf-header"><div><span class="section-number">03 / INSIDE THE TRANSFORMER</span><h2>Follow a token. Inspect every step.</h2><p>Transformer anatomy, from an embedding lookup to the next-token distribution.</p></div><span class="tf-computed"><i></i>Computed in your browser</span></header>
   <div class="tf-input-bar"><label>Input sequence<select data-tf-prompt aria-label="Transformer input sequence">${EXAMPLES.map((seq,i)=>`<option value="${i}">${seq.map(id=>VOCAB[id]).join(' ')}</option>`).join('')}</select></label><div class="tf-specs"><span><b>1</b> decoder block</span><span><b>2</b> attention heads</span><span><b>8</b> dimensions</span><span class="tf-untrained">Fixed, untrained weights</span></div></div>
   <div class="tf-sequence" data-tf-sequence aria-label="Select a query token"></div>
   <div class="tf-map" data-tf-map></div><div class="tf-mobile-flow" aria-label="Decoder computation order"><span>IDs + position</span><b>↓</b><span>LN → causal attention → add input</span><b>↓</b><span>LN → MLP → add input</span><b>↓</b><span>Final LN → logits → sample</span></div>
   <nav class="tf-stages" aria-label="Inspect a transformer computation">${STAGES.map(([name],i)=>`<button type="button" data-tf-stage="${i}" aria-pressed="${i===stage}"><small>0${i+1}</small>${name}<span>↗</span></button>`).join('')}</nav>
   <div class="tf-inspector"><div class="tf-inspector-heading"><div><h3 data-tf-title></h3><p data-tf-deck></p></div><div class="tf-heads" data-tf-heads aria-label="Attention head"><button data-tf-head="0" aria-pressed="true">Head 1</button><button data-tf-head="1" aria-pressed="false">Head 2</button></div></div><div data-tf-detail></div></div>
   <footer class="tf-foot"><p><strong>A small model, with inspectable math.</strong> One pre-norm block, sinusoidal positions, two heads, GELU, no dropout, identity normalization scale and zero bias. This decoder recomputes the full sequence; it does not use a KV cache. Fixed illustrative weights have never been trained, so probabilities do not measure language understanding.</p><details><summary>Model specification &amp; visual references</summary><p>16 vocabulary entries · hidden width 8 · head width 4 · feed-forward width 16 · no projection biases · untied output weights · layer-norm ε = 10⁻⁵. Deterministic initialization seed 73. Green and terracotta vector cells encode positive and negative values; the attention matrix encodes weight from 0 to 1. Sampling uses a reproducible pseudorandom draw, reset with the input.</p><div class="tf-source-links"><a href="https://poloclub.github.io/transformer-explainer/" target="_blank" rel="noopener">Transformer Explainer · Polo Club ↗</a><a href="https://jalammar.github.io/illustrated-transformer/" target="_blank" rel="noopener">The Illustrated Transformer · Jay Alammar ↗</a><a href="https://arxiv.org/abs/1706.03762" target="_blank" rel="noopener">Attention Is All You Need ↗</a><a href="https://github.com/jorgeutd/jorgeutd.github.io/blob/main/assets/portfolio-transformer.js" target="_blank" rel="noopener">Inspect this implementation ↗</a></div></details></footer><div class="sr" data-tf-status role="status"></div>`;
  const el=s=>root.querySelector(s);
  function sequence(){el('[data-tf-sequence]').innerHTML=`<span class="tf-token-label">QUERY TOKEN<br><small>select to trace</small></span>${ids.map((id,i)=>`<button data-tf-token="${i}" aria-pressed="${i===query}" aria-label="Query position ${i}: ${VOCAB[id]}"><small>${String(i).padStart(2,'0')}</small><b>${VOCAB[id]}</b><span>ID ${id}</span></button>`).join('')}`;}
  function attention(){
   const h=m.heads[head],n=ids.length,masked=key>query,score=h.scores[query][key],weight=h.attention[query][key];
   return `<div class="tf-attention-layout"><figure class="tf-heatmap"><figcaption><strong>Attention weights</strong><span>Key position → · query position ↓</span></figcaption><div class="tf-matrix" style="--n:${n}"><span></span>${ids.map((_,i)=>`<span class="tf-axis">${i}</span>`).join('')}${ids.map((_,i)=>`<span class="tf-axis">${i}</span>${ids.map((_,j)=>`<button data-tf-cell="${i},${j}" class="${j>i?'masked':''} ${i===query?'query-row':''}" aria-pressed="${i===query&&j===key}" aria-label="Query ${i} ${VOCAB[ids[i]]}, key ${j} ${VOCAB[ids[j]]}: ${j>i?'masked, zero weight':pct(h.attention[i][j])}" style="--weight:${.13+.87*h.attention[i][j]}">${j>i?'×':Math.round(h.attention[i][j]*100)}</button>`).join('')}`).join('')}</div><div class="tf-legend"><span>Weights in %</span><span><i></i>0 → 100</span><span>× Future masked</span></div><p class="tf-row-sum">Selected row sum: <strong>${h.attention[query].reduce((s,v)=>s+v,0).toFixed(6)}</strong></p></figure>
    <div class="tf-calculation"><span class="tag">ONE QUERY–KEY PAIR / HEAD ${head+1}</span><h4>“${VOCAB[ids[query]]}” <small>at ${query}</small> → “${VOCAB[ids[key]]}” <small>at ${key}</small></h4><div class="tf-equation"><span>q · k / √d<sub>head</sub></span><strong>${fmt(dot(h.Q[query],h.K[key]))} / 2 = ${fmt(score)}</strong></div><div class="tf-equation"><span>Causal mask</span><strong>${masked?'−∞ · future position':'Keep · available position'}</strong></div><div class="tf-equation tf-result"><span>Row softmax</span><strong data-tf-weight>${pct(weight)}</strong></div><p>${masked?'This key lies in the future. Its masked score is −∞, its softmax weight is zero, and it contributes nothing to this query.':'This weight multiplies the selected value vector. Sum the weighted value vectors over all visible keys to form the head output.'}</p><p class="tf-fine">Attention weights describe a mixing operation; they are not a complete explanation of a prediction.</p></div></div>
    <div class="tf-vectors">${vector('Query q',h.Q[query],'position '+query)}${vector('Key k',h.K[key],'position '+key)}${vector('Value v',h.V[key],'position '+key)}${vector('Weighted contribution',h.V[key].map(v=>v*weight),'attention × v')}${vector('Head output',h.mixed[query],'sum across all visible keys')}</div>`;
  }
  function embeddings(){return `<div class="tf-explanation-band"><span class="tf-big-id">${ids[query]}</span><div><span class="tag">TOKEN “${VOCAB[ids[query]]}” / POSITION ${query}</span><h4>x = E[token ID] + position</h4><p>A vocabulary ID is an index, not a magnitude. The same token gets the same lookup vector; its position changes the vector entering this decoder.</p></div></div><div class="tf-vectors">${vector('Token embedding',m.embedding[query],'16 × 8 lookup matrix')}${vector('Position encoding',m.pos[query],'sin / cos at position '+query)}${vector('Residual stream x',m.x[query],'8 values entering the block')}${vector('LayerNorm(x)',m.n1[query],'input to Q, K and V projections')}</div>`;}
  function residual(){return `<div class="tf-residual-flow"><span>Two head outputs<br><b>4 + 4 dimensions</b></span><i>→</i><span>Concatenate + Wₒ<br><b>8 dimensions</b></span><i>→</i><span>Add input x<br><b>Residual 1</b></span><i>→</i><span>LN → MLP → add<br><b>Residual 2</b></span></div><div class="tf-vectors">${vector('Concatenated heads',m.concat[query],'head 1 followed by head 2')}${vector('Attention projection',m.projected[query],'concat × Wₒ')}${vector('First residual',m.residual[query],'x + projected attention')}${vector('MLP update',m.mlp[query],'GELU(LN(residual) × W₁) × W₂')}${vector('Block output',m.output[query],'first residual + MLP update')}</div><p class="tf-fine">The MLP expands to 16 hidden values before returning to 8. These dimensions are deliberately small enough to inspect; the number of blocks and expansion ratio vary between production architectures.</p>`;}
  function decoding(){const ranked=distribution(m.logits.at(-1),temp,topk);return `<div class="tf-decoding"><div><div class="tf-sample-controls"><label>Temperature <output>${temp.toFixed(2)}</output><input data-tf-temperature aria-label="Decoder sampling temperature" type="range" min="0.2" max="2" step="0.05" value="${temp}"></label><label>Top-k <select data-tf-k aria-label="Decoder top-k">${[1,3,5,16].map(k=>`<option value="${k}" ${k===topk?'selected':''}>${k===16?'All 16 tokens':k+' tokens'}</option>`).join('')}</select></label></div><div class="tf-sampling-note"><span class="tag">NEXT POSITION ${ids.length}</span><h4>Sample. Append. Recompute.</h4><p>Use the final position (${ids.length-1}, “${VOCAB[ids.at(-1)]}”) to select the next token. The sequence grows by one and every displayed tensor updates.</p><div class="actions"><button class="button primary" data-tf-generate ${ids.length>=10?'disabled':''}>Generate one token →</button><button class="button" data-tf-reset>Reset</button></div><p class="tf-fine">${ids.length>=10?'10-token teaching limit reached. Reset to start again.':'Up to 10 tokens. Untrained weights can produce nonsensical sequences.'}</p></div></div><div class="tf-probabilities"><div class="tf-prob-header"><span>Vocabulary token</span><span>Logit</span><span>Probability</span></div>${ranked.map(r=>`<div class="tf-prob ${r.p===0?'excluded':''}" data-tf-prob="${r.id}"><b>${VOCAB[r.id]}</b><code>${fmt(r.logit)}</code><span><i style="width:${r.p*100}%"></i><strong>${pct(r.p)}</strong></span></div>`).join('')}<p class="tf-row-sum">Distribution sum: <strong>${ranked.reduce((s,r)=>s+r.p,0).toFixed(6)}</strong></p></div></div>`;}
  function update(){
   const focused=document.activeElement,attrs=['data-tf-cell','data-tf-temperature','data-tf-k','data-tf-generate','data-tf-reset'];const restore=attrs.find(a=>focused&&focused.hasAttribute(a)),restoreValue=restore?focused.getAttribute(restore):null;
   root.querySelectorAll('[data-tf-token]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.tfToken===query)));
   root.querySelectorAll('[data-tf-stage]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.tfStage===stage)));
   root.querySelectorAll('[data-tf-head]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.tfHead===head)));
   el('[data-tf-title]').textContent=STAGES[stage][1];el('[data-tf-deck]').textContent=STAGES[stage][2];el('[data-tf-heads]').hidden=stage!==1;
   el('[data-tf-map]').innerHTML=diagram(m,stage,distribution(m.logits.at(-1),temp,topk));
   el('[data-tf-detail]').innerHTML=[embeddings,attention,residual,decoding][stage]();
   if(restore)el(`[${restore}="${restoreValue}"]`)?.focus({preventScroll:true});
  }
  function reset(){ids=EXAMPLES[+el('[data-tf-prompt]').value].slice();m=forward(ids);query=4;key=1;sampleSeed=117;sequence();update();}
  root.addEventListener('click',e=>{
   const b=e.target.closest('button');if(!b)return;
   if(b.hasAttribute('data-tf-token'))query=+b.dataset.tfToken;
   else if(b.hasAttribute('data-tf-stage'))stage=+b.dataset.tfStage;
   else if(b.hasAttribute('data-tf-head'))head=+b.dataset.tfHead;
   else if(b.hasAttribute('data-tf-cell'))[query,key]=b.dataset.tfCell.split(',').map(Number);
   else if(b.hasAttribute('data-tf-reset')){reset();el('[data-tf-status]').textContent='Input reset to six tokens.';return;}
   else if(b.hasAttribute('data-tf-generate')){
    if(ids.length>=10)return;const ranked=distribution(m.logits.at(-1),temp,topk),u=((sampleSeed=(Math.imul(sampleSeed,1664525)+1013904223)>>>0)/4294967296);let total=0;const chosen=ranked.find(r=>(total+=r.p)>u)||ranked.findLast(r=>r.p>0);ids.push(chosen.id);m=forward(ids);query=ids.length-1;sequence();el('[data-tf-status]').textContent=`Appended ${VOCAB[chosen.id]}. Sequence now has ${ids.length} tokens.`;
   }else return;update();
  });
  root.addEventListener('input',e=>{if(e.target.hasAttribute('data-tf-temperature')){temp=+e.target.value; e.target.previousElementSibling.textContent=temp.toFixed(2);const holder=document.createElement('div');holder.innerHTML=decoding();el('.tf-probabilities').replaceWith(holder.querySelector('.tf-probabilities'));el('[data-tf-map]').innerHTML=diagram(m,stage,distribution(m.logits.at(-1),temp,topk));}});
  root.addEventListener('change',e=>{if(e.target.hasAttribute('data-tf-prompt'))reset();if(e.target.hasAttribute('data-tf-k')){topk=+e.target.value;update();}});
  sequence();update();
 }
 window.PortfolioTransformer={forward,distribution,VOCAB,EXAMPLES,mount};
 const root=document.getElementById('transformer-anatomy');if(root)mount(root);
})();
