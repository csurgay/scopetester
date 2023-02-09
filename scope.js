var d, dd; // for UI layout geometry calculations
var ast, asl, asx, asy; // astigm control value, line multiplication, x,y direction
var illum, int={}, blur={}, alpha1; // for scale grid illumination, inensity and focus blur value
var Q,QI; // for frequency calculations
var tptr=[0,0], lastTptr=[0,0], tcond; // trigger pointer, last valid tptr, trigger condition
var currValue, prevValue; // curr and prev y value for trigger condition calc
var slope, tlevel; // trigger level
var px0,px,py0,py=[0,0],pyd; // screen center lines for channels and dual
var lineWidth, strokeStyle, blurWidth, expdays;
var drawInProgress=false, drawInTimeout=false;
var mag; // x10 mag multiplier (3.333 for dipsch, 3 for beamdraw)
var tailParts=[];
var slowLimitMeasure=true, slowLimit=-1;
var runningTime=Date.now(), sweepDuration, sweepCount=0, elapsedTime=0, triggerTime=0;
var inten=[100,50];
var altc=0;

class Scope extends pObject {
    constructor(pX,pY,pD,pDD) {
        super(ctx,pX,pY,10*pD+2*pDD,8*pD+2*pDD);
        this.class="Scope";
        this.d=pD;
        this.dd=pDD;
        uipush(this);
        new Frame(620,15,310,255,"Horizontal","center");
        new Frame(620,283,310,170,"Vertical","center");
        new Frame(690,465,90,150,"Mode","center");
        new Frame(845,630,85,145,"Monitor","center");
        new Frame(790,465,140,150,"Trigger","center");
        new Frame(690,630,145,145,"FFT","center");
        k_vol=new Knob(ctx,8,885,675,20,17,0,"Volume","knob");
        k_vol.setSwitchBufferNeeded();
        k_monitor=new MonitorKnob(885,735);
        b_ch1=new ChOnButton(795,1000,24,16,"CH1","on",false);
        b_ch2=new ChOnButton(795,1000,24,16,"CH2","on",false);
        b_chon=[b_ch1,b_ch2];
        b_alt=new ChOnButton(795,1000,24,16,"ALT","on",false);
        b_chop=new ChOnButton(795,1000,24,16,"CHOP","on",false);
        b_add=new ChOnButton(795,1000,24,16,"ADD","on",false);
        b_mod=new ChOnButton(795,1000,24,16,"AM","on",false);
        b_xy=new ChOnButton(795,1000,24,16,"X-Y","on",false);
        radio_mode=new Radio(795,1000,[b_chop,b_alt,b_ch1,b_ch2,b_add,b_mod,b_xy],false);
        b_auto=new PushButton(ctx,892,530,pbw,pbh,"Auto","on");
        b_auto.state=1;
        b_ch1tr=new PushButton(ctx,892,530,pbw,pbh,"CH1","on");
        b_ch2tr=new PushButton(ctx,892,530,pbw,pbh,"CH2","on");
        b_mode=new PushButton(ctx,892,530,pbw,pbh,"Mode","on");
        b_chtr=[b_ch1tr,b_ch2tr];
        radio_trig=new Radio(892,530,[b_auto,b_ch1tr,b_ch2tr,b_mode]);
        b_limit=new IndicatorLed(895,480,24,16,"Limit","on");
        b_find=new FindButton(17,305,pbw,pbh,"Find","small");
        b_reset=new ResetButton(17,360,pbw,pbh,"Reset","small");
        b_reset.illum=false;
        b_preset=new PresetButton(17,395,pbw,pbh,"Preset","small");
        b_preset.illum=false;
        b_mic=new MicButton(17,430,pbw,pbh,"Mic","small");
        this.ch=[new ScopeChannel(0,685,80), new ScopeChannel(1,835,80)];
        k_intensity=new Knob(ctx,8,30,100,15,17,0,"Intensity","smallknob");
        k_focus=new Knob(ctx,8,30,150,15,17,0,"Focus","smallknob");
        k_illum=new Knob(ctx,16,30,200,15,17,0,"Illum","smallknob");
        k_illum.value0=false;
        k_astigm=new CalibPot(ctx,8,40,240,15,17,0,"Ast","pot");
        k_rot=new CalibPot(ctx,15,40,270,15,31,0,"Rot","pot");
        k_skew=new CalibPot(debugctx,15,40,270,15,31,0,"Skew","pot2");
        k_time=new TimeKnob(783,180);
        new Vfd(710,75,4,()=>{return 10*k_delay.k.getValue()+k_delay.k_.getValue()/10;},()=>{
            return b_power.state==0 || 10*k_delay.k.getValue()+k_delay.k_.getValue()==0;});
        k_delay=new DoubleKnob(ctx,665,75,100,100,"Delay Mult","cursor",36,23);
        k_delay.k.value0=false;
        k_delay.k_.value0=false;
        k_delay.k.limit=k_delay.k.ticks-1;
        k_delay.k_.limit=k_delay.k_.ticks-1;
        k_delay.setResetTogether();
        k_xpos=new DoubleKnob(ctx,665,180,201,201,"X Pos","xpos",36,20);
        k_xpos.setPullable("xpos");
        k_xpos.setResetTogether();
        b_xcal=new IndicatorLed(660,245,24,16,"Cal","on");
        b_ycal=new IndicatorLed(660,430,24,16,"Cal","on");
        k_trigger=new DoubleKnob(ctx,830,520,50,50,"Level","double_s",30,15);
        k_trigger.k.defaultFastRate=1;
        k_trigger.setResetTogether();
//        k_hold=new DoubleKnob(880,520,50,50,"HoldOff","double_s",30,15);
        k_slope=new Knob(ctx,-1,830,590,17,2,0,"Slope","knob");
        k_slope.value0=false;
        k_mode=new ModeKnob(735,535);
        b_fft=new PushButton(ctx,755,740,pbw,pbh,"FFT","on");
        k_ffty=new Knob(ctx,39,730,700,20,40,0,"On / Ymag","double_s");
        k_ffty.value0=false;
        k_fftx=new Knob(ctx,10,800,700,20,21,0,"Xmag","double_s");
        b_readout=new PushButton(ctx,745,588,pbw,pbh,"Readout","readout");
        b_calib=new DebugButton(20,20,pbw,pbh,"Calib","small");
        b_debug=new DebugButton(20,55,pbw,pbh,"Debug","small");
        b_frames=new DebugButton(20,90,pbw,pbh,"Frames","small");
        b_autotest=new AutotestButton(20,125,pbw,pbh,"Test","small");
        for (let i=0; i<9; i++) {
            b_presets.push(new DebugButton(70,20+i*35,pbw,pbh,"Preset"+i,"small"));
            b_presets[b_presets.length-1].illum=false;
        }
        b_sch=new DebugButton(160,20,pbw,pbh,"sch ","on");
        b_gench=new DebugButton(160,20,pbw,pbh,"gench ","on");
        b_micch=new DebugButton(160,20,pbw,pbh,"micch ","on");
        b_dispch=new DebugButton(160,20,pbw,pbh,"dispch ","on");
        b_pixelch=new DebugButton(160,20,pbw,pbh,"pixelch  ","on");
        debug_channel=new Radio(160,20,[b_sch,b_gench,b_micch,b_dispch,b_pixelch]);
        k_cursor=new DoubleKnob(ctx,870,75,51,201,"Cursor","cursor",36,23);
        k_cursor.setPullable("cursor");
        k_cursor.setResetTogether();
        b_storage=new PushButton(ctx,892,120,pbw,pbh,"Storage","readout");
        b_a=new PushButton(ctx,892,165,pbw,pbh,"  A  ","on");
        b_a.state=1;
        b_ainten=new PushButton(ctx,892,165,pbw,pbh,"Inten","on");
        b_b=new PushButton(ctx,892,165,pbw,pbh,"DLYD ","on");
        b_aandb=new PushButton(ctx,892,165,pbw,pbh,"ALT","on");
        b_mixed=new PushButton(ctx,892,165,pbw,pbh,"Mixed  ","on");
        dualtb_mode=new Radio(892,165,[b_a,b_ainten,b_b,b_aandb,b_mixed]);
    }
    draw(ctx,drawShadow) {
        if (drawInProgress || drawInTimeout) { return; }
        drawInProgress=true;
        d=this.d;
        dd=this.dd;
        // x10 mag: 10/3x in dispch, 3x in beamdraw
        this.calcDispch(k_xpos.k.pulled&&findState=="off"?10/3:1);
        mag=k_xpos.k.pulled&&findState=="off"?3:1;
        this.triggerSeek();
        // intensity and focus
        int["knob"]=(k_intensity.getValue()+8)/16; // 0..1
        blur["knob"]=Math.abs(k_focus.getValue()/8); // 0..1
        // draw beams
        this.drawScreen(ctx,drawShadow);
        ctx.save();
        roundRect(ctx, this.x+3, this.y+3, this.w-6, this.h-6, 20);
        ctx.clip();
        this.drawGrid(ctx,"grid");
        this.astigmCalc();
        // imprint text rolling
        if (b_power.state==1 && imprintY!=1000) {
            drawText(imprint,px,imprintY--);
            ctx.restore();
            drawInProgress=false;
            return;
        }
        // tuning for fastest timing
        sweepCount++;
        sweepDuration=Date.now()-runningTime;
        elapsedTime+=sweepDuration;
        runningTime=Date.now();
        if (timebase<slowLimit || b_storage.state==1) {
            DL1=0, DL2=mag*DL;
            tailParts=[[DL1,DL2]];
        }
        // timing of sweeps
        else {
            // measuring and setting slowLimit only once
            if (slowLimitMeasure) {
                slowLimitMeasure=false;
            }
            // set slowLimit based on measurement
            else if (slowLimit==-1) {
                if (sweepDuration<2) slowLimit=2;
                else if (sweepDuration<5) slowLimit=5;
                else if (sweepDuration<10) slowLimit=10;
                else if (sweepDuration<20) slowLimit=20;
                else if (sweepDuration<50) slowLimit=50;
                else slowLimit=100;
            }
            // new portion beginning
            DL1=Math.ceil(50*(runningTime-triggerTime)/timebase);
            if (DL1>=mag*DL) {
                // end of beam, retrigger needed
                DL1=-Math.ceil(50*DL/timebase);
                triggerTime=runningTime+DL/5;
                // other channel in ALT mode
                altc=1-altc;
            }
            // new portion ending
            DL2=DL1+Math.ceil(10*DL/timebase);
            if (DL2<DL1+1) DL2=DL1+1;
            if (DL2>mag*DL) DL2=mag*DL;
        }
        // Beam for Lissajous XY
        if (b_xy.state==1) {
            for (let c=0; c<2; c++) {
                pyd=(py[0]+py[1])/2;
                // calc pixelch
                for (let i=0; i<L; i++) {
                    pixelch[0][0][i]=px+5*d+dispch[0][i];
                    pixelch[0][1][i]=pyd-dispch[1][i]-k_skew.getValue()*(DL/2-i)/100;
                }
                // rotation
                if (k_rot.getValue()!=0) {
                    var fi=-k_rot.getValue()*1*Math.PI/30;
                    for (let i=0; i<L; i++) {
                        var x1=pixelch[0][0][i]-px0-5*d, y1=pixelch[0][1][i]-py0;
                        pixelch[0][0][i]=px0+5*d+x1*Math.cos(fi)+y1*Math.sin(fi);
                        pixelch[0][1][i]=py0-x1*Math.sin(fi)+y1*Math.cos(fi);
                    }
                }
            }
            ctx.beginPath();
            sumdelta=0;
            var ro=Math.sign(asl);
            for (let k=-ro; k<=ro; k+=2) { // this is one or two lines
                ctx.moveTo(pixelch[0][0][DL1]+k*asx,pixelch[0][1][DL1]+k*asy);
                for (let i=DL1+1; i<=DL2; i++) {
                    ctx.lineTo(pixelch[0][0][i]+k*asx,pixelch[0][1][i]+k*asy);
                    sumdelta+=Math.sqrt((pixelch[0][0][i]-pixelch[0][0][i-1])
                        *(pixelch[0][0][i]-pixelch[0][0][i-1])
                        +(pixelch[0][1][i]-pixelch[0][1][i-1])*(pixelch[0][1][i]-pixelch[0][1][i-1]));
                    if (isNaN(sumdelta)) console.error("sumdelta NaN i="+i);
                }
            }
            if (findState!="off") sumdelta/=findValue;
            this.stroke();
        }
        // Actual beam drawing for Dual, Ch1, Ch2, ADD, AM
        else {
            for (let c=0; c<2; c++) {
                pyd=py[c];
                if (b_add.state==1 || b_mod.state==1) {
                    pyd=(py[0]+py[1])/2;
                    c=1;
                }
                // calc pixelch
                for (let i=DL1; i<=DL2; i++) {
                    ii=findState=="off"?i:((i+findValue*(DL/2+(i-DL/2)/2+px0-px))/(findValue+1));
                    pixelch[c][0][i]=px+ii*mag; if (mag>1) pixelch[c][0][i]-=5*DL-DL/2;
                    pixelch[c][1][i]=pyd-this.calcModeY(c,dispch[0][i+tptr[0]],
                        dispch[1][i+tptr[0]])-k_skew.getValue()*(DL/2-ii)/100;
                }
                // rotation
                if (k_rot.getValue()!=0) {
                    var fi=-k_rot.getValue()*1*Math.PI/360;
                    for (let i=0; i<L; i++) {
                        var x1=pixelch[c][0][i]-px0-dd-5*d, y1=pixelch[c][1][i]-py0;
                        pixelch[c][0][i]=px0+dd+5*d+x1*Math.cos(fi)+y1*Math.sin(fi);
                        pixelch[c][1][i]=py0-x1*Math.sin(fi)+y1*Math.cos(fi);
                    }
                }
            }
            // actual beam drawing
            for (let cc=0; cc<2; cc++) {
                var c=cc;
                if (b_ch1.state==1 && cc==1) continue;
                else if (b_ch2.state==1 && cc==0) continue;
                else if ((b_add.state==1 || b_mod.state==1) && cc==0) continue;
                if (b_alt.state==1 && timebase>=slowLimit && b_storage.state==0) c=altc;
                ctx.beginPath();
                sumdelta=0;
                var ro=Math.sign(asl);
                for (let k=-ro; k<=ro; k+=2) { // this is one or two lines
                    ctx.moveTo(pixelch[c][0][DL1]+k*asx,pixelch[c][1][DL1]+k*asy);
                    for (let i=DL1+1; i<=DL2; i++) {
                        ctx.lineTo(pixelch[c][0][i]+k*asx,pixelch[c][1][i]+k*asy);
                        var deltaX=pixelch[c][0][i]-pixelch[c][0][i-1];
                        var deltaY=pixelch[c][1][i]-pixelch[c][1][i-1];
                        sumdelta+=Math.sqrt(deltaX*deltaX+deltaY*deltaY);
                    }
                }
                if (findState!="off") sumdelta/=findValue;
                this.stroke();
            }
        }
        // FFT draw
        if (b_fft.state==1 && b_xy.state!=1 && b_ch2.state!=1 && b_alt.state!=1 && b_chop.state!=1) {
            for (let i=0; i<FFTN; i++) {
                var ii=Math.floor(DL*i/FFTN);
                fftIn[i]=this.calcModeY(0,dispch[0][ii],dispch[1][ii])/127;
            }
            f.realTransform(fftOut, fftIn);
            f.completeSpectrum(fftOut);
            var A=Math.pow(2,k_ffty.getValue()+10)/Math.max(...fftOut);
            var M=k_fftx.getValue();
            ctx.beginPath();
            for (let i=0; i<DL; i++) {
                ctx.moveTo(px+i,py[1]+2*d);
                if (M>=0) {
                    yResult=fftOut[Math.floor(FFTN*i/DL/3/(M+1))];
                }
                else if (M<0) {
                    yResult=0; 
                    for (let j=0; j<-M; j++) yResult+=fftOut[i+j];
                    yResult/=(-M);
                    yResult=fftOut[Math.floor(FFTN*i/DL/3*(-M))];
                }
                ctx.lineTo(px+i,py[1]+2*d+A*yResult);
            }
            ctx.strokeStyle="rgb(0,255,0)";
            ctx.lineWidth=1;
            ctx.stroke();
        }
        // Cursor
        if (b_power.state==1 && k_cursor.k.pulled) {
            xCur=10*k_cursor.k.getValue()+k_cursor.k_.getValue();
            yResult=px+5*d+xCur;
            ctx.beginPath();
            ctx.lineWidth=1;
            ctx.moveTo(yResult,ROYSIG[0]+8);
            ctx.lineTo(yResult,ROYSIG[1]-9);
            ctx.stroke();
        }
        this.readout();
        this.drawGrid(ctx,"illum");
        ctx.restore();
        if (!drawInTimeout && timebase>=slowLimit) { 
            drawInTimeout=true;
            setTimeout(()=>callDraw(ctx,"noShadow"),1);
        }
        drawInProgress=false;
    }
}
 