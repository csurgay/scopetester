var d, dd; // for UI layout geometry calculations
var ast, asl, asx, asy; // astigm control value, line multiplication, x,y direction
var illum, int={}, blur1, alpha1; // for scale grid illumination, inensity and focus blur value
var Q,QI; // for frequency calculations
var tptr=[0,0], lastTptr=[0,0], tcond; // trigger pointer, last valid tptr, trigger condition
var currValue, prevValue; // curr and prev y value for trigger condition calc
var slope, tlevel; // trigger level
var px0,px,py0,py=[0,0]; // screen center lines for channels and dual
var lineWidth, strokeStyle, blurWidth, expdays;
var drawInProgress=false, drawInTimeout=false;
var time; // running clock time for slow sweep calc
var mag; // x10 mag multiplier (3.333 for dipsch, 3 for beamdraw)
var tailParts=[];

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
        b_dual=new ChOnButton(795,1000,24,16,"ALT","on",false);
        b_add=new ChOnButton(795,1000,24,16,"ADD","on",false);
        b_mod=new ChOnButton(795,1000,24,16,"AM","on",false);
        b_xy=new ChOnButton(795,1000,24,16,"X-Y","on",false);
        radio_mode=new Radio(795,1000,[b_ch1,b_ch2,b_dual,b_add,b_mod,b_xy],false);
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
        this.ch=[new ScopeChannel(685,80), new ScopeChannel(825,80)];
        k_intensity=new Knob(ctx,8,30,100,15,17,0,"Intensity","smallknob");
        k_focus=new Knob(ctx,8,30,150,15,17,0,"Focus","smallknob");
        k_illum=new Knob(ctx,16,30,200,15,17,0,"Illum","smallknob");
        k_illum.value0=false;
        k_astigm=new CalibPot(ctx,8,40,240,15,17,0,"Ast","pot");
        k_rot=new CalibPot(ctx,15,40,270,15,31,0,"Rot","pot");
        k_timebase=new DelaybaseKnob(200,100,"Main A Timebase");
        k_delaybase=new DelaybaseKnob(350,100,"Delayed B Timebase");
        k_time=new TimeKnob(783,180);
        new Vfd(710,75,4,()=>{return 10*k_delay.k.getValue()+k_delay.k_.getValue()/10;},()=>{
            return b_power.state==0 || 10*k_delay.k.getValue()+k_delay.k_.getValue()==0;});
        k_delay=new DoubleKnob(ctx,665,75,100,100,"Delay Mult","cursor",36,23);
        k_delay.k.value0=false;
        k_delay.k_.value0=false;
        k_delay.k.limit=k_delay.k.ticks-1;
        k_delay.k_.limit=k_delay.k_.ticks-1;
        k_xpos=new DoubleKnob(ctx,665,180,201,201,"X Pos","xpos",36,20);
        k_xpos.setPullable("xpos");
        b_xcal=new IndicatorLed(660,245,24,16,"Cal","on");
        b_ycal=new IndicatorLed(660,430,24,16,"Cal","on");
        k_trigger=new DoubleKnob(ctx,830,520,50,50,"Level","double_s",30,15);
        k_trigger.k.defaultFastRate=1;
