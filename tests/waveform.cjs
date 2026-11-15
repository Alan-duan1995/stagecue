'use strict';
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'stagecue-wave-unit-')),out=path.join(temp,'wave.cjs');
require('../client/node_modules/esbuild').buildSync({entryPoints:[path.resolve(__dirname,'../client/ui/waveform.js')],bundle:true,platform:'node',format:'cjs',outfile:out});
const {EnvelopeAccumulator}=require(out),signal=new Float32Array(800),silent=new Float32Array(800);for(let i=0;i<800;i++)signal[i]=[.05,.75,.15,.95][Math.floor(i/200)];
const envelope=new EnvelopeAccumulator(800,4);envelope.add([silent.subarray(0,317),signal.subarray(0,317)],0);envelope.add([silent.subarray(317),signal.subarray(317)],317);const result=envelope.finish();for(let i=0;i<4;i++){assert(Math.abs(result.peaks[i]-[.05,.75,.15,.95][i])<1e-6);assert(Math.abs(result.rms[i]-[.05,.75,.15,.95][i]/Math.SQRT2)<1e-6)}
const impulses=new Float32Array(200000);impulses[123457]=1;const exact=new EnvelopeAccumulator(impulses.length,2048);exact.add([impulses],0);assert.equal(Math.max(...exact.finish().peaks),1);
const silence=new EnvelopeAccumulator(20,100);silence.add([new Float32Array(20)],0);assert(silence.finish().rms.every(x=>x===0));assert.throws(()=>exact.add([new Float32Array(10)],199999));fs.rmSync(temp,{recursive:true});console.log('PASS: exact whole-file peaks, short impulses, stereo RMS, chunk boundaries and silence without normalization.');
