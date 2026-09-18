const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path');
const forbidden=/s3:\/\/|C:\\\\Users\\\\|x-amz-credential/i;
const screenshots=path.resolve('screenshots');fs.mkdirSync(screenshots,{recursive:true});
async function shot(page,testInfo,name){const fullPage=name==='home'||name.includes('full')||name.startsWith('atlas-');if(fullPage)await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(screenshots,testInfo.project.name+'-'+name+'.png'),fullPage});}
async function setRange(page,selector,value){await page.locator(selector).evaluate((node,v)=>{node.value=v;node.dispatchEvent(new Event('input',{bubbles:true}));},String(value));}
async function noOverflow(page){expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();}
test('homepage, copyright, public project links and top compatibility',async({page},info)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/#top');
 await expect(page.locator('#view-overview')).toBeVisible();await expect(page.locator('.hero h1')).toContainText('From fine-tuning');await expect(page.locator('.footer')).toContainText('© 2021–2026 Jorge Grisman');
 await expect(page.locator('.hero a[href="https://github.com/jorgeutd"]')).toBeVisible();await expect(page.locator('body')).not.toContainText('DESIGN CONCEPT');
 await noOverflow(page);await shot(page,info,'home');expect(errors).toEqual([]);
});
test('navigation drawer and search remain keyboard accessible',async({page,isMobile})=>{
 await page.goto('/');if(isMobile){await page.locator('#menu-toggle').click();await expect(page.locator('#shell')).toHaveJSProperty('inert',true);await page.locator('[data-view="demos"]').click();await expect(page.locator('#shell')).toHaveJSProperty('inert',false);}else await page.locator('[data-view="demos"]').click();
 await expect(page.locator('#view-demos')).toBeVisible();await page.keyboard.press('Control+k');await expect(page.locator('#search-dialog')).toBeVisible();await page.locator('#search-input').fill('local-agent-bench');await expect(page.locator('#search-results')).toContainText('local-agent-bench');await page.keyboard.press('Escape');await expect(page.locator('#search-dialog')).not.toBeVisible();
});
test('six public labs render without private project details or horizontal page overflow',async({page},info)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const key of ['memory','batching','sampling','evaluation','tracing','architecture']){await page.goto('/#demos/'+key);await expect(page.locator('#demo-mount')).not.toBeEmpty();expect(await page.locator('#view-demos').innerText()).not.toMatch(forbidden);await noOverflow(page);await shot(page,info,key);}
 expect(errors).toEqual([]);
});
test('memory and sampling calculations respond to their controls',async({page})=>{
 await page.goto('/#demos/memory');await expect(page.locator('#public-memory-results')).toContainText('2 GiB');await setRange(page,'#public-context','8192');await expect(page.locator('#public-memory-results')).toContainText('4 GiB');
 await page.goto('/#demos/sampling');await setRange(page,'#sample-k','1');await expect(page.locator('.sampling-row:not(.excluded)')).toHaveCount(1);await expect(page.locator('.sampling-row').first()).toContainText('100.0%');await expect(page.locator('#sample-mass')).toContainText('1.000000');
});
test('batch scheduling reflects the actual toy workload',async({page})=>{
 await page.goto('/#demos/batching');await expect(page.locator('.schedule-card').first()).toContainText('17 steps');await expect(page.locator('.schedule-card').nth(1)).toContainText('14 steps');await page.locator('#batch-workload').selectOption('balanced');await expect(page.locator('.schedule-card').first()).toContainText('12 steps');await expect(page.locator('.schedule-card').nth(1)).toContainText('12 steps');
});
test('uncertainty and decision threshold handle endpoints',async({page})=>{
 await page.goto('/#demos/evaluation');await expect(page.locator('#confidence-results')).toContainText('58.4–91.9%');await setRange(page,'#confidence-rate','100');await expect(page.locator('#confidence-results')).toContainText('83.9–100.0%');await setRange(page,'#eval-threshold','1');await expect(page.locator('#eval-precision')).toHaveText('N/A');await setRange(page,'#eval-threshold','0');await expect(page.locator('#eval-recall')).toHaveText('100.0%');
});
test('trace inspection distinguishes latency from a retry failure',async({page})=>{
 await page.goto('/#demos/tracing');await page.locator('#trace-scenario').selectOption('slow');await page.locator('[data-span="1"]').click();await expect(page.locator('#trace-detail')).toContainText('1480 ms');await page.locator('#trace-scenario').selectOption('retry');await page.locator('[data-span="1"]').click();await expect(page.locator('#trace-detail')).toContainText('error');
});
test('system atlas links architecture, playback, failure handling and trace inspection',async({page})=>{
 await page.goto('/#demos/architecture');await expect(page.locator('#architecture-map')).toBeVisible();await expect(page.locator('.atlas-node')).toHaveCount(16);await expect(page.locator('.atlas-lane')).toHaveCount(3);await page.locator('#architecture-play').click();await expect(page.locator('#architecture-play')).toHaveAttribute('aria-pressed','true');await expect(page.locator('#architecture-stage-value')).not.toHaveText('01 / 06');await page.locator('#architecture-scenario').selectOption('missing');await expect(page.locator('#architecture-status')).toContainText('No supporting evidence');await expect(page.locator('#architecture-play')).toHaveAttribute('aria-pressed','false');await expect(page.locator('.atlas-span')).toHaveCount(5);await expect(page.locator('#atlas-spans')).not.toContainText('Model serving');await page.locator('[data-span-index="3"]').click();await expect(page.locator('#atlas-inspector h3')).toHaveText('Retrieval & context');await expect(page.locator('[data-node="6"]')).toHaveAttribute('aria-pressed','true');
 const pending=page.waitForEvent('download');await page.locator('#architecture-download').click();const dl=await pending;expect(dl.suggestedFilename()).toBe('reference-architecture-application.svg');const text=fs.readFileSync(await dl.path(),'utf8');expect(text).toContain('FastAPI boundary');expect(text).not.toMatch(forbidden);
});

