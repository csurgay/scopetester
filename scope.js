var d, dd; // for UI layout geometry calculations
var ast, asl, asx, asy; // astigm control value, line multiplication, x,y direction
var illum, int={}, blur={}, alpha1; // for scale grid illumination, inensity and focus blur value
var Q,QI; // for frequency calculations
var tptr=[0,0], lastTptr=[0,0], tcond; // trigger pointer, last valid tptr, trigger condition
var currValue, prevValue; // curr and prev y value for trigger condition calc
var tlevel; // trigger level
var px0,px,py0,py=[0,0],pyd; // screen center lines for channels and dual
var lineWidth, strokeStyle, blurWidth, expdays;
var drawInProgress=false, drawInTimeout=false;
var mag; // x10 mag multiplier (3.333 for dipsch, 3 for beamdraw)
var tailParts=[];
var slowLimitMeasure=true, slowLimit=-1;
var runningTime=Date.now(), sweepDuration, sweepCount=0, elapsedTime=0, triggerTime=0;
var inten=[100,50];
var altc=0;
var ro, discontinuity, delta, prevDelta=[0,0], deltaX, deltaY, paleBeam=new Path2D();

const verX=60, verY=465, verW=555, verH=120;
const horX=623, horY=210, horW=330, horH=242, dualX=290, dualY=135;
const digiX=horX, digiY=verY, digiW=horW/2-5, digiH=verH;
const modeX=horX, modeY=10, modeW=160, modeH=horY-modeY-10, moderX=modeW/4+4, moderY=20;
const monX=horX+digiW+10, monY=digiY, monW=digiW, monH=digiH;
const trigX=modeX+modeW+10, trigY=modeY, trigW=160, trigH=modeH, trmodeX=120, trmodeY=105;
const siggenX=0, siggenY=verY+verH+10, siggenW=960, siggenH=940-siggenY;

