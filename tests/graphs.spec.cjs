const {test,expect}=require('@playwright/test');
const path=require('node:path'),fs=require('node:fs');
async function noOverflow(page){expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();}
async function shot(page,info,name){fs.mkdirSync('screenshots',{recursive:true});await page.screenshot({path:path.resolve('screenshots',info.project.name+'-graphs-'+name+'.png'),fullPage:true});}

test('graph operators expose real computations and edge intervention',async({page},info)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/labs/graphs/');await expect(page.locator('#view-lab')).toBeVisible();await expect(page.locator('.graph-inspector h2')).toHaveText('Evidence');await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://jorgeutd.github.io/labs/graphs/');
 await expect(page.locator('.graph-inspector > .graph-vector')).toHaveCount(2);await expect(page.locator('.graph-inspector > .graph-messages')).toBeVisible();await expect(page.locator('.graph-message')).toHaveCount(6);await page.locator('[data-graph-experiment="cut"]').click();expect(Number(await page.locator('[data-graph-delta]').textContent())).toBeGreaterThan(0);await expect(page.locator('.graph-message')).toHaveCount(5);await noOverflow(page);await shot(page,info,'intervention');
 await page.locator('[data-graph-restore]').click();await page.locator('[data-graph-method]').selectOption('gatv2');await expect(page.locator('.graph-small')).toContainText('1.000000');await page.locator('[data-graph-node]').selectOption('0');await expect(page.locator('.graph-inspector h2')).toHaveText('Question');await expect(page.locator('.graph-message')).toHaveCount(2);
 await page.locator('[data-graph-method]').selectOption('sage');await expect(page.locator('.graph-message')).toHaveCount(1);await expect(page.locator('.graph-small')).toContainText('separately');await page.locator('[data-graph-experiment="two"]').click();await expect(page.locator('[data-graph-depth]')).toHaveValue('2');await expect(page.locator('.graph-status')).toContainText('2 layers');expect(errors).toEqual([]);
});

test('3D camera, stack, 2D fallback, theme and route lifecycle work',async({page,isMobile},info)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/labs/graphs/');const canvas=page.locator('.graph-canvas');const before=await canvas.evaluate(c=>c.toDataURL());await canvas.focus();await page.keyboard.press('ArrowRight');await page.keyboard.press('+');expect(await canvas.evaluate(c=>c.toDataURL())).not.toBe(before);
 await page.locator('[data-graph-stack]').click();await expect(page.locator('[data-graph-stack]')).toHaveAttribute('aria-pressed','true');await shot(page,info,'stack');await page.locator('[data-graph-flat]').click();await expect(page.locator('[data-graph-flat]')).toHaveAttribute('aria-pressed','true');await page.locator('[data-graph-play]').click();await expect(page.locator('[data-graph-play]')).toHaveAttribute('aria-pressed','true');await page.locator('[data-graph-play]').click();await noOverflow(page);
 if(isMobile)await page.locator('#menu-toggle').click();await page.locator('#theme-toggle').click();if(isMobile)await page.locator('#scrim').click({position:{x:page.viewportSize().width-10,y:30}});await page.locator('[data-graph-stack]').click();await page.locator('[data-graph-flat]').click();await shot(page,info,'dark');
 await page.goto('/#lab/graphs');await expect(page.locator('.graph-lab')).toHaveCount(1);await page.goto('/#research');await expect(page.locator('.graph-feature')).toBeVisible();await expect(page.locator('#research-transformer-slot #transformer-anatomy')).toHaveCount(1);await page.locator('.graph-feature .button').click();await expect(page.locator('.graph-lab')).toBeVisible();expect(errors).toEqual([]);
});

test('measured retrieval replay loads genuine report data and failures can retry',async({page},info)=>{
 await page.goto('/labs/graphs/');await page.locator('[data-graph-mode="replay"]').click();await expect(page.locator('.graph-ranking')).toHaveCount(2);await expect(page.locator('[data-graph-query] option')).toHaveCount(12);await expect(page.locator('.graph-summary>div')).toHaveCount(4);await expect(page.locator('[data-graph-rankings]')).toContainText('36 eligible');await noOverflow(page);await shot(page,info,'replay');
 const before=await page.locator('[data-graph-rankings]').textContent();await page.locator('[data-graph-query]').selectOption('3');expect(await page.locator('[data-graph-rankings]').textContent()).not.toBe(before);
 await page.goto('/labs/graphs/');await page.route('**/graph-evidence-replay.json',route=>route.abort());await page.locator('[data-graph-mode="replay"]').click();await expect(page.locator('[data-graph-retry]')).toBeVisible();await page.unroute('**/graph-evidence-replay.json');await page.locator('[data-graph-retry]').click();await expect(page.locator('.graph-ranking')).toHaveCount(2);
});

test('research guide is readable without JavaScript and sources remain linked',async({page,browser},info)=>{
 await page.goto('/notes/graph-neural-networks/');await expect(page.locator('.article-section')).toHaveCount(14);await expect(page.locator('#article-widget')).toContainText('Open the 3D graph lab');await expect(page.locator('.source-box')).toContainText('not a peer-reviewed');await noOverflow(page);
 await page.goto('/#notes');await page.locator('[data-paper-filter="Graphs"]').click();await expect(page.locator('#paper-shelf .paper-item')).toHaveCount(8);
 const context=await browser.newContext({javaScriptEnabled:false,baseURL:test.info().project.use.baseURL||'http://127.0.0.1:4173'}),plain=await context.newPage();await plain.goto('/notes/graph-neural-networks/');await expect(plain.locator('.article-section')).toHaveCount(14);await expect(plain.locator('#view-notes h1')).toHaveText('When relationships become the model.');await plain.goto('/labs/graphs/');await expect(plain.locator('.graph-usecases article')).toHaveCount(4);await expect(plain.locator('.graph-inspector')).toContainText('Evidence');await context.close();
});

test('reduced motion disables message animation',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/labs/graphs/');await expect(page.locator('[data-graph-play]')).toBeDisabled();await page.locator('[data-graph-experiment="cut"]').click();expect(Number(await page.locator('[data-graph-delta]').textContent())).toBeGreaterThan(0);
});
