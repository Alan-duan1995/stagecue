'use strict';
const fs=require('node:fs/promises'),path=require('node:path');
module.exports=async context=>{
 if(context.electronPlatformName!=='win32')return;
 // The offline audio workstation uses CPU-drawn 2D UI, no WebGL/WebGPU.
 // Keep ANGLE/D3D11 and the standard Chromium resources; omit only optional
 // Vulkan/SwiftShader and DirectX shader compilation components used by 3D APIs.
 for(const name of ['dxcompiler.dll','dxil.dll','vk_swiftshader.dll','vulkan-1.dll','vk_swiftshader_icd.json'])await fs.rm(path.join(context.appOutDir,name),{force:true});
};
