// ScopeTester - Peter Csurgay 2022
function init() {
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    mouseInit(canvas);
    timebase=1000000; // microseconds
    new DebugLabel(460,455,"",15,()=>{return ""+
        "heap:"+window.performance.memory.totalJSHeapSize/1000000+
        " used:"+window.performance.memory.usedJSHeapSize/1000000+
        " limit:"+window.performance.memory.jsHeapSizeLimit/1000000;});
    no_images_to_load=7;
    vfd=new Image(); vfd.src='./images/vfds.jpg'; vfd.onload=()=>wait();
    vfd_=new Image(); vfd_.src='./images/vfd-s.jpg'; vfd_.onload=()=>wait();
    led_on=new Image(); led_on.src='./images/led_on_2416.jpg'; led_on.onload=()=>wait();
    led_on_powers=new Image(); led_on_powers.src='./images/PowerOnGreenS.jpg'; led_on_powers.onload=()=>wait();
    led_off=new Image(); led_off.src='./images/led_off_2416.jpg'; led_off.onload=()=>wait();
    led_off_powers=new Image(); led_off_powers.src='./images/PowerOffGreenS.jpg'; led_off_powers.onload=()=>wait();
    led_red=new Image(); led_red.src='./images/led_red_2416.jpg'; led_red.onload=()=>wait();
}

function wait() {
    no_images_to_load--;
    if (no_images_to_load==0) setTimeout(start,100);
}

function draw(ctx) {
    // Cal LEDs
    b_xcal.state=0;
    if (k_time.k_.getValue()!=0) b_xcal.showRed();
    b_ycal.state=0;
    if (scope.ch[0].k_volts.k_.getValue()!=0) b_ycal.showRed();
    if (scope.ch[1].k_volts.k_.getValue()!=0) b_ycal.showRed();
    // draw
    ctx.fillStyle=bgcolor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (var i=0; i<ui.length; i++) ui[i].draw(ctx);
}

function start() {
    logWindow=document.getElementById('log');
    log(credit);
    initBufgen();
    siggen=[new Siggen(75,530,"1"),new Siggen(445,530,"2")];
    scope=new Scope(70,10,DL/10,17);
    initChannels();
    b_power=new PowerButton(10,25,40,35,"ON","power");
    draw(ctx);
    setTimeout(processEvent,100);
}

function log(msg) {
    logWindow.textContent = `${msg} \n${logWindow.textContent}`;
}

function trace(msg) {
    traceString += " . "+msg;
}

function error(msg) {
    console.error(new Date(Date.now()).toISOString()+": "+msg);
}

function myRoundRect(ctx,x,y,w,h,r) {
    ctx.moveTo(x+r,y);
    ctx.lineTo(x+w-r,y);
    ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r);
    ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h);
    ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r);
    ctx.quadraticCurveTo(x,y,x+r,y);
}
function roundRect(ctx,x,y,w,h,r) {
    if (typeof InstallTrigger !== 'undefined') myRoundRect(ctx,x,y,w,h,r);
    else ctx.roundRect(x,y,w,h,r);
}

function run() {
    draw(ctx);
    if (b_power.state==1) setTimeout(run,1000);
}

var i=0, prevX=70, prevY=250;
function run1() {
    scope.drawScreen(ctx);
    ctx.beginPath();
    ctx.lineWidth=6;
    ctx.strokeStyle="rgb(200,200,200)"
    ctx.moveTo(prevX,prevY);
    prevX=i; prevY=220-ch[0][i++]; if (i>=L) i=0;
    prevX+=20; if (prevX>600) prevX=70; 
    prevY+=Math.floor(3*Math.random())-1;
    if (prevX!=70) ctx.lineTo(prevX,prevY);
    ctx.stroke();
    ctx.lineWidth=1;
    var kt=k_time.k.getValue();
    var kt_=k_time.k_.getValue();
    timebase=tb[kt+9]*tb_[kt_+10];
    if (b_power.state==1) setTimeout(run,timebase);
}
