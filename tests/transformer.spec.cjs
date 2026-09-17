const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const context={window:{},document:{getElementById:()=>null}};
vm.runInNewContext(fs.readFileSync(path.resolve('assets/portfolio-transformer.js'),'utf8'),context);
const model=context.window.PortfolioTransformer;
const near=(a,b)=>expect(Math.abs(a-b)).toBeLessThan(1e-10);

test('teaching decoder obeys causal invariance, normalized attention and residual arithmetic',()=>{
 const ids=[0,1,2,3,4,9],base=model.forward(ids),changed=model.forward([0,1,2,3,4,15]),prefix=model.forward(ids.slice(0,4));
 expect(base.logits).toHaveLength(6);expect(base.logits[0]).toHaveLength(16);
 for(const head of base.heads)for(let i=0;i<6;i++){
  near(head.attention[i].reduce((s,v)=>s+v,0),1);
  for(let j=i+1;j<6;j++)expect(head.attention[i][j]).toBe(0);
 }
 for(let i=0;i<5;i++)for(let j=0;j<16;j++)near(base.logits[i][j],changed.logits[i][j]);
 for(let i=0;i<4;i++)for(let j=0;j<16;j++)near(base.logits[i][j],prefix.logits[i][j]);
 expect(base.logits[5].some((v,j)=>Math.abs(v-changed.logits[5][j])>.01)).toBeTruthy();
 for(let i=0;i<6;i++)for(let j=0;j<8;j++){
  near(base.residual[i][j],base.x[i][j]+base.projected[i][j]);
  near(base.output[i][j],base.residual[i][j]+base.mlp[i][j]);
  expect(Number.isFinite(base.output[i][j])).toBeTruthy();
 }
 // Independently derive the selected pair and value-weighted attention output.
 const h=base.heads[1],q=4,k=2;
 const dot=h.Q[q].reduce((s,x,d)=>s+x*h.K[k][d],0),scores=h.K.slice(0,q+1).map(key=>h.Q[q].reduce((s,x,d)=>s+x*key[d],0)/2);
 const expected=Math.exp(dot/2)/scores.reduce((s,x)=>s+Math.exp(x),0);near(h.attention[q][k],expected);
 for(let d=0;d<4;d++)near(h.mixed[q][d],h.V.slice(0,q+1).reduce((s,v,k)=>s+h.attention[q][k]*v[d],0));
 expect(()=>model.forward([])).toThrow();expect(()=>model.forward([16])).toThrow();
});

test('sampling matches a known distribution and top-k retains exactly the selected candidates',()=>{
 const logits=[0,Math.log(2),Math.log(3)];const p=model.distribution(logits,1,3);
 for(const row of p)near(row.p,[1/6,2/6,3/6][row.id]);
 const greedy=model.distribution(logits,.2,1);expect(greedy.filter(r=>r.p>0)).toHaveLength(1);expect(greedy[0].id).toBe(2);expect(greedy[0].p).toBe(1);
 const flat=model.distribution([0,0,0],1,3);for(const r of flat)near(r.p,1/3);
 expect(()=>model.distribution(logits,0,3)).toThrow();
});