//        k_hold=new DoubleKnob(880,520,50,50,"HoldOff","double_s",30,15);
        k_slope=new Knob(ctx,-1,830,590,17,2,0,"Slope","knob");
        k_slope.value0=false;
        k_mode=new ModeKnob(735,535);
        b_fft=new PushButton(ctx,755,740,pbw,pbh,"FFT","on");
        k_ffty=new Knob(ctx,39,730,700,20,40,0,"On / Ymag","double_s");
        k_ffty.value0=false;
        k_fftx=new Knob(ctx,10,800,700,20,21,0,"Xmag","double_s");
        b_readout=new PushButton(ctx,745,588,pbw,pbh,"Readout","readout");
        b_debug=new DebugButton(20,20,24,16,"Debug","small");
        b_autotest=new AutotestButton(20,90,24,16,"Test","small");
        for (let i=0; i<9; i++)
            b_presets.push(new DebugButton(70,20+i*35,24,16,"Preset"+i,"small"));
        k_cursor=new DoubleKnob(ctx,870,75,51,201,"Cursor","cursor",36,23);
        k_cursor.setPullable("cursor");
        b_storage=new PushButton(ctx,892,120,pbw,pbh,"Storage","readout");
        b_a=new PushButton(ctx,892,165,pbw,pbh,"  A  ","on");
        b_a.state=1;
        b_ainten=new PushButton(ctx,892,165,pbw,pbh,"Inten","on");
        b_b=new PushButton(ctx,892,165,pbw,pbh,"DLYD ","on");
        b_aandb=new PushButton(ctx,892,165,pbw,pbh,"ALT","on");
        b_mixed=new PushButton(ctx,892,165,pbw,pbh,"Mixed  ","on");
        dualtb_mode=new Radio(892,165,[b_a,b_ainten,b_b,b_aandb,b_mixed]);
    }
    drawFrame(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = "rgb(25, 50, 25)";
        ctx.lineWidth=10;
        roundRect(ctx, this.x-5, this.y-5, this.w+10, this.h+10, 20);
        ctx.stroke();
    }
    drawScreen(ctx,drawShadow="No-drawShadow") { // egyelőre nincs árnyék, mert slow sweep-nél eltűnik
        // draw screen
        if (drawShadow=="drawShadow") {
            ctx.beginPath();
            ctx.fillStyle = shadowcolor;
            roundRect(ctx, this.x+5, this.y+5, this.w+15, this.h+15, 20);
            ctx.fill();
        }
        this.drawFrame(ctx);
        ctx.beginPath();
        ctx.fillStyle = "rgba(50, 100, 50, 1)";
        roundRect(ctx, this.x, this.y, this.w, this.h, 20);
        ctx.stroke();
        ctx.fill();
    }
    drawGrid(ctx,illumgrid) {
        ctx.beginPath();
        if (illumgrid=="grid") 
            ctx.strokeStyle = "rgba(0,25,0,1.0)";
        ctx.lineWidth=1;
        // draw grid
        d=this.d;
        dd=this.dd;
        illum=Math.floor(155*k_illum.getValue()/(k_illum.ticks-1));
        if (illum>0) {
            illum=100+illum;
            ctx.strokeStyle = "rgba("+illum+", "+illum+", "+illum+",0.75)";
        }
        if (illumgrid=="grid" || illumgrid=="illum" && illum>0) {
            for (let i=dd; i<=this.w-dd+1; i+=d) {
                ctx.moveTo(this.x+i,this.y+dd);
                ctx.lineTo(this.x+i,this.y+this.h-dd);
            }
            for (let i=dd; i<=this.h-dd+1; i+=d) {
                ctx.moveTo(this.x+dd,this.y+i);
                ctx.lineTo(this.x+this.w-dd,this.y+i);
            }
            // draw hair
            for (let i=dd; i<=this.w-dd+1; i+=d/5) {
                ctx.moveTo(this.x+i,this.y+this.h/2-dd/4);
                ctx.lineTo(this.x+i,this.y+this.h/2+dd/4);
            }
            for (let i=dd; i<=this.h-dd+1; i+=d/5) {
                ctx.moveTo(this.x+this.w/2-dd/4,this.y+i);
                ctx.lineTo(this.x+this.w/2+dd/4,this.y+i);
            }
            for (let i=dd; i<=this.w-dd+1; i+=d/5) {
                ctx.moveTo(this.x+i,this.y+dd+2*d-dd/8);
                ctx.lineTo(this.x+i,this.y+dd+2*d+dd/8);
            }
            for (let i=dd; i<=this.w-dd+1; i+=d/5) {
                ctx.moveTo(this.x+i,this.y+dd+6*d-dd/8);
                ctx.lineTo(this.x+i,this.y+dd+6*d+dd/8);
            }
            // draw dots
            for (let i=dd; i<=this.w-dd+1; i+=d/5) {
                ctx.moveTo(this.x+i,this.y+dd+6*d+d/2);
                ctx.lineTo(this.x+i,this.y+dd+6*d+d/2+1);
            }
            for (let i=dd; i<=this.w-dd+1; i+=d/5) {
                ctx.moveTo(this.x+i,this.y+dd+d+d/2);
                ctx.lineTo(this.x+i,this.y+dd+d+d/2+1);
            }
        }
        ctx.stroke();
    }
    // channel data calc into dispch[c], findValue calc
    calcDispch(mag) {
        var minY=1000000, maxY=-1000000; // for find
        Q=timebase*L/DL/mag;
        // delay
        delaybase=tb[k_delaybase.k.getValue()+Math.floor(k_delaybase.k.ticks/2-1)]*
            tb_[k_delaybase.k_.getValue()+Math.floor(k_delaybase.k_.ticks/2)];
        delay=(10*k_delay.k.getValue()+k_delay.k_.getValue()/10)*delaybase;
        delay=delay;
        // loop of channels: second channel first!
        for (let c=1; c>=0; c--) {
            // Volts/Div
            var l=this.ch[c].k_volts.k.getValue(); l=(l+Math.floor(vpd.length/2))%vpd.length;
            var l_=this.ch[c].k_volts.k_.getValue(); l_=(l_+Math.floor(vpd_.length/2))%vpd_.length;
            volts[c]=vpd[l]*vpd_[l_];
            // x and y pos
            py[c]=-this.ch[c].k_ypos.getValue();
            px0=this.x+dd;
            px=px0+50*k_xpos.k.getValue()+k_xpos.k_.getValue();
            // find value one adjust at a time
            if (findState!="off") py[c]/=findValue;
            // gnd lines position
            py0=this.y+dd+4*d+py[c]*10;
            py[c]=py0+(c*2-1)*d;
            // averages for AC coupling
            avgs[c]=0; var n=0;
            for (let i=0; i<sch[c].length; i++) {
                if (!isNaN(sch[c][i])) {
                    n++;
                    avgs[c]+=sch[c][i];
                }
            }
            avgs[c]/=n;
            if (this.ch[c].b_ac.state==0) avgs[c]=0;
            // main y value buffer calculation
            var minsch=Math.min(...sch[c]);
            var maxsch=Math.max(...sch[c]);
            NaNerror=false;
            for (let i=0; i<L; i++) if (!NaNerror) {
                // if CH is switched on
                if (scope.ch[c].b_gnd.state==0 && siggen[c].b_ch.state==1) {
                    // main y calculation
                    QI=Math.floor(freqs[c]*(10.0*Q*i+delay*L)%(schlen[c]));
                    if (freqs[c]*10*Q>=L/3) { 
                        dispch[c][i]=i%2==0?(minsch-avgs[c])/volts[c]/2:(maxsch-avgs[c])/volts[c]/2;
                    }
                    // main formula for y calc
                    else {
//                        if (b_xy.state==1) QI=i%schlen[c];
                        dispch[c][i]=(sch[c][QI]-avgs[c])/volts[c]/2;
                        if (isNaN(dispch[c][i])) {
                            error("NaN: QI="+QI);
                        }
                    }
                    // find values calc
                    if (findState!="off") dispch[c][i]/=findValue;
                    if (dispch[c][i]<minY) minY=dispch[c][i];
                    if (dispch[c][i]>maxY) maxY=dispch[c][i];
                }
                else {
                    dispch[c][i]=0;
                }
                if (isNaN(dispch[c][i])) {
                    error("NaN: dispch["+c+"]["+i+"]");
                    NaNerror=true;
                }
            }
        }
        if (findState=="search" && minY>-4*dd && maxY<4*dd && findValue>20) {
            findState="found";
        }
    }
    // trigger condition seeking
    triggerSeek() {
        slope=k_slope.getValue();
        tlevel=10*k_trigger.k.getValue()+k_trigger.k_.getValue();
        b_limit.state=0;
        for (let c=1; c>=0; c--) {
            tcond=false; // trigger condition
            prevValue=dispch[c][0];
            if (b_mode.state==1) prevValue=this.calcModeY(c,dispch[0][0],dispch[1][0]);
            tptr[c]=-1; // init trigger pointer
            while (!tcond && tptr[c]<L) {
                tptr[c]++;
                currValue=dispch[c][tptr[c]];
                if (b_mode.state==1) currValue=this.calcModeY(c,dispch[0][tptr[c]],dispch[1][tptr[c]]);
                if (k_slope.getValue()==0 && prevValue<tlevel && currValue>=tlevel) tcond=true;
                if (k_slope.getValue()==1 && prevValue>tlevel && currValue<=tlevel) tcond=true;
                prevValue=currValue;
            }
            if (b_chtr[c].state==1 || b_mode.state==1) {
                if (tptr[c]>=L) {
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
        int["astigm"]=1-Math.abs(ast)*2/k_astigm.ticks; // 0..1
        if (!isNaN(beamLength)) {
            int["beamlength"]=beamLength; // 0 40 2000 2000000
            int["beam"]=8000/(beamLength+5000);
            if (b_xy.state==1) int["beam"]*=1.5;
            if (int["beam"]<0) int["beam"]=0;
        }
        int["timebase"]=(Math.log(timebase)+40)/49; // 0..1
        expdays=(new Date()-new Date(expdate))/1000/3600/24;
        int["expdays"]=1;
        if (expdays>7) {
            int["expdays"]=(10-expdays)/10;
            if (int["expdays"]<0) int["expdays"]=0; // .3 .2 .1 0...
        }
        int["power"]=1;
        if (powerState=="start") int["power"]=powerValue/230;
        int["screen"]=Math.round(128+222
            *int["knob"]
            *int["power"]
            *int["expdays"]
            *int["astigm"]
            *int["beam"]
            *int["timebase"]
            );
        if (findState!="off") 
            int["screen"]+=20*Math.log(findValue);
        if (int["screen"]>350) int["screen"]=350;
        alpha1=Math.round(100*int["screen"]/255)/100;
        if (alpha1>1) alpha1=1; if (alpha1<0.05) alpha1=0.05;
        alpha1=1;
        lineWidth=int["screen"]/100+Math.abs(blur1/2);
        if (int["screen"]>200) lineWidth+=((int["screen"]-200)/50);
        lineWidth=Math.round(100*lineWidth)/100;
        blurWidth=Math.abs(blur1/2);
        strokeStyle="rgba(0,"+int["screen"]+",0,"+alpha1+")";
//        if (b_debug.state==1) log(strokeStyle+" "+lineWidth+" "+blurWidth);
    }
    setStroke() {
        ctx.strokeStyle=strokeStyle;
        ctx.lineWidth=lineWidth;
        ctx.filter="blur("+blurWidth+"px)";
        ctx.lineCap = "round";
    }
    stroke(c) {
        this.beamControl(sumdelta[c]);
        this.setStroke();
        if (int["screen"]>250) {
            for (let i=7; i>0; i--) {
                var glareq=175;
                ctx.lineWidth=(int["screen"]-250)/10*i;
                ctx.strokeStyle="rgba("+(int["screen"]-glareq)/8+","+(int["screen"]-glareq)+","+(int["screen"]-glareq)/8+",0.07)";
                ctx.stroke();
            }
        }
        this.setStroke();
        ctx.stroke();
        if (int["screen"]>=300) {
            ctx.lineWidth=1;
            if (int["screen"]>=310) this.ctx.lineWidth=2;
            ctx.strokeStyle="rgb(255,255,255)";
            ctx.stroke();
        }
        ctx.lineWidth=1;
    }
    draw(ctx,drawShadow) {
        if (drawInProgress || drawInTimeout) { return; }
//        console.log("draw "+Date.now());
        drawInProgress=true;
        d=this.d;
        dd=this.dd;
        // x10 mag: 10/3x in dispch, 3x in beamdraw
        this.calcDispch(k_xpos.k.pulled&&findState=="off"?10/3:1);
        mag=k_xpos.k.pulled&&findState=="off"?3:1;
        this.triggerSeek();
        // intensity and focus
        int["knob"]=(k_intensity.getValue()+8)/16; // 0..1
        blur1=k_focus.getValue();
        // draw beams
        this.drawScreen(ctx,drawShadow);
        this.drawGrid(ctx,"grid");
        ctx.save();
        roundRect(ctx, this.x+3, this.y+3, this.w-6, this.h-6, 20);
        ctx.clip();
        this.astigmCalc();
        // imprint text rolling
        if (imprintY!=1000) {
            drawText(imprint,px,imprintY--);
            ctx.restore();
            drawInProgress=false;
            return;
        }
        if (timebase<100 || b_storage.state==1) {
            DL1=0, DL2=mag*DL;
            tailParts=[[DL1,DL2]];
        }
        else {
            var deltaT=Date.now()-time;
            DL1+=Math.ceil(10*deltaT/timebase);
            if (DL1>=mag*DL) DL1=-Math.ceil(10*DL/timebase);
            DL2=DL1+Math.ceil(10*DL/timebase);
            if (DL2<DL1+1) DL2=DL1+1;
            if (DL2>mag*DL) DL2=mag*DL;
        }
        // Actual beam drawing for Dual, Ch1, Ch2
        if (b_dual.state==1 || b_ch1.state==1 || b_ch2.state==1) {
            for (let c=0; c<2; c++) if (c!=1 || b_dual.state!=1 || b_fft.state!=1) {
                if (b_dual.state==1 || c==0 && b_ch1.state==1 || c==1 && b_ch2.state==1) {
                    if (b_dual.state==0) py[c]=py0;
                    ctx.beginPath();
                    // beam length for beam intensity calcukation
                    sumdelta[c]=0;
                    // astigm multiline
                    for (let k=0; k<asl; k++) {
                        var ii=findState=="off"?DL1:((DL1+findValue*(DL/2+(DL1-DL/2)/2+px0-px))/(findValue+1));
                        ctx.moveTo(px+ii*mag+k*asx,py[c]-dispch[c][ii+tptr[0]]-k_rot.getValue()*DL/500+k*asy);
                        for (let i=DL1+1; i<=DL2; i++) {
                            ii=findState=="off"?i:((i+findValue*(DL/2+(i-DL/2)/2+px0-px))/(findValue+1));
                            ctx.lineTo(px+ii*mag+k*asx,py[c]-dispch[c][i+tptr[0]]
                                -k_rot.getValue()*(DL/2-ii)/250+k*asy);
                            if (k==0) sumdelta[c]+=Math.abs(dispch[c][i+tptr[0]]-dispch[c][i-1+tptr[0]]);
                        }
                    }
                    sumdelta[c]/=1; if (findState!="off") sumdelta[c]/=findValue;
                    this.stroke(c);
                }
            }
        }
        // Beam for Lissajous XY
        else if (b_xy.state==1) {
            // rotation
            if (k_rot.getValue()!=0) {
                var fi=k_rot.getValue()*1*Math.PI/30;
                for (let i=0; i<L; i++) {
                    var x1=dispch[0][i], y1=dispch[1][i];
                    dispch[0][i]=x1*Math.cos(fi)+y1*Math.sin(fi);
                    dispch[1][i]=-x1*Math.sin(fi)+y1*Math.cos(fi);
                }
            }
            // screen center
            px+=5*d;
            var pyx=(py[0]+py[1])/2;
            // actual beem drawing
            ctx.beginPath();
            sumdelta[2]=0;
            for (let k=0; k<asl; k++) {
//                ctx.moveTo(px+dispch[0][DL1]+k*asx,pyx-dispch[1][DL1]+k*asy);
                ctx.moveTo(px+dispch[0][0]+k*asx,pyx-dispch[1][0]+k*asy);
//                for (let i=DL1+1; i<DL2; i++) {
                for (let i=1; i<=DL; i++) {
                    ctx.lineTo(px+dispch[0][i]+k*asx,pyx-dispch[1][i]+k*asy);
                    if (k==0) sumdelta[2]+=Math.sqrt((dispch[0][i]-dispch[0][i-1])
                        *(dispch[0][i]-dispch[0][i-1])
                        +(dispch[1][i]-dispch[1][i-1])*(dispch[1][i]-dispch[1][i-1]));
                    if (isNaN(sumdelta[2])) console.error("sumdelta[2] NaN i="+i);
                }
                ctx.lineTo(px+dispch[0][0]+k*asx,pyx-dispch[1][0]+k*asy);
            }
            sumdelta[2]/=1; if (findState!="off") sumdelta[2]/=findValue;
            this.stroke(2);
        }
        // Beam for Mode (ADD, AM)
        else {
            ctx.beginPath();
            sumdelta[2]=0;
            for (let k=0; k<asl; k++) {
                var ii=findState=="off"?DL1:((DL1+findValue*(DL/2+(DL1-DL/2)/2+px0-px))/(findValue+1));
                ctx.moveTo(px+ii+k*asx,py0-this.calcModeY(-1,dispch[0][ii+tptr[0]],
                    dispch[1][ii+tptr[0]])-k_rot.getValue()*DL/500+k*asy);
                for (let i=DL1+1; i<DL2; i++) {
                    ii=findState=="off"?i:((i+findValue*(DL/2+(i-DL/2)/2+px0-px))/(findValue+1));
                    ctx.lineTo(px+ii+k*asx,py0-this.calcModeY(-1,dispch[0][i+tptr[0]],
                        dispch[1][i+tptr[0]])-k_rot.getValue()*(DL/2-ii)/250+k*asy);
                    if (k==0) sumdelta[2]+=Math.abs(this.calcModeY(-1,dispch[0][i-1+tptr[0]],
                        dispch[1][i-1+tptr[0]])-this.calcModeY(-1,dispch[0][i+tptr[0]],dispch[1][i+tptr[0]]));
                }
            }
            sumdelta[2]/=1; if (findState!="off") sumdelta[2]/=findValue;
            this.stroke(2);
        }
        // FFT draw
        if (b_fft.state==1 && b_xy.state!=1) {
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
        // Readout
        if (b_power.state==1 && b_readout.state==1) {
            ctx.beginPath();
            ctx.fillStyle="rgba(0,240,0,0.9)";
            ctx.font="bold 16px Arial";
            ctx.textAlign="left";
            ctx.textBaseline="middle";
            for (let c=0; c<2; c++) {
                if (b_chon[c].state==1 || b_dual.state==1 || (c==0 && (b_add.state==1 || b_mod.state==1))) {
                    var readoutText=["CH1: ","CH2: "][c]+bufgen[siggen[c].k_func.k.getValue()].name;
                        if (siggen[c].k_func.k_.getValue()!=0) readoutText+=" ("+siggen[c].k_func.k_.getValue()+")";
                    drawText(readoutText,ROXSIG,ROYSIG[c]);
                    if (k_cursor.k.pulled) {
                        readoutText="V";
                        var ptr=5*d+xCur+tptr[0];
                        if (ptr>L) {
                            yResult=""; readoutText="TRIG!";
                        }
                        else {
                            yResult=dispch[c][ptr]*volts[c]/50;
                            if (b_add.state==1 || b_mod.state==1) {
                                yResult=scope.calcModeY(0,dispch[0][5*d+xCur+tptr[0]]*volts[0]/50,
                                    dispch[1][5*d+xCur+tptr[0]]*volts[1]/50);
                            }
                            if (Math.abs(yResult)<0.1) {
                                yResult*=1000;
                                readoutText="mV";
                            }
                            yResult=Math.round(yResult*100)/100;
                        }
                        drawText(""+yResult+readoutText,ROXVOLTS,ROYSIG[c]);
                    }
                }
            }
            yResult=Math.round(timebase*1000)/1000;
            readoutText="ms";
            if (yResult<=0.05) {yResult*=1000; readoutText="us";}
            else if (yResult>=100) {yResult/=1000; readoutText="sec";}
            drawText("A: "+yResult+readoutText,ROXTB,ROYTB);

            yResult=Math.round(delaybase*100000)/100000;
            readoutText="ms";
            if (yResult<=0.05) {yResult*=1000; readoutText="us";}
            else if (yResult>=100) {yResult/=1000; readoutText="sec";}
            yResult=Math.round(yResult*1000)/1000;
            drawText("B: "+yResult+readoutText,ROXDB,ROYDB);

            if (delay!=0) {
                yResult=Math.round(delay*1000000)/1000000;
                readoutText="ms";
                if (yResult<=0.05) {yResult*=1000; readoutText="us";}
                else if (yResult>=100) {yResult/=1000; readoutText="sec";}
                yResult=Math.round(yResult*10000)/10000;
                drawText("DLY: "+yResult+readoutText,ROXDLY,ROYDLY);
            }
            ctx.fill();
        }
        ctx.restore();
        this.drawGrid(ctx,"illum");
        if (!drawInTimeout && timebase>=100) { 
            drawInTimeout=true;
            setTimeout(()=>callDraw(ctx,"noShadow"),100);
        }
        time=Date.now();
        drawInProgress=false;
    }
    calcModeY(c,ych0,ych1) {
        if (b_ch1.state==1) return ych0;
        else if (b_ch2.state==1) return ych1;
        else if (b_add.state==1) return ych0+ych1;
        else if (b_mod.state==1) return (ampls[0]+ampls[1])*ych0*ych1/ampls[0]/ampls[1];
        else if (b_dual.state==1) return [ych0,ych1][c];
    }
}
function callDraw(ctx,drawShadow) {
    drawInTimeout=false;
    scope.draw(ctx,drawShadow);
}
class ScopeChannel {
    constructor(pX,pY) {
        this.k_ypos=new Knob(ctx,24,pX+65,pY+247,20,49,0,"Pos Y","knob");
        this.k_volts=new VoltsKnob(pX,pY+275);
        this.k_volts.k.value0=false;
        this.k_volts.k_.value0=false;
        this.b_ac=new PushButton(ctx,pX+65,pY+310,pbw,pbh,"AC",'on');
        this.b_gnd=new PushButton(ctx,pX+65,pY+310,pbw,pbh,"Gnd",'on');
        this.b_dc=new PushButton(ctx,pX+65,pY+310,pbw,pbh,"DC",'on');
        this.b_dc.state=1;
        this.acdc=new Radio(pX+65,pY+310,[this.b_ac,this.b_gnd,this.b_dc]);
    }
}
