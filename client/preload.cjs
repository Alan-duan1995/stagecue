'use strict';
const {contextBridge}=require('electron');
contextBridge.exposeInMainWorld('stagecueClient',Object.freeze({version:'2.1.0',platform:process.platform}));
