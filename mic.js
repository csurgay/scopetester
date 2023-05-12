var leftchannel = [];
var rightchannel = [];
var recorder = null;
var connected=false;
var mediaStream = null;
var context = null;
var bufferSize;
var numberOfInputChannels;
var numberOfOutputChannels;
var userAllowed=false;
var eSaved;

function getUserAllow() {
    // Initialize recorder
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    navigator.getUserMedia(
    {
        audio: true
    },
    function (e) {
        userAllowed=true;
        eSaved=e;
        recordAudio(eSaved);
    },
    function (e) {
        log(e);
    });
}

function recordAudio() {
    // creates the audio context
    context = new AudioContext({sampleRate: 8192});
    // creates an audio node from the microphone incoming stream
    mediaStream = context.createMediaStreamSource(eSaved);
    bufferSize=2048;
    numberOfInputChannels = 1;
    numberOfOutputChannels = 1;
            // https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createScriptProcessor
    // bufferSize: the onaudioprocess event is called when the buffer is full
    if (context.createScriptProcessor) {
        recorder = context.createScriptProcessor(bufferSize, numberOfInputChannels, numberOfOutputChannels);
    } else {
        recorder = context.createJavaScriptNode(bufferSize, numberOfInputChannels, numberOfOutputChannels);
    }
    recorder.onaudioprocess = function (e) {
        leftchannel=new Float32Array(e.inputBuffer.getChannelData(0));
        rightchannel=new Float32Array(e.inputBuffer.getChannelData(0));
        for (let i=0; i<micch[0].length; i++) {
            micch[0][i]=140*leftchannel[i];
            micch[1][i]=140*rightchannel[i];
        }
        initChannels();
        draw(ctx);
    }
    mediaStream.connect(recorder);
    recorder.connect(context.destination);
    connected=true;
}

function stopRecording() {
    if (recorder!=null && connected) {
        recorder.disconnect(context.destination);
        mediaStream.disconnect(recorder);
        connected=false;
    }
}
