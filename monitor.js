const N=1;
var astarted, 
    audioCtx=new Array(N).fill(null),
    source=new Array(N).fill(null),
    myArrayBuffer=new Array(N).fill(null),
    gainNode=new Array(N).fill(null),
    nowBuffering;
var aptr=0, prevAptr=0;
var q, qi; // for frequency calculations
var sel; // for array_monitor string selection (Off, Ch1, Ch2, Stereo, Disp)
function switchBuffer() {
    if (b_debug.state==1) console.log("switchBuffer aptr:"+aptr)
    prevAptr=aptr; aptr=(aptr+1)%N;
    if (audioCtx[aptr]==null) {
        audioCtx[aptr]=new window.AudioContext({sampleRate: 40960});
        astarted=false;
        gainNode[aptr]=audioCtx[aptr].createGain();
    }
    if (astarted) {
        stopBuffer(prevAptr);
    }
    // Create an empty three-second stereo buffer at the sample rate of the AudioContext
    myArrayBuffer[aptr]=audioCtx[aptr].createBuffer(2,1*audioCtx[aptr].sampleRate,audioCtx[aptr].sampleRate);
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
    // Fill the buffer with values between -1.0 and 1.0
    for (let c=0; c<myArrayBuffer[aptr].numberOfChannels; c++) {
    // This gives us the actual array that contains the data
        nowBuffering = myArrayBuffer[aptr].getChannelData(c);
        q=freqs[c]*100*L/4096;
        for (let i = 0; i < nowBuffering.length; i++) {
            nowBuffering[i] = 0;
            sel=a_monitor[k_monitor.value];
            qi=Math.round(q*i)%L; if (qi<0) qi+=L;
            if (sel=="Disp") {
                if (siggen[c].b_ch.state==1)
                    nowBuffering[i] = scope.calcModeY(c,sch[0][qi],sch[1][qi]) / 290;
            }
            else if (sel!="Off") {
                if ( (c==0 && (sel=="Ch1" || sel=="Stereo") && siggen[0].b_ch.state==1) 
                || (c==1 && (sel=="Ch2" || sel=="Stereo") && siggen[1].b_ch.state==1) ) {
                    nowBuffering[i] = sch[c][qi] / 290;
                }
            }
        }
    }
    // connect the AudioBufferSourceNode to the
    // destination so we can hear the sound
//    source.connect(audioCtx.destination);
    // start the source playing
    gainNode[aptr].gain.linearRampToValueAtTime(Math.pow(1.2,k_vol.value0)/4.3,audioCtx[aptr].currentTime+0.30);
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
new DebugIcon(0,500,900,200,(x)=>{return myArrayBuffer[aptr]==null?0:100*myArrayBuffer[aptr].getChannelData(0)[x];});
new DebugIcon(0,700,900,200,(x)=>{return myArrayBuffer[aptr]==null?0:100*myArrayBuffer[aptr].getChannelData(1)[x];});
