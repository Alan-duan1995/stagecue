import {integratedLoudness} from './loudness.js';
self.onmessage=event=>{try{self.postMessage({result:integratedLoudness(event.data.channels,event.data.sampleRate)})}catch(error){self.postMessage({error:error.message})}};
