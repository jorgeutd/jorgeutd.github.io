// Optional browser inference. Model identity and runtime are pinned for reproducibility.
const MODEL='Xenova/distilgpt2';
const REVISION='a41c10485c18a64b6606729b6a082330cbd8f49e';
const RUNTIME='https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/dist/transformers.web.js';
let tokenizer,model,busy=false;
const send=(type,body={})=>postMessage({type,...body});
async function load(){
 const {AutoTokenizer,AutoModelForCausalLM,env}=await import(RUNTIME);
 env.allowLocalModels=false;env.backends.onnx.wasm.numThreads=1;
 const options={revision:REVISION,progress_callback:event=>{
  if(event.status==='progress')send('progress',{file:event.file,progress:Math.round(event.progress||0)});
 }};
 tokenizer=await AutoTokenizer.from_pretrained(MODEL,options);
 model=await AutoModelForCausalLM.from_pretrained(MODEL,{...options,device:'wasm',dtype:'q8',model_file_name:'decoder_model_merged'});
 send('ready',{model:MODEL,revision:REVISION});
}
async function infer(text){
 const inputs=tokenizer(text),ids=inputs.input_ids.tolist()[0].map(Number);
 if(!ids.length||ids.length>64)throw Error('Use between 1 and 64 tokens. Shorten the input and try again.');
 const start=performance.now();const outputs=await model(inputs);const inferenceMs=performance.now()-start;
 const width=outputs.logits.dims.at(-1),raw=outputs.logits.data,logits=Array.from(raw.slice(raw.length-width));
 const tokens=ids.map(id=>({id,piece:tokenizer.decode([id],{skip_special_tokens:false})}));
 const ranked=logits.map((logit,id)=>({id,logit})).sort((a,b)=>b.logit-a.logit).slice(0,12);
 const candidates=ranked.map(row=>({...row,piece:tokenizer.decode([row.id],{skip_special_tokens:false})}));
 const max=Math.max(...logits),sum=logits.reduce((s,v)=>s+Math.exp(v-max),0);
 const probabilities=candidates.map(r=>({...r,p:Math.exp(r.logit-max)/sum}));
 // Transfer plain values, then release tensors from this full-sequence forward pass.
 send('result',{tokens,probabilities,logits:Float32Array.from(logits),inferenceMs,vocabularySize:width,model:MODEL,revision:REVISION,text});
 const seen=new Set();const dispose=async obj=>{if(!obj||typeof obj!=='object'||seen.has(obj))return;seen.add(obj);if(typeof obj.dispose==='function'){await obj.dispose();return;}for(const v of Object.values(obj))await dispose(v);};
 await dispose(outputs);await dispose(inputs);
}
onmessage=async({data})=>{
 if(busy)return;busy=true;
 try{if(data.type==='load')await load();else if(data.type==='infer'){if(!model)throw Error('Load the model first.');await infer(String(data.text));}}
 catch(error){send('error',{message:error.message||'The model could not run in this browser.'});}
 finally{busy=false;}
};