test('experience is easy to find and the portrait loads on desktop and mobile',async({page,isMobile},info)=>{
 await page.goto('/');
 await expect(page.locator('#sidebar nav .nav-item').nth(1)).toHaveAttribute('href','#about');
 await page.locator('.career-section').screenshot({path:path.join(screenshots,info.project.name+'-career.png')});
 await page.locator('.career-heading a').click();await expect(page.locator('#view-about')).toBeVisible();
 await expect(page.locator('[data-view="about"]')).toHaveAttribute('aria-current','page');
 const portrait=page.getByRole('img',{name:'Jorge Grisman',exact:true});await expect(portrait).toBeVisible();
 await expect.poll(()=>portrait.evaluate(img=>img.complete&&img.naturalWidth===480)).toBeTruthy();
 await noOverflow(page);await shot(page,info,'about-full');
 if(isMobile)await page.locator('#menu-toggle').click();
 await page.locator('#theme-toggle').click();
 if(isMobile)await page.locator('#scrim').click({position:{x:page.viewportSize().width-10,y:30}});
 await noOverflow(page);await shot(page,info,'about-dark-full');
 await page.goto('/notes/tracing/');if(isMobile)await page.locator('#menu-toggle').click();
 await page.locator('[data-view="about"]').click();await expect(page.locator('#view-about')).toBeVisible();
 await expect(portrait).toBeVisible();await noOverflow(page);
});

test('architecture explorer distinguishes attention visibility and task starting points',async({page,isMobile},info)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/#research');
 const lab=page.locator('#view-research .architecture-explorer');
 await expect(lab.locator('.attention-cell.selected-query.allowed')).toHaveCount(4);
 await lab.locator('[data-family="decoder"]').click();await lab.locator('[data-query="0"]').click();
 await expect(lab.locator('.attention-cell.selected-query.allowed')).toHaveCount(1);
 await expect(lab.locator('.attention-cell.selected-query:not(.allowed)')).toHaveCount(3);
 await lab.locator('[data-task-choice]').selectOption('summarization');await expect(lab.locator('[data-family="seq2seq"]')).toHaveAttribute('aria-pressed','true');
 await expect(lab.locator('.attention-grid')).toHaveCount(3);await expect(lab.locator('.attention-example').last().locator('.selected-query.allowed')).toHaveCount(4);
 await expect(lab.locator('.task-rationale')).toContainText('Factual support');await expect(lab.locator(isMobile?'.family-diagram-mobile':'.family-diagram')).toBeVisible();await noOverflow(page);await shot(page,info,'research-full');
 await lab.locator('[data-family="encoder"]').focus();await page.keyboard.press('Enter');await expect(lab.locator('[data-family="encoder"]')).toHaveAttribute('aria-pressed','true');expect(errors).toEqual([]);
});

