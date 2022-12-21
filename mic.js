var leftchannel = [];
var rightchannel = [];
var recorder = null;
var mediaStream = null;
var context = null;

function recordAudio() {
    // Initialize recorder
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    navigator.getUserMedia(
    {
        audio: true
    },
    function (e) {
        // creates the audio context
        context = new AudioContext();
        // creates an audio node from the microphone incoming stream
        mediaStream = context.createMediaStreamSource(e);
        // https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createScriptProcessor
        // bufferSize: the onaudioprocess event is called when the buffer is full
        var bufferSize = L;
        var numberOfInputChannels = 2;
        var numberOfOutputChannels = 2;
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
    },
    function (e) {
        console.error(e);
    });
}

function stopRecording() {
    recorder.disconnect(context.destination);
    mediaStream.disconnect(recorder);
}