class Scope extends pObject {
    constructor(pX,pY,pD,pDD) {
        super(ctx,pX,pY,10*pD+2*pDD,8*pD+2*pDD);
        this.class="Scope";
        this.d=pD;
        this.dd=pDD;
        uipush(this);

        new Frame(verX,verY,verW,verH,"Vertical","center");
        this.ch=[new ScopeChannel(0,verX,verY), new ScopeChannel(1,verX+287,verY)];

        new Frame(horX,horY,horW,horH,"Horizontal","center");
        k_xpos=new DoubleKnob(ctx,horX+44,horY+160,201,201,"X Pos","xpos",36,20);
        k_xpos.setPullable("xpos");
        k_xpos.setResetTogether();
        k_time=new TimeKnob(horX+170,horY+150);
        k_delay=new DoubleKnob(ctx,horX+44,horY+60,100,100,"Delay Multiply","delay",36,23);
        k_delay.k.value0=false;
        k_delay.k_.value0=false;
        k_delay.k.limit=k_delay.k.ticks-1;
        k_delay.k_.limit=k_delay.k_.ticks-1;
        k_delay.setResetTogether();
        new Vfd(horX+horW/2-47,horY+40,6,()=>{return 10*k_delay.k.getValue()+k_delay.k_.getValue()/10;},()=>{
            return b_power.state==0 || 10*k_delay.k.getValue()+k_delay.k_.getValue()==0;});
        b_xcal=new IndicatorLed(horX+35,horY+217,24,16,"Cal","on");
        b_a=new PushButton(ctx,horX+dualX,horY+dualY,pbw,pbh,"  A  ","on");
        b_a.state=1;
        b_ainten=new PushButton(ctx,horX+dualX,horY+dualY,pbw,pbh,"Inten","on");
        b_b=new PushButton(ctx,horX+dualX,horY+dualY,pbw,pbh,"DLYD ","on");
        b_aandb=new PushButton(ctx,horX+dualX,horY+dualY,pbw,pbh,"ALT","on");
        b_mixed=new PushButton(ctx,horX+dualX,horY+dualY,pbw,pbh,"Mixed  ","on");
        dualtb_mode=new Radio(ctx,horX+dualX,horY+dualY,[b_a,b_ainten,b_b,b_aandb,b_mixed]);

        new Frame(digiX,digiY,digiW,digiH,"Spectrum","center");
        b_fft=new PushButton(ctx,digiX+10,digiY+55,pbw,pbh,"FFT","fft");
        k_ffty=new Knob(ctx,39,digiX+70,digiY+65,20,40,0,"Ymag","double_s");
        k_ffty.value0=false;
        k_fftx=new Knob(ctx,10,digiX+125,digiY+65,20,21,0,"Xmag","double_s");

        new Frame(modeX,modeY,modeW,modeH,"Mode","center");
        b_ch1=new PushButton(ctx,modeX+moderX,modeY+moderY,pbw,pbh,"CH1","on2");
        b_ch2=new PushButton(ctx,modeX+moderX,modeY+moderY,pbw,pbh,"CH2","on2");
        b_chon=[b_ch1,b_ch2];
        b_alt=new PushButton(ctx,modeX+moderX,modeY+moderY,pbw,pbh,"ALT","on2");
        b_alt.state=1;
        b_chop=new PushButton(ctx,modeX+moderX,modeY+moderY,pbw,pbh,"CHOP ","on2");
        b_add=new PushButton(ctx,modeX+moderX,modeY+moderY,pbw,pbh,"ADD","on2");
        b_mod=new PushButton(ctx,modeX+moderX,modeY+moderY,pbw,pbh,"AM","on2");
        b_sub=new PushButton(ctx,modeX+moderX,modeY+moderY,pbw,pbh,"SUB","on2");
        b_xy=new PushButton(ctx,modeX+moderX,modeY+moderY,pbw,pbh,"X-Y","on2");
        radio_mode=new Radio(ctx,modeX+moderX,modeY+moderY,[b_alt,b_chop,b_ch1,b_ch2,b_add,b_sub,b_mod,b_xy],2);
        b_storage=new PushButton(ctx,modeX+moderX,modeY+140,pbw,pbh,"STOR.","on2");
//        b_storage=new PushButton(ctx,horX+dualX,horY+dualY-30,pbw,pbh,"Storage","readout");
//        b_storage=new PushButton(ctx,digiX+80,digiY+70,pbw,pbh,"Storage","readout");
        b_readout=new PushButton(ctx,modeX+moderX,modeY+160,pbw,pbh,"READ.","on2");
//        b_readout=new PushButton(ctx,digiX+80,digiY+95,pbw,pbh,"Readout","readout");
        // k_cursor=new DoubleKnob(ctx,horX+dualX-10,horY+60,51,201,"Cursor","cursor",36,23);
        // k_cursor.setPullable("cursor");
        // k_cursor.setResetTogether();
        k_cursor=new DoubleKnob(ctx,modeX+120,modeY+150,51,201,"Cursor","cursor",36,23);
        k_cursor.setPullable("cursor");
        k_cursor.setResetTogether();

        new Frame(monX,monY,monW,monH,"Monitor","center");
        k_vol=new Knob(ctx,8,monX+monW-40,monY+65,30,17,0,"Volume","volume");
        k_vol.setSwitchBufferNeeded();
        k_monitor=new MonitorKnob(monX+40,monY+65);

        new Frame(trigX,trigY,trigW,trigH,"Trigger","center");
        k_trigger=new DoubleKnob(ctx,trigX+40,trigY+60,50,50,"Level","double_s",30,15);
        k_trigger.k.defaultFastRate=1;
        k_trigger.setResetTogether();
        k_hold=new DoubleKnob(ctx,trigX+40,trigY+150,50,50,"HoldOff","double_s",30,15);
        k_slope=new SlopeKnob(trigX+125,trigY+75);
        // !!! kellene majd "fel+le mindkettő egyszerre" slope is
        k_slope.value0=false;
        b_auto=new PushButton(ctx,trigX+trmodeX,trigY+trmodeY,pbw,pbh,"Auto","on");
        b_auto.state=1;
        b_ch1tr=new PushButton(ctx,trigX+trmodeX,trigY+trmodeY,pbw,pbh,"CH1","on");
        b_ch2tr=new PushButton(ctx,trigX+trmodeX,trigY+trmodeY,pbw,pbh,"CH2","on");
        b_mode=new PushButton(ctx,trigX+trmodeX,trigY+trmodeY,pbw,pbh,"Math","on");
        b_chtr=[b_ch1tr,b_ch2tr];
        radio_trig=new Radio(ctx,trigX+trmodeX,trigY+trmodeY,[b_auto,b_ch1tr,b_ch2tr,b_mode]);
        b_limit=new IndicatorLed(trigX+120,trigY+12,24,16,"Limit","on");

        b_find=new FindButton(17,305,pbw,pbh,"Find","small");
        b_reset=new ResetButton(17,360,pbw,pbh,"Reset","small");
        b_reset.illum=false;
        b_preset=new PresetButton(17,395,pbw,pbh,"Preset","small");
        b_preset.illum=false;
        b_mic=new MicButton(17,430,pbw,pbh,"Mic","small");
        k_intensity=new Knob(ctx,8,30,100,15,17,0,"Intensity","smallknob");
        k_focus=new Knob(ctx,8,30,150,15,17,0,"Focus","smallknob");
        k_illum=new Knob(ctx,16,30,200,15,17,0,"Illum","smallknob");
        k_illum.value0=false;
        k_astigm=new CalibPot(ctx,8,40,240,15,17,0,"Ast","pot");
        k_rot=new CalibPot(ctx,15,40,270,15,31,0,"Rot","pot");
        k_skew=new CalibPot(debugctx,15,40,270,15,31,0,"Skew","pot2");
        b_calib=new DebugButton(20,20,pbw,pbh,"Calib","small");
        b_debug=new DebugButton(20,55,pbw,pbh,"Debug","small");
        b_frames=new DebugButton(20,90,pbw,pbh,"Frames","small");
        b_autotest=new AutotestButton(20,125,pbw,pbh,"Test","small");
        b_traceFastBeam=new DebugButton(20,160,pbw,pbh,"Trace","small");
        for (let i=0; i<9; i++) {
            b_presets.push(new DebugButton(70,20+i*35,pbw,pbh,"Preset"+i,"small"));
            b_presets[b_presets.length-1].illum=false;
        }
        b_sch=new DebugButton(160,20,pbw,pbh,"sch ","on");
        b_gench=new DebugButton(160,20,pbw,pbh,"gench ","on");
        b_micch=new DebugButton(160,20,pbw,pbh,"micch ","on");
        b_dispch=new DebugButton(160,20,pbw,pbh,"dispch ","on");
        b_pixelch=new DebugButton(160,20,pbw,pbh,"pixelch  ","on");
        debug_channel=new Radio(debugctx,160,20,[b_sch,b_gench,b_micch,b_dispch,b_pixelch]);
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
        if (b_power.state==1 && imprintState!="idle") {
            drawText(imprint,px,imprintY,imprintHlPtr++);
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
        if (b_power.state==1 && b_xy.state==1) {
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
        // Beam for all other modes
        else if (b_power.state==1) {
            for (let c=0; c<2; c++) {
                pyd=py[c];
                if (b_add.state==1 || b_sub.state==1 || b_mod.state==1) {
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
                else if ((b_add.state==1 || b_sub.state==1 || b_mod.state==1) && cc==0) continue;
                if (b_alt.state==1 && timebase>=slowLimit && b_storage.state==0) c=altc;
                ctx.beginPath(); 
                paleBeam=new Path2D();
                prevDelta[c]=1000;
                sumdelta=0;
                ro=Math.sign(asl);
                discontinuity=schdisc[c];
                if (b_add.state==1 || b_sub.state==1 || b_mod.state==1)
                    discontinuity+=schdisc[1-c];
                for (let k=-ro; k<=ro; k+=2) { // this is one or two lines
                    ctx.moveTo(pixelch[c][0][DL1]+k*asx,pixelch[c][1][DL1]+k*asy);
                    paleBeam.moveTo(pixelch[c][0][DL1]+k*asx,pixelch[c][1][DL1]+k*asy);
                    for (let i=DL1+1; i<=DL2; i++) {
                        delta=Math.abs(pixelch[c][1][i-1]-pixelch[c][1][i]);
                        if (discontinuity>0 && delta>10*prevDelta[c]) {
                            ctx.moveTo(pixelch[c][0][i]+k*asx,pixelch[c][1][i]+k*asy);
                            if (b_traceFastBeam.state==1)
                                paleBeam.lineTo(pixelch[c][0][i]+k*asx,pixelch[c][1][i]+k*asy);
                        }
                        else {
                            ctx.lineTo(pixelch[c][0][i]+k*asx,pixelch[c][1][i]+k*asy);
                            paleBeam.moveTo(pixelch[c][0][i]+k*asx,pixelch[c][1][i]+k*asy);
                        }
                        prevDelta[c]=delta;
                        deltaX=pixelch[c][0][i]-pixelch[c][0][i-1];
                        deltaY=pixelch[c][1][i]-pixelch[c][1][i-1];
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
 