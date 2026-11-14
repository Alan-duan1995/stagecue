'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),out=path.join(root,'build','StageCue.exe');
fs.copyFileSync(path.join(root,'StageCue.html'),path.join(__dirname,'StageCue.html'));fs.mkdirSync(path.dirname(out),{recursive:true});
const pkg=require.resolve('@yao-pkg/pkg/lib-es5/bin.js');const result=spawnSync(process.execPath,[pkg,path.join(__dirname,'package.json'),'--target','node22-win-x64','--output',out],{cwd:__dirname,stdio:'inherit'});if(result.status!==0)process.exit(result.status||1);
// Use the Windows GUI subsystem so that launching the app does not open a console.
const exe=fs.readFileSync(out),pe=exe.readUInt32LE(0x3c);if(exe.toString('ascii',pe,pe+4)!=='PE\0\0'||exe.readUInt16LE(pe+24)!==0x20b)throw Error('Unexpected PE format');exe.writeUInt16LE(2,pe+24+68);fs.writeFileSync(out,exe);console.log('Built '+out);
