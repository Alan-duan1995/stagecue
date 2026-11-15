// Source envelope: exact sample peaks and channel-averaged RMS, never normalized.
export class EnvelopeAccumulator {
 constructor(length,bins=2048){
  if(!Number.isInteger(length)||length<1)throw Error('Invalid audio length');
  this.length=length;this.bins=Math.min(length,bins);this.peaks=new Float32Array(this.bins);this.energy=new Float64Array(this.bins);this.counts=new Uint32Array(this.bins);
 }
 add(channels,offset){
  if(!channels.length||!Number.isInteger(offset)||offset<0)throw Error('Invalid audio chunk');
  const count=channels[0].length;if(offset+count>this.length||channels.some(c=>c.length!==count))throw Error('Invalid chunk range');
  for(const channel of channels)for(let i=0;i<count;i++){
   const bin=Math.min(this.bins-1,Math.floor((offset+i)*this.bins/this.length)),sample=Number.isFinite(channel[i])?channel[i]:0;
   this.peaks[bin]=Math.max(this.peaks[bin],Math.abs(sample));this.energy[bin]+=sample*sample;this.counts[bin]++;
  }
 }
 finish(){return {peaks:this.peaks,rms:Float32Array.from(this.energy,(value,i)=>this.counts[i]?Math.sqrt(value/this.counts[i]):0)}}
}
