class BufferGenerator {
    constructor(pName,pFunction) {
        this.name=pName;
        this.f=pFunction;
    }
}

function initBufgen() {
//    bufgen.push(new BufferGenerator("GND",f_gnd));
    bufgen.push(new BufferGenerator("Ramp",f_ramp));
    bufgen.push(new BufferGenerator("Sine",f_sine));
    bufgen.push(new BufferGenerator("Square",f_square_ideal));
    bufgen.push(new BufferGenerator("Square7",f_square_harmonic));
    bufgen.push(new BufferGenerator("Triangle",f_triangle_ideal));
    bufgen.push(new BufferGenerator("Trapezoid",f_trapezoid));
    bufgen.push(new BufferGenerator("Sinc",f_sinc));
    bufgen.push(new BufferGenerator("ECG",f_ecg));
//    bufgen.push(new BufferGenerator("Sawtooth",f_sawtooth));
//    bufgen.push(new BufferGenerator("Triangle7",f_triangle_harmonic));
}

function initChannels() {
    for (var i=0; i<2; i++) {
        var s=siggen[i];
        ampls[i]=s.k_ampl.value; if (ampls[i]>s.k_ampl.ticks/2) ampls[i]-=s.k_ampl.ticks; ampls[i]=140+ampls[i]*10;
        freqs[i]=s.k_freq.k.value; if (freqs[i]>s.k_freq.k.ticks/2) freqs[i]-=s.k_freq.k.ticks;
        freqs_[i]=s.k_freq.k_.value; if (freqs_[i]>s.k_freq.k_.ticks/2) freqs_[i]-=s.k_freq.k_.ticks;
        freqs[i]=Math.pow(frq[Math.abs(freqs[i])],Math.sign(freqs[i]))-1+Math.pow(sqrt,freqs_[i]);
        var offset=Math.floor(512.0*s.k_phase.k.value/s.k_phase.k.ticks);
        var off_=s.k_phase.k_.value; if (off_>10) off_-=21;
        var offset_=Math.floor(512.0/s.k_phase.k.ticks*off_/s.k_phase.k_.ticks);
        phases[i]=offset+offset_; if (phases[i]<0) phases[i]+=512;
    }
    for (var i=0; i<2; i++) {
        var s=siggen[i];
        ampl=ampls[i];
        freq=freqs[i];
        order=s.k_func.k_.value;
        for (var x=0; x<512; x++) {
            var phaseX=x+phases[i];
            if (phaseX>=512) phaseX-=512;
            if (phaseX<0) phaseX+=512;
//            ch[i][phaseX]=bufgen[k_func[i].k.value].f(freq*(x-256));
            ch[i][phaseX]=(1-2*s.b_inv.state)*bufgen[s.k_func.k.value].f(freq*x);
        }
    }
}

