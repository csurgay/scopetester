var d, dd; // for UI layout geometry calculations
var illum, int, blur; // for scale grid illumination, inensity and focus blur value
var Q,QI; // for frequency calculations
var tptr=[0,0], lastTptr=[0,0], tcond; // trigger pointer, last valid tptr, trigger condition
var currValue, prevValue; // curr and prev y value for trigger condition calc
var slope, tlevel; // trigger level

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
        b_ch1=new ChOnButton(795,650,24,16,"CH1","on");
        b_ch2=new ChOnButton(795,650,24,16,"CH2","on");
        b_chon=[b_ch1,b_ch2];
        b_dual=new ChOnButton(795,650,24,16,"Dual","on");
        b_add=new ChOnButton(795,650,24,16,"Add","on");
        b_mod=new ChOnButton(795,650,24,16,"AM","on");
        b_xy=new ChOnButton(795,650,24,16,"X-Y","on");
        radio_mode=new Radio(795,650,[b_ch1,b_ch2,b_dual,b_add,b_mod,b_xy]);
        b_auto=new ChOnButton(895,530,24,16,"Auto","on");
        b_ch1tr=new ChOnButton(895,530,24,16,"CH1","on");
        b_ch2tr=new ChOnButton(895,530,24,16,"CH2","on");
        b_mode=new ChOnButton(895,530,24,16,"Mode","on");
        b_chtr=[b_ch1tr,b_ch2tr];
        radio_trig=new Radio(895,530,[b_auto,b_ch1tr,b_ch2tr,b_mode]);
        b_limit=new IndicatorLed(895,480,24,16,"Limit","on");
        b_find=new FindButton(20,310,24,16,"Find","small");
        b_resv=new ResvButton(20,345,24,16,"Preset","small");
        b_mic=new MicButton(20,380,24,16,"Mic","small");
        b_debug=new ChOnButton(20,415,24,16,"Debug","small");
        this.ch=[new ScopeChannel(685,80), new ScopeChannel(825,80)];
        k_intensity=new Knob(8,30,105,15,17,0,"Intensity","knob");
        k_focus=new Knob(8,30,160,15,17,0,"Focus","knob");
        k_illum=new Knob(16,30,215,15,17,0,"Illum","knob");
        k_rot=new Knob(90,30,270,15,181,0,"Rotation","knob");
        k_time=new TimeKnob(850,180);
        new Vfd(710,75,4,()=>{return 10*k_delay.k.value+k_delay.k_.value;},()=>{return b_power.state==0 || 10*k_delay.k.value+k_delay.k_.value==0;});
        k_delay=new DoubleKnob(665,75,100,100,"Delay","double",35,20);
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
        b_resv.label.size=12;
    }
    drawScreen(ctx) {
        // draw screen
        ctx.beginPath();
        ctx.strokeStyle = "rgb(0, 25, 0)";
        ctx.lineWidth=6;
        ctx.fillStyle = "rgba(50, 100, 50, 1)";
        ctx.roundRect(this.x, this.y, this.w, this.h, 20);
        ctx.stroke();
        ctx.fill();
        ctx.beginPath();
        ctx.lineWidth=1;
        // draw grid
        d=this.d;
        dd=this.dd;
        illum=Math.floor(127*k_illum.value/k_illum.ticks);
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
    draw(ctx) {
        d=this.d;
        dd=this.dd;
        this.drawScreen(ctx);
        // intensity and focus
        int=k_intensity.value0;
        blur=k_focus.value0;
        // draw beams
        ctx.save();
        ctx.roundRect(this.x+3, this.y+3, this.w-6, this.h-6, 20);
        ctx.clip();
        // ctx.strokeStyle="rgb(0,"+(255-5*k_intensity.ticks/2+5*int)+",0)";
        // ctx.lineWidth=3+int/3+Math.abs(blur/2);
        // ctx.filter="blur("+Math.abs(blur/2)+"px)";
        var px,py0,py=[0,0];
        var minY=1000000, maxY=-1000000; // for find
        // timebase
        var kt=k_time.k.value0;
        var kt_=k_time.k_.value0;
        timebase=tb[kt+Math.floor(k_time.k.ticks/2-1)]*tb_[kt_+Math.floor(k_time.k_.ticks/2)];
        Q=timebase*L/DL;
        // delay
        var kdb=k_delaybase.k.value0;
        var kdb_=k_delaybase.k_.value0;
        delay=tb[kdb+Math.floor(k_delaybase.k.ticks/2-1)]*tb_[kdb_+Math.floor(k_delaybase.k_.ticks/2)];
        delay=(10*k_delay.k.value+k_delay.k_.value)*delay;
        delay=delay*L;
        // for beam intensity
        sumdelta[0]=0;
        // loop of channels
        for (var c=1; c>=0; c--) {
            // level (Volts/Div)
            var l=this.ch[c].k_volts.k.value; l=(l+Math.floor(vpd.length/2))%vpd.length;
            var l_=this.ch[c].k_volts.k_.value; l_=(l_+Math.floor(vpd_.length/2))%vpd_.length;
            var level=vpd[l]*vpd_[l_];
            // x and y pos
            py[c]=-this.ch[c].k_ypos.value0;
            px=k_xpos.value0;
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
                    QI=Math.round(freqs[c]*(10.0*Q*i+delay)%(L));
                    if (freqs[c]*10*Q>=L/2) { 
                        y[c][i]=i%2==0?(Math.min(...sch[c])-avgs[c])/level/2:(Math.max(...sch[c])-avgs[c])/level/2;
                    }
                    else {
                        y[c][i]=(sch[c][QI]-avgs[c])/level/2;
                    }
                    // find values calc
                    if (findState!="off") y[c][i]/=findValue;
                    if (y[c][i]<minY) minY=y[c][i];
                    if (y[c][i]>maxY) maxY=y[c][i];
                }
                else {
                    y[c][i]=0;
                }
                if (i>0) if (!isNaN(y[c][i]) && !isNaN(y[c][i-1])) 
                    sumdelta[0]+=Math.abs(y[c][i]-y[c][i-1]);
            }
        }
        sumdelta[0]/=N*L;
        ctx.beginPath();
        ctx.strokeStyle="rgba(0,"+(255-5*k_intensity.ticks/2+5*int-sumdelta[0]/10)+",0,"+100/sumdelta[0]+")";
        ctx.lineWidth=3+int/3+Math.abs(blur/2);
        ctx.filter="blur("+(Math.abs(blur/2)+sumdelta[0]/100)+"px)";
        if (findState=="search" && minY>-4*dd && maxY<4*dd) {
            findState="found";
        }
        // trigger condition seeking
        slope=k_slope.value;
        tlevel=10*k_trig.k.value0+k_trig.k_.value0;
        for (var c=1; c>=0; c--) {
            tcond=false; // trigger condition
            prevValue=y[c][0];
            if (b_mode.state==1) prevValue=this.calcModeY(c,y[0][0],y[1][0]);
            tptr[c]=-1;
            while (!tcond && tptr[c]<N*L) {
                tptr[c]++;
                currValue=y[c][tptr[c]];
                if (b_mode.state==1) currValue=this.calcModeY(c,y[0][tptr[c]],y[1][tptr[c]]);
                if (k_slope.value==0 && prevValue<tlevel && currValue>=tlevel) tcond=true;
                if (k_slope.value==1 && prevValue>tlevel && currValue<=tlevel) tcond=true;
                prevValue=currValue;
            }
            if (b_chtr[c].state==1 || b_mode.state==1) {
                b_limit.state=0;
                if (tptr[c]>=N*L) {
                    tptr[c]=lastTptr[c];
                    b_limit.state=1;
                }
            }
            lastTptr[c]=tptr[c]>0?tptr[c]-1:tptr[c];
        }
        if (b_auto.state==1) tptr[0]=0;
        else if (b_ch2tr.state==1) tptr[0]=tptr[1];
        // actual beam drawing
        if (b_dual.state==1) {
            for (var c=0; c<2; c++) {
                ctx.moveTo(px,py[c]-y[c][0+tptr[0]]-k_rot.value0*DL/200);
                for (var i=0; i<DL; i++) {
                    ctx.lineTo(px+i,py[c]-y[c][i+tptr[0]]-k_rot.value0*(DL/2-i)/100);
                }
            }
        }
        else if (b_xy.state==1) {
            // rotation
            var fi=k_rot.value0*1*Math.PI/180;
            for (var i=0; i<DL; i++) {
                var x1=y[0][i], y1=y[1][i];
                y[0][i]=x1*Math.cos(fi)+y1*Math.sin(fi);
                y[1][i]=-x1*Math.sin(fi)+y1*Math.cos(fi);
            }
            // screen center
            px+=5*d;
            var py=(py[0]+py[1])/2;
            // actual beem drawing
            ctx.moveTo(px+y[0][0],py-y[1][0]);
            for (var i=1; i<DL; i++) {
                ctx.lineTo(px+y[0][i],py-y[1][i]);
            }
            ctx.lineTo(px+y[0][0],py-y[1][0]);
        }
        else {
            ctx.moveTo(px,py0-this.calcModeY(-1,y[0][0+tptr[0]],y[1][0+tptr[0]])-k_rot.value0*DL/200);
            for (var i=1; i<DL; i++) {
                ctx.lineTo(px+i,py0-this.calcModeY(-1,y[0][i+tptr[0]],y[1][i+tptr[0]])-k_rot.value0*(DL/2-i)/100);
            }
        }
        ctx.stroke();
        ctx.restore();
        ctx.lineWidth=1;
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
        this.b_ac=new ChOnButton(pX+70,pY+312,24,16,"AC",'on');
        this.b_gnd=new ChOnButton(pX+70,pY+312,24,16,"Gnd",'on');
        this.b_dc=new ChOnButton(pX+70,pY+312,24,16,"DC",'on');
        this.acdc=new Radio(pX+70,pY+312,[this.b_ac,this.b_gnd,this.b_dc]);
    }
}