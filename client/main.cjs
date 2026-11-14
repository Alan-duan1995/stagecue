'use strict';
const {app,BrowserWindow,Menu,dialog,session,shell}=require('electron');
const {nativeServices}=require('./services/native.cjs');
const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-features','Vulkan,WebGPU');
app.setName('StageCue');app.setAppUserModelId('com.itssc.stagecue');
app.setPath('userData',path.join(app.getPath('appData'),'StageCue Client'));
const isTest=process.argv.includes('--stagecue-test');let mainWindow=null,allowAudioDevices=false,services=null;
const page=path.join(__dirname,'app','StageCue.html'),pageURL=pathToFileURL(page).href;
function log(message){try{fs.mkdirSync(app.getPath('userData'),{recursive:true});fs.appendFileSync(path.join(app.getPath('userData'),'client.log'),new Date().toISOString()+' '+message+'\n')}catch{}}
function command(name){const ids={import:'import',backup:'export',restore:'restore',panic:'panic',help:'help',lock:'lock',routing:'routing',preflight:'preflight'};const id=ids[name];if(mainWindow&&id)mainWindow.webContents.executeJavaScript('document.getElementById('+JSON.stringify(id)+')?.click()',true).catch(error=>log('menu command failed '+error.message))}
function trusted(contents){return contents&&contents===mainWindow?.webContents&&contents.getURL()===pageURL}
function buildMenu(){Menu.setApplicationMenu(Menu.buildFromTemplate([
 {label:'文件',submenu:[{label:'导入音频',click:()=>command('import')},{label:'导出演出备份',click:()=>command('backup')},{label:'恢复演出备份',click:()=>command('restore')},{type:'separator'},{label:'打开本地数据文件夹',click:()=>shell.openPath(app.getPath('userData'))},{type:'separator'},{label:'退出',role:'quit'}]},
 {label:'演出',submenu:[{label:'演出锁定 / 解锁',click:()=>command('lock')},{label:'音频路由 / 耳机',click:()=>command('routing')},{label:'演出前素材检查',click:()=>command('preflight')},{type:'separator'},{label:'停止全部声音',click:()=>command('panic')}]},
 {label:'窗口',submenu:[{role:'minimize',label:'最小化'},{role:'togglefullscreen',label:'全屏'},{role:'resetZoom',label:'实际大小'},{role:'zoomIn',label:'放大'},{role:'zoomOut',label:'缩小'}]},
 {label:'帮助',submenu:[{label:'操作与快捷键',click:()=>command('help')},{label:'关于 StageCue',click:()=>dialog.showMessageBox(mainWindow,{type:'info',title:'关于 StageCue',message:'StageCue '+app.getVersion()+' · 本地客户端',detail:'中东中亚IT SSC   Alan\n\n内置桌面运行环境，无需安装 Edge、Chrome 或 Node.js。音频与演出保存在本机；升级或卸载前请导出演出备份。'})}]}
]))}
async function createWindow(){
 const local=session.fromPartition('persist:stagecue-client');
 local.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_details,callback)=>callback({cancel:true}));
 local.setPermissionCheckHandler((contents,permission)=>trusted(contents)&&((permission==='media'&&allowAudioDevices)||permission==='speaker-selection'));
 local.setPermissionRequestHandler(async(contents,permission,callback,details)=>{
  if(!trusted(contents)){callback(false);return}
  if(permission==='speaker-selection'){callback(true);return}
  if(permission==='media'&&details.mediaTypes?.includes('audio')&&details.mediaTypes.every(type=>type==='audio')){
   if(allowAudioDevices){callback(true);return}
   const result=await dialog.showMessageBox(mainWindow,{type:'question',title:'获取音频设备',message:'允许 StageCue 获取音频设备列表？',detail:'用于识别主声卡和耳机输出。设备枚举可能短暂启用音频输入，程序不保存录音。',buttons:['允许','取消'],defaultId:1,cancelId:1});allowAudioDevices=result.response===0;callback(allowAudioDevices);return
  }callback(false)
 });
 services=await nativeServices({directory:app.getPath('userData'),session:local,getWindow:()=>mainWindow,isTrusted:trusted,log});
 local.on('will-download',(_event,item)=>{if(!item.getURL().startsWith('blob:')){item.cancel();return}item.setSaveDialogOptions({title:'保存 StageCue 文件',defaultPath:path.join(app.getPath('documents'),item.getFilename())})});
 mainWindow=new BrowserWindow({width:1500,height:980,minWidth:760,minHeight:640,show:false,title:'StageCue · 本地客户端',backgroundColor:'#101113',autoHideMenuBar:false,icon:path.join(__dirname,'assets','icon.png'),webPreferences:{preload:path.join(__dirname,'preload.cjs'),session:local,contextIsolation:true,nodeIntegration:false,sandbox:true,webSecurity:true,backgroundThrottling:false,devTools:isTest}});
 mainWindow.webContents.setWindowOpenHandler(()=>({action:'deny'}));mainWindow.webContents.on('will-navigate',(event,url)=>{if(url!==pageURL)event.preventDefault()});mainWindow.webContents.on('will-redirect',event=>event.preventDefault());
 mainWindow.on('ready-to-show',()=>{if(!isTest)mainWindow.show()});
 mainWindow.webContents.on('did-fail-load',(_e,code,description)=>{log('page load error '+code+' '+description);if(!isTest)dialog.showErrorBox('StageCue 页面加载失败',description+'\n请查看本地数据文件夹中的 client.log。')});
 mainWindow.webContents.on('will-prevent-unload',event=>{if(isTest){event.preventDefault();return}const choice=dialog.showMessageBoxSync(mainWindow,{type:'question',title:'退出 StageCue',message:'当前正在播放或处于演出锁定。确定退出？',buttons:['继续演出','退出'],defaultId:0,cancelId:0});if(choice===1)event.preventDefault()});
 mainWindow.webContents.on('render-process-gone',(_event,details)=>{log('renderer stopped '+JSON.stringify(details));if(!isTest)dialog.showErrorBox('StageCue 页面已停止','请重新打开客户端，并通过演出备份恢复需要的内容。')});
 mainWindow.on('closed',()=>{mainWindow=null});buildMenu();await mainWindow.loadFile(page);log('Client ready '+app.getVersion());
}
if(!app.requestSingleInstanceLock())app.quit();else{
 app.on('second-instance',()=>{if(mainWindow){if(mainWindow.isMinimized())mainWindow.restore();mainWindow.show();mainWindow.focus()}});
 app.whenReady().then(createWindow).catch(error=>{log(error.stack||error.message);dialog.showErrorBox('StageCue 启动失败',error.message);app.quit()});
 app.on('window-all-closed',()=>{if(services)services.close().finally(()=>app.quit());else app.quit()});
}
process.on('uncaughtException',error=>{log(error.stack||error.message);dialog.showErrorBox('StageCue 客户端错误',error.message)});
