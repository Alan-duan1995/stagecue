
'use strict';
const {contextBridge,ipcRenderer}=require('electron');
const listen=(channel,callback)=>{const listener=(_event,data)=>callback(data);ipcRenderer.on(channel,listener);return ()=>ipcRenderer.removeListener(channel,listener)};
contextBridge.exposeInMainWorld('stagecueClient',Object.freeze({version:'3.0.2',platform:process.platform,
 mediaURL:id=>'stagecue-audio://media/'+encodeURIComponent(id),
 library:Object.freeze({list:()=>ipcRenderer.invoke('native:library','list'),add:()=>ipcRenderer.invoke('native:library','add'),refresh:()=>ipcRenderer.invoke('native:library','refresh'),remove:id=>ipcRenderer.invoke('native:library','remove',id),relink:id=>ipcRenderer.invoke('native:library','relink',id),tags:(id,tags)=>ipcRenderer.invoke('native:library','tags',{id,tags}),restoreTags:id=>ipcRenderer.invoke('native:library','restoreTags',id),onChange:callback=>listen('native:library-change',callback),onError:callback=>listen('native:library-error',callback)}),
 controller:Object.freeze({settings:()=>ipcRenderer.invoke('native:controller','settings'),enabled:value=>ipcRenderer.invoke('native:controller','enabled',value),copy:()=>ipcRenderer.invoke('native:controller','copy'),rotate:()=>ipcRenderer.invoke('native:controller','rotate'),report:state=>ipcRenderer.send('native:controller-state',state),onChange:callback=>listen('native:controller-change',callback)}),
 share:(platform,text)=>ipcRenderer.invoke('native:share',platform,text),
 copyText:text=>ipcRenderer.invoke('native:copy-text',text)
}));
