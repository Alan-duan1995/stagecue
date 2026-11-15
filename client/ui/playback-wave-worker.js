import {EnvelopeAccumulator} from './waveform.js';
let envelope;
self.onmessage=event=>{try{
 const m=event.data;
 if(m.type==='begin'){envelope=new EnvelopeAccumulator(m.length,m.bins);self.postMessage({type:'ready'})}
 else if(m.type==='chunk'){envelope.add(m.channels,m.offset);self.postMessage({type:'chunk'})}
 else if(m.type==='end'){const result=envelope.finish();self.postMessage({type:'result',...result},[result.peaks.buffer,result.rms.buffer]);envelope=null}
}catch(error){self.postMessage({type:'error',message:error.message})}};
