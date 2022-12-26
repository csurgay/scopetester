class Siggen extends pObject {
    constructor(pX,pY,pNo) {
        var pW=370, pH=310, pX2=pX+105, pX3=pX+155;
        var pY1=pY-15, pY2=pY1+75, pY3=pY2+75, pY4=pY3+75;
        super(pX,pY,pW,300);
        this.myChannel=pNo;
        new Frame(pX-65,pY-65,pW-10,pH,"CH"+pNo+" Signal                ","rightish");
        this.b_ch=new ChOnButton(pX+pW-120,pY-71,24,16,"ON","on");
        this.b_ch.setSwitchBufferNeeded();
        this.k_scale=new ScaleKnob(pX,pY+5);
        this.k_scale.setSwitchBufferNeeded();
        this.k_func=new FuncKnob(pX,pY+130);
        this.k_func.setSwitchBufferNeeded();
        this.k_freq=new DoubleKnob(pX2,pY1,201,101,"Freq","sigdouble",30,15);
        this.k_freq.setSwitchBufferNeeded();
        this.k_ampl=new DoubleKnob(pX2,pY2,201,201,"Ampl","sigdouble",30,15);
        this.k_ampl.setSwitchBufferNeeded();
        this.k_phase=new DoubleKnob(pX2,pY3,12,21,"Phase","sigdouble",30,15);
        this.k_phase.setSwitchBufferNeeded();
        this.k_dc=new DoubleKnob(pX2,pY4,201,101,"Offset","sigdouble",30,15);
        this.k_dc.setSwitchBufferNeeded();
        new Vfd(pX3,pY1,6,()=>{return freqs[0+pNo-1];},()=>{return this.b_ch.state==0;});
        new Vfd(pX3,pY2,6,()=>{return ampls[0+pNo-1]/100;},()=>{return this.b_ch.state==0;});
        new Vfd(pX3,pY3,6,()=>{return 360*phases[0+pNo-1]/L;},()=>{return this.b_ch.state==0;});
        new Vfd(pX3,pY4,6,()=>{return dcs[0+pNo-1];},()=>{return this.b_ch.state==0;});
        this.b_half=new ChOnButton(pX,pY4-10,24,16,"Half","on");
        this.b_inv=new ChOnButton(pX,pY4+10,24,16,"Inv","on");
        this.display=new DebugIcon(pX-50,pY+180,100,20,(x)=>{return sch[pNo-1][x];});
        this.display.ChOnType=true;
        this.display.parent=this;
    }
}
