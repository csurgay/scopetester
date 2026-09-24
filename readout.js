// Readout
Scope.prototype.readout=function() {
    if (this.b_power.state==1 && this.b_readout.state==1) {
        ctx.beginPath();
        ctx.fillStyle="rgba(0,240,0,0.9)";
        ctx.font="bold 16px Arial";
        ctx.textAlign="left";
        ctx.textBaseline="middle";
        for (let c=0; c<2; c++) {
            if (this.b_ch[c].state==1 || this.b_xy.state==1 || this.b_alt.state==1 || this.b_chop.state==1 || (c==0 && (this.b_add.state==1 || this.b_sub.state==1 || this.b_mod.state==1))) {
                var readoutText=["CH1: ","CH2: "][c]+bufgen[siggen[c].k_func.k.getValue()].name;
                if (this.b_add.state==1) readoutText="CH1 CH2 ADD";
                if (this.b_sub.state==1) readoutText="CH1 CH2 SUB";
                if (this.b_mod.state==1) readoutText="CH1 CH2 AM";
                    if (siggen[c].k_func.k_.getValue()!=0) readoutText+=" ("+siggen[c].k_func.k_.getValue()+")";
                drawText(readoutText,ROXSIG,ROYSIG[c]);
                if (k_cursor.k.pulled) {
                    readoutText="V";
                    // sample under the cursor line: screen x=px+i*mag (x10: minus 5*DL-DL/2), dispch[0] is the sweep start
                    var ptr=Math.round((5*d+xCur+(mag>1?5*DL-DL/2:0))/mag);
                    if (ptr<0 || ptr>=L) {
                        yResult=""; readoutText="TRIG!";
                    }
                    else {
                        yResult=dispch[c][ptr]*volts[c]/50;
                        if (this.b_add.state==1 || this.b_sub.state==1 || this.b_mod.state==1) {
                            yResult=this.calcModeY(0,dispch[0][ptr]*volts[0]/50,
                                dispch[1][ptr]*volts[1]/50);
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
        yResult=Math.round(this.timebase*1000)/1000;
        readoutText="ms";
        if (yResult<=0.05) {yResult*=1000; readoutText="us";}
        else if (yResult>=100) {yResult/=1000; readoutText="sec";}
        drawText("A: "+yResult+readoutText,ROXTB,ROYTB);

        yResult=Math.round(this.delaybase*100000)/100000;
        readoutText="ms";
        if (yResult<=0.05) {yResult*=1000; readoutText="us";}
        else if (yResult>=100) {yResult/=1000; readoutText="sec";}
        yResult=Math.round(yResult*1000)/1000;
        drawText("B: "+yResult+readoutText,ROXDB,ROYDB);

        if (this.delay!=0) {
            yResult=Math.round(this.delay*1000000)/1000000;
            readoutText="ms";
            if (yResult<=0.05) {yResult*=1000; readoutText="us";}
            else if (yResult>=100) {yResult/=1000; readoutText="sec";}
            yResult=Math.round(yResult*10000)/10000;
            drawText("DLY: "+yResult+readoutText,ROXDLY,ROYDLY);
        }
        // burst settings of the generators, top row right-aligned: "BST1 4/25%"
        var row=0;
        for (let c=0; c<2; c++) if (burstN[c]>0 && siggen[c].b_ch.state==1) {
            readoutText="BST"+(c+1)+" "+burstN[c]+"/"+Math.round(100*burstN[c]/burstP[c])+"%";
            drawText(readoutText,ROXBST-8*readoutText.length,ROYDLY+16*row++);
        }
        ctx.fill();
    }
}
