/* Generate static, content-addressed social cards. No page JavaScript required. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {JSDOM,VirtualConsole}=require('jsdom');
const sharp=require('sharp');
const root=process.cwd(),host='https://jorgeutd.github.io',folder=path.join(root,'assets/social');fs.mkdirSync(folder,{recursive:true});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function wrap(text,max){let lines=[],line='';for(const word of text.split(/\s+/)){if((line+' '+word).trim().length>max&&line){lines.push(line);line=word;}else line=(line+' '+word).trim();}if(line)lines.push(line);return lines;}
function art(kind){
 if(kind==='pretrained')return `<text x="847" y="171" font-size="12" letter-spacing="1.5" fill="#53685a">TOKENIZE</text>${['The','model','predicts'].map((s,i)=>`<rect x="${836+i*104}" y="191" width="95" height="44" rx="6" fill="#ffffff" stroke="#ccd8cc"/><text x="${847+i*104}" y="219" font-size="16" fill="#294e3b">${s}</text>`).join('')}<path d="M989 247v45" stroke="#365a46" stroke-width="2"/><path d="m984 286 5 7 5-7" fill="none" stroke="#365a46"/><rect x="843" y="306" width="294" height="72" rx="7" fill="#365a46"/><text x="873" y="338" font-size="19" fill="#ffffff">DistilGPT2</text><text x="873" y="361" font-size="12" fill="#dde8dc">Pinned checkpoint · browser inference</text>${[224,156,90,45].map((w,i)=>`<rect x="843" y="${411+i*23}" width="294" height="11" rx="3" fill="#dde5d9"/><rect x="843" y="${411+i*23}" width="${w}" height="11" rx="3" fill="#5c826b"/>`).join('')}`;
 if(kind==='graphs')return `<g stroke="#799882" stroke-width="2">${[[860,218,1010,198],[1010,198,1120,302],[860,218,919,369],[1010,198,998,302],[998,302,919,369],[998,302,1093,437],[919,369,1093,437],[1120,302,1093,437],[998,302,1120,302]].map(e=>`<path d="M${e[0]} ${e[1]}L${e[2]} ${e[3]}"/>`).join('')}</g>${[[860,218],[1010,198],[1120,302],[919,369],[1093,437],[998,302]].map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="${i===5?31:19}" fill="${i===5?'#365a46':'#fff'}" stroke="#365a46" stroke-width="2"/><circle cx="${x}" cy="${y}" r="${i===5?43:28}" fill="none" stroke="#cbd8c7"/>`).join('')}<text x="842" y="503" font-size="13" letter-spacing="1" fill="#53685a">FEATURES → MESSAGES → EVIDENCE</text>`;
 return `<g fill="none" stroke="#91a68e">${[0,1,2].map(i=>`<path d="M844 ${240+i*80}l118-50 183 54-115 55Z" fill="${i===1?'#dce8d7':'#ffffff'}"/><path d="M844 ${240+i*80}v11l186 59 115-54v-12"/>`).join('')}</g><path d="M990 149v46M1028 458v49" stroke="#365a46" stroke-width="2" stroke-dasharray="5 5"/><text x="846" y="535" font-size="12" letter-spacing="1.2" fill="#53685a">MODELS · MECHANISMS · SYSTEMS</text>`;
}
function imageSVG(title,desc,label,kind){
 const lines=wrap(title,25).slice(0,4),size=lines.length>3?43:52,step=size*1.12;
 const description=wrap(desc.length>128?desc.slice(0,125).replace(/\s+\S*$/,'')+'…':desc,57).slice(0,3),deckY=Math.max(423,220+(lines.length-1)*step+60);
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#f8faf5"/><rect x="1" y="1" width="1198" height="628" rx="20" fill="none" stroke="#d5dfd1" stroke-width="2"/><g font-family="Segoe UI,Arial,sans-serif"><rect x="60" y="53" width="47" height="47" rx="7" fill="#243c30"/><text x="68" y="85" font-size="25" font-weight="600" fill="#ffffff">JG</text><text x="124" y="75" font-size="21" font-weight="600" fill="#212921">Jorge Grisman</text><text x="124" y="97" font-size="13" fill="#637062">Staff / Principal AI Engineer</text><path d="M60 128H1140" stroke="#d5dfd1"/><text x="62" y="175" font-size="12" letter-spacing="2" fill="#426249">${esc(label)}</text>${lines.map((s,i)=>`<text x="58" y="${242+i*step}" font-size="${size}" font-weight="600" letter-spacing="-1.5" fill="#212921">${esc(s)}</text>`).join('')}${description.map((s,i)=>`<text x="62" y="${deckY+i*25}" font-size="19" fill="#596758">${esc(s)}</text>`).join('')}<path d="M800 165V526" stroke="#d5dfd1"/>${art(kind)}<path d="M60 558H1140" stroke="#d5dfd1"/><text x="62" y="596" font-size="14" fill="#426249">jorgeutd.github.io</text><text x="1140" y="596" text-anchor="end" font-size="13" fill="#637062">© 2021–2026 Jorge Grisman</text></g></svg>`;
}
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()&&e.name!=='node_modules'?files(path.join(dir,e.name)):e.isFile()&&e.name==='index.html'?[path.join(dir,e.name)]:[]);}
(async()=>{
 const manifest={format:'portfolio-social-cards-v1',width:1200,height:630,pages:[]};
 const pageFiles=[path.join(root,'index.html'),...['notes','labs','work','deep-dives','inference','evals','systems'].flatMap(name=>fs.existsSync(path.join(root,name))?files(path.join(root,name)):[])];
 for(const file of pageFiles){
  const raw=fs.readFileSync(file,'utf8'),dom=new JSDOM(raw,{virtualConsole:new VirtualConsole()}),d=dom.window.document;
  const rel=path.relative(root,file).replace(/\\/g,'/'),route=rel==='index.html'?'/':'/'+rel.replace('index.html','');
  const home=route==='/',title=home?'From fine-tuning to production.':d.title.replace(/\s*[·—|]\s*Jorge(?: Grisman)?.*$/,'').trim();
  const desc=home?'Applied AI, agent systems, inference and evaluation. Explore the work, inspect a mechanism, and read the evidence.':d.querySelector('meta[name="description"]')?.content||'Engineering notes, interactive mechanisms and public implementations by Jorge Grisman.';
  const kind=route.includes('pretrained')?'pretrained':/graph/.test(route)?'graphs':'systems';
  const label=home?'APPLIED AI / SYSTEMS':route.startsWith('/labs/')?'INTERACTIVE LAB':route.startsWith('/notes/')?'ENGINEERING NOTES':route.startsWith('/work/')?'PUBLIC PROJECT / ENGINEERING STUDY':'RESEARCH / ENGINEERING';
  const svg=imageSVG(title,desc,label,kind),png=await sharp(Buffer.from(svg)).png().toBuffer(),hash=crypto.createHash('sha256').update(png).digest('hex').slice(0,10),key=home?'portfolio':route.split('/').filter(Boolean).join('-'),asset=`assets/social/${key}-${hash}.png`;
  fs.writeFileSync(path.join(root,asset),png);
  if(home)fs.copyFileSync(path.join(root,asset),path.join(root,'og-image.png'));
  const url=host+asset.replace(/^/,'/'),alt=title+' — '+(kind==='pretrained'?'tokenization, a browser model and next-token scores':kind==='graphs'?'connected evidence and message passing':'models, mechanisms and systems')+'. Jorge Grisman.';
  const set=(attribute,name,content)=>{d.querySelectorAll(`meta[${attribute}="${name}"]`).forEach(n=>n.remove());const m=d.createElement('meta');m.setAttribute(attribute,name);m.content=content;d.head.append(m);};
  set('property','og:image',url);set('property','og:image:secure_url',url);set('property','og:image:type','image/png');set('property','og:image:width','1200');set('property','og:image:height','630');set('property','og:image:alt',alt);set('property','og:site_name','Jorge Grisman');
  set('property','og:title',home?'Jorge Grisman — Applied AI & Systems':d.title);set('property','og:description',desc);set('property','og:url',host+route);set('property','og:type',route.startsWith('/notes/')?'article':'website');
  set('name','twitter:card','summary_large_image');set('name','twitter:title',d.querySelector('meta[property="og:title"]').content);set('name','twitter:description',desc);set('name','twitter:image',url);set('name','twitter:image:alt',alt);
  fs.writeFileSync(file,raw.replace(/<head(?:\s[^>]*)?>[\s\S]*?<\/head>/i,d.head.outerHTML));
  manifest.pages.push({route,title,asset,alt});dom.window.close();
 }
 fs.writeFileSync(path.join(root,'assets/social/manifest.json'),JSON.stringify(manifest,null,2));
 console.log(`Generated ${manifest.pages.length} distinct 1200×630 social cards and crawler-readable metadata.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
