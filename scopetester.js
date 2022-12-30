// ScopeTester - Peter Csurgay 2022
function init() {
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    mouseInit(canvas);
    initBufgen();
    siggen=[new Siggen(75,530,"1"),new Siggen(445,530,"2")];
    scope=new Scope(70,10,51,17);
    initChannels();
    timebase=1000000; // microseconds
    new DebugLabel(300,800,"free memory",15,()=>{return ""+
        "heap:"+window.performance.memory.totalJSHeapSize+
        " used:"+window.performance.memory.usedJSHeapSize+
        " limit:"+window.performance.memory.jsHeapSizeLimit;});
    b_power=new PowerButton(15,30,30,30,"POWER","power");
    // b_power.click(null); // need to switch on beacuse of media policy: on click needed before sound can be played
    no_images_to_load=4;
    vfd=new Image(); vfd.src='./images/vfd.jpg'; vfd.onload=()=>wait();
    vfd_=new Image(); vfd_.src='./images/vfd-.jpg'; vfd_.onload=()=>wait();
    led_on=new Image(); led_on.src='./images/led_on.jpg'; led_on.onload=()=>wait();
    led_off=new Image(); led_off.src='./images/led_off.jpg'; led_off.onload=()=>wait();
}

function wait() {
    no_images_to_load--;
    if (no_images_to_load==0) setTimeout(start,100);
}

function draw() {
    ctx.save();
    ctx.fillStyle=bgcolor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    for (var i=0; i<ui.length; i++) ui[i].draw(ctx);
}

function start() {
    draw();
//    setTimeout(run,10);
}

function run() {
    draw();
    if (b_power.state==1) setTimeout(run,1000);
}

var i=0, prevX=70, prevY=250;
function run1() {
    scope.drawScreen(ctx);
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth=6;
    ctx.strokeStyle="rgb(200,200,200)"
    ctx.moveTo(prevX,prevY);
    prevX=i; prevY=220-ch[0][i++]; if (i>=L) i=0;
    prevX+=20; if (prevX>600) prevX=70; 
    prevY+=Math.floor(3*Math.random())-1;
    if (prevX!=70) ctx.lineTo(prevX,prevY);
    ctx.stroke();
    ctx.restore();
    var kt=k_time.k.value0;
    var kt_=k_time.k_.value0;
    timebase=tb[kt+9]*tb_[kt_+10];
    if (b_power.state==1) setTimeout(run,timebase);
}
