// channel data calc into dispch[c], findValue calc
Scope.prototype.calcDispch=function(mag) {
    var minY=1000000, maxY=-1000000; // for find
    Q=timebase*L/DL/mag;
    // delay
    delaybase=tb[k_time.k.getValueB()+Math.floor(k_time.k.ticks/2-1)]*
        tb_[k_time.k_.getValue()+Math.floor(k_time.k_.ticks/2)];
    delay=(10*k_delay.k.getValue()+k_delay.k_.getValue()/10)*delaybase;
    delay=delay;
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
        px=px0+50*k_xpos.k.getValue()+k_xpos.k_.getValue();
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
Scope.prototype.triggerSeek=function() {
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
            if (k_slope.getValue()!=1 && prevValue<tlevel && currValue>=tlevel) tcond=true;
            if (k_slope.getValue()!=0 && prevValue>tlevel && currValue<=tlevel) tcond=true;
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
Scope.prototype.astigmCalc=function() {
    ast=k_astigm.getValue();
    asl=Math.abs(ast);
    asx=0; asy=0;
    if (ast>0) asx=asl/5+1; else if (ast<0) asy=asl/5+1;
}
Scope.prototype.beamControl=function(beamLength) {
    // beam intensity, focus blur and astigm
    int["astigm"]=2*Math.abs(ast)/k_astigm.ticks; // 0..1
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
//            *int["astigm"]
        *int["beam"]
        *int["timebase"]
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
    this.beamControl(sumdelta);
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
Scope.prototype.calcModeY=function(c,ych0,ych1) {
    if (b_ch1.state==1) return ych0;
    else if (b_ch2.state==1) return ych1;
    else if (b_add.state==1) return ych0+ych1;
    else if (b_sub.state==1) return ych0-ych1;
    else if (b_mod.state==1) return (ampls[0]+ampls[1])*ych0*ych1/ampls[0]/ampls[1];
    else if (b_alt.state==1) return [ych0,ych1][c];
    else if (b_chop.state==1) return [ych0,ych1][c];
}
