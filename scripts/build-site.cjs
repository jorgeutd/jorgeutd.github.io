const fs=require('node:fs'),path=require('node:path');
const root=process.cwd(),out=path.join(root,'_site');fs.mkdirSync(out,{recursive:true});
const allowed=['index.html','404.html','favicon.svg','favicon.png','og-image.png','robots.txt','sitemap.xml','site.webmanifest','.nojekyll','assets','notes','deep-dives','inference','evals','systems'];
for(const name of allowed){const src=path.join(root,name);if(fs.existsSync(src))fs.cpSync(src,path.join(out,name),{recursive:true});}
for(const name of ['index.html','assets/portfolio-content.js','assets/portfolio-expansion.js','notes/tracing/index.html'])if(!fs.existsSync(path.join(out,name)))throw Error('Required public file missing: '+name);
console.log('Built public files into _site; tooling and repository metadata are excluded.');
