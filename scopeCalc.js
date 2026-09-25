// channel data calc into dispch[c], findValue calc
Scope.prototype.calcDispch=function(mag) {
    var minY=1000000, maxY=-1000000; // for find
    Q=this.timebase*L/DL/mag;
    // delay
    this.delaybase=tb[this.k_time.k.getValueB()+Math.floor(this.k_time.k.ticks/2-1)]*
        tb_[this.k_time.k_.getValue()+Math.floor(this.k_time.k_.ticks/2)];
    this.QB=this.delaybase*L/DL/mag; // B sweep sample step (like Q for A)
    // delay time = delay time multiplier (0.000-9.999 div) x A time/div, as on real dual-timebase scopes
    this.delay=(this.k_delay.k.getValue()/10+this.k_delay.k_.getValue()/1000)*this.timebase;
    this.delay=Math.round(1000000*this.delay)/1000000;
    // loop of channels: second channel first!
    for (let c=1; c>=0; c--) {
        // Volts/Div
        var l=this.ch[c].k_volts.k.getValue(); l=(l+Math.floor(vpd.length/2))%vpd.length;
        var l_=this.ch[c].k_volts.k_.getValue(); l_=(l_+Math.floor(vpd_.length/2))%vpd_.length;
        volts[c]=vpd[l]*vpd_[l_];
        // x and y pos
        py0=this.y+dd+4*d;
        py[c]=-10*this.ch[c].k_ypos.k.getValue()-this.ch[c].k_ypos.k_.getValue();
        if (findState!="off") py[c]/=findValue;
        py[c]+=py0;
        px0=this.x+dd;
        px=px0+50*this.k_xpos.k.getValue()+this.k_xpos.k_.getValue();
        // averages for AC coupling
        avgs[c]=0; var n=0;
        for (let i=0; i<schlen[c]; i++) {
            if (!isNaN(sch[c][i])) {
                n++;
                avgs[c]+=sch[c][i];
            }
        }
        avgs[c]/=n;
        // burst: the silent cycles count in the long-term average (AC coupling)
        if (burstN[c]>0) avgs[c]=(burstN[c]*avgs[c]+(burstP[c]-burstN[c])*schIdle[c])/burstP[c];
        if (this.ch[c].b_ac.state==0) avgs[c]=0;
        // main y value buffer calculation
        var minsch=Math.min(...sch[c]);
        var maxsch=Math.max(...sch[c]);
        this.minsch[c]=minsch; this.maxsch[c]=maxsch; // for sampleY()
        NaNerror=false;
        for (let i=0; i<L; i++) if (!NaNerror) {
            // if CH is switched on
            if (this.ch[c].b_gnd.state==0 && siggen[c].b_ch.state==1) {
                // main y calculation
                // trigger scan buffer: sweep start phase 0, no delay (delay is applied after the trigger in calcSweep)
                var u=Math.round(freqs[c]*(10.0*Q*i)); // unwrapped buffer position
                QI=u%(schlen[c]);
                var nz=noiseY(c,10.0*Q*i/L); // noise at this time
                if (burstIdle(c,u)) { // silence between bursts
                    dispch[c][i]=(schIdle[c]+nz-avgs[c])/volts[c]/2;
                }
                else if (freqs[c]*10*Q>=L/3) { 
                    dispch[c][i]=(i%2==0?minsch+nz-avgs[c]:maxsch+nz-avgs[c])/volts[c]/2;
                }
                // main formula for y calc
                else {
//                        if (b_xy.state==1) QI=i%schlen[c];
                    dispch[c][i]=(sch[c][QI]+nz-avgs[c])/volts[c]/2;
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
// y value (same scale as dispch) of channel c at sample position s (A samples, units of Q) from sweep start
// phase 0, plus delay (ms), plus sB samples of the B sweep (units of QB). bandQ/parity: min/max band case.
Scope.prototype.sampleY=function(c,s,delay,sB=0,bandQ=Q,parity=s) {
    if (!(this.ch[c].b_gnd.state==0 && siggen[c].b_ch.state==1)) return 0;
    var y, u=Math.round(freqs[c]*(10.0*Q*s+10.0*this.QB*sB+delay*L)); // unwrapped buffer position
    if (burstIdle(c,u)) // silence between bursts
        y=schIdle[c]-avgs[c];
    else if (freqs[c]*10*bandQ>=L/3) // signal too fast for the timebase: min/max band
        y=(Math.round(parity)%2==0?this.minsch[c]:this.maxsch[c])-avgs[c];
    else
        y=sch[c][((u%schlen[c])+schlen[c])%schlen[c]]-avgs[c];
    y+=noiseY(c,(10.0*Q*s+10.0*this.QB*sB)/L+delay); // noise at this time (ms)
    y=y/volts[c]/2;
    if (findState!="off") y/=findValue;
    return y;
}
// horizontal display mode (A, A INTEN, B DLYD, A/B ALT, Mixed) and the timebase of the current sweep
Scope.prototype.calcTbMode=function() {
    this.tbMode=this.b_aInten.state==1?"INTEN":this.b_b.state==1?"B":this.b_aAndB.state==1?"ALT":
        this.b_mixed.state==1?"MIXED":"A";
    if (this.altTb===undefined || this.tbMode!="ALT") this.altTb=0; // ALT: 0 = A sweep, 1 = B sweep
    this.sweepTb=(this.tbMode=="B" || this.tbMode=="ALT" && this.altTb==1)?this.delaybase:this.timebase;
    // delay point and B sweep length, in A samples (INTEN zone, MIXED switch point)
    this.sD=this.delay*L/(10*Q);
    this.inten=[this.sD, this.sD+this.delaybase*L/Q];
}
// analog order: trigger (tptr[0] in the scan buffer) -> delay -> sweep; dispch[c][0] is the sweep start
//   A, INTEN: A sweep from the trigger (delay only positions the intensified zone)
//   B: B sweep starting at trigger+delay; MIXED: A sweep up to the delay point, then B sweep
//   ALT: A sweep in dispch, B sweep in dispchB
Scope.prototype.calcSweep=function() {
    if (this.b_xy.state==1) return; // XY: no time base, keep the scan buffer
    var t0=tptr[0];
    for (let c=1; c>=0; c--)
        for (let i=0; i<L; i++) {
            if (this.tbMode=="B")
                dispch[c][i]=this.sampleY(c,t0,this.delay,i,this.QB,i);
            else if (this.tbMode=="MIXED" && i>=this.sD)
                dispch[c][i]=this.sampleY(c,t0,this.delay,i-this.sD,this.QB,i);
            else
                dispch[c][i]=this.sampleY(c,i+t0,0);
            if (this.tbMode=="ALT")
                dispchB[c][i]=this.sampleY(c,t0,this.delay,i,this.QB,i);
        }
}
// trigger condition seeking
Scope.prototype.triggerSeek=function() {
    tlevel=10*this.k_trigger.k.getValue()+this.k_trigger.k_.getValue();
    var prevTrigd=this.b_trigd.state;
    // search at least one full period of the slower channel (a real scope just waits for the next edge)
    var searchLen=L;
    for (let c=0; c<2; c++) {
        var period=burstP[c]*schlen[c]/(freqs[c]*10*Q); // signal (burst) period in samples
        if (isFinite(period) && period+2>searchLen) searchLen=Math.ceil(period)+2;
    }
    if (searchLen>50*L) searchLen=50*L;
    var val=(c,s)=>s<L?dispch[c][s]:this.sampleY(c,s,0);
    // free run (no trigger): every sweep starts at a random point, unsynchronised with the signal like an
    // analog AUTO sweep. (A clock-based start would lock stroboscopically, e.g. exactly 1kHz with a 1ms clock.)
    var slow=!(this.sweepTb<slowLimit); // progressive real-time sweep
    if (!slow || this.freeRunSweep!==triggerTime) { // new sweep: every draw when fast, once per sweep when slow
        this.freeRunSweep=triggerTime;
        this.freeRunPtr=Math.random()*L*50;
    }
    var freePtr=this.freeRunPtr;
    this.untriggered=false;
    for (let c=1; c>=0; c--) {
        tptr[c]=this.findEdge(c,0,searchLen,val); // first trigger edge from sweep start phase 0
        if (tptr[c]<0) tptr[c]=searchLen; // none
        if (this.b_chtr[c].state==1 || this.b_mode.state==1) {
            if (tptr[c]>=searchLen) {
                tptr[c]=freePtr; // no trigger: free run
                this.untriggered=true;
            }
        }
        lastTptr[c]=tptr[c];
    }
    // TRIG'D LED: lit while the sweep is triggered (off when free running and in Auto)
    this.b_trigd.state=(this.b_auto.state==1 || this.untriggered)?0:1;
    if (this.b_trigd.state!=prevTrigd) this.trigdChanged=true; // LED needs a panel repaint (see Scope.draw)
    if (this.b_auto.state==1) tptr[0]=0;
    else if (this.b_ch2tr.state==1) tptr[0]=tptr[1];
    // holdoff: which signal edges the successive sweeps actually start on
    this.trigStarts=null;
    this.holdoff=(50*this.k_holdoff.k.getValue()+this.k_holdoff.k_.getValue())/625; // 0..~4 sweep lengths
    if (this.b_trigd.state==1 && this.b_xy.state==0) this.holdoffSequence(val,searchLen,slow);
}
// first trigger edge of source c after sample position p, -1 if none within limit samples.
// The trigger comparator has hysteresis like a real scope (about 0.3 div trigger sensitivity): a rising
// edge counts only after the signal was below level-hyst, a falling edge only after it was above level+hyst.
// So noise smaller than the hysteresis cannot retrigger on the wrong slope, and very small signals
// (below about 0.3 div p-p) do not trigger at all.
Scope.prototype.findEdge=function(c,p,limit,val) {
    var mode=this.b_mode.state==1;
    var y=(s)=>mode?this.calcModeY(c,val(0,s),val(1,s)):val(c,s);
    var hyst=0.3*this.d; if (findState!="off") hyst/=findValue;
    var rise=this.k_slope.getValue()!=1, fall=this.k_slope.getValue()!=0;
    var armR=false, armF=false, cur;
    for (let s=p; s<=p+limit; s++) {
        cur=y(s);
        if (rise && armR && cur>=tlevel) return s;
        if (fall && armF && cur<=tlevel) return s;
        if (cur<tlevel-hyst) armR=true;
        if (cur>tlevel+hyst) armF=true;
    }
    return -1;
}
// Analog sweep sequence: sweep starts on an edge, runs 10 div, then the trigger is disarmed for
// retrace+holdoff; the next sweep starts on the first edge after that. For a burst or a signal with
// several edges per period this can start on different cycles -> several images. Result: trigStarts
// [{t: sweep start sample, w: share of sweeps}], steady state of 16 sweeps; cached while nothing changes.
Scope.prototype.holdoffSequence=function(val,searchLen,slow) {
    var src=(this.b_ch2tr.state==1 && this.b_mode.state==0)?1:0;
    var key=[Q,tlevel,this.k_slope.getValue(),src,this.b_mode.state,this.holdoff,mag,chanVersion,
        freqs[0],freqs[1],avgs[0],avgs[1],volts[0],volts[1],findState,findValue,
        (noiseOn(0)||noiseOn(1))?noiseOff.join():""].join(); // noise: new sequence every sweep
    if (key!=this.hoKey) {
        this.hoKey=key;
        var Lsw=DL*(mag>1?10/3:1); // one sweep (10 div of A) in scan samples
        var gap=Math.round(Lsw*(0.1+this.holdoff)); // retrace (0.1 sweep) + holdoff
        var t=tptr[src], seq=[t];
        for (let k=1; k<16 && t>=0; k++) {
            t=this.findEdge(src,Math.ceil(t+Lsw+gap),searchLen,val);
            if (t>=0) seq.push(t);
        }
        if (seq.length>6) seq=seq.slice(4); // steady state
        // group sweep starts by their position within the signal (burst) period
        var Pp=burstP[src]*schlen[src]/(freqs[src]*10*Q), groups=[];
        for (let t of seq) {
            var ph=((t%Pp)+Pp)%Pp, g=groups.find(g=>Math.min(Math.abs(g.ph-ph),Pp-Math.abs(g.ph-ph))<1.5);
            if (g) g.n++; else groups.push({ph:ph,t:t,n:1});
        }
        groups.sort((a,b)=>b.n-a.n);
        this.hoStarts=groups.map(g=>({t:g.t,w:g.n/seq.length}));
    }
    this.trigStarts=this.hoStarts;
    // sweep start for this frame: slow sweep shows the sequence sweep by sweep, fast the most frequent
    var st=this.trigStarts[slow?(this.slowSweepNo||0)%this.trigStarts.length:0];
    tptr[0]=st.t;
}
Scope.prototype.astigmCalc=function() {
    ast=this.k_astigm.getValue();
    asl=Math.abs(ast);
    asx=0; asy=0;
    if (ast>0) asx=asl/5+1; else if (ast<0) asy=asl/5+1;
}
Scope.prototype.beamControl=function(beamLength) {
    // beam intensity, focus blur and astigm
    int["astigm"]=2*Math.abs(ast)/this.k_astigm.ticks; // 0..1
    // memory display: refreshed at a constant rate -> constant brightness, independent of the sweep speed
    if (this.memDisplay) beamLength=2000;
    if (!isNaN(beamLength)) {
        int["beamlength"]=beamLength; // 0 40 2000 2000000
        int["beam"]=8000/(beamLength+5000);
        if (this.b_xy.state==1) int["beam"]*=1.5;
        if (int["beam"]<0) int["beam"]=0;
    }
    int["timebase"]=this.memDisplay?0.75:(Math.log(this.sweepTb||this.timebase)+40)/49; // 0..1
    expdays=(new Date()-new Date(dA+dB))/1000/3600/24;
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
//            *int["astigm"]
        *int["beam"]
        *int["timebase"]
        *(int["overlay"]||1) // free-run overlay dimming
        );
    if (findState!="off") 
        int["screen"]+=20*Math.log(findValue);
    if (int["screen"]>350) int["screen"]=350;
    alpha1=Math.round(100*int["screen"]/255)/100;
    if (alpha1>1) alpha1=1; if (alpha1<0.05) alpha1=0.05;
    blur["screen"]=Math.round(3*(int["astigm"]+2*blur["knob"]));
    alpha1=1-blur["screen"]/10;
    lineWidth=int["screen"]/100+blur["screen"];
    if (int["screen"]>200) lineWidth+=((int["screen"]-200)/50);
    lineWidth=Math.round(100*lineWidth)/100;
    blurWidth=Math.abs(blur["screen"]/2);
    strokeStyle="rgba(0,"+int["screen"]+",0,"+alpha1+")";
}
Scope.prototype.setStroke=function() {
    ctx.strokeStyle=strokeStyle;
    ctx.lineWidth=lineWidth;
    ctx.filter="blur("+blurWidth+"px)";
    ctx.lineCap = "round";
}
Scope.prototype.stroke=function() {
    this.beamControl(this.sumdelta);
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
    ctx.strokeStyle="rgb(0,150,0)";
    ctx.stroke(paleBeam);
}
Scope.prototype.calcModeY=function(c,ych0,ych1) {
    if (this.b_ch[0].state==1) return ych0;
    else if (this.b_ch[1].state==1) return ych1;
    else if (this.b_add.state==1) return ych0+ych1;
    else if (this.b_sub.state==1) return ych0-ych1;
    else if (this.b_mod.state==1) return (ampls[0]+ampls[1])*ych0*ych1/ampls[0]/ampls[1];
    else if (this.b_alt.state==1) return [ych0,ych1][c];
    else if (this.b_chop.state==1) return [ych0,ych1][c];
}