test('agent reliability separates at-least-one success from all-attempt success',async({page},info)=>{
 await page.goto('/notes/agent-evaluation/');const lab=page.locator('#view-notes .agent-evaluation-lab');
 await expect(lab.locator('[data-agent-metric="completion"]')).toContainText('20 / 32');
 await lab.locator('[data-trial-task="1"]').click();await expect(lab.locator('.trial-inspector')).toContainText('3 successes in 4 trials.');
 await expect(lab.locator('.trial-inspector dd').nth(0)).toHaveText('100.0%');await expect(lab.locator('.trial-inspector dd').nth(1)).toHaveText('50.0%');
 await setRange(page,'#view-notes [data-attempts]',4);await expect(lab.locator('[data-agent-metric="pass-at"] strong')).toHaveText('87.5%');await expect(lab.locator('[data-agent-metric="pass-all"] strong')).toHaveText('25.0%');
 await lab.locator('[data-agent-variant]').selectOption('reviewer');await expect(lab.locator('[data-agent-metric="completion"]')).toContainText('18 / 32');
 await lab.locator('[data-agent-variant]').selectOption('gated');await expect(lab.locator('[data-agent-metric="completion"]')).toContainText('24 / 32');
 await noOverflow(page);await shot(page,info,'agent-evaluation-full');
 const edges=await page.evaluate(()=>[PortfolioResearch.reliability([0],4,2),PortfolioResearch.reliability([4],4,2)]);
 expect(edges[0]).toEqual({passAt:0,passAll:0,passOne:0});expect(edges[1]).toEqual({passAt:1,passAll:1,passOne:1});
});

test('model-pool experiment preserves outcome counts and handles no recoverable misses',async({page},info)=>{
 await page.goto('/notes/model-pools/');const lab=page.locator('#view-notes .model-pool-lab');await expect(lab.locator('[data-pool-final]')).toHaveText('77%');
 await expect(lab.locator('.pool-case-grid i')).toHaveCount(100);await expect(lab.locator('.pool-case-grid .spoiled')).toHaveCount(8);
 await setRange(page,'#view-notes [data-pool-control="available"]',0);await expect(lab.locator('[data-pool-control="recovered"]')).toHaveValue('0');await expect(lab.locator('.pool-diagnostics')).toContainText('N/A');
 await setRange(page,'#view-notes [data-pool-control="spoiled"]',80);await expect(lab.locator('[data-pool-final]')).toHaveText('0%');
 await setRange(page,'#view-notes [data-pool-control="available"]',20);await setRange(page,'#view-notes [data-pool-control="recovered"]',20);await setRange(page,'#view-notes [data-pool-control="spoiled"]',0);await expect(lab.locator('[data-pool-final]')).toHaveText('100%');
 await noOverflow(page);await shot(page,info,'model-pools-full');
});

test('new papers and research guides are linked and readable without JavaScript',async({page,browser},info)=>{
 await page.goto('/#notes');await expect(page.locator('#paper-count')).toHaveText('31 references');await page.locator('[data-paper-filter="Agents"]').click();await expect(page.locator('#paper-shelf .paper-item')).toHaveCount(4);
 await expect(page.locator('#paper-shelf a[href="https://arxiv.org/abs/2609.17306"]')).toBeVisible();await page.locator('#paper-shelf .paper-item').first().getByRole('link',{name:'Related explainer'}).click();await expect(page.locator('#view-notes h1')).toContainText('A better answer');
 await page.goto('/notes/encoder-decoder/');await expect(page.locator('#view-notes .architecture-explorer')).toBeVisible();await noOverflow(page);await shot(page,info,'encoder-decoder-full');
 const context=await browser.newContext({javaScriptEnabled:false,baseURL:test.info().project.use.baseURL||'http://127.0.0.1:4173'}),plain=await context.newPage();
 for(const slug of ['agent-evaluation','model-pools','encoder-decoder']){await plain.goto('/notes/'+slug+'/');await expect(plain.locator('#view-notes .article-section')).toHaveCount(5);await expect(plain.locator('#article-widget')).not.toBeEmpty();}
 await context.close();
});

test('all four architecture studies expose inspectable components and readable layouts',async({page},info)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));for(const study of ['application','inference','device','quantization']){await page.goto('/#demos/architecture/'+study);await expect(page.locator('[data-study="'+study+'"]')).toHaveAttribute('aria-pressed','true');await expect(page.locator('.atlas-node')).toHaveCount(16);await page.locator('#atlas-component').selectOption('14');await expect(page.locator('[data-node="14"]')).toHaveAttribute('aria-pressed','true');await expect(page.locator('#atlas-inspector dd')).toHaveCount(3);await page.locator('[data-channel-filter="telemetry"]').click();await expect(page.locator('.atlas-edge[data-channel="execution"]').first()).toHaveCSS('opacity','0.06');await page.locator('[data-channel-filter="all"]').click();await page.locator('#atlas-fit').click();expect(await page.locator('.atlas-map-scroll').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBeTruthy();await noOverflow(page);await page.locator('[data-node="0"]').focus();await page.keyboard.press('Enter');await expect(page.locator('[data-node="0"]')).toHaveAttribute('aria-pressed','true');await shot(page,info,'atlas-'+study);}
 expect(errors).toEqual([]);
});

