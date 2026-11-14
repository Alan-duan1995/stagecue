'use strict';
const path=require('node:path'),fs=require('node:fs');
const {build,Platform,Arch}=require('electron-builder');
const meta=require('./package.json');
// electron-builder already uses this reader on macOS. On Linux, use the same
// implementation for the generated NSIS intermediate instead of executing it
// through a potentially incompatible 32-bit Wine runtime. Final installer and
// uninstaller are still built by the normal upstream NSIS pipeline.
if(process.platform==='linux'){
 const {WineVmManager}=require('app-builder-lib/out/vm/WineVm');
 const {UninstallerReader}=require('app-builder-lib/out/targets/nsis/nsisUtil');
 const original=WineVmManager.prototype.exec;
 const expected=path.resolve(__dirname,'..','build','client',`StageCue-Setup-${meta.version}-x64.exe`);
 WineVmManager.prototype.exec=async function(file,args,options,...rest){
  if(path.resolve(file)===expected&&args.length===0&&options?.env?.__COMPAT_LAYER==='RunAsInvoker'){
   const uninstaller=path.join(path.dirname(file),path.basename(file,'exe')+'__uninstaller.exe');
   await UninstallerReader.exec(file,uninstaller);const check=fs.readFileSync(uninstaller);if(check[0]!==0x4d||check[1]!==0x5a)throw Error('Invalid generated NSIS uninstaller');return '';
  }
  return original.call(this,file,args,options,...rest);
 };
}
build({projectDir:__dirname,targets:Platform.WINDOWS.createTarget('nsis',Arch.x64),publish:'never'}).catch(error=>{console.error(error);process.exitCode=1});
