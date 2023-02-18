/* Generates a signal forms as functions or buffers, has a name */
class BufferGenerator {
    constructor(pName,pFunction,pHalfBufferIcon) {
        this.name=pName;
        this.f=pFunction;
        this.halfIcon=pHalfBufferIcon;
    }
}

/* Creates BufferGenerators */
function initBufgen() {
    trace("initBufgen");
//    bufgen.push(new BufferGenerator("GND",f_gnd,'fullIcon'));
    bufgen.push(new BufferGenerator("SINE",f_sine,'fullIcon'));
    bufgen.push(new BufferGenerator("TRIANG",f_triangle_ideal,'fullIcon'));
//    bufgen.push(new BufferGenerator("PWM",f_pwm,'fullIcon'));
    bufgen.push(new BufferGenerator("SQUARE",f_square_ideal,'fullIcon'));
    bufgen.push(new BufferGenerator("HARMSQ",f_square_harmonic,'fullIcon'));
    bufgen.push(new BufferGenerator("TRAP",f_trapezoid,'fullIcon'));
    bufgen.push(new BufferGenerator("RAMP",f_ramp,'fullIcon'));
    bufgen.push(new BufferGenerator("FISHBONE",f_fishbone,'fullIcon'));
    bufgen.push(new BufferGenerator("GAUSS",f_gauss,'fullIcon'));
    bufgen.push(new BufferGenerator("SINC",f_sinc,'fullIcon'));
    bufgen.push(new BufferGenerator("PULSE",f_pulse,'fullIcon'));
//    bufgen.push(new BufferGenerator("Exp",f_exp,'fullIcon'));
    bufgen.push(new BufferGenerator("EXP",f_log,'fullIcon'));
    bufgen.push(new BufferGenerator("BEATS",f_beats,'fullIcon'));
    bufgen.push(new BufferGenerator("WAVE",f_wave,'fullIcon'));
    bufgen.push(new BufferGenerator("ECG",f_ecg,'fullIcon'));
    bufgen.push(new BufferGenerator("NTSC",f_ntsc,'fullIcon'));
    initMorse();
    bufgen.push(new BufferGenerator("MORSE",f_morse,'fullIcon'));
    // Menomano (LaLinea) eredeti plotter rajz -> buffer function buffer
    initMenomano();
    bufgen.push(new BufferGenerator("MENO",f_menomanoX,"halfIcon"));
    bufgen.push(new BufferGenerator("MANO",f_menomanoY,"halfIcon"));
//    bufgen.push(new BufferGenerator("Sawtooth",f_sawtooth,'fullIcon'));
//    bufgen.push(new BufferGenerator("HarmTri",f_triangle_harmonic,'fullIcon'));
}

var yy; // for vertical calculation;
var angle_rad; // for 2*PI calcultions

