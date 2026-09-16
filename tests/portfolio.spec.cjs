const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path');
const forbidden=/s3:\/\/|C:\\\\Users\\\\|x-amz-credential/i;
const screenshots=path.resolve('screenshots');fs.mkdirSync(screenshots,{recursive:true});
async function shot(page,testInfo,name){await page.screenshot({path:path.join(screenshots,testInfo.project.name+'-'+name+'.png'),fullPage:name==='home'});}
async function setRange(page,selector,value){await page.locator(selector).evaluate((node,v)=>{node.value=v;node.dispatchEvent(new Event('input',{bubbles:true}));},String(value));}
async function noOverflow(page){expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();}
test('homepage, copyright, public project links and top compatibility',async({page},info)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/#top');
 await expect(page.locator('#view-overview')).toBeVisible();await expect(page.locator('.hero h1')).toContainText('From first principles');await expect(page.locator('.footer')).toContainText('© 2021–2026 Jorge Grisman');
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
test('generic architecture animates and handles an evidence miss',async({page})=>{
 await page.goto('/#demos/architecture');await expect(page.locator('#generic-architecture')).toBeVisible();await page.locator('#architecture-play').click();await expect(page.locator('#architecture-play')).toHaveAttribute('aria-pressed','true');await expect(page.locator('#architecture-stage-value')).not.toHaveText('01 / 06');await page.locator('#architecture-scenario').selectOption('missing');await setRange(page,'#architecture-stage','1');await expect(page.locator('#architecture-status')).toContainText('No supporting evidence');await expect(page.locator('#architecture-play')).toHaveAttribute('aria-pressed','false');
 const pending=page.waitForEvent('download');await page.locator('#architecture-download').click();const dl=await pending;expect(dl.suggestedFilename()).toBe('generic-retrieval-architecture.svg');const text=fs.readFileSync(await dl.path(),'utf8');expect(text).toContain('Generic retrieval-augmented answering');expect(text).not.toMatch(forbidden);
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
 await page.goto('/');await expect(page.locator('#main')).toHaveCSS('outline-style','none');if(isMobile)await page.locator('#menu-toggle').click();await page.locator('#theme-toggle').click();if(isMobile)await page.locator('#scrim').click();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');await page.goto('/notes/evaluation/');await expect(page.locator('html')).toHaveAttribute('data-theme','dark');await noOverflow(page);await shot(page,info,'dark-article');
});
