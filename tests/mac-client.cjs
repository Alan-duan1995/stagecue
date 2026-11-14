'use strict';
const {_electron}=require('playwright');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 if(process.platform!=='darwin')throw Error('This check must run on a macOS host.');
 const bundle=process.env.STAGECUE_MAC_APP;
 if(!bundle)throw Error('Set STAGECUE_MAC_APP to the packaged StageCue.app.');
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'stagecue-mac-test-')),profile=path.join(temp,'profile');
 fs.mkdirSync(profile);let app;
 async function launch(){return _electron.launch({executablePath:path.join(bundle,'Contents/MacOS/StageCue'),args:['--stagecue-test','--stagecue-test-data='+profile],timeout:60000})}
 try{
  app=await launch();let page=await app.firstWindow();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.waitForFunction(()=>document.body.dataset.advancedReady==='true',null,{timeout:60000});
  assert.equal(await page.evaluate(()=>stagecueClient.platform),'darwin');
  assert.equal(await page.evaluate(()=>stagecueClient.version),'3.0.1');
  assert.equal(await page.evaluate(()=>typeof require),'undefined');
  const settings=await app.evaluate(({app,BrowserWindow,Menu})=>{const p=BrowserWindow.getAllWindows()[0].webContents.getLastWebPreferences();return {data:app.getPath('userData'),version:app.getVersion(),sandbox:p.sandbox,isolated:p.contextIsolation,node:p.nodeIntegration,menus:Menu.getApplicationMenu().items.map(i=>i.label)}});
  assert.equal(settings.data,profile);assert.equal(settings.version,'3.0.1');
  assert(settings.sandbox&&settings.isolated&&!settings.node);assert(settings.menus.includes('编辑'));assert.equal(settings.menus[0],'StageCue');
  await page.locator('[data-trigger=demo0]').click();
  await page.waitForFunction(()=>current&&!preparing&&!current.audio.paused,null,{timeout:30000});
  await page.waitForFunction(()=>current.audio.currentTime>.2,null,{timeout:15000});
  await page.locator('#panic-header').click();assert.equal(await page.evaluate(()=>voices.length),0);
  const dsp=await page.evaluate(async()=>{const b=new AudioBuffer({numberOfChannels:1,length:48000,sampleRate:48000});for(let i=0;i<48000;i++)b.getChannelData(0)[i]=.1*Math.sin(2*Math.PI*440*i/48000);const out=await StageCueDSP.renderEffects(b,{pitch:12,tempo:1.25});return {duration:out.duration,finite:out.getChannelData(0).every(Number.isFinite),energy:out.getChannelData(0).some(v=>Math.abs(v)>.01)}});
  assert(Math.abs(dsp.duration-.8)<.02);assert(dsp.finite&&dsp.energy);
  const audio=await page.evaluate(async()=>Array.from(new Uint8Array(await demoBlob(items[0]).arrayBuffer())));
  const music=path.join(temp,'Music');fs.mkdirSync(music);fs.writeFileSync(path.join(music,'mac-test.wav'),Buffer.from(audio));
  await app.evaluate(({dialog},directory)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[directory]})},music);
  const lib=await page.evaluate(()=>stagecueClient.library.add());assert.equal(lib.tracks.length,1);assert.equal(lib.tracks[0].missing,false);
  const stream=await page.evaluate(async id=>{const r=await fetch(stagecueClient.mediaURL(id),{headers:{Range:'bytes=0-15'}});return {status:r.status,size:(await r.arrayBuffer()).byteLength}},lib.tracks[0].id);
  assert.deepEqual(stream,{status:206,size:16});
  const ctl=await page.evaluate(()=>stagecueClient.controller.enabled(true));assert(ctl.enabled&&ctl.port>0);await page.evaluate(()=>stagecueClient.controller.enabled(false));
  const backup=path.join(temp,'backup.json');
  await app.evaluate(({BrowserWindow},file)=>{BrowserWindow.getAllWindows()[0].webContents.session.once('will-download',(_event,item)=>item.setSavePath(file))},backup);
  await app.evaluate(({Menu})=>Menu.getApplicationMenu().items.find(i=>i.label==='文件').submenu.items.find(i=>i.label==='导出演出备份').click());
  for(let i=0;i<100&&!fs.existsSync(backup);i++)await page.waitForTimeout(100);
  assert.equal(JSON.parse(fs.readFileSync(backup)).version,3);
  await page.locator('[data-track-volume=demo0]').fill('43');await page.locator('[data-track-volume=demo0]').dispatchEvent('input');await page.evaluate(()=>saving);
  assert.deepEqual(errors,[]);await app.close();app=null;
  app=await launch();page=await app.firstWindow();await page.waitForFunction(()=>document.body.dataset.advancedReady==='true',null,{timeout:60000});
  assert.equal(await page.locator('[data-track-volume=demo0]').inputValue(),'43');
  assert.equal((await page.evaluate(()=>stagecueClient.library.list())).tracks.length,1);
  console.log('PASS: native packaged macOS client, sandbox/menu, playback/AudioWorklet, DSP, native library/Range, controller, backup and persistence after restart.');
 }finally{if(app)await app.close()}
})().catch(e=>{console.error(e);process.exit(1)});
