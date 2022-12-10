// ScopeTester - Peter Csurgay 2022
var canvas, ctx, scope, no_images_to_load, vfd, led_on, led_off;
//const bgcolor="rgba(230, 219, 172, 0.75)";
const bgcolor="rgb(201, 187, 142)";
var ui=[];
var k_intensity, k_focus, k_illum, k_func, k_freq, k_phase, k_ampl;
var b_power, b_ch; 

function init() {
    console.log("ScopeTester - Peter Csurgay 2022");
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    mouseInit(canvas);
    initBufgen();
    var xS=75, yS=530, xD=370; xV=240;
    var xF=180, yF=yS;
    var xA=180, yA=yS+100;
    var xP=180, yP=yS+200;
    new Frame(xS-65,yS-65,xD-10,310,"CH1 Signal",1);
    new Frame(xS-65+xD,yS-65,xD-10,310,"CH2 Signal",1);
    k_func=[new FuncKnob(xS,yS,3),new FuncKnob(xS+xD,yS,7)];
    k_freq=[new DoubleKnob(xF,yF,49,49,"Freq",3,35,17), new DoubleKnob(xF+xD,yF,49,49,"Freq",3,35,17)];
    k_ampl=[new Knob(xA,yA,25,31,0,"Ampl",3), new Knob(xA+xD,yA,25,31,0,"Ampl",3)];
    k_phase=[new DoubleKnob(xP,yP,12,21,"Phase",3,35,17), new DoubleKnob(xP+xD,yP,12,21,"Phase",3,35,17)];
    new Vfd(xV,yF,6,()=>{return freqs[0];});
    new Vfd(xV+xD,yF,6,()=>{return freqs[1];});
    new Vfd(xV,yA,6,()=>{return ampls[0];});
    new Vfd(xV+xD,yA,6,()=>{return ampls[1];});
    new Vfd(xV,yP,6,()=>{return 360*phases[0]/512;});
    new Vfd(xV+xD,yP,6,()=>{return 360*phases[1]/512;});
    initChannels();
    k_intensity=new Knob(30,120,15,41,0,"Intensity",1);
    k_focus=new Knob(30,180,15,50,0,"Focus",1);
    k_illum=new Knob(30,240,15,50,0,"Illum",1);
    scope=new Scope(70,10,51,17);
    no_images_to_load=3;
    b_power=new button(15,30,30,30,"POWER",1);
    b_ch=[new button(xS+xD-150,yS-52,24,16,"ON",4),
        new button(xS+2*xD-150,yS-52,24,16,"ON",4)];
    vfd=new Image(); vfd.src='./images/vfd.jpg'; vfd.onload=()=>wait();
    led_on=new Image(); led_on.src='./images/led_on.jpg'; led_on.onload=()=>wait();
    led_off=new Image(); led_off.src='./images/led_off.jpg'; led_off.onload=()=>wait();
}

function wait() {
    no_images_to_load--;
    if (no_images_to_load==0) draw();
}

function draw() {
    ctx.save();
    ctx.fillStyle=bgcolor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    for (var i=0; i<ui.length; i++) ui[i].draw(ctx);
//    for (var i=0; i<2; i++) drawChannel(i+1,ch[i]);
}