/* Calc BufferGenerator signals into sch based on siggen control settings */
function initChannels() {
    trace("initChannels");
    tailParts=[];
    for (let c=0; c<2; c++) {
        // amplitude
        ampls[c]=siggen[c].k_ampl.k.getValue();
        ampls_[c]=siggen[c].k_ampl.k_.getValue();
        ampls[c]=100*Math.pow(1.005,10*ampls[c])+ampls_[c]/10;
        if (ampls[c]<0.1) ampls[c]=0.1;
        // frequency
        scales[c]=parseFloat(scale[siggen[c].k_scale.getValue()]);
        freqs[c]=siggen[c].k_freq.k.getValue()/10;
        if (scales[c]==0.0001) freqs[c]=siggen[c].k_freq.k.getValue()/1;
        freqs_[c]=siggen[c].k_freq.k_.getValue()/1000;
        if (scales[c]==0.0001) freqs_[c]=siggen[c].k_freq.k_.getValue()/10;
        if (freqs[c]<0) freqs[c]=freqs[c]/10;
        freqs[c]=scales[c]*(1+freqs[c]+freqs_[c]);
        if (freqs[c]<0.00001) freqs[c]=0.00001;
        // phase
        phases[c]=15*siggen[c].k_phase.k.getValue()+siggen[c].k_phase.k_.getValue()/2; 
        if (phases[c]<0) phases[c]+=360;
        phases[c]=L*phases[c]/360;
        // dc offset
        dcs[c]=siggen[c].k_dc.k.getValue();
        dcs_[c]=siggen[c].k_dc.k_.getValue();
        dcs[c]=dcs[c]/10+dcs_[c]/1000;
    }
    NaNerror=false;
    // calc mic data into gench
    if (b_mic.state==1) {
        for (let c=0; c<2; c++) {
            schlen[c]=L;
            ampl=ampls[c];
            freq=freqs[c];
            for (let x=0; x<L; x++) if (!NaNerror) {
                sch[c][x]=(1-2*siggen[c].b_inv.state)*micch[c][x];
                if (isNaN(sch[c][x])) {
                    NaNerror=true;
                    error("buffer (mic) NaN: gench["+c+"]["+x+"]");
                }
            }
        }
    }
    // calc siggen data into sch
    else {
        for (let c=0; c<2; c++) {
            schlen[c]=bufgen[siggen[c].k_func.k.getValue()].f(-17);
            schdisc[c]=bufgen[siggen[c].k_func.k.getValue()].f(-21);
            ampl=ampls[c];
            freq=freqs[c];
            order=siggen[c].k_func.k_.getValue();
            for (let x=0; x<schlen[c]; x++) {
                yy=bufgen[siggen[c].k_func.k.getValue()].f(Math.round(x
                    +phases[c]),order);
                yy+=100*dcs[c];
                if (siggen[c].b_inv.state==1) yy=-yy;
                if (siggen[c].b_abs.state==1 && yy<0) yy=-yy;
                if (siggen[c].b_phalf.state==1 && yy<0) yy=0;
                if (siggen[c].b_nhalf.state==1 && yy>0) yy=0;
                sch[c][x]=yy;
                if (isNaN(sch[c][x])) {
                    error("buffer (siggen) NaN: sch["+c+"]["+x+"]");
                }
            }
        }
    }
}

/* Scales original plot into signal buffer */
function initMenomano() {
    trace("initMenomano");
    for (let i=0;i<menomano.length;i++) {
        if (i%2==0) mmx.push(2*menomano[i]-100);
        if (i%2==1) mmy.push(-2*menomano[i]+100);
    }
    for (let i=menomano.length-1;i>=0;i--) {
        if (i%2==0) mmx.push(2*menomano[i]-100);
        if (i%2==1) mmy.push(-2*menomano[i]+100);
    }
}
function f_menomanoX(x) {
    if (x==-17) return L; // sample length
    if (x==-21) return 0; // discontinuity points
    x=Math.floor((x)%L*mmx.length/L);
    if (x>=mmx.length) x=mmx.length-1;
    return ampl*mmx[x]/200;
}
function f_menomanoY(x) {
    if (x==-17) return L; // smaple length
    if (x==-21) return 0; // discontinuity points
    x=Math.floor((x)%L*mmy.length/L);
    if (x>=mmy.length) x=mmy.length-1;
    return ampl*mmy[x]/200;
}

const morseAbc={"a":".-","b":"-...","c":"-.-.","d":"-..","e":".","f":"..-.",
    "g":"--.","h":"....","i":"..","j":".---","k":"-.-","l":".-..","m":"--",
    "n":"-.","o":"---","p":".--.","q":"--.-","r":".-.","s":"...","t":"-",
    "u":"..-","v":"...-","w":".--","x":"-..-","y":"-.--","z":"--.."};
const morseText="la linea scopetester rulez";
const morseTime=7; // ticks in buffer
var morse=[];

function initMorse() {
    trace("initMorse");
    var low=0;
    var n=0;
    for (let i=0; i<morseText.length; i++) {
        var letter=morseText.charAt(i);
        if (letter==" ") for (let k=0; k<morseTime; k++) for (let l=0; l<7; l++) morse[n++]=low;
        else {
            var code=morseAbc[letter];
            for (let j=0; j<code.length; j++) {
                var symbol=code.charAt(j);
                for (let k=0; k<morseTime; k++) {
                    if (symbol==".") morse[n++]=1;
                    else if (symbol=="-") for (let l=0; l<3; l++) morse[n++]=1;
                }
                for (let k=0; k<morseTime; k++) morse[n++]=low;
            }
            for (let k=0; k<morseTime; k++) { morse[n++]=low; morse[n++]=low; morse[n++]=low; }
        }
    }
    for (let i=n; n<L; n++) morse[n]=0;
}
function f_morse(x) {
    if (x==-17) return L; // smaple length
    if (x==-21) return 0; // discontinuity threshold
    x=x%L;
    return ampl*morse[x];
}

