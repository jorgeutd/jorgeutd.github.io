const {test,expect}=require('@playwright/test');
const path=require('node:path'),fs=require('node:fs');
async function shot(page,info,name){fs.mkdirSync('screenshots',{recursive:true});await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.resolve('screenshots',info.project.name+'-delivery-'+name+'.png'),fullPage:true});}
async function noOverflow(page){expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();}

test('professional introduction and linked lifecycle remain readable across themes',async({page,isMobile},info)=>{
 await page.goto('/');await expect(page.locator('.hero .eyebrow')).toHaveText('Staff / Principal AI Engineer');await expect(page.locator('.engineering-map-grid>a')).toHaveCount(4);await expect(page.locator('.impact-strip')).toContainText('Quantum Health · platform reach');await expect(page.locator('#hero-model')).toHaveCount(0);await noOverflow(page);await shot(page,info,'overview');
 await page.locator('.engineering-map-bottom a').click();await expect(page.locator('#view-about')).toBeVisible();await expect(page.locator('#view-about .about-columns')).toContainText('Staff / Principal AI Engineer');await noOverflow(page);await shot(page,info,'about');
 if(isMobile)await page.locator('#menu-toggle').click();await page.locator('#theme-toggle').click();if(isMobile)await page.locator('#scrim').click({position:{x:page.viewportSize().width-10,y:30}});await page.goto('/');await shot(page,info,'overview-dark');
});

test('guided experiments demonstrate causality, head differences, and temperature concentration',async({page},info)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/labs/transformer/');const root=page.locator('#transformer-anatomy');await expect(root).toHaveCount(1);await expect(page.locator('#view-lab')).toBeVisible();
 await root.locator('[data-tf-future]').click();await expect(root.locator('[data-tf-experiment-result]')).toContainText('maximum logit change 0.000000');await expect(root.locator('[data-tf-weight]')).toHaveText('0.0%');
 await root.locator('[data-tf-experiment="heads"]').click();await expect(root.locator('[data-tf-experiment-result]')).toContainText('head 1 assigns');await root.locator('[data-tf-head="1"]').click();await expect(root.locator('[data-tf-head="1"]')).toHaveAttribute('aria-pressed','true');
 await root.locator('[data-tf-experiment="temperature"]').click();await expect(root.locator('[data-tf-temperature]')).toHaveValue('0.4');await root.locator('[data-tf-temperature-example]').click();await expect(root.locator('[data-tf-temperature]')).toHaveValue('1.4');await noOverflow(page);await shot(page,info,'guided-lab');
 await page.goto('/#research');await expect(page.locator('#research-transformer-slot #transformer-anatomy')).toBeVisible();await expect(page.locator('#transformer-anatomy')).toHaveCount(1);expect(errors).toEqual([]);
});

test('dedicated lab URLs and public studies have canonical URLs and readable initial HTML',async({page,browser},info)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const slug of ['memory','batching','sampling','evaluation','tracing','architecture']){await page.goto('/labs/'+slug+'/');await expect(page.locator('#view-demos')).toBeVisible();await expect(page.locator('#view-demos')).toHaveCount(1);await expect(page.locator('#demo-mount')).not.toBeEmpty();await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://jorgeutd.github.io/labs/'+slug+'/');await noOverflow(page);}
 for(const slug of ['local-agent-bench','llm-inference-starters']){await page.goto('/work/'+slug+'/');await expect(page.locator('#view-work')).toBeVisible();await expect(page.locator('.case-sections>section')).toHaveCount(5);await expect(page.locator('.case-source-links a')).toHaveCount(5);await noOverflow(page);await shot(page,info,slug);}
 const context=await browser.newContext({javaScriptEnabled:false,baseURL:test.info().project.use.baseURL||'http://127.0.0.1:4173'}),plain=await context.newPage();
 await plain.goto('/work/local-agent-bench/');await expect(plain.locator('.case-sections>section')).toHaveCount(5);await plain.goto('/labs/transformer/');await expect(plain.locator('.tf-experiments')).toBeVisible();await plain.goto('/labs/evaluation/');await expect(plain.locator('#demo-mount')).not.toBeEmpty();await context.close();expect(errors).toEqual([]);
});

test('pretrained model is opt-in and download failure leaves a retryable interface',async({page},info)=>{
 const external=[];page.on('request',r=>{if(/huggingface.co|cdn.jsdelivr.net/.test(r.url()))external.push(r.url());});await page.goto('/labs/pretrained/');await expect(page.locator('[data-pretrained-run]')).toBeDisabled();await expect(page.locator('.pretrained-status')).toContainText('No model files downloaded');expect(external).toEqual([]);await noOverflow(page);await shot(page,info,'pretrained-before-load');
 await page.route('**/portfolio-pretrained-worker.js*',route=>route.abort());await page.locator('[data-pretrained-load]').click();await expect(page.locator('.pretrained-status')).toContainText('could not load');await expect(page.locator('[data-pretrained-load]')).toBeEnabled();await expect(page.locator('[data-pretrained-run]')).toBeDisabled();
});

test('pinned pretrained model returns real tokens and vocabulary-normalized probabilities',async({page,isMobile},info)=>{
 test.setTimeout(240000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/labs/pretrained/');await page.locator('[data-pretrained-load]').click();await expect(page.locator('[data-pretrained-run]')).toBeEnabled({timeout:180000});
 await page.locator('[data-pretrained-run]').click();await expect(page.locator('.pretrained-status')).toContainText('Forward pass complete',{timeout:60000});await expect(page.locator('.pretrained-token-list span')).not.toHaveCount(0);await expect(page.locator('.pretrained-run-info')).toContainText('50,257');await expect(page.locator('.pretrained-probs>.pretrained-prob')).toHaveCount(12);
 const before=await page.locator('textarea').inputValue();await page.locator('[data-pretrained-append]').click();await expect(page.locator('.pretrained-status')).toContainText('Forward pass complete',{timeout:60000});expect((await page.locator('textarea').inputValue()).length).toBeGreaterThan(before.length);await noOverflow(page);await shot(page,info,'pretrained-results');
 await page.locator('[data-pretrained-cancel]').click();await expect(page.locator('[data-pretrained-load]')).toBeEnabled();expect(errors).toEqual([]);
});
