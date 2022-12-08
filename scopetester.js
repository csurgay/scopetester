// ScopeTester - Peter Csurgay 2022
var canvas, ctx, vfd;
var ui=[];
var k_func, k_freq, k_phase, k_ampl; 

function init() {
    console.log("ScopeTester - Peter Csurgay 2022");
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    mouseInit(canvas);
    initBufgen();
    k_func=[new FuncKnob(100,100),new FuncKnob(100,300)];
    k_ampl=[new Knob(200,100,25,31,0), new Knob(200,300,25,31,0)];
    k_phase=[new DoubleKnob(300,100,12,21,"Phase"), new DoubleKnob(300,300,12,21,"Phase")];
    k_freq=[new DoubleKnob(400,100,12,21,"Freq"), new DoubleKnob(400,300,12,21,"Freq")];
    initChannels();
    vfd=new Image(); vfd.src='./images/vfd234567.png';
    vfd.onload = () => draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i=0; i<ui.length; i++) ui[i].draw(ctx);
    for (var i=0; i<2; i++) drawChannel(i+1,ch[i]);
    drawNumber(100,450,""+k_ampl[0].value);
}

function drawNumber(pX,pY,s) {
    console.log(s);
    for (var i=0; i<s.length; i++) {
        var x = 0+s[i]; x++; x--;
        ctx.drawImage(vfd, (x-1)*220,20-1.5*x, 220,320, pX+i*30,pY, 30,60);
    }
}

function drawChannel(c,b) {
    ctx.beginPath();
    ctx.strokeStyle="black";
    ctx.moveTo(0,c*200-b[0]/2);
    for (var i=0; i<b.length; i++) {
        ctx.lineTo(i,c*200-b[i]/2);
    }
    ctx.stroke();
}
