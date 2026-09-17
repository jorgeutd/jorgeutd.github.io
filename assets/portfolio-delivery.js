/* Public project studies, durable lab routes, and optional local inference. */
(() => {
 'use strict';
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const source=(repo,revision,file)=>`https://github.com/jorgeutd/${repo}/blob/${revision}/${file}`;
 const CASE_STUDIES={
  'local-agent-bench':{
   title:'Can a smaller model still use the right tool?',repo:'local-agent-bench',revision:'e42c288e8cd4d1a7d66e93115b65426262ff8317',category:'Evaluation / public engineering study',
   deck:'A task-level evaluation harness for tool choice, argument correctness, abstention, and structured outputs—with uncertainty attached to the result.',
   flow:['Versioned YAML tasks','Model endpoint','Response scoring','Failure codes','Report + interval'],
   sections:[
    ['The constraint','A local agent needs to do more than generate quickly. It must select an appropriate tool, supply valid arguments, and avoid calling a tool when none is needed. Quantization and runtime changes can alter those behaviors independently of latency.'],
    ['The implementation','The public core suite contains 12 tasks: six tool-call cases, three no-tool cases, and three structured-output cases. The runner repeats each task, sends it through an OpenAI-compatible client, retains a score for each response, and aggregates stable failure-reason codes. The default three repetitions produce 36 attempts. This is a compact baseline suite; extending it with domain-specific cases is part of using the tool responsibly.'],
    ['The decisions','YAML keeps task definitions reviewable without changing the runner. Explicit scoring makes wrong tools, wrong arguments, unnecessary calls, invalid JSON, and schema failures visible. Wilson intervals put a small-sample pass rate in context; the comparison command uses a seeded independent-sample percentile bootstrap. Repeated attempts on the same task can be correlated, so attempt-level intervals are not a substitute for a task-level generalization study.'],
    ['Reproduce the workflow','Start a model endpoint with tool support, install the project, run the suite, and retain the run JSON alongside its report. For a quantization comparison, hold the task suite, prompt/template, runtime, sampling configuration, and hardware fixed. Record the model and tokenizer revision separately when the serving endpoint does not expose them.'],
    ['Evidence and limits','The linked code provides the task suite, scoring rules, aggregation, and tests. The README’s example percentages are illustrative output, not a verified model-quality benchmark. This portfolio does not claim that the suite certifies production readiness. A release evaluation also needs representative held-out tasks, policy checks, end-to-end traces, and operational failure cases.']
   ],
   command:'pip install -e ".[dev]"\nlabench run --base-url http://localhost:8080/v1 \\\n  --model YOUR_MODEL --out runs/baseline.json\nlabench report runs/baseline.json --out reports/baseline.md',
   evidence:[['Task definitions','tasks/core.yaml'],['Runner','src/labench/runner.py'],['Scoring rules','src/labench/scoring.py'],['Statistics','src/labench/stats.py'],['Scoring tests','tests/test_scoring.py']],lab:'/labs/evaluation/'
  },
  'llm-inference-starters':{
   title:'Make inference comparisons reproducible.',repo:'llm-inference-starters',revision:'37cd39edc8eebe03a73ba2b2b6e110088d9e8f5d',category:'Inference / public engineering study',
   deck:'Deployment recipes and a common streaming client that distinguish response latency, decoding rate, and the provenance of token counts.',
   flow:['Engine + model','Compatible endpoint','Streaming client','Timing + usage','Comparison report'],
   sections:[
    ['The constraint','Inference engines target different hardware, serving patterns, and operational constraints. A fast-looking demo is not enough to compare them: first-token latency, decode rate, context, token accounting, and deployment configuration must be made explicit.'],
    ['The implementation','The repository includes deployment recipes for six engines, a shared endpoint probe and benchmark client, and examples for streaming chat, structured outputs, and tool calling. Streaming parsing is separated from I/O. Timing calculation and aggregation live in small functions that can be tested without a model server.'],
    ['The decisions','Time to first content delta is measured from request start. Decode rate uses (completion tokens − 1) divided by the interval from first to last content delta. Server-reported token usage is preferred; a fallback to content-chunk counts is explicitly flagged because chunks and tokens are not interchangeable. The report uses the lower tail for a bad throughput outcome and the upper tail for a bad latency outcome.'],
    ['Reproduce the workflow','Choose a recipe compatible with your hardware, serve a pinned model, and probe the endpoint before benchmarking it. Keep prompt, output limit, concurrency, model/tokenizer, quantization, runtime version, and warm-up policy comparable. Save the complete environment with the report; a number without that context is difficult to reproduce.'],
    ['Evidence and limits','The linked parser, timing functions, and tests make the measurement contract inspectable. The README’s sample timings illustrate the report format; they are not measured results from this portfolio release. Client-observed timings include transport and streaming behavior. A complete serving evaluation should add realistic concurrent load, prefill/decode profiling, tail latency, memory use, and task-quality checks.']
   ],
   command:'pip install -e common/\nllmstart probe --base-url http://localhost:8080/v1\nllmstart bench --base-url http://localhost:8080/v1 \\\n  --model YOUR_MODEL --requests 5 --max-tokens 128',
   evidence:[['Timing contract','common/src/llmstart/metrics.py'],['Stream parsing','common/src/llmstart/streaming.py'],['Timing tests','common/tests/test_metrics.py'],['Parser tests','common/tests/test_streaming.py'],['Engine decisions','docs/choosing-an-engine.md']],lab:'/labs/memory/'
  }
 };
 const LABS={transformer:['Transformer anatomy','Follow a token through a computed decoder. Explore guided experiments, attention, residual streams, and sampling.'],pretrained:['Pretrained model lab','Inspect real token IDs and next-token logits from a pinned DistilGPT2 checkpoint running in your browser.'],memory:['Inference memory','Explore weight and KV-cache payload under explicit architectural assumptions.'],batching:['Batch scheduling','Compare static batches and continuous scheduling with an exact toy workload.'],sampling:['Token sampling','Inspect temperature, top-k, and probability mass.'],evaluation:['Evaluation & uncertainty','Explore decision thresholds, confidence intervals, and the limits of small samples.'],tracing:['Trace explorer','Inspect latency, retries, and failure boundaries in a synthetic execution trace.'],architecture:['System design atlas','Explore application, inference, on-device, and quantization architectures.']};
 const transformer=document.getElementById('transformer-anatomy');
 let disposePretrained=()=>{};
 viewLabels.lab='Interactive lab';viewLabels.work='Public project';
 function renderCase(slug){
  const c=CASE_STUDIES[slug],root=document.getElementById('view-work');
  if(!c){root.innerHTML='<header class="page-intro"><h1>Public project studies</h1><p>Inspect the implementation and its measurement contract.</p></header>'+cards();return 'Public project studies';}
  root.innerHTML=`<article class="case-study"><header class="page-intro"><a class="text-link" href="/#systems">← Selected systems</a><p class="eyebrow">${c.category}</p><h1>${c.title}</h1><p class="case-lead">${c.deck}</p><div class="actions"><a class="button primary" href="https://github.com/jorgeutd/${c.repo}" target="_blank" rel="noopener">Explore the repository ↗</a><a class="button" href="${c.lab}">Try the related lab →</a></div></header><div class="case-metadata"><span>Public source review · September 2026</span><span>Revision ${c.revision.slice(0,7)}</span><span>Independent portfolio project</span></div><div class="case-flow" aria-label="System flow">${c.flow.map((v,i)=>`${i?'<b aria-hidden="true">→</b>':''}<span>${v}</span>`).join('')}</div><div class="case-sections">${c.sections.map(([h,p],i)=>`<section><h2>${h}</h2><div><p>${p}</p>${i===3?`<pre><code>${esc(c.command)}</code></pre>`:''}${i===4?`<div class="case-source-links">${c.evidence.map(([name,file])=>`<a href="${source(c.repo,c.revision,file)}" target="_blank" rel="noopener">${name} ↗</a>`).join('')}</div>`:''}</div></section>`).join('')}</div></article>`;
  return c.repo;
 }
 function cards(){return `<div class="lab-directory-feature">${Object.entries(CASE_STUDIES).map(([slug,c])=>`<a href="/work/${slug}/"><span class="tag">${c.category}</span><h2>${c.title}</h2><p>${c.deck}</p><span class="text-link">Read the engineering study →</span></a>`).join('')}</div>`;}
 function renderLab(slug){
  const root=document.getElementById('view-lab');
  if(!['transformer','pretrained'].includes(slug))slug='transformer';
  const [title,desc]=LABS[slug];
  root.innerHTML=`<header class="page-intro standalone-lab-header"><a class="text-link" href="/#research">← Research &amp; Labs</a><p class="eyebrow">Interactive lab / ${slug==='transformer'?'Mechanisms':'Local inference'}</p><h1>${title}</h1><p>${desc}</p><div class="actions"><a class="button" href="/labs/${slug==='transformer'?'pretrained':'transformer'}/">${slug==='transformer'?'Run a pretrained model':'Explore the teaching decoder'} →</a><a class="text-link" href="/notes/encoder-decoder/">Architecture guide ↗</a></div></header>`;
  if(slug==='transformer')root.append(transformer);else disposePretrained=mountPretrained(root);
  return title;
 }
 function mountPretrained(root){
  const panel=document.createElement('section');panel.className='pretrained-lab';panel.setAttribute('aria-label','Pretrained browser model');
  panel.innerHTML=`<div class="pretrained-intro"><span class="tag">PRETRAINED / OPTIONAL DOWNLOAD</span><h2>Run DistilGPT2 in your browser.</h2><p>Compare the teaching decoder with an actual checkpoint. Load the model, enter a short prompt, and inspect its tokenization and next-token distribution.</p><div class="pretrained-specs"><span>82M parameters</span><span>6 blocks · 12 heads</span><span>Quantized ONNX · CPU / WebAssembly</span></div><p>First load downloads an approximately 85 MB model plus the browser runtime. Files are cached when your browser permits it. Prompts are processed locally. Desktop recommended.</p></div><div class="pretrained-body"><label for="pretrained-prompt">Prompt · up to 64 tokens</label><textarea id="pretrained-prompt" maxlength="400" rows="3">The purpose of an attention mechanism is</textarea><div class="pretrained-toolbar"><button class="button primary" data-pretrained-load>Load pretrained model</button><button class="button" data-pretrained-run disabled>Inspect next token →</button><button class="button" data-pretrained-append disabled>Append top token</button><button class="button" data-pretrained-cancel disabled>Stop &amp; unload</button></div><p class="pretrained-status" role="status">Ready to load. No model files downloaded yet.</p><progress class="pretrained-progress" max="100" value="0" hidden aria-label="Model file download progress"></progress><div class="pretrained-results" hidden></div></div><div class="pretrained-foot"><p>DistilGPT2 is an English text-completion model, not an instruction-tuned assistant. Its continuations can be inaccurate or biased. This mode exposes token IDs, logits, and probabilities; the teaching decoder’s attention maps are separate calculations.</p><p>Model revision <code>a41c104</code> · Transformers.js 3.8.1 · full-sequence forward pass · no server inference.</p><a href="https://huggingface.co/Xenova/distilgpt2/tree/a41c10485c18a64b6606729b6a082330cbd8f49e" target="_blank" rel="noopener">Pinned ONNX files ↗</a> · <a href="https://huggingface.co/distilbert/distilgpt2" target="_blank" rel="noopener">Model card &amp; license ↗</a></div>`;
  root.append(panel);const find=s=>panel.querySelector(s),status=find('.pretrained-status'),progress=find('progress'),prompt=find('textarea'),results=find('.pretrained-results');
  let worker=null,ready=false,busy=false,last=null,timer=null,temperature=1;
  const controls=()=>{find('[data-pretrained-load]').disabled=!!worker;find('[data-pretrained-run]').disabled=!ready||busy;find('[data-pretrained-append]').disabled=!ready||busy||!last||prompt.value!==last.text;find('[data-pretrained-cancel]').disabled=!worker;prompt.disabled=busy;};
  const stop=message=>{clearTimeout(timer);worker?.terminate();worker=null;ready=false;busy=false;progress.hidden=true;status.textContent=message||'Model unloaded. Cached files may be reused on the next load.';controls();};
  const timeout=()=>{clearTimeout(timer);timer=setTimeout(()=>{stop('The operation timed out. Try again on a desktop browser or a faster connection.');status.classList.add('is-error');},180000);};
  function probabilities(){
   if(!last)return;const vals=last.logits,max=Math.max(...vals)/temperature,sum=vals.reduce((s,v)=>s+Math.exp(v/temperature-max),0);let mass=0;
   find('.pretrained-probs').innerHTML=last.probabilities.map(r=>{const p=Math.exp(r.logit/temperature-max)/sum;mass+=p;return `<div class="pretrained-prob"><code>${esc(JSON.stringify(r.piece))}</code><span>${r.logit.toFixed(3)}</span><span><i style="width:${p*100}%"></i><b>${(p*100).toFixed(2)}%</b></span></div>`;}).join('');
   find('.pretrained-remaining').textContent=`Top 12 token mass: ${(mass*100).toFixed(2)}%. Remaining vocabulary: ${((1-mass)*100).toFixed(2)}%. Probabilities are normalized over all ${last.vocabularySize.toLocaleString()} tokens.`;
  }
  function display(data){last=data;results.hidden=false;temperature=1;results.innerHTML=`<h3>Tokenization → next-token scores</h3><div class="pretrained-token-list">${data.tokens.map(t=>`<span>${esc(JSON.stringify(t.piece))}<small>ID ${t.id}</small></span>`).join('')}</div><p class="pretrained-run-info">${data.tokens.length} input tokens · ${data.vocabularySize.toLocaleString()} vocabulary entries · forward pass ${Math.round(data.inferenceMs)} ms in this browser. Download and tokenization time excluded.</p><div class="pretrained-controls"><label>Temperature <input data-pretrained-temperature aria-label="Pretrained sampling temperature" type="range" min="0.2" max="2" value="1" step="0.1"><output>1.0</output></label></div><div class="pretrained-prob"><b>Decoded token</b><b>Logit</b><b>Probability</b></div><div class="pretrained-probs"></div><p class="pretrained-remaining"></p>`;probabilities();controls();}
  function run(){if(!ready||busy)return;const text=prompt.value;if(!text.trim()){status.textContent='Enter a short prompt first.';return;}busy=true;status.classList.remove('is-error');status.textContent='Computing the next-token distribution locally…';controls();timeout();worker.postMessage({type:'infer',text});}
  panel.addEventListener('click',e=>{
   if(e.target.closest('[data-pretrained-load]')){
    status.classList.remove('is-error');status.textContent='Loading the browser runtime and pinned model…';busy=true;progress.hidden=false;timeout();
    try{worker=new Worker('/assets/portfolio-pretrained-worker.js',{type:'module'});
     worker.onmessage=({data})=>{if(data.type==='progress'){progress.value=data.progress;status.textContent=`Downloading ${data.file}: ${data.progress}%`;}
      else if(data.type==='ready'){clearTimeout(timer);ready=true;busy=false;progress.hidden=true;status.textContent='Model loaded. Inspect a prompt to compute its next-token scores.';controls();}
      else if(data.type==='result'){clearTimeout(timer);busy=false;status.textContent='Forward pass complete. These are outputs from the pinned pretrained model.';display(data);}
      else if(data.type==='error'){clearTimeout(timer);busy=false;progress.hidden=true;status.classList.add('is-error');if(!ready)stop('Could not load the model. '+data.message);else{status.textContent=data.message;controls();}}};
     worker.onerror=()=>{stop('The browser runtime could not load. Check the connection and retry; the teaching lab is available without a model download.');status.classList.add('is-error');};
     worker.postMessage({type:'load'});controls();
    }catch{stop('Web Workers are unavailable in this browser. Try a current desktop browser.');status.classList.add('is-error');}
   }else if(e.target.closest('[data-pretrained-run]'))run();
   else if(e.target.closest('[data-pretrained-append]')&&last){prompt.value=last.text+last.probabilities[0].piece;run();}
   else if(e.target.closest('[data-pretrained-cancel]'))stop();
  });
  panel.addEventListener('input',e=>{if(e.target===prompt){last=null;results.hidden=true;controls();}if(e.target.hasAttribute('data-pretrained-temperature')){temperature=+e.target.value;e.target.nextElementSibling.textContent=temperature.toFixed(1);probabilities();}});
  controls();return ()=>{clearTimeout(timer);worker?.terminate();worker=null;};
 }
 const original=window.renderPortfolioRoute;
 window.renderPortfolioRoute=(name,detail)=>{
  disposePretrained();disposePretrained=()=>{};
  if(transformer&&transformer.parentElement!==document.getElementById('research-transformer-slot'))document.getElementById('research-transformer-slot').append(transformer);
  if(name!=='lab')document.getElementById('view-lab').replaceChildren();if(name!=='work')document.getElementById('view-work').replaceChildren();
  const result=original(name,detail);
  if(name==='lab')return renderLab(detail);if(name==='work')return renderCase(detail);
  if(name==='demos'){
   if(detail&&LABS[detail])document.querySelector('#view-demos .page-intro')?.insertAdjacentHTML('beforeend',`<div class="actions"><a class="text-link" href="/labs/${detail}/">Open this lab’s dedicated page ↗</a></div>`);
   else document.querySelector('#view-demos .page-intro')?.insertAdjacentHTML('afterend',`<div class="lab-directory-feature"><a href="/labs/transformer/"><span class="tag">Guided experiments</span><h2>Inside a transformer.</h2><p>Change a future token, compare attention heads, and inspect sampling.</p><span class="text-link">Explore the teaching decoder →</span></a><a href="/labs/pretrained/"><span class="tag">Optional pretrained mode</span><h2>Run a real checkpoint.</h2><p>Inspect DistilGPT2 tokenization and logits locally in your browser.</p><span class="text-link">Open the pretrained lab →</span></a></div>`);
  }
  return result;
 };
 document.getElementById('view-systems').querySelector('.page-intro').insertAdjacentHTML('afterend',cards());
 const slot=document.getElementById('research-transformer-slot');slot.insertAdjacentHTML('beforebegin','<div class="actions"><a class="button" href="/labs/transformer/">Open the dedicated transformer lab →</a><a class="text-link" href="/labs/pretrained/">Try pretrained inference ↗</a></div>');
 SEARCH_INDEX.push(...Object.entries(CASE_STUDIES).map(([slug,c])=>({title:c.repo+' · engineering study',description:c.deck,view:'work/'+slug})),{title:'Pretrained model lab',description:'DistilGPT2, real tokenization and logits in the browser.',view:'lab/pretrained'});
 window.PortfolioDelivery={LABS,CASE_STUDIES};navigate();
})();
