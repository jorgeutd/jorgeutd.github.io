const {test,expect}=require('@playwright/test');
const M=require('../assets/portfolio-graph-math.js');
test('GCN degree normalization agrees with a hand computation',()=>{
 const x=[[1,0,0,0],[0,1,0,0]],result=M.step(x,[[0,1]],'gcn');
 const expected=M.W.map(row=>(row[0]+row[1])/2);
 result.output.forEach(h=>h.forEach((v,k)=>expect(v).toBeCloseTo(Math.max(0,expected[k]),12)));
});
test('GATv2 attention normalizes each neighborhood and all operators remain finite',()=>{
 for(const name of ['gcn','sage','gatv2'])for(const cut of [false,true]){const r=M.run(name,cut);expect(r.states.flat(2).every(Number.isFinite)).toBeTruthy();if(name==='gatv2')for(const layer of r.layers)for(const d of layer)expect(d.weights.reduce((a,b)=>a+b,0)).toBeCloseTo(1,12);}
});
test('permutation changes indexing but not graph computations',()=>{
 const p=[4,2,6,0,8,1,7,3,5],inverse=[];p.forEach((old,n)=>inverse[old]=n);const x=M.nodes.map(n=>n.h),edges=M.edges.map(e=>e.map(i=>inverse[i]));
 for(const method of ['gcn','sage','gatv2']){const a=M.step(x,M.edges,method).output,b=M.step(p.map(i=>x[i]),edges,method).output;b.forEach((h,i)=>h.forEach((v,k)=>expect(v).toBeCloseTo(a[p[i]][k],12)));}
});
test('locality prevents a disconnected intervention from changing one-hop state',()=>{
 const a=M.run('gcn',false),b=M.run('gcn',true);expect(a.states[1][7]).toEqual(b.states[1][7]);expect(a.states[1][3]).not.toEqual(b.states[1][3]);expect(M.reach(3,a.links,2)).toContain(0);
});
test('GATv2 can reverse the ordering of the same neighbors when the receiving features change',()=>{
 const order=q=>M.step([q,M.nodes[0].h,M.nodes[1].h],[[0,1],[0,2]],'gatv2').details[0].raw.slice(1);
 const a=order(M.nodes[0].h),b=order(M.nodes[1].h);expect(a[0]).toBeGreaterThan(a[1]);expect(b[0]).toBeLessThan(b[1]);
});
