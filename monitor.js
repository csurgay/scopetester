var astarted, 
    audioCtx=[null,null], 
    source=[null,null], 
    myArrayBuffer=[null,null], 
    gainNode=[null,null];
var aptr=0;
function switchBuffer() {
    aptr=1-aptr;
    if (audioCtx[aptr]==null) {
        audioCtx[aptr]=new window.AudioContext({sampleRate: 40960});
        astarted=false;
        gainNode[aptr]=audioCtx[aptr].createGain();
    }
    if (astarted) {
        stopBuffer(1-aptr);
    }
    // Create an empty three-second stereo buffer at the sample rate of the AudioContext
    myArrayBuffer[aptr]=audioCtx[aptr].createBuffer(2,10*audioCtx[aptr].sampleRate,audioCtx[aptr].sampleRate);
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
        const nowBuffering = myArrayBuffer[aptr].getChannelData(c);
        for (let i = 0; i < myArrayBuffer[aptr].length; i++) {
            nowBuffering[i] = 0;
            if (siggen[c].b_ch.state==1)
                nowBuffering[i] = ch[c][i % Math.round(L/freqs[c]/100)] / 290;
        }
    }
    // connect the AudioBufferSourceNode to the
    // destination so we can hear the sound
//    source.connect(audioCtx.destination);
    // start the source playing
    gainNode[aptr].gain.linearRampToValueAtTime(1,audioCtx[aptr].currentTime+0.25);
    source[aptr].start();
    astarted=true;
}
function stopBuffer(aptr) {
    gainNode[aptr].gain.exponentialRampToValueAtTime(0.000001,audioCtx[aptr].currentTime+0.25);
    source[aptr].stop(audioCtx[aptr].currentTime+0.30);
}
