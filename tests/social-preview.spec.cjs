const {test,expect}=require('@playwright/test');
const crypto=require('node:crypto');
const manifest=require('../assets/social/manifest.json');
function metadata(html){const result={};for(const tag of html.matchAll(/<meta\b([^>]+)>/gi)){const attributes=Object.fromEntries([...tag[1].matchAll(/([\w:-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));const key=attributes.property||attributes.name;if(key)result[key]=attributes.content;}return result;}

test('every public page serves a unique current preview in raw crawler HTML',async({request})=>{
 const urls=new Set();
 for(const item of manifest.pages){
  const response=await request.get(item.route,{headers:{'User-Agent':'Twitterbot/1.0'}});expect(response.ok(),item.route).toBeTruthy();const head=(await response.text()).split('</head>')[0],meta=metadata(head);
  expect(meta['og:url']).toBe('https://jorgeutd.github.io'+item.route);expect(meta['og:image']).toBe('https://jorgeutd.github.io/'+item.asset);expect(meta['og:image:width']).toBe('1200');expect(meta['og:image:height']).toBe('630');expect(meta['og:image:alt']).toBeTruthy();expect(meta['twitter:card']).toBe('summary_large_image');expect(meta['twitter:image']).toBe(meta['og:image']);urls.add(meta['og:image']);
  const picture=await request.get('/'+item.asset);expect(picture.ok()).toBeTruthy();expect(picture.headers()['content-type']).toContain('image/png');const bytes=await picture.body();expect(bytes.readUInt32BE(16)).toBe(1200);expect(bytes.readUInt32BE(20)).toBe(630);expect(item.asset).toContain(crypto.createHash('sha256').update(bytes).digest('hex').slice(0,10));
 }
 expect(urls.size).toBe(manifest.pages.length);
});

test('pretrained share metadata is page-specific and the old fallback has been replaced',async({request})=>{
 const page=await request.get('/labs/pretrained/?share=20260918');const m=metadata((await page.text()).split('</head>')[0]);expect(m['og:title']).toContain('Pretrained model lab');expect(m['twitter:title']).toBe(m['og:title']);expect(m['og:image']).toContain('/assets/social/labs-pretrained-');expect(m['og:image']).not.toContain('/og-image.png');
 const home=manifest.pages.find(p=>p.route==='/');const original=await request.get('/og-image.png'),replacement=await request.get('/'+home.asset);expect(await original.body()).toEqual(await replacement.body());
});
