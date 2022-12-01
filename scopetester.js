
var canvas, ctx;
var b1=new Array(512), b2=new Array(512);
var b_trap=new Array(512), b_tria=new Array(512), b_sin=new Array(512), b_ecg=new Array(512);

function init() {
    console.log("ScopeTester - Peter Csurgay 2022");
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    init_buffers();
    draw();
}

function init_buffers() {
  var y=0, z=0, q=75;
  var P0=75, P1=20, P2=50, P3=40, P=15;
  var Q1=10, Q=25;
  var R1=45, R=150;
  var S1=30, S2=10, S=170;
  var T1=50, T2=100, T3=125, T=35;
  for (var ind = 0; ind <= 511; ind ++) {

    b_trap[ind] = y;
    b_tria[ind] = z;
    b_ecg[ind] = q;

    var angle_rad = 1.0 * ind * Math.PI / 256;
    b_sin[ind] = 127+128*Math.sin(angle_rad);

    if (ind<128) { y+=2; z++; }
    else if (ind<256) { y=255; z++; }
    else if (ind<384) { y-=2; z--; }
    else if (ind<512) { y=0; z--; }

    if (ind<P1) q=P0;
    else if (ind<P1+P2) q=P0+P*(-Math.sin(10*Math.PI/(P2+20))+Math.sin((10+ind-P1)*Math.PI/(P2+20)));
    else if (ind<P1+P2+P3) q=P0;
    else if (ind<P1+P2+P3+Q1) q=P0-Q*(ind-P1-P2-P3)/Q1;
    else if (ind<P1+P2+P3+Q1+R1) q=P0-Q+R*(ind-P1-P2-P3-Q1)/R1;
    else if (ind<P1+P2+P3+Q1+R1+S1) q=P0-Q+R-S*(ind-P1-P2-P3-Q1-R1)/S1;
    else if (ind<P1+P2+P3+Q1+R1+S1+S2) q=P0-Q+R-S+(Q-R+S)*(ind-P1-P2-P3-Q1-R1-S1)/S2;
    else if (ind<P1+P2+P3+Q1+R1+S1+S2+T1) q=P0;
    else if (ind<P1+P2+P3+Q1+R1+S1+S2+T1+T2) q=P0+T*(-Math.sin(15*Math.PI/(T2+30))+Math.sin((15+ind-P1-P2-P3-Q1-R1-S1-S2-T1)*Math.PI/(T2+30)));
    else q=P0;
  }
}

function draw() {
    drawChannel(1,b_sin);
    drawChannel(2,b_tria);
    drawChannel(3,b_trap);
    drawChannel(4,b_ecg);
}

function drawChannel(c,b) {
    ctx.moveTo(0,c*100);
    for (var i=0; i<b.length; i++) {
        ctx.lineTo(i,c*100-b[i]/2);
    }
    ctx.stroke();
}