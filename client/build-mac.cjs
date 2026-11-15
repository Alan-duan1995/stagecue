'use strict';
const {build,Platform,Arch}=require('electron-builder');
if(process.platform!=='darwin')throw Error('macOS DMG packaging and ad-hoc signing require a macOS build host.');
const selected=process.env.STAGECUE_MAC_ARCH;
if(selected&&!['arm64','x64'].includes(selected))throw Error('STAGECUE_MAC_ARCH must be arm64 or x64');
const architectures=selected?[selected==='arm64'?Arch.arm64:Arch.x64]:[Arch.arm64,Arch.x64];
build({projectDir:__dirname,targets:Platform.MAC.createTarget(['dmg','zip'],...architectures),publish:'never',config:{compression:'normal'}}).catch(error=>{console.error(error);process.exit(1)});
