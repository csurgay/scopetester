// ScopeTester - Peter Csurgay 2022
function init() {
    canvas = document.getElementById("myCanvas");
    debugcanvas = document.getElementById("debugcanvas");
    ctx = canvas.getContext("2d");
    debugctx = debugcanvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    eventInit(canvas);
    eventInit(debugcanvas);
    presetManager=new PresetManager();
    new DebugLabel(460,355,"",15,()=>{return ""+
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

var ati=0, atknob=0, attimer; // autotest

function autotest() {
    while(ati<uictx.length && atknob==0) {
        if (uictx[ati++].class=="Knob") {
            atknob=1;
        }
    }
    if (atknob++>0) {
        if (atknob<4) uictx[ati-1].turnY(1);
        else if (atknob<10) uictx[ati-1].turnY(-1);
        else if (atknob<11) uictx[ati-1].clickXY(0,0);
        else atknob=0;
        initChannels();
        draw(ctx);
        attimer=setTimeout(autotest,1);
    }
    else {
        ati=0;
        atknob=0;
        draw(ctx);
    }
}

function wait() {
    no_images_to_load--;
    if (no_images_to_load==0) setTimeout(start,100);
}

function clearCanvas(ctx) {
    ctx.fillStyle=bgcolor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function draw(ctx) {
    // Cal LEDs
    b_xcal.state=0;
    if (k_time.k_.getValue()!=0) b_xcal.showRed();
    b_ycal.state=0;
    if (scope.ch[0].k_volts.k_.getValue()!=0) b_ycal.showRed();
    if (scope.ch[1].k_volts.k_.getValue()!=0) b_ycal.showRed();
    // draw
    clearCanvas(ctx);
    clearCanvas(debugctx);
    for (let i=0; i<uictx.length; i++) uictx[i].draw(ctx);
    for (let i=0; i<uidebugctx.length; i++) uidebugctx[i].draw(debugctx);
}

function start() {
    logWindow=document.getElementById('log');
    log(credit);
    initBufgen();
    siggen=[new Siggen(75,530,"1"),new Siggen(415,530,"2")];
    scope=new Scope(70,10,DL/10,17);
    initChannels();
    initMonitor();
    b_power=new PowerButton(10,25,40,35,"ON","power");
    draw(ctx);
    setTimeout(processEvent,100);
}

function log(msg) {
    logWindow.textContent = `${msg} \n${logWindow.textContent}`;
}

function trace(msg) {
    if (isNaN(b_debug) || b_debug.state==1) {
        traceString += " . "+msg;
    }
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
