class BufferGenerator {
    constructor(pName,pFunction,pHalfBufferIcon) {
        this.name=pName;
        this.f=pFunction;
        this.halfIcon=pHalfBufferIcon;
    }
}

function initBufgen() {
//    bufgen.push(new BufferGenerator("GND",f_gnd,'fullIcon'));
    bufgen.push(new BufferGenerator("Sine",f_sine,'fullIcon'));
    bufgen.push(new BufferGenerator("Triangle",f_triangle_ideal,'fullIcon'));
//    bufgen.push(new BufferGenerator("PWM",f_pwm,'fullIcon'));
    bufgen.push(new BufferGenerator("Square",f_square_ideal,'fullIcon'));
    bufgen.push(new BufferGenerator("Square7",f_square_harmonic,'fullIcon'));
    bufgen.push(new BufferGenerator("Trapezoid",f_trapezoid,'fullIcon'));
    bufgen.push(new BufferGenerator("Ramp",f_ramp,'fullIcon'));
    bufgen.push(new BufferGenerator("Sinc",f_sinc,'fullIcon'));
    bufgen.push(new BufferGenerator("Exp",f_exp,'fullIcon'));
    bufgen.push(new BufferGenerator("Log",f_log,'fullIcon'));
    bufgen.push(new BufferGenerator("Beats",f_beats,'fullIcon'));
    bufgen.push(new BufferGenerator("ECG",f_ecg,'fullIcon'));
    // Menomano (LaLinea) eredeti plotter rajz -> buffer function
    initMenomano();
    bufgen.push(new BufferGenerator("MenoX",f_menomanoX,"halficon"));
    bufgen.push(new BufferGenerator("MenoY",f_menomanoY,"halficon"));
//    bufgen.push(new BufferGenerator("Sawtooth",f_sawtooth,'fullIcon'));
//    bufgen.push(new BufferGenerator("Triangle7",f_triangle_harmonic,'fullIcon'));
}

function initMenomano() {
    var l=menomano.length/2;
    for (var i=0;i<l;i++) {
        mmx.push(2*menomano[i*2]-100);
        mmy.push(-2*menomano[i*2+1]+100);
    }
    for (var i=0;i<l;i++) {
        mmx.push(2*menomano[2*l-i*2-0]-100);
        mmy.push(-2*menomano[2*l-i*2+1]+100);
    }
}

var yy; // for vertical calculation;
var angle_rad; // for 2*PI calcultions

function initChannels() {
    for (var i=0; i<2; i++) {
        // amplitude
        ampls[i]=siggen[i].k_ampl.k.value0;
        ampls_[i]=siggen[i].k_ampl.k_.value0;
        ampls[i]=100*Math.pow(1.005,10*ampls[i])+ampls_[i]/10;
        if (ampls[i]<0.1) ampls[i]=0.1;
        // frequency
        scales[i]=parseFloat(scale[siggen[i].k_scale.value]);
        freqs[i]=siggen[i].k_freq.k.value0;
        freqs_[i]=siggen[i].k_freq.k_.value0;
        freqs[i]/=10.0; if (freqs[i]<0) freqs[i]=freqs[i]/10;
        freqs_[i]/=1000.0;
        freqs[i]=scales[i]*(freqs[i]+1)+freqs_[i];
        if (freqs[i]<0.001) freqs[i]=0.001;
        // phase
        phases[i]=15*siggen[i].k_phase.k.value+siggen[i].k_phase.k_.value0/2; 
        if (phases[i]<0) phases[i]+=360;
        phases[i]=L*phases[i]/360;
        // dc offset
        dcs[i]=siggen[i].k_dc.k.value0;
        dcs_[i]=siggen[i].k_dc.k_.value0;
        dcs[i]=dcs[i]/10+dcs_[i]/1000;
    }
    for (var i=0; i<2; i++) {
        ampl=ampls[i];
        freq=freqs[i];
        order=siggen[i].k_func.k_.value;
        for (var x=0; x<N*L; x++) {
            if (b_mic.state==1) {
                sch[i][x]=(1-2*siggen[i].b_inv.state)*micch[i][(freq*x+phases[i])];
            }
            else {
                yy=bufgen[siggen[i].k_func.k.value].f(x+phases[i],order);
                yy+=100*dcs[i];
                if (siggen[i].b_inv.state==1) yy=-yy;
                if (siggen[i].b_abs.state==1 && yy<0) yy=-yy;
                if (siggen[i].b_phalf.state==1 && yy<0) yy=0;
                if (siggen[i].b_nhalf.state==1 && yy>0) yy=0;
                sch[i][x]=yy;
            }
        }
    }
}

