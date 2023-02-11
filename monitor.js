const nBuf=1; // number of buffers for clickless buffer switching
var astarted, 
    audioCtx=new Array(nBuf).fill(null),
    source=new Array(nBuf).fill(null),
    myArrayBuffer=new Array(nBuf).fill(null),
    gainNode=new Array(nBuf).fill(null),
    nowBuffering=new Array(2);
const SAMPLERATE=22000, SAMPLESEC=10;
var aptr=0, prevAptr=0;
var q, qi; // for frequency calculations
var sel; // for array_monitor string selection (Off, Ch1, Ch2, Stereo, Disp)
function switchBuffer() {
    prevAptr=aptr; aptr=(aptr+1)%nBuf;
    if (audioCtx[aptr]==null) {
        audioCtx[aptr]=new window.AudioContext({sampleRate: SAMPLERATE});
        astarted=false;
        gainNode[aptr]=audioCtx[aptr].createGain();
    }
    if (astarted) {
        stopBuffer(prevAptr);
    }
    // Create an empty three-second stereo buffer at the sample rate of the AudioContext
    myArrayBuffer[aptr]=audioCtx[aptr].createBuffer(2,SAMPLESEC*audioCtx[aptr].sampleRate,audioCtx[aptr].sampleRate);
    // Get an AudioBufferSourceNode.
    // This is the AudioNode to use when we want to play an AudioBuffer
    source[aptr]=audioCtx[aptr].createBufferSource();
    // set the buffer in the AudioBufferSourceNode
    source[aptr].buffer = myArrayBuffer[aptr];
    source[aptr].loop=true;
    // connect the AudioBufferSourceNode to the gainNode
    // and the gainNode to the destination
    gainNode[aptr].gain.setValueAtTime(0, audioCtx[aptr].currentTime);
    source[aptr].connect(gainNode[aptr]);
    gainNode[aptr].connect(audioCtx[aptr].destination);
    sel=a_monitor[k_monitor.getValue()];
    // Fill the buffer with values between -1.0 and 1.0
    for (let c=0; c<myArrayBuffer[aptr].numberOfChannels; c++) {
        // This gives us the actual array that contains the data
        nowBuffering[c] = myArrayBuffer[aptr].getChannelData(c);
        for (let cc=0; cc<2; cc++) mq[cc]=freqs[cc]*1000*L/SAMPLERATE;
        for (let i=0; i<nowBuffering[c].length; i++) {
            nowBuffering[c][i]=0;
            for (let cc=0; cc<2; cc++) mqi[cc]=Math.round(mq[cc]*i)%L;
            if (sel=="Math") {
                if (siggen[c].b_ch.state==1) {
                    nowBuffering[c][i]=scope.calcModeY(c,sch[0][mqi[0]],sch[1][mqi[1]]) / 290;
                }
            }
            else if (sel!="Off") {
                if ( (c==0 && (sel=="CH1" || sel=="1-2") && siggen[0].b_ch.state==1) 
                || (c==1 && (sel=="CH2" || sel=="1-2") && siggen[1].b_ch.state==1) ) {
                    nowBuffering[c][i] = sch[c][mqi[c]] / 290;
                }
            }
        }
    }
    // connect the AudioBufferSourceNode to the
    // destination so we can hear the sound
//    source.connect(audioCtx.destination);
    // start the source playing
    gainNode[aptr].gain.linearRampToValueAtTime(Math.pow(1.2,k_vol.getValue())/4.3,audioCtx[aptr].currentTime+0.30);
    source[aptr].start();
    astarted=true;
    draw(ctx);
}
function stopBuffer(aptr) {
    if (gainNode[aptr]!=null) {
        gainNode[aptr].gain.linearRampToValueAtTime(0.000001,audioCtx[aptr].currentTime+0.25);
        source[aptr].stop(audioCtx[aptr].currentTime+0.30);
    }
}

function initMonitor() {
    new DebugIcon(0,100,900,200,(x)=>{if (x==-17) return L; else return myArrayBuffer[aptr]==null?0:100*myArrayBuffer[aptr].getChannelData(0)[x];});
    new DebugIcon(0,300,900,200,(x)=>{if (x==-17) return L; else return myArrayBuffer[aptr]==null?0:100*myArrayBuffer[aptr].getChannelData(1)[x];});
    new DebugIcon(0,200,900,200,(x)=>{if (x==-17) return FFTN; else return 100*fftIn[x];});
    new DebugIcon(0,400,900,200,(x)=>{if (x==-17) return FFTN; else return 100*fftOut[x];});
}
