// ScopeTester - Peter Csurgay 2022

function init() {
    console.log("ScopeTester - Peter Csurgay 2022");
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    mouseInit(canvas);
    initBufgen();
    siggen=[new Siggen(75,530,"1",3),new Siggen(445,530,"2",7)];
    initChannels();
    scope=new Scope(70,10,51,17);
    no_images_to_load=3;
    b_power=new PowerButton(15,30,30,30,"POWER","power");
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
