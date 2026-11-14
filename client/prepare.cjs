'use strict';
const fs=require('node:fs'),path=require('node:path');
const app=path.join(__dirname,'app');fs.mkdirSync(app,{recursive:true});let html=fs.readFileSync(path.join(__dirname,'..','StageCue.html'),'utf8');
html=html.replace('<title>','<meta http-equiv="Content-Security-Policy" content="default-src \'self\' data: blob:; script-src \'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\'; media-src \'self\' data: blob:; connect-src \'self\' data: blob:; img-src \'self\' data: blob:; object-src \'none\'; base-uri \'none\'"><title>');
html=html.replace(/<title>.*?<\/title>/,'<title>StageCue · 本地客户端</title>').replace('LIVE SOUND WORKSTATION','DESKTOP CLIENT · OFFLINE').replace('STAGECUE v2.0','STAGECUE CLIENT v2.1');fs.writeFileSync(path.join(app,'StageCue.html'),html);