async function capture(page,info,name){fs.mkdirSync('screenshots',{recursive:true});await page.locator('#transformer-anatomy').screenshot({path:path.resolve('screenshots',info.project.name+'-transformer-'+name+'.png')});}
test('transformer workbench connects tokens, head selection and masked pair inspection',async({page,isMobile},info)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/#research/transformer');const root=page.locator('#transformer-anatomy');
 await expect(root.locator('[data-tf-cell]')).toHaveCount(36);await expect(root.locator('.masked')).toHaveCount(15);await expect(root.locator('.tf-row-sum')).toContainText('1.000000');
 await expect(root.locator(isMobile?'.tf-mobile-flow':'.tf-map')).toBeVisible();await capture(page,info,'attention');
 if(!isMobile){const positions=await root.locator('.tf-map [y]').evaluateAll(nodes=>nodes.map(n=>Number(n.getAttribute('y'))));expect(positions.every(Number.isFinite)).toBeTruthy();await expect(root.locator('.tf-svg-token')).toHaveCount(10);const ys=await root.locator('.tf-svg-token').evaluateAll(nodes=>nodes.slice(0,6).map(n=>n.getBBox().y));expect(new Set(ys).size).toBe(6);}
 const before=await root.locator('[data-tf-weight]').innerText();await root.locator('[data-tf-head="1"]').click();await expect(root.locator('[data-tf-weight]')).not.toHaveText(before);
 await root.locator('[data-tf-cell="1,4"]').click();await expect(root.locator('[data-tf-weight]')).toHaveText('0.0%');await expect(root.locator('.tf-calculation')).toContainText('−∞');
 await root.locator('[data-tf-token="0"]').click();await expect(root.locator('.query-row:not(.masked)')).toHaveCount(1);await root.locator('[data-tf-cell="0,0"]').focus();await page.keyboard.press('Enter');await expect(root.locator('[data-tf-weight]')).toHaveText('100.0%');
 await root.locator('[data-tf-stage="0"]').click();await expect(root.locator('.tf-vector')).toHaveCount(4);await capture(page,info,'embeddings');
 await root.locator('[data-tf-prompt]').selectOption('1');await expect(root.locator('[data-tf-token="2"]')).toContainText('learns');
 await root.locator('[data-tf-stage="2"]').click();await expect(root.locator('.tf-vector')).toHaveCount(5);await capture(page,info,'residual');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();expect(errors).toEqual([]);
});

test('decoder generation updates the sequence and controls work with keyboard and narrow layouts',async({page,isMobile},info)=>{
 await page.goto('/#research/transformer');const root=page.locator('#transformer-anatomy');await root.locator('[data-tf-stage="3"]').click();
 await root.locator('[data-tf-k]').selectOption('1');await expect(root.locator('.tf-prob:not(.excluded)')).toHaveCount(1);await expect(root.locator('.tf-prob:not(.excluded)')).toContainText('100.0%');
 const id=+(await root.locator('.tf-prob:not(.excluded)').getAttribute('data-tf-prob'));await root.locator('[data-tf-generate]').click();await expect(root.locator('[data-tf-token]')).toHaveCount(7);await expect(root.locator('[data-tf-token="6"]')).toContainText('ID '+id);
 for(let i=0;i<3;i++)await root.locator('[data-tf-generate]').click();await expect(root.locator('[data-tf-generate]')).toBeDisabled();await root.locator('[data-tf-reset]').click();await expect(root.locator('[data-tf-token]')).toHaveCount(6);
 await root.locator('[data-tf-k]').selectOption('16');await root.locator('[data-tf-temperature]').focus();await page.keyboard.press('ArrowRight');await expect(root.locator('[data-tf-temperature]')).toHaveValue('1.05');await expect(root.locator('[data-tf-temperature]')).toBeFocused();
 await capture(page,info,'sampling');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
 if(isMobile)await page.locator('#menu-toggle').click();await page.locator('#theme-toggle').click();if(isMobile)await page.locator('#scrim').click({position:{x:page.viewportSize().width-10,y:30}});
 await root.locator('[data-tf-stage="1"]').click();await capture(page,info,'dark');
});

test('JG identity assets load and all page families declare versioned favicon and touch icons',async({page,request})=>{
 for(const route of ['/','/notes/model-mechanics/','/deep-dives/','/inference/','/systems/','/evals/','/404.html']){
  await page.goto(route);await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute('href',/\/favicon\.svg\?v=[a-f0-9]+/);await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('sizes','180x180');
 }
 for(const asset of ['favicon.svg','favicon.png','favicon.ico','apple-touch-icon.png','icon-192.png','icon-512.png','site.webmanifest']){
  const response=await request.get('/'+asset);expect(response.ok()).toBeTruthy();expect(Buffer.compare(await response.body(),fs.readFileSync(path.resolve(asset)))).toBe(0);
 }
 const response=await request.get('/favicon.svg');expect(await response.text()).toContain('JG — Jorge Grisman');
});