function f_gnd(x) {
    var o=order; if (o>16) o-=33;
    return ampl*o/16;
}
function f_sine(x) {
    var o=order; if (o>16) o-=33;
    var angle_rad = 1.0 * x * Math.PI / 256;
    return ampl*Math.sin((1+o/16)*angle_rad);
}
function f_sinc(x) {
    x-=256;
//    if (x==0) return (1+o/16)*ampl;
    var o=order; if (o>16) o-=33;
    var angle_rad = 1.0 * x * Math.PI / 256;
    return ampl*Math.sin((1+o/16)*Math.PI*angle_rad)/(Math.PI*angle_rad);
}
function f_square_ideal(x) {
    var o=order; if (o>16) o-=33;
    x = x % 512;
    if (x<256+256*o/16) return ampl; else return 0;
}
function f_square_harmonic(x) {
    var o=order+1;
    var angle_rad = 1.0 * x * Math.PI / 256;
    if (o==33) return f_square_ideal(x);
    if (o==28) o=38;
    else if (o==29) o=50;
    else if (o==30) o=100;
    else if (o==31) o=200;
    else if (o==32) o=500;
    var y=0; for (var i=0; i<=o; i++) { var n=2*i+1; y+=4/Math.PI*ampl*Math.sin(angle_rad*n)/n; }
    return y;
}
function f_triangle_ideal(x) {
    var o=order; if (o>16) o-=33;
    x = x % 512;
    if (x<128+128*o/16) return ampl*x/(128+128*o/16);
    else if (x<512-(128+128*o/16)) return ampl*(256-x)/(256-(128+128*o/16));
else return ampl*(x-(512-(128+128*o/16)))/(128+128*o/16)-ampl;
}    
function f_triangle_harmonic(x) {
    var angle_rad = 1.0 * x * Math.PI / 256;
    var y=0; for (var i=0; i<=order; i++) { var n=2*i+1; y+=8*ampl*Math.pow(-1,i)*Math.sin(angle_rad*n)/n/n/Math.PI/Math.PI; }
    return y;
}
function f_trapezoid(x) {
    var o=order; if (o>16) o-=33;
    x = x % 512;
    if (x<64+64*o/16) return ampl*x/(64+64*o/16);
    else if (x<256-(64+64*o/16)) return ampl;
    else if (x<256+(64+64*o/16)) return ampl*(256-x)/(64+64*o/16);
    else if (x<448-64*o/16) return -ampl;
    else return 2*ampl*(x-512+128+128*o/16)/(128+128*o/16)-2*ampl;
}
function f_ramp(x) {
    var h=512*(33-order)/33;
    x = x % 512;
    var ret=-ampl+2*ampl*x/h;
    if (ret>ampl) ret=-ampl;
    return ret;
}
function f_sawtooth(x) {
    var h=512*(33-order)/33;
    x = x % 512;
    var ret=ampl-2*ampl*x/h;
    if (ret<-ampl) ret=ampl;
    return ret;
}
function f_ecg(x) {
    var o=order; if (o>16) o-=33; o=-o; var oo=o/4;
    x = x % 512;
    var y;
    var H=140.0*ampl/127;
    var P0=-60, P1=30-o, P2=80+2*o, P3=20, P=H/(8.0+o/4);
    var Q1=10+o/2, Q=H/(4.0)-o;
    var R1=30+o, R=3*H/(2.0)-2*o;
    var S1=30+o, S2=10+o/2, S=5*H/(3.0)-2*o;
    var T1=20, T2=150+3*o, T3=130-2*o, T=H/(4.0+o/10);
    if (x<P1) y=P0;
    else if (x<P1+P2) y=P0+P*Math.sin((x-P1)*Math.PI/P2)-P/3*Math.sin((x-P1)*3*Math.PI/P2);
    else if (x<P1+P2+P3) y=P0;
    else if (x<P1+P2+P3+Q1) y=P0-Q*(x-P1-P2-P3)/Q1;
    else if (x<P1+P2+P3+Q1+R1) y=P0-Q+R*(x-P1-P2-P3-Q1)/R1;
    else if (x<P1+P2+P3+Q1+R1+S1) y=P0-Q+R-S*(x-P1-P2-P3-Q1-R1)/S1;
    else if (x<P1+P2+P3+Q1+R1+S1+S2) y=P0-Q+R-S+(Q-R+S)*(x-P1-P2-P3-Q1-R1-S1)/S2;
    else if (x<P1+P2+P3+Q1+R1+S1+S2+T1) y=P0;
    else if (x<P1+P2+P3+Q1+R1+S1+S2+T1+T2) y=P0+T*Math.sin((x-P1-P2-P3-Q1-R1-S1-S2-T1)*Math.PI/T2)-2*T/5*Math.sin((x-P1-P2-P3-Q1-R1-S1-S2-T1)*3*Math.PI/T2);
    else if (x<P1+P2+P3+Q1+R1+S1+S2+T1+T2+T3) y=P0;
    else y=P0;
    return y;
}
