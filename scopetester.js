// ScopeTester - Peter Csurgay 2022
function init() {
    canvas = document.getElementById("myCanvas");
    debugcanvas = document.getElementById("debugcanvas");
    ctx = canvas.getContext("2d");
    debugctx = debugcanvas.getContext("2d");
    ctx.lineJoin = "round";
    eventInit(canvas);
    eventInit(debugcanvas);
    presetManager=new PresetManager();
    new DebugLabel(460,355,"",15,()=>{return ""+
        "heap:"+window.performance.memory.totalJSHeapSize/1000000+
        " used:"+window.performance.memory.usedJSHeapSize/1000000+
        " limit:"+window.performance.memory.jsHeapSizeLimit/1000000;});
    no_images_to_load=8;
    vfdred=new Image(); vfdred.src='./images/vfdred.jpg'; vfdred.onload=()=>wait();
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
    ctx.beginPath();
    ctx.fillStyle=bgcolor;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fill();
}
function clearCanvasNoScreen(ctx) {
    ctx.beginPath();
    ctx.fillStyle=bgcolor;
    ctx.fillRect(0,0,canvas.width,10);
    ctx.fillRect(0,0,scope.x,scope.y+scope.h);
    ctx.fillRect(0,scope.y+scope.h,scope.x+scope.w,canvas.height-(scope.y+scope.h));
    ctx.fillRect(scope.x+scope.w,0,canvas.width-(scope.x+scope.w),canvas.height);
    ctx.fill();
    scope.drawFrame(ctx);
}

function draw(ctx) {
    // timebase
    scope.timebase=tb[scope.k_time.k.getValueA()+Math.floor(scope.k_time.k.ticks/2-1)]*
        tb_[scope.k_time.k_.getValue()+Math.floor(scope.k_time.k_.ticks/2)];
    // Cal LEDs
    scope.b_xcal.state=0;
    if (scope.k_time.k_.getValue()!=0) scope.b_xcal.showRed();
    for (let c=0; c<2; c++) {
        scope.ch[c].cal.state=0;
        if (scope.ch[c].k_volts.k_.getValue()!=0) scope.ch[c].cal.showRed();
    }
    // bnc state
    for (let c=0; c<2; c++) {
        scope.ch[c].bnc.state=scope.ch[c].b_ext.state;
    }
    // draw
    clearCanvasNoScreen(ctx);
    scope.drawSiggen(ctx);
    for (let i=0; i<uictx.length; i++) 
        uictx[i].draw(ctx);
    if (b_calib.state==1) {
        clearCanvas(debugctx);
        for (let i=0; i<uidebugctx.length; i++) uidebugctx[i].draw(debugctx);
    }
}
var b_bnc;
function start() {
    logWindow=document.getElementById('log');
    log(credit);
    initBufgen();
    siggen=[new Siggen(75,680,"1"),new Siggen(550,680,"2")];
    siggen[0].k_scale.value=7;
    scope=new Scope(70,10,DL/10,17);
    initChannels();
    initDebugIcons();
    draw(ctx);
    setTimeout(processEvent,100);
}

function log(msg) {
    logWindow.textContent = `${msg} \n${logWindow.textContent}`;
}

function trace(msg) {
    if (!isNaN(b_debug) && b_debug.state==1) {
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
//    else ctx.roundRect(x,y,w,h,r);
    else myRoundRect(ctx,x,y,w,h,r);
}
