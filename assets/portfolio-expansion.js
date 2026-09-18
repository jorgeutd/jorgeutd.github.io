/* Public, self-contained walkthroughs. All demo records are invented fixtures. */
(() => {
'use strict';
const C = window.PORTFOLIO_CONTENT;
const el = id => document.getElementById(id);
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link = (label,url,cls='text-link') => `<a class="${cls}" href="${esc(url)}"${url.startsWith('https:')?' target="_blank" rel="noopener"':''}>${esc(label)}</a>`;
const button = (label,attrs='',cls='button') => `<button class="${cls}" ${attrs}>${esc(label)}</button>`;
const articleLink = (slug,label='Read the note →') => link(label,document.body.dataset.preview==='false'?'/notes/'+slug+'/':'#notes/'+slug);
const modelLink = m => 'https://huggingface.co/Jorgeutd/'+m.id;
const DEMOS={memory:['Inference memory','Understand the cache budget behind an inference workload.'],batching:['Batch scheduling','Compare two scheduling policies in a small, exact simulation.'],sampling:['Token sampling','Change a toy distribution and inspect what is retained.'],evaluation:['Evaluation & uncertainty','Explore decision thresholds and the uncertainty in a pass rate.'],tracing:['Trace explorer','Inspect synthetic runs, waiting, and a bounded retry.'],architecture:['System design atlas','Explore application architecture, inference serving, on-device execution, and model quantization.']};
const field = (name,value) => `<div class="inspector-field"><small>${esc(name)}</small><span>${esc(value)}</span></div>`;
const demoNote = 'Public research lab · synthetic inputs · browser calculations';
const publicProjects=[
 ['llm-inference-starters','Inference engines, made approachable.','Starter code and deployment recipes for vLLM, SGLang, llama.cpp, TensorRT-LLM, Ollama, and MLX.','Inference / deployment'],
 ['local-agent-bench','Can the model use the right tool?','A benchmark for tool calling, abstention, and structured outputs, with failure categories and uncertainty in the reports.','Evaluation / local models'],
 ['ondevice-llm-toolkit','Measure the local runtime.','A macOS-first CLI for benchmarking llama.cpp and managing GGUF models locally.','Device inference / tooling'],
 ['careflow-voice-agent','Voice, accessibility, and human handoff.','A realtime voice-agent project for senior-living appointment scheduling, accessibility support, and handoff.','Realtime agents / product']
];
function githubProjects(){return `<section class="section"><div class="section-head"><div><span class="section-number">OPEN SOURCE / GITHUB</span><h2>Go from the explanation to the code.</h2><p>Public projects across inference, evaluation, and agent applications.</p></div>${link('Visit my GitHub ↗','https://github.com/jorgeutd')}</div><div class="article-grid">${publicProjects.map(([repo,title,desc,tag])=>`<article class="article-card"><span class="tag">${tag}</span><h3>${title}</h3><p>${desc}</p><code class="fixture-note">${repo}</code>${link('Explore the repository ↗','https://github.com/jorgeutd/'+repo)}</article>`).join('')}</div></section>`;}
function addViews() {
 for(const [name,label] of [['demos','Interactive demos'],['models','Open models']]) {
  viewLabels[name]=label;
  if(!el('view-'+name)){const node=document.createElement('div');node.className='view';node.id='view-'+name;node.hidden=true;el('main').insertBefore(node,el('main').querySelector(':scope > footer'));}
 }
 const nav=el('sidebar').querySelector('nav');
 for(const [name,label,icon] of [['demos','Interactive demos','i-box'],['models','Open models','i-lab']]) {
  const a=document.createElement('a');a.className='nav-item';a.dataset.view=name;a.href='#'+name;
  a.innerHTML=`<svg fill="none" stroke="currentColor" aria-hidden="true"><use href="#${icon}"/></svg>${label}`;
  nav.append(a);
 }
 const home=document.createElement('section');home.className='heritage-section';
 home.innerHTML=`<div><span class="eyebrow">Open-source on Hugging Face</span><h2>Model work dating to 2021.</h2><p>Before today’s agent stacks: fine-tuning encoders, extracting entities, classifying emotion, and building summarizers. A public collection that connects years of model work to the systems I build now.</p>${link('Explore the model collection →','#models')}</div><div class="heritage-years">${link('2021 · BERT & RoBERTa','#models')}${link('2022 · NER & summarization','#models')}${link('2024 · SetFit, 50 shots per class','#models')}</div>`;
 el('view-overview').insertBefore(home,el('view-overview').lastElementChild);
 el('view-systems').insertAdjacentHTML('beforeend',githubProjects());
 el('view-overview').insertAdjacentHTML('beforeend',`<section class="section"><div class="section-head"><div><span class="section-number">THE CODE BEHIND THE WORK</span><h2>Explore my GitHub.</h2><p>Inference tooling, local-agent evaluation, training utilities, and realtime applications.</p></div>${link('GitHub ↗','https://github.com/jorgeutd')}</div><div class="research-topics">${publicProjects.slice(0,3).map(([repo])=>link(repo+' ↗','https://github.com/jorgeutd/'+repo,'pill')).join('')}</div></section>`);
 el('view-about').querySelector('.principles').insertAdjacentHTML('beforeend',`<div class="related-links">${link('GitHub ↗','https://github.com/jorgeutd')}${link('Models on Hugging Face ↗','https://huggingface.co/Jorgeutd')}</div>`);
 
   document.querySelectorAll('#view-overview a, #view-research a').forEach(a=>{
  const map={'https://jorgeutd.github.io/inference/':['inference','Explore inference →'],'https://jorgeutd.github.io/evals/':['evaluation','Explore evaluation →'],'https://jorgeutd.github.io/systems/':['system-design','Read the design note →'],'https://jorgeutd.github.io/deep-dives/':['model-mechanics','Open the deep dive →']};
  const target=map[a.getAttribute('href')];if(target){a.href='#notes/'+target[0];a.textContent=target[1];a.removeAttribute('target');a.removeAttribute('rel');}
 });
 const research=el('view-research');research.querySelector('.page-intro p:last-child').textContent='Mechanisms, worked examples, and the papers behind them. Explore transformer structure, compute cache payload, or continue into sampling, tracing, and evaluation.';
 research.querySelectorAll('.note .tag').forEach(n=>n.textContent='Interactive note');
  research.querySelector('.section-head h2').textContent='Follow the mechanism into a working example.';
 research.insertAdjacentHTML('beforeend',`<section class="section"><div class="section-head"><div><span class="section-number">READ / QUESTION / APPLY</span><h2>Papers behind the work.</h2><p>Primary sources, with a practical question to carry into each one.</p></div>${link('Browse the collection →','#notes')}</div><div class="paper-shelf">${C.papers.slice(0,4).map(paperCard).join('')}</div></section>`);
 document.querySelector('.concept-badge').textContent=document.body.dataset.preview==='false'?'APPLIED AI / SYSTEMS':'DESIGN CONCEPT · 02';
 document.querySelectorAll('#systems-list .work-row').forEach((row,i)=>{if(i<2){const key=['memory','evaluation'][i];const a=document.createElement('a');a.className='text-link';a.href='#demos/'+key;a.textContent='Explore the related lab →';row.querySelector('div').append(a);}});
 for(const item of C.articles)SEARCH_INDEX.push({title:item.title,description:item.category+' · '+item.deck,view:'notes/'+item.slug});
 for(const [key,value] of Object.entries(DEMOS))SEARCH_INDEX.push({title:value[0]+' demo',description:value[1],view:'demos/'+key});
 for(const [repo,title,desc] of publicProjects)SEARCH_INDEX.push({title:repo,description:title+' '+desc,view:'systems'});
 for(const m of C.models)SEARCH_INDEX.push({title:m.name,description:m.description,terms:m.id+' '+m.tags,view:'models'});
 SEARCH_INDEX.push({title:'Paper collection',description:'Dapper, HELM, Ragas, FlashAttention, PagedAttention, LoRA, QLoRA, RoPE, speculative decoding.',view:'notes'});
 window.PortfolioResearch.install();
}
function demoHeader(key) {
 const [title,desc]=DEMOS[key];
 const short={memory:'Memory',batching:'Scheduling',sampling:'Sampling',evaluation:'Evaluation',tracing:'Traces',architecture:'System design'};
 return `<header class="page-intro"><a class="text-link route-back" href="#demos">← All experiments</a><p class="eyebrow">Interactive demos</p><h1 class="route-title">${title}</h1><p>${desc}</p></header><nav class="demo-switch" aria-label="Choose an interactive demo">${Object.entries(DEMOS).map(([k,v])=>`<a class="pill" href="#demos/${k}" aria-label="${v[0]}" ${k===key?'aria-current="page"':''}>${short[k]}</a>`).join('')}</nav>`;
}
function demoGlyph(key){
 const glyphs={
  memory:[180,110,45].map((width,i)=>`<rect x="30" y="${12+i*26}" width="${width}" height="12" rx="2" fill="currentColor" opacity="${1-i*.22}"/>`).join(''),
  batching:[120,72,165].map((width,i)=>`<path d="M22 ${19+i*26}H222" stroke="currentColor" opacity=".15" stroke-width="12"/><path d="M22 ${19+i*26}h${width}" stroke="currentColor" stroke-width="12"/>`).join(''),
  sampling:[68,50,37,23,15,7].map((height,i)=>`<rect x="${28+i*32}" y="${82-height}" width="19" height="${height}" rx="2" fill="currentColor" opacity="${1-i*.12}"/>`).join(''),
  evaluation:'<path d="M25 44H218" stroke="currentColor" opacity=".18" stroke-width="13"/><path d="M95 44H190" stroke="currentColor" opacity=".5" stroke-width="13"/><path d="M151 24V64" stroke="currentColor" stroke-width="2"/><circle cx="151" cy="44" r="5" fill="currentColor"/>',
  tracing:'<path d="M30 16V71H70M30 43H92" stroke="currentColor" fill="none" opacity=".5"/><path d="M30 16H216M92 43H181M70 71H129" stroke="currentColor" stroke-width="10"/>',
  architecture:[0,1,2].map(row=>[0,1,2,3].map(col=>`<rect x="${17+col*60}" y="${8+row*28}" width="43" height="18" rx="3" fill="none" stroke="currentColor" opacity="${1-row*.25}"/>${col<3?`<path d="M${60+col*60} ${17+row*28}h17" stroke="currentColor" opacity=".4"/>`:''}`).join('')).join('')
 };return `<svg viewBox="0 0 250 90" aria-hidden="true">${glyphs[key]}</svg>`;
}
function renderDemos(key) {
 el('view-demos').dataset.demo=DEMOS[key]?key:'index';
 if(!DEMOS[key]){el('view-demos').innerHTML=`<header class="page-intro"><p class="eyebrow">Interactive demos</p><h1>Explore how AI systems work.</h1><p>Six browser experiments. Change the inputs, follow an execution, and inspect the result. Start with a mechanism or explore an entire system.</p></header><div class="demo-gallery">${Object.entries(DEMOS).map(([k,[title,desc]],i)=>`<a class="demo-card" href="#demos/${k}"><div class="demo-card-art">${demoGlyph(k)}</div><div class="demo-card-copy"><span class="tag">${String(i+1).padStart(2,'0')} / ${k==='architecture'?'Four system studies':'Interactive experiment'}</span><h2>${title}</h2><p>${desc}</p><span class="demo-card-link">${k==='architecture'?'Explore the atlas':'Open the experiment'} →</span></div></a>`).join('')}</div><p class="demo-gallery-note">These are original teaching examples using synthetic inputs and browser calculations. Related public repositories and primary sources are linked within each experiment.</p>`;return 'Interactive demos';}
 el('view-demos').innerHTML=demoHeader(key)+'<div id="demo-mount"></div>';renderPublicDemo(key,el('demo-mount'));return DEMOS[key][0];
}
function paperCard(p) {
 return `<article class="paper-item"><span class="tag">${esc(p[0])} · ${esc(p[2])}</span><h3>${esc(p[1])}</h3><p>${esc(p[3])}</p>${link('Read the primary source ↗',p[4])}${articleLink(p[5],'Related explainer →')}</article>`;
}
function renderNotes(slug) {
 const item=C.articles.find(a=>a.slug===slug);
 if(!item){
  el('view-notes').innerHTML=`<header class="page-intro"><p class="eyebrow">Engineering notes</p><h1>System design, inference, and evaluation.</h1><p>How I approach AI delivery: architecture, inference optimization, and evaluation. Start with a short engineering decision; explore the mechanism when you want the detail.</p></header><div class="actions">${link('Experience & roles →','#about')}${link('Public project studies →','#systems')}</div><div class="article-grid" id="notes-list">${C.articles.map(a=>`<article class="article-card"><span class="tag">${a.category}</span><h2>${a.title}</h2><p>${a.deck}</p>${articleLink(a.slug)}<div class="article-meta">${a.read}</div></article>`).join('')}</div><section class="section"><div class="section-head"><div><span class="section-number">PAPERS & ENGINEERING REFERENCES</span><h2>A reading shelf with a purpose.</h2><p>Foundations, serving, adaptation, evaluation, and distributed systems.</p></div></div><div class="filters" id="paper-filters" aria-label="Filter reading collection">${['All','Graphs','Agents','Foundations','Inference','Adaptation','Evaluation','Systems'].map((t,i)=>button(t,`data-paper-filter="${t}" aria-pressed="${i===0}"`,'pill')).join('')}</div><div class="results-count" id="paper-count" role="status">${C.papers.length} references</div><div class="paper-shelf" id="paper-shelf">${C.papers.map(paperCard).join('')}</div></section>`;
  document.querySelectorAll('[data-paper-filter]').forEach(b=>b.onclick=()=>{const results=C.papers.filter(p=>b.dataset.paperFilter==='All'||p[0]===b.dataset.paperFilter);document.querySelectorAll('[data-paper-filter]').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));el('paper-count').textContent=results.length+' references';el('paper-shelf').innerHTML=results.map(paperCard).join('');});
  return 'Engineering notes';
 }
 const sections=item.sections.map(([t,p,refs],i)=>`<section class="article-section" id="article-section-${i}"><h2>${esc(t)}</h2><p>${esc(p)}</p>${refs?'<div class="section-citations">'+refs.map(([label,url])=>link(label+' ↗',url)).join('')+'</div>':''}</section>${i===2?'<div class="article-widget" id="article-widget"></div>':''}`).join('');
 el('view-notes').innerHTML=`<header class="page-intro"><a class="text-link route-back" href="#notes">← All engineering notes</a><p class="eyebrow">${item.category}</p><h1 class="route-title">${item.title}</h1><p>${item.deck}</p><div class="article-meta"><span>Jorge Grisman</span><span>${item.read}</span><span>Engineering approach / worked examples</span></div></header><div class="article-layout"><article class="article-prose">${sections}<section class="source-box"><h2>Sources & scope</h2><ul>${item.sources.map(([t,u])=>`<li>${link(t+' ↗',u,'')}</li>`).join('')}</ul><p>${esc(item.sourceNote)}</p></section><div class="related-links">${link('← All engineering notes','#notes')}${link('Explore the demos →','#demos')}</div></article><aside class="article-aside"><strong>IN THIS NOTE</strong><p style="margin-top:16px">${item.sections.map(([t])=>esc(t.replace(/^\d+ \/ /,''))).join('<br><br>')}</p><strong>KEEP EXPLORING</strong>${C.articles.filter(a=>a.slug!==item.slug).slice(0,3).map(a=>articleLink(a.slug,a.category+' →')).join('')}</aside></div>`;
 mountWidget(item.widget);return item.category+' / '+item.title;
}
function mountWidget(type) {
 const mount=el('article-widget');
 if(window.PortfolioSystems?.mountNote(type,mount))return;
 if(window.PortfolioResearch.mountWidget(type,mount))return;
 if(type==='architecture')renderGenericArchitecture(mount);
 if(type==='trace'){mount.innerHTML='<div id="trace-explorer"></div>';renderTrace('normal',0);}
 if(type==='evaluation')renderEvaluation(mount);
 if(type==='sampling')renderSampling(mount);
 if(type==='memory-link')mount.innerHTML=`<section class="decision-card"><span class="tag">Calculated / not benchmarked</span><h3>Change the context. See the payload.</h3><p>Explore sequence length, concurrent sequences, layer count, and KV precision in the memory lab.</p><div class="actions">${link('Open the interactive memory lab →','#research','button')}</div></section>`;
 if(type==='release')mount.innerHTML=`<section class="demo-frame"><div class="demo-body"><span class="tag">Proposed release record</span><div class="release-chain"><span>Artifact identity →</span><span>Contract →</span><span>Dataset revision →</span><span>Evaluator revision →</span><span>Review →</span><span>Rollout / rollback</span></div><p class="fixture-note">Each arrow is a traceable association. The application should be able to recover the versions that produced a specific output.</p>${link('Inspect a synthetic trace →','#demos/tracing')}</div></section>`;
}
function traceFixture(kind) {
 const make=(id,name,start,end,details,status='ok',depth=1)=>({id,name,start,end,details,status,depth,parent:depth?'run-root':null});
 if(kind==='retry')return [make('run-root','Agent request',0,1620,'One tool failure is retained alongside a bounded retry and the final result.','ok',0),make('run-tool-1','Tool · attempt 1',20,200,'Synthetic timeout. The attempt is recorded; it is not replaced by the later success.','error'),make('run-tool-2','Tool · attempt 2',480,800,'A second attempt uses the same idempotency key. The 280 ms gap represents an illustrative backoff.'),make('run-model','Model call',820,1580,'Prepared answer based on the successful synthetic tool response.'),make('run-validate','Validate output',1585,1610,'Required output fields are checked before return.')];
 const slow=kind==='slow',total=slow?2400:1100;
 return [make('run-root','Agent request',0,total,'A synthetic request with retrieval, model execution, and output validation.','ok',0),make('run-retrieve','Retrieve context',20,slow?1500:200,slow?'The synthetic retrieval span dominates this example. A total duration alone would hide that attribution.':'A small set of synthetic reference records is returned.'),make('run-model','Model call',slow?1520:220,slow?2280:980,'The prompt uses the retrieved context. Model and prompt revisions are retained with this span.'),make('run-validate','Validate output',slow?2290:990,slow?2340:1040,'A deterministic check verifies the prepared response shape.')];
}
function renderTrace(kind,selected) {
 const spans=traceFixture(kind),root=spans[0],span=spans[selected];
 el('trace-explorer').innerHTML=`<section class="demo-frame"><div class="demo-caption">Trace explorer · synthetic spans · illustrative timings</div><div class="trace-toolbar"><label for="trace-scenario" class="tag">Execution scenario</label><select class="full-select" id="trace-scenario">${[['normal','Normal path'],['slow','Slow retrieval'],['retry','Tool failure & retry']].map(([k,t])=>`<option value="${k}" ${k===kind?'selected':''}>${t}</option>`).join('')}</select></div><div class="trace-layout"><div class="trace-tree" aria-label="Trace span timeline">${spans.map((s,i)=>`<button class="trace-row" data-span="${i}" data-error="${s.status==='error'}" aria-pressed="${i===selected}"><span class="trace-name" style="--indent:${s.depth*10}px">${s.depth?'↳ ':''}${s.name}</span><span class="trace-bar" aria-hidden="true"><i style="left:${s.start/root.end*100}%;width:${(s.end-s.start)/root.end*100}%"></i></span><span class="trace-time">${s.end-s.start} ms</span></button>`).join('')}<p class="fixture-note">Timeline: 0–${root.end} ms. Select a span to inspect its identity and result. Durations include waiting and are not additive when spans overlap.</p></div><aside class="trace-detail" id="trace-detail" aria-live="polite"><h4>${span.name}</h4>${field('Span ID',span.id)}${field('Parent ID',span.parent||'Root span')}${field('Status',span.status)}${field('Duration',(span.end-span.start)+' ms · synthetic')}<p>${span.details}</p>${field('Identity','prompt.demo.v1 / model.fixture.v1')}</aside></div></section>`;
 el('trace-scenario').onchange=e=>{renderTrace(e.target.value,0);el('trace-scenario').focus();};
 document.querySelectorAll('[data-span]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.span);renderTrace(kind,i);focusCurrent('[data-span="'+i+'"]');});
}
const evaluationSamples=[{score:.96,label:1},{score:.91,label:1},{score:.86,label:1},{score:.80,label:0},{score:.72,label:1},{score:.61,label:0},{score:.55,label:1},{score:.47,label:1},{score:.39,label:0},{score:.30,label:0},{score:.18,label:1},{score:.07,label:0}];
function renderEvaluation(mount) {
 mount.innerHTML=`<section class="demo-frame"><div class="demo-caption">Threshold experiment · 12 synthetic examples · computed metrics</div><div class="demo-body"><h3>Move the decision boundary.</h3><p class="fixture-note">Positive when score ≥ threshold. Seven labeled positives and five negatives. Scores are illustrative, not calibrated probabilities.</p><div class="control"><label for="eval-threshold">Positive-class threshold <output id="eval-threshold-value">0.50</output></label><input type="range" id="eval-threshold" min="0" max="1" value=".5" step=".01"></div><div id="eval-results" aria-live="polite"></div><details><summary>Inspect the exact synthetic dataset</summary><pre class="code-block">${esc(evaluationSamples.map((s,i)=>`${String(i+1).padStart(2,'0')}  score=${s.score.toFixed(2)}  reference=${s.label}`).join('\n'))}</pre></details></div></section>`;
 el('eval-threshold').oninput=updateEvaluation;updateEvaluation();
}
function updateEvaluation() {
 const t=Number(el('eval-threshold').value);el('eval-threshold-value').textContent=t.toFixed(2);let tp=0,fp=0,tn=0,fn=0;
 for(const s of evaluationSamples){if(s.score>=t){if(s.label)tp++;else fp++;}else{if(s.label)fn++;else tn++;}}
 const pct=(a,b)=>b?(a/b*100).toFixed(1)+'%':'N/A';
 el('eval-results').innerHTML=`<div class="metrics"><div class="metric"><b id="eval-precision">${pct(tp,tp+fp)}</b><span>Precision · TP / (TP + FP)</span></div><div class="metric"><b id="eval-recall">${pct(tp,tp+fn)}</b><span>Recall · TP / (TP + FN)</span></div><div class="metric"><b id="eval-accuracy">${pct(tp+tn,12)}</b><span>Accuracy · correct / 12</span></div><div class="metric"><b>${tp+fp}</b><span>Predicted positives</span></div></div><div class="confusion-grid">${[['True positive',tp],['False positive',fp],['False negative',fn],['True negative',tn]].map(([n,v])=>`<div class="confusion-cell"><strong>${v}</strong><span>${n}</span></div>`).join('')}</div><div class="sample-dots">${evaluationSamples.map((s,i)=>{const pred=s.score>=t;return `<span class="sample-dot ${Number(pred)!==s.label?'error':''}" title="Example ${i+1}: reference ${s.label}, predicted ${Number(pred)}, score ${s.score}">${s.score.toFixed(2)}<small>${Number(pred)===s.label?'correct':'error'}</small></span>`;}).join('')}</div><p class="fixture-note">Outlined errors identify individual disagreements. “N/A” means the denominator is zero. These twelve cases cannot establish deployment readiness.</p>`;
}
function samplingDistribution(temp,k,p) {
 const raw=[3.2,2.4,1.7,.9,.2,-.6];const exps=raw.map(v=>Math.exp((v-raw[0])/temp));const sum=exps.reduce((a,b)=>a+b,0);
 let values=exps.map((v,i)=>i<k?v/sum:0);let total=values.reduce((a,b)=>a+b,0);values=values.map(v=>v/total);
 let mass=0;values=values.map(v=>{if(mass>=p)return 0;mass+=v;return v;});total=values.reduce((a,b)=>a+b,0);return values.map(v=>v/total);
}
function renderSampling(mount) {
 mount.innerHTML=`<section class="demo-frame"><div class="demo-caption">Sampling lab · six invented logits · exact probability calculation</div><div class="demo-body"><h3>Change the distribution.</h3><div class="sampling-controls"><div class="control"><label for="sample-temperature">Temperature <output id="sample-temperature-value">1.00</output></label><input id="sample-temperature" type="range" min=".1" max="2" step=".05" value="1"></div><div class="control"><label for="sample-k">Top-k <output id="sample-k-value">6</output></label><input id="sample-k" type="range" min="1" max="6" value="6"></div><div class="control"><label for="sample-p">Top-p <output id="sample-p-value">1.00</output></label><input id="sample-p" type="range" min=".1" max="1" step=".05" value="1"></div></div><div class="sampling-bars" id="sampling-bars" aria-live="polite"></div><p class="fixture-note">Toy vocabulary: “system”, “model”, “request”, “trace”, “cache”, “other”. Logits: [3.2, 2.4, 1.7, 0.9, 0.2, −0.6]. Filtering order: temperature → top-k → top-p → renormalize.</p><p class="fixture-note" id="sample-mass"></p></div></section>`;
 for(const id of ['sample-temperature','sample-k','sample-p'])el(id).oninput=updateSampling;updateSampling();
}
function updateSampling() {
 const t=Number(el('sample-temperature').value),k=Number(el('sample-k').value),p=Number(el('sample-p').value);el('sample-temperature-value').textContent=t.toFixed(2);el('sample-k-value').textContent=k;el('sample-p-value').textContent=p.toFixed(2);
 const values=samplingDistribution(t,k,p);el('sampling-bars').innerHTML=values.map((v,i)=>`<div class="sampling-row ${v===0?'excluded':''}"><span>${['system','model','request','trace','cache','other'][i]}</span><div class="bar-track"><div class="bar-fill" style="width:${v*100}%"></div></div><span>${(v*100).toFixed(1)}%</span></div>`).join('');el('sample-mass').textContent=values.filter(v=>v>0).length+' candidates retained · total probability '+values.reduce((a,b)=>a+b,0).toFixed(6)+'. Display percentages are rounded.';
}
function modelCard(m) {
 return `<article class="model-card"><span class="tag">${m.year} · ${m.task}</span><h2>${m.name}</h2><code>${m.id}</code><p>${m.description}</p><span class="fixture-note">${m.tags}</span><div class="model-links">${link('Model card ↗',modelLink(m))}${link('History · '+m.date+' ↗',modelLink(m)+'/commits/main')}</div></article>`;
}
function renderModels() {
 el('view-models').innerHTML=`<header class="page-intro"><p class="eyebrow">Open-source on Hugging Face</p><h1>Model work,<br>dating to 2021.</h1><p>Fine-tuned transformers for entity recognition, classification, and summarization, followed by few-shot learning with SetFit. Explore the model cards and repository history.</p></header><div class="model-history"><div><strong>2021</strong><p>Earliest repository history</p></div><div><strong>8</strong><p>Public models on the Hub</p></div><div><strong>6</strong><p>Selected models below</p></div></div><div class="filters" aria-label="Filter models by task">${['All','Classification','Entity recognition','Summarization','Few-shot learning'].map((n,i)=>button(n,`data-model-filter="${n}" aria-pressed="${i===0}"`,'pill')).join('')}</div><p class="results-count" id="model-count" role="status">6 models</p><div class="model-grid" id="model-grid">${C.models.map(modelCard).join('')}</div><div class="actions">${link('View all models on Hugging Face ↗','https://huggingface.co/Jorgeutd','button primary')}${articleLink('evaluation','How I approach evaluation →')}</div><details class="source-box collection-history"><summary>Collection history & sources</summary><p>The ADE repository’s commit history reaches 19 November 2021, followed by RoBERTa emotion work in December 2021. The dates on these cards refer to the earliest commits returned by the public repository histories, not a claim about when the repositories first became public. Model descriptions come from their cards and repositories; historical scores are not compared across different tasks.</p>${link('Inspect the earliest history ↗','https://huggingface.co/Jorgeutd/bert-base-uncased-ade-Ade-corpus-v2/commits/main')}</section>`;
 document.querySelectorAll('[data-model-filter]').forEach(b=>b.onclick=()=>{const filtered=C.models.filter(m=>b.dataset.modelFilter==='All'||m.task===b.dataset.modelFilter);document.querySelectorAll('[data-model-filter]').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));el('model-grid').innerHTML=filtered.map(modelCard).join('');el('model-count').textContent=filtered.length+' '+(filtered.length===1?'model':'models');});
 return 'Open models';
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-source-case]');if(b)showCase(b.dataset.sourceCase);});
document.querySelector('.skip').addEventListener('click',e=>{e.preventDefault();el('main').focus();window.scrollTo(0,0);});
let architectureTimer=null;
function stopArchitecture(){if(architectureTimer!==null)clearInterval(architectureTimer);architectureTimer=null;window.PortfolioAtlas?.stop();}
function focusCurrent(selector){document.querySelector(selector)?.focus({preventScroll:true});}
function renderPublicDemo(key,mount){
 const repo=key==='evaluation'?'local-agent-bench':(['memory','batching','sampling'].includes(key)?'llm-inference-starters':null);
 const shell=document.createElement('div');shell.id='public-lab';mount.append(shell);
 if(key==='memory')renderPublicMemory(shell);
 if(key==='sampling')renderSampling(shell);
 if(key==='batching')renderBatching(shell);
 if(key==='evaluation'){shell.innerHTML='<div id="confidence-lab"></div><div id="threshold-lab"></div>';renderConfidence(el('confidence-lab'));renderEvaluation(el('threshold-lab'));}
 if(key==='tracing'){shell.innerHTML='<div id="trace-explorer"></div>';renderTrace('normal',0);}
 if(key==='architecture')renderGenericArchitecture(shell);
 const note=document.createElement('div');note.className='related-links';note.innerHTML=(repo?link('Related public project: '+repo+' ↗','https://github.com/jorgeutd/'+repo):articleLink(key==='tracing'?'tracing':'system-design','Read the engineering approach →'))+link('All public repositories ↗','https://github.com/jorgeutd');mount.append(note);
}
function renderPublicMemory(mount){
 mount.innerHTML=`<section class="demo-frame"><div class="demo-caption">Inference memory / exact payload calculation</div><div class="demo-body"><h3>Budget the keys and values.</h3><p class="fixture-note">Conventional full-attention decoder: 32 layers, head dimension 128, two bytes per value. Compare 32, 8, and 1 KV heads.</p><div class="sampling-controls"><div class="control"><label for="public-context">Cached tokens <output id="public-context-value">4,096</output></label><input id="public-context" type="range" min="1024" max="32768" step="1024" value="4096"></div><div class="control"><label for="public-batch">Concurrent sequences <output id="public-batch-value">1</output></label><input id="public-batch" type="range" min="1" max="16" value="1"></div></div><div id="public-memory-results" class="metrics" aria-live="polite"></div><pre class="code-block">2 × layers × KV heads × head dimension
× cached tokens × sequences × bytes per value</pre><p class="fixture-note">Cache payload only. Weights, activations, allocator overhead, and runtime state also consume memory. The calculation does not establish model fit, speed, or quality.</p>${articleLink('inference','Read the complete explanation →')}</div></section>`;
 const update=()=>{const tokens=Number(el('public-context').value),n=Number(el('public-batch').value);el('public-context-value').textContent=tokens.toLocaleString('en-US');el('public-batch-value').textContent=n;el('public-memory-results').innerHTML=[['MHA',32],['GQA',8],['MQA',1]].map(([name,h])=>`<div class="metric"><b>${formatBytes(kvBytes(32,h,128,tokens,n,2))}</b><span>${name} · ${h} KV heads</span></div>`).join('');};el('public-context').oninput=update;el('public-batch').oninput=update;update();
}
function wilson(successes,n){const z=1.959963984540054,p=successes/n,den=1+z*z/n,center=(p+z*z/(2*n))/den,half=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/den;return [Math.max(0,center-half),Math.min(1,center+half)];}
function renderConfidence(mount){
 mount.innerHTML=`<section class="demo-frame"><div class="demo-caption">Evaluation / uncertainty in a synthetic pass rate</div><div class="demo-body"><h3>The same rate. Different evidence.</h3><p class="fixture-note">Each observation is an independent hypothetical pass/fail task. Change the number of trials and the observed pass rate to see a 95% Wilson interval.</p><div class="sampling-controls"><div class="control"><label for="confidence-n">Trials <output id="confidence-n-value">20</output></label><input id="confidence-n" type="range" min="5" max="500" step="5" value="20"></div><div class="control"><label for="confidence-rate">Target observed pass rate <output id="confidence-rate-value">80%</output></label><input id="confidence-rate" type="range" min="0" max="100" step="5" value="80"></div></div><div id="confidence-results" aria-live="polite"></div><p class="fixture-note">Successes are rounded to a whole count before calculation. Repeated attempts on the same task can be correlated; this simple interval does not account for clustering, dataset bias, or task coverage. It is not a release guarantee.</p>${link('Inspect the public benchmark ↗','https://github.com/jorgeutd/local-agent-bench')}</div></section>`;
 const update=()=>{const n=Number(el('confidence-n').value),rate=Number(el('confidence-rate').value),s=Math.round(n*rate/100),[lo,hi]=wilson(s,n);el('confidence-n-value').textContent=n;el('confidence-rate-value').textContent=rate+'%';el('confidence-results').innerHTML=`<div class="metrics"><div class="metric"><b>${s} / ${n}</b><span>Synthetic passed tasks</span></div><div class="metric"><b>${(s/n*100).toFixed(1)}%</b><span>Observed pass rate</span></div><div class="metric confidence-range"><b>${(lo*100).toFixed(1)}–${(hi*100).toFixed(1)}%</b><span>95% Wilson interval</span></div></div><div class="interval-track" aria-label="Interval from ${(lo*100).toFixed(1)} to ${(hi*100).toFixed(1)} percent"><span style="left:${lo*100}%;width:${(hi-lo)*100}%"></span><i style="left:${s/n*100}%"></i></div><div class="score-legend"><span>0%</span><span>100%</span></div>`;};el('confidence-n').oninput=update;el('confidence-rate').oninput=update;update();
}
const BATCH_WORKLOADS={mixed:[4,9,3,6,2,8],balanced:[6,6,6,6,6,6],longtail:[2,2,14,3,3,3]};
function scheduleWork(lengths,width,continuous){const records=[];if(!continuous){let start=0;for(let j=0;j<lengths.length;j+=width){const batch=lengths.slice(j,j+width);batch.forEach((len,k)=>records.push({id:j+k,start,end:start+len}));start+=Math.max(...batch);}return {records,total:start};}const ready=Array(width).fill(0);lengths.forEach((len,id)=>{const first=Math.min(...ready),slot=ready.indexOf(first);records.push({id,start:first,end:first+len});ready[slot]=first+len;});return {records,total:Math.max(...ready)};}
function renderBatching(mount){
 mount.innerHTML=`<section class="demo-frame"><div class="demo-caption">Scheduling / exact toy simulation / illustrative time units</div><div class="demo-body"><h3>What happens to an empty slot?</h3><p class="fixture-note">All six requests arrive at time zero. Each active request emits one token per step. Static batches wait for their longest request; continuous scheduling fills a slot as soon as it becomes free.</p><div class="sampling-controls"><div class="control"><label for="batch-workload">Output-length pattern</label><select id="batch-workload"><option value="mixed">Mixed lengths</option><option value="balanced">Equal lengths</option><option value="longtail">One long request</option></select></div><div class="control"><label for="batch-slots">Available slots <output id="batch-slots-value">3</output></label><input id="batch-slots" type="range" min="1" max="4" value="3"></div></div><div id="batch-results" aria-live="polite"></div><p class="fixture-note">This simulation excludes prefill, memory limits, context-dependent compute, kernel efficiency, and admission overhead. It explains scheduling; it is not a GPU throughput benchmark.</p>${articleLink('inference','Connect scheduling to the inference budget →')}</div></section>`;
 const update=()=>{const lengths=BATCH_WORKLOADS[el('batch-workload').value],width=Number(el('batch-slots').value);el('batch-slots-value').textContent=width;const a=scheduleWork(lengths,width,false),b=scheduleWork(lengths,width,true),max=Math.max(a.total,b.total);el('batch-results').innerHTML=`<p class="fixture-note">Output tokens: ${lengths.join(', ')}</p><div class="schedule-grid">${[['Static batches',a],['Continuous slots',b]].map(([name,result])=>`<section class="schedule-card"><h4>${name}</h4><strong>${result.total} steps</strong>${result.records.map(r=>`<div class="schedule-row"><span>R${r.id+1}</span><div class="schedule-track"><i style="left:${r.start/max*100}%;width:${(r.end-r.start)/max*100}%"></i></div><small>${r.start}–${r.end}</small></div>`).join('')}</section>`).join('')}</div>`;};el('batch-workload').onchange=update;el('batch-slots').oninput=update;update();
}
function renderGenericArchitecture(mount){window.PortfolioAtlas.render(mount);}

addViews();
window.renderPortfolioRoute=(name,detail)=>{stopArchitecture();for(const route of ['demos','notes','models'])if(name!==route)el('view-'+route).replaceChildren();if(name==='research'&&detail==='transformer')requestAnimationFrame(()=>document.getElementById('transformer-anatomy').scrollIntoView({block:'start'}));
 if(name==='demos')return renderDemos(detail);if(name==='notes')return renderNotes(detail);if(name==='models')return renderModels();};
navigate();
})();