const dn=L/102.4; // d for ntsc is 1 microsecond
function f_ntsc(x) {
    if (x==-17) return 64*dn; // smaple length
    if (x==-21) return 0; // discontinuity threshold
    x=x%(64*dn);
    if (x<2*dn) yResult=0;
    else if (x<6*dn) yResult=-0.4;
    else if (x<7*dn) yResult=0;
    else if (x<11*dn) yResult=0.2*Math.sin(256*Math.PI*(x-11*dn)/L);
    else if (x<12*dn) yResult=0;
    else if (x<13*dn) yResult=0.08;
    else if (x<14*dn) yResult=1.0;
    else if (x<62*dn) { var l=1.0-Math.floor((x-14*dn)/6/dn)/8; yResult=l+0.3*Math.sin(256*Math.PI*(x-16*dn)/L); }
    else if (x<63*dn) yResult=0.08;
    else yResult=0;
    return ampl*yResult;
}
function f_gnd(x) {
    if (x==-17) return L; // smaple length
    if (x==-21) return 0; // discontinuity threshold
    return 0;
}
function f_sine(x,o) {
    if (x==-17) return L; // smaple length
    if (x==-21) return 0; // discontinuity threshold
    if (o>16) o-=33;
    for (let i=16; i>2; i--) if (Math.abs(o)>i) o*=2;
    angle_rad = 1.0 * x * Math.PI / L2;
    if (o==0) 
        return ampl*Math.sin(angle_rad);
    else if (o>0) 
        return ampl*(2*Math.pow(Math.sin((angle_rad+Math.PI/2)/2),2*(o+1))-1);
    else 
        return ampl*(-(2*Math.pow(Math.sin((angle_rad+3*Math.PI/2)/2),2*(-(o-1)))-1));
}
function f_beats(x,o) {
    if (x==-17) return L; // smaple length
    if (x==-21) return 0; // discontinuity threshold
    o+=2;
    angle_rad = 1.0 * x * Math.PI / L2;
    return ampl*Math.sin(angle_rad*(o+2))*Math.sin(angle_rad);
}
function f_wave(x,o) {
    if (x==-17) return L; // smaple length
    if (x==-21) return 0; // discontinuity threshold
    o+=2;
    angle_rad = 1.0 * x * Math.PI / L2;
    return ampl/2*(Math.sin(angle_rad*(o+3))+Math.sin(angle_rad));
}
function f_gauss(x,o) {
    if (x==-17) return L; // smaple length
    if (x==-21) return 0; // discontinuity threshold
    x-=L/2;
    if (o>16) o-=33;
    angle_rad = 1.0 * x * Math.PI / L4;
    if (o>=0) angle_rad*=(angle_rad*(o*o+1));
    else angle_rad*=(angle_rad/(-o/2+1));
    return 2*ampl*Math.pow(Math.E,-angle_rad)-ampl;
}
function f_sinc(x,o) {
    if (x==-17) return L; // smaple length
    if (x==-21) return 0; // discontinuity threshold
    x-=L/2; if (x==0) x=0.001;
    if (o>16) o-=33;
    angle_rad = 1.0 * x * Math.PI / L2;
    return ampl*Math.sin((4+o/4)*Math.PI*angle_rad)/(Math.PI*angle_rad)/2;
}
function f_pulse(x,o) {
    if (x==-17) return L; // smaple length
    if (x==-21) return 0; // discontinuity threshold
    if (o>16) o-=33;
    var ox=Math.abs(o)+1;
    var Lx=L8/ox;
    if (x<=L2-Lx) return -f_gauss(x+Lx,ox-1)/2-ampl/2;
    else if (x>L2-Lx && x<L2+Lx) return f_sine(2*ox*x,0);
    else return f_gauss(x-Lx,ox-1)/2+ampl/2;
}
function f_exp(x,o) {
    if (x==-17) return L; // smaple length
    if (x==-21) return 0; // discontinuity threshold
    x=x%L;
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
    if (x==-17) return L; // smaple length
    if (x==-21) return 0; // discontinuity threshold
    x=x%L;
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
    if (x==-17) return L; // smaple length
    if (o>16) o-=33;
    if (x==-21) return 1; // discontinuity threshold
    x = x % L;
    if (x<L2+L2*o/16) return ampl; else return 0;
}
function f_square_ideal(x,o) {
    if (x==-17) return L; // smaple length
    if (o>16) o-=33;
    if (x==-21) return 1; // discontinuity threshold
    x = x % L;
    if (x==0) return ampl;
    else if (x<Math.round(L2+L2*o/16)) return ampl;
    else if (x==Math.round(L2+L2*o/16)) return -ampl;
    else if (x>Math.round(L2+L2*o/16)) return -ampl;
}
function f_square_harmonic(x,o) {
    if (x==-17) return L; // smaple length
    if (x==-21) return []; // discontinuity points
    o+=1;
    angle_rad = 1.0 * x * Math.PI / L2;
    if (o==33) { return f_square_ideal(x,0)};
    if (o==28) o=38;
    else if (o==29) o=50;
    else if (o==30) o=100;
    else if (o==31) o=200;
    else if (o==32) o=500;
    yResult=0; 
    for (let i=0; i<=o; i++) { var n=2*i+1; yResult+=4/Math.PI*ampl*Math.sin(angle_rad*n)/n; }
    return yResult;
}
function f_triangle_ideal(x,o) {
    if (x==-17) return L; // smaple length
    if (x==-21) return 0; // discontinuity points
    if (o>16) o-=33;
    x = x % L;
    if (x<L4+L4*o/16) return ampl*x/(L4+L4*o/16);
    else if (x<L-(L4+L4*o/16)) return ampl*(L2-x)/(L2-(L4+L4*o/16));
else return ampl*(x-(L-(L4+L4*o/16)))/(L4+L4*o/16)-ampl;
}    
function f_triangle_harmonic(x,o) {
    if (x==-17) return L; // smaple length
    if (x==-21) return 0; // discontinuity points
    angle_rad = 1.0 * x * Math.PI / L2;
    yResult=0; for (let i=0; i<=o; i++) { var n=2*i+1; yResult+=8*ampl*Math.pow(-1,i)*Math.sin(angle_rad*n)/n/n/Math.PI/Math.PI; }
    return yResult;
}
function f_trapezoid(x,o) {
    if (x==-17) return L; // smaple length
    if (x==-21) return 0; // discontinuity threshold
    if (o>16) o-=33;
    x = x % L;
    if (x<L8+L8*o/16) return ampl*x/(L8+L8*o/16);
    else if (x<L2-(L8+L8*o/16)) return ampl;
    else if (x<L2+(L8+L8*o/16)) return ampl*(L2-x)/(L8+L8*o/16);
    else if (x<L-(L8+L8*o/16)) return -ampl;
    else return 2*ampl*(x-L+L4+L4*o/16)/(L4+L4*o/16)-2*ampl;
}
function f_ramp(x,o) {
    if (x==-17) return L; // smaple length
    if (x==-21) return 1; // discontinuity threshold
    x = x % L;
    yResult=-ampl+2*ampl*x/(L*(33-o)/33);
    if (yResult>ampl) yResult=-ampl;
    return yResult;
}
function f_fishbone(x,o) {
    if (x==-17) return L; // smaple length
    if (x==-21) return 1; // discontinuity threshold
    x = x % L;
    if (x==0) yResult=-ampl+2*ampl*x/(L*(33-o)/33);
    else if (x<L2) yResult=-ampl+2*ampl*x/(L*(33-o)/33);
    else if (x==L2) yResult=-ampl+2*ampl*x/(L*(33-o)/33);
    else if (x>L2) yResult=2*ampl-2*ampl*x/(L*(33-o)/33);
//    if (yResult>ampl) yResult=-ampl;
    return yResult;
}
function f_sawtooth(x,o) {
    if (x==-17) return L; // smaple length
    if (x==-21) return 1; // discontinuity threshold
    x = x % L;
    yResult=ampl-2*ampl*x/(L*(33-o)/33);
    if (yResult<-ampl) yResult=ampl;
    return yResult;
}
function f_ecg(x,o) {
    if (x==-17) return 4*L; // smaple length
    if (x==-21) return 0; // discontinuity threshold
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