test('device and quantization studies distinguish weight payload from KV payload',async({page})=>{
 await page.goto('/#demos/architecture/device');await expect(page.locator('#atlas-budget-results')).toContainText('3.26 GiB');await expect(page.locator('#atlas-budget-results')).toContainText('0.50 GiB');await page.locator('#atlas-bits').selectOption('8');await expect(page.locator('#atlas-budget-results')).toContainText('6.52 GiB');await expect(page.locator('#atlas-budget-results')).toContainText('0.50 GiB');await setRange(page,'#atlas-context','8192');await expect(page.locator('#atlas-budget-results')).toContainText('1.00 GiB');await page.locator('#architecture-scenario').selectOption('invalid');await expect(page.locator('#architecture-status')).toContainText('previous verified model');await expect(page.locator('.atlas-node.is-failed')).toHaveAttribute('data-node','14');await page.locator('[data-study="quantization"]').click();await page.locator('#architecture-scenario').selectOption('regression');await expect(page.locator('#architecture-status')).toContainText('Reject promotion');await expect(page.locator('.atlas-span')).toHaveCount(6);
});

test('demo directory and compact footer replace repeated marketing copy',async({page},info)=>{
 await page.goto('/#demos');await expect(page.locator('.demo-card')).toHaveCount(6);await noOverflow(page);await shot(page,info,'demo-gallery-full');await page.locator('.demo-card[href="#demos/architecture"]').click();await expect(page.locator('#architecture-map')).toBeVisible();for(const route of ['/#top','/#models','/#notes','/#systems','/#about']){await page.goto(route);await expect(page.locator('.footer')).toHaveCount(1);await expect(page.locator('.footer h2')).toHaveCount(0);await expect(page.locator('body')).not.toContainText("Let's build something that holds up.");await expect(page.locator('.footer-links a')).toHaveCount(3);await noOverflow(page);}await page.goto('/#models');await shot(page,info,'models-full');await page.locator('[data-model-filter="Few-shot learning"]').click();await expect(page.locator('#model-count')).toHaveText('1 model');
});

test('skip link stays concealed until focused and moves keyboard focus to content',async({page})=>{
 await page.goto('/#demos/architecture/device');await page.locator('#atlas-component').selectOption('8');await expect(page.locator('.skip')).toHaveCSS('opacity','0');await page.locator('.skip').focus();await expect(page.locator('.skip')).toHaveCSS('opacity','1');await page.keyboard.press('Enter');await expect(page.locator('#main')).toBeFocused();await expect(page.locator('.skip')).toHaveCSS('opacity','0');
});
test('dedicated article URLs work with and without JavaScript',async({page,browser},info)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));for(const slug of ['system-design','tracing','evaluation','inference','model-mechanics','release']){await page.goto('/notes/'+slug+'/');await expect(page.locator('#view-notes')).toBeVisible();await expect(page.locator('.article-section')).toHaveCount(5);await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://jorgeutd.github.io/notes/'+slug+'/');await noOverflow(page);}await page.goto('/notes/tracing/');await shot(page,info,'article');expect(errors).toEqual([]);
 const context=await browser.newContext({javaScriptEnabled:false,baseURL:test.info().project.use.baseURL||'http://127.0.0.1:4173'});const plain=await context.newPage();await plain.goto('/notes/tracing/');await expect(plain.locator('.article-section')).toHaveCount(5);await expect(plain.locator('#view-notes h1')).toContainText('A trace should explain');await context.close();
});
test('models, legacy labs and removed private artifact URLs',async({page,request},info)=>{
 await page.goto('/#models');await expect(page.locator('.model-card')).toHaveCount(6);await page.locator('[data-model-filter="Few-shot learning"]').click();await expect(page.locator('.model-card')).toHaveCount(1);await expect(page.locator('#model-grid')).toContainText('50 training examples per class');await noOverflow(page);await shot(page,info,'models');
 for(const route of ['/inference/','/deep-dives/','/systems/','/evals/'])expect((await request.get(route)).status()).toBe(200);
 expect((await request.get('/demos/architecture/')).status()).toBe(404);
});
test('published assets have no archived project identifiers',async({request})=>{
 for(const url of ['/','/assets/portfolio-content.js','/assets/portfolio-expansion.js','/notes/system-design/']){const response=await request.get(url);expect(response.ok()).toBeTruthy();expect(await response.text()).not.toMatch(forbidden);}
});
test('theme persists across article navigation and page focus has no decorative border',async({page,isMobile},info)=>{
 await page.goto('/');await expect(page.locator('#main')).toHaveCSS('outline-style','none');if(isMobile)await page.locator('#menu-toggle').click();await page.locator('#theme-toggle').click();if(isMobile)await page.locator('#scrim').click({position:{x:page.viewportSize().width-10,y:30}});await expect(page.locator('html')).toHaveAttribute('data-theme','dark');await page.goto('/notes/evaluation/');await expect(page.locator('html')).toHaveAttribute('data-theme','dark');await noOverflow(page);await shot(page,info,'dark-article');
});
