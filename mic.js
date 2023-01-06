var leftchannel = [];
var rightchannel = [];
var recorder = null;
var connected=false;
var mediaStream = null;
var context = null;
var bufferSize;
var numberOfInputChannels;
var numberOfOutputChannels;
var micTimeout;

function recordAudio() {
    // Initialize recorder
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    navigator.getUserMedia(
    {
        audio: true
    },
    function (e) {
        // creates the audio context
        context = new AudioContext({sampleRate: 40960});
        // creates an audio node from the microphone incoming stream
        mediaStream = context.createMediaStreamSource(e);
        bufferSize=2048;
        numberOfInputChannels = 2;
        numberOfOutputChannels = 2;
                // https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createScriptProcessor
        // bufferSize: the onaudioprocess event is called when the buffer is full
        if (context.createScriptProcessor) {
            recorder = context.createScriptProcessor(bufferSize, numberOfInputChannels, numberOfOutputChannels);
        } else {
            recorder = context.createJavaScriptNode(bufferSize, numberOfInputChannels, numberOfOutputChannels);
        }
        recorder.onaudioprocess = function (e) {
            leftchannel=new Float32Array(e.inputBuffer.getChannelData(0));
            rightchannel=new Float32Array(e.inputBuffer.getChannelData(1));
            for (var i=0; i<ch[0].length; i++) {
                micch[0][i]=140*leftchannel[i];
                micch[1][i]=140*rightchannel[i];
            }
            initChannels();
            draw(ctx);
        }
        mediaStream.connect(recorder);
        recorder.connect(context.destination);
        connected=true;
    },
    function (e) {
        clearTimeout(micTimeout);
        b_mic.callSwitchOff();
        log(e);
    });
}

function stopRecording() {
    if (recorder!=null && connected) {
        recorder.disconnect(context.destination);
        mediaStream.disconnect(recorder);
        connected=false;
    }
}
