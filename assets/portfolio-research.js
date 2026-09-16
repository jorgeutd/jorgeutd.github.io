/* Original teaching examples. Fixtures are synthetic; no model or agent is executed. */
(() => {
'use strict';
const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const noteURL = slug => document.body.dataset.preview==='false'?'/notes/'+slug+'/':'#notes/'+slug;
const link = (label,url) => `<a class="text-link" href="${escape(url)}"${url.startsWith('https:')?' target="_blank" rel="noopener"':''}>${escape(label)}</a>`;
let sequence=0;
const familyData={
 encoder:{name:'Encoder',model:'BERT · RoBERTa · ALBERT',title:'Read the input in both directions.',description:'A bidirectional encoder builds a representation at each input position. A task head turns those representations into labels or vectors.',attention:'Each non-padding input position can attend to the full input. The colored cells show permitted connections, not attention strength.',output:'Document labels, token labels, or learned representations',training:'Masked language modeling is a common pretraining objective. Task-specific heads and training determine the downstream behavior.',source:'https://arxiv.org/abs/1810.04805'},
 decoder:{name:'Decoder',model:'GPT-style · Llama-style',title:'Generate from a prompt and a prefix.',description:'A causal decoder processes the available prefix and predicts a next token. Generation repeats this step as the prefix grows.',attention:'Each position can attend to itself and earlier positions. Future target tokens are hidden. During training, targets are shifted to prevent copying the answer.',output:'A continuation, structured text, or a tool-call representation',training:'Next-token prediction is a common starting objective. Instruction following and tool use depend on later training and the application.',source:'https://arxiv.org/abs/2005.14165'},
 seq2seq:{name:'Encoder–decoder',model:'T5 · BART · DistilBART',title:'Read a source. Generate a target.',description:'The encoder represents the source. A causal decoder generates the target, using cross-attention to the encoded source.',attention:'The encoder sees the source bidirectionally. Decoder self-attention is causal; decoder cross-attention can use all non-padding source positions.',output:'A target sequence conditioned on a separate source',training:'Text-to-text or denoising objectives are common. The source representation and the generated target have separate attention paths.',source:'https://arxiv.org/abs/1910.10683'}
};
const taskData={
 ner:{name:'Entity recognition',family:'encoder',why:'Start with a token-classification encoder when the output is a bounded set of entity spans.',metric:'Span-level precision, recall, and F1; entity types, boundary errors, and latency.'},
 classification:{name:'Document classification',family:'encoder',why:'An encoder with a task head is a useful baseline for a known label set. Compare it with other approaches on your data.',metric:'Macro-F1, per-class recall, precision–recall tradeoffs, calibration, and abstention coverage.'},
 summarization:{name:'Summarization / translation',family:'seq2seq',why:'An encoder–decoder provides an explicit source-to-target baseline. Decoder-only models are also candidates.',metric:'Factual support, coverage, human preference, and task quality; overlap scores are secondary diagnostics.'},
 generation:{name:'Open-ended generation / agents',family:'decoder',why:'A trained causal language model can generate continuations and tool-call representations; the application validates and executes actions.',metric:'Validated task completion, unsupported claims, tool semantics, policy constraints, and end-to-end cost.'},
 retrieval:{name:'Retrieval embeddings',family:'encoder',why:'Start with a model trained for useful retrieval representations. Architecture alone does not make pooled vectors a good search index.',metric:'Recall@k and ranking measures such as MRR or nDCG against a labeled relevance set.'}
};
function graphNode(x,y,w,label,sub,kind=''){
 return `<g class="family-node ${kind}"><rect x="${x}" y="${y}" width="${w}" height="68" rx="7"/><text x="${x+w/2}" y="${y+27}" text-anchor="middle">${label}</text><text class="family-node-sub" x="${x+w/2}" y="${y+47}" text-anchor="middle">${sub}</text></g>`;
}
function mobileFamilyDiagram(mode){
 const down=(x,y1,y2)=>`<path class="family-arrow" d="M${x} ${y1}V${y2-8}m-5-6 5 6 5-6"/>`;
 let inner;
 if(mode==='seq2seq'){
  inner=graphNode(12,16,136,'Source tokens','t₁ … tₙ')+down(80,84,124)+graphNode(12,124,136,'Encoder','Bidirectional')+graphNode(182,124,136,'Target prefix','y₁ … yₜ')+
   '<path class="family-cross" d="M80 192V211H139V240"/><text class="family-label" x="12" y="228">Cross-attention</text><path class="family-arrow" d="M250 192V219H206V232m-5-6 5 6 5-6"/>'+
   graphNode(90,240,160,'Decoder','Causal','accent')+down(170,308,355)+graphNode(90,355,160,'Next-token head','Predict yₜ₊₁');
 }else inner=graphNode(65,16,200,mode==='encoder'?'Input tokens':'Prompt + prefix','Illustrative token IDs')+down(165,84,128)+graphNode(65,128,200,mode==='encoder'?'Encoder':'Decoder',mode==='encoder'?'Bidirectional':'Causal','accent')+down(165,196,240)+graphNode(65,240,200,mode==='encoder'?'Task head':'Next-token head',mode==='encoder'?'Labels / vectors':'Generated token');
 return `<svg class="family-diagram-mobile" viewBox="0 0 330 ${mode==='seq2seq'?441:326}" role="img" aria-label="${familyData[mode].name} architecture: ${escape(familyData[mode].description)}">${inner}</svg>`;
}
function familyDiagram(mode){
 const arrow=(x1,y1,x2,y2)=>`<path class="family-arrow" d="M${x1} ${y1}H${x2-8}"/><path class="family-arrow" d="m${x2-14} ${y2-5} 6 5-6 5"/>`;
 let inner;
 if(mode==='seq2seq')inner=graphNode(18,23,185,'Source tokens','t₁ … tₙ')+arrow(203,57,258,57)+graphNode(258,23,204,'Encoder','Bidirectional')+`<path class="family-cross" d="M360 91V149"/><text class="family-label" x="374" y="125">Cross-attention</text>`+graphNode(18,150,185,'Target prefix','y₁ … yₜ')+arrow(203,184,258,184)+graphNode(258,150,204,'Decoder','Causal self-attention','accent')+arrow(462,184,503,184)+graphNode(503,150,180,'Next-token head','Predict yₜ₊₁');
 else inner=graphNode(18,40,183,mode==='encoder'?'Input tokens':'Prompt + prefix','Illustrative token IDs')+arrow(201,74,250,74)+graphNode(250,40,204,mode==='encoder'?'Encoder':'Decoder',mode==='encoder'?'Bidirectional':'Causal','accent')+arrow(454,74,503,74)+graphNode(503,40,180,mode==='encoder'?'Task head':'Next-token head',mode==='encoder'?'Labels / vectors':'Generated token');
 return `<svg class="family-diagram" viewBox="0 0 700 ${mode==='seq2seq'?244:144}" role="img" aria-label="${familyData[mode].name} architecture: ${escape(familyData[mode].description)}">${inner}</svg>`+mobileFamilyDiagram(mode);
}
function attentionMask(mode,row){
 const grid=(label,causal)=>`<div class="attention-example"><h4>${label}</h4><div class="attention-grid" role="img" aria-label="${label}: query ${row+1} can attend to ${causal?'positions 1 through '+(row+1):'all four positions'}">${Array.from({length:16},(_,i)=>{const r=Math.floor(i/4),c=i%4,allowed=!causal||c<=r;return `<span class="attention-cell ${allowed?'allowed':''} ${r===row?'selected-query':''}" aria-hidden="true">${r===row?(allowed?'●':'×'):''}</span>`;}).join('')}</div></div>`;
 return mode==='seq2seq'?grid('Encoder self-attention',false)+grid('Decoder self-attention',true)+grid('Decoder → source',false):grid(mode==='encoder'?'Input self-attention':'Prefix self-attention',mode==='decoder');
}
function renderArchitecture(mount){
 const id='family-'+(++sequence);let mode='encoder',task='ner',query=2;
 mount.classList.add('architecture-explorer');
 mount.innerHTML=`<div class="research-lab-head"><div><span class="tag">Architecture explorer</span><h3>Same transformer idea. Different information flow.</h3></div><span class="research-scope">Conceptual · no model loaded</span></div><div class="family-tabs" aria-label="Model architecture">${Object.entries(familyData).map(([key,d])=>`<button class="pill" data-family="${key}" aria-pressed="${key===mode}">${d.name}</button>`).join('')}</div><div class="family-content"></div><div class="task-choice"><label for="${id}-task">What does the task need to produce?</label><select id="${id}-task" data-task-choice>${Object.entries(taskData).map(([key,d])=>`<option value="${key}">${d.name}</option>`).join('')}</select><div class="task-rationale" aria-live="polite"></div></div>`;
 const update=()=>{
  const d=familyData[mode];mount.querySelectorAll('[data-family]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.family===mode)));
  mount.querySelector('.family-content').innerHTML=`<div class="family-intro"><div><h4>${d.title}</h4><p>${d.description}</p></div><span class="family-examples">${d.model}</span></div><div class="family-diagram-scroll" tabindex="0" role="region" aria-label="Model architecture diagram">${familyDiagram(mode)}</div><div class="attention-layout"><div><h4>Inspect the attention mask</h4><p>Rows are queries; columns are available keys. Select a query position.</p><div class="query-buttons" aria-label="Query position">${[0,1,2,3].map(i=>`<button data-query="${i}" aria-pressed="${query===i}" aria-label="Query position ${i+1}">t${i+1}</button>`).join('')}</div><p class="attention-explanation">${d.attention}</p></div><div class="attention-masks">${attentionMask(mode,query)}</div></div><div class="family-facts"><div><span class="tag">Output</span><p>${d.output}</p></div><div><span class="tag">Training</span><p>${d.training}</p></div></div><div class="related-links">${link('Architecture paper ↗',d.source)}${link('My public model examples ↗','https://huggingface.co/Jorgeutd')}</div>`;
  mount.querySelectorAll('[data-query]').forEach(b=>b.onclick=()=>{query=Number(b.dataset.query);update();mount.querySelector(`[data-query="${query}"]`).focus();});
  const t=taskData[task];mount.querySelector('.task-rationale').innerHTML=`<strong>Starting point: ${familyData[t.family].name}</strong><p>${t.why}</p><p><b>Evaluate:</b> ${t.metric}</p><small>Compare trained checkpoints under the same quality, latency, and memory requirements. This is a starting point, not a measured winner.</small>`;
 };
 mount.querySelectorAll('[data-family]').forEach(b=>b.onclick=()=>{mode=b.dataset.family;update();});
 mount.querySelector('[data-task-choice]').onchange=e=>{task=e.target.value;mode=taskData[task].family;update();};update();
}

function choose(n,k){if(k<0||k>n)return 0;let result=1;for(let i=1;i<=k;i++)result=result*(n-i+1)/i;return result;}
function reliability(counts,n,k){
 if(!Number.isInteger(n)||!Number.isInteger(k)||n<1||k<1||k>n||!counts.length||counts.some(c=>!Number.isInteger(c)||c<0||c>n))throw Error('Invalid trial counts');
 const den=choose(n,k),mean=arr=>arr.reduce((a,b)=>a+b,0)/arr.length;
 return {passAt:mean(counts.map(c=>1-choose(n-c,k)/den)),passAll:mean(counts.map(c=>choose(c,k)/den)),passOne:mean(counts.map(c=>c/n))};
}
const tasks=['Direct lookup','Combine two sources','Conflicting evidence','Missing citation','Ambiguous request','Tool timeout','Appropriate abstention','Multi-step question'];
const variants={
 single:{name:'Single-agent baseline',counts:[4,3,2,3,0,2,4,2],tokens:0,time:0,explain:'One agent retrieves, writes, and checks its answer. This fictional baseline establishes an outcome and operating-cost reference.'},
 reviewer:{name:'Team + reviewer',counts:[3,4,3,1,1,1,3,2],tokens:630,time:410,explain:'A fictional reviewer recovers some failures but also changes valid answers. Its added calls increase token use and wall time in this fixture.'},
 gated:{name:'Team + evidence gate',counts:[4,4,3,3,1,2,4,3],tokens:790,time:540,explain:'This illustrative variant retains evidence at handoff and checks the final artifact. Its stronger results are chosen teaching data, not evidence that this design always wins.'}
};
function trialsFor(mode){const d=variants[mode];return d.counts.map((count,t)=>Array.from({length:4},(_,i)=>({success:(i+t)%4<count,tokens:780+t*90+i*35+d.tokens,ms:900+t*180+i*110+d.time+(t===5?1500:0)})));}
const metricContracts=[
 ['Validated task success','Successful final outcomes / attempted tasks. Include required policy constraints.','A response says “updated,” but the test record is unchanged: final-state failure.'],
 ['Tool correctness','Check tool choice, argument semantics, authorization, and the resulting state separately.','18 of 20 arguments can be schema-valid while two still refer to the wrong record.'],
 ['Grounding','Supported factual claims / factual claims checked; separately measure citation coverage.','8 of 10 checked claims are supported. A link beside every claim would not make that 100%.'],
 ['Handoff completeness','Preserved required fields / required fields expected at handoff. Add semantic validation.','27 of 30 required fields survive. Verify that source IDs still point to the evidence.'],
 ['Coordination contribution','Compare final success with the same system minus one role, under a stated budget.','Track corrected failures and spoiled successes, plus duplicate actions and unfinished milestones.'],
 ['Efficiency per valid result','Include generation, review, failures, and retries in the resource numerator.','Total operating spend / validated completions; also report p50/p95 wall-clock latency.']
];
function renderEvaluation(mount){
 const id='agent-eval-'+(++sequence);let mode='single',k=2,selected=0;
 mount.classList.add('agent-evaluation-lab');
 mount.innerHTML=`<div class="research-lab-head"><div><span class="tag">Agent evaluation workbench</span><h3>Occasional success and consistency are different.</h3></div><span class="research-scope">8 tasks × 4 synthetic trials</span></div><p class="lab-introduction">Compare three invented systems on the same task names. Outcomes and resource records are fixtures; the metrics are computed from those records.</p><div class="research-controls"><label for="${id}-system">System variant<select id="${id}-system" data-agent-variant>${Object.entries(variants).map(([key,d])=>`<option value="${key}">${d.name}</option>`).join('')}</select></label><label for="${id}-k">Attempts, k <output data-attempt-label>2</output><input id="${id}-k" data-attempts type="range" min="1" max="4" step="1" value="2"></label></div><p class="variant-explanation"></p><div class="agent-metrics" aria-live="polite"></div><div class="trial-layout"><div class="trial-list" aria-label="Inspect synthetic task trials"></div><div class="trial-inspector" aria-live="polite"></div></div><details class="research-details"><summary>Metric definitions and calculation</summary><p>For each task with c successes in n trials, average these estimates over tasks:</p><pre class="code-block">pass@k = mean(1 − C(n − c, k) / C(n, k))
pass^k = mean(C(c, k) / C(n, k))</pre><p>pass@k asks whether at least one trial succeeds. pass^k asks whether all k succeed. The combinatorial estimates assume repeated identically distributed, independent trials. Four trials are deliberately small; they are not a reliability certificate.</p><p>The p95 uses the nearest-rank rule over 32 durations. Token totals include unsuccessful runs and the fixture’s review overhead. Tokens per valid completion are a volume measure, not a dollar estimate. These variants use different budgets.</p>${link('Read the metric definition in τ-bench ↗','https://arxiv.org/abs/2406.12045')}</details><div class="metric-contracts"><h4>A scorecard for the actual workflow</h4><p>Example contracts I would adapt to a task. These are separate diagnostics, not a standardized composite score.</p><div class="metric-contract-grid">${metricContracts.map(([title,definition,example])=>`<article><h5>${title}</h5><p>${definition}</p><small>${example}</small></article>`).join('')}</div></div><div class="related-links">${link('Inspect trace structure →','#demos/tracing')}${link('Explore my public agent benchmark ↗','https://github.com/jorgeutd/local-agent-bench')}</div>`;
 const update=()=>{
  const data=trialsFor(mode),all=data.flat(),m=reliability(variants[mode].counts,4,k),success=all.filter(r=>r.success).length,tokens=all.reduce((a,r)=>a+r.tokens,0),durations=all.map(r=>r.ms).sort((a,b)=>a-b),p95=durations[Math.ceil(.95*durations.length)-1];
  mount.querySelector('[data-attempt-label]').textContent=k;mount.querySelector('.variant-explanation').textContent=variants[mode].explain;
  mount.querySelector('.agent-metrics').innerHTML=[['Completion',`${success} / 32`,`${(m.passOne*100).toFixed(1)}% validated trials`,'completion'],[`pass@${k}`,`${(m.passAt*100).toFixed(1)}%`,'At least one succeeds','pass-at'],[`pass^${k}`,`${(m.passAll*100).toFixed(1)}%`,'All attempts succeed','pass-all'],['p95 duration',`${(p95/1000).toFixed(2)} s`,'32 fictional wall times','latency'],['Tokens / valid trial',Math.round(tokens/success).toLocaleString('en-US'),'Includes failed-run token use','efficiency']].map(([name,value,caption,key])=>`<div class="agent-metric" data-agent-metric="${key}"><span>${name}</span><strong>${value}</strong><small>${caption}</small></div>`).join('');
  mount.querySelector('.trial-list').innerHTML=`<div class="trial-list-head"><span>Task</span><span>Four recorded trials</span></div>${data.map((rows,t)=>`<button class="trial-task" data-trial-task="${t}" aria-pressed="${t===selected}"><span>${tasks[t]}</span><span class="trial-markers">${rows.map(r=>`<i class="${r.success?'trial-pass':'trial-fail'}" aria-label="${r.success?'Pass':'Fail'}">${r.success?'✓':'×'}</i>`).join('')}</span></button>`).join('')}`;
  const row=data[selected],one=reliability([variants[mode].counts[selected]],4,k);
  mount.querySelector('.trial-inspector').innerHTML=`<span class="tag">Inspect one task</span><h4>${tasks[selected]}</h4><p>${variants[mode].counts[selected]} successes in 4 trials.</p><dl><div><dt>pass@${k}</dt><dd>${(one.passAt*100).toFixed(1)}%</dd></div><div><dt>pass^${k}</dt><dd>${(one.passAll*100).toFixed(1)}%</dd></div></dl><div class="trial-records">${row.map((r,i)=>`<p><b>Trial ${i+1} · ${r.success?'pass':'fail'}</b><span>${r.tokens.toLocaleString('en-US')} tokens · ${r.ms} ms</span></p>`).join('')}</div><small>“Pass” means the fictional final outcome meets the task contract. All records are synthetic.</small>`;
  mount.querySelectorAll('[data-trial-task]').forEach(b=>b.onclick=()=>{selected=Number(b.dataset.trialTask);update();mount.querySelector(`[data-trial-task="${selected}"]`).focus();});
 };
 mount.querySelector('[data-agent-variant]').onchange=e=>{mode=e.target.value;update();};mount.querySelector('[data-attempts]').oninput=e=>{k=Number(e.target.value);update();};update();
}

function poolResult(recoverable,recovered,spoiled){
 if(![recoverable,recovered,spoiled].every(Number.isInteger)||recoverable<0||recoverable>20||recovered<0||recovered>recoverable||spoiled<0||spoiled>80)throw Error('Invalid selection counts');
 const final=80+recovered-spoiled,oracle=80+recoverable;
 return {final,oracle,gain:final-80,recoveryRate:recoverable?recovered/recoverable:null,spoilageRate:spoiled/80};
}
function renderPool(mount){
 const id='pool-'+(++sequence);mount.classList.add('model-pool-lab');
 mount.innerHTML=`<div class="research-lab-head"><div><span class="tag">Model-pool selection experiment</span><h3>Does the selector preserve the useful answers?</h3></div><span class="research-scope">100 invented cases</span></div><p class="lab-introduction">Model A is correct on 80 cases. Model B adds alternatives. Change what becomes available and what the selector actually keeps.</p><div class="pool-controls">${[['available','Baseline misses with a correct alternative',0,20,10],['recovered','Recoverable misses the selector fixes',0,10,5],['spoiled','Correct baseline answers the selector spoils',0,80,8]].map(([key,label,min,max,value])=>`<label for="${id}-${key}">${label}<output data-pool-label="${key}">${value}</output><input id="${id}-${key}" type="range" data-pool-control="${key}" min="${min}" max="${max}" value="${value}" step="1"></label>`).join('')}</div><div class="pool-results" aria-live="polite"></div><div class="pool-case-grid" role="img" aria-label="100 synthetic case outcomes"></div><div class="pool-legend"><span><i class="kept"></i>Baseline correct, kept</span><span><i class="recovered"></i>Recovered</span><span><i class="spoiled"></i>Spoiled</span><span><i class="missed"></i>Available, missed</span><span><i class="unavailable"></i>No correct candidate</span></div><div class="pool-diagnostics"></div><details class="research-details"><summary>What this experiment does and does not measure</summary><p>The oracle selects a correct candidate whenever one exists; it has the answer key. Actual accuracy uses the selector’s final answers. Both are computed on the same fixed 100 cases. The 80% baseline and all other numbers here are invented, not results from the paper.</p><p>Model B’s remaining candidates are implicit. A spoiled case means it supplies a wrong alternative that the selector chooses. The example isolates selection; it does not simulate generation, voting, token budgets, or model calls.</p></details><div class="related-links">${link('Read Mo’ Models, Mo’ Problems ↗','https://arxiv.org/abs/2609.17306')}${link('Evaluate the whole agent system →',noteURL('agent-evaluation'))}</div>`;
 const get=key=>mount.querySelector(`[data-pool-control="${key}"]`);
 const update=()=>{
  const available=Number(get('available').value);get('recovered').max=available;if(Number(get('recovered').value)>available)get('recovered').value=available;
  const recovered=Number(get('recovered').value),spoiled=Number(get('spoiled').value),m=poolResult(available,recovered,spoiled);
  for(const key of ['available','recovered','spoiled'])mount.querySelector(`[data-pool-label="${key}"]`).textContent=get(key).value;
  mount.querySelector('.pool-results').innerHTML=`<div class="pool-equation">80 <span>+</span> ${recovered} <span>−</span> ${spoiled} <span>=</span> <strong data-pool-final>${m.final}%</strong></div><div class="pool-bars">${[['Single model',80],['Oracle ceiling',m.oracle],['Selected answer',m.final]].map(([label,value])=>`<div><span>${label}</span><div class="pool-bar-track"><i style="width:${value}%"></i></div><b>${value}%</b></div>`).join('')}</div>`;
  const statuses=Array(80-spoiled).fill('kept').concat(Array(spoiled).fill('spoiled'),Array(recovered).fill('recovered'),Array(available-recovered).fill('missed'),Array(20-available).fill('unavailable'));
  mount.querySelector('.pool-case-grid').innerHTML=statuses.map((s,i)=>`<i class="${s}" title="Case ${i+1}: ${s}" aria-hidden="true"></i>`).join('');
  mount.querySelector('.pool-case-grid').setAttribute('aria-label',`${80-spoiled} kept, ${spoiled} spoiled, ${recovered} recovered, ${available-recovered} correct alternatives missed, ${20-available} cases without a correct candidate.`);
  mount.querySelector('.pool-diagnostics').innerHTML=`<p><strong>Net gain: ${m.gain>0?'+':''}${m.gain} percentage points.</strong> Recovery rate: ${m.recoveryRate===null?'N/A — no recoverable misses':(m.recoveryRate*100).toFixed(1)+'% of recoverable misses'}. Spoilage rate: ${(m.spoilageRate*100).toFixed(1)}% of the 80 correct baseline answers.</p>`;
 };mount.querySelectorAll('[data-pool-control]').forEach(input=>input.oninput=update);update();
}

function install(){
 const research=document.getElementById('view-research');
 research.querySelector('.page-intro p:last-child').textContent='Architecture families, model adaptation, and the evidence behind agent systems. Inspect a mechanism, work through an example, and read the primary research.';
 const section=document.createElement('section');section.className='research-architecture-section';
 section.innerHTML=`<div class="section-head"><div><span class="section-number">01 / MODEL ARCHITECTURES</span><h2>Encoder, decoder, or both?</h2><p>Choose the output you need, then inspect the information flow.</p></div>${link('Read the full guide →',noteURL('encoder-decoder'))}</div><div class="research-architecture-mount"></div>`;
 research.querySelector('.page-intro').after(section);renderArchitecture(section.querySelector('.research-architecture-mount'));
 const agents=document.createElement('section');agents.className='section research-agent-section';
 agents.innerHTML=`<div class="section-head"><div><span class="section-number">02 / AGENT SYSTEMS</span><h2>Evaluate the system you actually ship.</h2><p>Outcomes, coordination, and the selection decisions between model calls.</p></div></div><div class="research-reading-grid"><article><span class="tag">Evaluation / worked examples</span><h3>What changes when agents work together?</h3><p>Compare task success, pass@k, pass^k, handoff quality, and tokens per validated result.</p>${link('Open the evaluation workbench →',noteURL('agent-evaluation'))}</article><article><span class="tag">Paper spotlight / September 2026</span><h3>Mo’ Models, Mo’ Problems</h3><p>A correct candidate is only useful if the selector keeps it. Explore the gap between oracle and achieved accuracy.</p>${link('Read the paper explainer →',noteURL('model-pools'))}${link('Original paper ↗','https://arxiv.org/abs/2609.17306')}</article></div>`;
 section.after(agents);
}
window.PortfolioResearch={install,reliability,poolResult,mountWidget(type,mount){
 if(type==='encoder-decoder'){renderArchitecture(mount);return true;}
 if(type==='agent-evaluation'){renderEvaluation(mount);return true;}
 if(type==='model-pools'){renderPool(mount);return true;}
 return false;
}};
})();
