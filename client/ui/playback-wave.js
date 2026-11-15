'use strict';
(()=>{
 const canvas=document.querySelector('#wave');
 canvas.setAttribute('aria-label','整首音乐的强弱波形与当前播放位置');
 canvas.insertAdjacentHTML('beforebegin','<div class="playback-wave-heading"><strong>整曲波形 <small>源音频强弱</small></strong><span id="playback-wave-status" role="status">播放音乐后显示</span></div>');
 canvas.insertAdjacentHTML('afterend','<div id="playback-wave-hover" class="playback-wave-hover">波形越高，源音频越响；下方进度条可调整播放位置。</div>');
 const status=document.querySelector('#playback-wave-status'),hover=document.querySelector('#playback-wave-hover'),cache=new Map(),blobIds=new WeakMap();
 let serial=0,activeKey='',activeVoice=null,job=null,envelope=null,phase='idle',surface=null,position=0,drawBounds=null;
 const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
 const clock=seconds=>{const t=Math.max(0,Math.floor(seconds));return t>=3600?Math.floor(t/3600)+':'+String(Math.floor(t/60)%60).padStart(2,'0')+':'+String(t%60).padStart(2,'0'):String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0')};
 function sourceKey(item){let blob='';if(item.blob){if(!blobIds.has(item.blob))blobIds.set(item.blob,++serial);blob=blobIds.get(item.blob)}return JSON.stringify([item.id,item.sourceRevision||0,item.libraryId||'',item.demo,blob])}
 function cancel(){if(job){job.cancelled=true;job.worker?.terminate();job.reject?.(Error('Cancelled'));job=null}}
 function setStatus(value){if(status.textContent!==value)status.textContent=value}
 async function request(item,key){
  cancel();const token=job={cancelled:false};envelope=null;surface=null;phase='loading';canvas.dataset.waveReady='false';setStatus('正在读取整曲波形…');
  try{
   if(item.duration*48000*2*4>512*1024*1024)throw Error('此文件较长，波形暂不可用；播放不受影响');
   const buffer=await window.stagecueDecodeAudio(item);
   if(token.cancelled)return;
   const worker=token.worker=new Worker(new URL('playback-wave-worker.js',location.href));
   const send=(message,transfer=[])=>new Promise((resolve,reject)=>{token.reject=reject;worker.onmessage=e=>e.data.type==='error'?reject(Error(e.data.message)):resolve(e.data);worker.onerror=e=>reject(Error(e.message));worker.postMessage(message,transfer)});
   await send({type:'begin',length:buffer.length,bins:2048});
   for(let offset=0;offset<buffer.length;offset+=65536){
    if(token.cancelled)return;
    const end=Math.min(offset+65536,buffer.length),channels=Array.from({length:buffer.numberOfChannels},(_,c)=>buffer.getChannelData(c).slice(offset,end));
    await send({type:'chunk',offset,channels},channels.map(c=>c.buffer));
   }
   const result=await send({type:'end'});if(token.cancelled)return;
   envelope={peaks:result.peaks,rms:result.rms,duration:buffer.duration};cache.set(key,envelope);
   while(cache.size>24)cache.delete(cache.keys().next().value);
   phase='ready';surface=null;setStatus('已播放 / 未播放 · 时间刻度为原曲位置');
  }catch(error){if(!token.cancelled){phase='error';setStatus(error.message==='Cancelled'?'波形已取消':'波形不可用：'+error.message)}}
  finally{token.worker?.terminate();if(job===token)job=null}
 }
 function prepareSurface(w,h,ratio){
  const node=document.createElement('canvas');node.width=w;node.height=h;const g=node.getContext('2d'),top=15*ratio,bottom=h-24*ratio,mid=(top+bottom)/2,amp=(bottom-top)/2;
  const path=(values,color)=>{g.strokeStyle=color;g.lineWidth=Math.max(1,w/values.length);g.beginPath();for(let x=0;x<w;x++){const start=Math.floor(x/w*values.length),end=Math.max(start+1,Math.ceil((x+1)/w*values.length));let value=0;for(let i=start;i<Math.min(end,values.length);i++)value=Math.max(value,values[i]);const size=clamp(value,0,1)*amp;g.moveTo(x,mid-size);g.lineTo(x,mid+size)}g.stroke()};
  path(envelope.peaks,'#557f89');path(envelope.rms,'#83b8b8');const played=document.createElement('canvas');played.width=w;played.height=h;const p=played.getContext('2d');p.drawImage(node,0,0);p.globalCompositeOperation='source-in';p.fillStyle='#c3f76b';p.fillRect(0,0,w,h);surface={node,played,w,h,ratio};
 }
 function draw({voice,width:w,height:h,context:g}){
  if(w<1||h<1)return;
  const ratio=devicePixelRatio||1;
  if(!voice){if(activeKey){cancel();activeKey='';activeVoice=null;envelope=null;surface=null;phase='idle'}setStatus('播放音乐后显示');position=0;drawBounds=null;canvas.dataset.waveReady='false'}
  else{
   const key=sourceKey(voice.item),retry=phase==='error'&&voice!==activeVoice;
   if(key!==activeKey||retry){activeKey=key;const saved=cache.get(key);if(saved){cancel();cache.delete(key);cache.set(key,saved);envelope=saved;surface=null;phase='ready';setStatus('已播放 / 未播放 · 时间刻度为原曲位置')}else request(voice.item,key)}
   activeVoice=voice;
  }
  g.fillStyle='#10171b';g.fillRect(0,0,w,h);
  if(!envelope){g.strokeStyle='#33434a';g.beginPath();g.moveTo(0,h/2);g.lineTo(w,h/2);g.stroke();g.fillStyle='#94a7ae';g.font=13*ratio+'px system-ui';g.textAlign='center';g.fillText(phase==='loading'?'正在生成整曲波形，音乐继续播放':phase==='error'?'波形暂不可用，音乐继续播放':'选择音乐后显示整首强弱变化',w/2,h/2-12*ratio);g.textAlign='left';return}
  canvas.dataset.waveReady='true';
  if(!surface||surface.w!==w||surface.h!==h||surface.ratio!==ratio)prepareSurface(w,h,ratio);
  const duration=envelope.duration,start=clamp(voice.bounds.start,0,duration),end=clamp(voice.bounds.end,0,duration),time=clamp(voice.finishing?end:voice.audio.currentTime,0,duration),head=time/duration*w,toX=t=>t/duration*w;
  position=time;drawBounds={start,end,duration};g.drawImage(surface.node,0,0);
  g.save();g.beginPath();g.rect(toX(start),0,Math.max(0,head-toX(start)),h-24*ratio);g.clip();g.drawImage(surface.played,0,0);g.restore();
  // Shade trimmed material, while retaining the full source timeline.
  g.fillStyle='#05090ac0';g.fillRect(0,0,toX(start),h-24*ratio);g.fillRect(toX(end),0,w-toX(end),h-24*ratio);
  g.font=13*ratio+'px ui-monospace,monospace';
  for(let i=0;i<=4;i++){const x=i*w/4;g.strokeStyle='#34434a';g.beginPath();g.moveTo(x,15*ratio);g.lineTo(x,h-22*ratio);g.stroke();g.fillStyle='#b9cbd0';g.textAlign=i===0?'left':i===4?'right':'center';g.fillText(clock(duration*i/4),x,h-5*ratio)}
  for(const [t,label] of [[start,'IN'],[end,'OUT']])if((label==='IN'&&start>.01)||(label==='OUT'&&duration-end>.01)){const x=toX(t);g.fillStyle='#efba78';g.fillRect(x,14*ratio,ratio,h-38*ratio);g.textAlign=label==='IN'?'left':'right';g.fillText(label,x+(label==='IN'?3:-3)*ratio,12*ratio)}
  g.fillStyle='#fff';g.fillRect(Math.min(w-2*ratio,head),14*ratio,2*ratio,h-38*ratio);
  const label=clock(time),labelWidth=g.measureText(label).width+12*ratio,x=clamp(head-labelWidth/2,0,Math.max(0,w-labelWidth));g.fillStyle='#c3f76b';g.fillRect(x,0,labelWidth,15*ratio);g.fillStyle='#15210c';g.textAlign='center';g.fillText(label,x+labelWidth/2,11*ratio);g.textAlign='left';
 }
 canvas.onpointermove=e=>{if(!envelope)return;const fraction=clamp((e.clientX-canvas.getBoundingClientRect().left)/canvas.clientWidth,0,1),index=Math.min(envelope.peaks.length-1,Math.floor(fraction*envelope.peaks.length)),peak=envelope.peaks[index],db=peak>0?(20*Math.log10(peak)).toFixed(1):'−∞';hover.textContent='原曲位置 '+clock(envelope.duration*fraction)+' · 此处源峰值 '+db+' dBFS'};
 canvas.onpointerleave=()=>{hover.textContent='波形越高，源音频越响；下方进度条可调整播放位置。'};
 window.addEventListener('beforeunload',cancel);
 window.StageCueWave={draw,snapshot:()=>({status:phase,id:activeVoice?.item.id,duration:envelope?.duration||0,position,bounds:drawBounds,peaks:envelope?Array.from(envelope.peaks):[],rms:envelope?Array.from(envelope.rms):[]})};
})();
