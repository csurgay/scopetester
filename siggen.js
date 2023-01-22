class Siggen extends pObject {
    constructor(pX,pY,pNo) {
        var pW=370, pH=310, pX2=pX+105, pX3=pX+155;
        var pY1=pY-15, pY2=pY1+75, pY3=pY2+75, pY4=pY3+75;
        super(ctx,pX,pY,pW,300);
        this.myChannel=pNo;
        new Frame(pX-65,pY-65,pW-40,pH,"CH"+pNo+" Signal                ","rightish");
        this.b_ch=new ChOnButton(pX+pW-145,pY-71,24,16,"ON","siggen");
        this.b_ch.setSwitchBufferNeeded();
        this.b_ch.initChannelsNeeded=true;
        this.k_scale=new ScaleKnob(pX,pY+5);
        this.k_scale.setSwitchBufferNeeded();
        this.k_scale.value0=false;
        this.k_scale.initChannelsNeeded=true;
        this.k_func=new FuncKnob(pX,pY+130);
        this.k_func.setSwitchBufferNeeded();
        this.k_func.setInitChannelsNeeded();
        this.k_freq=new DoubleKnob(pX2,pY1,201,101,"Freq (kHz)       ","sigdouble",30,15);
        this.k_freq.setSwitchBufferNeeded();
        this.k_freq.setInitChannelsNeeded();
        this.k_ampl=new DoubleKnob(pX2,pY2,201,201,"Ampl (V)         ","sigdouble",30,15);
        this.k_ampl.setSwitchBufferNeeded();
        this.k_ampl.setInitChannelsNeeded();
        this.k_phase=new DoubleKnob(pX2,pY3,24,720,"Phase (0-360)","sigdouble",30,15);
        this.k_phase.setSwitchBufferNeeded();
        this.k_phase.k.value0=false;
        this.k_phase.k.limit=-1;
        this.k_phase.k_.limit=-1;
        this.k_phase.setInitChannelsNeeded();
        this.k_dc=new DoubleKnob(pX2,pY4,201,101,"Offset (V DC) ","sigdouble",30,15);
        this.k_dc.setSwitchBufferNeeded();
        this.k_dc.setInitChannelsNeeded();
        new Vfd(pX3-5,pY1,6,()=>{return Math.round(100000*freqs[0+pNo-1])/100000;},()=>{return this.b_ch.state==0;});
        new Vfd(pX3-5,pY2,6,()=>{return ampls[0+pNo-1]/100;},()=>{return this.b_ch.state==0;});
        new Vfd(pX3-5,pY3,6,()=>{return Math.round(360*phases[0+pNo-1]/L);},()=>{return this.b_ch.state==0;});
        new Vfd(pX3-5,pY4,6,()=>{return dcs[0+pNo-1];},()=>{return this.b_ch.state==0;});
        this.b_phalf=new ChOnButton(pX-20,pY4-15,24,16,"Pos+","on");
        this.b_phalf.setInitChannelsNeeded();
        this.b_nhalf=new ChOnButton(pX-20,pY4+3,24,16,"Neg-","on");
        this.b_nhalf.setInitChannelsNeeded();
        this.b_inv=new ChOnButton(pX+42,pY4-15,24,16,"Inv","on");
        this.b_inv.setInitChannelsNeeded();
        this.b_abs=new ChOnButton(pX+42,pY4+3,24,16,"Abs","on");
        this.b_abs.setInitChannelsNeeded();
        this.display=new DebugIcon(0,100*pNo,100,20,(x)=>{if (x==-17) return schlen[pNo-1]; else return sch[pNo-1][x];});
        this.display.ChOnType=true;
        this.display.parent=this;
    }
}
