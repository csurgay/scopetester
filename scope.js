var d, dd; // for UI layout geometry calculations
var ast, asl, asx, asy; // astigm control value, line multiplication, x,y direction
var illum, int1, int2, int3, blur1, blur2, alpha1, ss; // for scale grid illumination, inensity and focus blur value
var Q,QI; // for frequency calculations
var tptr=[0,0], lastTptr=[0,0], tcond; // trigger pointer, last valid tptr, trigger condition
var currValue, prevValue; // curr and prev y value for trigger condition calc
var slope, tlevel; // trigger level
var px,py0,py=[0,0]; // screen center lines for channels and dual

class Scope extends pObject {
    constructor(pX,pY,pD,pDD) {
        super(pX,pY,10*pD+2*pDD,8*pD+2*pDD);
        this.d=pD;
        this.dd=pDD;
        ui.push(this);
        new Frame(620,15,310,255,"Horizontal","center");
        new Frame(620,283,310,170,"Vertical","center");
        new Frame(750,630,85,145,"Mode","center");
        new Frame(845,630,85,145,"Monitor","center");
        new Frame(750,465,180,150,"Trigger","center");
        k_vol=new Knob(8,885,675,20,17,0,"Volume","knob");
        k_vol.setSwitchBufferNeeded();
        k_monitor=new MonitorKnob(885,735);
        b_ch1=new ChOnButton(795,650,24,16,"CH1","on",false);
        b_ch2=new ChOnButton(795,650,24,16,"CH2","on",false);
        b_chon=[b_ch1,b_ch2];
        b_dual=new ChOnButton(795,650,24,16,"ALT","on",false);
        b_add=new ChOnButton(795,650,24,16,"ADD","on",false);
        b_mod=new ChOnButton(795,650,24,16,"AM","on",false);
        b_xy=new ChOnButton(795,650,24,16,"X-Y","on",false);
        radio_mode=new Radio(795,650,[b_ch1,b_ch2,b_dual,b_add,b_mod,b_xy],false);
        b_auto=new ChOnButton(895,530,24,16,"Auto","on");
        b_ch1tr=new ChOnButton(895,530,24,16,"CH1","on");
        b_ch2tr=new ChOnButton(895,530,24,16,"CH2","on");
        b_mode=new ChOnButton(895,530,24,16,"Mode","on");
        b_chtr=[b_ch1tr,b_ch2tr];
        radio_trig=new Radio(895,530,[b_auto,b_ch1tr,b_ch2tr,b_mode]);
        b_limit=new IndicatorLed(895,480,24,16,"Limit","on");
        b_find=new FindButton(20,360,24,16,"Find","small");
        b_resv=new ResvButton(20,395,24,16,"Preset","small");
        b_mic=new MicButton(20,1380,24,16,"Mic","small");
        b_debug=new DebugButton(20,430,24,16,"Debug","small");
        this.ch=[new ScopeChannel(685,80), new ScopeChannel(825,80)];
        k_intensity=new Knob(8,30,105,15,17,0,"Intensity","knob");
        k_focus=new Knob(8,30,160,15,17,0,"Focus","knob");
        k_astigm=new Knob(8,30,215,15,17,0,"Astigm","knob");
        k_illum=new Knob(16,30,270,15,17,0,"Illum","knob");
        k_illum.value0=false;
        k_rot=new Knob(15,30,325,15,31,0,"Rotation","knob");
        k_time=new TimeKnob(850,180);
        new Vfd(710,75,4,()=>{return 10*k_delay.k.getValue()+k_delay.k_.getValue();},()=>{return b_power.state==0 || 10*k_delay.k.getValue()+k_delay.k_.getValue()==0;});
        k_delay=new DoubleKnob(665,75,100,100,"Delay","double",35,20);
        k_delay.k.value0=false;
        k_delay.k_.value0=false;
        k_delay.k.limit=k_delay.k.ticks-1;
        k_delay.k_.limit=k_delay.k_.ticks-1;
        k_delaybase=new DelaybaseKnob(695,180);
        k_xpos=new Knob(24,820,75,20,49,0,"Pos X","knob");
        b_xcal=new IndicatorLed(895,90,24,16,"Cal","on");
        b_ycal=new IndicatorLed(660,430,24,16,"Cal","on");
        k_trig=new DoubleKnob(800,520,50,50,"Level","double_s",30,15);
        k_trig.k.defaultFastRate=1;
//        k_hold=new DoubleKnob(880,520,50,50,"HoldOff","double_s",30,15);
        k_slope=new Knob(-1,800,590,17,2,0,"Slope","knob");
        k_slope.value0=false;
        k_mode=new ModeKnob(792,680);
        b_fft=new ChOnButton(792,740,24,16,"FFT","on");
    }
    drawScreen(ctx) {
        // draw screen
        ctx.beginPath();
        ctx.fillStyle = shadowcolor;
        roundRect(ctx, this.x+5, this.y+5, this.w+15, this.h+15, 20);
        ctx.fill();
        ctx.beginPath();
        ctx.strokeStyle = "rgb(25, 50, 25)";
        ctx.lineWidth=20;
        ctx.fillStyle = "rgba(50, 100, 50, 1)";
        roundRect(ctx, this.x, this.y, this.w, this.h, 20);
        ctx.stroke();
        ctx.fill();
        ctx.beginPath();
        ctx.strokeStyle = "rgb(0, 25, 0)";
        ctx.lineWidth=1;
        // draw grid
        d=this.d;
        dd=this.dd;
        illum=Math.floor(127*k_illum.getValue()/k_illum.ticks);
        if (illum>0)
            ctx.strokeStyle = "rgb("+(128+illum)+", "+(128+illum)+", "+(128+illum)+")";
        for (var i=dd; i<=this.w-dd+1; i+=d) {
            ctx.moveTo(this.x+i,this.y+dd);
            ctx.lineTo(this.x+i,this.y+this.h-dd);
        }
        for (var i=dd; i<=this.h-dd+1; i+=d) {
            ctx.moveTo(this.x+dd,this.y+i);
            ctx.lineTo(this.x+this.w-dd,this.y+i);
        }
        // draw hair
        for (var i=dd; i<=this.w-dd+1; i+=d/5) {
            ctx.moveTo(this.x+i,this.y+this.h/2-dd/4);
            ctx.lineTo(this.x+i,this.y+this.h/2+dd/4);
        }
        for (var i=dd; i<=this.h-dd+1; i+=d/5) {
            ctx.moveTo(this.x+this.w/2-dd/4,this.y+i);
            ctx.lineTo(this.x+this.w/2+dd/4,this.y+i);
        }
        for (var i=dd; i<=this.w-dd+1; i+=d/5) {
            ctx.moveTo(this.x+i,this.y+dd+2*d-dd/8);
            ctx.lineTo(this.x+i,this.y+dd+2*d+dd/8);
        }
        for (var i=dd; i<=this.w-dd+1; i+=d/5) {
            ctx.moveTo(this.x+i,this.y+dd+6*d-dd/8);
            ctx.lineTo(this.x+i,this.y+dd+6*d+dd/8);
        }
        // draw dots
        for (var i=dd; i<=this.w-dd+1; i+=d/5) {
            ctx.moveTo(this.x+i,this.y+dd+6*d+d/2);
            ctx.lineTo(this.x+i,this.y+dd+6*d+d/2+1);
        }
        for (var i=dd; i<=this.w-dd+1; i+=d/5) {
            ctx.moveTo(this.x+i,this.y+dd+d+d/2);
            ctx.lineTo(this.x+i,this.y+dd+d+d/2+1);
        }
        ctx.stroke();
    }
    // channel data calc into y[c], findValue calc
    calcY() {
        var minY=1000000, maxY=-1000000; // for find
        // timebase
        timebase=tb[k_time.k.getValue()+Math.floor(k_time.k.ticks/2-1)]*
            tb_[k_time.k_.getValue()+Math.floor(k_time.k_.ticks/2)];
        Q=timebase*L/DL;
        // delay
        delay=tb[k_delaybase.k.getValue()+Math.floor(k_delaybase.k.ticks/2-1)]*
            tb_[k_delaybase.k_.getValue()+Math.floor(k_delaybase.k_.ticks/2)];
        delay=(10*k_delay.k.getValue()+k_delay.k_.getValue())*delay;
        delay=delay*L;
        // loop of channels: second channel first!
        for (var c=1; c>=0; c--) {
            // level (Volts/Div)
            var l=this.ch[c].k_volts.k.getValue(); l=(l+Math.floor(vpd.length/2))%vpd.length;
            var l_=this.ch[c].k_volts.k_.getValue(); l_=(l_+Math.floor(vpd_.length/2))%vpd_.length;
            var level=vpd[l]*vpd_[l_];
            // x and y pos
            py[c]=-this.ch[c].k_ypos.getValue();
            px=k_xpos.getValue();
            // find value one adjust at a time
            if (findState!="off") py[c]/=findValue;
            // gnd lines position
            py0=this.y+dd+4*d+py[c]*10;
            py[c]=py0+(c*2-1)*d;
            px=this.x+dd+px*10;
            // averages for AC coupling
            avgs[c]=0; var n=0;
            for (var i=0; i<sch[c].length; i++) {
                if (!isNaN(sch[c][i])) {
                    n++;
                    avgs[c]+=sch[c][i];
                }
            }
            avgs[c]/=n;
            if (this.ch[c].b_ac.state==0) avgs[c]=0;
            // main y value buffer calculation
            for (var i=0; i<N*L; i++) {
                // if CH is switched on
                if (scope.ch[c].b_gnd.state==0 && siggen[c].b_ch.state==1) {
                    // main y calculation
                    QI=Math.floor(freqs[c]*(10.0*Q*i+delay)%(L));
                    if (freqs[c]*10*Q>=L/3) { 
                        y[c][i]=i%2==0?(Math.min(...sch[c])-avgs[c])/level/2:(Math.max(...sch[c])-avgs[c])/level/2;
                    }
                    // main formula for y calc
                    else {
                        y[c][i]=(sch[c][QI]-avgs[c])/level/2;
                        if (isNaN(y[c][i])) {
                            error("NaN: QI="+QI);
                        }
                    }
                    // find values calc
                    if (findState!="off") y[c][i]/=findValue;
                    if (y[c][i]<minY) minY=y[c][i];
                    if (y[c][i]>maxY) maxY=y[c][i];
                }
                else {
                    y[c][i]=0;
                }
                if (isNaN(y[c][i])) error("NaN: y["+c+"]["+i+"]");
            }
        }
        if (findState=="search" && minY>-4*dd && maxY<4*dd) {
            findState="found";
        }
    }
    // trigger condition seeking
    triggerSeek() {
        slope=k_slope.getValue();
        tlevel=10*k_trig.k.getValue()+k_trig.k_.getValue();
        for (var c=1; c>=0; c--) {
            tcond=false; // trigger condition
            prevValue=y[c][0];
            if (b_mode.state==1) prevValue=this.calcModeY(c,y[0][0],y[1][0]);
            tptr[c]=-1; // init trigger pointer
            while (!tcond && tptr[c]<L) {
                tptr[c]++;
                currValue=y[c][tptr[c]];
                if (b_mode.state==1) currValue=this.calcModeY(c,y[0][tptr[c]],y[1][tptr[c]]);
                if (k_slope.getValue()==0 && prevValue<tlevel && currValue>=tlevel) tcond=true;
                if (k_slope.getValue()==1 && prevValue>tlevel && currValue<=tlevel) tcond=true;
                prevValue=currValue;
            }
            if (b_chtr[c].state==1 || b_mode.state==1) {
                b_limit.state=0;
                if (tptr[c]>=N*L) {
                    tptr[c]=lastTptr[c];
                    b_limit.state=1;
                }
            }
            lastTptr[c]=tptr[c];
        }
        if (b_auto.state==1) tptr[0]=0;
        else if (b_ch2tr.state==1) tptr[0]=tptr[1];
    }
    astigmCalc() {
        ast=k_astigm.getValue(); asl=2*Math.abs(ast)+1;
        asx=ast*Math.sin(Math.PI*ast/k_astigm.ticks/2)/k_astigm.ticks;
        asy=ast*Math.cos(Math.PI*ast/k_astigm.ticks/2)/k_astigm.ticks;
        if (ast==0) { asx=0; asy=0; }
    }
    beamControl(beamLength) {
        // beam intensity, focus blur and astigm
        int2=Math.floor(180+170*(int1+8-ast*ast/20)/16); // 180..350
        int3=Math.sqrt(Math.sqrt(timebase*beamLength));  // 1..3500
        int2-=(10*int3); if (int2<1) int2=1;
        if (powerState=="start") int2=powerValue;
        alpha1=int2/255;
        if (alpha1>1) alpha1=1; if (alpha1<0.05) alpha1=0.05;
        ss="rgba(0,"+int2+",0,"+alpha1+")";
        ctx.strokeStyle=ss;
        ctx.lineWidth=1+Math.abs(blur1/2);
        if (int2>200) ctx.lineWidth+=((int2-200)/25);
        if (findState!="off") ctx.lineWidth+=1;
        ctx.filter="blur("+(Math.abs(blur1/2))+"px)";
    }
    draw(ctx) {
        d=this.d;
        dd=this.dd;
        this.calcY();
        this.triggerSeek();
        // intensity and focus
        int1=k_intensity.getValue();
        blur1=k_focus.getValue();
        // draw beams
        this.drawScreen(ctx);
        ctx.save();
        roundRect(ctx, this.x+3, this.y+3, this.w-6, this.h-6, 20);
        ctx.clip();
        this.astigmCalc();
        // Actual beam drawing for Dual, Ch1, Ch2
        if (b_dual.state==1 || b_ch1.state==1 || b_ch2.state==1) {
            for (var c=0; c<2; c++) if (c!=1 || b_dual.state!=1 || b_fft.state!=1) {
                if (b_dual.state==1 || c==0 && b_ch1.state==1 || c==1 && b_ch2.state==1) {
                    if (b_dual.state==0) py[c]=py0;
                    ctx.beginPath();
                    // beam length for beam intensity calcukation
                    sumdelta[c]=0;
                    for (var k=0; k<asl; k++) {
                        ctx.moveTo(px+k*asx,py[c]-y[c][0+tptr[0]]-k_rot.getValue()*DL/500+k*asy);
                        for (var i=1; i<DL; i++) {
                            ctx.lineTo(px+i+k*asx,py[c]-y[c][i+tptr[0]]-k_rot.getValue()*(DL/2-i)/250+k*asy);
                            if (k==0) sumdelta[c]+=Math.abs(y[c][i+tptr[0]]-y[c][i-1+tptr[0]]);
                        }
                    }
                    sumdelta[c]/=L; if (findState!="off") sumdelta[c]/=findValue*findValue;
                    this.beamControl(sumdelta[c]);
                    ctx.stroke();
                    ctx.lineWidth=1;
                }
            }
        }
        // Beam for Lissajous XY
        else if (b_xy.state==1) {
            // rotation
            var fi=k_rot.getValue()*1*Math.PI/30;
            for (var i=0; i<DL; i++) {
                var x1=y[0][i], y1=y[1][i];
                y[0][i]=x1*Math.cos(fi)+y1*Math.sin(fi);
                y[1][i]=-x1*Math.sin(fi)+y1*Math.cos(fi);
            }
            // screen center
            px+=5*d;
            var pyx=(py[0]+py[1])/2;
            // actual beem drawing
            ctx.beginPath();
            sumdelta[2]=0;
            for (var k=0; k<asl; k++) {
                ctx.moveTo(px+y[0][0]+k*asx,pyx-y[1][0]+k*asy);
                for (var i=1; i<DL; i++) {
                    ctx.lineTo(px+y[0][i]+k*asx,pyx-y[1][i]+k*asy);
                    if (k==0) sumdelta[2]+=Math.sqrt((y[0][i]-y[0][i-1])*(y[0][i]-y[0][i-1])+(y[1][i]-y[1][i-1])*(y[1][i]-y[1][i-1]));
                }
                ctx.lineTo(px+y[0][0]+k*asx,pyx-y[1][0]+k*asy);
            }
            sumdelta[2]/=L; if (findState!="off") sumdelta[2]/=(findValue*findValue);
            this.beamControl(sumdelta[2]);
            ctx.stroke();
            ctx.lineWidth=1;
        }
        // Beam for Mode (Add, AM)
        else {
            ctx.beginPath();
            sumdelta[2]=0;
            for (var k=0; k<asl; k++) {
                ctx.moveTo(px+k*asx,py0-this.calcModeY(-1,y[0][0+tptr[0]],y[1][0+tptr[0]])-k_rot.getValue()*DL/500+k*asy);
                for (var i=1; i<DL; i++) {
                    ctx.lineTo(px+i+k*asx,py0-this.calcModeY(-1,y[0][i+tptr[0]],y[1][i+tptr[0]])-k_rot.getValue()*(DL/2-i)/250+k*asy);
                    if (k==0) sumdelta[2]+=Math.abs(this.calcModeY(-1,y[0][i-1+tptr[0]],y[1][i-1+tptr[0]])-this.calcModeY(-1,y[0][i+tptr[0]],y[1][i+tptr[0]]));
                }
            }
            sumdelta[2]/=L; if (findState!="off") sumdelta[2]/=(findValue*findValue);
            this.beamControl(sumdelta[2]);
            ctx.stroke();
            ctx.lineWidth=1;
        }
        // FFT draw
        if (b_fft.state==1 && b_xy.state!=1) {
            for (var i=0; i<FFTN; i++) {
                var ii=Math.floor(schlen[0]*i/FFTN);
                fftIn[i]=this.calcModeY(0,y[0][ii],y[1][ii])/127;
            }
            f.realTransform(fftOut, fftIn);
            f.completeSpectrum(fftOut);
            var A=Math.max(...y[1])/100;
            ctx.beginPath();
            ctx.moveTo(px,py0+2*d+fftOut[1][0]/A);
            for (var i=1; i<DL; i++) {
                yResult=0;
                for (var j=0; j<8; j++) yResult+=fftOut[8*i-j];
                ctx.lineTo(px+i,py0+2*d+yResult/8/A);
            }
            ctx.lineWidth=1;
            ctx.stroke();
        }
        ctx.restore();
    }
    calcModeY(c,ych0,ych1) {
        if (b_ch1.state==1) return ych0;
        else if (b_ch2.state==1) return ych1;
        else if (b_add.state==1) return ych0+ych1;
        else if (b_mod.state==1) return ych0*ych1/ampls[1];
        else if (b_dual.state==1) return [ych0,ych1][c];
    }
}
class ScopeChannel {
    constructor(pX,pY) {
        this.k_ypos=new Knob(24,pX+65,pY+247,20,49,0,"Pos Y","knob");
        this.k_volts=new VoltsKnob(pX,pY+275);
        this.k_volts.k.value0=false;
        this.k_volts.k_.value0=false;
        this.b_ac=new ChOnButton(pX+70,pY+312,24,16,"AC",'on');
        this.b_gnd=new ChOnButton(pX+70,pY+312,24,16,"Gnd",'on');
        this.b_dc=new ChOnButton(pX+70,pY+312,24,16,"DC",'on');
        this.acdc=new Radio(pX+70,pY+312,[this.b_ac,this.b_gnd,this.b_dc]);
    }
}