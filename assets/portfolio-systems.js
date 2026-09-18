/* Compact engineering stories with original, deterministic interactive examples. */
(()=>{
 'use strict';
 const M=window.SystemsTeaching,esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const labs={
  'inference-topology':['Inference topology','Compare latency and capacity under a fixed GPU budget. Change the workload and inspect the request path.'],
  'agent-recovery':['Agent recovery','Interrupt a worker after a tool commits. Follow the durable events, retry and final outcome.']
 };
 const ms=n=>Math.round(n).toLocaleString('en-US')+' ms';
 const jump=(text,url)=>`<a class="text-link" href="${url}">${text}</a>`;
 function note(type,mount){
  const slug=type==='inference-topology'?'inference-topology':type==='agent-recovery'?'agent-recovery':null;if(!slug)return false;
  mount.innerHTML=`<div class="systems-invite"><span class="tag">Explore the decision</span><h3>${slug==='inference-topology'?'Change the workload. Find the bottleneck.':'Lose a worker. Keep the outcome consistent.'}</h3><p>${slug==='inference-topology'?'Compare two layouts with the same GPU count and inspect where one request waits.':'Step through an ambiguous tool commit and compare retries with and without deduplication.'}</p>${jump('Open the interactive example →','/labs/'+slug+'/')}</div>`;return true;
 }
 function controls(){return `<div class="systems-controls">
  <label>Traffic mix<select data-sys-input="media"><option value="0">Text only</option><option value="50" selected>Half text / half images</option><option value="100">Images in every request</option></select></label>
  <label>Images per media request<input data-sys-input="images" type="range" min="1" max="12" value="6"><output data-sys-value="images">6</output></label>
  <label>Output tokens<select data-sys-input="tokens">${[32,128,512,2048].map(x=>`<option ${x===128?'selected':''}>${x}</option>`).join('')}</select></label>
  <label>Arrival interval<select data-sys-input="gap">${[40,80,300,1000].map(x=>`<option value="${x}" ${x===80?'selected':''}>${x} ms</option>`).join('')}</select></label>
  <label>Total GPUs<select data-sys-input="gpus">${[2,4,8].map(x=>`<option ${x===4?'selected':''}>${x}</option>`).join('')}</select></label>
  <label>Encoder GPUs in split layout<select data-sys-input="encoders"><option>1</option><option>2</option><option>3</option></select></label>
  <label>Embedding transfer<input data-sys-input="transfer" type="range" min="0" max="80" value="16" step="4"><output data-sys-value="transfer">16 ms</output></label>
  <label>LLM execution<select data-sys-input="acceleration"><option value="1">Baseline speed</option><option value="2">2× faster · hypothetical</option></select></label>
 </div>`;}
 function timeline(row,max){return `<div class="systems-waterfall" aria-label="Request ${row.id+1} timeline">${row.spans.filter(s=>s.end>s.start).map(s=>`<div class="systems-span"><span>${s.name}</span><div class="systems-track"><i class="phase-${s.name.toLowerCase().split(' ').pop()}" style="left:${(s.start-row.arrival)/max*100}%;width:${(s.end-s.start)/max*100}%"></i></div><b>${ms(s.end-s.start)}</b></div>`).join('')}<p class="fixture-note">Relative to arrival. First token ${ms(row.ttft)} · complete ${ms(row.latency)}.</p></div>`;}
 function inference(root){
  let config={...M.defaults},selected=15;
  root.innerHTML=`<section class="systems-lab" aria-label="Inference topology simulator"><div class="systems-cap"><span>01 / CAPACITY &amp; LATENCY</span><b>Computed teaching model</b></div><div class="systems-presets"><button data-sys-preset="media" class="pill">Image-heavy workload</button><button data-sys-preset="decode" class="pill">Long responses</button><button data-sys-preset="text" class="pill">Text-only traffic</button></div>${controls()}<div data-sys-results></div><details class="systems-contract"><summary>Assumptions, equations and exact request records</summary><p>32 deterministic requests; FIFO queues; one request at a time per worker; identical GPU capacity; no batching, KV reuse, network contention or cold starts. These are simulated milliseconds, not model benchmarks. The encoder split changes scheduling and placement; prefill and decode remain together. A reserved encoder GPU stays reserved even in the text-only experiment.</p><p>Encode = 25 ms × images. Prefill = (12 + 5 × images) / acceleration, with zero images for text. Decode = 1.6 ms × output tokens / acceleration. Transfer is charged only to image requests. First token arrives after prefill plus one decode step. A 2× LLM speed setting is a hypothetical service-time change; it establishes no quantization accuracy or hardware speedup.</p><p>p95 uses nearest rank over all 32 requests. The completion target is 1,000 ms from arrival, including queueing. A GPU budget alone is not a complete cost model. Every configuration should be re-evaluated with an actual serving engine, batching, realistic traffic and task-quality checks.</p><pre data-sys-records></pre>${jump('Read the compact engineering note →','/notes/inference-topology/')}</details></section>`;
  const lab=root.querySelector('.systems-lab');
  function update(){
   const result=M.inference(config),a=result.aggregated,b=result.separated;
   const max=Math.max(a.rows[selected].latency,b.rows[selected].latency),delta=(b.p95End/a.p95End-1)*100;
   lab.querySelector('[data-sys-results]').innerHTML=`<div class="systems-verdict" role="status"><strong>${Math.abs(delta)<.1?'The two layouts finish within 0.1%.':`The split layout has ${Math.abs(delta).toFixed(0)}% ${delta<0?'lower':'higher'} p95 completion latency.`}</strong><span>Same ${config.gpus}-GPU budget · ${config.count} requests · synthetic workload</span></div><div class="systems-compare">${[['aggregated','Shared workers',a,`${config.gpus} GPUs · each runs encode + prefill + decode`],['separated','Separate encoder pool',b,`${config.encoders} encoder + ${config.gpus-config.encoders} LLM GPUs · same total`]].map(([key,title,r,sub])=>`<section class="systems-topology" data-sys-layout="${key}"><div class="systems-topology-head"><span class="tag">${key==='aggregated'?'A / COMBINED':'B / SPLIT'}</span><h2>${title}</h2><p>${sub}</p></div><div class="systems-path">${(key==='aggregated'?['One queue','Encode → prefill → decode','Response']:['Media → encode → transfer','Text bypasses encoder','LLM queue → prefill → decode']).map((v,i)=>`<div><small>0${i+1}</small><b>${v}</b></div>`).join('')}</div><div class="systems-measures"><div><strong data-sys-metric="first">${ms(r.p95First)}</strong><span>p95 first token</span></div><div><strong data-sys-metric="end">${ms(r.p95End)}</strong><span>p95 completion</span></div><div><strong>${r.passed} / ${config.count}</strong><span>complete within 1 second</span></div></div></section>`).join('')}</div><div class="systems-trace-heading"><h3>Follow the same request.</h3><label>Request<select data-sys-request>${result.requests.map(r=>`<option value="${r.id}" ${r.id===selected?'selected':''}>${String(r.id+1).padStart(2,'0')} · ${r.media?'images':'text'} · arrives ${ms(r.arrival)}</option>`).join('')}</select></label></div><div class="systems-compare systems-timelines"><section><h4>Shared workers</h4>${timeline(a.rows[selected],max)}</section><section><h4>Separate encoder pool</h4>${timeline(b.rows[selected],max)}</section></div>`;
   lab.querySelector('[data-sys-records]').textContent=JSON.stringify({config,selectedRequest:{aggregated:a.rows[selected],separated:b.rows[selected]}},null,2);
   for(const k of ['images','transfer'])lab.querySelector(`[data-sys-value="${k}"]`).textContent=config[k]+(k==='transfer'?' ms':'');
  }
  function sync(){
   lab.querySelector('[data-sys-input="encoders"]').innerHTML=Array.from({length:config.gpus-1},(_,i)=>`<option>${i+1}</option>`).join('');
   lab.querySelectorAll('[data-sys-input]').forEach(el=>el.value=config[el.dataset.sysInput]);
  }
  lab.addEventListener('input',e=>{const k=e.target.dataset.sysInput;if(!k)return;config[k]=+e.target.value;if(k==='gpus'){config.encoders=Math.min(config.encoders,config.gpus-1);sync();}update();});
  lab.addEventListener('change',e=>{if(e.target.matches('[data-sys-request]')){selected=+e.target.value;update();lab.querySelector('[data-sys-request]').focus();}});
  lab.addEventListener('click',e=>{const p=e.target.closest('[data-sys-preset]')?.dataset.sysPreset;if(!p)return;config={...M.defaults,...({media:{media:100,images:12,tokens:32},decode:{media:50,images:2,tokens:2048},text:{media:0,tokens:128}}[p])};sync();update();});
  update();
 }
 function recovery(root){
  let state=M.recovery(),chosen=-1;
  root.innerHTML=`<section class="systems-lab" aria-label="Agent recovery simulator"><div class="systems-cap"><span>02 / EXECUTION &amp; RECOVERY</span><b>Synthetic events · no external calls</b></div><div class="recovery-toolbar"><button class="button primary" data-recover="step">Next step →</button><button class="button" data-recover="crash">Crash worker</button><button class="button" data-recover="resume">Recover worker</button><button class="button" data-recover="reset">Reset</button></div><div class="recovery-experiment"><button class="text-link" data-recover="ambiguous">Jump to a crash after the tool commits ↗</button><label><input type="checkbox" data-recovery-safe checked> Tool deduplicates a stable idempotency key</label><small>Changing this setting starts a fresh run.</small></div><div data-recovery-results></div><details class="systems-contract"><summary>Recovery contract and limits</summary><p>The browser simulates three independent state stores. Crashing clears the worker’s pending receipt; it preserves the session events and the external tool ledger. Reloading this page resets everything. No real persistence or model inference is involved.</p><p>The safe tool atomically stores a unique action key, payload and receipt with its write, then returns that receipt on a repeat delivery. That is a requirement on the tool implementation, not a property supplied by an agent framework. Production keys need an appropriate scope, payload-conflict checks and retention window. A real service also needs concurrency control for simultaneous recovery, bounded retries, deadlines and reconciliation when the destination cannot deduplicate.</p><p>Traces describe attempts; session events describe committed progress. The completed state validates the returned receipt, so duplicate effects can remain hidden without checking the external ledger. This example demonstrates why successful execution alone is an incomplete evaluation metric.</p>${jump('Read the compact engineering note →','/notes/agent-recovery/')}</details></section>`;
  const lab=root.querySelector('.systems-lab');
  function update(){
   const done=state.phase===7,phase=done?'Session completed':!state.alive?'Worker unavailable':M.steps[state.phase];
   if(chosen<0||chosen>=state.traces.length)chosen=state.traces.length-1;
   const selected=state.traces[chosen];
   lab.querySelector('[data-recovery-results]').innerHTML=`<div class="systems-verdict" role="status"><strong>${phase}${state.ledger.length>1?' · duplicate external write':''}</strong><span>${state.attempts} tool deliveries · ${state.ledger.length} external writes · ${state.events.length} durable events</span></div><div class="recovery-boundaries"><section><span class="tag">REPLACEABLE</span><h2>Worker ${state.worker}</h2><b>${state.alive?'Available':'Lost'}</b><p>${state.pending?'Receipt is in memory, awaiting persistence.':state.alive?'Progress is reconstructed from the session log.':'In-memory state was discarded.'}</p></section><section><span class="tag">DURABLE SESSION</span><h2>Event log</h2><b>${state.events.length} committed events</b><p>Intent and acknowledged results survive the simulated worker crash.</p></section><section class="${state.ledger.length>1?'recovery-warning':''}"><span class="tag">EXTERNAL SYSTEM</span><h2>Tool ledger</h2><b data-recovery-writes>${state.ledger.length} ${state.ledger.length===1?'write':'writes'}</b><p>${state.idempotent?'Repeated deliveries return the same receipt.':'Each delivery creates another report.'}</p></section></div><div class="recovery-records"><section><h3>Durable progress</h3><ol class="recovery-log">${state.events.map(e=>`<li><small>${String(e.sequence).padStart(2,'0')} · ${e.time} ms</small><b>${e.kind}</b><span>${esc(e.detail)}</span></li>`).join('')||'<li>No events yet. Start the request.</li>'}</ol></section><section><h3>Execution trace</h3><div class="recovery-spans">${state.traces.map((t,i)=>`<button data-recovery-span="${i}" aria-pressed="${i===chosen}" class="${t.status==='error'?'recovery-error':''}"><span>${t.name}</span><small>W${t.worker} · ${t.end-t.start} ms</small></button>`).join('')||'<p class="fixture-note">Step through the run to collect a trace.</p>'}</div><div class="recovery-inspector">${selected?`<span class="tag">trace-042 / ${selected.id}</span><h4>${selected.name}</h4><p>${esc(selected.detail)}</p><small>Worker ${selected.worker} · ${selected.start}–${selected.end} ms · ${selected.status}</small>`:'<p>Select a span to inspect its outcome.</p>'}</div></section></div><details class="recovery-ledger"><summary>Inspect external receipts (${state.ledger.length})</summary><pre>${esc(JSON.stringify(state.ledger,null,2))}</pre></details>`;
   lab.querySelector('[data-recover="step"]').disabled=!state.alive||done;
   lab.querySelector('[data-recover="crash"]').disabled=!state.alive||state.phase===0||done;
   lab.querySelector('[data-recover="resume"]').disabled=state.alive;
   lab.querySelector('[data-recover="step"]').textContent=done?'Complete':'Next: '+M.steps[state.phase]+' →';
  }
  lab.addEventListener('click',e=>{
   const row=e.target.closest('[data-recovery-span]');if(row){chosen=+row.dataset.recoverySpan;update();lab.querySelector(`[data-recovery-span="${chosen}"]`).focus();return;}
   const action=e.target.closest('[data-recover]')?.dataset.recover;if(!action)return;
   if(action==='reset')state=M.recovery(state.idempotent);
   else if(action==='ambiguous'){state=M.recovery(state.idempotent);for(let i=0;i<4;i++)state=M.advance(state,'step');state=M.advance(state,'crash');}
   else state=M.advance(state,action);
   chosen=-1;update();
  });
  lab.addEventListener('change',e=>{if(e.target.matches('[data-recovery-safe]')){state=M.recovery(e.target.checked);chosen=-1;update();}});
  update();
 }
 function render(slug){
  const root=document.getElementById('view-lab'),[title,deck]=labs[slug];
  root.innerHTML=`<header class="page-intro systems-lab-header">${jump('← Engineering notes','/#notes')}<p class="eyebrow">Applied engineering / interactive example</p><h1>${title}</h1><p>${deck}</p></header><div id="systems-lab-mount"></div><div class="systems-context"><p>How I approach AI delivery: make the system boundary explicit, test the failure case, and measure the outcome.</p>${jump('Experience & roles →','/#about')}${jump('Public engineering projects ↗','/#systems')}</div>`;
  (slug==='inference-topology'?inference:recovery)(root.querySelector('#systems-lab-mount'));return title;
 }
 function cards(){return `<div class="systems-new"><span class="section-number">RECENT ENGINEERING / 2026</span><div class="systems-new-grid">${Object.entries(labs).map(([slug,[title,deck]],i)=>`<article><small>${i?'RELIABLE AGENT DELIVERY':'INFERENCE & OPTIMIZATION'}</small><h2>${title}</h2><p>${deck}</p>${jump('Read the 3-minute note →','/notes/'+slug+'/')}${jump('Try the example ↗','/labs/'+slug+'/')}</article>`).join('')}</div></div>`;}
 const previous=window.renderPortfolioRoute;
 window.renderPortfolioRoute=(name,detail)=>{
  const value=previous(name,detail);
  if(name==='lab'&&labs[detail])return render(detail);
  if(name==='demos'&&!detail)document.querySelector('#view-demos .page-intro')?.insertAdjacentHTML('afterend',cards());
  return value;
 };
 Object.assign(window.PortfolioDelivery.LABS,labs);
 SEARCH_INDEX.push(...Object.entries(labs).map(([slug,[title,description]])=>({title,description,view:'lab/'+slug})));
 window.PortfolioSystems={mountNote:note};navigate();
})();
