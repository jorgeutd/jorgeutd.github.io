const {test,expect}=require('@playwright/test');
const assert=require('node:assert/strict');
const M=require('../assets/portfolio-systems-math');
test('one request has an independently calculated latency and transfer cost',()=>{
 const r=M.inference({count:1,gpus:2,media:100,images:2,tokens:10,transfer:16});
 expect(r.aggregated.rows[0].latency).toBe(88);expect(r.aggregated.rows[0].ttft).toBeCloseTo(73.6);
 expect(r.separated.rows[0].latency).toBe(104);expect(r.separated.rows[0].ttft).toBeCloseTo(89.6);
});
test('reserved encoders have an opportunity cost for pure text',()=>{
 const r=M.inference({count:2,gpus:2,media:0,tokens:10,gap:0});
 expect(r.aggregated.rows.map(x=>x.end)).toEqual([28,28]);expect(r.separated.rows.map(x=>x.end)).toEqual([28,56]);
});
test('isolating a media burst protects text latency while delaying overall completion',()=>{
 const r=M.inference();expect(r.separated.p95Text).toBeLessThanOrEqual(r.aggregated.p95Text);expect(r.separated.p95End).toBeGreaterThanOrEqual(r.aggregated.p95End);
 expect(M.inference({media:100}).aggregated.p95Text).toBeNull();
});
test('work conservation, causal order and capacity hold across workload extremes',()=>{
 for(const media of [0,50,100])for(const gpus of [2,4,8])for(const encoders of [1,gpus-1])for(const tokens of [32,2048])for(const gap of [0,1000]){
  const r=M.inference({media,gpus,encoders,tokens,gap});
  for(const layout of [r.aggregated,r.separated]){
   assert.equal(layout.rows.length,32);assert.ok(layout.passed<=32);
   const resources={};
   for(const row of layout.rows){
    assert.ok(row.first<=row.end);assert.ok(Math.abs(row.latency-row.spans.reduce((n,s)=>n+s.end-s.start,0))<1e-8);
    let time=row.arrival;for(const s of row.spans){assert.ok(Math.abs(s.start-time)<1e-8);assert.ok(s.end>=s.start);time=s.end;if(['Encode','Prefill','Decode'].includes(s.name)&&s.end>s.start)(resources[s.worker]??=[]).push(s);}
   }
   for(const spans of Object.values(resources)){spans.sort((a,b)=>a.start-b.start);for(let i=1;i<spans.length;i++)assert.ok(spans[i].start+1e-8>=spans[i-1].end);}
  }
 }
});
function finish(s){for(let i=0;i<8&&s.phase!==7;i++)s=M.advance(s,'step');return s;}
test('safe retries preserve one external effect after a committed but unacknowledged tool call',()=>{
 let s=M.recovery();for(let i=0;i<4;i++)s=M.advance(s,'step');expect(s.ledger).toHaveLength(1);expect(s.events.some(e=>e.kind==='tool-result')).toBeFalsy();
 s=M.advance(s,'crash');expect(s.pending).toBeNull();s=M.advance(s,'resume');expect(s.phase).toBe(3);s=finish(s);
 expect(s.attempts).toBe(2);expect(s.ledger).toHaveLength(1);expect(s.phase).toBe(7);expect(s.events.find(e=>e.kind==='tool-result').detail).toBe('receipt-1');
});
test('successful workflow can conceal duplicate external effects without deduplication',()=>{
 let s=M.recovery(false);for(let i=0;i<4;i++)s=M.advance(s,'step');s=finish(M.advance(M.advance(s,'crash'),'resume'));
 expect(s.phase).toBe(7);expect(s.ledger).toHaveLength(2);expect(s.events.find(e=>e.kind==='tool-result').detail).toBe('receipt-2');
});
test('every checkpoint resumes, terminal actions are inert and snapshots stay immutable',()=>{
 for(let stop=1;stop<7;stop++){
  let s=M.recovery();for(let i=0;i<stop;i++)s=M.advance(s,'step');const saved=JSON.stringify(s);
  const lost=M.advance(s,'crash');expect(JSON.stringify(s)).toBe(saved);expect(M.advance(lost,'step')).toEqual(lost);
  const done=finish(M.advance(lost,'resume'));expect(done.phase).toBe(7);expect(done.ledger).toHaveLength(1);expect(done.attempts).toBe(stop===4?2:1);expect(M.advance(done,'crash')).toEqual(done);expect(M.advance(done,'step')).toEqual(done);
 }
});