function f_menomanoX(x) {
    x=Math.round((x)%L*mmx.length/L);
    return ampl*mmx[x]/200;
}
function f_menomanoY(x) {
    x=Math.round((x)%L*mmy.length/L);
    return ampl*mmy[x]/200;
}
function f_gnd(x) {
    return 0;
}
function f_sine(x,o) {
    if (o>16) o-=33;
    for (var i=16; i>2; i--) if (Math.abs(o)>i) o*=2;
    angle_rad = 1.0 * x * Math.PI / L2;
    if (o==0) 
        return ampl*Math.pow(Math.sin(angle_rad),1);
    else if (o>0) 
        return ampl*(2*Math.pow(Math.sin((angle_rad+Math.PI/2)/2),2*(o+1))-1);
    else 
        return ampl*(-(2*Math.pow(Math.sin((angle_rad+3*Math.PI/2)/2),2*(-(o-1)))-1));
}
function f_beats(x,o) {
    o+=2;
    angle_rad = 1.0 * x * Math.PI / L2;
    return ampl*Math.sin(angle_rad*(o+2))*Math.sin(angle_rad);
}
function f_sinc(x,o) {
    x-=L/2;
    if (o>16) o-=33;
    angle_rad = 1.0 * x * Math.PI / L2;
    return ampl*Math.sin((2+o/8)*Math.PI*angle_rad)/(Math.PI*angle_rad);
}
function f_exp(x,o) {
    angle_rad=x*Math.PI/L2;
    if (o>16) o-=33;
        yy=Math.E*Math.pow(2,o);
        yResult=2*ampl*Math.pow(yy,angle_rad)/Math.pow(yy,2*Math.PI)-ampl;
    if (o<0) {
        yResult=2*ampl*( (16+o)*(Math.pow(Math.E,angle_rad)/Math.pow(Math.E,2*Math.PI)) 
        + (-o)*((o*x)/(o*L)) ) / 16 -ampl;
    }
    return yResult;
}
function f_log(x,o) {
    if (x==L) return ampl;
    angle_rad=1.0*(L-x)*Math.PI/L2;
    if (o>16) o-=33;
        yy=Math.E*Math.pow(2,o);
        yResult=-2*ampl*Math.pow(yy,angle_rad)/Math.pow(yy,2*Math.PI)+ampl;
    if (o<0) {
        yResult=-2*ampl*( (16+o)*(Math.pow(Math.E,angle_rad)/Math.pow(Math.E,2*Math.PI)) 
        + (-o)*((o*(L-x))/(o*L)) ) / 16 +ampl;
    }
    return yResult;
}
function f_pwm(x,o) {
    if (o>16) o-=33;
    x = x % L;
    if (x<L2+L2*o/16) return ampl; else return 0;
}
function f_square_ideal(x,o) {
    if (o>16) o-=33;
    x = x % L;
    if (x<L2+L2*o/16) return ampl; else return -ampl;
}
function f_square_harmonic(x,o) {
    o+=1;
    angle_rad = 1.0 * x * Math.PI / L2;
    if (o==33) { return f_square_ideal(x,0)};
    if (o==28) o=38;
    else if (o==29) o=50;
    else if (o==30) o=100;
    else if (o==31) o=200;
    else if (o==32) o=500;
    yResult=0; 
    for (var i=0; i<=o; i++) { var n=2*i+1; yResult+=4/Math.PI*ampl*Math.sin(angle_rad*n)/n; }
    return yResult;
}
function f_triangle_ideal(x,o) {
    if (o>16) o-=33;
    x = x % L;
    if (x<L4+L4*o/16) return ampl*x/(L4+L4*o/16);
    else if (x<L-(L4+L4*o/16)) return ampl*(L2-x)/(L2-(L4+L4*o/16));
else return ampl*(x-(L-(L4+L4*o/16)))/(L4+L4*o/16)-ampl;
}    
function f_triangle_harmonic(x,o) {
    angle_rad = 1.0 * x * Math.PI / L2;
    yResult=0; for (var i=0; i<=o; i++) { var n=2*i+1; yResult+=8*ampl*Math.pow(-1,i)*Math.sin(angle_rad*n)/n/n/Math.PI/Math.PI; }
    return yResult;
}
function f_trapezoid(x,o) {
    if (o>16) o-=33;
    x = x % L;
    if (x<L8+L8*o/16) return ampl*x/(L8+L8*o/16);
    else if (x<L2-(L8+L8*o/16)) return ampl;
    else if (x<L2+(L8+L8*o/16)) return ampl*(L2-x)/(L8+L8*o/16);
    else if (x<L-(L8+L8*o/16)) return -ampl;
    else return 2*ampl*(x-L+L4+L4*o/16)/(L4+L4*o/16)-2*ampl;
}
function f_ramp(x,o) {
    x = x % L;
    yResult=-ampl+2*ampl*x/(L*(33-o)/33);
    if (yResult>ampl) yResult=-ampl;
    return yResult;
}
function f_sawtooth(x,o) {
    x = x % L;
    yResult=ampl-2*ampl*x/(L*(33-o)/33);
    if (yResult<-ampl) yResult=ampl;
    return yResult;
}
function f_ecg(x,o) {
    if (o>16) o-=33; o=-o;
    x = x % L;
    var H=140.0*ampl/127;
    var h=L/DL;
    var P0=-60, P1=h*(30-o), P2=h*(80+2*o), P3=h*20, P=H/(8.0+o/4);
    var Q1=h*(10+o/2), Q=H/(4.0)-o;
    var R1=h*(30+o), R=3*H/(2.0)-2*o;
    var S1=h*(30+o), S2=h*(10+o/2), S=5*H/(3.0)-2*o;
    var T1=h*20, T2=h*(150+3*o), T3=h*(130-2*o), T=H/(4.0+o/10);
    if (x<P1) yResult=P0;
    else if (x<P1+P2) yResult=P0+P*Math.sin((x-P1)*Math.PI/P2)-P/3*Math.sin((x-P1)*3*Math.PI/P2);
    else if (x<P1+P2+P3) yResult=P0;
    else if (x<P1+P2+P3+Q1) yResult=P0-Q*(x-P1-P2-P3)/Q1;
    else if (x<P1+P2+P3+Q1+R1) yResult=P0-Q+R*(x-P1-P2-P3-Q1)/R1;
    else if (x<P1+P2+P3+Q1+R1+S1) yResult=P0-Q+R-S*(x-P1-P2-P3-Q1-R1)/S1;
    else if (x<P1+P2+P3+Q1+R1+S1+S2) yResult=P0-Q+R-S+(Q-R+S)*(x-P1-P2-P3-Q1-R1-S1)/S2;
    else if (x<P1+P2+P3+Q1+R1+S1+S2+T1) yResult=P0;
    else if (x<P1+P2+P3+Q1+R1+S1+S2+T1+T2) yResult=P0+T*Math.sin((x-P1-P2-P3-Q1-R1-S1-S2-T1)*Math.PI/T2)-2*T/5*Math.sin((x-P1-P2-P3-Q1-R1-S1-S2-T1)*3*Math.PI/T2);
    else if (x<P1+P2+P3+Q1+R1+S1+S2+T1+T2+T3) yResult=P0;
    else yResult=P0;
    return yResult;
}
